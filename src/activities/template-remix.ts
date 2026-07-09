import { getActivityTemplates } from '@/activities/catalog';
import { buildRemixedActivityTitle } from '@/activities/duplicate';
import { normalizeActivityMaterialReferences } from '@/activities/material-references';
import { hasRuntimeDisplayText } from '@/activities/runtime-display';
import {
  ACTIVITY_TITLE_LENGTH,
  type ActivityContent,
  type ActivityTemplateContentRequirement,
  type ActivityTemplateDefinition,
  type ActivityTemplateType,
  type ActivityVisibility,
} from '@/activities/types';
import { m } from '@/locale/paraglide/messages';

export type TemplateRemixTemplateOption = {
  shortName: string;
  template: ActivityTemplateType;
};

export type TemplateRequirementView = {
  id: ActivityTemplateContentRequirement;
  label: string;
};

export type TemplateRemixLockedOption = {
  diagnosis: string;
  template: ActivityTemplateType;
};

export type TemplateRemixOption = {
  diagnosis: string;
  isCurrent: boolean;
  isReady: boolean;
  missingRequirementCount: number;
  missingRequirementLabels: string[];
  missingRequirements: ActivityTemplateContentRequirement[];
  readinessLabel: string;
  template: ActivityTemplateDefinition;
};

export type TemplateRemixPlan = {
  currentTemplateType: ActivityTemplateType;
  options: TemplateRemixOption[];
  readyOptions: TemplateRemixOption[];
  suggestedOptions: TemplateRemixOption[];
};

type TemplateRemixReadinessErrorCode = 'missing-content';

class TemplateRemixReadinessError extends Error {
  readonly code: TemplateRemixReadinessErrorCode;
  readonly diagnosis: string;
  readonly missingRequirements: ActivityTemplateContentRequirement[];
  readonly templateType: ActivityTemplateType;

  constructor(option: TemplateRemixOption) {
    super(option.diagnosis);
    this.code = 'missing-content';
    this.diagnosis = option.diagnosis;
    this.missingRequirements = option.missingRequirements;
    this.name = 'TemplateRemixReadinessError';
    this.templateType = option.template.type;
  }
}

type TemplateRemixSummary = {
  lockedTemplateDiagnostics: string[];
  lockedTemplateOptions: TemplateRemixLockedOption[];
  readyTemplateOptions: TemplateRemixTemplateOption[];
  suggestedTemplateOptions: TemplateRemixTemplateOption[];
};

export const ACTIVITY_TEMPLATE_REMIX_HANDOFF_ITEM_IDS = [
  'current-template',
  'current-readiness',
  'ready-template-count',
  'suggested-remix-count',
  'suggested-remix-actions',
  'locked-template-count',
  'locked-diagnostics',
  'missing-requirements',
  'owner-scope',
  'source-status',
  'lifecycle-gate',
  'ready-target-only',
  'current-template-excluded',
  'visible-action-limit',
  'draft-output',
  'title-strategy',
  'title-limit',
  'template-switch',
  'content-clone',
  'questions',
  'pairs',
  'groups',
  'vocabulary',
  'teacher-notes',
  'source-materials',
  'source-material-kinds',
  'source-material-privacy',
  'assignment-snapshot-protection',
  'original-activity-protection',
  'privacy-guard',
] as const;

export const ACTIVITY_TEMPLATE_REMIX_HANDOFF_VISIBLE_ACTION_LIMIT = 3;

type ActivityTemplateRemixHandoffItemId =
  (typeof ACTIVITY_TEMPLATE_REMIX_HANDOFF_ITEM_IDS)[number];

type ActivityTemplateRemixHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: ActivityTemplateRemixHandoffItemId;
  label: string;
  value: string;
};

