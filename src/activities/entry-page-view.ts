import {
  formatActivityTemplateClassroomMode,
  getActivityTemplates,
} from '@/activities/catalog';
import {
  buildTemplateCreateSearch,
  buildTemplateEntryAction,
  buildWorksheetHeroActions,
  buildWorksheetModeEntryAction,
  type CreateActivityTemplateSearch,
  type TemplateEntryAction,
  type TemplateEntryCreateLinkAction,
  type TemplateEntryLinkAction,
} from '@/activities/template-entry';
import {
  formatTemplateRequirementViews,
  type TemplateRequirementView,
} from '@/activities/template-remix';
import {
  getWorksheetModeDefinitions,
  type WorksheetModeDefinition,
  type WorksheetModeTemplate,
} from '@/activities/worksheet-modes';
import type {
  ActivityTemplateDefinition,
  ActivityTemplateType,
} from '@/activities/types';
import { Routes } from '@/lib/routes';
import { m } from '@/locale/paraglide/messages';

export type EntryActionSearch = CreateActivityTemplateSearch;

export type EntryAction = TemplateEntryAction;

export type LinkAction = TemplateEntryLinkAction;

export type CreateLinkAction = TemplateEntryCreateLinkAction;

export type PublicTemplateEntrySurface = 'templates' | 'worksheets';

export const PUBLIC_TEMPLATE_ENTRY_HANDOFF_ITEM_IDS = [
  'entry-surface',
  'templates-route',
  'worksheets-route',
  'template-count',
  'worksheet-mode-count',
  'default-template',
  'hero-create-action',
  'student-preview-action',
  'footer-create-action',
  'worksheet-primary-action',
  'worksheet-hero-actions',
  'worksheet-mode-actions',
  'templates-source-param',
  'worksheets-source-param',
  'template-search-param',
  'scaffold-loading',
  'shared-editor-contract',
  'content-requirements',
  'card-entry-steps',
  'worksheet-delivery-loop',
  'workflow-create',
  'workflow-assign',
  'workflow-student-submit',
  'workflow-review',
  'assignment-snapshot-boundary',
  'results-export-boundary',
  'printable-extension-boundary',
  'legacy-product-guard',
  'indexing-scope',
  'privacy-guard',
] as const;

export type PublicTemplateEntryHandoffItemId =
  (typeof PUBLIC_TEMPLATE_ENTRY_HANDOFF_ITEM_IDS)[number];

export type PublicTemplateEntryHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: PublicTemplateEntryHandoffItemId;
  label: string;
  value: string;
};

export type PublicTemplateEntryHandoffPrivacyContract = {
  exposesActivityContent: false;
  exposesAnswerKeys: false;
  exposesAssignmentAttempts: false;
  exposesRawStudentIdentity: false;
  exposesSourceMaterialStorageKeys: false;
  exposesTeacherPrivateWorkspaceData: false;
  itemIds: PublicTemplateEntryHandoffItemId[];
  mutatesTeacherData: false;
  opensCreateEditorOnly: true;
  preservesSharedActivityAssignmentModel: true;
  scope: 'public-template-entry';
  surface: PublicTemplateEntrySurface;
};

export type PublicTemplateEntryHandoffView = {
  description: string;
  itemViews: PublicTemplateEntryHandoffItemView[];
  privacy: PublicTemplateEntryHandoffPrivacyContract;
  title: string;
};

export type WorksheetsPageHeroActionView = EntryAction & {
  isPrimary: boolean;
  template: WorksheetModeTemplate;
};

export type TemplatesPageCardView = {
  action: EntryAction;
  ariaLabel: string;
  bestFor: string;
  bestForLabel: string;
  classroomMode: string;
  classroomModeLabel: string;
  contentRequirements: TemplateRequirementView[];
  contentRequirementsAriaLabel: string;
  contentRequirementsLabel: string;
  description: string;
  entryLabel: string;
  entrySteps: TemplatesPageCardEntryStepView[];
  name: string;
  template: ActivityTemplateType;
};

export type TemplatesPageCardEntryStepId =
  | 'load-scaffold'
  | 'select-template'
  | 'shared-editor';

