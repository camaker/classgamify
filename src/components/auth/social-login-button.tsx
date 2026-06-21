import { m } from '@/locale/paraglide/messages';
import { useState } from 'react';
import { DividerWithText } from '@/components/auth/divider-with-text';
import { Button } from '@/components/ui/button';
import { websiteConfig } from '@/config/website';
import { authClient } from '@/auth/client';
import { useAuthProviderStatus } from '@/hooks/use-auth-provider-status';
import { DEFAULT_LOGIN_REDIRECT, Routes } from '@/lib/routes';
import { getPathWithLocale, getSafeCallbackPath } from '@/lib/urls';
import { IconBrandGoogleFilled, IconLoader2 } from '@tabler/icons-react';
import { toast } from 'sonner';
interface SocialLoginButtonProps {
  callbackUrl?: string;
  showDivider?: boolean;
}
export function SocialLoginButton({
  callbackUrl: propCallbackUrl,
  showDivider = true,
}: SocialLoginButtonProps) {
  const paramCallbackUrl =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('callbackUrl')
      : null;
  const defaultCallbackUrl = getPathWithLocale(DEFAULT_LOGIN_REDIRECT);
  const callbackUrl = getSafeCallbackPath(
    propCallbackUrl ?? paramCallbackUrl,
    defaultCallbackUrl
  );
  const errorCallbackUrl =
    callbackUrl === defaultCallbackUrl
      ? Routes.AuthError
      : `${Routes.AuthError}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  const googleLoginConfigured = websiteConfig.auth?.enableGoogleLogin ?? false;
  const { isLoading: isProviderStatusLoading, providerStatus } =
    useAuthProviderStatus(googleLoginConfigured);
  const [isLoading, setIsLoading] = useState<'google' | null>(null);
  if (
    !googleLoginConfigured ||
    isProviderStatusLoading ||
    !providerStatus.google
  ) {
    return null;
  }
  const onClick = async (provider: 'google') => {
    setIsLoading(provider);

    try {
      const result = await authClient.signIn.social({
        provider,
        callbackURL: callbackUrl,
        disableRedirect: true,
        errorCallbackURL: errorCallbackUrl,
      });
      const authorizationUrl = result.data?.url;

      if (
        !authorizationUrl ||
        !isValidGoogleAuthorizationUrl(authorizationUrl)
      ) {
        console.error('invalid google authorization url', {
          hasUrl: Boolean(authorizationUrl),
        });
        toast.error(m.auth_error_try_again());
        return;
      }

      window.location.assign(authorizationUrl);
    } catch (error) {
      console.error('google sign in error:', error);
      toast.error(m.auth_error_try_again());
    } finally {
      setIsLoading(null);
    }
  };
  return (
    <div className="w-full flex flex-col gap-4">
      {showDivider && <DividerWithText text={m.auth_social_or()} />}
      <Button
        type="button"
        size="lg"
        className="w-full"
        variant="outline"
        onClick={() => onClick('google')}
        disabled={isLoading === 'google'}
      >
        {isLoading === 'google' ? (
          <IconLoader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <IconBrandGoogleFilled className="size-4 mr-2" />
        )}
        <span>{m.auth_social_sign_in_with_google()}</span>
      </Button>
    </div>
  );
}

function isValidGoogleAuthorizationUrl(url: string) {
  try {
    const parsed = new URL(url);
    return (
      parsed.origin === 'https://accounts.google.com' &&
      parsed.pathname === '/o/oauth2/v2/auth' &&
      parsed.searchParams.get('response_type') === 'code' &&
      Boolean(parsed.searchParams.get('client_id')) &&
      Boolean(parsed.searchParams.get('redirect_uri')) &&
      Boolean(parsed.searchParams.get('state'))
    );
  } catch {
    return false;
  }
}
