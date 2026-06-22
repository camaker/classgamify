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
import { formatAcceptedAnswerAlternatives } from '@/assignments/result-format';
import {
  formatAttemptCompletionProgressLabel,
  getAttemptCompletionSummary,
  getStudentRunnerCopy,
  isStudentAnswerFilled,
  type StudentAnswerMap,
} from '@/assignments/student-submission';
import { m } from '@/locale/paraglide/messages';

type StudentRunnerReviewStatus = 'correct' | 'idle' | 'needs-review';

type RuntimeChoiceAnswerChange = {
  answer: string;
  itemId: string;
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

export function formatSequentialRunnerItemLabel(label: string, index: number) {
  const normalizedLabel =
    label.trim() || m.student_runner_sequential_default_item_label();
  return m.student_runner_sequential_item_label({
    index: Math.max(0, index) + 1,
    label: normalizedLabel,
  });
}

export function getUniqueRuntimeChoices(items: PublicRuntimeItem[]) {
  const choices = new Set<string>();

  for (const item of items) {
    for (const choice of item.choices ?? []) {
      const normalizedChoice = choice.trim();
      if (normalizedChoice) {
        choices.add(normalizedChoice);
      }
    }
  }

  return [...choices];
}

export function findChoiceOwner(answers: StudentAnswerMap, choice: string) {
  return Object.entries(answers).find(([, answer]) => answer === choice)?.[0];
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
    selected: selectedItemId ? answers[selectedItemId] === choice : false,
    usedByItemId: findChoiceOwner(answers, choice),
  }));
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

export function buildPublicAnswerFeedbackView({
  correctAnswerLabel = m.student_runner_feedback_correct_answer(),
  reviewItem,
}: {
  correctAnswerLabel?: string;
  reviewItem: PublicAttemptReviewItem;
}): PublicAnswerFeedbackView {
  return {
    acceptedAnswersLabel: m.student_runner_feedback_accepted_answers(),
    acceptedAnswersText:
      reviewItem.acceptedAnswers.length > 1
        ? formatAcceptedAnswerAlternatives(reviewItem.acceptedAnswers, {
            separator: ' | ',
          })
        : null,
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

function getStudentRunnerReviewStatus(
  reviewItem?: PublicAttemptReviewItem
): StudentRunnerReviewStatus {
  if (!reviewItem) return 'idle';
  return reviewItem.correct ? 'correct' : 'needs-review';
}
