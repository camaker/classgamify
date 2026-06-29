import type { RuntimeItem, RuntimeItemKind } from '@/activities/runtime';
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
  AttemptResult,
} from '@/activities/types';
import { buildAttemptAnswerMapByItemId } from '@/assignments/attempt-answers';
import { formatAssignmentDisplayTitle } from '@/assignments/assignment-display';
import { formatAssignmentDeliveryInstructions } from '@/assignments/delivery-summary';
import {
  type AssignmentLifecycleStatus,
  getAssignmentLifecycleStatus,
  isAssignmentOpen,
} from '@/assignments/lifecycle';
import { orderAssignmentRuntimeItems } from '@/assignments/item-order';
import { normalizeAssignmentShareSlug } from '@/assignments/share-slug';
import { resolveAssignmentRuntimeSource } from '@/assignments/snapshot';
import {
  getRuntimeDisplayAcceptedAnswers,
  hasRuntimeDisplayText,
  normalizeOptionalRuntimeDisplayText,
  normalizeRuntimeChoiceList,
  normalizeRuntimeDisplayCount,
  normalizeRuntimeDisplayText,
} from '@/assignments/runtime-display';
import { resolveAssignmentSettings } from '@/assignments/validation';

export type PublicRuntimeItem = {
  choices?: string[];
  id: string;
  kind: RuntimeItemKind;
  prompt: string;
};

export type PublicAttemptReviewItem = {
  acceptedAnswers: string[];
  correct: boolean;
  correctAnswer: string;
  explanation?: string;
  itemId: string;
  submitted: boolean;
  submittedAnswer: string;
};

export type PublicAttemptResult = {
  accuracy: number;
  completedItemCount: number;
  correctItemCount: number;
  durationSeconds?: number;
  earnedPoints: number;
  totalPoints: number;
};

export type PublicAssignmentSettings = Pick<
  AssignmentSettings,
  | 'collectStudentName'
  | 'instructions'
  | 'maxAttempts'
  | 'showCorrectAnswers'
  | 'shuffleItems'
  | 'timeLimitSeconds'
>;

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
    settingsJson: PublicAssignmentSettings;
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

export const PUBLIC_ASSIGNMENT_ESTIMATED_MINUTES = {
  max: 20,
  min: 5,
  perItem: 2,
} as const;

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
  const resolvedSource = resolveAssignmentRuntimeSource({
    activity,
    snapshot,
  });
  const content = resolvedSource.contentJson;
  const templateType = resolvedSource.templateType;
  const runtimeItems = resolvedSource.runtimeItems;
  const shareSlug = normalizeAssignmentShareSlug(assignment.shareSlug);
  const settings = resolveAssignmentSettings(assignment.settingsJson);
  const orderedRuntimeItems = orderAssignmentRuntimeItems({
    items: runtimeItems,
    shareSlug,
    shuffleItems: settings.shuffleItems,
  });

  return {
    activity: buildPublicAssignmentActivitySummary({
      activity,
      description: resolvedSource.activityDescription,
      templateType,
      title: resolvedSource.activityTitle,
    }),
    assignment: buildPublicAssignmentDeliverySummary({
      assignment,
      settings,
      shareSlug,
    }),
    runtimeItems: stripRuntimeAnswers(orderedRuntimeItems),
    snapshot: buildPublicAssignmentSnapshotSummary(snapshot),
    summary: buildPublicAssignmentSummary({
      content,
      itemCount: orderedRuntimeItems.length,
    }),
  };
}

function buildPublicAssignmentActivitySummary({
  activity,
  description,
  templateType,
  title,
}: {
  activity: PublicAssignmentPayloadSource['activity'];
  description: string | null;
  templateType: ActivityTemplateType;
  title: string;
}): PublicAssignmentPayload['activity'] {
  return {
    description,
    id: activity.id,
    templateType,
    title,
    visibility: activity.visibility,
  };
}

function buildPublicAssignmentDeliverySummary({
  assignment,
  settings,
  shareSlug,
}: {
  assignment: PublicAssignmentPayloadSource['assignment'];
  settings: AssignmentSettings;
  shareSlug: string;
}): PublicAssignmentPayload['assignment'] {
  return {
    expiresAt: assignment.expiresAt,
    id: assignment.id,
    settingsJson: buildPublicAssignmentSettings(settings),
    shareSlug,
    status: assignment.status,
    title: formatAssignmentDisplayTitle(assignment.title),
  };
}

