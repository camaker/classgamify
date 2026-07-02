import {
  formatAssignmentSummaryAccuracy,
  formatAssignmentSummaryAttemptCount,
  formatAssignmentSummaryReviewItemCount,
  normalizeAssignmentSummaryCount,
} from '@/assignments/result-summary-format';
import {
  formatAssignmentResultCopyLine,
  formatAssignmentResultCopyTitle,
  formatAssignmentResultCopyOrdinal,
  joinAssignmentResultCopyLines,
} from '@/assignments/result-copy-format';
import {
  formatAssignmentResultDate,
  formatAssignmentResultNumber,
  formatAssignmentResultValue,
} from '@/assignments/result-format';
import { buildAttemptDurationDisplayView } from '@/assignments/attempt-duration';
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
  latestAttemptDurationLabel: string | null;
  lastSubmittedLabel: string | null;
  latestAccuracyLabel: string;
  latestAttemptCompletedAtLabel: string | null;
  latestAttemptSummaryLabel: string | null;
  reviewItemCountLabel: string;
  submittedContextLabel: string | null;
  studentKey: string;
  studentLabel: string;
  text: string;
};

export type AssignmentStudentFollowUpSummaryCoverageItemId =
  | 'latest-attempt-details'
  | 'last-submitted-context'
  | 'review-needed-students'
  | 'students';

export type AssignmentStudentFollowUpSummaryCoverageItemView = {
  description: string;
  id: AssignmentStudentFollowUpSummaryCoverageItemId;
  label: string;
  value: string;
};

export type AssignmentStudentFollowUpSummary = {
  coverageViews: AssignmentStudentFollowUpSummaryCoverageItemView[];
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
    coverageViews: buildAssignmentStudentFollowUpSummaryCoverageViews({
      studentViews,
      students: sortedStudents,
    }),
    studentViews,
    students: sortedStudents,
    text: joinAssignmentResultCopyLines(lines),
    title,
  };
}

export function buildAssignmentStudentFollowUpSummaryCoverageViews(input: {
  studentViews: AssignmentStudentFollowUpSummaryStudentView[];
  students: AssignmentStudentSummary[];
}): AssignmentStudentFollowUpSummaryCoverageItemView[] {
  const summary = buildAssignmentStudentFollowUpSummaryCoverage(input);

  return [
    {
      description:
        m.assignment_student_follow_up_coverage_students_description(),
      id: 'students',
      label: m.assignment_student_follow_up_coverage_students_label(),
      value: formatAssignmentStudentFollowUpCoverageCount(summary.studentCount),
    },
    {
      description:
        m.assignment_student_follow_up_coverage_review_needed_description(),
      id: 'review-needed-students',
      label: m.assignment_student_follow_up_coverage_review_needed_label(),
      value: formatAssignmentStudentFollowUpCoverageCount(
        summary.reviewNeededStudentCount
      ),
    },
    {
      description:
        m.assignment_student_follow_up_coverage_latest_attempts_description(),
      id: 'latest-attempt-details',
      label: m.assignment_student_follow_up_coverage_latest_attempts_label(),
      value: formatAssignmentStudentFollowUpCoverageCount(
        summary.latestAttemptDetailCount
      ),
    },
    {
      description:
        m.assignment_student_follow_up_coverage_last_submitted_description(),
      id: 'last-submitted-context',
      label: m.assignment_student_follow_up_coverage_last_submitted_label(),
      value: formatAssignmentStudentFollowUpCoverageCount(
        summary.lastSubmittedContextCount
      ),
    },
  ];
}

