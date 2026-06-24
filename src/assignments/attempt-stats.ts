import type { AttemptResult } from '@/activities/types';
import { normalizeAttemptDurationSeconds } from '@/assignments/attempt-duration';

export type AssignmentAttemptStatsSource = {
  resultJson: AttemptResult | null;
  score?: number | null;
  timeLimitSeconds?: number | null;
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
  attempts: AssignmentAttemptStatsSource[],
  options?: {
    timeLimitSeconds?: number | null;
  }
): AssignmentAttemptStats {
  const completedAttempts = attempts.filter(hasAttemptResult);
  const completions = completedAttempts.length;

  if (completions === 0) {
    return {
      averageDurationSeconds: 0,
      averagePoints: 0,
      averageScore: 0,
      completions: 0,
    };
  }

  const durationSeconds = completedAttempts
    .map((attempt) => getAttemptDurationSeconds(attempt, options))
    .filter((duration): duration is number => duration !== undefined);

  return {
    averageDurationSeconds:
      durationSeconds.length > 0
        ? Math.round(
            durationSeconds.reduce((sum, duration) => sum + duration, 0) /
              durationSeconds.length
          )
        : 0,
    averagePoints: Math.round(
      completedAttempts.reduce((sum, item) => sum + getAttemptPoints(item), 0) /
        completions
    ),
    averageScore: Math.round(
      completedAttempts.reduce(
        (sum, item) => sum + getAttemptAccuracy(item),
        0
      ) / completions
    ),
    completions,
  };
}

function hasAttemptResult(
  attempt: AssignmentAttemptStatsSource
): attempt is AssignmentAttemptStatsSource & { resultJson: AttemptResult } {
  return attempt.resultJson != null;
}

function getAttemptDurationSeconds(
  item: AssignmentAttemptStatsSource,
  options?: {
    timeLimitSeconds?: number | null;
  }
) {
  return normalizeAttemptDurationSeconds({
    durationSeconds: item.resultJson?.durationSeconds,
    timeLimitSeconds: item.timeLimitSeconds ?? options?.timeLimitSeconds,
  });
}

function getAttemptAccuracy(item: AssignmentAttemptStatsSource) {
  return getFiniteNumber(item.resultJson?.accuracy, 0);
}

function getAttemptPoints(item: AssignmentAttemptStatsSource) {
  const score = getFiniteNumber(item.score);
  if (score !== undefined) return score;

  return getFiniteNumber(item.resultJson?.earnedPoints, 0);
}

function getFiniteNumber(value: number | null | undefined, fallback?: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
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
