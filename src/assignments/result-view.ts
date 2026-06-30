import type {
  AssignmentAttemptReviewAnswer,
  AssignmentAttemptReviewAnswerStatus,
  AssignmentAttemptReview,
  AssignmentResultsAnalysis,
  AssignmentItemAnalysis,
  AssignmentStudentSummary,
} from '@/assignments/results';
import { formatAssignmentDisplayTitle } from '@/assignments/assignment-display';
import { buildAssignmentAttemptStatsView } from '@/assignments/attempt-stats';
import {
  type AssignmentLifecycleStatus,
  getAssignmentStatusLabel,
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
  type AssignmentResultAnswerStatusTone,
} from '@/assignments/result-answer-view';
import { buildAssignmentAttemptReviewSummary } from '@/assignments/result-review-summary';
import {
  formatAssignmentSummaryCorrectCount,
  formatAssignmentSummaryReviewCount,
  formatAssignmentSummaryUnansweredCount,
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
  buildAssignmentResultReviewScope,
  buildFilteredAttemptRows,
  filterAndSortStudentSummaries,
  filterAssignmentResultCompletedAttemptRows,
  filterAttemptReviews,
  normalizeResultSearch,
  resolveAssignmentResultViewState,
  sortItemPerformance,
  type AssignmentAttemptReviewRow,
  type AssignmentAttemptRowInput,
  type AssignmentResultReviewScope,
  type AssignmentResultReviewScopeSummary,
  type AssignmentResultResolvedViewState,
  type AssignmentResultSearchState,
  type AttemptReviewFilter,
  type ItemPerformanceSort,
  type StudentSummarySort,
} from '@/assignments/result-filters';
import {
  type AssignmentShareLinkActionView,
  buildAssignmentShareLinkAvailability,
  buildAssignmentShareLinkActionView,
} from '@/assignments/share-link';
import { resolveAssignmentSnapshotSource } from '@/assignments/snapshot';
import type { AssignmentSettingsInput } from '@/assignments/validation';
import {
  buildAssignmentResultActionButtons,
  buildAssignmentResultActionDataSet,
  buildAssignmentResultCopyActionData,
  buildAssignmentResultCopyArtifacts,
  buildAssignmentResultCopyArtifactPreviews,
  buildAssignmentResultActionState,
  type AssignmentResultActionButton,
  type AssignmentResultActionDataSet,
  type AssignmentResultCopyActionData,
  type AssignmentResultCopyArtifactPreview,
  type AssignmentResultCopyArtifacts,
  type AssignmentResultActionState,
} from '@/assignments/result-actions';
import type { AssignmentClassroomBrief } from '@/assignments/classroom-brief';
import type {
  ActivityTemplateType,
  AssignmentSettings,
  AssignmentStatus,
} from '@/activities/types';
import { getTemplateByType } from '@/activities/catalog';
import { Routes } from '@/lib/routes';
import { m } from '@/locale/paraglide/messages';

export {
  ATTEMPT_REVIEW_FILTER_VALUES,
  DEFAULT_ATTEMPT_REVIEW_FILTER,
  DEFAULT_ITEM_PERFORMANCE_SORT,
  DEFAULT_STUDENT_SUMMARY_SORT,
  ITEM_PERFORMANCE_SORT_VALUES,
  STUDENT_SUMMARY_SORT_VALUES,
  buildAssignmentResultReviewScope,
  buildAssignmentResultReviewScopeSummary,
  buildAssignmentResultControlRouteSearch,
  buildAssignmentResultControlSearchState,
  buildAssignmentResultRouteSearch,
  buildAssignmentResultSearchState,
  buildFilteredAttemptRows,
  filterAndSortStudentSummaries,
  filterAssignmentResultCompletedAttemptRows,
  filterAttemptReviews,
  matchesResultSearch,
  normalizeAssignmentResultScopeCount,
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
  type AssignmentResultReviewScope,
  type AssignmentResultReviewScopeSummary,
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
  buildAssignmentResultActionDataSet,
  buildAssignmentResultActionExecutionPlan,
  buildAssignmentResultActionPayload,
  buildAssignmentResultActionState,
  buildAssignmentResultCopyActionData,
  buildAssignmentResultCopyArtifacts,
  buildAssignmentResultCopyArtifactPreviews,
  buildAssignmentResultClassroomBriefStats,
  buildAssignmentResultCopyText,
  getAssignmentResultActionExecutionData,
  getAssignmentResultActionExecutionDataScope,
  getAssignmentResultCopyArtifactText,
  getAssignmentResultActionDisabledReason,
  getAssignmentResultActionCopy,
  getAssignmentResultActionGate,
  getAssignmentResultActionGateFromState,
  type AssignmentResultActionButton,
  type AssignmentResultActionDataScope,
  type AssignmentResultActionDataSet,
  type AssignmentResultCopyActionData,
  type AssignmentResultCopyArtifactPreview,
} from '@/assignments/result-actions';

export type AssignmentResultEmptyState = {
  description: string;
  title: string;
};

export type AssignmentResultMetricKey =
  | 'average-accuracy'
  | 'average-points'
  | 'average-time'
  | 'closes'
  | 'completions';

