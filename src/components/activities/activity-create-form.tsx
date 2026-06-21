import { activityTemplates, getTemplateByType } from '@/activities/catalog';
import { getActivityDraftSourceText } from '@/activities/draft-source';
import {
  activityEditorDefaultInput,
  buildActivityEditorTemplateSetupView,
  buildActivityEditorTemplateReadiness,
} from '@/activities/editor';
import { getActivityTemplateScaffold } from '@/activities/scaffolds';
import {
  buildGenerateActivityDraftInputFromEditor,
  type ActivityDraftResult,
} from '@/activities/ai-draft';
import {
  buildActivityDraftMetaSummaryView,
  buildActivityTemplateReadinessPanelSummary,
  type ActivityTemplateReadinessPanelSummary,
} from '@/activities/draft-meta';
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
import {
  useCreateActivity,
  useGenerateActivityDraft,
  useUpdateActivity,
} from '@/hooks/use-activities';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { getPathWithLocale } from '@/lib/urls';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  IconDeviceFloppy,
  IconLayoutGrid,
  IconLoader2,
  IconLogin2,
  IconSparkles,
} from '@tabler/icons-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const difficultyOptions = activityDifficultySchema.options;
const visibilityOptions = activityVisibilitySchema.options;
const templateTypeOptions = activityTemplateTypeSchema.options;
const draftItemCountOptions = [3, 5, 8, 10] as const;

type ActivityCreateFormProps = {
  activityId?: string;
  initialValues?: CreateActivityInput;
  mode?: 'create' | 'edit';
};

