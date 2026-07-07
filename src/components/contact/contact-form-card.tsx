import { m } from '@/locale/paraglide/messages';
import { sendContactMessage } from '@/api/contact';
import { FormError } from '@/components/shared/form-error';
import { Button } from '@/components/ui/button';
import {
  buildContactClassroomInquiryPayload,
  CONTACT_CLASSROOM_INQUIRY_FIELD_LIMITS,
  CONTACT_MESSAGE_LIMITS,
  type ContactInquiryIntent,
} from '@/contact/inquiry';
import {
  buildContactClassroomInquiryScopeView,
  type ContactClassroomInquiryScopeItemId,
  type ContactClassroomInquiryScopeView,
} from '@/contact/inquiry-view';
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
import {
  IconChartBar,
  IconClipboardList,
  IconFileText,
  IconListCheck,
  IconSchool,
  IconShieldCheck,
  type TablerIcon,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useForm, type Control } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
const schema = z.object({
  name: z
    .string()
    .min(CONTACT_MESSAGE_LIMITS.name.min, m.contact_name_min())
    .max(CONTACT_MESSAGE_LIMITS.name.max, m.contact_name_max()),
  email: z.email(m.contact_email_invalid()),
  message: z
    .string()
    .min(CONTACT_MESSAGE_LIMITS.message.min, m.contact_message_min())
    .max(CONTACT_MESSAGE_LIMITS.message.max, m.contact_message_max()),
  classroomGrade: z
    .string()
    .max(CONTACT_CLASSROOM_INQUIRY_FIELD_LIMITS.grade)
    .optional(),
  classroomLearners: z
    .string()
    .max(CONTACT_CLASSROOM_INQUIRY_FIELD_LIMITS.learners)
    .optional(),
  classroomMaterial: z
    .string()
    .max(CONTACT_CLASSROOM_INQUIRY_FIELD_LIMITS.material)
    .optional(),
  classroomRoutine: z
    .string()
    .max(CONTACT_CLASSROOM_INQUIRY_FIELD_LIMITS.routine)
    .optional(),
  classroomNeed: z
    .string()
    .max(CONTACT_CLASSROOM_INQUIRY_FIELD_LIMITS.need)
    .optional(),
});
type FormValues = z.infer<typeof schema>;

