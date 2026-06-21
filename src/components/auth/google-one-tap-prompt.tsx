import { authClient } from '@/auth/client';
import { websiteConfig } from '@/config/website';
import { useAuthProviderStatus } from '@/hooks/use-auth-provider-status';
import { DEFAULT_LOGIN_REDIRECT } from '@/lib/routes';
import { getPathWithLocale, getSafeCallbackPath } from '@/lib/urls';
import { oneTapClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { useEffect, useMemo, useRef } from 'react';

const PROMPT_SESSION_KEY = 'classgamify.google-one-tap.prompted-client-id';

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

    try {
      if (window.sessionStorage.getItem(PROMPT_SESSION_KEY) === clientId) {
        return;
      }

      window.sessionStorage.setItem(PROMPT_SESSION_KEY, clientId);
    } catch {
      // Storage can be unavailable; the ref still prevents duplicate prompts.
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
