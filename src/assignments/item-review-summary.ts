import type { AssignmentItemAnalysis } from '@/assignments/results';

export type AssignmentItemReviewSummaryInput = {
  assignmentTitle: string;
  items: AssignmentItemAnalysis[];
};

export function buildAssignmentItemReviewSummary({
  assignmentTitle,
  items,
}: AssignmentItemReviewSummaryInput) {
  const sortedItems = [...items].sort((left, right) => {
    if (left.correctRate !== right.correctRate) {
      return left.correctRate - right.correctRate;
    }
    return right.submittedCount - left.submittedCount;
  });

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
    return `- ${index + 1}. ${item.prompt} (${item.kind}) - ${item.correctRate}% correct, ${item.correctCount}/${item.submittedCount} correct. Expected: ${item.expectedAnswer || '-'}.${explanation}`;
  });
}
