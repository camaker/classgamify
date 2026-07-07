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
  ACTIVITY_DRAFT_REVIEW_STATE,
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
  hasRuntimeDisplayText,
  normalizeOptionalRuntimeDisplayText,
  normalizeRuntimeDisplayText,
} from '@/activities/runtime-display';

export const ACTIVITY_EDITOR_READINESS_PANEL_LIMITS = {
  lockedOptions: 4,
} as const;

export const ACTIVITY_EDITOR_SECTION_IDS = {
  aiDraft: 'activity-editor-ai-draft',
  content: 'activity-editor-content',
  editor: 'activity-editor',
  frame: 'activity-editor-frame',
  sourceMaterials: 'activity-editor-source-materials',
  templateReadiness: 'activity-template-readiness',
} as const;

export type ActivityEditorSectionId =
  (typeof ACTIVITY_EDITOR_SECTION_IDS)[keyof typeof ACTIVITY_EDITOR_SECTION_IDS];

export type ActivityEditorSectionHref = `#${ActivityEditorSectionId}`;

export const ACTIVITY_EDITOR_WORKFLOW_STEP_IDS = [
  'frame',
  'ai-draft',
  'content',
  'source-materials',
  'review',
] as const;

export type ActivityEditorWorkflowStepId =
  (typeof ACTIVITY_EDITOR_WORKFLOW_STEP_IDS)[number];

export type ActivityEditorWorkflowStepIcon =
  | 'clipboard-list'
  | 'layout-grid'
  | 'paperclip'
  | 'pencil'
  | 'sparkles';

export type ActivityEditorWorkflowStepView = {
  description: string;
  href: ActivityEditorSectionHref;
  icon: ActivityEditorWorkflowStepIcon;
  id: ActivityEditorWorkflowStepId;
  label: string;
  number: number;
  sectionId: ActivityEditorSectionId;
  title: string;
};

export const ACTIVITY_EDITOR_WORKFLOW_HANDOFF_ITEM_IDS = [
  'workflow-source',
  'step-count',
  'workflow-order',
  'create-page-surface',
  'edit-page-surface',
  'nav-surface',
  'form-section-surface',
  'side-preview-surface',
  'frame-section',
  'primary-fields',
  'template-handoff',
  'scaffold-panel',
  'ai-draft-section',
  'ai-source-state',
  'ai-sync-action',
  'content-section',
  'details-fields',
  'structured-content-fields',
  'source-materials-section',
  'material-picker',
  'review-section',
  'readiness-panel',
  'save-footer',
  'auth-gate',
  'input-contract',
  'template-readiness-contract',
  'ai-editor-boundary',
  'source-privacy-boundary',
  'publish-boundary',
  'privacy-guard',
] as const;

export type ActivityEditorWorkflowHandoffItemId =
  (typeof ACTIVITY_EDITOR_WORKFLOW_HANDOFF_ITEM_IDS)[number];

export type ActivityEditorWorkflowHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: ActivityEditorWorkflowHandoffItemId;
  label: string;
  value: string;
};

export type ActivityEditorWorkflowHandoffPrivacyContract = {
  createsAssignmentLinks: false;
  exposesAnswerText: false;
  exposesPromptText: false;
  exposesRawEditorInput: false;
  exposesSourceMaterialFileIds: false;
  exposesSourceMaterialStorageKeys: false;
  exposesTeacherNotesText: false;
  itemIds: ActivityEditorWorkflowHandoffItemId[];
  mutatesActivity: false;
  persistsActivityWithoutTeacherSave: false;
  publishesAssignment: false;
  scope: 'activity-editor-workflow';
  usesCreateActivityInputContract: true;
};

export type ActivityEditorWorkflowHandoffView = {
  description: string;
  itemViews: ActivityEditorWorkflowHandoffItemView[];
  privacy: ActivityEditorWorkflowHandoffPrivacyContract;
  title: string;
};

export type ActivityEditorWorkflowView = {
  ariaLabel: string;
  handoffView: ActivityEditorWorkflowHandoffView;
  steps: ActivityEditorWorkflowStepView[];
};

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
  'shared-editor-contract',
  'parsed-content-status',
  'current-question-count',
  'current-pair-count',
  'current-group-count',
  'current-vocabulary-count',
  'current-teacher-note-count',
  'scaffold-review-steps',
  'save-before-publish-boundary',
  'privacy-guard',
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
  exposesCurrentFieldText: false;
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

export const ACTIVITY_EDITOR_AI_DRAFT_SOURCE_CONTROL_IDS = {
  generationDisabledReason: 'activity-ai-generate-disabled-reason',
  safeSourceDescription: 'activity-ai-safe-source-description',
  sourceCapabilityTitle: 'activity-ai-source-capability-title',
  sourceInput: 'activity-ai-source',
  sourceMaterialNotesLabel: 'activity-ai-source-material-notes-label',
  sourceMaterialSafetyDescription:
    'activity-ai-source-material-safety-description',
  sourceMaterialSafetyTitle: 'activity-ai-source-material-safety-title',
  sourceReadinessDescription: 'activity-ai-source-readiness-description',
  sourceReadinessTitle: 'activity-ai-source-readiness-title',
  syncMaterialsHelp: 'activity-ai-sync-materials-help',
} as const;

export type ActivityEditorAiDraftSourceControlIds =
  typeof ACTIVITY_EDITOR_AI_DRAFT_SOURCE_CONTROL_IDS;

export type ActivityEditorAiDraftSourceControlBoundaryView = {
  attachedSourceMaterialCount: number;
  canGenerateDraft: boolean;
  canSyncDraftSourceMaterials: boolean;
  controlIds: ActivityEditorAiDraftSourceControlIds;
  describesGenerateActionWithReadiness: true;
  describesSourceTextareaWithReadiness: true;
  describesSourceTextareaWithSafeSource: true;
  describesSyncActionWithSafeMaterialHelp: true;
  exposesFileBytes: false;
  exposesFileIds: false;
  exposesOmittedNotePayloads: false;
  exposesStorageKeys: false;
  generateActionUsesDisabledReason: boolean;
  generateButtonDescribedByIds: string[];
  hasCapabilityDescription: boolean;
  hasMaterialSafetyDescription: boolean;
  hasSyncedMaterialNoteDescription: boolean;
  omittedSourceMaterialNoteCount: number;
  safeSourceMaterialNoteCount: number;
  scope: 'activity-ai-draft-source-controls';
  sourceMaterialCapabilityCount: number;
  sourceMaterialNoteInputCount: number;
  sourceMaterialNoteViewCount: number;
  sourceReadinessHasWarnings: boolean;
  sourceReadinessStatus: ActivityEditorAiDraftSourceReadinessView['status'];
  sourceTextMaxLength: number;
  syncButtonDescribedByIds: string[];
  textareaDescribedByIds: string[];
  usesPreparedControlIds: true;
};

