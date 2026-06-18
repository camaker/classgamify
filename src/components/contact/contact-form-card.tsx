import { m } from '@/locale/paraglide/messages';
import { sendContactMessage } from '@/api/contact';
import { FormError } from '@/components/shared/form-error';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
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
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
const schema = z.object({
  name: z.string().min(3, m.contact_name_min()).max(30, m.contact_name_max()),
  email: z.email(m.contact_email_invalid()),
  message: z
    .string()
    .min(10, m.contact_message_min())
    .max(500, m.contact_message_max()),
});
type FormValues = z.infer<typeof schema>;

type ContactIntent = 'general' | 'classroom';

export function ContactFormCard({
  intent = 'general',
}: {
  intent?: ContactIntent;
}) {
  const [error, setError] = useState<string | undefined>();
  const defaultMessage =
    intent === 'classroom' ? m.contact_classroom_message_template() : '';
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', message: defaultMessage },
  });
  const formTitle =
    intent === 'classroom'
      ? m.contact_classroom_form_title()
      : m.contact_form_title();
  const messagePlaceholder =
    intent === 'classroom'
      ? m.contact_classroom_placeholder_message()
      : m.contact_placeholder_message();
  const isPending = form.formState.isSubmitting;
  async function onSubmit(values: FormValues) {
    setError(undefined);
    try {
      await sendContactMessage({ data: values });
      toast.success(m.contact_success());
      form.reset({ name: '', email: '', message: defaultMessage });
    } catch (err) {
      const msg = err instanceof Error ? err.message : m.contact_error();
      setError(msg);
      toast.error(msg);
    }
  }
  return (
    <Card className="mx-auto max-w-lg overflow-hidden pt-6 pb-0">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{formTitle}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{m.contact_name()}</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="name"
                      placeholder={m.contact_placeholder_name()}
                      {...field}
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
                  <FormLabel>{m.contact_email()}</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="email"
                      type="email"
                      placeholder={m.contact_placeholder_email()}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{m.contact_message()}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={messagePlaceholder}
                      rows={intent === 'classroom' ? 7 : 3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormError message={error} />
          </CardContent>
          <CardFooter className="mt-6 flex items-center justify-between rounded-none border-t bg-muted px-6 py-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? m.contact_sending() : m.contact_send()}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
