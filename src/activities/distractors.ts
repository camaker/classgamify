import type { ActivityContent, ActivityQuestion } from '@/activities/types';
import {
  buildQuestionOptionTexts,
  normalizeQuestionOptionDisplayText,
  normalizeQuestionOptionText,
} from '@/activities/question-options';
import { m } from '@/locale/paraglide/messages';

export const DEFAULT_QUESTION_CHOICE_COUNT = 4;

export const QUESTION_CHOICE_GENERATION_HANDOFF_ITEM_IDS = [
  'generation-scope',
  'target-choice-count',
  'question-count',
  'ready-question-count',
  'explicit-ready-count',
  'completed-locally-count',
  'needs-candidates-count',
  'explicit-choice-count',
  'deterministic-choice-count',
  'missing-choice-count',
  'sibling-answer-candidates',
  'vocabulary-candidates',
  'candidate-source-count',
  'answer-coverage-count',
  'missing-answer-count',
  'option-structure',
  'generation-mode',
  'write-target',
  'teacher-review',
  'publish-boundary',
] as const;

export type QuestionChoiceReadinessStatus =
  | 'completed-locally'
  | 'explicit-ready'
  | 'needs-candidates';

export type QuestionChoiceGenerationHandoffItemId =
  (typeof QUESTION_CHOICE_GENERATION_HANDOFF_ITEM_IDS)[number];

export type QuestionChoiceGenerationHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: QuestionChoiceGenerationHandoffItemId;
  label: string;
  value: string;
};

export type QuestionChoiceGenerationHandoffPrivacyContract = {
  appliesBeforeActivitySave: true;
  exposesAnswerText: false;
  exposesOptionText: false;
  exposesQuestionPromptText: false;
  exposesRawAiOutput: false;
  itemIds: QuestionChoiceGenerationHandoffItemId[];
  persistsActivityWithoutTeacherAction: false;
  publishesAssignmentWithoutTeacherAction: false;
  requiresTeacherReview: true;
  scope: 'teacher-reviewed-quiz-choice-generation';
  usesQuestionOptionStructure: true;
  writeTarget: 'ActivityQuestion.options';
};

export type QuestionChoiceGenerationHandoffView = {
  description: string;
  itemViews: QuestionChoiceGenerationHandoffItemView[];
  privacy: QuestionChoiceGenerationHandoffPrivacyContract;
  title: string;
};

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

