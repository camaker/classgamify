import { Routes } from '@/lib/routes';

export type PublicIndexableRouteId =
  | 'blog'
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
    id: 'worksheets',
    path: Routes.Worksheets,
    changefreq: 'weekly',
    priority: '0.85',
  },
  {
    id: 'create',
    path: Routes.Create,
    changefreq: 'weekly',
    priority: '0.8',
  },
  {
    id: 'pricing',
    path: Routes.Pricing,
    changefreq: 'weekly',
    priority: '0.7',
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
    priority: '0.5',
  },
  { id: 'cookie', path: Routes.CookiePolicy, changefreq: 'monthly' },
  { id: 'terms', path: Routes.TermsOfService, changefreq: 'monthly' },
  { id: 'privacy', path: Routes.PrivacyPolicy, changefreq: 'monthly' },
] as const satisfies readonly PublicIndexableStaticRoute[];

export const PUBLIC_INDEXED_BLOG_BASE_PATH = Routes.Blog;

export const PUBLIC_LOCALIZED_PATHS = PUBLIC_INDEXABLE_STATIC_ROUTES.map(
  (route) => route.path
);

export const PUBLIC_ROBOTS_DISALLOW_RULES = [
  { id: 'auth', path: Routes.Auth },
  { id: 'admin', path: Routes.Admin },
  { id: 'settings', path: Routes.Settings },
  { id: 'dashboard', path: Routes.Dashboard },
  { id: 'print', path: '/print' },
  { id: 'play', path: '/play' },
] as const satisfies readonly PublicRobotsDisallowRule[];

export const RETIRED_LEGACY_PUBLIC_PATHS = [
  '/about',
  '/ai',
  '/changelog',
  '/hanzi',
  '/hsk',
  '/learn',
  '/settings/credits',
  '/waitlist',
] as const;
