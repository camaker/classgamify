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
import { getLocale } from '@/lib/locale';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, type Control } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
const schema = z.object({
  name: z.string().min(3, m.contact_name_min()).max(30, m.contact_name_max()),
  email: z.email(m.contact_email_invalid()),
  message: z
    .string()
    .min(10, m.contact_message_min())
    .max(1500, m.contact_message_max()),
  classroomGrade: z.string().max(80).optional(),
  classroomLearners: z.string().max(80).optional(),
  classroomMaterial: z.string().max(120).optional(),
  classroomRoutine: z.string().max(120).optional(),
  classroomNeed: z.string().max(120).optional(),
});
type FormValues = z.infer<typeof schema>;

type ContactIntent = 'general' | 'classroom';

export function ContactFormCard({
  intent = 'general',
}: {
  intent?: ContactIntent;
}) {
  const [error, setError] = useState<string | undefined>();
  const currentLocale = getLocale() === 'zh' ? 'zh' : 'en';
  const classroomCopy = getClassroomInquiryCopy(currentLocale);
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
          message:
            intent === 'classroom'
              ? buildClassroomInquiryMessage(values, classroomCopy)
              : values.message,
          name: values.name,
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

function buildClassroomInquiryMessage(
  values: FormValues,
  copy: ClassroomInquiryCopy
) {
  const structuredLines = [
    [copy.learnersLabel, values.classroomLearners],
    [copy.gradeLabel, values.classroomGrade],
    [copy.materialLabel, values.classroomMaterial],
    [copy.routineLabel, values.classroomRoutine],
    [copy.needLabel, values.classroomNeed],
  ]
    .filter((item): item is [string, string] => Boolean(item[1]?.trim()))
    .map(([label, value]) => `${label}: ${value.trim()}`);
  const message = values.message.trim();

  return [
    copy.emailHeading,
    ...structuredLines,
    structuredLines.length > 0 ? '' : undefined,
    message,
  ]
    .filter(Boolean)
    .join('\n');
}

function getClassroomInquiryCopy(locale: 'en' | 'zh') {
  if (locale === 'zh') {
    return {
      description:
        '这些信息会整理进邮件，方便我们判断你需要的是模板活动、作业链接、学生结果复盘还是 AI 辅助备课。',
      emailHeading: '课堂咨询信息',
      gradeLabel: '班级或年级',
      gradePlaceholder: '例如：小学三年级 / 初中词汇复习',
      learnersLabel: '学习者',
      learnersPlaceholder: '例如：28 名三年级学生 / 1 对 1 辅导',
      materialLabel: '活动材料',
      materialPlaceholder: '例如：英语单词、科学分类、数学概念或已有练习纸',
      needLabel: '主要需求',
      needPlaceholder: '例如：单词配对、拖拽分类、填空作业、结果导出',
      routineLabel: '每周节奏',
      routinePlaceholder: '例如：每周 2 节课，课后发一次作业链接',
      title: '课堂需求细节',
    };
  }

  return {
    description:
      'These details are added to the email so we can tell whether you need template activities, assignment links, student results, or AI-assisted prep.',
    emailHeading: 'Classroom inquiry details',
    gradeLabel: 'Class or grade',
    gradePlaceholder: 'e.g. Grade 3 / middle-school vocabulary review',
    learnersLabel: 'Learners',
    learnersPlaceholder: 'e.g. 28 third graders / 1:1 tutoring',
    materialLabel: 'Activity material',
    materialPlaceholder:
      'e.g. English vocab, science groups, math concepts, existing worksheet',
    needLabel: 'Main need',
    needPlaceholder:
      'e.g. word matching, drag sorting, fill blanks, result export',
    routineLabel: 'Weekly routine',
    routinePlaceholder:
      'e.g. 2 classes per week, one homework link after class',
    title: 'Classroom details',
  };
}
