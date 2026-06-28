import type {
  AssignmentAttemptReview,
  AssignmentResultsAnalysis,
  AssignmentItemAnalysis,
  AssignmentStudentSummary,
} from '@/assignments/results';
import { formatAssignmentDisplayTitle } from '@/assignments/assignment-display';
import { buildAssignmentAttemptStatsView } from '@/assignments/attempt-stats';
import { buildAssignmentClassroomBrief } from '@/assignments/classroom-brief';
import {
  getAssignmentStatusLabel,
  isAssignmentExpired,
  isAssignmentOpen,
} from '@/assignments/lifecycle';
import {
  formatAttemptDuration,
  normalizeAttemptDurationSeconds,
} from '@/assignments/attempt-duration';
import {
  buildAssignmentSettingsSummaryView,
  formatAssignmentExpiry,
} from '@/assignments/delivery-summary';
import { normalizeStudentName } from '@/assignments/identity';
import {
  formatAssignmentResultNumber,
  formatAssignmentResultPercent,
  formatAssignmentResultValue,
  formatAssignmentResultDate,
} from '@/assignments/result-format';
import {
  buildAssignmentResultAcceptedAnswerView,
  buildAssignmentResultAnswerStatusView,
  buildAssignmentResultAttemptAnswerTextView,
} from '@/assignments/result-answer-view';
import {
  formatAssignmentSummaryCorrectCount,
  formatAssignmentSummaryReviewCount,
} from '@/assignments/result-summary-format';
import {
  formatAssignmentResultFraction,
  formatAssignmentResultItemNumberLabel,
  formatAssignmentResultPromptLabel,
  formatAssignmentResultStudentLabel,
  joinAssignmentResultSearchSummaryParts,
} from '@/assignments/result-display';
import {
  ATTEMPT_REVIEW_FILTER_VALUES,
  DEFAULT_ATTEMPT_REVIEW_FILTER,
  DEFAULT_ITEM_PERFORMANCE_SORT,
  DEFAULT_STUDENT_SUMMARY_SORT,
  ITEM_PERFORMANCE_SORT_VALUES,
  STUDENT_SUMMARY_SORT_VALUES,
  buildFilteredAttemptRows,
  filterAndSortStudentSummaries,
  filterAssignmentResultCompletedAttemptRows,
  filterAttemptReviews,
  normalizeResultSearch,
  resolveAssignmentResultViewState,
  sortItemPerformance,
  type AssignmentAttemptReviewRow,
  type AssignmentAttemptRowInput,
  type AssignmentResultResolvedViewState,
  type AssignmentResultSearchState,
  type AttemptReviewFilter,
  type ItemPerformanceSort,
  type StudentSummarySort,
} from '@/assignments/result-filters';
import { buildAssignmentSharePath } from '@/assignments/share-link';
import { normalizeAssignmentShareSlug } from '@/assignments/share-slug';
import { resolveAssignmentSnapshotSource } from '@/assignments/snapshot';
import {
  buildAssignmentResultActionButtons,
  buildAssignmentResultActionState,
  buildAssignmentResultClassroomBriefStats,
  type AssignmentResultActionButton,
  type AssignmentResultActionState,
} from '@/assignments/result-actions';
import type {
  ActivityTemplateType,
  AssignmentSettings,
  AssignmentStatus,
} from '@/activities/types';
import { getTemplateByType } from '@/activities/catalog';
import { m } from '@/locale/paraglide/messages';
import { Routes } from '@/lib/routes';

export {
  ATTEMPT_REVIEW_FILTER_VALUES,
  DEFAULT_ATTEMPT_REVIEW_FILTER,
  DEFAULT_ITEM_PERFORMANCE_SORT,
  DEFAULT_STUDENT_SUMMARY_SORT,
  ITEM_PERFORMANCE_SORT_VALUES,
  STUDENT_SUMMARY_SORT_VALUES,
  buildAssignmentResultControlRouteSearch,
  buildAssignmentResultControlSearchState,
  buildAssignmentResultRouteSearch,
  buildAssignmentResultSearchState,
  buildFilteredAttemptRows,
  filterAndSortStudentSummaries,
  filterAssignmentResultCompletedAttemptRows,
  filterAttemptReviews,
  matchesResultSearch,
  normalizeResultSearch,
  normalizeResultSearchQuery,
  parseAttemptReviewFilter,
  parseItemPerformanceSort,
  parseResultStudentSearch,
  parseStudentSummarySort,
  resolveAssignmentResultViewState,
  sortItemPerformance,
  sortStudentSummaries,
  type AssignmentAttemptReviewRow,
  type AssignmentAttemptRowInput,
  type AssignmentResultControlSearchUpdate,
  type AssignmentResultResolvedViewState,
  type AssignmentResultSearchState,
  type AttemptReviewFilter,
  type ItemPerformanceSort,
  type StudentSummarySort,
} from '@/assignments/result-filters';
export {
  assignmentResultActionDescriptors,
  assignmentResultActionOrder,
  buildAssignmentResultActionButtons,
  buildAssignmentResultActionExecutionPlan,
  buildAssignmentResultActionPayload,
  buildAssignmentResultActionState,
  buildAssignmentResultClassroomBriefStats,
  buildAssignmentResultCopyText,
  getAssignmentResultActionDisabledReason,
  getAssignmentResultActionCopy,
  getAssignmentResultActionGate,
  getAssignmentResultActionGateFromState,
  type AssignmentResultActionButton,
} from '@/assignments/result-actions';

export type AssignmentResultEmptyState = {
  description: string;
  title: string;
};

type AssignmentResultMetricKey =
  | 'average-accuracy'
  | 'average-points'
  | 'average-time'
  | 'closes'
  | 'completions';

