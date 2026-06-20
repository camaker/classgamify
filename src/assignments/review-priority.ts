import type { AssignmentItemAnalysis } from '@/assignments/results';

export function compareAssignmentItemsByReviewPriority(
  left: AssignmentItemAnalysis,
  right: AssignmentItemAnalysis
) {
  if (left.correctRate !== right.correctRate) {
    return left.correctRate - right.correctRate;
  }

  return right.submittedCount - left.submittedCount;
}

export function sortAssignmentItemsByReviewPriority(
  items: AssignmentItemAnalysis[]
) {
  return [...items].sort(compareAssignmentItemsByReviewPriority);
}

export function getSubmittedAssignmentReviewPriorityItems(
  items: AssignmentItemAnalysis[],
  options?: {
    limit?: number;
  }
) {
  const sortedItems = sortAssignmentItemsByReviewPriority(
    items.filter((item) => item.submittedCount > 0)
  );

  return options?.limit === undefined
    ? sortedItems
    : sortedItems.slice(0, options.limit);
}
