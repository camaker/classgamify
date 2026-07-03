import type {
  ActivityContent,
  ActivityCreatableVisibility,
  ActivityDifficulty,
  ActivitySeed,
  ActivityTemplateDefinition,
  ActivityTemplateType,
  ActivityVisibility,
} from '@/activities/types';
import {
  ACTIVITY_CREATABLE_VISIBILITIES,
  ACTIVITY_DIFFICULTIES,
} from '@/activities/types';
import {
  buildGenerateActivityDraftInputFromEditor,
  type GenerateActivityDraftInput,
} from '@/activities/ai-draft';
import {
  formatActivityTemplateClassroomMode,
  getActivityTemplates,
  getTemplateByType,
} from '@/activities/catalog';
import {
  activityEditPageCopy,
  buildActivityEditAccessView,
  type ActivityEditAccessView,
} from '@/activities/lifecycle';
import { m } from '@/locale/paraglide/messages';
import { Routes } from '@/lib/routes';
import {
  ACTIVITY_DRAFT_SOURCE_MAX_LENGTH,
  appendActivitySourceMaterialDraftNotes,
  buildActivitySourceMaterialDraftNoteSafetySummaryFromSourceText,
  buildActivitySourceMaterialDraftNoteViewsFromSourceText,
  buildActivitySourceMaterialDraftSummary,
  getActivitySourceMaterialDraftNoteIdentityKey,
  getActivityDraftSourceText,
  hasActivitySourceMaterialDraftNotes,
  isDefaultActivityDraftSourceText,
  normalizeActivityDraftSourceText,
  type ActivitySourceMaterialDraftNoteView,
} from '@/activities/draft-source';
import {
  buildActivityAiDraftFocusOptions,
  type ActivityAiDraftFocusOption,
} from '@/activities/ai-draft-focus';
import {
  formatEditorGroupRows,
  formatEditorInlineList,
  formatEditorLineList,
  formatEditorPairRows,
  formatEditorQuestionRows,
} from '@/activities/editor-serialization';
import { normalizeActivityMaterialReferences } from '@/activities/material-references';
import { getRuntimeItems } from '@/activities/runtime';
import {
  buildActivitySourceMaterialCapabilityCountsFromActions,
  buildActivitySourceMaterialCapabilityViews,
  buildActivitySourceMaterialSummaryView,
  type ActivitySourceMaterialCapabilityCounts,
  type ActivitySourceMaterialCapabilityView,
  type ActivitySourceMaterialReadinessCapability,
} from '@/activities/material-summary';
import {
  buildActivityTemplateScaffoldInput,
  buildActivityTemplateScaffoldReadinessSummary,
  getActivityTemplateScaffold,
  type ActivityTemplateScaffoldCoverageMetricView,
  type ActivityTemplateScaffoldReadyOptionView,
  type ActivityTemplateScaffoldReadinessSummary,
} from '@/activities/scaffolds';
import {
  buildActivityTemplateReadinessPanelSummary,
  type ActivityTemplateReadinessPanelSummary,
} from '@/activities/draft-meta';
import type { CreateActivityTemplateSource } from '@/activities/template-entry';
import {
  buildActivityContent,
  createActivityInputSchema,
  parseActivityContent,
  type CreateActivityInput,
} from '@/activities/validation';
import {
  formatTemplateRequirementList,
  formatTemplateRequirementViews,
  formatTemplateRequirements,
  getTemplateRemixPlan,
  type TemplateRequirementView,
  type TemplateRemixPlan,
  type TemplateRemixTemplateOption,
} from '@/activities/template-remix';
import {
  normalizeOptionalRuntimeDisplayText,
  normalizeRuntimeDisplayText,
} from '@/activities/runtime-display';

export const ACTIVITY_EDITOR_READINESS_PANEL_LIMITS = {
  lockedOptions: 4,
} as const;

export const ACTIVITY_EDITOR_SECTION_IDS = {
  editor: 'activity-editor',
  templateReadiness: 'activity-template-readiness',
} as const;

export type ActivityEditorSectionId =
  (typeof ACTIVITY_EDITOR_SECTION_IDS)[keyof typeof ACTIVITY_EDITOR_SECTION_IDS];

export type ActivityEditorSectionHref = `#${ActivityEditorSectionId}`;

type ActivityEditorSource = {
  content: ActivityContent;
  description?: string | null;
  templateType: ActivityTemplateType;
  title: string;
  visibility: ActivityVisibility;
};

type ActivityEditorPreviewPanel = {
  actions: Array<{
    href: `#${string}`;
    icon: 'edit';
    id: string;
    label: string;
  }>;
  description: string;
  editorSectionId: string;
  title: string;
};

export type ActivityEditorTemplateSetupView = {
  actionLabel: string;
  description: string;
  requirementBadges: ActivityEditorTemplateRequirementBadgeView[];
  reviewChecklistItems: ActivityEditorTemplateScaffoldReviewItemView[];
  reviewChecklistLabel: string;
  scaffoldSummary: ActivityTemplateScaffoldReadinessSummary;
  shortName: string;
  successMessage: string;
  title: string;
};

export const ACTIVITY_EDITOR_TEMPLATE_HANDOFF_ITEM_IDS = [
  'selected-template',
  'template-short-name',
  'classroom-mode',
  'required-content',
  'current-template-readiness',
  'ready-template-count',
  'ready-template-options',
  'suggested-remix-options',
  'locked-template-count',
  'locked-template-options',
  'question-choice-readiness',
  'scaffold-action',
  'scaffold-runtime-items',
  'scaffold-ready-modes',
  'scaffold-reusable-coverage',
  'scaffold-questions',
  'scaffold-pairs',
  'scaffold-groups',
  'scaffold-vocabulary',
  'scaffold-teacher-notes',
] as const;

export type ActivityEditorTemplateHandoffItemId =
  (typeof ACTIVITY_EDITOR_TEMPLATE_HANDOFF_ITEM_IDS)[number];

export type ActivityEditorTemplateHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: ActivityEditorTemplateHandoffItemId;
  label: string;
  statusLabel?: string;
  value: string;
};

export type ActivityEditorTemplateHandoffPrivacyContract = {
  exposesAnswerText: false;
  exposesQuestionPromptText: false;
  exposesRawEditorInput: false;
  exposesRawScaffoldContent: false;
  exposesSourceMaterialFileIds: false;
  exposesSourceMaterialStorageKeys: false;
  exposesTeacherNotesText: false;
  itemIds: ActivityEditorTemplateHandoffItemId[];
};

export type ActivityEditorTemplateHandoffView = {
  description: string;
  itemViews: ActivityEditorTemplateHandoffItemView[];
  privacy: ActivityEditorTemplateHandoffPrivacyContract;
  title: string;
};

export type ActivityEditorTemplateScaffoldReviewItemId =
  | 'check-ready-modes'
  | 'edit-before-save'
  | 'review-fields';

export type ActivityEditorTemplateScaffoldReviewItemView = {
  actionHref: ActivityEditorSectionHref;
  actionLabel: string;
  ariaLabel: string;
  description: string;
  id: ActivityEditorTemplateScaffoldReviewItemId;
  label: string;
};

export type ActivityEditorTemplateRequirementBadgeView =
  TemplateRequirementView;

export type ActivityEditorTemplateScaffoldSummaryView =
  ActivityTemplateScaffoldReadinessSummary;

export type ActivityEditorTemplateScaffoldCoverageMetricView =
  ActivityTemplateScaffoldCoverageMetricView;

export type ActivityEditorTemplateScaffoldReadyOptionView =
  ActivityTemplateScaffoldReadyOptionView;

type ActivityEditorSelectOption<TValue extends string> = {
  label: string;
  value: TValue;
};

export type ActivityEditorSelectOptionsView = {
  difficultyOptions: ActivityEditorSelectOption<ActivityDifficulty>[];
  templateOptions: ActivityTemplateDefinition[];
  visibilityOptions: ActivityEditorSelectOption<ActivityCreatableVisibility>[];
};

type ActivityEditorDraftSourceState = {
  attachedSourceMaterialCount: number;
  canSyncDraftSourceMaterials: boolean;
  hasAttachedSourceMaterials: boolean;
  hasDraftSourceMaterialNotes: boolean;
  isDefaultSource: boolean;
  isTooLong: boolean;
  omittedSourceMaterialNoteCount: number;
  safeSourceMaterialNoteCount: number;
  sourceMaterialCapabilityCounts: ActivitySourceMaterialCapabilityCounts;
  sourceMaterialNoteInputCount: number;
  sourceLength: number;
};

export type ActivityEditorAiDraftSourceCapabilityView =
  ActivitySourceMaterialCapabilityView<{
    description: string;
    label: string;
  }>;

export type ActivityEditorSourceMaterialDraftNoteView =
  ActivitySourceMaterialDraftNoteView & {
    displayText: string;
    key: string;
  };

