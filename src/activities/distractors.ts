import type { ActivityContent, ActivityQuestion } from '@/activities/types';
import {
  buildQuestionOptionTexts,
  normalizeQuestionOptionDisplayText,
  normalizeQuestionOptionText,
} from '@/activities/question-options';

export const DEFAULT_QUESTION_CHOICE_COUNT = 4;

export type QuestionChoiceReadinessStatus =
  | 'completed-locally'
  | 'explicit-ready'
  | 'needs-candidates';

export type QuestionChoiceReadinessItem = {
  answerIncluded: boolean;
  candidateChoiceCount: number;
  completedChoiceCount: number;
  deterministicChoiceCount: number;
  explicitAnswerIncluded: boolean;
  explicitChoiceCount: number;
  missingChoiceCount: number;
  prompt: string;
  questionId: string;
  siblingAnswerCandidateCount: number;
  status: QuestionChoiceReadinessStatus;
  targetCount: number;
  vocabularyCandidateCount: number;
};

export type QuestionChoiceReadinessSummary = {
  completedLocallyCount: number;
  explicitReadyCount: number;
  itemCount: number;
  items: QuestionChoiceReadinessItem[];
  needsCandidateCount: number;
  readyCount: number;
  targetCount: number;
};

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
  const explicitChoices = buildQuestionOptionTexts({
    answer: question.answer,
    maxOptions: targetCount,
    options: explicitOptions,
  });

  if (explicitChoices.length >= targetCount) {
    return explicitChoices;
  }

  const distractors = buildQuestionDistractorCandidateSources({
    content,
    explicitChoices,
    question,
  }).allChoices.sort(
    (left, right) =>
      stableChoiceRank(question.id, left) - stableChoiceRank(question.id, right)
  );

  return buildQuestionOptionTexts({
    answer: question.answer,
    maxOptions: targetCount,
    options: [...explicitChoices, ...distractors],
  });
}

export function buildQuestionChoiceReadiness({
  content,
  targetCount = DEFAULT_QUESTION_CHOICE_COUNT,
}: {
  content: ActivityContent;
  targetCount?: number;
}) {
  const normalizedTargetCount =
    normalizeQuestionChoiceReadinessTargetCount(targetCount);

  return content.questions.map((question) =>
    buildQuestionChoiceReadinessItem({
      content,
      question,
      targetCount: normalizedTargetCount,
    })
  );
}

export function buildQuestionChoiceReadinessSummary({
  content,
  targetCount = DEFAULT_QUESTION_CHOICE_COUNT,
}: {
  content: ActivityContent;
  targetCount?: number;
}): QuestionChoiceReadinessSummary {
  const normalizedTargetCount =
    normalizeQuestionChoiceReadinessTargetCount(targetCount);
  const items = buildQuestionChoiceReadiness({
    content,
    targetCount: normalizedTargetCount,
  });
  const explicitReadyCount = items.filter(
    (item) => item.status === 'explicit-ready'
  ).length;
  const completedLocallyCount = items.filter(
    (item) => item.status === 'completed-locally'
  ).length;
  const needsCandidateCount = items.filter(
    (item) => item.status === 'needs-candidates'
  ).length;

  return {
    completedLocallyCount,
    explicitReadyCount,
    itemCount: items.length,
    items,
    needsCandidateCount,
    readyCount: explicitReadyCount + completedLocallyCount,
    targetCount: normalizedTargetCount,
  };
}

