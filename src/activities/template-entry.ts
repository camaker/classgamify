import { m } from '@/locale/paraglide/messages';
import { getTemplateByType } from '@/activities/catalog';
import {
  isActivityTemplateType,
  type ActivityTemplateDefinition,
  type ActivityTemplateType,
} from '@/activities/types';
import {
  WORKSHEET_MODE_TEMPLATES,
  type WorksheetModeDefinition,
  type WorksheetModeTemplate,
} from '@/activities/worksheet-modes';
import { Routes } from '@/lib/routes';

export type CreateActivityTemplateSearch = {
  template: ActivityTemplateType;
};

export type TemplateEntryAction = {
  label: string;
  search: CreateActivityTemplateSearch;
  to: typeof Routes.Create;
};

export type TemplateEntryLinkAction = {
  label: string;
  to: typeof Routes.StudentPreview | typeof Routes.Templates;
};

export type TemplateEntryCreateLinkAction = Omit<TemplateEntryAction, 'search'>;

export function buildTemplateCreateSearch(
  template: ActivityTemplateType
): CreateActivityTemplateSearch {
  return { template };
}

export function parseCreateActivityTemplateSearch(
  value: unknown
): ActivityTemplateType | undefined {
  return isActivityTemplateType(value) ? value : undefined;
}

export function buildTemplateEntryAction(
  template: ActivityTemplateDefinition
): TemplateEntryAction {
  return {
    label: m.activity_template_start_action({ template: template.shortName }),
    search: buildTemplateCreateSearch(template.type),
    to: Routes.Create,
  };
}

export function buildWorksheetModeEntryAction(
  mode: WorksheetModeDefinition
): TemplateEntryAction {
  return {
    label: mode.action,
    search: buildTemplateCreateSearch(mode.template),
    to: Routes.Create,
  };
}

export function buildWorksheetHeroActions(
  modes: readonly WorksheetModeDefinition[]
): Array<
  TemplateEntryAction & {
    isPrimary: boolean;
    template: WorksheetModeTemplate;
  }
> {
  return WORKSHEET_MODE_TEMPLATES.map((template, index) => ({
    ...buildWorksheetHeroAction(modes, template),
    isPrimary: index === 0,
  }));
}

function buildWorksheetHeroAction(
  modes: readonly WorksheetModeDefinition[],
  template: WorksheetModeTemplate
): TemplateEntryAction & {
  template: WorksheetModeTemplate;
} {
  const mode = modes.find((item) => item.template === template);
  if (!mode) {
    const fallbackTemplate = getTemplateByType(template);

    return {
      label: m.worksheets_page_mode_fallback_action({
        template: fallbackTemplate.shortName,
      }),
      search: buildTemplateCreateSearch(template),
      template,
      to: Routes.Create,
    };
  }

  return {
    ...buildWorksheetModeEntryAction(mode),
    template,
  };
}
