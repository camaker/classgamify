import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth/auth';
import { getDb } from '@/db';
import { userFiles } from '@/db/app.schema';
import { getFile } from '@/storage';
import {
  buildStorageFileResponseHeaders,
  resolveStorageFileAccessDecision,
  validateStorageFileProxyKey,
} from '@/storage/file-access';
import { ConfigurationError } from '@/storage/types';
import { isValidUserFileAccessId } from '@/storage/user-file-response';

/**
 * Serves a file by server-resolved id or public key through the storage provider.
 * Shared asset folders stay public; private user files require ownership.
 */
export const Route = createFileRoute('/api/storage/file')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const fileId = url.searchParams.get('id');
        const requestedKey = url.searchParams.get('key');
        if (!fileId && !requestedKey) {
          return new Response('Bad Request', { status: 400 });
        }
        if (fileId && !isValidUserFileAccessId(fileId)) {
          return new Response('Bad Request', { status: 400 });
        }

        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });
          const userId = session?.user?.id;

          const db = getDb();
          const [resolvedRecord] = fileId
            ? await db
                .select({
                  isPublic: userFiles.isPublic,
                  originalName: userFiles.originalName,
                  r2Key: userFiles.r2Key,
                  userId: userFiles.userId,
                })
                .from(userFiles)
                .where(eq(userFiles.id, fileId))
                .limit(1)
            : [];
          const key = fileId ? resolvedRecord?.r2Key : requestedKey;
          const keyValidation = validateStorageFileProxyKey(key);
          if (!keyValidation.success) {
            return new Response(fileId ? 'Not Found' : 'Bad Request', {
              status: fileId ? 404 : 400,
            });
          }
          const fileRecord =
            resolvedRecord ??
            (
              await db
                .select({
                  isPublic: userFiles.isPublic,
                  originalName: userFiles.originalName,
                  userId: userFiles.userId,
                })
                .from(userFiles)
                .where(eq(userFiles.r2Key, keyValidation.key))
                .limit(1)
            )[0];

          const accessDecision = resolveStorageFileAccessDecision({
            fileRecord,
            key: keyValidation.key,
            requesterUserId: userId,
          });
          if (!accessDecision.allowed) {
            const message =
              accessDecision.status === 403 ? 'Forbidden' : 'Not Found';
            return new Response(message, { status: accessDecision.status });
          }

          const file = await getFile(accessDecision.key);
          if (!file) {
            return new Response('Not Found', { status: 404 });
          }

          const responseHeaders = buildStorageFileResponseHeaders({
            contentType: file.contentType,
            fileRecord,
            isPublicFile: accessDecision.isPublicFile,
          });

          return new Response(file.body, { headers: responseHeaders });
        } catch (e) {
          if (e instanceof ConfigurationError) {
            return new Response('Storage not configured', { status: 503 });
          }
          throw e;
        }
      },
    },
  },
});