type ActivityTemplateRemixHandoffPrivacyContract = {
  clonesSourceMaterialReferences: true;
  excludesCurrentTemplate: true;
  exposesActivityContentText: false;
  exposesAnswerText: false;
  exposesQuestionPromptText: false;
  exposesSourceMaterialFilenames: false;
  exposesSourceMaterialFileIds: false;
  exposesSourceMaterialStorageKeys: false;
  exposesSourceSummaryText: false;
  exposesTeacherNotesText: false;
  itemIds: ActivityTemplateRemixHandoffItemId[];
  modifiesOriginalActivity: false;
  modifiesPublishedAssignmentSnapshots: false;
  outputVisibility: 'draft';
  requiresOwnerScopedSource: true;
  scope: 'deterministic-template-remix';
  targetTemplatesAreReadyOnly: true;
};

type ActivityTemplateRemixHandoffView = {
  description: string;
  itemViews: ActivityTemplateRemixHandoffItemView[];
  privacy: ActivityTemplateRemixHandoffPrivacyContract;
  title: string;
};

type ActivityTemplateRemixHandoffSource = {
  content: ActivityContent;
  currentTemplateType: ActivityTemplateType;
  sourceTitle: string;
  visibility: ActivityVisibility;
};

export function getTemplateRemixPlan({
  content,
  currentTemplateType,
}: {
  content: ActivityContent;
  currentTemplateType: ActivityTemplateType;
}): TemplateRemixPlan {
  const options = getActivityTemplates().map((template) =>
    getTemplateRemixOption({
      content,
      currentTemplateType,
      template,
    })
  );
  const readyOptions = options.filter((option) => option.isReady);
  const suggestedOptions = readyOptions.filter((option) => !option.isCurrent);

  return {
    currentTemplateType,
    options,
    readyOptions,
    suggestedOptions,
  };
}

export function buildActivityTemplateRemixHandoffView(
  source: ActivityTemplateRemixHandoffSource
): ActivityTemplateRemixHandoffView {
  const remixPlan = getTemplateRemixPlan({
    content: source.content,
    currentTemplateType: source.currentTemplateType,
  });
  const summary = buildActivityTemplateRemixHandoffSummary({
    remixPlan,
    source,
  });
  const itemViews = ACTIVITY_TEMPLATE_REMIX_HANDOFF_ITEM_IDS.map((id) =>
    buildActivityTemplateRemixHandoffItemView(
      buildActivityTemplateRemixHandoffItem({ id, summary })
    )
  );

  return {
    description: m.activity_template_remix_handoff_description(),
    itemViews,
    privacy: buildActivityTemplateRemixHandoffPrivacyContract(itemViews),
    title: m.activity_template_remix_handoff_title(),
  };
}

type ActivityTemplateRemixHandoffSummary = ReturnType<
  typeof buildActivityTemplateRemixHandoffSummary
>;

