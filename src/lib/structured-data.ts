import { websiteConfig } from '@/config/website';
import { getBaseUrl, getCanonicalUrl, getImageUrl } from '@/lib/urls';

type JsonLdNode = Record<string, unknown>;

export function jsonLdScript(jsonLd: JsonLdNode | JsonLdNode[]) {
  return {
    type: 'application/ld+json',
    children: serializeJsonLd(jsonLd),
  };
}

export function organizationJsonLd(): JsonLdNode {
  const baseUrl = getBaseUrl().replace(/\/$/, '');
  const supportEmail =
    websiteConfig.mail?.supportEmail?.match(/<([^>]+)>/)?.[1] ??
    websiteConfig.mail?.supportEmail;
  const sameAs = [websiteConfig.social?.github].filter(Boolean);
  const logoPath = websiteConfig.metadata?.images?.logoLight;
  const logo = logoPath ? getImageUrl(logoPath) : undefined;

  return {
    '@type': 'Organization',
    '@id': `${baseUrl}/#organization`,
    name: websiteConfig.metadata?.name ?? 'Lang Study',
    url: baseUrl,
    ...(logo ? { logo } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
    ...(supportEmail
      ? {
          contactPoint: {
            '@type': 'ContactPoint',
            email: supportEmail,
            contactType: 'customer support',
          },
        }
      : {}),
  };
}

export function websiteJsonLd({
  description,
  inLanguage,
  name,
  path,
}: {
  description: string;
  inLanguage: string;
  name: string;
  path: string;
}): JsonLdNode {
  const baseUrl = getBaseUrl().replace(/\/$/, '');

  return {
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    name,
    description,
    url: getCanonicalUrl(path),
    inLanguage,
    publisher: { '@id': `${baseUrl}/#organization` },
  };
}

export function graphJsonLd(nodes: JsonLdNode[]): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes,
  };
}

function serializeJsonLd(jsonLd: JsonLdNode | JsonLdNode[]) {
  return JSON.stringify(jsonLd).replace(/</g, '\\u003c');
}
