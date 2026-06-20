import type { AssignmentStudentSummary } from '@/assignments/results';

export function compareAssignmentStudentsByFollowUpPriority(
  left: AssignmentStudentSummary,
  right: AssignmentStudentSummary
) {
  if (left.needsReviewCount !== right.needsReviewCount) {
    return right.needsReviewCount - left.needsReviewCount;
  }

  if (left.latestAccuracy !== right.latestAccuracy) {
    return left.latestAccuracy - right.latestAccuracy;
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
    students.filter((student) => student.needsReviewCount > 0)
  );

  return options?.limit === undefined
    ? sortedStudents
    : sortedStudents.slice(0, options.limit);
}
