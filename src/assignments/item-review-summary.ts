import { formatAcceptedAnswerAlternatives } from '@/assignments/result-format';
import {
  formatAssignmentSummaryCorrectCount,
  formatAssignmentSummaryCorrectRate,
} from '@/assignments/result-summary-format';
import { sortAssignmentItemsByReviewPriority } from '@/assignments/review-priority';
import type { AssignmentItemAnalysis } from '@/assignments/results';
import { m } from '@/locale/paraglide/messages';

type AssignmentItemReviewSummaryInput = {
  assignmentTitle: string;
  items: AssignmentItemAnalysis[];
};

export function buildAssignmentItemReviewSummary({
  assignmentTitle,
  items,
}: AssignmentItemReviewSummaryInput) {
  const sortedItems = sortAssignmentItemsByReviewPriority(items);

  const lines = [
    m.assignment_item_review_title({ title: assignmentTitle }),
    '',
    ...formatItems(sortedItems),
  ];

  return lines.join('\n');
}

function formatItems(items: AssignmentItemAnalysis[]) {
  if (items.length === 0) {
    return [m.assignment_item_review_empty()];
  }

  return items.map((item, index) => {
    const explanation = item.explanation
      ? m.assignment_item_review_notes({ notes: item.explanation })
      : '';
    const acceptedAnswers =
      item.acceptedAnswers.length > 1
        ? m.assignment_item_review_accepted_answers({
            answers: formatAcceptedAnswerAlternatives(item.acceptedAnswers),
          })
        : '';

    return m.assignment_item_review_line({
      acceptedAnswers,
      correctCount: formatAssignmentSummaryCorrectCount(item),
      correctRate: formatAssignmentSummaryCorrectRate(item.correctRate),
      expected: item.expectedAnswer || '-',
      index: index + 1,
      kind: item.kindLabel,
      notes: explanation,
      prompt: item.prompt,
    });
  });
}
