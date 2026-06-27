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

export function buildAssignmentDetailShareWhere({
  shareSlug,
}: {
  shareSlug: string;
}) {
  return eq(assignment.shareSlug, shareSlug);
}
