import {
  ANONYMOUS_BROWSER_LABEL,
  normalizeAnonymousToken,
  normalizeStudentName,
} from '@/assignments/identity';

export type StudentAnswerMap = Record<string, string>;

export type StudentSubmissionRuntimeItem = {
  id: string;
};

export type StudentSubmissionAnswer = {
  answer: string;
  itemId: string;
};

export type StudentAttemptSubmissionInput = {
  anonymousToken?: string;
  answers: StudentSubmissionAnswer[];
  durationSeconds?: number;
  shareSlug: string;
  studentName?: string;
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

export type StudentAttemptSubmitGate =
  | {
      message: string;
      reason: 'missing-student-name' | 'read-only';
      type: 'blocked';
    }
  | {
      message: string;
      reason: 'unanswered-items';
      type: 'confirm-incomplete';
      unansweredItemCount: number;
    }
  | {
      reason: 'complete' | 'confirmed-incomplete';
      type: 'submit';
    };

export type AttemptCompletionCopy = {
  confirmIncompleteSubmit: string;
  progressLabel: string;
  submitButtonLabel: string;
  unansweredLabel?: string;
};

export type StudentRunnerCopy = {
  loadingMessage: string;
  missingAssignmentDescription: string;
  missingAssignmentTitle: string;
  readOnlyPreviewMessage: string;
  submissionFailureMessage: string;
  submissionSuccessMessage: string;
  timeExpiredMessage: string;
};

export type AnonymousAttemptCopy = {
  description: string;
  title: string;
};

const STUDENT_RUNNER_COPY = {
  loadingMessage: 'Loading student activity...',
  missingAssignmentDescription:
    'This link may have been unpublished, closed, or typed incorrectly.',
  missingAssignmentTitle: 'Assignment not found',
  readOnlyPreviewMessage:
    'Preview assignments are read-only until a teacher publishes a share link.',
  submissionFailureMessage: 'Attempt could not be saved.',
  submissionSuccessMessage: 'Attempt submitted.',
  timeExpiredMessage: 'Time is up. Review your saved answers, then submit.',
} satisfies StudentRunnerCopy;

export function getStudentRunnerCopy(): StudentRunnerCopy {
  return STUDENT_RUNNER_COPY;
}

export function buildAnonymousAttemptCopy({
  browserLabel,
}: {
  browserLabel?: string;
}): AnonymousAttemptCopy {
  const label = browserLabel?.trim() || ANONYMOUS_BROWSER_LABEL;

  return {
    description: `This assignment does not collect student names. This browser will submit as ${label}.`,
    title: 'Anonymous attempt',
  };
}

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

export function formatAttemptCompletionProgressLabel({
  completionSummary,
  verb = 'answered',
}: {
  completionSummary: AttemptCompletionSummary;
  verb?: string;
}): string {
  const progressVerb = verb.trim() || 'answered';

  return `${completionSummary.answeredItemCount}/${completionSummary.itemCount} ${progressVerb}`;
}

export function buildStudentAttemptSessionKey({
  runtimeItems,
  shareSlug,
}: {
  runtimeItems: StudentSubmissionRuntimeItem[];
  shareSlug: string;
}): string {
  return JSON.stringify([shareSlug, runtimeItems.map((item) => item.id)]);
}

export function buildAttemptCompletionCopy({
  completionSummary,
  confirmIncompleteSubmit,
}: {
  completionSummary: AttemptCompletionSummary;
  confirmIncompleteSubmit: boolean;
}): AttemptCompletionCopy {
  const { unansweredItemCount } = completionSummary;

  return {
    confirmIncompleteSubmit:
      unansweredItemCount === 1
        ? '1 question is still unanswered.'
        : `${unansweredItemCount} questions are still unanswered.`,
    progressLabel: formatAttemptCompletionProgressLabel({
      completionSummary,
    }),
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

export function buildStudentAttemptSubmissionInput({
  anonymousToken,
  answers,
  collectStudentName,
  durationSeconds,
  runtimeItems,
  shareSlug,
  studentName,
}: {
  anonymousToken?: string;
  answers: StudentAnswerMap;
  collectStudentName: boolean;
  durationSeconds?: number;
  runtimeItems: StudentSubmissionRuntimeItem[];
  shareSlug: string;
  studentName: string;
}): StudentAttemptSubmissionInput {
  const input: StudentAttemptSubmissionInput = {
    answers: buildAttemptSubmissionAnswers({
      answers,
      runtimeItems,
    }),
    shareSlug,
  };

  if (durationSeconds !== undefined) {
    input.durationSeconds = durationSeconds;
  }

  if (collectStudentName) {
    const normalizedStudentName = normalizeStudentName(studentName);
    if (normalizedStudentName) {
      input.studentName = normalizedStudentName;
    }
    return input;
  }

  const normalizedAnonymousToken = normalizeAnonymousToken(anonymousToken);
  if (normalizedAnonymousToken) {
    input.anonymousToken = normalizedAnonymousToken;
  }

  return input;
}

export function buildStudentAttemptSubmitGate({
  canSubmit,
  collectStudentName,
  completionSummary,
  confirmIncompleteSubmit,
  studentName,
}: {
  canSubmit: boolean;
  collectStudentName: boolean;
  completionSummary: AttemptCompletionSummary;
  confirmIncompleteSubmit: boolean;
  studentName: string;
}): StudentAttemptSubmitGate {
  if (!canSubmit) {
    return {
      message: STUDENT_RUNNER_COPY.readOnlyPreviewMessage,
      reason: 'read-only',
      type: 'blocked',
    };
  }

  if (collectStudentName && !studentName.trim()) {
    return {
      message: 'Type your name before submitting.',
      reason: 'missing-student-name',
      type: 'blocked',
    };
  }

  const submitDecision = getAttemptSubmitDecision({
    completionSummary,
    confirmIncompleteSubmit,
  });

  if (submitDecision.type === 'confirm-incomplete') {
    return {
      ...submitDecision,
      message: buildAttemptCompletionCopy({
        completionSummary,
        confirmIncompleteSubmit,
      }).confirmIncompleteSubmit,
    };
  }

  return submitDecision;
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
