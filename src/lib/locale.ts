import {
  baseLocale,
  deLocalizeHref,
  getLocale,
  locales,
  localizeHref,
  type Locale,
} from '@/locale/paraglide/runtime';
import { m } from '@/locale/paraglide/messages';

export {
  baseLocale,
  deLocalizeHref,
  getLocale,
  locales,
  localizeHref,
  type Locale,
};

type LocaleConfig = {
  flag?: string;
  name: string;
  hreflang: string;
};

export const localeConfig = {
  en: {
    flag: '🇺🇸',
    name: 'English',
    hreflang: 'en',
  },
  zh: {
    flag: '🇨🇳',
    name: '中文',
    hreflang: 'zh-CN',
  },
} satisfies Record<Locale, LocaleConfig>;

export function parseMessageJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function getMessageList(value: string) {
  return parseMessageJson<string[]>(value, []);
}

export function getAuthErrorMessages() {
  return Object.fromEntries(
    parseMessageJson<Array<[string, string]>>(m.auth_error_codes(), [])
  );
}

export function getCanonicalPathname(pathname: string) {
  return deLocalizeHref(pathname).split('?')[0]?.split('#')[0] ?? pathname;
}

/**
 * Paths that are fully translated and should get hreflang alternates
 * in sitemap / SEO metadata. Blog posts (`/blog/<slug>`) are localized too,
 * but handled separately via {@link isLocalizedPath} since they're dynamic.
 */
export const LOCALIZED_PATHS = new Set([
  '/',
  '/about',
  '/ai',
  '/blog',
  '/changelog',
  '/contact',
  '/cookie',
  '/pricing',
  '/privacy',
  '/roadmap',
  '/terms',
  '/waitlist',
]);

/**
 * True for any user-visible path that exists in every locale and therefore
 * needs hreflang alternates (English ↔ Chinese, x-default). Used by both
 * `seo()` metadata and the dynamic sitemap.
 */
export function isLocalizedPath(path: string): boolean {
  if (LOCALIZED_PATHS.has(path)) return true;
  return path.startsWith('/blog/');
}
