export function normalizeAttemptDurationSeconds({
  durationSeconds,
  timeLimitSeconds,
}: {
  durationSeconds?: number;
  timeLimitSeconds?: number;
}) {
  if (durationSeconds === undefined) return undefined;

  const normalizedDuration = Math.max(0, Math.round(durationSeconds));
  if (!timeLimitSeconds) return normalizedDuration;

  return Math.min(normalizedDuration, timeLimitSeconds);
}

export function buildAttemptTimerState({
  now,
  startedAt,
  timeLimitSeconds,
}: {
  now: number;
  startedAt: number;
  timeLimitSeconds?: number;
}) {
  const durationSeconds = Math.max(0, Math.round((now - startedAt) / 1000));
  const remainingSeconds = timeLimitSeconds
    ? Math.max(0, timeLimitSeconds - durationSeconds)
    : undefined;

  return {
    durationSeconds,
    elapsedSeconds: durationSeconds,
    remainingSeconds,
    timeExpired: Boolean(timeLimitSeconds && remainingSeconds === 0),
  };
}

export function formatAttemptDuration(
  seconds?: number | null,
  options?: {
    emptyValue?: string;
    style?: 'readable' | 'timer';
  }
) {
  const emptyValue = options?.emptyValue ?? '-';
  if (seconds === undefined || seconds === null) return emptyValue;

  const normalizedSeconds = Math.max(0, Math.round(seconds));
  if (normalizedSeconds <= 0) return emptyValue;

  const minutes = Math.floor(normalizedSeconds / 60);
  const remainder = normalizedSeconds % 60;

  if (options?.style === 'timer') {
    if (minutes <= 0) return `${remainder}s`;
    return `${minutes}:${String(remainder).padStart(2, '0')}`;
  }

  if (minutes <= 0) return `${remainder}s`;
  return `${minutes}m ${String(remainder).padStart(2, '0')}s`;
}
