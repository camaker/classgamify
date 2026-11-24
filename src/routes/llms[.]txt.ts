import { createFileRoute } from '@tanstack/react-router';
import { buildLlmsTxt, LLMS_TXT_HEADERS } from '@/seo/public-indexing';

/**
 * llms.txt: a plain-text site directory for AI assistants.
 * https://llmstxt.org/
 */
export const Route = createFileRoute('/llms.txt')({
  server: {
    handlers: {
      GET: async () => {
        return new Response(buildLlmsTxt(), {
          headers: LLMS_TXT_HEADERS,
        });
      },
      HEAD: async () => {
        return new Response(null, {
          headers: LLMS_TXT_HEADERS,
        });
      },
    },
  },
});
