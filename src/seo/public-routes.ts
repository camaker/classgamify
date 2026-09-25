import { Routes } from '@/lib/routes';
import { baseLocale, locales, type Locale } from '@/locale/paraglide/runtime';

export type PublicIndexableRouteId =
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
  | 'terms'
  | 'worksheets';

export type PublicRobotsDisallowRuleId =
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

export type PublicIndexableStaticRoute = {
  changefreq?: SitemapChangeFrequency;
  id: PublicIndexableRouteId;
  indexableLocales?: readonly Locale[];
  localized?: boolean;
  path: string;
  priority?: string;
};

export type PublicRobotsDisallowRule = {
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
