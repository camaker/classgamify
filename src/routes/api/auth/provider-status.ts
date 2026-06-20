import { createFileRoute } from '@tanstack/react-router';
import { getPublicAuthProviderStatus } from '@/auth/provider-status';

export const Route = createFileRoute('/api/auth/provider-status')({
  server: {
    handlers: {
      GET: () =>
        Response.json(getPublicAuthProviderStatus(), {
          headers: {
            'Cache-Control': 'no-store',
          },
        }),
    },
  },
});
