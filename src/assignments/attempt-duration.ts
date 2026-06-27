import { m } from '@/locale/paraglide/messages';

export const ASSIGNMENT_ATTEMPT_DURATION_UNITS = {
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
        ASSIGNMENT_ATTEMPT_DURATION_UNITS.millisecondsPerSecond
  );
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
  const elapsedMilliseconds = now - startedAt;
  const durationSeconds = Number.isFinite(elapsedMilliseconds)
    ? Math.max(
        0,
        Math.round(
          elapsedMilliseconds /
            ASSIGNMENT_ATTEMPT_DURATION_UNITS.millisecondsPerSecond
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

export function formatAttemptDuration(
  seconds?: number | null,
  options?: {
    emptyValue?: string;
    style?: 'readable' | 'timer';
  }
) {
  const emptyValue = options?.emptyValue ?? m.assignment_result_empty_value();
  if (seconds === undefined || seconds === null) return emptyValue;
  if (!Number.isFinite(seconds)) return emptyValue;

  const normalizedSeconds = Math.max(0, Math.round(seconds));
  if (normalizedSeconds <= 0) return emptyValue;

  const minutes = Math.floor(
    normalizedSeconds / ASSIGNMENT_ATTEMPT_DURATION_UNITS.secondsPerMinute
  );
  const remainder =
    normalizedSeconds % ASSIGNMENT_ATTEMPT_DURATION_UNITS.secondsPerMinute;
  const paddedSeconds = String(remainder).padStart(
    ASSIGNMENT_ATTEMPT_DURATION_UNITS.timerSecondPaddingLength,
    '0'
  );

  if (options?.style === 'timer') {
    if (minutes <= 0) {
      return m.assignment_attempt_duration_timer_seconds({
        seconds: remainder,
      });
    }

    return m.assignment_attempt_duration_timer_minutes({
      minutes,
      seconds: paddedSeconds,
    });
  }

  if (minutes <= 0) {
    return m.assignment_attempt_duration_readable_seconds({
      seconds: remainder,
    });
  }

  return m.assignment_attempt_duration_readable_minutes({
    minutes,
    seconds: paddedSeconds,
  });
}
