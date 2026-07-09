import type {
  AssignmentAttemptReview,
  AssignmentItemAnalysis,
  AssignmentStudentSummary,
} from '@/assignments/results';
import { buildAssignmentAttemptStatsView } from '@/assignments/attempt-stats';
import { formatAttemptDuration } from '@/assignments/attempt-duration';
import { formatAssignmentResultNumber } from '@/assignments/result-format';
import {
  formatAssignmentResultItemNumberLabel,
  formatAssignmentResultPromptLabel,
  formatAssignmentResultStudentLabel,
} from '@/assignments/result-display';
import {
  formatAssignmentSummaryAccuracy,
  formatAssignmentSummaryCorrectCount,
  formatAssignmentSummaryItemPerformance,
  formatAssignmentSummaryReviewCount,
  formatAssignmentSummaryReviewItemCount,
} from '@/assignments/result-summary-format';
import {
  buildLatestAttemptReviewByStudentKey,
  formatStudentFollowUpLastSubmitted,
  formatStudentFollowUpLastSubmittedContext,
  formatStudentFollowUpLatestAttemptDuration,
  formatStudentFollowUpLatestAttemptCompletedAt,
  formatStudentFollowUpLatestAttemptSummary,
  formatStudentFollowUpRecommendation,
  formatStudentFollowUpSubmittedContext,
} from '@/assignments/student-follow-up-summary';
import { getAssignmentReviewPriorityItems } from '@/assignments/review-priority';
import {
  buildAssignmentStudentFollowUpPriorityHandoffView,
  getAssignmentStudentFollowUpPriorityStudents,
  type AssignmentStudentFollowUpPriorityHandoffView,
} from '@/assignments/student-follow-up-priority';
import {
  formatAssignmentResultCopyLine,
  formatAssignmentResultCopyOrdinal,
  formatAssignmentResultCopyTitle,
  joinAssignmentResultCopyLines,
} from '@/assignments/result-copy-format';
import { m } from '@/locale/paraglide/messages';

type AssignmentClassroomBriefStats = {
  averageDurationSeconds: number | null | undefined;
  averagePoints: number;
  averageScore: number;
  completions: number;
};

type AssignmentClassroomBriefInput = {
  assignmentTitle: string;
  attempts?: AssignmentAttemptReview[];
  items: AssignmentItemAnalysis[];
  stats: AssignmentClassroomBriefStats;
  students: AssignmentStudentSummary[];
};

export type AssignmentClassroomBrief = {
  copyPreview: AssignmentClassroomBriefCopyPreview;
  focusItemViews: AssignmentClassroomBriefFocusItemView[];
  focusItems: AssignmentItemAnalysis[];
  followUpPriorityHandoffView: AssignmentStudentFollowUpPriorityHandoffView;
  followUpStudentViews: AssignmentClassroomBriefFollowUpStudentView[];
  followUpStudents: AssignmentStudentSummary[];
  scopeLabel: string;
  scopeSummary: AssignmentClassroomBriefScopeSummary;
  scopeViews: AssignmentClassroomBriefScopeView[];
  statSummaryLabel: string;
  statViews: AssignmentClassroomBriefStatView[];
  text: string;
};

export type AssignmentClassroomBriefStatView = {
  ariaLabel: string;
  description: string;
  key: 'average-accuracy' | 'average-points' | 'average-time' | 'completions';
  label: string;
  text: string;
  value: string;
};

export type AssignmentClassroomBriefCopyPreview = {
  label: string;
  text: string;
};

export type AssignmentClassroomBriefScopeId =
  | 'attempts'
  | 'focus-items'
  | 'students'
  | 'total-items';

export type AssignmentClassroomBriefScopeSummary = {
  attemptCount: number;
  focusItemCount: number;
  followUpStudentCount: number;
  totalItemCount: number;
};

export type AssignmentClassroomBriefScopeView = {
  ariaLabel: string;
  description: string;
  id: AssignmentClassroomBriefScopeId;
  label: string;
  value: string;
};

export type AssignmentClassroomBriefFocusItemView = {
  correctRateLabel: string;
  correctSummaryLabel: string;
  itemId: string;
  itemNumberLabel: string;
  kindLabel: string;
  performanceLabel: string;
  prompt: string;
  promptLabel: string;
  text: string;
};

