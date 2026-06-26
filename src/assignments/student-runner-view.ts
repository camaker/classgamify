import type { AssignmentSettings } from '@/activities/types';
import type { AssignmentDate } from '@/assignments/lifecycle';
import {
  buildPublicAssignmentRuleSummaryFromSettings,
  type PublicAssignmentRuleSummaryItem,
} from '@/assignments/delivery-summary';
import {
  formatRuntimeItemKindLabel,
  formatRuntimeItemPrompt,
} from '@/activities/runtime';
import {
  buildPublicAttemptReviewItemMap,
  type PublicAttemptReviewItem,
  type PublicRuntimeItem,
} from '@/assignments/public';
import { formatOptionalAcceptedAnswerAlternatives } from '@/assignments/result-format';
import {
  formatAttemptCompletionProgressLabel,
  getAttemptCompletionSummary,
  getStudentRunnerCopy,
  isStudentAnswerFilled,
  type StudentAnswerMap,
} from '@/assignments/student-submission';
import { m } from '@/locale/paraglide/messages';

type StudentRunnerReviewStatus = 'correct' | 'idle' | 'needs-review';

export type { StudentRunnerReviewStatus };

type RuntimeChoiceAnswerChange = {
  answer: string;
  itemId: string;
};

type RuntimeChoiceButtonView = {
  choice: string;
  selected: boolean;
};

type DefaultRuntimeItemCardView = ReturnType<
  typeof buildStudentRunnerView
>['itemViews'][number] & {
  choiceViews: RuntimeChoiceButtonView[];
  correctAnswerLabel: string;
  inputPlaceholder: string;
  showChoices: boolean;
};

type ChoicePairingRunnerView = ReturnType<typeof buildStudentRunnerView> & {
  choiceViews: ReturnType<typeof buildRuntimeChoiceViews>;
  promptItemViews: ChoicePairingPromptItemView[];
};

type ChoicePairingPromptItemView = ReturnType<
  typeof buildStudentRunnerView
>['itemViews'][number] & {
  promptLabel: string;
  selected: boolean;
};

type GroupSortRunnerView = ReturnType<typeof buildStudentRunnerView> & {
  groupViews: Array<{
    group: string;
    placedItemViews: ReturnType<typeof buildStudentRunnerView>['itemViews'];
  }>;
  selectedItem?: PublicRuntimeItem;
  unplacedItemViews: ReturnType<typeof buildStudentRunnerView>['itemViews'];
};

type InlineBlankPromptView =
  | {
      after: string;
      before: string;
      mode: 'inline';
    }
  | {
      mode: 'standalone';
      prompt: string;
    };

type FillBlankWorksheetItemView = ReturnType<
  typeof buildStudentRunnerView
>['itemViews'][number] & {
  promptView: InlineBlankPromptView;
  sequenceLabel: string;
  wordBankText: string | null;
};

type FillBlankWorksheetView = ReturnType<typeof buildStudentRunnerView> & {
  fillBlankItemViews: FillBlankWorksheetItemView[];
};

type PublicAnswerFeedbackView = {
  acceptedAnswersLabel: string;
  acceptedAnswersText: string | null;
  correctAnswer: string;
  correctAnswerLabel: string;
  explanation: string | null;
  explanationLabel: string;
  status: 'correct' | 'needs-review';
  statusLabel: string;
};

type StudentRunnerInstructionView = {
  label: string;
  value: string;
};

type StudentRunnerHeaderView = {
  description: string;
  instructions?: StudentRunnerInstructionView;
  ruleItems: PublicAssignmentRuleSummaryItem[];
  teacherActionLabel: string;
  title: string;
};

type StudentRunnerHeaderAssignment = {
  expiresAt: AssignmentDate;
  settings: AssignmentSettings;
  title: string;
};

export function buildStudentRunnerHeaderView({
  assignment,
  itemCount,
}: {
  assignment: StudentRunnerHeaderAssignment;
  itemCount: number;
}): StudentRunnerHeaderView {
  return {
    description: getStudentRunnerCopy().publicAssignmentDescription,
    instructions: buildStudentRunnerInstructionView(
      assignment.settings.instructions
    ),
    ruleItems: buildPublicAssignmentRuleSummaryFromSettings({
      expiresAt: assignment.expiresAt ?? null,
      itemCount,
      settings: assignment.settings,
    }),
    teacherActionLabel: getStudentRunnerCopy().teacherViewLabel,
    title: assignment.title,
  };
}

