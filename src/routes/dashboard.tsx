import { SidebarLayoutPage } from '@/components/layout/sidebar-layout';
import { authRouteMiddleware } from '@/middlewares/auth-middleware';
import { createFileRoute, notFound, rootRouteId } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard')({
  ssr: false,
  beforeLoad: () => {
    throw notFound({ routeId: rootRouteId });
  },
  component: SidebarLayoutPage,
  server: {
    middleware: [authRouteMiddleware],
  },
});