export type TemplatesPageCardEntryStepView = {
  ariaLabel: string;
  description: string;
  id: TemplatesPageCardEntryStepId;
  label: string;
  value: string;
};

export type TemplatesPageViewModelInput = {
  activityTemplates?: ActivityTemplateDefinition[];
};

export type TemplatesPageViewModel = {
  cards: TemplatesPageCardView[];
  footer: {
    createAction: CreateLinkAction;
    description: string;
    title: string;
  };
  hero: {
    badgeLabel: string;
    createAction: EntryAction;
    description: string;
    studentPreviewAction: LinkAction;
    title: string;
  };
  handoffView: PublicTemplateEntryHandoffView;
};

export type WorksheetsPageModeCardView = {
  action: EntryAction;
  ariaLabel: string;
  contentRequirements: TemplateRequirementView[];
  description: string;
  signalLabel: string;
  signalViews: WorksheetsPageModeSignalView[];
  template: WorksheetModeTemplate;
  title: string;
};

export type WorksheetsPageModeSignalId =
  | 'assignment-link'
  | 'editor-scaffold'
  | 'results-export';

export type WorksheetsPageModeSignalView = {
  ariaLabel: string;
  description: string;
  id: WorksheetsPageModeSignalId;
  label: string;
  value: string;
};

export type WorksheetsPageResultSignalId =
  | 'accepted-answers'
  | 'attempts'
  | 'csv-export'
  | 'reteach';

export type WorksheetsPageResultSignalView = {
  ariaLabel: string;
  description: string;
  id: WorksheetsPageResultSignalId;
  label: string;
  value: string;
};

export type WorksheetsPageWorkflowStepId =
  | 'assign'
  | 'create'
  | 'review'
  | 'student-submit';

export type WorksheetsPageWorkflowStepView = {
  ariaLabel: string;
  description: string;
  id: WorksheetsPageWorkflowStepId;
  label: string;
  positionLabel: string;
};

export type WorksheetsPageViewModel = {
  deliveryLoop: {
    ariaLabel: string;
    description: string;
    title: string;
  };
  hero: {
    badgeLabel: string;
    description: string;
    title: string;
  };
  handoffView: PublicTemplateEntryHandoffView;
  heroActions: WorksheetsPageHeroActionView[];
  modeCards: WorksheetsPageModeCardView[];
  printable: {
    description: string;
    title: string;
  };
  resultSignals: WorksheetsPageResultSignalView[];
  templatesCta: {
    action: LinkAction;
    description: string;
    title: string;
  };
  workflowSteps: WorksheetsPageWorkflowStepView[];
};

export function buildTemplatesPageViewModel({
  activityTemplates = getActivityTemplates(),
}: TemplatesPageViewModelInput = {}): TemplatesPageViewModel {
  const cards = activityTemplates.map((template) => ({
    action: buildTemplateEntryAction(template),
    ariaLabel: m.templates_page_card_aria_label({
      description: template.description,
      template: template.name,
    }),
    bestFor: template.bestFor,
    bestForLabel: m.templates_page_best_for_label(),
    classroomMode: formatActivityTemplateClassroomMode(template.classroomMode),
    classroomModeLabel: m.templates_page_classroom_mode_label(),
    contentRequirements: formatTemplateRequirementViews(
      template.contentRequirements
    ),
    contentRequirementsAriaLabel: m.templates_page_requirements_aria_label({
      template: template.name,
    }),
    contentRequirementsLabel: m.templates_page_requirements_label(),
    description: template.description,
    entryLabel: m.templates_page_entry_label(),
    entrySteps: buildTemplatesPageCardEntrySteps(template.shortName),
    name: template.name,
    template: template.type,
  }));
  const defaultCreateAction = cards[0]?.action ?? {
    ariaLabel: m.templates_page_hero_create_action_aria_label(),
    label: m.templates_page_create_from_template(),
    search: buildTemplateCreateSearch('quiz', 'templates'),
    to: Routes.Create,
  };

  return {
    cards,
    footer: {
      createAction: {
        ariaLabel: m.templates_page_footer_create_action_aria_label(),
        label: m.templates_page_create_activity(),
        to: Routes.Create,
      },
      description: m.templates_page_bottom_description(),
      title: m.templates_page_bottom_title(),
    },
    hero: {
      badgeLabel: m.templates_page_eyebrow(),
      createAction: {
        ...defaultCreateAction,
        ariaLabel: m.templates_page_hero_create_action_aria_label(),
        label: m.templates_page_create_from_template(),
      },
      description: m.templates_page_description(),
      studentPreviewAction: {
        ariaLabel: m.templates_page_student_preview_action_aria_label(),
        label: m.templates_page_open_student_preview(),
        to: Routes.StudentPreview,
      },
      title: m.templates_page_title(),
    },
    handoffView: buildPublicTemplateEntryHandoffView({
      activityTemplates,
      surface: 'templates',
    }),
  };
}

