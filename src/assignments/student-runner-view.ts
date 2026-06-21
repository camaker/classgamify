import {
  formatRuntimeItemKindLabel,
  formatRuntimeItemPrompt,
} from '@/activities/runtime';
import {
  buildPublicAttemptReviewItemMap,
  type PublicAttemptReviewItem,
  type PublicRuntimeItem,
} from '@/assignments/public';
import {
  formatAttemptCompletionProgressLabel,
  getAttemptCompletionSummary,
  isStudentAnswerFilled,
  type StudentAnswerMap,
} from '@/assignments/student-submission';

type StudentRunnerReviewStatus = 'correct' | 'idle' | 'needs-review';

type RuntimeChoiceAnswerChange = {
  answer: string;
  itemId: string;
};

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

function getStudentRunnerReviewStatus(
  reviewItem?: PublicAttemptReviewItem
): StudentRunnerReviewStatus {
  if (!reviewItem) return 'idle';
  return reviewItem.correct ? 'correct' : 'needs-review';
}
