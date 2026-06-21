import { activityTemplates, starterActivities } from '@/activities/catalog';
import {
  type ActivityDerivativeAction,
  buildActivityDerivativeActionGate,
  getActivityLifecycleActionCopy,
} from '@/activities/lifecycle';
import {
  type ActivityLibraryStatus,
  type ActivityTemplateFilter,
  buildActivityLibraryRouteSearch,
  isActivityTemplateType,
  normalizeActivityLibrarySearch,
  parseActivityLibraryStatus,
  parseActivityTemplateFilter,
} from '@/activities/library-filters';
import {
  buildActivityLibraryFilterSummary,
  buildActivityLibrarySummaryMetrics,
  type ActivityLibrarySummaryMetric,
  type ActivityLibrarySummaryMetricId,
} from '@/activities/library-summary';
import {
  activityLibraryHeroCopy,
  activityLibraryCardCopy,
  activityLibraryPageCopy,
  activityLibrarySearchCopy,
  buildActivityLibraryCardDisplayView,
  buildActivityLibraryCardViewModel,
  buildActivityLibraryEmptyStateView,
  buildStarterActivityLibraryCardViewModel,
} from '@/activities/library-view';
import {
  assignmentPublishDialogCopy,
  buildAssignmentPublishDraft,
  buildAssignmentPublishDraftDefaults,
  buildAssignmentPublishDialogState,
  buildAssignmentPublishPreviewFromDraft,
  buildAssignmentPublishInputFromDraft,
  buildAssignmentPublishToggleViews,
  formatAssignmentDateTimeLocal,
  validateAssignmentPublishDraft,
} from '@/assignments/publish-input';
import { AssignmentSettingsSummary } from '@/components/assignments/assignment-settings-summary';
import { DashboardPagination } from '@/components/dashboard/dashboard-pagination';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  useArchiveActivity,
  useActivities,
  useDuplicateActivity,
  useRemixActivityTemplate,
  useRestoreActivity,
} from '@/hooks/use-activities';
import { usePublishAssignment } from '@/hooks/use-assignments';
import { parseDashboardPageSearch } from '@/lib/dashboard-pagination';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import {
  IconCopy,
  IconDeviceGamepad2,
  IconEdit,
  IconFolder,
  IconFolderOff,
  IconLayoutGrid,
  IconPlus,
  IconRotateClockwise,
  IconSearch,
  IconSparkles,
  IconSwitchHorizontal,
  IconX,
} from '@tabler/icons-react';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const ACTIVITY_LIBRARY_PAGE_SIZE = 12;

type ActivityCardData = ReturnType<typeof buildActivityLibraryCardViewModel>;

export const Route = createFileRoute('/dashboard/activities')({
  validateSearch: (search: Record<string, unknown>) => ({
    created: typeof search.created === 'string' ? search.created : undefined,
    page: parseDashboardPageSearch(search.page),
    q: typeof search.q === 'string' ? search.q : undefined,
    status: parseActivityLibraryStatus(search.status),
    template: parseActivityTemplateFilter(search.template),
  }),
  component: DashboardActivitiesPage,
});

