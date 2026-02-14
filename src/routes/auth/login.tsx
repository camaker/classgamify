import { createFileRoute, Link } from '@tanstack/react-router'
import { LoginForm } from '@/components/auth/login-form'
import { Routes } from '@/routes'

export const Route = createFileRoute('/auth/login')({
  component: LoginPage,
})

const message = {
  byClickingContinue:
    'By clicking continue, you agree to our ',
  termsOfService: 'Terms of Service',
  privacyPolicy: 'Privacy Policy',
  and: ' and ',
} as const

function LoginPage() {
  return (
    <div className="flex flex-col gap-4">
      <LoginForm />
      <div className="text-balance text-center text-xs text-muted-foreground">
        {message.byClickingContinue}
        <Link
          to={Routes.TermsOfService}
          className="underline underline-offset-4 hover:text-primary"
        >
          {message.termsOfService}
        </Link>
        {message.and}
        <Link
          to={Routes.PrivacyPolicy}
          className="underline underline-offset-4 hover:text-primary"
        >
          {message.privacyPolicy}
        </Link>
      </div>
    </div>
  )
}
