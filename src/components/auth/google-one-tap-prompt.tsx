import { authClient } from '@/auth/client';
import { websiteConfig } from '@/config/website';
import { useAuthProviderStatus } from '@/hooks/use-auth-provider-status';
import { getCanonicalPathname } from '@/lib/locale';
import { DEFAULT_LOGIN_REDIRECT, Routes } from '@/lib/routes';
import { getPathWithLocale, getSafeCallbackPath } from '@/lib/urls';
import { oneTapClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { useEffect, useMemo, useRef } from 'react';

export function GoogleOneTapPrompt() {
  const { data: session, isPending } = authClient.useSession();
  const promptedClientIdRef = useRef<string | null>(null);
  const { providerStatus } = useAuthProviderStatus(
    websiteConfig.auth?.enableGoogleLogin ?? false
  );

  const callbackURL = useMemo(() => {
    const defaultCallbackUrl = getPathWithLocale(DEFAULT_LOGIN_REDIRECT);

    if (typeof window === 'undefined') {
      return defaultCallbackUrl;
    }

    return getSafeCallbackPath(
      new URLSearchParams(window.location.search).get('callbackUrl'),
      defaultCallbackUrl
    );
  }, []);

  const oneTapAuthClient = useMemo(() => {
    const clientId = providerStatus?.googleOneTapClientId?.trim();
    if (!clientId) {
      return null;
    }

    return createAuthClient({
      baseURL: window.location.origin,
      plugins: [
        oneTapClient({
          clientId,
          autoSelect: false,
          cancelOnTapOutside: true,
          context: 'signin',
          promptOptions: {
            fedCM: false,
          },
        }),
      ],
    });
  }, [providerStatus?.googleOneTapClientId]);

  useEffect(() => {
    const clientId = providerStatus?.googleOneTapClientId?.trim();
    if (
      isPending ||
      session?.user ||
      !providerStatus?.google ||
      !clientId ||
      !oneTapAuthClient
    ) {
      return;
    }

    if (promptedClientIdRef.current === clientId) {
      return;
    }

    if (isAuthRoute(window.location.pathname)) {
      return;
    }

    promptedClientIdRef.current = clientId;

    void oneTapAuthClient
      .oneTap({
        callbackURL,
      })
      .catch((error) => {
        console.error('google one tap error', error);
      });
  }, [
    callbackURL,
    isPending,
    oneTapAuthClient,
    providerStatus?.google,
    providerStatus?.googleOneTapClientId,
    session?.user,
  ]);

  return null;
}

function isAuthRoute(pathname: string) {
  const canonicalPathname = getCanonicalPathname(pathname);
  return (
    canonicalPathname === Routes.Auth ||
    canonicalPathname.startsWith(`${Routes.Auth}/`)
  );
}