function buildAssignmentStudentFollowUpSummaryCoverage(input: {
  studentViews: AssignmentStudentFollowUpSummaryStudentView[];
  students: AssignmentStudentSummary[];
}) {
  return {
    lastSubmittedContextCount: countAssignmentStudentFollowUpViews(
      input.studentViews,
      (studentView) => Boolean(studentView.lastSubmittedLabel)
    ),
    latestAttemptDetailCount: countAssignmentStudentFollowUpViews(
      input.studentViews,
      (studentView) => Boolean(studentView.latestAttemptSummaryLabel)
    ),
    reviewNeededStudentCount: countAssignmentStudentFollowUpStudents(
      input.students,
      (student) => normalizeAssignmentSummaryCount(student.needsReviewCount) > 0
    ),
    studentCount: input.studentViews.length,
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
  const latestAttemptDurationLabel = latestAttempt
    ? formatStudentFollowUpLatestAttemptDuration(latestAttempt)
    : null;
  const latestAttemptSummaryLabel = latestAttempt
    ? formatStudentFollowUpLatestAttemptSummary({
        attempt: latestAttempt,
        completedAtLabel: latestAttemptCompletedAtLabel,
        durationLabel: latestAttemptDurationLabel,
      })
    : null;
  const lastSubmittedContextLabel = formatStudentFollowUpLastSubmittedContext({
    lastSubmittedLabel,
    latestAttemptCompletedAtLabel,
  });
  const submittedContextLabel = formatStudentFollowUpSubmittedContext({
    lastSubmittedLabel,
    latestAttemptCompletedAtLabel,
  });
  const lineInput = {
    attempts: attemptsLabel,
    average: averageAccuracyLabel,
    best: bestAccuracyLabel,
    index: formatAssignmentResultCopyOrdinal(index),
    latest: latestAccuracyLabel,
    lastSubmittedContext: lastSubmittedContextLabel,
    recommendation: followUpRecommendation,
    reviewCount: reviewItemCountLabel,
    student: studentLabel,
  };

  return {
    attemptsLabel,
    averageAccuracyLabel,
    bestAccuracyLabel,
    followUpRecommendation,
    latestAttemptDurationLabel,
    lastSubmittedLabel,
    latestAccuracyLabel,
    latestAttemptCompletedAtLabel,
    latestAttemptSummaryLabel,
    reviewItemCountLabel,
    submittedContextLabel,
    studentKey: student.studentKey,
    studentLabel,
    text: formatAssignmentResultCopyLine(
      latestAttemptSummaryLabel
        ? m.assignment_student_follow_up_line_with_latest_attempt({
            ...lineInput,
            latestAttemptSummary: latestAttemptSummaryLabel,
          })
        : m.assignment_student_follow_up_line(lineInput)
    ),
  };
}

function countAssignmentStudentFollowUpViews(
  studentViews: AssignmentStudentFollowUpSummaryStudentView[],
  predicate: (
    studentView: AssignmentStudentFollowUpSummaryStudentView
  ) => boolean
) {
  return studentViews.filter(predicate).length;
}

function countAssignmentStudentFollowUpStudents(
  students: AssignmentStudentSummary[],
  predicate: (student: AssignmentStudentSummary) => boolean
) {
  return students.filter(predicate).length;
}

function formatAssignmentStudentFollowUpCoverageCount(value: number) {
  return formatAssignmentResultNumber(value, { min: 0 });
}

export function formatStudentFollowUpRecommendation(needsReviewCount: number) {
  return normalizeAssignmentSummaryCount(needsReviewCount) > 0
    ? m.assignment_student_follow_up_recommendation_review()
    : m.assignment_student_follow_up_recommendation_extend();
}

export function formatStudentFollowUpLatestAttemptSummary(
  input:
    | Pick<
        AssignmentAttemptReview,
        'answers' | 'completedAt' | 'durationSeconds'
      >
    | {
        attempt: Pick<
          AssignmentAttemptReview,
          'answers' | 'completedAt' | 'durationSeconds'
        >;
        completedAtLabel: string | null;
        durationLabel: string | null;
      }
) {
  const attempt = 'attempt' in input ? input.attempt : input;
  const summary = buildAssignmentAttemptReviewSummary(attempt);
  const completedAtLabel =
    'attempt' in input
      ? input.completedAtLabel
      : formatStudentFollowUpLatestAttemptCompletedAt(attempt);
  const durationLabel =
    'attempt' in input
      ? input.durationLabel
      : formatStudentFollowUpLatestAttemptDuration(attempt);
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

  if (completedAtLabel && durationLabel) {
    return m.assignment_student_follow_up_latest_attempt_summary_with_time_and_duration(
      {
        ...summaryInput,
        completedAt: formatAssignmentResultValue(completedAtLabel, {
          emptyValue: '',
        }),
        duration: durationLabel,
      }
    );
  }

  if (completedAtLabel) {
    return m.assignment_student_follow_up_latest_attempt_summary_with_time({
      ...summaryInput,
      completedAt: formatAssignmentResultValue(completedAtLabel, {
        emptyValue: '',
      }),
    });
  }

  if (durationLabel) {
    return m.assignment_student_follow_up_latest_attempt_summary_with_duration({
      ...summaryInput,
      duration: durationLabel,
    });
  }

  return m.assignment_student_follow_up_latest_attempt_summary(summaryInput);
}

export function formatStudentFollowUpLatestAttemptDuration(
  attempt: Pick<AssignmentAttemptReview, 'durationSeconds'>
) {
  const durationView = buildAttemptDurationDisplayView({
    durationSeconds: attempt.durationSeconds,
  });

  return durationView.empty
    ? null
    : formatAssignmentResultValue(durationView.label, { emptyValue: '' });
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

export function formatStudentFollowUpLastSubmittedContext({
  lastSubmittedLabel,
  latestAttemptCompletedAtLabel,
}: {
  lastSubmittedLabel: string | null;
  latestAttemptCompletedAtLabel: string | null;
}) {
  if (!lastSubmittedLabel || latestAttemptCompletedAtLabel) return '';

  return m.assignment_student_follow_up_last_submitted_context({
    lastSubmitted: lastSubmittedLabel,
  });
}

export function formatStudentFollowUpSubmittedContext({
  lastSubmittedLabel,
  latestAttemptCompletedAtLabel,
}: {
  lastSubmittedLabel: string | null;
  latestAttemptCompletedAtLabel: string | null;
}) {
  if (latestAttemptCompletedAtLabel) {
    return m.assignment_student_follow_up_latest_attempt_submitted_context({
      submittedAt: latestAttemptCompletedAtLabel,
    });
  }

  if (lastSubmittedLabel) {
    return m.assignment_student_follow_up_last_submitted_context({
      lastSubmitted: lastSubmittedLabel,
    });
  }

  return null;
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
