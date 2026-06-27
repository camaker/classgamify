/**
 * Supported storage provider names
 */
export type StorageProviderName = 'r2';

/**
 * Cloudflare R2 bucket interface used by the storage provider
 */
export interface R2BucketInterface {
  put(
    key: string,
    value: Blob | ReadableStream | ArrayBuffer | ArrayBufferView | string,
    options?: {
      httpMetadata?: { contentType?: string };
      customMetadata?: Record<string, string>;
    }
  ): Promise<unknown>;
  get(key: string): Promise<{
    body: ReadableStream | null;
    httpMetadata?: { contentType?: string };
  } | null>;
  delete(key: string): Promise<void>;
  head(key: string): Promise<{
    size?: number;
    httpMetadata?: { contentType?: string };
    customMetadata?: Record<string, string>;
  } | null>;
  list(options?: {
    prefix?: string;
    limit?: number;
    cursor?: string;
  }): Promise<{
    objects: { key: string; size: number; uploaded: Date }[];
    truncated: boolean;
    cursor?: string;
  }>;
}

/**
 * File metadata
 */
export interface FileMetadata {
  id: string;
  userId: string;
  filename: string;
  originalName: string;
  contentType: string;
  size: number;
  r2Key: string;
  uploadedAt: Date;
}

/**
 * Validation result type for file validation
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      code: StorageErrorCode;
      details?: StorageErrorDetails;
    };

export const STORAGE_ERROR_CODES = {
  CONTENT_TYPE_MISMATCH: 'CONTENT_TYPE_MISMATCH',
  DANGEROUS_CONTENT_TYPE: 'DANGEROUS_CONTENT_TYPE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  NO_FILE_PROVIDED: 'NO_FILE_PROVIDED',
  R2_STORAGE_NOT_CONFIGURED: 'R2_STORAGE_NOT_CONFIGURED',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
} as const;

export type StorageErrorCode =
  (typeof STORAGE_ERROR_CODES)[keyof typeof STORAGE_ERROR_CODES];

export interface StorageErrorDetails {
  contentType?: string;
  extension?: string;
  maxMegabytes?: number;
  supportedExtensions?: string;
}

/**
 * Storage provider error types
 */
export class StorageError extends Error {
  readonly code?: StorageErrorCode;
  readonly details?: StorageErrorDetails;

  constructor(
    message: string,
    code?: StorageErrorCode,
    details?: StorageErrorDetails
  ) {
    super(message);
    this.name = 'StorageError';
    this.code = code;
    this.details = details;
  }
}

export class ConfigurationError extends StorageError {
  constructor(
    message = STORAGE_ERROR_CODES.R2_STORAGE_NOT_CONFIGURED,
    code: StorageErrorCode = STORAGE_ERROR_CODES.R2_STORAGE_NOT_CONFIGURED,
    details?: StorageErrorDetails
  ) {
    super(message, code, details);
    this.name = 'ConfigurationError';
  }
}

export class UploadError extends StorageError {
  constructor(code: StorageErrorCode, details?: StorageErrorDetails) {
    super(code, code, details);
    this.name = 'UploadError';
  }
}

/**
 * Params for upload operation
 */
export interface UploadFileParams {
  file: Blob | File;
  filename: string;
  contentType: string;
  folder?: string;
  /** When provided, key is scoped under user (e.g. user-files/{userId}/ or folder/{userId}/). */
  userId?: string;
  /** Used to build same-origin proxy URL for the returned file. */
  requestOrigin?: string;
}

export interface UploadFileResult {
  url: string;
  key: string;
  /** Present when userId was provided (full metadata). */
  metadata?: FileMetadata;
}

/**
 * Storage provider interface
 */
export interface StorageProvider {
  /** Get the provider's name */
  getProviderName(): string;

  /** Upload a file */
  uploadFile(params: UploadFileParams): Promise<UploadFileResult>;

  /** Delete a file */
  deleteFile(key: string): Promise<void>;

  /** Download by R2 key or by FileMetadata. Returns stream or null */
  downloadFile(
    keyOrMetadata: string | FileMetadata
  ): Promise<ReadableStream | null>;

  /** Get object head (size, contentType, etc.) by key. */
  getFileInfo(
    key: string
  ): Promise<{ size?: number; contentType?: string } | null>;

  /** Get file stream and content-type by key (for same-origin proxy serving). */
  getFile(
    key: string
  ): Promise<{ body: ReadableStream; contentType: string } | null>;

  /** List object keys (and optional metadata) for a user prefix. */
  listUserFiles(
    userId: string,
    options?: { limit?: number; cursor?: string }
  ): Promise<{
    objects: { key: string; size: number; uploaded: Date }[];
    nextCursor?: string;
    hasMore: boolean;
  }>;
}
