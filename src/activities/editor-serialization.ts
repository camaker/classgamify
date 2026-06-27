import type {
  ActivityGroup,
  ActivityPair,
  ActivityQuestion,
} from '@/activities/types';
import { buildQuestionOptionTexts } from '@/activities/question-options';

const EDITOR_INLINE_LIST_SEPARATOR = ', ';
const EDITOR_ROW_SEPARATOR = ' | ';

export function formatEditorInlineList(values: string[]) {
  return values
    .map((value) => value.trim())
    .filter(Boolean)
    .join(EDITOR_INLINE_LIST_SEPARATOR);
}

export function formatEditorLineList(values: string[]) {
  return values
    .map((value) => value.trim())
    .filter(Boolean)
    .join('\n');
}

export function formatEditorGroupRow(
  group: Pick<ActivityGroup, 'items' | 'label'>
) {
  return formatEditorRow([group.label, formatEditorInlineList(group.items)]);
}

export function formatEditorGroupRows(
  groups: Array<Pick<ActivityGroup, 'items' | 'label'>>
) {
  return formatEditorLineList(groups.map(formatEditorGroupRow));
}

export function formatEditorPairRow(
  pair: Pick<ActivityPair, 'left' | 'right'>
) {
  return formatEditorRow([pair.left, pair.right]);
}

export function formatEditorPairRows(
  pairs: Array<Pick<ActivityPair, 'left' | 'right'>>
) {
  return formatEditorLineList(pairs.map(formatEditorPairRow));
}

export function formatEditorQuestionRow(
  question: Pick<
    ActivityQuestion,
    'answer' | 'explanation' | 'options' | 'prompt'
  >
) {
  const options = buildQuestionOptionTexts({
    answer: question.answer,
    options: question.options?.map((option) => option.text),
  });

  return formatEditorRow([
    question.prompt,
    question.answer,
    formatEditorInlineList(options),
    question.explanation,
  ]);
}

export function formatEditorQuestionRows(
  questions: Array<
    Pick<ActivityQuestion, 'answer' | 'explanation' | 'options' | 'prompt'>
  >
) {
  return formatEditorLineList(questions.map(formatEditorQuestionRow));
}

function formatEditorRow(values: Array<string | undefined>) {
  return values
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(EDITOR_ROW_SEPARATOR);
}
