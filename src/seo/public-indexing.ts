import {
  getBlogLocalesWithPosts,
  getPostLocales,
  getSortedPosts,
} from '@/lib/blog';
import {
  baseLocale,
  isLocalizedPath,
  localeConfig,
  locales,
  localizeHref,
  type Locale,
} from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { getBaseUrl } from '@/lib/urls';
import {
  getIndexableLocalesForStaticPath,
  PUBLIC_INDEXABLE_STATIC_ROUTES,
  PUBLIC_ROBOTS_DISALLOW_RULES,
  type SitemapChangeFrequency,
} from '@/seo/public-routes';

export const ROBOTS_TXT_HEADERS = {
  'Cache-Control': 'public, max-age=3600',
  'Content-Type': 'text/plain; charset=utf-8',
};

export const SITEMAP_XML_HEADERS = {
  'Cache-Control': 'public, max-age=3600',
  'Content-Type': 'application/xml; charset=utf-8',
};

export type SitemapUrl = {
  changefreq?: SitemapChangeFrequency;
  lastmod?: string;
  path: string;
  priority?: string;
};

export type SitemapUrlEntry = SitemapUrl & {
  alternates: SitemapAlternateLink[];
  locale: Locale;
  loc: string;
};

export type SitemapAlternateLink = {
  href: string;
  hreflang: string;
};

export function buildRobotsTxt({ baseUrl = getBaseUrl() } = {}) {
  const base = normalizePublicBaseUrl(baseUrl);

  return `User-agent: *
Allow: /
${getRobotsDisallowLines().join('\n')}

Sitemap: ${base}/sitemap.xml`;
}

function getRobotsDisallowLines() {
  return getRobotsDisallowPaths().map((path) => `Disallow: ${path}`);
}

export function getRobotsDisallowPaths() {
  return PUBLIC_ROBOTS_DISALLOW_RULES.flatMap((rule) =>
    getLocalizedPublicPathVariants(rule.path)
  );
}

export function buildSitemap({ baseUrl = getBaseUrl() } = {}) {
  const entries = buildSitemapUrlEntries({ baseUrl })
    .map(formatSitemapUrlEntry)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries}
</urlset>`;
}

export function buildSitemapUrlEntries({ baseUrl = getBaseUrl() } = {}) {
  const urls = getSitemapUrls();
  return urls.flatMap((url) => {
    const availableLocales = getSitemapLocalesForPath(url.path);
    return availableLocales.map((locale) =>
      buildSitemapUrlEntry({ availableLocales, baseUrl, locale, url })
    );
  });
}

export function getSitemapUrls(): SitemapUrl[] {
  return [
    ...PUBLIC_INDEXABLE_STATIC_ROUTES,
    ...getSortedPosts(baseLocale).map((post) => ({
      changefreq: 'monthly' as const,
      lastmod: post.date,
      path: `${Routes.Blog}/${post.slug}`,
      priority: '0.5',
    })),
  ];
}

function getSitemapLocalesForPath(path: string): Locale[] {
  if (path === Routes.Blog) return getBlogLocalesWithPosts();
  if (path.startsWith(`${Routes.Blog}/`)) {
    return getPostLocales(path.slice(Routes.Blog.length + 1));
  }
  const staticLocales = getIndexableLocalesForStaticPath(path);
  if (staticLocales) return [...staticLocales];
  if (!isLocalizedPath(path)) return [baseLocale];
  return [...locales];
}

function getLocalizedPublicPathVariants(path: string) {
  return [
    path,
    ...locales
      .filter((locale) => locale !== baseLocale)
      .map((locale) => localizeHref(path, { locale })),
  ];
}

function buildSitemapUrlEntry({
  availableLocales,
  baseUrl,
  locale,
  url,
}: {
  availableLocales: Locale[];
  baseUrl: string;
  locale: Locale;
  url: SitemapUrl;
}): SitemapUrlEntry {
  const base = normalizePublicBaseUrl(baseUrl);
  const path = isLocalizedPath(url.path)
    ? localizeHref(url.path, { locale })
    : url.path;

  return {
    ...url,
    alternates: buildSitemapAlternateLinks({
      availableLocales,
      baseUrl: base,
      path: url.path,
    }),
    locale,
    loc: `${base}${path}`,
  };
}

function buildSitemapAlternateLinks({
  availableLocales,
  baseUrl,
  path,
}: {
  availableLocales: Locale[];
  baseUrl: string;
  path: string;
}): SitemapAlternateLink[] {
  if (!isLocalizedPath(path)) return [];

  const defaultLocale = availableLocales.includes(baseLocale)
    ? baseLocale
    : availableLocales[0];
  if (!defaultLocale) return [];

  return [
    ...availableLocales.map((locale) => ({
      href: `${baseUrl}${localizeHref(path, { locale })}`,
      hreflang: localeConfig[locale].hreflang,
    })),
    {
      href: `${baseUrl}${localizeHref(path, { locale: defaultLocale })}`,
      hreflang: 'x-default',
    },
  ];
}

function formatSitemapUrlEntry(entry: SitemapUrlEntry) {
  const alternateLinks = entry.alternates
    .map(
      (alternate) =>
        `\n    <xhtml:link rel="alternate" hreflang="${alternate.hreflang}" href="${escapeSitemapXml(alternate.href)}" />`
    )
    .join('');
  const lastmod = entry.lastmod
    ? `\n    <lastmod>${entry.lastmod}</lastmod>`
    : '';
  const changefreq = entry.changefreq
    ? `\n    <changefreq>${entry.changefreq}</changefreq>`
    : '';
  const priority = entry.priority
    ? `\n    <priority>${entry.priority}</priority>`
    : '';

  return `  <url>\n    <loc>${escapeSitemapXml(entry.loc)}</loc>${alternateLinks}${lastmod}${changefreq}${priority}\n  </url>`;
}

function escapeSitemapXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function normalizePublicBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/$/, '');
}
