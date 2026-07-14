import { getArchivedActivityDerivationError } from '@/activities/lifecycle';
import { getSourceMaterialIntegrityErrorMessage } from '@/activities/source-material-integrity';
import { getErrorTextChain } from '@/lib/error-text';
import { m } from '@/locale/paraglide/messages';

export const ASSIGNMENT_PUBLISH_SOURCE_OWNER_MISMATCH_MARKER =
  'classgamify_assignment_publish_source_owner_mismatch';
export const ASSIGNMENT_PUBLISH_SOURCE_ARCHIVED_MARKER =
  'classgamify_assignment_publish_source_archived';

export const ASSIGNMENT_PUBLISH_SOURCE_WRITE_GUARD_STAGES = [
  stage('authenticated-teacher', 'server'),
  stage('owner-scoped-source-read', 'server'),
  stage('initial-source-lifecycle-check', 'server'),
  stage('publish-input-validation', 'server'),
  stage('delivery-settings-resolution', 'server'),
  stage('assignment-snapshot-transaction', 'server'),
  stage('assignment-insert-first', 'server'),
  stage('trigger-error-mapping', 'server'),
  stage('assignment-detail-reload', 'server'),
  stage('published-response', 'server'),
  stage('source-owner-trigger', 'database'),
  stage('source-archive-trigger', 'database'),
  stage('before-assignment-insert', 'database'),
  stage('source-activity-existence', 'database'),
  stage('owner-equality-check', 'database'),
  stage('archived-visibility-check', 'database'),
  stage('transaction-rollback', 'database'),
  stage('snapshot-insert-blocked', 'database'),
  stage('nested-error-text', 'domain'),
  stage('owner-marker-classification', 'domain'),
  stage('archive-marker-classification', 'domain'),
  stage('activity-not-found-mapping', 'domain'),
  stage('restore-before-publish-mapping', 'domain'),
  stage('unknown-error-rethrow', 'domain'),
  stage('active-visibility-acceptance', 'domain'),
  stage('existing-assignment-continuity', 'domain'),
  stage('source-content-hidden', 'privacy'),
  stage('teacher-owner-hidden', 'privacy'),
  stage('source-material-hidden', 'privacy'),
  stage('internal-marker-hidden', 'privacy'),
] as const;

export function getAssignmentPublishSourceWriteErrorMessage(error: unknown) {
  const sourceMaterialMessage = getSourceMaterialIntegrityErrorMessage(error);
  if (sourceMaterialMessage) return sourceMaterialMessage;
  const errorText = getErrorTextChain(error);
  if (errorText.includes(ASSIGNMENT_PUBLISH_SOURCE_OWNER_MISMATCH_MARKER)) {
    return m.assignment_api_error_activity_not_found();
  }
  if (errorText.includes(ASSIGNMENT_PUBLISH_SOURCE_ARCHIVED_MARKER)) {
    return getArchivedActivityDerivationError();
  }
  return undefined;
}

export function rethrowAssignmentPublishSourceWriteError(
  error: unknown
): never {
  const message = getAssignmentPublishSourceWriteErrorMessage(error);
  if (message) throw new Error(message);
  throw error;
}

function stage(
  id: string,
  layer: 'database' | 'domain' | 'privacy' | 'server'
) {
  return { id, layer };
}
