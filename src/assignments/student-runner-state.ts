import type { ActivitySeed, AssignmentSeed } from '@/activities/types';
import type { RuntimeItem } from '@/activities/runtime';
import { getActivityTemplateRunnerCopy } from '@/activities/runner-copy';
import { buildAttemptTimerState } from '@/assignments/attempt-duration';
import type { AssignmentAttemptUsage } from '@/assignments/attempt-limits';
import {
  buildAnonymousAttemptCopy,
  buildAttemptCompletionCopy,
  buildStudentAttemptSessionKey,
  buildStudentAttemptControlState,
  buildStudentAttemptResultDisplay,
  buildStudentAttemptTimerBadge,
  canStartAnotherStudentAttempt,
  formatStudentAttemptUsageLabel,
  getAttemptCompletionSummary,
  type StudentAnswerMap,
  type StudentRunnerMissingReason,
} from '@/assignments/student-submission';
import {
  buildPublicAssignmentPreviewActivity,
  buildPublicAssignmentPreviewAssignment,
  stripRuntimeAnswers,
  type PublicAssignmentLookupResult,
  type PublicRuntimeItem,
} from '@/assignments/public';
import { getAnonymousBrowserLabel } from '@/assignments/identity';
import { orderAssignmentRuntimeItems } from '@/assignments/item-order';
import { normalizeAssignmentShareSlug } from '@/assignments/share-slug';
import { buildStudentRunnerHeaderView } from '@/assignments/student-runner-view';

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
  completionSummary: ReturnType<typeof getAttemptCompletionSummary>;
  currentAttemptSessionKey?: string;
  itemCount: number;
  runtimeItems: PublicRuntimeItem[];
};

type StudentRunnerAttemptResult = {
  accuracy: number;
  attemptUsage: AssignmentAttemptUsage;
  durationSeconds?: number;
  earnedPoints: number;
  totalPoints: number;
};

type StudentRunnerPageViewModel = {
  activeShareId: string;
  activity: ActivitySeed | undefined;
  anonymousAttemptCopy: ReturnType<typeof buildAnonymousAttemptCopy>;
  assignment: AssignmentSeed | undefined;
  attemptControlState: ReturnType<typeof buildStudentAttemptControlState>;
  attemptResultDisplay?: ReturnType<typeof buildStudentAttemptResultDisplay>;
  attemptState: StudentRunnerAttemptState;
  attemptTimer: ReturnType<typeof buildAttemptTimerState>;
  attemptTimerBadge: ReturnType<typeof buildStudentAttemptTimerBadge>;
  attemptUsageLabel?: string;
  completionCopy: ReturnType<typeof buildAttemptCompletionCopy>;
  currentAttemptSessionKey?: string;
  headerView?: ReturnType<typeof buildStudentRunnerHeaderView>;
  itemCount: number;
  runtimeItems: PublicRuntimeItem[];
  showStartAnotherAttempt: boolean;
  startedAt: number;
  timeLimitSeconds?: number;
};

export type StudentRunnerAttemptResetState = {
  answers: StudentAnswerMap;
  anonymousToken?: string;
  attemptClock?: StudentRunnerAttemptClock;
  confirmIncompleteSubmit: boolean;
  studentName: string;
  submittedAttemptCount: number;
};

export type StudentRunnerAttemptClock = {
  shareId: string;
  startedAt: number;
};

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
    runtimeItems,
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
    attemptTimerBadge: buildStudentAttemptTimerBadge({
      remainingSeconds: attemptTimer.remainingSeconds,
      timeExpired: attemptTimer.timeExpired,
      timeLimitSeconds,
    }),
    attemptUsageLabel: result
      ? formatStudentAttemptUsageLabel(result.attemptUsage)
      : undefined,
    completionCopy,
    currentAttemptSessionKey: attemptState.currentAttemptSessionKey,
    headerView:
      assignment && pageState.status === 'ready'
        ? buildStudentRunnerHeaderView({
            assignment,
            itemCount: attemptState.itemCount,
          })
        : undefined,
    itemCount: attemptState.itemCount,
    runtimeItems: attemptState.runtimeItems,
    showStartAnotherAttempt: canStartAnotherStudentAttempt({
      canSubmit: attemptState.canSubmit,
      hasResult: Boolean(result),
      maxAttempts:
        result?.attemptUsage.maxAttempts ?? assignment?.settings.maxAttempts,
      submittedAttemptCount:
        result?.attemptUsage.usedAttempts ?? submittedAttemptCount,
    }),
    startedAt,
    timeLimitSeconds,
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
  hasResult,
  itemCount,
  ready,
}: {
  activeShareId: string;
  attemptClock?: StudentRunnerAttemptClock;
  hasResult: boolean;
  itemCount: number;
  ready: boolean;
}) {
  if (!ready || hasResult || itemCount <= 0) return false;

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
    shareSlug: assignment.shareId,
    shuffleItems: Boolean(assignment.settings.shuffleItems),
  });
}
