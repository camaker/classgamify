import type { DashboardBreadcrumbItem } from '@/components/layout/dashboard-header';
import { websiteConfig } from '@/config/website';
import { getSafeCallbackPath } from '@/lib/urls';
import { m } from '@/locale/paraglide/messages';

const SETTINGS_PAYMENT_DEFAULT_CALLBACK = '/settings/billing';

type SettingsBillingPageViewModel = {
  breadcrumbs: DashboardBreadcrumbItem[];
  contentAriaLabel: string;
  description: string;
  planSectionAriaLabel: string;
  title: string;
};

type SettingsPaymentPageViewModel = {
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
    callback: normalizeSettingsPaymentCallback(callback),
    description,
    title,
  };
}

export function normalizeSettingsPaymentCallback(callback?: string) {
  return getSafeCallbackPath(callback, SETTINGS_PAYMENT_DEFAULT_CALLBACK);
}
