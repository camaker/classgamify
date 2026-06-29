import type { AssignmentSettings } from '@/activities/types';
import { formatAssignmentDisplayTitle } from '@/assignments/assignment-display';
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
  getRuntimeChoiceDisplayKey,
  normalizeRuntimeChoiceList,
  normalizeRuntimeDisplayCount,
  normalizeRuntimeDisplayText,
} from '@/assignments/runtime-display';
import {
  buildStudentAttemptAnswerStateByItemId,
  formatAttemptCompletionProgressLabel,
  getAttemptCompletionSummary,
  normalizeStudentAnswersForRuntimeItems,
  getStudentRunnerCopy,
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

type RuntimeChoiceView = {
  action: ChoicePairingRunnerAction;
  choice: string;
  selected: boolean;
  usedByItemId: string | undefined;
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
  choiceViews: RuntimeChoiceView[];
  promptItemViews: ChoicePairingPromptItemView[];
};

type ChoicePairingPromptItemView = ReturnType<
  typeof buildStudentRunnerView
>['itemViews'][number] & {
  action: ChoicePairingRunnerAction;
  promptLabel: string;
  reviewStatusClassName: string | undefined;
  selected: boolean;
};

type GroupSortRunnerView = ReturnType<typeof buildStudentRunnerView> & {
  groupViews: Array<{
    action: GroupSortRunnerAction;
    group: string;
    placedItemViews: GroupSortItemView[];
  }>;
  selectedClearAction: GroupSortRunnerAction | undefined;
  selectedItem?: PublicRuntimeItem;
  unplacedItemViews: GroupSortItemView[];
};

type GroupSortItemView = ReturnType<
  typeof buildStudentRunnerView
>['itemViews'][number] & {
  action: GroupSortRunnerAction;
  reviewStatusClassName: string | undefined;
  selected: boolean;
};

export type ChoicePairingRunnerAction =
  | {
      itemId: string;
      type: 'select-prompt';
    }
  | {
      choice: string;
      type: 'choose-choice';
    };

export type ChoicePairingRunnerActionResult =
  | {
      answerChanges: RuntimeChoiceAnswerChange[];
      selectedItemId: undefined;
      type: 'answer';
    }
  | {
      selectedItemId: string | undefined;
      type: 'select';
    };

export type GroupSortRunnerAction =
  | {
      itemId: string;
      type: 'select-item';
    }
  | {
      group: string;
      type: 'place-selected';
    }
  | {
      type: 'clear-selected';
    };

export type GroupSortRunnerActionResult =
  | {
      answer: string;
      itemId: string;
      selectedItemId: undefined;
      type: 'answer';
    }
  | {
      selectedItemId: string | undefined;
      type: 'select';
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
  reviewStatusClassName: string | undefined;
  sequenceLabel: string;
  wordBankLineText: string | null;
  wordBankText: string | null;
};

type FillBlankWorksheetView = ReturnType<typeof buildStudentRunnerView> & {
  fillBlankItemViews: FillBlankWorksheetItemView[];
};

type SequentialStudentRunnerItemView = ReturnType<
  typeof buildStudentRunnerView
>['itemViews'][number] & {
  sequenceLabel: string;
};

type SequentialStudentRunnerNavigationItemView =
  SequentialStudentRunnerItemView & {
    reviewStatusClassName: string | undefined;
    selected: boolean;
    selectAction: SequentialStudentRunnerNavigationAction;
  };

type SequentialStudentRunnerNavigationView = {
  activePanelStatusClassName: string | undefined;
  canMove: boolean;
  itemViews: SequentialStudentRunnerNavigationItemView[];
  nextAction: SequentialStudentRunnerNavigationAction;
  nextItemId: string | undefined;
  previousAction: SequentialStudentRunnerNavigationAction;
  previousItemId: string | undefined;
};

export type SequentialStudentRunnerNavigationAction =
  | {
      type: 'next';
    }
  | {
      type: 'previous';
    }
  | {
      itemId: string;
      type: 'select';
    };

type PublicAnswerFeedbackView = {
  acceptedAnswersLabel: string;
  acceptedAnswersText: string | null;
  correctAnswer: string;
  correctAnswerLabel: string;
  correctAnswerText: string;
  explanation: string | null;
  explanationLabel: string;
  explanationText: string | null;
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
  prepareView: StudentRunnerPrepareView;
  ruleItems: PublicAssignmentRuleSummaryItem[];
  teacherActionLabel: string;
  title: string;
};

type StudentRunnerPrepareView = {
  steps: string[];
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
    prepareView: buildStudentRunnerPrepareView(assignment.settings),
    ruleItems: buildPublicAssignmentRuleSummaryFromSettings({
      expiresAt: assignment.expiresAt ?? null,
      itemCount,
      settings: assignment.settings,
    }),
    teacherActionLabel: getStudentRunnerCopy().teacherViewLabel,
    title: formatAssignmentDisplayTitle(assignment.title),
  };
}

