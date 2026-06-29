import type { AssignmentItemAnalysis } from '@/assignments/results';
import { compareRuntimeDisplaySearchText } from '@/assignments/runtime-display';

export function compareAssignmentItemsByReviewPriority(
  left: AssignmentItemAnalysis,
  right: AssignmentItemAnalysis
) {
  const leftCorrectRate = normalizeReviewPriorityNumber(left.correctRate);
  const rightCorrectRate = normalizeReviewPriorityNumber(right.correctRate);
  if (leftCorrectRate !== rightCorrectRate) {
    return leftCorrectRate - rightCorrectRate;
  }

  const leftUnansweredCount = normalizeReviewPriorityCount(
    left.unansweredCount
  );
  const rightUnansweredCount = normalizeReviewPriorityCount(
    right.unansweredCount
  );
  if (leftUnansweredCount !== rightUnansweredCount) {
    return rightUnansweredCount - leftUnansweredCount;
  }

  const leftSubmittedCount = normalizeReviewPriorityCount(left.submittedCount);
  const rightSubmittedCount = normalizeReviewPriorityCount(
    right.submittedCount
  );
  if (leftSubmittedCount !== rightSubmittedCount) {
    return rightSubmittedCount - leftSubmittedCount;
  }

  return compareAssignmentItemsByStableOrder(left, right);
}

export function compareAssignmentItemsByStableOrder(
  left: AssignmentItemAnalysis,
  right: AssignmentItemAnalysis
) {
  return compareAssignmentItemsByType(left, right);
}

export function compareAssignmentItemsByType(
  left: AssignmentItemAnalysis,
  right: AssignmentItemAnalysis
) {
  const kindCompare = compareAssignmentItemSortText(left.kind, right.kind);
  if (kindCompare !== 0) return kindCompare;

  const promptCompare = compareAssignmentItemSortText(
    left.prompt,
    right.prompt
  );
  if (promptCompare !== 0) return promptCompare;

  return compareAssignmentItemSortText(left.itemId, right.itemId);
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
  return getAssignmentReviewPriorityItems(
    items.filter(
      (item) => normalizeReviewPriorityCount(item.submittedCount) > 0
    ),
    options
  );
}

export function getAssignmentReviewPriorityItems(
  items: AssignmentItemAnalysis[],
  options?: {
    limit?: number;
  }
) {
  const sortedItems = sortAssignmentItemsByReviewPriority(
    items.filter(hasAssignmentItemReviewEvidence)
  );
  const limit =
    options?.limit === undefined
      ? undefined
      : normalizeReviewPriorityCount(options.limit);

  return limit === undefined ? sortedItems : sortedItems.slice(0, limit);
}

function hasAssignmentItemReviewEvidence(item: AssignmentItemAnalysis) {
  return (
    normalizeReviewPriorityCount(item.submittedCount) > 0 ||
    normalizeReviewPriorityCount(item.unansweredCount) > 0
  );
}

function normalizeReviewPriorityNumber(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function normalizeReviewPriorityCount(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function compareAssignmentItemSortText(left: string, right: string) {
  return compareRuntimeDisplaySearchText(left, right);
}
