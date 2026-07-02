import type { AttemptResult } from '@/activities/types';
import { normalizeAttemptDurationSeconds } from '@/assignments/attempt-duration';
import {
  resolveAssignmentSettings,
  type AssignmentSettingsInput,
} from '@/assignments/validation';

export type AssignmentAttemptStatsSource = {
  resultJson: AttemptResult | null;
  score?: number | null;
  timeLimitSeconds?: number | null;
};

interface AssignmentAttemptStatsByAssignmentSource
  extends AssignmentAttemptStatsSource {
  assignmentId: string;
}

export type AssignmentAttemptStats = {
  averageDurationSeconds: number;
  averagePoints: number;
  averageScore: number;
  completions: number;
};

export type AssignmentAttemptStatsView = {
  averageDurationSeconds: number | undefined;
  averagePoints: number | undefined;
  averageScore: number | undefined;
  completed: boolean;
  completions: number | undefined;
};

export function withAssignmentAttemptStatsSettings<
  TItem extends {
    settingsJson: AssignmentSettingsInput;
  },
>(item: TItem): TItem & { timeLimitSeconds?: number | null } {
  const settings = resolveAssignmentSettings(item.settingsJson);

  return {
    ...item,
    timeLimitSeconds: settings.timeLimitSeconds,
  };
}

export function summarizeAssignmentAttempts(
  attempts: AssignmentAttemptStatsSource[],
  options?: {
    respectAttemptTimeLimit?: boolean;
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
    respectAttemptTimeLimit?: boolean;
    timeLimitSeconds?: number | null;
  }
) {
  return normalizeAttemptDurationSeconds({
    durationSeconds: item.resultJson?.durationSeconds,
    timeLimitSeconds: options?.respectAttemptTimeLimit
      ? item.timeLimitSeconds
      : (item.timeLimitSeconds ?? options?.timeLimitSeconds),
  });
}

function getAttemptAccuracy(item: AssignmentAttemptStatsSource) {
  return normalizeAttemptStatsPercent(item.resultJson?.accuracy);
}

function getAttemptPoints(item: AssignmentAttemptStatsSource) {
  const totalPoints = normalizeAttemptStatsNumber(item.resultJson?.totalPoints);
  const score = normalizeAttemptStatsNumber(item.score, {
    max: totalPoints,
  });
  if (score !== undefined) return score;

  return (
    normalizeAttemptStatsNumber(item.resultJson?.earnedPoints, {
      max: totalPoints,
    }) ?? 0
  );
}

function normalizeAttemptStatsNumber(
  value: number | null | undefined,
  options?: {
    max?: number;
  }
) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;

  const normalizedValue = Math.max(0, value);
  if (options?.max === undefined || !Number.isFinite(options.max)) {
    return normalizedValue;
  }

  return Math.min(normalizedValue, options.max);
}

function normalizeAttemptStatsPercent(value: number | null | undefined) {
  return normalizeAttemptStatsNumber(value, { max: 100 }) ?? 0;
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
      summarizeAssignmentAttempts(items, {
        respectAttemptTimeLimit: true,
      }),
    ])
  );
}

export function normalizeAssignmentAttemptStats(
  stats: Partial<AssignmentAttemptStats> | null | undefined
): AssignmentAttemptStats {
  return {
    averageDurationSeconds: normalizeStatsNumber(
      stats?.averageDurationSeconds,
      {
        round: true,
      }
    ),
    averagePoints: normalizeStatsNumber(stats?.averagePoints, {
      round: true,
    }),
    averageScore: normalizeStatsNumber(stats?.averageScore, {
      round: true,
    }),
    completions: normalizeStatsNumber(stats?.completions, {
      floor: true,
    }),
  };
}

export function buildAssignmentAttemptStatsView(
  stats: Partial<AssignmentAttemptStats> | null | undefined
): AssignmentAttemptStatsView {
  const completions = normalizeStatsViewCount(stats?.completions, {
    floor: true,
  });
  const completed = completions !== undefined && completions > 0;

  return {
    averageDurationSeconds: completed
      ? normalizeStatsViewAverage(stats?.averageDurationSeconds, {
          round: true,
        })
      : undefined,
    averagePoints: completed
      ? normalizeStatsViewAverage(stats?.averagePoints, {
          round: true,
        })
      : undefined,
    averageScore: completed
      ? normalizeStatsViewAverage(stats?.averageScore, {
          round: true,
        })
      : undefined,
    completed,
    completions,
  };
}

function normalizeStatsNumber(
  value: number | null | undefined,
  options?: {
    floor?: boolean;
    round?: boolean;
  }
) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;

  const boundedValue = Math.max(0, value);
  if (options?.floor) return Math.floor(boundedValue);
  return options?.round ? Math.round(boundedValue) : boundedValue;
}

function normalizeStatsViewCount(
  value: number | null | undefined,
  options?: {
    floor?: boolean;
    round?: boolean;
  }
) {
  if (value === null || value === undefined) return 0;
  if (!Number.isFinite(value)) return undefined;

  return normalizeStatsNumber(value, options);
}

function normalizeStatsViewAverage(
  value: number | null | undefined,
  options?: {
    floor?: boolean;
    round?: boolean;
  }
) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return undefined;
  }

  return normalizeStatsNumber(value, options);
}
