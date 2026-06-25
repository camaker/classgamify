import { formatAssignmentResultPercent } from '@/assignments/result-format';
import { m } from '@/locale/paraglide/messages';

export function formatAssignmentSummaryAccuracy(value: number) {
  return formatAssignmentResultPercent(value);
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
  return m.assignment_result_summary_correct_count({
    correctCount,
    submittedCount,
  });
}

export function formatAssignmentSummaryReviewItemCount(count: number) {
  if (count === 1) {
    return m.assignment_result_summary_review_items_one({ count });
  }

  return m.assignment_result_summary_review_items_many({ count });
}

export function formatAssignmentSummaryReviewCount(count: number) {
  if (count === 1) {
    return m.assignment_result_review_count_one({ count });
  }

  return m.assignment_result_review_count_many({ count });
}

export function formatAssignmentSummaryAttemptCount(count: number) {
  if (count === 1) {
    return m.assignment_result_summary_attempts_one({ count });
  }

  return m.assignment_result_summary_attempts_many({ count });
}

export function formatAssignmentSummaryItemPerformance({
  correctCount,
  correctRate,
  submittedCount,
}: {
  correctCount: number;
  correctRate: number;
  submittedCount: number;
}) {
  return m.assignment_result_summary_item_performance({
    correctCount,
    correctRate: formatAssignmentSummaryCorrectRate(correctRate),
    submittedCount,
  });
}
