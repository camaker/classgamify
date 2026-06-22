import type { AttemptResult } from '@/activities/types';

export type AssignmentAttemptStatsSource = {
  resultJson: AttemptResult | null;
  score?: number | null;
};

interface AssignmentAttemptStatsByAssignmentSource
  extends AssignmentAttemptStatsSource {
  assignmentId: string;
}

type AssignmentAttemptStats = {
  averageDurationSeconds: number;
  averagePoints: number;
  averageScore: number;
  completions: number;
};

export function summarizeAssignmentAttempts(
  attempts: AssignmentAttemptStatsSource[]
): AssignmentAttemptStats {
  const completions = attempts.length;

  if (completions === 0) {
    return {
      averageDurationSeconds: 0,
      averagePoints: 0,
      averageScore: 0,
      completions: 0,
    };
  }

  const durationAttempts = attempts.filter(
    (item) => item.resultJson?.durationSeconds !== undefined
  );

  return {
    averageDurationSeconds:
      durationAttempts.length > 0
        ? Math.round(
            durationAttempts.reduce(
              (sum, item) => sum + (item.resultJson?.durationSeconds ?? 0),
              0
            ) / durationAttempts.length
          )
        : 0,
    averagePoints: Math.round(
      attempts.reduce((sum, item) => sum + getAttemptPoints(item), 0) /
        completions
    ),
    averageScore: Math.round(
      attempts.reduce(
        (sum, item) => sum + (item.resultJson?.accuracy ?? 0),
        0
      ) / completions
    ),
    completions,
  };
}

export function summarizeAssignmentAttemptsByAssignmentId(
  attempts: AssignmentAttemptStatsByAssignmentSource[]
) {
  const attemptsByAssignmentId = new Map<
    string,
    AssignmentAttemptStatsSource[]
  >();

  for (const attempt of attempts) {
    const attemptsForAssignment =
      attemptsByAssignmentId.get(attempt.assignmentId) ?? [];

    attemptsForAssignment.push(attempt);
    attemptsByAssignmentId.set(attempt.assignmentId, attemptsForAssignment);
  }

  return new Map(
    [...attemptsByAssignmentId.entries()].map(([assignmentId, items]) => [
      assignmentId,
      summarizeAssignmentAttempts(items),
    ])
  );
}

function getAttemptPoints(item: AssignmentAttemptStatsSource) {
  return item.score ?? item.resultJson?.earnedPoints ?? 0;
}
