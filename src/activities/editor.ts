import type {
  ActivityContent,
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
import { getTemplateByType } from '@/activities/catalog';
import { getActivityTemplates } from '@/activities/catalog';
import {
  activityEditPageCopy,
  buildActivityEditAccessView,
} from '@/activities/lifecycle';
import { m } from '@/locale/paraglide/messages';
import { Routes } from '@/lib/routes';
import {
  appendActivitySourceMaterialDraftNotes,
  getActivityDraftSourceText,
  hasActivitySourceMaterialDraftNotes,
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
import {
  buildActivityTemplateScaffoldInput,
  buildActivityTemplateScaffoldReadinessSummary,
  getActivityTemplateScaffold,
  type ActivityTemplateScaffoldReadinessSummary,
} from '@/activities/scaffolds';
import {
  buildActivityTemplateReadinessPanelSummary,
  type ActivityTemplateReadinessPanelSummary,
} from '@/activities/draft-meta';
import {
  buildActivityContent,
  createActivityInputSchema,
  parseActivityContent,
  type CreateActivityInput,
} from '@/activities/validation';
import {
  getTemplateRemixPlan,
  formatTemplateRequirements,
  type TemplateRemixPlan,
} from '@/activities/template-remix';
import { normalizeOptionalRuntimeDisplayText } from '@/activities/runtime-display';

export const ACTIVITY_EDITOR_READINESS_PANEL_LIMITS = {
  lockedOptions: 4,
} as const;

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
    label: string;
  }>;
  description: string;
  editorSectionId: string;
  title: string;
};

type ActivityEditorTemplateSetupView = {
  actionLabel: string;
  description: string;
  requirementBadges: string[];
  scaffoldSummary: ActivityTemplateScaffoldReadinessSummary;
  shortName: string;
  successMessage: string;
  title: string;
};

type ActivityEditorSelectOption<TValue extends string> = {
  label: string;
  value: TValue;
};

type ActivityEditorSelectOptionsView = {
  difficultyOptions: ActivityEditorSelectOption<ActivityDifficulty>[];
  templateOptions: ActivityTemplateDefinition[];
  visibilityOptions: ActivityEditorSelectOption<
    (typeof ACTIVITY_CREATABLE_VISIBILITIES)[number]
  >[];
};

type ActivityEditorDraftSourceState = {
  canSyncDraftSourceMaterials: boolean;
  hasAttachedSourceMaterials: boolean;
  hasDraftSourceMaterialNotes: boolean;
};

type ActivityEditorAiDraftPanelView = {
  badgeLabel: string;
  canGenerateDraft: boolean;
  canSyncDraftSourceMaterials: boolean;
  focusLabel: string;
  focusOptions: ActivityAiDraftFocusOption[];
  generateButtonLabel: string;
  itemCountLabel: string;
  reviewNote: string;
  sourcePlaceholder: string;
  sourceTextLabel: string;
  syncMaterialsLabel: string;
  syncSuccessMessage: string;
};

type ActivityEditorDraftGenerationGate =
  | {
      canGenerate: false;
      errorMessage: string;
      sourceText: string;
    }
  | {
      canGenerate: true;
      sourceText: string;
    };

type ActivityEditorMode = 'create' | 'edit';

type ActivityEditorModeView = {
  footerHint: string;
  isEditMode: boolean;
  saveLabel: string;
  saveSuccessMessage: string;
  title: string;
};

type ActivityEditorSaveGate =
  | {
      canSave: false;
      errorMessage: string;
      mode: ActivityEditorMode;
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

type ActivityEditorTemplateScaffoldApplication = {
  draftSourceText: string;
  successMessage: string;
  values: CreateActivityInput;
};

type ActivityEditorTemplateView = {
  readinessSummary: ActivityTemplateReadinessPanelSummary;
  setupView: ActivityEditorTemplateSetupView;
  template: ActivityTemplateDefinition;
  templateOptions: ActivityTemplateDefinition[];
};

type ActivityCreatePageInputShapeView = {
  items: string[];
  title: string;
};

type ActivityCreatePageViewModel = {
  hero: {
    badgeLabel: string;
    description: string;
    title: string;
  };
  inputShape: ActivityCreatePageInputShapeView;
  previewLabel: string;
};

type ActivityCreatePageEditorViewModel = ActivityCreatePageViewModel & {
  initialValues?: CreateActivityInput;
  previewActivity: ActivitySeed;
  previewPanel: ActivityEditorPreviewPanel;
};

type ActivityEditPageActivitySource = Omit<ActivityEditorSource, 'content'> & {
  contentJson: ActivityContent;
  id: string;
};

type ActivityEditorPageBreadcrumb = {
  href?: string;
  isCurrentPage?: boolean;
  label: string;
};

type ActivityEditPageViewModel = {
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
  editAccessView: ReturnType<typeof buildActivityEditAccessView> | null;
  editor?: {
    activityId: string;
    initialValues: CreateActivityInput;
    mode: 'edit';
  };
  loadErrorMessage: string;
  title: string;
};

type ActivityEditRouteState =
  | {
      pageView: ActivityEditPageViewModel;
      status: 'loading';
    }
  | {
      pageView: ActivityEditPageViewModel;
      status: 'error';
    }
  | {
      pageView: ActivityEditPageViewModel & {
        editAccessView: NonNullable<
          ActivityEditPageViewModel['editAccessView']
        >;
      };
      status: 'blocked';
    }
  | {
      pageView: ActivityEditPageViewModel & {
        editor: NonNullable<ActivityEditPageViewModel['editor']>;
      };
      status: 'ready';
    };

const activityEditorSectionId = 'activity-editor';

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
  const hasAttachedSourceMaterials =
    Array.isArray(sourceMaterials) && sourceMaterials.length > 0;
  const hasDraftSourceMaterialNotes =
    hasActivitySourceMaterialDraftNotes(draftSourceText);

  return {
    canSyncDraftSourceMaterials:
      hasAttachedSourceMaterials || hasDraftSourceMaterialNotes,
    hasAttachedSourceMaterials,
    hasDraftSourceMaterialNotes,
  };
}

