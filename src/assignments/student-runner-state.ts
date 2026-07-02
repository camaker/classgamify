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
  type AttemptDurationDisplayView,
  type AttemptTimerState,
} from '@/assignments/attempt-duration';
import {
  normalizeAssignmentAttemptCount,
  type AssignmentAttemptUsage,
} from '@/assignments/attempt-limits';
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
  type StudentAttemptFeedbackScopeView,
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
} from '@/assignments/student-runner-view';
import { m } from '@/locale/paraglide/messages';

type StudentRunnerReadyStateSource = 'public-assignment' | 'starter-preview';

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

  return {
    activeShareId,
    activity,
    anonymousAttemptCopy: buildAnonymousAttemptCopy({
      browserLabel: assignment?.settings.collectStudentName
        ? undefined
        : getAnonymousBrowserLabel(anonymousToken),
    }),
    assignment,
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
      payloadSummaryView: buildStudentRunnerSubmissionPayloadSummaryView(
        currentPayloadSummary
      ),
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
      submitReadinessView: buildStudentRunnerSubmitReadinessView({
        attemptControlState,
        hasResult: Boolean(result),
        isSubmitting,
        payloadSummary: currentPayloadSummary,
        requiresIncompleteSubmitConfirmation,
      }),
      timeExpiredNoticeLabel: m.student_runner_time_expired_notice_label(),
      timeExpiredMessage: runnerCopy.timeExpiredMessage,
      timerBadge: attemptTimerBadge,
      unansweredLabel: attemptControlState.unansweredLabel,
    },
    currentAttemptSessionKey: attemptState.currentAttemptSessionKey,
    headerView:
      assignment && pageState.status === 'ready'
        ? buildStudentRunnerHeaderView({
            assignment,
            itemCount: attemptState.itemCount,
            source: pageState.source,
          })
        : undefined,
    identityView: assignment
      ? buildStudentRunnerIdentityView({
          anonymousToken,
          collectStudentName: assignment.settings.collectStudentName,
          isSubmitting,
          submittedAttemptCount: effectiveSubmittedAttemptCount,
        })
      : undefined,
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
    resultPanelView: buildStudentRunnerResultPanelView({
      assignment,
      attemptResultDisplay,
      attemptUsageLabel,
      reviewItems: result?.reviewItems,
      reviewSummary: result?.reviewSummary,
      showStartAnotherAttempt,
    }),
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
  return {
    ariaLabel: m.student_runner_payload_summary_aria_label(),
    description: m.student_runner_payload_summary_description(),
    metrics: [
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
    ],
    title: m.student_runner_payload_summary_title(),
  };
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