export type ActivityEditorAiDraftSourceReadinessView = {
  characterCountLabel: string;
  description: string;
  hasWarnings: boolean;
  status: 'default-source' | 'ready' | 'sync-available' | 'synced-materials';
  title: string;
};

export type ActivityEditorAiDraftSourceMaterialSafetyMetricId =
  | 'omitted'
  | 'safe';

export type ActivityEditorAiDraftSourceMaterialSafetyMetricView = {
  ariaLabel: string;
  description: string;
  id: ActivityEditorAiDraftSourceMaterialSafetyMetricId;
  label: string;
  value: string;
};

export type ActivityEditorAiDraftSourceMaterialSafetyView = {
  ariaLabel: string;
  description: string;
  hasInput: boolean;
  hasOmitted: boolean;
  metricViews: ActivityEditorAiDraftSourceMaterialSafetyMetricView[];
  title: string;
};

export type ActivityEditorAiDraftSourceHandoffItemId =
  | 'attached-materials'
  | 'capability-audio-extraction'
  | 'capability-spreadsheet-import'
  | 'capability-worksheet-extraction'
  | 'focus'
  | 'generate-action'
  | 'generation-gate'
  | 'item-count'
  | 'material-safety'
  | 'omitted-material-notes'
  | 'prompt-privacy'
  | 'safe-material-notes'
  | 'safe-source'
  | 'source-length'
  | 'source-readiness'
  | 'source-textarea'
  | 'source-warning'
  | 'sync-action'
  | 'synced-material-provenance'
  | 'teacher-review';

export type ActivityEditorAiDraftSourceHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: ActivityEditorAiDraftSourceHandoffItemId;
  label: string;
  statusLabel?: string;
  value: string;
};

export type ActivityEditorAiDraftSourcePrivacyContractView = {
  exposesFileBytes: false;
  exposesFileIds: false;
  exposesOmittedNotePayloads: false;
  exposesPathSegments: false;
  exposesPermissionMetadata: false;
  exposesQueryTokens: false;
  exposesStorageKeys: false;
  exposesUrls: false;
  itemIds: ActivityEditorAiDraftSourceHandoffItemId[];
};

export type ActivityEditorAiDraftSourceHandoffView = {
  description: string;
  itemViews: ActivityEditorAiDraftSourceHandoffItemView[];
  privacy: ActivityEditorAiDraftSourcePrivacyContractView;
  title: string;
};

export type ActivityEditorAiDraftPanelView = {
  badgeLabel: string;
  canGenerateDraft: boolean;
  canSyncDraftSourceMaterials: boolean;
  generationDisabledReason?: string;
  focusLabel: string;
  focusOptions: ActivityAiDraftFocusOption[];
  generateButtonLabel: string;
  itemCountDescription: string;
  itemCountLabel: string;
  reviewNote: string;
  safeSourceDescription: string;
  sourceCapabilityTitle: string;
  sourceCapabilityViews: ActivityEditorAiDraftSourceCapabilityView[];
  sourceHandoffView: ActivityEditorAiDraftSourceHandoffView;
  sourceMaterialSafetyView: ActivityEditorAiDraftSourceMaterialSafetyView;
  sourceReadiness: ActivityEditorAiDraftSourceReadinessView;
  sourceMaterialNoteViews: ActivityEditorSourceMaterialDraftNoteView[];
  sourceMaterialSummaryLabel?: string;
  sourcePlaceholder: string;
  sourceTextLabel: string;
  syncMaterialsLabel: string;
  syncMaterialsHelpText: string;
  syncSuccessMessage: string;
};

export type ActivityEditorAiDraftSourceCapabilityCardView =
  ActivityEditorAiDraftSourceCapabilityView;

export type ActivityEditorDraftGenerationBlockedReason =
  | 'auth-required'
  | 'source-required'
  | 'source-too-long';

type ActivityEditorDraftGenerationGate =
  | {
      canGenerate: false;
      errorMessage: string;
      reason: ActivityEditorDraftGenerationBlockedReason;
      sourceText: string;
    }
  | {
      canGenerate: true;
      sourceText: string;
    };

export type ActivityEditorDraftGenerationExecutionPlan =
  | {
      failureMessage: string;
      message: string;
      reason: ActivityEditorDraftGenerationBlockedReason;
      type: 'blocked';
    }
  | {
      failureMessage: string;
      input: GenerateActivityDraftInput;
      type: 'generate';
    };

type ActivityEditorMode = 'create' | 'edit';

export type ActivityEditorModeView = {
  footerHint: string;
  isEditMode: boolean;
  saveLabel: string;
  saveSuccessMessage: string;
  title: string;
};

export type ActivityEditorSaveBlockedReason =
  | 'auth-required'
  | 'missing-activity-id';

type ActivityEditorSaveGate =
  | {
      canSave: false;
      errorMessage: string;
      mode: ActivityEditorMode;
      reason: ActivityEditorSaveBlockedReason;
    }
  | {
      canSave: true;
      mode: 'create';
    }
  | {
      activityId: string;
      canSave: true;
      mode: 'edit';
    };

export type ActivityEditorSaveExecutionPlan =
  | {
      failureMessage: string;
      message: string;
      reason: ActivityEditorSaveBlockedReason;
      type: 'blocked';
    }
  | {
      failureMessage: string;
      input: CreateActivityInput;
      successMessage: string;
      type: 'create';
    }
  | {
      failureMessage: string;
      input: CreateActivityInput & {
        id: string;
      };
      successMessage: string;
      type: 'edit';
    };

type ActivityEditorTemplateScaffoldApplication = {
  draftSourceText: string;
  successMessage: string;
  values: CreateActivityInput;
};

export type ActivityEditorTemplateView = {
  handoffView: ActivityEditorTemplateHandoffView;
  readinessSummary: ActivityTemplateReadinessPanelSummary;
  setupView: ActivityEditorTemplateSetupView;
  template: ActivityTemplateDefinition;
  templateOptions: ActivityTemplateDefinition[];
};

export type ActivityEditorSelectedTemplateView = ActivityTemplateDefinition;

export type ActivityCreatePageInputShapeItemId =
  | 'groups'
  | 'notes'
  | 'pairs'
  | 'questions';

export type ActivityCreatePageInputShapeItemView = {
  id: ActivityCreatePageInputShapeItemId;
  label: string;
};

export type ActivityCreatePageInputShapeView = {
  itemViews: ActivityCreatePageInputShapeItemView[];
  title: string;
};

export type ActivityCreatePageTemplateEntryMetricId =
  | 'readyModes'
  | 'runtimeItems';

export type ActivityCreatePageTemplateEntryMetricView = {
  id: ActivityCreatePageTemplateEntryMetricId;
  label: string;
  value: string;
};

export type ActivityCreatePageTemplateSource = CreateActivityTemplateSource;

export type ActivityCreatePageTemplateEntryView = {
  description: string;
  isTemplateEntry: boolean;
  metrics: ActivityCreatePageTemplateEntryMetricView[];
  nextStep: string;
  shortName: string;
  source: ActivityCreatePageTemplateSource | 'direct';
  sourceDescription: string;
  sourceLabel: string;
  title: string;
};

export type ActivityCreatePageViewModel = {
  hero: {
    badgeLabel: string;
    description: string;
    title: string;
  };
  inputShape: ActivityCreatePageInputShapeView;
  previewLabel: string;
  templateEntry: ActivityCreatePageTemplateEntryView;
};

export type ActivityCreatePageEditorViewModel = ActivityCreatePageViewModel & {
  initialValues?: CreateActivityInput;
  previewActivity: ActivitySeed;
  previewPanel: ActivityEditorPreviewPanel;
};

type ActivityCreatePageEditorInput = {
  templateSource?: CreateActivityTemplateSource;
  templateType?: ActivityTemplateType;
};

type ActivityEditPageActivitySource = Omit<ActivityEditorSource, 'content'> & {
  contentJson: ActivityContent;
  id: string;
};

type ActivityEditorPageBreadcrumb = {
  href?: string;
  id: 'activities' | 'current' | 'dashboard';
  isCurrentPage?: boolean;
  label: string;
};

export type ActivityEditPageEditorView = {
  activityId: string;
  initialValues: CreateActivityInput;
  mode: 'edit';
};

export type ActivityEditPageViewModel = {
  archivedActivitiesAction: {
    href: typeof Routes.DashboardActivities;
    search: {
      status: 'archived';
    };
  };
  backAction: {
    href: typeof Routes.DashboardActivities;
    label: string;
  };
  breadcrumbs: ActivityEditorPageBreadcrumb[];
  description: string;
  editAccessView: ActivityEditAccessView | null;
  editor?: ActivityEditPageEditorView;
  loadErrorMessage: string;
  title: string;
};

type ActivityEditBlockedPageViewModel = ActivityEditPageViewModel & {
  editAccessView: ActivityEditAccessView;
};

type ActivityEditReadyPageViewModel = ActivityEditPageViewModel & {
  editor: ActivityEditPageEditorView;
};

