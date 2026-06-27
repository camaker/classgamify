import { getAcceptedAnswers } from '@/activities/answer-matching';

export function normalizeRuntimeDisplayText(value: string | null | undefined) {
  return (value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim();
}

export function hasRuntimeDisplayText(value: string | null | undefined) {
  return normalizeRuntimeDisplayText(value).length > 0;
}

export function normalizeOptionalRuntimeDisplayText(
  value: string | null | undefined
) {
  const normalized = normalizeRuntimeDisplayText(value);
  return normalized || undefined;
}

export function normalizeRuntimeDisplayCount(
  value: number,
  options?: {
    max?: number;
    min?: number;
  }
) {
  const min = options?.min ?? 0;
  const max = options?.max;
  const normalized = Number.isFinite(value) ? Math.floor(value) : min;
  const bounded = Math.max(min, normalized);

  return max === undefined ? bounded : Math.min(max, bounded);
}

export function normalizeRuntimeChoiceList(
  values: readonly string[] | undefined
) {
  return normalizeRuntimeDisplayList(values);
}

export function normalizeRuntimeDisplayList(
  values: readonly string[] | undefined
) {
  const choicesByKey = new Map<string, string>();

  for (const value of values ?? []) {
    const choice = normalizeRuntimeDisplayText(value);
    const choiceKey = getRuntimeChoiceDisplayKey(choice);
    if (!choiceKey || choicesByKey.has(choiceKey)) continue;

    choicesByKey.set(choiceKey, choice);
  }

  const choices = [...choicesByKey.values()];
  return choices.length > 0 ? choices : undefined;
}

export function getRuntimeDisplayAcceptedAnswers(answer: string) {
  return (
    normalizeRuntimeDisplayList(getAcceptedAnswers(answer)) ??
    [normalizeRuntimeDisplayText(answer)].filter(Boolean)
  );
}

export function getRuntimeChoiceDisplayKey(value: string | undefined) {
  return normalizeRuntimeDisplayText(value).toLocaleLowerCase();
}
