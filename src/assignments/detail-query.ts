import { assignment } from '@/db/app.schema';
import { and, eq } from 'drizzle-orm';

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
