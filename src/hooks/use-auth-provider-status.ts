import { useEffect, useState } from 'react';

export type AuthProviderStatus = {
  google: boolean;
  googleOneTapClientId?: string | null;
};

const DISABLED_PROVIDER_STATUS: AuthProviderStatus = {
  google: false,
  googleOneTapClientId: null,
};

export function useAuthProviderStatus(enabled = true) {
  const [providerStatus, setProviderStatus] = useState<AuthProviderStatus>(
    DISABLED_PROVIDER_STATUS
  );
  const [isLoading, setIsLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setProviderStatus(DISABLED_PROVIDER_STATUS);
      setIsLoading(false);
      return;
    }

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
        console.error('auth provider status error', error);
        if (!cancelled) {
          setProviderStatus(DISABLED_PROVIDER_STATUS);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadProviderStatus();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return {
    isLoading,
    providerStatus,
  };
}