function buildTemplatesPageCardEntrySteps(
  templateShortName: string
): TemplatesPageCardEntryStepView[] {
  const steps = [
    {
      description: m.templates_page_entry_step_template_description(),
      id: 'select-template',
      label: m.templates_page_entry_step_template_label(),
      value: m.templates_page_entry_step_template_value({
        template: templateShortName,
      }),
    },
    {
      description: m.templates_page_entry_step_scaffold_description(),
      id: 'load-scaffold',
      label: m.templates_page_entry_step_scaffold_label(),
      value: m.templates_page_entry_step_scaffold_value(),
    },
    {
      description: m.templates_page_entry_step_shared_description(),
      id: 'shared-editor',
      label: m.templates_page_entry_step_shared_label(),
      value: m.templates_page_entry_step_shared_value(),
    },
  ] satisfies Array<Omit<TemplatesPageCardEntryStepView, 'ariaLabel'>>;

  return steps.map((step) => ({
    ...step,
    ariaLabel: m.templates_page_entry_step_aria_label({
      description: step.description,
      label: step.label,
      value: step.value,
    }),
  }));
}

export function buildWorksheetsPageViewModel({
  activityTemplates = getActivityTemplates(),
  worksheetModeDefinitions = getWorksheetModeDefinitions(),
}: {
  activityTemplates?: ActivityTemplateDefinition[];
  worksheetModeDefinitions?: WorksheetModeDefinition[];
} = {}): WorksheetsPageViewModel {
  const deliveryLoop = buildWorksheetsPageDeliveryLoopView();

  return {
    deliveryLoop,
    hero: {
      badgeLabel: m.worksheets_page_eyebrow(),
      description: m.worksheets_page_description(),
      title: m.worksheets_page_title(),
    },
    handoffView: buildPublicTemplateEntryHandoffView({
      activityTemplates,
      surface: 'worksheets',
      worksheetModeDefinitions,
    }),
    heroActions: buildWorksheetHeroActions(worksheetModeDefinitions),
    modeCards: worksheetModeDefinitions.map((mode) => {
      const template = activityTemplates.find(
        (item) => item.type === mode.template
      );
      const signalViews = buildWorksheetsPageModeSignalViews();

      return {
        action: buildWorksheetModeEntryAction(mode),
        ariaLabel: m.worksheets_page_mode_card_aria_label({
          description: mode.description,
          mode: mode.title,
        }),
        contentRequirements: template
          ? formatTemplateRequirementViews(template.contentRequirements)
          : [],
        description: mode.description,
        signalLabel: m.worksheets_page_mode_signal_label(),
        signalViews,
        template: mode.template,
        title: mode.title,
      };
    }),
    printable: {
      description: m.worksheets_page_printable_description(),
      title: m.worksheets_page_printable_title(),
    },
    resultSignals: buildWorksheetsPageResultSignals(),
    templatesCta: {
      action: {
        ariaLabel: m.worksheets_page_templates_cta_action_aria_label(),
        label: m.worksheets_page_browse_templates(),
        to: Routes.Templates,
      },
      description: m.worksheets_page_templates_cta_description(),
      title: m.worksheets_page_templates_cta_title(),
    },
    workflowSteps: buildWorksheetsPageWorkflowSteps(),
  };
}

