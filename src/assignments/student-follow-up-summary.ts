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
  followUpRecommendation: string;
  latestAccuracyLabel: string;
  reviewItemCountLabel: string;
  studentKey: string;
  studentLabel: string;
  text: string;
};

export type AssignmentStudentFollowUpSummary = {
  studentViews: AssignmentStudentFollowUpSummaryStudentView[];
  students: AssignmentStudentSummary[];
  text: string;
  title: string;
};

export function buildAssignmentStudentFollowUpSummary({
  assignmentTitle,
  students,
}: AssignmentStudentFollowUpSummaryInput): AssignmentStudentFollowUpSummary {
  const sortedStudents = sortAssignmentStudentsByFollowUpPriority(students);
  const studentViews =
    buildAssignmentStudentFollowUpSummaryStudentViews(sortedStudents);
  const copyTitle = formatAssignmentResultCopyTitle(assignmentTitle);
  const title = m.assignment_student_follow_up_title({ title: copyTitle });

  const lines = [title, '', ...formatStudents(studentViews)];

  return {
    studentViews,
    students: sortedStudents,
    text: joinAssignmentResultCopyLines(lines),
    title,
  };
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
  const followUpRecommendation = formatStudentFollowUpRecommendation(
    student.needsReviewCount
  );

  return {
    attemptsLabel,
    averageAccuracyLabel,
    bestAccuracyLabel,
    followUpRecommendation,
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
      recommendation: followUpRecommendation,
      reviewCount: reviewItemCountLabel,
      student: studentLabel,
    }),
  };
}

function formatStudentFollowUpRecommendation(needsReviewCount: number) {
  return needsReviewCount > 0
    ? m.assignment_student_follow_up_recommendation_review()
    : m.assignment_student_follow_up_recommendation_extend();
}

function formatStudents(
  students: AssignmentStudentFollowUpSummaryStudentView[]
) {
  if (students.length === 0) {
    return [m.assignment_student_follow_up_empty()];
  }

  return students.map((student) => student.text);
}
