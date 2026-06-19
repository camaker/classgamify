import { activityTemplates } from '@/activities/catalog';
import {
  activityDifficultySchema,
  activityTemplateTypeSchema,
  activityVisibilitySchema,
  createActivityInputSchema,
  type CreateActivityInput,
} from '@/activities/validation';
import { authClient } from '@/auth/client';
import { FormError } from '@/components/shared/form-error';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateActivity } from '@/hooks/use-activities';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { getPathWithLocale } from '@/lib/urls';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  IconDeviceFloppy,
  IconLoader2,
  IconLogin2,
  IconSparkles,
} from '@tabler/icons-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const defaultValues: CreateActivityInput = {
  description:
    'Quick classroom practice that can become a quiz, match game, or worksheet.',
  difficulty: 'starter',
  gradeBand: 'Primary',
  groupsText: 'Fruit | apple, banana\nDrink | milk, water',
  language: 'en',
  learningGoal:
    'Students can recognize key words and connect them with simple meanings.',
  pairsText: 'apple | fruit\nmilk | drink\nrice | grain',
  questionsText:
    'Which word means a red or green fruit? | apple | apple, bread, water\nWhich drink is white? | milk | milk, rice, egg',
  sourceSummary: 'Teacher-created activity from a unit vocabulary list.',
  subject: 'English',
  teacherNotesText:
    'Use quiz mode for homework.\nUse matching pairs as a class warmup.',
  templateType: 'quiz',
  title: 'Food words quick check',
  visibility: 'draft',
  vocabularyText: 'apple, bread, milk, rice, water, egg',
};

const difficultyOptions = activityDifficultySchema.options;
const visibilityOptions = activityVisibilitySchema.options;
const templateTypeOptions = activityTemplateTypeSchema.options;

export function ActivityCreateForm() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const createMutation = useCreateActivity();
  const navigate = useNavigate();
  const form = useForm<CreateActivityInput>({
    defaultValues,
    resolver: zodResolver(createActivityInputSchema),
  });
  const selectedTemplate = form.watch('templateType');
  const template = activityTemplates.find(
    (item) => item.type === selectedTemplate
  );
  const isPending = createMutation.isPending || form.formState.isSubmitting;

  async function onSubmit(values: CreateActivityInput) {
    if (!session?.user) {
      toast.error('Sign in to save activities to your teacher library.');
      return;
    }

    try {
      const activity = await createMutation.mutateAsync(values);
      toast.success('Activity saved to your library.');
      navigate({
        to: Routes.DashboardActivities,
        search: { created: activity.id },
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Activity could not be saved.'
      );
    }
  }

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="rounded-md border-primary/30">
            <IconSparkles className="size-3.5" />
            Structured editor
          </Badge>
          {template ? (
            <Badge variant="secondary" className="rounded-md">
              {template.name}
            </Badge>
          ) : null}
        </div>
        <CardTitle>
          <h2 className="text-xl font-semibold">Create a reusable activity</h2>
        </CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="templateType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary template</FormLabel>
                    <FormControl>
                      <NativeSelect {...field} className="w-full">
                        {templateTypeOptions.map((type) => {
                          const item = activityTemplates.find(
                            (template) => template.type === type
                          );
                          return (
                            <NativeSelectOption key={type} value={type}>
                              {item?.name ?? type}
                            </NativeSelectOption>
                          );
                        })}
                      </NativeSelect>
                    </FormControl>
                    <FormDescription>
                      {template?.bestFor ??
                        'Choose the game style teachers will see first.'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-4">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gradeBand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade band</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <FormControl>
                      <NativeSelect {...field} className="w-full">
                        {difficultyOptions.map((value) => (
                          <NativeSelectOption key={value} value={value}>
                            {value}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <FormControl>
                      <NativeSelect {...field} className="w-full">
                        {visibilityOptions.map((value) => (
                          <NativeSelectOption key={value} value={value}>
                            {value}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="learningGoal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Learning goal</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 lg:grid-cols-2">
              <FormField
                control={form.control}
                name="vocabularyText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vocabulary</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder="apple, bread, milk"
                      />
                    </FormControl>
                    <FormDescription>
                      Separate terms with commas, semicolons, or new lines.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="questionsText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Questions</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder="Prompt | answer | option, option, option"
                      />
                    </FormControl>
                    <FormDescription>
                      One question per line. Use vertical bars to separate the
                      prompt, answer, and optional choices.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <FormField
                control={form.control}
                name="pairsText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Match pairs</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder="term | definition"
                      />
                    </FormControl>
                    <FormDescription>
                      Used by match-up and matching-pairs templates.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="groupsText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Groups</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder="Group | item one, item two"
                      />
                    </FormControl>
                    <FormDescription>
                      Used by drag classification and category sorting.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <FormField
                control={form.control}
                name="sourceSummary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source summary</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="teacherNotesText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teacher notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormDescription>One note per line.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {!session?.user && !sessionPending ? (
              <FormError message="You can draft the activity here, but saving requires a teacher account." />
            ) : null}
          </CardContent>
          <CardFooter className="mt-6 flex flex-col gap-3 border-t bg-muted/40 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Saved activities appear in the teacher dashboard and can later be
              published as assignments.
            </p>
            {session?.user ? (
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <IconLoader2 className="size-4 animate-spin" />
                ) : (
                  <IconDeviceFloppy className="size-4" />
                )}
                Save activity
              </Button>
            ) : (
              <Link
                to={Routes.Login}
                search={{
                  callbackUrl: getPathWithLocale(Routes.Create),
                }}
                className={cn(buttonVariants(), 'w-full sm:w-auto')}
              >
                <IconLogin2 className="size-4" />
                Sign in to save
              </Link>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