function buildWorksheetsPageDeliveryLoopView(): WorksheetsPageViewModel['deliveryLoop'] {
  const title = m.worksheets_page_delivery_loop_title();
  const description = m.worksheets_page_delivery_loop_description();

  return {
    ariaLabel: m.worksheets_page_delivery_loop_aria_label({
      description,
      title,
    }),
    description,
    title,
  };
}

function buildWorksheetsPageWorkflowSteps(): WorksheetsPageWorkflowStepView[] {
  const steps = [
    {
      description: m.worksheets_page_workflow_step_1(),
      id: 'create',
      label: m.worksheets_page_workflow_step_create_label(),
    },
    {
      description: m.worksheets_page_workflow_step_2(),
      id: 'assign',
      label: m.worksheets_page_workflow_step_assign_label(),
    },
    {
      description: m.worksheets_page_workflow_step_3(),
      id: 'student-submit',
      label: m.worksheets_page_workflow_step_student_submit_label(),
    },
    {
      description: m.worksheets_page_workflow_step_4(),
      id: 'review',
      label: m.worksheets_page_workflow_step_review_label(),
    },
  ] satisfies Array<
    Omit<WorksheetsPageWorkflowStepView, 'ariaLabel' | 'positionLabel'>
  >;

  return steps.map((step, index) => ({
    ...step,
    ariaLabel: m.worksheets_page_workflow_step_aria_label({
      description: step.description,
      label: step.label,
      position: formatWorksheetsPageWorkflowPosition(index),
    }),
    positionLabel: formatWorksheetsPageWorkflowPosition(index),
  }));
}

function buildWorksheetsPageModeSignalViews(): WorksheetsPageModeSignalView[] {
  const signals = [
    {
      description: m.worksheets_page_mode_signal_editor_description(),
      id: 'editor-scaffold',
      label: m.worksheets_page_mode_signal_editor_label(),
      value: m.worksheets_page_mode_signal_editor_value(),
    },
    {
      description: m.worksheets_page_mode_signal_assignment_description(),
      id: 'assignment-link',
      label: m.worksheets_page_mode_signal_assignment_label(),
      value: m.worksheets_page_mode_signal_assignment_value(),
    },
    {
      description: m.worksheets_page_mode_signal_results_description(),
      id: 'results-export',
      label: m.worksheets_page_mode_signal_results_label(),
      value: m.worksheets_page_mode_signal_results_value(),
    },
  ] satisfies Array<Omit<WorksheetsPageModeSignalView, 'ariaLabel'>>;

  return signals.map((signal) => ({
    ...signal,
    ariaLabel: m.worksheets_page_mode_signal_aria_label({
      description: signal.description,
      label: signal.label,
      value: signal.value,
    }),
  }));
}

function buildWorksheetsPageResultSignals(): WorksheetsPageResultSignalView[] {
  const signals = [
    {
      description: m.worksheets_page_result_signal_attempts_description(),
      id: 'attempts',
      label: m.worksheets_page_result_signal_attempts(),
      value: m.worksheets_page_result_signal_attempts_value(),
    },
    {
      description: m.worksheets_page_result_signal_alternatives_description(),
      id: 'accepted-answers',
      label: m.worksheets_page_result_signal_alternatives(),
      value: m.worksheets_page_result_signal_alternatives_value(),
    },
    {
      description: m.worksheets_page_result_signal_reteach_description(),
      id: 'reteach',
      label: m.worksheets_page_result_signal_reteach(),
      value: m.worksheets_page_result_signal_reteach_value(),
    },
    {
      description: m.worksheets_page_result_signal_csv_description(),
      id: 'csv-export',
      label: m.worksheets_page_result_signal_csv(),
      value: m.worksheets_page_result_signal_csv_value(),
    },
  ] satisfies Array<Omit<WorksheetsPageResultSignalView, 'ariaLabel'>>;

  return signals.map((signal) => ({
    ...signal,
    ariaLabel: m.worksheets_page_result_signal_aria_label({
      description: signal.description,
      label: signal.label,
      value: signal.value,
    }),
  }));
}

function formatWorksheetsPageWorkflowPosition(index: number) {
  return String(index + 1);
}

