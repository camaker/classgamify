import { useRouter } from '@tanstack/react-router'
import { Routes } from '@/routes'

interface LoginWrapperProps {
  children: React.ReactNode
  mode?: 'modal' | 'redirect'
  asChild?: boolean
  callbackUrl?: string
}

/**
 * Wraps content to trigger login (redirect to login page).
 * Modal mode not implemented; use mode="redirect" (default).
 */
export function LoginWrapper({
  children,
  mode = 'redirect',
  callbackUrl,
}: LoginWrapperProps) {
  const router = useRouter()

  const handleLogin = () => {
    const loginPath = callbackUrl
      ? `${Routes.Login}?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : Routes.Login
    router.navigate({ to: loginPath })
  }

  return (
    <span onClick={handleLogin} className="cursor-pointer">
      {children}
    </span>
  )
}
