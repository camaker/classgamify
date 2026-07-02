import type { DashboardBreadcrumbItem } from '@/components/layout/dashboard-header';
import { m } from '@/locale/paraglide/messages';

export type SettingsProfileWorkspaceSummaryItemId =
  | 'activities'
  | 'assignments'
  | 'results'
  | 'student-recognition';

export type SettingsProfileWorkspaceSummaryItemView = {
  description: string;
  id: SettingsProfileWorkspaceSummaryItemId;
  label: string;
};

export type SettingsProfileWorkspaceSummaryView = {
  ariaLabel: string;
  description: string;
  itemViews: SettingsProfileWorkspaceSummaryItemView[];
  title: string;
};

export type SettingsProfilePageViewModel = {
  breadcrumbs: DashboardBreadcrumbItem[];
  description: string;
  title: string;
  workspaceSummaryView: SettingsProfileWorkspaceSummaryView;
};

export function buildSettingsProfilePageViewModel(): SettingsProfilePageViewModel {
  const title = m.settings_profile_title();
  const description = m.settings_profile_description();

  return {
    breadcrumbs: [
      { id: 'settings', label: m.common_settings(), isCurrentPage: false },
      { id: 'profile', label: title, isCurrentPage: true },
    ],
    description,
    title,
    workspaceSummaryView: buildSettingsProfileWorkspaceSummaryView(),
  };
}

export function buildSettingsProfileWorkspaceSummaryView(): SettingsProfileWorkspaceSummaryView {
  const title = m.settings_profile_workspace_summary_title();
  const description = m.settings_profile_workspace_summary_description();

  return {
    ariaLabel: m.settings_profile_workspace_summary_aria_label({
      description,
      title,
    }),
    description,
    itemViews: [
      {
        description:
          m.settings_profile_workspace_summary_activities_description(),
        id: 'activities',
        label: m.settings_profile_workspace_summary_activities_label(),
      },
      {
        description:
          m.settings_profile_workspace_summary_assignments_description(),
        id: 'assignments',
        label: m.settings_profile_workspace_summary_assignments_label(),
      },
      {
        description: m.settings_profile_workspace_summary_student_description(),
        id: 'student-recognition',
        label: m.settings_profile_workspace_summary_student_label(),
      },
      {
        description: m.settings_profile_workspace_summary_results_description(),
        id: 'results',
        label: m.settings_profile_workspace_summary_results_label(),
      },
    ],
    title,
  };
}
