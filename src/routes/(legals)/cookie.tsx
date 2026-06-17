import { createFileRoute, notFound, rootRouteId } from '@tanstack/react-router';

export const Route = createFileRoute('/(legals)/cookie')({
  beforeLoad: () => {
    throw notFound({ routeId: rootRouteId });
  },
  component: CookiePage,
});

function CookiePage() {
  return null;
}
