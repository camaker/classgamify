import { useEffect, useState } from 'react'
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
import { cn } from '@/lib/utils'
import { Routes } from '@/routes'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2Icon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const message = {
  title: 'Forgot Password',
  email: 'Email',
  send: 'Send reset link',
  backToLogin: 'Back to login',
  checkEmail: 'Please check your email inbox',
  emailRequired: 'Please enter your email',
} as const

export function ForgotPasswordForm({ className }: { className?: string }) {
  const [error, setError] = useState<string | undefined>('')
  const [success, setSuccess] = useState<string | undefined>('')
  const [isPending, setIsPending] = useState(false)

  const ForgotPasswordSchema = z.object({
    email: z.string().email({ message: message.emailRequired }),
  })

  const form = useForm<z.infer<typeof ForgotPasswordSchema>>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const emailFromUrl =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('email')
      : null

  useEffect(() => {
    if (emailFromUrl) form.setValue('email', emailFromUrl)
  }, [emailFromUrl, form])

  const onSubmit = async (values: z.infer<typeof ForgotPasswordSchema>) => {
    await authClient.requestPasswordReset(
      {
        email: values.email,
        redirectTo: Routes.ResetPassword,
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

  return (
    <AuthCard
      headerLabel={message.title}
      bottomButtonLabel={message.backToLogin}
      bottomButtonHref={Routes.Login}
      className={cn('', className)}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            <span>{message.send}</span>
          </Button>
        </form>
      </Form>
    </AuthCard>
  )
}
