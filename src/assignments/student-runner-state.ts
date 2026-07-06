import type {
  ActivitySeed,
  ActivityTemplateType,
  AssignmentSeed,
} from '@/activities/types';
import { getRuntimeItems } from '@/activities/runtime';
import { getStarterActivity, getStarterAssignment } from '@/activities/catalog';
import { getActivityTemplateRunnerCopy } from '@/activities/runner-copy';
import {
  ASSIGNMENT_ATTEMPT_DURATION_UNITS,
  buildAttemptTimerState,
  formatAttemptDuration,
  type AttemptDurationDisplayView,
  type AttemptTimerState,
} from '@/assignments/attempt-duration';
import {
  buildAssignmentAttemptLimitHandoffEvidence,
  buildAssignmentAttemptLimitHandoffView,
  type AssignmentAttemptLimitHandoffView,
} from '@/assignments/attempt-limit-handoff';
import {
  buildAssignmentSubmissionValidationHandoffEvidence,
  buildAssignmentSubmissionValidationHandoffView,
  type AssignmentSubmissionValidationHandoffView,
} from '@/assignments/submission-validation-handoff';
import {
  normalizeAssignmentAttemptCount,
  type AssignmentAttemptUsage,
} from '@/assignments/attempt-limits';
import type { PublicAssignmentRuleSummaryId } from '@/assignments/delivery-summary';
import {
  buildAnonymousAttemptCopy,
  buildAttemptCompletionCopy,
  buildStudentAttemptFeedbackScopeView,
  buildStudentAttemptSubmissionPlan,
  buildStudentAttemptSessionKey,
  buildStudentAttemptControlState,
  buildStudentAttemptProgressView,
  buildStudentAttemptReviewSummaryView,
  buildStudentAttemptResultDisplay,
  buildStudentAttemptResultNextStepsView,
  buildStudentAttemptTimerBadge,
  buildStudentRunnerMissingView,
  canStartAnotherStudentAttempt,
  formatStudentAttemptUsageLabel,
  getAttemptCompletionSummary,
  getStudentRunnerCopy,
  normalizeStudentAnswersForRuntimeItems,
  applyStudentAnswerChanges,
  type AnonymousAttemptCopy,
  type AttemptCompletionCopy,
  type AttemptCompletionSummary,
  type StudentAttemptProgressView,
  type StudentAttemptControlState,
  type StudentAttemptFeedbackScopeMetricKey,
  type StudentAttemptFeedbackScopeMetricView,
  type StudentAttemptFeedbackScopeView,
  type StudentAttemptReviewSummaryMetricKey,
  type StudentAttemptReviewSummaryMetricView,
  type StudentAttemptReviewSummaryView,
  type StudentAttemptResultDisplay,
  type StudentAttemptResultNextStepsView,
  type StudentAttemptSubmissionBlockedReason,
  type StudentAttemptSubmissionConfirmIncompleteReason,
  type StudentAttemptSubmissionInput,
  type StudentAttemptSubmissionMessageType,
  type StudentAttemptSubmissionPlan,
  type StudentAttemptSubmissionSubmitReason,
  type StudentAttemptTimerBadge,
  type StudentRunnerMissingScopeItem,
  type StudentAnswerMap,
  type StudentAnswerChange,
  type StudentRunnerMissingReason,
} from '@/assignments/student-submission';
import {
  buildPublicAssignmentPreviewActivity,
  buildPublicAssignmentPreviewAssignment,
  summarizePublicAttemptReviewItemsForTotal,
  stripRuntimeAnswers,
  type PublicAssignmentUnavailablePayload,
  type PublicAssignmentLookupResult,
  type PublicAttemptReviewSummary,
  type PublicAttemptReviewItem,
  type PublicAttemptResult,
  type PublicRuntimeItem,
} from '@/assignments/public';
import { getAnonymousBrowserLabel } from '@/assignments/identity';
import { orderAssignmentRuntimeItems } from '@/assignments/item-order';
import {
  normalizeRuntimeDisplayCount,
  normalizeRuntimeDisplayText,
} from '@/assignments/runtime-display';
import { normalizeAssignmentShareSlug } from '@/assignments/share-slug';
import {
  buildStudentRunnerHeaderView,
  type StudentRunnerHeaderView,
  type StudentRunnerPrepareStepId,
} from '@/assignments/student-runner-view';
import { m } from '@/locale/paraglide/messages';

export type StudentRunnerReadyStateSource =
  | 'public-assignment'
  | 'starter-preview';

export type StudentRunnerStarterPreview = {
  activity: ActivitySeed;
  assignment: AssignmentSeed;
  runtimeItems: PublicRuntimeItem[];
};

type StudentRunnerReadyState = {
  activity: ActivitySeed;
  assignment: AssignmentSeed;
  canSubmit: boolean;
  hidePreviewAnswers: boolean;
  runtimeItems: PublicRuntimeItem[];
  source: StudentRunnerReadyStateSource;
  status: 'ready';
};

type StudentRunnerPageState =
  | {
      status: 'loading';
    }
  | {
      reason: StudentRunnerMissingReason;
      status: 'missing';
      unavailable?: PublicAssignmentUnavailablePayload;
    }
  | StudentRunnerReadyState;

type StudentRunnerAttemptState = {
  activeShareId: string;
  canSubmit: boolean;
  completionSummary: AttemptCompletionSummary;
  currentAttemptSessionKey?: string;
  itemCount: number;
  runtimeItems: PublicRuntimeItem[];
};

export type StudentRunnerAttemptResult = PublicAttemptResult & {
  attemptUsage: AssignmentAttemptUsage;
  reviewSummary: PublicAttemptReviewSummary;
  reviewItems: PublicAttemptReviewItem[];
};

export type StudentRunnerLoadingView = {
  message: string;
};

export type StudentRunnerMissingPageView = {
  badgeLabel: string;
  browseTemplatesLabel: string;
  description: string;
  reason: StudentRunnerMissingReason;
  scopeItems: StudentRunnerMissingScopeItem[];
  title: string;
  unavailable?: PublicAssignmentUnavailablePayload;
  unavailableSafetyView?: StudentRunnerUnavailableSafetyView;
};

export type StudentRunnerUnavailableSafetyItemId =
  | 'activity-content'
  | 'answer-feedback'
  | 'browser-identity'
  | 'source-materials'
  | 'submissions';

export type StudentRunnerUnavailableSafetyItemView = {
  description: string;
  id: StudentRunnerUnavailableSafetyItemId;
  label: string;
  value: string;
};

export type StudentRunnerUnavailableSafetyView = {
  description: string;
  items: StudentRunnerUnavailableSafetyItemView[];
  title: string;
};

export type StudentRunnerIdentityView =
  | {
      ariaLabel: string;
      description: string;
      disabled: boolean;
      label: string;
      mode: 'student-name';
      placeholder: string;
    }
  | {
      ariaLabel: string;
      copy: AnonymousAttemptCopy;
      mode: 'anonymous';
    };

export type StudentRunnerControlView = {
  attemptRegionDescription: string;
  attemptRegionLabel: string;
  payloadSummaryView: StudentRunnerSubmissionPayloadSummaryView;
  progressDescription: string;
  progressView: StudentAttemptProgressView;
  statusBarLabel: string;
  progressLabel: string;
  readOnlyMessage?: string;
  requiresIncompleteSubmitConfirmation: boolean;
  runnerTitle: string;
  runtimeItemsDisabled: boolean;
  showTimeExpiredMessage: boolean;
  submitButtonLabel: string;
  submitButtonAriaLabel: string;
  submitControlsLabel: string;
  submitConfirmationMessage?: string;
  submitDisabled: boolean;
  submitHintViews: StudentRunnerSubmitHintView[];
  submitReadinessView: StudentRunnerSubmitReadinessView;
  timeExpiredNoticeLabel: string;
  timeExpiredMessage: string;
  timerBadge: StudentAttemptTimerBadge;
  unansweredLabel?: string;
};

export type StudentRunnerSubmissionContractItemId =
  | 'feedback'
  | 'identity'
  | 'payload-summary'
  | 'submit-readiness'
  | 'timer';

export type StudentRunnerSubmissionContractItemView = {
  ariaLabel: string;
  description: string;
  id: StudentRunnerSubmissionContractItemId;
  label: string;
  value: string;
};

export type StudentRunnerSubmissionPrivacyContract = {
  exposesAnonymousToken: false;
  exposesAnswerText: false;
  exposesStudentName: false;
  exposesTeacherOnlyAnswers: false;
  exposesTeacherSourceMaterials: false;
  metricKeys: StudentRunnerSubmissionPayloadSummaryMetricKey[];
};

export type StudentRunnerSubmissionContractView = {
  description: string;
  itemViews: StudentRunnerSubmissionContractItemView[];
  privacy: StudentRunnerSubmissionPrivacyContract;
  title: string;
};

export const STUDENT_RUNNER_SUBMISSION_HANDOFF_ITEM_IDS = [
  'share-link',
  'runtime-items',
  'answered-items',
  'unanswered-items',
  'progress',
  'payload-summary',
  'submit-readiness',
  'partial-confirmation',
  'submission-state',
  'identity-mode',
  'identity-privacy',
  'timer-status',
  'timer-limit',
  'attempt-duration',
  'attempt-clock',
  'result-status',
  'score-summary',
  'result-accuracy',
  'attempt-usage',
  'retry-availability',
  'review-summary',
  'review-submitted',
  'review-needs-review',
  'review-unanswered',
  'feedback-scope',
  'feedback-visibility',
  'feedback-items',
  'feedback-detail-evidence',
  'next-steps',
  'privacy-guard',
] as const;

export type StudentRunnerSubmissionHandoffItemId =
  (typeof STUDENT_RUNNER_SUBMISSION_HANDOFF_ITEM_IDS)[number];

export type StudentRunnerSubmissionHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: StudentRunnerSubmissionHandoffItemId;
  label: string;
  value: string;
};

export type StudentRunnerSubmissionHandoffPrivacyContract = {
  exposesAnonymousToken: false;
  exposesAnswerText: false;
  exposesRawSubmissionPayload: false;
  exposesRuntimeItemIds: false;
  exposesStudentName: false;
  exposesTeacherOnlyAnswers: false;
  exposesTeacherSourceMaterials: false;
  feedbackMetricKeys: StudentAttemptFeedbackScopeMetricKey[];
  itemIds: StudentRunnerSubmissionHandoffItemId[];
  payloadMetricKeys: StudentRunnerSubmissionPayloadSummaryMetricKey[];
  readinessItemIds: StudentRunnerSubmitReadinessItemId[];
  reviewMetricKeys: StudentAttemptReviewSummaryMetricKey[];
};

export type StudentRunnerSubmissionHandoffView = {
  description: string;
  itemViews: StudentRunnerSubmissionHandoffItemView[];
  privacy: StudentRunnerSubmissionHandoffPrivacyContract;
  title: string;
};

export const STUDENT_RUNNER_START_HANDOFF_ITEM_IDS = [
  'share-link',
  'assignment-title',
  'runner-source',
  'source-boundary',
  'runtime-availability',
  'submit-gate',
  'read-only-state',
  'rule-status',
  'rule-count',
  'item-count',
  'attempt-limit',
  'timer-policy',
  'timer-start-boundary',
  'close-time',
  'identity-mode',
  'identity-privacy',
  'review-behavior',
  'item-order',
  'instructions',
  'prepare-review-rules',
  'prepare-identity',
  'prepare-timer',
  'prepare-submit',
  'prepare-step-count',
  'browser-label',
  'teacher-action',
  'runtime-content-guard',
  'answer-key-guard',
  'student-data-guard',
  'privacy-guard',
] as const;

export type StudentRunnerStartHandoffItemId =
  (typeof STUDENT_RUNNER_START_HANDOFF_ITEM_IDS)[number];

export type StudentRunnerStartHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: StudentRunnerStartHandoffItemId;
  label: string;
  value: string;
};

export type StudentRunnerStartHandoffPrivacyContract = {
  exposesAnonymousToken: false;
  exposesAnswerText: false;
  exposesRuntimeChoiceText: false;
  exposesRuntimeItemIds: false;
  exposesRuntimePromptText: false;
  exposesStudentName: false;
  exposesTeacherOnlyAnswers: false;
  exposesTeacherSourceMaterials: false;
  itemIds: StudentRunnerStartHandoffItemId[];
  prepareStepIds: StudentRunnerPrepareStepId[];
  ruleIds: PublicAssignmentRuleSummaryId[];
};

export type StudentRunnerStartHandoffView = {
  description: string;
  itemViews: StudentRunnerStartHandoffItemView[];
  privacy: StudentRunnerStartHandoffPrivacyContract;
  title: string;
};

export type StudentRunnerSubmitHintId =
  | 'confirm-incomplete'
  | 'read-only'
  | 'unanswered';

export type StudentRunnerSubmitHintView = {
  ariaLabel: string;
  id: StudentRunnerSubmitHintId;
  text: string;
  tone: 'info' | 'warning';
};

export type StudentRunnerSubmitReadinessStatus =
  | 'blocked'
  | 'needs-action'
  | 'ready';

export type StudentRunnerSubmitReadinessItemId =
  | 'completion'
  | 'incomplete-confirmation'
  | 'runtime-items'
  | 'share-link'
  | 'submission-state';

export type StudentRunnerSubmitReadinessItemView = {
  ariaLabel: string;
  description: string;
  id: StudentRunnerSubmitReadinessItemId;
  label: string;
  status: StudentRunnerSubmitReadinessStatus;
  statusLabel: string;
};

export type StudentRunnerSubmitReadinessView = {
  ariaLabel: string;
  description: string;
  items: StudentRunnerSubmitReadinessItemView[];
  status: StudentRunnerSubmitReadinessStatus;
  statusLabel: string;
  title: string;
};

