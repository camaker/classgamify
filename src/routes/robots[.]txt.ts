import { createFileRoute } from '@tanstack/react-router';
import { getBaseUrl } from '@/lib/urls';
import { baseLocale, locales, localizeHref } from '@/lib/locale';

const disallowedPaths = [
  '/auth',
  '/admin',
  '/settings',
  '/dashboard',
  '/play',
  '/learn',
  '/hsk',
  '/hanzi',
  '/about',
  '/ai',
  '/changelog',
  '/test-404',
  '/test-error',
  '/waitlist',
];

function getDisallowRules() {
  return disallowedPaths
    .flatMap((path) => [
      path,
      ...locales
        .filter((locale) => locale !== baseLocale)
        .map((locale) => localizeHref(path, { locale })),
    ])
    .map((path) => `Disallow: ${path}`)
    .join('\n');
}

/**
 * Dynamic robots.txt
 * https://tanstack.dev/start/latest/docs/framework/react/guide/seo#dynamic-robotstxt
 */
export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: async () => {
        return new Response(buildRobotsTxt(), {
          headers: robotsHeaders,
        });
      },
      HEAD: async () => {
        return new Response(null, {
          headers: robotsHeaders,
        });
      },
    },
  },
});

const robotsHeaders = {
  'Content-Type': 'text/plain',
};

function buildRobotsTxt() {
  const base = getBaseUrl().replace(/\/$/, '');

  return `User-agent: *
Allow: /
${getDisallowRules()}

Sitemap: ${base}/sitemap.xml`;
}
