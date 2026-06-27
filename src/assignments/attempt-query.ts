import { assignment, attempt } from '@/db/app.schema';
import { and, desc, eq, inArray, isNotNull, type SQL } from 'drizzle-orm';

export function buildAssignmentAttemptStatsSelect() {
  return {
    resultJson: attempt.resultJson,
    settingsJson: assignment.settingsJson,
  };
}

export function buildAssignmentAttemptStatsByAssignmentSelect() {
  return {
    assignmentId: attempt.assignmentId,
    ...buildAssignmentAttemptStatsSelect(),
  };
}

export function buildAssignmentResultsAttemptSelect() {
  return {
    anonymousToken: attempt.anonymousToken,
    answersJson: attempt.answersJson,
    assignmentId: attempt.assignmentId,
    completedAt: attempt.completedAt,
    id: attempt.id,
    maxScore: attempt.maxScore,
    resultJson: attempt.resultJson,
    score: attempt.score,
    startedAt: attempt.startedAt,
    studentName: attempt.studentName,
  };
}

export function buildAttemptAssignmentJoin() {
  return eq(attempt.assignmentId, assignment.id);
}

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
