import type { ActivitySeed, AssignmentSeed } from '@/activities/types';
import type { RuntimeItem } from '@/activities/runtime';
import {
  buildStudentAttemptSessionKey,
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
import { orderAssignmentRuntimeItems } from '@/assignments/item-order';
import { normalizeAssignmentShareSlug } from '@/assignments/share-slug';

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
