import { isSameStudentIdentity } from '@/assignments/identity';

export const ATTEMPT_SUBMISSION_IDEMPOTENCY_STAGES = [
  stage('client-key-source', 'client'),
  stage('key-normalization', 'client'),
  stage('key-length-validation', 'client'),
  stage('incomplete-submit-gate', 'client'),
  stage('identity-gate', 'client'),
  stage('submission-key-reuse', 'client'),
  stage('submission-payload', 'client'),
  stage('pending-submit-lock', 'client'),
  stage('network-retry-reuse', 'client'),
  stage('new-attempt-key-reset', 'client'),
  stage('assignment-change-key-reset', 'client'),
  stage('server-input-validation', 'server'),
  stage('assignment-lookup', 'server'),
  stage('settings-resolution', 'server'),
  stage('identity-normalization', 'server'),
  stage('existing-attempt-lookup', 'server'),
  stage('replay-identity-match', 'server'),
  stage('replay-result-recovery', 'server'),
  stage('replay-review-recovery', 'server'),
  stage('replay-usage-recovery', 'server'),
  stage('lifecycle-gate-new-submit', 'server'),
  stage('attempt-limit-gate-new-submit', 'server'),
  stage('runtime-answer-validation', 'server'),
  stage('deterministic-scoring', 'server'),
  stage('submission-key-persistence', 'database'),
  stage('assignment-key-uniqueness', 'database'),
  stage('unique-conflict-recovery', 'server'),
  stage('teacher-result-continuity', 'result'),
  stage('public-feedback-continuity', 'result'),
  stage('private-key-boundary', 'privacy'),
] as const;

export type AttemptSubmissionIdempotencyLayer =
  | 'client'
  | 'database'
  | 'privacy'
  | 'result'
  | 'server';

export function normalizeAttemptSubmissionKey(
  value: string | null | undefined
) {
  return value?.trim() ?? '';
}

export function resolveAttemptSubmissionKey({
  createSubmissionKey,
  currentSubmissionKey,
}: {
  createSubmissionKey: () => string;
  currentSubmissionKey?: string;
}) {
  const current = normalizeAttemptSubmissionKey(currentSubmissionKey);
  if (current) return current;

  return normalizeAttemptSubmissionKey(createSubmissionKey());
}

export function doesAttemptSubmissionIdentityMatch({
  existing,
  requested,
}: {
  existing: {
    anonymousToken?: string | null;
    studentName?: string | null;
  };
  requested: {
    anonymousToken?: string | null;
    studentName?: string | null;
  };
}) {
  return isSameStudentIdentity(existing, requested);
}

function stage(id: string, layer: AttemptSubmissionIdempotencyLayer) {
  return { id, layer };
}
