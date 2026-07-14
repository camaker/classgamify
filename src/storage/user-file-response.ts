import { userFiles } from '@/db/app.schema';

export const USER_FILE_RESPONSE_BOUNDARY_STAGES = [
  stage('authenticated-list-request', 'server'),
  stage('owner-scoped-list-query', 'server'),
  stage('explicit-safe-list-select', 'server'),
  stage('private-upload-persisted', 'server'),
  stage('private-upload-safe-response', 'server'),
  stage('public-upload-url-response', 'server'),
  stage('file-id-access-link', 'server'),
  stage('server-side-key-resolution', 'server'),
  stage('file-id-validation', 'server'),
  stage('storage-provider-fetch', 'server'),
  stage('file-id-column', 'response'),
  stage('stored-filename-column', 'response'),
  stage('original-name-column', 'response'),
  stage('content-type-column', 'response'),
  stage('size-column', 'response'),
  stage('public-flag-column', 'response'),
  stage('created-at-column', 'response'),
  stage('summary-separated', 'response'),
  stage('pagination-total-separated', 'response'),
  stage('public-url-only-result', 'response'),
  stage('delete-by-safe-id', 'domain'),
  stage('material-classification-input', 'domain'),
  stage('table-display-input', 'domain'),
  stage('private-open-link-continuity', 'domain'),
  stage('avatar-url-continuity', 'domain'),
  stage('private-key-hidden', 'privacy'),
  stage('upload-metadata-hidden', 'privacy'),
  stage('owner-id-hidden', 'privacy'),
  stage('permission-notes-hidden', 'privacy'),
  stage('student-payload-unchanged', 'privacy'),
] as const;

export type UserFileClientItem = {
  contentType: string;
  createdAt: Date | number | string;
  filename: string;
  id: string;
  isPublic: boolean | null;
  originalName: string;
  size: number;
};

type UserFileClientItemInput = UserFileClientItem & Record<string, unknown>;

export function buildUserFileClientSelect() {
  return {
    contentType: userFiles.contentType,
    createdAt: userFiles.createdAt,
    filename: userFiles.filename,
    id: userFiles.id,
    isPublic: userFiles.isPublic,
    originalName: userFiles.originalName,
    size: userFiles.size,
  };
}

export function buildUserFileClientItem(
  file: UserFileClientItemInput
): UserFileClientItem {
  return {
    contentType: file.contentType,
    createdAt: file.createdAt,
    filename: file.filename,
    id: file.id,
    isPublic: file.isPublic,
    originalName: file.originalName,
    size: file.size,
  };
}

export function buildUserFileIdAccessPath(fileId: string) {
  return `/api/storage/file?id=${encodeURIComponent(fileId)}`;
}

export function isValidUserFileAccessId(fileId: string | null | undefined) {
  return Boolean(
    fileId && fileId.length <= 128 && /^[A-Za-z0-9_-]+$/.test(fileId)
  );
}

function stage(
  id: string,
  layer: 'domain' | 'privacy' | 'response' | 'server'
) {
  return { id, layer };
}
