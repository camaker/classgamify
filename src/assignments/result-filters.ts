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
import { compareAssignmentStudentsByFollowUpPriority } from '@/assignments/student-follow-up-priority';

export type StudentSummarySort = 'attempts' | 'best' | 'name' | 'needs-review';
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

  return attempts.filter((attempt) => completedAttemptIds.has(attempt.id));
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

  return attempts
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
      return attempt.answers.some(isAssignmentAttemptAnswerNeedsReview);
    }

    return true;
  });
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
  return normalizeResultSearchQuery(value)?.toLocaleLowerCase();
}

export function matchesResultSearch(
  value: string | null | undefined,
  search: string
) {
  const normalizedSearch = normalizeResultSearch(search) ?? search;
  return normalizeResultSearch(value)?.includes(normalizedSearch) ?? false;
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
  return leftStudent.studentLabel.localeCompare(rightStudent.studentLabel);
}
