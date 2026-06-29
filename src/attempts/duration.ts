export const ATTEMPT_DURATION_UNITS = {
  millisecondsPerSecond: 1000,
  secondsPerMinute: 60,
  timerSecondPaddingLength: 2,
} as const;

export function normalizeAttemptDurationSeconds({
  durationSeconds,
  timeLimitSeconds,
}: {
  durationSeconds?: number;
  timeLimitSeconds?: number;
}) {
  if (durationSeconds === undefined) return undefined;
  if (!Number.isFinite(durationSeconds)) return undefined;

  const normalizedDuration = Math.max(0, Math.round(durationSeconds));
  if (
    !timeLimitSeconds ||
    !Number.isFinite(timeLimitSeconds) ||
    timeLimitSeconds <= 0
  ) {
    return normalizedDuration;
  }

  return Math.min(normalizedDuration, timeLimitSeconds);
}

export function buildAttemptStartedAt({
  completedAt,
  durationSeconds,
}: {
  completedAt: Date;
  durationSeconds?: number;
}) {
  if (durationSeconds === undefined || !Number.isFinite(durationSeconds)) {
    return completedAt;
  }

  const completedTimestamp = completedAt.getTime();
  if (!Number.isFinite(completedTimestamp)) return completedAt;

  return new Date(
    completedTimestamp -
      Math.max(0, Math.round(durationSeconds)) *
        ATTEMPT_DURATION_UNITS.millisecondsPerSecond
  );
}

export type AttemptTimerState = {
  durationSeconds: number;
  elapsedSeconds: number;
  remainingSeconds: number | undefined;
  timeExpired: boolean;
};

export function buildAttemptTimerState({
  now,
  startedAt,
  timeLimitSeconds,
}: {
  now: number;
  startedAt: number;
  timeLimitSeconds?: number;
}): AttemptTimerState {
  const elapsedMilliseconds = now - startedAt;
  const durationSeconds = Number.isFinite(elapsedMilliseconds)
    ? Math.max(
        0,
        Math.round(
          elapsedMilliseconds / ATTEMPT_DURATION_UNITS.millisecondsPerSecond
        )
      )
    : 0;
  const normalizedTimeLimitSeconds =
    timeLimitSeconds &&
    Number.isFinite(timeLimitSeconds) &&
    timeLimitSeconds > 0
      ? timeLimitSeconds
      : undefined;
  const remainingSeconds = normalizedTimeLimitSeconds
    ? Math.max(0, normalizedTimeLimitSeconds - durationSeconds)
    : undefined;

  return {
    durationSeconds,
    elapsedSeconds: durationSeconds,
    remainingSeconds,
    timeExpired: Boolean(normalizedTimeLimitSeconds && remainingSeconds === 0),
  };
}

export function resolveAttemptSubmissionDurationSeconds({
  now,
  startedAt,
  timeLimitSeconds,
}: {
  now: number;
  startedAt: number;
  timeLimitSeconds?: number;
}) {
  const timerState = buildAttemptTimerState({
    now,
    startedAt,
    timeLimitSeconds,
  });

  return normalizeAttemptDurationSeconds({
    durationSeconds: timerState.durationSeconds,
    timeLimitSeconds,
  });
}
