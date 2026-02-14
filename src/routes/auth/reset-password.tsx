import { createFileRoute } from '@tanstack/react-router'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const Route = createFileRoute('/auth/reset-password')({
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  return <ResetPasswordForm />
}
