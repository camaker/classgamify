import { getTemplateByType } from '@/activities/catalog';
import { buildRemixedActivityTitle } from '@/activities/duplicate';
import { normalizeActivityMaterialReferences } from '@/activities/material-references';
import {
  buildTemplateRemixSummary,
  formatTemplateRequirementList,
  getTemplateRemixPlan,
  type TemplateRemixOption,
} from '@/activities/template-remix';
import {
  ACTIVITY_TITLE_LENGTH,
  type ActivityContent,
  type ActivityTemplateContentRequirement,
  type ActivityTemplateType,
  type ActivityVisibility,
} from '@/activities/types';
import { m } from '@/locale/paraglide/messages';

export const ACTIVITY_AI_REMIX_ASSIST_HANDOFF_ITEM_IDS = [
  'source-template',
  'target-template',
  'target-readiness',
  'missing-requirement-count',
  'missing-requirement-list',
  'deterministic-remix-path',
  'ai-completion-path',
  'editor-review-gate',
  'draft-output',
  'persistence-boundary',
  'publish-boundary',
  'source-lifecycle-gate',
  'owner-scope',
  'prompt-source',
  'source-material-provenance',
  'source-file-byte-guard',
  'storage-key-guard',
  'question-count',
  'pair-count',
  'group-count',
  'vocabulary-count',
  'teacher-note-count',
  'suggested-ready-count',
  'locked-target-count',
  'review-checklist',
  'title-strategy',
  'template-switch',
  'assignment-snapshot-protection',
  'original-activity-protection',
  'privacy-guard',
] as const;

export type ActivityAiRemixAssistHandoffItemId =
  (typeof ACTIVITY_AI_REMIX_ASSIST_HANDOFF_ITEM_IDS)[number];

export type ActivityAiRemixAssistTargetStatus =
  | 'ai-completion-needed'
  | 'current-template'
  | 'deterministic-ready'
  | 'no-target'
  | 'restore-required';

export type ActivityAiRemixAssistHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: ActivityAiRemixAssistHandoffItemId;
  label: string;
  value: string;
};

export type ActivityAiRemixAssistHandoffPrivacyContract = {
  aiCanFillMissingStructuredFields: true;
  appliesBeforeActivitySave: true;
  exposesActivityContentText: false;
  exposesAnswerText: false;
  exposesPromptText: false;
  exposesSourceMaterialFileIds: false;
  exposesSourceMaterialFilenames: false;
  exposesSourceMaterialStorageKeys: false;
  exposesTeacherNotesText: false;
  itemIds: ActivityAiRemixAssistHandoffItemId[];
  modifiesOriginalActivity: false;
  modifiesPublishedAssignmentSnapshots: false;
  publishesAssignmentWithoutTeacherAction: false;
  readsSourceMaterialBytes: false;
  requiresEditorReview: true;
  savesActivityWithoutTeacherAction: false;
  scope: 'teacher-reviewed-ai-remix-assist';
};

export type ActivityAiRemixAssistHandoffView = {
  description: string;
  itemViews: ActivityAiRemixAssistHandoffItemView[];
  privacy: ActivityAiRemixAssistHandoffPrivacyContract;
  title: string;
};

export type ActivityAiRemixAssistSource = {
  content: ActivityContent;
  currentTemplateType: ActivityTemplateType;
  sourceTitle: string;
  targetTemplateType?: ActivityTemplateType;
  visibility: ActivityVisibility;
};

export type ActivityAiRemixAssistPlan = {
  currentTemplateLabel: string;
  lockedTargetCount: number;
  missingRequirementLabels: string[];
  missingRequirements: ActivityTemplateContentRequirement[];
  suggestedReadyCount: number;
  targetStatus: ActivityAiRemixAssistTargetStatus;
  targetTemplateLabel: string;
  targetTemplateType?: ActivityTemplateType;
};

type ActivityAiRemixAssistHandoffSummary = ReturnType<
  typeof buildActivityAiRemixAssistHandoffSummary
>;

