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
  return (
    <section
      aria-label={view.title}
      className="grid gap-4 rounded-lg border bg-card p-4"
    >
      <div className="grid gap-1">
        <h2 className="font-semibold text-base">{view.title}</h2>
        <p className="text-muted-foreground text-sm">{view.description}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {view.itemViews.map((itemView) => (
          <AssignmentResultsReviewScopeItem
            itemView={itemView}
            key={itemView.id}
          />
        ))}
      </div>
      <div className="grid gap-3 rounded-md border bg-background p-3">
        <p className="font-medium text-sm">{view.summaryLabel}</p>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {view.summaryItems.map((summaryItem) => (
            <AssignmentResultsReviewScopeSummaryItem
              summaryItem={summaryItem}
              key={summaryItem.id}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function AssignmentResultsReviewScopeItem({
  itemView,
}: {
  itemView: AssignmentResultReviewScopeItemView;
}) {
  return (
    <div className="rounded-md border bg-background p-3">
      <p className="text-muted-foreground text-xs">{itemView.label}</p>
      <p className="mt-1 break-words font-semibold text-base">
        {itemView.value}
      </p>
      <p className="mt-1 text-muted-foreground text-xs leading-5">
        {itemView.description}
      </p>
    </div>
  );
}

function AssignmentResultsReviewScopeSummaryItem({
  summaryItem,
}: {
  summaryItem: AssignmentResultReviewScopeSummaryItemView;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{summaryItem.label}</span>
      <span className="font-medium">{summaryItem.value}</span>
    </div>
  );
}
