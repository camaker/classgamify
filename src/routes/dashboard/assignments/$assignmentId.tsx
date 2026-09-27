import {
  type AssignmentResultActionButton,
  type AssignmentAttemptRowDisplayInput,
  type AssignmentResultsPageViewModel,
  buildAssignmentResultActionExecutionPlan,
  buildAssignmentResultsRouteState,
} from '@/assignments/result-view';
import {
  buildAssignmentResultControlRouteSearch,
  buildAssignmentResultRouteSearch,
} from '@/assignments/result-filters';
import { AssignmentResultsAttemptReviewCard } from '@/components/assignments/assignment-results-attempt-review-card';
import { AssignmentResultsAttemptReviewFilterControl } from '@/components/assignments/assignment-results-attempt-review-filter-control';
import { AssignmentResultsAttemptsTable } from '@/components/assignments/assignment-results-attempts-table';
import { AssignmentResultsFollowUpPanel } from '@/components/assignments/assignment-results-follow-up-panel';
import { AssignmentResultsEmptyState } from '@/components/assignments/assignment-results-empty-state';
import { AssignmentResultsHeaderActions } from '@/components/assignments/assignment-results-header-actions';
import { AssignmentResultsHeaderCard } from '@/components/assignments/assignment-results-header-card';
import { AssignmentResultsItemAnalysisCard } from '@/components/assignments/assignment-results-item-analysis-card';
import { AssignmentResultsItemPerformanceSortControl } from '@/components/assignments/assignment-results-item-performance-sort-control';
import { AssignmentResultsItemPerformanceTable } from '@/components/assignments/assignment-results-item-performance-table';
import { AssignmentResultsMetricCard } from '@/components/assignments/assignment-results-metric-card';
import { AssignmentResultsStudentSearch } from '@/components/assignments/assignment-results-student-search';
import { AssignmentResultsStudentSummaryTable } from '@/components/assignments/assignment-results-student-summary-table';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { useAssignmentResults } from '@/hooks/use-assignments';
import { copyTextToClipboard } from '@/lib/clipboard';
import { downloadFile } from '@/lib/download';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { type ReactNode, useMemo } from 'react';
import { toast } from 'sonner';

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
  const routeState = useMemo(
    () =>
      buildAssignmentResultsRouteState({
        data,
        isError,
        isLoading,
        search,
      }),
    [data, isError, isLoading, search]
  );
  const pageView = routeState.pageView;
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
    const executionPlan = buildAssignmentResultActionExecutionPlan({
      actionButton,
      dataSet: pageView.actionDataSet,
    });

    if (executionPlan.type === 'blocked') {
      toast.error(executionPlan.message);
      return;
    }

    try {
      if (executionPlan.type === 'download-csv') {
        await downloadFile(executionPlan.url, executionPlan.filename);
      } else {
        await copyTextToClipboard(executionPlan.text);
      }
      toast.success(executionPlan.successMessage);
    } catch {
      toast.error(executionPlan.failureMessage);
    }
  }

  return (
    <DashboardLayout
      breadcrumbs={pageView.breadcrumbs}
      title={pageView.title}
      description={pageView.description}
    >
      {routeState.status === 'loading' ? (
        <Card className="min-h-56 rounded-lg" />
      ) : routeState.status === 'error' ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {pageView.loadErrorMessage}
        </div>
      ) : (
        <LoadedAssignmentResultsPage
          pageView={pageView}
          onControlChange={updateResultControl}
          onResultAction={handleResultAction}
        />
      )}
    </DashboardLayout>
  );
}

