import { buildAssignmentClassroomBrief } from '@/assignments/classroom-brief';
import { formatAttemptDuration } from '@/assignments/attempt-duration';
import { formatAssignmentExpiry } from '@/assignments/delivery-summary';
import { getAssignmentStatusLabel } from '@/assignments/lifecycle';
import { buildAssignmentItemReviewSummary } from '@/assignments/item-review-summary';
import { buildAssignmentReteachPlan } from '@/assignments/reteach-plan';
import {
  type AttemptReviewFilter,
  type ItemPerformanceSort,
  type StudentSummarySort,
  buildFilteredAttemptRows,
  filterAndSortStudentSummaries,
  filterAttemptReviews,
  normalizeResultSearch,
  parseAttemptReviewFilter,
  parseItemPerformanceSort,
  parseStudentSummarySort,
  sortItemPerformance,
} from '@/assignments/result-view';
import {
  buildAssignmentResultsCsv,
  buildAssignmentResultsCsvFilename,
} from '@/assignments/results-export';
import {
  formatAcceptedAnswerAlternatives,
  formatAssignmentResultDate,
} from '@/assignments/result-format';
import { buildAssignmentStudentFollowUpSummary } from '@/assignments/student-follow-up-summary';
import { AssignmentSettingsSummary } from '@/components/assignments/assignment-settings-summary';
import { CopyAssignmentShareLinkButton } from '@/components/assignments/copy-assignment-share-link-button';
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
import { copyTextToClipboard } from '@/lib/clipboard';
import { downloadFile } from '@/lib/download';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import {
  IconCalendarTime,
  IconChartBar,
  IconClipboardText,
  IconClock,
  IconCopy,
  IconDownload,
  IconListDetails,
  IconPlayerPlay,
  IconSearch,
  IconShare3,
  IconUsers,
  IconX,
} from '@tabler/icons-react';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

const studentSummarySortOptions: Array<{
  label: string;
  value: StudentSummarySort;
}> = [
  { label: 'Needs review', value: 'needs-review' },
  { label: 'Best score', value: 'best' },
  { label: 'Student name', value: 'name' },
  { label: 'Attempts', value: 'attempts' },
];

const itemPerformanceSortOptions: Array<{
  label: string;
  value: ItemPerformanceSort;
}> = [
  { label: 'Snapshot order', value: 'original' },
  { label: 'Lowest accuracy', value: 'accuracy' },
  { label: 'Most answered', value: 'submitted' },
  { label: 'Item type', value: 'type' },
];

const attemptReviewFilterOptions: Array<{
  label: string;
  value: AttemptReviewFilter;
}> = [
  { label: 'All answers', value: 'all' },
  { label: 'Needs review only', value: 'needs-review' },
];

export const Route = createFileRoute('/dashboard/assignments/$assignmentId')({
  validateSearch: (search: Record<string, unknown>) => ({
    itemSort: parseItemPerformanceSort(search.itemSort),
    review: parseAttemptReviewFilter(search.review),
    sort: parseStudentSummarySort(search.sort),
  }),
  component: AssignmentResultsPage,
});

