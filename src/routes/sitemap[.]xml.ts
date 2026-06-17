import { createFileRoute } from '@tanstack/react-router';
import { getBaseUrl } from '@/lib/urls';
import {
  baseLocale,
  isLocalizedPath,
  localeConfig,
  locales,
  localizeHref,
} from '@/lib/locale';
import { getHanziPath, getHsk1CharacterList } from '@/learn/hanzi-course';

/**
 * Dynamic sitemap.xml
 * https://tanstack.dev/start/latest/docs/framework/react/guide/seo#dynamic-sitemap
 */
export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const base = getBaseUrl().replace(/\/$/, '');
        const staticUrls: {
          path: string;
          changefreq?: string;
          priority?: string;
        }[] = [
          { path: '/', changefreq: 'daily', priority: '1.0' },
          { path: '/learn', changefreq: 'daily', priority: '0.9' },
          { path: '/hsk/1', changefreq: 'weekly', priority: '0.9' },
          { path: '/worksheets', changefreq: 'weekly', priority: '0.8' },
          { path: '/pricing', changefreq: 'weekly', priority: '0.6' },
          { path: '/contact', changefreq: 'monthly', priority: '0.4' },
          { path: '/terms', changefreq: 'monthly' },
          { path: '/privacy', changefreq: 'monthly' },
        ];

        const hanziUrls = getHsk1CharacterList().map((character) => ({
          path: getHanziPath(character),
          changefreq: 'weekly',
          priority: '0.7',
        }));

        const allUrls = [...staticUrls, ...hanziUrls];

        const alternates = (path: string) => {
          if (!isLocalizedPath(path)) {
            return '';
          }

          const localeLinks = locales
            .map((locale) => {
              const href = escapeXml(
                `${base}${localizeHref(path, { locale })}`
              );
              return `\n    <xhtml:link rel="alternate" hreflang="${localeConfig[locale].hreflang}" href="${href}" />`;
            })
            .join('');
          const defaultHref = escapeXml(
            `${base}${localizeHref(path, {
              locale: baseLocale,
            })}`
          );
          return `${localeLinks}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${defaultHref}" />`;
        };

        const urlEntry = (
          path: string,
          opts?: { changefreq?: string; priority?: string; lastmod?: string }
        ) => {
          const loc = isLocalizedPath(path)
            ? localizeHref(path, { locale: baseLocale })
            : path;
          const href = escapeXml(`${base}${loc}`);
          const lastmod = opts?.lastmod
            ? `\n    <lastmod>${opts.lastmod}</lastmod>`
            : '';
          const changefreq = opts?.changefreq
            ? `\n    <changefreq>${opts.changefreq}</changefreq>`
            : '';
          const priority = opts?.priority
            ? `\n    <priority>${opts.priority}</priority>`
            : '';
          return `  <url>\n    <loc>${href}</loc>${alternates(path)}${lastmod}${changefreq}${priority}\n  </url>`;
        };

        const staticPart = allUrls
          .map((u) =>
            urlEntry(u.path, { changefreq: u.changefreq, priority: u.priority })
          )
          .join('\n');

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${staticPart}
</urlset>`;

        return new Response(sitemap, {
          headers: {
            'Content-Type': 'application/xml',
          },
        });
      },
    },
  },
});

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
