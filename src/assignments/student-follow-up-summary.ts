import {
  formatAssignmentSummaryAccuracy,
  formatAssignmentSummaryAttemptCount,
  formatAssignmentSummaryReviewItemCount,
} from '@/assignments/result-summary-format';
import {
  formatAssignmentResultCopyTitle,
  formatAssignmentResultCopyOrdinal,
  joinAssignmentResultCopyLines,
} from '@/assignments/result-copy-format';
import { formatAssignmentResultStudentLabel } from '@/assignments/result-display';
import { sortAssignmentStudentsByFollowUpPriority } from '@/assignments/student-follow-up-priority';
import type { AssignmentStudentSummary } from '@/assignments/results';
import { m } from '@/locale/paraglide/messages';

type AssignmentStudentFollowUpSummaryInput = {
  assignmentTitle: string;
  students: AssignmentStudentSummary[];
};

export type AssignmentStudentFollowUpSummaryStudentView = {
  attemptsLabel: string;
  averageAccuracyLabel: string;
  bestAccuracyLabel: string;
  latestAccuracyLabel: string;
  reviewItemCountLabel: string;
  studentKey: string;
  studentLabel: string;
  text: string;
};

export function buildAssignmentStudentFollowUpSummary({
  assignmentTitle,
  students,
}: AssignmentStudentFollowUpSummaryInput) {
  const sortedStudents = sortAssignmentStudentsByFollowUpPriority(students);
  const studentViews =
    buildAssignmentStudentFollowUpSummaryStudentViews(sortedStudents);
  const copyTitle = formatAssignmentResultCopyTitle(assignmentTitle);

  const lines = [
    m.assignment_student_follow_up_title({ title: copyTitle }),
    '',
    ...formatStudents(studentViews),
  ];

  return joinAssignmentResultCopyLines(lines);
}

export function buildAssignmentStudentFollowUpSummaryStudentViews(
  students: AssignmentStudentSummary[]
): AssignmentStudentFollowUpSummaryStudentView[] {
  return students.map((student, index) =>
    buildAssignmentStudentFollowUpSummaryStudentView({ index, student })
  );
}

export function buildAssignmentStudentFollowUpSummaryStudentView({
  index,
  student,
}: {
  index: number;
  student: AssignmentStudentSummary;
}): AssignmentStudentFollowUpSummaryStudentView {
  const studentLabel = formatAssignmentResultStudentLabel(student.studentLabel);
  const attemptsLabel = formatAssignmentSummaryAttemptCount(student.attempts);
  const averageAccuracyLabel = formatAssignmentSummaryAccuracy(
    student.averageAccuracy
  );
  const bestAccuracyLabel = formatAssignmentSummaryAccuracy(
    student.bestAccuracy
  );
  const latestAccuracyLabel = formatAssignmentSummaryAccuracy(
    student.latestAccuracy
  );
  const reviewItemCountLabel = formatAssignmentSummaryReviewItemCount(
    student.needsReviewCount
  );

  return {
    attemptsLabel,
    averageAccuracyLabel,
    bestAccuracyLabel,
    latestAccuracyLabel,
    reviewItemCountLabel,
    studentKey: student.studentKey,
    studentLabel,
    text: m.assignment_student_follow_up_line({
      attempts: attemptsLabel,
      average: averageAccuracyLabel,
      best: bestAccuracyLabel,
      index: formatAssignmentResultCopyOrdinal(index),
      latest: latestAccuracyLabel,
      reviewCount: reviewItemCountLabel,
      student: studentLabel,
    }),
  };
}

function formatStudents(
  students: AssignmentStudentFollowUpSummaryStudentView[]
) {
  if (students.length === 0) {
    return [m.assignment_student_follow_up_empty()];
  }

  return students.map((student) => student.text);
}
