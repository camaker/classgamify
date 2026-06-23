import type { AttemptResult } from '@/activities/types';
import { normalizeAttemptDurationSeconds } from '@/assignments/attempt-duration';

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

  const durationSeconds = attempts
    .map(getAttemptDurationSeconds)
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
      attempts.reduce((sum, item) => sum + getAttemptPoints(item), 0) /
        completions
    ),
    averageScore: Math.round(
      attempts.reduce((sum, item) => sum + getAttemptAccuracy(item), 0) /
        completions
    ),
    completions,
  };
}

function getAttemptDurationSeconds(item: AssignmentAttemptStatsSource) {
  return normalizeAttemptDurationSeconds({
    durationSeconds: item.resultJson?.durationSeconds,
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
