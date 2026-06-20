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
