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
import { m } from '@/locale/paraglide/messages';

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
    m.assignment_reteach_plan_title({ title: assignmentTitle }),
    '',
    m.assignment_reteach_plan_review_first(),
    ...formatReviewItems(reviewItems),
    '',
    m.assignment_reteach_plan_follow_up(),
    ...formatReviewStudents(reviewStudents),
  ];

  return lines.join('\n');
}

function formatReviewItems(items: AssignmentItemAnalysis[]) {
  if (items.length === 0) {
    return [m.assignment_reteach_plan_empty_items()];
  }

  return items.map((item, index) =>
    m.assignment_reteach_plan_item({
      index: index + 1,
      performance: formatAssignmentSummaryItemPerformance(item),
      prompt: item.prompt,
    })
  );
}

function formatReviewStudents(students: AssignmentStudentSummary[]) {
  if (students.length === 0) {
    return [m.assignment_reteach_plan_empty_students()];
  }

  return students.map((student) =>
    m.assignment_reteach_plan_student({
      accuracy: formatAssignmentSummaryAccuracy(student.latestAccuracy),
      reviewCount: formatAssignmentSummaryReviewItemCount(
        student.needsReviewCount
      ),
      student: student.studentLabel,
    })
  );
}
