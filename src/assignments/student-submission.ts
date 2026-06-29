import {
  formatAttemptDuration,
  normalizeAttemptDurationSeconds,
  resolveAttemptSubmissionDurationSeconds,
} from '@/assignments/attempt-duration';
import {
  canUseAnotherAssignmentAttempt,
  normalizeAssignmentRemainingAttempts,
  type AssignmentAttemptUsage,
} from '@/assignments/attempt-limits';
import {
  getAttemptAnswerRuntimeItemEntries,
  getAttemptAnswerRuntimeItemIds,
  normalizeAttemptAnswerItemId,
  type AttemptAnswerRuntimeItem,
  type AttemptAnswerRuntimeItemEntry,
} from '@/assignments/attempt-answers';
import {
  getAnonymousBrowserLabel,
  normalizeAnonymousToken,
  normalizeStudentName,
} from '@/assignments/identity';
import { formatAssignmentResultPercent } from '@/assignments/result-format';
import {
  normalizeRuntimeDisplayCount,
  normalizeRuntimeDisplayText,
} from '@/assignments/runtime-display';
import { normalizeAssignmentShareSlug } from '@/assignments/share-slug';
import { m } from '@/locale/paraglide/messages';

export type StudentAnswerMap = Record<string, string>;

type StudentSubmissionRuntimeItem = AttemptAnswerRuntimeItem;

export type StudentSubmissionAnswer = {
  answer: string;
  itemId: string;
};

export type StudentAnswerChange = StudentSubmissionAnswer;