function buildActivityTemplateRemixHandoffSummary({
  remixPlan,
  source,
}: {
  remixPlan: TemplateRemixPlan;
  source: ActivityTemplateRemixHandoffSource;
}) {
  const remixSummary = buildTemplateRemixSummary(remixPlan);
  const currentOption = remixPlan.options.find((option) => option.isCurrent);
  const firstSuggestedOption = remixSummary.suggestedTemplateOptions[0];
  const targetShortName = firstSuggestedOption?.shortName;
  const sourceMaterials = normalizeActivityMaterialReferences(
    source.content.sourceMaterials
  );
  const uniqueMissingRequirements = [
    ...new Set(
      remixPlan.options.flatMap((option) => option.missingRequirements)
    ),
  ];

  return {
    currentReadiness:
      currentOption?.readinessLabel ??
      m.activity_template_remix_handoff_unknown_value(),
    currentTemplateLabel:
      currentOption?.template.name ??
      m.activity_template_remix_handoff_unknown_value(),
    currentTemplateExcluded:
      m.activity_template_remix_handoff_current_template_excluded_value(),
    draftTitle: targetShortName
      ? buildRemixedActivityTitle({
          sourceTitle: source.sourceTitle,
          targetShortName,
        })
      : m.activity_template_remix_handoff_no_target_value(),
    groupCount: source.content.groups.length,
    lifecycleGate: getActivityTemplateRemixHandoffLifecycleGateValue({
      hasSuggestedTemplates: remixSummary.suggestedTemplateOptions.length > 0,
      visibility: source.visibility,
    }),
    lockedDiagnosticCount: remixSummary.lockedTemplateDiagnostics.length,
    lockedTemplateCount: remixSummary.lockedTemplateOptions.length,
    missingRequirementCount: uniqueMissingRequirements.length,
    pairCount: source.content.pairs.length,
    questionCount: source.content.questions.length,
    readyTemplateCount: remixSummary.readyTemplateOptions.length,
    readyTargetOnly:
      m.activity_template_remix_handoff_ready_target_only_value(),
    sourceMaterialCount: sourceMaterials.length,
    sourceMaterialKindCount: new Set(
      sourceMaterials.map((material) => material.kind)
    ).size,
    sourceStatus: getActivityTemplateRemixHandoffStatusLabel(source.visibility),
    suggestedActionTemplateList: formatActivityTemplateRemixHandoffTemplateList(
      remixSummary.suggestedTemplateOptions
        .slice(0, ACTIVITY_TEMPLATE_REMIX_HANDOFF_VISIBLE_ACTION_LIMIT)
        .map((option) => option.shortName)
    ),
    suggestedTemplateCount: remixSummary.suggestedTemplateOptions.length,
    targetTemplateLabel:
      firstSuggestedOption?.shortName ??
      m.activity_template_remix_handoff_no_target_value(),
    teacherNoteCount: source.content.teacherNotes.length,
    titleLimit: ACTIVITY_TITLE_LENGTH.max,
    vocabularyCount: source.content.vocabulary.length,
    visibleActionLimit:
      m.activity_template_remix_handoff_visible_action_limit_value({
        count: ACTIVITY_TEMPLATE_REMIX_HANDOFF_VISIBLE_ACTION_LIMIT,
      }),
  };
}

