import { createFileRoute, notFound, rootRouteId } from '@tanstack/react-router';

export const Route = createFileRoute('/(pages)/roadmap')({
  beforeLoad: () => {
    throw notFound({ routeId: rootRouteId });
  },
  component: RoadmapPage,
});

function RoadmapPage() {
  return null;
}
