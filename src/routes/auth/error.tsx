import { createFileRoute } from '@tanstack/react-router'
import { ErrorCard } from '@/components/auth/error-card'

export const Route = createFileRoute('/auth/error')({
  component: AuthErrorPage,
})

function AuthErrorPage() {
  return <ErrorCard />
}
