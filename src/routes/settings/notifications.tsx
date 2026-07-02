import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { NotificationWorkspaceSummary } from '@/components/settings/notification/notification-workspace-summary';
import { NewsletterFormCard } from '@/components/settings/notification/newsletter-form-card';
import {
  buildSettingsNotificationPageViewModel,
  isSettingsNotificationsEnabled,
} from '@/settings/notifications-view';
import { createFileRoute, notFound, rootRouteId } from '@tanstack/react-router';

export const Route = createFileRoute('/settings/notifications')({
  beforeLoad: () => {
    if (!isSettingsNotificationsEnabled()) {
      throw notFound({ routeId: rootRouteId });
    }
  },
  component: NotificationsPage,
});

function NotificationsPage() {
  const pageView = buildSettingsNotificationPageViewModel();

  return (
    <DashboardLayout
      breadcrumbs={pageView.breadcrumbs}
      title={pageView.title}
      description={pageView.description}
    >
      <div className="flex flex-col gap-8">
        <NotificationWorkspaceSummary view={pageView.workspaceSummaryView} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <NewsletterFormCard view={pageView.newsletterCardView} />
        </div>
      </div>
    </DashboardLayout>
  );
}
