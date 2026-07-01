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
  timeLimitSeconds?: number | null;
}) {
  if (durationSeconds === undefined) return undefined;
  if (!Number.isFinite(durationSeconds)) return undefined;

  const normalizedDuration = Math.max(0, Math.round(durationSeconds));
  const normalizedTimeLimit =
    normalizeAttemptTimeLimitSeconds(timeLimitSeconds);
  if (normalizedTimeLimit === undefined) return normalizedDuration;

  return Math.min(normalizedDuration, normalizedTimeLimit);
}

export function normalizeAttemptTimeLimitSeconds(
  timeLimitSeconds?: number | null
) {
  if (
    typeof timeLimitSeconds !== 'number' ||
    !Number.isFinite(timeLimitSeconds)
  ) {
    return undefined;
  }

  const normalizedTimeLimit = Math.max(0, Math.floor(timeLimitSeconds));
  return normalizedTimeLimit > 0 ? normalizedTimeLimit : undefined;
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
  timeLimitSeconds?: number | null;
}): AttemptTimerState {
  const elapsedMilliseconds = now - startedAt;
  const elapsedSeconds = Number.isFinite(elapsedMilliseconds)
    ? Math.max(
        0,
        Math.round(
          elapsedMilliseconds / ATTEMPT_DURATION_UNITS.millisecondsPerSecond
        )
      )
    : 0;
  const normalizedTimeLimitSeconds =
    normalizeAttemptTimeLimitSeconds(timeLimitSeconds);
  const durationSeconds =
    normalizeAttemptDurationSeconds({
      durationSeconds: elapsedSeconds,
      timeLimitSeconds,
    }) ?? 0;
  const remainingSeconds = normalizedTimeLimitSeconds
    ? Math.max(0, normalizedTimeLimitSeconds - elapsedSeconds)
    : undefined;

  return {
    durationSeconds,
    elapsedSeconds,
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
  timeLimitSeconds?: number | null;
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
