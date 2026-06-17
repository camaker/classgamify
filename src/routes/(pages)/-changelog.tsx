import { createFileRoute, notFound, rootRouteId } from '@tanstack/react-router';

export const Route = createFileRoute('/(pages)/changelog')({
  beforeLoad: () => {
    throw notFound({ routeId: rootRouteId });
  },
  component: ChangelogPage,
});

function ChangelogPage() {
  return null;
}
