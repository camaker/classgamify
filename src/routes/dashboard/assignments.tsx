import { getStarterActivity, starterAssignments } from '@/activities/catalog';
import type {
  ActivityTemplateType,
  AssignmentStatus,
} from '@/activities/types';
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
  IconCalendarTime,
  IconChartBar,
  IconClock,
  IconListCheck,
  IconLock,
  IconLockOpen,
  IconPlayerPlay,
  IconShare3,
  IconUsers,
} from '@tabler/icons-react';
import { Link, createFileRoute } from '@tanstack/react-router';
import { toast } from 'sonner';

type AssignmentCardData = {
  activityDescription: string;
  expiresAt: Date | null;
  id: string;
  maxAttempts?: number;
  shareSlug: string;
  status: AssignmentStatus;
  templateType: ActivityTemplateType;
  timeLimitSeconds?: number;
  title: string;
  stats: {
    averageScore: number;
    completions: number;
  };
};

export const Route = createFileRoute('/dashboard/assignments')({
  validateSearch: (search: Record<string, unknown>) => ({
    published:
      typeof search.published === 'string' ? search.published : undefined,
  }),
  component: DashboardAssignmentsPage,
});

function DashboardAssignmentsPage() {
  const { data, isError, isLoading } = useAssignments({
    pageIndex: 0,
    pageSize: 50,
  });
  const assignments = data?.items ?? [];
  const hasAssignments = assignments.length > 0;
  const openAssignmentCount = assignments.filter((item) =>
    isAssignmentOpen(item.assignment.status, item.assignment.expiresAt)
  ).length;
  const totalCompletions = assignments.reduce(
    (sum, item) => sum + item.stats.completions,
    0
  );
  const averageScore =
    assignments.length > 0
      ? Math.round(
          assignments.reduce((sum, item) => sum + item.stats.averageScore, 0) /
            assignments.length
        )
      : 0;

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
            label="Assignments"
            value={String(assignments.length)}
          />
          <SummaryCard
            icon={IconShare3}
            label="Open links"
            value={String(openAssignmentCount)}
          />
          <SummaryCard
            icon={IconUsers}
            label="Completions"
            value={String(totalCompletions)}
          />
          <SummaryCard
            icon={IconChartBar}
            label="Average score"
            value={`${averageScore}%`}
          />
        </section>

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
          <section className="grid gap-4">
            {assignments.map((item) => (
              <AssignmentCard
                key={item.assignment.id}
                assignment={{
                  activityDescription:
                    item.snapshot?.activityDescription ??
                    item.activity.description ??
                    '',
                  expiresAt: item.assignment.expiresAt,
                  id: item.assignment.id,
                  maxAttempts: item.assignment.settingsJson.maxAttempts,
                  shareSlug: item.assignment.shareSlug,
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
        ) : null}

        {!isLoading && !hasAssignments ? (
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
                      expiresAt: null,
                      id: assignment.id,
                      maxAttempts: assignment.settings.maxAttempts,
                      shareSlug: assignment.shareId,
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

function AssignmentCard({ assignment }: { assignment: AssignmentCardData }) {
  const updateStatusMutation = useUpdateAssignmentStatus();
  const persisted = !assignment.id.startsWith('assignment-');
  const expired = isAssignmentExpired(assignment.expiresAt);
  const canManageStatus =
    persisted &&
    (assignment.status === 'published' ||
      (assignment.status === 'closed' && !expired));
  const nextStatus = assignment.status === 'published' ? 'closed' : 'published';

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
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
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
          <AssignmentStat
            icon={IconClock}
            label="Attempts"
            value={
              assignment.maxAttempts ? `${assignment.maxAttempts} max` : 'open'
            }
          />
          <AssignmentStat
            icon={IconClock}
            label="Timer"
            value={formatAssignmentTimeLimit(assignment.timeLimitSeconds)}
          />
          <AssignmentStat
            icon={IconCalendarTime}
            label="Closes"
            value={formatAssignmentExpiry(assignment.expiresAt)}
          />
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
        </div>
      </CardContent>
    </Card>
  );
}

function getAssignmentStatusLabel(
  status: AssignmentStatus,
  expiresAt: Date | null
) {
  if (status === 'published' && isAssignmentExpired(expiresAt)) {
    return 'Expired';
  }
  if (status === 'published') return 'Open';
  if (status === 'closed') return 'Closed';
  return 'Draft';
}

function isAssignmentOpen(status: AssignmentStatus, expiresAt: Date | null) {
  return status === 'published' && !isAssignmentExpired(expiresAt);
}

function isAssignmentExpired(expiresAt: Date | null) {
  return Boolean(expiresAt && expiresAt.getTime() <= Date.now());
}

function formatAssignmentExpiry(expiresAt: Date | null) {
  if (!expiresAt) return 'No close time';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(expiresAt);
}

function formatAssignmentTimeLimit(seconds?: number) {
  if (!seconds) return 'No timer';
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
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
