import {
  formatActivityTemplateClassroomMode,
  getActivityTemplates,
} from '@/activities/catalog';
import {
  buildTemplateEntryAction,
  buildWorksheetHeroActions,
  buildWorksheetModeEntryAction,
} from '@/activities/template-entry';
import { formatTemplateRequirement } from '@/activities/template-remix';
import {
  getWorksheetModeDefinitions,
  type WorksheetModeDefinition,
  type WorksheetModeTemplate,
} from '@/activities/worksheet-modes';
import type { ActivityTemplateDefinition } from '@/activities/types';
import { m } from '@/locale/paraglide/messages';

type EntryActionSearch = {
  template: ActivityTemplateDefinition['type'] | WorksheetModeTemplate;
};

type EntryAction = {
  label: string;
  search: EntryActionSearch;
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
  template: ActivityTemplateDefinition['type'];
};

export type TemplatesPageViewModelInput = {
  activityTemplates?: ActivityTemplateDefinition[];
};

export type TemplatesPageViewModel = {
  cards: TemplatesPageCardView[];
  footer: {
    createActivityLabel: string;
    description: string;
    title: string;
  };
  hero: {
    badgeLabel: string;
    createFromTemplateLabel: string;
    description: string;
    openStudentPreviewLabel: string;
    title: string;
  };
};

export type WorksheetsPageModeCardView = {
  action: EntryAction;
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
  heroActions: Array<{
    isPrimary: boolean;
    label: string;
    search: EntryActionSearch;
    template: WorksheetModeTemplate;
  }>;
  modeCards: WorksheetsPageModeCardView[];
  printable: {
    description: string;
    title: string;
  };
  resultSignals: string[];
  templatesCta: {
    description: string;
    label: string;
    title: string;
  };
  workflowSteps: string[];
};

export function buildTemplatesPageViewModel({
  activityTemplates = getActivityTemplates(),
}: TemplatesPageViewModelInput = {}): TemplatesPageViewModel {
  return {
    cards: activityTemplates.map((template) => ({
      action: buildTemplateEntryAction(template),
      bestFor: template.bestFor,
      bestForLabel: m.templates_page_best_for_label(),
      classroomMode: formatActivityTemplateClassroomMode(
        template.classroomMode
      ),
      classroomModeLabel: m.templates_page_classroom_mode_label(),
      contentRequirements: template.contentRequirements.map((requirement) =>
        formatTemplateRequirement(requirement)
      ),
      description: template.description,
      name: template.name,
      template: template.type,
    })),
    footer: {
      createActivityLabel: m.templates_page_create_activity(),
      description: m.templates_page_bottom_description(),
      title: m.templates_page_bottom_title(),
    },
    hero: {
      badgeLabel: m.templates_page_eyebrow(),
      createFromTemplateLabel: m.templates_page_create_from_template(),
      description: m.templates_page_description(),
      openStudentPreviewLabel: m.templates_page_open_student_preview(),
      title: m.templates_page_title(),
    },
  };
}

export function buildWorksheetsPageViewModel({
  worksheetModeDefinitions = getWorksheetModeDefinitions(),
}: {
  worksheetModeDefinitions?: WorksheetModeDefinition[];
} = {}): WorksheetsPageViewModel {
  const heroActions = buildWorksheetHeroActions(worksheetModeDefinitions).map(
    (action, index) => ({
      ...action,
      isPrimary: index === 0,
    })
  );

  return {
    hero: {
      badgeLabel: m.worksheets_page_eyebrow(),
      description: m.worksheets_page_description(),
      title: m.worksheets_page_title(),
    },
    heroActions,
    modeCards: worksheetModeDefinitions.map((mode) => ({
      action: buildWorksheetModeEntryAction(mode),
      description: mode.description,
      template: mode.template,
      title: mode.title,
    })),
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
      description: m.worksheets_page_templates_cta_description(),
      label: m.worksheets_page_browse_templates(),
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