function buildActivityTemplateRemixHandoffItem({
  id,
  summary,
}: {
  id: ActivityTemplateRemixHandoffItemId;
  summary: ActivityTemplateRemixHandoffSummary;
}): Omit<ActivityTemplateRemixHandoffItemView, 'ariaLabel'> {
  if (id === 'current-template') {
    return {
      description:
        m.activity_template_remix_handoff_current_template_description(),
      id,
      label: m.activity_template_remix_handoff_current_template_label(),
      value: summary.currentTemplateLabel,
    };
  }

  if (id === 'current-readiness') {
    return {
      description:
        m.activity_template_remix_handoff_current_readiness_description(),
      id,
      label: m.activity_template_remix_handoff_current_readiness_label(),
      value: summary.currentReadiness,
    };
  }

  if (id === 'ready-template-count') {
    return {
      description:
        m.activity_template_remix_handoff_ready_template_count_description(),
      id,
      label: m.activity_template_remix_handoff_ready_template_count_label(),
      value: formatActivityTemplateRemixHandoffCount(
        summary.readyTemplateCount
      ),
    };
  }

  if (id === 'suggested-remix-count') {
    return {
      description:
        m.activity_template_remix_handoff_suggested_remix_count_description(),
      id,
      label: m.activity_template_remix_handoff_suggested_remix_count_label(),
      value: formatActivityTemplateRemixHandoffCount(
        summary.suggestedTemplateCount
      ),
    };
  }

  if (id === 'suggested-remix-actions') {
    return {
      description:
        m.activity_template_remix_handoff_suggested_remix_actions_description(),
      id,
      label: m.activity_template_remix_handoff_suggested_remix_actions_label(),
      value: summary.suggestedActionTemplateList,
    };
  }

  if (id === 'locked-template-count') {
    return {
      description:
        m.activity_template_remix_handoff_locked_template_count_description(),
      id,
      label: m.activity_template_remix_handoff_locked_template_count_label(),
      value: formatActivityTemplateRemixHandoffCount(
        summary.lockedTemplateCount
      ),
    };
  }

  if (id === 'locked-diagnostics') {
    return {
      description:
        m.activity_template_remix_handoff_locked_diagnostics_description(),
      id,
      label: m.activity_template_remix_handoff_locked_diagnostics_label(),
      value: formatActivityTemplateRemixHandoffCount(
        summary.lockedDiagnosticCount
      ),
    };
  }

  if (id === 'missing-requirements') {
    return {
      description:
        m.activity_template_remix_handoff_missing_requirements_description(),
      id,
      label: m.activity_template_remix_handoff_missing_requirements_label(),
      value: formatActivityTemplateRemixHandoffCount(
        summary.missingRequirementCount
      ),
    };
  }

  if (id === 'lifecycle-gate') {
    return {
      description:
        m.activity_template_remix_handoff_lifecycle_gate_description(),
      id,
      label: m.activity_template_remix_handoff_lifecycle_gate_label(),
      value: summary.lifecycleGate,
    };
  }

  if (id === 'owner-scope') {
    return {
      description: m.activity_template_remix_handoff_owner_scope_description(),
      id,
      label: m.activity_template_remix_handoff_owner_scope_label(),
      value: m.activity_template_remix_handoff_owner_scope_value(),
    };
  }

  if (id === 'source-status') {
    return {
      description:
        m.activity_template_remix_handoff_source_status_description(),
      id,
      label: m.activity_template_remix_handoff_source_status_label(),
      value: summary.sourceStatus,
    };
  }

  if (id === 'ready-target-only') {
    return {
      description:
        m.activity_template_remix_handoff_ready_target_only_description(),
      id,
      label: m.activity_template_remix_handoff_ready_target_only_label(),
      value: summary.readyTargetOnly,
    };
  }

  if (id === 'current-template-excluded') {
    return {
      description:
        m.activity_template_remix_handoff_current_template_excluded_description(),
      id,
      label:
        m.activity_template_remix_handoff_current_template_excluded_label(),
      value: summary.currentTemplateExcluded,
    };
  }

  if (id === 'visible-action-limit') {
    return {
      description:
        m.activity_template_remix_handoff_visible_action_limit_description(),
      id,
      label: m.activity_template_remix_handoff_visible_action_limit_label(),
      value: summary.visibleActionLimit,
    };
  }

  if (id === 'draft-output') {
    return {
      description: m.activity_template_remix_handoff_draft_output_description(),
      id,
      label: m.activity_template_remix_handoff_draft_output_label(),
      value: m.activity_template_remix_handoff_draft_output_value(),
    };
  }

  if (id === 'title-strategy') {
    return {
      description:
        m.activity_template_remix_handoff_title_strategy_description(),
      id,
      label: m.activity_template_remix_handoff_title_strategy_label(),
      value: summary.draftTitle,
    };
  }

  if (id === 'title-limit') {
    return {
      description: m.activity_template_remix_handoff_title_limit_description(),
      id,
      label: m.activity_template_remix_handoff_title_limit_label(),
      value: m.activity_template_remix_handoff_title_limit_value({
        count: summary.titleLimit,
      }),
    };
  }

  if (id === 'template-switch') {
    return {
      description:
        m.activity_template_remix_handoff_template_switch_description(),
      id,
      label: m.activity_template_remix_handoff_template_switch_label(),
      value: summary.targetTemplateLabel,
    };
  }

  if (id === 'content-clone') {
    return {
      description:
        m.activity_template_remix_handoff_content_clone_description(),
      id,
      label: m.activity_template_remix_handoff_content_clone_label(),
      value: m.activity_template_remix_handoff_content_clone_value(),
    };
  }

  if (id === 'questions') {
    return {
      description: m.activity_template_remix_handoff_questions_description(),
      id,
      label: m.activity_template_remix_handoff_questions_label(),
      value: formatActivityTemplateRemixHandoffCount(summary.questionCount),
    };
  }

  if (id === 'pairs') {
    return {
      description: m.activity_template_remix_handoff_pairs_description(),
      id,
      label: m.activity_template_remix_handoff_pairs_label(),
      value: formatActivityTemplateRemixHandoffCount(summary.pairCount),
    };
  }

  if (id === 'groups') {
    return {
      description: m.activity_template_remix_handoff_groups_description(),
      id,
      label: m.activity_template_remix_handoff_groups_label(),
      value: formatActivityTemplateRemixHandoffCount(summary.groupCount),
    };
  }

  if (id === 'vocabulary') {
    return {
      description: m.activity_template_remix_handoff_vocabulary_description(),
      id,
      label: m.activity_template_remix_handoff_vocabulary_label(),
      value: formatActivityTemplateRemixHandoffCount(summary.vocabularyCount),
    };
  }

  if (id === 'teacher-notes') {
    return {
      description:
        m.activity_template_remix_handoff_teacher_notes_description(),
      id,
      label: m.activity_template_remix_handoff_teacher_notes_label(),
      value: formatActivityTemplateRemixHandoffCount(summary.teacherNoteCount),
    };
  }

  if (id === 'source-materials') {
    return {
      description:
        m.activity_template_remix_handoff_source_materials_description(),
      id,
      label: m.activity_template_remix_handoff_source_materials_label(),
      value: formatActivityTemplateRemixHandoffCount(
        summary.sourceMaterialCount
      ),
    };
  }

  if (id === 'source-material-kinds') {
    return {
      description:
        m.activity_template_remix_handoff_source_material_kinds_description(),
      id,
      label: m.activity_template_remix_handoff_source_material_kinds_label(),
      value: formatActivityTemplateRemixHandoffCount(
        summary.sourceMaterialKindCount
      ),
    };
  }

  if (id === 'source-material-privacy') {
    return {
      description:
        m.activity_template_remix_handoff_source_material_privacy_description(),
      id,
      label: m.activity_template_remix_handoff_source_material_privacy_label(),
      value: m.activity_template_remix_handoff_source_material_privacy_value(),
    };
  }

  if (id === 'assignment-snapshot-protection') {
    return {
      description:
        m.activity_template_remix_handoff_assignment_snapshot_protection_description(),
      id,
      label:
        m.activity_template_remix_handoff_assignment_snapshot_protection_label(),
      value:
        m.activity_template_remix_handoff_assignment_snapshot_protection_value(),
    };
  }

  if (id === 'original-activity-protection') {
    return {
      description:
        m.activity_template_remix_handoff_original_activity_protection_description(),
      id,
      label:
        m.activity_template_remix_handoff_original_activity_protection_label(),
      value:
        m.activity_template_remix_handoff_original_activity_protection_value(),
    };
  }

  return {
    description: m.activity_template_remix_handoff_privacy_guard_description(),
    id,
    label: m.activity_template_remix_handoff_privacy_guard_label(),
    value: m.activity_template_remix_handoff_privacy_guard_value(),
  };
}

