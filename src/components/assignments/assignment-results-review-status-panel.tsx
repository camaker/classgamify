import type {
  AssignmentResultReviewScopeSummaryItemView,
  AssignmentResultReviewStatus,
  AssignmentResultReviewStatusView,
} from '@/assignments/result-view';
import { Badge } from '@/components/ui/badge';

type AssignmentResultsReviewStatusPanelProps = {
  view: AssignmentResultReviewStatusView;
};

export function AssignmentResultsReviewStatusPanel({
  view,
}: AssignmentResultsReviewStatusPanelProps) {
  const titleId = 'assignment-result-review-status-title';
  const descriptionId = 'assignment-result-review-status-description';
  const stepDescriptionId = 'assignment-result-review-status-step-description';
  const statusValueId = 'assignment-result-review-status-value';
  const stepLabelId = 'assignment-result-review-status-step-label';
  const summaryLabelId = 'assignment-result-review-status-summary-label';

  return (
    <section
      aria-describedby={`${descriptionId} ${stepDescriptionId}`}
      aria-label={view.ariaLabel}
      aria-labelledby={titleId}
      className="grid gap-4 rounded-lg border bg-card p-4"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <Badge
            data-status={view.status}
            variant={getAssignmentResultReviewStatusBadgeVariant(view.status)}
            className="rounded-md"
          >
            <output
              aria-describedby={descriptionId}
              aria-label={view.ariaLabel}
              aria-labelledby={`${titleId} ${statusValueId}`}
              id={statusValueId}
            >
              {view.statusLabel}
            </output>
          </Badge>
          <h2 id={titleId} className="mt-3 font-semibold text-base">
            {view.title}
          </h2>
          <p
            id={descriptionId}
            className="mt-1 text-muted-foreground text-sm leading-6"
          >
            {view.description}
          </p>
        </div>
        <fieldset
          aria-describedby={stepDescriptionId}
          className="rounded-md border bg-background p-3 lg:max-w-sm"
        >
          <legend id={stepLabelId} className="font-medium text-sm">
            {view.step.label}
          </legend>
          <p
            id={stepDescriptionId}
            className="mt-1 text-muted-foreground text-xs leading-5"
          >
            {view.step.description}
          </p>
        </fieldset>
      </div>
      <section aria-labelledby={summaryLabelId} className="grid gap-2">
        <p id={summaryLabelId} className="font-medium text-sm">
          {view.summaryLabel}
        </p>
        <dl className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {view.summaryItems.map((summaryItem) => (
            <AssignmentResultsReviewStatusSummaryItem
              key={summaryItem.id}
              summaryItem={summaryItem}
            />
          ))}
        </dl>
      </section>
    </section>
  );
}

function AssignmentResultsReviewStatusSummaryItem({
  summaryItem,
}: {
  summaryItem: AssignmentResultReviewScopeSummaryItemView;
}) {
  const labelId = `assignment-result-review-status-summary-${summaryItem.id}-label`;
  const valueId = `assignment-result-review-status-summary-${summaryItem.id}-value`;
  const descriptionId = `assignment-result-review-status-summary-${summaryItem.id}-description`;

  return (
    <div className="rounded-md border bg-background p-3">
      <dt id={labelId} className="text-muted-foreground text-xs">
        {summaryItem.label}
      </dt>
      <dd aria-describedby={descriptionId} className="mt-1">
        <output
          aria-describedby={descriptionId}
          aria-label={summaryItem.ariaLabel}
          aria-labelledby={`${labelId} ${valueId}`}
          className="font-semibold"
          id={valueId}
        >
          {summaryItem.value}
        </output>
      </dd>
      <dd id={descriptionId} className="sr-only">
        {summaryItem.description}
      </dd>
    </div>
  );
}

function getAssignmentResultReviewStatusBadgeVariant(
  status: AssignmentResultReviewStatus
) {
  if (status === 'needs-review') return 'default';
  if (status === 'no-matches' || status === 'waiting-for-attempts') {
    return 'outline';
  }

  return 'secondary';
}
