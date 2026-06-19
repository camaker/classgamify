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
import { Progress } from '@/components/ui/progress';
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
  IconCalendarTime,
  IconChartBar,
  IconClock,
  IconListDetails,
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
          <section className="grid gap-4 md:grid-cols-4">
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
            <ResultMetric
              icon={IconCalendarTime}
              label="Closes"
              value={formatAssignmentExpiry(data.assignment.expiresAt)}
            />
          </section>

          <Card className="rounded-lg">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-md">
                  {getAssignmentStatusLabel(
                    data.assignment.status,
                    data.assignment.expiresAt
                  )}
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

          {data.analysis.perItem.length > 0 ? (
            <Card className="rounded-lg">
              <CardHeader>
                <CardTitle>
                  <h2 className="text-lg font-semibold">Reteach priorities</h2>
                </CardTitle>
                <CardDescription>
                  <p>
                    Items are sorted by the lowest correct rate so teachers can
                    quickly decide what to review with the class.
                  </p>
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3">
                {data.analysis.needsReview.length > 0 ? (
                  data.analysis.needsReview.map((item) => (
                    <ItemAnalysisCard key={item.itemId} item={item} />
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground md:col-span-3">
                    Submit at least one answered attempt to calculate item
                    review priorities.
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>
                <h2 className="text-lg font-semibold">Student attempts</h2>
              </CardTitle>
              <CardDescription>
                <p>
                  Latest submitted attempts are shown first, with detailed
                  answer review below.
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

          {data.analysis.attempts.length > 0 ? (
            <Card className="rounded-lg">
              <CardHeader>
                <CardTitle>
                  <h2 className="text-lg font-semibold">Answer review</h2>
                </CardTitle>
                <CardDescription>
                  <p>
                    Item-level answers are scored from the frozen assignment
                    snapshot, so teacher edits never change historical results.
                  </p>
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {data.analysis.attempts.map((attempt) => (
                  <AttemptReviewCard key={attempt.id} attempt={attempt} />
                ))}
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}
    </DashboardLayout>
  );
}

function ItemAnalysisCard({
  item,
}: {
  item: NonNullable<
    ReturnType<typeof useAssignmentResults>['data']
  >['analysis']['perItem'][number];
}) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="flex items-center justify-between gap-3">
        <Badge variant="outline" className="rounded-md">
          {item.kind}
        </Badge>
        <span className="text-sm font-semibold">{item.correctRate}%</span>
      </div>
      <p className="mt-3 line-clamp-2 text-sm font-medium">{item.prompt}</p>
      <Progress value={item.correctRate} className="mt-3 h-2" />
      <p className="mt-2 text-xs text-muted-foreground">
        {item.correctCount}/{item.submittedCount} correct · answer:{' '}
        {item.expectedAnswer}
      </p>
    </div>
  );
}

function AttemptReviewCard({
  attempt,
}: {
  attempt: NonNullable<
    ReturnType<typeof useAssignmentResults>['data']
  >['analysis']['attempts'][number];
}) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <IconListDetails className="size-4 text-primary" />
            <p className="font-medium text-sm">{attempt.studentLabel}</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatAttemptDate(attempt.completedAt)}
          </p>
        </div>
        <Badge variant="secondary" className="rounded-md">
          {attempt.score} pts · {attempt.accuracy}%
        </Badge>
      </div>
      <div className="mt-3 grid gap-2">
        {attempt.answers.map((answer, index) => (
          <div
            key={`${attempt.id}-${answer.itemId}`}
            className="rounded-lg border bg-muted/20 p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="min-w-0 text-sm font-medium">
                {index + 1}. {answer.prompt}
              </p>
              <Badge
                variant={answer.correct ? 'secondary' : 'outline'}
                className="rounded-md"
              >
                {answer.correct ? 'Correct' : 'Review'}
              </Badge>
            </div>
            <div className="mt-2 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
              <p>Student: {answer.answer || '-'}</p>
              <p>Expected: {answer.expectedAnswer || '-'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
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

function formatAssignmentExpiry(value: Date | null) {
  if (!value) return 'No close time';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}

function getAssignmentStatusLabel(status: string, expiresAt: Date | null) {
  if (
    status === 'published' &&
    expiresAt &&
    expiresAt.getTime() <= Date.now()
  ) {
    return 'Expired';
  }
  if (status === 'published') return 'Open';
  if (status === 'closed') return 'Closed';
  return 'Draft';
}