export type AssignmentClassroomBriefFollowUpStudentView = {
  accuracyLabel: string;
  followUpRecommendation: string;
  latestAttemptDurationLabel: string | null;
  lastSubmittedLabel: string | null;
  latestAccuracyLabel: string;
  latestAttemptCompletedAtLabel: string | null;
  latestAttemptSummaryLabel: string | null;
  needsReviewLabel: string;
  reviewItemCountLabel: string;
  submittedContextLabel: string | null;
  studentKey: string;
  studentLabel: string;
  text: string;
};

export const ASSIGNMENT_CLASSROOM_BRIEF_LIMITS = {
  focusItems: 3,
  followUpStudents: 6,
} as const;

export function buildAssignmentClassroomBrief({
  assignmentTitle,
  attempts = [],
  items,
  stats,
  students,
}: AssignmentClassroomBriefInput): AssignmentClassroomBrief {
  const focusItems = getClassroomBriefFocusItems(items);
  const followUpStudents = getClassroomBriefFollowUpStudents(students);
  const statViews = buildAssignmentClassroomBriefStatViews(stats);
  const focusItemViews =
    buildAssignmentClassroomBriefFocusItemViews(focusItems);
  const followUpStudentViews =
    buildAssignmentClassroomBriefFollowUpStudentViews(followUpStudents, {
      attempts,
    });
  const followUpPriorityHandoffView =
    buildAssignmentStudentFollowUpPriorityHandoffView({
      limit: ASSIGNMENT_CLASSROOM_BRIEF_LIMITS.followUpStudents,
      selectedStudents: followUpStudents,
      students,
      surface: 'classroom-brief',
    });
  const scopeSummary = buildAssignmentClassroomBriefScopeSummary({
    attempts,
    focusItems,
    items,
    followUpStudents,
  });
  const scopeViews = buildAssignmentClassroomBriefScopeViews(scopeSummary);
  const copyTitle = formatAssignmentResultCopyTitle(assignmentTitle);
  const lines = [
    m.assignment_classroom_brief_title({ title: copyTitle }),
    '',
    ...statViews.map((statView) => statView.text),
    '',
    m.assignment_classroom_brief_focus_heading(),
    ...formatFocusItems(focusItemViews),
    '',
    m.assignment_classroom_brief_follow_up_heading(),
    ...formatFollowUpStudents(followUpStudentViews),
  ];
  const text = joinAssignmentResultCopyLines(lines);

  return {
    copyPreview: {
      label: m.assignment_classroom_brief_copy_preview_label(),
      text,
    },
    focusItemViews,
    focusItems,
    followUpPriorityHandoffView,
    followUpStudentViews,
    followUpStudents,
    scopeLabel: m.assignment_classroom_brief_scope_label(),
    scopeSummary,
    scopeViews,
    statSummaryLabel: m.assignment_classroom_brief_stats_label(),
    statViews,
    text,
  };
}

export function buildAssignmentClassroomBriefScopeSummary({
  attempts,
  focusItems,
  followUpStudents,
  items,
}: {
  attempts: AssignmentAttemptReview[];
  focusItems: AssignmentItemAnalysis[];
  followUpStudents: AssignmentStudentSummary[];
  items: AssignmentItemAnalysis[];
}): AssignmentClassroomBriefScopeSummary {
  return {
    attemptCount: normalizeAssignmentClassroomBriefScopeCount(attempts.length),
    focusItemCount: normalizeAssignmentClassroomBriefScopeCount(
      focusItems.length
    ),
    followUpStudentCount: normalizeAssignmentClassroomBriefScopeCount(
      followUpStudents.length
    ),
    totalItemCount: normalizeAssignmentClassroomBriefScopeCount(items.length),
  };
}

