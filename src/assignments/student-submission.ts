import { formatAttemptDuration } from '@/assignments/attempt-duration';
import {
  getAnonymousBrowserLabel,
  normalizeAnonymousToken,
  normalizeStudentName,
} from '@/assignments/identity';
import { m } from '@/locale/paraglide/messages';

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
  get browseTemplatesLabel() {
    return m.student_runner_browse_templates();
  },
  get loadingMessage() {
    return m.student_runner_loading();
  },
  get missingAssignmentDescription() {
    return m.student_runner_missing_assignment_description();
  },
  get missingAssignmentTitle() {
    return m.student_runner_missing_assignment_title();
  },
  get publicAssignmentDescription() {
    return m.student_runner_public_assignment_description();
  },
  get publicRouteBadgeLabel() {
    return m.student_runner_public_route_badge();
  },
  get readOnlyPreviewMessage() {
    return m.student_runner_read_only_preview();
  },
  get resultAccuracyLabel() {
    return m.student_runner_result_accuracy();
  },
  get resultSubmittedLabel() {
    return m.student_runner_result_submitted();
  },
  get resultTimePrefix() {
    return m.student_runner_result_time_prefix();
  },
  get seoDescription() {
    return m.student_runner_seo_description();
  },
  get seoTitlePrefix() {
    return m.student_runner_seo_title_prefix();
  },
  get missingStudentNameMessage() {
    return m.student_runner_missing_student_name();
  },
  get studentNameLabel() {
    return m.student_runner_student_name_label();
  },
  get studentNamePlaceholder() {
    return m.student_runner_student_name_placeholder();
  },
  get submissionFailureMessage() {
    return m.student_runner_submission_failure();
  },
  get submissionSuccessMessage() {
    return m.student_runner_submission_success();
  },
  get timeExpiredMessage() {
    return m.student_runner_time_expired();
  },
  get timeEndedLabel() {
    return m.student_runner_time_ended();
  },
  get teacherViewLabel() {
    return m.student_runner_teacher_view();
  },
} satisfies StudentRunnerCopy;

export function getStudentRunnerCopy(): StudentRunnerCopy {
  return STUDENT_RUNNER_COPY;
}

export function buildAnonymousAttemptCopy({
  browserLabel,
}: {
  browserLabel?: string;
}): AnonymousAttemptCopy {
  const label = browserLabel?.trim() || getAnonymousBrowserLabel();

  return {
    description: m.student_runner_anonymous_attempt_description({ label }),
    title: m.student_runner_anonymous_attempt_title(),
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
  verb = m.student_attempt_progress_answered(),
}: {
  completionSummary: AttemptCompletionSummary;
  verb?: string;
}): string {
  const progressVerb = verb.trim() || m.student_attempt_progress_answered();

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
        ? m.student_attempt_all_answered()
        : unansweredItemCount === 1
          ? m.student_attempt_unanswered_question_one()
          : m.student_attempt_unanswered_question_many({
              count: unansweredItemCount,
            }),
    progressLabel: formatAttemptCompletionProgressLabel({
      completionSummary,
    }),
    submitButtonLabel:
      confirmIncompleteSubmit && unansweredItemCount > 0
        ? m.student_attempt_submit_anyway()
        : m.student_attempt_submit_answers(),
    unansweredLabel:
      unansweredItemCount > 0
        ? formatStudentAttemptUnansweredLabel(unansweredItemCount)
        : undefined,
  };
}

function formatStudentAttemptUnansweredLabel(count: number) {
  if (count === 1) {
    return m.student_attempt_unanswered_label_one();
  }

  return m.student_attempt_unanswered_label_many({ count });
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
