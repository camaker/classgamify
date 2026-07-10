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
import { AssignmentResultsAttemptStatsHandoff } from '@/components/assignments/assignment-results-attempt-stats-handoff';
import { AssignmentResultsClassroomBriefCard } from '@/components/assignments/assignment-results-classroom-brief-card';
import { AssignmentResultsEmptyState } from '@/components/assignments/assignment-results-empty-state';
import { AssignmentResultsHeaderCard } from '@/components/assignments/assignment-results-header-card';
import { AssignmentResultsItemAnalysisCard } from '@/components/assignments/assignment-results-item-analysis-card';
import { AssignmentResultsItemPerformanceSortControl } from '@/components/assignments/assignment-results-item-performance-sort-control';
import { AssignmentResultsItemPerformanceTable } from '@/components/assignments/assignment-results-item-performance-table';
import { AssignmentResultsMetricCard } from '@/components/assignments/assignment-results-metric-card';
import { AssignmentResultsReviewHandoffPanel } from '@/components/assignments/assignment-results-review-handoff-panel';
import { AssignmentResultsReviewScopePanel } from '@/components/assignments/assignment-results-review-scope-panel';
import { AssignmentResultsReviewStatusPanel } from '@/components/assignments/assignment-results-review-status-panel';
import { AssignmentResultsStudentSearch } from '@/components/assignments/assignment-results-student-search';
import { AssignmentResultsStudentSummaryTable } from '@/components/assignments/assignment-results-student-summary-table';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAssignmentResults } from '@/hooks/use-assignments';
import { copyTextToClipboard } from '@/lib/clipboard';
import { downloadFile } from '@/lib/download';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMemo } from 'react';
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

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {pageView.metricItems.map((metric) => (
          <AssignmentResultsMetricCard key={metric.key} metric={metric} />
        ))}
        <AssignmentResultsAttemptStatsHandoff
          view={pageView.attemptStatsHandoffView}
        />
      </section>

      <AssignmentResultsHeaderCard
        headerView={headerView}
        materialHandoffView={pageView.materialHandoffView}
        onResultAction={(actionButton) => void onResultAction(actionButton)}
        resultActions={pageView.actionButtons}
      />

      <AssignmentResultsReviewStatusPanel view={pageView.reviewStatusView} />

      {pageView.sectionState.showStudentSearch ? (
        <>
          {pageView.sectionState.showClassroomBrief &&
          pageView.classroomBrief ? (
            <AssignmentResultsClassroomBriefCard
              brief={pageView.classroomBrief}
              copyArtifactHandoffView={pageView.copyArtifactHandoffView}
              copyArtifactPreviews={pageView.copyArtifactPreviews}
              copyScopeView={pageView.copyScopeView}
              onResultAction={(actionButton) =>
                void onResultAction(actionButton)
              }
              sectionViews={sectionViews}
            />
          ) : null}
          <AssignmentResultsReviewScopePanel view={pageView.reviewScopeView} />
          <AssignmentResultsReviewHandoffPanel
            controlsView={pageView.reviewControlsHandoffView}
            teacherResultsReviewChainView={
              pageView.teacherResultsReviewChainHandoffView
            }
            view={pageView.reviewHandoffView}
          />
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
            searchHandoffView={pageView.studentSearchHandoffView}
            view={pageView.controlViews.studentSearch}
          />
        </>
      ) : null}

      {sectionViews.reteachPriorities.isVisible ? (
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>
              <h2 className="text-lg font-semibold">
                {sectionViews.reteachPriorities.title}
              </h2>
            </CardTitle>
            {sectionViews.reteachPriorities.description ? (
              <CardDescription>
                <p>{sectionViews.reteachPriorities.description}</p>
              </CardDescription>
            ) : null}
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {pageView.itemAnalysisCardViews.length > 0 ? (
              pageView.itemAnalysisCardViews.map((itemView) => (
                <AssignmentResultsItemAnalysisCard
                  key={itemView.id}
                  itemView={itemView}
                />
              ))
            ) : (
              <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground md:col-span-3">
                {sectionViews.reteachPriorities.emptyMessage}
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {sectionViews.itemPerformance.isVisible ? (
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>
              <h2 className="text-lg font-semibold">
                {sectionViews.itemPerformance.title}
              </h2>
            </CardTitle>
            {sectionViews.itemPerformance.description ? (
              <CardDescription>
                <p>{sectionViews.itemPerformance.description}</p>
              </CardDescription>
            ) : null}
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <AssignmentResultsItemPerformanceSortControl
                onSortChange={(value) =>
                  onControlChange({
                    control: 'item-performance-sort',
                    value,
                  })
                }
                view={pageView.controlViews.itemPerformanceSort}
              />
              <AssignmentResultsItemPerformanceTable
                tableView={pageView.itemPerformanceTableView}
              />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {sectionViews.studentSummary.isVisible ? (
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>
              <h2 className="text-lg font-semibold">
                {sectionViews.studentSummary.title}
              </h2>
            </CardTitle>
            {sectionViews.studentSummary.description ? (
              <CardDescription>
                <p>{sectionViews.studentSummary.description}</p>
              </CardDescription>
            ) : null}
          </CardHeader>
          <CardContent>
            {pageView.contentState.hasStudentSummaryRows ? (
              <AssignmentResultsStudentSummaryTable
                tableView={pageView.studentSummaryTableView}
              />
            ) : (
              <AssignmentResultsEmptyState
                state={sectionViews.studentSummary.emptyState}
              />
            )}
          </CardContent>
        </Card>
      ) : null}

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>
            <h2 className="text-lg font-semibold">
              {sectionViews.studentAttempts.title}
            </h2>
          </CardTitle>
          {sectionViews.studentAttempts.description ? (
            <CardDescription>
              <p>{sectionViews.studentAttempts.description}</p>
            </CardDescription>
          ) : null}
        </CardHeader>
        <CardContent>
          {pageView.contentState.hasAttemptRows ? (
            <AssignmentResultsAttemptsTable
              tableView={pageView.attemptTableView}
            />
          ) : (
            <AssignmentResultsEmptyState
              state={sectionViews.studentAttempts.emptyState}
            />
          )}
        </CardContent>
      </Card>

      {sectionViews.answerReview.isVisible ? (
        <Card className="rounded-lg">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <CardTitle>
                  <h2 className="text-lg font-semibold">
                    {sectionViews.answerReview.title}
                  </h2>
                </CardTitle>
                {sectionViews.answerReview.description ? (
                  <CardDescription>
                    <p>{sectionViews.answerReview.description}</p>
                  </CardDescription>
                ) : null}
              </div>
              <AssignmentResultsAttemptReviewFilterControl
                onFilterChange={(value) =>
                  onControlChange({
                    control: 'attempt-review-filter',
                    value,
                  })
                }
                view={pageView.controlViews.attemptReviewFilter}
              />
            </div>
            {sectionViews.answerReview.submissionSummary ? (
              <CardDescription>
                <p>{sectionViews.answerReview.submissionSummary}</p>
              </CardDescription>
            ) : null}
          </CardHeader>
          <CardContent className="grid gap-3">
            {pageView.contentState.hasAttemptReviewCards ? (
              pageView.attemptReviewCardViews.map((attemptView) => (
                <AssignmentResultsAttemptReviewCard
                  key={attemptView.id}
                  attemptView={attemptView}
                />
              ))
            ) : (
              <AssignmentResultsEmptyState
                state={sectionViews.answerReview.emptyState}
              />
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
