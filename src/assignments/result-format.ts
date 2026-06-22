type ResultDateValue = Date | string | null | undefined;

export function formatAssignmentResultDate(
  value: ResultDateValue,
  options?: {
    emptyValue?: string;
    locale?: Intl.LocalesArgument;
    timeZone?: string;
  }
) {
  const emptyValue = options?.emptyValue ?? '-';
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
  value: number,
  options?: {
    emptyValue?: string;
  }
) {
  if (!Number.isFinite(value)) return options?.emptyValue ?? '-';

  return `${Math.round(value)}%`;
}

export function formatAcceptedAnswerAlternatives(
  values: string[],
  options?: {
    emptyValue?: string;
    separator?: string;
  }
) {
  const emptyValue = options?.emptyValue ?? '-';
  if (values.length <= 1) return emptyValue;

  return values.join(options?.separator ?? ', ');
}

export function formatOptionalAcceptedAnswerAlternatives(
  values: string[],
  options?: {
    separator?: string;
  }
) {
  if (values.length <= 1) return null;

  return formatAcceptedAnswerAlternatives(values, options);
}

export function formatAssignmentResultValue(
  value: string | null | undefined,
  options?: {
    emptyValue?: string;
  }
) {
  return value || (options?.emptyValue ?? '-');
}
