import { m } from '@/locale/paraglide/messages';
import { getTemplateByType } from '@/activities/catalog';
import { normalizeActivityMaterialReferences } from '@/activities/material-references';
import { hasRuntimeDisplayText } from '@/activities/runtime-display';
import {
  ACTIVITY_TITLE_LENGTH,
  type ActivityContent,
  type ActivityQuestion,
  type ActivityTemplateType,
  type ActivityVisibility,
} from '@/activities/types';

export const ACTIVITY_DUPLICATE_HANDOFF_ITEM_IDS = [
  'source-activity',
  'owner-scope',
  'persisted-source',
  'source-status',
  'action-availability',
  'lifecycle-gate',
  'derivative-scope',
  'draft-output',
  'visibility-reset',
  'title-strategy',
  'title-normalization',
  'title-limit',
  'template-preserved',
  'template-transform',
  'description-preserved',
  'content-clone',
  'reference-isolation',
  'questions',
  'question-options',
  'answer-explanations',
  'pairs',
  'groups',
  'vocabulary',
  'teacher-notes',
  'source-summary-privacy',
  'source-materials',
  'source-material-kinds',
  'source-material-privacy',
  'assignment-snapshot-protection',
  'original-activity-protection',
] as const;

export type ActivityDuplicateHandoffItemId =
  (typeof ACTIVITY_DUPLICATE_HANDOFF_ITEM_IDS)[number];

export type ActivityDuplicateHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: ActivityDuplicateHandoffItemId;
  label: string;
  value: string;
};

export type ActivityDuplicateHandoffPrivacyContract = {
  clonesAnswerExplanations: true;
  clonesQuestionOptions: true;
  clonesSourceMaterialReferences: true;
  exposesAnswerExplanationText: false;
  exposesActivityContentText: false;
  exposesAnswerText: false;
  exposesQuestionOptionText: false;
  exposesQuestionPromptText: false;
  exposesSourceMaterialFilenames: false;
  exposesSourceMaterialFileIds: false;
  exposesSourceMaterialStorageKeys: false;
  exposesSourceSummaryText: false;
  exposesTeacherNotesText: false;
  itemIds: ActivityDuplicateHandoffItemId[];
  modifiesOriginalActivity: false;
  modifiesPublishedAssignmentSnapshots: false;
  outputVisibility: 'draft';
  preservesTemplateType: true;
  requiresOwnerScopedSource: true;
  requiresPersistedSourceForAction: true;
  resetsVisibilityToDraft: true;
  scope: 'owner-activity-duplicate';
};

export type ActivityDuplicateHandoffView = {
  description: string;
  itemViews: ActivityDuplicateHandoffItemView[];
  privacy: ActivityDuplicateHandoffPrivacyContract;
  title: string;
};

export type ActivityDuplicateHandoffSource = {
  content: ActivityContent;
  description?: string | null;
  persisted: boolean;
  status: ActivityVisibility;
  templateType: ActivityTemplateType;
  title: string;
};

export function cloneActivityContentForDerivative(
  content: ActivityContent
): ActivityContent {
  return {
    difficulty: content.difficulty,
    gradeBand: content.gradeBand,
    groups: content.groups.map((group) => ({
      ...group,
      items: [...group.items],
    })),
    language: content.language,
    learningGoal: content.learningGoal,
    pairs: content.pairs.map((pair) => ({ ...pair })),
    questions: content.questions.map(cloneActivityQuestion),
    sourceMaterials: normalizeActivityMaterialReferences(
      content.sourceMaterials
    ),
    sourceSummary: content.sourceSummary,
    subject: content.subject,
    teacherNotes: [...content.teacherNotes],
    vocabulary: [...content.vocabulary],
  };
}

export function buildActivityDuplicateHandoffView(
  source: ActivityDuplicateHandoffSource
): ActivityDuplicateHandoffView {
  const summary = buildActivityDuplicateHandoffSummary(source);
  const itemViews = ACTIVITY_DUPLICATE_HANDOFF_ITEM_IDS.map((id) =>
    buildActivityDuplicateHandoffItemView(
      buildActivityDuplicateHandoffItem({
        id,
        summary,
      })
    )
  );

  return {
    description: m.activity_duplicate_handoff_description(),
    itemViews,
    privacy: buildActivityDuplicateHandoffPrivacyContract(itemViews),
    title: m.activity_duplicate_handoff_title(),
  };
}

