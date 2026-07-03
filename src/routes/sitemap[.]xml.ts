import { createFileRoute } from '@tanstack/react-router';
import { buildSitemap, SITEMAP_XML_HEADERS } from '@/seo/public-indexing';

/**
 * Dynamic sitemap.xml
 * https://tanstack.dev/start/latest/docs/framework/react/guide/seo#dynamic-sitemap
 */
export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        return new Response(buildSitemap(), {
          headers: SITEMAP_XML_HEADERS,
        });
      },
      HEAD: async () => {
        return new Response(null, {
          headers: SITEMAP_XML_HEADERS,
        });
      },
    },
  },
});