function buildStudentRunnerInstructionView(
  instructions: string | undefined
): StudentRunnerInstructionView | undefined {
  const value = instructions?.trim();
  if (!value) return undefined;

  return {
    label: m.assignment_delivery_label_instructions(),
    value,
  };
}

export function buildStudentRunnerView({
  answers,
  items,
  progressVerb,
  reviewItems,
}: {
  answers: StudentAnswerMap;
  items: PublicRuntimeItem[];
  progressVerb?: string;
  reviewItems?: PublicAttemptReviewItem[];
}) {
  const completionSummary = getAttemptCompletionSummary({
    answers,
    runtimeItems: items,
  });
  const reviewByItemId = buildPublicAttemptReviewItemMap(reviewItems);
  const itemViews = items.map((item, index) => {
    const answer = answers[item.id] ?? '';
    const reviewItem = reviewByItemId.get(item.id);
    const prompt = formatRuntimeItemPrompt(item);

    return {
      answer,
      answered: isStudentAnswerFilled(answer),
      item,
      kindLabel: formatRuntimeItemKindLabel(item),
      positionLabel: `${index + 1}. ${prompt}`,
      prompt,
      reviewItem,
      status: getStudentRunnerReviewStatus(reviewItem),
    };
  });

  return {
    choices: getUniqueRuntimeChoices(items),
    completionSummary,
    itemViews,
    itemViewsById: new Map(
      itemViews.map((itemView) => [itemView.item.id, itemView])
    ),
    progressLabel: formatAttemptCompletionProgressLabel({
      completionSummary,
      verb: progressVerb,
    }),
  };
}

export function buildSequentialRunnerView<
  TItemView extends { item: { id: string } },
>({
  activeItemId,
  itemLabel,
  itemViews,
}: {
  activeItemId?: string;
  itemLabel: string;
  itemViews: TItemView[];
}) {
  const sequencedItemViews = itemViews.map((itemView, index) => ({
    ...itemView,
    sequenceLabel: formatSequentialRunnerItemLabel(itemLabel, index),
  }));
  const activeIndex = Math.max(
    0,
    sequencedItemViews.findIndex(
      (itemView) => itemView.item.id === activeItemId
    )
  );
  const activeItemView =
    sequencedItemViews[activeIndex] ?? sequencedItemViews[0];

  return {
    activeIndex,
    activeItem: activeItemView?.item,
    activeItemView,
    activeLabel: formatSequentialRunnerItemLabel(itemLabel, activeIndex),
    itemViews: sequencedItemViews,
  };
}

export function buildSequentialStudentRunnerView({
  activeItemId,
  answers,
  itemLabel,
  items,
  progressVerb,
  reviewItems,
}: {
  activeItemId?: string;
  answers: StudentAnswerMap;
  itemLabel: string;
  items: PublicRuntimeItem[];
  progressVerb?: string;
  reviewItems?: PublicAttemptReviewItem[];
}) {
  const runnerView = buildStudentRunnerView({
    answers,
    items,
    progressVerb,
    reviewItems,
  });
  const sequenceView = buildSequentialRunnerView({
    activeItemId,
    itemLabel,
    itemViews: runnerView.itemViews,
  });
  const activeItemView = sequenceView.activeItemView;

  return {
    ...runnerView,
    activeItem: sequenceView.activeItem,
    activeAnswer: activeItemView?.answer ?? '',
    activeChoiceViews: buildRuntimeChoiceButtonViews({
      answer: activeItemView?.answer ?? '',
      choices: activeItemView?.item.choices ?? [],
    }),
    activeItemView,
    activeReviewItem: activeItemView?.reviewItem,
    sequenceView,
  };
}

export function getSequentialRunnerItemIdByOffset({
  activeIndex,
  itemIds,
  offset,
}: {
  activeIndex: number;
  itemIds: string[];
  offset: number;
}) {
  if (itemIds.length === 0) return undefined;

  const resolvedActiveIndex = Number.isFinite(activeIndex)
    ? Math.trunc(activeIndex)
    : 0;
  const resolvedOffset = Number.isFinite(offset) ? Math.trunc(offset) : 0;
  const normalizedActiveIndex = Math.min(
    itemIds.length - 1,
    Math.max(0, resolvedActiveIndex)
  );
  const nextIndex =
    (normalizedActiveIndex + resolvedOffset + itemIds.length) % itemIds.length;

  return itemIds[nextIndex];
}

