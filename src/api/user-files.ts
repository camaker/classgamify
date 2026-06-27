import { getDb } from '@/db';
import { userFiles } from '@/db/app.schema';
import { getBaseUrl } from '@/lib/urls';
import { m } from '@/locale/paraglide/messages';
import { authApiMiddleware } from '@/middlewares/auth-middleware';
import { deleteFile, uploadFile } from '@/storage';
import {
  buildUserFileListOrderBy,
  buildUserFileOwnerWhere,
  getUserFileListOffset,
  USER_FILE_LIST_INPUT_LIMITS,
} from '@/storage/file-query';
import { buildUserFileMaterialSummary } from '@/storage/file-summary';
import { StorageError, UploadError } from '@/storage/types';
import { isPublicFolder } from '@/storage/utils';
import { createServerFn } from '@tanstack/react-start';
import { and, count, eq } from 'drizzle-orm';
import { z } from 'zod';
import { formatUserFileUploadError } from './user-file-errors';

const listSchema = z.object({
  pageIndex: z.number().int().min(0),
  pageSize: z
    .number()
    .int()
    .min(USER_FILE_LIST_INPUT_LIMITS.pageSizeMin)
    .max(USER_FILE_LIST_INPUT_LIMITS.pageSizeMax),
});

export const listUserFiles = createServerFn({ method: 'GET' })
  .inputValidator(listSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const where = buildUserFileOwnerWhere({ userId });

    const [totalRow] = await db
      .select({ count: count() })
      .from(userFiles)
      .where(where);
    const total = totalRow?.count ?? 0;

    const items = await db
      .select()
      .from(userFiles)
      .where(where)
      .orderBy(buildUserFileListOrderBy())
      .limit(data.pageSize)
      .offset(
        getUserFileListOffset({
          pageIndex: data.pageIndex,
          pageSize: data.pageSize,
        })
      );

    const summaryItems = await db
      .select({
        contentType: userFiles.contentType,
        filename: userFiles.filename,
        isPublic: userFiles.isPublic,
        originalName: userFiles.originalName,
        size: userFiles.size,
      })
      .from(userFiles)
      .where(where);

    return {
      items,
      summary: buildUserFileMaterialSummary(summaryItems),
      total,
    };
  });

export const listUserFileMaterials = createServerFn({ method: 'GET' })
  .inputValidator(listSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const where = buildUserFileOwnerWhere({ userId });

    const [totalRow] = await db
      .select({ count: count() })
      .from(userFiles)
      .where(where);
    const items = await db
      .select({
        contentType: userFiles.contentType,
        filename: userFiles.filename,
        id: userFiles.id,
        originalName: userFiles.originalName,
        size: userFiles.size,
      })
      .from(userFiles)
      .where(where)
      .orderBy(buildUserFileListOrderBy())
      .limit(data.pageSize)
      .offset(
        getUserFileListOffset({
          pageIndex: data.pageIndex,
          pageSize: data.pageSize,
        })
      );

    return {
      items,
      total: totalRow?.count ?? 0,
    };
  });

const deleteSchema = z.object({ id: z.string() });

export const deleteUserFile = createServerFn({ method: 'POST' })
  .inputValidator(deleteSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const [row] = await db
      .select()
      .from(userFiles)
      .where(and(eq(userFiles.id, data.id), eq(userFiles.userId, userId)))
      .limit(1);

    if (!row) {
      throw new Error(m.user_files_api_error_file_not_found());
    }

    await deleteFile(row.r2Key);
    await db.delete(userFiles).where(eq(userFiles.id, data.id));
  });

const uploadSchema = z
  .custom<FormData>((v): v is FormData => v instanceof FormData)
  .transform((fd) => {
    const file = fd.get('file');
    if (!file || !(file instanceof File)) {
      throw new Error(m.user_files_api_error_file_not_provided());
    }
    const folderRaw = fd.get('folder');
    const folder = typeof folderRaw === 'string' ? folderRaw : undefined;
    const isPublicRaw = fd.get('isPublic');
    const isPublic =
      typeof isPublicRaw === 'string' ? isPublicRaw === 'true' : undefined;
    const descriptionRaw = fd.get('description');
    const description =
      typeof descriptionRaw === 'string' && descriptionRaw !== ''
        ? descriptionRaw
        : undefined;
    return {
      file,
      folder,
      isPublic,
      description,
    };
  });

export const uploadUserFile = createServerFn({ method: 'POST' })
  .inputValidator(uploadSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    try {
      const requestOrigin = getBaseUrl();
      const publicFolder = isPublicFolder(data.folder);

      // Public folders (avatars, product logos/og-images) are shared resources:
      // no userId → stored directly under folder → no userFiles DB record.
      // Private files get userId scoping and are tracked in userFiles.
      const result = await uploadFile(
        data.file,
        data.file.name,
        data.file.type,
        {
          folder: data.folder,
          userId: publicFolder ? undefined : (userId ?? undefined),
          requestOrigin,
        }
      );

      // Only user-scoped uploads produce metadata; record them in DB
      if (!publicFolder && userId && result.metadata) {
        const db = getDb();
        const now = result.metadata.uploadedAt;
        await db.insert(userFiles).values({
          id: result.metadata.id,
          userId,
          filename: result.metadata.filename,
          originalName: result.metadata.originalName,
          contentType: result.metadata.contentType,
          size: result.metadata.size,
          r2Key: result.metadata.r2Key,
          createdAt: now,
          updatedAt: now,
          isPublic: data.isPublic ?? null,
          description: data.description ?? null,
        });
      }

      return result;
    } catch (error) {
      if (error instanceof UploadError || error instanceof StorageError) {
        throw new Error(formatUserFileUploadError(error));
      }
      throw new Error(m.user_files_api_error_upload_failed());
    }
  });