export type StudentRunnerResultPanelView =
  | {
      show: false;
    }
  | {
      ariaLabel: string;
      accuracyLabel: string;
      attemptUsageLabel?: string;
      durationLabel: string;
      durationView: AttemptDurationDisplayView;
      feedbackScopeView: StudentAttemptFeedbackScopeView;
      nextStepsView: StudentAttemptResultNextStepsView;
      reviewSummaryView: StudentAttemptReviewSummaryView;
      scoreAriaLabel: string;
      scoreLabel: string;
      show: true;
      showStartAnotherAttempt: boolean;
      startAnotherAttemptAriaLabel: string;
      startAnotherAttemptDescription: string;
      startAnotherAttemptLabel: string;
      statusLabel: string;
    };

export type StudentRunnerActivityPreviewView = {
  activity: ActivitySeed;
  assignment: AssignmentSeed;
  hideAnswers: boolean;
};

export type StudentRunnerRuntimeListView = {
  disabled: boolean;
  items: PublicRuntimeItem[];
  language?: string;
  revealAnswer: boolean;
  reviewItems?: PublicAttemptReviewItem[];
  templateType: ActivityTemplateType;
};

export type StudentRunnerSeoView = {
  description: string;
  titlePrefix: string;
};

export type StudentRunnerPageViewModel = {
  activeShareId: string;
  activity: ActivitySeed | undefined;
  anonymousAttemptCopy: AnonymousAttemptCopy;
  assignment: AssignmentSeed | undefined;
  attemptLimitHandoffView: AssignmentAttemptLimitHandoffView;
  attemptControlState: StudentAttemptControlState;
  attemptResultDisplay?: StudentAttemptResultDisplay;
  attemptState: StudentRunnerAttemptState;
  attemptTimer: AttemptTimerState;
  attemptTimerBadge: StudentAttemptTimerBadge;
  attemptUsageLabel?: string;
  completionCopy: AttemptCompletionCopy;
  controlView: StudentRunnerControlView;
  currentAttemptSessionKey?: string;
  headerView?: StudentRunnerHeaderView;
  identityView?: StudentRunnerIdentityView;
  itemCount: number;
  missingReason?: StudentRunnerMissingReason;
  loadingView: StudentRunnerLoadingView;
  missingView?: StudentRunnerMissingPageView;
  previewView?: StudentRunnerActivityPreviewView;
  resultPanelView: StudentRunnerResultPanelView;
  routeBadgeLabel: string;
  runtimeListView: StudentRunnerRuntimeListView;
  showStartAnotherAttempt: boolean;
  startedAt: number;
  startHandoffView?: StudentRunnerStartHandoffView;
  submissionContractView: StudentRunnerSubmissionContractView;
  submissionHandoffView: StudentRunnerSubmissionHandoffView;
  submissionValidationHandoffView: AssignmentSubmissionValidationHandoffView;
  submissionSuccessMessage: string;
  timeLimitSeconds?: number;
};

export type StudentRunnerRouteState =
  | {
      pageView: StudentRunnerPageViewModel;
      status: 'loading';
    }
  | {
      missingView: StudentRunnerMissingPageView;
      pageView: StudentRunnerPageViewModel;
      reason: StudentRunnerMissingReason;
      status: 'missing';
    }
  | {
      pageView: StudentRunnerPageViewModel;
      status: 'unavailable';
    }
  | {
      activity: ActivitySeed;
      assignment: AssignmentSeed;
      headerView: StudentRunnerHeaderView;
      identityView: StudentRunnerIdentityView;
      pageView: StudentRunnerPageViewModel;
      previewView: StudentRunnerActivityPreviewView;
      status: 'ready';
    };

export type StudentRunnerAttemptResetState = {
  answers: StudentAnswerMap;
  anonymousToken?: string;
  attemptClock?: StudentRunnerAttemptClock;
  confirmIncompleteSubmit: boolean;
  studentName: string;
  submittedAttemptCount: number;
};

export type StudentRunnerAttemptRestartPlan = Pick<
  StudentRunnerAttemptResetState,
  'answers' | 'attemptClock' | 'confirmIncompleteSubmit'
> & {
  result: undefined;
  startedAt: number;
};

export type StudentRunnerAttemptClock = {
  shareId: string;
  startedAt: number;
};

export type StudentRunnerTimerTickPlan =
  | {
      intervalMs: number;
      type: 'tick';
    }
  | {
      type: 'skip';
    };

export type StudentRunnerAttemptSessionResetPlan =
  | {
      type: 'skip';
    }
  | (StudentRunnerAttemptResetState & {
      nextAttemptSessionKey: string;
      result: undefined;
      type: 'reset';
    });

export type StudentRunnerAttemptClockStartPlan =
  | {
      attemptClock: StudentRunnerAttemptClock;
      now: number;
      type: 'start';
    }
  | {
      type: 'skip';
    };

export type StudentRunnerAttemptSubmissionResponse = {
  attemptUsage: AssignmentAttemptUsage;
  result: PublicAttemptResult;
  reviewSummary?: PublicAttemptReviewSummary;
  reviewItems: PublicAttemptReviewItem[];
};

export type StudentRunnerAnswerUpdatePlan =
  | {
      answers: StudentAnswerMap;
      confirmIncompleteSubmit: false;
      type: 'updated';
    }
  | {
      type: 'ignored';
    };

export type StudentRunnerAnonymousTokenPlan =
  | {
      type: 'skip';
    }
  | {
      shareId: string;
      type: 'resolve';
    };

export type StudentRunnerSubmissionPlan = StudentAttemptSubmissionPlan;

type StudentRunnerSubmissionMessageReason =
  | StudentAttemptSubmissionBlockedReason
  | StudentAttemptSubmissionConfirmIncompleteReason;

type StudentRunnerSubmissionMessageTone = 'error' | 'warning';

export type StudentRunnerSubmissionExecutionPlan =
  | {
      message: string;
      messageTone: StudentRunnerSubmissionMessageTone;
      nextConfirmIncompleteSubmit: boolean;
      reason: StudentRunnerSubmissionMessageReason;
      type: 'message';
    }
  | {
      anonymousToken?: string;
      input: StudentAttemptSubmissionInput;
      payloadSummary: StudentRunnerSubmissionPayloadSummary;
      payloadSummaryView: StudentRunnerSubmissionPayloadSummaryView;
      reason: StudentAttemptSubmissionSubmitReason;
      submittedStudentName?: string;
      successMessage: string;
      type: 'submit';
    };

export type StudentRunnerSubmissionPayloadSummary = {
  answerCount: number;
  itemCount: number;
  shareSlug: string;
  unansweredItemCount: number;
};

export type StudentRunnerSubmissionPayloadSummaryMetricKey =
  | 'answers'
  | 'items'
  | 'share-link'
  | 'unanswered';

export type StudentRunnerSubmissionPayloadSummaryMetricView = {
  ariaLabel: string;
  description: string;
  key: StudentRunnerSubmissionPayloadSummaryMetricKey;
  label: string;
  value: string;
};

export type StudentRunnerSubmissionPayloadSummaryView = {
  ariaLabel: string;
  description: string;
  metrics: StudentRunnerSubmissionPayloadSummaryMetricView[];
  privacy: StudentRunnerSubmissionPrivacyContract;
  title: string;
};

export type StudentRunnerSubmissionSuccessState = {
  anonymousToken: string | undefined;
  confirmIncompleteSubmit: false;
  result: StudentRunnerAttemptResult;
  submittedAttemptCount: number;
  submittedStudentName?: string;
  successMessage: string;
};

export function buildStudentRunnerSeoView(): StudentRunnerSeoView {
  const runnerCopy = getStudentRunnerCopy();

  return {
    description: runnerCopy.seoDescription,
    titlePrefix: runnerCopy.seoTitlePrefix,
  };
}

export function buildStudentRunnerPageState({
  data,
  isLoading,
  shareId,
  starterPreview,
}: {
  data?: PublicAssignmentLookupResult | null;
  isLoading: boolean;
  shareId: string;
  starterPreview: StudentRunnerStarterPreview;
}): StudentRunnerPageState {
  if (isLoading) {
    return { status: 'loading' };
  }

  const normalizedShareId = normalizeAssignmentShareSlug(shareId);

  if (data?.status === 'available') {
    const assignment = buildPublicAssignmentPreviewAssignment(data.payload);

    return buildStudentRunnerReadyState({
      activity: buildPublicAssignmentPreviewActivity(data.payload),
      assignment,
      runtimeItems: data.payload.runtimeItems,
      source: 'public-assignment',
    });
  }

  if (data?.status === 'unavailable') {
    return {
      reason: data.reason,
      status: 'missing',
      unavailable: data.unavailable,
    };
  }

  if (
    normalizedShareId !==
    normalizeAssignmentShareSlug(starterPreview.assignment.shareId)
  ) {
    return { reason: 'not-found', status: 'missing' };
  }

  return buildStudentRunnerReadyState({
    activity: starterPreview.activity,
    assignment: starterPreview.assignment,
    runtimeItems: starterPreview.runtimeItems,
    source: 'starter-preview',
  });
}

export function buildStudentRunnerStarterPreview(
  shareId: string
): StudentRunnerStarterPreview {
  const starterAssignment = getStarterAssignment(
    normalizeAssignmentShareSlug(shareId)
  );
  const starterActivity = getStarterActivity(starterAssignment.activityId);
  const starterRuntimeItems = getRuntimeItems(
    starterActivity.templateType,
    starterActivity.content
  );

  return {
    activity: starterActivity,
    assignment: starterAssignment,
    runtimeItems: orderStudentRunnerRuntimeItems({
      items: stripRuntimeAnswers(starterRuntimeItems),
      assignment: starterAssignment,
    }),
  };
}

export function buildStudentRunnerReadyState({
  activity,
  assignment,
  runtimeItems,
  source,
}: {
  activity: ActivitySeed;
  assignment: AssignmentSeed;
  runtimeItems: PublicRuntimeItem[];
  source: StudentRunnerReadyStateSource;
}): StudentRunnerReadyState {
  const publicAssignment = source === 'public-assignment';
  const normalizedAssignment = {
    ...assignment,
    shareId: normalizeAssignmentShareSlug(assignment.shareId),
  };

  return {
    activity,
    assignment: normalizedAssignment,
    canSubmit: publicAssignment && runtimeItems.length > 0,
    hidePreviewAnswers: publicAssignment,
    runtimeItems: cloneStudentRunnerRuntimeItems(runtimeItems),
    source,
    status: 'ready',
  };
}

export function buildStudentRunnerAttemptState({
  answers,
  pageState,
  shareId,
}: {
  answers: StudentAnswerMap;
  pageState: StudentRunnerPageState;
  shareId: string;
}): StudentRunnerAttemptState {
  const assignment =
    pageState.status === 'ready' ? pageState.assignment : undefined;
  const runtimeItems =
    pageState.status === 'ready' ? pageState.runtimeItems : [];
  const completionSummary = getAttemptCompletionSummary({
    answers,
    runtimeItems,
  });
  const itemCount = completionSummary.itemCount;
  const canSubmit =
    pageState.status === 'ready' && pageState.canSubmit && itemCount > 0;
  const activeShareId = normalizeAssignmentShareSlug(
    assignment?.shareId ?? shareId
  );

  return {
    activeShareId,
    canSubmit,
    completionSummary,
    currentAttemptSessionKey:
      assignment && itemCount > 0
        ? buildStudentAttemptSessionKey({
            assignmentId: assignment.id,
            runtimeItems,
            shareSlug: activeShareId,
            templateType:
              pageState.status === 'ready'
                ? pageState.activity.templateType
                : undefined,
          })
        : undefined,
    itemCount,
    runtimeItems,
  };
}

