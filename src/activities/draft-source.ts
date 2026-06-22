import type { CreateActivityInput } from '@/activities/validation';

export const DEFAULT_ACTIVITY_DRAFT_SOURCE =
  'apple, bread, milk, rice, water, egg';
export const ACTIVITY_DRAFT_SOURCE_MAX_LENGTH = 2000;

const ACTIVITY_DRAFT_SOURCE_FIELDS = [
  'sourceSummary',
  'vocabularyText',
  'questionsText',
  'pairsText',
  'groupsText',
  'teacherNotesText',
] as const satisfies ReadonlyArray<keyof CreateActivityInput>;

export function getActivityDraftSourceText(values: CreateActivityInput) {
  const sourceText = buildActivityDraftSourceText(
    ACTIVITY_DRAFT_SOURCE_FIELDS.map((field) => values[field])
  );

  return sourceText || DEFAULT_ACTIVITY_DRAFT_SOURCE;
}

function buildActivityDraftSourceText(values: Array<string | undefined>) {
  const parts = unique(
    values.map((value) => value?.trim() ?? '').filter(Boolean)
  );

  return limitActivityDraftSourceText(parts);
}

function limitActivityDraftSourceText(parts: string[]) {
  let sourceText = '';

  for (const part of parts) {
    const separator = sourceText ? '\n\n' : '';
    const next = `${sourceText}${separator}${part}`;

    if (next.length <= ACTIVITY_DRAFT_SOURCE_MAX_LENGTH) {
      sourceText = next;
      continue;
    }

    const remainingLength =
      ACTIVITY_DRAFT_SOURCE_MAX_LENGTH - sourceText.length - separator.length;
    if (remainingLength <= 3) break;

    sourceText = `${sourceText}${separator}${part
      .slice(0, remainingLength - 3)
      .trimEnd()}...`;
    break;
  }

  return sourceText;
}

function unique(values: string[]) {
  return [...new Set(values)];
}
