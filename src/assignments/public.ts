import type { RuntimeItem, RuntimeItemKind } from '@/activities/runtime';
import { getTemplateByType } from '@/activities/catalog';
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
import {
  buildAttemptAnswerMapByItemId,
  getAttemptAnswerByRuntimeItemId,
  normalizeAttemptAnswerItemId,
} from '@/assignments/attempt-answers';
import { normalizeAttemptDurationSeconds } from '@/assignments/attempt-duration';
import { formatAssignmentDisplayTitle } from '@/assignments/assignment-display';
import {
  buildPublicAssignmentRuleSummaryViewFromSettings,
  formatAssignmentDeliveryInstructions,
  type PublicAssignmentRuleSummaryId,
  type PublicAssignmentRuleSummaryItem,
} from '@/assignments/delivery-summary';
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
import {
  type AssignmentSettingsInput,
  resolveAssignmentSettings,
} from '@/assignments/validation';
import { m } from '@/locale/paraglide/messages';

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

export type PublicAttemptReviewSummary = {
  correctItemCount: number;
  hiddenBySettings: boolean;
  needsReviewItemCount: number;
  reviewItemCount: number;
  showCorrectAnswers: boolean;
  submittedItemCount: number;
  totalItemCount: number;
  unansweredItemCount: number;
};

export type PublicAttemptReviewSummaryView = {
  items: PublicAttemptReviewItem[];
  summary: PublicAttemptReviewSummary;
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

export type PublicAssignmentUnavailableContentPolicy = {
  answerKeysHidden: true;
  explanationsHidden: true;
  runtimeItemsHidden: true;
  teacherMaterialsHidden: true;
};

export type PublicAssignmentUnavailableIdentityPolicy = {
  browserLabelHidden: true;
  rawAnonymousTokenHidden: true;
};

export type PublicAssignmentUnavailableSubmissionPolicy = {
  submissionsBlocked: true;
};

export type PublicAssignmentUnavailablePayload = {
  contentPolicy: PublicAssignmentUnavailableContentPolicy;
  identityPolicy: PublicAssignmentUnavailableIdentityPolicy;
  reason: PublicAssignmentUnavailableReason;
  submissionPolicy: PublicAssignmentUnavailableSubmissionPolicy;
};

export type PublicAssignmentLookupResult =
  | {
      payload: PublicAssignmentPayload;
      status: 'available';
    }
  | {
      reason: PublicAssignmentUnavailableReason;
      status: 'unavailable';
      unavailable: PublicAssignmentUnavailablePayload;
    };

export type PublicAssignmentAccessHandoffItemId =
  | 'access-status'
  | 'answer-keys'
  | 'assignment-title'
  | 'attempt-limit'
  | 'close-time'
  | 'explanations'
  | 'identity-mode'
  | 'instructions'
  | 'item-count'
  | 'lifecycle-status'
  | 'review-behavior'
  | 'runtime-choices'
  | 'runtime-prompts'
  | 'share-link'
  | 'shuffle-policy'
  | 'source-materials'
  | 'submission-policy'
  | 'template'
  | 'timer'
  | 'unavailable-safety';

export type PublicAssignmentAccessHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: PublicAssignmentAccessHandoffItemId;
  label: string;
  value: string;
};

export type PublicAssignmentAccessHandoffPrivacyView = {
  exposesAcceptedAlternatives: false;
  exposesActivityContentJson: false;
  exposesRawAnonymousToken: false;
  exposesRuntimeChoiceText: false;
  exposesRuntimePromptText: false;
  exposesStudentAnswerText: false;
  exposesTeacherOnlyAnswers: false;
  exposesTeacherSourceMaterials: false;
  itemIds: PublicAssignmentAccessHandoffItemId[];
};

export type PublicAssignmentAccessHandoffView = {
  description: string;
  itemViews: PublicAssignmentAccessHandoffItemView[];
  privacy: PublicAssignmentAccessHandoffPrivacyView;
  title: string;
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
    settingsJson: AssignmentSettingsInput;
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
    unavailable: buildPublicAssignmentUnavailablePayload(lifecycleStatus),
  };
}

export function buildPublicAssignmentUnavailablePayload(
  reason: PublicAssignmentUnavailableReason
): PublicAssignmentUnavailablePayload {
  return {
    contentPolicy: {
      answerKeysHidden: true,
      explanationsHidden: true,
      runtimeItemsHidden: true,
      teacherMaterialsHidden: true,
    },
    identityPolicy: {
      browserLabelHidden: true,
      rawAnonymousTokenHidden: true,
    },
    reason,
    submissionPolicy: {
      submissionsBlocked: true,
    },
  };
}

