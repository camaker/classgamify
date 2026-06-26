import {
  type AssignmentResultActionButton,
  buildAssignmentResultActionPayload,
  buildAssignmentResultsPageViewModel,
  assignmentResultSectionCopy,
} from '@/assignments/result-view';
import {
  buildAssignmentResultControlRouteSearch,
  buildAssignmentResultRouteSearch,
} from '@/assignments/result-filters';
import { AssignmentResultsAttemptReviewCard } from '@/components/assignments/assignment-results-attempt-review-card';
import { AssignmentResultsAttemptReviewFilterControl } from '@/components/assignments/assignment-results-attempt-review-filter-control';
import { AssignmentResultsAttemptsTable } from '@/components/assignments/assignment-results-attempts-table';
import { AssignmentResultsClassroomBriefCard } from '@/components/assignments/assignment-results-classroom-brief-card';
import { AssignmentResultsEmptyState } from '@/components/assignments/assignment-results-empty-state';
import { AssignmentResultsHeaderCard } from '@/components/assignments/assignment-results-header-card';
import { AssignmentResultsItemAnalysisCard } from '@/components/assignments/assignment-results-item-analysis-card';
import { AssignmentResultsItemPerformanceSortControl } from '@/components/assignments/assignment-results-item-performance-sort-control';
import { AssignmentResultsItemPerformanceTable } from '@/components/assignments/assignment-results-item-performance-table';
import { AssignmentResultsMetricCard } from '@/components/assignments/assignment-results-metric-card';
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
        data,
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
          <AssignmentResultsMetricCard key={metric.key} metric={metric} />
        ))}
      </section>

      <AssignmentResultsHeaderCard
        assignmentId={assignmentId}
        expiresAt={data.assignment.expiresAt}
        headerView={headerView}
        onResultAction={(actionButton) => void onResultAction(actionButton)}
        resultActions={pageView.actionButtons}
        settings={data.assignment.settingsJson}
      />

      {pageView.sectionState.showStudentSearch ? (
        <>
          {pageView.sectionState.showClassroomBrief &&
          pageView.classroomBrief ? (
            <AssignmentResultsClassroomBriefCard
              brief={pageView.classroomBrief}
            />
          ) : null}
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
                <AssignmentResultsItemAnalysisCard
                  key={itemView.id}
                  itemView={itemView}
                />
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
                items={pageView.itemPerformanceRowViews}
              />
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
              <AssignmentResultsStudentSummaryTable
                students={pageView.studentSummaryRowViews}
              />
            ) : (
              <AssignmentResultsEmptyState
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
            <AssignmentResultsAttemptsTable
              attempts={pageView.attemptRowViews}
            />
          ) : (
            <AssignmentResultsEmptyState
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
            <CardDescription>
              <p>{pageView.resultView.attemptReviewSubmissionSummary}</p>
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {pageView.attemptReviewCardViews.length > 0 ? (
              pageView.attemptReviewCardViews.map((attemptView) => (
                <AssignmentResultsAttemptReviewCard
                  key={attemptView.id}
                  attemptView={attemptView}
                />
              ))
            ) : (
              <AssignmentResultsEmptyState
                state={pageView.resultView.emptyStates.attemptReview}
              />
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
