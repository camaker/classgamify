import { Link } from '@tanstack/react-router'
import { AuthCard } from '@/components/auth/auth-card'
import { FormError } from '@/components/shared/form-error'
import { FormSuccess } from '@/components/shared/form-success'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { websiteConfig } from '@/config/website'
import { authClient } from '@/lib/auth-client'
import { getBaseUrl } from '@/lib/urls'
import { cn } from '@/lib/utils'
import { DEFAULT_LOGIN_REDIRECT, Routes } from '@/routes'
import { zodResolver } from '@hookform/resolvers/zod'
import { EyeIcon, EyeOffIcon, Loader2Icon } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { SocialLoginButton } from './social-login-button'

const message = {
  welcomeBack: 'Welcome back',
  email: 'Email',
  password: 'Password',
  signIn: 'Sign In',
  signUpHint: "Don't have an account? Sign up",
  forgotPassword: 'Forgot Password?',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  emailRequired: 'Please enter your email',
  passwordRequired: 'Please enter your password',
} as const

export interface LoginFormProps {
  className?: string
  callbackUrl?: string
}

export function LoginForm({
  className,
  callbackUrl: propCallbackUrl,
}: LoginFormProps) {
  const paramCallbackUrl =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('callbackUrl')
      : null
  const defaultCallbackUrl = `${getBaseUrl()}${DEFAULT_LOGIN_REDIRECT}`
  const callbackUrl =
    propCallbackUrl ??
    (paramCallbackUrl ? `${getBaseUrl()}${paramCallbackUrl}` : defaultCallbackUrl)

  const [error, setError] = useState<string | undefined>('')
  const [success, setSuccess] = useState<string | undefined>('')
  const [isPending, setIsPending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const credentialLoginEnabled = websiteConfig.auth.enableCredentialLogin

  const LoginSchema = z.object({
    email: z.string().email({ message: message.emailRequired }),
    password: z.string().min(1, { message: message.passwordRequired }),
  })

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
  })

  const urlError =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('error')
      : null

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
        callbackURL: callbackUrl,
      },
      {
        onRequest: () => {
          setIsPending(true)
          setError('')
          setSuccess('')
        },
        onResponse: () => setIsPending(false),
        onSuccess: () => {},
        onError: (ctx) => {
          setError(`${ctx.error.status}: ${ctx.error.message}`)
        },
      },
    )
  }

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  return (
    <AuthCard
      headerLabel={message.welcomeBack}
      bottomButtonLabel={message.signUpHint}
      bottomButtonHref={Routes.Register}
      className={cn('', className)}
    >
      {credentialLoginEnabled && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{message.email}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="name@example.com"
                        type="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>{message.password}</FormLabel>
                      <Link
                        to={Routes.ForgotPassword}
                        className="text-xs font-normal text-muted-foreground hover:underline hover:underline-offset-4 hover:text-primary"
                      >
                        {message.forgotPassword}
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder="******"
                          type={showPassword ? 'text' : 'password'}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={togglePasswordVisibility}
                          disabled={isPending}
                        >
                          {showPassword ? (
                            <EyeOffIcon className="size-4 text-muted-foreground" />
                          ) : (
                            <EyeIcon className="size-4 text-muted-foreground" />
                          )}
                          <span className="sr-only">
                            {showPassword
                              ? message.hidePassword
                              : message.showPassword}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormError message={error || urlError || undefined} />
            <FormSuccess message={success} />
            <Button
              disabled={isPending}
              size="lg"
              type="submit"
              className="w-full flex items-center justify-center gap-2 cursor-pointer"
            >
              {isPending && (
                <Loader2Icon className="mr-2 size-4 animate-spin" />
              )}
              <span>{message.signIn}</span>
            </Button>
          </form>
        </Form>
      )}
      <div className="mt-4">
        <SocialLoginButton
          callbackUrl={callbackUrl}
          showDivider={credentialLoginEnabled}
        />
      </div>
    </AuthCard>
  )
}
