import type {
  ActivitySeed,
  ActivityTemplateType,
  AssignmentSeed,
} from '@/activities/types';
import type { RuntimeItem } from '@/activities/runtime';
import { getActivityTemplateRunnerCopy } from '@/activities/runner-copy';
import {
  ASSIGNMENT_ATTEMPT_DURATION_UNITS,
  buildAttemptTimerState,
  type AttemptTimerState,
} from '@/assignments/attempt-duration';
import {
  normalizeAssignmentAttemptCount,
  type AssignmentAttemptUsage,
} from '@/assignments/attempt-limits';
import {
  buildAnonymousAttemptCopy,
  buildAttemptCompletionCopy,
  buildStudentAttemptSubmissionPlan,
  buildStudentAttemptSessionKey,
  buildStudentAttemptControlState,
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
  type StudentAttemptControlState,
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
  type StudentAnswerMap,
  type StudentAnswerChange,
  type StudentRunnerMissingReason,
} from '@/assignments/student-submission';
import {
  buildPublicAssignmentPreviewActivity,
  buildPublicAssignmentPreviewAssignment,
  summarizePublicAttemptReviewItemsForTotal,
  stripRuntimeAnswers,
  type PublicAssignmentLookupResult,
  type PublicAttemptReviewSummary,
  type PublicAttemptReviewItem,
  type PublicAttemptResult,
  type PublicRuntimeItem,
} from '@/assignments/public';
import { getAnonymousBrowserLabel } from '@/assignments/identity';
import { orderAssignmentRuntimeItems } from '@/assignments/item-order';
import { normalizeAssignmentShareSlug } from '@/assignments/share-slug';
import {
  buildStudentRunnerHeaderView,
  type StudentRunnerHeaderView,
} from '@/assignments/student-runner-view';

type StudentRunnerReadyStateSource = 'public-assignment' | 'starter-preview';

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
  title: string;
};

export type StudentRunnerIdentityView =
  | {
      disabled: boolean;
      label: string;
      mode: 'student-name';
      placeholder: string;
    }
  | {
      copy: AnonymousAttemptCopy;
      mode: 'anonymous';
    };

export type StudentRunnerControlView = {
  progressLabel: string;
  readOnlyMessage?: string;
  requiresIncompleteSubmitConfirmation: boolean;
  runnerTitle: string;
  runtimeItemsDisabled: boolean;
  showTimeExpiredMessage: boolean;
  submitButtonLabel: string;
  submitConfirmationMessage?: string;
  submitDisabled: boolean;
  timeExpiredMessage: string;
  timerBadge: StudentAttemptTimerBadge;
  unansweredLabel?: string;
};

