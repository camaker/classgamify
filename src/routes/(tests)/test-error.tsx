import { createFileRoute, notFound, rootRouteId } from '@tanstack/react-router';

export const Route = createFileRoute('/(tests)/test-error')({
  loader: () => {
    throw notFound({ routeId: rootRouteId });
  },
  component: TestErrorPage,
});

/**
 * This component never renders when loader throws; kept for clarity.
 * To test render-time errors, throw inside this component instead.
 */
function TestErrorPage() {
  return null;
}
