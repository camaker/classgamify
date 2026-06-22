import {
  formatAssignmentSummaryAccuracy,
  formatAssignmentSummaryAttemptCount,
  formatAssignmentSummaryReviewItemCount,
} from '@/assignments/result-summary-format';
import { sortAssignmentStudentsByFollowUpPriority } from '@/assignments/student-follow-up-priority';
import type { AssignmentStudentSummary } from '@/assignments/results';
import { m } from '@/locale/paraglide/messages';

export type AssignmentStudentFollowUpSummaryInput = {
  assignmentTitle: string;
  students: AssignmentStudentSummary[];
};

export function buildAssignmentStudentFollowUpSummary({
  assignmentTitle,
  students,
}: AssignmentStudentFollowUpSummaryInput) {
  const sortedStudents = sortAssignmentStudentsByFollowUpPriority(students);

  const lines = [
    m.assignment_student_follow_up_title({ title: assignmentTitle }),
    '',
    ...formatStudents(sortedStudents),
  ];

  return lines.join('\n');
}

function formatStudents(students: AssignmentStudentSummary[]) {
  if (students.length === 0) {
    return [m.assignment_student_follow_up_empty()];
  }

  return students.map((student, index) =>
    m.assignment_student_follow_up_line({
      attempts: formatAssignmentSummaryAttemptCount(student.attempts),
      average: formatAssignmentSummaryAccuracy(student.averageAccuracy),
      best: formatAssignmentSummaryAccuracy(student.bestAccuracy),
      index: index + 1,
      latest: formatAssignmentSummaryAccuracy(student.latestAccuracy),
      reviewCount: formatAssignmentSummaryReviewItemCount(
        student.needsReviewCount
      ),
      student: student.studentLabel,
    })
  );
}
