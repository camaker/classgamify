import { websiteConfig } from '@/config/website';

export const WEB_MANIFEST_HEADERS = {
  'Cache-Control': 'public, max-age=3600',
  'Content-Type': 'application/manifest+json; charset=utf-8',
};

export type WebAppManifestIcon = {
  purpose?: string;
  sizes: string;
  src: string;
  type: string;
};

export type WebAppManifest = {
  background_color: string;
  description?: string;
  display: 'standalone';
  icons: WebAppManifestIcon[];
  name?: string;
  scope: string;
  short_name?: string;
  start_url: string;
  theme_color: string;
};

const CLASSGAMIFY_THEME_COLOR = '#09090b';

export function buildWebAppManifest(): WebAppManifest {
  const metadata = websiteConfig.metadata;

  return {
    background_color: CLASSGAMIFY_THEME_COLOR,
    description: metadata?.description,
    display: 'standalone',
    icons: [
      { src: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
      {
        purpose: 'maskable',
        sizes: '192x192',
        src: '/android-chrome-192x192.png',
        type: 'image/png',
      },
      {
        purpose: 'maskable',
        sizes: '512x512',
        src: '/android-chrome-512x512.png',
        type: 'image/png',
      },
    ],
    name: metadata?.name,
    scope: '/',
    short_name: metadata?.name,
    start_url: '/',
    theme_color: CLASSGAMIFY_THEME_COLOR,
  };
}