type AssignmentResultMetricDescriptor = {
  key: AssignmentResultMetricKey;
  label: string;
};

type AssignmentResultSectionState = {
  showAnswerReview: boolean;
  showClassroomBrief: boolean;
  showItemPerformance: boolean;
  showReteachPriorities: boolean;
  showStudentSearch: boolean;
  showStudentSummary: boolean;
};

type AssignmentResultContentState = {
  hasAttemptReviewCards: boolean;
  hasAttemptRows: boolean;
  hasStudentSummaryRows: boolean;
};

type AssignmentResultPageBreadcrumb = {
  href?: string;
  isCurrentPage?: boolean;
  label: string;
};

type AssignmentResultControlOption<TValue extends string> = {
  label: string;
  value: TValue;
};

type AssignmentResultStudentSearchControlView = {
  hasSearchValue: boolean;
  sort: StudentSummarySort;
  sortOptions: Array<AssignmentResultControlOption<StudentSummarySort>>;
  summary: string;
  value: string;
};

type AssignmentResultItemPerformanceSortControlView = {
  options: Array<AssignmentResultControlOption<ItemPerformanceSort>>;
  sort: ItemPerformanceSort;
};

type AssignmentResultAttemptReviewFilterControlView = {
  filter: AttemptReviewFilter;
  options: Array<AssignmentResultControlOption<AttemptReviewFilter>>;
};

type AssignmentResultControlViews = {
  attemptReviewFilter: AssignmentResultAttemptReviewFilterControlView;
  itemPerformanceSort: AssignmentResultItemPerformanceSortControlView;
  studentSearch: AssignmentResultStudentSearchControlView;
};

type AssignmentAttemptRowDisplayInput = AssignmentAttemptRowInput & {
  completedAt: Date | string | null;
  maxScore: number | null;
  resultJson: {
    accuracy?: number;
    completedItemCount?: number;
    durationSeconds?: number;
    totalPoints?: number;
  } | null;
  score: number | null;
};

type AssignmentResultHeaderSource = {
  activity: {
    description: string | null;
    templateType: ActivityTemplateType;
    title: string;
  };
  assignment: {
    expiresAt: Date | string | null;
    id: string;
    shareSlug: string;
    status: AssignmentStatus | string;
    settingsJson: Partial<AssignmentSettings> | null;
    title: string;
  };
  snapshot: {
    activityDescription: string | null;
    activityTitle: string;
    templateType: ActivityTemplateType;
  } | null;
};

type AssignmentResultHeaderShareAction = {
  disabledReason: string | undefined;
  isAvailable: boolean;
  label: string;
  sharePath: string;
  shareSlug: string;
};

type AssignmentResultHeaderPrintAction = {
  label: string;
};

export type AssignmentResultsPageData<
  TAttempt extends AssignmentAttemptRowDisplayInput,
> = AssignmentResultHeaderSource & {
  analysis: AssignmentResultsAnalysis;
  attempts: TAttempt[];
  stats: {
    averageDurationSeconds: number | null | undefined;
    averagePoints: number;
    averageScore: number;
    completions: number;
  };
};

type AssignmentResultsPageViewModel<
  TAttempt extends AssignmentAttemptRowDisplayInput,
> = {
  actionButtons: AssignmentResultActionButton[];
  actionData: AssignmentResultsPageData<TAttempt> | null;
  actionState: AssignmentResultActionState;
  attemptReviewCardViews: ReturnType<
    typeof buildAssignmentAttemptReviewCardViews
  >;
  attemptRowViews: Array<ReturnType<typeof buildAssignmentAttemptRowDisplay>>;
  breadcrumbs: AssignmentResultPageBreadcrumb[];
  classroomBrief: ReturnType<typeof buildAssignmentClassroomBrief> | null;
  completedAttemptCount: number;
  completedAttemptReviewCount: number;
  completedAttempts: TAttempt[];
  contentState: AssignmentResultContentState;
  controlViews: AssignmentResultControlViews;
  description: string;
  headerView: ReturnType<typeof buildAssignmentResultHeaderView> | null;
  itemAnalysisCardViews: ReturnType<
    typeof buildAssignmentItemAnalysisCardViews
  >;
  loadErrorMessage: string;
  itemPerformanceRowViews: ReturnType<
    typeof buildAssignmentItemPerformanceRowViews
  >;
  metricItems: ReturnType<typeof buildAssignmentResultMetricItems>;
  resultView: ReturnType<typeof buildAssignmentResultViewModel<TAttempt>>;
  sectionState: AssignmentResultSectionState;
  studentSummaryRowViews: ReturnType<
    typeof buildAssignmentStudentSummaryRowViews
  >;
  title: string;
  viewState: AssignmentResultResolvedViewState;
};

type AssignmentResultsRouteState<
  TAttempt extends AssignmentAttemptRowDisplayInput,
> =
  | {
      pageView: AssignmentResultsPageViewModel<TAttempt>;
      status: 'loading';
    }
  | {
      pageView: AssignmentResultsPageViewModel<TAttempt>;
      status: 'error';
    }
  | {
      data: AssignmentResultsPageData<TAttempt>;
      pageView: AssignmentResultsPageViewModel<TAttempt>;
      status: 'ready';
    };

export const assignmentResultPageCopy = {
  get breadcrumbAssignments() {
    return m.assignment_result_page_breadcrumb_assignments();
  },
  get breadcrumbDashboard() {
    return m.assignment_result_page_breadcrumb_dashboard();
  },
  get defaultTitle() {
    return m.assignment_result_page_default_title();
  },
  get description() {
    return m.assignment_result_page_description();
  },
  get loadErrorMessage() {
    return m.assignment_result_page_load_error();
  },
  get openStudentLinkLabel() {
    return m.assignment_result_page_open_student_link();
  },
  get printWorksheetLabel() {
    return m.assignment_result_page_print_worksheet();
  },
  get studentLinkClosedMessage() {
    return m.assignment_result_page_student_link_closed();
  },
  get studentLinkDraftMessage() {
    return m.assignment_result_page_student_link_draft();
  },
  get studentLinkExpiredMessage() {
    return m.assignment_result_page_student_link_expired();
  },
  get studentLinkUnavailableLabel() {
    return m.assignment_result_page_student_link_unavailable();
  },
} as const;

