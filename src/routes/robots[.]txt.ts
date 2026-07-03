import { createFileRoute } from '@tanstack/react-router';
import { buildRobotsTxt, ROBOTS_TXT_HEADERS } from '@/seo/public-indexing';

/**
 * Dynamic robots.txt
 * https://tanstack.dev/start/latest/docs/framework/react/guide/seo#dynamic-robotstxt
 */
export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: async () => {
        return new Response(buildRobotsTxt(), {
          headers: ROBOTS_TXT_HEADERS,
        });
      },
      HEAD: async () => {
        return new Response(null, {
          headers: ROBOTS_TXT_HEADERS,
        });
      },
    },
  },
});