export function buildPublicAssignmentAccessHandoffView({
  lookupResult,
  shareSlug,
}: {
  lookupResult: PublicAssignmentLookupResult;
  shareSlug?: string;
}): PublicAssignmentAccessHandoffView {
  const context = buildPublicAssignmentAccessHandoffContext({
    lookupResult,
    shareSlug,
  });
  const itemViews: PublicAssignmentAccessHandoffItemView[] = [
    buildPublicAssignmentAccessHandoffItem({
      description: m.public_assignment_access_handoff_access_description(),
      id: 'access-status',
      label: m.public_assignment_access_handoff_access_label(),
      value:
        context.status === 'available'
          ? m.public_assignment_access_handoff_access_available()
          : m.public_assignment_access_handoff_access_unavailable(),
    }),
    buildPublicAssignmentAccessHandoffItem({
      description: m.public_assignment_access_handoff_lifecycle_description(),
      id: 'lifecycle-status',
      label: m.public_assignment_access_handoff_lifecycle_label(),
      value: formatPublicAssignmentAccessLifecycleValue(context),
    }),
    buildPublicAssignmentAccessHandoffItem({
      description: m.public_assignment_access_handoff_share_description(),
      id: 'share-link',
      label: m.public_assignment_access_handoff_share_label(),
      value: context.shareSlug
        ? context.shareSlug
        : m.public_assignment_access_handoff_missing_value(),
    }),
    buildPublicAssignmentAccessHandoffItem({
      description: m.public_assignment_access_handoff_title_description(),
      id: 'assignment-title',
      label: m.public_assignment_access_handoff_title_label(),
      value:
        context.status === 'available'
          ? context.payload.assignment.title
          : m.public_assignment_access_handoff_hidden_value(),
    }),
    buildPublicAssignmentAccessHandoffItem({
      description: m.public_assignment_access_handoff_template_description(),
      id: 'template',
      label: m.public_assignment_access_handoff_template_label(),
      value:
        context.status === 'available'
          ? getTemplateByType(context.payload.activity.templateType).name
          : m.public_assignment_access_handoff_hidden_value(),
    }),
    buildPublicAssignmentAccessHandoffItem(
      buildPublicAssignmentAccessRuleHandoffItem(context, 'items', 'item-count')
    ),
    buildPublicAssignmentAccessHandoffItem({
      description:
        context.status === 'available'
          ? m.public_assignment_access_handoff_runtime_prompts_description()
          : m.public_assignment_access_handoff_runtime_hidden_description(),
      id: 'runtime-prompts',
      label: m.public_assignment_access_handoff_runtime_prompts_label(),
      value:
        context.status === 'available'
          ? m.public_assignment_access_handoff_runtime_prompts_value({
              count: normalizeRuntimeDisplayCount(
                context.payload.runtimeItems.length
              ),
            })
          : m.public_assignment_access_handoff_hidden_value(),
    }),
    buildPublicAssignmentAccessHandoffItem({
      description:
        context.status === 'available'
          ? m.public_assignment_access_handoff_runtime_choices_description()
          : m.public_assignment_access_handoff_runtime_hidden_description(),
      id: 'runtime-choices',
      label: m.public_assignment_access_handoff_runtime_choices_label(),
      value:
        context.status === 'available'
          ? m.public_assignment_access_handoff_runtime_choices_value({
              count: countPublicAssignmentRuntimeChoices(
                context.payload.runtimeItems
              ),
            })
          : m.public_assignment_access_handoff_hidden_value(),
    }),
    buildPublicAssignmentAccessHandoffItem({
      description:
        context.status === 'available'
          ? m.public_assignment_access_handoff_answer_keys_description()
          : m.public_assignment_access_handoff_answer_keys_unavailable_description(),
      id: 'answer-keys',
      label: m.public_assignment_access_handoff_answer_keys_label(),
      value: m.public_assignment_access_handoff_answer_keys_value(),
    }),
    buildPublicAssignmentAccessHandoffItem({
      description: formatPublicAssignmentAccessExplanationDescription(context),
      id: 'explanations',
      label: m.public_assignment_access_handoff_explanations_label(),
      value: formatPublicAssignmentAccessExplanationValue(context),
    }),
    buildPublicAssignmentAccessHandoffItem({
      description:
        m.public_assignment_access_handoff_source_materials_description(),
      id: 'source-materials',
      label: m.public_assignment_access_handoff_source_materials_label(),
      value: m.public_assignment_access_handoff_source_materials_value(),
    }),
    buildPublicAssignmentAccessHandoffItem({
      description:
        m.public_assignment_access_handoff_instructions_description(),
      id: 'instructions',
      label: m.public_assignment_access_handoff_instructions_label(),
      value:
        context.status === 'available'
          ? context.payload.assignment.settingsJson.instructions ||
            m.public_assignment_access_handoff_missing_value()
          : m.public_assignment_access_handoff_hidden_value(),
    }),
    buildPublicAssignmentAccessHandoffItem(
      buildPublicAssignmentAccessRuleHandoffItem(
        context,
        'attempts',
        'attempt-limit'
      )
    ),
    buildPublicAssignmentAccessHandoffItem(
      buildPublicAssignmentAccessRuleHandoffItem(context, 'timer', 'timer')
    ),
    buildPublicAssignmentAccessHandoffItem(
      buildPublicAssignmentAccessRuleHandoffItem(
        context,
        'closes',
        'close-time'
      )
    ),
    buildPublicAssignmentAccessHandoffItem(
      buildPublicAssignmentAccessRuleHandoffItem(
        context,
        'identity',
        'identity-mode'
      )
    ),
    buildPublicAssignmentAccessHandoffItem(
      buildPublicAssignmentAccessRuleHandoffItem(
        context,
        'itemOrder',
        'shuffle-policy'
      )
    ),
    buildPublicAssignmentAccessHandoffItem(
      buildPublicAssignmentAccessRuleHandoffItem(
        context,
        'answerReveal',
        'review-behavior'
      )
    ),
    buildPublicAssignmentAccessHandoffItem({
      description:
        context.status === 'available'
          ? m.public_assignment_access_handoff_submission_available_description()
          : m.public_assignment_access_handoff_submission_blocked_description(),
      id: 'submission-policy',
      label: m.public_assignment_access_handoff_submission_label(),
      value:
        context.status === 'available'
          ? m.public_assignment_access_handoff_submission_available_value()
          : m.public_assignment_access_handoff_submission_blocked_value(),
    }),
    buildPublicAssignmentAccessHandoffItem({
      description:
        m.public_assignment_access_handoff_unavailable_safety_description(),
      id: 'unavailable-safety',
      label: m.public_assignment_access_handoff_unavailable_safety_label(),
      value:
        context.status === 'available'
          ? m.public_assignment_access_handoff_unavailable_safety_available()
          : m.public_assignment_access_handoff_unavailable_safety_blocked(),
    }),
  ];

  return {
    description: m.public_assignment_access_handoff_description(),
    itemViews,
    privacy: buildPublicAssignmentAccessHandoffPrivacyView(itemViews),
    title: m.public_assignment_access_handoff_title(),
  };
}