export const assignmentResultSearchCopy = {
  get clearStudentSearchLabel() {
    return m.assignment_result_search_clear_student();
  },
  get findStudentLabel() {
    return m.assignment_result_search_find_student();
  },
  get placeholder() {
    return m.assignment_result_search_placeholder();
  },
  get reviewViewLabel() {
    return m.assignment_result_search_review_view();
  },
  get sortItemsLabel() {
    return m.assignment_result_search_sort_items();
  },
  get sortStudentsLabel() {
    return m.assignment_result_search_sort_students();
  },
} as const;

export const assignmentResultSectionCopy = {
  answerReview: {
    get description() {
      return m.assignment_result_section_answer_review_description();
    },
    get title() {
      return m.assignment_result_section_answer_review_title();
    },
  },
  classroomBrief: {
    get description() {
      return m.assignment_result_section_classroom_brief_description();
    },
    get title() {
      return m.assignment_result_section_classroom_brief_title();
    },
  },
  classReviewFocus: {
    get emptyMessage() {
      return m.assignment_result_section_class_review_focus_empty();
    },
    get title() {
      return m.assignment_result_section_class_review_focus_title();
    },
  },
  itemPerformance: {
    get description() {
      return m.assignment_result_section_item_performance_description();
    },
    get title() {
      return m.assignment_result_section_item_performance_title();
    },
  },
  reteachPriorities: {
    get description() {
      return m.assignment_result_section_reteach_priorities_description();
    },
    get emptyMessage() {
      return m.assignment_result_section_reteach_priorities_empty();
    },
    get title() {
      return m.assignment_result_section_reteach_priorities_title();
    },
  },
  studentAttempts: {
    get description() {
      return m.assignment_result_section_student_attempts_description();
    },
    get title() {
      return m.assignment_result_section_student_attempts_title();
    },
  },
  studentFollowUp: {
    get emptyMessage() {
      return m.assignment_result_section_student_follow_up_empty();
    },
    get title() {
      return m.assignment_result_section_student_follow_up_title();
    },
  },
  studentSummary: {
    get description() {
      return m.assignment_result_section_student_summary_description();
    },
    get title() {
      return m.assignment_result_section_student_summary_title();
    },
  },
} as const;

export const assignmentResultTableHeaders = {
  get itemPerformance() {
    return [
      m.assignment_result_table_header_item(),
      m.assignment_result_table_header_type(),
      m.assignment_result_table_header_correct_rate(),
      m.assignment_result_table_header_submitted(),
      m.assignment_result_table_header_expected(),
      m.assignment_result_table_header_accepted(),
      m.assignment_result_table_header_explanation(),
    ];
  },
  get studentAttempts() {
    return [
      m.assignment_result_table_header_student(),
      m.assignment_result_table_header_score(),
      m.assignment_result_table_header_accuracy(),
      m.assignment_result_table_header_answered(),
      m.assignment_result_table_header_time(),
      m.assignment_result_table_header_submitted(),
    ];
  },
  get studentSummary() {
    return [
      m.assignment_result_table_header_student(),
      m.assignment_result_table_header_attempts(),
      m.assignment_result_table_header_latest(),
      m.assignment_result_table_header_average(),
      m.assignment_result_table_header_best(),
      m.assignment_result_table_header_needs_review(),
      m.assignment_result_table_header_last_submitted(),
    ];
  },
} as const;

export const assignmentResultReviewCopy = {
  get acceptedAnswersLabel() {
    return m.assignment_result_review_accepted_answers();
  },
  get acceptedLabel() {
    return m.assignment_result_review_accepted();
  },
  get anonymousStudentLabel() {
    return m.student_identity_anonymous_student();
  },
  get correctAnswerLabel() {
    return m.assignment_result_review_correct();
  },
  get emptyValue() {
    return m.assignment_result_empty_value();
  },
  get expectedAnswerLabel() {
    return m.assignment_result_review_expected();
  },
  get itemAnswerLabel() {
    return m.assignment_result_review_item_answer();
  },
  get reviewAnswerLabel() {
    return m.assignment_result_review_review();
  },
  get studentAnswerLabel() {
    return m.assignment_result_review_student();
  },
  get unansweredAnswerText() {
    return m.assignment_result_review_unanswered();
  },
} as const;

const assignmentResultMetricDescriptors = [
  {
    key: 'completions',
    get label() {
      return m.assignment_result_metric_completions();
    },
  },
  {
    key: 'average-accuracy',
    get label() {
      return m.assignment_result_metric_average_accuracy();
    },
  },
  {
    key: 'average-points',
    get label() {
      return m.assignment_result_metric_average_points();
    },
  },
  {
    key: 'average-time',
    get label() {
      return m.assignment_result_metric_average_time();
    },
  },
  {
    key: 'closes',
    get label() {
      return m.assignment_result_metric_closes();
    },
  },
] satisfies Array<AssignmentResultMetricDescriptor>;

export const studentSummarySortOptions = buildAssignmentResultControlOptions(
  STUDENT_SUMMARY_SORT_VALUES,
  getStudentSummarySortOptionLabel
);

export const itemPerformanceSortOptions = buildAssignmentResultControlOptions(
  ITEM_PERFORMANCE_SORT_VALUES,
  getItemPerformanceSortOptionLabel
);

