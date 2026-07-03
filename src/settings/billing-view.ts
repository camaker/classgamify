import type { DashboardBreadcrumbItem } from '@/components/layout/dashboard-header';
import { websiteConfig } from '@/config/website';
import { m } from '@/locale/paraglide/messages';

export type SettingsBillingWorkspaceSummaryItemId =
  | 'activity-library'
  | 'assignment-workflow'
  | 'plan-access'
  | 'results-ai';

export type SettingsBillingWorkspaceSummaryItemView = {
  ariaLabel: string;
  description: string;
  id: SettingsBillingWorkspaceSummaryItemId;
  label: string;
};

export type SettingsBillingWorkspaceSummaryView = {
  ariaLabel: string;
  description: string;
  itemViews: SettingsBillingWorkspaceSummaryItemView[];
  title: string;
};

export type SettingsBillingPageViewModel = {
  breadcrumbs: DashboardBreadcrumbItem[];
  contentAriaLabel: string;
  description: string;
  planSectionAriaLabel: string;
  title: string;
  workspaceSummaryView: SettingsBillingWorkspaceSummaryView;
};

export type SettingsPaymentPageViewModel = {
  breadcrumbs: DashboardBreadcrumbItem[];
  callback: string;
  description: string;
  title: string;
};

export function isSettingsBillingEnabled() {
  return websiteConfig.payment?.enable === true;
}

export function buildSettingsBillingPageViewModel(): SettingsBillingPageViewModel {
  const title = m.settings_billing_title();
  const description = m.settings_billing_description();

  return {
    breadcrumbs: [
      { id: 'settings', label: m.common_settings(), isCurrentPage: false },
      {
        id: 'billing',
        label: m.settings_billing_breadcrumb(),
        isCurrentPage: true,
      },
    ],
    contentAriaLabel: m.settings_billing_content_aria_label({
      description,
      title,
    }),
    description,
    planSectionAriaLabel: m.settings_billing_plan_section_aria_label(),
    title,
    workspaceSummaryView: buildSettingsBillingWorkspaceSummaryView(),
  };
}

export function buildSettingsPaymentPageViewModel({
  callback,
}: {
  callback?: string;
}): SettingsPaymentPageViewModel {
  const title = m.settings_payment_title();
  const description = m.settings_payment_description();

  return {
    breadcrumbs: [
      { id: 'settings', label: m.common_settings(), isCurrentPage: false },
      {
        id: 'payment',
        label: m.settings_billing_breadcrumb(),
        isCurrentPage: true,
      },
    ],
    callback: callback ?? '/settings/billing',
    description,
    title,
  };
}

export function buildSettingsBillingWorkspaceSummaryView(): SettingsBillingWorkspaceSummaryView {
  const title = m.settings_billing_workspace_summary_title();
  const description = m.settings_billing_workspace_summary_description();

  return {
    ariaLabel: m.settings_billing_workspace_summary_aria_label({
      description,
      title,
    }),
    description,
    itemViews: [
      buildSettingsBillingWorkspaceSummaryItemView({
        description: m.settings_billing_workspace_summary_plan_description(),
        id: 'plan-access',
        label: m.settings_billing_workspace_summary_plan_label(),
      }),
      buildSettingsBillingWorkspaceSummaryItemView({
        description:
          m.settings_billing_workspace_summary_activities_description(),
        id: 'activity-library',
        label: m.settings_billing_workspace_summary_activities_label(),
      }),
      buildSettingsBillingWorkspaceSummaryItemView({
        description:
          m.settings_billing_workspace_summary_assignments_description(),
        id: 'assignment-workflow',
        label: m.settings_billing_workspace_summary_assignments_label(),
      }),
      buildSettingsBillingWorkspaceSummaryItemView({
        description: m.settings_billing_workspace_summary_results_description(),
        id: 'results-ai',
        label: m.settings_billing_workspace_summary_results_label(),
      }),
    ],
    title,
  };
}

function buildSettingsBillingWorkspaceSummaryItemView({
  description,
  id,
  label,
}: {
  description: string;
  id: SettingsBillingWorkspaceSummaryItemId;
  label: string;
}): SettingsBillingWorkspaceSummaryItemView {
  return {
    ariaLabel: m.settings_billing_workspace_summary_item_aria_label({
      description,
      label,
    }),
    description,
    id,
    label,
  };
}
