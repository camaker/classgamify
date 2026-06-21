import { getStarterActivity, starterAssignments } from '@/activities/catalog';
import {
  type AssignmentStatusFilter,
  buildAssignmentListRouteSearch,
  normalizeAssignmentListSearch,
  parseAssignmentStatusFilter,
} from '@/assignments/list-filters';
import {
  buildAssignmentListFilterSummary,
  buildAssignmentListSummaryMetrics,
  type AssignmentListSummaryMetric,
  type AssignmentListSummaryMetricId,
} from '@/assignments/list-summary';
import {
  assignmentListActionCopy,
  assignmentListPageCopy,
  assignmentListPublishedPanelCopy,
  assignmentListSearchCopy,
  assignmentStatusFilterOptions,
  buildAssignmentListCardStats,
  buildAssignmentListCardViewModel,
  buildAssignmentListEmptyStateView,
  buildStarterAssignmentListCardViewModel,
  getAssignmentListCardActionState,
} from '@/assignments/list-view';
import { getAssignmentStatusLabel } from '@/assignments/lifecycle';
import { buildPublishedAssignmentPanelContext } from '@/assignments/published-assignment';
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
import { Input } from '@/components/ui/input';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import {
  useAssignments,
  useUpdateAssignmentStatus,
} from '@/hooks/use-assignments';
import { parseDashboardPageSearch } from '@/lib/dashboard-pagination';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import {
  IconChartBar,
  IconFilter,
  IconCircleCheck,
  IconListCheck,
  IconLock,
  IconLockOpen,
  IconPlayerPlay,
  IconSearch,
  IconShare3,
  IconUsers,
  IconX,
} from '@tabler/icons-react';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { toast } from 'sonner';

const ASSIGNMENT_LIST_PAGE_SIZE = 12;

export const Route = createFileRoute('/dashboard/assignments')({
  validateSearch: (search: Record<string, unknown>) => ({
    page: parseDashboardPageSearch(search.page),
    published:
      typeof search.published === 'string' ? search.published : undefined,
    q: typeof search.q === 'string' ? search.q : undefined,
    status: parseAssignmentStatusFilter(search.status),
  }),
  component: DashboardAssignmentsPage,
});

