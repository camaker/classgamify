import { buildAssignmentClassroomBrief } from '@/assignments/classroom-brief';
import {
  type AttemptReviewFilter,
  type AssignmentResultEmptyState,
  type AssignmentResultActionButton,
  type ItemPerformanceSort,
  type StudentSummarySort,
  buildAssignmentResultActionButtons,
  buildAssignmentResultActionPayload,
  buildAssignmentResultActionState,
  buildAssignmentResultControlSearchState,
  buildAssignmentResultHeaderView,
  buildAssignmentResultSectionState,
  buildAssignmentResultRouteSearch,
  buildAssignmentResultViewModel,
  getAssignmentResultCompletedAttemptCount,
  filterAssignmentResultCompletedAttemptRows,
  assignmentResultPageCopy,
  assignmentResultSearchCopy,
  assignmentResultSectionCopy,
  assignmentResultTableHeaders,
  attemptReviewFilterOptions,
  buildAssignmentAttemptAnswerReviewView,
  buildAssignmentAttemptReviewCardView,
  buildAssignmentAttemptRowDisplay,
  buildAssignmentClassroomBriefFocusItemView,
  buildAssignmentClassroomBriefFollowUpStudentView,
  buildAssignmentItemAnalysisCardView,
  buildAssignmentItemPerformanceRowView,
  buildAssignmentResultMetricItems,
  buildAssignmentStudentSummaryRowView,
  itemPerformanceSortOptions,
  resolveAssignmentResultViewState,
  studentSummarySortOptions,
} from '@/assignments/result-view';
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
import { useMemo } from 'react';
import { toast } from 'sonner';

const resultMetricIconByKey = {
  'average-accuracy': IconChartBar,
  'average-points': IconClock,
  'average-time': IconClock,
  closes: IconCalendarTime,
  completions: IconUsers,
} as const;

const resultActionIconByAction = {
  'copy-brief': IconClipboardText,
  'copy-follow-up': IconCopy,
  'copy-item-review': IconCopy,
  'copy-reteach-plan': IconCopy,
  'export-csv': IconDownload,
} as const;

export const Route = createFileRoute('/dashboard/assignments/$assignmentId')({
  validateSearch: buildAssignmentResultRouteSearch,
  component: AssignmentResultsPage,
});