function AssignmentResultsPage() {
  const { assignmentId } = Route.useParams();
  const { itemSort, review, sort } = Route.useSearch();
  const navigate = useNavigate({
    from: '/dashboard/assignments/$assignmentId',
  });
  const { data, isError, isLoading } = useAssignmentResults(assignmentId);
  const [studentSearch, setStudentSearch] = useState('');
  const itemPerformanceSort = itemSort ?? 'original';
  const attemptReviewFilter = review ?? 'all';
  const studentSort = sort ?? 'needs-review';
  const title = data?.assignment.title ?? 'Assignment results';
  const activityTitle =
    data?.snapshot?.activityTitle ?? data?.activity.title ?? '';
  const activityDescription =
    data?.snapshot?.activityDescription ?? data?.activity.description ?? '';
  const templateType =
    data?.snapshot?.templateType ?? data?.activity.templateType ?? '';
  const hasAttempts = Boolean(data?.attempts.length);
  const filteredStudents = useMemo(
    () =>
      filterAndSortStudentSummaries({
        search: studentSearch,
        sort: studentSort,
        students: data?.analysis.students ?? [],
      }),
    [data?.analysis.students, studentSearch, studentSort]
  );
  const sortedPerformanceItems = useMemo(
    () =>
      sortItemPerformance(data?.analysis.perItem ?? [], itemPerformanceSort),
    [data?.analysis.perItem, itemPerformanceSort]
  );
  const classroomBrief = useMemo(() => {
    if (!data) return null;

    return buildAssignmentClassroomBrief({
      assignmentTitle: data.assignment.title,
      items: data.analysis.perItem,
      stats: data.stats,
      students: data.analysis.students,
    });
  }, [data]);

  function updateItemPerformanceSort(nextSort: ItemPerformanceSort) {
    void navigate({
      replace: true,
      search: {
        itemSort: nextSort === 'original' ? undefined : nextSort,
        review,
        sort,
      },
    });
  }

  function updateStudentSort(nextSort: StudentSummarySort) {
    void navigate({
      replace: true,
      search: {
        itemSort,
        review,
        sort: nextSort === 'needs-review' ? undefined : nextSort,
      },
    });
  }

  function updateAttemptReviewFilter(nextFilter: AttemptReviewFilter) {
    void navigate({
      replace: true,
      search: {
        itemSort,
        review: nextFilter === 'all' ? undefined : nextFilter,
        sort,
      },
    });
  }

  const filteredAttemptRows = useMemo(
    () =>
      buildFilteredAttemptRows({
        attempts: data?.attempts ?? [],
        reviews: data?.analysis.attempts ?? [],
        search: studentSearch,
      }),
    [data?.analysis.attempts, data?.attempts, studentSearch]
  );
  const filteredAttemptReviews = useMemo(
    () =>
      filterAttemptReviews({
        attempts: data?.analysis.attempts ?? [],
        filter: attemptReviewFilter,
        search: studentSearch,
      }),
    [attemptReviewFilter, data?.analysis.attempts, studentSearch]
  );

  async function handleExportResults() {
    if (!data || data.attempts.length === 0) {
      toast.error('Submit at least one attempt before exporting results.');
      return;
    }

    const csv = buildAssignmentResultsCsv(data);
    const csvUrl = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    await downloadFile(csvUrl, buildAssignmentResultsCsvFilename(data));
    toast.success('Results CSV downloaded.');
  }

  async function handleCopyReteachPlan() {
    if (!data || data.attempts.length === 0) {
      toast.error('Submit at least one attempt before copying a reteach plan.');
      return;
    }

    try {
      await copyTextToClipboard(
        buildAssignmentReteachPlan({
          assignmentTitle: data.assignment.title,
          items: data.analysis.perItem,
          students: data.analysis.students,
        })
      );
      toast.success('Reteach plan copied.');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Reteach plan could not be copied.'
      );
    }
  }

  async function handleCopyClassroomBrief() {
    if (!data || !classroomBrief || data.attempts.length === 0) {
      toast.error('Submit at least one attempt before copying a brief.');
      return;
    }

    try {
      await copyTextToClipboard(classroomBrief.text);
      toast.success('Classroom brief copied.');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Classroom brief could not be copied.'
      );
    }
  }

  async function handleCopyItemReview() {
    if (!data || data.analysis.perItem.length === 0) {
      toast.error('Add assignment items before copying item review.');
      return;
    }

    try {
      await copyTextToClipboard(
        buildAssignmentItemReviewSummary({
          assignmentTitle: data.assignment.title,
          items: data.analysis.perItem,
        })
      );
      toast.success('Item review copied.');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Item review could not be copied.'
      );
    }
  }

  async function handleCopyStudentFollowUp() {
    if (!data || data.analysis.students.length === 0) {
      toast.error('Submit at least one attempt before copying follow-up.');
      return;
    }

    try {
      await copyTextToClipboard(
        buildAssignmentStudentFollowUpSummary({
          assignmentTitle: data.assignment.title,
          students: data.analysis.students,
        })
      );
      toast.success('Student follow-up copied.');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Student follow-up could not be copied.'
      );
    }
  }

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
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
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
              icon={IconClock}
              label="Average time"
              value={formatAttemptDuration(data.stats.averageDurationSeconds)}
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
            <CardContent className="grid gap-4">
              <AssignmentSettingsSummary
                collectStudentName={
                  data.assignment.settingsJson.collectStudentName
                }
                expiresAt={data.assignment.expiresAt}
                instructions={data.assignment.settingsJson.instructions}
                maxAttempts={data.assignment.settingsJson.maxAttempts}
                showCorrectAnswers={
                  data.assignment.settingsJson.showCorrectAnswers
                }
                shuffleItems={data.assignment.settingsJson.shuffleItems}
                timeLimitSeconds={data.assignment.settingsJson.timeLimitSeconds}
              />
              <div className="flex flex-col gap-3 sm:flex-row">
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
                <CopyAssignmentShareLinkButton
                  shareSlug={data.assignment.shareSlug}
                  className="w-full bg-background sm:w-auto"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  disabled={!hasAttempts}
                  onClick={handleCopyClassroomBrief}
                >
                  <IconClipboardText className="size-4" />
                  Copy brief
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  disabled={!hasAttempts}
                  onClick={handleCopyReteachPlan}
                >
                  <IconCopy className="size-4" />
                  Copy reteach plan
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  disabled={data.analysis.perItem.length === 0}
                  onClick={handleCopyItemReview}
                >
                  <IconCopy className="size-4" />
                  Copy item review
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  disabled={data.analysis.students.length === 0}
                  onClick={handleCopyStudentFollowUp}
                >
                  <IconCopy className="size-4" />
                  Copy follow-up
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  disabled={!hasAttempts}
                  onClick={handleExportResults}
                >
                  <IconDownload className="size-4" />
                  Download CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {hasAttempts ? (
            <>
              {classroomBrief ? (
                <ClassroomBriefCard brief={classroomBrief} />
              ) : null}
              <ResultStudentSearch
                matchedAttempts={filteredAttemptRows.length}
                matchedStudents={filteredStudents.length}
                onClear={() => setStudentSearch('')}
                onSearch={setStudentSearch}
                onSortChange={updateStudentSort}
                sort={studentSort}
                value={studentSearch}
              />
            </>
          ) : null}

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

          {data.analysis.perItem.length > 0 ? (
            <Card className="rounded-lg">
              <CardHeader>
                <CardTitle>
                  <h2 className="text-lg font-semibold">Item performance</h2>
                </CardTitle>
                <CardDescription>
                  <p>
                    Review every prompt from the frozen assignment snapshot,
                    including submitted counts, correct rates, and answer notes.
                  </p>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <ItemPerformanceSortControl
                    onSortChange={updateItemPerformanceSort}
                    sort={itemPerformanceSort}
                  />
                  <ItemPerformanceTable items={sortedPerformanceItems} />
                </div>
              </CardContent>
            </Card>
          ) : null}

          {data.analysis.students.length > 0 ? (
            <Card className="rounded-lg">
              <CardHeader>
                <CardTitle>
                  <h2 className="text-lg font-semibold">Student summary</h2>
                </CardTitle>
                <CardDescription>
                  <p>
                    Sort students by review priority, best score, name, or
                    attempt volume before reading every submitted answer.
                  </p>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredStudents.length > 0 ? (
                  <StudentSummaryTable students={filteredStudents} />
                ) : (
                  <NoMatchingStudents />
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
              {filteredAttemptRows.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Accuracy</TableHead>
                      <TableHead>Answered</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttemptRows.map(({ attempt, review }) => (
                      <TableRow key={attempt.id}>
                        <TableCell>
                          {review?.studentLabel ||
                            attempt.studentName ||
                            'Anonymous student'}
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
                          {formatAttemptDuration(
                            attempt.resultJson?.durationSeconds ?? 0
                          )}
                        </TableCell>
                        <TableCell>
                          {formatAssignmentResultDate(attempt.completedAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : data.attempts.length > 0 ? (
                <NoMatchingStudents />
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
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <CardTitle>
                      <h2 className="text-lg font-semibold">Answer review</h2>
                    </CardTitle>
                    <CardDescription>
                      <p>
                        Item-level answers are scored from the frozen assignment
                        snapshot, so teacher edits never change historical
                        results.
                      </p>
                    </CardDescription>
                  </div>
                  <AttemptReviewFilterControl
                    filter={attemptReviewFilter}
                    onFilterChange={updateAttemptReviewFilter}
                  />
                </div>
                <CardDescription>
                  <p>
                    Showing {filteredAttemptReviews.length} of{' '}
                    {data.analysis.attempts.length}{' '}
                    {data.analysis.attempts.length === 1
                      ? 'submission'
                      : 'submissions'}
                    .
                  </p>
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {filteredAttemptReviews.length > 0 ? (
                  filteredAttemptReviews.map((attempt) => (
                    <AttemptReviewCard key={attempt.id} attempt={attempt} />
                  ))
                ) : (
                  <NoMatchingStudents />
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}
    </DashboardLayout>
  );
}

function ClassroomBriefCard({
  brief,
}: {
  brief: NonNullable<ReturnType<typeof buildAssignmentClassroomBrief>>;
}) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconClipboardText className="size-5 text-primary" />
          <CardTitle>
            <h2 className="text-lg font-semibold">Classroom brief</h2>
          </CardTitle>
        </div>
        <CardDescription>
          <p>
            A compact class-ready summary built from the frozen assignment
            snapshot and submitted attempts.
          </p>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-muted/20 p-4">
          <h3 className="font-medium text-sm">Class review focus</h3>
          <div className="mt-3 grid gap-3">
            {brief.focusItems.length > 0 ? (
              brief.focusItems.map((item, index) => (
                <div key={item.itemId} className="grid gap-1 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="min-w-0 font-medium">
                      {index + 1}. {item.prompt}
                    </p>
                    <Badge variant="outline" className="rounded-md">
                      {item.correctRate}%
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {item.correctCount}/{item.submittedCount} correct
                  </p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                No submitted item data yet.
              </p>
            )}
          </div>
        </div>
        <div className="rounded-lg border bg-muted/20 p-4">
          <h3 className="font-medium text-sm">Student follow-up</h3>
          <div className="mt-3 grid gap-3">
            {brief.followUpStudents.length > 0 ? (
              brief.followUpStudents.map((student) => (
                <div
                  key={student.studentKey}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {student.studentLabel}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Latest {student.latestAccuracy}% · best{' '}
                      {student.bestAccuracy}%
                    </p>
                  </div>
                  <Badge variant="secondary" className="rounded-md">
                    {student.needsReviewCount} review
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                No student-specific review needs yet.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ResultStudentSearch({
  matchedAttempts,
  matchedStudents,
  onClear,
  onSearch,
  onSortChange,
  sort,
  value,
}: {
  matchedAttempts: number;
  matchedStudents: number;
  onClear: () => void;
  onSearch: (value: string) => void;
  onSortChange: (sort: StudentSummarySort) => void;
  sort: StudentSummarySort;
  value: string;
}) {
  const hasSearch = Boolean(normalizeResultSearch(value));
  const summary = hasSearch
    ? `${matchedStudents} ${matchedStudents === 1 ? 'student' : 'students'} · ${matchedAttempts} ${matchedAttempts === 1 ? 'attempt' : 'attempts'}`
    : 'All students';

  return (
    <section className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[minmax(0,1fr)_12rem_auto] md:items-end">
      <div className="grid gap-2">
        <label
          htmlFor="assignment-result-search"
          className="font-medium text-sm"
        >
          Find student
        </label>
        <div className="relative max-w-xl">
          <IconSearch className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
          <Input
            id="assignment-result-search"
            value={value}
            placeholder="Search by student name"
            className="pl-9 pr-9"
            onChange={(event) => onSearch(event.currentTarget.value)}
          />
          {value ? (
            <button
              type="button"
              aria-label="Clear student search"
              className="-translate-y-1/2 absolute top-1/2 right-3 text-muted-foreground transition-colors hover:text-foreground"
              onClick={onClear}
            >
              <IconX className="size-4" />
            </button>
          ) : null}
        </div>
      </div>
      <div className="grid gap-2">
        <label htmlFor="student-summary-sort" className="font-medium text-sm">
          Sort students
        </label>
        <NativeSelect
          id="student-summary-sort"
          value={sort}
          onChange={(event) =>
            onSortChange(event.currentTarget.value as StudentSummarySort)
          }
        >
          {studentSummarySortOptions.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <p className="text-sm text-muted-foreground md:text-right">{summary}</p>
    </section>
  );
}

function NoMatchingStudents() {
  return (
    <div className="rounded-lg border border-dashed bg-muted/20 p-6">
      <h2 className="text-base font-semibold">No matching students.</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Clear the search or try another student name from this assignment.
      </p>
    </div>
  );
}

function StudentSummaryTable({
  students,
}: {
  students: NonNullable<
    ReturnType<typeof useAssignmentResults>['data']
  >['analysis']['students'];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Attempts</TableHead>
          <TableHead>Latest</TableHead>
          <TableHead>Average</TableHead>
          <TableHead>Best</TableHead>
          <TableHead>Needs review</TableHead>
          <TableHead>Last submitted</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <TableRow key={student.studentLabel}>
            <TableCell>{student.studentLabel}</TableCell>
            <TableCell>{student.attempts}</TableCell>
            <TableCell>{student.latestAccuracy}%</TableCell>
            <TableCell>{student.averageAccuracy}%</TableCell>
            <TableCell>{student.bestAccuracy}%</TableCell>
            <TableCell>{student.needsReviewCount}</TableCell>
            <TableCell>
              {formatAssignmentResultDate(student.lastCompletedAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function ItemPerformanceSortControl({
  onSortChange,
  sort,
}: {
  onSortChange: (sort: ItemPerformanceSort) => void;
  sort: ItemPerformanceSort;
}) {
  return (
    <div className="flex flex-col gap-2 sm:w-52">
      <label htmlFor="item-performance-sort" className="font-medium text-sm">
        Sort items
      </label>
      <NativeSelect
        id="item-performance-sort"
        value={sort}
        onChange={(event) =>
          onSortChange(event.currentTarget.value as ItemPerformanceSort)
        }
      >
        {itemPerformanceSortOptions.map((option) => (
          <NativeSelectOption key={option.value} value={option.value}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  );
}

function AttemptReviewFilterControl({
  filter,
  onFilterChange,
}: {
  filter: AttemptReviewFilter;
  onFilterChange: (filter: AttemptReviewFilter) => void;
}) {
  return (
    <div className="flex flex-col gap-2 sm:w-48">
      <label htmlFor="attempt-review-filter" className="font-medium text-sm">
        Review view
      </label>
      <NativeSelect
        id="attempt-review-filter"
        value={filter}
        onChange={(event) =>
          onFilterChange(event.currentTarget.value as AttemptReviewFilter)
        }
      >
        {attemptReviewFilterOptions.map((option) => (
          <NativeSelectOption key={option.value} value={option.value}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  );
}

function ItemPerformanceTable({
  items,
}: {
  items: NonNullable<
    ReturnType<typeof useAssignmentResults>['data']
  >['analysis']['perItem'];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Correct rate</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead>Expected</TableHead>
          <TableHead>Accepted</TableHead>
          <TableHead>Explanation</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item, index) => (
          <TableRow key={item.itemId}>
            <TableCell className="max-w-80">
              <span className="font-medium">{index + 1}.</span> {item.prompt}
            </TableCell>
            <TableCell>{item.kind}</TableCell>
            <TableCell>{item.correctRate}%</TableCell>
            <TableCell>
              {item.correctCount}/{item.submittedCount}
            </TableCell>
            <TableCell>{item.expectedAnswer || '-'}</TableCell>
            <TableCell>
              {formatAcceptedAnswerAlternatives(item.acceptedAnswers)}
            </TableCell>
            <TableCell className="max-w-72">
              {item.explanation || '-'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
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
      {item.acceptedAnswers.length > 1 ? (
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Accepted: {formatAcceptedAnswerAlternatives(item.acceptedAnswers)}
        </p>
      ) : null}
      {item.explanation ? (
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          {item.explanation}
        </p>
      ) : null}
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
            {formatAssignmentResultDate(attempt.completedAt)}
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
            {answer.acceptedAnswers.length > 1 ? (
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Accepted answers:{' '}
                {formatAcceptedAnswerAlternatives(answer.acceptedAnswers)}
              </p>
            ) : null}
            {answer.explanation ? (
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {answer.explanation}
              </p>
            ) : null}
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
