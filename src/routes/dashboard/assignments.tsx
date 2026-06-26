import {
  ASSIGNMENT_LIST_PAGE_SIZE,
  type AssignmentStatusFilter,
  buildAssignmentListDismissPublishedRouteSearch,
  buildAssignmentListFilterRouteSearch,
  buildAssignmentListPageRouteSearch,
  buildAssignmentListRouteSearch,
  buildAssignmentListValidatedSearch,
} from '@/assignments/list-filters';
import type {
  AssignmentListSummaryMetric,
  AssignmentListSummaryMetricId,
} from '@/assignments/list-summary';
import {
  assignmentListActionCopy,
  assignmentListPublishedPanelCopy,
  buildAssignmentListCardViewModel,
  buildAssignmentListPageViewModel,
  buildStarterAssignmentListCardViewModel,
} from '@/assignments/list-view';
import {
  getStarterActivity,
  getStarterAssignments,
} from '@/activities/catalog';
import { AssignmentListFilters } from '@/components/assignments/assignment-list-filters';
import { AssignmentSettingsSummary } from '@/components/assignments/assignment-settings-summary';
import { CopyAssignmentShareLinkButton } from '@/components/assignments/copy-assignment-share-link-button';
import { DashboardPagination } from '@/components/dashboard/dashboard-pagination';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  useAssignments,
  useUpdateAssignmentStatus,
} from '@/hooks/use-assignments';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import {
  IconChartBar,
  IconCircleCheck,
  IconListCheck,
  IconLock,
  IconLockOpen,
  IconPlayerPlay,
  IconShare3,
  IconUsers,
  IconX,
} from '@tabler/icons-react';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';

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
            <SummaryCard key={metric.id} metric={metric} />
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
                <AssignmentCard
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
                    <AssignmentCard
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

function PublishedAssignmentPanel({
  context,
  onDismiss,
  shareSlug,
}: {
  context: ReturnType<typeof buildPublishedAssignmentPanelContext> | undefined;
  onDismiss: () => void;
  shareSlug: string;
}) {
  const panelContext =
    context ??
    buildPublishedAssignmentPanelContext({
      assignment: undefined,
      isLoading: true,
      shareSlug,
    });
  const { assignment } = panelContext;

  return (
    <section className="grid gap-4 rounded-lg border border-primary/25 bg-primary/5 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <IconCircleCheck className="size-4" />
          {assignmentListPublishedPanelCopy.publishedLabel}
        </div>
        <h2 className="mt-2 text-lg font-semibold">{panelContext.title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {panelContext.body}
        </p>
        <p className="mt-2 w-fit rounded-md border bg-background px-2 py-1 font-mono text-xs text-muted-foreground">
          {panelContext.sharePath}
        </p>
        {panelContext.showMissingHint ? (
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            {assignmentListPublishedPanelCopy.missingHint}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
        {panelContext.showResultsAction && assignment ? (
          <Link
            to="/dashboard/assignments/$assignmentId"
            params={{ assignmentId: assignment.id }}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'w-full bg-background sm:w-auto'
            )}
          >
            <IconChartBar className="size-4" />
            {assignmentListActionCopy.viewResults}
          </Link>
        ) : null}
        {panelContext.showShareActions ? (
          <>
            <Link
              to="/play/$shareId"
              params={{ shareId: shareSlug }}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'w-full bg-background sm:w-auto'
              )}
            >
              <IconPlayerPlay className="size-4" />
              {assignmentListActionCopy.openPublishedLink}
            </Link>
            <CopyAssignmentShareLinkButton
              shareSlug={shareSlug}
              className="w-full bg-background sm:w-auto"
            />
          </>
        ) : null}
        {panelContext.showDismissAction ? (
          <Button
            type="button"
            variant="ghost"
            className="w-full sm:w-auto"
            onClick={onDismiss}
          >
            <IconX className="size-4" />
            {assignmentListActionCopy.dismiss}
          </Button>
        ) : null}
      </div>
    </section>
  );
}

function AssignmentCard({
  assignment,
}: {
  assignment: ReturnType<typeof buildAssignmentListCardViewModel>;
}) {
  const updateStatusMutation = useUpdateAssignmentStatus();
  const { resultAction, shareAction, statusAction } = assignment.actionView;

  async function updateStatus() {
    if (!statusAction) return;

    try {
      await updateStatusMutation.mutateAsync({
        assignmentId: assignment.id,
        status: statusAction.nextStatus,
      });
      toast.success(statusAction.successMessage);
    } catch {
      toast.error(statusAction.failureMessage);
    }
  }

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-md">
            {assignment.statusLabel}
          </Badge>
          <Badge variant="outline" className="rounded-md">
            <IconListCheck className="size-3.5" />
            {assignment.templateLabel}
          </Badge>
        </div>
        <CardTitle>
          <h2 className="text-lg font-semibold">{assignment.title}</h2>
        </CardTitle>
        <CardDescription>
          <p>{assignment.activityDescription}</p>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="grid gap-4">
          <AssignmentSettingsSummary
            expiresAt={assignment.expiresAt}
            settings={assignment.settings}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {assignment.statItems.map((stat) => (
              <AssignmentStat
                key={stat.key}
                icon={assignmentListCardStatIcons[stat.key]}
                label={stat.label}
                value={stat.value}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
          {resultAction ? (
            <Link
              to="/dashboard/assignments/$assignmentId"
              params={{ assignmentId: resultAction.assignmentId }}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'w-full bg-background lg:w-auto'
              )}
            >
              <IconChartBar className="size-4" />
              {resultAction.label}
            </Link>
          ) : null}
          {statusAction ? (
            <Button
              type="button"
              variant="outline"
              className="w-full bg-background lg:w-auto"
              disabled={updateStatusMutation.isPending}
              onClick={updateStatus}
            >
              {statusAction.kind === 'close-link' ? (
                <IconLock className="size-4" />
              ) : (
                <IconLockOpen className="size-4" />
              )}
              {statusAction.label}
            </Button>
          ) : null}
          {shareAction ? (
            <>
              <Link
                to="/play/$shareId"
                params={{ shareId: shareAction.shareSlug }}
                className={cn(buttonVariants(), 'w-full lg:w-auto')}
              >
                <IconPlayerPlay className="size-4" />
                {shareAction.label}
              </Link>
              <CopyAssignmentShareLinkButton
                shareSlug={shareAction.shareSlug}
                className="w-full bg-background lg:w-auto"
              />
            </>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryCard({ metric }: { metric: AssignmentListSummaryMetric }) {
  const Icon = assignmentSummaryMetricIcons[metric.id];

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

const assignmentSummaryMetricIcons: Record<
  AssignmentListSummaryMetricId,
  typeof IconShare3
> = {
  average: IconChartBar,
  completions: IconUsers,
  open: IconShare3,
  total: IconListCheck,
};

const assignmentListCardStatIcons: Record<
  ReturnType<
    typeof buildAssignmentListCardViewModel
  >['statItems'][number]['key'],
  typeof IconUsers
> = {
  average: IconChartBar,
  completions: IconUsers,
};

function AssignmentStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof IconUsers;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <Icon className="size-4 text-primary" />
      <p className="mt-2 text-sm font-medium">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