export const ACTIVITY_EDITOR_AI_DRAFT_SOURCE_HANDOFF_ITEM_IDS = [
  'safe-source',
  'source-textarea',
  'source-readiness',
  'source-length',
  'source-warning',
  'source-sanitization',
  'teacher-review',
  'item-count',
  'focus',
  'sync-action',
  'generate-action',
  'generation-gate',
  'auth-boundary',
  'input-schema',
  'attached-materials',
  'material-safety',
  'safe-material-notes',
  'omitted-material-notes',
  'synced-material-provenance',
  'capability-audio-extraction',
  'capability-worksheet-extraction',
  'capability-spreadsheet-import',
  'create-input-contract',
  'editor-application-boundary',
  'persistence-boundary',
  'save-boundary',
  'publish-boundary',
  'file-byte-guard',
  'storage-key-guard',
  'prompt-privacy',
] as const;

export type ActivityEditorAiDraftSourceHandoffItemId =
  (typeof ACTIVITY_EDITOR_AI_DRAFT_SOURCE_HANDOFF_ITEM_IDS)[number];

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
  sourceControlBoundary: ActivityEditorAiDraftSourceControlBoundaryView;
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
  workflow: ActivityEditorWorkflowView;
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

export const ACTIVITY_EDIT_ROUTE_HANDOFF_ITEM_IDS = [
  'route-status',
  'activity-source',
  'owner-scope',
  'persisted-source',
  'edit-access',
  'lifecycle-gate',
  'archived-restore-action',
  'editor-mode',
  'shared-input-contract',
  'title-hydration',
  'description-hydration',
  'template-hydration',
  'visibility-hydration',
  'learning-goal-hydration',
  'question-row-count',
  'question-option-count',
  'answer-explanation-count',
  'pair-row-count',
  'group-row-count',
  'vocabulary-count',
  'teacher-note-count',
  'source-summary-privacy',
  'source-material-count',
  'source-material-kind-count',
  'source-reference-hydration',
  'readiness-after-load',
  'future-assignment-boundary',
  'snapshot-protection',
  'save-target',
  'privacy-guard',
] as const;

export type ActivityEditRouteHandoffItemId =
  (typeof ACTIVITY_EDIT_ROUTE_HANDOFF_ITEM_IDS)[number];

export type ActivityEditRouteHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: ActivityEditRouteHandoffItemId;
  label: string;
  value: string;
};

export type ActivityEditRouteHandoffPrivacyContract = {
  exposesActivityContentText: false;
  exposesAnswerExplanationText: false;
  exposesAnswerText: false;
  exposesInternalActivityId: false;
  exposesQuestionOptionText: false;
  exposesQuestionPromptText: false;
  exposesSourceMaterialFileIds: false;
  exposesSourceMaterialStorageKeys: false;
  exposesSourceSummaryText: false;
  exposesTeacherNotesText: false;
  itemIds: ActivityEditRouteHandoffItemId[];
  mutatesPublishedAssignmentSnapshots: false;
  scope: 'owner-activity-edit-route';
  usesCreateActivityInputContract: true;
};