function DashboardActivitiesPage() {
  const navigate = useNavigate({ from: '/dashboard/activities' });
  const { created, page, q, status, template } = Route.useSearch();
  const searchQuery = q ?? '';
  const libraryStatus = status ?? 'active';
  const templateFilter: ActivityTemplateFilter = template ?? 'all';
  const currentPage = page ?? 1;
  const normalizedSearchQuery = normalizeActivityLibrarySearch(searchQuery);
  const { data, isError, isLoading } = useActivities({
    pageIndex: currentPage - 1,
    pageSize: ACTIVITY_LIBRARY_PAGE_SIZE,
    search: normalizedSearchQuery,
    status: libraryStatus,
    template,
  });
  const activities = data?.items ?? [];
  const totalActivities = data?.total ?? 0;
  const totalPages = Math.max(
    1,
    Math.ceil(totalActivities / ACTIVITY_LIBRARY_PAGE_SIZE)
  );
  const hasActivities = activities.length > 0;
  const hasFilters =
    Boolean(normalizedSearchQuery) ||
    templateFilter !== 'all' ||
    libraryStatus !== 'active';
  const emptyStateView = buildActivityLibraryEmptyStateView({
    search: normalizedSearchQuery,
    status: libraryStatus,
    template: templateFilter,
  });
  const summaryMetrics = buildActivityLibrarySummaryMetrics({
    hasFilters,
    summary: data?.summary,
    totalActivities,
  });

  useEffect(() => {
    if (!isLoading && currentPage > totalPages) {
      navigateToActivityPage(totalPages, true);
    }
  }, [currentPage, isLoading, totalActivities, totalPages]);

  function updateLibraryFilters(next: {
    q?: string;
    status?: ActivityLibraryStatus;
    template?: ActivityTemplateFilter;
  }) {
    const nextQuery = next.q ?? searchQuery;
    const nextStatus = next.status ?? libraryStatus;
    const nextTemplate = next.template ?? templateFilter;

    void navigate({
      replace: true,
      search: buildActivityLibraryRouteSearch({
        created,
        page: undefined,
        q: nextQuery.trim() ? nextQuery : undefined,
        status: nextStatus,
        template: nextTemplate,
      }),
    });
  }

  function navigateToActivityPage(nextPage: number, replace = false) {
    const boundedPage = Math.max(1, nextPage);

    void navigate({
      replace,
      search: buildActivityLibraryRouteSearch({
        created,
        page: boundedPage === 1 ? undefined : boundedPage,
        q: searchQuery.trim() ? searchQuery : undefined,
        status: libraryStatus,
        template: templateFilter,
      }),
    });
  }

  function clearLibraryFilters() {
    void navigate({
      replace: true,
      search: buildActivityLibraryRouteSearch({ created }),
    });
  }

  return (
    <DashboardLayout
      breadcrumbs={[
        {
          label: activityLibraryPageCopy.breadcrumbDashboard,
          href: Routes.Dashboard,
        },
        {
          label: activityLibraryPageCopy.breadcrumbCurrent,
          isCurrentPage: true,
        },
      ]}
      title={activityLibraryPageCopy.title}
      description={activityLibraryPageCopy.description}
    >
      <div className="grid gap-6">
        <section className="grid gap-4 rounded-lg border bg-card p-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="min-w-0">
            <Badge variant="outline" className="rounded-md border-primary/30">
              <IconSparkles className="size-3.5" />
              {activityLibraryHeroCopy.badgeLabel}
            </Badge>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">
              {activityLibraryHeroCopy.title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {activityLibraryHeroCopy.description}
            </p>
          </div>
          <Link
            to={Routes.Create}
            className={cn(buttonVariants(), 'h-fit w-full lg:w-auto')}
          >
            <IconPlus className="size-4" />
            {activityLibraryPageCopy.createActivityLabel}
          </Link>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {summaryMetrics.map((metric) => (
            <ActivitySummaryCard key={metric.id} metric={metric} />
          ))}
        </section>

        <ActivityLibrarySearch
          isLoading={isLoading}
          onClearFilters={clearLibraryFilters}
          onClearSearch={() => updateLibraryFilters({ q: '' })}
          onSearch={(value) => updateLibraryFilters({ q: value })}
          onStatusChange={(value) => updateLibraryFilters({ status: value })}
          onTemplateChange={(value) =>
            updateLibraryFilters({ template: value })
          }
          status={libraryStatus}
          template={templateFilter}
          total={totalActivities}
          value={searchQuery}
        />

        {isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {activityLibraryPageCopy.loadErrorMessage}
          </div>
        ) : null}

        {isLoading ? (
          <section className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <Card key={index} className="min-h-56 rounded-lg" />
            ))}
          </section>
        ) : null}

        {!isLoading && hasActivities ? (
          <>
            <section className="grid gap-4 lg:grid-cols-2">
              {activities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={buildActivityLibraryCardViewModel(activity)}
                  libraryStatus={libraryStatus}
                />
              ))}
            </section>
            <DashboardPagination
              currentPage={currentPage}
              isLoading={isLoading}
              itemLabel="activities"
              onPageChange={(nextPage) => navigateToActivityPage(nextPage)}
              pageSize={ACTIVITY_LIBRARY_PAGE_SIZE}
              total={totalActivities}
              totalPages={totalPages}
            />
          </>
        ) : null}

        {!isLoading && !hasActivities && hasFilters ? (
          <div className="rounded-lg border border-dashed bg-muted/20 p-6">
            <h2 className="text-lg font-semibold">{emptyStateView.title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {emptyStateView.description}
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4 bg-background"
              onClick={clearLibraryFilters}
            >
              <IconX className="size-4" />
              {emptyStateView.actionLabel}
            </Button>
          </div>
        ) : null}

        {!isLoading && !hasActivities && !hasFilters ? (
          <div className="grid gap-4">
            <div className="rounded-lg border border-dashed bg-muted/20 p-6">
              <h2 className="text-lg font-semibold">{emptyStateView.title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {emptyStateView.description}
              </p>
              <Link
                to={Routes.Create}
                className={cn(buttonVariants(), 'mt-4 w-fit')}
              >
                <IconPlus className="size-4" />
                {emptyStateView.actionLabel}
              </Link>
            </div>
            {emptyStateView.showStarterActivities ? (
              <section className="grid gap-4 lg:grid-cols-2">
                {starterActivities.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={buildStarterActivityLibraryCardViewModel(
                      activity
                    )}
                    libraryStatus="active"
                  />
                ))}
              </section>
            ) : null}
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}

function ActivityLibrarySearch({
  isLoading,
  onClearFilters,
  onClearSearch,
  onSearch,
  onStatusChange,
  onTemplateChange,
  status,
  template,
  total,
  value,
}: {
  isLoading: boolean;
  onClearFilters: () => void;
  onClearSearch: () => void;
  onSearch: (value: string) => void;
  onStatusChange: (value: ActivityLibraryStatus) => void;
  onTemplateChange: (value: ActivityTemplateFilter) => void;
  status: ActivityLibraryStatus;
  template: ActivityTemplateFilter;
  total: number;
  value: string;
}) {
  const normalizedValue = normalizeActivityLibrarySearch(value);
  const filterSummary = buildActivityLibraryFilterSummary({
    isLoading,
    search: normalizedValue,
    status,
    template,
    total,
  });

  return (
    <section className="grid gap-4 rounded-lg border bg-card p-4 lg:grid-cols-[minmax(0,1fr)_13rem_auto] lg:items-end">
      <div className="grid gap-2">
        <label
          htmlFor="activity-library-search"
          className="font-medium text-sm"
        >
          {activityLibrarySearchCopy.label}
        </label>
        <div className="relative max-w-xl">
          <IconSearch className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
          <Input
            id="activity-library-search"
            value={value}
            placeholder={activityLibrarySearchCopy.placeholder}
            className="pl-9 pr-9"
            onChange={(event) => onSearch(event.currentTarget.value)}
          />
          {value ? (
            <button
              type="button"
              aria-label={activityLibrarySearchCopy.clearSearchLabel}
              className="-translate-y-1/2 absolute top-1/2 right-3 text-muted-foreground transition-colors hover:text-foreground"
              onClick={onClearSearch}
            >
              <IconX className="size-4" />
            </button>
          ) : null}
        </div>
      </div>
      <div className="grid gap-2">
        <label
          htmlFor="activity-template-filter"
          className="font-medium text-sm"
        >
          {activityLibrarySearchCopy.templateLabel}
        </label>
        <NativeSelect
          id="activity-template-filter"
          value={template}
          onChange={(event) =>
            onTemplateChange(
              event.currentTarget.value as ActivityTemplateFilter
            )
          }
        >
          <NativeSelectOption value="all">
            {activityLibrarySearchCopy.templatePlaceholder}
          </NativeSelectOption>
          {activityTemplates.map((option) => (
            <NativeSelectOption key={option.type} value={option.type}>
              {option.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-3 lg:items-end">
        <div className="inline-flex rounded-lg border bg-background p-1">
          {activityLibrarySearchCopy.statusOptions.map((option) => {
            const Icon = option.value === 'active' ? IconFolder : IconFolderOff;

            return (
              <Button
                key={option.value}
                type="button"
                variant={status === option.value ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onStatusChange(option.value)}
              >
                <Icon className="size-4" />
                {option.label}
              </Button>
            );
          })}
        </div>
        <p className="text-sm text-muted-foreground lg:text-right">
          {filterSummary.text}
        </p>
        {filterSummary.hasFilters ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full bg-background lg:w-auto"
            onClick={onClearFilters}
          >
            <IconX className="size-4" />
            {activityLibrarySearchCopy.clearFiltersLabel}
          </Button>
        ) : null}
      </div>
    </section>
  );
}

function ActivityCard({
  activity,
  libraryStatus,
}: {
  activity: ActivityCardData;
  libraryStatus: ActivityLibraryStatus;
}) {
  const navigate = useNavigate();
  const archiveMutation = useArchiveActivity();
  const duplicateMutation = useDuplicateActivity();
  const publishMutation = usePublishAssignment();
  const remixMutation = useRemixActivityTemplate();
  const restoreMutation = useRestoreActivity();
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const publishDraftDefaults = useMemo(
    () =>
      buildAssignmentPublishDraftDefaults({
        activityId: activity.id,
        title: activity.title,
      }),
    [activity.id, activity.title]
  );
  const [assignmentTitle, setAssignmentTitle] = useState(
    publishDraftDefaults.title
  );
  const [assignmentInstructions, setAssignmentInstructions] = useState(
    publishDraftDefaults.instructions
  );
  const [collectStudentName, setCollectStudentName] = useState(
    publishDraftDefaults.collectStudentName
  );
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(
    publishDraftDefaults.showCorrectAnswers
  );
  const [shuffleItems, setShuffleItems] = useState(
    publishDraftDefaults.shuffleItems
  );
  const [maxAttempts, setMaxAttempts] = useState(
    publishDraftDefaults.maxAttempts
  );
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(
    publishDraftDefaults.timeLimitMinutes
  );
  const [expiresAtLocal, setExpiresAtLocal] = useState(
    publishDraftDefaults.expiresAtLocal
  );
  const publishToggleViews = buildAssignmentPublishToggleViews({
    collectStudentName,
    showCorrectAnswers,
    shuffleItems,
  });
  const publishToggleSetters = {
    collectStudentName: setCollectStudentName,
    showCorrectAnswers: setShowCorrectAnswers,
    shuffleItems: setShuffleItems,
  };
  const publishDraft = buildAssignmentPublishDraft({
    defaults: publishDraftDefaults,
    values: {
      collectStudentName,
      expiresAtLocal,
      instructions: assignmentInstructions,
      maxAttempts,
      showCorrectAnswers,
      shuffleItems,
      timeLimitMinutes,
      title: assignmentTitle,
    },
  });
  const publishPreview = buildAssignmentPublishPreviewFromDraft(publishDraft);
  const publishValidation = validateAssignmentPublishDraft(publishDraft);
  const publishDialogState = buildAssignmentPublishDialogState({
    isPublishing: publishMutation.isPending,
    validation: publishValidation,
  });
  const cardDisplayView = buildActivityLibraryCardDisplayView({
    activity,
    libraryStatus,
  });

  function getDerivativeActionGate(action: ActivityDerivativeAction) {
    return buildActivityDerivativeActionGate({
      action,
      visibility: activity.status,
    });
  }

  async function publishActivity() {
    const actionGate = getDerivativeActionGate('publish');
    const actionCopy = getActivityLifecycleActionCopy('publish');
    if (actionGate.type === 'blocked') {
      toast.error(actionGate.message);
      return;
    }
    const draftResult = buildAssignmentPublishInputFromDraft(publishDraft);
    if (!draftResult.ok) {
      toast.error(draftResult.message);
      return;
    }

    try {
      const result = await publishMutation.mutateAsync(draftResult.input);
      toast.success(actionCopy.successMessage);
      setPublishDialogOpen(false);
      navigate({
        to: Routes.DashboardAssignments,
        search: { published: result.assignment.shareSlug },
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : actionCopy.failureMessage
      );
    }
  }

  async function remixActivity(
    targetTemplateType: ActivityCardData['templateType']
  ) {
    const actionGate = getDerivativeActionGate('remix');
    const actionCopy = getActivityLifecycleActionCopy('remix');
    if (actionGate.type === 'blocked') {
      toast.error(actionGate.message);
      return;
    }
    try {
      const result = await remixMutation.mutateAsync({
        activityId: activity.id,
        targetTemplateType,
      });
      toast.success(actionCopy.successMessage);
      navigate({
        to: '/dashboard/activities/$activityId',
        params: { activityId: result.id },
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : actionCopy.failureMessage
      );
    }
  }

  async function duplicateActivity() {
    const actionGate = getDerivativeActionGate('duplicate');
    const actionCopy = getActivityLifecycleActionCopy('duplicate');
    if (actionGate.type === 'blocked') {
      toast.error(actionGate.message);
      return;
    }
    try {
      const result = await duplicateMutation.mutateAsync({
        activityId: activity.id,
      });
      toast.success(actionCopy.successMessage);
      navigate({
        to: '/dashboard/activities/$activityId',
        params: { activityId: result.id },
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : actionCopy.failureMessage
      );
    }
  }

  async function archiveActivity() {
    const actionCopy = getActivityLifecycleActionCopy('archive');
    try {
      await archiveMutation.mutateAsync({ activityId: activity.id });
      toast.success(actionCopy.successMessage);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : actionCopy.failureMessage
      );
    }
  }

  async function restoreActivity() {
    const actionCopy = getActivityLifecycleActionCopy('restore');
    try {
      await restoreMutation.mutateAsync({ activityId: activity.id });
      toast.success(actionCopy.successMessage);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : actionCopy.failureMessage
      );
    }
  }

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-md">
            {activity.status}
          </Badge>
          <Badge variant="outline" className="rounded-md">
            <IconDeviceGamepad2 className="size-3.5" />
            {cardDisplayView.templateName}
          </Badge>
        </div>
        <CardTitle>
          <h2 className="text-lg font-semibold">{activity.title}</h2>
        </CardTitle>
        <CardDescription>
          <p>{activity.description}</p>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {cardDisplayView.stats.map((stat) => (
            <ActivityStat
              key={stat.key}
              label={stat.label}
              value={stat.value}
            />
          ))}
        </div>
        <div className="rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <IconLayoutGrid className="size-4 text-primary" />
            {activityLibraryCardCopy.compatibleTemplatesLabel}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {cardDisplayView.compatibility.readyTemplateOptions.map(
              (option) => (
                <Badge
                  key={option.template}
                  variant={option.isCurrent ? 'secondary' : 'outline'}
                  className="rounded-md"
                >
                  {option.shortName}
                </Badge>
              )
            )}
          </div>
          {cardDisplayView.compatibility.remixHint ? (
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              {cardDisplayView.compatibility.remixHint}
            </p>
          ) : null}
          {cardDisplayView.actionState.showRemixActions ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {cardDisplayView.compatibility.remixActionOptions.map(
                (option) => (
                  <Button
                    key={option.template}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-background"
                    disabled={remixMutation.isPending}
                    onClick={() => remixActivity(option.template)}
                  >
                    <IconSwitchHorizontal className="size-4" />
                    {option.actionLabel}
                  </Button>
                )
              )}
            </div>
          ) : null}
          {cardDisplayView.compatibility.lockedTemplateDiagnostics.length ? (
            <div className="mt-3 grid gap-1.5">
              {cardDisplayView.compatibility.lockedTemplateDiagnostics.map(
                (diagnosis) => (
                  <p
                    key={diagnosis}
                    className="text-xs leading-5 text-muted-foreground"
                  >
                    {diagnosis}
                  </p>
                )
              )}
            </div>
          ) : null}
        </div>
        {cardDisplayView.actionState.showPersistedActions ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            {cardDisplayView.actionState.showEditAction ? (
              <Link
                to="/dashboard/activities/$activityId"
                params={{ activityId: activity.id }}
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'w-full bg-background sm:w-fit'
                )}
              >
                <IconEdit className="size-4" />
                {activityLibraryCardCopy.actionLabels.edit}
              </Link>
            ) : null}
            {cardDisplayView.actionState.showDerivativeActions ? (
              <Button
                type="button"
                variant="outline"
                className="w-full bg-background sm:w-fit"
                disabled={duplicateMutation.isPending}
                onClick={duplicateActivity}
              >
                <IconCopy className="size-4" />
                {activityLibraryCardCopy.actionLabels.duplicate}
              </Button>
            ) : null}
            {cardDisplayView.actionState.showArchiveAction ||
            cardDisplayView.actionState.showPublishAction ? (
              <>
                {cardDisplayView.actionState.showArchiveAction ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-background sm:w-fit"
                    disabled={archiveMutation.isPending}
                    onClick={archiveActivity}
                  >
                    <IconFolderOff className="size-4" />
                    {activityLibraryCardCopy.actionLabels.archive}
                  </Button>
                ) : null}
                {cardDisplayView.actionState.showPublishAction ? (
                  <Button
                    type="button"
                    className="w-full sm:w-fit"
                    disabled={publishMutation.isPending}
                    onClick={() => setPublishDialogOpen(true)}
                  >
                    <IconPlus className="size-4" />
                    {activityLibraryCardCopy.actionLabels.publish}
                  </Button>
                ) : null}
              </>
            ) : (
              <>
                {cardDisplayView.actionState.showRestoreRequiredMessage ? (
                  <p className="text-sm text-muted-foreground sm:mr-auto">
                    {activityLibraryCardCopy.restoreRequiredMessage}
                  </p>
                ) : null}
                {cardDisplayView.actionState.showRestoreAction ? (
                  <Button
                    type="button"
                    className="w-full sm:w-fit"
                    disabled={restoreMutation.isPending}
                    onClick={restoreActivity}
                  >
                    <IconRotateClockwise className="size-4" />
                    {activityLibraryCardCopy.actionLabels.restore}
                  </Button>
                ) : null}
              </>
            )}
          </div>
        ) : null}
      </CardContent>
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{assignmentPublishDialogCopy.title}</DialogTitle>
            <DialogDescription>
              {assignmentPublishDialogCopy.description}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor={`assignment-title-${activity.id}`}>
                {assignmentPublishDialogCopy.titleLabel}
              </label>
              <Input
                id={`assignment-title-${activity.id}`}
                value={assignmentTitle}
                onChange={(event) =>
                  setAssignmentTitle(event.currentTarget.value)
                }
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor={`assignment-instructions-${activity.id}`}>
                {assignmentPublishDialogCopy.instructionsLabel}
              </label>
              <Textarea
                id={`assignment-instructions-${activity.id}`}
                rows={3}
                maxLength={500}
                value={assignmentInstructions}
                placeholder={
                  assignmentPublishDialogCopy.instructionsPlaceholder
                }
                onChange={(event) =>
                  setAssignmentInstructions(event.currentTarget.value)
                }
              />
            </div>
            <div className="grid gap-3 rounded-lg border bg-muted/20 p-3">
              {publishToggleViews.map((option) => (
                <PublishSetting
                  key={option.key}
                  checked={option.checked}
                  description={option.description}
                  id={`${option.key}-${activity.id}`}
                  label={option.label}
                  onCheckedChange={publishToggleSetters[option.key]}
                />
              ))}
            </div>
            <div className="grid gap-2">
              <label htmlFor={`max-attempts-${activity.id}`}>
                {assignmentPublishDialogCopy.maxAttemptsLabel}
              </label>
              <Input
                id={`max-attempts-${activity.id}`}
                type="number"
                min={1}
                max={10}
                value={maxAttempts}
                onChange={(event) => setMaxAttempts(event.currentTarget.value)}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor={`time-limit-${activity.id}`}>
                {assignmentPublishDialogCopy.timeLimitLabel}
              </label>
              <Input
                id={`time-limit-${activity.id}`}
                type="number"
                min={1}
                max={180}
                value={timeLimitMinutes}
                placeholder={assignmentPublishDialogCopy.timeLimitPlaceholder}
                onChange={(event) =>
                  setTimeLimitMinutes(event.currentTarget.value)
                }
              />
              <p className="text-xs leading-5 text-muted-foreground">
                {assignmentPublishDialogCopy.timeLimitHelp}
              </p>
            </div>
            <div className="grid gap-2">
              <label htmlFor={`expires-at-${activity.id}`}>
                {assignmentPublishDialogCopy.closeAfterLabel}
              </label>
              <Input
                id={`expires-at-${activity.id}`}
                type="datetime-local"
                min={formatAssignmentDateTimeLocal(
                  new Date(Date.now() + 60 * 1000)
                )}
                value={expiresAtLocal}
                onChange={(event) =>
                  setExpiresAtLocal(event.currentTarget.value)
                }
              />
              <p className="text-xs leading-5 text-muted-foreground">
                {assignmentPublishDialogCopy.closeAfterHelp}
              </p>
            </div>
            <div className="grid gap-2">
              <p className="font-medium text-sm">
                {assignmentPublishDialogCopy.previewLabel}
              </p>
              <AssignmentSettingsSummary
                expiresAt={publishPreview.expiresAt}
                settings={publishPreview.settings}
              />
              {publishDialogState.errorMessage ? (
                <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-destructive text-sm">
                  {publishDialogState.errorMessage}
                </p>
              ) : null}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPublishDialogOpen(false)}
            >
              {assignmentPublishDialogCopy.cancelLabel}
            </Button>
            <Button
              type="button"
              disabled={publishDialogState.publishDisabled}
              onClick={publishActivity}
            >
              <IconPlus className="size-4" />
              {assignmentPublishDialogCopy.publishLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function PublishSetting({
  checked,
  description,
  id,
  label,
  onCheckedChange,
}: {
  checked: boolean;
  description: string;
  id: string;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <label htmlFor={id} className="font-medium text-sm">
          {label}
        </label>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function ActivityStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function ActivitySummaryCard({
  metric,
}: {
  metric: ActivityLibrarySummaryMetric;
}) {
  const Icon = activitySummaryMetricIcons[metric.id];

  return (
    <Card className="rounded-lg">
      <CardContent className="p-4">
        <Icon className="size-5 text-primary" />
        <p className="mt-4 text-2xl font-semibold">{metric.value}</p>
        <p className="text-sm text-muted-foreground">{metric.label}</p>
      </CardContent>
    </Card>
  );
}

const activitySummaryMetricIcons: Record<
  ActivityLibrarySummaryMetricId,
  typeof IconFolder
> = {
  coverage: IconDeviceGamepad2,
  readyModes: IconLayoutGrid,
  remix: IconSwitchHorizontal,
  total: IconFolder,
};