export function buildStudentRunnerPageViewModel({
  anonymousToken,
  answers,
  attemptClock,
  confirmIncompleteSubmit,
  fallbackStartedAt,
  isSubmitting,
  pageState,
  result,
  shareId,
  submittedAttemptCount,
}: {
  anonymousToken?: string;
  answers: StudentAnswerMap;
  attemptClock?: StudentRunnerAttemptClock;
  confirmIncompleteSubmit: boolean;
  fallbackStartedAt: number;
  isSubmitting: boolean;
  pageState: StudentRunnerPageState;
  result?: StudentRunnerAttemptResult;
  shareId: string;
  submittedAttemptCount: number;
}): StudentRunnerPageViewModel {
  const attemptState = buildStudentRunnerAttemptState({
    answers,
    pageState,
    shareId,
  });
  const assignment =
    pageState.status === 'ready' ? pageState.assignment : undefined;
  const activity =
    pageState.status === 'ready' ? pageState.activity : undefined;
  const activeShareId = attemptState.activeShareId;
  const startedAt = getStudentRunnerAttemptStartedAt({
    activeShareId,
    attemptClock,
    fallbackStartedAt,
  });
  const timeLimitSeconds = assignment?.settings.timeLimitSeconds;
  const attemptTimer = buildAttemptTimerState({
    now: fallbackStartedAt,
    startedAt,
    timeLimitSeconds,
  });
  const activityRunnerCopy = activity
    ? getActivityTemplateRunnerCopy(activity.templateType)
    : undefined;
  const runnerCopy = getStudentRunnerCopy();
  const completionCopy = buildAttemptCompletionCopy({
    completionSummary: attemptState.completionSummary,
    confirmIncompleteSubmit,
    progressVerb: activityRunnerCopy?.progressVerb,
  });
  const progressView = buildStudentAttemptProgressView({
    completionSummary: attemptState.completionSummary,
    verb: activityRunnerCopy?.progressVerb,
  });
  const attemptResultDisplay = result
    ? buildStudentAttemptResultDisplay({
        accuracy: result.accuracy,
        durationSeconds: result.durationSeconds,
        earnedPoints: result.earnedPoints,
        fallbackDurationSeconds: attemptTimer.durationSeconds,
        totalPoints: result.totalPoints,
      })
    : undefined;
  const attemptControlState = buildStudentAttemptControlState({
    canSubmit: attemptState.canSubmit,
    hasResult: Boolean(result),
    isSubmitting,
    timeExpired: attemptTimer.timeExpired,
    unansweredLabel: completionCopy.unansweredLabel,
  });
  const attemptTimerBadge = buildStudentAttemptTimerBadge({
    remainingSeconds: attemptTimer.remainingSeconds,
    timeExpired: attemptTimer.timeExpired,
    timeLimitSeconds,
  });
  const attemptUsageLabel = result
    ? formatStudentAttemptUsageLabel(result.attemptUsage)
    : undefined;
  const effectiveSubmittedAttemptCount =
    resolveStudentRunnerSubmittedAttemptCount({
      result,
      submittedAttemptCount,
    });
  const requiresIncompleteSubmitConfirmation = Boolean(
    confirmIncompleteSubmit && attemptControlState.unansweredLabel
  );
  const submitConfirmationMessage = requiresIncompleteSubmitConfirmation
    ? completionCopy.confirmIncompleteSubmit
    : undefined;
  const currentPayloadSummary = buildStudentRunnerCurrentPayloadSummary({
    activeShareId,
    attemptState,
  });
  const currentPayloadSummaryView =
    buildStudentRunnerSubmissionPayloadSummaryView(currentPayloadSummary);
  const submissionValidationHandoffView =
    buildAssignmentSubmissionValidationHandoffView(
      buildAssignmentSubmissionValidationHandoffEvidence({
        clientPayloadUsesRuntimeItems: true,
        clientProgressUsesRuntimeItems: true,
        publicPayloadExcludesTeacherAnswers: true,
        runtimeItems: attemptState.runtimeItems,
        runtimeSourceUsesFrozenItems: pageState.status === 'ready',
        submittedAnswerCount: currentPayloadSummary.answerCount,
        teacherResultsUseStoredScoredAnswers: true,
      })
    );
  const submitReadinessView = buildStudentRunnerSubmitReadinessView({
    attemptControlState,
    hasResult: Boolean(result),
    isSubmitting,
    payloadSummary: currentPayloadSummary,
    requiresIncompleteSubmitConfirmation,
  });
  const identityView = assignment
    ? buildStudentRunnerIdentityView({
        anonymousToken,
        collectStudentName: assignment.settings.collectStudentName,
        isSubmitting,
        submittedAttemptCount: effectiveSubmittedAttemptCount,
      })
    : undefined;
  const headerView =
    assignment && pageState.status === 'ready'
      ? buildStudentRunnerHeaderView({
          assignment,
          itemCount: attemptState.itemCount,
          source: pageState.source,
        })
      : undefined;
  const revealAnswers = Boolean(
    result && assignment?.settings.showCorrectAnswers
  );
  const showStartAnotherAttempt = canStartAnotherStudentAttempt({
    canSubmit: attemptState.canSubmit,
    hasResult: Boolean(result),
    maxAttempts:
      result?.attemptUsage.maxAttempts ?? assignment?.settings.maxAttempts,
    submittedAttemptCount: effectiveSubmittedAttemptCount,
  });
  const resultPanelView = buildStudentRunnerResultPanelView({
    assignment,
    attemptResultDisplay,
    attemptUsageLabel,
    reviewItems: result?.reviewItems,
    reviewSummary: result?.reviewSummary,
    showStartAnotherAttempt,
  });
  const attemptLimitHandoffView = buildAssignmentAttemptLimitHandoffView(
    buildAssignmentAttemptLimitHandoffEvidence({
      attemptUsage: result?.attemptUsage,
      attemptUsageLabel,
      deliverySummaryUsesAttemptLimit: Boolean(
        headerView?.ruleSummaryView.items.some(
          (item) => item.id === 'attempt-limit'
        )
      ),
      identityMode: identityView?.mode ?? 'unknown',
      maxAttempts:
        result?.attemptUsage.maxAttempts ?? assignment?.settings.maxAttempts,
      resultExportUsesAttemptLimit: true,
      retryAvailable: showStartAnotherAttempt,
      runnerResultUsesAttemptUsage:
        !result ||
        Boolean(resultPanelView.show && resultPanelView.attemptUsageLabel),
      serverEnforcesLimit: true,
      submittedAttemptCount: effectiveSubmittedAttemptCount,
      submissionGateUsesLimitHelper: true,
    })
  );
  const submissionContractView = buildStudentRunnerSubmissionContractView({
    identityView,
    payloadSummaryView: currentPayloadSummaryView,
    resultPanelView,
    submitReadinessView,
    timerBadge: attemptTimerBadge,
  });
  const submissionHandoffView = buildStudentRunnerSubmissionHandoffView({
    activeShareId,
    attemptResultDisplay,
    attemptState,
    attemptTimer,
    identityView,
    payloadSummaryView: currentPayloadSummaryView,
    progressView,
    resultPanelView,
    submitReadinessView,
    timerBadge: attemptTimerBadge,
    timeLimitSeconds,
  });
  const startHandoffView = headerView
    ? buildStudentRunnerStartHandoffView({
        activeShareId,
        canSubmit: attemptState.canSubmit,
        headerView,
        identityView,
        source: pageState.status === 'ready' ? pageState.source : undefined,
      })
    : undefined;

  return {
    activeShareId,
    activity,
    anonymousAttemptCopy: buildAnonymousAttemptCopy({
      browserLabel: assignment?.settings.collectStudentName
        ? undefined
        : getAnonymousBrowserLabel(anonymousToken),
    }),
    assignment,
    attemptLimitHandoffView,
    attemptControlState,
    attemptResultDisplay,
    attemptState,
    attemptTimer,
    attemptTimerBadge,
    attemptUsageLabel,
    completionCopy,
    controlView: {
      attemptRegionDescription: m.student_runner_attempt_region_description(),
      attemptRegionLabel: m.student_runner_attempt_region_label(),
      payloadSummaryView: currentPayloadSummaryView,
      progressDescription: m.student_runner_progress_description({
        progress: progressView.label,
      }),
      progressLabel: progressView.label,
      progressView,
      readOnlyMessage: attemptControlState.readOnlyMessage,
      requiresIncompleteSubmitConfirmation,
      runnerTitle: activityRunnerCopy?.title ?? '',
      runtimeItemsDisabled: attemptControlState.runtimeItemsDisabled,
      showTimeExpiredMessage: attemptControlState.showTimeExpiredMessage,
      statusBarLabel: m.student_runner_status_bar_label(),
      submitButtonLabel:
        attemptControlState.submitButtonLabel ??
        completionCopy.submitButtonLabel,
      submitButtonAriaLabel: runnerCopy.submitButtonAriaLabel({
        label:
          attemptControlState.submitButtonLabel ??
          completionCopy.submitButtonLabel,
        progress: progressView.label,
      }),
      submitControlsLabel: runnerCopy.submitControlsLabel,
      submitConfirmationMessage,
      submitDisabled: attemptControlState.submitDisabled,
      submitHintViews: buildStudentRunnerSubmitHintViews({
        readOnlyMessage: attemptControlState.readOnlyMessage,
        submitConfirmationMessage,
        unansweredLabel: attemptControlState.unansweredLabel,
      }),
      submitReadinessView,
      timeExpiredNoticeLabel: m.student_runner_time_expired_notice_label(),
      timeExpiredMessage: runnerCopy.timeExpiredMessage,
      timerBadge: attemptTimerBadge,
      unansweredLabel: attemptControlState.unansweredLabel,
    },
    currentAttemptSessionKey: attemptState.currentAttemptSessionKey,
    headerView,
    identityView,
    itemCount: attemptState.itemCount,
    loadingView: {
      message: runnerCopy.loadingMessage,
    },
    missingReason:
      pageState.status === 'missing' ? pageState.reason : undefined,
    missingView:
      pageState.status === 'missing'
        ? buildStudentRunnerMissingPageView(
            pageState.reason,
            pageState.unavailable
          )
        : undefined,
    previewView:
      activity && assignment && pageState.status === 'ready'
        ? {
            activity,
            assignment,
            hideAnswers: pageState.hidePreviewAnswers,
          }
        : undefined,
    resultPanelView,
    routeBadgeLabel: runnerCopy.publicRouteBadgeLabel,
    runtimeListView: {
      disabled: attemptControlState.runtimeItemsDisabled,
      items: attemptState.runtimeItems,
      language: activity?.content.language,
      revealAnswer: revealAnswers,
      reviewItems: result?.reviewItems,
      templateType: activity?.templateType ?? 'quiz',
    },
    showStartAnotherAttempt,
    startedAt,
    startHandoffView,
    submissionContractView,
    submissionHandoffView,
    submissionValidationHandoffView,
    submissionSuccessMessage: runnerCopy.submissionSuccessMessage,
    timeLimitSeconds,
  };
}

export function buildStudentRunnerSubmitHintViews({
  readOnlyMessage,
  submitConfirmationMessage,
  unansweredLabel,
}: {
  readOnlyMessage?: string;
  submitConfirmationMessage?: string;
  unansweredLabel?: string;
}): StudentRunnerSubmitHintView[] {
  return [
    buildStudentRunnerSubmitHintView({
      id: 'unanswered',
      text: unansweredLabel,
    }),
    buildStudentRunnerSubmitHintView({
      id: 'confirm-incomplete',
      text: submitConfirmationMessage,
    }),
    buildStudentRunnerSubmitHintView({
      id: 'read-only',
      text: readOnlyMessage,
    }),
  ].flatMap((hintView) => (hintView ? [hintView] : []));
}

function buildStudentRunnerSubmitHintView({
  id,
  text,
}: {
  id: StudentRunnerSubmitHintId;
  text?: string;
}): StudentRunnerSubmitHintView | null {
  const normalizedText = normalizeRuntimeDisplayText(text);
  if (!normalizedText) return null;

  return {
    ariaLabel: getStudentRunnerSubmitHintAriaLabel({
      id,
      text: normalizedText,
    }),
    id,
    text: normalizedText,
    tone: id === 'confirm-incomplete' ? 'warning' : 'info',
  };
}

function getStudentRunnerSubmitHintAriaLabel({
  id,
  text,
}: {
  id: StudentRunnerSubmitHintId;
  text: string;
}) {
  const runnerCopy = getStudentRunnerCopy();

  if (id === 'confirm-incomplete') {
    return runnerCopy.submitHintConfirmIncompleteAriaLabel({ hint: text });
  }

  if (id === 'read-only') {
    return runnerCopy.submitHintReadOnlyAriaLabel({ hint: text });
  }

  return runnerCopy.submitHintUnansweredAriaLabel({ hint: text });
}

export function buildStudentRunnerRouteState(
  pageView: StudentRunnerPageViewModel
): StudentRunnerRouteState {
  if (pageView.missingView) {
    return {
      missingView: pageView.missingView,
      pageView,
      reason: pageView.missingReason ?? 'not-found',
      status: 'missing',
    };
  }

  if (!pageView.activity && !pageView.assignment) {
    return {
      pageView,
      status: 'loading',
    };
  }

  const activity = pageView.activity;
  const assignment = pageView.assignment;
  const headerView = pageView.headerView;
  const identityView = pageView.identityView;
  const previewView = pageView.previewView;

  if (
    !activity ||
    !assignment ||
    !headerView ||
    !identityView ||
    !previewView
  ) {
    return {
      pageView,
      status: 'unavailable',
    };
  }

  return {
    activity,
    assignment,
    headerView,
    identityView,
    pageView,
    previewView,
    status: 'ready',
  };
}

function buildStudentRunnerMissingPageView(
  reason: StudentRunnerMissingReason,
  unavailable?: PublicAssignmentUnavailablePayload
): StudentRunnerMissingPageView {
  const runnerCopy = getStudentRunnerCopy();
  const missingView = buildStudentRunnerMissingView(reason, unavailable);

  return {
    badgeLabel: runnerCopy.publicRouteBadgeLabel,
    browseTemplatesLabel: runnerCopy.browseTemplatesLabel,
    description: missingView.description,
    reason: missingView.reason,
    scopeItems: missingView.scopeItems,
    title: missingView.title,
    ...(missingView.unavailable
      ? {
          unavailable: missingView.unavailable,
          unavailableSafetyView: buildStudentRunnerUnavailableSafetyView(
            missingView.unavailable
          ),
        }
      : {}),
  };
}

export function buildStudentRunnerUnavailableSafetyView(
  unavailable: PublicAssignmentUnavailablePayload
): StudentRunnerUnavailableSafetyView {
  return {
    description: m.student_runner_unavailable_safety_description(),
    items: buildStudentRunnerUnavailableSafetyItems(unavailable),
    title: m.student_runner_unavailable_safety_title(),
  };
}

function buildStudentRunnerUnavailableSafetyItems(
  unavailable: PublicAssignmentUnavailablePayload
): StudentRunnerUnavailableSafetyItemView[] {
  return [
    unavailable.contentPolicy.runtimeItemsHidden
      ? {
          description:
            m.student_runner_unavailable_safety_activity_content_description(),
          id: 'activity-content',
          label: m.student_runner_unavailable_safety_activity_content_label(),
          value: m.student_runner_unavailable_safety_activity_content_value(),
        }
      : null,
    unavailable.contentPolicy.answerKeysHidden &&
    unavailable.contentPolicy.explanationsHidden
      ? {
          description:
            m.student_runner_unavailable_safety_answer_feedback_description(),
          id: 'answer-feedback',
          label: m.student_runner_unavailable_safety_answer_feedback_label(),
          value: m.student_runner_unavailable_safety_answer_feedback_value(),
        }
      : null,
    unavailable.identityPolicy.browserLabelHidden &&
    unavailable.identityPolicy.rawAnonymousTokenHidden
      ? {
          description:
            m.student_runner_unavailable_safety_browser_identity_description(),
          id: 'browser-identity',
          label: m.student_runner_unavailable_safety_browser_identity_label(),
          value: m.student_runner_unavailable_safety_browser_identity_value(),
        }
      : null,
    unavailable.contentPolicy.teacherMaterialsHidden
      ? {
          description:
            m.student_runner_unavailable_safety_source_materials_description(),
          id: 'source-materials',
          label: m.student_runner_unavailable_safety_source_materials_label(),
          value: m.student_runner_unavailable_safety_source_materials_value(),
        }
      : null,
    unavailable.submissionPolicy.submissionsBlocked
      ? {
          description:
            m.student_runner_unavailable_safety_submissions_description(),
          id: 'submissions',
          label: m.student_runner_unavailable_safety_submissions_label(),
          value: m.student_runner_unavailable_safety_submissions_value(),
        }
      : null,
  ].flatMap((item) => (item ? [item] : []));
}