export function buildActivityEditorAiDraftPanelView({
  hasUser,
  isGeneratingDraft,
  sourceState,
}: {
  hasUser: boolean;
  isGeneratingDraft: boolean;
  sourceState: ActivityEditorDraftSourceState;
}): ActivityEditorAiDraftPanelView {
  return {
    badgeLabel: m.activity_form_ai_draft_badge(),
    canGenerateDraft: hasUser && !isGeneratingDraft,
    canSyncDraftSourceMaterials: sourceState.canSyncDraftSourceMaterials,
    focusLabel: m.activity_form_ai_focus_label(),
    focusOptions: buildActivityAiDraftFocusOptions(),
    generateButtonLabel: m.activity_form_generate_draft(),
    itemCountLabel: m.activity_form_ai_item_count_label(),
    reviewNote: m.activity_form_ai_draft_review_note(),
    sourcePlaceholder: m.activity_form_ai_source_placeholder(),
    sourceTextLabel: m.activity_form_ai_source_label(),
    syncMaterialsLabel: m.activity_form_use_attached_materials(),
    syncSuccessMessage: m.activity_form_toast_source_materials_synced(),
  };
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
  const trimmedSourceText = sourceText.trim();

  if (!hasUser) {
    return {
      canGenerate: false,
      errorMessage: m.activity_form_toast_sign_in_generate_draft(),
      sourceText: trimmedSourceText,
    };
  }

  if (!trimmedSourceText) {
    return {
      canGenerate: false,
      errorMessage: m.activity_form_toast_missing_draft_source(),
      sourceText: trimmedSourceText,
    };
  }

  return {
    canGenerate: true,
    sourceText: trimmedSourceText,
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
    };
  }

  if (mode === 'edit') {
    if (!activityId) {
      return {
        canSave: false,
        errorMessage: m.activity_form_toast_edit_missing_activity(),
        mode,
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
  visibility: (typeof ACTIVITY_CREATABLE_VISIBILITIES)[number]
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

export function buildActivityCreatePageViewModel(): ActivityCreatePageViewModel {
  return {
    hero: {
      badgeLabel: m.create_page_eyebrow(),
      description: m.create_page_description(),
      title: m.create_page_title(),
    },
    inputShape: {
      items: [
        m.create_page_input_shape_questions(),
        m.create_page_input_shape_pairs(),
        m.create_page_input_shape_groups(),
        m.create_page_input_shape_notes(),
      ],
      title: m.create_page_input_shapes_title(),
    },
    previewLabel: m.create_page_preview_label(),
  };
}

export function buildActivityCreatePageEditorViewModel(
  templateType?: ActivityTemplateType
): ActivityCreatePageEditorViewModel {
  const initialValues = buildActivityEditorInitialValues(templateType);

  return {
    ...buildActivityCreatePageViewModel(),
    initialValues,
    previewActivity: buildActivityEditorPreviewSeed(initialValues),
    previewPanel: buildActivityEditorPreviewPanel(initialValues),
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
        label: activityEditPageCopy.breadcrumbDashboard,
        href: Routes.Dashboard,
      },
      {
        label: activityEditPageCopy.breadcrumbActivities,
        href: Routes.DashboardActivities,
      },
      { label: title, isCurrentPage: true },
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
    requirementBadges: formatTemplateRequirements(
      template.contentRequirements
    ).map((requirement) =>
      m.activity_editor_requires_requirement({ requirement })
    ),
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
  const scaffoldSummaryInput = parsedCurrentInput.success
    ? parsedCurrentInput.data
    : getActivityEditorDefaultInput();

  return {
    readinessSummary:
      buildActivityEditorReadinessPanelSummary(templateReadiness),
    setupView: buildActivityEditorTemplateSetupView(
      templateType,
      scaffoldSummaryInput
    ),
    template,
    templateOptions,
  };
}

export function buildActivityEditorReadinessPanelSummary(
  remixPlan: TemplateRemixPlan | null
): ActivityTemplateReadinessPanelSummary {
  const summary = buildActivityTemplateReadinessPanelSummary(remixPlan);

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
    const content = parseActivityContent(parsed.data);
    return getTemplateRemixPlan({
      content,
      currentTemplateType: parsed.data.templateType,
    });
  } catch {
    return null;
  }
}