function buildStudentRunnerPrepareView(
  settings: AssignmentSettings
): StudentRunnerPrepareView {
  return {
    steps: [
      m.student_runner_prepare_step_review_rules(),
      settings.collectStudentName
        ? m.student_runner_prepare_step_name()
        : m.student_runner_prepare_step_anonymous(),
      settings.timeLimitSeconds
        ? m.student_runner_prepare_step_timer()
        : m.student_runner_prepare_step_no_timer(),
      m.student_runner_prepare_step_submit(),
    ],
    title: m.student_runner_prepare_title(),
  };
}

function buildStudentRunnerInstructionView(
  instructions: string | undefined
): StudentRunnerInstructionView | undefined {
  const value = normalizeRuntimeDisplayText(instructions);
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
  const normalizedAnswers = normalizeStudentAnswersForRuntimeItems({
    answers,
    runtimeItems: items,
  });
  const completionSummary = getAttemptCompletionSummary({
    answers: normalizedAnswers,
    runtimeItems: items,
  });
  const answerStateByItemId = buildStudentAttemptAnswerStateByItemId({
    answers: normalizedAnswers,
    runtimeItems: items,
  });
  const reviewByItemId = buildPublicAttemptReviewItemMap(reviewItems);
  const itemViews = items.map((item, index) => {
    const answerState = answerStateByItemId.get(item.id);
    const answer = answerState?.answer ?? '';
    const reviewItem = reviewByItemId.get(item.id);
    const prompt = formatRuntimeItemPrompt(item);

    return {
      answer,
      answered: Boolean(answerState?.answered),
      item,
      kindLabel: formatRuntimeItemKindLabel(item),
      positionLabel: m.student_runner_item_position_label({
        index: getStudentRunnerItemPosition(index),
        prompt,
      }),
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
    normalizedAnswers,
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
  revealAnswer = false,
  reviewItems,
}: {
  activeItemId?: string;
  answers: StudentAnswerMap;
  itemLabel: string;
  items: PublicRuntimeItem[];
  progressVerb?: string;
  revealAnswer?: boolean;
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
  const navigationView = buildSequentialStudentRunnerNavigationView({
    activeIndex: sequenceView.activeIndex,
    itemViews: sequenceView.itemViews,
    revealAnswer,
  });

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
    navigationView,
    sequenceView,
  };
}

export function buildSequentialStudentRunnerNavigationView({
  activeIndex,
  itemViews,
  revealAnswer,
}: {
  activeIndex: number;
  itemViews: SequentialStudentRunnerItemView[];
  revealAnswer: boolean;
}): SequentialStudentRunnerNavigationView {
  const itemIds = itemViews.map((itemView) => itemView.item.id);
  const normalizedActiveIndex = itemViews[activeIndex] ? activeIndex : 0;
  const activeItemView = itemViews[normalizedActiveIndex];
  const nextItemId = getSequentialRunnerItemIdByOffset({
    activeIndex,
    itemIds,
    offset: 1,
  });
  const previousItemId = getSequentialRunnerItemIdByOffset({
    activeIndex,
    itemIds,
    offset: -1,
  });

  return {
    activePanelStatusClassName:
      revealAnswer && activeItemView
        ? getStudentRunnerReviewStatusClassName(activeItemView.status)
        : undefined,
    canMove: itemViews.length > 1,
    itemViews: itemViews.map((itemView, index) => ({
      ...itemView,
      reviewStatusClassName: revealAnswer
        ? getStudentRunnerReviewStatusClassName(itemView.status)
        : undefined,
      selected: index === normalizedActiveIndex,
      selectAction: buildSequentialStudentRunnerSelectAction(itemView.item.id),
    })),
    nextAction: { type: 'next' },
    nextItemId,
    previousAction: { type: 'previous' },
    previousItemId,
  };
}

export function getInitialSequentialStudentRunnerActiveItemId(
  items: PublicRuntimeItem[]
) {
  return items[0]?.id;
}

export function resolveSequentialStudentRunnerNavigationAction({
  action,
  fallbackItemId,
  navigationView,
}: {
  action: SequentialStudentRunnerNavigationAction;
  fallbackItemId?: string;
  navigationView: SequentialStudentRunnerNavigationView;
}) {
  const activeItemId =
    navigationView.itemViews.find((itemView) => itemView.selected)?.item.id ??
    fallbackItemId;

  if (action.type === 'next') {
    return navigationView.nextItemId ?? activeItemId;
  }

  if (action.type === 'previous') {
    return navigationView.previousItemId ?? activeItemId;
  }

  return (
    navigationView.itemViews.find(
      (itemView) => itemView.item.id === action.itemId
    )?.item.id ?? activeItemId
  );
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

  const normalizedActiveIndex = normalizeSequentialRunnerActiveIndex({
    activeIndex,
    itemCount: itemIds.length,
  });
  const normalizedOffset = normalizeSequentialRunnerOffset(offset);
  const nextIndex =
    (normalizedActiveIndex + normalizedOffset + itemIds.length) %
    itemIds.length;

  return itemIds[nextIndex];
}

export function normalizeSequentialRunnerActiveIndex({
  activeIndex,
  itemCount,
}: {
  activeIndex: number;
  itemCount: number;
}) {
  const normalizedItemCount = normalizeRuntimeDisplayCount(itemCount);
  if (normalizedItemCount === 0) return 0;

  const resolvedActiveIndex = normalizeRuntimeDisplayCount(activeIndex);

  return Math.min(normalizedItemCount - 1, resolvedActiveIndex);
}

export function normalizeSequentialRunnerOffset(offset: number) {
  if (!Number.isFinite(offset)) return 0;

  return Math.trunc(offset);
}

export function formatSequentialRunnerItemLabel(label: string, index: number) {
  const normalizedLabel =
    normalizeRuntimeDisplayText(label) ||
    m.student_runner_sequential_default_item_label();
  return m.student_runner_sequential_item_label({
    index: getStudentRunnerItemPosition(index),
    label: normalizedLabel,
  });
}

export function getStudentRunnerItemPosition(index: number) {
  return normalizeRuntimeDisplayCount(index + 1, { min: 1 });
}

function buildSequentialStudentRunnerSelectAction(
  itemId: string
): SequentialStudentRunnerNavigationAction {
  return {
    itemId,
    type: 'select',
  };
}

function buildChoicePairingPromptAction(
  itemId: string
): ChoicePairingRunnerAction {
  return {
    itemId,
    type: 'select-prompt',
  };
}

function buildChoicePairingChoiceAction(
  choice: string
): ChoicePairingRunnerAction {
  return {
    choice,
    type: 'choose-choice',
  };
}

function buildGroupSortItemAction(itemId: string): GroupSortRunnerAction {
  return {
    itemId,
    type: 'select-item',
  };
}

function buildGroupSortPlaceAction(group: string): GroupSortRunnerAction {
  return {
    group,
    type: 'place-selected',
  };
}

function buildGroupSortClearAction(): GroupSortRunnerAction {
  return {
    type: 'clear-selected',
  };
}

export function getUniqueRuntimeChoices(items: PublicRuntimeItem[]) {
  return (
    normalizeRuntimeChoiceList(items.flatMap((item) => item.choices ?? [])) ??
    []
  );
}

export function findChoiceOwner(answers: StudentAnswerMap, choice: string) {
  const choiceKey = getRuntimeChoiceDisplayKey(choice);
  if (!choiceKey) return undefined;

  return Object.entries(answers).find(([, answer]) =>
    isSameRuntimeChoice(answer, choice)
  )?.[0];
}

export function isSameRuntimeChoice(
  left: string | undefined,
  right: string | undefined
) {
  const leftKey = getRuntimeChoiceDisplayKey(left);
  if (!leftKey) return false;

  return leftKey === getRuntimeChoiceDisplayKey(right);
}

export function buildRuntimeChoiceViews({
  answers,
  choices,
  selectedItemId,
}: {
  answers: StudentAnswerMap;
  choices: string[];
  selectedItemId?: string;
}): RuntimeChoiceView[] {
  return choices.map((choice) => ({
    action: buildChoicePairingChoiceAction(choice),
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
  revealAnswer = false,
  reviewItems,
  selectedItemId,
}: {
  answers: StudentAnswerMap;
  items: PublicRuntimeItem[];
  progressVerb?: string;
  revealAnswer?: boolean;
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
      answers: runnerView.normalizedAnswers,
      choices: runnerView.choices,
      selectedItemId,
    }),
    promptItemViews: runnerView.itemViews.map((itemView) => ({
      ...itemView,
      action: buildChoicePairingPromptAction(itemView.item.id),
      promptLabel: itemView.positionLabel,
      reviewStatusClassName: revealAnswer
        ? getStudentRunnerReviewStatusClassName(itemView.status)
        : undefined,
      selected: selectedItemId === itemView.item.id,
    })),
  };
}

export function buildGroupSortRunnerView({
  answers,
  items,
  progressVerb,
  revealAnswer = false,
  reviewItems,
  selectedItemId,
}: {
  answers: StudentAnswerMap;
  items: PublicRuntimeItem[];
  progressVerb?: string;
  revealAnswer?: boolean;
  reviewItems?: PublicAttemptReviewItem[];
  selectedItemId?: string;
}): GroupSortRunnerView {
  const runnerView = buildStudentRunnerView({
    answers,
    items,
    progressVerb,
    reviewItems,
  });
  const itemViews = runnerView.itemViews.map((itemView) => ({
    ...itemView,
    action: buildGroupSortItemAction(itemView.item.id),
    reviewStatusClassName: revealAnswer
      ? getStudentRunnerReviewStatusClassName(itemView.status)
      : undefined,
    selected: selectedItemId === itemView.item.id,
  }));

  return {
    ...runnerView,
    groupViews: runnerView.choices.map((group) => ({
      action: buildGroupSortPlaceAction(group),
      group,
      placedItemViews: itemViews.filter((itemView) =>
        isSameRuntimeChoice(itemView.answer, group)
      ),
    })),
    selectedClearAction: selectedItemId
      ? buildGroupSortClearAction()
      : undefined,
    selectedItem: selectedItemId
      ? itemViews.find((itemView) => itemView.selected)?.item
      : undefined,
    unplacedItemViews: itemViews.filter((itemView) => !itemView.answered),
  };
}

export function buildExclusiveChoiceAnswerChanges({
  answers,
  choice,
  itemId,
  items,
}: {
  answers: StudentAnswerMap;
  choice: string;
  itemId: string;
  items?: PublicRuntimeItem[];
}): RuntimeChoiceAnswerChange[] {
  const answerState = items
    ? normalizeStudentAnswersForRuntimeItems({
        answers,
        runtimeItems: items,
      })
    : answers;
  const usedByItemId = findChoiceOwner(answerState, choice);
  const changes: RuntimeChoiceAnswerChange[] = [];

  if (usedByItemId && usedByItemId !== itemId) {
    changes.push({ answer: '', itemId: usedByItemId });
  }

  changes.push({ answer: choice, itemId });

  return changes;
}

export function resolveChoicePairingRunnerAction({
  action,
  answers,
  disabled = false,
  items,
  selectedItemId,
}: {
  action: ChoicePairingRunnerAction;
  answers: StudentAnswerMap;
  disabled?: boolean;
  items?: PublicRuntimeItem[];
  selectedItemId?: string;
}): ChoicePairingRunnerActionResult {
  if (disabled) {
    return {
      selectedItemId,
      type: 'select',
    };
  }

  if (action.type === 'select-prompt') {
    return {
      selectedItemId:
        selectedItemId === action.itemId ? undefined : action.itemId,
      type: 'select',
    };
  }

  if (!selectedItemId) {
    return {
      selectedItemId,
      type: 'select',
    };
  }

  return {
    answerChanges: buildExclusiveChoiceAnswerChanges({
      answers,
      choice: action.choice,
      itemId: selectedItemId,
      items,
    }),
    selectedItemId: undefined,
    type: 'answer',
  };
}

export function resolveGroupSortRunnerAction({
  action,
  disabled = false,
  selectedItemId,
}: {
  action: GroupSortRunnerAction;
  disabled?: boolean;
  selectedItemId?: string;
}): GroupSortRunnerActionResult {
  if (disabled) {
    return {
      selectedItemId,
      type: 'select',
    };
  }

  if (action.type === 'select-item') {
    return {
      selectedItemId:
        selectedItemId === action.itemId ? undefined : action.itemId,
      type: 'select',
    };
  }

  if (!selectedItemId) {
    return {
      selectedItemId,
      type: 'select',
    };
  }

  if (action.type === 'clear-selected') {
    return {
      answer: '',
      itemId: selectedItemId,
      selectedItemId: undefined,
      type: 'answer',
    };
  }

  return {
    answer: action.group,
    itemId: selectedItemId,
    selectedItemId: undefined,
    type: 'answer',
  };
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
  revealAnswer = false,
  reviewItems,
  wordBankLabel = m.activity_runner_word_bank_label(),
}: {
  answers: StudentAnswerMap;
  items: PublicRuntimeItem[];
  progressVerb?: string;
  revealAnswer?: boolean;
  reviewItems?: PublicAttemptReviewItem[];
  wordBankLabel?: string;
}): FillBlankWorksheetView {
  const runnerView = buildStudentRunnerView({
    answers,
    items,
    progressVerb,
    reviewItems,
  });

  return {
    ...runnerView,
    fillBlankItemViews: runnerView.itemViews.map((itemView, index) => {
      const wordBankText = itemView.item.choices?.length
        ? itemView.item.choices.join(m.activity_runner_word_bank_separator())
        : null;

      return {
        ...itemView,
        promptView: buildInlineBlankPromptView(itemView.prompt),
        reviewStatusClassName: revealAnswer
          ? getStudentRunnerReviewStatusClassName(itemView.status)
          : undefined,
        sequenceLabel: String(getStudentRunnerItemPosition(index)),
        wordBankLineText: wordBankText
          ? m.activity_runner_word_bank_line({
              label: wordBankLabel,
              value: wordBankText,
            })
          : null,
        wordBankText,
      };
    }),
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

  const acceptedAnswersLabel = m.student_runner_feedback_accepted_answers();
  const acceptedAnswersValue = formatOptionalAcceptedAnswerAlternatives(
    reviewItem.acceptedAnswers,
    {
      includePrimary: false,
      separator: m.student_runner_choice_separator(),
    }
  );
  const explanationLabel = m.student_runner_feedback_explanation();
  const explanationValue = reviewItem.explanation ?? null;

  return {
    acceptedAnswersLabel,
    acceptedAnswersText: acceptedAnswersValue
      ? m.student_runner_feedback_accepted_answers_line({
          label: acceptedAnswersLabel,
          value: acceptedAnswersValue,
        })
      : null,
    correctAnswer: reviewItem.correctAnswer,
    correctAnswerLabel,
    correctAnswerText: m.student_runner_feedback_correct_answer_line({
      label: correctAnswerLabel,
      value: reviewItem.correctAnswer,
    }),
    explanation: explanationValue,
    explanationLabel,
    explanationText: explanationValue
      ? m.student_runner_feedback_explanation_line({
          label: explanationLabel,
          value: explanationValue,
        })
      : null,
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
