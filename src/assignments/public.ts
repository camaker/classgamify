import { getAcceptedAnswers } from '@/activities/answer-matching';
import type { RuntimeItem } from '@/activities/runtime';
import type {
  ActivityContent,
  ActivityDifficulty,
  ActivitySeed,
  ActivityTemplateType,
  ActivityVisibility,
  AssignmentSeed,
  AssignmentSettings,
  AssignmentStatus,
  AttemptAnswer,
} from '@/activities/types';
import { getRuntimeItems } from '@/activities/runtime';
import {
  type AssignmentLifecycleStatus,
  getAssignmentLifecycleStatus,
  isAssignmentOpen,
} from '@/assignments/lifecycle';
import { normalizeAssignmentShareSlug } from '@/assignments/share-slug';
import { resolveAssignmentSettings } from '@/assignments/validation';

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

export type PublicAssignmentUnavailableReason = Exclude<
  AssignmentLifecycleStatus,
  'open'
>;

export type PublicAssignmentLookupResult =
  | {
      payload: PublicAssignmentPayload;
      status: 'available';
    }
  | {
      reason: PublicAssignmentUnavailableReason;
      status: 'unavailable';
    };

type PublicAssignmentPayloadSource = {
  activity: {
    contentJson: ActivityContent;
    description: string | null;
    id: string;
    templateType: ActivityTemplateType;
    title: string;
    visibility: ActivityVisibility;
  };
  assignment: {
    expiresAt: Date | null;
    id: string;
    settingsJson: Partial<AssignmentSettings> | null | undefined;
    shareSlug: string;
    status: AssignmentStatus;
    title: string;
  };
  snapshot?: {
    activityDescription: string | null;
    activityTitle: string;
    contentJson: ActivityContent;
    templateType: ActivityTemplateType;
  } | null;
};

export function buildOpenPublicAssignmentPayload(
  source: PublicAssignmentPayloadSource,
  now = Date.now()
): PublicAssignmentPayload | null {
  if (
    !isAssignmentOpen(
      source.assignment.status,
      source.assignment.expiresAt,
      now
    )
  ) {
    return null;
  }

  return buildPublicAssignmentPayload(source);
}

export function buildPublicAssignmentLookupResult(
  source: PublicAssignmentPayloadSource,
  now = Date.now()
): PublicAssignmentLookupResult {
  const lifecycleStatus = getAssignmentLifecycleStatus(
    source.assignment.status,
    source.assignment.expiresAt,
    now
  );

  if (lifecycleStatus === 'open') {
    return {
      payload: buildPublicAssignmentPayload(source),
      status: 'available',
    };
  }

  return {
    reason: lifecycleStatus,
    status: 'unavailable',
  };
}

export function buildPublicAssignmentPayload({
  activity,
  assignment,
  snapshot,
}: PublicAssignmentPayloadSource): PublicAssignmentPayload {
  const content = snapshot?.contentJson ?? activity.contentJson;
  const templateType = snapshot?.templateType ?? activity.templateType;
  const runtimeItems = getRuntimeItems(templateType, content);
  const shareSlug = normalizeAssignmentShareSlug(assignment.shareSlug);

  return {
    activity: {
      description: snapshot?.activityDescription ?? activity.description,
      id: activity.id,
      templateType,
      title: snapshot?.activityTitle ?? activity.title,
      visibility: activity.visibility,
    },
    assignment: {
      expiresAt: assignment.expiresAt,
      id: assignment.id,
      settingsJson: resolveAssignmentSettings(assignment.settingsJson),
      shareSlug,
      status: assignment.status,
      title: assignment.title,
    },
    runtimeItems: stripRuntimeAnswers(runtimeItems),
    snapshot: snapshot
      ? {
          activityDescription: snapshot.activityDescription,
          activityTitle: snapshot.activityTitle,
          templateType: snapshot.templateType,
        }
      : null,
    summary: {
      difficulty: content.difficulty,
      estimatedMinutes: estimateAssignmentMinutes(runtimeItems.length),
      gradeBand: content.gradeBand,
      itemCount: runtimeItems.length,
      language: content.language,
      learningGoal: content.learningGoal,
      subject: content.subject,
    },
  };
}

export function stripRuntimeAnswers(
  runtimeItems: RuntimeItem[]
): PublicRuntimeItem[] {
  return runtimeItems.map(stripRuntimeAnswer);
}

export function stripRuntimeAnswer(item: RuntimeItem): PublicRuntimeItem {
  return {
    choices: item.choices ? [...item.choices] : undefined,
    id: item.id,
    kind: item.kind,
    prompt: item.prompt,
  };
}

function buildAttemptReviewItems({
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

export function buildPublicAttemptReviewItems({
  answers,
  runtimeItems,
  showCorrectAnswers,
}: {
  answers: AttemptAnswer[];
  runtimeItems: RuntimeItem[];
  showCorrectAnswers: boolean;
}): PublicAttemptReviewItem[] {
  if (!showCorrectAnswers) return [];

  return buildAttemptReviewItems({
    answers,
    runtimeItems,
  });
}

export function buildPublicAttemptReviewItemMap(
  reviewItems: PublicAttemptReviewItem[] | undefined
) {
  return new Map(
    reviewItems?.map((reviewItem) => [reviewItem.itemId, reviewItem]) ?? []
  );
}

export function buildPublicAssignmentPreviewActivity(
  data: PublicAssignmentPayload
): ActivitySeed {
  return {
    content: {
      difficulty: data.summary.difficulty,
      gradeBand: data.summary.gradeBand,
      groups: [],
      language: data.summary.language,
      learningGoal: data.summary.learningGoal,
      pairs: [],
      questions: [],
      sourceSummary: '',
      sourceMaterials: [],
      subject: data.summary.subject,
      teacherNotes: [],
      vocabulary: [],
    },
    description: data.activity.description ?? '',
    estimatedMinutes: data.summary.estimatedMinutes,
    id: data.activity.id,
    status: data.activity.visibility,
    templateType: data.snapshot?.templateType ?? data.activity.templateType,
    title: data.activity.title,
  };
}

export function buildPublicAssignmentPreviewAssignment(
  data: PublicAssignmentPayload
): AssignmentSeed {
  return {
    activityId: data.activity.id,
    averageScore: 0,
    completions: 0,
    expiresAt: data.assignment.expiresAt,
    id: data.assignment.id,
    settings: data.assignment.settingsJson,
    shareId: normalizeAssignmentShareSlug(data.assignment.shareSlug),
    status: data.assignment.status,
    title: data.assignment.title,
  };
}

function estimateAssignmentMinutes(itemCount: number) {
  return Math.max(5, Math.min(20, itemCount * 2));
}
