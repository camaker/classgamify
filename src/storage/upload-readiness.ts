import {
  DEFAULT_ALLOWED_TYPES,
  DEFAULT_MAX_FILE_SIZE,
  DEFAULT_USER_FILES_FOLDER,
} from '@/storage/constants';
import {
  classifyUserFileMaterial,
  getUserFileExtension,
  normalizeUserFileContentType,
  type UserFileMaterialClassification,
} from '@/storage/file-materials';
import {
  STORAGE_ERROR_CODES,
  type StorageErrorCode,
  type StorageErrorDetails,
  type ValidationResult,
} from '@/storage/types';
import { isPublicFolder, sanitizeFolder } from '@/storage/utils';

type StorageUploadValidationConfig = {
  allowedTypes?: string[];
  maxFileSize?: number;
};

type StorageUploadFileInput = {
  contentType: string;
  file: Blob | File;
  filename: string;
};

type StorageUploadPlanInput = {
  fileId: string;
  filename: string;
  folder?: string;
  requestOrigin?: string;
  userFilesFolder?: string;
  userId?: string;
};

export type StorageUploadReadinessInput = StorageUploadFileInput &
  StorageUploadValidationConfig &
  Omit<StorageUploadPlanInput, 'fileId'>;

export type StorageUploadReadinessItemId =
  | 'activity-source-reference'
  | 'allowed-extension-check'
  | 'content-type-match'
  | 'content-type-normalization'
  | 'dangerous-content-type'
  | 'extension-normalization'
  | 'file-byte-boundary'
  | 'filename-sanitization'
  | 'folder-sanitization'
  | 'material-classification'
  | 'metadata-persistence'
  | 'owner-scope'
  | 'provider-helper-reuse'
  | 'public-folder-boundary'
  | 'r2-key-planning'
  | 'same-origin-proxy-url'
  | 'size-check'
  | 'storage-key-boundary'
  | 'student-payload-boundary'
  | 'upload-validation';

export type StorageUploadReadinessIssue = {
  code: StorageErrorCode;
  details?: StorageErrorDetails;
};

export type StorageUploadObjectPlan = {
  isPublicFolder: boolean;
  r2Key: string;
  sanitizedFolder?: string;
  storedFilename: string;
  url: string;
};

export type StorageUploadReadinessPlan = {
  allowedExtensions: string[];
  classification: UserFileMaterialClassification;
  contentType?: string;
  extension?: string;
  filenamePreview: string;
  itemIds: StorageUploadReadinessItemId[];
  maxFileSize: number;
  metadataPersistence: 'shared-resource' | 'tracked-user-file';
  objectPlan: StorageUploadObjectPlan;
  privacy: StorageUploadReadinessPrivacyContract;
  validation: ValidationResult<true>;
};

export type StorageUploadReadinessPrivacyContract = {
  exposesFileBytes: false;
  exposesOriginalFilename: false;
  exposesPermissionMetadata: false;
  exposesSourceMaterialStorageKeysToStudents: false;
  itemIds: StorageUploadReadinessItemId[];
  publicPayloadIncludesFileList: false;
  readsFileBytesForClassification: false;
  tracksOwnerScopedUserFiles: boolean;
};

export const STORAGE_UPLOAD_READINESS_ITEM_IDS = [
  'upload-validation',
  'size-check',
  'allowed-extension-check',
  'content-type-normalization',
  'extension-normalization',
  'content-type-match',
  'dangerous-content-type',
  'filename-sanitization',
  'folder-sanitization',
  'material-classification',
  'owner-scope',
  'public-folder-boundary',
  'metadata-persistence',
  'r2-key-planning',
  'same-origin-proxy-url',
  'activity-source-reference',
  'student-payload-boundary',
  'storage-key-boundary',
  'file-byte-boundary',
  'provider-helper-reuse',
] as const satisfies readonly StorageUploadReadinessItemId[];