export const attemptReviewFilterOptions = buildAssignmentResultControlOptions(
  ATTEMPT_REVIEW_FILTER_VALUES,
  getAttemptReviewFilterOptionLabel
);

function buildAssignmentResultControlOptions<TValue extends string>(
  values: readonly TValue[],
  getLabel: (value: TValue) => string
): Array<AssignmentResultControlOption<TValue>> {
  return values.map((value) => ({
    get label() {
      return getLabel(value);
    },
    value,
  }));
}

function getStudentSummarySortOptionLabel(value: StudentSummarySort) {
  if (value === 'best') return m.assignment_result_sort_best_score();
  if (value === 'name') return m.assignment_result_sort_student_name();
  if (value === 'attempts') return m.assignment_result_sort_attempts();

  return m.assignment_result_sort_needs_review();
}

function getItemPerformanceSortOptionLabel(value: ItemPerformanceSort) {
  if (value === 'accuracy') return m.assignment_result_sort_lowest_accuracy();
  if (value === 'submitted') return m.assignment_result_sort_most_answered();
  if (value === 'type') return m.assignment_result_sort_item_type();

  return m.assignment_result_sort_snapshot_order();
}

function getAttemptReviewFilterOptionLabel(value: AttemptReviewFilter) {
  if (value === 'needs-review') {
    return m.assignment_result_filter_needs_review_only();
  }

  return m.assignment_result_filter_all_answers();
}

export function buildAssignmentResultMetricItems({
  averageDurationSeconds,
  averagePoints,
  averageScore,
  completions,
  expiresAt,
}: {
  averageDurationSeconds: number | null | undefined;
  averagePoints: number;
  averageScore: number;
  completions: number;
  expiresAt: Date | string | null | undefined;
}) {
  const statsView = buildAssignmentAttemptStatsView({
    averageDurationSeconds,
    averagePoints,
    averageScore,
    completions,
  });
  const valueByMetric = {
    'average-accuracy': formatAssignmentResultPercent(statsView.averageScore),
    'average-points': formatAssignmentResultNumber(statsView.averagePoints, {
      min: 0,
    }),
    'average-time': formatAttemptDuration(statsView.averageDurationSeconds),
    closes: formatAssignmentExpiry(expiresAt),
    completions: formatAssignmentResultNumber(statsView.completions, {
      min: 0,
    }),
  } satisfies Record<AssignmentResultMetricKey, string>;

  return assignmentResultMetricDescriptors.map((metric) => ({
    ...metric,
    value: valueByMetric[metric.key],
  }));
}

export function buildAssignmentResultHeaderView({
  activity,
  assignment,
  now,
  snapshot,
}: AssignmentResultHeaderSource & { now?: number }) {
  const resolvedSource = resolveAssignmentSnapshotSource({
    activity,
    snapshot,
  });
  const shareAction = buildAssignmentResultHeaderShareAction({
    expiresAt: assignment.expiresAt,
    now,
    shareSlug: assignment.shareSlug,
    status: assignment.status,
  });
  const templateType = resolvedSource.templateType;

  return {
    activityDescription: resolvedSource.activityDescription ?? '',
    activityTitle: resolvedSource.activityTitle,
    assignmentSharePath: shareAction.sharePath,
    assignmentTitle: formatAssignmentDisplayTitle(assignment.title),
    printAction: {
      label: assignmentResultPageCopy.printWorksheetLabel,
    } satisfies AssignmentResultHeaderPrintAction,
    settingsSummaryView: buildAssignmentSettingsSummaryView({
      expiresAt: assignment.expiresAt,
      settings: assignment.settingsJson,
    }),
    shareAction,
    shareSlug: shareAction.shareSlug,
    statusLabel: getAssignmentStatusLabel(
      assignment.status,
      assignment.expiresAt,
      now
    ),
    templateLabel: getTemplateByType(templateType).name,
    templateType,
  };
}

export function buildAssignmentResultHeaderShareAction({
  expiresAt,
  now,
  shareSlug,
  status,
}: {
  expiresAt: Date | string | null | undefined;
  now?: number;
  shareSlug: string;
  status: AssignmentStatus | string;
}): AssignmentResultHeaderShareAction {
  const resolvedNow = now ?? Date.now();
  const isAvailable = isAssignmentOpen(status, expiresAt, resolvedNow);
  const normalizedShareSlug = normalizeAssignmentShareSlug(shareSlug);

  return {
    disabledReason: isAvailable
      ? undefined
      : getAssignmentResultHeaderShareDisabledReason({
          expiresAt,
          now: resolvedNow,
          status,
        }),
    isAvailable,
    label: isAvailable
      ? assignmentResultPageCopy.openStudentLinkLabel
      : assignmentResultPageCopy.studentLinkUnavailableLabel,
    sharePath: buildAssignmentSharePath(normalizedShareSlug),
    shareSlug: normalizedShareSlug,
  };
}

function getAssignmentResultHeaderShareDisabledReason({
  expiresAt,
  now,
  status,
}: {
  expiresAt: Date | string | null | undefined;
  now: number;
  status: AssignmentStatus | string;
}) {
  if (status === 'published' && isAssignmentExpired(expiresAt, now)) {
    return assignmentResultPageCopy.studentLinkExpiredMessage;
  }

  if (status === 'closed') {
    return assignmentResultPageCopy.studentLinkClosedMessage;
  }

  return assignmentResultPageCopy.studentLinkDraftMessage;
}

export function getAssignmentResultCompletedAttemptCount(
  completions: number | null | undefined
) {
  return (
    buildAssignmentAttemptStatsView({
      completions: completions ?? undefined,
    }).completions ?? 0
  );
}

