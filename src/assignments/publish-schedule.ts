import { normalizeRuntimeDisplayText } from '@/assignments/runtime-display';

export const ASSIGNMENT_PUBLISH_CLOSE_AFTER_UNITS = {
  minLeadMinutes: 1,
  millisecondsPerSecond: 1000,
  secondsPerMinute: 60,
} as const;

export type AssignmentPublishCloseAfterStatus =
  | 'invalid'
  | 'none'
  | 'past'
  | 'ready';

export type AssignmentPublishCloseAfterResolution = {
  expiresAt: Date | null;
  status: AssignmentPublishCloseAfterStatus;
};

export function formatAssignmentDateTimeLocal(date: Date) {
  const localDate = new Date(
    date.getTime() -
      date.getTimezoneOffset() *
        ASSIGNMENT_PUBLISH_CLOSE_AFTER_UNITS.secondsPerMinute *
        ASSIGNMENT_PUBLISH_CLOSE_AFTER_UNITS.millisecondsPerSecond
  );
  return localDate.toISOString().slice(0, 16);
}

export function buildAssignmentPublishCloseAfterMinLocal(now = new Date()) {
  return formatAssignmentDateTimeLocal(
    new Date(
      now.getTime() +
        ASSIGNMENT_PUBLISH_CLOSE_AFTER_UNITS.minLeadMinutes *
          ASSIGNMENT_PUBLISH_CLOSE_AFTER_UNITS.secondsPerMinute *
          ASSIGNMENT_PUBLISH_CLOSE_AFTER_UNITS.millisecondsPerSecond
    )
  );
}

export function parseAssignmentDateTimeLocal(value: string) {
  const trimmed = normalizeScheduleText(value);
  if (!trimmed) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(
    trimmed
  );
  if (!match) return null;

  const [, year, month, day, hour, minute, second = '0'] = match;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  );
  if (Number.isNaN(date.getTime())) return null;

  return date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day) &&
    date.getHours() === Number(hour) &&
    date.getMinutes() === Number(minute) &&
    date.getSeconds() === Number(second)
    ? date
    : null;
}

export function resolveAssignmentPublishCloseAfterDate({
  expiresAt,
  now = new Date(),
}: {
  expiresAt?: Date | null;
  now?: Date;
}): AssignmentPublishCloseAfterResolution {
  if (!expiresAt) {
    return {
      expiresAt: null,
      status: 'none',
    };
  }

  if (Number.isNaN(expiresAt.getTime())) {
    return {
      expiresAt: null,
      status: 'invalid',
    };
  }

  return {
    expiresAt,
    status: expiresAt.getTime() <= now.getTime() ? 'past' : 'ready',
  };
}

export function resolveAssignmentPublishCloseAfterLocal({
  now,
  value,
}: {
  now?: Date;
  value: string;
}): AssignmentPublishCloseAfterResolution {
  if (!normalizeScheduleText(value)) {
    return resolveAssignmentPublishCloseAfterDate({ expiresAt: null, now });
  }

  const expiresAt = parseAssignmentDateTimeLocal(value);
  if (!expiresAt) {
    return {
      expiresAt: null,
      status: 'invalid',
    };
  }

  return resolveAssignmentPublishCloseAfterDate({ expiresAt, now });
}

export function resolveAssignmentPublishCloseAfterIso({
  now,
  value,
}: {
  now?: Date;
  value?: string;
}): AssignmentPublishCloseAfterResolution {
  if (!value) {
    return resolveAssignmentPublishCloseAfterDate({ expiresAt: null, now });
  }

  return resolveAssignmentPublishCloseAfterDate({
    expiresAt: new Date(value),
    now,
  });
}

function normalizeScheduleText(value: string) {
  return normalizeRuntimeDisplayText(value);
}
