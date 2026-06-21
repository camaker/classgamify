import type { ActivityTemplateDefinition } from '@/activities/types';
import type { WorksheetModeDefinition } from '@/activities/worksheet-modes';

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
    label: `Start ${template.shortName}`,
    search: buildTemplateCreateSearch(template.type),
  };
}

export function buildWorksheetModeEntryAction(mode: WorksheetModeDefinition) {
  return {
    label: mode.action,
    search: buildTemplateCreateSearch(mode.template),
  };
}