export function buildAssignmentResultSectionState({
  attemptCount,
  attemptReviewCount,
  classroomBriefReady,
  itemCount,
  studentCount,
}: {
  attemptCount: number;
  attemptReviewCount: number;
  classroomBriefReady: boolean;
  itemCount: number;
  studentCount: number;
}): AssignmentResultSectionState {
  return {
    showAnswerReview: attemptReviewCount > 0,
    showClassroomBrief: classroomBriefReady,
    showItemPerformance: itemCount > 0,
    showReteachPriorities: itemCount > 0,
    showStudentSearch: attemptCount > 0,
    showStudentSummary: studentCount > 0,
  };
}

export function buildAssignmentAttemptRowDisplay({
  attempt,
  review,
  studentLabel,
  timeLimitSeconds,
}: {
  attempt: AssignmentAttemptRowDisplayInput;
  review: AssignmentAttemptReview | undefined;
  studentLabel?: string;
  timeLimitSeconds?: number | null;
}) {
  const durationSeconds = normalizeAttemptDurationSeconds({
    durationSeconds: attempt.resultJson?.durationSeconds,
    timeLimitSeconds: timeLimitSeconds ?? undefined,
  });

  return {
    id: attempt.id,
    accuracyLabel: formatAssignmentResultPercent(
      attempt.resultJson?.accuracy ?? 0
    ),
    answeredLabel: formatAssignmentResultFraction(
      attempt.resultJson?.completedItemCount ?? 0,
      attempt.resultJson?.totalPoints ?? 0
    ),
    durationLabel: formatAttemptDuration(durationSeconds),
    scoreLabel: formatAssignmentResultFraction(
      attempt.score ?? 0,
      attempt.maxScore ?? 0
    ),
    studentLabel: formatAssignmentResultStudentLabel(
      studentLabel ??
        getAssignmentAttemptStudentLabel({
          reviewStudentLabel: review?.studentLabel,
          studentName: attempt.studentName,
        })
    ),
    submittedAtLabel: formatAssignmentResultDate(attempt.completedAt),
  };
}

export function buildAssignmentAttemptRowViews<
  TAttempt extends AssignmentAttemptRowDisplayInput,
>({
  rows,
  timeLimitSeconds,
}: {
  rows: Array<AssignmentAttemptReviewRow<TAttempt>>;
  timeLimitSeconds?: number | null;
}) {
  return rows.map(({ attempt, review, studentLabel }) => ({
    id: attempt.id,
    ...buildAssignmentAttemptRowDisplay({
      attempt,
      review,
      studentLabel,
      timeLimitSeconds,
    }),
  }));
}

function getAssignmentAttemptStudentLabel({
  reviewStudentLabel,
  studentName,
}: {
  reviewStudentLabel: string | undefined;
  studentName: string | null | undefined;
}) {
  if (reviewStudentLabel) return reviewStudentLabel;

  const normalizedStudentName = normalizeStudentName(studentName);
  return (
    normalizedStudentName || assignmentResultReviewCopy.anonymousStudentLabel
  );
}

export function getAssignmentAnswerReviewStatus(
  answer: Parameters<typeof buildAssignmentResultAnswerStatusView>[0]
) {
  return buildAssignmentResultAnswerStatusView(answer);
}

export function formatAssignmentAttemptReviewBadge({
  accuracy,
  score,
}: Pick<AssignmentAttemptReview, 'accuracy' | 'score'>) {
  return m.assignment_result_attempt_review_badge({
    accuracy: formatAssignmentResultPercent(accuracy),
    score,
  });
}

export function buildAssignmentAttemptReviewCardView(
  attempt: Pick<
    AssignmentAttemptReview,
    'accuracy' | 'answers' | 'completedAt' | 'id' | 'score' | 'studentLabel'
  >
) {
  return {
    answerViews: buildAssignmentAttemptAnswerReviewViews(attempt.answers),
    badgeLabel: formatAssignmentAttemptReviewBadge(attempt),
    id: attempt.id,
    studentLabel: formatAssignmentResultStudentLabel(attempt.studentLabel),
    submittedAtLabel: formatAssignmentResultDate(attempt.completedAt),
  };
}

export function buildAssignmentAttemptReviewCardViews(
  attempts: AssignmentAttemptReview[]
) {
  return attempts.map((attempt) =>
    buildAssignmentAttemptReviewCardView(attempt)
  );
}

export function buildAssignmentStudentSummaryRowView(
  student: AssignmentStudentSummary
) {
  return {
    attemptsLabel: formatAssignmentResultNumber(student.attempts, { min: 0 }),
    averageAccuracyLabel: formatAssignmentResultPercent(
      student.averageAccuracy
    ),
    bestAccuracyLabel: formatAssignmentResultPercent(student.bestAccuracy),
    lastSubmittedLabel: formatAssignmentResultDate(student.lastCompletedAt),
    latestAccuracyLabel: formatAssignmentResultPercent(student.latestAccuracy),
    needsReviewLabel: formatAssignmentResultNumber(student.needsReviewCount, {
      min: 0,
    }),
    studentLabel: formatAssignmentResultStudentLabel(student.studentLabel),
  };
}

export function buildAssignmentStudentSummaryRowViews(
  students: AssignmentStudentSummary[]
) {
  return students.map((student) => ({
    id: student.studentKey,
    ...buildAssignmentStudentSummaryRowView(student),
  }));
}