type AssignmentResultMetricDescriptor = {
  description: string;
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

export type AssignmentResultSectionView = {
  description?: string;
  emptyMessage?: string;
  emptyState?: AssignmentResultEmptyState;
  isVisible: boolean;
  submissionSummary?: string;
  title: string;
};

export type AssignmentResultSectionViews = {
  answerReview: AssignmentResultSectionView;
  classroomBrief: AssignmentResultSectionView;
  classReviewFocus: AssignmentResultSectionView;
  itemPerformance: AssignmentResultSectionView;
  reteachPriorities: AssignmentResultSectionView;
  studentAttempts: AssignmentResultSectionView;
  studentFollowUp: AssignmentResultSectionView;
  studentSummary: AssignmentResultSectionView;
};

export type AssignmentResultClassroomBriefSectionViews = Pick<
  AssignmentResultSectionViews,
  'classroomBrief' | 'classReviewFocus' | 'studentFollowUp'
>;

type AssignmentResultContentState = {
  hasAttemptReviewCards: boolean;
  hasAttemptRows: boolean;
  hasStudentSummaryRows: boolean;
};

type AssignmentResultTableView<TRow> = {
  headers: string[];
  rows: TRow[];
};

export type AssignmentResultMetricItem = AssignmentResultMetricDescriptor & {
  value: string;
};

export type AssignmentResultAttemptRowMetricLabels = {
  accuracyLabel: string;
  answeredLabel: string;
  scoreLabel: string;
};

export type AssignmentResultAttemptRowView =
  AssignmentResultAttemptRowMetricLabels & {
    durationLabel: string;
    id: string;
    studentLabel: string;
    submittedAtLabel: string;
  };

export type AssignmentResultAttemptTableView =
  AssignmentResultTableView<AssignmentResultAttemptRowView>;

export type AssignmentResultAttemptAnswerReviewDisplayView = {
  acceptedAnswersLabel: string;
  acceptedAnswersLineText: string | null;
  acceptedAnswersText: string | null;
  expectedAnswerLabel: string;
  expectedAnswerLineText: string;
  expectedAnswerText: string;
  explanationText: string | null;
  promptLabel: string;
  statusLabel: string;
  statusTone: AssignmentResultAnswerStatusTone;
  studentAnswerLabel: string;
  studentAnswerLineText: string;
  studentAnswerText: string;
};

export type AssignmentResultAttemptAnswerReviewView =
  AssignmentResultAttemptAnswerReviewDisplayView & {
    id: string;
  };

export type AssignmentResultAttemptReviewSummaryMetricKey =
  | 'correct'
  | 'needs-review'
  | 'submitted'
  | 'unanswered';

export type AssignmentResultAttemptReviewSummaryMetricView = {
  key: AssignmentResultAttemptReviewSummaryMetricKey;
  label: string;
  value: string;
};

export type AssignmentResultAttemptReviewCardView = {
  answerViews: AssignmentResultAttemptAnswerReviewView[];
  badgeLabel: string;
  id: string;
  summaryMetricViews: AssignmentResultAttemptReviewSummaryMetricView[];
  studentLabel: string;
  submittedAtLabel: string;
};

export type AssignmentResultStudentSummaryRowDisplayView = {
  attemptsLabel: string;
  averageAccuracyLabel: string;
  bestAccuracyLabel: string;
  lastSubmittedLabel: string;
  latestAccuracyLabel: string;
  needsReviewLabel: string;
  studentLabel: string;
};

export type AssignmentResultStudentSummaryRowView =
  AssignmentResultStudentSummaryRowDisplayView & {
    id: string;
  };

export type AssignmentResultStudentSummaryTableView =
  AssignmentResultTableView<AssignmentResultStudentSummaryRowView>;

export type AssignmentResultItemAnalysisCardDisplayView = {
  acceptedAnswersLabel: string;
  acceptedAnswersLineText: string | null;
  acceptedAnswersText: string | null;
  correctRateLabel: string;
  correctRateProgressValue: number;
  correctSummaryLabel: string;
  expectedAnswerLabel: string;
  expectedAnswerSummaryText: string;
  expectedAnswerText: string;
  explanationText: string | null;
  kindLabel: string;
  prompt: string;
  unansweredLabel: string;
};

export type AssignmentResultItemAnalysisCardView =
  AssignmentResultItemAnalysisCardDisplayView & {
    id: string;
  };

export type AssignmentResultItemPerformanceRowDisplayView = {
  acceptedAnswersText: string;
  correctRateLabel: string;
  expectedAnswerText: string;
  explanationText: string;
  itemNumberLabel: string;
  kindLabel: string;
  prompt: string;
  promptLabel: string;
  submittedLabel: string;
  unansweredLabel: string;
};

export type AssignmentResultItemPerformanceRowView =
  AssignmentResultItemPerformanceRowDisplayView & {
    id: string;
  };

export type AssignmentResultItemPerformanceTableView =
  AssignmentResultTableView<AssignmentResultItemPerformanceRowView>;

type AssignmentResultPageBreadcrumb = {
  href?: string;
  isCurrentPage?: boolean;
  label: string;
};

type AssignmentResultControlOption<TValue extends string> = {
  description: string;
  label: string;
  value: TValue;
};

export type AssignmentResultStudentSearchControlView = {
  clearLabel: string;
  label: string;
  hasSearchValue: boolean;
  placeholder: string;
  sort: StudentSummarySort;
  sortLabel: string;
  selectedSortOption: AssignmentResultControlOption<StudentSummarySort>;
  sortOptions: Array<AssignmentResultControlOption<StudentSummarySort>>;
  summary: string;
  value: string;
};

export type AssignmentResultItemPerformanceSortControlView = {
  label: string;
  options: Array<AssignmentResultControlOption<ItemPerformanceSort>>;
  selectedSortOption: AssignmentResultControlOption<ItemPerformanceSort>;
  sort: ItemPerformanceSort;
};

export type AssignmentResultAttemptReviewFilterControlView = {
  filter: AttemptReviewFilter;
  label: string;
  options: Array<AssignmentResultControlOption<AttemptReviewFilter>>;
  selectedFilterOption: AssignmentResultControlOption<AttemptReviewFilter>;
};

export type AssignmentResultControlViews = {
  attemptReviewFilter: AssignmentResultAttemptReviewFilterControlView;
  itemPerformanceSort: AssignmentResultItemPerformanceSortControlView;
  studentSearch: AssignmentResultStudentSearchControlView;
};

type AssignmentResultCopyScopeItemId = 'items' | 'review' | 'students';

export type AssignmentResultCopyScopeItemView = {
  description: string;
  id: AssignmentResultCopyScopeItemId;
  label: string;
  value: string;
};

export type AssignmentResultCopyScopeView = {
  description: string;
  itemViews: AssignmentResultCopyScopeItemView[];
  summary?: AssignmentResultReviewScopeSummary;
  title: string;
};

export type AssignmentAttemptRowDisplayInput = AssignmentAttemptRowInput & {
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
    settingsJson: AssignmentSettingsInput;
    title: string;
  };
  snapshot: {
    activityDescription: string | null;
    activityTitle: string;
    templateType: ActivityTemplateType;
  } | null;
};

