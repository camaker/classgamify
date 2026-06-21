import { formatAttemptDuration } from '@/assignments/attempt-duration';
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
  browseTemplatesLabel: string;
  loadingMessage: string;
  missingAssignmentDescription: string;
  missingAssignmentTitle: string;
  publicAssignmentDescription: string;
  publicRouteBadgeLabel: string;
  readOnlyPreviewMessage: string;
  resultAccuracyLabel: string;
  resultSubmittedLabel: string;
  resultTimePrefix: string;
  seoDescription: string;
  seoTitlePrefix: string;
  missingStudentNameMessage: string;
  studentNameLabel: string;
  studentNamePlaceholder: string;
  submissionFailureMessage: string;
  submissionSuccessMessage: string;
  timeExpiredMessage: string;
  timeEndedLabel: string;
  teacherViewLabel: string;
};

export type AnonymousAttemptCopy = {
  description: string;
  title: string;
};

type StudentAttemptAnonymousTokenResolver = {
  collectStudentName: boolean;
  createAnonymousToken: () => string;
  currentAnonymousToken?: string;
};

type StudentAttemptResultDisplay = {
  accuracyLabel: string;
  durationLabel: string;
  scoreLabel: string;
};

type StudentAttemptControlState = {
  readOnlyMessage?: string;
  runtimeItemsDisabled: boolean;
  showTimeExpiredMessage: boolean;
  submitDisabled: boolean;
  unansweredLabel?: string;
};

type StudentAttemptTimerBadge = {
  label: string;
  show: boolean;
};

const STUDENT_RUNNER_COPY = {
  browseTemplatesLabel: 'Browse templates',
  loadingMessage: 'Loading student activity...',
  missingAssignmentDescription:
    'This link may have been unpublished, closed, or typed incorrectly.',
  missingAssignmentTitle: 'Assignment not found',
  publicAssignmentDescription:
    "This public assignment loads from the teacher share link, collects answers, and scores against the teacher's frozen assignment snapshot.",
  publicRouteBadgeLabel: 'Student play route',
  readOnlyPreviewMessage:
    'Preview assignments are read-only until a teacher publishes a share link.',
  resultAccuracyLabel: 'accuracy',
  resultSubmittedLabel: 'Score submitted',
  resultTimePrefix: 'Time:',
  seoDescription:
    'Open a public student activity runner from a teacher assignment link.',
  seoTitlePrefix: 'Student activity',
  missingStudentNameMessage: 'Type your name before submitting.',
  studentNameLabel: 'Student name',
  studentNamePlaceholder: 'Type your name',
  submissionFailureMessage: 'Attempt could not be saved.',
  submissionSuccessMessage: 'Attempt submitted.',
  timeExpiredMessage: 'Time is up. Review your saved answers, then submit.',
  timeEndedLabel: 'Time ended',
  teacherViewLabel: 'Teacher view',
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

export function buildStudentAttemptResultDisplay({
  accuracy,
  durationSeconds,
  earnedPoints,
  fallbackDurationSeconds,
  totalPoints,
}: {
  accuracy: number;
  durationSeconds?: number;
  earnedPoints: number;
  fallbackDurationSeconds?: number;
  totalPoints: number;
}): StudentAttemptResultDisplay {
  return {
    accuracyLabel: `${accuracy}% ${STUDENT_RUNNER_COPY.resultAccuracyLabel}`,
    durationLabel: `${STUDENT_RUNNER_COPY.resultTimePrefix} ${formatAttemptDuration(
      durationSeconds ?? fallbackDurationSeconds,
      {
        emptyValue: '',
        style: 'timer',
      }
    )}`,
    scoreLabel: `${earnedPoints}/${totalPoints}`,
  };
}

export function buildStudentAttemptControlState({
  canSubmit,
  hasResult,
  isSubmitting,
  timeExpired,
  unansweredLabel,
}: {
  canSubmit: boolean;
  hasResult: boolean;
  isSubmitting: boolean;
  timeExpired: boolean;
  unansweredLabel?: string;
}): StudentAttemptControlState {
  return {
    readOnlyMessage: canSubmit
      ? undefined
      : STUDENT_RUNNER_COPY.readOnlyPreviewMessage,
    runtimeItemsDisabled: hasResult || timeExpired,
    showTimeExpiredMessage: timeExpired && !hasResult,
    submitDisabled: !canSubmit || hasResult || isSubmitting,
    unansweredLabel: hasResult ? undefined : unansweredLabel,
  };
}

export function buildStudentAttemptTimerBadge({
  remainingSeconds,
  timeExpired,
  timeLimitSeconds,
}: {
  remainingSeconds?: number;
  timeExpired: boolean;
  timeLimitSeconds?: number;
}): StudentAttemptTimerBadge {
  if (!timeLimitSeconds) {
    return {
      label: '',
      show: false,
    };
  }

  return {
    label: timeExpired
      ? STUDENT_RUNNER_COPY.timeEndedLabel
      : formatAttemptDuration(remainingSeconds, {
          emptyValue: '',
          style: 'timer',
        }),
    show: true,
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
      unansweredItemCount === 0
        ? 'All items are answered.'
        : unansweredItemCount === 1
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

export function resolveStudentAttemptAnonymousToken({
  collectStudentName,
  createAnonymousToken,
  currentAnonymousToken,
}: StudentAttemptAnonymousTokenResolver) {
  if (collectStudentName) return undefined;

  const normalizedCurrentToken = normalizeAnonymousToken(currentAnonymousToken);
  if (normalizedCurrentToken) return normalizedCurrentToken;

  return normalizeAnonymousToken(createAnonymousToken()) || undefined;
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
      message: STUDENT_RUNNER_COPY.missingStudentNameMessage,
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
