import type { AssignmentStudentSummary } from '@/assignments/results';

export function compareAssignmentStudentsByFollowUpPriority(
  left: AssignmentStudentSummary,
  right: AssignmentStudentSummary
) {
  const leftNeedsReviewCount = normalizeFollowUpPriorityCount(
    left.needsReviewCount
  );
  const rightNeedsReviewCount = normalizeFollowUpPriorityCount(
    right.needsReviewCount
  );
  if (leftNeedsReviewCount !== rightNeedsReviewCount) {
    return rightNeedsReviewCount - leftNeedsReviewCount;
  }

  const leftLatestAccuracy = normalizeFollowUpPriorityNumber(
    left.latestAccuracy
  );
  const rightLatestAccuracy = normalizeFollowUpPriorityNumber(
    right.latestAccuracy
  );
  if (leftLatestAccuracy !== rightLatestAccuracy) {
    return leftLatestAccuracy - rightLatestAccuracy;
  }

  return left.studentLabel.localeCompare(right.studentLabel);
}

export function sortAssignmentStudentsByFollowUpPriority(
  students: AssignmentStudentSummary[]
) {
  return [...students].sort(compareAssignmentStudentsByFollowUpPriority);
}

export function getAssignmentStudentFollowUpPriorityStudents(
  students: AssignmentStudentSummary[],
  options?: {
    limit?: number;
  }
) {
  const sortedStudents = sortAssignmentStudentsByFollowUpPriority(
    students.filter(
      (student) => normalizeFollowUpPriorityCount(student.needsReviewCount) > 0
    )
  );
  const limit =
    options?.limit === undefined
      ? undefined
      : normalizeFollowUpPriorityCount(options.limit);

  return limit === undefined ? sortedStudents : sortedStudents.slice(0, limit);
}

function normalizeFollowUpPriorityNumber(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function normalizeFollowUpPriorityCount(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}