export function buildAssignmentItemAnalysisCardView(
  item: AssignmentItemAnalysis
) {
  const answerView = buildAssignmentResultAcceptedAnswerView(
    item.acceptedAnswers
  );
  const correctSummaryLabel = formatAssignmentItemCorrectSummary(item);
  const expectedAnswerLabel = assignmentResultReviewCopy.itemAnswerLabel;

  return {
    acceptedAnswersLabel: assignmentResultReviewCopy.acceptedLabel,
    acceptedAnswersLineText: answerView.optionalAcceptedAlternativesText
      ? m.assignment_result_review_accepted_answers_line({
          label: assignmentResultReviewCopy.acceptedLabel,
          value: answerView.optionalAcceptedAlternativesText,
        })
      : null,
    acceptedAnswersText: answerView.optionalAcceptedAlternativesText,
    correctRateLabel: formatAssignmentResultPercent(item.correctRate),
    correctRateProgressValue: clampProgressValue(item.correctRate),
    correctSummaryLabel,
    expectedAnswerLabel,
    expectedAnswerSummaryText: m.assignment_result_review_expected_summary({
      label: expectedAnswerLabel,
      summary: correctSummaryLabel,
      value: answerView.expectedAnswerText,
    }),
    expectedAnswerText: answerView.expectedAnswerText,
    explanationText: item.explanation || null,
    kindLabel: item.kindLabel,
    prompt: item.prompt,
  };
}

export function buildAssignmentItemAnalysisCardViews(
  items: AssignmentItemAnalysis[]
) {
  return items.map((item) => ({
    id: item.itemId,
    ...buildAssignmentItemAnalysisCardView(item),
  }));
}

export function buildAssignmentItemPerformanceRowView({
  index,
  item,
}: {
  index: number;
  item: AssignmentItemAnalysis;
}) {
  const itemNumberLabel = formatAssignmentResultItemNumberLabel(index);
  const answerView = buildAssignmentResultAcceptedAnswerView(
    item.acceptedAnswers
  );

  return {
    acceptedAnswersText: answerView.acceptedAlternativesText,
    correctRateLabel: formatAssignmentResultPercent(item.correctRate),
    expectedAnswerText: answerView.expectedAnswerText,
    explanationText: formatAssignmentResultValue(item.explanation),
    itemNumberLabel,
    kindLabel: item.kindLabel,
    prompt: item.prompt,
    promptLabel: formatAssignmentResultPromptLabel({
      itemNumberLabel,
      prompt: item.prompt,
    }),
    submittedLabel: formatAssignmentResultFraction(
      item.correctCount,
      item.submittedCount
    ),
  };
}

export function buildAssignmentItemPerformanceRowViews(
  items: AssignmentItemAnalysis[]
) {
  return items.map((item, index) => ({
    id: item.itemId,
    ...buildAssignmentItemPerformanceRowView({ index, item }),
  }));
}

export function buildAssignmentAttemptAnswerReviewView({
  answer,
  index,
}: {
  answer: AssignmentAttemptReview['answers'][number];
  index: number;
}) {
  const answerView = buildAssignmentResultAttemptAnswerTextView(answer);

  return {
    acceptedAnswersLabel: assignmentResultReviewCopy.acceptedAnswersLabel,
    acceptedAnswersLineText: answerView.optionalAcceptedAlternativesText
      ? m.assignment_result_review_accepted_answers_line({
          label: assignmentResultReviewCopy.acceptedAnswersLabel,
          value: answerView.optionalAcceptedAlternativesText,
        })
      : null,
    acceptedAnswersText: answerView.optionalAcceptedAlternativesText,
    expectedAnswerLabel: assignmentResultReviewCopy.expectedAnswerLabel,
    expectedAnswerLineText: m.assignment_result_review_expected_line({
      label: assignmentResultReviewCopy.expectedAnswerLabel,
      value: answerView.expectedAnswerText,
    }),
    expectedAnswerText: answerView.expectedAnswerText,
    explanationText: answer.explanation || null,
    promptLabel: formatAssignmentResultPromptLabel({
      index,
      prompt: answer.prompt,
    }),
    statusLabel: answerView.statusLabel,
    statusTone: answerView.statusTone,
    studentAnswerLabel: assignmentResultReviewCopy.studentAnswerLabel,
    studentAnswerLineText: m.assignment_result_review_student_answer_line({
      label: assignmentResultReviewCopy.studentAnswerLabel,
      value: answerView.studentAnswerText,
    }),
    studentAnswerText: answerView.studentAnswerText,
  };
}

export function buildAssignmentAttemptAnswerReviewViews(
  answers: AssignmentAttemptReview['answers']
) {
  return answers.map((answer, index) => ({
    id: answer.itemId,
    ...buildAssignmentAttemptAnswerReviewView({ answer, index }),
  }));
}

export function formatAssignmentItemCorrectSummary({
  correctCount,
  submittedCount,
}: Pick<AssignmentItemAnalysis, 'correctCount' | 'submittedCount'>) {
  return formatAssignmentSummaryCorrectCount({
    correctCount,
    submittedCount,
  });
}

export {
  formatAssignmentResultFraction,
  formatAssignmentResultNumber,
  formatAssignmentResultPercent,
};

export function formatAssignmentReviewCount(count: number) {
  return formatAssignmentSummaryReviewCount(count);
}

