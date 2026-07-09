import { websiteConfig } from '@/config/website';
import { Routes } from '@/lib/routes';
import { RETIRED_LEGACY_PUBLIC_PATHS } from '@/seo/public-routes';

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

export type WebAppManifestInstallBoundary = {
  hasConfiguredDescription: boolean;
  hasConfiguredName: boolean;
  hasMaskableIcons: boolean;
  keepsProtectedSurfacesOut: boolean;
  keepsRetiredLegacyOut: boolean;
  maskableIconCount: number;
  scope: 'public-web-app-install-metadata';
  usesPublicRootScope: boolean;
  usesPublicRootStartUrl: boolean;
};

const CLASSGAMIFY_THEME_COLOR = '#09090b';
const WEB_MANIFEST_PROTECTED_SURFACE_PATHS = [
  Routes.Auth,
  Routes.Admin,
  Routes.Settings,
  Routes.Dashboard,
  '/play',
  '/print',
] as const;

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
    scope: Routes.Root,
    short_name: metadata?.name,
    start_url: Routes.Root,
    theme_color: CLASSGAMIFY_THEME_COLOR,
  };
}

export function buildWebAppManifestInstallBoundary(
  manifest = buildWebAppManifest()
): WebAppManifestInstallBoundary {
  const installPaths = [manifest.start_url, manifest.scope];
  const maskableIconCount = getWebAppManifestMaskableIconCount(manifest);

  return {
    hasConfiguredDescription: Boolean(manifest.description),
    hasConfiguredName: Boolean(manifest.name && manifest.short_name),
    hasMaskableIcons: maskableIconCount > 0,
    keepsProtectedSurfacesOut: installPaths.every(
      (path) =>
        !targetsAnyPathBoundary(path, WEB_MANIFEST_PROTECTED_SURFACE_PATHS)
    ),
    keepsRetiredLegacyOut: installPaths.every(
      (path) => !targetsAnyPathBoundary(path, RETIRED_LEGACY_PUBLIC_PATHS)
    ),
    maskableIconCount,
    scope: 'public-web-app-install-metadata',
    usesPublicRootScope: manifest.scope === Routes.Root,
    usesPublicRootStartUrl: manifest.start_url === Routes.Root,
  };
}

function getWebAppManifestMaskableIconCount(manifest: WebAppManifest) {
  return manifest.icons.filter((icon) => icon.purpose === 'maskable').length;
}

function targetsAnyPathBoundary(path: string, boundaries: readonly string[]) {
  return boundaries.some(
    (boundary) => path === boundary || path.startsWith(`${boundary}/`)
  );
}
