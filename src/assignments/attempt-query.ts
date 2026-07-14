import { assignment, attempt } from '@/db/app.schema';
import { and, asc, desc, eq, inArray, isNotNull, type SQL } from 'drizzle-orm';

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

export function buildAttemptSubmissionReplaySelect() {
  return {
    anonymousToken: attempt.anonymousToken,
    answersJson: attempt.answersJson,
    id: attempt.id,
    resultJson: attempt.resultJson,
    studentName: attempt.studentName,
  };
}

export function buildAttemptAssignmentJoin() {
  return eq(attempt.assignmentId, assignment.id);
}

export function buildScoredAttemptWhere(...filters: SQL[]) {
  return and(...filters, isNotNull(attempt.resultJson));
}

function buildAssignmentAttemptWhere({
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

export function buildAttemptSubmissionKeyWhere({
  assignmentId,
  submissionKey,
}: {
  assignmentId: string;
  submissionKey: string;
}) {
  return and(
    eq(attempt.assignmentId, assignmentId),
    eq(attempt.submissionKey, submissionKey),
    isNotNull(attempt.resultJson)
  );
}

export function buildAttemptIdentitySlotWhere({
  assignmentId,
  attemptNumber,
  identityKey,
}: {
  assignmentId: string;
  attemptNumber: number;
  identityKey: string;
}) {
  return and(
    eq(attempt.assignmentId, assignmentId),
    eq(attempt.identityKey, identityKey),
    eq(attempt.attemptNumber, attemptNumber),
    isNotNull(attempt.resultJson)
  );
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
  return [desc(attempt.completedAt), asc(attempt.id)] as const;
}
