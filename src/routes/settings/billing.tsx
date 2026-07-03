import { createFileRoute, notFound, rootRouteId } from '@tanstack/react-router';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { BillingCard } from '@/components/settings/billing/billing-card';
import { BillingWorkspaceSummary } from '@/components/settings/billing/billing-workspace-summary';
import {
  buildSettingsBillingPageViewModel,
  isSettingsBillingEnabled,
} from '@/settings/billing-view';

export const Route = createFileRoute('/settings/billing')({
  beforeLoad: () => {
    if (!isSettingsBillingEnabled()) {
      throw notFound({ routeId: rootRouteId });
    }
  },
  component: BillingPage,
});

function BillingPage() {
  const pageView = buildSettingsBillingPageViewModel();

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
        <BillingWorkspaceSummary view={pageView.workspaceSummaryView} />
        <section
          aria-label={pageView.planSectionAriaLabel}
          className="grid grid-cols-1 gap-8 md:grid-cols-2"
        >
          <BillingCard />
        </section>
      </section>
    </DashboardLayout>
  );
}
