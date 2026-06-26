import {
  type AttemptReviewFilter,
  type AssignmentResultEmptyState,
  type AssignmentResultActionButton,
  type ItemPerformanceSort,
  type StudentSummarySort,
  buildAssignmentResultActionPayload,
  buildAssignmentResultControlRouteSearch,
  buildAssignmentResultRouteSearch,
  buildAssignmentResultsPageViewModel,
  assignmentResultPageCopy,
  assignmentResultSearchCopy,
  assignmentResultSectionCopy,
  assignmentResultTableHeaders,
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
  IconPrinter,
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

type AssignmentResultControlUpdate = Parameters<
  typeof buildAssignmentResultControlRouteSearch
>[0]['update'];

export const Route = createFileRoute('/dashboard/assignments/$assignmentId')({
  validateSearch: buildAssignmentResultRouteSearch,
  component: AssignmentResultsPage,
});

function AssignmentResultsPage() {
  const { assignmentId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate({
    from: '/dashboard/assignments/$assignmentId',
  });
  const { data, isError, isLoading } = useAssignmentResults(assignmentId);
  const pageView = useMemo(
    () =>
      buildAssignmentResultsPageViewModel({
        data,
        search,
      }),
    [data, search]
  );
  function updateResultControl(update: AssignmentResultControlUpdate) {
    void navigate({
      replace: true,
      search: buildAssignmentResultControlRouteSearch({
        current: search,
        update,
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
        classroomBriefText: pageView.classroomBrief?.text,
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

  return (
    <DashboardLayout
      breadcrumbs={pageView.breadcrumbs}
      title={pageView.title}
      description={pageView.description}
    >
      {isLoading ? (
        <Card className="min-h-56 rounded-lg" />
      ) : isError || !data ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {pageView.loadErrorMessage}
        </div>
      ) : (
        <LoadedAssignmentResultsPage
          assignmentId={assignmentId}
          data={data}
          pageView={pageView}
          onControlChange={updateResultControl}
          onResultAction={handleResultAction}
        />
      )}
    </DashboardLayout>
  );
}

function LoadedAssignmentResultsPage({
  assignmentId,
  data,
  onControlChange,
  onResultAction,
  pageView,
}: {
  assignmentId: string;
  data: NonNullable<ReturnType<typeof useAssignmentResults>['data']>;
  onControlChange: (update: AssignmentResultControlUpdate) => void;
  onResultAction: (actionButton: AssignmentResultActionButton) => Promise<void>;
  pageView: ReturnType<typeof buildAssignmentResultsPageViewModel>;
}) {
  const headerView = pageView.headerView;
  if (!headerView) return null;

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {pageView.metricItems.map((metric) => (
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
                params={{
                  shareId: headerView.shareAction.shareSlug,
                }}
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
            <Link
              to="/print/assignments/$assignmentId"
              params={{ assignmentId }}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'w-full bg-background sm:w-auto'
              )}
            >
              <IconPrinter className="size-4" />
              {assignmentResultPageCopy.printWorksheetLabel}
            </Link>
            {headerView.shareAction.disabledReason ? (
              <p className="basis-full text-sm text-muted-foreground">
                {headerView.shareAction.disabledReason}
              </p>
            ) : null}
            {pageView.actionButtons.map((actionButton) => {
              const Icon = resultActionIconByAction[actionButton.action];

              return (
                <Button
                  key={actionButton.action}
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  disabled={actionButton.disabled}
                  onClick={() => void onResultAction(actionButton)}
                >
                  <Icon className="size-4" />
                  {actionButton.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {pageView.sectionState.showStudentSearch ? (
        <>
          {pageView.sectionState.showClassroomBrief &&
          pageView.classroomBrief ? (
            <ClassroomBriefCard brief={pageView.classroomBrief} />
          ) : null}
          <ResultStudentSearch
            onClear={() =>
              onControlChange({ control: 'student-search', value: '' })
            }
            onSearch={(value) =>
              onControlChange({ control: 'student-search', value })
            }
            onSortChange={(value) =>
              onControlChange({ control: 'student-sort', value })
            }
            view={pageView.controlViews.studentSearch}
          />
        </>
      ) : null}

      {pageView.sectionState.showReteachPriorities ? (
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>
              <h2 className="text-lg font-semibold">
                {assignmentResultSectionCopy.reteachPriorities.title}
              </h2>
            </CardTitle>
            <CardDescription>
              <p>{assignmentResultSectionCopy.reteachPriorities.description}</p>
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {pageView.itemAnalysisCardViews.length > 0 ? (
              pageView.itemAnalysisCardViews.map((itemView) => (
                <ItemAnalysisCard key={itemView.id} itemView={itemView} />
              ))
            ) : (
              <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground md:col-span-3">
                {assignmentResultSectionCopy.reteachPriorities.emptyMessage}
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {pageView.sectionState.showItemPerformance ? (
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>
              <h2 className="text-lg font-semibold">
                {assignmentResultSectionCopy.itemPerformance.title}
              </h2>
            </CardTitle>
            <CardDescription>
              <p>{assignmentResultSectionCopy.itemPerformance.description}</p>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <ItemPerformanceSortControl
                onSortChange={(value) =>
                  onControlChange({
                    control: 'item-performance-sort',
                    value,
                  })
                }
                view={pageView.controlViews.itemPerformanceSort}
              />
              <ItemPerformanceTable items={pageView.itemPerformanceRowViews} />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {pageView.sectionState.showStudentSummary ? (
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>
              <h2 className="text-lg font-semibold">
                {assignmentResultSectionCopy.studentSummary.title}
              </h2>
            </CardTitle>
            <CardDescription>
              <p>{assignmentResultSectionCopy.studentSummary.description}</p>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pageView.resultView.filteredStudents.length > 0 ? (
              <StudentSummaryTable students={pageView.studentSummaryRowViews} />
            ) : (
              <ResultEmptyState
                state={pageView.resultView.emptyStates.studentSummary}
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
          {pageView.resultView.filteredAttemptRows.length > 0 ? (
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
                {pageView.attemptRowViews.map((rowDisplay) => (
                  <TableRow key={rowDisplay.id}>
                    <TableCell>{rowDisplay.studentLabel}</TableCell>
                    <TableCell>{rowDisplay.scoreLabel}</TableCell>
                    <TableCell>{rowDisplay.accuracyLabel}</TableCell>
                    <TableCell>{rowDisplay.answeredLabel}</TableCell>
                    <TableCell>{rowDisplay.durationLabel}</TableCell>
                    <TableCell>{rowDisplay.submittedAtLabel}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <ResultEmptyState
              state={pageView.resultView.emptyStates.attemptRows}
            />
          )}
        </CardContent>
      </Card>

      {pageView.sectionState.showAnswerReview ? (
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
                  <p>{assignmentResultSectionCopy.answerReview.description}</p>
                </CardDescription>
              </div>
              <AttemptReviewFilterControl
                onFilterChange={(value) =>
                  onControlChange({
                    control: 'attempt-review-filter',
                    value,
                  })
                }
                view={pageView.controlViews.attemptReviewFilter}
              />
            </div>
            <CardDescription>
              <p>{pageView.resultView.attemptReviewSubmissionSummary}</p>
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {pageView.attemptReviewCardViews.length > 0 ? (
              pageView.attemptReviewCardViews.map((attemptView) => (
                <AttemptReviewCard
                  key={attemptView.id}
                  attemptView={attemptView}
                />
              ))
            ) : (
              <ResultEmptyState
                state={pageView.resultView.emptyStates.attemptReview}
              />
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function ClassroomBriefCard({
  brief,
}: {
  brief: NonNullable<
    ReturnType<typeof buildAssignmentResultsPageViewModel>['classroomBrief']
  >;
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
            {brief.focusItemViews.length > 0 ? (
              brief.focusItemViews.map((itemView) => (
                <div key={itemView.itemId} className="grid gap-1 text-sm">
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
              ))
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
            {brief.followUpStudentViews.length > 0 ? (
              brief.followUpStudentViews.map((studentView) => (
                <div
                  key={studentView.studentKey}
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
              ))
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
  view,
}: {
  onClear: () => void;
  onSearch: (value: string) => void;
  onSortChange: (sort: StudentSummarySort) => void;
  view: ReturnType<
    typeof buildAssignmentResultsPageViewModel
  >['controlViews']['studentSearch'];
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
            value={view.value}
            placeholder={assignmentResultSearchCopy.placeholder}
            className="pl-9 pr-9"
            onChange={(event) => onSearch(event.currentTarget.value)}
          />
          {view.hasSearchValue ? (
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
          value={view.sort}
          onChange={(event) =>
            onSortChange(event.currentTarget.value as StudentSummarySort)
          }
        >
          {view.sortOptions.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <p className="text-sm text-muted-foreground md:text-right">
        {view.summary}
      </p>
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
  students: ReturnType<
    typeof buildAssignmentResultsPageViewModel
  >['studentSummaryRowViews'];
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
        {students.map((rowView) => (
          <TableRow key={rowView.id}>
            <TableCell>{rowView.studentLabel}</TableCell>
            <TableCell>{rowView.attemptsLabel}</TableCell>
            <TableCell>{rowView.latestAccuracyLabel}</TableCell>
            <TableCell>{rowView.averageAccuracyLabel}</TableCell>
            <TableCell>{rowView.bestAccuracyLabel}</TableCell>
            <TableCell>{rowView.needsReviewLabel}</TableCell>
            <TableCell>{rowView.lastSubmittedLabel}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function ItemPerformanceSortControl({
  onSortChange,
  view,
}: {
  onSortChange: (sort: ItemPerformanceSort) => void;
  view: ReturnType<
    typeof buildAssignmentResultsPageViewModel
  >['controlViews']['itemPerformanceSort'];
}) {
  return (
    <div className="flex flex-col gap-2 sm:w-52">
      <label htmlFor="item-performance-sort" className="font-medium text-sm">
        {assignmentResultSearchCopy.sortItemsLabel}
      </label>
      <NativeSelect
        id="item-performance-sort"
        value={view.sort}
        onChange={(event) =>
          onSortChange(event.currentTarget.value as ItemPerformanceSort)
        }
      >
        {view.options.map((option) => (
          <NativeSelectOption key={option.value} value={option.value}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  );
}

function AttemptReviewFilterControl({
  onFilterChange,
  view,
}: {
  onFilterChange: (filter: AttemptReviewFilter) => void;
  view: ReturnType<
    typeof buildAssignmentResultsPageViewModel
  >['controlViews']['attemptReviewFilter'];
}) {
  return (
    <div className="flex flex-col gap-2 sm:w-48">
      <label htmlFor="attempt-review-filter" className="font-medium text-sm">
        {assignmentResultSearchCopy.reviewViewLabel}
      </label>
      <NativeSelect
        id="attempt-review-filter"
        value={view.filter}
        onChange={(event) =>
          onFilterChange(event.currentTarget.value as AttemptReviewFilter)
        }
      >
        {view.options.map((option) => (
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
  items: ReturnType<
    typeof buildAssignmentResultsPageViewModel
  >['itemPerformanceRowViews'];
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
        {items.map((rowView) => (
          <TableRow key={rowView.id}>
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
        ))}
      </TableBody>
    </Table>
  );
}

function ItemAnalysisCard({
  itemView,
}: {
  itemView: ReturnType<
    typeof buildAssignmentResultsPageViewModel
  >['itemAnalysisCardViews'][number];
}) {
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
  attemptView,
}: {
  attemptView: ReturnType<
    typeof buildAssignmentResultsPageViewModel
  >['attemptReviewCardViews'][number];
}) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <IconListDetails className="size-4 text-primary" />
            <p className="font-medium text-sm">{attemptView.studentLabel}</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {attemptView.submittedAtLabel}
          </p>
        </div>
        <Badge variant="secondary" className="rounded-md">
          {attemptView.badgeLabel}
        </Badge>
      </div>
      <div className="mt-3 grid gap-2">
        {attemptView.answerViews.map((answerView) => (
          <div
            key={`${attemptView.id}-${answerView.id}`}
            className="rounded-lg border bg-muted/20 p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="min-w-0 text-sm font-medium">
                {answerView.promptLabel}
              </p>
              <Badge
                variant={
                  answerView.statusTone === 'correct' ? 'secondary' : 'outline'
                }
                className="rounded-md"
              >
                {answerView.statusLabel}
              </Badge>
            </div>
            <div className="mt-2 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
              <p>
                {answerView.studentAnswerLabel}: {answerView.studentAnswerText}
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
