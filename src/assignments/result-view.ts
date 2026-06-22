import type {
  AssignmentAttemptReview,
  AssignmentItemAnalysis,
  AssignmentStudentSummary,
} from '@/assignments/results';
import {
  buildAssignmentResultsCsv,
  buildAssignmentResultsCsvFilename,
} from '@/assignments/results-export';
import { buildAssignmentItemReviewSummary } from '@/assignments/item-review-summary';
import { getAssignmentStatusLabel } from '@/assignments/lifecycle';
import { buildAssignmentReteachPlan } from '@/assignments/reteach-plan';
import { formatAttemptDuration } from '@/assignments/attempt-duration';
import { formatAssignmentExpiry } from '@/assignments/delivery-summary';
import { normalizeStudentName } from '@/assignments/identity';
import {
  formatAcceptedAnswerAlternatives,
  formatAssignmentResultDate,
} from '@/assignments/result-format';
import { compareAssignmentItemsByReviewPriority } from '@/assignments/review-priority';
import { buildAssignmentSharePath } from '@/assignments/share-link';
import { compareAssignmentStudentsByFollowUpPriority } from '@/assignments/student-follow-up-priority';
import { buildAssignmentStudentFollowUpSummary } from '@/assignments/student-follow-up-summary';
import type {
  ActivityTemplateType,
  AssignmentStatus,
} from '@/activities/types';
import { m } from '@/locale/paraglide/messages';

export type StudentSummarySort = 'attempts' | 'best' | 'name' | 'needs-review';
export type ItemPerformanceSort =
  | 'accuracy'
  | 'original'
  | 'submitted'
  | 'type';
export type AttemptReviewFilter = 'all' | 'needs-review';

export type AssignmentResultSearchState = {
  itemSort?: ItemPerformanceSort;
  review?: AttemptReviewFilter;
  sort?: StudentSummarySort;
};

type AssignmentResultResolvedViewState = {
  attemptReviewFilter: AttemptReviewFilter;
  itemPerformanceSort: ItemPerformanceSort;
  studentSort: StudentSummarySort;
};

type AssignmentResultControlSearchUpdate =
  | {
      control: 'attempt-review-filter';
      value: AttemptReviewFilter;
    }
  | {
      control: 'item-performance-sort';
      value: ItemPerformanceSort;
    }
  | {
      control: 'student-sort';
      value: StudentSummarySort;
    };

export type AssignmentResultAction =
  | 'copy-brief'
  | 'copy-follow-up'
  | 'copy-item-review'
  | 'copy-reteach-plan'
  | 'export-csv';

export type AssignmentResultActionGate =
  | {
      type: 'ready';
    }
  | {
      message: string;
      type: 'blocked';
    };

export type AssignmentResultActionCopy = {
  failureMessage: string;
  label: string;
  successMessage: string;
};

export type AssignmentResultCopyAction = Exclude<
  AssignmentResultAction,
  'export-csv'
>;

export type AssignmentResultActionButton =
  | {
      action: AssignmentResultCopyAction;
      disabled: boolean;
      failureMessage: string;
      gate: AssignmentResultActionGate;
      kind: 'copy-text';
      label: string;
      successMessage: string;
    }
  | {
      action: 'export-csv';
      disabled: boolean;
      failureMessage: string;
      gate: AssignmentResultActionGate;
      kind: 'download-csv';
      label: string;
      successMessage: string;
    };

type AssignmentResultActionPayload =
  | {
      kind: 'copy-text';
      text: string;
    }
  | {
      csv: string;
      filename: string;
      kind: 'download-csv';
    };

type AssignmentResultActionButtonBase = {
  disabled: boolean;
  failureMessage: string;
  gate: AssignmentResultActionGate;
  label: string;
  successMessage: string;
};

type AssignmentResultActionState = {
  attemptCount: number;
  classroomBriefReady: boolean;
  itemCount: number;
  studentCount: number;
};

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

