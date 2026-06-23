import { createFileRoute, notFound, rootRouteId } from '@tanstack/react-router';

export const Route = createFileRoute('/settings/apikeys')({
  beforeLoad: () => {
    throw notFound({ routeId: rootRouteId });
  },
});