type PublicAssignmentAccessHandoffContext =
  | {
      payload: PublicAssignmentPayload;
      ruleItems: PublicAssignmentRuleSummaryItem[];
      shareSlug: string;
      status: 'available';
    }
  | {
      reason: PublicAssignmentUnavailableReason;
      shareSlug: string;
      status: 'unavailable';
      unavailable: PublicAssignmentUnavailablePayload;
    };

function buildPublicAssignmentAccessHandoffContext({
  lookupResult,
  shareSlug,
}: {
  lookupResult: PublicAssignmentLookupResult;
  shareSlug?: string;
}): PublicAssignmentAccessHandoffContext {
  if (lookupResult.status === 'available') {
    const payload = lookupResult.payload;
    const normalizedShareSlug = normalizeAssignmentShareSlug(
      payload.assignment.shareSlug
    );

    return {
      payload,
      ruleItems: buildPublicAssignmentRuleSummaryViewFromSettings({
        expiresAt: payload.assignment.expiresAt,
        itemCount: payload.summary.itemCount,
        settings: payload.assignment.settingsJson,
      }).items,
      shareSlug: normalizedShareSlug,
      status: 'available',
    };
  }

  return {
    reason: lookupResult.reason,
    shareSlug: normalizeAssignmentShareSlug(shareSlug ?? ''),
    status: 'unavailable',
    unavailable: lookupResult.unavailable,
  };
}

function buildPublicAssignmentAccessRuleHandoffItem(
  context: PublicAssignmentAccessHandoffContext,
  ruleId: PublicAssignmentRuleSummaryId,
  id: PublicAssignmentAccessHandoffItemId
): Omit<PublicAssignmentAccessHandoffItemView, 'ariaLabel'> {
  if (context.status === 'available') {
    const ruleItem = context.ruleItems.find((item) => item.id === ruleId);

    if (ruleItem) {
      return {
        description: ruleItem.description,
        id,
        label: ruleItem.label,
        value: ruleItem.value,
      };
    }
  }

  return {
    description: m.public_assignment_access_handoff_rules_hidden_description(),
    id,
    label: formatPublicAssignmentAccessRuleLabel(ruleId),
    value: m.public_assignment_access_handoff_hidden_value(),
  };
}

