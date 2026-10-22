import { Routes } from '@/lib/routes';
import { baseLocale, locales, type Locale } from '@/locale/paraglide/runtime';

type PublicIndexableRouteId =
  | 'blog'
  | 'about'
  | 'classroom-quiz-game'
  | 'classroom-matching-game'
  | 'contact'
  | 'cookie'
  | 'create'
  | 'home'
  | 'pricing'
  | 'privacy'
  | 'roadmap'
  | 'teachers'
  | 'templates'
  | 'template-fill-blank'
  | 'template-group-sort'
  | 'template-line-match'
  | 'template-listening'
  | 'template-match-up'
  | 'template-open-box'
  | 'terms'
  | 'worksheets';

type PublicRobotsDisallowRuleId =
  | 'admin'
  | 'auth'
  | 'dashboard'
  | 'play'
  | 'print'
  | 'settings';

export type SitemapChangeFrequency =
  | 'always'
  | 'daily'
  | 'hourly'
  | 'monthly'
  | 'never'
  | 'weekly'
  | 'yearly';

type PublicIndexableStaticRoute = {
  changefreq?: SitemapChangeFrequency;
  id: PublicIndexableRouteId;
  indexableLocales?: readonly Locale[];
  localized?: boolean;
  path: string;
  priority?: string;
};

type PublicRobotsDisallowRule = {
  id: PublicRobotsDisallowRuleId;
  path: string;
};

export const PUBLIC_INDEXABLE_STATIC_ROUTES = [
  { id: 'home', path: Routes.Root, changefreq: 'daily', priority: '1.0' },
  {
    id: 'templates',
    path: Routes.Templates,
    changefreq: 'weekly',
    priority: '0.9',
  },
  {
    id: 'classroom-quiz-game',
    path: '/classroom-quiz-game',
    changefreq: 'weekly',
    localized: false,
    priority: '0.8',
  },
  {
    id: 'classroom-matching-game',
    path: '/classroom-matching-game',
    changefreq: 'weekly',
    localized: false,
    priority: '0.8',
  },
  // English template guides rendered by `/templates/$template`; keep in sync
  // with TEMPLATE_GUIDE_PATHS in src/pages/template-guide-content.ts.
  ...(
    [
      'match-up',
      'line-match',
      'group-sort',
      'fill-blank',
      'listening',
      'open-box',
    ] as const
  ).map((template) => ({
    id: `template-${template}` as const,
    path: `${Routes.Templates}/${template}` as const,
    changefreq: 'monthly' as const,
    localized: false as const,
    priority: '0.7',
  })),
  {
    id: 'worksheets',
    path: Routes.Worksheets,
    changefreq: 'weekly',
    indexableLocales: ['en', 'zh'],
    priority: '0.85',
  },
  {
    id: 'create',
    path: Routes.Create,
    changefreq: 'weekly',
    indexableLocales: ['en', 'zh'],
    priority: '0.8',
  },
  {
    id: 'pricing',
    path: Routes.Pricing,
    changefreq: 'weekly',
    indexableLocales: ['en', 'zh'],
    priority: '0.7',
  },
  {
    id: 'about',
    path: Routes.About,
    changefreq: 'monthly',
    priority: '0.6',
  },
  {
    id: 'teachers',
    path: Routes.Teachers,
    changefreq: 'monthly',
    priority: '0.6',
  },
  {
    id: 'contact',
    path: Routes.Contact,
    changefreq: 'monthly',
    indexableLocales: ['en', 'zh'],
    priority: '0.4',
  },
  {
    id: 'blog',
    path: Routes.Blog,
    changefreq: 'weekly',
    priority: '0.5',
  },
  {
    id: 'roadmap',
    path: Routes.Roadmap,
    changefreq: 'monthly',
    indexableLocales: ['en', 'zh'],
    priority: '0.5',
  },
  {
    id: 'cookie',
    path: Routes.CookiePolicy,
    changefreq: 'monthly',
    indexableLocales: ['en'],
  },
  {
    id: 'terms',
    path: Routes.TermsOfService,
    changefreq: 'monthly',
    indexableLocales: ['en'],
  },
  {
    id: 'privacy',
    path: Routes.PrivacyPolicy,
    changefreq: 'monthly',
    indexableLocales: ['en'],
  },
] as const satisfies readonly PublicIndexableStaticRoute[];

export function getIndexableLocalesForStaticPath(
  path: string
): readonly Locale[] | undefined {
  const route = PUBLIC_INDEXABLE_STATIC_ROUTES.find(
    (candidate) => candidate.path === path
  );
  if (!route) return undefined;
  if ('indexableLocales' in route) return route.indexableLocales;
  if ('localized' in route && route.localized === false) return [baseLocale];
  return locales;
}

export const PUBLIC_INDEXED_BLOG_BASE_PATH = Routes.Blog;

/**
 * Locales with published blog posts. Kept static so client-side link
 * rewriting does not pull blog content into the main bundle; the blog locale
 * unit test asserts it matches `getBlogLocalesWithPosts()`.
 */
export const PUBLIC_BLOG_LOCALES = [
  'en',
  'zh',
] as const satisfies readonly Locale[];

/**
 * The blog index redirects locales without posts to a published locale, so
 * internal links should point straight at the base-locale index instead of
 * linking to a redirect.
 */
export function getBlogIndexLinkLocale(locale: Locale): Locale | undefined {
  return (PUBLIC_BLOG_LOCALES as readonly Locale[]).includes(locale)
    ? undefined
    : baseLocale;
}

export const PUBLIC_LOCALIZED_PATHS = PUBLIC_INDEXABLE_STATIC_ROUTES.filter(
  (route) => !('localized' in route) || route.localized !== false
).map((route) => route.path);

export const PUBLIC_ROBOTS_DISALLOW_RULES = [
  { id: 'auth', path: Routes.Auth },
  { id: 'admin', path: Routes.Admin },
  { id: 'settings', path: Routes.Settings },
  { id: 'dashboard', path: Routes.Dashboard },
  { id: 'print', path: '/print' },
  { id: 'play', path: '/play' },
] as const satisfies readonly PublicRobotsDisallowRule[];

export const RETIRED_LEGACY_PUBLIC_PATHS = [
  '/ai',
  '/changelog',
  '/hanzi',
  '/hsk',
  '/learn',
  '/settings/credits',
  '/waitlist',
] as const;
