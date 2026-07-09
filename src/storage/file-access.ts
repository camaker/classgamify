import { buildAttachmentContentDisposition } from '@/storage/content-disposition';
import { normalizeUserFileContentType } from '@/storage/file-materials';
import { isPublicFolder } from '@/storage/utils';

export const STORAGE_FILE_ACCESS_ITEM_IDS = [
  'proxy-route-entry',
  'query-key-required',
  'path-traversal-guard',
  'control-character-guard',
  'public-folder-detection',
  'database-record-lookup',
  'missing-private-record-not-found',
  'public-folder-record-optional',
  'private-record-auth-required',
  'private-owner-match',
  'private-owner-mismatch-forbidden',
  'public-record-access',
  'storage-provider-fetch',
  'storage-missing-not-found',
  'configuration-error-status',
  'content-type-normalization',
  'safe-inline-content-types',
  'attachment-download-fallback',
  'original-filename-disposition',
  'multilingual-filename-disposition',
  'public-cache-header',
  'private-cache-header',
  'nosniff-header',
  'file-byte-stream-boundary',
  'source-material-storage-key-boundary',
  'student-payload-boundary',
  'avatar-public-boundary',
  'userfiles-owner-scope',
  'permission-metadata-guard',
  'test-catalog-gate',
] as const;

export type StorageFileAccessItemId =
  (typeof STORAGE_FILE_ACCESS_ITEM_IDS)[number];

export type StorageFileAccessRecord = {
  isPublic: boolean | null;
  originalName?: string | null;
  userId: string;
};

export type StorageFileAccessDecision =
  | {
      allowed: false;
      reason:
        | 'missing-key'
        | 'private-record-missing'
        | 'unsafe-key'
        | 'user-ownership-required';
      status: 400 | 403 | 404;
    }
  | {
      allowed: true;
      isPublicFile: boolean;
      isPublicFolder: boolean;
      key: string;
      requiresOwner: boolean;
      status: 200;
    };

export type StorageFileProxyKeyValidation =
  | { key: string; success: true }
  | { reason: 'missing-key' | 'unsafe-key'; success: false };

export type StorageFileResponseHeadersInput = {
  contentType?: string | null;
  fileRecord?: Pick<StorageFileAccessRecord, 'originalName'> | null;
  isPublicFile: boolean;
};

export const STORAGE_FILE_SAFE_INLINE_CONTENT_TYPES = [
  'application/pdf',
  'image/bmp',
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/svg+xml',
  'image/webp',
  'image/x-icon',
] as const;

export const STORAGE_FILE_ACCESS_PRIVACY_CONTRACT = {
  exposesFileBytesInDecision: false,
  exposesOriginalFilenameOnlyInAttachmentHeader: true,
  exposesPermissionMetadata: false,
  exposesStorageKeysToStudentPayloads: false,
  itemIds: [...STORAGE_FILE_ACCESS_ITEM_IDS],
  permitsPublicSharedFoldersWithoutUserRecord: true,
  requiresOwnerForPrivateUserFiles: true,
  returnsNoStoreForPrivateFiles: true,
  returnsNosniffHeader: true,
  scope: 'same-origin-storage-file-access',
} as const;

export function validateStorageFileProxyKey(
  key: string | null | undefined
): StorageFileProxyKeyValidation {
  if (!key) return { reason: 'missing-key', success: false };
  if (key.trim() !== key) {
    return { reason: 'unsafe-key', success: false };
  }
  if (hasUnsafeStorageFileProxyCharacter(key)) {
    return { reason: 'unsafe-key', success: false };
  }
  if (
    key
      .split('/')
      .some((segment) => segment === '' || segment === '.' || segment === '..')
  ) {
    return { reason: 'unsafe-key', success: false };
  }

  return { key, success: true };
}

function hasUnsafeStorageFileProxyCharacter(key: string): boolean {
  for (const character of key) {
    const code = character.charCodeAt(0);
    if (code <= 31 || code === 127 || character === '\\') return true;
  }

  return false;
}

export function resolveStorageFileAccessDecision({
  fileRecord,
  key,
  requesterUserId,
}: {
  fileRecord?: StorageFileAccessRecord | null;
  key: string | null | undefined;
  requesterUserId?: string | null;
}): StorageFileAccessDecision {
  const keyValidation = validateStorageFileProxyKey(key);
  if (!keyValidation.success) {
    return {
      allowed: false,
      reason: keyValidation.reason,
      status: 400,
    };
  }

  const isPublicKey = isPublicFolder(keyValidation.key);
  if (!fileRecord && !isPublicKey) {
    return {
      allowed: false,
      reason: 'private-record-missing',
      status: 404,
    };
  }

  const requiresOwner = Boolean(fileRecord && fileRecord.isPublic !== true);
  if (
    requiresOwner &&
    (!requesterUserId || fileRecord?.userId !== requesterUserId)
  ) {
    return {
      allowed: false,
      reason: 'user-ownership-required',
      status: 403,
    };
  }

  return {
    allowed: true,
    isPublicFile: fileRecord ? fileRecord.isPublic === true : isPublicKey,
    isPublicFolder: isPublicKey,
    key: keyValidation.key,
    requiresOwner,
    status: 200,
  };
}

export function isStorageFileSafeInlineContentType(
  contentType: string | null | undefined
): boolean {
  const normalizedContentType = normalizeUserFileContentType(contentType);
  return STORAGE_FILE_SAFE_INLINE_CONTENT_TYPES.includes(
    normalizedContentType as (typeof STORAGE_FILE_SAFE_INLINE_CONTENT_TYPES)[number]
  );
}

export function buildStorageFileResponseHeaders({
  contentType,
  fileRecord,
  isPublicFile,
}: StorageFileResponseHeadersInput): Record<string, string> {
  const responseContentType =
    normalizeUserFileContentType(contentType) ?? 'application/octet-stream';
  const responseHeaders: Record<string, string> = {
    'Cache-Control': isPublicFile
      ? 'public, max-age=31536000, immutable'
      : 'private, no-store',
    'Content-Type': responseContentType,
    'X-Content-Type-Options': 'nosniff',
  };

  if (!isStorageFileSafeInlineContentType(responseContentType)) {
    responseHeaders['Content-Disposition'] = buildAttachmentContentDisposition(
      fileRecord?.originalName
    );
  }

  return responseHeaders;
}
