import { getAcceptedAnswers } from '@/activities/answer-matching';
import type { RuntimeItem } from '@/activities/runtime';
import type {
  ActivityDifficulty,
  ActivityTemplateType,
  ActivityVisibility,
  AssignmentSettings,
  AssignmentStatus,
  AttemptAnswer,
} from '@/activities/types';

export type PublicRuntimeItem = {
  choices?: string[];
  id: string;
  kind: RuntimeItem['kind'];
  prompt: string;
};

export type PublicAttemptReviewItem = {
  acceptedAnswers: string[];
  correct: boolean;
  correctAnswer: string;
  explanation?: string;
  itemId: string;
};

export type PublicAssignmentPayload = {
  activity: {
    description: string | null;
    id: string;
    templateType: ActivityTemplateType;
    title: string;
    visibility: ActivityVisibility;
  };
  assignment: {
    id: string;
    expiresAt: Date | null;
    settingsJson: AssignmentSettings;
    shareSlug: string;
    status: AssignmentStatus;
    title: string;
  };
  runtimeItems: PublicRuntimeItem[];
  snapshot: {
    activityDescription: string | null;
    activityTitle: string;
    templateType: ActivityTemplateType;
  } | null;
  summary: {
    difficulty: ActivityDifficulty;
    estimatedMinutes: number;
    gradeBand: string;
    itemCount: number;
    language: string;
    learningGoal: string;
    subject: string;
  };
};

export function stripRuntimeAnswers(
  runtimeItems: RuntimeItem[]
): PublicRuntimeItem[] {
  return runtimeItems.map(({ answer: _answer, ...item }) => item);
}

export function buildAttemptReviewItems({
  answers,
  runtimeItems,
}: {
  answers: AttemptAnswer[];
  runtimeItems: RuntimeItem[];
}): PublicAttemptReviewItem[] {
  const correctnessByItemId = new Map(
    answers.map((answer) => [answer.itemId, Boolean(answer.correct)])
  );

  return runtimeItems.map((item) => {
    const acceptedAnswers = getAcceptedAnswers(item.answer);

    return {
      acceptedAnswers,
      correct: correctnessByItemId.get(item.id) ?? false,
      correctAnswer: acceptedAnswers[0] ?? item.answer,
      explanation: item.explanation,
      itemId: item.id,
    };
  });
}

export function estimateAssignmentMinutes(itemCount: number) {
  return Math.max(5, Math.min(20, itemCount * 2));
}
