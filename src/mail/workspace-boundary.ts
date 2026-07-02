import { m } from '@/locale/paraglide/messages';
import {
  getMailLocaleMessageOptions,
  type MailLocaleInput,
  type MailLocaleMessageOptions,
} from '@/mail/locale';

export type MailWorkspaceBoundaryItemId =
  | 'activities'
  | 'assignments'
  | 'results'
  | 'ai-sources';

export type MailWorkspaceBoundaryItemView = {
  description: string;
  id: MailWorkspaceBoundaryItemId;
  label: string;
  line: string;
};

export type MailWorkspaceBoundaryView = {
  description: string;
  items: MailWorkspaceBoundaryItemView[];
  title: string;
};

export function buildMailWorkspaceBoundaryView(
  input?: MailLocaleInput
): MailWorkspaceBoundaryView {
  const localeOptions = getMailLocaleMessageOptions(input);
  const items = [
    buildMailWorkspaceBoundaryItemView({
      description: m.mail_workspace_boundary_item_activities_description(
        undefined,
        localeOptions
      ),
      id: 'activities',
      label: m.mail_workspace_boundary_item_activities_label(
        undefined,
        localeOptions
      ),
      localeOptions,
    }),
    buildMailWorkspaceBoundaryItemView({
      description: m.mail_workspace_boundary_item_assignments_description(
        undefined,
        localeOptions
      ),
      id: 'assignments',
      label: m.mail_workspace_boundary_item_assignments_label(
        undefined,
        localeOptions
      ),
      localeOptions,
    }),
    buildMailWorkspaceBoundaryItemView({
      description: m.mail_workspace_boundary_item_results_description(
        undefined,
        localeOptions
      ),
      id: 'results',
      label: m.mail_workspace_boundary_item_results_label(
        undefined,
        localeOptions
      ),
      localeOptions,
    }),
    buildMailWorkspaceBoundaryItemView({
      description: m.mail_workspace_boundary_item_ai_sources_description(
        undefined,
        localeOptions
      ),
      id: 'ai-sources',
      label: m.mail_workspace_boundary_item_ai_sources_label(
        undefined,
        localeOptions
      ),
      localeOptions,
    }),
  ];

  return {
    description: m.mail_workspace_boundary_description(
      undefined,
      localeOptions
    ),
    items,
    title: m.mail_workspace_boundary_title(undefined, localeOptions),
  };
}

function buildMailWorkspaceBoundaryItemView({
  description,
  id,
  label,
  localeOptions,
}: Omit<MailWorkspaceBoundaryItemView, 'line'> & {
  localeOptions: MailLocaleMessageOptions;
}): MailWorkspaceBoundaryItemView {
  return {
    description,
    id,
    label,
    line: m.mail_workspace_boundary_item_line(
      {
        description,
        label,
      },
      localeOptions
    ),
  };
}