export type ActivityEditRouteState =
  | {
      pageView: ActivityEditPageViewModel;
      status: 'loading';
    }
  | {
      pageView: ActivityEditPageViewModel;
      status: 'error';
    }
  | {
      pageView: ActivityEditBlockedPageViewModel;
      status: 'blocked';
    }
  | {
      pageView: ActivityEditReadyPageViewModel;
      status: 'ready';
    };

const activityEditorSectionId = ACTIVITY_EDITOR_SECTION_IDS.editor;

export function getActivityEditorDefaultInput(): CreateActivityInput {
  return {
    description: m.activity_editor_default_description(),
    difficulty: 'starter',
    gradeBand: m.activity_editor_default_grade_band(),
    groupsText: m.activity_editor_default_groups_text(),
    language: 'en',
    learningGoal: m.activity_editor_default_learning_goal(),
    pairsText: m.activity_editor_default_pairs_text(),
    questionsText: m.activity_editor_default_questions_text(),
    sourceSummary: m.activity_editor_default_source_summary(),
    sourceMaterials: [],
    subject: m.activity_editor_default_subject(),
    teacherNotesText: m.activity_editor_default_teacher_notes_text(),
    templateType: 'quiz',
    title: m.activity_editor_default_title(),
    visibility: 'draft',
    vocabularyText: m.activity_editor_default_vocabulary_text(),
  };
}

export function buildActivityEditorDraftSourceText(
  values: CreateActivityInput
) {
  return getActivityDraftSourceText(values);
}

export function buildActivityEditorDraftSourceState({
  draftSourceText,
  sourceMaterials,
}: {
  draftSourceText: string;
  sourceMaterials: unknown;
}): ActivityEditorDraftSourceState {
  const normalizedSourceText =
    normalizeActivityDraftSourceText(draftSourceText);
  const sourceMaterialSummary =
    buildActivitySourceMaterialDraftSummary(sourceMaterials);
  const sourceMaterialSummaryView =
    buildActivitySourceMaterialSummaryView(sourceMaterials);
  const hasAttachedSourceMaterials = sourceMaterialSummary.totalCount > 0;
  const hasDraftSourceMaterialNotes =
    hasActivitySourceMaterialDraftNotes(normalizedSourceText);
  const sourceMaterialNoteSafetySummary =
    buildActivitySourceMaterialDraftNoteSafetySummaryFromSourceText(
      normalizedSourceText
    );

  return {
    attachedSourceMaterialCount: sourceMaterialSummary.totalCount,
    canSyncDraftSourceMaterials:
      hasAttachedSourceMaterials || hasDraftSourceMaterialNotes,
    hasAttachedSourceMaterials,
    hasDraftSourceMaterialNotes,
    isDefaultSource: isDefaultActivityDraftSourceText(normalizedSourceText),
    isTooLong: normalizedSourceText.length > ACTIVITY_DRAFT_SOURCE_MAX_LENGTH,
    omittedSourceMaterialNoteCount:
      sourceMaterialNoteSafetySummary.omittedCount,
    safeSourceMaterialNoteCount: sourceMaterialNoteSafetySummary.safeCount,
    sourceMaterialCapabilityCounts:
      buildActivitySourceMaterialCapabilityCountsFromActions(
        sourceMaterialSummaryView.extractionActions
      ),
    sourceMaterialNoteInputCount: sourceMaterialNoteSafetySummary.inputCount,
    sourceLength: normalizedSourceText.length,
  };
}

export function buildActivityEditorAiDraftPanelView({
  draftSourceText = '',
  hasUser,
  isGeneratingDraft,
  sourceState,
}: {
  draftSourceText?: string;
  hasUser: boolean;
  isGeneratingDraft: boolean;
  sourceState: ActivityEditorDraftSourceState;
}): ActivityEditorAiDraftPanelView {
  const canGenerateDraft =
    hasUser && !isGeneratingDraft && !sourceState.isTooLong;
  const generationDisabledReason =
    buildActivityEditorDraftGenerationDisabledReason({
      hasUser,
      isGeneratingDraft,
      sourceState,
    });
  const focusOptions = buildActivityAiDraftFocusOptions();
  const itemCountDescription = m.activity_form_ai_item_count_description();
  const itemCountLabel = m.activity_form_ai_item_count_label();
  const safeSourceDescription = m.activity_form_ai_safe_source_description();
  const sourceCapabilityViews = buildActivityEditorAiDraftSourceCapabilityViews(
    sourceState.sourceMaterialCapabilityCounts
  );
  const sourceMaterialSafetyView =
    buildActivityEditorAiDraftSourceMaterialSafetyView(sourceState);
  const sourceReadiness =
    buildActivityEditorAiDraftSourceReadinessView(sourceState);
  const sourceMaterialNoteViews =
    buildActivitySourceMaterialDraftNoteViewsFromSourceText(
      draftSourceText
    ).flatMap((noteView) => {
      const key = getActivitySourceMaterialDraftNoteIdentityKey(noteView);
      if (!key) return [];

      return [
        {
          ...noteView,
          displayText: m.activity_form_ai_source_material_item({
            kind: noteView.kindLabel,
            name: noteView.name,
          }),
          key,
        },
      ];
    });
  const sourceMaterialSummaryLabel =
    sourceMaterialNoteViews.length > 0
      ? buildActivityEditorSourceMaterialSummaryLabel(
          sourceMaterialNoteViews.length
        )
      : undefined;
  const syncMaterialsHelpText = m.activity_form_ai_sync_materials_help();

  return {
    badgeLabel: m.activity_form_ai_draft_badge(),
    canGenerateDraft,
    canSyncDraftSourceMaterials: sourceState.canSyncDraftSourceMaterials,
    generationDisabledReason,
    focusLabel: m.activity_form_ai_focus_label(),
    focusOptions,
    generateButtonLabel: m.activity_form_generate_draft(),
    itemCountDescription,
    itemCountLabel,
    reviewNote: m.activity_form_ai_draft_review_note(),
    safeSourceDescription,
    sourceCapabilityTitle: m.activity_form_ai_source_capabilities_title(),
    sourceCapabilityViews,
    sourceHandoffView: buildActivityEditorAiDraftSourceHandoffView({
      canGenerateDraft,
      canSyncDraftSourceMaterials: sourceState.canSyncDraftSourceMaterials,
      focusOptions,
      generationDisabledReason,
      itemCountDescription,
      itemCountLabel,
      safeSourceDescription,
      sourceMaterialSafetyView,
      sourceMaterialNoteViews,
      sourceMaterialSummaryLabel,
      sourceReadiness,
      sourceState,
      syncMaterialsHelpText,
    }),
    sourceMaterialSafetyView,
    sourceReadiness,
    sourceMaterialNoteViews,
    sourceMaterialSummaryLabel,
    sourcePlaceholder: m.activity_form_ai_source_placeholder(),
    sourceTextLabel: m.activity_form_ai_source_label(),
    syncMaterialsLabel: m.activity_form_use_attached_materials(),
    syncMaterialsHelpText,
    syncSuccessMessage: m.activity_form_toast_source_materials_synced(),
  };
}

function buildActivityEditorAiDraftSourceCapabilityViews(
  capabilityCounts: ActivitySourceMaterialCapabilityCounts,
  options: { includeZero?: boolean } = {}
): ActivityEditorAiDraftSourceCapabilityView[] {
  return buildActivitySourceMaterialCapabilityViews({
    capabilityCounts,
    copy: {
      'audio-extraction': {
        description: m.activity_form_ai_source_capability_audio_description(),
        label: m.activity_form_ai_source_capability_audio_label(),
      },
      'spreadsheet-import': {
        description:
          m.activity_form_ai_source_capability_spreadsheet_description(),
        label: m.activity_form_ai_source_capability_spreadsheet_label(),
      },
      'worksheet-extraction': {
        description:
          m.activity_form_ai_source_capability_worksheet_description(),
        label: m.activity_form_ai_source_capability_worksheet_label(),
      },
    },
    includeZero: options.includeZero,
  });
}