function formatPublicAssignmentAccessRuleLabel(
  ruleId: PublicAssignmentRuleSummaryId
) {
  switch (ruleId) {
    case 'answerReveal':
      return m.assignment_delivery_label_review();
    case 'attempts':
      return m.assignment_delivery_label_attempts();
    case 'closes':
      return m.assignment_delivery_label_closes();
    case 'identity':
      return m.assignment_delivery_label_identity();
    case 'itemOrder':
      return m.assignment_delivery_label_item_order();
    case 'items':
      return m.assignment_delivery_label_items();
    case 'timer':
      return m.assignment_delivery_label_timer();
  }
}

function formatPublicAssignmentAccessLifecycleValue(
  context: PublicAssignmentAccessHandoffContext
) {
  if (context.status === 'available') {
    return m.public_assignment_access_handoff_lifecycle_open();
  }

  switch (context.reason) {
    case 'closed':
      return m.public_assignment_access_handoff_lifecycle_closed();
    case 'draft':
      return m.public_assignment_access_handoff_lifecycle_draft();
    case 'expired':
      return m.public_assignment_access_handoff_lifecycle_expired();
  }
}

function formatPublicAssignmentAccessExplanationDescription(
  context: PublicAssignmentAccessHandoffContext
) {
  if (context.status === 'unavailable') {
    return m.public_assignment_access_handoff_explanations_unavailable_description();
  }

  return context.payload.assignment.settingsJson.showCorrectAnswers
    ? m.public_assignment_access_handoff_explanations_after_scoring_description()
    : m.public_assignment_access_handoff_explanations_hidden_description();
}

function formatPublicAssignmentAccessExplanationValue(
  context: PublicAssignmentAccessHandoffContext
) {
  if (
    context.status === 'available' &&
    context.payload.assignment.settingsJson.showCorrectAnswers
  ) {
    return m.public_assignment_access_handoff_explanations_after_scoring_value();
  }

  return m.public_assignment_access_handoff_hidden_value();
}

function countPublicAssignmentRuntimeChoices(items: PublicRuntimeItem[]) {
  return normalizeRuntimeDisplayCount(
    items.reduce(
      (total, item) => total + normalizeRuntimeChoiceList(item.choices).length,
      0
    )
  );
}

function buildPublicAssignmentAccessHandoffPrivacyView(
  itemViews: PublicAssignmentAccessHandoffItemView[]
): PublicAssignmentAccessHandoffPrivacyView {
  return {
    exposesAcceptedAlternatives: false,
    exposesActivityContentJson: false,
    exposesRawAnonymousToken: false,
    exposesRuntimeChoiceText: false,
    exposesRuntimePromptText: false,
    exposesStudentAnswerText: false,
    exposesTeacherOnlyAnswers: false,
    exposesTeacherSourceMaterials: false,
    itemIds: itemViews.map((item) => item.id),
  };
}