type AssignmentResultControlOption<TValue extends string> = {
  label: string;
  value: TValue;
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
    shareSlug: string;
    status: AssignmentStatus | string;
    title: string;
  };
  snapshot: {
    activityDescription: string | null;
    activityTitle: string;
    templateType: ActivityTemplateType;
  } | null;
};

type AssignmentResultHeaderShareAction = {
  label: string;
  sharePath: string;
  shareSlug: string;
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
  emptyValue: '-',
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

export const assignmentResultActionOrder = [
  'copy-brief',
  'copy-reteach-plan',
  'copy-item-review',
  'copy-follow-up',
  'export-csv',
] satisfies AssignmentResultAction[];

export const studentSummarySortOptions = [
  {
    get label() {
      return m.assignment_result_sort_needs_review();
    },
    value: 'needs-review',
  },
  {
    get label() {
      return m.assignment_result_sort_best_score();
    },
    value: 'best',
  },
  {
    get label() {
      return m.assignment_result_sort_student_name();
    },
    value: 'name',
  },
  {
    get label() {
      return m.assignment_result_sort_attempts();
    },
    value: 'attempts',
  },
] satisfies Array<AssignmentResultControlOption<StudentSummarySort>>;

export const itemPerformanceSortOptions = [
  {
    get label() {
      return m.assignment_result_sort_snapshot_order();
    },
    value: 'original',
  },
  {
    get label() {
      return m.assignment_result_sort_lowest_accuracy();
    },
    value: 'accuracy',
  },
  {
    get label() {
      return m.assignment_result_sort_most_answered();
    },
    value: 'submitted',
  },
  {
    get label() {
      return m.assignment_result_sort_item_type();
    },
    value: 'type',
  },
] satisfies Array<AssignmentResultControlOption<ItemPerformanceSort>>;

export const attemptReviewFilterOptions = [
  {
    get label() {
      return m.assignment_result_filter_all_answers();
    },
    value: 'all',
  },
  {
    get label() {
      return m.assignment_result_filter_needs_review_only();
    },
    value: 'needs-review',
  },
] satisfies Array<AssignmentResultControlOption<AttemptReviewFilter>>;

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
  const valueByMetric = {
    'average-accuracy': `${averageScore}%`,
    'average-points': String(averagePoints),
    'average-time': formatAttemptDuration(averageDurationSeconds),
    closes: formatAssignmentExpiry(expiresAt),
    completions: String(completions),
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
  const shareAction = buildAssignmentResultHeaderShareAction(
    assignment.shareSlug
  );

  return {
    activityDescription:
      snapshot?.activityDescription ?? activity.description ?? '',
    activityTitle: snapshot?.activityTitle ?? activity.title,
    assignmentSharePath: shareAction.sharePath,
    assignmentTitle: assignment.title,
    shareAction,
    shareSlug: shareAction.shareSlug,
    statusLabel: getAssignmentStatusLabel(
      assignment.status,
      assignment.expiresAt,
      now
    ),
    templateType: snapshot?.templateType ?? activity.templateType,
  };
}

export function buildAssignmentResultHeaderShareAction(
  shareSlug: string
): AssignmentResultHeaderShareAction {
  return {
    label: assignmentResultPageCopy.openStudentLinkLabel,
    sharePath: buildAssignmentSharePath(shareSlug),
    shareSlug,
  };
}

export function buildAssignmentResultActionState({
  attemptCount,
  classroomBriefReady = false,
  itemCount,
  studentCount,
}: {
  attemptCount: number;
  classroomBriefReady?: boolean;
  itemCount: number;
  studentCount: number;
}): AssignmentResultActionState {
  return {
    attemptCount,
    classroomBriefReady,
    itemCount,
    studentCount,
  };
}

export function buildAssignmentResultActionButtons({
  attemptCount,
  classroomBriefReady,
  itemCount,
  studentCount,
}: AssignmentResultActionState): AssignmentResultActionButton[] {
  return assignmentResultActionOrder.map((action) => {
    const gate = getAssignmentResultActionGate({
      action,
      attemptCount,
      classroomBriefReady,
      itemCount,
      studentCount,
    });
    const actionCopy = getAssignmentResultActionCopy(action);
    const base = {
      disabled: gate.type === 'blocked',
      failureMessage: actionCopy.failureMessage,
      gate,
      label: actionCopy.label,
      successMessage: actionCopy.successMessage,
    } satisfies AssignmentResultActionButtonBase;

    if (action === 'export-csv') {
      return {
        ...base,
        action,
        kind: 'download-csv',
      };
    }

    return {
      ...base,
      action,
      kind: 'copy-text',
    };
  });
}

export function getAssignmentResultActionGateFromState({
  action,
  state,
}: {
  action: AssignmentResultAction;
  state: AssignmentResultActionState;
}): AssignmentResultActionGate {
  return getAssignmentResultActionGate({
    action,
    attemptCount: state.attemptCount,
    classroomBriefReady: state.classroomBriefReady,
    itemCount: state.itemCount,
    studentCount: state.studentCount,
  });
}

export function buildAssignmentResultCopyText({
  action,
  assignmentTitle,
  classroomBriefText,
  items,
  students,
}: {
  action: AssignmentResultCopyAction;
  assignmentTitle: string;
  classroomBriefText?: string;
  items: AssignmentItemAnalysis[];
  students: AssignmentStudentSummary[];
}) {
  if (action === 'copy-brief') {
    return classroomBriefText ?? '';
  }

  if (action === 'copy-reteach-plan') {
    return buildAssignmentReteachPlan({
      assignmentTitle,
      items,
      students,
    });
  }

  if (action === 'copy-item-review') {
    return buildAssignmentItemReviewSummary({
      assignmentTitle,
      items,
    });
  }

  return buildAssignmentStudentFollowUpSummary({
    assignmentTitle,
    students,
  });
}

export function buildAssignmentResultActionPayload({
  actionButton,
  assignmentTitle,
  classroomBriefText,
  exportData,
  items,
  students,
}: {
  actionButton: AssignmentResultActionButton;
  assignmentTitle: string;
  classroomBriefText?: string;
  exportData: Parameters<typeof buildAssignmentResultsCsv>[0];
  items: AssignmentItemAnalysis[];
  students: AssignmentStudentSummary[];
}): AssignmentResultActionPayload {
  if (actionButton.kind === 'download-csv') {
    return {
      csv: buildAssignmentResultsCsv(exportData),
      filename: buildAssignmentResultsCsvFilename(exportData),
      kind: 'download-csv',
    };
  }

  return {
    kind: 'copy-text',
    text: buildAssignmentResultCopyText({
      action: actionButton.action,
      assignmentTitle,
      classroomBriefText,
      items,
      students,
    }),
  };
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
}: {
  attempt: AssignmentAttemptRowDisplayInput;
  review: AssignmentAttemptReview | undefined;
}) {
  return {
    accuracyLabel: formatAssignmentResultPercent(
      attempt.resultJson?.accuracy ?? 0
    ),
    answeredLabel: formatAssignmentResultFraction(
      attempt.resultJson?.completedItemCount ?? 0,
      attempt.resultJson?.totalPoints ?? 0
    ),
    durationLabel: formatAttemptDuration(
      attempt.resultJson?.durationSeconds ?? 0
    ),
    scoreLabel: formatAssignmentResultFraction(
      attempt.score ?? 0,
      attempt.maxScore ?? 0
    ),
    studentLabel: getAssignmentAttemptStudentLabel({
      reviewStudentLabel: review?.studentLabel,
      studentName: attempt.studentName,
    }),
    submittedAtLabel: formatAssignmentResultDate(attempt.completedAt),
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

export function getAssignmentAnswerReviewStatus(correct: boolean) {
  return {
    label: correct
      ? assignmentResultReviewCopy.correctAnswerLabel
      : assignmentResultReviewCopy.reviewAnswerLabel,
    tone: correct ? 'correct' : 'review',
  } as const;
}

export function formatAssignmentAttemptReviewBadge({
  accuracy,
  score,
}: Pick<AssignmentAttemptReview, 'accuracy' | 'score'>) {
  return `${score} pts · ${formatAssignmentResultPercent(accuracy)}`;
}

export function buildAssignmentAttemptReviewCardView(
  attempt: Pick<
    AssignmentAttemptReview,
    'accuracy' | 'completedAt' | 'score' | 'studentLabel'
  >
) {
  return {
    badgeLabel: formatAssignmentAttemptReviewBadge(attempt),
    studentLabel: attempt.studentLabel,
    submittedAtLabel: formatAssignmentResultDate(attempt.completedAt),
  };
}

export function buildAssignmentClassroomBriefFocusItemView({
  index,
  item,
}: {
  index: number;
  item: AssignmentItemAnalysis;
}) {
  return {
    correctRateLabel: formatAssignmentResultPercent(item.correctRate),
    correctSummaryLabel: formatAssignmentItemCorrectSummary(item),
    itemNumberLabel: `${Math.max(0, index) + 1}.`,
    prompt: item.prompt,
  };
}

export function buildAssignmentClassroomBriefFollowUpStudentView(
  student: AssignmentStudentSummary
) {
  return {
    accuracyLabel: formatAssignmentBriefStudentAccuracy(student),
    needsReviewLabel: formatAssignmentReviewCount(student.needsReviewCount),
    studentLabel: student.studentLabel,
  };
}

export function formatAssignmentBriefStudentAccuracy({
  bestAccuracy,
  latestAccuracy,
}: Pick<AssignmentStudentSummary, 'bestAccuracy' | 'latestAccuracy'>) {
  return m.assignment_result_brief_student_accuracy({
    best: formatAssignmentResultPercent(bestAccuracy),
    latest: formatAssignmentResultPercent(latestAccuracy),
  });
}

export function buildAssignmentStudentSummaryRowView(
  student: AssignmentStudentSummary
) {
  return {
    attemptsLabel: String(student.attempts),
    averageAccuracyLabel: formatAssignmentResultPercent(
      student.averageAccuracy
    ),
    bestAccuracyLabel: formatAssignmentResultPercent(student.bestAccuracy),
    lastSubmittedLabel: formatAssignmentResultDate(student.lastCompletedAt),
    latestAccuracyLabel: formatAssignmentResultPercent(student.latestAccuracy),
    needsReviewLabel: String(student.needsReviewCount),
    studentLabel: student.studentLabel,
  };
}

export function buildAssignmentItemAnalysisCardView(
  item: AssignmentItemAnalysis
) {
  const acceptedAnswersText =
    item.acceptedAnswers.length > 1
      ? formatAcceptedAnswerAlternatives(item.acceptedAnswers)
      : null;

  return {
    acceptedAnswersLabel: assignmentResultReviewCopy.acceptedLabel,
    acceptedAnswersText,
    correctRateLabel: formatAssignmentResultPercent(item.correctRate),
    correctRateProgressValue: clampProgressValue(item.correctRate),
    correctSummaryLabel: formatAssignmentItemCorrectSummary(item),
    expectedAnswerLabel: assignmentResultReviewCopy.itemAnswerLabel,
    expectedAnswerText: formatAssignmentResultValue(item.expectedAnswer),
    explanationText: item.explanation || null,
    kindLabel: item.kindLabel,
    prompt: item.prompt,
  };
}

export function buildAssignmentItemPerformanceRowView({
  index,
  item,
}: {
  index: number;
  item: AssignmentItemAnalysis;
}) {
  return {
    acceptedAnswersText: formatAcceptedAnswerAlternatives(item.acceptedAnswers),
    correctRateLabel: formatAssignmentResultPercent(item.correctRate),
    expectedAnswerText: formatAssignmentResultValue(item.expectedAnswer),
    explanationText: formatAssignmentResultValue(item.explanation),
    itemNumberLabel: `${Math.max(0, index) + 1}.`,
    kindLabel: item.kindLabel,
    prompt: item.prompt,
    submittedLabel: formatAssignmentResultFraction(
      item.correctCount,
      item.submittedCount
    ),
  };
}

export function buildAssignmentAttemptAnswerReviewView({
  answer,
  index,
}: {
  answer: AssignmentAttemptReview['answers'][number];
  index: number;
}) {
  const status = getAssignmentAnswerReviewStatus(answer.correct);
  const acceptedAnswersText =
    answer.acceptedAnswers.length > 1
      ? formatAcceptedAnswerAlternatives(answer.acceptedAnswers)
      : null;

  return {
    acceptedAnswersLabel: assignmentResultReviewCopy.acceptedAnswersLabel,
    acceptedAnswersText,
    expectedAnswerLabel: assignmentResultReviewCopy.expectedAnswerLabel,
    expectedAnswerText: formatAssignmentResultValue(answer.expectedAnswer),
    explanationText: answer.explanation || null,
    promptLabel: `${Math.max(0, index) + 1}. ${answer.prompt}`,
    statusLabel: status.label,
    statusTone: status.tone,
    studentAnswerLabel: assignmentResultReviewCopy.studentAnswerLabel,
    studentAnswerText: formatAssignmentResultValue(answer.answer),
  };
}

export function formatAssignmentItemCorrectSummary({
  correctCount,
  submittedCount,
}: Pick<AssignmentItemAnalysis, 'correctCount' | 'submittedCount'>) {
  return m.assignment_result_summary_correct_count({
    correctCount,
    submittedCount,
  });
}

export function formatAssignmentResultFraction(value: number, total: number) {
  return `${value}/${total}`;
}

export function formatAssignmentResultPercent(value: number) {
  return `${value}%`;
}

export function formatAssignmentResultValue(value: string | null | undefined) {
  return value || assignmentResultReviewCopy.emptyValue;
}

export function formatAssignmentReviewCount(count: number) {
  if (count === 1) {
    return m.assignment_result_review_count_one({ count });
  }

  return m.assignment_result_review_count_many({ count });
}

function clampProgressValue(value: number) {
  return Math.min(100, Math.max(0, value));
}

export type ResultSearchSummaryInput = {
  matchedAttempts: number;
  matchedStudents: number;
  search: string;
};

export type AttemptReviewSubmissionSummaryInput = {
  shownAttempts: number;
  totalAttempts: number;
};

export type AssignmentAttemptRowInput = {
  id: string;
  studentName: string | null;
};

export type AssignmentAttemptReviewRow<
  TAttempt extends AssignmentAttemptRowInput,
> = {
  attempt: TAttempt;
  review: AssignmentAttemptReview | undefined;
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

export function filterAndSortStudentSummaries({
  search,
  sort,
  students,
}: {
  search: string;
  sort: StudentSummarySort;
  students: AssignmentStudentSummary[];
}) {
  const normalizedSearch = normalizeResultSearch(search);
  const matchedStudents = normalizedSearch
    ? students.filter((student) =>
        matchesResultSearch(student.studentLabel, normalizedSearch)
      )
    : students;

  return sortStudentSummaries(matchedStudents, sort);
}

export function buildFilteredAttemptRows<
  TAttempt extends AssignmentAttemptRowInput,
>({
  attempts,
  reviews,
  search,
}: {
  attempts: TAttempt[];
  reviews: AssignmentAttemptReview[];
  search: string;
}): Array<AssignmentAttemptReviewRow<TAttempt>> {
  const normalizedSearch = normalizeResultSearch(search);
  const reviewById = new Map(reviews.map((item) => [item.id, item]));

  return attempts
    .map((attempt) => ({
      attempt,
      review: reviewById.get(attempt.id),
    }))
    .filter((row) => {
      if (!normalizedSearch) return true;
      const label = row.review?.studentLabel ?? row.attempt.studentName;
      return matchesResultSearch(label, normalizedSearch);
    });
}

export function filterAttemptReviews({
  attempts,
  filter,
  search,
}: {
  attempts: AssignmentAttemptReview[];
  filter: AttemptReviewFilter;
  search: string;
}) {
  const normalizedSearch = normalizeResultSearch(search);

  return attempts.filter((attempt) => {
    const matchesStudent = normalizedSearch
      ? matchesResultSearch(attempt.studentLabel, normalizedSearch)
      : true;
    if (!matchesStudent) return false;

    if (filter === 'needs-review') {
      return attempt.answers.some((answer) => !answer.correct);
    }

    return true;
  });
}

export function buildResultSearchSummary({
  matchedAttempts,
  matchedStudents,
  search,
}: ResultSearchSummaryInput) {
  if (!normalizeResultSearch(search)) {
    return m.assignment_result_search_summary_all_students();
  }

  return [
    formatResultStudentCount(matchedStudents),
    formatResultAttemptCount(matchedAttempts),
  ].join(' · ');
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

export function getAssignmentResultActionGate({
  action,
  attemptCount,
  classroomBriefReady = false,
  itemCount,
  studentCount,
}: {
  action: AssignmentResultAction;
  attemptCount: number;
  classroomBriefReady?: boolean;
  itemCount: number;
  studentCount: number;
}): AssignmentResultActionGate {
  if (action === 'copy-item-review') {
    return itemCount > 0
      ? { type: 'ready' }
      : {
          message: m.assignment_result_action_gate_add_items_item_review(),
          type: 'blocked',
        };
  }

  if (action === 'copy-follow-up') {
    return studentCount > 0
      ? { type: 'ready' }
      : {
          message: m.assignment_result_action_gate_submit_attempt_follow_up(),
          type: 'blocked',
        };
  }

  if (action === 'copy-brief' && !classroomBriefReady) {
    return {
      message: m.assignment_result_action_gate_submit_attempt_brief(),
      type: 'blocked',
    };
  }

  if (attemptCount > 0) return { type: 'ready' };

  return {
    message: getNoAttemptResultActionMessage(action),
    type: 'blocked',
  };
}

export function getAssignmentResultActionCopy(
  action: AssignmentResultAction
): AssignmentResultActionCopy {
  switch (action) {
    case 'copy-brief':
      return {
        failureMessage: m.assignment_result_action_copy_brief_failure(),
        label: m.assignment_result_action_copy_brief_label(),
        successMessage: m.assignment_result_action_copy_brief_success(),
      };
    case 'copy-follow-up':
      return {
        failureMessage: m.assignment_result_action_copy_follow_up_failure(),
        label: m.assignment_result_action_copy_follow_up_label(),
        successMessage: m.assignment_result_action_copy_follow_up_success(),
      };
    case 'copy-item-review':
      return {
        failureMessage: m.assignment_result_action_copy_item_review_failure(),
        label: m.assignment_result_action_copy_item_review_label(),
        successMessage: m.assignment_result_action_copy_item_review_success(),
      };
    case 'copy-reteach-plan':
      return {
        failureMessage: m.assignment_result_action_copy_reteach_plan_failure(),
        label: m.assignment_result_action_copy_reteach_plan_label(),
        successMessage: m.assignment_result_action_copy_reteach_plan_success(),
      };
    case 'export-csv':
      return {
        failureMessage: m.assignment_result_action_export_csv_failure(),
        label: m.assignment_result_action_export_csv_label(),
        successMessage: m.assignment_result_action_export_csv_success(),
      };
  }
}

export function sortStudentSummaries(
  students: AssignmentStudentSummary[],
  sort: StudentSummarySort
) {
  return [...students].sort((left, right) => {
    if (sort === 'best') {
      return compareStudentsDescending(
        left.bestAccuracy,
        right.bestAccuracy,
        left,
        right
      );
    }

    if (sort === 'name') {
      return left.studentLabel.localeCompare(right.studentLabel);
    }

    if (sort === 'attempts') {
      return compareStudentsDescending(
        left.attempts,
        right.attempts,
        left,
        right
      );
    }

    return compareAssignmentStudentsByFollowUpPriority(left, right);
  });
}

export function sortItemPerformance(
  items: AssignmentItemAnalysis[],
  sort: ItemPerformanceSort
) {
  if (sort === 'original') return items;

  return [...items].sort((left, right) => {
    if (sort === 'accuracy') {
      return compareAssignmentItemsByReviewPriority(left, right);
    }

    if (sort === 'submitted') {
      if (left.submittedCount !== right.submittedCount) {
        return right.submittedCount - left.submittedCount;
      }
      return left.correctRate - right.correctRate;
    }

    if (sort === 'type') {
      const typeCompare = left.kind.localeCompare(right.kind);
      if (typeCompare !== 0) return typeCompare;
      return left.prompt.localeCompare(right.prompt);
    }

    return 0;
  });
}

export function parseStudentSummarySort(
  value: unknown
): StudentSummarySort | undefined {
  return value === 'best' || value === 'name' || value === 'attempts'
    ? value
    : undefined;
}

export function parseItemPerformanceSort(
  value: unknown
): ItemPerformanceSort | undefined {
  return value === 'accuracy' || value === 'submitted' || value === 'type'
    ? value
    : undefined;
}

export function parseAttemptReviewFilter(
  value: unknown
): AttemptReviewFilter | undefined {
  return value === 'needs-review' ? value : undefined;
}

export function buildAssignmentResultRouteSearch(
  search: Record<string, unknown>
): AssignmentResultSearchState {
  return {
    itemSort: parseItemPerformanceSort(search.itemSort),
    review: parseAttemptReviewFilter(search.review),
    sort: parseStudentSummarySort(search.sort),
  };
}

export function resolveAssignmentResultViewState(
  search: AssignmentResultSearchState
): AssignmentResultResolvedViewState {
  return {
    attemptReviewFilter: search.review ?? 'all',
    itemPerformanceSort: search.itemSort ?? 'original',
    studentSort: search.sort ?? 'needs-review',
  };
}

export function buildAssignmentResultSearchState({
  current,
  next,
}: {
  current: AssignmentResultSearchState;
  next: Partial<{
    itemSort: ItemPerformanceSort;
    review: AttemptReviewFilter;
    sort: StudentSummarySort;
  }>;
}): AssignmentResultSearchState {
  const itemSort = next.itemSort ?? current.itemSort;
  const review = next.review ?? current.review;
  const sort = next.sort ?? current.sort;

  return {
    itemSort: itemSort === 'original' ? undefined : itemSort,
    review: review === 'all' ? undefined : review,
    sort: sort === 'needs-review' ? undefined : sort,
  };
}

export function buildAssignmentResultControlSearchState({
  current,
  update,
}: {
  current: AssignmentResultSearchState;
  update: AssignmentResultControlSearchUpdate;
}): AssignmentResultSearchState {
  if (update.control === 'attempt-review-filter') {
    return buildAssignmentResultSearchState({
      current,
      next: { review: update.value },
    });
  }

  if (update.control === 'item-performance-sort') {
    return buildAssignmentResultSearchState({
      current,
      next: { itemSort: update.value },
    });
  }

  return buildAssignmentResultSearchState({
    current,
    next: { sort: update.value },
  });
}

export function normalizeResultSearch(value: string | null | undefined) {
  const normalized = value
    ?.normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase();
  return normalized || undefined;
}

export function matchesResultSearch(
  value: string | null | undefined,
  search: string
) {
  const normalizedSearch = normalizeResultSearch(search) ?? search;
  return normalizeResultSearch(value)?.includes(normalizedSearch) ?? false;
}

function compareStudentsDescending(
  leftValue: number,
  rightValue: number,
  leftStudent: AssignmentStudentSummary,
  rightStudent: AssignmentStudentSummary
) {
  if (leftValue !== rightValue) return rightValue - leftValue;
  return leftStudent.studentLabel.localeCompare(rightStudent.studentLabel);
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

function getNoAttemptResultActionMessage(action: AssignmentResultAction) {
  if (action === 'export-csv') {
    return m.assignment_result_action_gate_submit_attempt_export();
  }

  if (action === 'copy-reteach-plan') {
    return m.assignment_result_action_gate_submit_attempt_reteach();
  }

  return m.assignment_result_action_gate_submit_attempt_brief();
}