function buildActivityEditorAiDraftSourceHandoffView({
  canGenerateDraft,
  canSyncDraftSourceMaterials,
  focusOptions,
  generationDisabledReason,
  itemCountDescription,
  itemCountLabel,
  safeSourceDescription,
  sourceMaterialSafetyView,
  sourceMaterialNoteViews,
  sourceMaterialSummaryLabel,
  sourceReadiness,
  sourceState,
  syncMaterialsHelpText,
}: {
  canGenerateDraft: boolean;
  canSyncDraftSourceMaterials: boolean;
  focusOptions: ActivityAiDraftFocusOption[];
  generationDisabledReason?: string;
  itemCountDescription: string;
  itemCountLabel: string;
  safeSourceDescription: string;
  sourceMaterialSafetyView: ActivityEditorAiDraftSourceMaterialSafetyView;
  sourceMaterialNoteViews: ActivityEditorSourceMaterialDraftNoteView[];
  sourceMaterialSummaryLabel?: string;
  sourceReadiness: ActivityEditorAiDraftSourceReadinessView;
  sourceState: ActivityEditorDraftSourceState;
  syncMaterialsHelpText: string;
}): ActivityEditorAiDraftSourceHandoffView {
  const enabledValue = m.activity_form_ai_source_handoff_enabled_value();
  const disabledValue = m.activity_form_ai_source_handoff_disabled_value();
  const readyValue = m.activity_form_ai_source_handoff_ready_value();
  const blockedValue = m.activity_form_ai_source_handoff_blocked_value();
  const warningValue = m.activity_form_ai_source_handoff_warning_value();
  const clearValue = m.activity_form_ai_source_handoff_clear_value();
  const itemViews: ActivityEditorAiDraftSourceHandoffItemView[] = [
    buildActivityEditorAiDraftSourceHandoffItem({
      description: safeSourceDescription,
      id: 'safe-source',
      label: m.activity_form_ai_draft_badge(),
      value: m.activity_form_ai_source_handoff_prompt_privacy_value(),
    }),
    buildActivityEditorAiDraftSourceHandoffItem({
      description: m.activity_form_ai_source_handoff_textarea_description(),
      id: 'source-textarea',
      label: m.activity_form_ai_source_label(),
      value: sourceReadiness.status,
    }),
    buildActivityEditorAiDraftSourceHandoffItem({
      description: sourceReadiness.description,
      id: 'source-readiness',
      label: sourceReadiness.title,
      statusLabel: sourceReadiness.hasWarnings ? warningValue : clearValue,
      value: sourceReadiness.status,
    }),
    buildActivityEditorAiDraftSourceHandoffItem({
      description: sourceReadiness.description,
      id: 'source-length',
      label: m.activity_form_ai_source_label(),
      value: sourceReadiness.characterCountLabel,
    }),
    buildActivityEditorAiDraftSourceHandoffItem({
      description: sourceReadiness.description,
      id: 'source-warning',
      label: sourceReadiness.title,
      value: sourceReadiness.hasWarnings ? warningValue : clearValue,
    }),
    buildActivityEditorAiDraftSourceHandoffItem({
      description: m.activity_form_ai_draft_review_note(),
      id: 'teacher-review',
      label: m.activity_form_ai_draft_review_note(),
      value: readyValue,
    }),
    buildActivityEditorAiDraftSourceHandoffItem({
      description: itemCountDescription,
      id: 'item-count',
      label: itemCountLabel,
      value: itemCountLabel,
    }),
    buildActivityEditorAiDraftSourceHandoffItem({
      description: m.activity_form_ai_source_handoff_focus_description({
        count: focusOptions.length,
      }),
      id: 'focus',
      label: m.activity_form_ai_focus_label(),
      value: m.activity_form_ai_source_handoff_focus_value({
        count: focusOptions.length,
      }),
    }),
    buildActivityEditorAiDraftSourceHandoffItem({
      description: syncMaterialsHelpText,
      id: 'sync-action',
      label: m.activity_form_use_attached_materials(),
      value: canSyncDraftSourceMaterials ? enabledValue : disabledValue,
    }),
    buildActivityEditorAiDraftSourceHandoffItem({
      description:
        generationDisabledReason ??
        m.activity_form_ai_source_handoff_generate_description(),
      id: 'generate-action',
      label: m.activity_form_generate_draft(),
      value: canGenerateDraft ? readyValue : blockedValue,
    }),
    buildActivityEditorAiDraftSourceHandoffItem({
      description:
        generationDisabledReason ??
        m.activity_form_ai_source_handoff_generation_gate_description(),
      id: 'generation-gate',
      label: m.activity_form_ai_source_handoff_generation_gate_label(),
      value:
        generationDisabledReason ??
        m.activity_form_ai_source_handoff_no_blocker_value(),
    }),
    buildActivityEditorAiDraftSourceHandoffItem({
      description:
        m.activity_form_ai_source_handoff_attached_materials_description(),
      id: 'attached-materials',
      label: m.activity_form_ai_source_handoff_attached_materials_label(),
      value: m.activity_form_ai_source_handoff_attached_materials_value({
        count: sourceState.attachedSourceMaterialCount,
      }),
    }),
    buildActivityEditorAiDraftSourceHandoffItem({
      description: sourceMaterialSafetyView.description,
      id: 'material-safety',
      label: sourceMaterialSafetyView.title,
      statusLabel: sourceMaterialSafetyView.hasOmitted
        ? warningValue
        : clearValue,
      value: sourceMaterialSafetyView.ariaLabel,
    }),
    ...sourceMaterialSafetyView.metricViews.map((metricView) =>
      buildActivityEditorAiDraftSourceHandoffItem({
        description: metricView.description,
        id:
          metricView.id === 'safe'
            ? 'safe-material-notes'
            : 'omitted-material-notes',
        label: metricView.label,
        value: metricView.value,
      })
    ),
    buildActivityEditorAiDraftSourceHandoffItem({
      description:
        m.activity_form_ai_source_handoff_synced_provenance_description(),
      id: 'synced-material-provenance',
      label: m.activity_form_ai_source_handoff_synced_provenance_label(),
      value: buildActivityEditorAiDraftSyncedProvenanceHandoffValue({
        sourceMaterialNoteViews,
        sourceMaterialSummaryLabel,
      }),
    }),
    ...buildActivityEditorAiDraftSourceCapabilityHandoffItems(
      sourceState.sourceMaterialCapabilityCounts
    ),
    buildActivityEditorAiDraftSourceHandoffItem({
      description:
        m.activity_form_ai_source_handoff_prompt_privacy_description(),
      id: 'prompt-privacy',
      label: m.activity_form_ai_source_handoff_prompt_privacy_label(),
      value: m.activity_form_ai_source_handoff_prompt_privacy_value(),
    }),
  ];

  return {
    description: m.activity_form_ai_source_handoff_description(),
    itemViews,
    privacy: buildActivityEditorAiDraftSourcePrivacyContract(itemViews),
    title: m.activity_form_ai_source_handoff_title(),
  };
}

function buildActivityEditorAiDraftSyncedProvenanceHandoffValue({
  sourceMaterialNoteViews,
  sourceMaterialSummaryLabel,
}: {
  sourceMaterialNoteViews: ActivityEditorSourceMaterialDraftNoteView[];
  sourceMaterialSummaryLabel?: string;
}) {
  if (sourceMaterialNoteViews.length > 0) {
    return sourceMaterialNoteViews
      .map((noteView) => noteView.displayText)
      .join(m.activity_source_material_summary_list_separator());
  }

  return (
    sourceMaterialSummaryLabel ??
    buildActivityEditorAiDraftSafeSourceCountValue(
      sourceMaterialNoteViews.length
    )
  );
}

function buildActivityEditorAiDraftSourceCapabilityHandoffItems(
  capabilityCounts: ActivitySourceMaterialCapabilityCounts
): ActivityEditorAiDraftSourceHandoffItemView[] {
  return buildActivityEditorAiDraftSourceCapabilityViews(capabilityCounts, {
    includeZero: true,
  }).map((capability) =>
    buildActivityEditorAiDraftSourceHandoffItem({
      description:
        capability.description ??
        m.activity_form_ai_source_capabilities_title(),
      id: toActivityEditorAiDraftSourceCapabilityHandoffItemId(
        capability.capability
      ),
      label: capability.label,
      value: capability.value,
    })
  );
}

function toActivityEditorAiDraftSourceCapabilityHandoffItemId(
  capability: ActivitySourceMaterialReadinessCapability
): ActivityEditorAiDraftSourceHandoffItemId {
  return `capability-${capability}`;
}

function buildActivityEditorAiDraftSourcePrivacyContract(
  itemViews: ActivityEditorAiDraftSourceHandoffItemView[]
): ActivityEditorAiDraftSourcePrivacyContractView {
  return {
    exposesFileBytes: false,
    exposesFileIds: false,
    exposesOmittedNotePayloads: false,
    exposesPathSegments: false,
    exposesPermissionMetadata: false,
    exposesQueryTokens: false,
    exposesStorageKeys: false,
    exposesUrls: false,
    itemIds: itemViews.map((item) => item.id),
  };
}

function buildActivityEditorAiDraftSourceHandoffItem({
  description,
  id,
  label,
  statusLabel,
  value,
}: {
  description: string;
  id: ActivityEditorAiDraftSourceHandoffItemId;
  label: string;
  statusLabel?: string;
  value: string;
}): ActivityEditorAiDraftSourceHandoffItemView {
  return {
    ariaLabel: m.activity_form_ai_source_material_safety_metric_aria_label({
      description,
      label,
      value,
    }),
    description,
    id,
    label,
    statusLabel,
    value,
  };
}

