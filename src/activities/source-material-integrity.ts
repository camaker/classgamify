import { getErrorTextChain } from '@/lib/error-text';
import { m } from '@/locale/paraglide/messages';

export const ACTIVITY_SOURCE_MATERIAL_REFERENCE_MISSING_MARKER =
  'classgamify_activity_source_material_reference_missing';
export const ASSIGNMENT_SNAPSHOT_SOURCE_MATERIAL_REFERENCE_MISSING_MARKER =
  'classgamify_assignment_snapshot_source_material_reference_missing';
export const USER_FILE_SOURCE_MATERIAL_IN_USE_MARKER =
  'classgamify_user_file_source_material_in_use';

export const SOURCE_MATERIAL_INTEGRITY_STAGES = [
  stage('authenticated-teacher', 'server'),
  stage('initial-reference-validation', 'server'),
  stage('guarded-metadata-delete', 'server'),
  stage('trigger-error-mapping', 'server'),
  stage('storage-delete-after-claim', 'server'),
  stage('storage-presence-probe', 'server'),
  stage('metadata-restore-attempt', 'server'),
  stage('safe-delete-response', 'server'),
  stage('activity-insert-trigger', 'database'),
  stage('activity-update-trigger', 'database'),
  stage('snapshot-insert-trigger', 'database'),
  stage('snapshot-update-trigger', 'database'),
  stage('activity-reference-delete-trigger', 'database'),
  stage('snapshot-reference-delete-trigger', 'database'),
  stage('activity-owner-file-match', 'database'),
  stage('snapshot-owner-file-match', 'database'),
  stage('json-reference-existence', 'database'),
  stage('metadata-delete-returning', 'database'),
  stage('metadata-restore-insert', 'database'),
  stage('single-writer-ordering', 'database'),
  stage('write-delete-race-blocked', 'domain'),
  stage('absent-object-delete-success', 'domain'),
  stage('present-object-metadata-restore', 'domain'),
  stage('unknown-cleanup-safe-failure', 'domain'),
  stage('localized-reference-conflict', 'domain'),
  stage('retryable-storage-failure', 'domain'),
  stage('activity-content-hidden', 'privacy'),
  stage('snapshot-content-hidden', 'privacy'),
  stage('storage-key-hidden', 'privacy'),
  stage('student-data-unread', 'privacy'),
] as const;

export type UserFileDeleteRecovery =
  | 'already-deleted'
  | 'restored'
  | 'unconfirmed';

export function getSourceMaterialIntegrityErrorMessage(error: unknown) {
  const errorText = getErrorTextChain(error);
  if (
    errorText.includes(ACTIVITY_SOURCE_MATERIAL_REFERENCE_MISSING_MARKER) ||
    errorText.includes(
      ASSIGNMENT_SNAPSHOT_SOURCE_MATERIAL_REFERENCE_MISSING_MARKER
    )
  ) {
    return m.activity_api_error_source_material_not_found();
  }
  if (errorText.includes(USER_FILE_SOURCE_MATERIAL_IN_USE_MARKER)) {
    return m.user_files_api_error_file_in_use();
  }
  return undefined;
}

export function rethrowSourceMaterialIntegrityError(error: unknown): never {
  const message = getSourceMaterialIntegrityErrorMessage(error);
  if (message) throw new Error(message);
  throw error;
}

export async function recoverUserFileDeleteAfterStorageFailure({
  probeObject,
  restoreMetadata,
}: {
  probeObject: () => Promise<unknown | null>;
  restoreMetadata: () => Promise<void>;
}): Promise<UserFileDeleteRecovery> {
  try {
    const object = await probeObject();
    if (!object) return 'already-deleted';
    try {
      await restoreMetadata();
      return 'restored';
    } catch {
      return 'unconfirmed';
    }
  } catch {
    return 'unconfirmed';
  }
}

function stage(
  id: string,
  layer: 'database' | 'domain' | 'privacy' | 'server'
) {
  return { id, layer };
}