export function buildActivityAiRemixAssistPlan({
  content,
  currentTemplateType,
  targetTemplateType,
  visibility,
}: ActivityAiRemixAssistSource): ActivityAiRemixAssistPlan {
  const remixPlan = getTemplateRemixPlan({ content, currentTemplateType });
  const remixSummary = buildTemplateRemixSummary(remixPlan);
  const targetOption = selectActivityAiRemixAssistTarget({
    currentTemplateType,
    options: remixPlan.options,
    targetTemplateType,
  });
  const currentTemplate =
    getTemplateByType(currentTemplateType) ?? targetOption?.template;

  return {
    currentTemplateLabel:
      currentTemplate?.shortName ?? m.activity_ai_remix_assist_unknown_value(),
    lockedTargetCount: remixSummary.lockedTemplateOptions.length,
    missingRequirementLabels: targetOption?.missingRequirementLabels ?? [],
    missingRequirements: targetOption?.missingRequirements ?? [],
    suggestedReadyCount: remixSummary.suggestedTemplateOptions.length,
    targetStatus: getActivityAiRemixAssistTargetStatus({
      currentTemplateType,
      targetOption,
      visibility,
    }),
    targetTemplateLabel:
      targetOption?.template.shortName ??
      m.activity_ai_remix_assist_no_target_value(),
    targetTemplateType: targetOption?.template.type,
  };
}

export function buildActivityAiRemixAssistHandoffView(
  source: ActivityAiRemixAssistSource
): ActivityAiRemixAssistHandoffView {
  const summary = buildActivityAiRemixAssistHandoffSummary(source);
  const itemViews = ACTIVITY_AI_REMIX_ASSIST_HANDOFF_ITEM_IDS.map((id) =>
    buildActivityAiRemixAssistHandoffItemView(
      buildActivityAiRemixAssistHandoffItem({ id, summary })
    )
  );

  return {
    description: m.activity_ai_remix_assist_handoff_description(),
    itemViews,
    privacy: buildActivityAiRemixAssistHandoffPrivacyContract(itemViews),
    title: m.activity_ai_remix_assist_handoff_title(),
  };
}

function buildActivityAiRemixAssistHandoffSummary(
  source: ActivityAiRemixAssistSource
) {
  const plan = buildActivityAiRemixAssistPlan(source);
  const sourceMaterials = normalizeActivityMaterialReferences(
    source.content.sourceMaterials
  );
  const sourceMaterialKindCount = new Set(
    sourceMaterials.map((material) => material.kind)
  ).size;

  return {
    aiCompletionPath: getActivityAiRemixAssistCompletionPath(plan.targetStatus),
    deterministicPath: getActivityAiRemixAssistDeterministicPath(
      plan.targetStatus
    ),
    draftOutput: m.activity_ai_remix_assist_draft_output_value(),
    editorReviewGate: m.activity_ai_remix_assist_editor_review_gate_value(),
    groupCount: source.content.groups.length,
    lifecycleGate: getActivityAiRemixAssistLifecycleGateValue(
      source.visibility
    ),
    lockedTargetCount: plan.lockedTargetCount,
    missingRequirementCount: plan.missingRequirements.length,
    missingRequirementList:
      formatTemplateRequirementList(plan.missingRequirementLabels) ||
      m.activity_ai_remix_assist_none_value(),
    ownerScope: m.activity_ai_remix_assist_owner_scope_value(),
    pairCount: source.content.pairs.length,
    persistenceBoundary:
      m.activity_ai_remix_assist_persistence_boundary_value(),
    privacyGuard: m.activity_ai_remix_assist_privacy_guard_value(),
    promptSource: m.activity_ai_remix_assist_prompt_source_value(),
    publishBoundary: m.activity_ai_remix_assist_publish_boundary_value(),
    questionCount: source.content.questions.length,
    reviewChecklist: m.activity_ai_remix_assist_review_checklist_value({
      count: getActivityAiRemixAssistReviewChecklistCount(plan),
    }),
    sourceFileByteGuard:
      m.activity_ai_remix_assist_source_file_byte_guard_value(),
    sourceMaterialProvenance:
      m.activity_ai_remix_assist_source_material_provenance_value({
        count: sourceMaterials.length,
        kinds: sourceMaterialKindCount,
      }),
    sourceTemplateLabel: plan.currentTemplateLabel,
    snapshotProtection:
      m.activity_ai_remix_assist_assignment_snapshot_protection_value(),
    storageKeyGuard: m.activity_ai_remix_assist_storage_key_guard_value(),
    suggestedReadyCount: plan.suggestedReadyCount,
    targetReadiness: formatActivityAiRemixAssistTargetStatus(plan.targetStatus),
    targetTemplateLabel: plan.targetTemplateLabel,
    teacherNoteCount: source.content.teacherNotes.length,
    templateSwitch: getActivityAiRemixAssistTemplateSwitchValue(plan),
    titleStrategy: getActivityAiRemixAssistTitleStrategy({
      plan,
      sourceTitle: source.sourceTitle,
    }),
    titleLimit: ACTIVITY_TITLE_LENGTH.max,
    vocabularyCount: source.content.vocabulary.length,
    originalProtection:
      m.activity_ai_remix_assist_original_activity_protection_value(),
  };
}