function buildActivityEditorAiDraftSourceMaterialSafetyView(
  sourceState: ActivityEditorDraftSourceState
): ActivityEditorAiDraftSourceMaterialSafetyView {
  const safeValue = buildActivityEditorAiDraftSafeSourceCountValue(
    sourceState.safeSourceMaterialNoteCount
  );
  const omittedValue = buildActivityEditorAiDraftOmittedSourceCountValue(
    sourceState.omittedSourceMaterialNoteCount
  );
  const safeDescription =
    m.activity_form_ai_source_material_safety_safe_description();
  const omittedDescription =
    m.activity_form_ai_source_material_safety_omitted_description();

  return {
    ariaLabel: m.activity_form_ai_source_material_safety_aria_label({
      omittedValue,
      safeValue,
    }),
    description: m.activity_form_ai_source_material_safety_description(),
    hasInput: sourceState.sourceMaterialNoteInputCount > 0,
    hasOmitted: sourceState.omittedSourceMaterialNoteCount > 0,
    metricViews: [
      {
        ariaLabel: m.activity_form_ai_source_material_safety_metric_aria_label({
          description: safeDescription,
          label: m.activity_form_ai_source_material_safety_safe_label(),
          value: safeValue,
        }),
        description: safeDescription,
        id: 'safe',
        label: m.activity_form_ai_source_material_safety_safe_label(),
        value: safeValue,
      },
      {
        ariaLabel: m.activity_form_ai_source_material_safety_metric_aria_label({
          description: omittedDescription,
          label: m.activity_form_ai_source_material_safety_omitted_label(),
          value: omittedValue,
        }),
        description: omittedDescription,
        id: 'omitted',
        label: m.activity_form_ai_source_material_safety_omitted_label(),
        value: omittedValue,
      },
    ],
    title: m.activity_form_ai_source_material_safety_title(),
  };
}

function buildActivityEditorAiDraftSourceReadinessView(
  sourceState: ActivityEditorDraftSourceState
): ActivityEditorAiDraftSourceReadinessView {
  const characterCountLabel = m.activity_form_ai_source_character_count({
    count: sourceState.sourceLength,
    max: ACTIVITY_DRAFT_SOURCE_MAX_LENGTH,
  });

  if (sourceState.isTooLong) {
    return {
      characterCountLabel,
      description: m.activity_ai_source_max_error(),
      hasWarnings: true,
      status: 'ready',
      title: m.activity_form_ai_source_readiness_ready_title(),
    };
  }

  if (sourceState.hasDraftSourceMaterialNotes) {
    return {
      characterCountLabel,
      description:
        sourceState.omittedSourceMaterialNoteCount > 0
          ? m.activity_form_ai_source_readiness_synced_with_omitted_description(
              {
                omittedCount: sourceState.omittedSourceMaterialNoteCount,
                safeCount: sourceState.safeSourceMaterialNoteCount,
              }
            )
          : m.activity_form_ai_source_readiness_synced_description({
              count: sourceState.safeSourceMaterialNoteCount,
            }),
      hasWarnings: sourceState.omittedSourceMaterialNoteCount > 0,
      status: 'synced-materials',
      title: m.activity_form_ai_source_readiness_synced_title(),
    };
  }

  if (sourceState.hasAttachedSourceMaterials) {
    return {
      characterCountLabel,
      description:
        m.activity_form_ai_source_readiness_sync_available_description({
          count: sourceState.attachedSourceMaterialCount,
        }),
      hasWarnings: true,
      status: 'sync-available',
      title: m.activity_form_ai_source_readiness_sync_available_title(),
    };
  }

  if (sourceState.isDefaultSource) {
    return {
      characterCountLabel,
      description: m.activity_form_ai_source_readiness_default_description(),
      hasWarnings: true,
      status: 'default-source',
      title: m.activity_form_ai_source_readiness_default_title(),
    };
  }

  return {
    characterCountLabel,
    description: m.activity_form_ai_source_readiness_ready_description(),
    hasWarnings: false,
    status: 'ready',
    title: m.activity_form_ai_source_readiness_ready_title(),
  };
}

function buildActivityEditorDraftGenerationDisabledReason({
  hasUser,
  isGeneratingDraft,
  sourceState,
}: {
  hasUser: boolean;
  isGeneratingDraft: boolean;
  sourceState: ActivityEditorDraftSourceState;
}) {
  if (!hasUser) return m.activity_form_ai_generation_sign_in_hint();
  if (isGeneratingDraft) return m.activity_form_ai_generation_pending_hint();
  if (sourceState.isTooLong) return m.activity_ai_source_max_error();
  return undefined;
}

function buildActivityEditorSourceMaterialSummaryLabel(count: number) {
  return count === 1
    ? m.activity_form_ai_source_material_count_one({ count })
    : m.activity_form_ai_source_material_count_many({ count });
}

function buildActivityEditorAiDraftSafeSourceCountValue(count: number) {
  if (count === 0) {
    return m.activity_form_ai_source_material_safety_safe_none_value();
  }

  return count === 1
    ? m.activity_form_ai_source_material_safety_safe_one_value({ count })
    : m.activity_form_ai_source_material_safety_safe_many_value({ count });
}

function buildActivityEditorAiDraftOmittedSourceCountValue(count: number) {
  if (count === 0) {
    return m.activity_form_ai_source_material_safety_omitted_none_value();
  }

  return count === 1
    ? m.activity_form_ai_source_material_safety_omitted_one_value({ count })
    : m.activity_form_ai_source_material_safety_omitted_many_value({ count });
}

export function buildActivityEditorSyncedDraftSourceText({
  sourceMaterials,
  sourceText,
}: {
  sourceMaterials: unknown;
  sourceText: string;
}) {
  return appendActivitySourceMaterialDraftNotes({
    sourceMaterials,
    sourceText,
  });
}

export function buildActivityEditorDraftGenerationGate({
  hasUser,
  sourceText,
}: {
  hasUser: boolean;
  sourceText: string;
}): ActivityEditorDraftGenerationGate {
  const normalizedSourceText = normalizeActivityDraftSourceText(sourceText);

  if (!hasUser) {
    return {
      canGenerate: false,
      errorMessage: m.activity_form_toast_sign_in_generate_draft(),
      reason: 'auth-required',
      sourceText: normalizedSourceText,
    };
  }

  if (!normalizedSourceText) {
    return {
      canGenerate: false,
      errorMessage: m.activity_form_toast_missing_draft_source(),
      reason: 'source-required',
      sourceText: normalizedSourceText,
    };
  }

  if (normalizedSourceText.length > ACTIVITY_DRAFT_SOURCE_MAX_LENGTH) {
    return {
      canGenerate: false,
      errorMessage: m.activity_ai_source_max_error(),
      reason: 'source-too-long',
      sourceText: normalizedSourceText,
    };
  }

  return {
    canGenerate: true,
    sourceText: normalizedSourceText,
  };
}

export function buildActivityEditorDraftGenerationExecutionPlan({
  current,
  draftFocus,
  hasUser,
  itemCount,
  sourceText,
}: {
  current: CreateActivityInput;
  draftFocus: ActivityAiDraftFocus;
  hasUser: boolean;
  itemCount: number;
  sourceText: string;
}): ActivityEditorDraftGenerationExecutionPlan {
  const draftGate = buildActivityEditorDraftGenerationGate({
    hasUser,
    sourceText,
  });
  const failureMessage = m.activity_form_toast_draft_generation_failed();

  if (!draftGate.canGenerate) {
    return {
      failureMessage,
      message: draftGate.errorMessage,
      reason: draftGate.reason,
      type: 'blocked',
    };
  }

  return {
    failureMessage,
    input: buildGenerateActivityDraftInputFromEditor({
      current,
      draftFocus,
      itemCount,
      sourceText: draftGate.sourceText,
    }),
    type: 'generate',
  };
}

export function buildActivityEditorDraftSuccessMessage({
  notice,
}: {
  notice?: string;
}) {
  return normalizeOptionalRuntimeDisplayText(notice)
    ? m.activity_form_toast_local_draft_generated()
    : m.activity_form_toast_ai_draft_generated();
}

export function buildActivityEditorModeView(
  mode: ActivityEditorMode
): ActivityEditorModeView {
  if (mode === 'edit') {
    return {
      footerHint: m.activity_form_footer_edit_hint(),
      isEditMode: true,
      saveLabel: m.activity_form_save_changes(),
      saveSuccessMessage: m.activity_form_toast_activity_updated(),
      title: m.activity_form_title_edit(),
    };
  }

  return {
    footerHint: m.activity_form_footer_create_hint(),
    isEditMode: false,
    saveLabel: m.activity_form_save_activity(),
    saveSuccessMessage: m.activity_form_toast_activity_saved(),
    title: m.activity_form_title_create(),
  };
}

export function buildActivityEditorSaveGate({
  activityId,
  hasUser,
  mode,
}: {
  activityId?: string;
  hasUser: boolean;
  mode: ActivityEditorMode;
}): ActivityEditorSaveGate {
  if (!hasUser) {
    return {
      canSave: false,
      errorMessage: m.activity_form_toast_sign_in_save(),
      mode,
      reason: 'auth-required',
    };
  }

  if (mode === 'edit') {
    if (!activityId) {
      return {
        canSave: false,
        errorMessage: m.activity_form_toast_edit_missing_activity(),
        mode,
        reason: 'missing-activity-id',
      };
    }

    return {
      activityId,
      canSave: true,
      mode,
    };
  }

  return {
    canSave: true,
    mode,
  };
}

