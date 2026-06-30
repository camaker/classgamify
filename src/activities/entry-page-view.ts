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
import { formatTemplateRequirements } from '@/activities/template-remix';
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
  bestFor: string;
  bestForLabel: string;
  classroomMode: string;
  classroomModeLabel: string;
  contentRequirements: string[];
  description: string;
  name: string;
  template: ActivityTemplateType;
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
  contentRequirements: string[];
  description: string;
  template: WorksheetModeTemplate;
  title: string;
};

export type WorksheetsPageViewModel = {
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
  resultSignals: string[];
  templatesCta: {
    action: LinkAction;
    description: string;
    title: string;
  };
  workflowSteps: string[];
};

export function buildTemplatesPageViewModel({
  activityTemplates = getActivityTemplates(),
}: TemplatesPageViewModelInput = {}): TemplatesPageViewModel {
  const cards = activityTemplates.map((template) => ({
    action: buildTemplateEntryAction(template),
    bestFor: template.bestFor,
    bestForLabel: m.templates_page_best_for_label(),
    classroomMode: formatActivityTemplateClassroomMode(template.classroomMode),
    classroomModeLabel: m.templates_page_classroom_mode_label(),
    contentRequirements: formatTemplateRequirements(
      template.contentRequirements
    ),
    description: template.description,
    name: template.name,
    template: template.type,
  }));
  const defaultCreateAction = cards[0]?.action ?? {
    label: m.templates_page_create_from_template(),
    search: buildTemplateCreateSearch('quiz'),
    to: Routes.Create,
  };

  return {
    cards,
    footer: {
      createAction: {
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
        label: m.templates_page_create_from_template(),
      },
      description: m.templates_page_description(),
      studentPreviewAction: {
        label: m.templates_page_open_student_preview(),
        to: Routes.StudentPreview,
      },
      title: m.templates_page_title(),
    },
  };
}

export function buildWorksheetsPageViewModel({
  activityTemplates = getActivityTemplates(),
  worksheetModeDefinitions = getWorksheetModeDefinitions(),
}: {
  activityTemplates?: ActivityTemplateDefinition[];
  worksheetModeDefinitions?: WorksheetModeDefinition[];
} = {}): WorksheetsPageViewModel {
  return {
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

      return {
        action: buildWorksheetModeEntryAction(mode),
        contentRequirements: template
          ? formatTemplateRequirements(template.contentRequirements)
          : [],
        description: mode.description,
        template: mode.template,
        title: mode.title,
      };
    }),
    printable: {
      description: m.worksheets_page_printable_description(),
      title: m.worksheets_page_printable_title(),
    },
    resultSignals: [
      m.worksheets_page_result_signal_attempts(),
      m.worksheets_page_result_signal_alternatives(),
      m.worksheets_page_result_signal_reteach(),
      m.worksheets_page_result_signal_csv(),
    ],
    templatesCta: {
      action: {
        label: m.worksheets_page_browse_templates(),
        to: Routes.Templates,
      },
      description: m.worksheets_page_templates_cta_description(),
      title: m.worksheets_page_templates_cta_title(),
    },
    workflowSteps: [
      m.worksheets_page_workflow_step_1(),
      m.worksheets_page_workflow_step_2(),
      m.worksheets_page_workflow_step_3(),
      m.worksheets_page_workflow_step_4(),
    ],
  };
}