function selectActivityAiRemixAssistTarget({
  currentTemplateType,
  options,
  targetTemplateType,
}: {
  currentTemplateType: ActivityTemplateType;
  options: TemplateRemixOption[];
  targetTemplateType?: ActivityTemplateType;
}) {
  if (targetTemplateType) {
    return options.find(
      (option) => option.template.type === targetTemplateType
    );
  }

  return (
    options.find((option) => !option.isReady && !option.isCurrent) ??
    options.find((option) => option.isReady && !option.isCurrent) ??
    options.find((option) => option.template.type === currentTemplateType) ??
    options[0]
  );
}

function getActivityAiRemixAssistTargetStatus({
  currentTemplateType,
  targetOption,
  visibility,
}: {
  currentTemplateType: ActivityTemplateType;
  targetOption?: TemplateRemixOption;
  visibility: ActivityVisibility;
}): ActivityAiRemixAssistTargetStatus {
  if (visibility === 'archived') return 'restore-required';
  if (!targetOption) return 'no-target';
  if (targetOption.template.type === currentTemplateType) {
    return 'current-template';
  }
  if (targetOption.isReady) return 'deterministic-ready';

  return 'ai-completion-needed';
}

function formatActivityAiRemixAssistTargetStatus(
  status: ActivityAiRemixAssistTargetStatus
) {
  switch (status) {
    case 'ai-completion-needed':
      return m.activity_ai_remix_assist_target_status_ai_needed();
    case 'current-template':
      return m.activity_ai_remix_assist_target_status_current();
    case 'deterministic-ready':
      return m.activity_ai_remix_assist_target_status_ready();
    case 'no-target':
      return m.activity_ai_remix_assist_target_status_no_target();
    case 'restore-required':
      return m.activity_ai_remix_assist_target_status_restore();
  }
}

function getActivityAiRemixAssistCompletionPath(
  status: ActivityAiRemixAssistTargetStatus
) {
  switch (status) {
    case 'ai-completion-needed':
      return m.activity_ai_remix_assist_ai_completion_path_ready_value();
    case 'restore-required':
      return m.activity_ai_remix_assist_ai_completion_path_restore_value();
    case 'current-template':
    case 'deterministic-ready':
    case 'no-target':
      return m.activity_ai_remix_assist_ai_completion_path_not_needed_value();
  }
}

function getActivityAiRemixAssistDeterministicPath(
  status: ActivityAiRemixAssistTargetStatus
) {
  switch (status) {
    case 'deterministic-ready':
      return m.activity_ai_remix_assist_deterministic_path_ready_value();
    case 'restore-required':
      return m.activity_ai_remix_assist_deterministic_path_restore_value();
    case 'ai-completion-needed':
    case 'current-template':
    case 'no-target':
      return m.activity_ai_remix_assist_deterministic_path_blocked_value();
  }
}

function getActivityAiRemixAssistLifecycleGateValue(
  visibility: ActivityVisibility
) {
  return visibility === 'archived'
    ? m.activity_ai_remix_assist_lifecycle_gate_restore_value()
    : m.activity_ai_remix_assist_lifecycle_gate_ready_value();
}

function getActivityAiRemixAssistReviewChecklistCount(
  plan: ActivityAiRemixAssistPlan
) {
  const baseChecklistCount = 4;
  return baseChecklistCount + plan.missingRequirements.length;
}

function getActivityAiRemixAssistTemplateSwitchValue(
  plan: ActivityAiRemixAssistPlan
) {
  if (!plan.targetTemplateType || plan.targetStatus === 'no-target') {
    return m.activity_ai_remix_assist_no_target_value();
  }

  return plan.targetTemplateLabel;
}

function getActivityAiRemixAssistTitleStrategy({
  plan,
  sourceTitle,
}: {
  plan: ActivityAiRemixAssistPlan;
  sourceTitle: string;
}) {
  if (!plan.targetTemplateType || plan.targetStatus === 'no-target') {
    return m.activity_ai_remix_assist_no_target_value();
  }

  return buildRemixedActivityTitle({
    sourceTitle,
    targetShortName: plan.targetTemplateLabel,
  });
}