export function buildActivityEditorSaveExecutionPlan({
  activityId,
  hasUser,
  mode,
  values,
}: {
  activityId?: string;
  hasUser: boolean;
  mode: ActivityEditorMode;
  values: CreateActivityInput;
}): ActivityEditorSaveExecutionPlan {
  const saveGate = buildActivityEditorSaveGate({
    activityId,
    hasUser,
    mode,
  });
  const modeView = buildActivityEditorModeView(mode);
  const failureMessage = m.activity_form_toast_save_failed();

  if (!saveGate.canSave) {
    return {
      failureMessage,
      message: saveGate.errorMessage,
      reason: saveGate.reason,
      type: 'blocked',
    };
  }

  if (saveGate.mode === 'edit') {
    return {
      failureMessage,
      input: {
        ...values,
        id: saveGate.activityId,
      },
      successMessage: modeView.saveSuccessMessage,
      type: 'edit',
    };
  }

  return {
    failureMessage,
    input: values,
    successMessage: modeView.saveSuccessMessage,
    type: 'create',
  };
}

export function buildActivityEditorSelectOptions(): ActivityEditorSelectOptionsView {
  return {
    difficultyOptions: ACTIVITY_DIFFICULTIES.map((value) => ({
      label: formatActivityEditorDifficulty(value),
      value,
    })),
    templateOptions: getActivityTemplates(),
    visibilityOptions: ACTIVITY_CREATABLE_VISIBILITIES.map((value) => ({
      label: formatActivityEditorVisibility(value),
      value,
    })),
  };
}

export function formatActivityEditorDifficulty(difficulty: ActivityDifficulty) {
  switch (difficulty) {
    case 'challenge':
      return m.activity_form_difficulty_challenge();
    case 'core':
      return m.activity_form_difficulty_core();
    case 'starter':
      return m.activity_form_difficulty_starter();
  }
}

