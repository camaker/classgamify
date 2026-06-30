import type {
  AssignmentAttemptReview,
  AssignmentItemAnalysis,
  AssignmentStudentSummary,
} from '@/assignments/results';
import { isAssignmentAttemptAnswerNeedsReview } from '@/assignments/results';
import { createStudentIdentityResolver } from '@/assignments/identity';
import {
  compareAssignmentItemsByReviewPriority,
  compareAssignmentItemsByStableOrder,
  compareAssignmentItemsByType,
} from '@/assignments/review-priority';
import {
  compareAssignmentStudentsByDisplayLabel,
  compareAssignmentStudentsByFollowUpPriority,
} from '@/assignments/student-follow-up-priority';
import {
  compareRuntimeDisplaySearchText,
  normalizeRuntimeDisplaySearchKey,
} from '@/assignments/runtime-display';

export type StudentSummarySort =
  | 'attempts'
  | 'best'
  | 'last-submitted'
  | 'name'
  | 'needs-review';
export type ItemPerformanceSort =
  | 'accuracy'
  | 'original'
  | 'submitted'
  | 'type';
export type AttemptReviewFilter = 'all' | 'needs-review';

export const DEFAULT_STUDENT_SUMMARY_SORT =
  'needs-review' satisfies StudentSummarySort;
export const DEFAULT_ITEM_PERFORMANCE_SORT =
  'original' satisfies ItemPerformanceSort;
export const DEFAULT_ATTEMPT_REVIEW_FILTER =
  'all' satisfies AttemptReviewFilter;

export const STUDENT_SUMMARY_SORT_VALUES = [
  DEFAULT_STUDENT_SUMMARY_SORT,
  'best',
  'name',
  'attempts',
  'last-submitted',
] as const satisfies readonly StudentSummarySort[];

export const ITEM_PERFORMANCE_SORT_VALUES = [
  DEFAULT_ITEM_PERFORMANCE_SORT,
  'accuracy',
  'submitted',
  'type',
] as const satisfies readonly ItemPerformanceSort[];

export const ATTEMPT_REVIEW_FILTER_VALUES = [
  DEFAULT_ATTEMPT_REVIEW_FILTER,
  'needs-review',
] as const satisfies readonly AttemptReviewFilter[];

export type AssignmentResultSearchState = {
  itemSort?: ItemPerformanceSort;
  review?: AttemptReviewFilter;
  sort?: StudentSummarySort;
  student?: string;
};

export type AssignmentResultResolvedViewState = {
  attemptReviewFilter: AttemptReviewFilter;
  itemPerformanceSort: ItemPerformanceSort;
  studentSearch: string;
  studentSort: StudentSummarySort;
};

export type AssignmentResultControlSearchUpdate =
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
    }
  | {
      control: 'student-search';
      value: string;
    };

export type AssignmentAttemptRowInput = {
  anonymousToken?: string | null;
  completedAt?: Date | string | null;
  id: string;
  studentName: string | null;
};

export type AssignmentAttemptReviewRow<
  TAttempt extends AssignmentAttemptRowInput,
> = {
  attempt: TAttempt;
  review: AssignmentAttemptReview | undefined;
  studentLabel: string;
};

export type AssignmentResultReviewScopeCounts = {
  matchedAttemptReviews: number;
  matchedAttemptRows: number;
  matchedStudents: number;
  totalAttemptReviews: number;
  totalAttemptRows: number;
  totalStudents: number;
};

export type AssignmentResultReviewScopeSummary = {
  attemptReviews: {
    matched: number;
    total: number;
  };
  attemptRows: {
    matched: number;
    total: number;
  };
  itemPerformance: {
    matched: number;
    total: number;
  };
  students: {
    matched: number;
    total: number;
  };
};

export type AssignmentResultReviewScope<
  TAttempt extends AssignmentAttemptRowInput,
> = {
  counts: AssignmentResultReviewScopeCounts;
  filteredAttemptReviews: AssignmentAttemptReview[];
  filteredAttemptRows: Array<AssignmentAttemptReviewRow<TAttempt>>;
  filteredStudents: AssignmentStudentSummary[];
  summary: AssignmentResultReviewScopeSummary;
  sortedPerformanceItems: AssignmentItemAnalysis[];
};

export function buildAssignmentResultReviewScope<
  TAttempt extends AssignmentAttemptRowInput,