export function buildStudentRunnerStartHandoffView({
  activeShareId,
  canSubmit,
  headerView,
  identityView,
  source,
}: {
  activeShareId: string;
  canSubmit: boolean;
  headerView: StudentRunnerHeaderView;
  identityView?: StudentRunnerIdentityView;
  source?: StudentRunnerReadyStateSource;
}): StudentRunnerStartHandoffView {
  const itemViews = STUDENT_RUNNER_START_HANDOFF_ITEM_IDS.map((id) =>
    buildStudentRunnerStartHandoffItemView(
      buildStudentRunnerStartHandoffItem({
        activeShareId,
        canSubmit,
        headerView,
        id,
        identityView,
        source,
      })
    )
  );

  return {
    description: m.student_runner_start_handoff_description(),
    itemViews,
    privacy: buildStudentRunnerStartHandoffPrivacyContract({
      headerView,
      itemViews,
    }),
    title: m.student_runner_start_handoff_title(),
  };
}

function buildStudentRunnerStartHandoffItem({
  activeShareId,
  canSubmit,
  headerView,
  id,
  identityView,
  source,
}: {
  activeShareId: string;
  canSubmit: boolean;
  headerView: StudentRunnerHeaderView;
  id: StudentRunnerStartHandoffItemId;
  identityView?: StudentRunnerIdentityView;
  source?: StudentRunnerReadyStateSource;
}): Omit<StudentRunnerStartHandoffItemView, 'ariaLabel'> {
  if (id === 'share-link') {
    return {
      description: m.student_runner_start_handoff_share_description(),
      id,
      label: m.public_assignment_access_handoff_share_label(),
      value:
        normalizeAssignmentShareSlug(activeShareId) ||
        m.public_assignment_access_handoff_missing_value(),
    };
  }

  if (id === 'assignment-title') {
    return {
      description: m.student_runner_start_handoff_title_description(),
      id,
      label: m.public_assignment_access_handoff_title_label(),
      value: headerView.title,
    };
  }

  if (id === 'runner-source') {
    return {
      description: m.student_runner_start_handoff_source_description(),
      id,
      label: m.student_runner_start_handoff_source_label(),
      value: formatStudentRunnerStartHandoffSource(source),
    };
  }

  if (id === 'source-boundary') {
    return {
      description: m.student_runner_start_handoff_source_boundary_description(),
      id,
      label: m.student_runner_start_handoff_source_boundary_label(),
      value: formatStudentRunnerStartHandoffSource(source),
    };
  }

  if (id === 'runtime-availability') {
    return {
      description: m.student_runner_start_handoff_runtime_description(),
      id,
      label: m.student_runner_start_handoff_runtime_label(),
      value: formatStudentRunnerStartRuntimeAvailability({
        canSubmit,
        source,
      }),
    };
  }

  if (id === 'submit-gate') {
    return {
      description: m.student_runner_start_handoff_submit_gate_description(),
      id,
      label: m.student_runner_start_handoff_submit_gate_label(),
      value: formatStudentRunnerStartRuntimeAvailability({
        canSubmit,
        source,
      }),
    };
  }

  if (id === 'read-only-state') {
    return {
      description: m.student_runner_start_handoff_read_only_description(),
      id,
      label: m.student_runner_start_handoff_read_only_label(),
      value: formatStudentRunnerStartReadOnlyState({ canSubmit, source }),
    };
  }

  if (id === 'rule-status') {
    return {
      description: headerView.ruleSummaryView.status.description,
      id,
      label: m.student_runner_start_handoff_rule_status_label(),
      value: headerView.ruleSummaryView.status.label,
    };
  }

  if (id === 'rule-count') {
    return {
      description: m.student_runner_start_handoff_rule_count_description(),
      id,
      label: m.student_runner_start_handoff_rule_count_label(),
      value: m.student_runner_start_handoff_rule_count_value({
        count: headerView.ruleSummaryView.summary.ruleCount,
      }),
    };
  }

  if (id === 'item-count') {
    return buildStudentRunnerStartRuleHandoffItem(headerView, id, 'items');
  }

  if (id === 'attempt-limit') {
    return buildStudentRunnerStartRuleHandoffItem(headerView, id, 'attempts');
  }

  if (id === 'timer-policy') {
    return buildStudentRunnerStartRuleHandoffItem(headerView, id, 'timer');
  }

  if (id === 'timer-start-boundary') {
    return {
      description: m.student_runner_start_handoff_timer_start_description(),
      id,
      label: m.student_runner_start_handoff_timer_start_label(),
      value: headerView.ruleSummaryView.summary.hasTimer
        ? m.student_runner_start_handoff_timer_start_after_load_value()
        : m.student_runner_start_handoff_timer_start_no_timer_value(),
    };
  }

  if (id === 'close-time') {
    return buildStudentRunnerStartRuleHandoffItem(headerView, id, 'closes');
  }

  if (id === 'identity-mode') {
    return buildStudentRunnerStartRuleHandoffItem(headerView, id, 'identity');
  }

  if (id === 'identity-privacy') {
    return {
      description:
        m.student_runner_start_handoff_identity_privacy_description(),
      id,
      label: m.student_runner_start_handoff_identity_privacy_label(),
      value: formatStudentRunnerStartIdentityPrivacy(identityView),
    };
  }

  if (id === 'review-behavior') {
    return buildStudentRunnerStartRuleHandoffItem(
      headerView,
      id,
      'answerReveal'
    );
  }

  if (id === 'item-order') {
    return buildStudentRunnerStartRuleHandoffItem(headerView, id, 'itemOrder');
  }

  if (id === 'instructions') {
    return {
      description: m.student_runner_start_handoff_instructions_description(),
      id,
      label:
        headerView.instructions?.label ??
        m.assignment_delivery_label_instructions(),
      value:
        headerView.instructions?.value ??
        m.student_runner_start_handoff_no_instructions_value(),
    };
  }

  if (id === 'prepare-review-rules') {
    return buildStudentRunnerStartPrepareHandoffItem(
      headerView,
      id,
      'review-rules'
    );
  }

  if (id === 'prepare-identity') {
    return buildStudentRunnerStartPrepareHandoffItem(
      headerView,
      id,
      headerView.ruleSummaryView.summary.collectsStudentName
        ? 'student-name'
        : 'anonymous'
    );
  }

  if (id === 'prepare-timer') {
    return buildStudentRunnerStartPrepareHandoffItem(
      headerView,
      id,
      headerView.ruleSummaryView.summary.hasTimer ? 'timer' : 'no-timer'
    );
  }

  if (id === 'prepare-submit') {
    return buildStudentRunnerStartPrepareHandoffItem(headerView, id, 'submit');
  }

  if (id === 'prepare-step-count') {
    return {
      description: m.student_runner_start_handoff_prepare_count_description(),
      id,
      label: m.student_runner_start_handoff_prepare_count_label(),
      value: m.student_runner_start_handoff_prepare_count_value({
        count: headerView.prepareView.stepViews.length,
      }),
    };
  }

  if (id === 'browser-label') {
    return buildStudentRunnerStartBrowserLabelItem(identityView);
  }

  if (id === 'teacher-action') {
    return {
      description: m.student_runner_start_handoff_teacher_action_description(),
      id,
      label: m.student_runner_start_handoff_teacher_action_label(),
      value: headerView.teacherAction.label,
    };
  }

  if (id === 'runtime-content-guard') {
    return {
      description: m.student_runner_start_handoff_runtime_content_description(),
      id,
      label: m.student_runner_start_handoff_runtime_content_label(),
      value: m.student_runner_start_handoff_runtime_content_value(),
    };
  }

  if (id === 'answer-key-guard') {
    return {
      description: m.student_runner_start_handoff_answer_key_description(),
      id,
      label: m.student_runner_start_handoff_answer_key_label(),
      value: m.student_runner_start_handoff_answer_key_value(),
    };
  }

  if (id === 'student-data-guard') {
    return {
      description: m.student_runner_start_handoff_student_data_description(),
      id,
      label: m.student_runner_start_handoff_student_data_label(),
      value: m.student_runner_start_handoff_student_data_value(),
    };
  }

  return {
    description: m.student_runner_start_handoff_privacy_description(),
    id,
    label: m.student_runner_start_handoff_privacy_label(),
    value: m.student_runner_start_handoff_private_data_omitted_value(),
  };
}

function buildStudentRunnerStartRuleHandoffItem(
  headerView: StudentRunnerHeaderView,
  id: StudentRunnerStartHandoffItemId,
  ruleId: PublicAssignmentRuleSummaryId
): Omit<StudentRunnerStartHandoffItemView, 'ariaLabel'> {
  const ruleItem = headerView.ruleSummaryView.items.find(
    (item) => item.id === ruleId
  );

  if (ruleItem) {
    return {
      description: ruleItem.description,
      id,
      label: ruleItem.label,
      value: ruleItem.value,
    };
  }

  return {
    description: m.student_runner_start_handoff_rule_missing_description(),
    id,
    label: m.student_runner_start_handoff_rule_status_label(),
    value: m.public_assignment_access_handoff_missing_value(),
  };
}

function buildStudentRunnerStartPrepareHandoffItem(
  headerView: StudentRunnerHeaderView,
  id: StudentRunnerStartHandoffItemId,
  stepId: StudentRunnerPrepareStepId
): Omit<StudentRunnerStartHandoffItemView, 'ariaLabel'> {
  const stepView = headerView.prepareView.stepViews.find(
    (step) => step.id === stepId
  );

  if (stepView) {
    return {
      description: stepView.description,
      id,
      label: stepView.label,
      value: m.student_runner_start_handoff_prepare_ready_value(),
    };
  }

  return {
    description: m.student_runner_start_handoff_prepare_missing_description(),
    id,
    label: headerView.prepareView.title,
    value: m.public_assignment_access_handoff_missing_value(),
  };
}

function buildStudentRunnerStartBrowserLabelItem(
  identityView?: StudentRunnerIdentityView
): Omit<StudentRunnerStartHandoffItemView, 'ariaLabel'> {
  if (identityView?.mode === 'anonymous') {
    return {
      description: m.student_runner_start_handoff_browser_description(),
      id: 'browser-label',
      label: m.student_runner_start_handoff_browser_label(),
      value: identityView.copy.browserLabel,
    };
  }

  if (identityView?.mode === 'student-name') {
    return {
      description: identityView.description,
      id: 'browser-label',
      label: m.student_runner_start_handoff_browser_label(),
      value: m.student_runner_start_handoff_student_name_entry_value(),
    };
  }

  return {
    description: m.student_runner_start_handoff_browser_missing_description(),
    id: 'browser-label',
    label: m.student_runner_start_handoff_browser_label(),
    value: m.public_assignment_access_handoff_missing_value(),
  };
}