function clampProgressValue(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

type ResultSearchSummaryInput = {
  matchedAttempts: number;
  matchedStudents: number;
  search: string;
};

type AttemptReviewSubmissionSummaryInput = {
  shownAttempts: number;
  totalAttempts: number;
};

export function buildAssignmentResultViewModel<
  TAttempt extends AssignmentAttemptRowInput,
>({
  attemptReviewFilter,
  attempts,
  itemPerformanceSort,
  reviews,
  search,
  studentSort,
  students,
  items,
}: {
  attemptReviewFilter: AttemptReviewFilter;
  attempts: TAttempt[];
  itemPerformanceSort: ItemPerformanceSort;
  items: AssignmentItemAnalysis[];
  reviews: AssignmentAttemptReview[];
  search: string;
  studentSort: StudentSummarySort;
  students: AssignmentStudentSummary[];
}) {
  const filteredStudents = filterAndSortStudentSummaries({
    search,
    sort: studentSort,
    students,
  });
  const filteredAttemptRows = buildFilteredAttemptRows({
    attempts,
    reviews,
    search,
  });
  const filteredAttemptReviews = filterAttemptReviews({
    attempts: reviews,
    filter: attemptReviewFilter,
    search,
  });

  return {
    attemptReviewSubmissionSummary: buildAttemptReviewSubmissionSummary({
      shownAttempts: filteredAttemptReviews.length,
      totalAttempts: reviews.length,
    }),
    emptyStates: {
      attemptReview: buildAssignmentResultEmptyState({
        filter: attemptReviewFilter,
        search,
        surface: 'attempt-review',
        totalAttemptReviews: reviews.length,
      }),
      attemptRows: buildAssignmentResultEmptyState({
        search,
        surface: 'attempt-rows',
        totalAttempts: attempts.length,
      }),
      studentSummary: buildAssignmentResultEmptyState({
        search,
        surface: 'student-summary',
        totalStudents: students.length,
      }),
    },
    filteredAttemptReviews,
    filteredAttemptRows,
    filteredStudents,
    resultSearchSummary: buildResultSearchSummary({
      matchedAttempts: filteredAttemptRows.length,
      matchedStudents: filteredStudents.length,
      search,
    }),
    sortedPerformanceItems: sortItemPerformance(items, itemPerformanceSort),
  };
}

export function buildAssignmentResultEmptyState(
  input:
    | {
        search: string;
        surface: 'student-summary';
        totalStudents: number;
      }
    | {
        search: string;
        surface: 'attempt-rows';
        totalAttempts: number;
      }
    | {
        filter: AttemptReviewFilter;
        search: string;
        surface: 'attempt-review';
        totalAttemptReviews: number;
      }
): AssignmentResultEmptyState | undefined {
  const hasSearch = Boolean(normalizeResultSearch(input.search));

  if (input.surface === 'student-summary') {
    if (input.totalStudents === 0) {
      return {
        description: m.assignment_result_empty_student_summary_description(),
        title: m.assignment_result_empty_student_summary_title(),
      };
    }

    if (hasSearch) {
      return {
        description: m.assignment_result_empty_search_students_description(),
        title: m.assignment_result_empty_search_students_title(),
      };
    }

    return undefined;
  }

  if (input.surface === 'attempt-rows') {
    if (input.totalAttempts === 0) {
      return {
        description: m.assignment_result_empty_attempt_rows_description(),
        title: m.assignment_result_empty_attempt_rows_title(),
      };
    }

    if (hasSearch) {
      return {
        description: m.assignment_result_empty_search_attempts_description(),
        title: m.assignment_result_empty_search_attempts_title(),
      };
    }

    return undefined;
  }

  if (input.totalAttemptReviews === 0) {
    return {
      description: m.assignment_result_empty_attempt_review_description(),
      title: m.assignment_result_empty_attempt_review_title(),
    };
  }

  if (hasSearch) {
    return {
      description:
        m.assignment_result_empty_search_answer_reviews_description(),
      title: m.assignment_result_empty_search_answer_reviews_title(),
    };
  }

  if (input.filter === 'needs-review') {
    return {
      description: m.assignment_result_empty_needs_review_description(),
      title: m.assignment_result_empty_needs_review_title(),
    };
  }

  return undefined;
}

export function buildResultSearchSummary({
  matchedAttempts,
  matchedStudents,
  search,
}: ResultSearchSummaryInput) {
  if (!normalizeResultSearch(search)) {
    return m.assignment_result_search_summary_all_students();
  }

  return joinAssignmentResultSearchSummaryParts([
    formatResultStudentCount(matchedStudents),
    formatResultAttemptCount(matchedAttempts),
  ]);
}

export function buildAttemptReviewSubmissionSummary({
  shownAttempts,
  totalAttempts,
}: AttemptReviewSubmissionSummaryInput) {
  if (totalAttempts === 1) {
    return m.assignment_result_attempt_review_submission_summary_one({
      shownAttempts,
      totalAttempts,
    });
  }

  return m.assignment_result_attempt_review_submission_summary_many({
    shownAttempts,
    totalAttempts,
  });
}

export function buildAssignmentResultsPageViewModel<
  TAttempt extends AssignmentAttemptRowDisplayInput,
>({
  data,
  search,
}: {
  data?: AssignmentResultsPageData<TAttempt> | null;
  search: AssignmentResultSearchState;
}): AssignmentResultsPageViewModel<TAttempt> {
  const viewState = resolveAssignmentResultViewState(search);
  const headerView = data ? buildAssignmentResultHeaderView(data) : null;
  const title =
    headerView?.assignmentTitle ?? assignmentResultPageCopy.defaultTitle;
  const completedAttempts = filterAssignmentResultCompletedAttemptRows({
    attempts: data?.attempts ?? [],
    reviews: data?.analysis.attempts ?? [],
  });
  const resultView = buildAssignmentResultViewModel({
    attemptReviewFilter: viewState.attemptReviewFilter,
    attempts: completedAttempts,
    itemPerformanceSort: viewState.itemPerformanceSort,
    items: data?.analysis.perItem ?? [],
    reviews: data?.analysis.attempts ?? [],
    search: viewState.studentSearch,
    studentSort: viewState.studentSort,
    students: data?.analysis.students ?? [],
  });
  const controlViews = buildAssignmentResultControlViews({
    resultSearchSummary: resultView.resultSearchSummary,
    viewState,
  });
  const attemptRowViews = data
    ? buildAssignmentAttemptRowViews({
        rows: resultView.filteredAttemptRows,
        timeLimitSeconds:
          headerView?.settingsSummaryView.settings.timeLimitSeconds,
      })
    : [];
  const studentSummaryRowViews = buildAssignmentStudentSummaryRowViews(
    resultView.filteredStudents
  );
  const itemPerformanceRowViews = buildAssignmentItemPerformanceRowViews(
    resultView.sortedPerformanceItems
  );
  const itemAnalysisCardViews = data
    ? buildAssignmentItemAnalysisCardViews(data.analysis.needsReview)
    : [];
  const attemptReviewCardViews = buildAssignmentAttemptReviewCardViews(
    resultView.filteredAttemptReviews
  );
  const contentState = buildAssignmentResultContentState({
    attemptReviewCardCount: attemptReviewCardViews.length,
    attemptRowCount: attemptRowViews.length,
    studentSummaryRowCount: studentSummaryRowViews.length,
  });
  const classroomBrief = data
    ? buildAssignmentClassroomBrief({
        assignmentTitle: formatAssignmentDisplayTitle(data.assignment.title),
        items: data.analysis.perItem,
        stats: buildAssignmentResultClassroomBriefStats(data.stats),
        students: data.analysis.students,
      })
    : null;
  const completedAttemptCount = getAssignmentResultCompletedAttemptCount(
    data?.stats.completions
  );
  const completedAttemptReviewCount = Math.min(
    completedAttemptCount,
    data?.analysis.attempts.length ?? 0
  );
  const actionState = buildAssignmentResultActionState({
    attemptCount: completedAttemptCount,
    classroomBriefReady: Boolean(classroomBrief),
    itemCount: data?.analysis.perItem.length ?? 0,
    studentCount: data?.analysis.students.length ?? 0,
  });

  return {
    actionButtons: buildAssignmentResultActionButtons(actionState),
    actionData: data ?? null,
    actionState,
    attemptReviewCardViews,
    attemptRowViews,
    breadcrumbs: [
      {
        href: Routes.Dashboard,
        label: assignmentResultPageCopy.breadcrumbDashboard,
      },
      {
        href: Routes.DashboardAssignments,
        label: assignmentResultPageCopy.breadcrumbAssignments,
      },
      { isCurrentPage: true, label: title },
    ],
    classroomBrief,
    completedAttemptCount,
    completedAttemptReviewCount,
    completedAttempts,
    contentState,
    controlViews,
    description: assignmentResultPageCopy.description,
    headerView,
    itemAnalysisCardViews,
    itemPerformanceRowViews,
    loadErrorMessage: assignmentResultPageCopy.loadErrorMessage,
    metricItems: data
      ? buildAssignmentResultMetricItems({
          averageDurationSeconds: data.stats.averageDurationSeconds,
          averagePoints: data.stats.averagePoints,
          averageScore: data.stats.averageScore,
          completions: data.stats.completions,
          expiresAt: data.assignment.expiresAt,
        })
      : [],
    resultView,
    sectionState: buildAssignmentResultSectionState({
      attemptCount: completedAttemptCount,
      attemptReviewCount: completedAttemptReviewCount,
      classroomBriefReady: Boolean(classroomBrief),
      itemCount: data?.analysis.perItem.length ?? 0,
      studentCount: data?.analysis.students.length ?? 0,
    }),
    studentSummaryRowViews,
    title,
    viewState,
  };
}

export function buildAssignmentResultsRouteState<
  TAttempt extends AssignmentAttemptRowDisplayInput,
>({
  data,
  isError,
  isLoading,
  search,
}: {
  data?: AssignmentResultsPageData<TAttempt> | null;
  isError: boolean;
  isLoading: boolean;
  search: AssignmentResultSearchState;
}): AssignmentResultsRouteState<TAttempt> {
  const pageView = buildAssignmentResultsPageViewModel({
    data,
    search,
  });

  if (isLoading) {
    return {
      pageView,
      status: 'loading',
    };
  }

  if (isError || !data) {
    return {
      pageView,
      status: 'error',
    };
  }

  return {
    data,
    pageView,
    status: 'ready',
  };
}

export function buildAssignmentResultContentState({
  attemptReviewCardCount,
  attemptRowCount,
  studentSummaryRowCount,
}: {
  attemptReviewCardCount: number;
  attemptRowCount: number;
  studentSummaryRowCount: number;
}): AssignmentResultContentState {
  return {
    hasAttemptReviewCards: attemptReviewCardCount > 0,
    hasAttemptRows: attemptRowCount > 0,
    hasStudentSummaryRows: studentSummaryRowCount > 0,
  };
}

export function buildAssignmentResultControlViews({
  resultSearchSummary,
  viewState,
}: {
  resultSearchSummary: string;
  viewState: AssignmentResultResolvedViewState;
}): AssignmentResultControlViews {
  return {
    attemptReviewFilter: {
      filter: viewState.attemptReviewFilter,
      options: attemptReviewFilterOptions,
    },
    itemPerformanceSort: {
      options: itemPerformanceSortOptions,
      sort: viewState.itemPerformanceSort,
    },
    studentSearch: {
      hasSearchValue: Boolean(viewState.studentSearch),
      sort: viewState.studentSort,
      sortOptions: studentSummarySortOptions,
      summary: resultSearchSummary,
      value: viewState.studentSearch,
    },
  };
}

function formatResultStudentCount(count: number) {
  if (count === 1) {
    return m.assignment_result_search_summary_students_one({ count });
  }

  return m.assignment_result_search_summary_students_many({ count });
}

function formatResultAttemptCount(count: number) {
  if (count === 1) {
    return m.assignment_result_search_summary_attempts_one({ count });
  }

  return m.assignment_result_search_summary_attempts_many({ count });
}
