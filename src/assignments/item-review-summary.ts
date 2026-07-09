import {
  formatOptionalAcceptedAnswerAlternatives,
  formatAssignmentResultValue,
  formatPrimaryAcceptedAnswer,
} from '@/assignments/result-format';
import {
  formatAssignmentResultCopyTitle,
  joinAssignmentResultCopyLines,
} from '@/assignments/result-copy-format';
import {
  formatAssignmentSummaryCorrectCount,
  formatAssignmentSummaryCorrectRate,
  formatAssignmentSummaryUnansweredCount,
} from '@/assignments/result-summary-format';
import { formatAssignmentResultPromptLabel } from '@/assignments/result-display';
import { sortAssignmentItemsByReviewPriority } from '@/assignments/review-priority';
import type { AssignmentItemAnalysis } from '@/assignments/results';
import { m } from '@/locale/paraglide/messages';

type AssignmentItemReviewSummaryInput = {
  assignmentTitle: string;
  items: AssignmentItemAnalysis[];
};

export type AssignmentItemReviewSummaryItemView = {
  acceptedAnswersText: string;
  correctCountLabel: string;
  correctRateLabel: string;
  expectedAnswerText: string;
  explanationText: string;
  itemId: string;
  kindLabel: string;
  promptLabel: string;
  text: string;
  unansweredLabel: string;
};

export type AssignmentItemReviewSummary = {
  itemViews: AssignmentItemReviewSummaryItemView[];
  items: AssignmentItemAnalysis[];
  text: string;
  title: string;
};

export function buildAssignmentItemReviewSummary({
  assignmentTitle,
  items,
}: AssignmentItemReviewSummaryInput): AssignmentItemReviewSummary {
  const sortedItems = sortAssignmentItemsByReviewPriority(items);
  const itemViews = buildAssignmentItemReviewSummaryItemViews(sortedItems);
  const copyTitle = formatAssignmentResultCopyTitle(assignmentTitle);
  const title = m.assignment_item_review_title({ title: copyTitle });

  const lines = [title, '', ...formatItems(itemViews)];

  return {
    itemViews,
    items: sortedItems,
    text: joinAssignmentResultCopyLines(lines),
    title,
  };
}

function buildAssignmentItemReviewSummaryItemViews(
  items: AssignmentItemAnalysis[]
): AssignmentItemReviewSummaryItemView[] {
  return items.map((item, index) =>
    buildAssignmentItemReviewSummaryItemView({ index, item })
  );
}

export function buildAssignmentItemReviewSummaryItemView({
  index,
  item,
}: {
  index: number;
  item: AssignmentItemAnalysis;
}): AssignmentItemReviewSummaryItemView {
  const acceptedAnswersText =
    formatOptionalAcceptedAnswerAlternatives(item.acceptedAnswers, {
      includePrimary: false,
    }) ?? '';
  const explanationText = formatAssignmentResultValue(item.explanation, {
    emptyValue: '',
  });
  const correctCountLabel = formatAssignmentSummaryCorrectCount(item);
  const correctRateLabel = formatAssignmentSummaryCorrectRate(item.correctRate);
  const expectedAnswerText = formatPrimaryAcceptedAnswer(item.acceptedAnswers);
  const unansweredLabel = formatAssignmentSummaryUnansweredCount(
    item.unansweredCount
  );
  const promptLabel = formatAssignmentResultPromptLabel({
    index,
    prompt: item.prompt,
  });

  return {
    acceptedAnswersText,
    correctCountLabel,
    correctRateLabel,
    expectedAnswerText,
    explanationText,
    itemId: item.itemId,
    kindLabel: item.kindLabel,
    promptLabel,
    text: m.assignment_item_review_line({
      acceptedAnswers: acceptedAnswersText
        ? m.assignment_item_review_accepted_answers({
            answers: acceptedAnswersText,
          })
        : '',
      correctCount: correctCountLabel,
      correctRate: correctRateLabel,
      expected: expectedAnswerText,
      kind: item.kindLabel,
      notes: explanationText
        ? m.assignment_item_review_notes({ notes: explanationText })
        : '',
      promptLabel,
      unanswered: unansweredLabel,
    }),
    unansweredLabel,
  };
}

function formatItems(items: AssignmentItemReviewSummaryItemView[]) {
  if (items.length === 0) {
    return [m.assignment_item_review_empty()];
  }

  return items.map((item) => item.text);
}
