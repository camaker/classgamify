import { createFileRoute } from '@tanstack/react-router';
import { buildWebAppManifest, WEB_MANIFEST_HEADERS } from '@/seo/web-manifest';

/**
 * Dynamic Web App Manifest (PWA)
 * Serves /manifest.json with name/description from config instead of a static file
 * https://tanstack.dev/start/latest/docs/framework/react/guide/seo#dynamic-sitemap
 * https://web.dev/add-manifest/
 */
export const Route = createFileRoute('/manifest.json')({
  server: {
    handlers: {
      GET: async () => {
        return new Response(JSON.stringify(buildWebAppManifest()), {
          headers: WEB_MANIFEST_HEADERS,
        });
      },
      HEAD: async () => {
        return new Response(null, {
          headers: WEB_MANIFEST_HEADERS,
        });
      },
    },
  },
});
