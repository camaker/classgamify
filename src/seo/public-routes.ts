import { Routes } from '@/lib/routes';
import {
  baseLocale,
  getLocale,
  locales,
  type Locale,
} from '@/locale/paraglide/runtime';

type PublicIndexableRouteId =
  | 'blog'
  | 'about'
  | 'classroom-quiz-game'
  | 'classroom-matching-game'
  | 'review-game-for-classroom'
  | 'spelling-game-generator'
  | 'juegos-para-clase'
  | 'contact'
  | 'cookie'
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

type PublicIndexableStaticRoute = {
  id: PublicIndexableRouteId;
  indexableLocales?: readonly Locale[];
  /**
   * Date (YYYY-MM-DD) the page content last changed in a meaningful way.
   * Search engines use `<lastmod>` to decide when to re-crawl, so bump it
   * only when the page copy changes, never on every build.
   */
  lastmod: string;
  /**
   * Per-locale override for pages whose copy changed in only some locales.
   * Untouched translations keep `lastmod` so the date stays honest.
   */
  localeLastmod?: Partial<Record<Locale, string>>;
  localized?: boolean;
  path: string;
};

type PublicRobotsDisallowRule = {
  id: PublicRobotsDisallowRuleId;
  path: string;
};

export const PUBLIC_INDEXABLE_STATIC_ROUTES = [
  {
    id: 'home',
    path: Routes.Root,
    lastmod: '2026-11-26',
    localeLastmod: { en: '2026-11-23', zh: '2026-11-23' },
  },
  { id: 'templates', path: Routes.Templates, lastmod: '2026-11-26' },
  {
    id: 'classroom-quiz-game',
    path: '/classroom-quiz-game',
    lastmod: '2026-11-24',
    localized: false,
  },
  {
    id: 'classroom-matching-game',
    path: '/classroom-matching-game',
    lastmod: '2026-11-24',
    localized: false,
  },
  {
    id: 'review-game-for-classroom',
    path: '/review-game-for-classroom',
    lastmod: '2026-11-24',
    localized: false,
  },
  {
    id: 'spelling-game-generator',
    path: '/spelling-game-generator',
    lastmod: '2026-11-26',
    localized: false,
  },
  {
    id: 'juegos-para-clase',
    path: '/juegos-para-clase',
    indexableLocales: ['es'],
    lastmod: '2026-11-26',
  },
  // English template guides rendered by `/templates/$template`; keep in sync
  // with TEMPLATE_GUIDE_PATHS in src/pages/template-guide-paths.ts.
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
    lastmod: '2026-11-26',
    localized: false as const,
  })),
  {
    id: 'worksheets',
    path: Routes.Worksheets,
    indexableLocales: ['en', 'zh', 'es'],
    lastmod: '2026-11-24',
    localeLastmod: { es: '2026-11-26' },
  },
  {
    id: 'pricing',
    path: Routes.Pricing,
    indexableLocales: ['en', 'zh'],
    lastmod: '2026-11-26',
  },
  {
    id: 'about',
    path: Routes.About,
    indexableLocales: ['en'],
    lastmod: '2026-11-26',
  },
  {
    id: 'teachers',
    path: Routes.Teachers,
    lastmod: '2026-07-07',
    localeLastmod: { en: '2026-11-26' },
  },
  {
    id: 'contact',
    path: Routes.Contact,
    indexableLocales: ['en', 'zh'],
    lastmod: '2026-07-03',
  },
  { id: 'blog', path: Routes.Blog, lastmod: '2026-10-24' },
  {
    id: 'roadmap',
    path: Routes.Roadmap,
    indexableLocales: ['en', 'zh'],
    lastmod: '2026-07-07',
  },
  {
    id: 'cookie',
    path: Routes.CookiePolicy,
    indexableLocales: ['en'],
    lastmod: '2026-07-07',
  },
  {
    id: 'terms',
    path: Routes.TermsOfService,
    indexableLocales: ['en'],
    lastmod: '2026-07-07',
  },
  {
    id: 'privacy',
    path: Routes.PrivacyPolicy,
    indexableLocales: ['en'],
    lastmod: '2026-07-07',
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

/**
 * True when a link to `path` leaves the current locale (the blog index links
 * to the base locale where no posts exist). Such links must load a new
 * document so `<html lang>`, the locale cookie, and messages all switch
 * together instead of a client-side navigation keeping the old locale.
 */
export function linkChangesLocale(path: string | undefined) {
  return (
    path === PUBLIC_INDEXED_BLOG_BASE_PATH &&
    getBlogIndexLinkLocale(getLocale()) !== undefined
  );
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