export function formatActivityEditorVisibility(
  visibility: ActivityCreatableVisibility
) {
  switch (visibility) {
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

export function buildActivityEditorInitialValues(
  templateType?: ActivityTemplateType
): CreateActivityInput | undefined {
  if (!templateType) return undefined;

  const defaultInput = getActivityEditorDefaultInput();

  return {
    ...defaultInput,
    ...getActivityTemplateScaffold(templateType),
    templateType,
    visibility: defaultInput.visibility,
  };
}

export function buildActivityCreatePageViewModel({
  initialValues,
  templateSource,
  templateType,
}: {
  initialValues?: CreateActivityInput;
  templateSource?: CreateActivityTemplateSource;
  templateType?: ActivityTemplateType;
} = {}): ActivityCreatePageViewModel {
  const templateEntry = buildActivityCreatePageTemplateEntryView({
    initialValues,
    templateSource,
    templateType,
  });

  return {
    hero: {
      badgeLabel: m.create_page_eyebrow(),
      description: m.create_page_description(),
      title: m.create_page_title(),
    },
    inputShape: {
      itemViews: [
        {
          id: 'questions',
          label: m.create_page_input_shape_questions(),
        },
        {
          id: 'pairs',
          label: m.create_page_input_shape_pairs(),
        },
        {
          id: 'groups',
          label: m.create_page_input_shape_groups(),
        },
        {
          id: 'notes',
          label: m.create_page_input_shape_notes(),
        },
      ],
      title: m.create_page_input_shapes_title(),
    },
    previewLabel: m.create_page_preview_label(),
    templateEntry,
  };
}

export function buildActivityCreatePageEditorViewModel(
  input?: ActivityTemplateType | ActivityCreatePageEditorInput
): ActivityCreatePageEditorViewModel {
  const { templateSource, templateType } =
    normalizeActivityCreatePageEditorInput(input);
  const initialValues = buildActivityEditorInitialValues(templateType);

  return {
    ...buildActivityCreatePageViewModel({
      initialValues,
      templateSource,
      templateType,
    }),
    initialValues,
    previewActivity: buildActivityEditorPreviewSeed(initialValues),
    previewPanel: buildActivityEditorPreviewPanel(initialValues),
  };
}

function normalizeActivityCreatePageEditorInput(
  input?: ActivityTemplateType | ActivityCreatePageEditorInput
): ActivityCreatePageEditorInput {
  return typeof input === 'string' ? { templateType: input } : (input ?? {});
}

function buildActivityCreatePageTemplateEntryView({
  initialValues,
  templateSource,
  templateType,
}: {
  initialValues?: CreateActivityInput;
  templateSource?: CreateActivityTemplateSource;
  templateType?: ActivityTemplateType;
}): ActivityCreatePageTemplateEntryView {
  const effectiveInput = initialValues ?? getActivityEditorDefaultInput();
  const effectiveTemplateType = templateType ?? effectiveInput.templateType;
  const template = getTemplateByType(effectiveTemplateType);
  const content = buildActivityContent(effectiveInput);
  const readyTemplateCount = getTemplateRemixPlan({
    content,
    currentTemplateType: effectiveTemplateType,
  }).readyOptions.length;
  const sourceView = buildActivityCreatePageTemplateEntrySourceView({
    templateSource,
    templateType,
  });

  return {
    description: templateType
      ? m.create_page_template_entry_description({
          template: template.name,
        })
      : m.create_page_template_entry_default_description(),
    isTemplateEntry: Boolean(templateType),
    metrics: [
      {
        id: 'runtimeItems',
        label: m.create_page_template_entry_runtime_items_label(),
        value: m.create_page_template_entry_runtime_items_value({
          count: getRuntimeItems(effectiveTemplateType, content).length,
        }),
      },
      {
        id: 'readyModes',
        label: m.create_page_template_entry_ready_modes_label(),
        value: m.create_page_template_entry_ready_modes_value({
          count: readyTemplateCount,
        }),
      },
    ],
    nextStep: templateType
      ? m.create_page_template_entry_next_step_template({
          template: template.shortName,
        })
      : m.create_page_template_entry_next_step_default(),
    shortName: template.shortName,
    source: sourceView.source,
    sourceDescription: sourceView.description,
    sourceLabel: sourceView.label,
    title: templateType
      ? m.create_page_template_entry_title({
          template: template.name,
        })
      : m.create_page_template_entry_default_title(),
  };
}

function buildActivityCreatePageTemplateEntrySourceView({
  templateSource,
  templateType,
}: {
  templateSource?: CreateActivityTemplateSource;
  templateType?: ActivityTemplateType;
}): {
  description: string;
  label: string;
  source: ActivityCreatePageTemplateEntryView['source'];
} {
  if (templateSource === 'templates') {
    return {
      description: m.create_page_template_entry_source_templates_description(),
      label: m.create_page_template_entry_source_templates_label(),
      source: 'templates',
    };
  }

  if (templateSource === 'worksheets') {
    return {
      description: m.create_page_template_entry_source_worksheets_description(),
      label: m.create_page_template_entry_source_worksheets_label(),
      source: 'worksheets',
    };
  }

  if (templateType) {
    return {
      description:
        m.create_page_template_entry_source_direct_template_description(),
      label: m.create_page_template_entry_source_direct_template_label(),
      source: 'direct',
    };
  }

  return {
    description: m.create_page_template_entry_source_direct_description(),
    label: m.create_page_template_entry_source_direct_label(),
    source: 'direct',
  };
}

export function buildActivityEditPageViewModel(
  activity?: ActivityEditPageActivitySource | null
): ActivityEditPageViewModel {
  const title = activity?.title ?? activityEditPageCopy.fallbackTitle;
  const editAccessView = activity
    ? buildActivityEditAccessView(activity.visibility)
    : null;
  const editor =
    activity && editAccessView?.canEdit
      ? {
          activityId: activity.id,
          initialValues: activityContentToEditorInput({
            content: activity.contentJson,
            description: activity.description,
            templateType: activity.templateType,
            title: activity.title,
            visibility: activity.visibility,
          }),
          mode: 'edit' as const,
        }
      : undefined;

  return {
    archivedActivitiesAction: {
      href: Routes.DashboardActivities,
      search: { status: 'archived' },
    },
    backAction: {
      href: Routes.DashboardActivities,
      label: activityEditPageCopy.backToLibraryLabel,
    },
    breadcrumbs: [
      {
        id: 'dashboard',
        label: activityEditPageCopy.breadcrumbDashboard,
        href: Routes.Dashboard,
      },
      {
        id: 'activities',
        label: activityEditPageCopy.breadcrumbActivities,
        href: Routes.DashboardActivities,
      },
      { id: 'current', label: title, isCurrentPage: true },
    ],
    description:
      editAccessView?.description ?? activityEditPageCopy.fallbackDescription,
    editAccessView,
    editor,
    loadErrorMessage: activityEditPageCopy.loadErrorMessage,
    title,
  };
}

export function buildActivityEditRouteState({
  activity,
  isError,
  isLoading,
}: {
  activity?: ActivityEditPageActivitySource | null;
  isError: boolean;
  isLoading: boolean;
}): ActivityEditRouteState {
  const pageView = buildActivityEditPageViewModel(activity);

  if (isLoading) {
    return {
      pageView,
      status: 'loading',
    };
  }

  if (isError || !activity) {
    return {
      pageView,
      status: 'error',
    };
  }

  if (pageView.editAccessView && !pageView.editAccessView.canEdit) {
    return {
      pageView: {
        ...pageView,
        editAccessView: pageView.editAccessView,
      },
      status: 'blocked',
    };
  }

  if (!pageView.editor) {
    return {
      pageView,
      status: 'error',
    };
  }

  return {
    pageView: {
      ...pageView,
      editor: pageView.editor,
    },
    status: 'ready',
  };
}

export function buildActivityEditorPreviewSeed(
  input: CreateActivityInput = getActivityEditorDefaultInput()
): ActivitySeed {
  const content = buildActivityContent(input);

  return {
    content,
    description: input.description,
    estimatedMinutes: 6,
    id: 'activity-editor-preview',
    status: input.visibility,
    templateType: input.templateType,
    title: input.title,
  };
}

export function buildActivityEditorPreviewPanel(
  input: CreateActivityInput = getActivityEditorDefaultInput()
): ActivityEditorPreviewPanel {
  const template = getTemplateByType(input.templateType);

  return {
    actions: [
      {
        href: `#${activityEditorSectionId}`,
        icon: 'edit',
        id: 'review-fields',
        label: m.activity_editor_review_scaffold_fields(),
      },
    ],
    description: m.activity_editor_preview_description({
      template: template.shortName,
    }),
    editorSectionId: activityEditorSectionId,
    title: m.activity_editor_preview_title({ template: template.name }),
  };
}

export function buildActivityEditorTemplateSetupView(
  templateType: ActivityTemplateType,
  current: CreateActivityInput = getActivityEditorDefaultInput()
): ActivityEditorTemplateSetupView {
  const template = getTemplateByType(templateType);

  return {
    actionLabel: m.activity_editor_load_scaffold(),
    description: template.description,
    requirementBadges: formatTemplateRequirementViews(
      template.contentRequirements
    ).map((requirement) => ({
      ...requirement,
      label: m.activity_editor_requires_requirement({
        requirement: requirement.label,
      }),
    })),
    reviewChecklistItems: buildActivityEditorTemplateScaffoldReviewItems(),
    reviewChecklistLabel: m.activity_editor_scaffold_review_label(),
    scaffoldSummary: buildActivityTemplateScaffoldReadinessSummary({
      current,
      templateType,
    }),
    shortName: template.shortName,
    successMessage: m.activity_editor_scaffold_loaded({
      template: template.name,
    }),
    title: m.activity_editor_setup_title({ template: template.name }),
  };
}

function buildActivityEditorTemplateScaffoldReviewItems(): ActivityEditorTemplateScaffoldReviewItemView[] {
  const items = [
    {
      actionHref: `#${ACTIVITY_EDITOR_SECTION_IDS.editor}`,
      actionLabel: m.activity_editor_scaffold_review_fields_action(),
      description: m.activity_editor_scaffold_review_fields_description(),
      id: 'review-fields',
      label: m.activity_editor_scaffold_review_fields_label(),
    },
    {
      actionHref: `#${ACTIVITY_EDITOR_SECTION_IDS.templateReadiness}`,
      actionLabel: m.activity_editor_scaffold_review_modes_action(),
      description: m.activity_editor_scaffold_review_modes_description(),
      id: 'check-ready-modes',
      label: m.activity_editor_scaffold_review_modes_label(),
    },
    {
      actionHref: `#${ACTIVITY_EDITOR_SECTION_IDS.editor}`,
      actionLabel: m.activity_editor_scaffold_review_save_action(),
      description: m.activity_editor_scaffold_review_save_description(),
      id: 'edit-before-save',
      label: m.activity_editor_scaffold_review_save_label(),
    },
  ] satisfies Array<
    Omit<ActivityEditorTemplateScaffoldReviewItemView, 'ariaLabel'>
  >;

  return items.map((item) => ({
    ...item,
    ariaLabel: m.activity_editor_scaffold_review_item_aria_label({
      description: item.description,
      label: item.label,
    }),
  }));
}

export function buildActivityEditorTemplateView({
  input,
  templateType,
}: {
  input: unknown;
  templateType: ActivityTemplateType;
}): ActivityEditorTemplateView {
  const templateOptions = getActivityTemplates();
  const template =
    templateOptions.find((option) => option.type === templateType) ??
    getTemplateByType(templateType);
  const templateReadiness = buildActivityEditorTemplateReadiness(input);
  const parsedCurrentInput = createActivityInputSchema.safeParse(input);
  const currentContent = parsedCurrentInput.success
    ? buildActivityEditorParsedContent(parsedCurrentInput.data)
    : null;
  const scaffoldSummaryInput = parsedCurrentInput.success
    ? parsedCurrentInput.data
    : getActivityEditorDefaultInput();
  const readinessSummary = buildActivityEditorReadinessPanelSummary(
    templateReadiness,
    currentContent
  );
  const setupView = buildActivityEditorTemplateSetupView(
    templateType,
    scaffoldSummaryInput
  );

  return {
    handoffView: buildActivityEditorTemplateHandoffView({
      readinessSummary,
      remixPlan: templateReadiness,
      setupView,
      template,
    }),
    readinessSummary,
    setupView,
    template,
    templateOptions,
  };
}

export function buildActivityEditorTemplateHandoffView({
  readinessSummary,
  remixPlan,
  setupView,
  template,
}: {
  readinessSummary: ActivityTemplateReadinessPanelSummary;
  remixPlan: TemplateRemixPlan | null;
  setupView: ActivityEditorTemplateSetupView;
  template: ActivityTemplateDefinition;
}): ActivityEditorTemplateHandoffView {
  const selectedOption = remixPlan?.options.find(
    (option) => option.template.type === template.type
  );
  const lockedOptions =
    remixPlan?.options.filter((option) => !option.isReady) ?? [];
  const suggestedOptions =
    remixPlan?.suggestedOptions.map((option) => ({
      shortName: option.template.shortName,
      template: option.template.type,
    })) ?? [];
  const lockedTemplateCount = remixPlan
    ? lockedOptions.length
    : getActivityTemplates().length;
  const scaffoldSummary = setupView.scaffoldSummary;
  const itemViews: ActivityEditorTemplateHandoffItemView[] = [
    buildActivityEditorTemplateHandoffItem({
      description: template.description,
      id: 'selected-template',
      label: m.activity_form_field_primary_template(),
      statusLabel: selectedOption?.readinessLabel,
      value: template.name,
    }),
    buildActivityEditorTemplateHandoffItem({
      description: m.activity_editor_template_handoff_short_name_description(),
      id: 'template-short-name',
      label: m.activity_editor_template_handoff_short_name_label(),
      value: template.shortName,
    }),
    buildActivityEditorTemplateHandoffItem({
      description:
        m.activity_editor_template_handoff_classroom_mode_description(),
      id: 'classroom-mode',
      label: m.activity_editor_template_handoff_classroom_mode_label(),
      value: formatActivityTemplateClassroomMode(template.classroomMode),
    }),
    buildActivityEditorTemplateHandoffItem({
      description: m.activity_editor_template_handoff_requirement_description(),
      id: 'required-content',
      label: m.activity_editor_template_handoff_requirement_label(),
      value: formatTemplateRequirementList(
        formatTemplateRequirements(template.contentRequirements)
      ),
    }),
    buildActivityEditorTemplateHandoffItem({
      description:
        m.activity_editor_template_handoff_current_readiness_description(),
      id: 'current-template-readiness',
      label: m.activity_editor_template_handoff_current_readiness_label(),
      statusLabel:
        selectedOption?.readinessLabel ?? m.template_remix_needs_more_content(),
      value:
        selectedOption?.diagnosis ??
        m.activity_template_readiness_panel_empty(),
    }),
    buildActivityEditorTemplateHandoffItem({
      description: readinessSummary.description,
      id: 'ready-template-count',
      label: readinessSummary.title,
      value: readinessSummary.readyCountLabel,
    }),
    buildActivityEditorTemplateHandoffItem({
      description:
        m.activity_editor_template_handoff_ready_options_description(),
      id: 'ready-template-options',
      label: m.create_page_template_entry_ready_modes_label(),
      value: formatActivityEditorTemplateHandoffTemplateOptions(
        readinessSummary.readyOptions,
        readinessSummary.emptyText
      ),
    }),
    buildActivityEditorTemplateHandoffItem({
      description: m.activity_editor_template_handoff_suggested_description(),
      id: 'suggested-remix-options',
      label: m.activity_editor_template_handoff_suggested_label(),
      value: formatActivityEditorTemplateHandoffTemplateOptions(
        suggestedOptions,
        readinessSummary.emptyText
      ),
    }),
    buildActivityEditorTemplateHandoffItem({
      description: m.activity_editor_template_handoff_locked_description(),
      id: 'locked-template-count',
      label: m.activity_editor_template_handoff_locked_count_label(),
      value: m.activity_editor_template_handoff_locked_value({
        count: lockedTemplateCount,
      }),
    }),
    buildActivityEditorTemplateHandoffItem({
      description: m.activity_editor_template_handoff_locked_description(),
      id: 'locked-template-options',
      label: m.activity_editor_template_handoff_locked_count_label(),
      value: formatActivityEditorTemplateHandoffList(
        lockedOptions.map((option) => option.diagnosis),
        readinessSummary.emptyText
      ),
    }),
    buildActivityEditorTemplateHandoffItem({
      description:
        readinessSummary.questionChoiceReadiness?.description ??
        m.activity_template_readiness_panel_quiz_choices_empty(),
      id: 'question-choice-readiness',
      label: m.activity_template_readiness_panel_quiz_choices_title(),
      value:
        readinessSummary.questionChoiceReadiness?.summaryLabel ??
        m.activity_template_readiness_panel_quiz_choices_empty(),
    }),
    buildActivityEditorTemplateHandoffItem({
      description: m.activity_editor_template_handoff_action_description(),
      id: 'scaffold-action',
      label: setupView.actionLabel,
      value: setupView.successMessage,
    }),
    buildActivityEditorTemplateHandoffItem({
      description: scaffoldSummary.title,
      id: 'scaffold-runtime-items',
      label: m.create_page_template_entry_runtime_items_label(),
      value: scaffoldSummary.runtimeItemLabel,
    }),
    buildActivityEditorTemplateHandoffItem({
      description: scaffoldSummary.title,
      id: 'scaffold-ready-modes',
      label: m.create_page_template_entry_ready_modes_label(),
      value: scaffoldSummary.readyTemplateLabel,
    }),
    buildActivityEditorTemplateHandoffItem({
      description:
        m.activity_editor_template_handoff_reusable_coverage_description(),
      id: 'scaffold-reusable-coverage',
      label: m.activity_editor_template_handoff_reusable_coverage_label(),
      statusLabel: scaffoldSummary.isReusableAcrossTemplates
        ? m.template_remix_ready()
        : m.template_remix_needs_more_content(),
      value: scaffoldSummary.isReusableAcrossTemplates
        ? m.template_remix_ready()
        : m.template_remix_needs_more_content(),
    }),
    buildActivityEditorTemplateScaffoldMetricHandoffItem({
      description: m.activity_form_questions_description(),
      id: 'scaffold-questions',
      label: m.activity_form_field_questions(),
      metricId: 'questions',
      setupView,
    }),
    buildActivityEditorTemplateScaffoldMetricHandoffItem({
      description: m.activity_form_pairs_description(),
      id: 'scaffold-pairs',
      label: m.activity_form_field_pairs(),
      metricId: 'pairs',
      setupView,
    }),
    buildActivityEditorTemplateScaffoldMetricHandoffItem({
      description: m.activity_form_groups_description(),
      id: 'scaffold-groups',
      label: m.activity_form_field_groups(),
      metricId: 'groups',
      setupView,
    }),
    buildActivityEditorTemplateScaffoldMetricHandoffItem({
      description: m.activity_form_vocabulary_description(),
      id: 'scaffold-vocabulary',
      label: m.activity_form_field_vocabulary(),
      metricId: 'vocabulary',
      setupView,
    }),
    buildActivityEditorTemplateScaffoldMetricHandoffItem({
      description: m.activity_form_teacher_notes_description(),
      id: 'scaffold-teacher-notes',
      label: m.activity_form_field_teacher_notes(),
      metricId: 'teacherNotes',
      setupView,
    }),
  ];

  return {
    description: m.activity_editor_template_handoff_description(),
    itemViews,
    privacy: buildActivityEditorTemplateHandoffPrivacyContract(itemViews),
    title: m.activity_editor_template_handoff_title(),
  };
}

function buildActivityEditorTemplateScaffoldMetricHandoffItem({
  description,
  id,
  label,
  metricId,
  setupView,
}: {
  description: string;
  id: ActivityEditorTemplateHandoffItemId;
  label: string;
  metricId: ActivityTemplateScaffoldCoverageMetricView['id'];
  setupView: ActivityEditorTemplateSetupView;
}) {
  const metric = setupView.scaffoldSummary.coverageMetrics.find(
    (item) => item.id === metricId
  );

  return buildActivityEditorTemplateHandoffItem({
    description,
    id,
    label,
    statusLabel: metric?.meetsTarget
      ? m.template_remix_ready()
      : m.template_remix_needs_more_content(),
    value: metric?.label ?? m.activity_template_readiness_panel_empty(),
  });
}

function buildActivityEditorTemplateHandoffPrivacyContract(
  itemViews: ActivityEditorTemplateHandoffItemView[]
): ActivityEditorTemplateHandoffPrivacyContract {
  return {
    exposesAnswerText: false,
    exposesQuestionPromptText: false,
    exposesRawEditorInput: false,
    exposesRawScaffoldContent: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialStorageKeys: false,
    exposesTeacherNotesText: false,
    itemIds: itemViews.map((item) => item.id),
  };
}

function buildActivityEditorTemplateHandoffItem({
  description,
  id,
  label,
  statusLabel,
  value,
}: {
  description: string;
  id: ActivityEditorTemplateHandoffItemId;
  label: string;
  statusLabel?: string;
  value: string;
}): ActivityEditorTemplateHandoffItemView {
  return {
    ariaLabel: m.activity_editor_template_handoff_item_aria_label({
      description,
      label,
      value,
    }),
    description,
    id,
    label,
    statusLabel,
    value,
  };
}

function formatActivityEditorTemplateHandoffTemplateOptions(
  options: TemplateRemixTemplateOption[],
  emptyText: string
) {
  return formatActivityEditorTemplateHandoffList(
    options.map((option) => option.shortName),
    emptyText
  );
}

function formatActivityEditorTemplateHandoffList(
  values: readonly string[],
  emptyText: string
) {
  const normalizedValues = values
    .map(normalizeRuntimeDisplayText)
    .filter(Boolean);

  if (normalizedValues.length === 0) return emptyText;

  return formatTemplateRequirementList(normalizedValues);
}

export function buildActivityEditorReadinessPanelSummary(
  remixPlan: TemplateRemixPlan | null,
  content?: ActivityContent | null
): ActivityTemplateReadinessPanelSummary {
  const summary = buildActivityTemplateReadinessPanelSummary(
    remixPlan,
    content
  );

  return {
    ...summary,
    lockedOptions: summary.lockedOptions.slice(
      0,
      ACTIVITY_EDITOR_READINESS_PANEL_LIMITS.lockedOptions
    ),
  };
}

export function buildActivityEditorTemplateScaffoldApplication({
  current,
  templateType,
}: {
  current: CreateActivityInput;
  templateType: ActivityTemplateType;
}): ActivityEditorTemplateScaffoldApplication {
  const nextValues = buildActivityTemplateScaffoldInput({
    current,
    templateType,
  });

  return {
    draftSourceText: getActivityDraftSourceText(nextValues),
    successMessage:
      buildActivityEditorTemplateSetupView(templateType).successMessage,
    values: nextValues,
  };
}

export function activityContentToEditorInput(
  source: ActivityEditorSource
): CreateActivityInput {
  return {
    description: source.description ?? '',
    difficulty: source.content.difficulty,
    gradeBand: source.content.gradeBand,
    groupsText: formatEditorGroupRows(source.content.groups),
    language: source.content.language,
    learningGoal: source.content.learningGoal,
    pairsText: formatEditorPairRows(source.content.pairs),
    questionsText: formatEditorQuestionRows(source.content.questions),
    sourceSummary: source.content.sourceSummary,
    sourceMaterials: normalizeActivityMaterialReferences(
      source.content.sourceMaterials
    ),
    subject: source.content.subject,
    teacherNotesText: formatEditorLineList(source.content.teacherNotes),
    templateType: source.templateType,
    title: source.title,
    visibility: source.visibility,
    vocabularyText: formatEditorInlineList(source.content.vocabulary),
  };
}

export function buildActivityEditorTemplateReadiness(
  input: unknown
): TemplateRemixPlan | null {
  const parsed = createActivityInputSchema.safeParse(input);
  if (!parsed.success) return null;

  try {
    const content = buildActivityEditorParsedContent(parsed.data);
    if (!content) return null;

    return getTemplateRemixPlan({
      content,
      currentTemplateType: parsed.data.templateType,
    });
  } catch {
    return null;
  }
}

function buildActivityEditorParsedContent(input: CreateActivityInput) {
  try {
    return parseActivityContent(input);
  } catch {
    return null;
  }
}