function AssignmentResultsPage() {
  const { assignmentId } = Route.useParams();
  const search = Route.useSearch();
  const { itemSort, review, sort, student } = search;
  const navigate = useNavigate({
    from: '/dashboard/assignments/$assignmentId',
  });
  const { data, isError, isLoading } = useAssignmentResults(assignmentId);
  const {
    attemptReviewFilter,
    itemPerformanceSort,
    studentSearch,
    studentSort,
  } = resolveAssignmentResultViewState(search);
  const headerView = data ? buildAssignmentResultHeaderView(data) : null;
  const title =
    headerView?.assignmentTitle ?? assignmentResultPageCopy.defaultTitle;
  const completedAttempts = useMemo(
    () =>
      filterAssignmentResultCompletedAttemptRows({
        attempts: data?.attempts ?? [],
        reviews: data?.analysis.attempts ?? [],
      }),
    [data?.analysis.attempts, data?.attempts]
  );
  const resultView = useMemo(
    () =>
      buildAssignmentResultViewModel({
        attemptReviewFilter,
        attempts: completedAttempts,
        itemPerformanceSort,
        items: data?.analysis.perItem ?? [],
        reviews: data?.analysis.attempts ?? [],
        search: studentSearch,
        studentSort,
        students: data?.analysis.students ?? [],
      }),
    [
      attemptReviewFilter,
      data?.analysis.attempts,
      data?.analysis.perItem,
      data?.analysis.students,
      completedAttempts,
      itemPerformanceSort,
      studentSearch,
      studentSort,
    ]
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
      search: buildAssignmentResultControlSearchState({
        current: { itemSort, review, sort, student },
        update: {
          control: 'item-performance-sort',
          value: nextSort,
        },
      }),
    });
  }

  function updateStudentSort(nextSort: StudentSummarySort) {
    void navigate({
      replace: true,
      search: buildAssignmentResultControlSearchState({
        current: { itemSort, review, sort, student },
        update: {
          control: 'student-sort',
          value: nextSort,
        },
      }),
    });
  }

  function updateAttemptReviewFilter(nextFilter: AttemptReviewFilter) {
    void navigate({
      replace: true,
      search: buildAssignmentResultControlSearchState({
        current: { itemSort, review, sort, student },
        update: {
          control: 'attempt-review-filter',
          value: nextFilter,
        },
      }),
    });
  }

  function updateStudentSearch(nextSearch: string) {
    void navigate({
      replace: true,
      search: buildAssignmentResultControlSearchState({
        current: { itemSort, review, sort, student },
        update: {
          control: 'student-search',
          value: nextSearch,
        },
      }),
    });
  }

  async function handleResultAction(
    actionButton: AssignmentResultActionButton
  ) {
    if (!data || actionButton.gate.type === 'blocked') {
      toast.error(
        actionButton.gate.type === 'blocked'
          ? actionButton.gate.message
          : actionButton.failureMessage
      );
      return;
    }

    try {
      const payload = buildAssignmentResultActionPayload({
        actionButton,
        assignmentTitle: data.assignment.title,
        classroomBriefText: classroomBrief?.text,
        exportData: data,
        items: data.analysis.perItem,
        students: data.analysis.students,
      });

      if (payload.kind === 'download-csv') {
        const csvUrl = `data:text/csv;charset=utf-8,${encodeURIComponent(
          payload.csv
        )}`;
        await downloadFile(csvUrl, payload.filename);
      } else {
        await copyTextToClipboard(payload.text);
      }
      toast.success(actionButton.successMessage);
    } catch {
      toast.error(actionButton.failureMessage);
    }
  }

  const resultMetricItems = data
    ? buildAssignmentResultMetricItems({
        averageDurationSeconds: data.stats.averageDurationSeconds,
        averagePoints: data.stats.averagePoints,
        averageScore: data.stats.averageScore,
        completions: data.stats.completions,
        expiresAt: data.assignment.expiresAt,
      })
    : [];
  const completedAttemptCount = getAssignmentResultCompletedAttemptCount(
    data?.stats.completions
  );
  const completedAttemptReviewCount = Math.min(
    completedAttemptCount,
    data?.analysis.attempts.length ?? 0
  );
  const resultActionState = buildAssignmentResultActionState({
    attemptCount: completedAttemptCount,
    classroomBriefReady: Boolean(classroomBrief),
    itemCount: data?.analysis.perItem.length ?? 0,
    studentCount: data?.analysis.students.length ?? 0,
  });
  const resultActionButtons =
    buildAssignmentResultActionButtons(resultActionState);
  const resultSectionState = buildAssignmentResultSectionState({
    attemptCount: completedAttemptCount,
    attemptReviewCount: completedAttemptReviewCount,
    classroomBriefReady: Boolean(classroomBrief),
    itemCount: data?.analysis.perItem.length ?? 0,
    studentCount: data?.analysis.students.length ?? 0,
  });
  return (
    <DashboardLayout
      breadcrumbs={[
        {
          label: assignmentResultPageCopy.breadcrumbDashboard,
          href: Routes.Dashboard,
        },
        {
          label: assignmentResultPageCopy.breadcrumbAssignments,
          href: Routes.DashboardAssignments,
        },
        { label: title, isCurrentPage: true },
      ]}
      title={title}
      description={assignmentResultPageCopy.description}
    >
      {isLoading ? (
        <Card className="min-h-56 rounded-lg" />
      ) : isError || !data ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {assignmentResultPageCopy.loadErrorMessage}
        </div>
      ) : (
        <div className="grid gap-6">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {resultMetricItems.map((metric) => (
              <ResultMetric
                key={metric.key}
                icon={resultMetricIconByKey[metric.key]}
                label={metric.label}
                value={metric.value}
              />
            ))}
          </section>

          <Card className="rounded-lg">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-md">
                  {headerView.statusLabel}
                </Badge>
                <Badge variant="outline" className="rounded-md">
                  {headerView.templateLabel}
                </Badge>
              </div>
              <CardTitle>
                <h2 className="text-lg font-semibold">
                  {headerView.activityTitle}
                </h2>
              </CardTitle>
              <CardDescription>
                <p>{headerView.activityDescription}</p>
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <AssignmentSettingsSummary
                expiresAt={data.assignment.expiresAt}
                settings={data.assignment.settingsJson}
              />
              <div className="flex flex-col gap-3 sm:flex-row">
                {headerView.shareAction.isAvailable ? (
                  <Link
                    to="/play/$shareId"
                    params={{ shareId: headerView.shareAction.shareSlug }}
                    className={cn(buttonVariants(), 'w-full sm:w-auto')}
                  >
                    <IconPlayerPlay className="size-4" />
                    {headerView.shareAction.label}
                  </Link>
                ) : (
                  <Button type="button" className="w-full sm:w-auto" disabled>
                    <IconPlayerPlay className="size-4" />
                    {headerView.shareAction.label}
                  </Button>
                )}
                <div className="flex min-h-8 items-center gap-2 rounded-lg border bg-muted/30 px-3 text-sm text-muted-foreground">
                  <IconShare3 className="size-4" />
                  {headerView.shareAction.sharePath}
                </div>
                <CopyAssignmentShareLinkButton
                  disabled={!headerView.shareAction.isAvailable}
                  disabledMessage={headerView.shareAction.disabledReason}
                  shareSlug={headerView.shareAction.shareSlug}
                  className="w-full bg-background sm:w-auto"
                />
                {headerView.shareAction.disabledReason ? (
                  <p className="basis-full text-sm text-muted-foreground">
                    {headerView.shareAction.disabledReason}
                  </p>
                ) : null}
                {resultActionButtons.map((actionButton) => {
                  const Icon = resultActionIconByAction[actionButton.action];

                  return (
                    <Button
                      key={actionButton.action}
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto"
                      disabled={actionButton.disabled}
                      onClick={() => void handleResultAction(actionButton)}
                    >
                      <Icon className="size-4" />
                      {actionButton.label}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {resultSectionState.showStudentSearch ? (
            <>
              {resultSectionState.showClassroomBrief && classroomBrief ? (
                <ClassroomBriefCard brief={classroomBrief} />
              ) : null}
              <ResultStudentSearch
                summary={resultView.resultSearchSummary}
                onClear={() => updateStudentSearch('')}
                onSearch={updateStudentSearch}
                onSortChange={updateStudentSort}
                sort={studentSort}
                value={studentSearch}
              />
            </>
          ) : null}

          {resultSectionState.showReteachPriorities ? (
            <Card className="rounded-lg">
              <CardHeader>
                <CardTitle>
                  <h2 className="text-lg font-semibold">
                    {assignmentResultSectionCopy.reteachPriorities.title}
                  </h2>
                </CardTitle>
                <CardDescription>
                  <p>
                    {assignmentResultSectionCopy.reteachPriorities.description}
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
                    {assignmentResultSectionCopy.reteachPriorities.emptyMessage}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}

          {resultSectionState.showItemPerformance ? (
            <Card className="rounded-lg">
              <CardHeader>
                <CardTitle>
                  <h2 className="text-lg font-semibold">
                    {assignmentResultSectionCopy.itemPerformance.title}
                  </h2>
                </CardTitle>
                <CardDescription>
                  <p>
                    {assignmentResultSectionCopy.itemPerformance.description}
                  </p>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <ItemPerformanceSortControl
                    onSortChange={updateItemPerformanceSort}
                    sort={itemPerformanceSort}
                  />
                  <ItemPerformanceTable
                    items={resultView.sortedPerformanceItems}
                  />
                </div>
              </CardContent>
            </Card>
          ) : null}

          {resultSectionState.showStudentSummary ? (
            <Card className="rounded-lg">
              <CardHeader>
                <CardTitle>
                  <h2 className="text-lg font-semibold">
                    {assignmentResultSectionCopy.studentSummary.title}
                  </h2>
                </CardTitle>
                <CardDescription>
                  <p>
                    {assignmentResultSectionCopy.studentSummary.description}
                  </p>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {resultView.filteredStudents.length > 0 ? (
                  <StudentSummaryTable students={resultView.filteredStudents} />
                ) : (
                  <ResultEmptyState
                    state={resultView.emptyStates.studentSummary}
                  />
                )}
              </CardContent>
            </Card>
          ) : null}

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>
                <h2 className="text-lg font-semibold">
                  {assignmentResultSectionCopy.studentAttempts.title}
                </h2>
              </CardTitle>
              <CardDescription>
                <p>{assignmentResultSectionCopy.studentAttempts.description}</p>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {resultView.filteredAttemptRows.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      {assignmentResultTableHeaders.studentAttempts.map(
                        (header) => (
                          <TableHead key={header}>{header}</TableHead>
                        )
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resultView.filteredAttemptRows.map(
                      ({ attempt, review, studentLabel }) => {
                        const rowDisplay = buildAssignmentAttemptRowDisplay({
                          attempt,
                          review,
                          studentLabel,
                          timeLimitSeconds:
                            data?.assignment.settingsJson.timeLimitSeconds,
                        });

                        return (
                          <TableRow key={attempt.id}>
                            <TableCell>{rowDisplay.studentLabel}</TableCell>
                            <TableCell>{rowDisplay.scoreLabel}</TableCell>
                            <TableCell>{rowDisplay.accuracyLabel}</TableCell>
                            <TableCell>{rowDisplay.answeredLabel}</TableCell>
                            <TableCell>{rowDisplay.durationLabel}</TableCell>
                            <TableCell>{rowDisplay.submittedAtLabel}</TableCell>
                          </TableRow>
                        );
                      }
                    )}
                  </TableBody>
                </Table>
              ) : (
                <ResultEmptyState state={resultView.emptyStates.attemptRows} />
              )}
            </CardContent>
          </Card>

          {resultSectionState.showAnswerReview ? (
            <Card className="rounded-lg">
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <CardTitle>
                      <h2 className="text-lg font-semibold">
                        {assignmentResultSectionCopy.answerReview.title}
                      </h2>
                    </CardTitle>
                    <CardDescription>
                      <p>
                        {assignmentResultSectionCopy.answerReview.description}
                      </p>
                    </CardDescription>
                  </div>
                  <AttemptReviewFilterControl
                    filter={attemptReviewFilter}
                    onFilterChange={updateAttemptReviewFilter}
                  />
                </div>
                <CardDescription>
                  <p>{resultView.attemptReviewSubmissionSummary}</p>
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {resultView.filteredAttemptReviews.length > 0 ? (
                  resultView.filteredAttemptReviews.map((attempt) => (
                    <AttemptReviewCard key={attempt.id} attempt={attempt} />
                  ))
                ) : (
                  <ResultEmptyState
                    state={resultView.emptyStates.attemptReview}
                  />
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
            <h2 className="text-lg font-semibold">
              {assignmentResultSectionCopy.classroomBrief.title}
            </h2>
          </CardTitle>
        </div>
        <CardDescription>
          <p>{assignmentResultSectionCopy.classroomBrief.description}</p>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-muted/20 p-4">
          <h3 className="font-medium text-sm">
            {assignmentResultSectionCopy.classReviewFocus.title}
          </h3>
          <div className="mt-3 grid gap-3">
            {brief.focusItems.length > 0 ? (
              brief.focusItems.map((item, index) => {
                const itemView = buildAssignmentClassroomBriefFocusItemView({
                  index,
                  item,
                });

                return (
                  <div key={item.itemId} className="grid gap-1 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <p className="min-w-0 font-medium">
                        {itemView.itemNumberLabel} {itemView.prompt}
                      </p>
                      <Badge variant="outline" className="rounded-md">
                        {itemView.correctRateLabel}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {itemView.correctSummaryLabel}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-muted-foreground text-sm">
                {assignmentResultSectionCopy.classReviewFocus.emptyMessage}
              </p>
            )}
          </div>
        </div>
        <div className="rounded-lg border bg-muted/20 p-4">
          <h3 className="font-medium text-sm">
            {assignmentResultSectionCopy.studentFollowUp.title}
          </h3>
          <div className="mt-3 grid gap-3">
            {brief.followUpStudents.length > 0 ? (
              brief.followUpStudents.map((student) => {
                const studentView =
                  buildAssignmentClassroomBriefFollowUpStudentView(student);

                return (
                  <div
                    key={student.studentKey}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {studentView.studentLabel}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {studentView.accuracyLabel}
                      </p>
                    </div>
                    <Badge variant="secondary" className="rounded-md">
                      {studentView.needsReviewLabel}
                    </Badge>
                  </div>
                );
              })
            ) : (
              <p className="text-muted-foreground text-sm">
                {assignmentResultSectionCopy.studentFollowUp.emptyMessage}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ResultStudentSearch({
  onClear,
  onSearch,
  onSortChange,
  sort,
  summary,
  value,
}: {
  onClear: () => void;
  onSearch: (value: string) => void;
  onSortChange: (sort: StudentSummarySort) => void;
  sort: StudentSummarySort;
  summary: string;
  value: string;
}) {
  return (
    <section className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[minmax(0,1fr)_12rem_auto] md:items-end">
      <div className="grid gap-2">
        <label
          htmlFor="assignment-result-search"
          className="font-medium text-sm"
        >
          {assignmentResultSearchCopy.findStudentLabel}
        </label>
        <div className="relative max-w-xl">
          <IconSearch className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
          <Input
            id="assignment-result-search"
            value={value}
            placeholder={assignmentResultSearchCopy.placeholder}
            className="pl-9 pr-9"
            onChange={(event) => onSearch(event.currentTarget.value)}
          />
          {value ? (
            <button
              type="button"
              aria-label={assignmentResultSearchCopy.clearStudentSearchLabel}
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
          {assignmentResultSearchCopy.sortStudentsLabel}
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

function ResultEmptyState({
  state,
}: {
  state: AssignmentResultEmptyState | undefined;
}) {
  if (!state) return null;

  return (
    <div className="rounded-lg border border-dashed bg-muted/20 p-6">
      <h2 className="text-base font-semibold">{state.title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {state.description}
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
          {assignmentResultTableHeaders.studentSummary.map((header) => (
            <TableHead key={header}>{header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => {
          const rowView = buildAssignmentStudentSummaryRowView(student);
          return (
            <TableRow key={student.studentKey}>
              <TableCell>{rowView.studentLabel}</TableCell>
              <TableCell>{rowView.attemptsLabel}</TableCell>
              <TableCell>{rowView.latestAccuracyLabel}</TableCell>
              <TableCell>{rowView.averageAccuracyLabel}</TableCell>
              <TableCell>{rowView.bestAccuracyLabel}</TableCell>
              <TableCell>{rowView.needsReviewLabel}</TableCell>
              <TableCell>{rowView.lastSubmittedLabel}</TableCell>
            </TableRow>
          );
        })}
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
        {assignmentResultSearchCopy.sortItemsLabel}
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
        {assignmentResultSearchCopy.reviewViewLabel}
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
          {assignmentResultTableHeaders.itemPerformance.map((header) => (
            <TableHead key={header}>{header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item, index) => {
          const rowView = buildAssignmentItemPerformanceRowView({
            index,
            item,
          });

          return (
            <TableRow key={item.itemId}>
              <TableCell className="max-w-80">
                <span className="font-medium">{rowView.itemNumberLabel}</span>{' '}
                {rowView.prompt}
              </TableCell>
              <TableCell>{rowView.kindLabel}</TableCell>
              <TableCell>{rowView.correctRateLabel}</TableCell>
              <TableCell>{rowView.submittedLabel}</TableCell>
              <TableCell>{rowView.expectedAnswerText}</TableCell>
              <TableCell>{rowView.acceptedAnswersText}</TableCell>
              <TableCell className="max-w-72">
                {rowView.explanationText}
              </TableCell>
            </TableRow>
          );
        })}
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
  const itemView = buildAssignmentItemAnalysisCardView(item);

  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="flex items-center justify-between gap-3">
        <Badge variant="outline" className="rounded-md">
          {itemView.kindLabel}
        </Badge>
        <span className="text-sm font-semibold">
          {itemView.correctRateLabel}
        </span>
      </div>
      <p className="mt-3 line-clamp-2 text-sm font-medium">{itemView.prompt}</p>
      <Progress
        value={itemView.correctRateProgressValue}
        className="mt-3 h-2"
      />
      <p className="mt-2 text-xs text-muted-foreground">
        {itemView.correctSummaryLabel} · {itemView.expectedAnswerLabel}:{' '}
        {itemView.expectedAnswerText}
      </p>
      {itemView.acceptedAnswersText ? (
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {itemView.acceptedAnswersLabel}: {itemView.acceptedAnswersText}
        </p>
      ) : null}
      {itemView.explanationText ? (
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          {itemView.explanationText}
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
  const cardView = buildAssignmentAttemptReviewCardView(attempt);

  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <IconListDetails className="size-4 text-primary" />
            <p className="font-medium text-sm">{cardView.studentLabel}</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {cardView.submittedAtLabel}
          </p>
        </div>
        <Badge variant="secondary" className="rounded-md">
          {cardView.badgeLabel}
        </Badge>
      </div>
      <div className="mt-3 grid gap-2">
        {attempt.answers.map((answer, index) => {
          const answerView = buildAssignmentAttemptAnswerReviewView({
            answer,
            index,
          });

          return (
            <div
              key={`${attempt.id}-${answer.itemId}`}
              className="rounded-lg border bg-muted/20 p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="min-w-0 text-sm font-medium">
                  {answerView.promptLabel}
                </p>
                <Badge
                  variant={
                    answerView.statusTone === 'correct'
                      ? 'secondary'
                      : 'outline'
                  }
                  className="rounded-md"
                >
                  {answerView.statusLabel}
                </Badge>
              </div>
              <div className="mt-2 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                <p>
                  {answerView.studentAnswerLabel}:{' '}
                  {answerView.studentAnswerText}
                </p>
                <p>
                  {answerView.expectedAnswerLabel}:{' '}
                  {answerView.expectedAnswerText}
                </p>
              </div>
              {answerView.acceptedAnswersText ? (
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {answerView.acceptedAnswersLabel}:{' '}
                  {answerView.acceptedAnswersText}
                </p>
              ) : null}
              {answerView.explanationText ? (
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {answerView.explanationText}
                </p>
              ) : null}
            </div>
          );
        })}
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
