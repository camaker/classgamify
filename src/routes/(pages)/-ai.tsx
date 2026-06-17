import { createFileRoute, notFound, rootRouteId } from '@tanstack/react-router';

export const Route = createFileRoute('/(pages)/ai')({
  beforeLoad: () => {
    throw notFound({ routeId: rootRouteId });
  },
  component: AiPage,
});

function AiPage() {
  return null;
}