function buildActivityAiRemixAssistHandoffItem({
  id,
  summary,
}: {
  id: ActivityAiRemixAssistHandoffItemId;
  summary: ActivityAiRemixAssistHandoffSummary;
}): Omit<ActivityAiRemixAssistHandoffItemView, 'ariaLabel'> {
  if (id === 'source-template') {
    return {
      description: m.activity_ai_remix_assist_source_template_description(),
      id,
      label: m.activity_ai_remix_assist_source_template_label(),
      value: summary.sourceTemplateLabel,
    };
  }

  if (id === 'target-template') {
    return {
      description: m.activity_ai_remix_assist_target_template_description(),
      id,
      label: m.activity_ai_remix_assist_target_template_label(),
      value: summary.targetTemplateLabel,
    };
  }

  if (id === 'target-readiness') {
    return {
      description: m.activity_ai_remix_assist_target_readiness_description(),
      id,
      label: m.activity_ai_remix_assist_target_readiness_label(),
      value: summary.targetReadiness,
    };
  }

  if (id === 'missing-requirement-count') {
    return {
      description:
        m.activity_ai_remix_assist_missing_requirement_count_description(),
      id,
      label: m.activity_ai_remix_assist_missing_requirement_count_label(),
      value: formatActivityAiRemixAssistCount(summary.missingRequirementCount),
    };
  }

  if (id === 'missing-requirement-list') {
    return {
      description:
        m.activity_ai_remix_assist_missing_requirement_list_description(),
      id,
      label: m.activity_ai_remix_assist_missing_requirement_list_label(),
      value: summary.missingRequirementList,
    };
  }

  if (id === 'deterministic-remix-path') {
    return {
      description: m.activity_ai_remix_assist_deterministic_path_description(),
      id,
      label: m.activity_ai_remix_assist_deterministic_path_label(),
      value: summary.deterministicPath,
    };
  }

  if (id === 'ai-completion-path') {
    return {
      description: m.activity_ai_remix_assist_ai_completion_path_description(),
      id,
      label: m.activity_ai_remix_assist_ai_completion_path_label(),
      value: summary.aiCompletionPath,
    };
  }

  if (id === 'editor-review-gate') {
    return {
      description: m.activity_ai_remix_assist_editor_review_gate_description(),
      id,
      label: m.activity_ai_remix_assist_editor_review_gate_label(),
      value: summary.editorReviewGate,
    };
  }

  if (id === 'draft-output') {
    return {
      description: m.activity_ai_remix_assist_draft_output_description(),
      id,
      label: m.activity_ai_remix_assist_draft_output_label(),
      value: summary.draftOutput,
    };
  }

  if (id === 'persistence-boundary') {
    return {
      description:
        m.activity_ai_remix_assist_persistence_boundary_description(),
      id,
      label: m.activity_ai_remix_assist_persistence_boundary_label(),
      value: summary.persistenceBoundary,
    };
  }

  if (id === 'publish-boundary') {
    return {
      description: m.activity_ai_remix_assist_publish_boundary_description(),
      id,
      label: m.activity_ai_remix_assist_publish_boundary_label(),
      value: summary.publishBoundary,
    };
  }

  if (id === 'source-lifecycle-gate') {
    return {
      description: m.activity_ai_remix_assist_lifecycle_gate_description(),
      id,
      label: m.activity_ai_remix_assist_lifecycle_gate_label(),
      value: summary.lifecycleGate,
    };
  }

  if (id === 'owner-scope') {
    return {
      description: m.activity_ai_remix_assist_owner_scope_description(),
      id,
      label: m.activity_ai_remix_assist_owner_scope_label(),
      value: summary.ownerScope,
    };
  }

  if (id === 'prompt-source') {
    return {
      description: m.activity_ai_remix_assist_prompt_source_description(),
      id,
      label: m.activity_ai_remix_assist_prompt_source_label(),
      value: summary.promptSource,
    };
  }

  if (id === 'source-material-provenance') {
    return {
      description:
        m.activity_ai_remix_assist_source_material_provenance_description(),
      id,
      label: m.activity_ai_remix_assist_source_material_provenance_label(),
      value: summary.sourceMaterialProvenance,
    };
  }

  if (id === 'source-file-byte-guard') {
    return {
      description:
        m.activity_ai_remix_assist_source_file_byte_guard_description(),
      id,
      label: m.activity_ai_remix_assist_source_file_byte_guard_label(),
      value: summary.sourceFileByteGuard,
    };
  }

  if (id === 'storage-key-guard') {
    return {
      description: m.activity_ai_remix_assist_storage_key_guard_description(),
      id,
      label: m.activity_ai_remix_assist_storage_key_guard_label(),
      value: summary.storageKeyGuard,
    };
  }

  if (id === 'question-count') {
    return {
      description: m.activity_ai_remix_assist_question_count_description(),
      id,
      label: m.activity_ai_remix_assist_question_count_label(),
      value: formatActivityAiRemixAssistCount(summary.questionCount),
    };
  }

  if (id === 'pair-count') {
    return {
      description: m.activity_ai_remix_assist_pair_count_description(),
      id,
      label: m.activity_ai_remix_assist_pair_count_label(),
      value: formatActivityAiRemixAssistCount(summary.pairCount),
    };
  }

  if (id === 'group-count') {
    return {
      description: m.activity_ai_remix_assist_group_count_description(),
      id,
      label: m.activity_ai_remix_assist_group_count_label(),
      value: formatActivityAiRemixAssistCount(summary.groupCount),
    };
  }

  if (id === 'vocabulary-count') {
    return {
      description: m.activity_ai_remix_assist_vocabulary_count_description(),
      id,
      label: m.activity_ai_remix_assist_vocabulary_count_label(),
      value: formatActivityAiRemixAssistCount(summary.vocabularyCount),
    };
  }

  if (id === 'teacher-note-count') {
    return {
      description: m.activity_ai_remix_assist_teacher_note_count_description(),
      id,
      label: m.activity_ai_remix_assist_teacher_note_count_label(),
      value: formatActivityAiRemixAssistCount(summary.teacherNoteCount),
    };
  }

  if (id === 'suggested-ready-count') {
    return {
      description: m.activity_ai_remix_assist_suggested_ready_description(),
      id,
      label: m.activity_ai_remix_assist_suggested_ready_label(),
      value: formatActivityAiRemixAssistCount(summary.suggestedReadyCount),
    };
  }

  if (id === 'locked-target-count') {
    return {
      description: m.activity_ai_remix_assist_locked_target_description(),
      id,
      label: m.activity_ai_remix_assist_locked_target_label(),
      value: formatActivityAiRemixAssistCount(summary.lockedTargetCount),
    };
  }

  if (id === 'review-checklist') {
    return {
      description: m.activity_ai_remix_assist_review_checklist_description(),
      id,
      label: m.activity_ai_remix_assist_review_checklist_label(),
      value: summary.reviewChecklist,
    };
  }

  if (id === 'title-strategy') {
    return {
      description: m.activity_ai_remix_assist_title_strategy_description(),
      id,
      label: m.activity_ai_remix_assist_title_strategy_label(),
      value: summary.titleStrategy,
    };
  }

  if (id === 'template-switch') {
    return {
      description: m.activity_ai_remix_assist_template_switch_description(),
      id,
      label: m.activity_ai_remix_assist_template_switch_label(),
      value: summary.templateSwitch,
    };
  }

  if (id === 'assignment-snapshot-protection') {
    return {
      description:
        m.activity_ai_remix_assist_assignment_snapshot_protection_description(),
      id,
      label: m.activity_ai_remix_assist_assignment_snapshot_protection_label(),
      value: summary.snapshotProtection,
    };
  }

  if (id === 'original-activity-protection') {
    return {
      description:
        m.activity_ai_remix_assist_original_activity_protection_description(),
      id,
      label: m.activity_ai_remix_assist_original_activity_protection_label(),
      value: summary.originalProtection,
    };
  }

  return {
    description: m.activity_ai_remix_assist_privacy_guard_description(),
    id,
    label: m.activity_ai_remix_assist_privacy_guard_label(),
    value: summary.privacyGuard,
  };
}