export function formatSequentialRunnerItemLabel(label: string, index: number) {
  const normalizedLabel =
    label.trim() || m.student_runner_sequential_default_item_label();
  return m.student_runner_sequential_item_label({
    index: Math.max(0, index) + 1,
    label: normalizedLabel,
  });
}

export function getUniqueRuntimeChoices(items: PublicRuntimeItem[]) {
  const choicesByKey = new Map<string, string>();

  for (const item of items) {
    for (const choice of item.choices ?? []) {
      const normalizedChoice = normalizeRuntimeChoiceDisplayText(choice);
      const choiceKey = getRuntimeChoiceKey(normalizedChoice);
      if (!choiceKey || choicesByKey.has(choiceKey)) continue;

      choicesByKey.set(choiceKey, normalizedChoice);
    }
  }

  return [...choicesByKey.values()];
}

export function findChoiceOwner(answers: StudentAnswerMap, choice: string) {
  const choiceKey = getRuntimeChoiceKey(choice);
  if (!choiceKey) return undefined;

  return Object.entries(answers).find(([, answer]) =>
    isSameRuntimeChoice(answer, choice)
  )?.[0];
}

export function isSameRuntimeChoice(
  left: string | undefined,
  right: string | undefined
) {
  const leftKey = getRuntimeChoiceKey(left);
  if (!leftKey) return false;

  return leftKey === getRuntimeChoiceKey(right);
}

export function buildRuntimeChoiceViews({
  answers,
  choices,
  selectedItemId,
}: {
  answers: StudentAnswerMap;
  choices: string[];
  selectedItemId?: string;
}) {
  return choices.map((choice) => ({
    choice,
    selected: selectedItemId
      ? isSameRuntimeChoice(answers[selectedItemId], choice)
      : false,
    usedByItemId: findChoiceOwner(answers, choice),
  }));
}

export function buildRuntimeChoiceButtonViews({
  answer,
  choices,
}: {
  answer: string;
  choices: string[];
}): RuntimeChoiceButtonView[] {
  return choices.map((choice) => ({
    choice,
    selected: isSameRuntimeChoice(answer, choice),
  }));
}

export function buildDefaultRuntimeItemCardViews({
  answers,
  correctAnswerLabel,
  inputPlaceholder,
  items,
  progressVerb,
  reviewItems,
}: {
  answers: StudentAnswerMap;
  correctAnswerLabel: string;
  inputPlaceholder: string;
  items: PublicRuntimeItem[];
  progressVerb?: string;
  reviewItems?: PublicAttemptReviewItem[];
}): DefaultRuntimeItemCardView[] {
  return buildStudentRunnerView({
    answers,
    items,
    progressVerb,
    reviewItems,
  }).itemViews.map((itemView) => ({
    ...itemView,
    choiceViews: buildRuntimeChoiceButtonViews({
      answer: itemView.answer,
      choices: itemView.item.choices ?? [],
    }),
    correctAnswerLabel,
    inputPlaceholder,
    showChoices: Boolean(itemView.item.choices?.length),
  }));
}

export function buildChoicePairingRunnerView({
  answers,
  items,
  progressVerb,
  reviewItems,
  selectedItemId,
}: {
  answers: StudentAnswerMap;
  items: PublicRuntimeItem[];
  progressVerb?: string;
  reviewItems?: PublicAttemptReviewItem[];
  selectedItemId?: string;
}): ChoicePairingRunnerView {
  const runnerView = buildStudentRunnerView({
    answers,
    items,
    progressVerb,
    reviewItems,
  });

  return {
    ...runnerView,
    choiceViews: buildRuntimeChoiceViews({
      answers,
      choices: runnerView.choices,
      selectedItemId,
    }),
    promptItemViews: runnerView.itemViews.map((itemView) => ({
      ...itemView,
      promptLabel: itemView.positionLabel,
      selected: selectedItemId === itemView.item.id,
    })),
  };
}

