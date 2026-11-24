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
} from '@/seo/public-routes';

export const ROBOTS_TXT_HEADERS = {
  'Cache-Control': 'public, max-age=3600',
  'Content-Type': 'text/plain; charset=utf-8',
};

export const SITEMAP_XML_HEADERS = {
  'Cache-Control': 'public, max-age=3600',
  'Content-Type': 'application/xml; charset=utf-8',
};

export const LLMS_TXT_HEADERS = {
  'Cache-Control': 'public, max-age=3600',
  'Content-Type': 'text/plain; charset=utf-8',
};

type SitemapUrl = {
  lastmod: string;
  path: string;
};

type SitemapUrlEntry = SitemapUrl & {
  alternates: SitemapAlternateLink[];
  locale: Locale;
  loc: string;
};

type SitemapAlternateLink = {
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

const LLMS_TXT_PAGES = [
  {
    description:
      'Build a classroom game from your lesson content, assign it with one link, and review results.',
    path: Routes.Root,
    title: 'Home',
  },
  {
    description:
      'Eight game templates: quiz, matching pairs, match up, line match, group sort, fill blank, listening, open box.',
    path: Routes.Templates,
    title: 'Classroom game templates',
  },
  {
    description:
      'Turn review questions into a multiple-choice classroom quiz game.',
    path: '/classroom-quiz-game',
    title: 'Classroom quiz game',
  },
  {
    description:
      'Make a matching game from term and definition pairs students can play on any device.',
    path: '/classroom-matching-game',
    title: 'Matching game maker',
  },
  {
    description:
      'Turn a unit review into a playable game and share one student link.',
    path: '/review-game-for-classroom',
    title: 'Review game for the classroom',
  },
  {
    description:
      'Paste a word list and practice spelling in the browser, then save it as an assignment.',
    path: '/spelling-game-generator',
    title: 'Spelling game generator',
  },
  {
    description:
      'Matching worksheet generator: online and printable worksheets from one activity.',
    path: Routes.Worksheets,
    title: 'Matching worksheet generator',
  },
  {
    description: 'How ClassGamify works for teachers and what results show.',
    path: Routes.Teachers,
    title: 'For teachers',
  },
  { description: 'Plans and limits.', path: Routes.Pricing, title: 'Pricing' },
  {
    description: 'Teaching guides and product updates.',
    path: Routes.Blog,
    title: 'Blog',
  },
  { description: 'What ClassGamify is.', path: Routes.About, title: 'About' },
] as const;

export function buildLlmsTxt({ baseUrl = getBaseUrl() } = {}) {
  const base = normalizePublicBaseUrl(baseUrl);
  const pages = LLMS_TXT_PAGES.map(
    (page) => `- [${page.title}](${base}${page.path}): ${page.description}`
  ).join('\n');

  return `# ClassGamify

> ClassGamify is a teacher-facing classroom game platform. Teachers build a structured activity once, play it as a quiz, matching game, or worksheet, share one student link, and review attempts and results. No student accounts are needed.

## Main pages

${pages}

## Notes

- Student play links (/play/...), teacher dashboard, settings, and print pages are private and not meant for indexing.
- Pricing and plan limits are on the pricing page.
`;
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
      lastmod: post.date,
      path: `${Routes.Blog}/${post.slug}`,
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
  return `  <url>\n    <loc>${escapeSitemapXml(entry.loc)}</loc>${alternateLinks}\n    <lastmod>${entry.lastmod}</lastmod>\n  </url>`;
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
