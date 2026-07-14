import { activity, assignment, assignmentSnapshot } from '@/db/app.schema';
import type { AssignmentStatus } from '@/activities/types';
import {
  type AssignmentLifecycleNow,
  type ManagedAssignmentStatus,
  normalizeAssignmentLifecycleNowDate,
} from '@/assignments/lifecycle';
import { and, eq, gt, isNull, or, type SQL } from 'drizzle-orm';

export function buildAssignmentDetailSelect() {
  return {
    activity,
    assignment,
    snapshot: assignmentSnapshot,
  };
}

export function buildAssignmentLifecycleGateSelect() {
  return {
    expiresAt: assignment.expiresAt,
    id: assignment.id,
    status: assignment.status,
    updatedAt: assignment.updatedAt,
  };
}

export function buildAssignmentActivityJoin() {
  return eq(assignment.activityId, activity.id);
}

export function buildAssignmentSnapshotJoin() {
  return eq(assignmentSnapshot.assignmentId, assignment.id);
}

export function buildAssignmentDetailOwnerWhere({
  assignmentId,
  userId,
}: {
  assignmentId: string;
  userId: string;
}) {
  return and(eq(assignment.id, assignmentId), eq(assignment.ownerId, userId));
}

export function buildAssignmentStatusTransitionWhere({
  assignmentId,
  currentStatus,
  currentUpdatedAt,
  nextStatus,
  now = new Date(),
  userId,
}: {
  assignmentId: string;
  currentStatus: AssignmentStatus;
  currentUpdatedAt: Date;
  nextStatus: ManagedAssignmentStatus;
  now?: AssignmentLifecycleNow;
  userId: string;
}) {
  const expectedRevision = and(
    buildAssignmentDetailOwnerWhere({ assignmentId, userId }),
    eq(assignment.status, currentStatus),
    eq(assignment.updatedAt, currentUpdatedAt)
  );
  if (nextStatus === 'published') {
    const normalizedNow = normalizeAssignmentLifecycleNowDate(now);
    return and(
      expectedRevision,
      or(isNull(assignment.expiresAt), gt(assignment.expiresAt, normalizedNow))
    ) as SQL;
  }
  return expectedRevision as SQL;
}

export function buildAssignmentDetailOwnerShareWhere({
  shareSlug,
  userId,
}: {
  shareSlug: string;
  userId: string;
}) {
  return and(
    eq(assignment.ownerId, userId),
    eq(assignment.shareSlug, shareSlug)
  );
}

export function buildAssignmentDetailShareWhere({
  shareSlug,
}: {
  shareSlug: string;
}) {
  return eq(assignment.shareSlug, shareSlug);
}
