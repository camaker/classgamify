import type {
  AssignmentAttemptReview,
  AssignmentItemAnalysis,
  AssignmentStudentSummary,
} from '@/assignments/results';
import { buildAssignmentItemReviewSummary } from '@/assignments/item-review-summary';
import { getAssignmentStatusLabel } from '@/assignments/lifecycle';
import { buildAssignmentReteachPlan } from '@/assignments/reteach-plan';
import { formatAttemptDuration } from '@/assignments/attempt-duration';
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

export const assignmentResultPageCopy = {
  defaultTitle: 'Assignment results',
  description:
    'Review student attempts, scores, and assignment-level result metrics.',
  loadErrorMessage:
    'Assignment results could not be loaded. Refresh the page or return to assignments.',
  openStudentLinkLabel: 'Open student link',
} as const;

export const assignmentResultSearchCopy = {
  clearStudentSearchLabel: 'Clear student search',
  findStudentLabel: 'Find student',
  placeholder: 'Search by student name',
  reviewViewLabel: 'Review view',
  sortItemsLabel: 'Sort items',
  sortStudentsLabel: 'Sort students',
} as const;

export const assignmentResultSectionCopy = {
  answerReview: {
    description:
      'Item-level answers are scored from the frozen assignment snapshot, so teacher edits never change historical results.',
    title: 'Answer review',
  },
  classroomBrief: {
    description:
      'A compact class-ready summary built from the frozen assignment snapshot and submitted attempts.',
    title: 'Classroom brief',
  },
  classReviewFocus: {
    emptyMessage: 'No submitted item data yet.',
    title: 'Class review focus',
  },
  itemPerformance: {
    description:
      'Review every prompt from the frozen assignment snapshot, including submitted counts, correct rates, and answer notes.',
    title: 'Item performance',
  },
  reteachPriorities: {
    description:
      'Items are sorted by the lowest correct rate so teachers can quickly decide what to review with the class.',
    emptyMessage:
      'Submit at least one answered attempt to calculate item review priorities.',
    title: 'Reteach priorities',
  },
  studentAttempts: {
    description:
      'Latest submitted attempts are shown first, with detailed answer review below.',
    title: 'Student attempts',
  },
  studentFollowUp: {
    emptyMessage: 'No student-specific review needs yet.',
    title: 'Student follow-up',
  },
  studentSummary: {
    description:
      'Sort students by review priority, best score, name, or attempt volume before reading every submitted answer.',
    title: 'Student summary',
  },
} as const;

export const assignmentResultTableHeaders = {
  itemPerformance: [
    'Item',
    'Type',
    'Correct rate',
    'Submitted',
    'Expected',
    'Accepted',
    'Explanation',
  ],
  studentAttempts: [
    'Student',
    'Score',
    'Accuracy',
    'Answered',
    'Time',
    'Submitted',
  ],
  studentSummary: [
    'Student',
    'Attempts',
    'Latest',
    'Average',
    'Best',
    'Needs review',
    'Last submitted',
  ],
} as const;

export const assignmentResultReviewCopy = {
  acceptedAnswersLabel: 'Accepted answers',
  acceptedLabel: 'Accepted',
  anonymousStudentLabel: 'Anonymous student',
  correctAnswerLabel: 'Correct',
  emptyValue: '-',
  expectedAnswerLabel: 'Expected',
  itemAnswerLabel: 'answer',
  reviewAnswerLabel: 'Review',
  studentAnswerLabel: 'Student',
} as const;

const assignmentResultMetricDescriptors = [
  { key: 'completions', label: 'Completions' },
  { key: 'average-accuracy', label: 'Average accuracy' },
  { key: 'average-points', label: 'Average points' },
  { key: 'average-time', label: 'Average time' },
  { key: 'closes', label: 'Closes' },
] satisfies Array<AssignmentResultMetricDescriptor>;

export const assignmentResultActionOrder = [
  'copy-brief',
  'copy-reteach-plan',
  'copy-item-review',
  'copy-follow-up',
  'export-csv',
] satisfies AssignmentResultAction[];

export const studentSummarySortOptions = [
  { label: 'Needs review', value: 'needs-review' },
  { label: 'Best score', value: 'best' },
  { label: 'Student name', value: 'name' },
  { label: 'Attempts', value: 'attempts' },
] satisfies Array<AssignmentResultControlOption<StudentSummarySort>>;

export const itemPerformanceSortOptions = [
  { label: 'Snapshot order', value: 'original' },
  { label: 'Lowest accuracy', value: 'accuracy' },
  { label: 'Most answered', value: 'submitted' },
  { label: 'Item type', value: 'type' },
] satisfies Array<AssignmentResultControlOption<ItemPerformanceSort>>;

export const attemptReviewFilterOptions = [
  { label: 'All answers', value: 'all' },
  { label: 'Needs review only', value: 'needs-review' },
] satisfies Array<AssignmentResultControlOption<AttemptReviewFilter>>;

