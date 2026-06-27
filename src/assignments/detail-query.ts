import { activity, assignment, assignmentSnapshot } from '@/db/app.schema';
import { and, eq } from 'drizzle-orm';

export function buildAssignmentDetailSelect() {
  return {
    activity,
    assignment,
    snapshot: assignmentSnapshot,
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
