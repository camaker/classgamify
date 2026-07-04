import type { AssignmentResultReviewHandoffView } from '@/assignments/result-view';
import { Badge } from '@/components/ui/badge';

type AssignmentResultsReviewHandoffPanelProps = {
  view: AssignmentResultReviewHandoffView;
};

export function AssignmentResultsReviewHandoffPanel({
  view,
}: AssignmentResultsReviewHandoffPanelProps) {
  const titleId = 'assignment-result-review-handoff-title';
  const descriptionId = 'assignment-result-review-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="grid gap-3 rounded-lg border bg-muted/20 p-3"
    >
      <div className="grid gap-1">
        <h2 id={titleId} className="font-medium text-sm">
          {view.title}
        </h2>
        <p id={descriptionId} className="text-muted-foreground text-xs">
          {view.description}
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        {view.itemViews.map((itemView) => (
          <article
            aria-label={itemView.ariaLabel}
            className="grid gap-1 rounded-md border bg-background p-3"
            data-scope={itemView.dataScope}
            key={itemView.id}
          >
            <div className="flex min-w-0 items-center justify-between gap-2">
              <p className="text-muted-foreground text-xs">{itemView.label}</p>
              {itemView.statusLabel ? (
                <Badge variant="secondary" className="rounded-md">
                  {itemView.statusLabel}
                </Badge>
              ) : null}
            </div>
            <output aria-label={itemView.ariaLabel}>
              <span className="font-semibold text-base">{itemView.value}</span>
            </output>
            <p className="text-muted-foreground text-xs leading-5">
              {itemView.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
