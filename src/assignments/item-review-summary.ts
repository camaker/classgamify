import { formatAcceptedAnswerAlternatives } from '@/assignments/result-format';
import {
  formatAssignmentSummaryCorrectCount,
  formatAssignmentSummaryCorrectRate,
} from '@/assignments/result-summary-format';
import { sortAssignmentItemsByReviewPriority } from '@/assignments/review-priority';
import type { AssignmentItemAnalysis } from '@/assignments/results';

export type AssignmentItemReviewSummaryInput = {
  assignmentTitle: string;
  items: AssignmentItemAnalysis[];
};

export function buildAssignmentItemReviewSummary({
  assignmentTitle,
  items,
}: AssignmentItemReviewSummaryInput) {
  const sortedItems = sortAssignmentItemsByReviewPriority(items);

  const lines = [
    `ClassGamify item review: ${assignmentTitle}`,
    '',
    ...formatItems(sortedItems),
  ];

  return lines.join('\n');
}

function formatItems(items: AssignmentItemAnalysis[]) {
  if (items.length === 0) {
    return ['- No item performance data yet.'];
  }

  return items.map((item, index) => {
    const explanation = item.explanation ? ` Notes: ${item.explanation}` : '';
    const acceptedAnswers =
      item.acceptedAnswers.length > 1
        ? ` Accepted answers: ${formatAcceptedAnswerAlternatives(
            item.acceptedAnswers
          )}.`
        : '';
    return `- ${index + 1}. ${item.prompt} (${item.kindLabel}) - ${formatAssignmentSummaryCorrectRate(
      item.correctRate
    )}, ${formatAssignmentSummaryCorrectCount(
      item
    )}. Expected: ${item.expectedAnswer || '-'}.${acceptedAnswers}${explanation}`;
  });
}
