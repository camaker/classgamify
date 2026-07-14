import { env } from 'cloudflare:workers';
import {
  DEFAULT_ALLOWED_TYPES,
  DEFAULT_MAX_FILE_SIZE,
  DEFAULT_USER_FILES_FOLDER,
} from '../constants';
import {
  type FileMetadata,
  type R2BucketInterface,
  type StorageProvider,
  type UploadFileParams,
  type UploadFileResult,
  ConfigurationError,
  StorageError,
  UploadError,
} from '../types';
import {
  buildStorageUploadObjectPlan,
  buildStorageUploadProxyUrl,
  validateStorageUploadFile,
} from '@/storage/upload-readiness';
import {
  R2_UPLOAD_FILE_ID_METADATA_KEY,
  recoverR2UploadPutAfterFailure,
} from '@/storage/upload-put-recovery';
import { websiteConfig } from '@/config/website';

interface FileValidatorConfig {
  maxFileSize: number;
  allowedTypes: string[];
}

type FileValidator = ReturnType<typeof createFileValidator>;

/**
 * Create file validator from config. Pure function, easy to test and reuse.
 */
function createFileValidator(config: FileValidatorConfig) {
  const { maxFileSize, allowedTypes } = config;
  return {
    validateFile(file: File | Blob, originalName: string, contentType: string) {
      return validateStorageUploadFile({
        allowedTypes,
        contentType,
        file,
        filename: originalName,
        maxFileSize,
      });
    },
  };
}

function generateId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Cloudflare R2 storage provider
 */
export class R2Provider implements StorageProvider {
  private readonly bucket: R2BucketInterface;
  private readonly userFilesFolder: string;
  private readonly validator: FileValidator;

  constructor() {
    this.bucket = env.BUCKET;
    if (!this.bucket) {
      throw new ConfigurationError(
        'R2 bucket binding BUCKET is not configured.'
      );
    }
    this.userFilesFolder =
      websiteConfig.storage?.userFilesFolder ?? DEFAULT_USER_FILES_FOLDER;
    this.validator = createFileValidator({
      maxFileSize: websiteConfig.storage?.maxFileSize ?? DEFAULT_MAX_FILE_SIZE,
      allowedTypes:
        websiteConfig.storage?.allowedTypes ?? DEFAULT_ALLOWED_TYPES,
    });
  }

  getProviderName(): string {
    return 'r2';
  }

  private getBucket(): R2BucketInterface {
    return this.bucket;
  }

  /** Build same-origin proxy URL for a key */
  getPublicUrl(key: string, requestOrigin?: string): string {
    return buildStorageUploadProxyUrl(key, requestOrigin);
  }

  async uploadFile(params: UploadFileParams): Promise<UploadFileResult> {
    const { file, filename, contentType, folder, userId, requestOrigin } =
      params;
    const bucket = this.getBucket();

    const fileForValidation =
      file instanceof File
        ? file
        : new File([file], filename, { type: contentType });
    const validation = this.validator.validateFile(
      fileForValidation,
      filename,
      contentType
    );
    if (!validation.success) {
      throw new UploadError(validation.code, validation.details);
    }

    const fileId = generateId();
    const uploadPlan = buildStorageUploadObjectPlan({
      fileId,
      filename,
      folder,
      requestOrigin,
      userFilesFolder: this.userFilesFolder,
      userId,
    });

    try {
      await bucket.put(uploadPlan.r2Key, file, {
        customMetadata: { [R2_UPLOAD_FILE_ID_METADATA_KEY]: fileId },
        httpMetadata: { contentType },
      });
    } catch (error) {
      const recovery = await recoverR2UploadPutAfterFailure({
        contentType,
        fileId,
        probeObject: () => bucket.head(uploadPlan.r2Key),
        size: file.size,
      });
      if (recovery !== 'committed') throw error;
    }

    const result: UploadFileResult = {
      key: uploadPlan.r2Key,
      url: uploadPlan.url,
    };

    if (userId !== undefined) {
      result.metadata = {
        id: fileId,
        userId,
        filename: uploadPlan.storedFilename,
        originalName: filename,
        contentType,
        size: file.size,
        r2Key: uploadPlan.r2Key,
        uploadedAt: new Date(),
      };
    }

    return result;
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const bucket = this.getBucket();
      await bucket.delete(key);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unknown error during file deletion';
      throw new StorageError(message);
    }
  }

  async downloadFile(
    keyOrMetadata: string | FileMetadata
  ): Promise<ReadableStream | null> {
    const key =
      typeof keyOrMetadata === 'string' ? keyOrMetadata : keyOrMetadata.r2Key;
    const bucket = this.getBucket();
    const object = await bucket.get(key);
    return object?.body ?? null;
  }

  async getFileInfo(
    key: string
  ): Promise<{ size?: number; contentType?: string } | null> {
    const bucket = this.getBucket();
    const head = await bucket.head(key);
    if (!head) return null;
    return {
      size: head.size,
      contentType: head.httpMetadata?.contentType,
    };
  }

  async getFile(
    key: string
  ): Promise<{ body: ReadableStream; contentType: string } | null> {
    const bucket = this.getBucket();
    const object = await bucket.get(key);
    if (!object?.body) return null;
    const contentType =
      object.httpMetadata?.contentType ?? 'application/octet-stream';
    return { body: object.body, contentType };
  }

  async listUserFiles(
    userId: string,
    options?: { limit?: number; cursor?: string }
  ): Promise<{
    objects: { key: string; size: number; uploaded: Date }[];
    nextCursor?: string;
    hasMore: boolean;
  }> {
    const bucket = this.getBucket();
    const prefix = `${this.userFilesFolder}/${userId}/`;
    const limit = Math.min(options?.limit ?? 50, 100);
    const listResult = await bucket.list({
      prefix,
      limit: limit + 1,
      cursor: options?.cursor,
    });

    const objects = listResult.objects ?? [];
    const hasMore = listResult.truncated ?? false;
    const nextCursor = listResult.cursor;
    const slice = hasMore ? objects.slice(0, limit) : objects;

    return {
      objects: slice.map((o) => ({
        key: o.key,
        size: o.size ?? 0,
        uploaded: o.uploaded ?? new Date(0),
      })),
      nextCursor: hasMore ? nextCursor : undefined,
      hasMore,
    };
  }
}
