import { createFileRoute, notFound, rootRouteId } from '@tanstack/react-router';

export const Route = createFileRoute('/(pages)/waitlist')({
  beforeLoad: () => {
    throw notFound({ routeId: rootRouteId });
  },
  component: WaitlistPage,
});

function WaitlistPage() {
  return null;
}