export type StudentRunnerResultPanelView =
  | {
      show: false;
    }
  | {
      accuracyLabel: string;
      attemptUsageLabel?: string;
      durationLabel: string;
      nextStepsView: StudentAttemptResultNextStepsView;
      reviewSummaryView: StudentAttemptReviewSummaryView;
      scoreLabel: string;
      show: true;
      showStartAnotherAttempt: boolean;
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
      reason: StudentAttemptSubmissionSubmitReason;
      submittedStudentName?: string;
      successMessage: string;
      type: 'submit';
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
  starterActivity,
  starterAssignment,
  starterRuntimeItems,
}: {
  data?: PublicAssignmentLookupResult | null;
  isLoading: boolean;
  shareId: string;
  starterActivity: ActivitySeed;
  starterAssignment: AssignmentSeed;
  starterRuntimeItems: RuntimeItem[];
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
    return { reason: data.reason, status: 'missing' };
  }

  if (
    normalizedShareId !==
    normalizeAssignmentShareSlug(starterAssignment.shareId)
  ) {
    return { reason: 'not-found', status: 'missing' };
  }

  return buildStudentRunnerReadyState({
    activity: starterActivity,
    assignment: starterAssignment,
    runtimeItems: orderStudentRunnerRuntimeItems({
      items: stripRuntimeAnswers(starterRuntimeItems),
      assignment: starterAssignment,
    }),
    source: 'starter-preview',
  });
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
  const attemptResultDisplay = result
    ? buildStudentAttemptResultDisplay({
        accuracy: result.accuracy,
        durationSeconds: result.durationSeconds,
        earnedPoints: result.earnedPoints,
        fallbackDurationSeconds: attemptTimer.elapsedSeconds,
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
  const requiresIncompleteSubmitConfirmation = Boolean(
    confirmIncompleteSubmit && attemptControlState.unansweredLabel
  );
  const revealAnswers = Boolean(
    result && assignment?.settings.showCorrectAnswers
  );
  const showStartAnotherAttempt = canStartAnotherStudentAttempt({
    canSubmit: attemptState.canSubmit,
    hasResult: Boolean(result),
    maxAttempts:
      result?.attemptUsage.maxAttempts ?? assignment?.settings.maxAttempts,
    submittedAttemptCount:
      result?.attemptUsage.usedAttempts ?? submittedAttemptCount,
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
      progressLabel: completionCopy.progressLabel,
      readOnlyMessage: attemptControlState.readOnlyMessage,
      requiresIncompleteSubmitConfirmation,
      runnerTitle: activityRunnerCopy?.title ?? '',
      runtimeItemsDisabled: attemptControlState.runtimeItemsDisabled,
      showTimeExpiredMessage: attemptControlState.showTimeExpiredMessage,
      submitButtonLabel:
        attemptControlState.submitButtonLabel ??
        completionCopy.submitButtonLabel,
      submitConfirmationMessage: requiresIncompleteSubmitConfirmation
        ? completionCopy.confirmIncompleteSubmit
        : undefined,
      submitDisabled: attemptControlState.submitDisabled,
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
          submittedAttemptCount:
            result?.attemptUsage.usedAttempts ?? submittedAttemptCount,
        })
      : undefined,
    itemCount: attemptState.itemCount,
    loadingView: {
      message: runnerCopy.loadingMessage,
    },
    missingView:
      pageState.status === 'missing'
        ? buildStudentRunnerMissingPageView(pageState.reason)
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

export function buildStudentRunnerRouteState(
  pageView: StudentRunnerPageViewModel
): StudentRunnerRouteState {
  if (pageView.missingView) {
    return {
      missingView: pageView.missingView,
      pageView,
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
  reason: StudentRunnerMissingReason
): StudentRunnerMissingPageView {
  const runnerCopy = getStudentRunnerCopy();
  const missingView = buildStudentRunnerMissingView(reason);

  return {
    badgeLabel: runnerCopy.publicRouteBadgeLabel,
    browseTemplatesLabel: runnerCopy.browseTemplatesLabel,
    description: missingView.description,
    title: missingView.title,
  };
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

    return {
      disabled:
        isSubmitting ||
        normalizeStudentRunnerSubmittedAttemptCount(submittedAttemptCount) > 0,
      label: runnerCopy.studentNameLabel,
      mode: 'student-name',
      placeholder: runnerCopy.studentNamePlaceholder,
    };
  }

  return {
    copy: buildAnonymousAttemptCopy({
      browserLabel: getAnonymousBrowserLabel(anonymousToken),
    }),
    mode: 'anonymous',
  };
}

function normalizeStudentRunnerSubmittedAttemptCount(value: number) {
  return normalizeAssignmentAttemptCount(value);
}

function buildStudentRunnerResultPanelView({
  assignment,
  attemptResultDisplay,
  attemptUsageLabel,
  reviewSummary,
  showStartAnotherAttempt,
}: {
  assignment?: AssignmentSeed;
  attemptResultDisplay?: StudentAttemptResultDisplay;
  attemptUsageLabel?: string;
  reviewSummary?: PublicAttemptReviewSummary;
  showStartAnotherAttempt: boolean;
}): StudentRunnerResultPanelView {
  if (!attemptResultDisplay || !reviewSummary) {
    return { show: false };
  }

  const runnerCopy = getStudentRunnerCopy();

  return {
    accuracyLabel: attemptResultDisplay.accuracyLabel,
    attemptUsageLabel,
    durationLabel: attemptResultDisplay.durationLabel,
    nextStepsView: buildStudentAttemptResultNextStepsView({
      canStartAnotherAttempt: showStartAnotherAttempt,
      showCorrectAnswers: Boolean(assignment?.settings.showCorrectAnswers),
    }),
    reviewSummaryView: buildStudentAttemptReviewSummaryView({
      summary: reviewSummary,
    }),
    scoreLabel: attemptResultDisplay.scoreLabel,
    show: true,
    showStartAnotherAttempt,
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
  timeLimitSeconds,
}: {
  activeShareId: string;
  attemptClock?: StudentRunnerAttemptClock;
  canSubmit: boolean;
  hasResult: boolean;
  timeLimitSeconds?: number;
}): StudentRunnerTimerTickPlan {
  if (
    hasResult ||
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
    submittedAttemptCount: normalizeStudentRunnerSubmittedAttemptCount(
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
    reason: submissionPlan.reason,
    ...(submissionPlan.input.studentName
      ? { submittedStudentName: submissionPlan.input.studentName }
      : {}),
    successMessage: pageView.submissionSuccessMessage,
    type: 'submit',
  };
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
    runtimeItems,
  });
  const nextAnswers = normalizeStudentAnswersForRuntimeItems({
    answers: applyStudentAnswerChanges({
      answers: normalizedAnswers,
      changes,
    }),
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
