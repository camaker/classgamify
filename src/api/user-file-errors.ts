import { m } from '@/locale/paraglide/messages';
import { type StorageError, STORAGE_ERROR_CODES } from '@/storage/types';

const DEFAULT_UPLOAD_LIMIT_MEGABYTES = 10;

export function formatUserFileUploadError(error: StorageError): string {
  switch (error.code) {
    case STORAGE_ERROR_CODES.FILE_TOO_LARGE:
      return m.user_files_api_error_file_too_large({
        maxMegabytes:
          error.details?.maxMegabytes ?? DEFAULT_UPLOAD_LIMIT_MEGABYTES,
      });
    case STORAGE_ERROR_CODES.INVALID_FILE_TYPE:
      return m.user_files_api_error_invalid_file_type({
        supportedExtensions:
          error.details?.supportedExtensions ??
          m.user_files_api_error_supported_file_types_unknown(),
      });
    case STORAGE_ERROR_CODES.CONTENT_TYPE_MISMATCH:
      return m.user_files_api_error_content_type_mismatch();
    case STORAGE_ERROR_CODES.DANGEROUS_CONTENT_TYPE:
      return m.user_files_api_error_dangerous_content_type();
    case STORAGE_ERROR_CODES.R2_STORAGE_NOT_CONFIGURED:
      return m.user_files_api_error_storage_unavailable();
    default:
      return m.user_files_api_error_upload_failed();
  }
}
