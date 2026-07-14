import {
  buildActivitySourceMaterialFileReferenceWhere,
  buildAssignmentSnapshotSourceMaterialFileReferenceWhere,
} from '@/activities/source-material-delete';
import {
  recoverUserFileDeleteAfterStorageFailure,
  rethrowSourceMaterialIntegrityError,
} from '@/activities/source-material-integrity';
import { buildAssignmentSnapshotJoin } from '@/assignments/detail-query';
import { getDb } from '@/db';
import {
  activity,
  assignment,
  assignmentSnapshot,
  userFiles,
} from '@/db/app.schema';
import { getBaseUrl } from '@/lib/urls';
import { m } from '@/locale/paraglide/messages';
import { authApiMiddleware } from '@/middlewares/auth-middleware';
import { deleteFile, getFileInfo, uploadFile } from '@/storage';
import {
  buildUserFileDetailOwnerWhere,
  buildUserFileListOrderBy,
  buildUserFileOwnerWhere,
  getUserFileListOffset,
  USER_FILE_LIST_INPUT_LIMITS,
} from '@/storage/file-query';
import { buildUserFileMaterialSummary } from '@/storage/file-summary';
import {
  cleanupUploadedObjectAfterMetadataFailure,
  recoverUserFileUploadAfterMetadataFailure,
  type UploadedObjectCleanupResult,
} from '@/storage/upload-persistence';
import { StorageError, UploadError } from '@/storage/types';
import { isPublicFolder } from '@/storage/utils';
import { createServerFn } from '@tanstack/react-start';
import { count } from 'drizzle-orm';
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
  .validator(listSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const where = buildUserFileOwnerWhere({ userId });

    const [totalRows, items, summaryItems] = await Promise.all([
      db.select({ count: count() }).from(userFiles).where(where),
      db
        .select()
        .from(userFiles)
        .where(where)
        .orderBy(...buildUserFileListOrderBy())
        .limit(data.pageSize)
        .offset(
          getUserFileListOffset({
            pageIndex: data.pageIndex,
            pageSize: data.pageSize,
          })
        ),
      db
        .select({
          contentType: userFiles.contentType,
          filename: userFiles.filename,
          isPublic: userFiles.isPublic,
          originalName: userFiles.originalName,
          size: userFiles.size,
        })
        .from(userFiles)
        .where(where),
    ]);
    const [totalRow] = totalRows;
    const total = totalRow?.count ?? 0;

    return {
      items,
      summary: buildUserFileMaterialSummary(summaryItems),
      total,
    };
  });

export const listUserFileMaterials = createServerFn({ method: 'GET' })
  .validator(listSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const where = buildUserFileOwnerWhere({ userId });

    const [totalRows, items] = await Promise.all([
      db.select({ count: count() }).from(userFiles).where(where),
      db
        .select({
          contentType: userFiles.contentType,
          filename: userFiles.filename,
          id: userFiles.id,
          originalName: userFiles.originalName,
          size: userFiles.size,
        })
        .from(userFiles)
        .where(where)
        .orderBy(...buildUserFileListOrderBy())
        .limit(data.pageSize)
        .offset(
          getUserFileListOffset({
            pageIndex: data.pageIndex,
            pageSize: data.pageSize,
          })
        ),
    ]);
    const [totalRow] = totalRows;

    return {
      items,
      total: totalRow?.count ?? 0,
    };
  });

const deleteSchema = z.object({ id: z.string() });

