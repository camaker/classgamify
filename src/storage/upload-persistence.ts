export const USER_FILE_UPLOAD_PERSISTENCE_STAGES = [
  stage('authenticated-teacher', 'server'),
  stage('validated-upload-input', 'server'),
  stage('public-folder-classification', 'server'),
  stage('owner-scoped-storage-upload', 'server'),
  stage('private-metadata-result', 'server'),
  stage('metadata-insert-attempt', 'server'),
  stage('metadata-failure-capture', 'server'),
  stage('metadata-commit-probe', 'server'),
  stage('localized-cleanup-failure', 'server'),
  stage('successful-upload-response', 'server'),
  stage('r2-put-before-metadata', 'storage'),
  stage('server-only-object-key', 'storage'),
  stage('first-cleanup-delete', 'storage'),
  stage('cleanup-presence-probe', 'storage'),
  stage('confirmed-absent-object', 'storage'),
  stage('bounded-cleanup-retry', 'storage'),
  stage('retained-object-result', 'storage'),
  stage('public-object-bypass', 'storage'),
  stage('private-metadata-required', 'domain'),
  stage('committed-insert-recovery', 'domain'),
  stage('first-delete-success', 'domain'),
  stage('probe-absent-success', 'domain'),
  stage('probe-present-retry', 'domain'),
  stage('second-delete-success', 'domain'),
  stage('retry-exhausted-failure', 'domain'),
  stage('probe-unknown-failure', 'domain'),
  stage('object-key-hidden', 'privacy'),
  stage('teacher-owner-hidden', 'privacy'),
  stage('file-bytes-unread', 'privacy'),
  stage('cleanup-details-hidden', 'privacy'),
] as const;

export type UploadedObjectCleanupResult =
  | 'cleaned'
  | 'retained'
  | 'unconfirmed';

export type UserFileUploadPersistenceRecovery =
  | UploadedObjectCleanupResult
  | 'persisted';

export async function recoverUserFileUploadAfterMetadataFailure({
  deleteObject,
  probeMetadata,
  probeObject,
}: {
  deleteObject: () => Promise<void>;
  probeMetadata: () => Promise<boolean>;
  probeObject: () => Promise<unknown | null>;
}): Promise<UserFileUploadPersistenceRecovery> {
  try {
    if (await probeMetadata()) return 'persisted';
  } catch {
    return 'unconfirmed';
  }
  return cleanupUploadedObjectAfterMetadataFailure({
    deleteObject,
    probeObject,
  });
}

export async function cleanupUploadedObjectAfterMetadataFailure({
  deleteObject,
  probeObject,
}: {
  deleteObject: () => Promise<void>;
  probeObject: () => Promise<unknown | null>;
}): Promise<UploadedObjectCleanupResult> {
  try {
    await deleteObject();
    return 'cleaned';
  } catch {
    try {
      const object = await probeObject();
      if (!object) return 'cleaned';
    } catch {
      return 'unconfirmed';
    }

    try {
      await deleteObject();
      return 'cleaned';
    } catch {
      return 'retained';
    }
  }
}

function stage(id: string, layer: 'domain' | 'privacy' | 'server' | 'storage') {
  return { id, layer };
}
