import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
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
import { authClient } from '@/lib/auth-client'
import { Routes } from '@/routes'
import { zodResolver } from '@hookform/resolvers/zod'
import { EyeIcon, EyeOffIcon, Loader2Icon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const message = {
  title: 'Reset Password',
  password: 'Password',
  reset: 'Reset password',
  backToLogin: 'Back to login',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  minLength: 'Password must be at least 8 characters',
} as const

export function ResetPasswordForm() {
  const router = useRouter()
  const token =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('token')
      : null
  const errorParam =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('error')
      : null

  if (!token || errorParam === 'invalid_token') {
    return (
      <AuthCard
        headerLabel={message.title}
        bottomButtonLabel={message.backToLogin}
        bottomButtonHref={Routes.Login}
      >
        <p className="text-sm text-destructive py-4">
          Invalid or expired reset link. Please request a new one.
        </p>
      </AuthCard>
    )
  }

  const [error, setError] = useState<string | undefined>('')
  const [success, setSuccess] = useState<string | undefined>('')
  const [isPending, setIsPending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const ResetPasswordSchema = z.object({
    password: z.string().min(8, { message: message.minLength }),
  })

  const form = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { password: '' },
  })

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  const onSubmit = async (values: z.infer<typeof ResetPasswordSchema>) => {
    await authClient.resetPassword(
      {
        newPassword: values.password,
        token,
      },
      {
        onRequest: () => {
          setIsPending(true)
          setError('')
          setSuccess('')
        },
        onResponse: () => setIsPending(false),
        onSuccess: () => {
          router.navigate({ to: Routes.Login })
        },
        onError: (ctx) => {
          setError(`${ctx.error.status}: ${ctx.error.message}`)
        },
      },
    )
  }

  return (
    <AuthCard
      headerLabel={message.title}
      bottomButtonLabel={message.backToLogin}
      bottomButtonHref={Routes.Login}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
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
                          <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <EyeIcon className="h-4 w-4 text-muted-foreground" />
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
            className="w-full cursor-pointer"
          >
            {isPending && (
              <Loader2Icon className="mr-2 size-4 animate-spin" />
            )}
            <span>{message.reset}</span>
          </Button>
        </form>
      </Form>
    </AuthCard>
  )
}