export const STORAGE_UPLOAD_DANGEROUS_CONTENT_TYPES = [
  'application/javascript',
  'application/xhtml+xml',
  'application/x-httpd-php',
  'text/html',
  'text/javascript',
] as const;

export const STORAGE_UPLOAD_MIME_EXTENSIONS: Record<string, string[]> = {
  'application/gzip': ['gz'],
  'application/json': ['json'],
  'application/msword': ['doc'],
  'application/pdf': ['pdf'],
  'application/vnd.ms-excel': ['xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
    'docx',
  ],
  'application/zip': ['zip'],
  'audio/mpeg': ['mp3'],
  'audio/wav': ['wav'],
  'image/bmp': ['bmp'],
  'image/gif': ['gif'],
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/svg+xml': ['svg'],
  'image/webp': ['webp'],
  'image/x-icon': ['ico'],
  'text/csv': ['csv'],
  'text/plain': ['txt'],
  'video/mp4': ['mp4'],
  'video/webm': ['webm'],
};

export function buildStorageUploadReadinessPlan({
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  contentType,
  file,
  filename,
  folder,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  requestOrigin,
  userFilesFolder,
  userId,
}: StorageUploadReadinessInput): StorageUploadReadinessPlan {
  const allowedExtensions = normalizeStorageAllowedExtensions(allowedTypes);
  const validation = validateStorageUploadFile({
    allowedTypes,
    contentType,
    file,
    filename,
    maxFileSize,
  });
  const objectPlan = buildStorageUploadObjectPlan({
    fileId: 'pending-file-id',
    filename,
    folder,
    requestOrigin,
    userFilesFolder,
    userId,
  });
  const metadataPersistence =
    userId && !objectPlan.isPublicFolder
      ? 'tracked-user-file'
      : 'shared-resource';
  const itemIds = [...STORAGE_UPLOAD_READINESS_ITEM_IDS];

  return {
    allowedExtensions,
    classification: classifyUserFileMaterial({
      contentType,
      originalName: filename,
    }),
    contentType: normalizeUserFileContentType(contentType),
    extension: getUserFileExtension({ originalName: filename }),
    filenamePreview: sanitizeStorageFilename(filename),
    itemIds,
    maxFileSize,
    metadataPersistence,
    objectPlan,
    privacy: {
      exposesFileBytes: false,
      exposesOriginalFilename: false,
      exposesPermissionMetadata: false,
      exposesSourceMaterialStorageKeysToStudents: false,
      itemIds,
      publicPayloadIncludesFileList: false,
      readsFileBytesForClassification: false,
      tracksOwnerScopedUserFiles: metadataPersistence === 'tracked-user-file',
    },
    validation,
  };
}

export function validateStorageUploadFile({
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  contentType,
  file,
  filename,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
}: StorageUploadFileInput &
  StorageUploadValidationConfig): ValidationResult<true> {
  const sizeValidation = validateStorageUploadSize(file, maxFileSize);
  if (!sizeValidation.success) return sizeValidation;

  const allowedExtensionValidation = validateStorageAllowedExtension({
    allowedTypes,
    filename,
  });
  if (!allowedExtensionValidation.success) {
    return allowedExtensionValidation;
  }

  return validateStorageContentType({ contentType, filename });
}

export function validateStorageUploadSize(
  file: Blob | File,
  maxFileSize = DEFAULT_MAX_FILE_SIZE
): ValidationResult<true> {
  if (file.size > maxFileSize) {
    return fail(STORAGE_ERROR_CODES.FILE_TOO_LARGE, {
      maxMegabytes: Math.round(maxFileSize / (1024 * 1024)),
    });
  }

  return success(true);
}

export function validateStorageAllowedExtension({
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  filename,
}: {
  allowedTypes?: string[];
  filename: string;
}): ValidationResult<true> {
  const normalizedAllowedTypes =
    normalizeStorageAllowedExtensions(allowedTypes);
  if (normalizedAllowedTypes.length === 0) return success(true);

  const extension = getUserFileExtension({ originalName: filename });
  if (!extension || !normalizedAllowedTypes.includes(extension)) {
    return fail(STORAGE_ERROR_CODES.INVALID_FILE_TYPE, {
      supportedExtensions: formatStorageAllowedExtensions(allowedTypes),
    });
  }

  return success(true);
}