type ActivityDuplicateHandoffSummary = ReturnType<
  typeof buildActivityDuplicateHandoffSummary
>;

function buildActivityDuplicateHandoffSummary({
  content,
  description,
  persisted,
  status,
  templateType,
  title,
}: ActivityDuplicateHandoffSource) {
  const sourceMaterials = normalizeActivityMaterialReferences(
    content.sourceMaterials
  );
  const canDuplicate = persisted && status !== 'archived';

  return {
    actionAvailability: getActivityDuplicateHandoffAvailabilityValue({
      canDuplicate,
      persisted,
    }),
    answerExplanationCount: content.questions.filter((question) =>
      hasRuntimeDisplayText(question.explanation)
    ).length,
    descriptionState: hasRuntimeDisplayText(description)
      ? m.activity_duplicate_handoff_description_preserved_value()
      : m.activity_duplicate_handoff_description_empty_value(),
    derivativeScope: m.activity_duplicate_handoff_derivative_scope_value(),
    duplicateTitle: buildDuplicatedActivityTitle(title),
    groupCount: content.groups.length,
    lifecycleGate: getActivityDuplicateHandoffLifecycleGateValue({
      canDuplicate,
      persisted,
    }),
    pairCount: content.pairs.length,
    persistedSource: persisted
      ? m.activity_duplicate_handoff_persisted_source_saved_value()
      : m.activity_duplicate_handoff_persisted_source_preview_value(),
    questionOptionCount: content.questions.reduce(
      (count, question) => count + (question.options?.length ?? 0),
      0
    ),
    questionCount: content.questions.length,
    referenceIsolation:
      m.activity_duplicate_handoff_reference_isolation_value(),
    sourceActivity: normalizeActivitySourceTitle(title),
    sourceMaterialCount: sourceMaterials.length,
    sourceMaterialKindCount: new Set(
      sourceMaterials.map((material) => material.kind)
    ).size,
    sourceSummaryState: hasRuntimeDisplayText(content.sourceSummary)
      ? m.activity_duplicate_handoff_source_summary_privacy_included_value()
      : m.activity_duplicate_handoff_source_summary_privacy_empty_value(),
    sourceStatus: getActivityDuplicateHandoffStatusLabel({
      persisted,
      status,
    }),
    teacherNoteCount: content.teacherNotes.length,
    templateLabel: getTemplateByType(templateType).name,
    templateTransform: m.activity_duplicate_handoff_template_transform_value(),
    titleNormalization:
      m.activity_duplicate_handoff_title_normalization_value(),
    titleLimit: ACTIVITY_TITLE_LENGTH.max,
    visibilityReset: m.activity_duplicate_handoff_visibility_reset_value(),
    vocabularyCount: content.vocabulary.length,
  };
}

