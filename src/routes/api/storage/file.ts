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

/**
 * Serves a file by key via the storage provider (same-origin proxy URL).
 * Shared asset folders stay public; private user files require ownership.
 */
export const Route = createFileRoute('/api/storage/file')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const keyValidation = validateStorageFileProxyKey(
          url.searchParams.get('key')
        );
        if (!keyValidation.success) {
          return new Response('Bad Request', { status: 400 });
        }
        const { key } = keyValidation;

        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });
          const userId = session?.user?.id;

          const db = getDb();
          const [fileRecord] = await db
            .select({
              isPublic: userFiles.isPublic,
              originalName: userFiles.originalName,
              userId: userFiles.userId,
            })
            .from(userFiles)
            .where(eq(userFiles.r2Key, key))
            .limit(1);

          const accessDecision = resolveStorageFileAccessDecision({
            fileRecord,
            key,
            requesterUserId: userId,
          });
          if (!accessDecision.allowed) {
            const message =
              accessDecision.status === 403 ? 'Forbidden' : 'Not Found';
            return new Response(message, { status: accessDecision.status });
          }

          const file = await getFile(key);
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
