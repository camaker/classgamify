import {
  buildActivityEditAccessView,
  buildActivityVisibilityActionExecutionPlan,
} from '@/activities/lifecycle';
import type { ActivityVisibility } from '@/activities/types';
import { m } from '@/locale/paraglide/messages';

export type ActivityMutationAction = 'archive' | 'edit' | 'restore';

export const ACTIVITY_MUTATION_CONCURRENCY_STAGES = [
  stage('owner-scoped-initial-read', 'server'),
  stage('initial-lifecycle-validation', 'server'),
  stage('mutation-clock-capture', 'server'),
  stage('monotonic-revision-allocation', 'server'),
  stage('compare-and-set-update', 'server'),
  stage('returning-detail-row', 'server'),
  stage('conflict-current-state-read', 'server'),
  stage('specific-lifecycle-conflict', 'server'),
  stage('generic-revision-conflict', 'server'),
  stage('direct-mutation-response', 'server'),
  stage('activity-id-predicate', 'database'),
  stage('owner-id-predicate', 'database'),
  stage('expected-visibility-predicate', 'database'),
  stage('expected-revision-predicate', 'database'),
  stage('single-update-boundary', 'database'),
  stage('zero-row-conflict-signal', 'database'),
  stage('content-update-guarded', 'database'),
  stage('visibility-update-guarded', 'database'),
  stage('revision-timestamp-normalization', 'domain'),
  stage('same-millisecond-revision-advance', 'domain'),
  stage('stale-visibility-detection', 'domain'),
  stage('stale-revision-detection', 'domain'),
  stage('archived-edit-detection', 'domain'),
  stage('already-archived-detection', 'domain'),
  stage('already-restored-detection', 'domain'),
  stage('assignment-snapshot-retention', 'domain'),
  stage('teacher-owner-hidden', 'privacy'),
  stage('activity-content-hidden', 'privacy'),
  stage('source-material-hidden', 'privacy'),
  stage('assignment-records-untouched', 'privacy'),
] as const;

export function resolveActivityMutationUpdatedAt({
  currentUpdatedAt,
  now = Date.now(),
}: {
  currentUpdatedAt: Date | number;
  now?: Date | number;
}) {
  const currentTimestamp = normalizeTimestamp(currentUpdatedAt);
  const nowTimestamp = normalizeTimestamp(now);
  return new Date(Math.max(nowTimestamp, currentTimestamp + 1));
}

export function getActivityMutationConflictMessage({
  action,
  currentVisibility,
}: {
  action: ActivityMutationAction;
  currentVisibility: ActivityVisibility;
}) {
  if (action === 'edit') {
    const editAccess = buildActivityEditAccessView(currentVisibility);
    return editAccess.canEdit
      ? m.activity_api_error_write_conflict()
      : editAccess.description;
  }

  const lifecyclePlan = buildActivityVisibilityActionExecutionPlan({
    action,
    activityId: '',
    visibility: currentVisibility,
  });
  return lifecyclePlan.type === 'blocked'
    ? lifecyclePlan.message
    : m.activity_api_error_write_conflict();
}

function normalizeTimestamp(value: Date | number) {
  return value instanceof Date ? value.getTime() : value;
}

function stage(
  id: string,
  layer: 'database' | 'domain' | 'privacy' | 'server'
) {
  return { id, layer };
}