export function validateStorageContentType({
  contentType,
  filename,
}: {
  contentType: string;
  filename: string;
}): ValidationResult<true> {
  const normalizedContentType = normalizeUserFileContentType(contentType);

  if (
    normalizedContentType &&
    STORAGE_UPLOAD_DANGEROUS_CONTENT_TYPES.includes(
      normalizedContentType as (typeof STORAGE_UPLOAD_DANGEROUS_CONTENT_TYPES)[number]
    )
  ) {
    return fail(STORAGE_ERROR_CODES.DANGEROUS_CONTENT_TYPE, {
      contentType: normalizedContentType,
    });
  }

  const extension = getUserFileExtension({ originalName: filename });
  if (!normalizedContentType || !extension) return success(true);

  const allowedExtensions =
    STORAGE_UPLOAD_MIME_EXTENSIONS[normalizedContentType];
  if (allowedExtensions && !allowedExtensions.includes(extension)) {
    return fail(STORAGE_ERROR_CODES.CONTENT_TYPE_MISMATCH, {
      contentType: normalizedContentType,
      extension,
    });
  }

  return success(true);
}

export function buildStorageUploadObjectPlan({
  fileId,
  filename,
  folder,
  requestOrigin,
  userFilesFolder = DEFAULT_USER_FILES_FOLDER,
  userId,
}: StorageUploadPlanInput): StorageUploadObjectPlan {
  const sanitizedFilename = sanitizeStorageFilename(filename);
  const storedFilename = `${fileId}-${sanitizedFilename}`;
  const sanitizedFolder = sanitizeFolder(folder);
  const publicFolder = isPublicFolder(folder);
  const defaultUserFilesFolder =
    sanitizeFolder(userFilesFolder) ?? DEFAULT_USER_FILES_FOLDER;
  const ownerId = publicFolder ? undefined : userId;
  const r2Key =
    ownerId !== undefined
      ? [
          sanitizedFolder ?? defaultUserFilesFolder,
          ownerId,
          storedFilename,
        ].join('/')
      : sanitizedFolder
        ? `${sanitizedFolder}/${storedFilename}`
        : storedFilename;

  return {
    isPublicFolder: publicFolder,
    r2Key,
    sanitizedFolder,
    storedFilename,
    url: buildStorageUploadProxyUrl(r2Key, requestOrigin),
  };
}

export function buildStorageUploadProxyUrl(
  key: string,
  requestOrigin?: string
) {
  if (!requestOrigin) return key;
  return `${requestOrigin}/api/storage/file?key=${encodeURIComponent(key)}`;
}

export function sanitizeStorageFilename(filename: string): string {
  const basename =
    filename.normalize('NFKC').split(/[\\/]/).filter(Boolean).at(-1) ?? 'file';
  const sanitized = basename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 255);
  return sanitized || 'file';
}

export function normalizeStorageAllowedExtensions(
  allowedTypes: string[] = DEFAULT_ALLOWED_TYPES
) {
  return allowedTypes
    .map((type) =>
      type.normalize('NFKC').trim().replace(/^\./, '').toLowerCase()
    )
    .filter(Boolean);
}

function formatStorageAllowedExtensions(
  allowedTypes: string[] = DEFAULT_ALLOWED_TYPES
) {
  return normalizeStorageAllowedExtensions(allowedTypes)
    .map((type) => `.${type}`)
    .join(', ');
}

function success<T>(data: T): ValidationResult<T> {
  return { success: true, data };
}

function fail(
  code: StorageErrorCode,
  details?: StorageErrorDetails
): ValidationResult<never> {
  return {
    code,
    details,
    success: false,
  };
}
