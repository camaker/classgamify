import type { AssignmentStatus } from '@/activities/types';
import {
  getAssignmentStatusTransitionError,
  type AssignmentDate,
  type AssignmentLifecycleNow,
  type ManagedAssignmentStatus,
  normalizeAssignmentLifecycleNowTimestamp,
  normalizeAssignmentLifecycleTimestamp,
} from '@/assignments/lifecycle';
import { m } from '@/locale/paraglide/messages';

export const ASSIGNMENT_STATUS_TRANSITION_CONCURRENCY_STAGES = [
  stage('owner-scoped-initial-read', 'server'),
  stage('initial-transition-validation', 'server'),
  stage('transition-clock-capture', 'server'),
  stage('monotonic-revision-allocation', 'server'),
  stage('compare-and-set-update', 'server'),
  stage('returning-transition-row', 'server'),
  stage('conflict-current-state-read', 'server'),
  stage('specific-conflict-message', 'server'),
  stage('generic-revision-conflict', 'server'),
  stage('owner-scoped-detail-return', 'server'),
  stage('assignment-id-predicate', 'database'),
  stage('owner-id-predicate', 'database'),
  stage('expected-status-predicate', 'database'),
  stage('expected-revision-predicate', 'database'),
  stage('reopen-expiry-null-branch', 'database'),
  stage('reopen-expiry-future-branch', 'database'),
  stage('single-update-boundary', 'database'),
  stage('zero-row-conflict-signal', 'database'),
  stage('revision-timestamp-normalization', 'domain'),
  stage('same-millisecond-revision-advance', 'domain'),
  stage('stale-status-detection', 'domain'),
  stage('stale-revision-detection', 'domain'),
  stage('expired-reopen-detection', 'domain'),
  stage('already-transitioned-detection', 'domain'),
  stage('missing-assignment-detection', 'domain'),
  stage('retained-snapshot-boundary', 'domain'),
  stage('teacher-owner-hidden', 'privacy'),
  stage('share-slug-hidden', 'privacy'),
  stage('student-attempts-untouched', 'privacy'),
  stage('source-content-untouched', 'privacy'),
] as const;

export function resolveAssignmentStatusTransitionUpdatedAt({
  currentUpdatedAt,
  now = Date.now(),
}: {
  currentUpdatedAt: AssignmentLifecycleNow;
  now?: AssignmentLifecycleNow;
}) {
  const currentTimestamp =
    normalizeAssignmentLifecycleTimestamp(currentUpdatedAt) ?? 0;
  const nowTimestamp = normalizeAssignmentLifecycleNowTimestamp(now);
  return new Date(Math.max(nowTimestamp, currentTimestamp + 1));
}

export function getAssignmentStatusTransitionConflictMessage({
  currentStatus,
  expiresAt,
  nextStatus,
  now = Date.now(),
}: {
  currentStatus: AssignmentStatus;
  expiresAt: AssignmentDate;
  nextStatus: ManagedAssignmentStatus;
  now?: AssignmentLifecycleNow;
}) {
  return (
    getAssignmentStatusTransitionError({
      currentStatus,
      expiresAt,
      nextStatus,
      now,
    }) ?? m.assignment_status_action_failure()
  );
}

function stage(
  id: string,
  layer: 'database' | 'domain' | 'privacy' | 'server'
) {
  return { id, layer };
}