export type ActivityEditRouteHandoffView = {
  description: string;
  itemViews: ActivityEditRouteHandoffItemView[];
  privacy: ActivityEditRouteHandoffPrivacyContract;
  title: string;
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

export function buildActivityEditorWorkflowView(): ActivityEditorWorkflowView {
  const steps = ACTIVITY_EDITOR_WORKFLOW_STEP_IDS.map(
    buildActivityEditorWorkflowStepView
  );

  return {
    ariaLabel: m.activity_form_editor_badge(),
    handoffView: buildActivityEditorWorkflowHandoffView(steps),
    steps,
  };
}

export function getActivityEditorWorkflowStepView(
  workflowView: ActivityEditorWorkflowView,
  id: ActivityEditorWorkflowStepId
) {
  const stepView = workflowView.steps.find((step) => step.id === id);

  if (!stepView) {
    throw new Error(`Missing activity editor workflow step: ${id}`);
  }

  return stepView;
}

function buildActivityEditorWorkflowStepView(
  id: ActivityEditorWorkflowStepId,
  index: number
): ActivityEditorWorkflowStepView {
  const number = index + 1;
  const sectionId = getActivityEditorWorkflowSectionId(id);

  return {
    description: getActivityEditorWorkflowStepDescription(id),
    href: `#${sectionId}`,
    icon: getActivityEditorWorkflowStepIcon(id),
    id,
    label: m.activity_form_step_label({ number }),
    number,
    sectionId,
    title: getActivityEditorWorkflowStepTitle(id),
  };
}

function getActivityEditorWorkflowSectionId(
  id: ActivityEditorWorkflowStepId
): ActivityEditorSectionId {
  switch (id) {
    case 'ai-draft':
      return ACTIVITY_EDITOR_SECTION_IDS.aiDraft;
    case 'content':
      return ACTIVITY_EDITOR_SECTION_IDS.content;
    case 'frame':
      return ACTIVITY_EDITOR_SECTION_IDS.frame;
    case 'review':
      return ACTIVITY_EDITOR_SECTION_IDS.templateReadiness;
    case 'source-materials':
      return ACTIVITY_EDITOR_SECTION_IDS.sourceMaterials;
  }
}

function getActivityEditorWorkflowStepIcon(
  id: ActivityEditorWorkflowStepId
): ActivityEditorWorkflowStepIcon {
  switch (id) {
    case 'ai-draft':
      return 'sparkles';
    case 'content':
      return 'clipboard-list';
    case 'frame':
      return 'pencil';
    case 'review':
      return 'layout-grid';
    case 'source-materials':
      return 'paperclip';
  }
}

function getActivityEditorWorkflowStepTitle(id: ActivityEditorWorkflowStepId) {
  switch (id) {
    case 'ai-draft':
      return m.activity_form_step_ai_title();
    case 'content':
      return m.activity_form_step_content_title();
    case 'frame':
      return m.activity_form_step_frame_title();
    case 'review':
      return m.activity_form_step_review_title();
    case 'source-materials':
      return m.activity_form_step_sources_title();
  }
}

function getActivityEditorWorkflowStepDescription(
  id: ActivityEditorWorkflowStepId
) {
  switch (id) {
    case 'ai-draft':
      return m.activity_form_step_ai_description();
    case 'content':
      return m.activity_form_step_content_description();
    case 'frame':
      return m.activity_form_step_frame_description();
    case 'review':
      return m.activity_form_step_review_description();
    case 'source-materials':
      return m.activity_form_step_sources_description();
  }
}

type ActivityEditorWorkflowHandoffCopy = {
  description: () => string;
  label: () => string;
  value: (steps: ActivityEditorWorkflowStepView[]) => string;
};

const ACTIVITY_EDITOR_WORKFLOW_HANDOFF_COPY = {
  'workflow-source': {
    description: () =>
      m.activity_editor_workflow_handoff_workflow_source_description(),
    label: () => m.activity_editor_workflow_handoff_workflow_source_label(),
    value: () => m.activity_editor_workflow_handoff_workflow_source_value(),
  },
  'step-count': {
    description: () =>
      m.activity_editor_workflow_handoff_step_count_description(),
    label: () => m.activity_editor_workflow_handoff_step_count_label(),
    value: (steps) =>
      m.activity_editor_workflow_handoff_step_count_value({
        count: steps.length,
      }),
  },
  'workflow-order': {
    description: () =>
      m.activity_editor_workflow_handoff_workflow_order_description(),
    label: () => m.activity_editor_workflow_handoff_workflow_order_label(),
    value: (steps) => steps.map((step) => step.id).join(' -> '),
  },
  'create-page-surface': {
    description: () =>
      m.activity_editor_workflow_handoff_create_page_surface_description(),
    label: () => m.activity_editor_workflow_handoff_create_page_surface_label(),
    value: () => m.activity_editor_workflow_handoff_create_page_surface_value(),
  },
  'edit-page-surface': {
    description: () =>
      m.activity_editor_workflow_handoff_edit_page_surface_description(),
    label: () => m.activity_editor_workflow_handoff_edit_page_surface_label(),
    value: () => m.activity_editor_workflow_handoff_edit_page_surface_value(),
  },
  'nav-surface': {
    description: () =>
      m.activity_editor_workflow_handoff_nav_surface_description(),
    label: () => m.activity_editor_workflow_handoff_nav_surface_label(),
    value: () => m.activity_editor_workflow_handoff_nav_surface_value(),
  },
  'form-section-surface': {
    description: () =>
      m.activity_editor_workflow_handoff_form_surface_description(),
    label: () => m.activity_editor_workflow_handoff_form_surface_label(),
    value: () => m.activity_editor_workflow_handoff_form_surface_value(),
  },
  'side-preview-surface': {
    description: () =>
      m.activity_editor_workflow_handoff_preview_surface_description(),
    label: () => m.activity_editor_workflow_handoff_preview_surface_label(),
    value: () => m.activity_editor_workflow_handoff_preview_surface_value(),
  },
  'frame-section': {
    description: () =>
      m.activity_editor_workflow_handoff_frame_section_description(),
    label: () => m.activity_editor_workflow_handoff_frame_section_label(),
    value: () => getActivityEditorWorkflowStepTitle('frame'),
  },
  'primary-fields': {
    description: () =>
      m.activity_editor_workflow_handoff_primary_fields_description(),
    label: () => m.activity_editor_workflow_handoff_primary_fields_label(),
    value: () => m.activity_editor_workflow_handoff_primary_fields_value(),
  },
  'template-handoff': {
    description: () =>
      m.activity_editor_workflow_handoff_template_handoff_description(),
    label: () => m.activity_editor_workflow_handoff_template_handoff_label(),
    value: () => m.activity_editor_workflow_handoff_template_handoff_value(),
  },
  'scaffold-panel': {
    description: () =>
      m.activity_editor_workflow_handoff_scaffold_panel_description(),
    label: () => m.activity_editor_workflow_handoff_scaffold_panel_label(),
    value: () => m.activity_editor_workflow_handoff_scaffold_panel_value(),
  },
  'ai-draft-section': {
    description: () =>
      m.activity_editor_workflow_handoff_ai_section_description(),
    label: () => m.activity_editor_workflow_handoff_ai_section_label(),
    value: () => getActivityEditorWorkflowStepTitle('ai-draft'),
  },
  'ai-source-state': {
    description: () =>
      m.activity_editor_workflow_handoff_ai_source_description(),
    label: () => m.activity_editor_workflow_handoff_ai_source_label(),
    value: () => m.activity_editor_workflow_handoff_ai_source_value(),
  },
  'ai-sync-action': {
    description: () => m.activity_editor_workflow_handoff_ai_sync_description(),
    label: () => m.activity_editor_workflow_handoff_ai_sync_label(),
    value: () => m.activity_editor_workflow_handoff_ai_sync_value(),
  },
  'content-section': {
    description: () =>
      m.activity_editor_workflow_handoff_content_section_description(),
    label: () => m.activity_editor_workflow_handoff_content_section_label(),
    value: () => getActivityEditorWorkflowStepTitle('content'),
  },
  'details-fields': {
    description: () =>
      m.activity_editor_workflow_handoff_details_fields_description(),
    label: () => m.activity_editor_workflow_handoff_details_fields_label(),
    value: () => m.activity_editor_workflow_handoff_details_fields_value(),
  },
  'structured-content-fields': {
    description: () =>
      m.activity_editor_workflow_handoff_structured_fields_description(),
    label: () => m.activity_editor_workflow_handoff_structured_fields_label(),
    value: () => m.activity_editor_workflow_handoff_structured_fields_value(),
  },
  'source-materials-section': {
    description: () =>
      m.activity_editor_workflow_handoff_sources_section_description(),
    label: () => m.activity_editor_workflow_handoff_sources_section_label(),
    value: () => getActivityEditorWorkflowStepTitle('source-materials'),
  },
  'material-picker': {
    description: () =>
      m.activity_editor_workflow_handoff_material_picker_description(),
    label: () => m.activity_editor_workflow_handoff_material_picker_label(),
    value: () => m.activity_editor_workflow_handoff_material_picker_value(),
  },
  'review-section': {
    description: () =>
      m.activity_editor_workflow_handoff_review_section_description(),
    label: () => m.activity_editor_workflow_handoff_review_section_label(),
    value: () => getActivityEditorWorkflowStepTitle('review'),
  },
  'readiness-panel': {
    description: () =>
      m.activity_editor_workflow_handoff_readiness_panel_description(),
    label: () => m.activity_editor_workflow_handoff_readiness_panel_label(),
    value: () => m.activity_editor_workflow_handoff_readiness_panel_value(),
  },
  'save-footer': {
    description: () =>
      m.activity_editor_workflow_handoff_save_footer_description(),
    label: () => m.activity_editor_workflow_handoff_save_footer_label(),
    value: () => m.activity_editor_workflow_handoff_save_footer_value(),
  },
  'auth-gate': {
    description: () =>
      m.activity_editor_workflow_handoff_auth_gate_description(),
    label: () => m.activity_editor_workflow_handoff_auth_gate_label(),
    value: () => m.activity_editor_workflow_handoff_auth_gate_value(),
  },
  'input-contract': {
    description: () =>
      m.activity_editor_workflow_handoff_input_contract_description(),
    label: () => m.activity_editor_workflow_handoff_input_contract_label(),
    value: () => m.activity_editor_workflow_handoff_input_contract_value(),
  },
  'template-readiness-contract': {
    description: () =>
      m.activity_editor_workflow_handoff_readiness_contract_description(),
    label: () => m.activity_editor_workflow_handoff_readiness_contract_label(),
    value: () => m.activity_editor_workflow_handoff_readiness_contract_value(),
  },
  'ai-editor-boundary': {
    description: () =>
      m.activity_editor_workflow_handoff_ai_boundary_description(),
    label: () => m.activity_editor_workflow_handoff_ai_boundary_label(),
    value: () => m.activity_editor_workflow_handoff_ai_boundary_value(),
  },
  'source-privacy-boundary': {
    description: () =>
      m.activity_editor_workflow_handoff_source_privacy_description(),
    label: () => m.activity_editor_workflow_handoff_source_privacy_label(),
    value: () => m.activity_editor_workflow_handoff_source_privacy_value(),
  },
  'publish-boundary': {
    description: () =>
      m.activity_editor_workflow_handoff_publish_boundary_description(),
    label: () => m.activity_editor_workflow_handoff_publish_boundary_label(),
    value: () => m.activity_editor_workflow_handoff_publish_boundary_value(),
  },
  'privacy-guard': {
    description: () =>
      m.activity_editor_workflow_handoff_privacy_guard_description(),
    label: () => m.activity_editor_workflow_handoff_privacy_guard_label(),
    value: () => m.activity_editor_workflow_handoff_privacy_guard_value(),
  },
} satisfies Record<
  ActivityEditorWorkflowHandoffItemId,
  ActivityEditorWorkflowHandoffCopy
>;

function buildActivityEditorWorkflowHandoffView(
  steps: ActivityEditorWorkflowStepView[]
): ActivityEditorWorkflowHandoffView {
  const itemViews = ACTIVITY_EDITOR_WORKFLOW_HANDOFF_ITEM_IDS.map((id) =>
    buildActivityEditorWorkflowHandoffItemView({ id, steps })
  );

  return {
    description: m.activity_editor_workflow_handoff_description(),
    itemViews,
    privacy: buildActivityEditorWorkflowHandoffPrivacyContract(itemViews),
    title: m.activity_editor_workflow_handoff_title(),
  };
}

function buildActivityEditorWorkflowHandoffItemView({
  id,
  steps,
}: {
  id: ActivityEditorWorkflowHandoffItemId;
  steps: ActivityEditorWorkflowStepView[];
}): ActivityEditorWorkflowHandoffItemView {
  const copy = ACTIVITY_EDITOR_WORKFLOW_HANDOFF_COPY[id];
  const description = copy.description();
  const label = copy.label();
  const value = copy.value(steps);

  return {
    ariaLabel: m.activity_editor_workflow_handoff_item_aria({
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

function buildActivityEditorWorkflowHandoffPrivacyContract(
  itemViews: ActivityEditorWorkflowHandoffItemView[]
): ActivityEditorWorkflowHandoffPrivacyContract {
  return {
    createsAssignmentLinks: false,
    exposesAnswerText: false,
    exposesPromptText: false,
    exposesRawEditorInput: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialStorageKeys: false,
    exposesTeacherNotesText: false,
    itemIds: itemViews.map((itemView) => itemView.id),
    mutatesActivity: false,
    persistsActivityWithoutTeacherSave: false,
    publishesAssignment: false,
    scope: 'activity-editor-workflow',
    usesCreateActivityInputContract: true,
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
  const sourceControlBoundary = buildActivityEditorAiDraftSourceControlBoundary(
    {
      canGenerateDraft,
      canSyncDraftSourceMaterials: sourceState.canSyncDraftSourceMaterials,
      generationDisabledReason,
      sourceMaterialSafetyView,
      sourceMaterialNoteViews,
      sourceMaterialSummaryLabel,
      sourceReadiness,
      sourceState,
    }
  );

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
    sourceControlBoundary,
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

function buildActivityEditorAiDraftSourceControlBoundary({
  canGenerateDraft,
  canSyncDraftSourceMaterials,
  generationDisabledReason,
  sourceMaterialSafetyView,
  sourceMaterialNoteViews,
  sourceMaterialSummaryLabel,
  sourceReadiness,
  sourceState,
}: {
  canGenerateDraft: boolean;
  canSyncDraftSourceMaterials: boolean;
  generationDisabledReason?: string;
  sourceMaterialSafetyView: ActivityEditorAiDraftSourceMaterialSafetyView;
  sourceMaterialNoteViews: ActivityEditorSourceMaterialDraftNoteView[];
  sourceMaterialSummaryLabel?: string;
  sourceReadiness: ActivityEditorAiDraftSourceReadinessView;
  sourceState: ActivityEditorDraftSourceState;
}): ActivityEditorAiDraftSourceControlBoundaryView {
  const controlIds = ACTIVITY_EDITOR_AI_DRAFT_SOURCE_CONTROL_IDS;
  const sourceMaterialCapabilityCount =
    countActivityEditorAiDraftSourceCapabilities(
      sourceState.sourceMaterialCapabilityCounts
    );
  const hasMaterialSafetyDescription = sourceMaterialSafetyView.hasInput;
  const hasCapabilityDescription = sourceMaterialCapabilityCount > 0;
  const hasSyncedMaterialNoteDescription =
    sourceMaterialNoteViews.length > 0 && Boolean(sourceMaterialSummaryLabel);
  const generateActionUsesDisabledReason = Boolean(generationDisabledReason);

  return {
    attachedSourceMaterialCount: sourceState.attachedSourceMaterialCount,
    canGenerateDraft,
    canSyncDraftSourceMaterials,
    controlIds,
    describesGenerateActionWithReadiness: true,
    describesSourceTextareaWithReadiness: true,
    describesSourceTextareaWithSafeSource: true,
    describesSyncActionWithSafeMaterialHelp: true,
    exposesFileBytes: false,
    exposesFileIds: false,
    exposesOmittedNotePayloads: false,
    exposesStorageKeys: false,
    generateActionUsesDisabledReason,
    generateButtonDescribedByIds: [
      controlIds.sourceReadinessDescription,
      ...(generateActionUsesDisabledReason
        ? [controlIds.generationDisabledReason]
        : []),
    ],
    hasCapabilityDescription,
    hasMaterialSafetyDescription,
    hasSyncedMaterialNoteDescription,
    omittedSourceMaterialNoteCount: sourceState.omittedSourceMaterialNoteCount,
    safeSourceMaterialNoteCount: sourceState.safeSourceMaterialNoteCount,
    scope: 'activity-ai-draft-source-controls',
    sourceMaterialCapabilityCount,
    sourceMaterialNoteInputCount: sourceState.sourceMaterialNoteInputCount,
    sourceMaterialNoteViewCount: sourceMaterialNoteViews.length,
    sourceReadinessHasWarnings: sourceReadiness.hasWarnings,
    sourceReadinessStatus: sourceReadiness.status,
    sourceTextMaxLength: ACTIVITY_DRAFT_SOURCE_MAX_LENGTH,
    syncButtonDescribedByIds: [controlIds.syncMaterialsHelp],
    textareaDescribedByIds: [
      controlIds.safeSourceDescription,
      controlIds.sourceReadinessDescription,
      ...(hasMaterialSafetyDescription
        ? [controlIds.sourceMaterialSafetyDescription]
        : []),
      ...(hasCapabilityDescription ? [controlIds.sourceCapabilityTitle] : []),
      ...(hasSyncedMaterialNoteDescription
        ? [controlIds.sourceMaterialNotesLabel]
        : []),
    ],
    usesPreparedControlIds: true,
  };
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
  const candidateItemViews: ActivityEditorAiDraftSourceHandoffItemView[] = [
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
      description:
        m.activity_ai_draft_boundary_handoff_source_sanitization_description(),
      id: 'source-sanitization',
      label: m.activity_ai_draft_boundary_handoff_source_sanitization_label(),
      value: m.activity_ai_draft_boundary_handoff_source_sanitization_value(),
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
        m.activity_ai_draft_boundary_handoff_auth_boundary_description(),
      id: 'auth-boundary',
      label: m.activity_ai_draft_boundary_handoff_auth_boundary_label(),
      value: m.activity_ai_draft_boundary_handoff_auth_boundary_value(),
    }),
    buildActivityEditorAiDraftSourceHandoffItem({
      description:
        m.activity_ai_draft_boundary_handoff_input_schema_description(),
      id: 'input-schema',
      label: m.activity_ai_draft_boundary_handoff_input_schema_label(),
      value: 'generateActivityDraftInputSchema',
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
        m.activity_ai_draft_boundary_handoff_create_input_description(),
      id: 'create-input-contract',
      label: m.activity_ai_draft_boundary_handoff_create_input_label(),
      value: 'CreateActivityInput',
    }),
    buildActivityEditorAiDraftSourceHandoffItem({
      description:
        m.activity_ai_draft_boundary_handoff_editor_application_description(),
      id: 'editor-application-boundary',
      label: m.activity_ai_draft_boundary_handoff_editor_application_label(),
      value: ACTIVITY_DRAFT_REVIEW_STATE.applicationMode,
    }),
    buildActivityEditorAiDraftSourceHandoffItem({
      description:
        m.activity_ai_draft_boundary_handoff_persistence_description(),
      id: 'persistence-boundary',
      label: m.activity_ai_draft_boundary_handoff_persistence_label(),
      value: ACTIVITY_DRAFT_REVIEW_STATE.persistenceMode,
    }),
    buildActivityEditorAiDraftSourceHandoffItem({
      description:
        m.activity_ai_draft_boundary_handoff_save_boundary_description(),
      id: 'save-boundary',
      label: m.activity_ai_draft_boundary_handoff_save_boundary_label(),
      value: m.activity_ai_draft_boundary_handoff_save_boundary_value(),
    }),
    buildActivityEditorAiDraftSourceHandoffItem({
      description:
        m.activity_ai_draft_boundary_handoff_publish_boundary_description(),
      id: 'publish-boundary',
      label: m.activity_ai_draft_boundary_handoff_publish_boundary_label(),
      value: m.activity_ai_draft_boundary_handoff_publish_boundary_value(),
    }),
    buildActivityEditorAiDraftSourceHandoffItem({
      description:
        m.activity_ai_draft_boundary_handoff_file_byte_guard_description(),
      id: 'file-byte-guard',
      label: m.activity_ai_draft_boundary_handoff_file_byte_guard_label(),
      value: m.activity_ai_draft_boundary_handoff_file_byte_guard_value(),
    }),
    buildActivityEditorAiDraftSourceHandoffItem({
      description:
        m.activity_ai_draft_boundary_handoff_storage_key_guard_description(),
      id: 'storage-key-guard',
      label: m.activity_ai_draft_boundary_handoff_storage_key_guard_label(),
      value: m.activity_ai_draft_boundary_handoff_storage_key_guard_value(),
    }),
    buildActivityEditorAiDraftSourceHandoffItem({
      description:
        m.activity_form_ai_source_handoff_prompt_privacy_description(),
      id: 'prompt-privacy',
      label: m.activity_form_ai_source_handoff_prompt_privacy_label(),
      value: m.activity_form_ai_source_handoff_prompt_privacy_value(),
    }),
  ];
  const itemViewById = new Map(
    candidateItemViews.map((itemView) => [itemView.id, itemView] as const)
  );
  const itemViews = ACTIVITY_EDITOR_AI_DRAFT_SOURCE_HANDOFF_ITEM_IDS.map(
    (id) => {
      const itemView = itemViewById.get(id);
      if (!itemView) {
        throw new Error(`Missing activity AI draft source handoff item: ${id}`);
      }

      return itemView;
    }
  );

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

function countActivityEditorAiDraftSourceCapabilities(
  capabilityCounts: ActivitySourceMaterialCapabilityCounts
) {
  return Object.values(capabilityCounts).filter((count) => count > 0).length;
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
    workflow: buildActivityEditorWorkflowView(),
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

export function buildActivityEditRouteHandoffView({
  activity,
  routeStatus,
}: {
  activity?: ActivityEditPageActivitySource | null;
  routeStatus: ActivityEditRouteState['status'];
}): ActivityEditRouteHandoffView {
  const summary = buildActivityEditRouteHandoffSummary({
    activity,
    routeStatus,
  });
  const itemViews = ACTIVITY_EDIT_ROUTE_HANDOFF_ITEM_IDS.map((id) =>
    buildActivityEditRouteHandoffItemView(
      buildActivityEditRouteHandoffItem({
        id,
        summary,
      })
    )
  );

  return {
    description: m.activity_edit_route_handoff_description(),
    itemViews,
    privacy: buildActivityEditRouteHandoffPrivacyContract(itemViews),
    title: m.activity_edit_route_handoff_title(),
  };
}

type ActivityEditRouteHandoffSummary = ReturnType<
  typeof buildActivityEditRouteHandoffSummary
>;

function buildActivityEditRouteHandoffSummary({
  activity,
  routeStatus,
}: {
  activity?: ActivityEditPageActivitySource | null;
  routeStatus: ActivityEditRouteState['status'];
}) {
  const content = activity?.contentJson;
  const sourceMaterials = normalizeActivityMaterialReferences(
    content?.sourceMaterials
  );
  const editAccessView = activity
    ? buildActivityEditAccessView(activity.visibility)
    : null;
  const editorInput =
    activity && editAccessView?.canEdit
      ? activityContentToEditorInput({
          content: activity.contentJson,
          description: activity.description,
          templateType: activity.templateType,
          title: activity.title,
          visibility: activity.visibility,
        })
      : null;
  const remixPlan = activity
    ? getTemplateRemixPlan({
        content: activity.contentJson,
        currentTemplateType: activity.templateType,
      })
    : null;

  return {
    answerExplanationCount:
      content?.questions.filter((question) =>
        hasRuntimeDisplayText(question.explanation)
      ).length ?? 0,
    canEdit: Boolean(editAccessView?.canEdit),
    descriptionHydration: editorInput
      ? getActivityEditRouteHandoffFieldState(editorInput.description)
      : m.activity_edit_route_handoff_not_loaded_value(),
    editAccess: activity
      ? getActivityEditRouteHandoffEditAccessValue(editAccessView?.canEdit)
      : m.activity_edit_route_handoff_unavailable_value(),
    editorMode:
      editorInput && editAccessView?.canEdit
        ? m.activity_edit_route_handoff_editor_mode_edit_value()
        : m.activity_edit_route_handoff_unavailable_value(),
    groupCount: content?.groups.length ?? 0,
    hasActivity: Boolean(activity),
    learningGoalHydration: editorInput
      ? getActivityEditRouteHandoffFieldState(editorInput.learningGoal)
      : m.activity_edit_route_handoff_not_loaded_value(),
    lifecycleGate: activity
      ? getActivityEditRouteHandoffLifecycleGateValue(editAccessView?.canEdit)
      : m.activity_edit_route_handoff_load_required_value(),
    pairCount: content?.pairs.length ?? 0,
    persistedSource: activity
      ? m.activity_edit_route_handoff_saved_source_value()
      : m.activity_edit_route_handoff_pending_load_value(),
    questionCount: content?.questions.length ?? 0,
    questionOptionCount:
      content?.questions.reduce(
        (count, question) => count + (question.options?.length ?? 0),
        0
      ) ?? 0,
    readyTemplateCount: remixPlan?.readyOptions.length ?? 0,
    restoreAction:
      activity && !editAccessView?.canEdit
        ? (editAccessView?.actionLabel ??
          m.activity_edit_route_handoff_unavailable_value())
        : m.activity_edit_route_handoff_restore_not_required_value(),
    routeStatus: getActivityEditRouteHandoffStatusValue(routeStatus),
    sourceActivity: activity
      ? m.activity_edit_route_handoff_source_loaded_value()
      : m.activity_edit_route_handoff_source_missing_value(),
    sourceMaterialCount: sourceMaterials.length,
    sourceMaterialKindCount: new Set(
      sourceMaterials.map((material) => material.kind)
    ).size,
    sourceReferenceHydration:
      sourceMaterials.length > 0
        ? m.activity_edit_route_handoff_references_hydrated_value()
        : m.activity_edit_route_handoff_references_empty_value(),
    sourceSummaryPrivacy:
      content && hasRuntimeDisplayText(content.sourceSummary)
        ? m.activity_edit_route_handoff_source_summary_hidden_value()
        : m.activity_edit_route_handoff_source_summary_empty_value(),
    teacherNoteCount: content?.teacherNotes.length ?? 0,
    templateHydration: activity
      ? getTemplateByType(activity.templateType).name
      : m.activity_edit_route_handoff_not_loaded_value(),
    titleHydration: editorInput
      ? getActivityEditRouteHandoffFieldState(editorInput.title)
      : m.activity_edit_route_handoff_not_loaded_value(),
    visibilityHydration: activity
      ? formatActivityEditRouteHandoffVisibility(activity.visibility)
      : m.activity_edit_route_handoff_not_loaded_value(),
    vocabularyCount: content?.vocabulary.length ?? 0,
  };
}

function buildActivityEditRouteHandoffItem({
  id,
  summary,
}: {
  id: ActivityEditRouteHandoffItemId;
  summary: ActivityEditRouteHandoffSummary;
}): Omit<ActivityEditRouteHandoffItemView, 'ariaLabel'> {
  switch (id) {
    case 'route-status':
      return {
        description: m.activity_edit_route_handoff_route_status_description(),
        id,
        label: m.activity_edit_route_handoff_route_status_label(),
        value: summary.routeStatus,
      };
    case 'activity-source':
      return {
        description:
          m.activity_edit_route_handoff_activity_source_description(),
        id,
        label: m.activity_edit_route_handoff_activity_source_label(),
        value: summary.sourceActivity,
      };
    case 'owner-scope':
      return {
        description: m.activity_edit_route_handoff_owner_scope_description(),
        id,
        label: m.activity_edit_route_handoff_owner_scope_label(),
        value: m.activity_edit_route_handoff_owner_scope_value(),
      };
    case 'persisted-source':
      return {
        description:
          m.activity_edit_route_handoff_persisted_source_description(),
        id,
        label: m.activity_edit_route_handoff_persisted_source_label(),
        value: summary.persistedSource,
      };
    case 'edit-access':
      return {
        description: m.activity_edit_route_handoff_edit_access_description(),
        id,
        label: m.activity_edit_route_handoff_edit_access_label(),
        value: summary.editAccess,
      };
    case 'lifecycle-gate':
      return {
        description: m.activity_edit_route_handoff_lifecycle_gate_description(),
        id,
        label: m.activity_edit_route_handoff_lifecycle_gate_label(),
        value: summary.lifecycleGate,
      };
    case 'archived-restore-action':
      return {
        description:
          m.activity_edit_route_handoff_archived_restore_action_description(),
        id,
        label: m.activity_edit_route_handoff_archived_restore_action_label(),
        value: summary.restoreAction,
      };
    case 'editor-mode':
      return {
        description: m.activity_edit_route_handoff_editor_mode_description(),
        id,
        label: m.activity_edit_route_handoff_editor_mode_label(),
        value: summary.editorMode,
      };
    case 'shared-input-contract':
      return {
        description:
          m.activity_edit_route_handoff_shared_input_contract_description(),
        id,
        label: m.activity_edit_route_handoff_shared_input_contract_label(),
        value: m.activity_edit_route_handoff_shared_input_contract_value(),
      };
    case 'title-hydration':
      return {
        description:
          m.activity_edit_route_handoff_title_hydration_description(),
        id,
        label: m.activity_edit_route_handoff_title_hydration_label(),
        value: summary.titleHydration,
      };
    case 'description-hydration':
      return {
        description:
          m.activity_edit_route_handoff_description_hydration_description(),
        id,
        label: m.activity_edit_route_handoff_description_hydration_label(),
        value: summary.descriptionHydration,
      };
    case 'template-hydration':
      return {
        description:
          m.activity_edit_route_handoff_template_hydration_description(),
        id,
        label: m.activity_edit_route_handoff_template_hydration_label(),
        value: summary.templateHydration,
      };
    case 'visibility-hydration':
      return {
        description:
          m.activity_edit_route_handoff_visibility_hydration_description(),
        id,
        label: m.activity_edit_route_handoff_visibility_hydration_label(),
        value: summary.visibilityHydration,
      };
    case 'learning-goal-hydration':
      return {
        description:
          m.activity_edit_route_handoff_learning_goal_hydration_description(),
        id,
        label: m.activity_edit_route_handoff_learning_goal_hydration_label(),
        value: summary.learningGoalHydration,
      };
    case 'question-row-count':
      return {
        description:
          m.activity_edit_route_handoff_question_row_count_description(),
        id,
        label: m.activity_form_field_questions(),
        value: String(summary.questionCount),
      };
    case 'question-option-count':
      return {
        description:
          m.activity_edit_route_handoff_question_option_count_description(),
        id,
        label: m.activity_edit_route_handoff_question_option_count_label(),
        value: String(summary.questionOptionCount),
      };
    case 'answer-explanation-count':
      return {
        description:
          m.activity_edit_route_handoff_answer_explanation_count_description(),
        id,
        label: m.activity_edit_route_handoff_answer_explanation_count_label(),
        value: String(summary.answerExplanationCount),
      };
    case 'pair-row-count':
      return {
        description: m.activity_edit_route_handoff_pair_row_count_description(),
        id,
        label: m.activity_form_field_pairs(),
        value: String(summary.pairCount),
      };
    case 'group-row-count':
      return {
        description:
          m.activity_edit_route_handoff_group_row_count_description(),
        id,
        label: m.activity_form_field_groups(),
        value: String(summary.groupCount),
      };
    case 'vocabulary-count':
      return {
        description:
          m.activity_edit_route_handoff_vocabulary_count_description(),
        id,
        label: m.activity_form_field_vocabulary(),
        value: String(summary.vocabularyCount),
      };
    case 'teacher-note-count':
      return {
        description:
          m.activity_edit_route_handoff_teacher_note_count_description(),
        id,
        label: m.activity_form_field_teacher_notes(),
        value: String(summary.teacherNoteCount),
      };
    case 'source-summary-privacy':
      return {
        description:
          m.activity_edit_route_handoff_source_summary_privacy_description(),
        id,
        label: m.activity_edit_route_handoff_source_summary_privacy_label(),
        value: summary.sourceSummaryPrivacy,
      };
    case 'source-material-count':
      return {
        description:
          m.activity_edit_route_handoff_source_material_count_description(),
        id,
        label: m.activity_edit_route_handoff_source_material_count_label(),
        value: String(summary.sourceMaterialCount),
      };
    case 'source-material-kind-count':
      return {
        description:
          m.activity_edit_route_handoff_source_material_kind_count_description(),
        id,
        label: m.activity_edit_route_handoff_source_material_kind_count_label(),
        value: String(summary.sourceMaterialKindCount),
      };
    case 'source-reference-hydration':
      return {
        description:
          m.activity_edit_route_handoff_source_reference_hydration_description(),
        id,
        label: m.activity_edit_route_handoff_source_reference_hydration_label(),
        value: summary.sourceReferenceHydration,
      };
    case 'readiness-after-load':
      return {
        description:
          m.activity_edit_route_handoff_readiness_after_load_description(),
        id,
        label: m.activity_edit_route_handoff_readiness_after_load_label(),
        value: summary.hasActivity
          ? m.activity_edit_route_handoff_ready_modes_value({
              count: summary.readyTemplateCount,
            })
          : m.activity_edit_route_handoff_not_loaded_value(),
      };
    case 'future-assignment-boundary':
      return {
        description:
          m.activity_edit_route_handoff_future_assignment_boundary_description(),
        id,
        label: m.activity_edit_route_handoff_future_assignment_boundary_label(),
        value: m.activity_edit_route_handoff_future_assignment_boundary_value(),
      };
    case 'snapshot-protection':
      return {
        description:
          m.activity_edit_route_handoff_snapshot_protection_description(),
        id,
        label: m.activity_edit_route_handoff_snapshot_protection_label(),
        value: m.activity_edit_route_handoff_snapshot_protection_value(),
      };
    case 'save-target':
      return {
        description: m.activity_edit_route_handoff_save_target_description(),
        id,
        label: m.activity_edit_route_handoff_save_target_label(),
        value: summary.canEdit
          ? m.activity_edit_route_handoff_save_target_update_value()
          : m.activity_edit_route_handoff_unavailable_value(),
      };
    case 'privacy-guard':
      return {
        description: m.activity_edit_route_handoff_privacy_guard_description(),
        id,
        label: m.activity_edit_route_handoff_privacy_guard_label(),
        value: m.activity_edit_route_handoff_privacy_guard_value(),
      };
  }
}

function buildActivityEditRouteHandoffItemView({
  description,
  id,
  label,
  value,
}: Omit<
  ActivityEditRouteHandoffItemView,
  'ariaLabel'
>): ActivityEditRouteHandoffItemView {
  return {
    ariaLabel: m.activity_edit_route_handoff_item_aria({
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

function buildActivityEditRouteHandoffPrivacyContract(
  itemViews: ActivityEditRouteHandoffItemView[]
): ActivityEditRouteHandoffPrivacyContract {
  return {
    exposesActivityContentText: false,
    exposesAnswerExplanationText: false,
    exposesAnswerText: false,
    exposesInternalActivityId: false,
    exposesQuestionOptionText: false,
    exposesQuestionPromptText: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialStorageKeys: false,
    exposesSourceSummaryText: false,
    exposesTeacherNotesText: false,
    itemIds: itemViews.map((item) => item.id),
    mutatesPublishedAssignmentSnapshots: false,
    scope: 'owner-activity-edit-route',
    usesCreateActivityInputContract: true,
  };
}

function getActivityEditRouteHandoffStatusValue(
  routeStatus: ActivityEditRouteState['status']
) {
  switch (routeStatus) {
    case 'blocked':
      return m.activity_edit_route_handoff_status_blocked_value();
    case 'error':
      return m.activity_edit_route_handoff_status_error_value();
    case 'loading':
      return m.activity_edit_route_handoff_status_loading_value();
    case 'ready':
      return m.activity_edit_route_handoff_status_ready_value();
  }
}

function getActivityEditRouteHandoffEditAccessValue(canEdit?: boolean) {
  return canEdit
    ? m.activity_edit_route_handoff_ready_value()
    : m.activity_edit_route_handoff_restore_required_value();
}

function getActivityEditRouteHandoffLifecycleGateValue(canEdit?: boolean) {
  return canEdit
    ? m.activity_edit_route_handoff_editable_value()
    : m.activity_edit_route_handoff_restore_first_value();
}

function getActivityEditRouteHandoffFieldState(value?: string | null) {
  return hasRuntimeDisplayText(value)
    ? m.activity_edit_route_handoff_field_hydrated_value()
    : m.activity_edit_route_handoff_field_empty_value();
}

function formatActivityEditRouteHandoffVisibility(
  visibility: ActivityVisibility
) {
  switch (visibility) {
    case 'archived':
      return m.activity_edit_route_handoff_visibility_archived_value();
    case 'draft':
    case 'private':
    case 'public':
    case 'unlisted':
      return formatActivityEditorVisibility(visibility);
  }
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
      currentContent,
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
  currentContent,
  readinessSummary,
  remixPlan,
  setupView,
  template,
}: {
  currentContent: ActivityContent | null;
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
  const currentCounts =
    buildActivityEditorTemplateCurrentContentCounts(currentContent);
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
    buildActivityEditorTemplateHandoffItem({
      description:
        m.activity_editor_template_handoff_shared_contract_description(),
      id: 'shared-editor-contract',
      label: m.activity_editor_template_handoff_shared_contract_label(),
      value: m.activity_editor_template_handoff_shared_contract_value(),
    }),
    buildActivityEditorTemplateHandoffItem({
      description:
        m.activity_editor_template_handoff_parsed_content_description(),
      id: 'parsed-content-status',
      label: m.activity_editor_template_handoff_parsed_content_label(),
      statusLabel: currentContent
        ? m.template_remix_ready()
        : m.template_remix_needs_more_content(),
      value: currentContent
        ? m.activity_editor_template_handoff_parsed_content_ready_value()
        : m.activity_editor_template_handoff_parsed_content_needs_review_value(),
    }),
    buildActivityEditorTemplateCurrentCountHandoffItem({
      description:
        m.activity_editor_template_handoff_current_questions_description(),
      id: 'current-question-count',
      label: m.activity_form_field_questions(),
      value: m.activity_template_scaffold_coverage_questions({
        count: currentCounts.questions,
      }),
    }),
    buildActivityEditorTemplateCurrentCountHandoffItem({
      description:
        m.activity_editor_template_handoff_current_pairs_description(),
      id: 'current-pair-count',
      label: m.activity_form_field_pairs(),
      value: m.activity_template_scaffold_coverage_pairs({
        count: currentCounts.pairs,
      }),
    }),
    buildActivityEditorTemplateCurrentCountHandoffItem({
      description:
        m.activity_editor_template_handoff_current_groups_description(),
      id: 'current-group-count',
      label: m.activity_form_field_groups(),
      value: m.activity_template_scaffold_coverage_groups({
        count: currentCounts.groups,
      }),
    }),
    buildActivityEditorTemplateCurrentCountHandoffItem({
      description:
        m.activity_editor_template_handoff_current_vocabulary_description(),
      id: 'current-vocabulary-count',
      label: m.activity_form_field_vocabulary(),
      value: m.activity_template_scaffold_coverage_vocabulary({
        count: currentCounts.vocabulary,
      }),
    }),
    buildActivityEditorTemplateCurrentCountHandoffItem({
      description:
        m.activity_editor_template_handoff_current_teacher_notes_description(),
      id: 'current-teacher-note-count',
      label: m.activity_form_field_teacher_notes(),
      value: m.activity_template_scaffold_coverage_teacher_notes({
        count: currentCounts.teacherNotes,
      }),
    }),
    buildActivityEditorTemplateHandoffItem({
      description:
        m.activity_editor_template_handoff_review_steps_description(),
      id: 'scaffold-review-steps',
      label: setupView.reviewChecklistLabel,
      value: m.activity_editor_template_handoff_review_steps_value({
        count: setupView.reviewChecklistItems.length,
      }),
    }),
    buildActivityEditorTemplateHandoffItem({
      description:
        m.activity_editor_template_handoff_save_boundary_description(),
      id: 'save-before-publish-boundary',
      label: m.activity_editor_template_handoff_save_boundary_label(),
      value: m.activity_editor_template_handoff_save_boundary_value(),
    }),
    buildActivityEditorTemplateHandoffItem({
      description: m.activity_editor_template_handoff_privacy_description(),
      id: 'privacy-guard',
      label: m.activity_editor_template_handoff_privacy_label(),
      value: m.activity_editor_template_handoff_privacy_value(),
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

function buildActivityEditorTemplateCurrentCountHandoffItem({
  description,
  id,
  label,
  value,
}: {
  description: string;
  id: ActivityEditorTemplateHandoffItemId;
  label: string;
  value: string;
}) {
  return buildActivityEditorTemplateHandoffItem({
    description,
    id,
    label,
    value,
  });
}

function buildActivityEditorTemplateCurrentContentCounts(
  content: ActivityContent | null
) {
  return {
    groups: content?.groups.length ?? 0,
    pairs: content?.pairs.length ?? 0,
    questions: content?.questions.length ?? 0,
    teacherNotes: content?.teacherNotes.length ?? 0,
    vocabulary: content?.vocabulary.length ?? 0,
  };
}

function buildActivityEditorTemplateHandoffPrivacyContract(
  itemViews: ActivityEditorTemplateHandoffItemView[]
): ActivityEditorTemplateHandoffPrivacyContract {
  return {
    exposesAnswerText: false,
    exposesCurrentFieldText: false,
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