>({
  attemptReviewFilter,
  attempts,
  itemPerformanceSort,
  items,
  reviews,
  search,
  studentSort,
  students,
}: {
  attemptReviewFilter: AttemptReviewFilter;
  attempts: TAttempt[];
  itemPerformanceSort: ItemPerformanceSort;
  items: AssignmentItemAnalysis[];
  reviews: AssignmentAttemptReview[];
  search: string;
  studentSort: StudentSummarySort;
  students: AssignmentStudentSummary[];
}): AssignmentResultReviewScope<TAttempt> {
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

  const counts = {
    matchedAttemptReviews: filteredAttemptReviews.length,
    matchedAttemptRows: filteredAttemptRows.length,
    matchedStudents: filteredStudents.length,
    totalAttemptReviews: reviews.length,
    totalAttemptRows: attempts.length,
    totalStudents: students.length,
  } satisfies AssignmentResultReviewScopeCounts;
  const sortedPerformanceItems = sortItemPerformance(
    items,
    itemPerformanceSort
  );

  return {
    counts,
    filteredAttemptReviews,
    filteredAttemptRows,
    filteredStudents,
    summary: buildAssignmentResultReviewScopeSummary({
      counts,
      sortedPerformanceItemCount: sortedPerformanceItems.length,
      totalItemCount: items.length,
    }),
    sortedPerformanceItems,
  };
}

export function buildAssignmentResultReviewScopeSummary({
  counts,
  sortedPerformanceItemCount,
  totalItemCount,
}: {
  counts: AssignmentResultReviewScopeCounts;
  sortedPerformanceItemCount: number;
  totalItemCount: number;
}): AssignmentResultReviewScopeSummary {
  return {
    attemptReviews: {
      matched: normalizeAssignmentResultScopeCount(
        counts.matchedAttemptReviews
      ),
      total: normalizeAssignmentResultScopeCount(counts.totalAttemptReviews),
    },
    attemptRows: {
      matched: normalizeAssignmentResultScopeCount(counts.matchedAttemptRows),
      total: normalizeAssignmentResultScopeCount(counts.totalAttemptRows),
    },
    itemPerformance: {
      matched: normalizeAssignmentResultScopeCount(sortedPerformanceItemCount),
      total: normalizeAssignmentResultScopeCount(totalItemCount),
    },
    students: {
      matched: normalizeAssignmentResultScopeCount(counts.matchedStudents),
      total: normalizeAssignmentResultScopeCount(counts.totalStudents),
    },
  };
}

export function filterAssignmentResultCompletedAttemptRows<
  TAttempt extends AssignmentAttemptRowInput,
>({
  attempts,
  reviews,
}: {
  attempts: TAttempt[];
  reviews: AssignmentAttemptReview[];
}) {
  const completedAttemptIds = new Set(reviews.map((review) => review.id));

  return sortAssignmentResultAttemptRowsByCompletedAt(
    attempts.filter((attempt) => completedAttemptIds.has(attempt.id))
  );
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
  const fallbackIdentityResolver = createStudentIdentityResolver(attempts);

  return sortAssignmentResultAttemptReviewRows(
    attempts
      .map((attempt) => {
        const review = reviewById.get(attempt.id);

        return {
          attempt,
          review,
          studentLabel:
            review?.studentLabel ??
            fallbackIdentityResolver.resolve(attempt).label,
        };
      })
      .filter((row) => {
        if (!normalizedSearch) return true;
        return matchesResultSearch(row.studentLabel, normalizedSearch);
      })
  );
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

  return sortAssignmentAttemptReviewsByCompletedAt(
    attempts.filter((attempt) => {
      const matchesStudent = normalizedSearch
        ? matchesResultSearch(attempt.studentLabel, normalizedSearch)
        : true;
      if (!matchesStudent) return false;

      if (filter === 'needs-review') {
        return isAssignmentAttemptReviewNeeded(attempt);
      }

      return true;
    })
  );
}

export function sortAssignmentResultAttemptReviewRows<
  TAttempt extends AssignmentAttemptRowInput,
>(rows: Array<AssignmentAttemptReviewRow<TAttempt>>) {
  return [...rows].sort((left, right) =>
    compareAssignmentResultAttemptRowsByCompletedAt(left.attempt, right.attempt)
  );
}

export function sortAssignmentResultAttemptRowsByCompletedAt<
  TAttempt extends AssignmentAttemptRowInput,
>(attempts: TAttempt[]) {
  return [...attempts].sort(compareAssignmentResultAttemptRowsByCompletedAt);
}

export function sortAssignmentAttemptReviewsByCompletedAt(
  attempts: AssignmentAttemptReview[]
) {
  return [...attempts].sort(compareAssignmentAttemptReviewsByCompletedAt);
}

export function isAssignmentAttemptReviewNeeded(
  attempt: AssignmentAttemptReview
) {
  return attempt.answers.some(isAssignmentAttemptAnswerNeedsReview);
}

