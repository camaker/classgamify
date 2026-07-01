import type {
  AssignmentResultReviewScopeItemView,
  AssignmentResultReviewScopeSummaryItemView,
  AssignmentResultReviewScopeView,
} from '@/assignments/result-view';

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

  return (
    <article
      className="rounded-md border bg-background p-3"
      aria-describedby={descriptionId}
      aria-labelledby={`${labelId} ${valueId}`}
    >
      <p id={labelId} className="text-muted-foreground text-xs">
        {itemView.label}
      </p>
      <p id={valueId} className="mt-1 break-words font-semibold text-base">
        {itemView.value}
      </p>
      <p
        id={descriptionId}
        className="mt-1 text-muted-foreground text-xs leading-5"
      >
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
      <dd aria-describedby={descriptionId} id={valueId} className="font-medium">
        <output aria-label={summaryItem.ariaLabel}>{summaryItem.value}</output>
        <span id={descriptionId} className="sr-only">
          {summaryItem.description}
        </span>
      </dd>
    </div>
  );
}