export function buildPublicTemplateEntryHandoffView({
  activityTemplates = getActivityTemplates(),
  surface,
  worksheetModeDefinitions = getWorksheetModeDefinitions(),
}: {
  activityTemplates?: ActivityTemplateDefinition[];
  surface: PublicTemplateEntrySurface;
  worksheetModeDefinitions?: WorksheetModeDefinition[];
}): PublicTemplateEntryHandoffView {
  const heroActions = buildWorksheetHeroActions(worksheetModeDefinitions);
  const itemViews = PUBLIC_TEMPLATE_ENTRY_HANDOFF_ITEM_IDS.map((id) =>
    buildPublicTemplateEntryHandoffItemView({
      activityTemplates,
      heroActions,
      id,
      surface,
      worksheetModeDefinitions,
    })
  );

  return {
    description: m.public_template_entry_handoff_description(),
    itemViews,
    privacy: buildPublicTemplateEntryHandoffPrivacyContract({
      itemViews,
      surface,
    }),
    title: m.public_template_entry_handoff_title(),
  };
}

function buildPublicTemplateEntryHandoffPrivacyContract({
  itemViews,
  surface,
}: {
  itemViews: PublicTemplateEntryHandoffItemView[];
  surface: PublicTemplateEntrySurface;
}): PublicTemplateEntryHandoffPrivacyContract {
  return {
    exposesActivityContent: false,
    exposesAnswerKeys: false,
    exposesAssignmentAttempts: false,
    exposesRawStudentIdentity: false,
    exposesSourceMaterialStorageKeys: false,
    exposesTeacherPrivateWorkspaceData: false,
    itemIds: itemViews.map((itemView) => itemView.id),
    mutatesTeacherData: false,
    opensCreateEditorOnly: true,
    preservesSharedActivityAssignmentModel: true,
    scope: 'public-template-entry',
    surface,
  };
}

