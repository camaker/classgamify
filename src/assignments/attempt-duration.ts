import {
  ATTEMPT_DURATION_UNITS,
  buildAttemptStartedAt,
  buildAttemptTimerState,
  normalizeAttemptDurationSeconds,
  normalizeAttemptTimeLimitSeconds,
  resolveAttemptSubmissionDurationSeconds,
  type AttemptTimerState,
} from '@/attempts/duration';
import { m } from '@/locale/paraglide/messages';

export {
  buildAttemptStartedAt,
  buildAttemptTimerState,
  normalizeAttemptDurationSeconds,
  normalizeAttemptTimeLimitSeconds,
  resolveAttemptSubmissionDurationSeconds,
  type AttemptTimerState,
};

export const ASSIGNMENT_ATTEMPT_DURATION_UNITS = ATTEMPT_DURATION_UNITS;

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
    normalizedSeconds / ATTEMPT_DURATION_UNITS.secondsPerMinute
  );
  const remainder = normalizedSeconds % ATTEMPT_DURATION_UNITS.secondsPerMinute;
  const paddedSeconds = String(remainder).padStart(
    ATTEMPT_DURATION_UNITS.timerSecondPaddingLength,
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
