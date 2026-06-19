import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAssignmentResults } from '@/hooks/use-assignments';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import {
  IconChartBar,
  IconClock,
  IconPlayerPlay,
  IconShare3,
  IconUsers,
} from '@tabler/icons-react';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/assignments/$assignmentId')({
  component: AssignmentResultsPage,
});

function AssignmentResultsPage() {
  const { assignmentId } = Route.useParams();
  const { data, isError, isLoading } = useAssignmentResults(assignmentId);
  const title = data?.assignment.title ?? 'Assignment results';
  const activityTitle =
    data?.snapshot?.activityTitle ?? data?.activity.title ?? '';
  const activityDescription =
    data?.snapshot?.activityDescription ?? data?.activity.description ?? '';
  const templateType =
    data?.snapshot?.templateType ?? data?.activity.templateType ?? '';

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: 'Dashboard', href: Routes.Dashboard },
        { label: 'Assignments', href: Routes.DashboardAssignments },
        { label: title, isCurrentPage: true },
      ]}
      title={title}
      description="Review student attempts, scores, and assignment-level result metrics."
    >
      {isLoading ? (
        <Card className="min-h-56 rounded-lg" />
      ) : isError || !data ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Assignment results could not be loaded. Refresh the page or return to
          assignments.
        </div>
      ) : (
        <div className="grid gap-6">
          <section className="grid gap-4 md:grid-cols-3">
            <ResultMetric
              icon={IconUsers}
              label="Completions"
              value={String(data.stats.completions)}
            />
            <ResultMetric
              icon={IconChartBar}
              label="Average accuracy"
              value={`${data.stats.averageScore}%`}
            />
            <ResultMetric
              icon={IconClock}
              label="Average points"
              value={String(data.stats.averagePoints)}
            />
          </section>

          <Card className="rounded-lg">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-md">
                  {data.assignment.status}
                </Badge>
                <Badge variant="outline" className="rounded-md">
                  {templateType}
                </Badge>
              </div>
              <CardTitle>
                <h2 className="text-lg font-semibold">{activityTitle}</h2>
              </CardTitle>
              <CardDescription>
                <p>{activityDescription}</p>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/play/$shareId"
                params={{ shareId: data.assignment.shareSlug }}
                className={cn(buttonVariants(), 'w-full sm:w-auto')}
              >
                <IconPlayerPlay className="size-4" />
                Open student link
              </Link>
              <div className="flex min-h-8 items-center gap-2 rounded-lg border bg-muted/30 px-3 text-sm text-muted-foreground">
                <IconShare3 className="size-4" />
                /play/{data.assignment.shareSlug}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>
                <h2 className="text-lg font-semibold">Student attempts</h2>
              </CardTitle>
              <CardDescription>
                <p>
                  Latest submitted attempts are shown first. Item-level review
                  can build on the stored answers JSON in the next pass.
                </p>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.attempts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Accuracy</TableHead>
                      <TableHead>Answered</TableHead>
                      <TableHead>Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.attempts.map((attempt) => (
                      <TableRow key={attempt.id}>
                        <TableCell>
                          {attempt.studentName || 'Anonymous student'}
                        </TableCell>
                        <TableCell>
                          {attempt.score ?? 0}/{attempt.maxScore ?? 0}
                        </TableCell>
                        <TableCell>
                          {attempt.resultJson?.accuracy ?? 0}%
                        </TableCell>
                        <TableCell>
                          {attempt.resultJson?.completedItemCount ?? 0}/
                          {attempt.resultJson?.totalPoints ?? 0}
                        </TableCell>
                        <TableCell>
                          {formatAttemptDate(attempt.completedAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="rounded-lg border border-dashed bg-muted/20 p-6">
                  <h2 className="text-base font-semibold">
                    No student attempts yet.
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Share the student link, then completed submissions will
                    appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}

function ResultMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof IconUsers;
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

function formatAttemptDate(value: Date | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}