export type AssignmentResultHeaderShareAction = AssignmentShareLinkActionView;

export type AssignmentResultHeaderPrintAction = {
  assignmentId: string;
  label: string;
  to: typeof Routes.PrintAssignmentWorksheet;
};

export type AssignmentResultHeaderView = {
  activityDescription: string;
  activityTitle: string;
  assignmentSharePath: string;
  assignmentTitle: string;
  printAction: AssignmentResultHeaderPrintAction;
  settingsSummaryView: AssignmentSettingsSummaryView;
  shareAction: AssignmentResultHeaderShareAction;
  shareSlug: string;
  statusLabel: string;
  templateLabel: string;
  templateType: ActivityTemplateType;
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

export type AssignmentResultsPageViewModel<
  TAttempt extends AssignmentAttemptRowDisplayInput,
> = {
  actionButtons: AssignmentResultActionButton[];
  actionData: AssignmentResultsPageData<TAttempt> | null;
  actionDataSet: AssignmentResultActionDataSet;
  actionState: AssignmentResultActionState;
  attemptReviewCardViews: AssignmentResultAttemptReviewCardView[];
  attemptRowViews: AssignmentResultAttemptRowView[];
  attemptTableView: AssignmentResultAttemptTableView;
  breadcrumbs: AssignmentResultPageBreadcrumb[];
  classroomBrief: AssignmentClassroomBrief | null;
  completedAttemptCount: number;
  completedAttemptReviewCount: number;
  completedAttempts: TAttempt[];
  contentState: AssignmentResultContentState;
  controlViews: AssignmentResultControlViews;
  copyActionData: AssignmentResultCopyActionData | null;
  copyArtifactPreviews: Array<
    AssignmentResultCopyArtifactPreview & {
      actionButton: AssignmentResultActionButton;
    }
  >;
  copyScopeView: AssignmentResultCopyScopeView;
  description: string;
  headerView: AssignmentResultHeaderView | null;
  itemAnalysisCardViews: AssignmentResultItemAnalysisCardView[];
  loadErrorMessage: string;
  itemPerformanceRowViews: AssignmentResultItemPerformanceRowView[];
  itemPerformanceTableView: AssignmentResultItemPerformanceTableView;
  metricItems: AssignmentResultMetricItem[];
  resultView: AssignmentResultViewModel<TAttempt>;
  sectionState: AssignmentResultSectionState;
  sectionViews: AssignmentResultSectionViews;
  studentSummaryRowViews: AssignmentResultStudentSummaryRowView[];
  studentSummaryTableView: AssignmentResultStudentSummaryTableView;
  title: string;
  viewState: AssignmentResultResolvedViewState;
};

export type AssignmentResultsRouteState<
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

export const assignmentResultCopyScopeCopy = {
  get description() {
    return m.assignment_result_copy_scope_description();
  },
  get itemLabel() {
    return m.assignment_result_copy_scope_item_label();
  },
  get reviewLabel() {
    return m.assignment_result_copy_scope_review_label();
  },
  get studentLabel() {
    return m.assignment_result_copy_scope_student_label();
  },
  get title() {
    return m.assignment_result_copy_scope_title();
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
      m.assignment_result_review_unanswered(),
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
  get reviewSummaryCorrectLabel() {
    return m.assignment_result_attempt_review_summary_correct();
  },
  get reviewSummaryNeedsReviewLabel() {
    return m.assignment_result_attempt_review_summary_needs_review();
  },
  get reviewSummarySubmittedLabel() {
    return m.assignment_result_attempt_review_summary_submitted();
  },
  get reviewSummaryUnansweredLabel() {
    return m.assignment_result_attempt_review_summary_unanswered();
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
    get description() {
      return m.assignment_result_metric_completions_description();
    },
    get label() {
      return m.assignment_result_metric_completions();
    },
  },
  {
    key: 'average-accuracy',
    get description() {
      return m.assignment_result_metric_average_accuracy_description();
    },
    get label() {
      return m.assignment_result_metric_average_accuracy();
    },
  },
  {
    key: 'average-points',
    get description() {
      return m.assignment_result_metric_average_points_description();
    },
    get label() {
      return m.assignment_result_metric_average_points();
    },
  },
  {
    key: 'average-time',
    get description() {
      return m.assignment_result_metric_average_time_description();
    },
    get label() {
      return m.assignment_result_metric_average_time();
    },
  },
  {
    key: 'closes',
    get description() {
      return m.assignment_result_metric_closes_description();
    },
    get label() {
      return m.assignment_result_metric_closes();
    },
  },
] satisfies Array<AssignmentResultMetricDescriptor>;

export const studentSummarySortOptions = buildAssignmentResultControlOptions(
  STUDENT_SUMMARY_SORT_VALUES,
  getStudentSummarySortOptionLabel,
  getStudentSummarySortOptionDescription
);

export const itemPerformanceSortOptions = buildAssignmentResultControlOptions(
  ITEM_PERFORMANCE_SORT_VALUES,
  getItemPerformanceSortOptionLabel,
  getItemPerformanceSortOptionDescription
);

export const attemptReviewFilterOptions = buildAssignmentResultControlOptions(
  ATTEMPT_REVIEW_FILTER_VALUES,
  getAttemptReviewFilterOptionLabel,
  getAttemptReviewFilterOptionDescription
);

function buildAssignmentResultControlOptions<TValue extends string>(
  values: readonly TValue[],
  getLabel: (value: TValue) => string,
  getDescription: (value: TValue) => string
): Array<AssignmentResultControlOption<TValue>> {
  return values.map((value) => ({
    get description() {
      return getDescription(value);
    },
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
  if (value === 'last-submitted') {
    return m.assignment_result_sort_last_submitted();
  }

  return m.assignment_result_sort_needs_review();
}

function getStudentSummarySortOptionDescription(value: StudentSummarySort) {
  if (value === 'best')
    return m.assignment_result_sort_best_score_description();
  if (value === 'name') {
    return m.assignment_result_sort_student_name_description();
  }
  if (value === 'attempts') {
    return m.assignment_result_sort_attempts_description();
  }
  if (value === 'last-submitted') {
    return m.assignment_result_sort_last_submitted_description();
  }

  return m.assignment_result_sort_needs_review_description();
}

function getItemPerformanceSortOptionLabel(value: ItemPerformanceSort) {
  if (value === 'accuracy') return m.assignment_result_sort_lowest_accuracy();
  if (value === 'submitted') return m.assignment_result_sort_most_answered();
  if (value === 'type') return m.assignment_result_sort_item_type();

  return m.assignment_result_sort_snapshot_order();
}

function getItemPerformanceSortOptionDescription(value: ItemPerformanceSort) {
  if (value === 'accuracy') {
    return m.assignment_result_sort_lowest_accuracy_description();
  }
  if (value === 'submitted') {
    return m.assignment_result_sort_most_answered_description();
  }
  if (value === 'type') return m.assignment_result_sort_item_type_description();

  return m.assignment_result_sort_snapshot_order_description();
}

function getAttemptReviewFilterOptionLabel(value: AttemptReviewFilter) {
  if (value === 'needs-review') {
    return m.assignment_result_filter_needs_review_only();
  }

  return m.assignment_result_filter_all_answers();
}

function getAttemptReviewFilterOptionDescription(value: AttemptReviewFilter) {
  if (value === 'needs-review') {
    return m.assignment_result_filter_needs_review_only_description();
  }

  return m.assignment_result_filter_all_answers_description();
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
}): AssignmentResultMetricItem[] {
  const completedAttemptCount =
    getAssignmentResultCompletedAttemptCount(completions);
  const statsView = buildAssignmentAttemptStatsView({
    averageDurationSeconds,
    averagePoints,
    averageScore,
    completions: completedAttemptCount,
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
}: AssignmentResultHeaderSource & {
  now?: number;
}): AssignmentResultHeaderView {
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
      assignmentId: assignment.id,
      label: assignmentResultPageCopy.printWorksheetLabel,
      to: Routes.PrintAssignmentWorksheet,
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
  const shareAvailability = buildAssignmentShareLinkAvailability({
    expiresAt,
    now: now ?? Date.now(),
    shareSlug,
    status,
  });

  return buildAssignmentShareLinkActionView({
    disabledReason: shareAvailability.isAvailable
      ? undefined
      : getAssignmentResultHeaderShareDisabledReason(
          shareAvailability.lifecycleStatus
        ),
    isAvailable: shareAvailability.isAvailable,
    label: shareAvailability.isAvailable
      ? assignmentResultPageCopy.openStudentLinkLabel
      : assignmentResultPageCopy.studentLinkUnavailableLabel,
    shareSlug: shareAvailability.shareSlug,
  });
}

function getAssignmentResultHeaderShareDisabledReason(
  lifecycleStatus: AssignmentLifecycleStatus
) {
  if (lifecycleStatus === 'expired') {
    return assignmentResultPageCopy.studentLinkExpiredMessage;
  }

  if (lifecycleStatus === 'closed') {
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
  const normalizedAttemptCount =
    normalizeAssignmentResultSectionCount(attemptCount);
  const normalizedAttemptReviewCount =
    normalizeAssignmentResultSectionCount(attemptReviewCount);
  const normalizedItemCount = normalizeAssignmentResultSectionCount(itemCount);
  const normalizedStudentCount =
    normalizeAssignmentResultSectionCount(studentCount);

  return {
    showAnswerReview: normalizedAttemptReviewCount > 0,
    showClassroomBrief: classroomBriefReady,
    showItemPerformance: normalizedItemCount > 0,
    showReteachPriorities: normalizedItemCount > 0,
    showStudentSearch: normalizedAttemptCount > 0,
    showStudentSummary: normalizedStudentCount > 0,
  };
}

function normalizeAssignmentResultSectionCount(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.floor(Math.max(0, value));
}

export function buildAssignmentResultSectionViews<
  TAttempt extends AssignmentAttemptRowInput,
>({
  resultView,
  sectionState,
}: {
  resultView: AssignmentResultViewModel<TAttempt>;
  sectionState: AssignmentResultSectionState;
}): AssignmentResultSectionViews {
  return {
    answerReview: {
      description: assignmentResultSectionCopy.answerReview.description,
      emptyState: resultView.emptyStates.attemptReview,
      isVisible: sectionState.showAnswerReview,
      submissionSummary: resultView.attemptReviewSubmissionSummary,
      title: assignmentResultSectionCopy.answerReview.title,
    },
    classroomBrief: {
      description: assignmentResultSectionCopy.classroomBrief.description,
      isVisible: sectionState.showClassroomBrief,
      title: assignmentResultSectionCopy.classroomBrief.title,
    },
    classReviewFocus: {
      emptyMessage: assignmentResultSectionCopy.classReviewFocus.emptyMessage,
      isVisible: sectionState.showClassroomBrief,
      title: assignmentResultSectionCopy.classReviewFocus.title,
    },
    itemPerformance: {
      description: assignmentResultSectionCopy.itemPerformance.description,
      isVisible: sectionState.showItemPerformance,
      title: assignmentResultSectionCopy.itemPerformance.title,
    },
    reteachPriorities: {
      description: assignmentResultSectionCopy.reteachPriorities.description,
      emptyMessage: assignmentResultSectionCopy.reteachPriorities.emptyMessage,
      isVisible: sectionState.showReteachPriorities,
      title: assignmentResultSectionCopy.reteachPriorities.title,
    },
    studentAttempts: {
      description: assignmentResultSectionCopy.studentAttempts.description,
      emptyState: resultView.emptyStates.attemptRows,
      isVisible: true,
      title: assignmentResultSectionCopy.studentAttempts.title,
    },
    studentFollowUp: {
      emptyMessage: assignmentResultSectionCopy.studentFollowUp.emptyMessage,
      isVisible: sectionState.showClassroomBrief,
      title: assignmentResultSectionCopy.studentFollowUp.title,
    },
    studentSummary: {
      description: assignmentResultSectionCopy.studentSummary.description,
      emptyState: resultView.emptyStates.studentSummary,
      isVisible: sectionState.showStudentSummary,
      title: assignmentResultSectionCopy.studentSummary.title,
    },
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
}): AssignmentResultAttemptRowView {
  const durationSeconds = normalizeAttemptDurationSeconds({
    durationSeconds: attempt.resultJson?.durationSeconds,
    timeLimitSeconds: timeLimitSeconds ?? undefined,
  });

  return {
    id: attempt.id,
    ...buildAssignmentAttemptRowMetricLabels(attempt),
    durationLabel: formatAttemptDuration(durationSeconds),
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

export function buildAssignmentAttemptRowMetricLabels(
  attempt: Pick<
    AssignmentAttemptRowDisplayInput,
    'maxScore' | 'resultJson' | 'score'
  >
): AssignmentResultAttemptRowMetricLabels {
  const totalPoints = normalizeAssignmentAttemptRowMetricCount(
    attempt.resultJson?.totalPoints ?? 0
  );
  const completedItemCount = normalizeAssignmentAttemptRowMetricCount(
    attempt.resultJson?.completedItemCount ?? 0,
    {
      max: totalPoints,
    }
  );
  const maxScore = normalizeAssignmentAttemptRowMetricCount(
    attempt.maxScore ?? 0
  );
  const score = normalizeAssignmentAttemptRowMetricCount(attempt.score ?? 0, {
    max: maxScore,
  });

  return {
    accuracyLabel: formatAssignmentResultPercent(
      normalizeAssignmentAttemptRowAccuracy(attempt.resultJson?.accuracy ?? 0)
    ),
    answeredLabel: formatAssignmentResultFraction(
      completedItemCount,
      totalPoints
    ),
    scoreLabel: formatAssignmentResultFraction(score, maxScore),
  };
}

function normalizeAssignmentAttemptRowMetricCount(
  value: number | null | undefined,
  options?: {
    max?: number;
  }
) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return Number.NaN;
  }

  const normalizedValue = Math.max(0, Math.floor(value));
  if (options?.max === undefined || !Number.isFinite(options.max)) {
    return normalizedValue;
  }

  return Math.min(normalizedValue, options.max);
}

function normalizeAssignmentAttemptRowAccuracy(
  value: number | null | undefined
) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return Number.NaN;
  }

  return Math.min(100, Math.max(0, value));
}

export function buildAssignmentAttemptRowViews<
  TAttempt extends AssignmentAttemptRowDisplayInput,
>({
  rows,
  timeLimitSeconds,
}: {
  rows: Array<AssignmentAttemptReviewRow<TAttempt>>;
  timeLimitSeconds?: number | null;
}): AssignmentResultAttemptRowView[] {
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

export function buildAssignmentAttemptTableView<
  TAttempt extends AssignmentAttemptRowDisplayInput,
>(input: {
  rows: Array<AssignmentAttemptReviewRow<TAttempt>>;
  timeLimitSeconds?: number | null;
}): AssignmentResultAttemptTableView {
  return {
    headers: assignmentResultTableHeaders.studentAttempts,
    rows: buildAssignmentAttemptRowViews(input),
  };
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
  answer: AssignmentAttemptReviewAnswerStatus
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
): AssignmentResultAttemptReviewCardView {
  return {
    answerViews: buildAssignmentAttemptAnswerReviewViews(attempt.answers),
    badgeLabel: formatAssignmentAttemptReviewBadge(attempt),
    id: attempt.id,
    summaryMetricViews: buildAssignmentAttemptReviewSummaryMetricViews(attempt),
    studentLabel: formatAssignmentResultStudentLabel(attempt.studentLabel),
    submittedAtLabel: formatAssignmentResultDate(attempt.completedAt),
  };
}

export function buildAssignmentAttemptReviewCardViews(
  attempts: AssignmentAttemptReview[]
): AssignmentResultAttemptReviewCardView[] {
  return attempts.map((attempt) =>
    buildAssignmentAttemptReviewCardView(attempt)
  );
}

export function buildAssignmentAttemptReviewSummaryMetricViews(
  attempt: Pick<AssignmentAttemptReview, 'answers'>
): AssignmentResultAttemptReviewSummaryMetricView[] {
  const summary = buildAssignmentAttemptReviewSummary(attempt);

  return [
    {
      key: 'submitted',
      label: assignmentResultReviewCopy.reviewSummarySubmittedLabel,
      value: formatAssignmentResultFraction(
        summary.submittedItemCount,
        summary.totalItemCount
      ),
    },
    {
      key: 'correct',
      label: assignmentResultReviewCopy.reviewSummaryCorrectLabel,
      value: formatAssignmentResultNumber(summary.correctItemCount, {
        min: 0,
      }),
    },
    {
      key: 'needs-review',
      label: assignmentResultReviewCopy.reviewSummaryNeedsReviewLabel,
      value: formatAssignmentResultNumber(summary.needsReviewItemCount, {
        min: 0,
      }),
    },
    {
      key: 'unanswered',
      label: assignmentResultReviewCopy.reviewSummaryUnansweredLabel,
      value: formatAssignmentResultNumber(summary.unansweredItemCount, {
        min: 0,
      }),
    },
  ];
}

export function buildAssignmentStudentSummaryRowView(
  student: AssignmentStudentSummary
): AssignmentResultStudentSummaryRowDisplayView {
  return {
    attemptsLabel: formatAssignmentResultNumber(
      normalizeAssignmentStudentSummaryRowCount(student.attempts),
      { min: 0 }
    ),
    averageAccuracyLabel: formatAssignmentResultPercent(
      normalizeAssignmentResultPercentLabelValue(student.averageAccuracy)
    ),
    bestAccuracyLabel: formatAssignmentResultPercent(
      normalizeAssignmentResultPercentLabelValue(student.bestAccuracy)
    ),
    lastSubmittedLabel: formatAssignmentResultDate(student.lastCompletedAt),
    latestAccuracyLabel: formatAssignmentResultPercent(
      normalizeAssignmentResultPercentLabelValue(student.latestAccuracy)
    ),
    needsReviewLabel: formatAssignmentResultNumber(
      normalizeAssignmentStudentSummaryRowCount(student.needsReviewCount),
      { min: 0 }
    ),
    studentLabel: formatAssignmentResultStudentLabel(student.studentLabel),
  };
}

function normalizeAssignmentStudentSummaryRowCount(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.floor(Math.max(0, value));
}

function normalizeAssignmentResultPercentLabelValue(
  value: number | null | undefined
) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return Number.NaN;
  }

  return Math.min(100, Math.max(0, value));
}

export function buildAssignmentStudentSummaryRowViews(
  students: AssignmentStudentSummary[]
): AssignmentResultStudentSummaryRowView[] {
  return students.map((student) => ({
    id: student.studentKey,
    ...buildAssignmentStudentSummaryRowView(student),
  }));
}

export function buildAssignmentStudentSummaryTableView(
  students: AssignmentStudentSummary[]
): AssignmentResultStudentSummaryTableView {
  return {
    headers: assignmentResultTableHeaders.studentSummary,
    rows: buildAssignmentStudentSummaryRowViews(students),
  };
}

export function buildAssignmentItemAnalysisCardView(
  item: AssignmentItemAnalysis
): AssignmentResultItemAnalysisCardDisplayView {
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
    correctRateLabel: formatAssignmentResultPercent(
      normalizeAssignmentResultPercentLabelValue(item.correctRate)
    ),
    correctRateProgressValue: normalizeAssignmentResultProgressValue(
      item.correctRate
    ),
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
    unansweredLabel: formatAssignmentSummaryUnansweredCount(
      item.unansweredCount
    ),
  };
}

export function buildAssignmentItemAnalysisCardViews(
  items: AssignmentItemAnalysis[]
): AssignmentResultItemAnalysisCardView[] {
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
}): AssignmentResultItemPerformanceRowDisplayView {
  const itemNumberLabel = formatAssignmentResultItemNumberLabel(index);
  const answerView = buildAssignmentResultAcceptedAnswerView(
    item.acceptedAnswers
  );
  const correctCount = normalizeAssignmentItemPerformanceRowCount(
    item.correctCount
  );
  const submittedCount = normalizeAssignmentItemPerformanceRowCount(
    item.submittedCount
  );

  return {
    acceptedAnswersText: answerView.acceptedAlternativesText,
    correctRateLabel: formatAssignmentResultPercent(
      normalizeAssignmentResultPercentLabelValue(item.correctRate)
    ),
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
      correctCount,
      submittedCount
    ),
    unansweredLabel: formatAssignmentSummaryUnansweredCount(
      item.unansweredCount
    ),
  };
}

