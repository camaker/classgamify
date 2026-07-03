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
      <section
        aria-label={pageView.contentAriaLabel}
        className="flex flex-col gap-8"
      >
        <NotificationWorkspaceSummary view={pageView.workspaceSummaryView} />
        <section
          aria-label={pageView.newsletterSectionAriaLabel}
          className="grid grid-cols-1 gap-8 md:grid-cols-2"
        >
          <NewsletterFormCard view={pageView.newsletterCardView} />
        </section>
      </section>
    </DashboardLayout>
  );
}
