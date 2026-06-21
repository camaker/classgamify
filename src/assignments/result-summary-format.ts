export function formatAssignmentSummaryAccuracy(value: number) {
  return `${value}%`;
}

export function formatAssignmentSummaryCorrectRate(value: number) {
  return `${formatAssignmentSummaryAccuracy(value)} correct`;
}

export function formatAssignmentSummaryCorrectCount({
  correctCount,
  submittedCount,
}: {
  correctCount: number;
  submittedCount: number;
}) {
  return `${correctCount}/${submittedCount} correct`;
}

export function formatAssignmentSummaryReviewItemCount(count: number) {
  return `${count} ${count === 1 ? 'item' : 'items'} to review`;
}

export function formatAssignmentSummaryAttemptCount(count: number) {
  return `${count} ${count === 1 ? 'attempt' : 'attempts'}`;
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
  return `${formatAssignmentSummaryCorrectRate(
    correctRate
  )}, ${correctCount}/${submittedCount}`;
}