export const deleteUserFile = createServerFn({ method: 'POST' })
  .validator(deleteSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const where = buildUserFileDetailOwnerWhere({
      fileId: data.id,
      userId,
    });
    const [row] = await db.select().from(userFiles).where(where).limit(1);

    if (!row) {
      throw new Error(m.user_files_api_error_file_not_found());
    }

    const [activityReferences, snapshotReferences] = await Promise.all([
      db
        .select({ id: activity.id })
        .from(activity)
        .where(
          buildActivitySourceMaterialFileReferenceWhere({
            fileId: row.id,
            userId,
          })
        )
        .limit(1),
      db
        .select({ assignmentId: assignmentSnapshot.assignmentId })
        .from(assignmentSnapshot)
        .innerJoin(assignment, buildAssignmentSnapshotJoin())
        .where(
          buildAssignmentSnapshotSourceMaterialFileReferenceWhere({
            fileId: row.id,
            userId,
          })
        )
        .limit(1),
    ]);
    if (activityReferences.length > 0 || snapshotReferences.length > 0) {
      throw new Error(m.user_files_api_error_file_in_use());
    }

    const [deletedRow] = await db
      .delete(userFiles)
      .where(where)
      .returning()
      .catch(rethrowSourceMaterialIntegrityError);
    if (!deletedRow) {
      throw new Error(m.user_files_api_error_file_not_found());
    }

    try {
      await deleteFile(deletedRow.r2Key);
    } catch {
      const recovery = await recoverUserFileDeleteAfterStorageFailure({
        probeObject: () => getFileInfo(deletedRow.r2Key),
        restoreMetadata: async () => {
          await db.insert(userFiles).values(deletedRow);
        },
      });
      if (recovery === 'already-deleted') return;
      throw new Error(m.user_files_api_error_delete_failed());
    }
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
  .validator(uploadSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const requestOrigin = getBaseUrl();
    const publicFolder = isPublicFolder(data.folder);
    let result: Awaited<ReturnType<typeof uploadFile>>;

    try {
      // Public folders (avatars, product logos/og-images) are shared resources:
      // no userId → stored directly under folder → no userFiles DB record.
      // Private files get userId scoping and are tracked in userFiles.
      result = await uploadFile(data.file, data.file.name, data.file.type, {
        folder: data.folder,
        userId: publicFolder ? undefined : (userId ?? undefined),
        requestOrigin,
      });
    } catch (error) {
      if (error instanceof UploadError || error instanceof StorageError) {
        throw new Error(formatUserFileUploadError(error));
      }
      throw new Error(m.user_files_api_error_upload_failed());
    }

    // Only user-scoped uploads produce metadata; record them in DB.
    if (!publicFolder) {
      const metadata = result.metadata;
      if (!userId || !metadata) {
        await throwUserFileUploadPersistenceFailure(result.key);
      }
      const db = getDb();
      const now = metadata.uploadedAt;
      try {
        await db.insert(userFiles).values({
          id: metadata.id,
          userId,
          filename: metadata.filename,
          originalName: metadata.originalName,
          contentType: metadata.contentType,
          size: metadata.size,
          r2Key: metadata.r2Key,
          createdAt: now,
          updatedAt: now,
          isPublic: data.isPublic ?? null,
          description: data.description ?? null,
        });
      } catch {
        const recovery = await recoverUserFileUploadAfterMetadataFailure({
          deleteObject: () => deleteFile(metadata.r2Key),
          probeMetadata: async () => {
            const [persistedRow] = await db
              .select({ r2Key: userFiles.r2Key })
              .from(userFiles)
              .where(
                buildUserFileDetailOwnerWhere({
                  fileId: metadata.id,
                  userId,
                })
              )
              .limit(1);
            return persistedRow?.r2Key === metadata.r2Key;
          },
          probeObject: () => getFileInfo(metadata.r2Key),
        });
        if (recovery !== 'persisted') {
          throwUserFileUploadPersistenceError(recovery);
        }
      }
    }

    return result;
  });

async function throwUserFileUploadPersistenceFailure(
  r2Key: string
): Promise<never> {
  const cleanup = await cleanupUploadedObjectAfterMetadataFailure({
    deleteObject: () => deleteFile(r2Key),
    probeObject: () => getFileInfo(r2Key),
  });
  throwUserFileUploadPersistenceError(cleanup);
}

function throwUserFileUploadPersistenceError(
  cleanup: UploadedObjectCleanupResult
): never {
  throw new Error(
    cleanup === 'cleaned'
      ? m.user_files_api_error_upload_failed()
      : m.user_files_api_error_upload_cleanup_failed()
  );
}
