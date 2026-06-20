import { authClient } from '@/auth/client';
import { DEFAULT_LOGIN_REDIRECT } from '@/lib/routes';
import { getPathWithLocale, getSafeCallbackPath } from '@/lib/urls';
import { oneTapClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { useEffect, useMemo, useRef, useState } from 'react';

type AuthProviderStatus = {
  google: boolean;
  googleOneTapClientId?: string | null;
};

const PROMPT_SESSION_KEY = 'classgamify.google-one-tap.prompted-client-id';

export function GoogleOneTapPrompt() {
  const { data: session, isPending } = authClient.useSession();
  const promptedClientIdRef = useRef<string | null>(null);
  const [providerStatus, setProviderStatus] =
    useState<AuthProviderStatus | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadProviderStatus = async () => {
      try {
        const response = await fetch('/api/auth/provider-status', {
          cache: 'no-store',
        });
        if (!response.ok) {
          throw new Error(`Failed to load auth providers: ${response.status}`);
        }

        const status = (await response.json()) as AuthProviderStatus;
        if (!cancelled) {
          setProviderStatus(status);
        }
      } catch (error) {
        console.error('google one tap provider status error', error);
        if (!cancelled) {
          setProviderStatus({
            google: false,
            googleOneTapClientId: null,
          });
        }
      }
    };

    void loadProviderStatus();

    return () => {
      cancelled = true;
    };
  }, []);

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
