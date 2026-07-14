import { m } from '@/locale/paraglide/messages';
import { getErrorTextChain } from '@/lib/error-text';

export const ASSIGNMENT_SUBMISSION_STATUS_BLOCKED_MARKER =
  'classgamify_assignment_submission_status_blocked';
export const ASSIGNMENT_SUBMISSION_EXPIRED_MARKER =
  'classgamify_assignment_submission_expired';
export const ATTEMPT_IDENTITY_SLOT_UNIQUE_INDEX =
  'attempt_assignment_identity_number_unique';

export const ASSIGNMENT_SUBMISSION_WRITE_GUARD_STAGES = [
  stage('initial-assignment-lookup', 'server'),
  stage('same-key-replay-before-lifecycle', 'server'),
  stage('initial-lifecycle-check', 'server'),
  stage('runtime-answer-validation', 'server'),
  stage('deterministic-score-preparation', 'server'),
  stage('attempt-slot-reservation', 'server'),
  stage('same-key-replay-after-write-conflict', 'server'),
  stage('write-error-mapping', 'server'),
  stage('localized-status-error', 'server'),
  stage('localized-expiry-error', 'server'),
  stage('status-trigger', 'database'),
  stage('expiry-trigger', 'database'),
  stage('before-insert-timing', 'database'),
  stage('assignment-row-state-read', 'database'),
  stage('database-clock-expiry-read', 'database'),
  stage('status-abort-marker', 'database'),
  stage('expiry-abort-marker', 'database'),
  stage('same-statement-write-boundary', 'database'),
  stage('error-cause-chain', 'domain'),
  stage('status-marker-classification', 'domain'),
  stage('expiry-marker-classification', 'domain'),
  stage('identity-slot-conflict-classification', 'domain'),
  stage('non-slot-error-rethrow', 'domain'),
  stage('occupied-slot-confirmation', 'domain'),
  stage('bounded-slot-recount', 'domain'),
  stage('unlimited-write-guard', 'domain'),
  stage('internal-marker-hidden', 'privacy'),
  stage('identity-slot-hidden', 'privacy'),
  stage('student-answer-hidden', 'privacy'),
  stage('teacher-result-continuity', 'privacy'),
] as const;

export function getAssignmentSubmissionLifecycleWriteErrorMessage(
  error: unknown
) {
  const errorText = getErrorTextChain(error);
  if (errorText.includes(ASSIGNMENT_SUBMISSION_EXPIRED_MARKER)) {
    return m.assignment_api_error_assignment_expired();
  }
  if (errorText.includes(ASSIGNMENT_SUBMISSION_STATUS_BLOCKED_MARKER)) {
    return m.assignment_api_error_assignment_closed();
  }
  return undefined;
}

export function rethrowAssignmentSubmissionWriteError(error: unknown): never {
  const lifecycleMessage =
    getAssignmentSubmissionLifecycleWriteErrorMessage(error);
  if (lifecycleMessage) throw new Error(lifecycleMessage);
  throw error;
}

export function isAttemptIdentitySlotConflict(error: unknown) {
  const errorText = getErrorTextChain(error);
  return (
    errorText.includes(ATTEMPT_IDENTITY_SLOT_UNIQUE_INDEX) ||
    /unique constraint failed:\s*attempt\.assignment_id,\s*attempt\.identity_key,\s*attempt\.attempt_number/i.test(
      errorText
    )
  );
}

function stage(
  id: string,
  layer: 'database' | 'domain' | 'privacy' | 'server'
) {
  return { id, layer };
}