function normalizeAssignmentItemPerformanceRowCount(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.floor(Math.max(0, value));
}

export function buildAssignmentItemPerformanceRowViews(
  items: AssignmentItemAnalysis[]
): AssignmentResultItemPerformanceRowView[] {
  return items.map((item, index) => ({
    id: item.itemId,
    ...buildAssignmentItemPerformanceRowView({ index, item }),
  }));
}

export function buildAssignmentItemPerformanceTableView(
  items: AssignmentItemAnalysis[]
): AssignmentResultItemPerformanceTableView {
  return {
    headers: assignmentResultTableHeaders.itemPerformance,
    rows: buildAssignmentItemPerformanceRowViews(items),
  };
}

export function buildAssignmentAttemptAnswerReviewView({
  answer,
  index,
}: {
  answer: AssignmentAttemptReviewAnswer;
  index: number;
}): AssignmentResultAttemptAnswerReviewDisplayView {
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
  answers: AssignmentAttemptReviewAnswer[]
): AssignmentResultAttemptAnswerReviewView[] {
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

export function normalizeAssignmentResultProgressValue(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

type ResultSearchSummaryInput = {
  search: string;
  summary: AssignmentResultReviewScopeSummary;
};

type AttemptReviewSubmissionSummaryInput = {
  shownAttempts: number;
  totalAttempts: number;
};

export type AssignmentResultViewModel<
  TAttempt extends AssignmentAttemptRowInput,
> = {
  attemptReviewSubmissionSummary: string;
  emptyStates: {
    attemptReview: AssignmentResultEmptyState | undefined;
    attemptRows: AssignmentResultEmptyState | undefined;
    studentSummary: AssignmentResultEmptyState | undefined;
  };
  filteredAttemptReviews: AssignmentAttemptReview[];
  filteredAttemptRows: Array<AssignmentAttemptReviewRow<TAttempt>>;
  filteredStudents: AssignmentStudentSummary[];
  resultSearchSummary: string;
  reviewScope: AssignmentResultReviewScope<TAttempt>;
  sortedPerformanceItems: AssignmentItemAnalysis[];
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
}): AssignmentResultViewModel<TAttempt> {
  const reviewScope = buildAssignmentResultReviewScope({
    attemptReviewFilter,
    attempts,
    itemPerformanceSort,
    items,
    reviews,
    search,
    studentSort,
    students,
  });

  return {
    attemptReviewSubmissionSummary: buildAttemptReviewSubmissionSummary({
      shownAttempts: reviewScope.counts.matchedAttemptReviews,
      totalAttempts: reviewScope.counts.totalAttemptReviews,
    }),
    emptyStates: {
      attemptReview: buildAssignmentResultEmptyState({
        filter: attemptReviewFilter,
        search,
        surface: 'attempt-review',
        totalAttemptReviews: reviewScope.counts.totalAttemptReviews,
      }),
      attemptRows: buildAssignmentResultEmptyState({
        search,
        surface: 'attempt-rows',
        totalAttempts: reviewScope.counts.totalAttemptRows,
      }),
      studentSummary: buildAssignmentResultEmptyState({
        search,
        surface: 'student-summary',
        totalStudents: reviewScope.counts.totalStudents,
      }),
    },
    filteredAttemptReviews: reviewScope.filteredAttemptReviews,
    filteredAttemptRows: reviewScope.filteredAttemptRows,
    filteredStudents: reviewScope.filteredStudents,
    reviewScope,
    resultSearchSummary: buildResultSearchSummary({
      search,
      summary: reviewScope.summary,
    }),
    sortedPerformanceItems: reviewScope.sortedPerformanceItems,
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
  search,
  summary,
}: ResultSearchSummaryInput) {
  if (!normalizeResultSearch(search)) {
    return m.assignment_result_search_summary_all_students();
  }

  return joinAssignmentResultSearchSummaryParts([
    formatResultStudentCount(summary.students.matched),
    formatResultAttemptCount(summary.attemptRows.matched),
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
  const copyScopeView = buildAssignmentResultCopyScopeView({
    controlViews,
    summary: resultView.reviewScope.summary,
  });
  const attemptTableView = data
    ? buildAssignmentAttemptTableView({
        rows: resultView.filteredAttemptRows,
        timeLimitSeconds:
          headerView?.settingsSummaryView.settings.timeLimitSeconds,
      })
    : buildAssignmentAttemptTableView({
        rows: [],
        timeLimitSeconds:
          headerView?.settingsSummaryView.settings.timeLimitSeconds,
      });
  const studentSummaryTableView = buildAssignmentStudentSummaryTableView(
    resultView.filteredStudents
  );
  const itemPerformanceTableView = buildAssignmentItemPerformanceTableView(
    resultView.sortedPerformanceItems
  );
  const attemptRowViews = attemptTableView.rows;
  const studentSummaryRowViews = studentSummaryTableView.rows;
  const itemPerformanceRowViews = itemPerformanceTableView.rows;
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
  const copyActionData = data
    ? buildAssignmentResultCopyActionData({
        data,
        items: resultView.sortedPerformanceItems,
        students: resultView.filteredStudents,
      })
    : null;
  const copyArtifacts = copyActionData
    ? buildAssignmentResultCopyArtifacts(copyActionData)
    : null;
  const classroomBrief = copyArtifacts?.classroomBrief ?? null;
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
  const actionButtons = buildAssignmentResultActionButtons(actionState);
  const actionDataSet = buildAssignmentResultActionDataSet({
    copyActionData,
    exportActionData: data ?? null,
  });
  const sectionState = buildAssignmentResultSectionState({
    attemptCount: completedAttemptCount,
    attemptReviewCount: completedAttemptReviewCount,
    classroomBriefReady: Boolean(classroomBrief),
    itemCount: data?.analysis.perItem.length ?? 0,
    studentCount: data?.analysis.students.length ?? 0,
  });
  const sectionViews = buildAssignmentResultSectionViews({
    resultView,
    sectionState,
  });
  const copyArtifactPreviews = copyArtifacts
    ? buildAssignmentResultCopyArtifactPreviews(copyArtifacts).flatMap(
        (preview) => {
          const actionButton = actionButtons.find(
            (button) => button.action === preview.action
          );

          return actionButton
            ? [
                {
                  ...preview,
                  actionButton,
                },
              ]
            : [];
        }
      )
    : [];

  return {
    actionButtons,
    actionData: data ?? null,
    actionDataSet,
    actionState,
    attemptReviewCardViews,
    attemptRowViews,
    attemptTableView,
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
    copyActionData,
    copyArtifactPreviews,
    copyScopeView,
    description: assignmentResultPageCopy.description,
    headerView,
    itemAnalysisCardViews,
    itemPerformanceRowViews,
    itemPerformanceTableView,
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
    sectionState,
    sectionViews,
    studentSummaryRowViews,
    studentSummaryTableView,
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
  const selectedAttemptReviewFilterOption =
    resolveAssignmentResultControlOption(
      attemptReviewFilterOptions,
      viewState.attemptReviewFilter
    );
  const selectedItemPerformanceSortOption =
    resolveAssignmentResultControlOption(
      itemPerformanceSortOptions,
      viewState.itemPerformanceSort
    );
  const selectedStudentSortOption = resolveAssignmentResultControlOption(
    studentSummarySortOptions,
    viewState.studentSort
  );

  return {
    attemptReviewFilter: {
      filter: viewState.attemptReviewFilter,
      label: assignmentResultSearchCopy.reviewViewLabel,
      options: attemptReviewFilterOptions,
      selectedFilterOption: selectedAttemptReviewFilterOption,
    },
    itemPerformanceSort: {
      label: assignmentResultSearchCopy.sortItemsLabel,
      options: itemPerformanceSortOptions,
      selectedSortOption: selectedItemPerformanceSortOption,
      sort: viewState.itemPerformanceSort,
    },
    studentSearch: {
      clearLabel: assignmentResultSearchCopy.clearStudentSearchLabel,
      hasSearchValue: Boolean(viewState.studentSearch),
      label: assignmentResultSearchCopy.findStudentLabel,
      placeholder: assignmentResultSearchCopy.placeholder,
      selectedSortOption: selectedStudentSortOption,
      sort: viewState.studentSort,
      sortLabel: assignmentResultSearchCopy.sortStudentsLabel,
      sortOptions: studentSummarySortOptions,
      summary: resultSearchSummary,
      value: viewState.studentSearch,
    },
  };
}

export function buildAssignmentResultCopyScopeView({
  controlViews,
  summary,
}: {
  controlViews: AssignmentResultControlViews;
  summary?: AssignmentResultReviewScopeSummary;
}): AssignmentResultCopyScopeView {
  return {
    description: assignmentResultCopyScopeCopy.description,
    itemViews: [
      {
        description: controlViews.studentSearch.selectedSortOption.description,
        id: 'students',
        label: assignmentResultCopyScopeCopy.studentLabel,
        value: controlViews.studentSearch.summary,
      },
      {
        description:
          controlViews.itemPerformanceSort.selectedSortOption.description,
        id: 'items',
        label: assignmentResultCopyScopeCopy.itemLabel,
        value: controlViews.itemPerformanceSort.selectedSortOption.label,
      },
      {
        description:
          controlViews.attemptReviewFilter.selectedFilterOption.description,
        id: 'review',
        label: assignmentResultCopyScopeCopy.reviewLabel,
        value: controlViews.attemptReviewFilter.selectedFilterOption.label,
      },
    ],
    ...(summary ? { summary } : {}),
    title: assignmentResultCopyScopeCopy.title,
  };
}

function resolveAssignmentResultControlOption<TValue extends string>(
  options: Array<AssignmentResultControlOption<TValue>>,
  value: TValue
): AssignmentResultControlOption<TValue> {
  const selectedOption = options.find((option) => option.value === value);
  if (selectedOption) return selectedOption;

  const fallbackOption = options[0];
  if (fallbackOption) return fallbackOption;

  throw new Error('Assignment result control options cannot be empty.');
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