function buildActivityDuplicateHandoffItem({
  id,
  summary,
}: {
  id: ActivityDuplicateHandoffItemId;
  summary: ActivityDuplicateHandoffSummary;
}): Omit<ActivityDuplicateHandoffItemView, 'ariaLabel'> {
  if (id === 'source-activity') {
    return {
      description: m.activity_duplicate_handoff_source_activity_description(),
      id,
      label: m.activity_duplicate_handoff_source_activity_label(),
      value: summary.sourceActivity,
    };
  }

  if (id === 'owner-scope') {
    return {
      description: m.activity_duplicate_handoff_owner_scope_description(),
      id,
      label: m.activity_duplicate_handoff_owner_scope_label(),
      value: m.activity_duplicate_handoff_owner_scope_value(),
    };
  }

  if (id === 'source-status') {
    return {
      description: m.activity_duplicate_handoff_source_status_description(),
      id,
      label: m.activity_duplicate_handoff_source_status_label(),
      value: summary.sourceStatus,
    };
  }

  if (id === 'persisted-source') {
    return {
      description: m.activity_duplicate_handoff_persisted_source_description(),
      id,
      label: m.activity_duplicate_handoff_persisted_source_label(),
      value: summary.persistedSource,
    };
  }

  if (id === 'action-availability') {
    return {
      description:
        m.activity_duplicate_handoff_action_availability_description(),
      id,
      label: m.activity_duplicate_handoff_action_availability_label(),
      value: summary.actionAvailability,
    };
  }

  if (id === 'lifecycle-gate') {
    return {
      description: m.activity_duplicate_handoff_lifecycle_gate_description(),
      id,
      label: m.activity_duplicate_handoff_lifecycle_gate_label(),
      value: summary.lifecycleGate,
    };
  }

  if (id === 'derivative-scope') {
    return {
      description: m.activity_duplicate_handoff_derivative_scope_description(),
      id,
      label: m.activity_duplicate_handoff_derivative_scope_label(),
      value: summary.derivativeScope,
    };
  }

  if (id === 'draft-output') {
    return {
      description: m.activity_duplicate_handoff_draft_output_description(),
      id,
      label: m.activity_duplicate_handoff_draft_output_label(),
      value: m.activity_duplicate_handoff_draft_output_value(),
    };
  }

  if (id === 'visibility-reset') {
    return {
      description: m.activity_duplicate_handoff_visibility_reset_description(),
      id,
      label: m.activity_duplicate_handoff_visibility_reset_label(),
      value: summary.visibilityReset,
    };
  }

  if (id === 'title-strategy') {
    return {
      description: m.activity_duplicate_handoff_title_strategy_description(),
      id,
      label: m.activity_duplicate_handoff_title_strategy_label(),
      value: summary.duplicateTitle,
    };
  }

  if (id === 'title-normalization') {
    return {
      description:
        m.activity_duplicate_handoff_title_normalization_description(),
      id,
      label: m.activity_duplicate_handoff_title_normalization_label(),
      value: summary.titleNormalization,
    };
  }

  if (id === 'title-limit') {
    return {
      description: m.activity_duplicate_handoff_title_limit_description(),
      id,
      label: m.activity_duplicate_handoff_title_limit_label(),
      value: m.activity_duplicate_handoff_title_limit_value({
        count: summary.titleLimit,
      }),
    };
  }

  if (id === 'template-preserved') {
    return {
      description:
        m.activity_duplicate_handoff_template_preserved_description(),
      id,
      label: m.activity_duplicate_handoff_template_preserved_label(),
      value: summary.templateLabel,
    };
  }

  if (id === 'template-transform') {
    return {
      description:
        m.activity_duplicate_handoff_template_transform_description(),
      id,
      label: m.activity_duplicate_handoff_template_transform_label(),
      value: summary.templateTransform,
    };
  }

  if (id === 'description-preserved') {
    return {
      description:
        m.activity_duplicate_handoff_description_preserved_description(),
      id,
      label: m.activity_duplicate_handoff_description_preserved_label(),
      value: summary.descriptionState,
    };
  }

  if (id === 'content-clone') {
    return {
      description: m.activity_duplicate_handoff_content_clone_description(),
      id,
      label: m.activity_duplicate_handoff_content_clone_label(),
      value: m.activity_duplicate_handoff_content_clone_value(),
    };
  }

  if (id === 'reference-isolation') {
    return {
      description:
        m.activity_duplicate_handoff_reference_isolation_description(),
      id,
      label: m.activity_duplicate_handoff_reference_isolation_label(),
      value: summary.referenceIsolation,
    };
  }

  if (id === 'questions') {
    return {
      description: m.activity_duplicate_handoff_questions_description(),
      id,
      label: m.activity_duplicate_handoff_questions_label(),
      value: formatActivityDuplicateHandoffCount(summary.questionCount),
    };
  }

  if (id === 'question-options') {
    return {
      description: m.activity_duplicate_handoff_question_options_description(),
      id,
      label: m.activity_duplicate_handoff_question_options_label(),
      value: formatActivityDuplicateHandoffCount(summary.questionOptionCount),
    };
  }

  if (id === 'answer-explanations') {
    return {
      description:
        m.activity_duplicate_handoff_answer_explanations_description(),
      id,
      label: m.activity_duplicate_handoff_answer_explanations_label(),
      value: formatActivityDuplicateHandoffCount(
        summary.answerExplanationCount
      ),
    };
  }

  if (id === 'pairs') {
    return {
      description: m.activity_duplicate_handoff_pairs_description(),
      id,
      label: m.activity_duplicate_handoff_pairs_label(),
      value: formatActivityDuplicateHandoffCount(summary.pairCount),
    };
  }

  if (id === 'groups') {
    return {
      description: m.activity_duplicate_handoff_groups_description(),
      id,
      label: m.activity_duplicate_handoff_groups_label(),
      value: formatActivityDuplicateHandoffCount(summary.groupCount),
    };
  }

  if (id === 'vocabulary') {
    return {
      description: m.activity_duplicate_handoff_vocabulary_description(),
      id,
      label: m.activity_duplicate_handoff_vocabulary_label(),
      value: formatActivityDuplicateHandoffCount(summary.vocabularyCount),
    };
  }

  if (id === 'teacher-notes') {
    return {
      description: m.activity_duplicate_handoff_teacher_notes_description(),
      id,
      label: m.activity_duplicate_handoff_teacher_notes_label(),
      value: formatActivityDuplicateHandoffCount(summary.teacherNoteCount),
    };
  }

  if (id === 'source-summary-privacy') {
    return {
      description:
        m.activity_duplicate_handoff_source_summary_privacy_description(),
      id,
      label: m.activity_duplicate_handoff_source_summary_privacy_label(),
      value: summary.sourceSummaryState,
    };
  }

  if (id === 'source-materials') {
    return {
      description: m.activity_duplicate_handoff_source_materials_description(),
      id,
      label: m.activity_duplicate_handoff_source_materials_label(),
      value: formatActivityDuplicateHandoffCount(summary.sourceMaterialCount),
    };
  }

  if (id === 'source-material-kinds') {
    return {
      description:
        m.activity_duplicate_handoff_source_material_kinds_description(),
      id,
      label: m.activity_duplicate_handoff_source_material_kinds_label(),
      value: formatActivityDuplicateHandoffCount(
        summary.sourceMaterialKindCount
      ),
    };
  }

  if (id === 'source-material-privacy') {
    return {
      description:
        m.activity_duplicate_handoff_source_material_privacy_description(),
      id,
      label: m.activity_duplicate_handoff_source_material_privacy_label(),
      value: m.activity_duplicate_handoff_source_material_privacy_value(),
    };
  }

  if (id === 'assignment-snapshot-protection') {
    return {
      description:
        m.activity_duplicate_handoff_assignment_snapshot_protection_description(),
      id,
      label:
        m.activity_duplicate_handoff_assignment_snapshot_protection_label(),
      value:
        m.activity_duplicate_handoff_assignment_snapshot_protection_value(),
    };
  }

  return {
    description:
      m.activity_duplicate_handoff_original_activity_protection_description(),
    id,
    label: m.activity_duplicate_handoff_original_activity_protection_label(),
    value: m.activity_duplicate_handoff_original_activity_protection_value(),
  };
}