function buildActivityTemplateRemixHandoffItemView({
  description,
  id,
  label,
  value,
}: Omit<
  ActivityTemplateRemixHandoffItemView,
  'ariaLabel'
>): ActivityTemplateRemixHandoffItemView {
  return {
    ariaLabel: m.activity_template_remix_handoff_item_aria({
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

function buildActivityTemplateRemixHandoffPrivacyContract(
  itemViews: ActivityTemplateRemixHandoffItemView[]
): ActivityTemplateRemixHandoffPrivacyContract {
  return {
    clonesSourceMaterialReferences: true,
    excludesCurrentTemplate: true,
    exposesActivityContentText: false,
    exposesAnswerText: false,
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
    requiresOwnerScopedSource: true,
    scope: 'deterministic-template-remix',
    targetTemplatesAreReadyOnly: true,
  };
}

function getActivityTemplateRemixHandoffLifecycleGateValue({
  hasSuggestedTemplates,
  visibility,
}: {
  hasSuggestedTemplates: boolean;
  visibility: ActivityTemplateRemixHandoffSource['visibility'];
}) {
  if (visibility === 'archived') {
    return m.activity_template_remix_handoff_lifecycle_gate_restore_value();
  }

  return hasSuggestedTemplates
    ? m.activity_template_remix_handoff_lifecycle_gate_ready_value()
    : m.activity_template_remix_handoff_lifecycle_gate_blocked_value();
}

function getActivityTemplateRemixHandoffStatusLabel(
  visibility: ActivityTemplateRemixHandoffSource['visibility']
) {
  switch (visibility) {
    case 'archived':
      return m.activity_template_remix_handoff_source_status_archived_value();
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

function formatActivityTemplateRemixHandoffTemplateList(values: string[]) {
  return (
    formatTemplateRequirementList(values) ||
    m.activity_template_remix_handoff_none_value()
  );
}

function formatActivityTemplateRemixHandoffCount(value: number) {
  return String(value);
}

export function buildTemplateRemixSummary(
  remixPlan: TemplateRemixPlan
): TemplateRemixSummary {
  const lockedOptions = remixPlan.options.filter((option) => !option.isReady);

  return {
    lockedTemplateDiagnostics: lockedOptions.map((option) => option.diagnosis),
    lockedTemplateOptions: lockedOptions.map(toTemplateOptionDiagnostic),
    readyTemplateOptions: remixPlan.readyOptions.map(toTemplateOptionSummary),
    suggestedTemplateOptions: remixPlan.suggestedOptions.map(
      toTemplateOptionSummary
    ),
  };
}

export function getTemplateRemixOption({
  content,
  currentTemplateType,
  template,
}: {
  content: ActivityContent;
  currentTemplateType: ActivityTemplateType;
  template: ActivityTemplateDefinition;
}): TemplateRemixOption {
  const missingRequirements = getMissingTemplateRequirements(template, content);
  const isCurrent = template.type === currentTemplateType;
  const isReady = missingRequirements.length === 0;
  const missingRequirementLabels = missingRequirements.map(
    formatTemplateRequirement
  );

  return {
    diagnosis: buildTemplateRemixDiagnosis({
      isCurrent,
      isReady,
      missingRequirementLabels,
      template,
    }),
    isCurrent,
    isReady,
    missingRequirementCount: missingRequirements.length,
    missingRequirementLabels,
    missingRequirements,
    readinessLabel: isReady
      ? m.template_remix_ready()
      : m.template_remix_needs_more_content(),
    template,
  };
}

export function assertTemplateRemixOptionReady(option: TemplateRemixOption) {
  if (!option.isReady) {
    throw new TemplateRemixReadinessError(option);
  }
}

export function isTemplateRemixReadinessError(
  error: unknown
): error is TemplateRemixReadinessError {
  return error instanceof TemplateRemixReadinessError;
}

function toTemplateOptionSummary(
  option: TemplateRemixOption
): TemplateRemixTemplateOption {
  return {
    shortName: option.template.shortName,
    template: option.template.type,
  };
}

function toTemplateOptionDiagnostic(
  option: TemplateRemixOption
): TemplateRemixLockedOption {
  return {
    diagnosis: option.diagnosis,
    template: option.template.type,
  };
}

function getMissingTemplateRequirements(
  template: ActivityTemplateDefinition,
  content: ActivityContent
) {
  return template.contentRequirements.filter(
    (requirement) => !hasTemplateRequirementContent(content, requirement)
  );
}

function hasTemplateRequirementContent(
  content: ActivityContent,
  requirement: ActivityTemplateContentRequirement
) {
  switch (requirement) {
    case 'groups':
      return content.groups.some(
        (group) =>
          hasRuntimeDisplayText(group.label) &&
          group.items.some(hasRuntimeDisplayText)
      );
    case 'pairs':
      return content.pairs.some(
        (pair) =>
          hasRuntimeDisplayText(pair.left) && hasRuntimeDisplayText(pair.right)
      );
    case 'questions':
      return content.questions.some(
        (question) =>
          hasRuntimeDisplayText(question.prompt) &&
          hasRuntimeDisplayText(question.answer)
      );
    case 'teacherNotes':
      return content.teacherNotes.some(hasRuntimeDisplayText);
    case 'vocabulary':
      return content.vocabulary.some(hasRuntimeDisplayText);
    case 'gradeBand':
    case 'learningGoal':
    case 'sourceSummary':
      return hasRuntimeDisplayText(content[requirement]);
  }
}

function buildTemplateRemixDiagnosis({
  isCurrent,
  isReady,
  missingRequirementLabels,
  template,
}: {
  isCurrent: boolean;
  isReady: boolean;
  missingRequirementLabels: string[];
  template: ActivityTemplateDefinition;
}) {
  if (isReady && isCurrent) {
    return m.template_remix_diagnosis_selected_ready({
      template: template.shortName,
    });
  }

  if (isReady) {
    return m.template_remix_diagnosis_ready({
      template: template.shortName,
    });
  }

  return m.template_remix_diagnosis_locked({
    requirements: formatTemplateRequirementList(missingRequirementLabels),
    template: template.shortName,
  });
}

export function formatTemplateRequirementList(requirements: string[]) {
  if (requirements.length <= 1) {
    return requirements[0] ?? '';
  }

  if (requirements.length === 2) {
    return m.template_remix_requirement_list_pair({
      first: requirements[0],
      second: requirements[1],
    });
  }

  return m.template_remix_requirement_list_many({
    head: requirements
      .slice(0, -1)
      .join(m.template_remix_requirement_list_separator()),
    last: requirements[requirements.length - 1],
  });
}

export function formatTemplateRequirement(
  requirement: ActivityTemplateContentRequirement
) {
  switch (requirement) {
    case 'groups':
      return m.activity_template_requirement_groups();
    case 'pairs':
      return m.activity_template_requirement_pairs();
    case 'questions':
      return m.activity_template_requirement_questions();
    case 'teacherNotes':
      return m.activity_template_requirement_teacher_notes();
    case 'learningGoal':
      return m.activity_template_requirement_learning_goal();
    case 'sourceSummary':
      return m.activity_template_requirement_source_summary();
    case 'gradeBand':
      return m.activity_template_requirement_grade_band();
    case 'vocabulary':
      return m.activity_template_requirement_vocabulary();
  }
}

export function formatTemplateRequirements(
  requirements: readonly ActivityTemplateContentRequirement[]
) {
  return formatTemplateRequirementViews(requirements).map(
    (requirement) => requirement.label
  );
}

export function formatTemplateRequirementViews(
  requirements: readonly ActivityTemplateContentRequirement[]
): TemplateRequirementView[] {
  return requirements.map((requirement) => ({
    id: requirement,
    label: formatTemplateRequirement(requirement),
  }));
}
export function getActivityTemplateDraftGuidance(
  templateType: ActivityTemplateType
) {
  switch (templateType) {
    case 'fill-blank':
      return m.activity_template_draft_guidance_fill_blank();
    case 'group-sort':
      return m.activity_template_draft_guidance_group_sort();
    case 'line-match':
      return m.activity_template_draft_guidance_line_match();
    case 'listening':
      return m.activity_template_draft_guidance_listening();
    case 'match-up':
      return m.activity_template_draft_guidance_match_up();
    case 'matching-pairs':
      return m.activity_template_draft_guidance_matching_pairs();
    case 'open-box':
      return m.activity_template_draft_guidance_open_box();
    case 'quiz':
      return m.activity_template_draft_guidance_quiz();
  }
}
