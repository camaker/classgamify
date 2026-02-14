import { useState } from 'react'
import { DividerWithText } from '@/components/auth/divider-with-text'
import { GoogleIcon } from '@/components/icons/google'
import { Button } from '@/components/ui/button'
import { websiteConfig } from '@/config/website'
import { authClient } from '@/lib/auth-client'
import { getBaseUrl } from '@/lib/urls'
import { DEFAULT_LOGIN_REDIRECT, Routes } from '@/routes'
import { Loader2Icon } from 'lucide-react'

const message = {
  or: 'Or continue with',
  signInWithGoogle: 'Sign In with Google',
} as const

interface SocialLoginButtonProps {
  callbackUrl?: string
  showDivider?: boolean
}

export function SocialLoginButton({
  callbackUrl: propCallbackUrl,
  showDivider = true,
}: SocialLoginButtonProps) {
  const paramCallbackUrl =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('callbackUrl')
      : null
  const defaultCallbackUrl = `${getBaseUrl()}${DEFAULT_LOGIN_REDIRECT}`
  const callbackUrl =
    propCallbackUrl ?? (paramCallbackUrl ? `${getBaseUrl()}${paramCallbackUrl}` : defaultCallbackUrl)
  const errorCallbackUrl = `${getBaseUrl()}${Routes.AuthError}`

  const [isLoading, setIsLoading] = useState<'google' | null>(null)

  if (!websiteConfig.auth.enableGoogleLogin) {
    return null
  }

  const onClick = async (provider: 'google') => {
    await authClient.signIn.social(
      {
        provider,
        callbackURL: callbackUrl,
        errorCallbackURL: errorCallbackUrl,
      },
      {
        onRequest: () => setIsLoading(provider),
        onResponse: () => setIsLoading(null),
        onSuccess: () => setIsLoading(null),
        onError: () => setIsLoading(null),
      },
    )
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {showDivider && <DividerWithText text={message.or} />}
      {websiteConfig.auth.enableGoogleLogin && (
        <Button
          size="lg"
          className="w-full cursor-pointer"
          variant="outline"
          onClick={() => onClick('google')}
          disabled={isLoading === 'google'}
        >
          {isLoading === 'google' ? (
            <Loader2Icon className="mr-2 size-4 animate-spin" />
          ) : (
            <GoogleIcon className="size-4 mr-2" />
          )}
          <span>{message.signInWithGoogle}</span>
        </Button>
      )}
    </div>
  )
}
