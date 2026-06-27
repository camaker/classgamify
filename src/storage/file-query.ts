import { userFiles } from '@/db/app.schema';
import { and, desc, eq } from 'drizzle-orm';

export const USER_FILE_LIST_INPUT_LIMITS = {
  pageSizeMax: 100,
  pageSizeMin: 1,
} as const;

export const USER_FILE_MATERIAL_PICKER_PAGE_SIZE =
  USER_FILE_LIST_INPUT_LIMITS.pageSizeMax;

export function buildUserFileOwnerWhere({ userId }: { userId: string }) {
  return eq(userFiles.userId, userId);
}

export function buildUserFileDetailOwnerWhere({
  fileId,
  userId,
}: {
  fileId: string;
  userId: string;
}) {
  return and(eq(userFiles.id, fileId), eq(userFiles.userId, userId));
}

export function buildUserFileListOrderBy() {
  return desc(userFiles.createdAt);
}

export function getUserFileListOffset({
  pageIndex,
  pageSize,
}: {
  pageIndex: number;
  pageSize: number;
}) {
  const normalizedPageIndex =
    Number.isInteger(pageIndex) && pageIndex > 0 ? pageIndex : 0;
  const normalizedPageSize =
    Number.isInteger(pageSize) && pageSize > 0
      ? pageSize
      : USER_FILE_LIST_INPUT_LIMITS.pageSizeMin;

  return normalizedPageIndex * normalizedPageSize;
}
