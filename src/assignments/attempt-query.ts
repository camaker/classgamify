import { attempt } from '@/db/app.schema';
import { and, desc, eq, inArray, isNotNull, type SQL } from 'drizzle-orm';

export function buildScoredAttemptWhere(...filters: SQL[]) {
  return and(...filters, isNotNull(attempt.resultJson));
}

export function buildAssignmentAttemptWhere({
  assignmentId,
}: {
  assignmentId: string;
}) {
  return eq(attempt.assignmentId, assignmentId);
}

export function buildAssignmentAttemptsInWhere({
  assignmentIds,
}: {
  assignmentIds: string[];
}) {
  return inArray(attempt.assignmentId, assignmentIds);
}

export function buildScoredAssignmentAttemptWhere({
  assignmentId,
}: {
  assignmentId: string;
}) {
  return buildScoredAttemptWhere(buildAssignmentAttemptWhere({ assignmentId }));
}

export function buildScoredAnonymousAssignmentAttemptWhere({
  anonymousToken,
  assignmentId,
}: {
  anonymousToken: string;
  assignmentId: string;
}) {
  return buildScoredAttemptWhere(
    buildAssignmentAttemptWhere({ assignmentId }),
    eq(attempt.anonymousToken, anonymousToken)
  );
}

export function buildAttemptCompletedAtOrderBy() {
  return desc(attempt.completedAt);
}
