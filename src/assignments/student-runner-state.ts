import type { ActivitySeed, AssignmentSeed } from '@/activities/types';
import type { RuntimeItem } from '@/activities/runtime';
import {
  buildStudentAttemptSessionKey,
  getAttemptCompletionSummary,
  type StudentAnswerMap,
} from '@/assignments/student-submission';
import {
  buildPublicAssignmentPreviewActivity,
  buildPublicAssignmentPreviewAssignment,
  stripRuntimeAnswers,
  type PublicAssignmentPayload,
  type PublicRuntimeItem,
} from '@/assignments/public';
import { orderAssignmentRuntimeItems } from '@/assignments/item-order';

type StudentRunnerReadyState = {
  activity: ActivitySeed;
  assignment: AssignmentSeed;
  canSubmit: boolean;
  hidePreviewAnswers: boolean;
  runtimeItems: PublicRuntimeItem[];
  source: 'public-assignment' | 'starter-preview';
  status: 'ready';
};

type StudentRunnerPageState =
  | {
      status: 'loading' | 'missing';
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
  data?: PublicAssignmentPayload | null;
  isLoading: boolean;
  shareId: string;
  starterActivity: ActivitySeed;
  starterAssignment: AssignmentSeed;
  starterRuntimeItems: RuntimeItem[];
}): StudentRunnerPageState {
  if (isLoading) {
    return { status: 'loading' };
  }

  if (data) {
    const assignment = buildPublicAssignmentPreviewAssignment(data);

    return {
      activity: buildPublicAssignmentPreviewActivity(data),
      assignment,
      canSubmit: data.runtimeItems.length > 0,
      hidePreviewAnswers: true,
      runtimeItems: orderStudentRunnerRuntimeItems({
        items: data.runtimeItems,
        assignment,
      }),
      source: 'public-assignment',
      status: 'ready',
    };
  }

  if (shareId !== starterAssignment.shareId) {
    return { status: 'missing' };
  }

  return {
    activity: starterActivity,
    assignment: starterAssignment,
    canSubmit: false,
    hidePreviewAnswers: false,
    runtimeItems: orderStudentRunnerRuntimeItems({
      items: stripRuntimeAnswers(starterRuntimeItems),
      assignment: starterAssignment,
    }),
    source: 'starter-preview',
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
  const activeShareId = assignment?.shareId ?? shareId;

  return {
    activeShareId,
    canSubmit,
    completionSummary,
    currentAttemptSessionKey:
      assignment && itemCount > 0
        ? buildStudentAttemptSessionKey({
            runtimeItems,
            shareSlug: activeShareId,
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
