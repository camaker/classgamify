import { getStarterActivities } from '@/activities/catalog';
import {
  ACTIVITY_LIBRARY_PAGE_SIZE,
  type ActivityLibraryStatus,
  type ActivitySourceMaterialFilter,
  type ActivityTemplateFilter,
  buildActivityLibraryDismissCreatedRouteSearch,
  buildActivityLibraryFilterRouteSearch,
  buildActivityLibraryPageRouteSearch,
  buildActivityLibraryRouteSearch,
  buildActivityLibraryValidatedSearch,
} from '@/activities/library-filters';
import type {
  ActivityLibrarySummaryMetric,
  ActivityLibrarySummaryMetricId,
} from '@/activities/library-summary';
import {
  activityLibraryActionCopy,
  activityLibraryCreatedPanelCopy,
  activityLibraryCardCopy,
  activityLibraryPageCopy,
  activityLibrarySearchCopy,
  buildActivityLibraryCardDisplayView,
  buildActivityLibraryCardViewModel,
  buildActivityLibraryPageViewModel,
  buildActivityLibrarySearchPanelView,
  buildCreatedActivityPanelContext,
  buildStarterActivityLibraryCardViewModel,
} from '@/activities/library-view';
import { ActivityPublishDialog } from '@/components/activities/activity-publish-dialog';
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
import { Input } from '@/components/ui/input';
import {
  useArchiveActivity,
  useActivities,
  useDuplicateActivity,
  useRemixActivityTemplate,
  useRestoreActivity,
} from '@/hooks/use-activities';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import {
  IconCircleCheck,
  IconCopy,
  IconDeviceGamepad2,
  IconEdit,
  IconFolder,
  IconFolderOff,
  IconLayoutGrid,
  IconPaperclip,
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

type ActivityCardData = ReturnType<typeof buildActivityLibraryCardViewModel>;

export const Route = createFileRoute('/dashboard/activities')({
  validateSearch: buildActivityLibraryValidatedSearch,
  component: DashboardActivitiesPage,
});

function DashboardActivitiesPage() {
  const navigate = useNavigate({ from: '/dashboard/activities' });
  const { created, page, q, source, status, template } = Route.useSearch();
  const pageView = useMemo(
    () =>
      buildActivityLibraryPageViewModel({
        data: undefined,
        isLoading: true,
        search: { created, page, q, source, status, template },
      }),
    [created, page, q, source, status, template]
  );
  const {
    currentPage,
    libraryStatus,
    searchQuery,
    sourceFilter,
    templateFilter,
  } = pageView.resolvedSearch;
  const { data, isError, isLoading } = useActivities({
    createdActivityId: created,
    pageIndex: currentPage - 1,
    pageSize: ACTIVITY_LIBRARY_PAGE_SIZE,
    search: pageView.resolvedSearch.normalizedSearchQuery,
    source: sourceFilter,
    status: libraryStatus,
    template: templateFilter === 'all' ? undefined : templateFilter,
  });
  const loadedPageView = useMemo(
    () =>
      buildActivityLibraryPageViewModel({
        data,
        isLoading,
        search: { created, page, q, source, status, template },
      }),
    [data, isLoading, created, page, q, source, status, template]
  );
  const activePageView = data ? loadedPageView : pageView;
  const starterActivities = getStarterActivities();

  useEffect(() => {
    if (!isLoading && currentPage > activePageView.totalPages) {
      navigateToActivityPage(activePageView.totalPages, true);
    }
  }, [activePageView.totalPages, currentPage, isLoading]);

  function updateLibraryFilters(next: {
    q?: string;
    source?: ActivitySourceMaterialFilter;
    status?: ActivityLibraryStatus;
    template?: ActivityTemplateFilter;
  }) {
    const nextQuery = next.q ?? searchQuery;
    const nextSource = next.source ?? sourceFilter;
    const nextStatus = next.status ?? libraryStatus;
    const nextTemplate = next.template ?? templateFilter;

    void navigate({
      replace: true,
      search: buildActivityLibraryFilterRouteSearch({
        created,
        current: {
          q: searchQuery,
          source: sourceFilter,
          status: libraryStatus,
          template: templateFilter,
        },
        next: {
          q: nextQuery,
          source: nextSource,
          status: nextStatus,
          template: nextTemplate,
        },
      }),
    });
  }

  function navigateToActivityPage(nextPage: number, replace = false) {
    void navigate({
      replace,
      search: buildActivityLibraryPageRouteSearch({
        current: {
          created,
          q: searchQuery,
          source: sourceFilter,
          status: libraryStatus,
          template: templateFilter,
        },
        page: nextPage,
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
      breadcrumbs={activePageView.breadcrumbs}
      title={activePageView.title}
      description={activePageView.description}
    >
      <div className="grid gap-6">
        <section className="grid gap-4 rounded-lg border bg-card p-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="min-w-0">
            <Badge variant="outline" className="rounded-md border-primary/30">
              <IconSparkles className="size-3.5" />
              {activePageView.hero.badgeLabel}
            </Badge>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">
              {activePageView.hero.title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {activePageView.hero.description}
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
          {activePageView.summaryMetrics.map((metric) => (
            <ActivitySummaryCard key={metric.id} metric={metric} />
          ))}
        </section>

        {created ? (
          <CreatedActivityPanel
            context={activePageView.createdPanelContext}
            onDismiss={() =>
              void navigate({
                replace: true,
                search: buildActivityLibraryDismissCreatedRouteSearch({
                  current: {
                    page: currentPage,
                    q: searchQuery,
                    source: sourceFilter,
                    status: libraryStatus,
                    template: templateFilter,
                  },
                }),
              })
            }
          />
        ) : null}

        <ActivityLibrarySearch
          isLoading={isLoading}
          onClearFilters={clearLibraryFilters}
          onClearSearch={() => updateLibraryFilters({ q: '' })}
          onSearch={(value) => updateLibraryFilters({ q: value })}
          onSourceChange={(value) => updateLibraryFilters({ source: value })}
          onStatusChange={(value) => updateLibraryFilters({ status: value })}
          onTemplateChange={(value) =>
            updateLibraryFilters({ template: value })
          }
          source={sourceFilter}
          status={libraryStatus}
          template={templateFilter}
          total={activePageView.totalActivities}
          value={searchQuery}
        />

        {isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {activePageView.loadErrorMessage}
          </div>
        ) : null}

        {isLoading ? (
          <section className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <Card key={index} className="min-h-56 rounded-lg" />
            ))}
          </section>
        ) : null}

        {!isLoading && activePageView.hasActivities ? (
          <>
            <section className="grid gap-4 lg:grid-cols-2">
              {activePageView.activities.map((activity) => (
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
              itemKind="activities"
              onPageChange={(nextPage) => navigateToActivityPage(nextPage)}
              pageSize={ACTIVITY_LIBRARY_PAGE_SIZE}
              total={activePageView.totalActivities}
              totalPages={activePageView.totalPages}
            />
          </>
        ) : null}

        {!isLoading &&
        !activePageView.hasActivities &&
        activePageView.resolvedSearch.hasFilters ? (
          <div className="rounded-lg border border-dashed bg-muted/20 p-6">
            <h2 className="text-lg font-semibold">
              {activePageView.emptyState.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {activePageView.emptyState.description}
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4 bg-background"
              onClick={clearLibraryFilters}
            >
              <IconX className="size-4" />
              {activePageView.emptyState.actionLabel}
            </Button>
          </div>
        ) : null}

        {!isLoading &&
        !activePageView.hasActivities &&
        !activePageView.resolvedSearch.hasFilters ? (
          <div className="grid gap-4">
            <div className="rounded-lg border border-dashed bg-muted/20 p-6">
              <h2 className="text-lg font-semibold">
                {activePageView.emptyState.title}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {activePageView.emptyState.description}
              </p>
              <Link
                to={Routes.Create}
                className={cn(buttonVariants(), 'mt-4 w-fit')}
              >
                <IconPlus className="size-4" />
                {activePageView.emptyState.actionLabel}
              </Link>
            </div>
            {activePageView.emptyState.showStarterActivities ? (
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

function CreatedActivityPanel({
  context,
  onDismiss,
}: {
  context: ReturnType<typeof buildCreatedActivityPanelContext> | undefined;
  onDismiss: () => void;
}) {
  const navigate = useNavigate();
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const panelContext =
    context ??
    buildCreatedActivityPanelContext({
      activity: undefined,
      isLoading: true,
    });
  const { activity } = panelContext;

  return (
    <>
      <section className="grid gap-4 rounded-lg border border-primary/25 bg-primary/5 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <IconCircleCheck className="size-4" />
            {activityLibraryCreatedPanelCopy.savedLabel}
          </div>
          <h2 className="mt-2 text-lg font-semibold">{panelContext.title}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {panelContext.body}
          </p>
          {panelContext.showMissingHint ? (
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {activityLibraryCreatedPanelCopy.missingHint}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
          {panelContext.showPublishAction && activity ? (
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={() => setPublishDialogOpen(true)}
            >
              <IconPlus className="size-4" />
              {activityLibraryCardCopy.actionLabels.publish}
            </Button>
          ) : null}
          {panelContext.showEditAction && activity ? (
            <Link
              to="/dashboard/activities/$activityId"
              params={{ activityId: activity.id }}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'w-full bg-background sm:w-auto'
              )}
            >
              <IconEdit className="size-4" />
              {activityLibraryCardCopy.actionLabels.edit}
            </Link>
          ) : null}
          {panelContext.showCreateAction ? (
            <Link
              to={Routes.Create}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'w-full bg-background sm:w-auto'
              )}
            >
              <IconPlus className="size-4" />
              {activityLibraryPageCopy.createActivityLabel}
            </Link>
          ) : null}
          {panelContext.showDismissAction ? (
            <Button
              type="button"
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={onDismiss}
            >
              <IconX className="size-4" />
              {activityLibraryActionCopy.dismiss}
            </Button>
          ) : null}
        </div>
      </section>
      {activity ? (
        <ActivityPublishDialog
          activity={{
            id: activity.id,
            title: activity.title,
            visibility: activity.visibility,
          }}
          open={publishDialogOpen}
          onOpenChange={setPublishDialogOpen}
          onPublished={(result) =>
            navigate({
              to: Routes.DashboardAssignments,
              search: { published: result.assignment.shareSlug },
            })
          }
        />
      ) : null}
    </>
  );
}

function ActivityLibrarySearch({
  isLoading,
  onClearFilters,
  onClearSearch,
  onSearch,
  onSourceChange,
  onStatusChange,
  onTemplateChange,
  source,
  status,
  template,
  total,
  value,
}: {
  isLoading: boolean;
  onClearFilters: () => void;
  onClearSearch: () => void;
  onSearch: (value: string) => void;
  onSourceChange: (value: ActivitySourceMaterialFilter) => void;
  onStatusChange: (value: ActivityLibraryStatus) => void;
  onTemplateChange: (value: ActivityTemplateFilter) => void;
  source: ActivitySourceMaterialFilter;
  status: ActivityLibraryStatus;
  template: ActivityTemplateFilter;
  total: number;
  value: string;
}) {
  const searchPanelView = buildActivityLibrarySearchPanelView({
    isLoading,
    search: value,
    source,
    status,
    template,
    total,
  });

  return (
    <section className="grid gap-4 rounded-lg border bg-card p-4 xl:grid-cols-[minmax(0,1fr)_13rem_13rem_auto] xl:items-end">
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
          {searchPanelView.hasSearchValue ? (
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
          {searchPanelView.templateOptions.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <div className="grid gap-2">
        <label htmlFor="activity-source-filter" className="font-medium text-sm">
          {activityLibrarySearchCopy.sourceLabel}
        </label>
        <NativeSelect
          id="activity-source-filter"
          value={source}
          onChange={(event) =>
            onSourceChange(
              event.currentTarget.value as ActivitySourceMaterialFilter
            )
          }
        >
          {searchPanelView.sourceOptions.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-3 lg:items-end">
        <div className="inline-flex rounded-lg border bg-background p-1">
          {searchPanelView.statusOptions.map((option) => {
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
          {searchPanelView.filterSummary.text}
        </p>
        {searchPanelView.filterSummary.hasFilters ? (
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
  const remixMutation = useRemixActivityTemplate();
  const restoreMutation = useRestoreActivity();
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const cardDisplayView = buildActivityLibraryCardDisplayView({
    activity,
    libraryStatus,
  });

  async function remixActivity(
    targetTemplateType: ActivityCardData['templateType']
  ) {
    const actionView = cardDisplayView.actionView.remix;
    if (actionView.gate.type === 'blocked') {
      toast.error(actionView.gate.message);
      return;
    }
    try {
      const result = await remixMutation.mutateAsync({
        activityId: activity.id,
        targetTemplateType,
      });
      toast.success(actionView.successMessage);
      navigate({
        to: '/dashboard/activities/$activityId',
        params: { activityId: result.id },
      });
    } catch {
      toast.error(actionView.failureMessage);
    }
  }

  async function duplicateActivity() {
    const actionView = cardDisplayView.actionView.duplicate;
    if (actionView.gate.type === 'blocked') {
      toast.error(actionView.gate.message);
      return;
    }
    try {
      const result = await duplicateMutation.mutateAsync({
        activityId: activity.id,
      });
      toast.success(actionView.successMessage);
      navigate({
        to: '/dashboard/activities/$activityId',
        params: { activityId: result.id },
      });
    } catch {
      toast.error(actionView.failureMessage);
    }
  }

  async function archiveActivity() {
    const actionCopy = cardDisplayView.actionView.archive;
    try {
      await archiveMutation.mutateAsync({ activityId: activity.id });
      toast.success(actionCopy.successMessage);
    } catch {
      toast.error(actionCopy.failureMessage);
    }
  }

  async function restoreActivity() {
    const actionCopy = cardDisplayView.actionView.restore;
    try {
      await restoreMutation.mutateAsync({ activityId: activity.id });
      toast.success(actionCopy.successMessage);
    } catch {
      toast.error(actionCopy.failureMessage);
    }
  }

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-md">
            {cardDisplayView.statusLabel}
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
        {cardDisplayView.sourceMaterials.hasMaterials ? (
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <IconPaperclip className="size-4 text-primary" />
              {cardDisplayView.sourceMaterials.title}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="rounded-md">
                {cardDisplayView.sourceMaterials.countLabel}
              </Badge>
              {cardDisplayView.sourceMaterials.kindBadges.map((badge) => (
                <Badge
                  key={badge.kind}
                  variant="outline"
                  className="rounded-md"
                >
                  {badge.label}
                </Badge>
              ))}
            </div>
            {cardDisplayView.sourceMaterials.extractionActions.length ? (
              <div className="mt-3 border-t pt-3">
                <p className="text-xs font-medium text-muted-foreground">
                  {cardDisplayView.sourceMaterials.extractionTitle}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {cardDisplayView.sourceMaterials.extractionActions.map(
                    (action) => (
                      <Badge
                        key={action.id}
                        variant="outline"
                        className="rounded-md bg-background"
                      >
                        <IconSparkles className="size-3" />
                        {action.label}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
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
      <ActivityPublishDialog
        activity={{
          id: activity.id,
          title: activity.title,
          visibility: activity.status,
        }}
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        onPublished={(result) =>
          navigate({
            to: Routes.DashboardAssignments,
            search: { published: result.assignment.shareSlug },
          })
        }
      />
    </Card>
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
  remix: IconSwitchHorizontal,
  sourceExtraction: IconPaperclip,
  total: IconFolder,
};
