import type { ActivityContent, ActivityQuestion } from '@/activities/types';
import {
  buildQuestionOptionTexts,
  normalizeQuestionOptionText,
} from '@/activities/question-options';

export const DEFAULT_QUESTION_CHOICE_COUNT = 4;

export function buildQuestionChoices({
  content,
  question,
  targetCount = DEFAULT_QUESTION_CHOICE_COUNT,
}: {
  content: ActivityContent;
  question: ActivityQuestion;
  targetCount?: number;
}) {
  const explicitOptions = question.options?.map((option) => option.text) ?? [];
  const siblingAnswers = content.questions
    .filter((item) => item.id !== question.id)
    .map((item) => item.answer);
  const candidates = buildQuestionOptionTexts({
    answer: question.answer,
    maxOptions: Number.POSITIVE_INFINITY,
    options: [...explicitOptions, ...siblingAnswers, ...content.vocabulary],
  });
  const distractors = candidates
    .filter(
      (choice) =>
        normalizeQuestionOptionText(choice) !==
        normalizeQuestionOptionText(question.answer)
    )
    .sort(
      (left, right) =>
        stableChoiceRank(question.id, left) -
        stableChoiceRank(question.id, right)
    );

  return buildQuestionOptionTexts({
    answer: question.answer,
    maxOptions: targetCount,
    options: distractors,
  });
}

function stableChoiceRank(seed: string, value: string) {
  const input = `${seed}:${value}`;
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }

  return hash;
}