export function ActivityCreateForm({
  activityId,
  initialValues,
  mode = 'create',
}: ActivityCreateFormProps) {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const createMutation = useCreateActivity();
  const draftMutation = useGenerateActivityDraft();
  const updateMutation = useUpdateActivity();
  const navigate = useNavigate();
  const [draftSourceText, setDraftSourceText] = useState(
    getActivityDraftSourceText(initialValues ?? activityEditorDefaultInput)
  );
  const [draftItemCount, setDraftItemCount] = useState(5);
  const [draftResult, setDraftResult] = useState<ActivityDraftResult>();
  const form = useForm<CreateActivityInput>({
    defaultValues: initialValues ?? activityEditorDefaultInput,
    resolver: zodResolver(createActivityInputSchema),
  });
  const selectedTemplate = form.watch('templateType');
  const watchedValues = form.watch();
  const template = getTemplateByType(selectedTemplate);
  const templateSetupView = useMemo(
    () => buildActivityEditorTemplateSetupView(selectedTemplate),
    [selectedTemplate]
  );
  const templateReadiness = useMemo(
    () => buildActivityEditorTemplateReadiness(watchedValues),
    [watchedValues]
  );
  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    form.formState.isSubmitting;
  const isGeneratingDraft = draftMutation.isPending;
  const isEditMode = mode === 'edit';

  useEffect(() => {
    if (!initialValues) return;
    form.reset(initialValues);
    setDraftSourceText(getActivityDraftSourceText(initialValues));
    setDraftResult(undefined);
  }, [form, initialValues]);

  async function onGenerateDraft() {
    if (!session?.user) {
      toast.error('Sign in to generate AI activity drafts.');
      return;
    }

    const sourceText = draftSourceText.trim();
    if (!sourceText) {
      toast.error('Add a topic, vocabulary list, or source notes first.');
      return;
    }

    const current = form.getValues();
    try {
      const result = await draftMutation.mutateAsync(
        buildGenerateActivityDraftInputFromEditor({
          current,
          itemCount: draftItemCount,
          sourceText,
        })
      );

      form.reset({
        ...result.activity,
        visibility: current.visibility,
      });
      setDraftResult(result);

      if (result.notice) {
        toast.success('Draft filled from the local generator.');
        return;
      }

      toast.success('AI activity draft generated.');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Activity draft could not be generated.'
      );
    }
  }

  function applyTemplateScaffold() {
    const current = form.getValues();
    const scaffold = getActivityTemplateScaffold(selectedTemplate);
    const nextValues = {
      ...current,
      ...scaffold,
      templateType: selectedTemplate,
    };
    form.reset(nextValues);
    setDraftSourceText(getActivityDraftSourceText(nextValues));
    setDraftResult(undefined);
    toast.success(templateSetupView.successMessage);
  }

  async function onSubmit(values: CreateActivityInput) {
    if (!session?.user) {
      toast.error('Sign in to save activities to your teacher library.');
      return;
    }

    try {
      if (isEditMode) {
        if (!activityId) {
          toast.error('Activity could not be identified for editing.');
          return;
        }

        await updateMutation.mutateAsync({
          ...values,
          id: activityId,
        });
        toast.success('Activity updated.');
        form.reset(values);
        return;
      }

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
          <Badge variant="secondary" className="rounded-md">
            {template.name}
          </Badge>
        </div>
        <CardTitle>
          <h2 className="text-xl font-semibold">
            {isEditMode
              ? 'Edit reusable activity'
              : 'Create a reusable activity'}
          </h2>
        </CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="rounded-md bg-background"
                    >
                      <IconSparkles className="size-3.5" />
                      AI draft
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Teacher reviews before saving
                    </span>
                  </div>
                  <label
                    htmlFor="activity-ai-source"
                    className="font-medium text-sm"
                  >
                    Topic or source notes
                  </label>
                  <Textarea
                    id="activity-ai-source"
                    value={draftSourceText}
                    onChange={(event) =>
                      setDraftSourceText(event.currentTarget.value)
                    }
                    rows={3}
                    placeholder="Paste vocabulary, a reading passage, or lesson notes."
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-[8rem_auto] lg:w-auto lg:grid-cols-[8rem_auto]">
                  <div className="space-y-2">
                    <label
                      htmlFor="activity-ai-item-count"
                      className="font-medium text-sm"
                    >
                      Items
                    </label>
                    <NativeSelect
                      id="activity-ai-item-count"
                      value={String(draftItemCount)}
                      onChange={(event) =>
                        setDraftItemCount(Number(event.currentTarget.value))
                      }
                      className="w-full"
                    >
                      {draftItemCountOptions.map((count) => (
                        <NativeSelectOption key={count} value={String(count)}>
                          {count}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onGenerateDraft}
                    disabled={isGeneratingDraft || !session?.user}
                    className="self-end"
                  >
                    {isGeneratingDraft ? (
                      <IconLoader2 className="size-4 animate-spin" />
                    ) : (
                      <IconSparkles className="size-4" />
                    )}
                    Generate draft
                  </Button>
                </div>
              </div>
            </div>

            {draftResult ? (
              <ActivityDraftMetaSummary result={draftResult} />
            ) : null}

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
                          const item = getTemplateByType(type);
                          return (
                            <NativeSelectOption key={type} value={type}>
                              {item.name}
                            </NativeSelectOption>
                          );
                        })}
                      </NativeSelect>
                    </FormControl>
                    <FormDescription>{template.bestFor}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="rounded-lg border bg-muted/20 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="rounded-md">
                      {templateSetupView.shortName}
                    </Badge>
                    <span className="text-sm font-medium">
                      {templateSetupView.title}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {templateSetupView.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {templateSetupView.requirementBadges.map((requirement) => (
                      <Badge
                        key={requirement}
                        variant="secondary"
                        className="rounded-md"
                      >
                        {requirement}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-background sm:w-fit"
                  onClick={applyTemplateScaffold}
                >
                  <IconSparkles className="size-4" />
                  {templateSetupView.actionLabel}
                </Button>
              </div>
            </div>

            <ActivityTemplateReadinessPanel
              summary={buildActivityTemplateReadinessPanelSummary(
                templateReadiness
              )}
            />

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
                        placeholder="Prompt | answer | option, option, option | explanation"
                      />
                    </FormControl>
                    <FormDescription>
                      One question per line. Use vertical bars to separate the
                      prompt, answer, optional choices, and optional
                      explanation. Use / or ; inside the answer field for
                      acceptable alternatives.
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
                      Used by match-up, line-match, and matching-pairs
                      templates.
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
              {isEditMode
                ? 'Changes update the reusable activity used by future assignments.'
                : 'Saved activities appear in the teacher dashboard and can later be published as assignments.'}
            </p>
            {session?.user ? (
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <IconLoader2 className="size-4 animate-spin" />
                ) : (
                  <IconDeviceFloppy className="size-4" />
                )}
                {isEditMode ? 'Save changes' : 'Save activity'}
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

function ActivityDraftMetaSummary({ result }: { result: ActivityDraftResult }) {
  const summaryView = buildActivityDraftMetaSummaryView({
    meta: result.meta,
    model: result.model,
    notice: result.notice,
    provider: result.provider,
  });

  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-sm">{summaryView.title}</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {summaryView.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="rounded-md">
            {summaryView.readyTemplateLabel}
          </Badge>
          <Badge variant="outline" className="rounded-md">
            {summaryView.providerLabel}
          </Badge>
        </div>
      </div>
      <div className="mt-3 rounded-lg border bg-background p-3 text-xs leading-5 text-muted-foreground">
        <p>
          {summaryView.modelLabel}:{' '}
          <span className="font-medium">{summaryView.modelName}</span>
        </p>
        {summaryView.notice ? (
          <p className="mt-1">{summaryView.notice}</p>
        ) : null}
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-5">
        {summaryView.coverageStats.map((stat) => (
          <ActivityDraftCoverageStat
            key={stat.label}
            label={stat.label}
            value={stat.value}
          />
        ))}
      </div>
      {summaryView.suggestedTemplateOptions.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {summaryView.suggestedTemplateOptions.map((option) => (
            <Badge
              key={option.template}
              variant="outline"
              className="rounded-md"
            >
              {option.shortName}
            </Badge>
          ))}
        </div>
      ) : null}
      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {summaryView.templateReadinessOptions.map((option) => (
          <div
            key={option.template}
            className={cn(
              'rounded-lg border bg-background p-3',
              option.isReady && 'border-primary/25 bg-primary/5'
            )}
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={option.isReady ? 'secondary' : 'outline'}
                className="rounded-md"
              >
                {option.shortName}
              </Badge>
              {option.selectedLabel ? (
                <Badge variant="outline" className="rounded-md">
                  {option.selectedLabel}
                </Badge>
              ) : null}
              <span className="text-xs text-muted-foreground">
                {option.readinessLabel}
              </span>
            </div>
            {option.diagnosis ? (
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {option.diagnosis}
              </p>
            ) : null}
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-1.5">
        {summaryView.reviewChecklist.map((item) => (
          <p key={item} className="text-xs leading-5 text-muted-foreground">
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function ActivityTemplateReadinessPanel({
  summary,
}: {
  summary: ActivityTemplateReadinessPanelSummary;
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <IconLayoutGrid className="size-4 text-primary" />
            <h3 className="font-semibold text-sm">Template readiness</h3>
          </div>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            The same structured content can become multiple Wordwall-style
            activity formats after saving.
          </p>
        </div>
        <Badge variant="secondary" className="w-fit rounded-md">
          {summary.readyCount} ready
        </Badge>
      </div>
      {summary.readyOptions.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {summary.readyOptions.map((option) => (
            <Badge
              key={option.template}
              variant="outline"
              className="rounded-md"
            >
              {option.shortName}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-muted-foreground text-sm">
          {summary.emptyText}
        </p>
      )}
      {summary.lockedOptions.length > 0 ? (
        <div className="mt-4 grid gap-1.5">
          {summary.lockedOptions.slice(0, 4).map((option) => (
            <p
              key={option.template}
              className="text-muted-foreground text-xs leading-5"
            >
              {option.diagnosis}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ActivityDraftCoverageStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