export function ContactFormCard({
  intent = 'general',
}: {
  intent?: ContactInquiryIntent;
}) {
  const [error, setError] = useState<string | undefined>();
  const classroomCopy = getClassroomInquiryCopy();
  const classroomScope =
    intent === 'classroom'
      ? buildContactClassroomInquiryScopeView()
      : undefined;
  const defaultMessage =
    intent === 'classroom' ? m.contact_classroom_message_template() : '';
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      classroomGrade: '',
      classroomLearners: '',
      classroomMaterial: '',
      classroomNeed: '',
      classroomRoutine: '',
      email: '',
      message: defaultMessage,
      name: '',
    },
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
      await sendContactMessage({
        data: {
          email: values.email,
          intent,
          message: values.message,
          name: values.name,
          ...(intent === 'classroom'
            ? {
                classroomInquiry: buildContactClassroomInquiryPayload({
                  learners: values.classroomLearners,
                  grade: values.classroomGrade,
                  material: values.classroomMaterial,
                  routine: values.classroomRoutine,
                  need: values.classroomNeed,
                }),
              }
            : {}),
        },
      });
      toast.success(m.contact_success());
      form.reset({
        classroomGrade: '',
        classroomLearners: '',
        classroomMaterial: '',
        classroomNeed: '',
        classroomRoutine: '',
        email: '',
        message: defaultMessage,
        name: '',
      });
    } catch {
      const msg = m.contact_error();
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
            {classroomScope ? (
              <ClassroomInquiryScopePanel view={classroomScope} />
            ) : null}
            {intent === 'classroom' ? (
              <ClassroomInquiryFields
                control={form.control}
                copy={classroomCopy}
              />
            ) : null}
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

type ClassroomInquiryCopy = ReturnType<typeof getClassroomInquiryCopy>;

function ClassroomInquiryScopePanel({
  view,
}: {
  view: ContactClassroomInquiryScopeView;
}) {
  const titleId = 'contact-classroom-scope-title';

  return (
    <section
      aria-labelledby={titleId}
      className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-3"
    >
      <div className="space-y-1">
        <p id={titleId} className="text-sm font-medium">
          {view.title}
        </p>
        <p className="text-xs leading-5 text-muted-foreground">
          {view.description}
        </p>
      </div>
      <div className="grid gap-2">
        {view.items.map((item) => {
          const Icon = classroomInquiryScopeIcons[item.id];

          return (
            <div
              key={item.id}
              className="flex gap-2 rounded-md bg-background/70 p-2"
            >
              <Icon
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-primary"
              />
              <div className="min-w-0">
                <p className="text-xs font-medium">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 rounded-md border bg-background/80 p-2">
        <IconShieldCheck
          aria-hidden="true"
          className="mt-0.5 size-4 shrink-0 text-primary"
        />
        <div className="min-w-0">
          <p className="text-xs font-medium">{view.privacyBoundary.title}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {view.privacyBoundary.description}
          </p>
        </div>
      </div>
    </section>
  );
}

function ClassroomInquiryFields({
  control,
  copy,
}: {
  control: Control<FormValues>;
  copy: ClassroomInquiryCopy;
}) {
  return (
    <div className="space-y-4 rounded-lg border bg-muted/30 p-3">
      <div className="space-y-1">
        <p className="text-sm font-medium">{copy.title}</p>
        <p className="text-xs leading-5 text-muted-foreground">
          {copy.description}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="classroomLearners"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{copy.learnersLabel}</FormLabel>
              <FormControl>
                <Input
                  autoComplete="off"
                  placeholder={copy.learnersPlaceholder}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="classroomGrade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{copy.gradeLabel}</FormLabel>
              <FormControl>
                <Input
                  autoComplete="off"
                  placeholder={copy.gradePlaceholder}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="classroomMaterial"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{copy.materialLabel}</FormLabel>
              <FormControl>
                <Input
                  autoComplete="off"
                  placeholder={copy.materialPlaceholder}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="classroomRoutine"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{copy.routineLabel}</FormLabel>
              <FormControl>
                <Input
                  autoComplete="off"
                  placeholder={copy.routinePlaceholder}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="classroomNeed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{copy.needLabel}</FormLabel>
              <FormControl>
                <Input
                  autoComplete="off"
                  placeholder={copy.needPlaceholder}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

function getClassroomInquiryCopy() {
  return {
    description: m.contact_classroom_details_description(),
    emailHeading: m.contact_classroom_email_heading(),
    gradeLabel: m.contact_classroom_grade_label(),
    gradePlaceholder: m.contact_classroom_grade_placeholder(),
    learnersLabel: m.contact_classroom_learners_label(),
    learnersPlaceholder: m.contact_classroom_learners_placeholder(),
    materialLabel: m.contact_classroom_material_label(),
    materialPlaceholder: m.contact_classroom_material_placeholder(),
    needLabel: m.contact_classroom_need_label(),
    needPlaceholder: m.contact_classroom_need_placeholder(),
    routineLabel: m.contact_classroom_routine_label(),
    routinePlaceholder: m.contact_classroom_routine_placeholder(),
    title: m.contact_classroom_details_title(),
  };
}

const classroomInquiryScopeIcons = {
  'activity-material': IconFileText,
  'assignment-routine': IconClipboardList,
  learners: IconSchool,
  'result-review': IconChartBar,
  'template-worksheet': IconListCheck,
} satisfies Record<ContactClassroomInquiryScopeItemId, TablerIcon>;