export function buildQuestionChoiceGenerationHandoffView({
  content,
  summary,
  targetCount = DEFAULT_QUESTION_CHOICE_COUNT,
}: {
  content?: ActivityContent;
  summary?: QuestionChoiceReadinessSummary;
  targetCount?: number;
}): QuestionChoiceGenerationHandoffView {
  const readinessSummary =
    summary ??
    (content
      ? buildQuestionChoiceReadinessSummary({ content, targetCount })
      : createEmptyQuestionChoiceReadinessSummary(targetCount));
  const generationSummary =
    buildQuestionChoiceGenerationHandoffSummary(readinessSummary);
  const itemViews = QUESTION_CHOICE_GENERATION_HANDOFF_ITEM_IDS.map((id) =>
    buildQuestionChoiceGenerationHandoffItemView(
      buildQuestionChoiceGenerationHandoffItem({
        id,
        summary: generationSummary,
      })
    )
  );

  return {
    description: m.question_choice_generation_handoff_description(),
    itemViews,
    privacy: buildQuestionChoiceGenerationHandoffPrivacyContract(itemViews),
    title: m.question_choice_generation_handoff_title(),
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

type QuestionChoiceGenerationHandoffSummary = {
  answerCoverageCount: number;
  candidateSourceCount: number;
  completedLocallyCount: number;
  deterministicChoiceCount: number;
  explicitChoiceCount: number;
  explicitReadyCount: number;
  itemCount: number;
  missingAnswerCount: number;
  missingChoiceCount: number;
  needsCandidateCount: number;
  readyCount: number;
  siblingAnswerCandidateCount: number;
  targetCount: number;
  vocabularyCandidateCount: number;
};

function createEmptyQuestionChoiceReadinessSummary(
  targetCount: number
): QuestionChoiceReadinessSummary {
  return {
    completedLocallyCount: 0,
    explicitReadyCount: 0,
    itemCount: 0,
    items: [],
    needsCandidateCount: 0,
    readyCount: 0,
    targetCount: normalizeQuestionChoiceReadinessTargetCount(targetCount),
  };
}

function buildQuestionChoiceGenerationHandoffSummary(
  summary: QuestionChoiceReadinessSummary
): QuestionChoiceGenerationHandoffSummary {
  const answerCoverageCount = summary.items.filter(
    (item) => item.answerIncluded
  ).length;

  return {
    answerCoverageCount,
    candidateSourceCount: sumQuestionChoiceReadinessItems(
      summary.items,
      (item) => item.candidateChoiceCount
    ),
    completedLocallyCount: summary.completedLocallyCount,
    deterministicChoiceCount: sumQuestionChoiceReadinessItems(
      summary.items,
      (item) => item.deterministicChoiceCount
    ),
    explicitChoiceCount: sumQuestionChoiceReadinessItems(
      summary.items,
      (item) => item.explicitChoiceCount
    ),
    explicitReadyCount: summary.explicitReadyCount,
    itemCount: summary.itemCount,
    missingAnswerCount: Math.max(0, summary.itemCount - answerCoverageCount),
    missingChoiceCount: sumQuestionChoiceReadinessItems(
      summary.items,
      (item) => item.missingChoiceCount
    ),
    needsCandidateCount: summary.needsCandidateCount,
    readyCount: summary.readyCount,
    siblingAnswerCandidateCount: sumQuestionChoiceReadinessItems(
      summary.items,
      (item) => item.siblingAnswerCandidateCount
    ),
    targetCount: summary.targetCount,
    vocabularyCandidateCount: sumQuestionChoiceReadinessItems(
      summary.items,
      (item) => item.vocabularyCandidateCount
    ),
  };
}

function buildQuestionChoiceGenerationHandoffItem({
  id,
  summary,
}: {
  id: QuestionChoiceGenerationHandoffItemId;
  summary: QuestionChoiceGenerationHandoffSummary;
}): Omit<QuestionChoiceGenerationHandoffItemView, 'ariaLabel'> {
  switch (id) {
    case 'generation-scope':
      return {
        description:
          m.question_choice_generation_handoff_generation_scope_description(),
        id,
        label: m.question_choice_generation_handoff_generation_scope_label(),
        value: m.question_choice_generation_handoff_generation_scope_value(),
      };
    case 'target-choice-count':
      return {
        description:
          m.question_choice_generation_handoff_target_choice_count_description(),
        id,
        label: m.question_choice_generation_handoff_target_choice_count_label(),
        value: String(summary.targetCount),
      };
    case 'question-count':
      return {
        description:
          m.question_choice_generation_handoff_question_count_description(),
        id,
        label: m.question_choice_generation_handoff_question_count_label(),
        value: String(summary.itemCount),
      };
    case 'ready-question-count':
      return {
        description:
          m.question_choice_generation_handoff_ready_question_count_description(),
        id,
        label:
          m.question_choice_generation_handoff_ready_question_count_label(),
        value: String(summary.readyCount),
      };
    case 'explicit-ready-count':
      return {
        description:
          m.question_choice_generation_handoff_explicit_ready_count_description(),
        id,
        label:
          m.question_choice_generation_handoff_explicit_ready_count_label(),
        value: String(summary.explicitReadyCount),
      };
    case 'completed-locally-count':
      return {
        description:
          m.question_choice_generation_handoff_completed_locally_count_description(),
        id,
        label:
          m.question_choice_generation_handoff_completed_locally_count_label(),
        value: String(summary.completedLocallyCount),
      };
    case 'needs-candidates-count':
      return {
        description:
          m.question_choice_generation_handoff_needs_candidates_count_description(),
        id,
        label:
          m.question_choice_generation_handoff_needs_candidates_count_label(),
        value: String(summary.needsCandidateCount),
      };
    case 'explicit-choice-count':
      return {
        description:
          m.question_choice_generation_handoff_explicit_choice_count_description(),
        id,
        label:
          m.question_choice_generation_handoff_explicit_choice_count_label(),
        value: String(summary.explicitChoiceCount),
      };
    case 'deterministic-choice-count':
      return {
        description:
          m.question_choice_generation_handoff_deterministic_choice_count_description(),
        id,
        label:
          m.question_choice_generation_handoff_deterministic_choice_count_label(),
        value: String(summary.deterministicChoiceCount),
      };
    case 'missing-choice-count':
      return {
        description:
          m.question_choice_generation_handoff_missing_choice_count_description(),
        id,
        label:
          m.question_choice_generation_handoff_missing_choice_count_label(),
        value: String(summary.missingChoiceCount),
      };
    case 'sibling-answer-candidates':
      return {
        description:
          m.question_choice_generation_handoff_sibling_answer_candidates_description(),
        id,
        label:
          m.question_choice_generation_handoff_sibling_answer_candidates_label(),
        value: String(summary.siblingAnswerCandidateCount),
      };
    case 'vocabulary-candidates':
      return {
        description:
          m.question_choice_generation_handoff_vocabulary_candidates_description(),
        id,
        label:
          m.question_choice_generation_handoff_vocabulary_candidates_label(),
        value: String(summary.vocabularyCandidateCount),
      };
    case 'candidate-source-count':
      return {
        description:
          m.question_choice_generation_handoff_candidate_source_count_description(),
        id,
        label:
          m.question_choice_generation_handoff_candidate_source_count_label(),
        value: String(summary.candidateSourceCount),
      };
    case 'answer-coverage-count':
      return {
        description:
          m.question_choice_generation_handoff_answer_coverage_count_description(),
        id,
        label:
          m.question_choice_generation_handoff_answer_coverage_count_label(),
        value: String(summary.answerCoverageCount),
      };
    case 'missing-answer-count':
      return {
        description:
          m.question_choice_generation_handoff_missing_answer_count_description(),
        id,
        label:
          m.question_choice_generation_handoff_missing_answer_count_label(),
        value: String(summary.missingAnswerCount),
      };
    case 'option-structure':
      return {
        description:
          m.question_choice_generation_handoff_option_structure_description(),
        id,
        label: m.question_choice_generation_handoff_option_structure_label(),
        value: m.question_choice_generation_handoff_option_structure_value(),
      };
    case 'generation-mode':
      return {
        description:
          m.question_choice_generation_handoff_generation_mode_description(),
        id,
        label: m.question_choice_generation_handoff_generation_mode_label(),
        value: m.question_choice_generation_handoff_generation_mode_value(),
      };
    case 'write-target':
      return {
        description:
          m.question_choice_generation_handoff_write_target_description(),
        id,
        label: m.question_choice_generation_handoff_write_target_label(),
        value: m.question_choice_generation_handoff_write_target_value(),
      };
    case 'teacher-review':
      return {
        description:
          m.question_choice_generation_handoff_teacher_review_description(),
        id,
        label: m.question_choice_generation_handoff_teacher_review_label(),
        value: m.question_choice_generation_handoff_teacher_review_value(),
      };
    case 'publish-boundary':
      return {
        description:
          m.question_choice_generation_handoff_publish_boundary_description(),
        id,
        label: m.question_choice_generation_handoff_publish_boundary_label(),
        value: m.question_choice_generation_handoff_publish_boundary_value(),
      };
  }
}

function buildQuestionChoiceGenerationHandoffItemView({
  description,
  id,
  label,
  value,
}: Omit<
  QuestionChoiceGenerationHandoffItemView,
  'ariaLabel'
>): QuestionChoiceGenerationHandoffItemView {
  return {
    ariaLabel: m.question_choice_generation_handoff_item_aria({
      description,
      label,
      value,
    }),
    description,
    id,
    label,
    value,
  };
}

function buildQuestionChoiceGenerationHandoffPrivacyContract(
  itemViews: QuestionChoiceGenerationHandoffItemView[]
): QuestionChoiceGenerationHandoffPrivacyContract {
  return {
    appliesBeforeActivitySave: true,
    exposesAnswerText: false,
    exposesOptionText: false,
    exposesQuestionPromptText: false,
    exposesRawAiOutput: false,
    itemIds: itemViews.map((itemView) => itemView.id),
    persistsActivityWithoutTeacherAction: false,
    publishesAssignmentWithoutTeacherAction: false,
    requiresTeacherReview: true,
    scope: 'teacher-reviewed-quiz-choice-generation',
    usesQuestionOptionStructure: true,
    writeTarget: 'ActivityQuestion.options',
  };
}

function sumQuestionChoiceReadinessItems(
  items: QuestionChoiceReadinessItem[],
  getValue: (item: QuestionChoiceReadinessItem) => number
) {
  return items.reduce((total, item) => total + getValue(item), 0);
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
