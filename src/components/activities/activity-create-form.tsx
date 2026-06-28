import {
  buildActivityEditorAiDraftPanelView,
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
  ACTIVITY_AI_DRAFT_ITEM_COUNT_RANGE,
  buildGenerateActivityDraftInputFromEditor,
  type ActivityDraftResult,
} from '@/activities/ai-draft';
import { ActivityAiDraftPanel } from '@/components/activities/activity-ai-draft-panel';
import {
  ActivityEditorDetailsFields,
  ActivityEditorPrimaryFields,
  ActivityEditorSourceMaterialsFormField,
  ActivityEditorStructuredContentFields,
} from '@/components/activities/activity-editor-fields';
import {
  ActivityEditorFooter,
  ActivityEditorHeader,
} from '@/components/activities/activity-editor-shell';
import { ActivityTemplateReadinessPanel } from '@/components/activities/activity-template-readiness-panel';
import { ActivityTemplateScaffoldPanel } from '@/components/activities/activity-template-scaffold-panel';
import {
  createActivityInputSchema,
  type CreateActivityInput,
} from '@/activities/validation';
import { authClient } from '@/auth/client';
import { FormError } from '@/components/shared/form-error';
import { Card, CardContent } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import {
  useCreateActivity,
  useGenerateActivityDraft,
  useUpdateActivity,
} from '@/hooks/use-activities';
import { Routes } from '@/lib/routes';
import { m } from '@/locale/paraglide/messages';
import { getPathWithLocale } from '@/lib/urls';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
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
  const isGeneratingDraft = draftMutation.isPending;
  const draftSourceState = buildActivityEditorDraftSourceState({
    draftSourceText,
    sourceMaterials: watchedValues.sourceMaterials,
  });
  const aiDraftPanelView = buildActivityEditorAiDraftPanelView({
    hasUser: Boolean(session?.user),
    isGeneratingDraft,
    sourceState: draftSourceState,
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
  const loginAction = {
    to: Routes.Login,
    search: {
      callbackUrl: getPathWithLocale(Routes.Create),
    },
  };

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

  function syncAttachedMaterialsForDraft() {
    setDraftSourceText(
      buildActivityEditorSyncedDraftSourceText({
        sourceMaterials: form.getValues('sourceMaterials'),
        sourceText: draftSourceText,
      })
    );
    toast.success(aiDraftPanelView.syncSuccessMessage);
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
      <ActivityEditorHeader
        modeView={modeView}
        template={templateView.template}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <ActivityAiDraftPanel
              draftItemCount={draftItemCount}
              draftResult={draftResult}
              draftSourceText={draftSourceText}
              isGeneratingDraft={isGeneratingDraft}
              onDraftItemCountChange={setDraftItemCount}
              onDraftSourceTextChange={setDraftSourceText}
              onGenerateDraft={onGenerateDraft}
              onSyncSourceMaterials={syncAttachedMaterialsForDraft}
              panelView={aiDraftPanelView}
            />

            <ActivityEditorPrimaryFields
              control={form.control}
              templateView={templateView}
            />

            <ActivityTemplateScaffoldPanel
              setupView={templateView.setupView}
              onApplyScaffold={applyTemplateScaffold}
            />

            <ActivityTemplateReadinessPanel
              summary={templateView.readinessSummary}
            />

            <ActivityEditorDetailsFields
              control={form.control}
              selectOptionsView={selectOptionsView}
            />

            <ActivityEditorStructuredContentFields control={form.control} />

            <ActivityEditorSourceMaterialsFormField
              canLoadFiles={Boolean(session?.user)}
              control={form.control}
            />

            {!session?.user && !sessionPending ? (
              <FormError message={m.activity_form_sign_in_required_message()} />
            ) : null}
          </CardContent>
          <ActivityEditorFooter
            isPending={isPending}
            loginAction={loginAction}
            modeView={modeView}
            showSaveAction={Boolean(session?.user)}
          />
        </form>
      </Form>
    </Card>
  );
}
