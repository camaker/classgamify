import {
  ASSIGNMENT_LIST_PAGE_SIZE,
  type AssignmentStatusFilter,
  buildAssignmentListDismissPublishedRouteSearch,
  buildAssignmentListFilterRouteSearch,
  buildAssignmentListPageRouteSearch,
  buildAssignmentListRouteSearch,
  buildAssignmentListValidatedSearch,
} from '@/assignments/list-filters';
import {
  assignmentListActionCopy,
  buildAssignmentListCardViewModel,
  buildAssignmentListPageViewModel,
  buildStarterAssignmentListCardViewModel,
} from '@/assignments/list-view';
import {
  getStarterActivity,
  getStarterAssignments,
} from '@/activities/catalog';
import { AssignmentListCard } from '@/components/assignments/assignment-list-card';
import { AssignmentListFilters } from '@/components/assignments/assignment-list-filters';
import { AssignmentListSummaryCard } from '@/components/assignments/assignment-list-summary-card';
import { PublishedAssignmentPanel } from '@/components/assignments/published-assignment-panel';
import { DashboardPagination } from '@/components/dashboard/dashboard-pagination';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAssignments } from '@/hooks/use-assignments';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { IconListCheck, IconX } from '@tabler/icons-react';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo } from 'react';

export const Route = createFileRoute('/dashboard/assignments')({
  validateSearch: buildAssignmentListValidatedSearch,
  component: DashboardAssignmentsPage,
});

function DashboardAssignmentsPage() {
  const navigate = useNavigate({ from: '/dashboard/assignments' });
  const { page, published, q, status } = Route.useSearch();
  const pageView = useMemo(
    () =>
      buildAssignmentListPageViewModel({
        data: undefined,
        isLoading: true,
        search: { page, published, q, status },
      }),
    [page, published, q, status]
  );
  const { currentPage, filteredStatus, searchQuery, statusFilter } =
    pageView.resolvedSearch;
  const { data, isError, isLoading } = useAssignments({
    pageIndex: currentPage - 1,
    pageSize: ASSIGNMENT_LIST_PAGE_SIZE,
    publishedShareSlug: published,
    search: pageView.resolvedSearch.normalizedSearchQuery,
    status: filteredStatus,
  });
  const loadedPageView = useMemo(
    () =>
      buildAssignmentListPageViewModel({
        data,
        isLoading,
        search: { page, published, q, status },
      }),
    [data, isLoading, page, published, q, status]
  );
  const activePageView = data ? loadedPageView : pageView;
  const starterAssignments = getStarterAssignments();

  useEffect(() => {
    if (!isLoading && currentPage > activePageView.totalPages) {
      navigateToAssignmentPage(activePageView.totalPages, true);
    }
  }, [activePageView.totalPages, currentPage, isLoading]);

  function updateFilters(next: {
    q?: string;
    status?: AssignmentStatusFilter;
  }) {
    const nextQuery = next.q ?? searchQuery;
    const nextStatus = next.status ?? statusFilter;

    void navigate({
      replace: true,
      search: buildAssignmentListFilterRouteSearch({
        published,
        current: {
          q: searchQuery,
          status: statusFilter,
        },
        next: {
          q: nextQuery,
          status: nextStatus,
        },
      }),
    });
  }

  function navigateToAssignmentPage(nextPage: number, replace = false) {
    void navigate({
      replace,
      search: buildAssignmentListPageRouteSearch({
        current: {
          published,
          q: searchQuery,
          status: statusFilter,
        },
        page: nextPage,
      }),
    });
  }

  function clearFilters() {
    void navigate({
      replace: true,
      search: buildAssignmentListRouteSearch({ published }),
    });
  }

  return (
    <DashboardLayout
      breadcrumbs={activePageView.breadcrumbs}
      title={activePageView.title}
      description={activePageView.description}
    >
      <div className="grid gap-6">
        <section className="grid gap-4 md:grid-cols-4">
          {activePageView.summaryMetrics.map((metric) => (
            <AssignmentListSummaryCard key={metric.id} metric={metric} />
          ))}
        </section>

        {published ? (
          <PublishedAssignmentPanel
            context={activePageView.publishedPanelContext}
            onDismiss={() =>
              void navigate({
                replace: true,
                search: buildAssignmentListDismissPublishedRouteSearch({
                  current: {
                    page: currentPage,
                    q: searchQuery,
                    status: statusFilter,
                  },
                }),
              })
            }
            shareSlug={published}
          />
        ) : null}

        <AssignmentListFilters
          isLoading={isLoading}
          onClear={clearFilters}
          onSearch={(value) => updateFilters({ q: value })}
          onStatusChange={(value) => updateFilters({ status: value })}
          search={searchQuery}
          status={statusFilter}
          total={activePageView.totalAssignments}
        />

        {isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {activePageView.loadErrorMessage}
          </div>
        ) : null}

        {isLoading ? (
          <section className="grid gap-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <Card key={index} className="min-h-48 rounded-lg" />
            ))}
          </section>
        ) : null}

        {!isLoading && activePageView.hasAssignments ? (
          <>
            <section className="grid gap-4">
              {activePageView.assignments.map((item) => (
                <AssignmentListCard
                  key={item.assignment.id}
                  assignment={buildAssignmentListCardViewModel(item)}
                />
              ))}
            </section>
            <DashboardPagination
              currentPage={currentPage}
              isLoading={isLoading}
              itemKind="assignments"
              onPageChange={(nextPage) => navigateToAssignmentPage(nextPage)}
              pageSize={ASSIGNMENT_LIST_PAGE_SIZE}
              total={activePageView.totalAssignments}
              totalPages={activePageView.totalPages}
            />
          </>
        ) : null}

        {!isLoading &&
        !activePageView.hasAssignments &&
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
              onClick={clearFilters}
            >
              <IconX className="size-4" />
              {assignmentListActionCopy.clearFilters}
            </Button>
          </div>
        ) : null}

        {!isLoading &&
        !activePageView.hasAssignments &&
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
                to={Routes.DashboardActivities}
                className={cn(buttonVariants(), 'mt-4 w-fit')}
              >
                <IconListCheck className="size-4" />
                {assignmentListActionCopy.openActivityLibrary}
              </Link>
            </div>
            {activePageView.emptyState.showStarterAssignments ? (
              <section className="grid gap-4">
                {starterAssignments.map((assignment) => {
                  const activity = getStarterActivity(assignment.activityId);
                  return (
                    <AssignmentListCard
                      key={assignment.id}
                      assignment={buildStarterAssignmentListCardViewModel({
                        activity,
                        assignment,
                      })}
                    />
                  );
                })}
              </section>
            ) : null}
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
