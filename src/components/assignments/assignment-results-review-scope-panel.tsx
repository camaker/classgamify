import type {
  AssignmentResultReviewScopeItemView,
  AssignmentResultReviewScopeSummaryItemView,
  AssignmentResultReviewScopeView,
} from '@/assignments/result-view';
import { AssignmentResultControlStatusBadge } from '@/components/assignments/assignment-result-control-status-badge';

type AssignmentResultsReviewScopePanelProps = {
  view: AssignmentResultReviewScopeView;
};

export function AssignmentResultsReviewScopePanel({
  view,
}: AssignmentResultsReviewScopePanelProps) {
  const titleId = 'assignment-result-review-scope-title';
  const descriptionId = 'assignment-result-review-scope-description';
  const summaryLabelId = 'assignment-result-review-scope-summary-label';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="grid gap-4 rounded-lg border bg-card p-4"
    >
      <div className="grid gap-1">
        <h2 id={titleId} className="font-semibold text-base">
          {view.title}
        </h2>
        <p id={descriptionId} className="text-muted-foreground text-sm">
          {view.description}
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {view.itemViews.map((itemView) => (
          <AssignmentResultsReviewScopeItem
            itemView={itemView}
            key={itemView.id}
          />
        ))}
      </div>
      <section
        className="grid gap-3 rounded-md border bg-background p-3"
        aria-labelledby={summaryLabelId}
      >
        <p id={summaryLabelId} className="font-medium text-sm">
          {view.summaryLabel}
        </p>
        <dl className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {view.summaryItems.map((summaryItem) => (
            <AssignmentResultsReviewScopeSummaryItem
              summaryItem={summaryItem}
              key={summaryItem.id}
            />
          ))}
        </dl>
      </section>
    </section>
  );
}

function AssignmentResultsReviewScopeItem({
  itemView,
}: {
  itemView: AssignmentResultReviewScopeItemView;
}) {
  const labelId = `assignment-result-review-scope-${itemView.id}-label`;
  const valueId = `assignment-result-review-scope-${itemView.id}-value`;
  const descriptionId = `assignment-result-review-scope-${itemView.id}-description`;
  const statusDescriptionId = `assignment-result-review-scope-${itemView.id}-status-description`;
  const statusValueId = `assignment-result-review-scope-${itemView.id}-status`;

  return (
    <article
      className="grid gap-2 rounded-md border bg-background p-3"
      aria-describedby={`${descriptionId} ${statusDescriptionId}`}
      aria-labelledby={`${labelId} ${valueId}`}
    >
      <div className="flex min-w-0 items-start justify-between gap-2">
        <p id={labelId} className="min-w-0 text-muted-foreground text-xs">
          {itemView.label}
        </p>
        <AssignmentResultControlStatusBadge
          descriptionId={statusDescriptionId}
          labelId={labelId}
          valueId={statusValueId}
          view={itemView.statusView}
        />
      </div>
      <p className="break-words font-semibold text-base">
        <output
          aria-describedby={`${descriptionId} ${statusDescriptionId}`}
          aria-label={itemView.ariaLabel}
          aria-labelledby={`${labelId} ${valueId}`}
          id={valueId}
        >
          {itemView.value}
        </output>
      </p>
      <p id={descriptionId} className="text-muted-foreground text-xs leading-5">
        {itemView.description}
      </p>
    </article>
  );
}

function AssignmentResultsReviewScopeSummaryItem({
  summaryItem,
}: {
  summaryItem: AssignmentResultReviewScopeSummaryItemView;
}) {
  const labelId = `assignment-result-review-scope-summary-${summaryItem.id}-label`;
  const valueId = `assignment-result-review-scope-summary-${summaryItem.id}-value`;
  const descriptionId = `assignment-result-review-scope-summary-${summaryItem.id}-description`;

  return (
    <div className="flex min-w-0 items-center justify-between gap-3 text-sm">
      <dt id={labelId} className="text-muted-foreground">
        {summaryItem.label}
      </dt>
      <dd aria-describedby={descriptionId} className="font-medium">
        <output
          aria-describedby={descriptionId}
          aria-label={summaryItem.ariaLabel}
          aria-labelledby={`${labelId} ${valueId}`}
          id={valueId}
        >
          {summaryItem.value}
        </output>
        <span id={descriptionId} className="sr-only">
          {summaryItem.description}
        </span>
      </dd>
    </div>
  );
}