function buildActivityAiRemixAssistHandoffItemView({
  description,
  id,
  label,
  value,
}: Omit<
  ActivityAiRemixAssistHandoffItemView,
  'ariaLabel'
>): ActivityAiRemixAssistHandoffItemView {
  return {
    ariaLabel: m.activity_ai_remix_assist_item_aria({
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

function buildActivityAiRemixAssistHandoffPrivacyContract(
  itemViews: ActivityAiRemixAssistHandoffItemView[]
): ActivityAiRemixAssistHandoffPrivacyContract {
  return {
    aiCanFillMissingStructuredFields: true,
    appliesBeforeActivitySave: true,
    exposesActivityContentText: false,
    exposesAnswerText: false,
    exposesPromptText: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialFilenames: false,
    exposesSourceMaterialStorageKeys: false,
    exposesTeacherNotesText: false,
    itemIds: itemViews.map((itemView) => itemView.id),
    modifiesOriginalActivity: false,
    modifiesPublishedAssignmentSnapshots: false,
    publishesAssignmentWithoutTeacherAction: false,
    readsSourceMaterialBytes: false,
    requiresEditorReview: true,
    savesActivityWithoutTeacherAction: false,
    scope: 'teacher-reviewed-ai-remix-assist',
  };
}

function formatActivityAiRemixAssistCount(value: number) {
  return String(value);
}
