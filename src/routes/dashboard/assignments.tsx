import { getStarterActivity, starterAssignments } from '@/activities/catalog';
import type {
  ActivityTemplateType,
  AssignmentStatus,
} from '@/activities/types';
import {
  canUpdateAssignmentStatus,
  getAssignmentStatusLabel,
} from '@/assignments/lifecycle';
import { findPublishedAssignmentInList } from '@/assignments/published-assignment';
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

type AssignmentCardData = {
  activityDescription: string;
  collectStudentName?: boolean;
  expiresAt: Date | null;
  id: string;
  instructions?: string;
  maxAttempts?: number;
  shareSlug: string;
  showCorrectAnswers?: boolean;
  shuffleItems?: boolean;
  status: AssignmentStatus;
  templateType: ActivityTemplateType;
  timeLimitSeconds?: number;
  title: string;
  stats: {
    averageScore: number;
    completions: number;
  };
};

type AssignmentStatusFilter = 'all' | AssignmentStatus;

const assignmentStatusFilterOptions: Array<{
  label: string;
  value: AssignmentStatusFilter;
}> = [
  { label: 'All statuses', value: 'all' },
  { label: 'Published', value: 'published' },
  { label: 'Closed', value: 'closed' },
  { label: 'Draft', value: 'draft' },
];

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
  const normalizedSearchQuery = normalizeAssignmentSearch(searchQuery);
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
  const publishedAssignment = findPublishedAssignmentInList({
    items: assignments,
    shareSlug: published,
  });
  const summary = data?.summary ?? {
    averageScore: 0,
    completions: 0,
    openAssignments: 0,
    totalAssignments,
  };

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
      search: {
        page: undefined,
        published,
        q: nextQuery.trim() ? nextQuery : undefined,
        status: nextStatus === 'all' ? undefined : nextStatus,
      },
    });
  }

  function navigateToAssignmentPage(nextPage: number, replace = false) {
    const boundedPage = Math.max(1, nextPage);

    void navigate({
      replace,
      search: {
        page: boundedPage === 1 ? undefined : boundedPage,
        published,
        q: searchQuery.trim() ? searchQuery : undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
      },
    });
  }

  function clearFilters() {
    void navigate({
      replace: true,
      search: { published },
    });
  }

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: 'Dashboard', href: Routes.Dashboard },
        { label: 'Assignments', isCurrentPage: true },
      ]}
      title="Assignments"
      description="Published activity instances with share links, classroom settings, and result metrics."
    >
      <div className="grid gap-6">
        <section className="grid gap-4 md:grid-cols-4">
          <SummaryCard
            icon={IconListCheck}
            label={hasFilters ? 'Matching' : 'Assignments'}
            value={String(summary.totalAssignments)}
          />
          <SummaryCard
            icon={IconShare3}
            label="Open links"
            value={String(summary.openAssignments)}
          />
          <SummaryCard
            icon={IconUsers}
            label="Completions"
            value={String(summary.completions)}
          />
          <SummaryCard
            icon={IconChartBar}
            label="Average"
            value={`${summary.averageScore}%`}
          />
        </section>

        {published ? (
          <PublishedAssignmentPanel
            assignment={publishedAssignment}
            isLoading={isLoading}
            onDismiss={() =>
              void navigate({
                replace: true,
                search: {
                  page: currentPage === 1 ? undefined : currentPage,
                  q: searchQuery.trim() ? searchQuery : undefined,
                  status: statusFilter === 'all' ? undefined : statusFilter,
                },
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
            Assignments could not be loaded. Refresh the page or sign in again.
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
                  assignment={{
                    activityDescription:
                      item.snapshot?.activityDescription ??
                      item.activity.description ??
                      '',
                    collectStudentName:
                      item.assignment.settingsJson.collectStudentName,
                    expiresAt: item.assignment.expiresAt,
                    id: item.assignment.id,
                    instructions: item.assignment.settingsJson.instructions,
                    maxAttempts: item.assignment.settingsJson.maxAttempts,
                    shareSlug: item.assignment.shareSlug,
                    showCorrectAnswers:
                      item.assignment.settingsJson.showCorrectAnswers,
                    shuffleItems: item.assignment.settingsJson.shuffleItems,
                    stats: item.stats,
                    status: item.assignment.status,
                    templateType:
                      item.snapshot?.templateType ?? item.activity.templateType,
                    timeLimitSeconds:
                      item.assignment.settingsJson.timeLimitSeconds,
                    title: item.assignment.title,
                  }}
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
            <h2 className="text-lg font-semibold">No matching assignments.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Try another assignment title, share id, activity name, or status.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4 bg-background"
              onClick={clearFilters}
            >
              <IconX className="size-4" />
              Clear filters
            </Button>
          </div>
        ) : null}

        {!isLoading && !hasAssignments && !hasFilters ? (
          <div className="grid gap-4">
            <div className="rounded-lg border border-dashed bg-muted/20 p-6">
              <h2 className="text-lg font-semibold">
                No published assignments yet.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Open the activity library and publish a saved activity to create
                a student share link.
              </p>
              <Link
                to={Routes.DashboardActivities}
                className={cn(buttonVariants(), 'mt-4 w-fit')}
              >
                <IconListCheck className="size-4" />
                Open activity library
              </Link>
            </div>
            <section className="grid gap-4">
              {starterAssignments.map((assignment) => {
                const activity = getStarterActivity(assignment.activityId);
                return (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={{
                      activityDescription: activity.description,
                      collectStudentName:
                        assignment.settings.collectStudentName,
                      expiresAt: null,
                      id: assignment.id,
                      instructions: assignment.settings.instructions,
                      maxAttempts: assignment.settings.maxAttempts,
                      shareSlug: assignment.shareId,
                      showCorrectAnswers:
                        assignment.settings.showCorrectAnswers,
                      shuffleItems: assignment.settings.shuffleItems,
                      stats: {
                        averageScore: assignment.averageScore,
                        completions: assignment.completions,
                      },
                      status: assignment.status,
                      templateType: activity.templateType,
                      timeLimitSeconds: assignment.settings.timeLimitSeconds,
                      title: assignment.title,
                    }}
                  />
                );
              })}
            </section>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}

function PublishedAssignmentPanel({
  assignment,
  isLoading,
  onDismiss,
  shareSlug,
}: {
  assignment:
    | {
        id: string;
        title: string;
      }
    | undefined;
  isLoading: boolean;
  onDismiss: () => void;
  shareSlug: string;
}) {
  return (
    <section className="grid gap-4 rounded-lg border border-primary/25 bg-primary/5 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <IconCircleCheck className="size-4" />
          Assignment published
        </div>
        <h2 className="mt-2 text-lg font-semibold">
          {assignment?.title ?? 'Student share link is ready.'}
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Copy the student link for your class, open the student preview, or
          jump into the results page before submissions arrive.
        </p>
        {!assignment && !isLoading ? (
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            The new assignment may be on another page after filtering. The share
            link actions still use the published link id.
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
        {assignment ? (
          <Link
            to="/dashboard/assignments/$assignmentId"
            params={{ assignmentId: assignment.id }}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'w-full bg-background sm:w-auto'
            )}
          >
            <IconChartBar className="size-4" />
            View results
          </Link>
        ) : null}
        <Link
          to="/play/$shareId"
          params={{ shareId: shareSlug }}
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'w-full bg-background sm:w-auto'
          )}
        >
          <IconPlayerPlay className="size-4" />
          Open link
        </Link>
        <CopyAssignmentShareLinkButton
          shareSlug={shareSlug}
          className="w-full bg-background sm:w-auto"
        />
        <Button
          type="button"
          variant="ghost"
          className="w-full sm:w-auto"
          onClick={onDismiss}
        >
          <IconX className="size-4" />
          Dismiss
        </Button>
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
  const hasFilters =
    Boolean(normalizeAssignmentSearch(search)) || status !== 'all';
  const summary = isLoading
    ? 'Loading assignments...'
    : hasFilters
      ? `${total} ${total === 1 ? 'match' : 'matches'}`
      : `${total} total ${total === 1 ? 'assignment' : 'assignments'}`;

  return (
    <section className="grid gap-4 rounded-lg border bg-card p-4 lg:grid-cols-[minmax(0,1fr)_13rem_auto] lg:items-end">
      <div className="grid gap-2">
        <label htmlFor="assignment-list-search" className="font-medium text-sm">
          Search assignments
        </label>
        <div className="relative max-w-xl">
          <IconSearch className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
          <Input
            id="assignment-list-search"
            value={search}
            placeholder="Search by assignment, activity, or share id"
            className="pl-9 pr-9"
            onChange={(event) => onSearch(event.currentTarget.value)}
          />
          {search ? (
            <button
              type="button"
              aria-label="Clear assignment search"
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
          Status
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
        <p className="text-sm text-muted-foreground">{summary}</p>
        {hasFilters ? (
          <Button
            type="button"
            variant="outline"
            className="w-full bg-background lg:w-auto"
            onClick={onClear}
          >
            <IconFilter className="size-4" />
            Clear filters
          </Button>
        ) : null}
      </div>
    </section>
  );
}

function AssignmentCard({ assignment }: { assignment: AssignmentCardData }) {
  const updateStatusMutation = useUpdateAssignmentStatus();
  const persisted = !assignment.id.startsWith('assignment-');
  const nextStatus = assignment.status === 'published' ? 'closed' : 'published';
  const canManageStatus =
    persisted &&
    canUpdateAssignmentStatus({
      currentStatus: assignment.status,
      expiresAt: assignment.expiresAt,
      nextStatus,
    });

  async function updateStatus() {
    try {
      await updateStatusMutation.mutateAsync({
        assignmentId: assignment.id,
        status: nextStatus,
      });
      toast.success(
        nextStatus === 'closed'
          ? 'Assignment link closed.'
          : 'Assignment link reopened.'
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Assignment status could not be updated.'
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
            <AssignmentStat
              icon={IconUsers}
              label="Completions"
              value={String(assignment.stats.completions)}
            />
            <AssignmentStat
              icon={IconChartBar}
              label="Average"
              value={`${assignment.stats.averageScore}%`}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
          {persisted ? (
            <Link
              to="/dashboard/assignments/$assignmentId"
              params={{ assignmentId: assignment.id }}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'w-full bg-background lg:w-auto'
              )}
            >
              <IconChartBar className="size-4" />
              View results
            </Link>
          ) : null}
          {canManageStatus ? (
            <Button
              type="button"
              variant="outline"
              className="w-full bg-background lg:w-auto"
              disabled={updateStatusMutation.isPending}
              onClick={updateStatus}
            >
              {assignment.status === 'published' ? (
                <IconLock className="size-4" />
              ) : (
                <IconLockOpen className="size-4" />
              )}
              {assignment.status === 'published' ? 'Close link' : 'Reopen link'}
            </Button>
          ) : null}
          <Link
            to="/play/$shareId"
            params={{ shareId: assignment.shareSlug }}
            className={cn(buttonVariants(), 'w-full lg:w-auto')}
          >
            <IconPlayerPlay className="size-4" />
            Open share link
          </Link>
          <CopyAssignmentShareLinkButton
            shareSlug={assignment.shareSlug}
            className="w-full bg-background lg:w-auto"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function parseAssignmentStatusFilter(
  value: unknown
): AssignmentStatusFilter | undefined {
  return value === 'published' || value === 'closed' || value === 'draft'
    ? value
    : undefined;
}

function normalizeAssignmentSearch(value: string) {
  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized || undefined;
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof IconShare3;
  label: string;
  value: string;
}) {
  return (
    <Card className="rounded-lg">
      <CardContent className="p-4">
        <Icon className="size-5 text-primary" />
        <p className="mt-4 text-2xl font-semibold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

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