export function buildAssignmentResultMetricItems({
  averageDurationLabel,
  averagePoints,
  averageScore,
  closesLabel,
  completions,
}: {
  averageDurationLabel: string;
  averagePoints: number;
  averageScore: number;
  closesLabel: string;
  completions: number;
}) {
  const valueByMetric = {
    'average-accuracy': `${averageScore}%`,
    'average-points': String(averagePoints),
    'average-time': averageDurationLabel,
    closes: closesLabel,
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
  return {
    activityDescription:
      snapshot?.activityDescription ?? activity.description ?? '',
    activityTitle: snapshot?.activityTitle ?? activity.title,
    assignmentSharePath: buildAssignmentSharePath(assignment.shareSlug),
    assignmentTitle: assignment.title,
    shareSlug: assignment.shareSlug,
    statusLabel: getAssignmentStatusLabel(
      assignment.status,
      assignment.expiresAt,
      now
    ),
    templateType: snapshot?.templateType ?? activity.templateType,
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

  const normalizedStudentName = studentName?.trim();
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
  return `Latest ${formatAssignmentResultPercent(
    latestAccuracy
  )} · best ${formatAssignmentResultPercent(bestAccuracy)}`;
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
  return `${correctCount}/${submittedCount} correct`;
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
  return `${count} ${count === 1 ? 'review' : 'reviews'}`;
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
        description:
          'Student summaries appear after at least one submitted attempt.',
        title: 'No student summaries yet.',
      };
    }

    if (hasSearch) {
      return {
        description:
          'Clear the search or try another student name from this assignment.',
        title: 'No matching students.',
      };
    }

    return undefined;
  }

  if (input.surface === 'attempt-rows') {
    if (input.totalAttempts === 0) {
      return {
        description:
          'Share the student link, then completed submissions will appear here.',
        title: 'No student attempts yet.',
      };
    }

    if (hasSearch) {
      return {
        description:
          'Clear the search or try another student name from this assignment.',
        title: 'No matching attempts.',
      };
    }

    return undefined;
  }

  if (input.totalAttemptReviews === 0) {
    return {
      description:
        'Completed submissions will show item-level answer details here.',
      title: 'No answers to review yet.',
    };
  }

  if (hasSearch) {
    return {
      description:
        'Clear the search or try another student name from this assignment.',
      title: 'No matching answer reviews.',
    };
  }

  if (input.filter === 'needs-review') {
    return {
      description:
        'Every shown submission is currently correct for this assignment snapshot.',
      title: 'No answers need review.',
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
  if (!normalizeResultSearch(search)) return 'All students';

  return [
    formatCount(matchedStudents, 'student'),
    formatCount(matchedAttempts, 'attempt'),
  ].join(' · ');
}

export function buildAttemptReviewSubmissionSummary({
  shownAttempts,
  totalAttempts,
}: AttemptReviewSubmissionSummaryInput) {
  return `Showing ${shownAttempts} of ${totalAttempts} ${pluralize(
    totalAttempts,
    'submission'
  )}.`;
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
          message: 'Add assignment items before copying item review.',
          type: 'blocked',
        };
  }

  if (action === 'copy-follow-up') {
    return studentCount > 0
      ? { type: 'ready' }
      : {
          message: 'Submit at least one attempt before copying follow-up.',
          type: 'blocked',
        };
  }

  if (action === 'copy-brief' && !classroomBriefReady) {
    return {
      message: 'Submit at least one attempt before copying a brief.',
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
        failureMessage: 'Classroom brief could not be copied.',
        label: 'Copy brief',
        successMessage: 'Classroom brief copied.',
      };
    case 'copy-follow-up':
      return {
        failureMessage: 'Student follow-up could not be copied.',
        label: 'Copy follow-up',
        successMessage: 'Student follow-up copied.',
      };
    case 'copy-item-review':
      return {
        failureMessage: 'Item review could not be copied.',
        label: 'Copy item review',
        successMessage: 'Item review copied.',
      };
    case 'copy-reteach-plan':
      return {
        failureMessage: 'Reteach plan could not be copied.',
        label: 'Copy reteach plan',
        successMessage: 'Reteach plan copied.',
      };
    case 'export-csv':
      return {
        failureMessage: 'Results CSV could not be downloaded.',
        label: 'Download CSV',
        successMessage: 'Results CSV downloaded.',
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

export function normalizeResultSearch(value: string | null | undefined) {
  const normalized = value?.replace(/\s+/g, ' ').trim().toLocaleLowerCase();
  return normalized || undefined;
}

export function matchesResultSearch(
  value: string | null | undefined,
  search: string
) {
  return normalizeResultSearch(value)?.includes(search) ?? false;
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

function formatCount(count: number, singularLabel: string) {
  return `${count} ${pluralize(count, singularLabel)}`;
}

function getNoAttemptResultActionMessage(action: AssignmentResultAction) {
  if (action === 'export-csv') {
    return 'Submit at least one attempt before exporting results.';
  }

  if (action === 'copy-reteach-plan') {
    return 'Submit at least one attempt before copying a reteach plan.';
  }

  return 'Submit at least one attempt before copying a brief.';
}

function pluralize(count: number, singularLabel: string) {
  return count === 1 ? singularLabel : `${singularLabel}s`;
}
