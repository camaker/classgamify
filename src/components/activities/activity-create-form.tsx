import {
  buildActivityEditorDraftGenerationGate,
  buildActivityEditorDraftSourceState,
  buildActivityEditorDraftSourceText,
  buildActivityEditorDraftSuccessMessage,
  buildActivityEditorModeView,
  buildActivityEditorSaveGate,
  buildActivityEditorSelectOptions,
  buildActivityEditorSyncedDraftSourceText,
  buildActivityEditorTemplateScaffoldApplication,
  buildActivityEditorTemplateView,
  getActivityEditorDefaultInput,
} from '@/activities/editor';
import {
  ACTIVITY_AI_DRAFT_ITEM_COUNT_OPTIONS,
  ACTIVITY_AI_DRAFT_ITEM_COUNT_RANGE,
  buildGenerateActivityDraftInputFromEditor,
  type ActivityDraftResult,
} from '@/activities/ai-draft';
import {
  buildActivityDraftMetaSummaryView,
  type ActivityTemplateReadinessPanelSummary,
} from '@/activities/draft-meta';
import { ActivitySourceMaterialsField } from '@/components/activities/activity-source-materials-field';
import {
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
import { m } from '@/locale/paraglide/messages';
import { cn } from '@/lib/utils';
import { getPathWithLocale } from '@/lib/urls';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  IconDeviceFloppy,
  IconLayoutGrid,
  IconLoader2,
  IconLogin2,
  IconPaperclip,
  IconSparkles,
} from '@tabler/icons-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

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
  const defaultValues = useMemo(
    () => initialValues ?? getActivityEditorDefaultInput(),
    [initialValues]
  );
  const [draftSourceText, setDraftSourceText] = useState(
    buildActivityEditorDraftSourceText(defaultValues)
  );
  const [draftItemCount, setDraftItemCount] = useState(
    ACTIVITY_AI_DRAFT_ITEM_COUNT_RANGE.default
  );
  const [draftResult, setDraftResult] = useState<ActivityDraftResult>();
  const form = useForm<CreateActivityInput>({
    defaultValues,
    resolver: zodResolver(createActivityInputSchema),
  });
  const selectedTemplate = form.watch('templateType');
  const watchedValues = form.watch();
  const draftSourceState = buildActivityEditorDraftSourceState({
    draftSourceText,
    sourceMaterials: watchedValues.sourceMaterials,
  });
  const modeView = buildActivityEditorModeView(mode);
  const selectOptionsView = buildActivityEditorSelectOptions();
  const templateView = useMemo(
    () =>
      buildActivityEditorTemplateView({
        input: watchedValues,
        templateType: selectedTemplate,
      }),
    [selectedTemplate, watchedValues]
  );
  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    form.formState.isSubmitting;
  const isGeneratingDraft = draftMutation.isPending;

  useEffect(() => {
    if (!initialValues) return;
    form.reset(initialValues);
    setDraftSourceText(buildActivityEditorDraftSourceText(initialValues));
    setDraftResult(undefined);
  }, [form, initialValues]);

  async function onGenerateDraft() {
    const draftGate = buildActivityEditorDraftGenerationGate({
      hasUser: Boolean(session?.user),
      sourceText: draftSourceText,
    });
    if (!draftGate.canGenerate) {
      toast.error(draftGate.errorMessage);
      return;
    }

    const current = form.getValues();
    try {
      const result = await draftMutation.mutateAsync(
        buildGenerateActivityDraftInputFromEditor({
          current,
          itemCount: draftItemCount,
          sourceText: draftGate.sourceText,
        })
      );

      form.reset({
        ...result.activity,
        sourceMaterials: current.sourceMaterials ?? [],
        visibility: current.visibility,
      });
      setDraftResult(result);

      toast.success(
        buildActivityEditorDraftSuccessMessage({ notice: result.notice })
      );
    } catch {
      toast.error(m.activity_form_toast_draft_generation_failed());
    }
  }

  function applyTemplateScaffold() {
    const scaffoldApplication = buildActivityEditorTemplateScaffoldApplication({
      current: form.getValues(),
      templateType: selectedTemplate,
    });
    form.reset(scaffoldApplication.values);
    setDraftSourceText(scaffoldApplication.draftSourceText);
    setDraftResult(undefined);
    toast.success(scaffoldApplication.successMessage);
  }

  function useAttachedMaterialsForDraft() {
    setDraftSourceText(
      buildActivityEditorSyncedDraftSourceText({
        sourceMaterials: form.getValues('sourceMaterials'),
        sourceText: draftSourceText,
      })
    );
    toast.success(m.activity_form_toast_source_materials_synced());
  }

  async function onSubmit(values: CreateActivityInput) {
    const saveGate = buildActivityEditorSaveGate({
      activityId,
      hasUser: Boolean(session?.user),
      mode,
    });

    if (!saveGate.canSave) {
      toast.error(saveGate.errorMessage);
      return;
    }

    try {
      if (saveGate.mode === 'edit') {
        await updateMutation.mutateAsync({
          ...values,
          id: saveGate.activityId,
        });
        toast.success(modeView.saveSuccessMessage);
        form.reset(values);
        return;
      }

      const activity = await createMutation.mutateAsync(values);
      toast.success(modeView.saveSuccessMessage);
      navigate({
        to: Routes.DashboardActivities,
        search: { created: activity.id },
      });
    } catch {
      toast.error(m.activity_form_toast_save_failed());
    }
  }

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="rounded-md border-primary/30">
            <IconSparkles className="size-3.5" />
            {m.activity_form_editor_badge()}
          </Badge>
          <Badge variant="secondary" className="rounded-md">
            {templateView.template.name}
          </Badge>
        </div>
        <CardTitle>
          <h2 className="text-xl font-semibold">{modeView.title}</h2>
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
                      {m.activity_form_ai_draft_badge()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {m.activity_form_ai_draft_review_note()}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label
                      htmlFor="activity-ai-source"
                      className="font-medium text-sm"
                    >
                      {m.activity_form_ai_source_label()}
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="bg-background"
                      onClick={useAttachedMaterialsForDraft}
                      disabled={!draftSourceState.canSyncDraftSourceMaterials}
                    >
                      <IconPaperclip className="size-3.5" />
                      {m.activity_form_use_attached_materials()}
                    </Button>
                  </div>
                  <Textarea
                    id="activity-ai-source"
                    value={draftSourceText}
                    onChange={(event) =>
                      setDraftSourceText(event.currentTarget.value)
                    }
                    rows={3}
                    placeholder={m.activity_form_ai_source_placeholder()}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-[8rem_auto] lg:w-auto lg:grid-cols-[8rem_auto]">
                  <div className="space-y-2">
                    <label
                      htmlFor="activity-ai-item-count"
                      className="font-medium text-sm"
                    >
                      {m.activity_form_ai_item_count_label()}
                    </label>
                    <NativeSelect
                      id="activity-ai-item-count"
                      value={String(draftItemCount)}
                      onChange={(event) =>
                        setDraftItemCount(Number(event.currentTarget.value))
                      }
                      className="w-full"
                    >
                      {ACTIVITY_AI_DRAFT_ITEM_COUNT_OPTIONS.map((count) => (
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
                    {m.activity_form_generate_draft()}
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
                    <FormLabel>{m.activity_form_field_title()}</FormLabel>
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
                    <FormLabel>
                      {m.activity_form_field_primary_template()}
                    </FormLabel>
                    <FormControl>
                      <NativeSelect {...field} className="w-full">
                        {templateView.templateOptions.map((item) => (
                          <NativeSelectOption key={item.type} value={item.type}>
                            {item.name}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    </FormControl>
                    <FormDescription>
                      {templateView.template.bestFor}
                    </FormDescription>
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
                      {templateView.setupView.shortName}
                    </Badge>
                    <span className="text-sm font-medium">
                      {templateView.setupView.title}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {templateView.setupView.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {templateView.setupView.requirementBadges.map(
                      (requirement) => (
                        <Badge
                          key={requirement}
                          variant="secondary"
                          className="rounded-md"
                        >
                          {requirement}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-background sm:w-fit"
                  onClick={applyTemplateScaffold}
                >
                  <IconSparkles className="size-4" />
                  {templateView.setupView.actionLabel}
                </Button>
              </div>
            </div>

            <ActivityTemplateReadinessPanel
              summary={templateView.readinessSummary}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{m.activity_form_field_description()}</FormLabel>
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
                    <FormLabel>{m.activity_form_field_subject()}</FormLabel>
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
                    <FormLabel>{m.activity_form_field_grade_band()}</FormLabel>
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
                    <FormLabel>{m.activity_form_field_difficulty()}</FormLabel>
                    <FormControl>
                      <NativeSelect {...field} className="w-full">
                        {selectOptionsView.difficultyOptions.map((option) => (
                          <NativeSelectOption
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
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
                    <FormLabel>{m.activity_form_field_visibility()}</FormLabel>
                    <FormControl>
                      <NativeSelect {...field} className="w-full">
                        {selectOptionsView.visibilityOptions.map((option) => (
                          <NativeSelectOption
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
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
                  <FormLabel>{m.activity_form_field_learning_goal()}</FormLabel>
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
                    <FormLabel>{m.activity_form_field_vocabulary()}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder={m.activity_form_vocabulary_placeholder()}
                      />
                    </FormControl>
                    <FormDescription>
                      {m.activity_form_vocabulary_description()}
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
                    <FormLabel>{m.activity_form_field_questions()}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder={m.activity_form_questions_placeholder()}
                      />
                    </FormControl>
                    <FormDescription>
                      {m.activity_form_questions_description()}
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
                    <FormLabel>{m.activity_form_field_pairs()}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder={m.activity_form_pairs_placeholder()}
                      />
                    </FormControl>
                    <FormDescription>
                      {m.activity_form_pairs_description()}
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
                    <FormLabel>{m.activity_form_field_groups()}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder={m.activity_form_groups_placeholder()}
                      />
                    </FormControl>
                    <FormDescription>
                      {m.activity_form_groups_description()}
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
                    <FormLabel>
                      {m.activity_form_field_source_summary()}
                    </FormLabel>
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
                    <FormLabel>
                      {m.activity_form_field_teacher_notes()}
                    </FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormDescription>
                      {m.activity_form_teacher_notes_description()}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="sourceMaterials"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ActivitySourceMaterialsField
                      canLoadFiles={Boolean(session?.user)}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!session?.user && !sessionPending ? (
              <FormError message={m.activity_form_sign_in_required_message()} />
            ) : null}
          </CardContent>
          <CardFooter className="mt-6 flex flex-col gap-3 border-t bg-muted/40 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {modeView.footerHint}
            </p>
            {session?.user ? (
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <IconLoader2 className="size-4 animate-spin" />
                ) : (
                  <IconDeviceFloppy className="size-4" />
                )}
                {modeView.saveLabel}
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
                {m.activity_form_sign_in_to_save()}
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
        <p className="mt-1">{summaryView.providerDescription}</p>
        {summaryView.notice ? (
          <p className="mt-1">
            <span className="font-medium">{summaryView.noticeLabel}:</span>{' '}
            {summaryView.notice}
          </p>
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
            <h3 className="font-semibold text-sm">{summary.title}</h3>
          </div>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {summary.description}
          </p>
        </div>
        <Badge variant="secondary" className="w-fit rounded-md">
          {summary.readyCountLabel}
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
          {summary.lockedOptions.map((option) => (
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
