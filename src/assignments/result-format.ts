import { getUniqueAcceptedAnswers } from '@/activities/answer-matching';
import { normalizeRuntimeDisplayText } from '@/assignments/runtime-display';
import { m } from '@/locale/paraglide/messages';

type ResultDateValue = Date | string | null | undefined;

export function formatAssignmentResultDate(
  value: ResultDateValue,
  options?: {
    emptyValue?: string;
    locale?: Intl.LocalesArgument;
    timeZone?: string;
  }
) {
  const emptyValue = options?.emptyValue ?? getAssignmentResultEmptyValue();
  if (!value) return emptyValue;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return emptyValue;

  return new Intl.DateTimeFormat(options?.locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: options?.timeZone,
  }).format(date);
}

export function formatAssignmentResultCsvDate(value: ResultDateValue) {
  if (!value) return '';

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toISOString();
}

export function formatAssignmentResultPercent(
  value: number | null | undefined,
  options?: {
    emptyValue?: string;
  }
) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return options?.emptyValue ?? getAssignmentResultEmptyValue();
  }

  return `${Math.round(value)}%`;
}

export function formatAssignmentResultNumber(
  value: number | null | undefined,
  options?: {
    emptyValue?: string;
    min?: number;
  }
) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return options?.emptyValue ?? getAssignmentResultEmptyValue();
  }

  const normalizedValue = Math.floor(
    options?.min === undefined ? value : Math.max(options.min, value)
  );

  return String(normalizedValue);
}

export function formatAcceptedAnswerAlternatives(
  values: string[],
  options?: {
    emptyValue?: string;
    includePrimary?: boolean;
    separator?: string;
  }
) {
  const emptyValue = options?.emptyValue ?? getAssignmentResultEmptyValue();
  const acceptedAnswers = getDisplayAcceptedAnswers(values, {
    includePrimary: options?.includePrimary,
  });
  if (acceptedAnswers.length === 0) return emptyValue;

  return acceptedAnswers.join(
    options?.separator ?? m.assignment_result_accepted_answer_separator()
  );
}

export function formatPrimaryAcceptedAnswer(
  values: string[],
  options?: {
    emptyValue?: string;
  }
) {
  const acceptedAnswers = getUniqueAcceptedAnswers(values);
  return formatAssignmentResultValue(acceptedAnswers[0], {
    emptyValue: options?.emptyValue,
  });
}

export function formatOptionalAcceptedAnswerAlternatives(
  values: string[],
  options?: {
    includePrimary?: boolean;
    separator?: string;
  }
) {
  const acceptedAnswers = getDisplayAcceptedAnswers(values, {
    includePrimary: options?.includePrimary,
  });
  if (acceptedAnswers.length === 0) return null;

  return acceptedAnswers.join(
    options?.separator ?? m.assignment_result_accepted_answer_separator()
  );
}

export function formatAssignmentResultValue(
  value: string | null | undefined,
  options?: {
    emptyValue?: string;
  }
) {
  const normalizedValue = normalizeRuntimeDisplayText(value);
  return (
    normalizedValue || (options?.emptyValue ?? getAssignmentResultEmptyValue())
  );
}

function getAssignmentResultEmptyValue() {
  return m.assignment_result_empty_value();
}

function getDisplayAcceptedAnswers(
  values: string[],
  options?: {
    includePrimary?: boolean;
  }
) {
  const acceptedAnswers = getUniqueAcceptedAnswers(values);
  if (acceptedAnswers.length <= 1) return [];

  return options?.includePrimary === false
    ? acceptedAnswers.slice(1)
    : acceptedAnswers;
}
