import type { ActivitySeed, AssignmentSeed } from '@/activities/types';
import type { RuntimeItem } from '@/activities/runtime';
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
