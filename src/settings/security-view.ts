import type { DashboardBreadcrumbItem } from '@/components/layout/dashboard-header';
import { websiteConfig } from '@/config/website';
import {
  buildSettingsAccountWorkspaceHandoffView,
  type SettingsAccountWorkspaceHandoffView,
} from '@/settings/account-handoff';
import {
  buildSettingsSecurityWorkspaceHandoffView,
  type SettingsSecurityWorkspaceHandoffView,
} from '@/settings/security-handoff';
import { m } from '@/locale/paraglide/messages';

export type SettingsSecurityWorkspaceSummaryItemId =
  | 'account-access'
  | 'activities'
  | 'assignments'
  | 'student-results';

export type SettingsSecurityCapabilityId =
  | 'account-deletion'
  | 'email-password';

export type SettingsSecurityCapabilityState = 'disabled' | 'enabled';

export type SettingsSecurityWorkspaceSummaryItemView = {
  description: string;
  id: SettingsSecurityWorkspaceSummaryItemId;
  label: string;
};

export type SettingsSecurityCapabilityView = {
  description: string;
  id: SettingsSecurityCapabilityId;
  label: string;
  state: SettingsSecurityCapabilityState;
  value: string;
};

export type SettingsSecurityWorkspaceSummaryView = {
  ariaLabel: string;
  capabilityDescription: string;
  capabilityTitle: string;
  capabilityViews: SettingsSecurityCapabilityView[];
  description: string;
  handoffView: SettingsAccountWorkspaceHandoffView;
  itemViews: SettingsSecurityWorkspaceSummaryItemView[];
  securityHandoffView: SettingsSecurityWorkspaceHandoffView;
  title: string;
};

export type SettingsSecurityPageViewModel = {
  breadcrumbs: DashboardBreadcrumbItem[];
  credentialLoginEnabled: boolean;
  deleteAccountEnabled: boolean;
  description: string;
  title: string;
  workspaceSummaryView: SettingsSecurityWorkspaceSummaryView;
};

export function buildSettingsSecurityPageViewModel(): SettingsSecurityPageViewModel {
  const title = m.settings_security_title();
  const description = m.settings_security_description();
  const credentialLoginEnabled =
    websiteConfig.auth?.enableCredentialLogin ?? false;
  const deleteAccountEnabled = websiteConfig.auth?.enableDeleteAccount ?? false;

  return {
    breadcrumbs: [
      { id: 'settings', label: m.common_settings(), isCurrentPage: false },
      { id: 'security', label: title, isCurrentPage: true },
    ],
    credentialLoginEnabled,
    deleteAccountEnabled,
    description,
    title,
    workspaceSummaryView: buildSettingsSecurityWorkspaceSummaryView({
      credentialLoginEnabled,
      deleteAccountEnabled,
    }),
  };
}

export function buildSettingsSecurityWorkspaceSummaryView({
  credentialLoginEnabled,
  deleteAccountEnabled,
}: {
  credentialLoginEnabled: boolean;
  deleteAccountEnabled: boolean;
}): SettingsSecurityWorkspaceSummaryView {
  const title = m.settings_security_workspace_summary_title();
  const description = m.settings_security_workspace_summary_description();

  return {
    ariaLabel: m.settings_security_workspace_summary_aria_label({
      description,
      title,
    }),
    capabilityDescription:
      m.settings_security_workspace_capabilities_description(),
    capabilityTitle: m.settings_security_workspace_capabilities_title(),
    capabilityViews: [
      buildSettingsSecurityCapabilityView({
        description: credentialLoginEnabled
          ? m.settings_security_workspace_capability_password_enabled_description()
          : m.settings_security_workspace_capability_password_disabled_description(),
        id: 'email-password',
        label: m.settings_security_workspace_capability_password_label(),
        state: credentialLoginEnabled ? 'enabled' : 'disabled',
      }),
      buildSettingsSecurityCapabilityView({
        description: deleteAccountEnabled
          ? m.settings_security_workspace_capability_delete_enabled_description()
          : m.settings_security_workspace_capability_delete_disabled_description(),
        id: 'account-deletion',
        label: m.settings_security_workspace_capability_delete_label(),
        state: deleteAccountEnabled ? 'enabled' : 'disabled',
      }),
    ],
    description,
    handoffView: buildSettingsAccountWorkspaceHandoffView({
      credentialLoginEnabled,
      deleteAccountEnabled,
      page: 'security',
    }),
    itemViews: [
      {
        description: m.settings_security_workspace_summary_access_description(),
        id: 'account-access',
        label: m.settings_security_workspace_summary_access_label(),
      },
      {
        description:
          m.settings_security_workspace_summary_activities_description(),
        id: 'activities',
        label: m.settings_security_workspace_summary_activities_label(),
      },
      {
        description:
          m.settings_security_workspace_summary_assignments_description(),
        id: 'assignments',
        label: m.settings_security_workspace_summary_assignments_label(),
      },
      {
        description:
          m.settings_security_workspace_summary_results_description(),
        id: 'student-results',
        label: m.settings_security_workspace_summary_results_label(),
      },
    ],
    securityHandoffView: buildSettingsSecurityWorkspaceHandoffView({
      credentialLoginEnabled,
      deleteAccountEnabled,
    }),
    title,
  };
}

function buildSettingsSecurityCapabilityView({
  description,
  id,
  label,
  state,
}: {
  description: string;
  id: SettingsSecurityCapabilityId;
  label: string;
  state: SettingsSecurityCapabilityState;
}): SettingsSecurityCapabilityView {
  return {
    description,
    id,
    label,
    state,
    value:
      state === 'enabled'
        ? m.settings_security_workspace_capability_enabled_value()
        : m.settings_security_workspace_capability_disabled_value(),
  };
}