export type StudentAttemptAnswerState = {
  answer: string;
  answered: boolean;
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

type AttemptSubmitDecision =
  | {
      reason: 'complete' | 'confirmed-incomplete';
      type: 'submit';
    }
  | {
      reason: 'unanswered-items';
      type: 'confirm-incomplete';
      unansweredItemCount: number;
    };

type StudentAttemptSubmitGate =
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

export type StudentAttemptSubmissionBlockedPlan = {
  message: string;
  reason: StudentAttemptSubmissionBlockedReason;
  type: 'blocked';
};

export type StudentAttemptSubmissionConfirmIncompletePlan = {
  message: string;
  reason: StudentAttemptSubmissionConfirmIncompleteReason;
  type: 'confirm-incomplete';
  unansweredItemCount: number;
};

export type StudentAttemptSubmissionSubmitPlan = {
  anonymousToken?: string;
  input: StudentAttemptSubmissionInput;
  reason: StudentAttemptSubmissionSubmitReason;
  type: 'submit';
};

export type StudentAttemptSubmissionSubmitReason =
  | 'complete'
  | 'confirmed-incomplete';

export type StudentAttemptSubmissionBlockedReason =
  | 'missing-student-name'
  | 'read-only';

export type StudentAttemptSubmissionConfirmIncompleteReason =
  'unanswered-items';

export type StudentAttemptSubmissionMessageType =
  | 'blocked'
  | 'confirm-incomplete';

export type StudentAttemptSubmissionPlan =
  | StudentAttemptSubmissionBlockedPlan
  | StudentAttemptSubmissionConfirmIncompletePlan
  | StudentAttemptSubmissionSubmitPlan;

export type AttemptCompletionCopy = {
  confirmIncompleteSubmit: string;
  progressLabel: string;
  submitButtonLabel: string;
  unansweredLabel?: string;
};

type StudentRunnerCopy = {
  browseTemplatesLabel: string;
  createActivityLabel: string;
  loadingMessage: string;
  missingAssignmentDescription: string;
  missingAssignmentTitle: string;
  publicAssignmentDescription: string;
  publicRouteBadgeLabel: string;
  readOnlyPreviewMessage: string;
  resultAccuracyLabel: string;
  resultNextStepDone: string;
  resultNextStepFeedback: string;
  resultNextStepReviewScore: string;
  resultNextStepStartAnother: string;
  resultNextStepTeacherReview: string;
  resultNextStepsTitle: string;
  resultSubmittedLabel: string;
  resultTimePrefix: string;
  seoDescription: string;
  seoTitlePrefix: string;
  startAnotherAttemptLabel: string;
  missingStudentNameMessage: string;
  studentNameLabel: string;
  studentNamePlaceholder: string;
  submissionFailureMessage: string;
  submissionPendingLabel: string;
  submissionSuccessMessage: string;
  teacherResultsLabel: string;
  timeExpiredMessage: string;
  timeEndedLabel: string;
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

export type StudentAttemptResultDisplay = {
  accuracyLabel: string;
  durationLabel: string;
  scoreLabel: string;
};

export type StudentAttemptResultNextStepsView = {
  steps: string[];
  title: string;
};

export type StudentAttemptControlState = {
  readOnlyMessage?: string;
  runtimeItemsDisabled: boolean;
  showTimeExpiredMessage: boolean;
  submitButtonLabel?: string;
  submitDisabled: boolean;
  unansweredLabel?: string;
};

export type StudentAttemptTimerBadge = {
  label: string;
  show: boolean;
};

export type StudentRunnerMissingReason =
  | 'closed'
  | 'draft'
  | 'expired'
  | 'not-found';

type StudentRunnerMissingView = {
  description: string;
  title: string;
};

const STUDENT_RUNNER_COPY = {
  get browseTemplatesLabel() {
    return m.student_runner_browse_templates();
  },
  get createActivityLabel() {
    return m.student_runner_create_activity();
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
  get resultNextStepDone() {
    return m.student_runner_result_next_step_done();
  },
  get resultNextStepFeedback() {
    return m.student_runner_result_next_step_feedback();
  },
  get resultNextStepReviewScore() {
    return m.student_runner_result_next_step_review_score();
  },
  get resultNextStepStartAnother() {
    return m.student_runner_result_next_step_start_another();
  },
  get resultNextStepTeacherReview() {
    return m.student_runner_result_next_step_teacher_review();
  },
  get resultNextStepsTitle() {
    return m.student_runner_result_next_steps_title();
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
  get startAnotherAttemptLabel() {
    return m.student_runner_start_another_attempt();
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
  get submissionPendingLabel() {
    return m.student_runner_submission_pending();
  },
  get submissionSuccessMessage() {
    return m.student_runner_submission_success();
  },
  get teacherResultsLabel() {
    return m.student_runner_teacher_results();
  },
  get timeExpiredMessage() {
    return m.student_runner_time_expired();
  },
  get timeEndedLabel() {
    return m.student_runner_time_ended();
  },
} satisfies StudentRunnerCopy;

export function getStudentRunnerCopy(): StudentRunnerCopy {
  return STUDENT_RUNNER_COPY;
}

export function resolveStudentAttemptSubmissionFailureMessage(error: unknown) {
  const fallbackMessage = STUDENT_RUNNER_COPY.submissionFailureMessage;
  if (!(error instanceof Error)) return fallbackMessage;

  const message = error.message.trim();
  return getSafeStudentAttemptSubmissionFailureMessages().includes(message)
    ? message
    : fallbackMessage;
}

function getSafeStudentAttemptSubmissionFailureMessages() {
  return [
    m.assignment_api_error_anonymous_token_required(),
    m.assignment_api_error_assignment_closed(),
    m.assignment_api_error_assignment_expired(),
    m.assignment_api_error_assignment_not_found(),
    m.assignment_api_error_assignment_not_published(),
    m.assignment_api_error_attempt_limit_reached(),
    m.assignment_api_error_student_name_required(),
    m.assignment_attempt_answers_error_duplicate_item(),
    m.assignment_attempt_answers_error_too_many(),
    m.assignment_attempt_answers_error_unknown_item(),
  ];
}

export function buildStudentRunnerMissingView(
  reason: StudentRunnerMissingReason
): StudentRunnerMissingView {
  if (reason === 'closed') {
    return {
      description: m.student_runner_missing_assignment_closed_description(),
      title: m.student_runner_missing_assignment_closed_title(),
    };
  }

  if (reason === 'expired') {
    return {
      description: m.student_runner_missing_assignment_expired_description(),
      title: m.student_runner_missing_assignment_expired_title(),
    };
  }

  if (reason === 'draft') {
    return {
      description: m.student_runner_missing_assignment_draft_description(),
      title: m.student_runner_missing_assignment_draft_title(),
    };
  }

  return {
    description: STUDENT_RUNNER_COPY.missingAssignmentDescription,
    title: STUDENT_RUNNER_COPY.missingAssignmentTitle,
  };
}

export function buildAnonymousAttemptCopy({
  browserLabel,
}: {
  browserLabel?: string;
}): AnonymousAttemptCopy {
  const label =
    normalizeRuntimeDisplayText(browserLabel) || getAnonymousBrowserLabel();

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
  const normalizedEarnedPoints = normalizeStudentResultScore(earnedPoints);
  const normalizedTotalPoints = normalizeStudentResultScore(totalPoints);
  const normalizedDurationSeconds =
    normalizeAttemptDurationSeconds({ durationSeconds }) ??
    normalizeAttemptDurationSeconds({
      durationSeconds: fallbackDurationSeconds,
    });

  return {
    accuracyLabel: m.student_runner_result_accuracy_line({
      accuracy: formatAssignmentResultPercent(accuracy),
      label: STUDENT_RUNNER_COPY.resultAccuracyLabel,
    }),
    durationLabel: m.student_runner_result_time_line({
      label: STUDENT_RUNNER_COPY.resultTimePrefix,
      time: formatAttemptDuration(normalizedDurationSeconds, {
        emptyValue: '',
        style: 'timer',
      }),
    }),
    scoreLabel: m.student_runner_result_score_line({
      earnedPoints: normalizedEarnedPoints,
      totalPoints: normalizedTotalPoints,
    }),
  };
}

export function buildStudentAttemptResultNextStepsView({
  canStartAnotherAttempt,
  showCorrectAnswers,
}: {
  canStartAnotherAttempt: boolean;
  showCorrectAnswers: boolean;
}): StudentAttemptResultNextStepsView {
  return {
    steps: [
      STUDENT_RUNNER_COPY.resultNextStepReviewScore,
      showCorrectAnswers
        ? STUDENT_RUNNER_COPY.resultNextStepFeedback
        : STUDENT_RUNNER_COPY.resultNextStepTeacherReview,
      canStartAnotherAttempt
        ? STUDENT_RUNNER_COPY.resultNextStepStartAnother
        : STUDENT_RUNNER_COPY.resultNextStepDone,
    ],
    title: STUDENT_RUNNER_COPY.resultNextStepsTitle,
  };
}

function normalizeStudentResultScore(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
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
  const showSubmittingLabel = canSubmit && !hasResult && isSubmitting;

  return {
    readOnlyMessage: canSubmit
      ? undefined
      : STUDENT_RUNNER_COPY.readOnlyPreviewMessage,
    runtimeItemsDisabled: hasResult || timeExpired || showSubmittingLabel,
    showTimeExpiredMessage: timeExpired && !hasResult,
    ...(showSubmittingLabel
      ? { submitButtonLabel: STUDENT_RUNNER_COPY.submissionPendingLabel }
      : {}),
    submitDisabled: !canSubmit || hasResult || isSubmitting,
    unansweredLabel: hasResult ? undefined : unansweredLabel,
  };
}

export function canStartAnotherStudentAttempt({
  canSubmit,
  hasResult,
  maxAttempts,
  submittedAttemptCount,
}: {
  canSubmit: boolean;
  hasResult: boolean;
  maxAttempts?: number | null;
  submittedAttemptCount: number;
}) {
  if (!canSubmit || !hasResult) return false;

  return canUseAnotherAssignmentAttempt({
    maxAttempts,
    usedAttempts: submittedAttemptCount,
  });
}

export function formatStudentAttemptUsageLabel({
  remainingAttempts,
}: AssignmentAttemptUsage) {
  if (remainingAttempts === undefined) {
    return m.student_runner_attempts_remaining_open();
  }

  const normalizedRemainingAttempts =
    normalizeAssignmentRemainingAttempts(remainingAttempts);

  if (normalizedRemainingAttempts <= 0) {
    return m.student_runner_attempts_remaining_none();
  }

  if (normalizedRemainingAttempts === 1) {
    return m.student_runner_attempts_remaining_one();
  }

  return m.student_runner_attempts_remaining_many({
    count: normalizedRemainingAttempts,
  });
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
  if (!isValidStudentTimerLimit(timeLimitSeconds)) {
    return {
      label: '',
      show: false,
    };
  }

  if (timeExpired) {
    return {
      label: STUDENT_RUNNER_COPY.timeEndedLabel,
      show: true,
    };
  }

  const label = formatAttemptDuration(remainingSeconds, {
    emptyValue: '',
    style: 'timer',
  });

  return {
    label,
    show: Boolean(label),
  };
}

function isValidStudentTimerLimit(value: number | undefined) {
  return value !== undefined && Number.isFinite(value) && value > 0;
}

export function getAttemptCompletionSummary({
  answers,
  runtimeItems,
}: {
  answers: StudentAnswerMap;
  runtimeItems: StudentSubmissionRuntimeItem[];
}): AttemptCompletionSummary {
  const itemEntries = getUniqueSubmissionRuntimeItemEntries(runtimeItems);
  const itemCount = normalizeRuntimeDisplayCount(itemEntries.length);
  const answeredItemCount = normalizeRuntimeDisplayCount(
    itemEntries.filter((entry) => isSubmissionEntryAnswered(entry, answers))
      .length
  );

  return {
    answeredItemCount,
    itemCount,
    unansweredItemCount: Math.max(0, itemCount - answeredItemCount),
  };
}

type SubmissionRuntimeItemEntry = AttemptAnswerRuntimeItemEntry;

function getUniqueSubmissionRuntimeItemEntries(
  runtimeItems: StudentSubmissionRuntimeItem[]
) {
  return getAttemptAnswerRuntimeItemEntries({ runtimeItems });
}

function getUniqueSubmissionRuntimeItemIds(
  runtimeItems: StudentSubmissionRuntimeItem[]
) {
  return getAttemptAnswerRuntimeItemIds({ runtimeItems });
}

export function buildStudentAttemptAnswerStateByItemId({
  answers,
  runtimeItems,
}: {
  answers: StudentAnswerMap;
  runtimeItems: StudentSubmissionRuntimeItem[];
}) {
  const stateByItemId = new Map<string, StudentAttemptAnswerState>();

  for (const entry of getUniqueSubmissionRuntimeItemEntries(runtimeItems)) {
    const answer = normalizeSubmissionAnswer(
      getSubmissionEntryAnswer(entry, answers)
    );
    const state = {
      answer,
      answered: isStudentAnswerFilled(answer),
      itemId: entry.itemId,
    };

    stateByItemId.set(entry.itemId, state);
    for (const originalId of entry.originalIds) {
      stateByItemId.set(originalId, state);
    }
  }

  return stateByItemId;
}

export function normalizeStudentAnswersForRuntimeItems({
  answers,
  runtimeItems,
}: {
  answers: StudentAnswerMap;
  runtimeItems: StudentSubmissionRuntimeItem[];
}): StudentAnswerMap {
  return Object.fromEntries(
    getUniqueSubmissionRuntimeItemEntries(runtimeItems).map((entry) => [
      entry.itemId,
      normalizeSubmissionAnswer(getSubmissionEntryAnswer(entry, answers)),
    ])
  );
}

function normalizeSubmissionItemId(value: string | undefined) {
  return normalizeAttemptAnswerItemId(value);
}

function normalizeSubmissionAnswer(value: string | undefined) {
  return normalizeRuntimeDisplayText(value);
}

function isSubmissionEntryAnswered(
  entry: SubmissionRuntimeItemEntry,
  answers: StudentAnswerMap
) {
  return Boolean(getFilledSubmissionEntryAnswer(entry, answers));
}

function getSubmissionEntryAnswer(
  entry: SubmissionRuntimeItemEntry,
  answers: StudentAnswerMap
) {
  return (
    getFilledSubmissionEntryAnswer(entry, answers) ??
    getFirstSubmissionEntryAnswer(entry, answers) ??
    ''
  );
}

function getFilledSubmissionEntryAnswer(
  entry: SubmissionRuntimeItemEntry,
  answers: StudentAnswerMap
) {
  return getSubmissionEntryAnswerCandidates(entry, answers).find((answer) =>
    isStudentAnswerFilled(answer)
  );
}

function getFirstSubmissionEntryAnswer(
  entry: SubmissionRuntimeItemEntry,
  answers: StudentAnswerMap
) {
  return getSubmissionEntryAnswerCandidates(entry, answers).find(
    (answer) => answer !== undefined
  );
}

function getSubmissionEntryAnswerCandidates(
  entry: SubmissionRuntimeItemEntry,
  answers: StudentAnswerMap
) {
  return [...entry.originalIds, entry.itemId].map((itemId) => answers[itemId]);
}

export function formatAttemptCompletionProgressLabel({
  completionSummary,
  verb = m.student_attempt_progress_answered(),
}: {
  completionSummary: AttemptCompletionSummary;
  verb?: string;
}): string {
  const progressVerb =
    normalizeRuntimeDisplayText(verb) || m.student_attempt_progress_answered();
  const answeredItemCount = normalizeRuntimeDisplayCount(
    completionSummary.answeredItemCount
  );
  const itemCount = normalizeRuntimeDisplayCount(completionSummary.itemCount);

  return m.student_attempt_progress_label({
    answeredCount: answeredItemCount,
    itemCount,
    verb: progressVerb,
  });
}

export function buildStudentAttemptSessionKey({
  assignmentId,
  runtimeItems,
  shareSlug,
  templateType,
}: {
  assignmentId?: string;
  runtimeItems: StudentSubmissionRuntimeItem[];
  shareSlug: string;
  templateType?: string;
}): string {
  const normalizedAssignmentId = normalizeSessionKeyPart(assignmentId);
  const normalizedTemplateType = normalizeSessionKeyPart(templateType);
  const context =
    normalizedAssignmentId || normalizedTemplateType
      ? {
          assignmentId: normalizedAssignmentId,
          templateType: normalizedTemplateType,
        }
      : undefined;
  const itemIds = getUniqueSubmissionRuntimeItemIds(runtimeItems);

  return JSON.stringify(
    context
      ? [normalizeAssignmentShareSlug(shareSlug), context, itemIds]
      : [normalizeAssignmentShareSlug(shareSlug), itemIds]
  );
}

function normalizeSessionKeyPart(value: string | undefined) {
  return normalizeRuntimeDisplayText(value) || undefined;
}

export function buildAttemptCompletionCopy({
  completionSummary,
  confirmIncompleteSubmit,
  progressVerb,
}: {
  completionSummary: AttemptCompletionSummary;
  confirmIncompleteSubmit: boolean;
  progressVerb?: string;
}): AttemptCompletionCopy {
  const unansweredItemCount =
    normalizeAttemptUnansweredItemCount(completionSummary);

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
      verb: progressVerb,
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
  const normalizedAnswers = normalizeStudentAnswersForRuntimeItems({
    answers,
    runtimeItems,
  });

  return getUniqueSubmissionRuntimeItemEntries(runtimeItems).map((entry) => ({
    answer: normalizedAnswers[entry.itemId] ?? '',
    itemId: entry.itemId,
  }));
}

export function buildStudentAnswerChange({
  answer,
  answers,
  itemId,
}: {
  answer: string;
  answers: StudentAnswerMap;
  itemId: string;
}): StudentAnswerMap {
  return applyStudentAnswerChanges({
    answers,
    changes: buildStudentAnswerChanges({ answer, itemId }),
  });
}

export function applyStudentAnswerChanges({
  answers,
  changes,
}: {
  answers: StudentAnswerMap;
  changes: StudentAnswerChange[];
}): StudentAnswerMap {
  const nextAnswers = { ...answers };

  for (const change of changes) {
    const itemId = normalizeSubmissionItemId(change.itemId);
    if (!itemId) continue;
    nextAnswers[itemId] = change.answer;
  }

  return nextAnswers;
}

export function buildStudentAnswerChanges({
  answer,
  itemId,
}: {
  answer: string;
  itemId: string;
}): StudentAnswerChange[] {
  const normalizedItemId = normalizeSubmissionItemId(itemId);
  if (!normalizedItemId) return [];

  return [{ answer, itemId: normalizedItemId }];
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
    shareSlug: normalizeAssignmentShareSlug(shareSlug),
  };
  const normalizedDurationSeconds = normalizeAttemptDurationSeconds({
    durationSeconds,
  });

  if (normalizedDurationSeconds !== undefined) {
    input.durationSeconds = normalizedDurationSeconds;
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

export function buildStudentAttemptSubmissionPlan({
  anonymousToken,
  answers,
  canSubmit,
  collectStudentName,
  completionSummary,
  confirmIncompleteSubmit,
  createAnonymousToken,
  now,
  runtimeItems,
  shareSlug,
  startedAt,
  studentName,
  timeLimitSeconds,
}: {
  anonymousToken?: string;
  answers: StudentAnswerMap;
  canSubmit: boolean;
  collectStudentName: boolean;
  completionSummary: AttemptCompletionSummary;
  confirmIncompleteSubmit: boolean;
  createAnonymousToken: () => string;
  now: number;
  runtimeItems: StudentSubmissionRuntimeItem[];
  shareSlug: string;
  startedAt: number;
  studentName: string;
  timeLimitSeconds?: number;
}): StudentAttemptSubmissionPlan {
  const submitGate = buildStudentAttemptSubmitGate({
    canSubmit,
    collectStudentName,
    completionSummary,
    confirmIncompleteSubmit,
    studentName,
  });

  if (submitGate.type !== 'submit') return submitGate;

  const nextAnonymousToken = resolveStudentAttemptAnonymousToken({
    collectStudentName,
    createAnonymousToken,
    currentAnonymousToken: anonymousToken,
  });

  return {
    anonymousToken: nextAnonymousToken,
    input: buildStudentAttemptSubmissionInput({
      answers,
      collectStudentName,
      durationSeconds: resolveAttemptSubmissionDurationSeconds({
        now,
        startedAt,
        timeLimitSeconds,
      }),
      runtimeItems,
      shareSlug,
      anonymousToken: nextAnonymousToken,
      studentName,
    }),
    reason: submitGate.reason,
    type: 'submit',
  };
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

  if (collectStudentName && !normalizeStudentName(studentName)) {
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
  const unansweredItemCount =
    normalizeAttemptUnansweredItemCount(completionSummary);

  if (unansweredItemCount > 0 && !confirmIncompleteSubmit) {
    return {
      reason: 'unanswered-items',
      type: 'confirm-incomplete',
      unansweredItemCount,
    };
  }

  return {
    reason: unansweredItemCount > 0 ? 'confirmed-incomplete' : 'complete',
    type: 'submit',
  };
}

export function normalizeAttemptUnansweredItemCount(
  completionSummary: Pick<AttemptCompletionSummary, 'unansweredItemCount'>
) {
  return normalizeRuntimeDisplayCount(completionSummary.unansweredItemCount);
}

export function isStudentAnswerFilled(answer: string | undefined) {
  return Boolean(normalizeSubmissionAnswer(answer));
}
