import type { DashboardBreadcrumbItem } from '@/components/layout/dashboard-header';
import { m } from '@/locale/paraglide/messages';

type AdminUsersPageViewModel = {
  breadcrumbs: DashboardBreadcrumbItem[];
  contentAriaLabel: string;
  title: string;
};

export function buildAdminUsersPageViewModel(): AdminUsersPageViewModel {
  const title = m.admin_users_title();

  return {
    breadcrumbs: [
      { id: 'admin', label: m.admin_title(), isCurrentPage: false },
      { id: 'users', label: title, isCurrentPage: true },
    ],
    contentAriaLabel: m.admin_users_content_aria_label({
      title,
    }),
    title,
  };
}