function buildStudentRunnerStartHandoffItemView({
  description,
  id,
  label,
  value,
}: Omit<
  StudentRunnerStartHandoffItemView,
  'ariaLabel'
>): StudentRunnerStartHandoffItemView {
  return {
    ariaLabel: m.student_runner_start_handoff_item_aria({
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

function buildStudentRunnerStartHandoffPrivacyContract({
  headerView,
  itemViews,
}: {
  headerView: StudentRunnerHeaderView;
  itemViews: StudentRunnerStartHandoffItemView[];
}): StudentRunnerStartHandoffPrivacyContract {
  return {
    exposesAnonymousToken: false,
    exposesAnswerText: false,
    exposesRuntimeChoiceText: false,
    exposesRuntimeItemIds: false,
    exposesRuntimePromptText: false,
    exposesStudentName: false,
    exposesTeacherOnlyAnswers: false,
    exposesTeacherSourceMaterials: false,
    itemIds: itemViews.map((item) => item.id),
    prepareStepIds: headerView.prepareView.stepViews.map((step) => step.id),
    ruleIds: headerView.ruleSummaryView.summary.ruleIds,
  };
}

function formatStudentRunnerStartHandoffSource(
  source?: StudentRunnerReadyStateSource
) {
  if (source === 'public-assignment') {
    return m.student_runner_start_handoff_source_public_value();
  }

  if (source === 'starter-preview') {
    return m.student_runner_start_handoff_source_starter_value();
  }

  return m.public_assignment_access_handoff_missing_value();
}

function formatStudentRunnerStartReadOnlyState({
  canSubmit,
  source,
}: {
  canSubmit: boolean;
  source?: StudentRunnerReadyStateSource;
}) {
  if (canSubmit) {
    return m.student_runner_start_handoff_read_only_submittable_value();
  }

  if (source === 'starter-preview') {
    return m.student_runner_start_handoff_read_only_preview_value();
  }

  return m.student_runner_start_handoff_read_only_blocked_value();
}

function formatStudentRunnerStartRuntimeAvailability({
  canSubmit,
  source,
}: {
  canSubmit: boolean;
  source?: StudentRunnerReadyStateSource;
}) {
  if (canSubmit) {
    return m.student_runner_start_handoff_runtime_ready_value();
  }

  if (source === 'starter-preview') {
    return m.student_runner_start_handoff_runtime_preview_value();
  }

  return m.student_runner_start_handoff_runtime_blocked_value();
}

function formatStudentRunnerStartIdentityPrivacy(
  identityView?: StudentRunnerIdentityView
) {
  if (identityView?.mode === 'anonymous') {
    return m.student_runner_start_handoff_identity_privacy_token_hidden_value();
  }

  if (identityView?.mode === 'student-name') {
    return m.student_runner_start_handoff_identity_privacy_name_withheld_value();
  }

  return m.student_runner_start_handoff_identity_privacy_omitted_value();
}

function buildStudentRunnerIdentityView({
  anonymousToken,
  collectStudentName,
  isSubmitting,
  submittedAttemptCount,
}: {
  anonymousToken?: string;
  collectStudentName: boolean;
  isSubmitting: boolean;
  submittedAttemptCount: number;
}): StudentRunnerIdentityView {
  if (collectStudentName) {
    const runnerCopy = getStudentRunnerCopy();
    const disabled =
      isSubmitting ||
      normalizeStudentRunnerSubmittedAttemptCount(submittedAttemptCount) > 0;

    return {
      ariaLabel: m.student_runner_identity_region_label(),
      description: disabled
        ? runnerCopy.studentNameLockedDescription
        : runnerCopy.studentNameDescription,
      disabled,
      label: runnerCopy.studentNameLabel,
      mode: 'student-name',
      placeholder: runnerCopy.studentNamePlaceholder,
    };
  }

  return {
    ariaLabel: m.student_runner_identity_region_label(),
    copy: buildAnonymousAttemptCopy({
      browserLabel: getAnonymousBrowserLabel(anonymousToken),
    }),
    mode: 'anonymous',
  };
}

function normalizeStudentRunnerSubmittedAttemptCount(value: number) {
  return normalizeAssignmentAttemptCount(value);
}

function normalizeStudentRunnerSuccessfulAttemptCount(value: number) {
  return Math.max(1, normalizeStudentRunnerSubmittedAttemptCount(value));
}

function resolveStudentRunnerSubmittedAttemptCount({
  result,
  submittedAttemptCount,
}: {
  result?: StudentRunnerAttemptResult;
  submittedAttemptCount: number;
}) {
  const currentCount = normalizeStudentRunnerSubmittedAttemptCount(
    submittedAttemptCount
  );

  if (!result) return currentCount;

  return Math.max(
    currentCount,
    normalizeStudentRunnerSuccessfulAttemptCount(
      result.attemptUsage.usedAttempts
    )
  );
}

function buildStudentRunnerResultPanelView({
  assignment,
  attemptResultDisplay,
  attemptUsageLabel,
  reviewItems,
  reviewSummary,
  showStartAnotherAttempt,
}: {
  assignment?: AssignmentSeed;
  attemptResultDisplay?: StudentAttemptResultDisplay;
  attemptUsageLabel?: string;
  reviewItems?: PublicAttemptReviewItem[];
  reviewSummary?: PublicAttemptReviewSummary;
  showStartAnotherAttempt: boolean;
}): StudentRunnerResultPanelView {
  if (!attemptResultDisplay || !reviewSummary) {
    return { show: false };
  }

  const runnerCopy = getStudentRunnerCopy();

  return {
    ariaLabel: m.student_runner_result_region_label(),
    accuracyLabel: attemptResultDisplay.accuracyLabel,
    attemptUsageLabel,
    durationLabel: attemptResultDisplay.durationLabel,
    durationView: attemptResultDisplay.durationView,
    feedbackScopeView: buildStudentAttemptFeedbackScopeView({
      reviewItems: reviewItems ?? [],
      summary: reviewSummary,
    }),
    nextStepsView: buildStudentAttemptResultNextStepsView({
      canStartAnotherAttempt: showStartAnotherAttempt,
      showCorrectAnswers: Boolean(assignment?.settings.showCorrectAnswers),
    }),
    reviewSummaryView: buildStudentAttemptReviewSummaryView({
      summary: reviewSummary,
    }),
    scoreAriaLabel: attemptResultDisplay.scoreAriaLabel,
    scoreLabel: attemptResultDisplay.scoreLabel,
    show: true,
    showStartAnotherAttempt,
    startAnotherAttemptAriaLabel: runnerCopy.startAnotherAttemptAriaLabel,
    startAnotherAttemptDescription: runnerCopy.startAnotherAttemptDescription,
    startAnotherAttemptLabel: runnerCopy.startAnotherAttemptLabel,
    statusLabel: runnerCopy.resultSubmittedLabel,
  };
}

export function buildStudentRunnerAttemptClock({
  activeShareId,
  now,
}: {
  activeShareId: string;
  now: number;
}): StudentRunnerAttemptClock {
  return {
    shareId: normalizeAssignmentShareSlug(activeShareId),
    startedAt: now,
  };
}

export function buildStudentRunnerTimerTickPlan({
  activeShareId,
  attemptClock,
  canSubmit,
  hasResult,
  timeExpired,
  timeLimitSeconds,
}: {
  activeShareId: string;
  attemptClock?: StudentRunnerAttemptClock;
  canSubmit: boolean;
  hasResult: boolean;
  timeExpired: boolean;
  timeLimitSeconds?: number;
}): StudentRunnerTimerTickPlan {
  if (
    hasResult ||
    timeExpired ||
    !timeLimitSeconds ||
    !canSubmit ||
    normalizeAssignmentShareSlug(attemptClock?.shareId ?? '') !==
      normalizeAssignmentShareSlug(activeShareId)
  ) {
    return { type: 'skip' };
  }

  return {
    intervalMs: ASSIGNMENT_ATTEMPT_DURATION_UNITS.millisecondsPerSecond,
    type: 'tick',
  };
}

export function buildStudentRunnerAttemptResetState(): StudentRunnerAttemptResetState {
  return {
    answers: {},
    anonymousToken: undefined,
    attemptClock: undefined,
    confirmIncompleteSubmit: false,
    studentName: '',
    submittedAttemptCount: 0,
  };
}

export function buildStudentRunnerAttemptSessionResetPlan({
  attemptSessionKey,
  currentAttemptSessionKey,
}: {
  attemptSessionKey?: string;
  currentAttemptSessionKey?: string;
}): StudentRunnerAttemptSessionResetPlan {
  if (!currentAttemptSessionKey) return { type: 'skip' };

  if (
    !shouldResetStudentRunnerAttemptSession({
      attemptSessionKey,
      currentAttemptSessionKey,
    })
  ) {
    return { type: 'skip' };
  }

  return {
    ...buildStudentRunnerAttemptResetState(),
    nextAttemptSessionKey: currentAttemptSessionKey,
    result: undefined,
    type: 'reset',
  };
}

export function buildStudentRunnerAttemptRestartPlan({
  now,
}: {
  now: number;
}): StudentRunnerAttemptRestartPlan {
  const resetState = buildStudentRunnerAttemptResetState();

  return {
    answers: resetState.answers,
    attemptClock: resetState.attemptClock,
    confirmIncompleteSubmit: resetState.confirmIncompleteSubmit,
    result: undefined,
    startedAt: now,
  };
}

export function buildStudentRunnerAttemptClockStartPlan({
  activeShareId,
  attemptClock,
  canSubmit,
  hasResult,
  now,
}: {
  activeShareId: string;
  attemptClock?: StudentRunnerAttemptClock;
  canSubmit: boolean;
  hasResult: boolean;
  now: number;
}): StudentRunnerAttemptClockStartPlan {
  if (
    !shouldStartStudentRunnerAttemptClock({
      activeShareId,
      attemptClock,
      canSubmit,
      hasResult,
    })
  ) {
    return { type: 'skip' };
  }

  return {
    attemptClock: buildStudentRunnerAttemptClock({
      activeShareId,
      now,
    }),
    now,
    type: 'start',
  };
}

export function buildStudentRunnerSubmissionResultState({
  response,
}: {
  response: StudentRunnerAttemptSubmissionResponse;
}): StudentRunnerAttemptResult {
  return {
    ...response.result,
    attemptUsage: response.attemptUsage,
    reviewSummary:
      response.reviewSummary ??
      buildStudentRunnerFallbackReviewSummary(response.reviewItems),
    reviewItems: response.reviewItems,
  };
}

function buildStudentRunnerFallbackReviewSummary(
  reviewItems: PublicAttemptReviewItem[]
): PublicAttemptReviewSummary {
  return summarizePublicAttemptReviewItemsForTotal({
    items: reviewItems,
    showCorrectAnswers: reviewItems.length > 0,
    totalItemCount: reviewItems.length,
  });
}

export function buildStudentRunnerSubmissionSuccessState({
  executionPlan,
  response,
}: {
  executionPlan: Extract<
    StudentRunnerSubmissionExecutionPlan,
    { type: 'submit' }
  >;
  response: StudentRunnerAttemptSubmissionResponse;
}): StudentRunnerSubmissionSuccessState {
  return {
    anonymousToken: executionPlan.anonymousToken,
    confirmIncompleteSubmit: false,
    result: buildStudentRunnerSubmissionResultState({ response }),
    submittedAttemptCount: normalizeStudentRunnerSuccessfulAttemptCount(
      response.attemptUsage.usedAttempts
    ),
    ...(executionPlan.submittedStudentName
      ? { submittedStudentName: executionPlan.submittedStudentName }
      : {}),
    successMessage: executionPlan.successMessage,
  };
}

export function buildStudentRunnerSubmissionPlan({
  anonymousToken,
  answers,
  confirmIncompleteSubmit,
  createAnonymousToken,
  now,
  pageView,
  studentName,
}: {
  anonymousToken?: string;
  answers: StudentAnswerMap;
  confirmIncompleteSubmit: boolean;
  createAnonymousToken: () => string;
  now: number;
  pageView: StudentRunnerPageViewModel;
  studentName: string;
}): StudentRunnerSubmissionPlan {
  return buildStudentAttemptSubmissionPlan({
    anonymousToken,
    answers,
    canSubmit:
      Boolean(pageView.activity) &&
      pageView.attemptState.canSubmit &&
      !pageView.attemptControlState.submitDisabled,
    collectStudentName: Boolean(
      pageView.assignment?.settings.collectStudentName
    ),
    completionSummary: pageView.attemptState.completionSummary,
    confirmIncompleteSubmit,
    createAnonymousToken,
    now,
    runtimeItems: pageView.runtimeListView.items,
    shareSlug: pageView.activeShareId,
    startedAt: pageView.startedAt,
    studentName,
    timeLimitSeconds: pageView.timeLimitSeconds,
  });
}

export function buildStudentRunnerSubmissionExecutionPlan({
  anonymousToken,
  answers,
  confirmIncompleteSubmit,
  createAnonymousToken,
  now,
  pageView,
  studentName,
}: {
  anonymousToken?: string;
  answers: StudentAnswerMap;
  confirmIncompleteSubmit: boolean;
  createAnonymousToken: () => string;
  now: number;
  pageView: StudentRunnerPageViewModel;
  studentName: string;
}): StudentRunnerSubmissionExecutionPlan {
  const submissionPlan = buildStudentRunnerSubmissionPlan({
    anonymousToken,
    answers,
    confirmIncompleteSubmit,
    createAnonymousToken,
    now,
    pageView,
    studentName,
  });

  if (submissionPlan.type !== 'submit') {
    return {
      message: submissionPlan.message,
      messageTone: getStudentRunnerSubmissionMessageTone(submissionPlan.type),
      nextConfirmIncompleteSubmit: submissionPlan.type === 'confirm-incomplete',
      reason: submissionPlan.reason,
      type: 'message',
    };
  }

  return {
    ...(submissionPlan.anonymousToken
      ? { anonymousToken: submissionPlan.anonymousToken }
      : {}),
    input: submissionPlan.input,
    ...buildStudentRunnerSubmissionPayloadSummaryExecutionViews({
      input: submissionPlan.input,
      pageView,
    }),
    reason: submissionPlan.reason,
    ...(submissionPlan.input.studentName
      ? { submittedStudentName: submissionPlan.input.studentName }
      : {}),
    successMessage: pageView.submissionSuccessMessage,
    type: 'submit',
  };
}

function buildStudentRunnerSubmissionPayloadSummaryExecutionViews({
  input,
  pageView,
}: {
  input: StudentAttemptSubmissionInput;
  pageView: StudentRunnerPageViewModel;
}) {
  const payloadSummary = buildStudentRunnerSubmissionPayloadSummary({
    input,
    pageView,
  });

  return {
    payloadSummary,
    payloadSummaryView:
      buildStudentRunnerSubmissionPayloadSummaryView(payloadSummary),
  };
}

function buildStudentRunnerSubmissionPayloadSummary({
  input,
  pageView,
}: {
  input: StudentAttemptSubmissionInput;
  pageView: StudentRunnerPageViewModel;
}): StudentRunnerSubmissionPayloadSummary {
  return {
    answerCount: input.answers.length,
    itemCount: pageView.attemptState.completionSummary.itemCount,
    shareSlug: input.shareSlug,
    unansweredItemCount:
      pageView.attemptState.completionSummary.unansweredItemCount,
  };
}

function buildStudentRunnerCurrentPayloadSummary({
  activeShareId,
  attemptState,
}: {
  activeShareId: string;
  attemptState: StudentRunnerAttemptState;
}): StudentRunnerSubmissionPayloadSummary {
  return {
    answerCount: attemptState.completionSummary.answeredItemCount,
    itemCount: attemptState.completionSummary.itemCount,
    shareSlug: activeShareId,
    unansweredItemCount: attemptState.completionSummary.unansweredItemCount,
  };
}

function buildStudentRunnerSubmissionPayloadSummaryView(
  summary: StudentRunnerSubmissionPayloadSummary
): StudentRunnerSubmissionPayloadSummaryView {
  const metrics = [
    buildStudentRunnerSubmissionPayloadSummaryMetricView({
      key: 'share-link',
      label: m.student_runner_payload_summary_share_label(),
      value: normalizeAssignmentShareSlug(summary.shareSlug),
      description: m.student_runner_payload_summary_share_description(),
    }),
    buildStudentRunnerSubmissionPayloadSummaryMetricView({
      key: 'items',
      label: m.student_runner_payload_summary_items_label(),
      value: formatStudentRunnerSubmissionPayloadCount(summary.itemCount),
      description: m.student_runner_payload_summary_items_description(),
    }),
    buildStudentRunnerSubmissionPayloadSummaryMetricView({
      key: 'answers',
      label: m.student_runner_payload_summary_answers_label(),
      value: formatStudentRunnerSubmissionPayloadCount(summary.answerCount),
      description: m.student_runner_payload_summary_answers_description(),
    }),
    buildStudentRunnerSubmissionPayloadSummaryMetricView({
      key: 'unanswered',
      label: m.student_runner_payload_summary_unanswered_label(),
      value: formatStudentRunnerSubmissionPayloadCount(
        summary.unansweredItemCount
      ),
      description: m.student_runner_payload_summary_unanswered_description(),
    }),
  ];

  return {
    ariaLabel: m.student_runner_payload_summary_aria_label(),
    description: m.student_runner_payload_summary_description(),
    metrics,
    privacy: buildStudentRunnerSubmissionPrivacyContract(metrics),
    title: m.student_runner_payload_summary_title(),
  };
}

export function buildStudentRunnerSubmissionContractView({
  identityView,
  payloadSummaryView,
  resultPanelView,
  submitReadinessView,
  timerBadge,
}: {
  identityView?: StudentRunnerIdentityView;
  payloadSummaryView: StudentRunnerSubmissionPayloadSummaryView;
  resultPanelView: StudentRunnerResultPanelView;
  submitReadinessView: StudentRunnerSubmitReadinessView;
  timerBadge: StudentAttemptTimerBadge;
}): StudentRunnerSubmissionContractView {
  const itemViews = [
    buildStudentRunnerSubmissionContractItemView({
      description: payloadSummaryView.description,
      id: 'payload-summary',
      label: payloadSummaryView.title,
      value: formatStudentRunnerSubmissionContractMetricSummary(
        payloadSummaryView.metrics
      ),
    }),
    buildStudentRunnerSubmissionContractItemView({
      description: submitReadinessView.description,
      id: 'submit-readiness',
      label: submitReadinessView.title,
      value: submitReadinessView.statusLabel,
    }),
    buildStudentRunnerSubmissionContractItemView(
      buildStudentRunnerIdentityContractItem(identityView)
    ),
    buildStudentRunnerSubmissionContractItemView({
      description: timerBadge.description,
      id: 'timer',
      label: timerBadge.ariaLabel,
      value: timerBadge.show
        ? timerBadge.label
        : getStudentRunnerCopy().timerOffDescription,
    }),
    buildStudentRunnerSubmissionContractItemView(
      buildStudentRunnerFeedbackContractItem(resultPanelView)
    ),
  ];

  return {
    description: payloadSummaryView.description,
    itemViews,
    privacy: payloadSummaryView.privacy,
    title: payloadSummaryView.title,
  };
}

export function buildStudentRunnerSubmissionHandoffView({
  activeShareId,
  attemptResultDisplay,
  attemptState,
  attemptTimer,
  identityView,
  payloadSummaryView,
  progressView,
  resultPanelView,
  submitReadinessView,
  timerBadge,
  timeLimitSeconds,
}: {
  activeShareId: string;
  attemptResultDisplay?: StudentAttemptResultDisplay;
  attemptState: {
    canSubmit: boolean;
    completionSummary: AttemptCompletionSummary;
    currentAttemptSessionKey?: string;
    itemCount: number;
  };
  attemptTimer: AttemptTimerState;
  identityView?: StudentRunnerIdentityView;
  payloadSummaryView: StudentRunnerSubmissionPayloadSummaryView;
  progressView: StudentAttemptProgressView;
  resultPanelView: StudentRunnerResultPanelView;
  submitReadinessView: StudentRunnerSubmitReadinessView;
  timerBadge: StudentAttemptTimerBadge;
  timeLimitSeconds?: number;
}): StudentRunnerSubmissionHandoffView {
  const shareMetric = getStudentRunnerSubmissionPayloadMetric(
    payloadSummaryView,
    'share-link'
  );
  const itemsMetric = getStudentRunnerSubmissionPayloadMetric(
    payloadSummaryView,
    'items'
  );
  const answersMetric = getStudentRunnerSubmissionPayloadMetric(
    payloadSummaryView,
    'answers'
  );
  const unansweredMetric = getStudentRunnerSubmissionPayloadMetric(
    payloadSummaryView,
    'unanswered'
  );
  const confirmationItem = getStudentRunnerSubmitReadinessItem(
    submitReadinessView,
    'incomplete-confirmation'
  );
  const submissionItem = getStudentRunnerSubmitReadinessItem(
    submitReadinessView,
    'submission-state'
  );
  const reviewSubmittedMetric = getStudentRunnerReviewSummaryMetric(
    resultPanelView,
    'submitted'
  );
  const reviewNeedsReviewMetric = getStudentRunnerReviewSummaryMetric(
    resultPanelView,
    'needs-review'
  );
  const reviewUnansweredMetric = getStudentRunnerReviewSummaryMetric(
    resultPanelView,
    'unanswered'
  );
  const feedbackVisibilityMetric = getStudentRunnerFeedbackScopeMetric(
    resultPanelView,
    'visibility'
  );
  const feedbackItemsMetric = getStudentRunnerFeedbackScopeMetric(
    resultPanelView,
    'item-feedback'
  );
  const feedbackAlternativesMetric = getStudentRunnerFeedbackScopeMetric(
    resultPanelView,
    'accepted-alternatives'
  );
  const feedbackExplanationsMetric = getStudentRunnerFeedbackScopeMetric(
    resultPanelView,
    'explanations'
  );
  const itemViews: StudentRunnerSubmissionHandoffItemView[] = [
    buildStudentRunnerSubmissionHandoffItemView({
      description: shareMetric.description,
      id: 'share-link',
      label: shareMetric.label,
      value: normalizeAssignmentShareSlug(activeShareId),
    }),
    buildStudentRunnerSubmissionHandoffItemView({
      description: itemsMetric.description,
      id: 'runtime-items',
      label: itemsMetric.label,
      value: itemsMetric.value,
    }),
    buildStudentRunnerSubmissionHandoffItemView({
      description: progressView.description,
      id: 'answered-items',
      label: answersMetric.label,
      value: formatStudentRunnerSubmissionPayloadCount(
        attemptState.completionSummary.answeredItemCount
      ),
    }),
    buildStudentRunnerSubmissionHandoffItemView({
      description: unansweredMetric.description,
      id: 'unanswered-items',
      label: unansweredMetric.label,
      value: unansweredMetric.value,
    }),
    buildStudentRunnerSubmissionHandoffItemView({
      description: progressView.description,
      id: 'progress',
      label: m.student_runner_status_bar_label(),
      value: progressView.label,
    }),
    buildStudentRunnerSubmissionHandoffItemView({
      description: payloadSummaryView.description,
      id: 'payload-summary',
      label: payloadSummaryView.title,
      value: formatStudentRunnerSubmissionContractMetricSummary(
        payloadSummaryView.metrics
      ),
    }),
    buildStudentRunnerSubmissionHandoffItemView({
      description: submitReadinessView.description,
      id: 'submit-readiness',
      label: submitReadinessView.title,
      value: submitReadinessView.statusLabel,
    }),
    buildStudentRunnerSubmissionHandoffItemView({
      description: confirmationItem.description,
      id: 'partial-confirmation',
      label: confirmationItem.label,
      value: confirmationItem.statusLabel,
    }),
    buildStudentRunnerSubmissionHandoffItemView({
      description: submissionItem.description,
      id: 'submission-state',
      label: submissionItem.label,
      value: submissionItem.statusLabel,
    }),
    buildStudentRunnerSubmissionHandoffItemView(
      buildStudentRunnerIdentityHandoffModeItem(identityView)
    ),
    buildStudentRunnerSubmissionHandoffItemView(
      buildStudentRunnerIdentityHandoffPrivacyItem(identityView)
    ),
    buildStudentRunnerSubmissionHandoffItemView({
      description: timerBadge.description,
      id: 'timer-status',
      label: m.assignment_delivery_label_timer(),
      value: timerBadge.show
        ? timerBadge.label
        : m.assignment_delivery_timer_none(),
    }),
    buildStudentRunnerSubmissionHandoffItemView({
      description: getStudentRunnerTimerLimitDescription(timeLimitSeconds),
      id: 'timer-limit',
      label: m.assignment_publish_dialog_time_limit_label(),
      value: formatStudentRunnerTimerLimitLabel(timeLimitSeconds),
    }),
    buildStudentRunnerSubmissionHandoffItemView({
      description:
        attemptResultDisplay?.durationView.description ??
        m.assignment_attempt_duration_display_description(),
      id: 'attempt-duration',
      label: m.assignment_result_table_header_time(),
      value: formatStudentRunnerCurrentAttemptDuration({
        attemptResultDisplay,
        attemptTimer,
      }),
    }),
    buildStudentRunnerSubmissionHandoffItemView({
      description: m.student_runner_timer_active_description(),
      id: 'attempt-clock',
      label: m.student_runner_prepare_step_timer_label(),
      value: formatStudentRunnerAttemptClockLabel({
        attemptState,
        attemptTimer,
      }),
    }),
    buildStudentRunnerSubmissionHandoffItemView({
      description: getStudentRunnerResultHandoffDescription(resultPanelView),
      id: 'result-status',
      label: m.student_runner_result_region_label(),
      value: resultPanelView.show
        ? resultPanelView.statusLabel
        : submitReadinessView.statusLabel,
    }),
    buildStudentRunnerSubmissionHandoffItemView({
      description: getStudentRunnerResultHandoffDescription(resultPanelView),
      id: 'score-summary',
      label: m.student_runner_result_region_label(),
      value: resultPanelView.show
        ? resultPanelView.scoreLabel
        : submitReadinessView.statusLabel,
    }),
    buildStudentRunnerSubmissionHandoffItemView({
      description: resultPanelView.show
        ? resultPanelView.scoreAriaLabel
        : m.student_runner_submission_handoff_result_pending_description(),
      id: 'result-accuracy',
      label: m.student_runner_submission_handoff_result_accuracy_label(),
      value: resultPanelView.show
        ? resultPanelView.accuracyLabel
        : m.student_runner_submission_handoff_not_submitted_value(),
    }),
    buildStudentRunnerSubmissionHandoffItemView({
      description: resultPanelView.show
        ? m.student_runner_submission_handoff_attempt_usage_description()
        : m.student_runner_submission_handoff_attempt_usage_pending_description(),
      id: 'attempt-usage',
      label: m.assignment_delivery_label_attempts(),
      value:
        resultPanelView.show && resultPanelView.attemptUsageLabel
          ? resultPanelView.attemptUsageLabel
          : m.student_runner_submission_handoff_not_submitted_value(),
    }),
    buildStudentRunnerSubmissionHandoffItemView({
      description: resultPanelView.show
        ? resultPanelView.startAnotherAttemptDescription
        : m.student_runner_submission_handoff_retry_pending_description(),
      id: 'retry-availability',
      label: m.student_runner_start_another_attempt(),
      value: formatStudentRunnerRetryAvailability(resultPanelView),
    }),
    buildStudentRunnerSubmissionHandoffItemView({
      description: resultPanelView.show
        ? resultPanelView.reviewSummaryView.description
        : getStudentRunnerCopy().resultNextStepReviewScore,
      id: 'review-summary',
      label: getStudentRunnerCopy().reviewSummaryTitle,
      value: resultPanelView.show
        ? formatStudentRunnerHandoffMetricSummary(
            resultPanelView.reviewSummaryView.metrics
          )
        : getStudentRunnerCopy().reviewSummaryReviewHiddenValue,
    }),
    buildStudentRunnerSubmissionHandoffItemView({
      description: reviewSubmittedMetric.description,
      id: 'review-submitted',
      label: reviewSubmittedMetric.label,
      value: reviewSubmittedMetric.value,
    }),
    buildStudentRunnerSubmissionHandoffItemView({
      description: reviewNeedsReviewMetric.description,
      id: 'review-needs-review',
      label: reviewNeedsReviewMetric.label,
      value: reviewNeedsReviewMetric.value,
    }),
    buildStudentRunnerSubmissionHandoffItemView({
      description: reviewUnansweredMetric.description,
      id: 'review-unanswered',
      label: reviewUnansweredMetric.label,
      value: reviewUnansweredMetric.value,
    }),
    buildStudentRunnerSubmissionHandoffItemView({
      description: resultPanelView.show
        ? resultPanelView.feedbackScopeView.description
        : getStudentRunnerCopy().resultNextStepReviewScore,
      id: 'feedback-scope',
      label: m.student_runner_feedback_scope_title(),
      value: resultPanelView.show
        ? resultPanelView.feedbackScopeView.statusLabel
        : getStudentRunnerCopy().reviewSummaryReviewHiddenValue,
    }),
    buildStudentRunnerSubmissionHandoffItemView({
      description: feedbackVisibilityMetric.description,
      id: 'feedback-visibility',
      label: feedbackVisibilityMetric.label,
      value: feedbackVisibilityMetric.value,
    }),
    buildStudentRunnerSubmissionHandoffItemView({
      description: feedbackItemsMetric.description,
      id: 'feedback-items',
      label: feedbackItemsMetric.label,
      value: feedbackItemsMetric.value,
    }),
    buildStudentRunnerSubmissionHandoffItemView({
      description:
        m.student_runner_submission_handoff_feedback_detail_evidence_description(),
      id: 'feedback-detail-evidence',
      label:
        m.student_runner_submission_handoff_feedback_detail_evidence_label(),
      value: m.student_runner_submission_handoff_feedback_detail_evidence_value(
        {
          alternatives: feedbackAlternativesMetric.value,
          explanations: feedbackExplanationsMetric.value,
        }
      ),
    }),
    buildStudentRunnerSubmissionHandoffItemView({
      description: getStudentRunnerResultHandoffDescription(resultPanelView),
      id: 'next-steps',
      label: getStudentRunnerCopy().resultNextStepsTitle,
      value: resultPanelView.show
        ? formatStudentRunnerHandoffStepSummary(
            resultPanelView.nextStepsView.stepViews
          )
        : getStudentRunnerCopy().resultNextStepReviewScore,
    }),
    buildStudentRunnerSubmissionHandoffItemView({
      description: m.student_runner_submission_handoff_privacy_description(),
      id: 'privacy-guard',
      label: m.student_runner_submission_handoff_privacy_label(),
      value: m.student_runner_submission_handoff_private_data_omitted_value(),
    }),
  ];

  return {
    description: m.student_runner_attempt_region_description(),
    itemViews,
    privacy: buildStudentRunnerSubmissionHandoffPrivacyContract({
      itemViews,
      payloadSummaryView,
      resultPanelView,
      submitReadinessView,
    }),
    title: m.student_runner_attempt_region_label(),
  };
}

function buildStudentRunnerIdentityContractItem(
  identityView: StudentRunnerIdentityView | undefined
): Omit<StudentRunnerSubmissionContractItemView, 'ariaLabel'> {
  if (!identityView) {
    return {
      description: '',
      id: 'identity',
      label: m.student_runner_identity_region_label(),
      value: '',
    };
  }

  if (identityView.mode === 'student-name') {
    return {
      description: identityView.description,
      id: 'identity',
      label: identityView.label,
      value: identityView.mode,
    };
  }

  return {
    description: identityView.copy.description,
    id: 'identity',
    label: identityView.copy.title,
    value: identityView.copy.browserLabel,
  };
}

function buildStudentRunnerFeedbackContractItem(
  resultPanelView: StudentRunnerResultPanelView
): Omit<StudentRunnerSubmissionContractItemView, 'ariaLabel'> {
  if (!resultPanelView.show) {
    return {
      description: getStudentRunnerCopy().resultNextStepReviewScore,
      id: 'feedback',
      label: getStudentRunnerCopy().reviewSummaryTitle,
      value: getStudentRunnerCopy().reviewSummaryReviewHiddenValue,
    };
  }

  return {
    description: resultPanelView.feedbackScopeView.description,
    id: 'feedback',
    label: resultPanelView.feedbackScopeView.title,
    value: resultPanelView.feedbackScopeView.statusLabel,
  };
}

function buildStudentRunnerIdentityHandoffModeItem(
  identityView: StudentRunnerIdentityView | undefined
): Omit<StudentRunnerSubmissionHandoffItemView, 'ariaLabel'> {
  if (!identityView) {
    return {
      description: '',
      id: 'identity-mode',
      label: m.student_runner_identity_region_label(),
      value: '',
    };
  }

  if (identityView.mode === 'student-name') {
    return {
      description: identityView.description,
      id: 'identity-mode',
      label: identityView.label,
      value: identityView.mode,
    };
  }

  return {
    description: identityView.copy.description,
    id: 'identity-mode',
    label: identityView.copy.title,
    value: identityView.mode,
  };
}

function buildStudentRunnerIdentityHandoffPrivacyItem(
  identityView: StudentRunnerIdentityView | undefined
): Omit<StudentRunnerSubmissionHandoffItemView, 'ariaLabel'> {
  if (identityView?.mode === 'anonymous') {
    const privacyItem = identityView.copy.summaryItems.find(
      (item) => item.id === 'token-privacy'
    );

    if (privacyItem) {
      return {
        description: privacyItem.description,
        id: 'identity-privacy',
        label: privacyItem.label,
        value: privacyItem.value,
      };
    }
  }

  return {
    description:
      identityView?.mode === 'student-name' ? identityView.description : '',
    id: 'identity-privacy',
    label: m.student_runner_anonymous_summary_privacy_label(),
    value:
      identityView?.mode === 'student-name'
        ? m.student_runner_student_name_label()
        : '',
  };
}

function getStudentRunnerTimerLimitDescription(timeLimitSeconds?: number) {
  return formatStudentRunnerTimerLimitLabel(timeLimitSeconds) ===
    m.assignment_delivery_timer_none()
    ? m.assignment_delivery_public_rule_timer_none_description()
    : m.assignment_delivery_public_rule_timer_limited_description();
}

function formatStudentRunnerTimerLimitLabel(timeLimitSeconds?: number) {
  return formatAttemptDuration(timeLimitSeconds, {
    emptyValue: m.assignment_delivery_timer_none(),
    style: 'timer',
  });
}

function formatStudentRunnerCurrentAttemptDuration({
  attemptResultDisplay,
  attemptTimer,
}: {
  attemptResultDisplay?: StudentAttemptResultDisplay;
  attemptTimer: AttemptTimerState;
}) {
  if (attemptResultDisplay?.durationView.label) {
    return attemptResultDisplay.durationView.label;
  }

  return formatAttemptDuration(attemptTimer.durationSeconds, {
    emptyValue: m.assignment_attempt_duration_timer_seconds({ seconds: 0 }),
    style: 'timer',
  });
}

function formatStudentRunnerAttemptClockLabel({
  attemptState,
  attemptTimer,
}: {
  attemptState: {
    canSubmit: boolean;
    currentAttemptSessionKey?: string;
    itemCount: number;
  };
  attemptTimer: AttemptTimerState;
}) {
  if (
    !attemptState.canSubmit ||
    attemptState.itemCount <= 0 ||
    !attemptState.currentAttemptSessionKey
  ) {
    return m.student_runner_submit_readiness_status_blocked();
  }

  return formatAttemptDuration(attemptTimer.elapsedSeconds, {
    emptyValue: m.assignment_attempt_duration_timer_seconds({ seconds: 0 }),
    style: 'timer',
  });
}

function getStudentRunnerResultHandoffDescription(
  resultPanelView: StudentRunnerResultPanelView
) {
  return resultPanelView.show
    ? resultPanelView.ariaLabel
    : getStudentRunnerCopy().resultNextStepReviewScore;
}

function formatStudentRunnerRetryAvailability(
  resultPanelView: StudentRunnerResultPanelView
) {
  if (!resultPanelView.show) {
    return m.student_runner_submission_handoff_not_submitted_value();
  }

  return resultPanelView.showStartAnotherAttempt
    ? m.student_runner_submission_handoff_retry_available_value()
    : m.student_runner_submission_handoff_retry_unavailable_value();
}

function getStudentRunnerReviewSummaryMetric(
  resultPanelView: StudentRunnerResultPanelView,
  key: StudentAttemptReviewSummaryMetricKey
): StudentAttemptReviewSummaryMetricView {
  if (resultPanelView.show) {
    const metric = resultPanelView.reviewSummaryView.metrics.find(
      (reviewMetric) => reviewMetric.key === key
    );
    if (metric) return metric;
  }

  return buildStudentRunnerReviewSummaryMetricFallback(key);
}

function buildStudentRunnerReviewSummaryMetricFallback(
  key: StudentAttemptReviewSummaryMetricKey
): StudentAttemptReviewSummaryMetricView {
  const fallback = m.student_runner_submission_handoff_not_submitted_value();

  if (key === 'needs-review') {
    return {
      ariaLabel: m.student_runner_review_summary_metric_aria({
        description: getStudentRunnerCopy().reviewSummaryNeedsReviewDescription,
        label: getStudentRunnerCopy().reviewSummaryNeedsReviewLabel,
        value: fallback,
      }),
      description: getStudentRunnerCopy().reviewSummaryNeedsReviewDescription,
      key,
      label: getStudentRunnerCopy().reviewSummaryNeedsReviewLabel,
      value: fallback,
    };
  }

  if (key === 'unanswered') {
    return {
      ariaLabel: m.student_runner_review_summary_metric_aria({
        description: getStudentRunnerCopy().reviewSummaryUnansweredDescription,
        label: getStudentRunnerCopy().reviewSummaryUnansweredLabel,
        value: fallback,
      }),
      description: getStudentRunnerCopy().reviewSummaryUnansweredDescription,
      key,
      label: getStudentRunnerCopy().reviewSummaryUnansweredLabel,
      value: fallback,
    };
  }

  return {
    ariaLabel: m.student_runner_review_summary_metric_aria({
      description: getStudentRunnerCopy().reviewSummarySubmittedDescription,
      label: getStudentRunnerCopy().reviewSummarySubmittedLabel,
      value: fallback,
    }),
    description: getStudentRunnerCopy().reviewSummarySubmittedDescription,
    key,
    label: getStudentRunnerCopy().reviewSummarySubmittedLabel,
    value: fallback,
  };
}

function getStudentRunnerFeedbackScopeMetric(
  resultPanelView: StudentRunnerResultPanelView,
  key: StudentAttemptFeedbackScopeMetricKey
): StudentAttemptFeedbackScopeMetricView {
  if (resultPanelView.show) {
    const metric = resultPanelView.feedbackScopeView.metrics.find(
      (feedbackMetric) => feedbackMetric.key === key
    );
    if (metric) return metric;
  }

  return buildStudentRunnerFeedbackScopeMetricFallback(key);
}

function buildStudentRunnerFeedbackScopeMetricFallback(
  key: StudentAttemptFeedbackScopeMetricKey
): StudentAttemptFeedbackScopeMetricView {
  const fallback = m.student_runner_submission_handoff_not_submitted_value();

  if (key === 'item-feedback') {
    return {
      ariaLabel: m.student_runner_feedback_scope_metric_aria({
        description: m.student_runner_feedback_scope_items_hidden_description(),
        label: m.student_runner_feedback_scope_items_label(),
        value: fallback,
      }),
      description: m.student_runner_feedback_scope_items_hidden_description(),
      key,
      label: m.student_runner_feedback_scope_items_label(),
      value: fallback,
    };
  }

  if (key === 'accepted-alternatives') {
    return {
      ariaLabel: m.student_runner_feedback_scope_metric_aria({
        description:
          m.student_runner_feedback_scope_accepted_alternatives_description(),
        label: m.student_runner_feedback_scope_accepted_alternatives_label(),
        value: fallback,
      }),
      description:
        m.student_runner_feedback_scope_accepted_alternatives_description(),
      key,
      label: m.student_runner_feedback_scope_accepted_alternatives_label(),
      value: fallback,
    };
  }

  if (key === 'explanations') {
    return {
      ariaLabel: m.student_runner_feedback_scope_metric_aria({
        description: m.student_runner_feedback_scope_explanations_description(),
        label: m.student_runner_feedback_scope_explanations_label(),
        value: fallback,
      }),
      description: m.student_runner_feedback_scope_explanations_description(),
      key,
      label: m.student_runner_feedback_scope_explanations_label(),
      value: fallback,
    };
  }

  return {
    ariaLabel: m.student_runner_feedback_scope_metric_aria({
      description:
        m.student_runner_feedback_scope_visibility_hidden_description(),
      label: m.student_runner_feedback_scope_visibility_label(),
      value: fallback,
    }),
    description:
      m.student_runner_feedback_scope_visibility_hidden_description(),
    key,
    label: m.student_runner_feedback_scope_visibility_label(),
    value: fallback,
  };
}

function getStudentRunnerSubmissionPayloadMetric(
  payloadSummaryView: StudentRunnerSubmissionPayloadSummaryView,
  key: StudentRunnerSubmissionPayloadSummaryMetricKey
): StudentRunnerSubmissionPayloadSummaryMetricView {
  const metric = payloadSummaryView.metrics.find(
    (payloadMetric) => payloadMetric.key === key
  );
  if (metric) return metric;

  return buildStudentRunnerSubmissionPayloadMetricFallback(key);
}

function buildStudentRunnerSubmissionPayloadMetricFallback(
  key: StudentRunnerSubmissionPayloadSummaryMetricKey
): StudentRunnerSubmissionPayloadSummaryMetricView {
  if (key === 'share-link') {
    return buildStudentRunnerSubmissionPayloadSummaryMetricView({
      description: m.student_runner_payload_summary_share_description(),
      key,
      label: m.student_runner_payload_summary_share_label(),
      value: '',
    });
  }

  if (key === 'items') {
    return buildStudentRunnerSubmissionPayloadSummaryMetricView({
      description: m.student_runner_payload_summary_items_description(),
      key,
      label: m.student_runner_payload_summary_items_label(),
      value: '',
    });
  }

  if (key === 'answers') {
    return buildStudentRunnerSubmissionPayloadSummaryMetricView({
      description: m.student_runner_payload_summary_answers_description(),
      key,
      label: m.student_runner_payload_summary_answers_label(),
      value: '',
    });
  }

  return buildStudentRunnerSubmissionPayloadSummaryMetricView({
    description: m.student_runner_payload_summary_unanswered_description(),
    key,
    label: m.student_runner_payload_summary_unanswered_label(),
    value: '',
  });
}

function getStudentRunnerSubmitReadinessItem(
  submitReadinessView: StudentRunnerSubmitReadinessView,
  id: StudentRunnerSubmitReadinessItemId
): StudentRunnerSubmitReadinessItemView {
  const item = submitReadinessView.items.find(
    (readinessItem) => readinessItem.id === id
  );
  if (item) return item;

  return {
    ariaLabel: submitReadinessView.ariaLabel,
    description: submitReadinessView.description,
    id,
    label: submitReadinessView.title,
    status: submitReadinessView.status,
    statusLabel: submitReadinessView.statusLabel,
  };
}

function buildStudentRunnerSubmissionHandoffItemView({
  description,
  id,
  label,
  value,
}: Omit<
  StudentRunnerSubmissionHandoffItemView,
  'ariaLabel'
>): StudentRunnerSubmissionHandoffItemView {
  return {
    ariaLabel: m.student_runner_payload_summary_metric_aria({
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

function buildStudentRunnerSubmissionHandoffPrivacyContract({
  itemViews,
  payloadSummaryView,
  resultPanelView,
  submitReadinessView,
}: {
  itemViews: StudentRunnerSubmissionHandoffItemView[];
  payloadSummaryView: StudentRunnerSubmissionPayloadSummaryView;
  resultPanelView: StudentRunnerResultPanelView;
  submitReadinessView: StudentRunnerSubmitReadinessView;
}): StudentRunnerSubmissionHandoffPrivacyContract {
  return {
    exposesAnonymousToken: false,
    exposesAnswerText: false,
    exposesRawSubmissionPayload: false,
    exposesRuntimeItemIds: false,
    exposesStudentName: false,
    exposesTeacherOnlyAnswers: false,
    exposesTeacherSourceMaterials: false,
    feedbackMetricKeys: resultPanelView.show
      ? resultPanelView.feedbackScopeView.metrics.map((metric) => metric.key)
      : [],
    itemIds: itemViews.map((item) => item.id),
    payloadMetricKeys: payloadSummaryView.metrics.map((metric) => metric.key),
    readinessItemIds: submitReadinessView.items.map((item) => item.id),
    reviewMetricKeys: resultPanelView.show
      ? resultPanelView.reviewSummaryView.metrics.map((metric) => metric.key)
      : [],
  };
}

function formatStudentRunnerHandoffMetricSummary(
  metrics: Array<{ label: string; value: string }>
) {
  return metrics
    .map((metric) => `${metric.label}: ${metric.value}`)
    .join(' · ');
}

function formatStudentRunnerHandoffStepSummary(
  stepViews: StudentAttemptResultNextStepsView['stepViews']
) {
  return stepViews.map((step) => step.label).join(' · ');
}

function buildStudentRunnerSubmissionContractItemView({
  description,
  id,
  label,
  value,
}: Omit<StudentRunnerSubmissionContractItemView, 'ariaLabel'>) {
  return {
    ariaLabel: m.student_runner_payload_summary_metric_aria({
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

function buildStudentRunnerSubmissionPrivacyContract(
  metrics: StudentRunnerSubmissionPayloadSummaryMetricView[]
): StudentRunnerSubmissionPrivacyContract {
  return {
    exposesAnonymousToken: false,
    exposesAnswerText: false,
    exposesStudentName: false,
    exposesTeacherOnlyAnswers: false,
    exposesTeacherSourceMaterials: false,
    metricKeys: metrics.map((metric) => metric.key),
  };
}

function formatStudentRunnerSubmissionContractMetricSummary(
  metrics: StudentRunnerSubmissionPayloadSummaryMetricView[]
) {
  return metrics.map((metric) => metric.value).join(' · ');
}

function buildStudentRunnerSubmitReadinessView({
  attemptControlState,
  hasResult,
  isSubmitting,
  payloadSummary,
  requiresIncompleteSubmitConfirmation,
}: {
  attemptControlState: StudentAttemptControlState;
  hasResult: boolean;
  isSubmitting: boolean;
  payloadSummary: StudentRunnerSubmissionPayloadSummary;
  requiresIncompleteSubmitConfirmation: boolean;
}): StudentRunnerSubmitReadinessView {
  const items = buildStudentRunnerSubmitReadinessItems({
    attemptControlState,
    hasResult,
    isSubmitting,
    payloadSummary,
    requiresIncompleteSubmitConfirmation,
  });
  const status = getStudentRunnerSubmitReadinessStatus(items);
  const statusLabel = getStudentRunnerSubmitReadinessStatusLabel(status);

  return {
    ariaLabel: m.student_runner_submit_readiness_aria_label(),
    description: m.student_runner_submit_readiness_description(),
    items,
    status,
    statusLabel,
    title: m.student_runner_submit_readiness_title(),
  };
}

function buildStudentRunnerSubmitReadinessItems({
  attemptControlState,
  hasResult,
  isSubmitting,
  payloadSummary,
  requiresIncompleteSubmitConfirmation,
}: {
  attemptControlState: StudentAttemptControlState;
  hasResult: boolean;
  isSubmitting: boolean;
  payloadSummary: StudentRunnerSubmissionPayloadSummary;
  requiresIncompleteSubmitConfirmation: boolean;
}): StudentRunnerSubmitReadinessItemView[] {
  const normalizedShareSlug = normalizeAssignmentShareSlug(
    payloadSummary.shareSlug
  );

  return [
    buildStudentRunnerSubmitReadinessItemView({
      description: normalizedShareSlug
        ? m.student_runner_submit_readiness_share_ready_description({
            shareSlug: normalizedShareSlug,
          })
        : m.student_runner_submit_readiness_share_blocked_description(),
      id: 'share-link',
      label: m.student_runner_submit_readiness_share_label(),
      status: normalizedShareSlug ? 'ready' : 'blocked',
    }),
    buildStudentRunnerSubmitReadinessItemView({
      description:
        payloadSummary.itemCount > 0
          ? m.student_runner_submit_readiness_items_ready_description({
              count: formatStudentRunnerSubmissionPayloadCount(
                payloadSummary.itemCount
              ),
            })
          : m.student_runner_submit_readiness_items_blocked_description(),
      id: 'runtime-items',
      label: m.student_runner_submit_readiness_items_label(),
      status: payloadSummary.itemCount > 0 ? 'ready' : 'blocked',
    }),
    buildStudentRunnerSubmitReadinessItemView({
      description:
        payloadSummary.unansweredItemCount > 0
          ? m.student_runner_submit_readiness_completion_unanswered_description(
              {
                unanswered: formatStudentRunnerSubmissionPayloadCount(
                  payloadSummary.unansweredItemCount
                ),
              }
            )
          : m.student_runner_submit_readiness_completion_ready_description({
              answered: formatStudentRunnerSubmissionPayloadCount(
                payloadSummary.answerCount
              ),
            }),
      id: 'completion',
      label: m.student_runner_submit_readiness_completion_label(),
      status: payloadSummary.unansweredItemCount > 0 ? 'needs-action' : 'ready',
    }),
    buildStudentRunnerSubmitReadinessItemView({
      description: getStudentRunnerSubmitReadinessConfirmationDescription({
        requiresIncompleteSubmitConfirmation,
        unansweredItemCount: payloadSummary.unansweredItemCount,
      }),
      id: 'incomplete-confirmation',
      label: m.student_runner_submit_readiness_confirmation_label(),
      status: getStudentRunnerSubmitReadinessConfirmationStatus({
        requiresIncompleteSubmitConfirmation,
        unansweredItemCount: payloadSummary.unansweredItemCount,
      }),
    }),
    buildStudentRunnerSubmitReadinessItemView({
      description: getStudentRunnerSubmitReadinessSubmissionDescription({
        attemptControlState,
        hasResult,
        isSubmitting,
      }),
      id: 'submission-state',
      label: m.student_runner_submit_readiness_submission_label(),
      status: getStudentRunnerSubmitReadinessSubmissionStatus({
        attemptControlState,
        hasResult,
        isSubmitting,
      }),
    }),
  ];
}

function buildStudentRunnerSubmitReadinessItemView({
  description,
  id,
  label,
  status,
}: {
  description: string;
  id: StudentRunnerSubmitReadinessItemId;
  label: string;
  status: StudentRunnerSubmitReadinessStatus;
}): StudentRunnerSubmitReadinessItemView {
  const statusLabel = getStudentRunnerSubmitReadinessStatusLabel(status);

  return {
    ariaLabel: m.student_runner_submit_readiness_item_aria({
      description,
      label,
      status: statusLabel,
    }),
    description,
    id,
    label,
    status,
    statusLabel,
  };
}

function getStudentRunnerSubmitReadinessStatus(
  items: StudentRunnerSubmitReadinessItemView[]
): StudentRunnerSubmitReadinessStatus {
  if (items.some((item) => item.status === 'blocked')) return 'blocked';
  if (items.some((item) => item.status === 'needs-action')) {
    return 'needs-action';
  }

  return 'ready';
}

function getStudentRunnerSubmitReadinessStatusLabel(
  status: StudentRunnerSubmitReadinessStatus
) {
  if (status === 'blocked') {
    return m.student_runner_submit_readiness_status_blocked();
  }

  if (status === 'needs-action') {
    return m.student_runner_submit_readiness_status_needs_action();
  }

  return m.student_runner_submit_readiness_status_ready();
}

function getStudentRunnerSubmitReadinessConfirmationDescription({
  requiresIncompleteSubmitConfirmation,
  unansweredItemCount,
}: {
  requiresIncompleteSubmitConfirmation: boolean;
  unansweredItemCount: number;
}) {
  if (unansweredItemCount <= 0) {
    return m.student_runner_submit_readiness_confirmation_ready_description();
  }

  if (requiresIncompleteSubmitConfirmation) {
    return m.student_runner_submit_readiness_confirmation_confirm_description();
  }

  return m.student_runner_submit_readiness_confirmation_needed_description();
}

function getStudentRunnerSubmitReadinessConfirmationStatus({
  requiresIncompleteSubmitConfirmation,
  unansweredItemCount,
}: {
  requiresIncompleteSubmitConfirmation: boolean;
  unansweredItemCount: number;
}): StudentRunnerSubmitReadinessStatus {
  if (unansweredItemCount <= 0) return 'ready';

  return requiresIncompleteSubmitConfirmation ? 'ready' : 'needs-action';
}

function getStudentRunnerSubmitReadinessSubmissionDescription({
  attemptControlState,
  hasResult,
  isSubmitting,
}: {
  attemptControlState: StudentAttemptControlState;
  hasResult: boolean;
  isSubmitting: boolean;
}) {
  if (attemptControlState.readOnlyMessage) {
    return m.student_runner_submit_readiness_submission_blocked_description({
      message: attemptControlState.readOnlyMessage,
    });
  }

  if (hasResult) {
    return m.student_runner_submit_readiness_submission_submitted_description();
  }

  if (isSubmitting) {
    return m.student_runner_submit_readiness_submission_pending_description();
  }

  return m.student_runner_submit_readiness_submission_available_description();
}

function getStudentRunnerSubmitReadinessSubmissionStatus({
  attemptControlState,
  hasResult,
  isSubmitting,
}: {
  attemptControlState: StudentAttemptControlState;
  hasResult: boolean;
  isSubmitting: boolean;
}): StudentRunnerSubmitReadinessStatus {
  if (attemptControlState.readOnlyMessage) return 'blocked';
  if (hasResult || isSubmitting) return 'ready';

  return attemptControlState.submitDisabled ? 'blocked' : 'ready';
}

function buildStudentRunnerSubmissionPayloadSummaryMetricView({
  description,
  key,
  label,
  value,
}: {
  description: string;
  key: StudentRunnerSubmissionPayloadSummaryMetricKey;
  label: string;
  value: string;
}): StudentRunnerSubmissionPayloadSummaryMetricView {
  return {
    ariaLabel: m.student_runner_payload_summary_metric_aria({
      description,
      label,
      value,
    }),
    description,
    key,
    label,
    value,
  };
}

function formatStudentRunnerSubmissionPayloadCount(value: number) {
  return String(normalizeRuntimeDisplayCount(value));
}

function getStudentRunnerSubmissionMessageTone(
  type: StudentAttemptSubmissionMessageType
): StudentRunnerSubmissionMessageTone {
  return type === 'confirm-incomplete' ? 'warning' : 'error';
}

export function buildStudentRunnerAnonymousTokenPlan({
  pageView,
}: {
  pageView: StudentRunnerPageViewModel;
}): StudentRunnerAnonymousTokenPlan {
  if (!pageView.assignment || pageView.assignment.settings.collectStudentName) {
    return { type: 'skip' };
  }

  return {
    shareId: pageView.activeShareId,
    type: 'resolve',
  };
}

export function buildStudentRunnerAnswerUpdatePlan({
  answers,
  changes,
  disabled,
  runtimeItems,
}: {
  answers: StudentAnswerMap;
  changes: StudentAnswerChange[];
  disabled: boolean;
  runtimeItems: PublicRuntimeItem[];
}): StudentRunnerAnswerUpdatePlan {
  if (disabled) {
    return {
      type: 'ignored',
    };
  }

  const normalizedAnswers = normalizeStudentAnswersForRuntimeItems({
    answers,
    includeUnanswered: false,
    runtimeItems,
  });
  const nextAnswers = normalizeStudentAnswersForRuntimeItems({
    answers: applyStudentAnswerChanges({
      answers: normalizedAnswers,
      changes,
    }),
    includeUnanswered: false,
    runtimeItems,
  });

  if (nextAnswersEqual(normalizedAnswers, nextAnswers)) {
    return {
      type: 'ignored',
    };
  }

  return {
    answers: nextAnswers,
    confirmIncompleteSubmit: false,
    type: 'updated',
  };
}

export function buildStudentRunnerAnswerState({
  answers,
  runtimeItems,
}: {
  answers: StudentAnswerMap;
  runtimeItems: PublicRuntimeItem[];
}) {
  return normalizeStudentAnswersForRuntimeItems({
    answers,
    runtimeItems,
  });
}

function nextAnswersEqual(
  currentAnswers: StudentAnswerMap,
  nextAnswers: StudentAnswerMap
) {
  const currentEntries = Object.entries(currentAnswers);
  const nextEntries = Object.entries(nextAnswers);
  if (currentEntries.length !== nextEntries.length) return false;

  return currentEntries.every(
    ([itemId, answer]) => nextAnswers[itemId] === answer
  );
}

export function getStudentRunnerAttemptStartedAt({
  activeShareId,
  attemptClock,
  fallbackStartedAt,
}: {
  activeShareId: string;
  attemptClock?: StudentRunnerAttemptClock;
  fallbackStartedAt: number;
}) {
  if (
    attemptClock &&
    normalizeAssignmentShareSlug(attemptClock.shareId) ===
      normalizeAssignmentShareSlug(activeShareId)
  ) {
    return attemptClock.startedAt;
  }

  return fallbackStartedAt;
}

export function shouldStartStudentRunnerAttemptClock({
  activeShareId,
  attemptClock,
  canSubmit,
  hasResult,
}: {
  activeShareId: string;
  attemptClock?: StudentRunnerAttemptClock;
  canSubmit: boolean;
  hasResult: boolean;
}) {
  if (!canSubmit || hasResult) return false;

  return (
    normalizeAssignmentShareSlug(attemptClock?.shareId ?? '') !==
    normalizeAssignmentShareSlug(activeShareId)
  );
}

export function shouldResetStudentRunnerAttemptSession({
  attemptSessionKey,
  currentAttemptSessionKey,
}: {
  attemptSessionKey?: string;
  currentAttemptSessionKey?: string;
}) {
  if (!currentAttemptSessionKey) return false;

  return attemptSessionKey !== currentAttemptSessionKey;
}

function orderStudentRunnerRuntimeItems({
  assignment,
  items,
}: {
  assignment: AssignmentSeed;
  items: PublicRuntimeItem[];
}) {
  return orderAssignmentRuntimeItems({
    items,
    shareSlug: normalizeAssignmentShareSlug(assignment.shareId),
    shuffleItems: Boolean(assignment.settings.shuffleItems),
  });
}

function cloneStudentRunnerRuntimeItems(
  items: PublicRuntimeItem[]
): PublicRuntimeItem[] {
  return items.map((item) => ({
    ...item,
    choices: item.choices ? [...item.choices] : undefined,
  }));
}
