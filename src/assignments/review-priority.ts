import type { AssignmentItemAnalysis } from '@/assignments/results';

export function compareAssignmentItemsByReviewPriority(
  left: AssignmentItemAnalysis,
  right: AssignmentItemAnalysis
) {
  if (left.correctRate !== right.correctRate) {
    return left.correctRate - right.correctRate;
  }

  if (left.submittedCount !== right.submittedCount) {
    return right.submittedCount - left.submittedCount;
  }

  return compareAssignmentItemsByStableOrder(left, right);
}

export function compareAssignmentItemsByStableOrder(
  left: AssignmentItemAnalysis,
  right: AssignmentItemAnalysis
) {
  const kindCompare = left.kind.localeCompare(right.kind);
  if (kindCompare !== 0) return kindCompare;

  const promptCompare = left.prompt.localeCompare(right.prompt);
  if (promptCompare !== 0) return promptCompare;

  return left.itemId.localeCompare(right.itemId);
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
