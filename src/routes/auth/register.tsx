import { createFileRoute, Link } from '@tanstack/react-router'
import { RegisterForm } from '@/components/auth/register-form'
import { Routes } from '@/routes'

export const Route = createFileRoute('/auth/register')({
  component: RegisterPage,
})

const message = {
  byClickingContinue: 'By clicking continue, you agree to our ',
  termsOfService: 'Terms of Service',
  privacyPolicy: 'Privacy Policy',
  and: ' and ',
} as const

function RegisterPage() {
  return (
    <div className="flex flex-col gap-4">
      <RegisterForm />
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
