import type {
  AssignmentAttemptReview,
  AssignmentItemAnalysis,
  AssignmentStudentSummary,
} from '@/assignments/results';
import { compareAssignmentItemsByReviewPriority } from '@/assignments/review-priority';
import { compareAssignmentStudentsByFollowUpPriority } from '@/assignments/student-follow-up-priority';

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

function pluralize(count: number, singularLabel: string) {
  return count === 1 ? singularLabel : `${singularLabel}s`;
}
