import { m } from '@/locale/paraglide/messages';
import type { ActivityTemplateType } from '@/activities/types';

export type WorksheetModeDefinition = {
  action: string;
  description: string;
  template: WorksheetModeTemplate;
  title: string;
};

export type WorksheetModeTemplate = Extract<
  ActivityTemplateType,
  'fill-blank' | 'group-sort' | 'line-match' | 'listening'
>;

export const WORKSHEET_MODE_TEMPLATES = [
  'fill-blank',
  'line-match',
  'listening',
  'group-sort',
] as const satisfies readonly WorksheetModeTemplate[];

export function getWorksheetModeDefinitions(): WorksheetModeDefinition[] {
  return WORKSHEET_MODE_TEMPLATES.map(getWorksheetModeDefinition);
}

function getWorksheetModeDefinition(
  template: WorksheetModeTemplate
): WorksheetModeDefinition {
  switch (template) {
    case 'fill-blank':
      return {
        action: m.worksheets_page_mode_fill_blank_action(),
        description: m.worksheets_page_mode_fill_blank_description(),
        template,
        title: m.worksheets_page_mode_fill_blank_title(),
      };
    case 'group-sort':
      return {
        action: m.worksheets_page_mode_group_sort_action(),
        description: m.worksheets_page_mode_group_sort_description(),
        template,
        title: m.worksheets_page_mode_group_sort_title(),
      };
    case 'line-match':
      return {
        action: m.worksheets_page_mode_line_match_action(),
        description: m.worksheets_page_mode_line_match_description(),
        template,
        title: m.worksheets_page_mode_line_match_title(),
      };
    case 'listening':
      return {
        action: m.worksheets_page_mode_listening_action(),
        description: m.worksheets_page_mode_listening_description(),
        template,
        title: m.worksheets_page_mode_listening_title(),
      };
  }

  const exhaustiveTemplate: never = template;
  return exhaustiveTemplate;
}
