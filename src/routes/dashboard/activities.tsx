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
import {
  activityLibraryPageCopy,
  buildActivityLibraryCardViewModel,
  buildActivityLibraryRouteState,
  buildStarterActivityLibraryCardViewModel,
} from '@/activities/library-view';
import { ActivityLibraryCard } from '@/components/activities/activity-library-card';
import { ActivityLibrarySearch } from '@/components/activities/activity-library-search';
import { ActivityLibraryScopePanel } from '@/components/activities/activity-library-scope-panel';
import { ActivityLibrarySummaryCard } from '@/components/activities/activity-library-summary-card';
import { CreatedActivityPanel } from '@/components/activities/created-activity-panel';
import { DashboardPagination } from '@/components/dashboard/dashboard-pagination';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useActivities } from '@/hooks/use-activities';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { IconPlus, IconSparkles, IconX } from '@tabler/icons-react';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo } from 'react';

export const Route = createFileRoute('/dashboard/activities')({
  validateSearch: buildActivityLibraryValidatedSearch,
  component: DashboardActivitiesPage,
});

function DashboardActivitiesPage() {
  const navigate = useNavigate({ from: '/dashboard/activities' });
  const { created, createdFrom, page, q, source, status, template } =
    Route.useSearch();
  const search = useMemo(
    () => ({ created, createdFrom, page, q, source, status, template }),
    [created, createdFrom, page, q, source, status, template]
  );
  const initialRouteState = useMemo(
    () =>
      buildActivityLibraryRouteState({
        data: undefined,
        isError: false,
        isLoading: true,
        search,
      }),
    [search]
  );
  const {
    currentPage,
    libraryStatus,
    normalizedSearchQuery,
    searchQuery,
    sourceFilter,
    templateFilter,
  } = initialRouteState.pageView.resolvedSearch;
  const { data, isError, isLoading } = useActivities({
    createdActivityId: created,
    pageIndex: currentPage - 1,
    pageSize: ACTIVITY_LIBRARY_PAGE_SIZE,
    search: normalizedSearchQuery,
    source: sourceFilter,
    status: libraryStatus,
    template: templateFilter === 'all' ? undefined : templateFilter,
  });
  const routeState = useMemo(
    () =>
      buildActivityLibraryRouteState({
        data,
        isError,
        isLoading,
        search,
      }),
    [data, isError, isLoading, search]
  );
  const activePageView = routeState.pageView;

  useEffect(() => {
    if (
      routeState.status !== 'loading' &&
      currentPage > activePageView.totalPages
    ) {
      navigateToActivityPage(activePageView.totalPages, true);
    }
  }, [activePageView.totalPages, currentPage, routeState.status]);

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
        createdFrom,
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
          createdFrom,
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
      search: buildActivityLibraryRouteSearch({ created, createdFrom }),
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
            <ActivityLibrarySummaryCard key={metric.id} metric={metric} />
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
          summary={data?.summary}
          statusSummary={data?.statusSummary}
          template={templateFilter}
          total={activePageView.totalActivities}
          value={searchQuery}
        />

        {routeState.status !== 'loading' ? (
          <ActivityLibraryScopePanel view={activePageView.scopeView} />
        ) : null}

        {routeState.showLoadError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {activePageView.loadErrorMessage}
          </div>
        ) : null}

        {routeState.status === 'loading' ? (
          <section className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <Card key={index} className="min-h-56 rounded-lg" />
            ))}
          </section>
        ) : null}

        {routeState.status === 'ready' ? (
          <>
            <section className="grid gap-4 lg:grid-cols-2">
              {activePageView.activities.map((activity) => (
                <ActivityLibraryCard
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

        {routeState.status === 'empty-filtered' ? (
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

        {routeState.status === 'empty-starter' ? (
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
                {activePageView.starterPreview.activities.map((activity) => (
                  <ActivityLibraryCard
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