function buildPublicAssignmentAccessHandoffItem({
  description,
  id,
  label,
  value,
}: Omit<
  PublicAssignmentAccessHandoffItemView,
  'ariaLabel'
>): PublicAssignmentAccessHandoffItemView {
  return {
    ariaLabel: m.public_assignment_access_handoff_item_aria({
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
      answer: getAttemptAnswerByRuntimeItemId(answerByItemId, item.id),
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
  return buildPublicAttemptReviewSummaryView({
    answers,
    runtimeItems,
    showCorrectAnswers,
  }).items;
}

export function buildPublicAttemptReviewSummaryView({
  answers,
  runtimeItems,
  showCorrectAnswers,
}: {
  answers: AttemptAnswer[];
  runtimeItems: RuntimeItem[];
  showCorrectAnswers: boolean;
}): PublicAttemptReviewSummaryView {
  if (!showCorrectAnswers) {
    return buildHiddenPublicAttemptReviewSummary({
      answers,
      runtimeItems,
      showCorrectAnswers,
    });
  }

  const items = buildAttemptReviewItems({
    answers,
    runtimeItems,
  });

  return {
    items,
    summary: summarizePublicAttemptReviewItems({
      items,
      runtimeItems,
      showCorrectAnswers,
    }),
  };
}

function summarizePublicAttemptReviewItems({
  items,
  runtimeItems,
  showCorrectAnswers,
}: {
  items: PublicAttemptReviewItem[];
  runtimeItems: RuntimeItem[];
  showCorrectAnswers: boolean;
}): PublicAttemptReviewSummary {
  return summarizePublicAttemptReviewItemsForTotal({
    items,
    showCorrectAnswers,
    totalItemCount: runtimeItems.length,
  });
}

export function summarizePublicAttemptReviewItemsForTotal({
  items,
  showCorrectAnswers,
  totalItemCount,
}: {
  items: PublicAttemptReviewItem[];
  showCorrectAnswers: boolean;
  totalItemCount: number;
}): PublicAttemptReviewSummary {
  const submittedItemCount = normalizeRuntimeDisplayCount(
    items.filter((item) => item.submitted).length
  );
  const correctItemCount = normalizeRuntimeDisplayCount(
    items.filter((item) => item.correct).length
  );
  const reviewItemCount = normalizeRuntimeDisplayCount(items.length);
  const normalizedTotalItemCount = normalizeRuntimeDisplayCount(totalItemCount);
  const needsReviewItemCount = showCorrectAnswers
    ? Math.max(0, normalizedTotalItemCount - correctItemCount)
    : 0;

  return {
    correctItemCount,
    hiddenBySettings: !showCorrectAnswers,
    needsReviewItemCount,
    reviewItemCount,
    showCorrectAnswers,
    submittedItemCount,
    totalItemCount: normalizedTotalItemCount,
    unansweredItemCount: Math.max(
      0,
      normalizedTotalItemCount - submittedItemCount
    ),
  };
}

function buildHiddenPublicAttemptReviewSummary({
  answers,
  runtimeItems,
  showCorrectAnswers,
}: {
  answers: AttemptAnswer[];
  runtimeItems: RuntimeItem[];
  showCorrectAnswers: boolean;
}): PublicAttemptReviewSummaryView {
  const submittedItemCount = countSubmittedPublicAttemptReviewAnswers({
    answers,
    runtimeItems,
  });
  const totalItemCount = normalizeRuntimeDisplayCount(runtimeItems.length);

  return {
    items: [],
    summary: {
      correctItemCount: 0,
      hiddenBySettings: true,
      needsReviewItemCount: 0,
      reviewItemCount: 0,
      showCorrectAnswers,
      submittedItemCount,
      totalItemCount,
      unansweredItemCount: Math.max(0, totalItemCount - submittedItemCount),
    },
  };
}

export function buildPublicAttemptReviewItemMap(
  reviewItems: PublicAttemptReviewItem[] | undefined
) {
  return new Map(
    reviewItems?.map((reviewItem) => [
      normalizeAttemptAnswerItemId(reviewItem.itemId),
      reviewItem,
    ]) ?? []
  );
}

function countSubmittedPublicAttemptReviewAnswers({
  answers,
  runtimeItems,
}: {
  answers: AttemptAnswer[];
  runtimeItems: RuntimeItem[];
}) {
  const answerByItemId = buildAttemptAnswerMapByItemId(answers);

  return normalizeRuntimeDisplayCount(
    runtimeItems.filter((item) => {
      const answer = getAttemptAnswerByRuntimeItemId(answerByItemId, item.id);

      return hasRuntimeDisplayText(answer?.answer);
    }).length
  );
}

export function buildPublicAttemptResult(
  result: AttemptResult
): PublicAttemptResult {
  const durationSeconds = normalizeAttemptDurationSeconds({
    durationSeconds: result.durationSeconds,
  });
  const totalPoints = normalizePublicAttemptResultCount(result.totalPoints);
  const completedItemCount = normalizePublicAttemptResultCount(
    result.completedItemCount,
    {
      max: totalPoints,
    }
  );
  const correctItemCount = normalizePublicAttemptResultCount(
    result.correctItemCount,
    {
      max: completedItemCount,
    }
  );

  return {
    accuracy: normalizePublicAttemptResultPercent(result.accuracy),
    completedItemCount,
    correctItemCount,
    durationSeconds,
    earnedPoints: normalizePublicAttemptResultCount(result.earnedPoints, {
      max: totalPoints,
    }),
    totalPoints,
  };
}

function normalizePublicAttemptResultCount(
  value: number,
  options?: {
    max?: number;
  }
) {
  return normalizeRuntimeDisplayCount(value, options);
}

function normalizePublicAttemptResultPercent(value: number) {
  return normalizeRuntimeDisplayCount(value, {
    max: 100,
    min: 0,
  });
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