export function countAssignmentAttemptReviewNeededAnswers(
  attempt: AssignmentAttemptReview
) {
  return attempt.answers.filter(isAssignmentAttemptAnswerNeedsReview).length;
}

export function compareAssignmentAttemptReviewsByCompletedAt(
  left: AssignmentAttemptReview,
  right: AssignmentAttemptReview
) {
  const completedAtCompare = compareAssignmentResultCompletedAt(
    left.completedAt,
    right.completedAt
  );
  if (completedAtCompare !== 0) return completedAtCompare;

  return compareRuntimeDisplaySearchText(left.id, right.id);
}

export function compareAssignmentResultAttemptRowsByCompletedAt(
  left: AssignmentAttemptRowInput,
  right: AssignmentAttemptRowInput
) {
  const completedAtCompare = compareAssignmentResultCompletedAt(
    left.completedAt,
    right.completedAt
  );
  if (completedAtCompare !== 0) return completedAtCompare;

  return compareRuntimeDisplaySearchText(left.id, right.id);
}

export function getAssignmentResultCompletedAtTimestamp(
  completedAt: AssignmentAttemptRowInput['completedAt']
) {
  const timestamp =
    completedAt instanceof Date
      ? completedAt.getTime()
      : typeof completedAt === 'string'
        ? Date.parse(completedAt)
        : Number.NEGATIVE_INFINITY;

  return Number.isFinite(timestamp) ? timestamp : Number.NEGATIVE_INFINITY;
}

function compareAssignmentResultCompletedAt(
  left: AssignmentAttemptRowInput['completedAt'],
  right: AssignmentAttemptRowInput['completedAt']
) {
  const leftTimestamp = getAssignmentResultCompletedAtTimestamp(left);
  const rightTimestamp = getAssignmentResultCompletedAtTimestamp(right);
  if (leftTimestamp !== rightTimestamp) {
    return rightTimestamp - leftTimestamp;
  }

  return 0;
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
      return compareAssignmentStudentsByDisplayLabel(left, right);
    }

    if (sort === 'attempts') {
      return compareStudentsDescending(
        left.attempts,
        right.attempts,
        left,
        right
      );
    }

    if (sort === 'last-submitted') {
      const lastSubmittedCompare = compareAssignmentResultCompletedAt(
        left.lastCompletedAt,
        right.lastCompletedAt
      );
      if (lastSubmittedCompare !== 0) return lastSubmittedCompare;

      return compareAssignmentStudentsByDisplayLabel(left, right);
    }

    return compareAssignmentStudentsByFollowUpPriority(left, right);
  });
}

export function sortItemPerformance(
  items: AssignmentItemAnalysis[],
  sort: ItemPerformanceSort
) {
  if (sort === 'original') return [...items];

  return [...items].sort((left, right) => {
    if (sort === 'accuracy') {
      return compareAssignmentItemsByReviewPriority(left, right);
    }

    if (sort === 'submitted') {
      if (left.submittedCount !== right.submittedCount) {
        return right.submittedCount - left.submittedCount;
      }
      if (left.correctRate !== right.correctRate) {
        return left.correctRate - right.correctRate;
      }
      return compareAssignmentItemsByStableOrder(left, right);
    }

    if (sort === 'type') {
      return compareAssignmentItemsByType(left, right);
    }

    return 0;
  });
}

export function parseStudentSummarySort(
  value: unknown
): StudentSummarySort | undefined {
  return isStudentSummarySort(value) && value !== DEFAULT_STUDENT_SUMMARY_SORT
    ? value
    : undefined;
}

export function parseItemPerformanceSort(
  value: unknown
): ItemPerformanceSort | undefined {
  return isItemPerformanceSort(value) && value !== DEFAULT_ITEM_PERFORMANCE_SORT
    ? value
    : undefined;
}

export function parseAttemptReviewFilter(
  value: unknown
): AttemptReviewFilter | undefined {
  return isAttemptReviewFilter(value) && value !== DEFAULT_ATTEMPT_REVIEW_FILTER
    ? value
    : undefined;
}

export function parseResultStudentSearch(value: unknown): string | undefined {
  return typeof value === 'string'
    ? normalizeResultSearchQuery(value)
    : undefined;
}

export function buildAssignmentResultRouteSearch(
  search: Record<string, unknown>
): AssignmentResultSearchState {
  return {
    itemSort: parseItemPerformanceSort(search.itemSort),
    review: parseAttemptReviewFilter(search.review),
    sort: parseStudentSummarySort(search.sort),
    student: parseResultStudentSearch(search.student),
  };
}

