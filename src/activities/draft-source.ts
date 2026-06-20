import type { CreateActivityInput } from '@/activities/validation';

export const DEFAULT_ACTIVITY_DRAFT_SOURCE =
  'apple, bread, milk, rice, water, egg';

export function getActivityDraftSourceText(values: CreateActivityInput) {
  return (
    values.sourceSummary?.trim() ||
    values.vocabularyText?.trim() ||
    values.questionsText?.trim() ||
    DEFAULT_ACTIVITY_DRAFT_SOURCE
  );
}
