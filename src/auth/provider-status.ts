import { serverEnv } from '@/env/server';
import { websiteConfig } from '@/config/website';

function hasValue(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

export function isGoogleOAuthAvailable(): boolean {
  return (
    Boolean(websiteConfig.auth?.enableGoogleLogin) &&
    hasValue(serverEnv.GOOGLE_CLIENT_ID) &&
    hasValue(serverEnv.GOOGLE_CLIENT_SECRET)
  );
}

export function getPublicAuthProviderStatus() {
  const google = isGoogleOAuthAvailable();

  return {
    google,
    googleOneTapClientId: google
      ? (serverEnv.GOOGLE_CLIENT_ID?.trim() ?? null)
      : null,
  };
}
