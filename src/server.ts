// DO NOT DELETE THIS FILE!!!
// This file is a good smoke test to make sure the custom server entry is working
import handler from '@tanstack/react-start/server-entry';
import { localeMiddleware } from '@/locale/middleware';

/**
 * TanStack Start server entry
 * https://github.com/backpine/tanstack-start-on-cloudflare/blob/main/src/server.ts
 */
console.log("[server-entry]: using custom server entry in 'src/server.ts'");

export default {
  async fetch(request: Request) {
    const response = await localeMiddleware(request, () =>
      handler.fetch(request, {
        context: {
          fromFetch: true,
        },
      })
    );

    return withSeoHeaders(request, response);
  },
};

function withSeoHeaders(request: Request, response: Response) {
  const headers = new Headers(response.headers);
  const pathname = new URL(request.url).pathname;

  if (response.status === 404) {
    headers.set('X-Robots-Tag', 'noindex, follow');
  }

  if (response.status < 400 && isFingerprintedAssetPath(pathname)) {
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function isFingerprintedAssetPath(pathname: string) {
  if (!pathname.startsWith('/assets/')) return false;

  return /-[A-Za-z0-9_-]{8,}\.(?:css|js|mjs|woff2?|png|jpe?g|webp|svg)$/.test(
    pathname
  );
}
