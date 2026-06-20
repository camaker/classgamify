import type { ActivityContent, ActivityQuestion } from '@/activities/types';

const DEFAULT_CHOICE_COUNT = 4;

export function buildQuestionChoices({
  content,
  question,
  targetCount = DEFAULT_CHOICE_COUNT,
}: {
  content: ActivityContent;
  question: ActivityQuestion;
  targetCount?: number;
}) {
  const explicitOptions = question.options?.map((option) => option.text) ?? [];
  const siblingAnswers = content.questions
    .filter((item) => item.id !== question.id)
    .map((item) => item.answer);
  const candidates = uniqueChoices([
    question.answer,
    ...explicitOptions,
    ...siblingAnswers,
    ...content.vocabulary,
  ]);
  const distractors = candidates
    .filter(
      (choice) => normalizeChoice(choice) !== normalizeChoice(question.answer)
    )
    .sort(
      (left, right) =>
        stableChoiceRank(question.id, left) -
        stableChoiceRank(question.id, right)
    );

  return uniqueChoices([question.answer, ...distractors]).slice(0, targetCount);
}

function uniqueChoices(values: string[]) {
  const seen = new Set<string>();
  const choices: string[] = [];

  for (const value of values) {
    const choice = value.trim();
    const key = normalizeChoice(choice);
    if (!choice || seen.has(key)) continue;

    seen.add(key);
    choices.push(choice);
  }

  return choices;
}

function normalizeChoice(value: string) {
  return value.normalize('NFKC').trim().toLowerCase();
}

function stableChoiceRank(seed: string, value: string) {
  const input = `${seed}:${value}`;
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }

  return hash;
}
