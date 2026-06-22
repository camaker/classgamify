import { createFileRoute } from '@tanstack/react-router';
import { getSortedPosts } from '@/lib/blog';
import {
  baseLocale,
  isLocalizedPath,
  localeConfig,
  locales,
  localizeHref,
} from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { getBaseUrl } from '@/lib/urls';

/**
 * Dynamic sitemap.xml
 * https://tanstack.dev/start/latest/docs/framework/react/guide/seo#dynamic-sitemap
 */
export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        return new Response(buildSitemap(), {
          headers: sitemapHeaders,
        });
      },
      HEAD: async () => {
        return new Response(null, {
          headers: sitemapHeaders,
        });
      },
    },
  },
});

const sitemapHeaders = {
  'Content-Type': 'application/xml',
};

function buildSitemap() {
  const staticUrls: SitemapUrl[] = [
    { path: Routes.Root, changefreq: 'daily', priority: '1.0' },
    { path: Routes.Templates, changefreq: 'weekly', priority: '0.9' },
    { path: Routes.Worksheets, changefreq: 'weekly', priority: '0.85' },
    { path: Routes.Create, changefreq: 'weekly', priority: '0.8' },
    { path: Routes.Pricing, changefreq: 'weekly', priority: '0.7' },
    { path: Routes.Teachers, changefreq: 'monthly', priority: '0.6' },
    { path: Routes.Contact, changefreq: 'monthly', priority: '0.4' },
    { path: Routes.Blog, changefreq: 'weekly', priority: '0.5' },
    { path: Routes.Roadmap, changefreq: 'monthly', priority: '0.5' },
    { path: Routes.CookiePolicy, changefreq: 'monthly' },
    { path: Routes.TermsOfService, changefreq: 'monthly' },
    { path: Routes.PrivacyPolicy, changefreq: 'monthly' },
  ];
  const blogUrls = getSortedPosts(baseLocale).map((post) => ({
    path: `${Routes.Blog}/${post.slug}`,
    changefreq: 'monthly',
    priority: '0.5',
    lastmod: post.date,
  }));
  const allUrls = [...staticUrls, ...blogUrls];
  const entries = allUrls.flatMap((url) =>
    isLocalizedPath(url.path)
      ? locales.map((locale) => urlEntry(url, locale))
      : [urlEntry(url)]
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>`;
}

type SitemapUrl = {
  path: string;
  changefreq?: string;
  priority?: string;
  lastmod?: string;
};

function urlEntry(url: SitemapUrl, locale = baseLocale) {
  const base = getBaseUrl().replace(/\/$/, '');
  const loc = isLocalizedPath(url.path)
    ? localizeHref(url.path, { locale })
    : url.path;
  const href = escapeXml(`${base}${loc}`);
  const lastmod = url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : '';
  const changefreq = url.changefreq
    ? `\n    <changefreq>${url.changefreq}</changefreq>`
    : '';
  const priority = url.priority
    ? `\n    <priority>${url.priority}</priority>`
    : '';

  return `  <url>\n    <loc>${href}</loc>${alternates(url.path)}${lastmod}${changefreq}${priority}\n  </url>`;
}

function alternates(path: string) {
  if (!isLocalizedPath(path)) return '';

  const base = getBaseUrl().replace(/\/$/, '');
  const localeLinks = locales
    .map((locale) => {
      const href = escapeXml(`${base}${localizeHref(path, { locale })}`);
      const hreflang = localeConfig[locale].hreflang;
      return `\n    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}" />`;
    })
    .join('');
  const defaultHref = escapeXml(
    `${base}${localizeHref(path, { locale: baseLocale })}`
  );

  return `${localeLinks}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${defaultHref}" />`;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