function DashboardAssignmentsPage() {
  const navigate = useNavigate({ from: '/dashboard/assignments' });
  const { page, published, q, status } = Route.useSearch();
  const searchQuery = q ?? '';
  const statusFilter = status ?? 'all';
  const currentPage = page ?? 1;
  const normalizedSearchQuery = normalizeAssignmentListSearch(searchQuery);
  const filteredStatus = statusFilter === 'all' ? undefined : statusFilter;
  const { data, isError, isLoading } = useAssignments({
    pageIndex: currentPage - 1,
    pageSize: ASSIGNMENT_LIST_PAGE_SIZE,
    search: normalizedSearchQuery,
    status: filteredStatus,
  });
  const assignments = data?.items ?? [];
  const totalAssignments = data?.total ?? 0;
  const totalPages = Math.max(
    1,
    Math.ceil(totalAssignments / ASSIGNMENT_LIST_PAGE_SIZE)
  );
  const hasAssignments = assignments.length > 0;
  const hasFilters = Boolean(normalizedSearchQuery) || Boolean(filteredStatus);
  const emptyState = buildAssignmentListEmptyStateView({ hasFilters });
  const publishedPanelContext = published
    ? buildPublishedAssignmentPanelContext({
        isLoading,
        items: assignments,
        shareSlug: published,
      })
    : undefined;
  const summaryMetrics = buildAssignmentListSummaryMetrics({
    hasFilters,
    summary: data?.summary,
    totalAssignments,
  });

  useEffect(() => {
    if (!isLoading && currentPage > totalPages) {
      navigateToAssignmentPage(totalPages, true);
    }
  }, [currentPage, isLoading, totalAssignments, totalPages]);

  function updateFilters(next: {
    q?: string;
    status?: AssignmentStatusFilter;
  }) {
    const nextQuery = next.q ?? searchQuery;
    const nextStatus = next.status ?? statusFilter;

    void navigate({
      replace: true,
      search: buildAssignmentListRouteSearch({
        page: undefined,
        published,
        q: nextQuery.trim() ? nextQuery : undefined,
        status: nextStatus,
      }),
    });
  }

  function navigateToAssignmentPage(nextPage: number, replace = false) {
    const boundedPage = Math.max(1, nextPage);

    void navigate({
      replace,
      search: buildAssignmentListRouteSearch({
        page: boundedPage === 1 ? undefined : boundedPage,
        published,
        q: searchQuery.trim() ? searchQuery : undefined,
        status: statusFilter,
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
      breadcrumbs={[
        {
          label: assignmentListPageCopy.breadcrumbDashboard,
          href: Routes.Dashboard,
        },
        {
          label: assignmentListPageCopy.breadcrumbCurrent,
          isCurrentPage: true,
        },
      ]}
      title={assignmentListPageCopy.title}
      description={assignmentListPageCopy.description}
    >
      <div className="grid gap-6">
        <section className="grid gap-4 md:grid-cols-4">
          {summaryMetrics.map((metric) => (
            <SummaryCard key={metric.id} metric={metric} />
          ))}
        </section>

        {published ? (
          <PublishedAssignmentPanel
            context={publishedPanelContext}
            onDismiss={() =>
              void navigate({
                replace: true,
                search: buildAssignmentListRouteSearch({
                  page: currentPage === 1 ? undefined : currentPage,
                  q: searchQuery.trim() ? searchQuery : undefined,
                  status: statusFilter,
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
          total={totalAssignments}
        />

        {isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {assignmentListPageCopy.loadErrorMessage}
          </div>
        ) : null}

        {isLoading ? (
          <section className="grid gap-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <Card key={index} className="min-h-48 rounded-lg" />
            ))}
          </section>
        ) : null}

        {!isLoading && hasAssignments ? (
          <>
            <section className="grid gap-4">
              {assignments.map((item) => (
                <AssignmentCard
                  key={item.assignment.id}
                  assignment={buildAssignmentListCardViewModel(item)}
                />
              ))}
            </section>
            <DashboardPagination
              currentPage={currentPage}
              isLoading={isLoading}
              itemLabel="assignments"
              onPageChange={(nextPage) => navigateToAssignmentPage(nextPage)}
              pageSize={ASSIGNMENT_LIST_PAGE_SIZE}
              total={totalAssignments}
              totalPages={totalPages}
            />
          </>
        ) : null}

        {!isLoading && !hasAssignments && hasFilters ? (
          <div className="rounded-lg border border-dashed bg-muted/20 p-6">
            <h2 className="text-lg font-semibold">{emptyState.title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {emptyState.description}
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

        {!isLoading && !hasAssignments && !hasFilters ? (
          <div className="grid gap-4">
            <div className="rounded-lg border border-dashed bg-muted/20 p-6">
              <h2 className="text-lg font-semibold">{emptyState.title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {emptyState.description}
              </p>
              <Link
                to={Routes.DashboardActivities}
                className={cn(buttonVariants(), 'mt-4 w-fit')}
              >
                <IconListCheck className="size-4" />
                {assignmentListActionCopy.openActivityLibrary}
              </Link>
            </div>
            {emptyState.showStarterAssignments ? (
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
      isLoading: true,
      items: [],
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

function AssignmentListFilters({
  isLoading,
  onClear,
  onSearch,
  onStatusChange,
  search,
  status,
  total,
}: {
  isLoading: boolean;
  onClear: () => void;
  onSearch: (value: string) => void;
  onStatusChange: (value: AssignmentStatusFilter) => void;
  search: string;
  status: AssignmentStatusFilter;
  total: number;
}) {
  const normalizedSearch = normalizeAssignmentListSearch(search);
  const filterSummary = buildAssignmentListFilterSummary({
    isLoading,
    search: normalizedSearch,
    status,
    total,
  });
  const hasFilters = filterSummary.hasFilters;

  return (
    <section className="grid gap-4 rounded-lg border bg-card p-4 lg:grid-cols-[minmax(0,1fr)_13rem_auto] lg:items-end">
      <div className="grid gap-2">
        <label htmlFor="assignment-list-search" className="font-medium text-sm">
          {assignmentListSearchCopy.label}
        </label>
        <div className="relative max-w-xl">
          <IconSearch className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
          <Input
            id="assignment-list-search"
            value={search}
            placeholder={assignmentListSearchCopy.placeholder}
            className="pl-9 pr-9"
            onChange={(event) => onSearch(event.currentTarget.value)}
          />
          {search ? (
            <button
              type="button"
              aria-label={assignmentListSearchCopy.clearSearchLabel}
              className="-translate-y-1/2 absolute top-1/2 right-3 text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => onSearch('')}
            >
              <IconX className="size-4" />
            </button>
          ) : null}
        </div>
      </div>
      <div className="grid gap-2">
        <label
          htmlFor="assignment-status-filter"
          className="font-medium text-sm"
        >
          {assignmentListSearchCopy.statusLabel}
        </label>
        <NativeSelect
          id="assignment-status-filter"
          value={status}
          onChange={(event) =>
            onStatusChange(event.currentTarget.value as AssignmentStatusFilter)
          }
        >
          {assignmentStatusFilterOptions.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-2 lg:items-end">
        <p className="text-sm text-muted-foreground">{filterSummary.text}</p>
        {hasFilters ? (
          <Button
            type="button"
            variant="outline"
            className="w-full bg-background lg:w-auto"
            onClick={onClear}
          >
            <IconFilter className="size-4" />
            {assignmentListActionCopy.clearFilters}
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
  const stats = buildAssignmentListCardStats(assignment.stats);
  const { showResultsAction, showShareActions, statusAction } =
    getAssignmentListCardActionState({
      expiresAt: assignment.expiresAt,
      id: assignment.id,
      status: assignment.status,
    });

  async function updateStatus() {
    if (!statusAction) return;

    try {
      await updateStatusMutation.mutateAsync({
        assignmentId: assignment.id,
        status: statusAction.nextStatus,
      });
      toast.success(statusAction.successMessage);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : statusAction.failureMessage
      );
    }
  }

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-md">
            {getAssignmentStatusLabel(assignment.status, assignment.expiresAt)}
          </Badge>
          <Badge variant="outline" className="rounded-md">
            <IconListCheck className="size-3.5" />
            {assignment.templateType}
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
            collectStudentName={assignment.collectStudentName}
            expiresAt={assignment.expiresAt}
            instructions={assignment.instructions}
            maxAttempts={assignment.maxAttempts}
            showCorrectAnswers={assignment.showCorrectAnswers}
            shuffleItems={assignment.shuffleItems}
            timeLimitSeconds={assignment.timeLimitSeconds}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {stats.map((stat) => (
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
          {showResultsAction ? (
            <Link
              to="/dashboard/assignments/$assignmentId"
              params={{ assignmentId: assignment.id }}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'w-full bg-background lg:w-auto'
              )}
            >
              <IconChartBar className="size-4" />
              {assignmentListActionCopy.viewResults}
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
          {showShareActions ? (
            <>
              <Link
                to="/play/$shareId"
                params={{ shareId: assignment.shareSlug }}
                className={cn(buttonVariants(), 'w-full lg:w-auto')}
              >
                <IconPlayerPlay className="size-4" />
                {assignmentListActionCopy.openShareLink}
              </Link>
              <CopyAssignmentShareLinkButton
                shareSlug={assignment.shareSlug}
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
  ReturnType<typeof buildAssignmentListCardStats>[number]['key'],
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