export function resolveAssignmentResultViewState(
  search: AssignmentResultSearchState
): AssignmentResultResolvedViewState {
  return {
    attemptReviewFilter: isAttemptReviewFilter(search.review)
      ? search.review
      : DEFAULT_ATTEMPT_REVIEW_FILTER,
    itemPerformanceSort: isItemPerformanceSort(search.itemSort)
      ? search.itemSort
      : DEFAULT_ITEM_PERFORMANCE_SORT,
    studentSearch: normalizeResultSearchQuery(search.student) ?? '',
    studentSort: isStudentSummarySort(search.sort)
      ? search.sort
      : DEFAULT_STUDENT_SUMMARY_SORT,
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
    student: string;
  }>;
}): AssignmentResultSearchState {
  const itemSort = resolveAssignmentResultSearchOption({
    currentValue: current.itemSort,
    defaultValue: DEFAULT_ITEM_PERFORMANCE_SORT,
    isValue: isItemPerformanceSort,
    nextValue: next.itemSort,
  });
  const review = resolveAssignmentResultSearchOption({
    currentValue: current.review,
    defaultValue: DEFAULT_ATTEMPT_REVIEW_FILTER,
    isValue: isAttemptReviewFilter,
    nextValue: next.review,
  });
  const sort = resolveAssignmentResultSearchOption({
    currentValue: current.sort,
    defaultValue: DEFAULT_STUDENT_SUMMARY_SORT,
    isValue: isStudentSummarySort,
    nextValue: next.sort,
  });
  const student = next.student ?? current.student;

  return {
    itemSort: itemSort === DEFAULT_ITEM_PERFORMANCE_SORT ? undefined : itemSort,
    review: review === DEFAULT_ATTEMPT_REVIEW_FILTER ? undefined : review,
    sort: sort === DEFAULT_STUDENT_SUMMARY_SORT ? undefined : sort,
    student: normalizeResultSearchQuery(student),
  };
}

export function buildAssignmentResultControlRouteSearch({
  current,
  update,
}: {
  current: AssignmentResultSearchState;
  update: AssignmentResultControlSearchUpdate;
}): AssignmentResultSearchState {
  return buildAssignmentResultControlSearchState({
    current,
    update,
  });
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

  if (update.control === 'student-search') {
    return buildAssignmentResultSearchState({
      current,
      next: { student: update.value },
    });
  }

  return buildAssignmentResultSearchState({
    current,
    next: { sort: update.value },
  });
}

export function normalizeResultSearchQuery(value: string | null | undefined) {
  const normalized = value?.normalize('NFKC').replace(/\s+/g, ' ').trim();
  return normalized || undefined;
}

export function normalizeResultSearch(value: string | null | undefined) {
  return normalizeRuntimeDisplaySearchKey(value) || undefined;
}

export function matchesResultSearch(
  value: string | null | undefined,
  search: string
) {
  const normalizedSearch = normalizeResultSearch(search);
  if (!normalizedSearch) return true;

  return normalizeResultSearch(value)?.includes(normalizedSearch) ?? false;
}

export function normalizeAssignmentResultScopeCount(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function isStudentSummarySort(value: unknown): value is StudentSummarySort {
  return (
    typeof value === 'string' &&
    STUDENT_SUMMARY_SORT_VALUES.includes(value as StudentSummarySort)
  );
}

function isItemPerformanceSort(value: unknown): value is ItemPerformanceSort {
  return (
    typeof value === 'string' &&
    ITEM_PERFORMANCE_SORT_VALUES.includes(value as ItemPerformanceSort)
  );
}

function isAttemptReviewFilter(value: unknown): value is AttemptReviewFilter {
  return (
    typeof value === 'string' &&
    ATTEMPT_REVIEW_FILTER_VALUES.includes(value as AttemptReviewFilter)
  );
}

function resolveAssignmentResultSearchOption<TValue extends string>({
  currentValue,
  defaultValue,
  isValue,
  nextValue,
}: {
  currentValue: TValue | undefined;
  defaultValue: TValue;
  isValue: (value: unknown) => value is TValue;
  nextValue: TValue | undefined;
}) {
  if (nextValue !== undefined) {
    return isValue(nextValue) ? nextValue : defaultValue;
  }

  return isValue(currentValue) ? currentValue : defaultValue;
}

function compareStudentsDescending(
  leftValue: number,
  rightValue: number,
  leftStudent: AssignmentStudentSummary,
  rightStudent: AssignmentStudentSummary
) {
  if (leftValue !== rightValue) return rightValue - leftValue;
  return compareAssignmentStudentsByDisplayLabel(leftStudent, rightStudent);
}