function buildQuestionChoiceReadinessItem({
  content,
  question,
  targetCount,
}: {
  content: ActivityContent;
  question: ActivityQuestion;
  targetCount: number;
}): QuestionChoiceReadinessItem {
  const explicitChoices = buildExplicitQuestionChoices({
    question,
    targetCount,
  });
  const completedChoices = buildQuestionChoices({
    content,
    question,
    targetCount,
  });
  const candidateSources = buildQuestionDistractorCandidateSources({
    content,
    explicitChoices,
    question,
  });
  const explicitChoiceCount = explicitChoices.length;
  const completedChoiceCount = completedChoices.length;
  const deterministicChoiceCount = Math.max(
    0,
    completedChoiceCount - explicitChoiceCount
  );
  const missingChoiceCount = Math.max(0, targetCount - completedChoiceCount);

  return {
    answerIncluded: hasNormalizedAnswerChoice(question, completedChoices),
    candidateChoiceCount: candidateSources.allChoices.length,
    completedChoiceCount,
    deterministicChoiceCount,
    explicitAnswerIncluded: hasNormalizedAnswerChoice(
      question,
      explicitChoices
    ),
    explicitChoiceCount,
    missingChoiceCount,
    prompt: normalizeQuestionOptionDisplayText(question.prompt),
    questionId: question.id,
    siblingAnswerCandidateCount: candidateSources.siblingAnswerChoices.length,
    status: getQuestionChoiceReadinessStatus({
      completedChoiceCount,
      explicitChoiceCount,
      targetCount,
    }),
    targetCount,
    vocabularyCandidateCount: candidateSources.vocabularyChoices.length,
  };
}

function buildExplicitQuestionChoices({
  question,
  targetCount,
}: {
  question: ActivityQuestion;
  targetCount: number;
}) {
  return buildQuestionOptionTexts({
    answer: question.answer,
    maxOptions: targetCount,
    options: question.options?.map((option) => option.text) ?? [],
  });
}

function buildQuestionDistractorCandidateSources({
  content,
  explicitChoices,
  question,
}: {
  content: ActivityContent;
  explicitChoices: string[];
  question: ActivityQuestion;
}) {
  const seenKeys = new Set(explicitChoices.map(normalizeQuestionOptionText));
  const answerKey = normalizeQuestionOptionText(question.answer);

  if (answerKey) {
    seenKeys.add(answerKey);
  }

  const siblingAnswerChoices = collectQuestionDistractorCandidates({
    seenKeys,
    values: content.questions
      .filter((item) => item.id !== question.id)
      .map((item) => item.answer),
  });
  const vocabularyChoices = collectQuestionDistractorCandidates({
    seenKeys,
    values: content.vocabulary,
  });

  return {
    allChoices: [...siblingAnswerChoices, ...vocabularyChoices],
    siblingAnswerChoices,
    vocabularyChoices,
  };
}

function collectQuestionDistractorCandidates({
  seenKeys,
  values,
}: {
  seenKeys: Set<string>;
  values: string[];
}) {
  const choices: string[] = [];

  for (const value of values) {
    const choice = normalizeQuestionOptionDisplayText(value);
    const key = normalizeQuestionOptionText(choice);

    if (!choice || seenKeys.has(key)) continue;

    seenKeys.add(key);
    choices.push(choice);
  }

  return choices;
}

function hasNormalizedAnswerChoice(
  question: ActivityQuestion,
  choices: string[]
) {
  const answerKey = normalizeQuestionOptionText(question.answer);

  return (
    answerKey.length > 0 &&
    choices.some((choice) => normalizeQuestionOptionText(choice) === answerKey)
  );
}

function getQuestionChoiceReadinessStatus({
  completedChoiceCount,
  explicitChoiceCount,
  targetCount,
}: {
  completedChoiceCount: number;
  explicitChoiceCount: number;
  targetCount: number;
}): QuestionChoiceReadinessStatus {
  if (explicitChoiceCount >= targetCount) {
    return 'explicit-ready';
  }

  if (completedChoiceCount >= targetCount) {
    return 'completed-locally';
  }

  return 'needs-candidates';
}

function normalizeQuestionChoiceReadinessTargetCount(targetCount: number) {
  if (!Number.isFinite(targetCount)) {
    return DEFAULT_QUESTION_CHOICE_COUNT;
  }

  return Math.max(1, Math.floor(targetCount));
}

function stableChoiceRank(seed: string, value: string) {
  const input = `${seed}:${value}`;
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }

  return hash;
}
