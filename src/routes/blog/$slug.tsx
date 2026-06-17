import { createFileRoute, notFound, rootRouteId } from '@tanstack/react-router';

export const Route = createFileRoute('/blog/$slug')({
  beforeLoad: () => {
    throw notFound({ routeId: rootRouteId });
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  return null;
}