function buildPublicTemplateEntryHandoffItemView({
  activityTemplates,
  heroActions,
  id,
  surface,
  worksheetModeDefinitions,
}: {
  activityTemplates: ActivityTemplateDefinition[];
  heroActions: WorksheetsPageHeroActionView[];
  id: PublicTemplateEntryHandoffItemId;
  surface: PublicTemplateEntrySurface;
  worksheetModeDefinitions: WorksheetModeDefinition[];
}): PublicTemplateEntryHandoffItemView {
  const value = getPublicTemplateEntryHandoffItemValue({
    activityTemplates,
    heroActions,
    id,
    surface,
    worksheetModeDefinitions,
  });
  const label = getPublicTemplateEntryHandoffItemLabel(id);
  const description = getPublicTemplateEntryHandoffItemDescription(id);

  return {
    ariaLabel: m.public_template_entry_handoff_item_aria_label({
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

function getPublicTemplateEntryHandoffItemValue({
  activityTemplates,
  heroActions,
  id,
  surface,
  worksheetModeDefinitions,
}: {
  activityTemplates: ActivityTemplateDefinition[];
  heroActions: WorksheetsPageHeroActionView[];
  id: PublicTemplateEntryHandoffItemId;
  surface: PublicTemplateEntrySurface;
  worksheetModeDefinitions: WorksheetModeDefinition[];
}) {
  const firstTemplate = activityTemplates[0];
  const primaryWorksheetAction =
    heroActions.find((action) => action.isPrimary) ?? heroActions[0];
  const requirementCount = new Set(
    activityTemplates.flatMap((template) => template.contentRequirements)
  ).size;
  const entryStepCount = buildTemplatesPageCardEntrySteps(
    firstTemplate?.shortName ?? ''
  ).length;

  switch (id) {
    case 'entry-surface':
      return surface === 'templates'
        ? m.public_template_entry_handoff_surface_templates_value()
        : m.public_template_entry_handoff_surface_worksheets_value();
    case 'templates-route':
      return Routes.Templates;
    case 'worksheets-route':
      return Routes.Worksheets;
    case 'template-count':
      return m.public_template_entry_handoff_count_value({
        count: activityTemplates.length,
      });
    case 'worksheet-mode-count':
      return m.public_template_entry_handoff_count_value({
        count: worksheetModeDefinitions.length,
      });
    case 'default-template':
      return (
        firstTemplate?.shortName ??
        m.public_template_entry_handoff_unavailable_value()
      );
    case 'hero-create-action':
      return m.templates_page_create_from_template();
    case 'student-preview-action':
      return m.templates_page_open_student_preview();
    case 'footer-create-action':
      return m.templates_page_create_activity();
    case 'worksheet-primary-action':
      return (
        primaryWorksheetAction?.label ??
        m.public_template_entry_handoff_unavailable_value()
      );
    case 'worksheet-hero-actions':
      return m.public_template_entry_handoff_count_value({
        count: heroActions.length,
      });
    case 'worksheet-mode-actions':
      return m.public_template_entry_handoff_count_value({
        count: worksheetModeDefinitions.length,
      });
    case 'templates-source-param':
      return 'source=templates';
    case 'worksheets-source-param':
      return 'source=worksheets';
    case 'template-search-param':
      return 'template';
    case 'scaffold-loading':
      return m.public_template_entry_handoff_scaffold_value();
    case 'shared-editor-contract':
      return 'CreateActivityInput';
    case 'content-requirements':
      return m.public_template_entry_handoff_count_value({
        count: requirementCount,
      });
    case 'card-entry-steps':
      return m.public_template_entry_handoff_count_value({
        count: entryStepCount,
      });
    case 'worksheet-delivery-loop':
      return 'Activity -> Assignment -> Attempt -> Results';
    case 'workflow-create':
      return m.worksheets_page_workflow_step_create_label();
    case 'workflow-assign':
      return m.worksheets_page_workflow_step_assign_label();
    case 'workflow-student-submit':
      return m.worksheets_page_workflow_step_student_submit_label();
    case 'workflow-review':
      return m.worksheets_page_workflow_step_review_label();
    case 'assignment-snapshot-boundary':
      return 'AssignmentSnapshot';
    case 'results-export-boundary':
      return m.public_template_entry_handoff_results_value();
    case 'printable-extension-boundary':
      return m.public_template_entry_handoff_printable_value();
    case 'legacy-product-guard':
      return m.public_template_entry_handoff_legacy_guard_value();
    case 'indexing-scope':
      return m.public_template_entry_handoff_indexing_value();
    case 'privacy-guard':
      return m.public_template_entry_handoff_privacy_value();
  }

  const exhaustiveItemId: never = id;
  return exhaustiveItemId;
}

function getPublicTemplateEntryHandoffItemLabel(
  id: PublicTemplateEntryHandoffItemId
) {
  switch (id) {
    case 'entry-surface':
      return m.public_template_entry_handoff_surface_label();
    case 'templates-route':
      return m.public_template_entry_handoff_templates_route_label();
    case 'worksheets-route':
      return m.public_template_entry_handoff_worksheets_route_label();
    case 'template-count':
      return m.public_template_entry_handoff_template_count_label();
    case 'worksheet-mode-count':
      return m.public_template_entry_handoff_worksheet_mode_count_label();
    case 'default-template':
      return m.public_template_entry_handoff_default_template_label();
    case 'hero-create-action':
      return m.public_template_entry_handoff_hero_create_label();
    case 'student-preview-action':
      return m.public_template_entry_handoff_student_preview_label();
    case 'footer-create-action':
      return m.public_template_entry_handoff_footer_create_label();
    case 'worksheet-primary-action':
      return m.public_template_entry_handoff_worksheet_primary_label();
    case 'worksheet-hero-actions':
      return m.public_template_entry_handoff_worksheet_hero_actions_label();
    case 'worksheet-mode-actions':
      return m.public_template_entry_handoff_worksheet_mode_actions_label();
    case 'templates-source-param':
      return m.public_template_entry_handoff_templates_source_label();
    case 'worksheets-source-param':
      return m.public_template_entry_handoff_worksheets_source_label();
    case 'template-search-param':
      return m.public_template_entry_handoff_template_search_label();
    case 'scaffold-loading':
      return m.public_template_entry_handoff_scaffold_label();
    case 'shared-editor-contract':
      return m.public_template_entry_handoff_shared_editor_label();
    case 'content-requirements':
      return m.public_template_entry_handoff_content_requirements_label();
    case 'card-entry-steps':
      return m.public_template_entry_handoff_card_steps_label();
    case 'worksheet-delivery-loop':
      return m.public_template_entry_handoff_delivery_loop_label();
    case 'workflow-create':
      return m.public_template_entry_handoff_workflow_create_label();
    case 'workflow-assign':
      return m.public_template_entry_handoff_workflow_assign_label();
    case 'workflow-student-submit':
      return m.public_template_entry_handoff_workflow_submit_label();
    case 'workflow-review':
      return m.public_template_entry_handoff_workflow_review_label();
    case 'assignment-snapshot-boundary':
      return m.public_template_entry_handoff_snapshot_label();
    case 'results-export-boundary':
      return m.public_template_entry_handoff_results_label();
    case 'printable-extension-boundary':
      return m.public_template_entry_handoff_printable_label();
    case 'legacy-product-guard':
      return m.public_template_entry_handoff_legacy_guard_label();
    case 'indexing-scope':
      return m.public_template_entry_handoff_indexing_label();
    case 'privacy-guard':
      return m.public_template_entry_handoff_privacy_label();
  }

  const exhaustiveItemId: never = id;
  return exhaustiveItemId;
}

function getPublicTemplateEntryHandoffItemDescription(
  id: PublicTemplateEntryHandoffItemId
) {
  switch (id) {
    case 'entry-surface':
      return m.public_template_entry_handoff_surface_description();
    case 'templates-route':
      return m.public_template_entry_handoff_templates_route_description();
    case 'worksheets-route':
      return m.public_template_entry_handoff_worksheets_route_description();
    case 'template-count':
      return m.public_template_entry_handoff_template_count_description();
    case 'worksheet-mode-count':
      return m.public_template_entry_handoff_worksheet_mode_count_description();
    case 'default-template':
      return m.public_template_entry_handoff_default_template_description();
    case 'hero-create-action':
      return m.public_template_entry_handoff_hero_create_description();
    case 'student-preview-action':
      return m.public_template_entry_handoff_student_preview_description();
    case 'footer-create-action':
      return m.public_template_entry_handoff_footer_create_description();
    case 'worksheet-primary-action':
      return m.public_template_entry_handoff_worksheet_primary_description();
    case 'worksheet-hero-actions':
      return m.public_template_entry_handoff_worksheet_hero_actions_description();
    case 'worksheet-mode-actions':
      return m.public_template_entry_handoff_worksheet_mode_actions_description();
    case 'templates-source-param':
      return m.public_template_entry_handoff_templates_source_description();
    case 'worksheets-source-param':
      return m.public_template_entry_handoff_worksheets_source_description();
    case 'template-search-param':
      return m.public_template_entry_handoff_template_search_description();
    case 'scaffold-loading':
      return m.public_template_entry_handoff_scaffold_description();
    case 'shared-editor-contract':
      return m.public_template_entry_handoff_shared_editor_description();
    case 'content-requirements':
      return m.public_template_entry_handoff_content_requirements_description();
    case 'card-entry-steps':
      return m.public_template_entry_handoff_card_steps_description();
    case 'worksheet-delivery-loop':
      return m.public_template_entry_handoff_delivery_loop_description();
    case 'workflow-create':
      return m.public_template_entry_handoff_workflow_create_description();
    case 'workflow-assign':
      return m.public_template_entry_handoff_workflow_assign_description();
    case 'workflow-student-submit':
      return m.public_template_entry_handoff_workflow_submit_description();
    case 'workflow-review':
      return m.public_template_entry_handoff_workflow_review_description();
    case 'assignment-snapshot-boundary':
      return m.public_template_entry_handoff_snapshot_description();
    case 'results-export-boundary':
      return m.public_template_entry_handoff_results_description();
    case 'printable-extension-boundary':
      return m.public_template_entry_handoff_printable_description();
    case 'legacy-product-guard':
      return m.public_template_entry_handoff_legacy_guard_description();
    case 'indexing-scope':
      return m.public_template_entry_handoff_indexing_description();
    case 'privacy-guard':
      return m.public_template_entry_handoff_privacy_description();
  }

  const exhaustiveItemId: never = id;
  return exhaustiveItemId;
}
