import { formatAssignmentResultPercent } from '@/assignments/result-format';
import { m } from '@/locale/paraglide/messages';

export function formatAssignmentSummaryAccuracy(
  value: number | null | undefined
) {
  return formatAssignmentResultPercent(
    normalizeAssignmentSummaryPercent(value)
  );
}

export function formatAssignmentSummaryCorrectRate(value: number) {
  return m.assignment_result_summary_correct_rate({
    accuracy: formatAssignmentSummaryAccuracy(value),
  });
}

export function formatAssignmentSummaryCorrectCount({
  correctCount,
  submittedCount,
}: {
  correctCount: number;
  submittedCount: number;
}) {
  const normalizedCorrectCount = normalizeAssignmentSummaryCount(correctCount);
  const normalizedSubmittedCount =
    normalizeAssignmentSummaryCount(submittedCount);

  return m.assignment_result_summary_correct_count({
    correctCount: normalizedCorrectCount,
    submittedCount: normalizedSubmittedCount,
  });
}

export function formatAssignmentSummaryUnansweredCount(count: number) {
  const normalizedCount = normalizeAssignmentSummaryCount(count);

  if (normalizedCount === 1) {
    return m.assignment_result_summary_unanswered_one({
      count: normalizedCount,
    });
  }

  return m.assignment_result_summary_unanswered_many({
    count: normalizedCount,
  });
}

export function formatAssignmentSummaryReviewItemCount(count: number) {
  const normalizedCount = normalizeAssignmentSummaryCount(count);

  if (normalizedCount === 1) {
    return m.assignment_result_summary_review_items_one({
      count: normalizedCount,
    });
  }

  return m.assignment_result_summary_review_items_many({
    count: normalizedCount,
  });
}

export function formatAssignmentSummaryReviewCount(count: number) {
  const normalizedCount = normalizeAssignmentSummaryCount(count);

  if (normalizedCount === 1) {
    return m.assignment_result_review_count_one({ count: normalizedCount });
  }

  return m.assignment_result_review_count_many({ count: normalizedCount });
}

export function formatAssignmentSummaryAttemptCount(count: number) {
  const normalizedCount = normalizeAssignmentSummaryCount(count);

  if (normalizedCount === 1) {
    return m.assignment_result_summary_attempts_one({ count: normalizedCount });
  }

  return m.assignment_result_summary_attempts_many({
    count: normalizedCount,
  });
}

export function formatAssignmentSummaryItemPerformance({
  correctCount,
  correctRate,
  submittedCount,
  unansweredCount = 0,
}: {
  correctCount: number;
  correctRate: number;
  submittedCount: number;
  unansweredCount?: number;
}) {
  const normalizedCorrectCount = normalizeAssignmentSummaryCount(correctCount);
  const normalizedSubmittedCount =
    normalizeAssignmentSummaryCount(submittedCount);

  return m.assignment_result_summary_item_performance({
    correctCount: normalizedCorrectCount,
    correctRate: formatAssignmentSummaryCorrectRate(correctRate),
    submittedCount: normalizedSubmittedCount,
    unanswered: formatAssignmentSummaryUnansweredCount(unansweredCount),
  });
}

export function normalizeAssignmentSummaryCount(count: number) {
  if (!Number.isFinite(count)) return 0;
  return Math.max(0, Math.floor(count));
}

export function normalizeAssignmentSummaryPercent(
  value: number | null | undefined
) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return Number.NaN;
  }

  return Math.min(100, Math.max(0, value));
}
