import { m } from '@/locale/paraglide/messages';
import type { ActivityTemplateDefinition } from '@/activities/types';
import {
  WORKSHEET_MODE_TEMPLATES,
  type WorksheetModeDefinition,
  type WorksheetModeTemplate,
} from '@/activities/worksheet-modes';

type CreateActivityTemplateSearch = {
  template: ActivityTemplateDefinition['type'];
};

export function buildTemplateCreateSearch(
  template: ActivityTemplateDefinition['type']
): CreateActivityTemplateSearch {
  return { template };
}

export function buildTemplateEntryAction(template: ActivityTemplateDefinition) {
  return {
    label: m.activity_template_start_action({ template: template.shortName }),
    search: buildTemplateCreateSearch(template.type),
  };
}

export function buildWorksheetModeEntryAction(mode: WorksheetModeDefinition) {
  return {
    label: mode.action,
    search: buildTemplateCreateSearch(mode.template),
  };
}

export function buildWorksheetHeroActions(
  modes: readonly WorksheetModeDefinition[]
) {
  return WORKSHEET_MODE_TEMPLATES.map((template) =>
    buildWorksheetHeroAction(modes, template)
  );
}

function buildWorksheetHeroAction(
  modes: readonly WorksheetModeDefinition[],
  template: WorksheetModeTemplate
) {
  const mode = modes.find((item) => item.template === template);
  if (!mode) {
    return {
      label: m.worksheets_page_mode_fallback_action({ template }),
      search: buildTemplateCreateSearch(template),
      template,
    };
  }

  return {
    ...buildWorksheetModeEntryAction(mode),
    template,
  };
}
