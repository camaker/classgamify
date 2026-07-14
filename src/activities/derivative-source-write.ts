import { getArchivedActivityDerivationError } from '@/activities/lifecycle';
import { getSourceMaterialIntegrityErrorMessage } from '@/activities/source-material-integrity';
import { getErrorTextChain } from '@/lib/error-text';
import { m } from '@/locale/paraglide/messages';

export const ACTIVITY_DERIVATIVE_SOURCE_PAIR_MARKER =
  'classgamify_activity_derivative_source_pair_invalid';
export const ACTIVITY_DERIVATIVE_SOURCE_OWNER_MARKER =
  'classgamify_activity_derivative_source_owner_mismatch';
export const ACTIVITY_DERIVATIVE_SOURCE_ARCHIVED_MARKER =
  'classgamify_activity_derivative_source_archived';
export const ACTIVITY_DERIVATIVE_SOURCE_REVISION_MARKER =
  'classgamify_activity_derivative_source_revision_mismatch';

export const ACTIVITY_DERIVATIVE_SOURCE_WRITE_GUARD_STAGES = [
  stage('authenticated-teacher', 'server'),
  stage('owner-scoped-source-read', 'server'),
  stage('initial-source-lifecycle-check', 'server'),
  stage('remix-readiness-check', 'server'),
  stage('source-provenance-payload', 'server'),
  stage('derivative-draft-insert', 'server'),
  stage('trigger-error-mapping', 'server'),
  stage('derivative-detail-reload', 'server'),
  stage('derivative-response', 'server'),
  stage('independent-draft-result', 'server'),
  stage('source-pair-trigger', 'database'),
  stage('source-owner-trigger', 'database'),
  stage('source-archive-trigger', 'database'),
  stage('source-revision-trigger', 'database'),
  stage('before-activity-insert', 'database'),
  stage('source-owner-equality', 'database'),
  stage('expected-revision-equality', 'database'),
  stage('source-row-read-only', 'database'),
  stage('nested-error-text', 'domain'),
  stage('owner-marker-classification', 'domain'),
  stage('archive-marker-classification', 'domain'),
  stage('revision-marker-classification', 'domain'),
  stage('pair-marker-classification', 'domain'),
  stage('unknown-error-rethrow', 'domain'),
  stage('active-visibility-acceptance', 'domain'),
  stage('later-source-change-continuity', 'domain'),
  stage('source-content-hidden', 'privacy'),
  stage('teacher-owner-hidden', 'privacy'),
  stage('source-material-hidden', 'privacy'),
  stage('internal-marker-hidden', 'privacy'),
] as const;

export function getActivityDerivativeSourceWriteErrorMessage(error: unknown) {
  const sourceMaterialMessage = getSourceMaterialIntegrityErrorMessage(error);
  if (sourceMaterialMessage) return sourceMaterialMessage;
  const errorText = getErrorTextChain(error);
  if (errorText.includes(ACTIVITY_DERIVATIVE_SOURCE_OWNER_MARKER)) {
    return m.activity_api_error_activity_not_found();
  }
  if (errorText.includes(ACTIVITY_DERIVATIVE_SOURCE_ARCHIVED_MARKER)) {
    return getArchivedActivityDerivationError();
  }
  if (
    errorText.includes(ACTIVITY_DERIVATIVE_SOURCE_REVISION_MARKER) ||
    errorText.includes(ACTIVITY_DERIVATIVE_SOURCE_PAIR_MARKER)
  ) {
    return m.activity_api_error_write_conflict();
  }
  return undefined;
}

export function rethrowActivityDerivativeSourceWriteError(
  error: unknown
): never {
  const message = getActivityDerivativeSourceWriteErrorMessage(error);
  if (message) throw new Error(message);
  throw error;
}

function stage(
  id: string,
  layer: 'database' | 'domain' | 'privacy' | 'server'
) {
  return { id, layer };
}
