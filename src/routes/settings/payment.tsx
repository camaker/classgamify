import {
  createFileRoute,
  notFound,
  rootRouteId,
  useSearch,
} from '@tanstack/react-router';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PaymentCard } from '@/components/payment/payment-card';
import {
  buildSettingsPaymentPageViewModel,
  isSettingsBillingEnabled,
} from '@/settings/billing-view';

export const Route = createFileRoute('/settings/payment')({
  beforeLoad: () => {
    if (!isSettingsBillingEnabled()) {
      throw notFound({ routeId: rootRouteId });
    }
  },
  validateSearch: (
    s
  ): {
    session_id?: string;
    callback?: string;
  } => ({
    session_id: typeof s?.session_id === 'string' ? s.session_id : undefined,
    callback: typeof s?.callback === 'string' ? s.callback : undefined,
  }),
  component: PaymentPage,
});

function PaymentPage() {
  const search = useSearch({ from: '/settings/payment' });
  const pageView = buildSettingsPaymentPageViewModel({
    callback: search.callback,
  });

  return (
    <DashboardLayout
      breadcrumbs={pageView.breadcrumbs}
      title={pageView.title}
      description={pageView.description}
    >
      <PaymentCard sessionId={search.session_id} callback={pageView.callback} />
    </DashboardLayout>
  );
}