function buildActivityDuplicateHandoffItemView({
  description,
  id,
  label,
  value,
}: Omit<
  ActivityDuplicateHandoffItemView,
  'ariaLabel'
>): ActivityDuplicateHandoffItemView {
  return {
    ariaLabel: m.activity_duplicate_handoff_item_aria({
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

function buildActivityDuplicateHandoffPrivacyContract(
  itemViews: ActivityDuplicateHandoffItemView[]
): ActivityDuplicateHandoffPrivacyContract {
  return {
    clonesAnswerExplanations: true,
    clonesQuestionOptions: true,
    clonesSourceMaterialReferences: true,
    exposesAnswerExplanationText: false,
    exposesActivityContentText: false,
    exposesAnswerText: false,
    exposesQuestionOptionText: false,
    exposesQuestionPromptText: false,
    exposesSourceMaterialFilenames: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialStorageKeys: false,
    exposesSourceSummaryText: false,
    exposesTeacherNotesText: false,
    itemIds: itemViews.map((itemView) => itemView.id),
    modifiesOriginalActivity: false,
    modifiesPublishedAssignmentSnapshots: false,
    outputVisibility: 'draft',
    preservesTemplateType: true,
    requiresOwnerScopedSource: true,
    requiresPersistedSourceForAction: true,
    resetsVisibilityToDraft: true,
    scope: 'owner-activity-duplicate',
  };
}

function getActivityDuplicateHandoffAvailabilityValue({
  canDuplicate,
  persisted,
}: {
  canDuplicate: boolean;
  persisted: boolean;
}) {
  if (!persisted) {
    return m.activity_duplicate_handoff_action_preview_value();
  }

  return canDuplicate
    ? m.activity_duplicate_handoff_action_ready_value()
    : m.activity_duplicate_handoff_action_blocked_value();
}

function getActivityDuplicateHandoffLifecycleGateValue({
  canDuplicate,
  persisted,
}: {
  canDuplicate: boolean;
  persisted: boolean;
}) {
  if (!persisted) {
    return m.activity_duplicate_handoff_lifecycle_gate_preview_value();
  }

  return canDuplicate
    ? m.activity_duplicate_handoff_lifecycle_gate_ready_value()
    : m.activity_duplicate_handoff_lifecycle_gate_blocked_value();
}

function getActivityDuplicateHandoffStatusLabel({
  persisted,
  status,
}: {
  persisted: boolean;
  status: ActivityVisibility;
}) {
  if (!persisted) {
    return m.activity_duplicate_handoff_status_preview_value();
  }

  switch (status) {
    case 'archived':
      return m.activity_duplicate_handoff_status_archived_value();
    case 'draft':
      return m.activity_form_visibility_draft();
    case 'private':
      return m.activity_form_visibility_private();
    case 'public':
      return m.activity_form_visibility_public();
    case 'unlisted':
      return m.activity_form_visibility_unlisted();
  }
}

function formatActivityDuplicateHandoffCount(value: number) {
  return String(value);
}

export function buildDuplicatedActivityTitle(title: string) {
  const normalizedTitle = normalizeActivitySourceTitle(title);
  const maxSourceLength = getDuplicatedTitleMaxSourceLength();

  return formatDuplicatedTitle(
    truncateActivitySourceTitle(normalizedTitle, maxSourceLength)
  );
}

export function buildRemixedActivityTitle({
  sourceTitle,
  targetShortName,
}: {
  sourceTitle: string;
  targetShortName: string;
}) {
  const normalizedTitle = normalizeActivitySourceTitle(sourceTitle);
  const normalizedTargetShortName =
    normalizeActivityTargetShortName(targetShortName);
  const maxSourceLength = getRemixedTitleMaxSourceLength(
    normalizedTargetShortName
  );

  return formatRemixedTitle({
    sourceTitle: truncateActivitySourceTitle(normalizedTitle, maxSourceLength),
    targetShortName: normalizedTargetShortName,
  });
}

function cloneActivityQuestion(question: ActivityQuestion): ActivityQuestion {
  return {
    answer: question.answer,
    ...(question.explanation !== undefined
      ? { explanation: question.explanation }
      : {}),
    id: question.id,
    ...(question.options
      ? {
          options: question.options.map((option) => ({
            ...option,
          })),
        }
      : {}),
    prompt: question.prompt,
  };
}

function normalizeActivitySourceTitle(title: string) {
  return (
    title.normalize('NFKC').replace(/\s+/g, ' ').trim() ||
    m.activity_duplicate_untitled_title()
  );
}

function normalizeActivityTargetShortName(targetShortName: string) {
  return (
    targetShortName.normalize('NFKC').replace(/\s+/g, ' ').trim() ||
    m.activity_remix_title_template_fallback()
  );
}

function truncateActivitySourceTitle(title: string, maxLength: number) {
  if (title.length <= maxLength) {
    return title;
  }

  return `${title.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function formatDuplicatedTitle(title: string) {
  return m.activity_duplicate_title_format({ title });
}

function formatRemixedTitle({
  sourceTitle,
  targetShortName,
}: {
  sourceTitle: string;
  targetShortName: string;
}) {
  return m.activity_remix_title_format({
    template: targetShortName,
    title: sourceTitle,
  });
}

function getDuplicatedTitleMaxSourceLength() {
  return ACTIVITY_TITLE_LENGTH.max - formatDuplicatedTitle('').length;
}

function getRemixedTitleMaxSourceLength(targetShortName: string) {
  return (
    ACTIVITY_TITLE_LENGTH.max -
    formatRemixedTitle({ sourceTitle: '', targetShortName }).length
  );
}
