import { createFileRoute } from '@tanstack/react-router';
import { clearE2EOutbox, listE2EOutbox } from '@/mail/e2e-outbox';

const TEST_API_SECRET = 'classgamify-e2e-secret';

function assertE2EAccess(request: Request) {
  const isLocalE2EMode =
    import.meta.env.DEV === true && import.meta.env.MODE === 'e2e';
  if (
    !isLocalE2EMode ||
    request.headers.get('x-e2e-secret') !== TEST_API_SECRET
  ) {
    return Response.json({ error: 'Not Found' }, { status: 404 });
  }
  return null;
}

export const Route = createFileRoute('/api/e2e/mail')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const accessError = assertE2EAccess(request);
        if (accessError) return accessError;
        const url = new URL(request.url);
        const email = url.searchParams.get('email');
        const template = url.searchParams.get('template');
        const items = listE2EOutbox().filter(
          (item) =>
            (!email || item.to === email) &&
            (!template || item.template === template)
        );
        return Response.json({ items });
      },
      DELETE: async ({ request }) => {
        const accessError = assertE2EAccess(request);
        if (accessError) return accessError;
        clearE2EOutbox();
        return Response.json({ cleared: true });
      },
    },
  },
});
