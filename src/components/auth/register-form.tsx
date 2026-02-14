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
import { DEFAULT_LOGIN_REDIRECT, Routes } from '@/routes'
import { zodResolver } from '@hookform/resolvers/zod'
import { EyeIcon, EyeOffIcon, Loader2Icon } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { SocialLoginButton } from './social-login-button'

const message = {
  createAccount: 'Create an account',
  name: 'Name',
  email: 'Email',
  password: 'Password',
  signUp: 'Sign Up',
  signInHint: 'Already have an account? Sign in',
  checkEmail: 'Please check your email inbox',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  nameRequired: 'Please enter your name',
  emailRequired: 'Please enter your email',
  passwordRequired: 'Please enter your password',
} as const

interface RegisterFormProps {
  callbackUrl?: string
}

export function RegisterForm({ callbackUrl: propCallbackUrl }: RegisterFormProps) {
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

  const RegisterSchema = z.object({
    email: z.string().email({ message: message.emailRequired }),
    password: z.string().min(1, { message: message.passwordRequired }),
    name: z.string().min(1, { message: message.nameRequired }),
  })

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { email: '', password: '', name: '' },
  })

  const onSubmit = async (values: z.infer<typeof RegisterSchema>) => {
    await authClient.signUp.email(
      {
        email: values.email,
        password: values.password,
        name: values.name,
        callbackURL: callbackUrl,
      },
      {
        onRequest: () => {
          setIsPending(true)
          setError('')
          setSuccess('')
        },
        onResponse: () => setIsPending(false),
        onSuccess: () => setSuccess(message.checkEmail),
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
      headerLabel={message.createAccount}
      bottomButtonLabel={message.signInHint}
      bottomButtonHref={Routes.Login}
    >
      {credentialLoginEnabled && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{message.name}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                    <FormLabel>{message.password}</FormLabel>
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
            <FormError message={error} />
            <FormSuccess message={success} />
            <Button
              disabled={isPending}
              size="lg"
              type="submit"
              className="cursor-pointer w-full flex items-center justify-center gap-2"
            >
              {isPending && (
                <Loader2Icon className="mr-2 size-4 animate-spin" />
              )}
              <span>{message.signUp}</span>
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
