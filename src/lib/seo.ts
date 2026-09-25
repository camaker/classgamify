import { websiteConfig } from '@/config/website';
import {
  getCanonicalUrl,
  getCanonicalUrlForLocale,
  getOgImage,
  twitterHandleFromUrl,
} from '@/lib/urls';
import {
  baseLocale,
  getLocale,
  isLocalizedPath,
  localeConfig,
  locales,
  type Locale,
} from '@/lib/locale';
import { getIndexableLocalesForStaticPath } from '@/seo/public-routes';

/**
 * Build metadata + canonical link for a page
 * @param path - The path of the page
 * @param options - The options for the page
 * @returns The metadata and canonical link
 */
export function seo(
  path: string,
  options: {
    title: string;
    description?: string;
    keywords?: string;
    image?: string;
    robots?: string;
    type?: 'website' | 'article';
    alternateLocales?: Locale[];
    canonicalLocale?: Locale;
  }
) {
  const currentLocale = getLocale();
  const staticLocales = getIndexableLocalesForStaticPath(path);
  const excludedStaticLocale =
    staticLocales !== undefined && !staticLocales.includes(currentLocale);
  const canonicalLocale = excludedStaticLocale
    ? baseLocale
    : options.canonicalLocale;
  const url = canonicalLocale
    ? getCanonicalUrlForLocale(path, canonicalLocale)
    : getCanonicalUrl(path);
  const image = options.image ?? getOgImage();
  const localized = isLocalizedPath(path);
  const availableLocales = excludedStaticLocale
    ? []
    : staticLocales
      ? (options.alternateLocales?.filter((locale) =>
          staticLocales.includes(locale)
        ) ?? staticLocales)
      : (options.alternateLocales ?? locales);
  const defaultAlternateLocale = availableLocales.includes(baseLocale)
    ? baseLocale
    : availableLocales[0];
  const alternateLinks =
    localized && defaultAlternateLocale
      ? [
          ...availableLocales.map((locale) => ({
            rel: 'alternate',
            hrefLang: localeConfig[locale].hreflang,
            href: getCanonicalUrlForLocale(path, locale),
          })),
          {
            rel: 'alternate',
            hrefLang: 'x-default',
            href: getCanonicalUrlForLocale(path, defaultAlternateLocale),
          },
        ]
      : [];

  return {
    meta: metadata({
      ...options,
      alternateLocales: availableLocales,
      robots: excludedStaticLocale ? 'noindex,follow' : options.robots,
      url,
      image,
      type: options.type ?? 'website',
    }),
    links: [{ rel: 'canonical', href: url }, ...alternateLinks],
  };
}

export const metadata = ({
  title,
  description,
  keywords,
  image,
  robots,
  alternateLocales,
  url,
  type = 'website',
}: {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  keywords?: string;
  robots?: string;
  alternateLocales?: readonly Locale[];
  type?: 'website' | 'article';
}) => {
  const twitterSite = websiteConfig.social?.twitter
    ? twitterHandleFromUrl(websiteConfig.social.twitter)
    : null;
  // OG locale format uses underscore (e.g. en_US, zh_CN), unlike BCP 47 used
  // for <html lang> / hreflang which uses hyphens.
  const currentLocale = getLocale();
  const ogLocale = localeConfig[currentLocale].hreflang.replace('-', '_');
  const ogAlternateLocales = (alternateLocales ?? locales)
    .filter((l) => l !== currentLocale)
    .map((l) => localeConfig[l].hreflang.replace('-', '_'));
  const metadata: Array<{
    title?: string;
    name?: string;
    property?: string;
    content?: string;
  }> = [
    { title },
    ...(description ? [{ name: 'description', content: description }] : []),
    ...(keywords ? [{ name: 'keywords', content: keywords }] : []),
    ...(robots ? [{ name: 'robots', content: robots }] : []),
    // OG metadata
    { property: 'og:type', content: type },
    { property: 'og:site_name', content: websiteConfig.metadata?.name ?? '' },
    { property: 'og:locale', content: ogLocale },
    ...ogAlternateLocales.map((loc) => ({
      property: 'og:locale:alternate',
      content: loc,
    })),
    { property: 'og:title', content: title },
    ...(description
      ? [{ property: 'og:description', content: description }]
      : []),
    ...(url ? [{ property: 'og:url', content: url }] : []),
    ...(image ? [{ property: 'og:image', content: image }] : []),
    // Twitter metadata (twitter:site = site's @username, not domain)
    { name: 'twitter:title', content: title },
    ...(twitterSite ? [{ name: 'twitter:site', content: twitterSite }] : []),
    ...(description
      ? [{ name: 'twitter:description', content: description }]
      : []),
    ...(url ? [{ name: 'twitter:url', content: url }] : []),
    ...(image
      ? [
          { name: 'twitter:card', content: 'summary_large_image' as const },
          { name: 'twitter:image', content: image },
        ]
      : []),
  ];
  return metadata;
};
