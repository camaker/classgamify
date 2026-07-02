import type { DashboardBreadcrumbItem } from '@/components/layout/dashboard-header';
import { websiteConfig } from '@/config/website';
import { m } from '@/locale/paraglide/messages';

export type SettingsFilesWorkspaceSummaryItemId =
  | 'activity-attachments'
  | 'ai-provenance'
  | 'source-library'
  | 'student-privacy';

export type SettingsFilesWorkspaceSummaryItemView = {
  description: string;
  id: SettingsFilesWorkspaceSummaryItemId;
  label: string;
};

export type SettingsFilesWorkspaceSummaryView = {
  ariaLabel: string;
  description: string;
  itemViews: SettingsFilesWorkspaceSummaryItemView[];
  title: string;
};

export type SettingsFilesPageViewModel = {
  breadcrumbs: DashboardBreadcrumbItem[];
  description: string;
  title: string;
  workspaceSummaryView: SettingsFilesWorkspaceSummaryView;
};

export function isSettingsFilesEnabled() {
  return websiteConfig.storage?.enable === true;
}

export function buildSettingsFilesPageViewModel(): SettingsFilesPageViewModel {
  const title = m.settings_files_title();
  const description = m.settings_files_description();

  return {
    breadcrumbs: [
      { id: 'settings', label: m.common_settings(), isCurrentPage: false },
      { id: 'files', label: title, isCurrentPage: true },
    ],
    description,
    title,
    workspaceSummaryView: buildSettingsFilesWorkspaceSummaryView(),
  };
}

export function buildSettingsFilesWorkspaceSummaryView(): SettingsFilesWorkspaceSummaryView {
  const title = m.settings_files_workspace_summary_title();
  const description = m.settings_files_workspace_summary_description();

  return {
    ariaLabel: m.settings_files_workspace_summary_aria_label({
      description,
      title,
    }),
    description,
    itemViews: [
      {
        description: m.settings_files_workspace_summary_library_description(),
        id: 'source-library',
        label: m.settings_files_workspace_summary_library_label(),
      },
      {
        description:
          m.settings_files_workspace_summary_attachments_description(),
        id: 'activity-attachments',
        label: m.settings_files_workspace_summary_attachments_label(),
      },
      {
        description: m.settings_files_workspace_summary_ai_description(),
        id: 'ai-provenance',
        label: m.settings_files_workspace_summary_ai_label(),
      },
      {
        description: m.settings_files_workspace_summary_privacy_description(),
        id: 'student-privacy',
        label: m.settings_files_workspace_summary_privacy_label(),
      },
    ],
    title,
  };
}