function buildPublicAssignmentSettings(
  settings: AssignmentSettings
): PublicAssignmentSettings {
  return {
    collectStudentName: settings.collectStudentName,
    instructions: formatAssignmentDeliveryInstructions(settings.instructions),
    maxAttempts: settings.maxAttempts,
    showCorrectAnswers: settings.showCorrectAnswers,
    shuffleItems: settings.shuffleItems,
    timeLimitSeconds: settings.timeLimitSeconds,
  };
}

function buildPublicAssignmentSnapshotSummary(
  snapshot: PublicAssignmentPayloadSource['snapshot']
): PublicAssignmentPayload['snapshot'] {
  if (!snapshot) return null;

  return {
    activityDescription: snapshot.activityDescription,
    activityTitle: snapshot.activityTitle,
    templateType: snapshot.templateType,
  };
}

function buildPublicAssignmentSummary({
  content,
  itemCount,
}: {
  content: ActivityContent;
  itemCount: number;
}): PublicAssignmentPayload['summary'] {
  return {
    difficulty: content.difficulty,
    estimatedMinutes: estimateAssignmentMinutes(itemCount),
    gradeBand: content.gradeBand,
    itemCount: normalizeRuntimeDisplayCount(itemCount),
    language: content.language,
    learningGoal: content.learningGoal,
    subject: content.subject,
  };
}

export function stripRuntimeAnswers(
  runtimeItems: RuntimeItem[]
): PublicRuntimeItem[] {
  return runtimeItems.map(stripRuntimeAnswer);
}

export function stripRuntimeAnswer(item: RuntimeItem): PublicRuntimeItem {
  const choices = normalizeRuntimeChoiceList(item.choices);

  return {
    choices,
    id: item.id,
    kind: item.kind,
    prompt: normalizeRuntimeDisplayText(item.prompt),
  };
}

function buildPublicAttemptReviewItem({
  answer,
  item,
}: {
  answer?: AttemptAnswer;
  item: RuntimeItem;
}): PublicAttemptReviewItem {
  const acceptedAnswers = getRuntimeDisplayAcceptedAnswers(item.answer);
  const submittedAnswer = normalizeOptionalRuntimeDisplayText(answer?.answer);

  return {
    acceptedAnswers,
    correct: Boolean(answer?.correct),
    correctAnswer: normalizeRuntimeDisplayText(
      acceptedAnswers[0] ?? item.answer
    ),
    explanation: normalizeOptionalRuntimeDisplayText(item.explanation),
    itemId: item.id,
    submitted: hasRuntimeDisplayText(submittedAnswer),
    submittedAnswer: submittedAnswer ?? '',
  };
}

function buildAttemptReviewItems({
  answers,
  runtimeItems,
}: {
  answers: AttemptAnswer[];
  runtimeItems: RuntimeItem[];
}): PublicAttemptReviewItem[] {
  const answerByItemId = buildAttemptAnswerMapByItemId(answers);

  return runtimeItems.map((item) =>
    buildPublicAttemptReviewItem({
      answer: answerByItemId.get(item.id),
      item,
    })
  );
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

export function buildPublicAttemptResult(
  result: AttemptResult
): PublicAttemptResult {
  return {
    accuracy: result.accuracy,
    completedItemCount: result.completedItemCount,
    correctItemCount: result.correctItemCount,
    durationSeconds: result.durationSeconds,
    earnedPoints: result.earnedPoints,
    totalPoints: result.totalPoints,
  };
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
    templateType: data.activity.templateType,
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
    title: formatAssignmentDisplayTitle(data.assignment.title),
  };
}

function estimateAssignmentMinutes(itemCount: number) {
  const normalizedItemCount = normalizeRuntimeDisplayCount(itemCount);

  return Math.max(
    PUBLIC_ASSIGNMENT_ESTIMATED_MINUTES.min,
    Math.min(
      PUBLIC_ASSIGNMENT_ESTIMATED_MINUTES.max,
      normalizedItemCount * PUBLIC_ASSIGNMENT_ESTIMATED_MINUTES.perItem
    )
  );
}