export function buildAssignmentClassroomBriefScopeViews(
  summary: AssignmentClassroomBriefScopeSummary
): AssignmentClassroomBriefScopeView[] {
  const scopeViews = [
    {
      description: m.assignment_classroom_brief_scope_attempts_description(),
      id: 'attempts',
      label: m.assignment_classroom_brief_scope_attempts_label(),
      value: formatAssignmentResultNumber(summary.attemptCount, { min: 0 }),
    },
    {
      description: m.assignment_classroom_brief_scope_students_description(),
      id: 'students',
      label: m.assignment_classroom_brief_scope_students_label(),
      value: formatAssignmentResultNumber(summary.followUpStudentCount, {
        min: 0,
      }),
    },
    {
      description: m.assignment_classroom_brief_scope_focus_items_description(),
      id: 'focus-items',
      label: m.assignment_classroom_brief_scope_focus_items_label(),
      value: formatAssignmentResultNumber(summary.focusItemCount, { min: 0 }),
    },
    {
      description: m.assignment_classroom_brief_scope_total_items_description(),
      id: 'total-items',
      label: m.assignment_classroom_brief_scope_total_items_label(),
      value: formatAssignmentResultNumber(summary.totalItemCount, { min: 0 }),
    },
  ];

  return scopeViews.map((scopeView) => ({
    ...scopeView,
    ariaLabel: m.assignment_classroom_brief_scope_item_aria_label({
      description: scopeView.description,
      label: scopeView.label,
      value: scopeView.value,
    }),
  }));
}

function normalizeAssignmentClassroomBriefScopeCount(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

export function buildAssignmentClassroomBriefStatViews(
  stats: AssignmentClassroomBriefStats
): AssignmentClassroomBriefStatView[] {
  const statsView = buildAssignmentAttemptStatsView(stats);

  return [
    {
      ariaLabel: m.assignment_classroom_brief_stat_aria_label({
        description: m.assignment_result_metric_completions_description(),
        label: m.assignment_result_metric_completions(),
        value: formatAssignmentResultNumber(statsView.completions ?? 0, {
          min: 0,
        }),
      }),
      description: m.assignment_result_metric_completions_description(),
      key: 'completions',
      label: m.assignment_result_metric_completions(),
      text: m.assignment_classroom_brief_completions({
        count: statsView.completions ?? 0,
      }),
      value: formatAssignmentResultNumber(statsView.completions ?? 0, {
        min: 0,
      }),
    },
    {
      ariaLabel: m.assignment_classroom_brief_stat_aria_label({
        description: m.assignment_result_metric_average_accuracy_description(),
        label: m.assignment_result_metric_average_accuracy(),
        value: formatAssignmentSummaryAccuracy(statsView.averageScore),
      }),
      description: m.assignment_result_metric_average_accuracy_description(),
      key: 'average-accuracy',
      label: m.assignment_result_metric_average_accuracy(),
      text: m.assignment_classroom_brief_average_accuracy({
        accuracy: formatAssignmentSummaryAccuracy(statsView.averageScore),
      }),
      value: formatAssignmentSummaryAccuracy(statsView.averageScore),
    },
    {
      ariaLabel: m.assignment_classroom_brief_stat_aria_label({
        description: m.assignment_result_metric_average_points_description(),
        label: m.assignment_result_metric_average_points(),
        value: formatAssignmentResultNumber(statsView.averagePoints),
      }),
      description: m.assignment_result_metric_average_points_description(),
      key: 'average-points',
      label: m.assignment_result_metric_average_points(),
      text: m.assignment_classroom_brief_average_points({
        points: formatAssignmentResultNumber(statsView.averagePoints),
      }),
      value: formatAssignmentResultNumber(statsView.averagePoints),
    },
    {
      ariaLabel: m.assignment_classroom_brief_stat_aria_label({
        description: m.assignment_result_metric_average_time_description(),
        label: m.assignment_result_metric_average_time(),
        value: formatAttemptDuration(statsView.averageDurationSeconds),
      }),
      description: m.assignment_result_metric_average_time_description(),
      key: 'average-time',
      label: m.assignment_result_metric_average_time(),
      text: m.assignment_classroom_brief_average_time({
        time: formatAttemptDuration(statsView.averageDurationSeconds),
      }),
      value: formatAttemptDuration(statsView.averageDurationSeconds),
    },
  ];
}

function buildAssignmentClassroomBriefFocusItemViews(
  items: AssignmentItemAnalysis[]
) {
  return items.map((item, index) =>
    buildAssignmentClassroomBriefFocusItemView({
      index,
      item,
    })
  );
}

function buildAssignmentClassroomBriefFollowUpStudentViews(
  students: AssignmentStudentSummary[],
  options?: {
    attempts?: AssignmentAttemptReview[];
  }
) {
  const latestAttemptByStudentKey = buildLatestAttemptReviewByStudentKey(
    options?.attempts ?? []
  );

  return students.map((student, index) =>
    buildAssignmentClassroomBriefFollowUpStudentView({
      index,
      latestAttempt: latestAttemptByStudentKey.get(student.studentKey),
      student,
    })
  );
}

export function buildAssignmentClassroomBriefFocusItemView({
  index,
  item,
}: {
  index: number;
  item: AssignmentItemAnalysis;
}): AssignmentClassroomBriefFocusItemView {
  const itemNumberLabel = formatAssignmentResultItemNumberLabel(index);
  const performanceLabel = formatAssignmentSummaryItemPerformance(item);
  const promptLabel = formatAssignmentResultPromptLabel({
    itemNumberLabel,
    prompt: item.prompt,
  });

  return {
    correctRateLabel: formatAssignmentSummaryAccuracy(item.correctRate),
    correctSummaryLabel: formatAssignmentSummaryCorrectCount(item),
    itemId: item.itemId,
    itemNumberLabel,
    kindLabel: item.kindLabel,
    performanceLabel,
    prompt: item.prompt,
    promptLabel,
    text: m.assignment_classroom_brief_focus_item({
      performance: performanceLabel,
      promptLabel,
    }),
  };
}

export function buildAssignmentClassroomBriefFollowUpStudentView({
  index,
  latestAttempt,
  student,
}: {
  index: number;
  latestAttempt?: AssignmentAttemptReview;
  student: AssignmentStudentSummary;
}): AssignmentClassroomBriefFollowUpStudentView {
  const studentLabel = formatAssignmentResultStudentLabel(student.studentLabel);
  const latestAccuracyLabel = formatAssignmentSummaryAccuracy(
    student.latestAccuracy
  );
  const reviewItemCountLabel = formatAssignmentSummaryReviewItemCount(
    student.needsReviewCount
  );
  const followUpRecommendation = formatStudentFollowUpRecommendation(
    student.needsReviewCount
  );
  const lastSubmittedLabel = formatStudentFollowUpLastSubmitted(student);
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
    accuracy: latestAccuracyLabel,
    index: formatAssignmentResultCopyOrdinal(index),
    lastSubmittedContext: lastSubmittedContextLabel,
    recommendation: followUpRecommendation,
    reviewCount: reviewItemCountLabel,
    student: studentLabel,
  };

  return {
    accuracyLabel: formatAssignmentBriefStudentAccuracy(student),
    followUpRecommendation,
    latestAttemptDurationLabel,
    lastSubmittedLabel,
    latestAccuracyLabel,
    latestAttemptCompletedAtLabel,
    latestAttemptSummaryLabel,
    needsReviewLabel: formatAssignmentSummaryReviewCount(
      student.needsReviewCount
    ),
    reviewItemCountLabel,
    submittedContextLabel,
    studentKey: student.studentKey,
    studentLabel,
    text: formatAssignmentResultCopyLine(
      latestAttemptSummaryLabel
        ? m.assignment_classroom_brief_follow_up_student_with_latest_attempt({
            ...lineInput,
            latestAttemptSummary: latestAttemptSummaryLabel,
          })
        : m.assignment_classroom_brief_follow_up_student(lineInput)
    ),
  };
}

