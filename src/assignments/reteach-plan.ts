import type {
  AssignmentItemAnalysis,
  AssignmentStudentSummary,
} from '@/assignments/results';
import {
  formatAssignmentSummaryAccuracy,
  formatAssignmentSummaryItemPerformance,
  formatAssignmentSummaryReviewItemCount,
} from '@/assignments/result-summary-format';
import { getSubmittedAssignmentReviewPriorityItems } from '@/assignments/review-priority';
import { getAssignmentStudentFollowUpPriorityStudents } from '@/assignments/student-follow-up-priority';

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
  const reviewItems = getSubmittedAssignmentReviewPriorityItems(items, {
    limit: 5,
  });
  const reviewStudents = getAssignmentStudentFollowUpPriorityStudents(
    students,
    {
      limit: 8,
    }
  );
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
      `- ${index + 1}. ${item.prompt} (${formatAssignmentSummaryItemPerformance(item)})`
  );
}

function formatReviewStudents(students: AssignmentStudentSummary[]) {
  if (students.length === 0) {
    return ['- No student-specific review needs yet.'];
  }

  return students.map(
    (student) =>
      `- ${student.studentLabel}: ${formatAssignmentSummaryAccuracy(
        student.latestAccuracy
      )} latest accuracy, ${formatAssignmentSummaryReviewItemCount(
        student.needsReviewCount
      )}`
  );
}
