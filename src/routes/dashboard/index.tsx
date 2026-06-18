import { createFileRoute, notFound, rootRouteId } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/')({
  beforeLoad: () => {
    throw notFound({ routeId: rootRouteId });
  },
  component: DashboardPage,
});

function DashboardPage() {
  return null;
}
