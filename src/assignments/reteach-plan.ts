import type {
  AssignmentItemAnalysis,
  AssignmentStudentSummary,
} from '@/assignments/results';

export type AssignmentReteachPlanInput = {
  assignmentTitle: string;
  items: AssignmentItemAnalysis[];
  students: AssignmentStudentSummary[];
};

export function buildAssignmentReteachPlan({
  assignmentTitle,
  items,
  students,
}: AssignmentReteachPlanInput) {
  const reviewItems = items
    .filter((item) => item.submittedCount > 0)
    .sort((left, right) => {
      if (left.correctRate !== right.correctRate) {
        return left.correctRate - right.correctRate;
      }
      return right.submittedCount - left.submittedCount;
    })
    .slice(0, 5);
  const reviewStudents = students
    .filter((student) => student.needsReviewCount > 0)
    .sort((left, right) => {
      if (left.latestAccuracy !== right.latestAccuracy) {
        return left.latestAccuracy - right.latestAccuracy;
      }
      return right.needsReviewCount - left.needsReviewCount;
    })
    .slice(0, 8);
  const lines = [
    `ClassGamify reteach plan: ${assignmentTitle}`,
    '',
    'Review first:',
    ...formatReviewItems(reviewItems),
    '',
    'Student follow-up:',
    ...formatReviewStudents(reviewStudents),
  ];

  return lines.join('\n');
}

function formatReviewItems(items: AssignmentItemAnalysis[]) {
  if (items.length === 0) {
    return ['- No submitted item data yet.'];
  }

  return items.map(
    (item, index) =>
      `- ${index + 1}. ${item.prompt} (${item.correctRate}% correct, ${item.correctCount}/${item.submittedCount})`
  );
}

function formatReviewStudents(students: AssignmentStudentSummary[]) {
  if (students.length === 0) {
    return ['- No student-specific review needs yet.'];
  }

  return students.map(
    (student) =>
      `- ${student.studentLabel}: ${student.latestAccuracy}% latest accuracy, ${student.needsReviewCount} items to review`
  );
}
