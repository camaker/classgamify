import {
  buildAttemptDurationDisplayView,
  formatAttemptDuration,
  normalizeAttemptDurationSeconds,
  normalizeAttemptTimeLimitSeconds,
  resolveAttemptSubmissionDurationSeconds,
  type AttemptDurationDisplayView,
} from '@/assignments/attempt-duration';
import {
  canUseAnotherAssignmentAttempt,
  normalizeAssignmentRemainingAttempts,
  type AssignmentAttemptUsage,
} from '@/assignments/attempt-limits';
import {
  getAttemptAnswerRuntimeItemEntries,
  getAttemptAnswerRuntimeItemIds,
  isAssignmentAttemptAnswerValidationError,
  normalizeAttemptAnswerItemId,
  type AssignmentAttemptAnswerValidationErrorCode,
  type AttemptAnswerRuntimeItem,
  type AttemptAnswerRuntimeItemEntry,
} from '@/assignments/attempt-answers';
import {
  getAnonymousBrowserLabel,
  normalizeAnonymousToken,
  normalizeStudentName,
} from '@/assignments/identity';
import type {
  PublicAssignmentUnavailablePayload,
  PublicAttemptReviewSummary,
} from '@/assignments/public';
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

export type StudentAttemptProgressView = AttemptCompletionSummary & {
  ariaLabel: string;
  description: string;
  label: string;
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

export type StudentAttemptSubmissionFailureCode =
  | AssignmentAttemptAnswerValidationErrorCode
  | 'anonymous-token-required'
  | 'assignment-closed'
  | 'assignment-expired'
  | 'assignment-not-found'
  | 'assignment-not-published'
  | 'attempt-limit-reached'
  | 'student-name-required';

type SafeStudentAttemptSubmissionFailureCode = Exclude<
  StudentAttemptSubmissionFailureCode,
  'duplicate-runtime-item'
>;

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

type NormalizeStudentAnswersForRuntimeItemsOptions = {
  includeUnanswered?: boolean;
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
  reviewSummaryCorrectLabel: string;
  reviewSummaryHiddenDescription: string;
  reviewSummaryItemCountLabel: string;
  reviewSummaryNeedsReviewLabel: string;
  reviewSummaryReviewHiddenValue: string;
  reviewSummaryReviewVisibilityLabel: string;
  reviewSummarySubmittedLabel: string;
  reviewSummaryTitle: string;
  reviewSummaryUnansweredLabel: string;
  reviewSummaryVisibleDescription: string;
  seoDescription: string;
  seoTitlePrefix: string;
  startAnotherAttemptLabel: string;
  missingStudentNameMessage: string;
  studentNameDescription: string;
  studentNameLabel: string;
  studentNameLockedDescription: string;
  studentNamePlaceholder: string;
  submitButtonAriaLabel: (input: { label: string; progress: string }) => string;
  submitControlsLabel: string;
  submitHintConfirmIncompleteAriaLabel: (input: { hint: string }) => string;
  submitHintReadOnlyAriaLabel: (input: { hint: string }) => string;
  submitHintUnansweredAriaLabel: (input: { hint: string }) => string;
  submissionFailureMessage: string;
  submissionPendingLabel: string;
  submissionSuccessMessage: string;
  teacherResultsLabel: string;
  timeExpiredMessage: string;
  timeEndedLabel: string;
  timerActiveDescription: string;
  timerOffDescription: string;
};

export type AnonymousAttemptCopy = {
  browserLabelAriaLabel: string;
  browserLabel: string;
  browserLabelCaption: string;
  description: string;
  retryDescription: string;
  summary: {
    hidesRawToken: boolean;
    itemCount: number;
    showsBrowserLabel: boolean;
  };
  summaryItems: AnonymousAttemptSummaryItem[];
  title: string;
};

export type AnonymousAttemptSummaryItemId =
  | 'browser-label'
  | 'retry-browser'
  | 'token-privacy';

export type AnonymousAttemptSummaryItem = {
  ariaLabel: string;
  description: string;
  id: AnonymousAttemptSummaryItemId;
  label: string;
  value: string;
};

type StudentAttemptAnonymousTokenResolver = {
  collectStudentName: boolean;
  createAnonymousToken: () => string;
  currentAnonymousToken?: string;
};

export type StudentAttemptResultDisplay = {
  accuracyLabel: string;
  durationLabel: string;
  durationView: AttemptDurationDisplayView;
  scoreAriaLabel: string;
  scoreLabel: string;
};

export type StudentAttemptResultNextStepId =
  | 'done'
  | 'feedback'
  | 'review-score'
  | 'start-another'
  | 'teacher-review';

export type StudentAttemptResultNextStepView = {
  id: StudentAttemptResultNextStepId;
  label: string;
};

export type StudentAttemptResultNextStepsView = {
  ariaLabel: string;
  stepViews: StudentAttemptResultNextStepView[];
  title: string;
};

export type StudentAttemptReviewSummaryMetricKey =
  | 'correct'
  | 'items'
  | 'needs-review'
  | 'review'
  | 'submitted'
  | 'unanswered';

export type StudentAttemptReviewSummaryMetricView = {
  ariaLabel: string;
  key: StudentAttemptReviewSummaryMetricKey;
  label: string;
  value: string;
};

export type StudentAttemptReviewSummaryView = {
  ariaLabel: string;
  description: string;
  hiddenBySettings: boolean;
  metrics: StudentAttemptReviewSummaryMetricView[];
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
  ariaLabel: string;
  description: string;
  label: string;
  show: boolean;
};

export type StudentRunnerMissingReason =
  | 'closed'
  | 'draft'
  | 'expired'
  | 'not-found';

export type StudentRunnerMissingScopeItemId =
  | 'activity-content'
  | 'browser-identity'
  | 'link-status'
  | 'next-step'
  | 'submissions';

export type StudentRunnerMissingScopeItem = {
  description: string;
  id: StudentRunnerMissingScopeItemId;
  label: string;
  value: string;
};

export type StudentRunnerMissingView = {
  description: string;
  reason: StudentRunnerMissingReason;
  scopeItems: StudentRunnerMissingScopeItem[];
  title: string;
  unavailable?: PublicAssignmentUnavailablePayload;
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
  get reviewSummaryCorrectLabel() {
    return m.student_runner_review_summary_correct_label();
  },
  get reviewSummaryHiddenDescription() {
    return m.student_runner_review_summary_hidden_description();
  },
  get reviewSummaryItemCountLabel() {
    return m.student_runner_review_summary_item_count_label();
  },
  get reviewSummaryNeedsReviewLabel() {
    return m.student_runner_review_summary_needs_review_label();
  },
  get reviewSummaryReviewHiddenValue() {
    return m.student_runner_review_summary_review_hidden_value();
  },
  get reviewSummaryReviewVisibilityLabel() {
    return m.student_runner_review_summary_review_visibility_label();
  },
  get reviewSummarySubmittedLabel() {
    return m.student_runner_review_summary_submitted_label();
  },
  get reviewSummaryTitle() {
    return m.student_runner_review_summary_title();
  },
  get reviewSummaryUnansweredLabel() {
    return m.student_runner_review_summary_unanswered_label();
  },
  get reviewSummaryVisibleDescription() {
    return m.student_runner_review_summary_visible_description();
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
  get studentNameDescription() {
    return m.student_runner_student_name_description();
  },
  get studentNameLabel() {
    return m.student_runner_student_name_label();
  },
  get studentNameLockedDescription() {
    return m.student_runner_student_name_locked_description();
  },
  get studentNamePlaceholder() {
    return m.student_runner_student_name_placeholder();
  },
  submitButtonAriaLabel(input) {
    return m.student_runner_submit_button_aria(input);
  },
  get submitControlsLabel() {
    return m.student_runner_submit_controls_label();
  },
  submitHintConfirmIncompleteAriaLabel(input) {
    return m.student_runner_submit_hint_confirm_incomplete_aria(input);
  },
  submitHintReadOnlyAriaLabel(input) {
    return m.student_runner_submit_hint_read_only_aria(input);
  },
  submitHintUnansweredAriaLabel(input) {
    return m.student_runner_submit_hint_unanswered_aria(input);
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
  get timerActiveDescription() {
    return m.student_runner_timer_active_description();
  },
  get timerOffDescription() {
    return m.student_runner_timer_off_description();
  },
} satisfies StudentRunnerCopy;

export function getStudentRunnerCopy(): StudentRunnerCopy {
  return STUDENT_RUNNER_COPY;
}

export function resolveStudentAttemptSubmissionFailureMessage(error: unknown) {
  const fallbackMessage = STUDENT_RUNNER_COPY.submissionFailureMessage;
  const failureCode = resolveStudentAttemptSubmissionFailureCode(error);

  return failureCode
    ? getSafeStudentAttemptSubmissionFailureMessage(failureCode)
    : fallbackMessage;
}

export function resolveStudentAttemptSubmissionFailureCode(
  error: unknown
): StudentAttemptSubmissionFailureCode | undefined {
  if (!(error instanceof Error)) return undefined;

  if (isAssignmentAttemptAnswerValidationError(error)) {
    return isSafeStudentAttemptAnswerValidationErrorCode(error.code)
      ? error.code
      : undefined;
  }

  const message = error.message.trim();
  return getSafeStudentAttemptSubmissionFailureCodeByMessage(message);
}

function getSafeStudentAttemptSubmissionFailureMessage(
  code: SafeStudentAttemptSubmissionFailureCode
) {
  switch (code) {
    case 'anonymous-token-required':
      return m.assignment_api_error_anonymous_token_required();
    case 'assignment-closed':
      return m.assignment_api_error_assignment_closed();
    case 'assignment-expired':
      return m.assignment_api_error_assignment_expired();
    case 'assignment-not-found':
      return m.assignment_api_error_assignment_not_found();
    case 'assignment-not-published':
      return m.assignment_api_error_assignment_not_published();
    case 'attempt-limit-reached':
      return m.assignment_api_error_attempt_limit_reached();
    case 'student-name-required':
      return m.assignment_api_error_student_name_required();
    case 'duplicate-item':
      return m.assignment_attempt_answers_error_duplicate_item();
    case 'too-many':
      return m.assignment_attempt_answers_error_too_many();
    case 'unknown-item':
      return m.assignment_attempt_answers_error_unknown_item();
  }
}

function isSafeStudentAttemptAnswerValidationErrorCode(
  code: AssignmentAttemptAnswerValidationErrorCode
) {
  return (
    code === 'duplicate-item' || code === 'too-many' || code === 'unknown-item'
  );
}

function getSafeStudentAttemptSubmissionFailureCodeByMessage(
  message: string
): StudentAttemptSubmissionFailureCode | undefined {
  return getSafeStudentAttemptSubmissionFailureEntries().find(
    (entry) => entry.message === message
  )?.code;
}

function getSafeStudentAttemptSubmissionFailureEntries(): Array<{
  code: SafeStudentAttemptSubmissionFailureCode;
  message: string;
}> {
  return [
    {
      code: 'anonymous-token-required',
      message: m.assignment_api_error_anonymous_token_required(),
    },
    {
      code: 'assignment-closed',
      message: m.assignment_api_error_assignment_closed(),
    },
    {
      code: 'assignment-expired',
      message: m.assignment_api_error_assignment_expired(),
    },
    {
      code: 'assignment-not-found',
      message: m.assignment_api_error_assignment_not_found(),
    },
    {
      code: 'assignment-not-published',
      message: m.assignment_api_error_assignment_not_published(),
    },
    {
      code: 'attempt-limit-reached',
      message: m.assignment_api_error_attempt_limit_reached(),
    },
    {
      code: 'student-name-required',
      message: m.assignment_api_error_student_name_required(),
    },
    {
      code: 'duplicate-item',
      message: m.assignment_attempt_answers_error_duplicate_item(),
    },
    {
      code: 'too-many',
      message: m.assignment_attempt_answers_error_too_many(),
    },
    {
      code: 'unknown-item',
      message: m.assignment_attempt_answers_error_unknown_item(),
    },
  ];
}

export function buildStudentRunnerMissingView(
  reason: StudentRunnerMissingReason,
  unavailable?: PublicAssignmentUnavailablePayload
): StudentRunnerMissingView {
  const reasonView = getStudentRunnerMissingReasonView(reason);

  return {
    ...reasonView,
    reason,
    scopeItems: buildStudentRunnerMissingScopeItems(reason),
    ...(unavailable ? { unavailable } : {}),
  };
}

function getStudentRunnerMissingReasonView(reason: StudentRunnerMissingReason) {
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

function buildStudentRunnerMissingScopeItems(
  reason: StudentRunnerMissingReason
): StudentRunnerMissingScopeItem[] {
  const statusView = getStudentRunnerMissingStatusScopeItem(reason);

  return [
    {
      description: statusView.description,
      id: 'link-status',
      label: m.student_runner_missing_scope_status_label(),
      value: statusView.value,
    },
    {
      description:
        m.student_runner_missing_scope_activity_content_description(),
      id: 'activity-content',
      label: m.student_runner_missing_scope_activity_content_label(),
      value: m.student_runner_missing_scope_activity_content_value(),
    },
    {
      description: m.student_runner_missing_scope_submissions_description(),
      id: 'submissions',
      label: m.student_runner_missing_scope_submissions_label(),
      value: m.student_runner_missing_scope_submissions_value(),
    },
    {
      description:
        m.student_runner_missing_scope_browser_identity_description(),
      id: 'browser-identity',
      label: m.student_runner_missing_scope_browser_identity_label(),
      value: m.student_runner_missing_scope_browser_identity_value(),
    },
    {
      description: getStudentRunnerMissingNextStepDescription(reason),
      id: 'next-step',
      label: m.student_runner_missing_scope_next_step_label(),
      value: m.student_runner_missing_scope_next_step_value(),
    },
  ];
}

function getStudentRunnerMissingStatusScopeItem(
  reason: StudentRunnerMissingReason
) {
  if (reason === 'closed') {
    return {
      description: m.student_runner_missing_scope_status_closed_description(),
      value: m.student_runner_missing_scope_status_closed_value(),
    };
  }

  if (reason === 'expired') {
    return {
      description: m.student_runner_missing_scope_status_expired_description(),
      value: m.student_runner_missing_scope_status_expired_value(),
    };
  }

  if (reason === 'draft') {
    return {
      description: m.student_runner_missing_scope_status_draft_description(),
      value: m.student_runner_missing_scope_status_draft_value(),
    };
  }

  return {
    description: m.student_runner_missing_scope_status_not_found_description(),
    value: m.student_runner_missing_scope_status_not_found_value(),
  };
}

function getStudentRunnerMissingNextStepDescription(
  reason: StudentRunnerMissingReason
) {
  if (reason === 'closed') {
    return m.student_runner_missing_scope_next_step_closed_description();
  }

  if (reason === 'expired') {
    return m.student_runner_missing_scope_next_step_expired_description();
  }

  if (reason === 'draft') {
    return m.student_runner_missing_scope_next_step_draft_description();
  }

  return m.student_runner_missing_scope_next_step_not_found_description();
}

export function buildAnonymousAttemptCopy({
  browserLabel,
}: {
  browserLabel?: string;
}): AnonymousAttemptCopy {
  const label =
    normalizeRuntimeDisplayText(browserLabel) || getAnonymousBrowserLabel();
  const summaryItems = buildAnonymousAttemptSummaryItems(label);

  return {
    browserLabelAriaLabel: m.student_runner_anonymous_browser_label_aria({
      label,
    }),
    browserLabel: label,
    browserLabelCaption: m.student_runner_anonymous_browser_label_caption(),
    description: m.student_runner_anonymous_attempt_description({ label }),
    retryDescription: m.student_runner_anonymous_retry_description(),
    summary: {
      hidesRawToken: true,
      itemCount: summaryItems.length,
      showsBrowserLabel: Boolean(label),
    },
    summaryItems,
    title: m.student_runner_anonymous_attempt_title(),
  };
}

function buildAnonymousAttemptSummaryItems(
  browserLabel: string
): AnonymousAttemptSummaryItem[] {
  return [
    buildAnonymousAttemptSummaryItem({
      description: m.student_runner_anonymous_summary_browser_description(),
      id: 'browser-label',
      label: m.student_runner_anonymous_summary_browser_label(),
      value: browserLabel,
    }),
    buildAnonymousAttemptSummaryItem({
      description: m.student_runner_anonymous_summary_retry_description(),
      id: 'retry-browser',
      label: m.student_runner_anonymous_summary_retry_label(),
      value: m.student_runner_anonymous_summary_retry_value(),
    }),
    buildAnonymousAttemptSummaryItem({
      description: m.student_runner_anonymous_summary_privacy_description(),
      id: 'token-privacy',
      label: m.student_runner_anonymous_summary_privacy_label(),
      value: m.student_runner_anonymous_summary_privacy_value(),
    }),
  ];
}

function buildAnonymousAttemptSummaryItem({
  description,
  id,
  label,
  value,
}: Omit<
  AnonymousAttemptSummaryItem,
  'ariaLabel'
>): AnonymousAttemptSummaryItem {
  return {
    ariaLabel: m.student_runner_anonymous_summary_item_aria({
      description,
      label,
      value,
    }),
    description,
    id,
    label,
    value,
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
  const normalizedTotalPoints = normalizeStudentResultScore(totalPoints);
  const normalizedEarnedPoints = normalizeStudentResultScore(earnedPoints, {
    max: normalizedTotalPoints,
  });
  const normalizedDurationSeconds =
    normalizeAttemptDurationSeconds({ durationSeconds }) ??
    normalizeAttemptDurationSeconds({
      durationSeconds: fallbackDurationSeconds,
    });
  const durationView = buildAttemptDurationDisplayView({
    durationSeconds: normalizedDurationSeconds,
    emptyValue: '',
    style: 'timer',
  });
  const scoreLabel = m.student_runner_result_score_line({
    earnedPoints: normalizedEarnedPoints,
    totalPoints: normalizedTotalPoints,
  });

  return {
    accuracyLabel: m.student_runner_result_accuracy_line({
      accuracy: formatAssignmentResultPercent(
        normalizeStudentResultAccuracy(accuracy)
      ),
      label: STUDENT_RUNNER_COPY.resultAccuracyLabel,
    }),
    durationLabel: m.student_runner_result_time_line({
      label: STUDENT_RUNNER_COPY.resultTimePrefix,
      time: durationView.label,
    }),
    durationView,
    scoreAriaLabel: m.student_runner_result_score_aria({ score: scoreLabel }),
    scoreLabel,
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
    ariaLabel: m.student_runner_result_next_steps_aria_label(),
    stepViews: [
      {
        id: 'review-score',
        label: STUDENT_RUNNER_COPY.resultNextStepReviewScore,
      },
      showCorrectAnswers
        ? {
            id: 'feedback',
            label: STUDENT_RUNNER_COPY.resultNextStepFeedback,
          }
        : {
            id: 'teacher-review',
            label: STUDENT_RUNNER_COPY.resultNextStepTeacherReview,
          },
      canStartAnotherAttempt
        ? {
            id: 'start-another',
            label: STUDENT_RUNNER_COPY.resultNextStepStartAnother,
          }
        : {
            id: 'done',
            label: STUDENT_RUNNER_COPY.resultNextStepDone,
          },
    ],
    title: STUDENT_RUNNER_COPY.resultNextStepsTitle,
  };
}

export function buildStudentAttemptReviewSummaryView({
  summary,
}: {
  summary: PublicAttemptReviewSummary;
}): StudentAttemptReviewSummaryView {
  const hiddenBySettings =
    summary.hiddenBySettings || !summary.showCorrectAnswers;

  if (hiddenBySettings) {
    return {
      ariaLabel: m.student_runner_review_summary_aria_label(),
      description: STUDENT_RUNNER_COPY.reviewSummaryHiddenDescription,
      hiddenBySettings,
      metrics: [
        buildStudentAttemptReviewSummaryMetricView({
          key: 'submitted',
          label: STUDENT_RUNNER_COPY.reviewSummarySubmittedLabel,
          value: formatStudentReviewSummaryCount(summary.submittedItemCount),
        }),
        buildStudentAttemptReviewSummaryMetricView({
          key: 'unanswered',
          label: STUDENT_RUNNER_COPY.reviewSummaryUnansweredLabel,
          value: formatStudentReviewSummaryCount(summary.unansweredItemCount),
        }),
        buildStudentAttemptReviewSummaryMetricView({
          key: 'review',
          label: STUDENT_RUNNER_COPY.reviewSummaryReviewVisibilityLabel,
          value: STUDENT_RUNNER_COPY.reviewSummaryReviewHiddenValue,
        }),
      ],
      title: STUDENT_RUNNER_COPY.reviewSummaryTitle,
    };
  }

  return {
    ariaLabel: m.student_runner_review_summary_aria_label(),
    description: STUDENT_RUNNER_COPY.reviewSummaryVisibleDescription,
    hiddenBySettings,
    metrics: [
      buildStudentAttemptReviewSummaryMetricView({
        key: 'submitted',
        label: STUDENT_RUNNER_COPY.reviewSummarySubmittedLabel,
        value: formatStudentReviewSummaryCount(summary.submittedItemCount),
      }),
      buildStudentAttemptReviewSummaryMetricView({
        key: 'correct',
        label: STUDENT_RUNNER_COPY.reviewSummaryCorrectLabel,
        value: formatStudentReviewSummaryCount(summary.correctItemCount),
      }),
      buildStudentAttemptReviewSummaryMetricView({
        key: 'needs-review',
        label: STUDENT_RUNNER_COPY.reviewSummaryNeedsReviewLabel,
        value: formatStudentReviewSummaryCount(summary.needsReviewItemCount),
      }),
      buildStudentAttemptReviewSummaryMetricView({
        key: 'unanswered',
        label: STUDENT_RUNNER_COPY.reviewSummaryUnansweredLabel,
        value: formatStudentReviewSummaryCount(summary.unansweredItemCount),
      }),
    ],
    title: STUDENT_RUNNER_COPY.reviewSummaryTitle,
  };
}

function normalizeStudentResultScore(
  value: number,
  options?: {
    max?: number;
  }
) {
  const normalizedValue = Number.isFinite(value)
    ? Math.max(0, Math.trunc(value))
    : 0;

  if (options?.max === undefined || !Number.isFinite(options.max)) {
    return normalizedValue;
  }

  return Math.min(normalizedValue, options.max);
}

function normalizeStudentResultAccuracy(value: number) {
  if (!Number.isFinite(value)) return Number.NaN;
  return Math.min(100, Math.max(0, value));
}

function formatStudentReviewSummaryCount(value: number) {
  return String(normalizeRuntimeDisplayCount(value));
}

function buildStudentAttemptReviewSummaryMetricView({
  key,
  label,
  value,
}: {
  key: StudentAttemptReviewSummaryMetricKey;
  label: string;
  value: string;
}): StudentAttemptReviewSummaryMetricView {
  return {
    ariaLabel: m.student_runner_review_summary_metric_aria({
      label,
      value,
    }),
    key,
    label,
    value,
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
  if (normalizeAttemptTimeLimitSeconds(timeLimitSeconds) === undefined) {
    return {
      ariaLabel: m.student_runner_timer_badge_off_aria(),
      description: STUDENT_RUNNER_COPY.timerOffDescription,
      label: '',
      show: false,
    };
  }

  if (timeExpired) {
    return {
      ariaLabel: m.student_runner_timer_badge_aria({
        timer: STUDENT_RUNNER_COPY.timeEndedLabel,
      }),
      description: STUDENT_RUNNER_COPY.timerActiveDescription,
      label: STUDENT_RUNNER_COPY.timeEndedLabel,
      show: true,
    };
  }

  const label = formatAttemptDuration(remainingSeconds, {
    emptyValue: '',
    style: 'timer',
  });

  return {
    ariaLabel: label
      ? m.student_runner_timer_badge_aria({ timer: label })
      : m.student_runner_timer_badge_pending_aria(),
    description: STUDENT_RUNNER_COPY.timerActiveDescription,
    label,
    show: Boolean(label),
  };
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
  includeUnanswered = true,
  runtimeItems,
}: {
  answers: StudentAnswerMap;
  runtimeItems: StudentSubmissionRuntimeItem[];
} & NormalizeStudentAnswersForRuntimeItemsOptions): StudentAnswerMap {
  return Object.fromEntries(
    getUniqueSubmissionRuntimeItemEntries(runtimeItems).flatMap((entry) => {
      const answer = normalizeSubmissionAnswer(
        getSubmissionEntryAnswer(entry, answers)
      );

      if (!includeUnanswered && !isStudentAnswerFilled(answer)) return [];

      return [[entry.itemId, answer]];
    })
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

export function buildStudentAttemptProgressView({
  completionSummary,
  verb,
}: {
  completionSummary: AttemptCompletionSummary;
  verb?: string;
}): StudentAttemptProgressView {
  const answeredItemCount = normalizeRuntimeDisplayCount(
    completionSummary.answeredItemCount
  );
  const itemCount = normalizeRuntimeDisplayCount(completionSummary.itemCount);
  const unansweredItemCount =
    normalizeAttemptUnansweredItemCount(completionSummary);
  const label = formatAttemptCompletionProgressLabel({
    completionSummary: {
      answeredItemCount,
      itemCount,
      unansweredItemCount,
    },
    verb,
  });

  return {
    answeredItemCount,
    ariaLabel: m.student_attempt_progress_aria_label({ progress: label }),
    description: m.student_attempt_progress_description({
      answeredCount: answeredItemCount,
      itemCount,
      unansweredCount: unansweredItemCount,
    }),
    itemCount,
    label,
    unansweredItemCount,
  };
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

  return getUniqueSubmissionRuntimeItemEntries(runtimeItems).flatMap(
    (entry) => {
      const answer = normalizedAnswers[entry.itemId] ?? '';
      if (!isStudentAnswerFilled(answer)) return [];

      return [
        {
          answer,
          itemId: entry.itemId,
        },
      ];
    }
  );
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

    if (!isStudentAnswerFilled(change.answer)) {
      delete nextAnswers[itemId];
      continue;
    }

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
