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
