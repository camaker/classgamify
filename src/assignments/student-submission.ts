export type StudentAnswerMap = Record<string, string>;

export type StudentSubmissionRuntimeItem = {
  id: string;
};

export type StudentSubmissionAnswer = {
  answer: string;
  itemId: string;
};

export type AttemptCompletionSummary = {
  answeredItemCount: number;
  itemCount: number;
  unansweredItemCount: number;
};

export type AttemptSubmitDecision =
  | {
      reason: 'complete' | 'confirmed-incomplete';
      type: 'submit';
    }
  | {
      reason: 'unanswered-items';
      type: 'confirm-incomplete';
      unansweredItemCount: number;
    };

export type AttemptCompletionCopy = {
  confirmIncompleteSubmit: string;
  progressLabel: string;
  submitButtonLabel: string;
  unansweredLabel?: string;
};

export function getAttemptCompletionSummary({
  answers,
  runtimeItems,
}: {
  answers: StudentAnswerMap;
  runtimeItems: StudentSubmissionRuntimeItem[];
}): AttemptCompletionSummary {
  const itemCount = runtimeItems.length;
  const answeredItemCount = runtimeItems.filter((item) =>
    isStudentAnswerFilled(answers[item.id])
  ).length;

  return {
    answeredItemCount,
    itemCount,
    unansweredItemCount: Math.max(0, itemCount - answeredItemCount),
  };
}

export function buildAttemptCompletionCopy({
  completionSummary,
  confirmIncompleteSubmit,
}: {
  completionSummary: AttemptCompletionSummary;
  confirmIncompleteSubmit: boolean;
}): AttemptCompletionCopy {
  const { answeredItemCount, itemCount, unansweredItemCount } =
    completionSummary;

  return {
    confirmIncompleteSubmit:
      unansweredItemCount === 1
        ? '1 question is still unanswered.'
        : `${unansweredItemCount} questions are still unanswered.`,
    progressLabel: `${answeredItemCount}/${itemCount} answered`,
    submitButtonLabel:
      confirmIncompleteSubmit && unansweredItemCount > 0
        ? 'Submit anyway'
        : 'Submit answers',
    unansweredLabel:
      unansweredItemCount > 0
        ? `${unansweredItemCount} ${unansweredItemCount === 1 ? 'item' : 'items'} left unanswered.`
        : undefined,
  };
}

export function buildAttemptSubmissionAnswers({
  answers,
  runtimeItems,
}: {
  answers: StudentAnswerMap;
  runtimeItems: StudentSubmissionRuntimeItem[];
}): StudentSubmissionAnswer[] {
  return runtimeItems.map((item) => ({
    answer: answers[item.id] ?? '',
    itemId: item.id,
  }));
}

export function getAttemptSubmitDecision({
  confirmIncompleteSubmit,
  completionSummary,
}: {
  confirmIncompleteSubmit: boolean;
  completionSummary: AttemptCompletionSummary;
}): AttemptSubmitDecision {
  if (completionSummary.unansweredItemCount > 0 && !confirmIncompleteSubmit) {
    return {
      reason: 'unanswered-items',
      type: 'confirm-incomplete',
      unansweredItemCount: completionSummary.unansweredItemCount,
    };
  }

  return {
    reason:
      completionSummary.unansweredItemCount > 0
        ? 'confirmed-incomplete'
        : 'complete',
    type: 'submit',
  };
}

export function isStudentAnswerFilled(answer: string | undefined) {
  return Boolean(answer?.trim());
}
