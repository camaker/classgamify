import { FormError } from '@/components/shared/form-error';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import {
  useNewsletterStatus,
  useSubscribeNewsletter,
  useUnsubscribeNewsletter,
} from '@/hooks/use-newsletter';
import { authClient } from '@/auth/client';
import { cn } from '@/lib/utils';
import {
  isSettingsNotificationsEnabled,
  type SettingsNotificationNewsletterCardView,
} from '@/settings/notifications-view';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconLoader2 } from '@tabler/icons-react';
import { useEffect, useId } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
interface NewsletterFormCardProps {
  className?: string;
  view: SettingsNotificationNewsletterCardView;
}
const formSchema = z.object({ subscribed: z.boolean() });
export function NewsletterFormCard({
  className,
  view,
}: NewsletterFormCardProps) {
  const descriptionId = useId();
  const notificationsEnabled = isSettingsNotificationsEnabled();

  const { data: session } = authClient.useSession();
  const currentUser = session?.user;
  const {
    data: newsletterStatus,
    isLoading: isStatusLoading,
    error: statusError,
  } = useNewsletterStatus(
    notificationsEnabled ? currentUser?.email : undefined
  );
  const subscribeMutation = useSubscribeNewsletter();
  const unsubscribeMutation = useUnsubscribeNewsletter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { subscribed: false },
  });
  const newsletterErrorMessage =
    statusError || subscribeMutation.error || unsubscribeMutation.error
      ? view.errorMessage
      : undefined;
  useEffect(() => {
    if (newsletterStatus)
      form.setValue('subscribed', newsletterStatus.subscribed);
  }, [newsletterStatus, form]);
  if (!notificationsEnabled) return null;
  if (!currentUser) return null;
  const handleSubscriptionChange = async (value: boolean) => {
    if (!currentUser.email) {
      toast.error(view.emailRequiredMessage);
      return;
    }
    try {
      if (value) {
        await subscribeMutation.mutateAsync(currentUser.email);
        toast.success(view.subscribeSuccessMessage);
      } else {
        await unsubscribeMutation.mutateAsync(currentUser.email);
        toast.success(view.unsubscribeSuccessMessage);
      }
    } catch {
      console.error('newsletter subscription update failed');
      toast.error(view.errorMessage);
      form.setValue('subscribed', newsletterStatus?.subscribed ?? false);
    }
  };
  return (
    <Card
      aria-label={view.ariaLabel}
      className={cn('w-full overflow-hidden pt-6 pb-0', className)}
    >
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{view.title}</CardTitle>
        <CardDescription>{view.description}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form aria-label={view.formAriaLabel}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="subscribed"
              render={({ field }) => (
                <FormItem
                  aria-label={view.switchGroupAriaLabel}
                  className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start"
                >
                  <div className="space-y-1">
                    <FormLabel className="text-base">{view.label}</FormLabel>
                    <p
                      className="text-muted-foreground text-sm leading-6"
                      id={descriptionId}
                    >
                      {view.switchDescription}
                    </p>
                  </div>
                  <div className="relative flex items-center">
                    {(isStatusLoading ||
                      subscribeMutation.isPending ||
                      unsubscribeMutation.isPending) && (
                      <IconLoader2 className="mr-2 size-4 animate-spin text-primary" />
                    )}
                    <FormControl>
                      <Switch
                        aria-describedby={descriptionId}
                        aria-label={view.switchAriaLabel}
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          handleSubscriptionChange(checked);
                        }}
                        disabled={
                          isStatusLoading ||
                          subscribeMutation.isPending ||
                          unsubscribeMutation.isPending
                        }
                      />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />
            <section
              aria-label={view.scopeAriaLabel}
              className="border-l-2 pl-3 text-sm"
            >
              <p className="font-medium text-foreground">{view.scopeLabel}</p>
              <p className="mt-1 text-muted-foreground leading-6">
                {view.scopeDescription}
              </p>
            </section>
            <FormError message={newsletterErrorMessage} />
          </CardContent>
          <CardFooter
            aria-label={view.hintAriaLabel}
            className="mt-6 rounded-none bg-muted px-6 py-4"
          >
            <p className="text-sm text-muted-foreground">{view.hint}</p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
