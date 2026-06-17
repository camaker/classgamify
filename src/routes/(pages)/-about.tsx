import { createFileRoute, notFound, rootRouteId } from '@tanstack/react-router';

export const Route = createFileRoute('/(pages)/about')({
  beforeLoad: () => {
    throw notFound({ routeId: rootRouteId });
  },
  component: AboutPage,
});

function AboutPage() {
  return null;
}