export function formatAssignmentBriefStudentAccuracy({
  bestAccuracy,
  latestAccuracy,
}: Pick<AssignmentStudentSummary, 'bestAccuracy' | 'latestAccuracy'>) {
  return m.assignment_result_brief_student_accuracy({
    best: formatAssignmentSummaryAccuracy(bestAccuracy),
    latest: formatAssignmentSummaryAccuracy(latestAccuracy),
  });
}

function getClassroomBriefFocusItems(items: AssignmentItemAnalysis[]) {
  return getAssignmentReviewPriorityItems(items, {
    limit: ASSIGNMENT_CLASSROOM_BRIEF_LIMITS.focusItems,
  });
}

function getClassroomBriefFollowUpStudents(
  students: AssignmentStudentSummary[]
) {
  return getAssignmentStudentFollowUpPriorityStudents(students, {
    limit: ASSIGNMENT_CLASSROOM_BRIEF_LIMITS.followUpStudents,
  });
}

function formatFocusItems(items: AssignmentClassroomBriefFocusItemView[]) {
  if (items.length === 0) {
    return [m.assignment_classroom_brief_empty_items()];
  }

  return items.map((item) => item.text);
}

function formatFollowUpStudents(
  students: AssignmentClassroomBriefFollowUpStudentView[]
) {
  if (students.length === 0) {
    return [m.assignment_classroom_brief_empty_students()];
  }

  return students.map((student) => student.text);
}
