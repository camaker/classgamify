import { m } from '@/locale/paraglide/messages';

const en = { locale: 'en' as const };

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

export function buildMailWorkspaceBoundaryView(): MailWorkspaceBoundaryView {
  const items = [
    buildMailWorkspaceBoundaryItemView({
      description: m.mail_workspace_boundary_item_activities_description(
        undefined,
        en
      ),
      id: 'activities',
      label: m.mail_workspace_boundary_item_activities_label(undefined, en),
    }),
    buildMailWorkspaceBoundaryItemView({
      description: m.mail_workspace_boundary_item_assignments_description(
        undefined,
        en
      ),
      id: 'assignments',
      label: m.mail_workspace_boundary_item_assignments_label(undefined, en),
    }),
    buildMailWorkspaceBoundaryItemView({
      description: m.mail_workspace_boundary_item_results_description(
        undefined,
        en
      ),
      id: 'results',
      label: m.mail_workspace_boundary_item_results_label(undefined, en),
    }),
    buildMailWorkspaceBoundaryItemView({
      description: m.mail_workspace_boundary_item_ai_sources_description(
        undefined,
        en
      ),
      id: 'ai-sources',
      label: m.mail_workspace_boundary_item_ai_sources_label(undefined, en),
    }),
  ];

  return {
    description: m.mail_workspace_boundary_description(undefined, en),
    items,
    title: m.mail_workspace_boundary_title(undefined, en),
  };
}

function buildMailWorkspaceBoundaryItemView({
  description,
  id,
  label,
}: Omit<MailWorkspaceBoundaryItemView, 'line'>): MailWorkspaceBoundaryItemView {
  return {
    description,
    id,
    label,
    line: m.mail_workspace_boundary_item_line(
      {
        description,
        label,
      },
      en
    ),
  };
}
