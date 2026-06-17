import { createFileRoute, notFound, rootRouteId } from '@tanstack/react-router';

export const Route = createFileRoute('/blog/')({
  beforeLoad: () => {
    throw notFound({ routeId: rootRouteId });
  },
  component: BlogListPage,
});

function BlogListPage() {
  return null;
}
