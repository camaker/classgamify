import { AuthCard } from '@/components/auth/auth-card'
import { Routes } from '@/routes'
import { TriangleAlertIcon } from 'lucide-react'

const message = {
  title: 'Oops! Something went wrong!',
  tryAgain: 'Please try again.',
  backToLogin: 'Back to login',
} as const

export function ErrorCard() {
  return (
    <AuthCard
      headerLabel={message.title}
      bottomButtonHref={Routes.Login}
      bottomButtonLabel={message.backToLogin}
      className="border-none"
    >
      <div className="w-full flex justify-center items-center py-4 gap-2">
        <TriangleAlertIcon className="text-destructive size-4" />
        <p className="font-medium text-destructive">{message.tryAgain}</p>
      </div>
    </AuthCard>
  )
}