function LoadedAssignmentResultsPage({
  onControlChange,
  onResultAction,
  pageView,
}: {
  onControlChange: (update: AssignmentResultControlUpdate) => void;
  onResultAction: (actionButton: AssignmentResultActionButton) => Promise<void>;
  pageView: AssignmentResultsPageViewModel<AssignmentAttemptRowDisplayInput>;
}) {
  const headerView = pageView.headerView;
  if (!headerView) return null;
  const sectionViews = pageView.sectionViews;
  const hasAttempts = pageView.sectionState.showStudentSearch;
  const summaryMetrics = pageView.metricItems.filter((metric) =>
    RESULT_SUMMARY_METRIC_KEYS.includes(metric.key)
  );

  return (
    <div className="grid gap-10">
      <section className="grid gap-6">
        <AssignmentResultsHeaderActions
          onResultAction={(actionButton) => void onResultAction(actionButton)}
          printAction={headerView.printAction}
          resultActionsLabel={headerView.resultActionsLabel}
          resultActions={pageView.actionButtons}
          shareAction={headerView.shareAction}
          showResultActions={hasAttempts}
        />
        {hasAttempts ? (
          <div className="flex flex-wrap gap-x-12 gap-y-4">
            {summaryMetrics.map((metric) => (
              <AssignmentResultsMetricCard key={metric.key} metric={metric} />
            ))}
          </div>
        ) : null}
        <AssignmentResultsHeaderCard headerView={headerView} />
      </section>

      {hasAttempts ? (
        <>
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            {sectionViews.reteachPriorities.isVisible ? (
              <ResultSection
                title={sectionViews.reteachPriorities.title}
                description={sectionViews.reteachPriorities.description}
              >
                {pageView.itemAnalysisCardViews.length > 0 ? (
                  <div className="grid divide-y rounded-lg border bg-card">
                    {pageView.itemAnalysisCardViews.map((itemView) => (
                      <AssignmentResultsItemAnalysisCard
                        key={itemView.id}
                        itemView={itemView}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="rounded-lg border border-dashed p-4 text-muted-foreground text-sm">
                    {sectionViews.reteachPriorities.emptyMessage}
                  </p>
                )}
              </ResultSection>
            ) : null}
            {pageView.classroomBrief ? (
              <AssignmentResultsFollowUpPanel
                followUpStudentViews={
                  pageView.classroomBrief.followUpStudentViews
                }
                sectionView={sectionViews.studentFollowUp}
              />
            ) : null}
          </div>

          {sectionViews.itemPerformance.isVisible ? (
            <ResultSection
              title={sectionViews.itemPerformance.title}
              description={sectionViews.itemPerformance.description}
              actions={
                <AssignmentResultsItemPerformanceSortControl
                  onSortChange={(value) =>
                    onControlChange({
                      control: 'item-performance-sort',
                      value,
                    })
                  }
                  view={pageView.controlViews.itemPerformanceSort}
                />
              }
            >
              <AssignmentResultsItemPerformanceTable
                tableView={pageView.itemPerformanceTableView}
              />
            </ResultSection>
          ) : null}

          {sectionViews.studentSummary.isVisible ? (
            <ResultSection
              title={sectionViews.studentSummary.title}
              description={sectionViews.studentSummary.description}
            >
              <AssignmentResultsStudentSearch
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
              {pageView.contentState.hasStudentSummaryRows ? (
                <AssignmentResultsStudentSummaryTable
                  tableView={pageView.studentSummaryTableView}
                />
              ) : (
                <AssignmentResultsEmptyState
                  state={sectionViews.studentSummary.emptyState}
                />
              )}
            </ResultSection>
          ) : null}

          <ResultSection
            title={sectionViews.studentAttempts.title}
            description={sectionViews.studentAttempts.description}
          >
            {pageView.contentState.hasAttemptRows ? (
              <AssignmentResultsAttemptsTable
                tableView={pageView.attemptTableView}
              />
            ) : (
              <AssignmentResultsEmptyState
                state={sectionViews.studentAttempts.emptyState}
              />
            )}
          </ResultSection>

          {sectionViews.answerReview.isVisible ? (
            <ResultSection
              title={sectionViews.answerReview.title}
              description={
                sectionViews.answerReview.submissionSummary ??
                sectionViews.answerReview.description
              }
              actions={
                <AssignmentResultsAttemptReviewFilterControl
                  onFilterChange={(value) =>
                    onControlChange({
                      control: 'attempt-review-filter',
                      value,
                    })
                  }
                  view={pageView.controlViews.attemptReviewFilter}
                />
              }
            >
              {pageView.contentState.hasAttemptReviewCards ? (
                <div className="grid gap-3">
                  {pageView.attemptReviewCardViews.map((attemptView) => (
                    <AssignmentResultsAttemptReviewCard
                      key={attemptView.id}
                      attemptView={attemptView}
                    />
                  ))}
                </div>
              ) : (
                <AssignmentResultsEmptyState
                  state={sectionViews.answerReview.emptyState}
                />
              )}
            </ResultSection>
          ) : null}
        </>
      ) : (
        <AssignmentResultsEmptyState
          state={sectionViews.studentAttempts.emptyState}
        />
      )}
    </div>
  );
}

/** The summary row shows who finished, how well, and how long it took. */
const RESULT_SUMMARY_METRIC_KEYS: string[] = [
  'completions',
  'average-accuracy',
  'average-time',
];

/**
 * A results section: heading, optional one-line description, optional
 * controls on the right. No card frame; spacing separates sections.
 */
function ResultSection({
  actions,
  children,
  description,
  title,
}: {
  actions?: ReactNode;
  children: ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <section className="grid content-start gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <h2 className="font-semibold text-lg">{title}</h2>
          {description ? (
            <p className="text-muted-foreground text-sm">{description}</p>
          ) : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
