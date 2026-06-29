import {
  isAssignmentAttemptAnswerNeedsReview,
  type AssignmentAttemptReview,
  type AssignmentAttemptReviewAnswer,
} from '@/assignments/results';

export type AssignmentAttemptReviewSummary = {
  correctItemCount: number;
  needsReviewItemCount: number;
  submittedItemCount: number;
  totalItemCount: number;
  unansweredItemCount: number;
};

export function buildAssignmentAttemptReviewSummary(
  attempt: Pick<AssignmentAttemptReview, 'answers'>
): AssignmentAttemptReviewSummary {
  const totalItemCount = attempt.answers.length;
  const submittedItemCount = countAssignmentAttemptReviewAnswers(
    attempt.answers,
    (answer) => answer.submitted
  );
  const correctItemCount = countAssignmentAttemptReviewAnswers(
    attempt.answers,
    (answer) => answer.submitted && answer.correct
  );
  const needsReviewItemCount = countAssignmentAttemptReviewAnswers(
    attempt.answers,
    isAssignmentAttemptAnswerNeedsReview
  );

  return {
    correctItemCount,
    needsReviewItemCount,
    submittedItemCount,
    totalItemCount,
    unansweredItemCount: countAssignmentAttemptReviewAnswers(
      attempt.answers,
      (answer) => !answer.submitted
    ),
  };
}

function countAssignmentAttemptReviewAnswers(
  answers: AssignmentAttemptReviewAnswer[],
  predicate: (answer: AssignmentAttemptReviewAnswer) => boolean
) {
  return answers.filter(predicate).length;
}
