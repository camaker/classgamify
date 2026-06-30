import {
  formatAssignmentSummaryAccuracy,
  formatAssignmentSummaryAttemptCount,
  formatAssignmentSummaryReviewItemCount,
  normalizeAssignmentSummaryCount,
} from '@/assignments/result-summary-format';
import {
  formatAssignmentResultCopyTitle,
  formatAssignmentResultCopyOrdinal,
  joinAssignmentResultCopyLines,
} from '@/assignments/result-copy-format';
import {
  formatAssignmentResultDate,
  formatAssignmentResultValue,
} from '@/assignments/result-format';
import {
  formatAssignmentResultFraction,
  formatAssignmentResultStudentLabel,
} from '@/assignments/result-display';
import { buildAssignmentAttemptReviewSummary } from '@/assignments/result-review-summary';
import { sortAssignmentAttemptReviewsByCompletedAt } from '@/assignments/result-filters';
import { sortAssignmentStudentsByFollowUpPriority } from '@/assignments/student-follow-up-priority';
import type {
  AssignmentAttemptReview,
  AssignmentStudentSummary,
} from '@/assignments/results';
import { m } from '@/locale/paraglide/messages';

type AssignmentStudentFollowUpSummaryInput = {
  assignmentTitle: string;
  attempts?: AssignmentAttemptReview[];
  students: AssignmentStudentSummary[];
};

export type AssignmentStudentFollowUpSummaryStudentView = {
  attemptsLabel: string;
  averageAccuracyLabel: string;
  bestAccuracyLabel: string;
  followUpRecommendation: string;
  lastSubmittedLabel: string | null;
  latestAccuracyLabel: string;
  latestAttemptCompletedAtLabel: string | null;
  latestAttemptSummaryLabel: string | null;
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
  attempts = [],
  students,
}: AssignmentStudentFollowUpSummaryInput): AssignmentStudentFollowUpSummary {
  const sortedStudents = sortAssignmentStudentsByFollowUpPriority(students);
  const studentViews = buildAssignmentStudentFollowUpSummaryStudentViews(
    sortedStudents,
    {
      attempts,
    }
  );
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
  students: AssignmentStudentSummary[],
  options?: {
    attempts?: AssignmentAttemptReview[];
  }
): AssignmentStudentFollowUpSummaryStudentView[] {
  const latestAttemptByStudentKey = buildLatestAttemptReviewByStudentKey(
    options?.attempts ?? []
  );

  return students.map((student, index) =>
    buildAssignmentStudentFollowUpSummaryStudentView({
      index,
      latestAttempt: latestAttemptByStudentKey.get(student.studentKey),
      student,
    })
  );
}

export function buildAssignmentStudentFollowUpSummaryStudentView({
  index,
  latestAttempt,
  student,
}: {
  index: number;
  latestAttempt?: AssignmentAttemptReview;
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
  const lastSubmittedLabel = formatStudentFollowUpLastSubmitted(student);
  const followUpRecommendation = formatStudentFollowUpRecommendation(
    student.needsReviewCount
  );
  const latestAttemptCompletedAtLabel = latestAttempt
    ? formatStudentFollowUpLatestAttemptCompletedAt(latestAttempt)
    : null;
  const latestAttemptSummaryLabel = latestAttempt
    ? formatStudentFollowUpLatestAttemptSummary({
        attempt: latestAttempt,
        completedAtLabel: latestAttemptCompletedAtLabel,
      })
    : null;
  const lineInput = {
    attempts: attemptsLabel,
    average: averageAccuracyLabel,
    best: bestAccuracyLabel,
    index: formatAssignmentResultCopyOrdinal(index),
    latest: latestAccuracyLabel,
    recommendation: followUpRecommendation,
    reviewCount: reviewItemCountLabel,
    student: studentLabel,
  };

  return {
    attemptsLabel,
    averageAccuracyLabel,
    bestAccuracyLabel,
    followUpRecommendation,
    lastSubmittedLabel,
    latestAccuracyLabel,
    latestAttemptCompletedAtLabel,
    latestAttemptSummaryLabel,
    reviewItemCountLabel,
    studentKey: student.studentKey,
    studentLabel,
    text: latestAttemptSummaryLabel
      ? m.assignment_student_follow_up_line_with_latest_attempt({
          ...lineInput,
          latestAttemptSummary: latestAttemptSummaryLabel,
        })
      : m.assignment_student_follow_up_line(lineInput),
  };
}

export function formatStudentFollowUpRecommendation(needsReviewCount: number) {
  return normalizeAssignmentSummaryCount(needsReviewCount) > 0
    ? m.assignment_student_follow_up_recommendation_review()
    : m.assignment_student_follow_up_recommendation_extend();
}

export function formatStudentFollowUpLatestAttemptSummary(
  input:
    | Pick<AssignmentAttemptReview, 'answers' | 'completedAt'>
    | {
        attempt: Pick<AssignmentAttemptReview, 'answers' | 'completedAt'>;
        completedAtLabel: string | null;
      }
) {
  const attempt = 'attempt' in input ? input.attempt : input;
  const summary = buildAssignmentAttemptReviewSummary(attempt);
  const completedAtLabel =
    'attempt' in input
      ? input.completedAtLabel
      : formatStudentFollowUpLatestAttemptCompletedAt(attempt);
  const summaryInput = {
    correct: formatAssignmentResultFraction(
      summary.correctItemCount,
      summary.totalItemCount
    ),
    needsReview: formatAssignmentSummaryReviewItemCount(
      summary.needsReviewItemCount
    ),
    submitted: formatAssignmentResultFraction(
      summary.submittedItemCount,
      summary.totalItemCount
    ),
  };

  if (completedAtLabel) {
    return m.assignment_student_follow_up_latest_attempt_summary_with_time({
      ...summaryInput,
      completedAt: formatAssignmentResultValue(completedAtLabel, {
        emptyValue: '',
      }),
    });
  }

  return m.assignment_student_follow_up_latest_attempt_summary(summaryInput);
}

export function formatStudentFollowUpLatestAttemptCompletedAt(
  attempt: Pick<AssignmentAttemptReview, 'completedAt'>
) {
  const completedAtLabel = formatAssignmentResultDate(attempt.completedAt, {
    emptyValue: '',
  });

  return completedAtLabel
    ? formatAssignmentResultValue(completedAtLabel, { emptyValue: '' })
    : null;
}

export function formatStudentFollowUpLastSubmitted(
  student: Pick<AssignmentStudentSummary, 'lastCompletedAt'>
) {
  const lastSubmittedLabel = formatAssignmentResultDate(
    student.lastCompletedAt,
    {
      emptyValue: '',
    }
  );

  return lastSubmittedLabel
    ? formatAssignmentResultValue(lastSubmittedLabel, { emptyValue: '' })
    : null;
}

export function buildLatestAttemptReviewByStudentKey(
  attempts: AssignmentAttemptReview[]
) {
  const latestAttemptByStudentKey = new Map<string, AssignmentAttemptReview>();

  for (const attempt of sortAssignmentAttemptReviewsByCompletedAt(attempts)) {
    if (!latestAttemptByStudentKey.has(attempt.studentKey)) {
      latestAttemptByStudentKey.set(attempt.studentKey, attempt);
    }
  }

  return latestAttemptByStudentKey;
}

function formatStudents(
  students: AssignmentStudentFollowUpSummaryStudentView[]
) {
  if (students.length === 0) {
    return [m.assignment_student_follow_up_empty()];
  }

  return students.map((student) => student.text);
}
