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

export function getWorksheetModeDefinitions(): WorksheetModeDefinition[] {
  return [
    {
      action: m.worksheets_page_mode_fill_blank_action(),
      description: m.worksheets_page_mode_fill_blank_description(),
      template: 'fill-blank',
      title: m.worksheets_page_mode_fill_blank_title(),
    },
    {
      action: m.worksheets_page_mode_line_match_action(),
      description: m.worksheets_page_mode_line_match_description(),
      template: 'line-match',
      title: m.worksheets_page_mode_line_match_title(),
    },
    {
      action: m.worksheets_page_mode_listening_action(),
      description: m.worksheets_page_mode_listening_description(),
      template: 'listening',
      title: m.worksheets_page_mode_listening_title(),
    },
    {
      action: m.worksheets_page_mode_group_sort_action(),
      description: m.worksheets_page_mode_group_sort_description(),
      template: 'group-sort',
      title: m.worksheets_page_mode_group_sort_title(),
    },
  ];
}