export function buildGroupSortRunnerView({
  answers,
  items,
  progressVerb,
  reviewItems,
  selectedItemId,
}: {
  answers: StudentAnswerMap;
  items: PublicRuntimeItem[];
  progressVerb?: string;
  reviewItems?: PublicAttemptReviewItem[];
  selectedItemId?: string;
}): GroupSortRunnerView {
  const runnerView = buildStudentRunnerView({
    answers,
    items,
    progressVerb,
    reviewItems,
  });

  return {
    ...runnerView,
    groupViews: runnerView.choices.map((group) => ({
      group,
      placedItemViews: runnerView.itemViews.filter((itemView) =>
        isSameRuntimeChoice(itemView.answer, group)
      ),
    })),
    selectedItem: selectedItemId
      ? runnerView.itemViewsById.get(selectedItemId)?.item
      : undefined,
    unplacedItemViews: runnerView.itemViews.filter(
      (itemView) => !itemView.answered
    ),
  };
}

export function buildExclusiveChoiceAnswerChanges({
  answers,
  choice,
  itemId,
}: {
  answers: StudentAnswerMap;
  choice: string;
  itemId: string;
}): RuntimeChoiceAnswerChange[] {
  const usedByItemId = findChoiceOwner(answers, choice);
  const changes: RuntimeChoiceAnswerChange[] = [];

  if (usedByItemId && usedByItemId !== itemId) {
    changes.push({ answer: '', itemId: usedByItemId });
  }

  changes.push({ answer: choice, itemId });

  return changes;
}

export function buildInlineBlankPromptView(
  prompt: string
): InlineBlankPromptView {
  const match = /_{2,}|\[\s*blank\s*\]|\(\s*blank\s*\)/i.exec(prompt);
  if (!match) {
    return {
      mode: 'standalone',
      prompt,
    };
  }

  return {
    after: prompt.slice(match.index + match[0].length),
    before: prompt.slice(0, match.index),
    mode: 'inline',
  };
}

export function buildFillBlankWorksheetView({
  answers,
  items,
  progressVerb,
  reviewItems,
}: {
  answers: StudentAnswerMap;
  items: PublicRuntimeItem[];
  progressVerb?: string;
  reviewItems?: PublicAttemptReviewItem[];
}): FillBlankWorksheetView {
  const runnerView = buildStudentRunnerView({
    answers,
    items,
    progressVerb,
    reviewItems,
  });

  return {
    ...runnerView,
    fillBlankItemViews: runnerView.itemViews.map((itemView, index) => ({
      ...itemView,
      promptView: buildInlineBlankPromptView(itemView.prompt),
      sequenceLabel: `${Math.max(0, index) + 1}`,
      wordBankText: itemView.item.choices?.length
        ? itemView.item.choices.join(', ')
        : null,
    })),
  };
}

export function buildPublicAnswerFeedbackView({
  correctAnswerLabel = m.student_runner_feedback_correct_answer(),
  reviewItem,
}: {
  correctAnswerLabel?: string;
  reviewItem: PublicAttemptReviewItem;
}): PublicAnswerFeedbackView | null {
  if (!reviewItem.submitted) return null;

  return {
    acceptedAnswersLabel: m.student_runner_feedback_accepted_answers(),
    acceptedAnswersText: formatOptionalAcceptedAnswerAlternatives(
      reviewItem.acceptedAnswers,
      {
        separator: ' | ',
      }
    ),
    correctAnswer: reviewItem.correctAnswer,
    correctAnswerLabel,
    explanation: reviewItem.explanation ?? null,
    explanationLabel: m.student_runner_feedback_explanation(),
    status: reviewItem.correct ? 'correct' : 'needs-review',
    statusLabel: reviewItem.correct
      ? m.student_runner_feedback_status_correct()
      : m.student_runner_feedback_status_needs_review(),
  };
}

export function getStudentRunnerReviewStatusClassName(
  status: StudentRunnerReviewStatus
) {
  if (status === 'correct') return 'border-primary/35 bg-primary/5';
  if (status === 'needs-review') {
    return 'border-destructive/30 bg-destructive/5';
  }

  return undefined;
}

function getStudentRunnerReviewStatus(
  reviewItem?: PublicAttemptReviewItem
): StudentRunnerReviewStatus {
  if (!reviewItem) return 'idle';
  if (!reviewItem.submitted) return 'idle';
  return reviewItem.correct ? 'correct' : 'needs-review';
}

function normalizeRuntimeChoiceDisplayText(value: string) {
  return value.normalize('NFKC').replace(/\s+/g, ' ').trim();
}

function getRuntimeChoiceKey(value?: string) {
  return normalizeRuntimeChoiceDisplayText(value ?? '').toLocaleLowerCase();
}
