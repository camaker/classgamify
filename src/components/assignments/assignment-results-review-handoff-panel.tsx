import type {
  AssignmentResultReviewControlsHandoffItemView,
  AssignmentResultReviewControlsHandoffView,
  AssignmentResultReviewHandoffView,
} from '@/assignments/result-view';
import { Badge } from '@/components/ui/badge';

type AssignmentResultsReviewHandoffPanelProps = {
  controlsView: AssignmentResultReviewControlsHandoffView;
  view: AssignmentResultReviewHandoffView;
};

export function AssignmentResultsReviewHandoffPanel({
  controlsView,
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
      <AssignmentResultReviewControlsHandoff view={controlsView} />
    </section>
  );
}

function AssignmentResultReviewControlsHandoff({
  view,
}: {
  view: AssignmentResultReviewControlsHandoffView;
}) {
  const titleId = 'assignment-result-review-controls-handoff-title';
  const descriptionId = 'assignment-result-review-controls-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="assignment-result-review-controls"
    >
      <h3 id={titleId}>{view.title}</h3>
      <p id={descriptionId}>{view.description}</p>
      {view.itemViews.map((itemView) => (
        <AssignmentResultReviewControlsHandoffItem
          itemView={itemView}
          key={itemView.id}
        />
      ))}
    </section>
  );
}

function AssignmentResultReviewControlsHandoffItem({
  itemView,
}: {
  itemView: AssignmentResultReviewControlsHandoffItemView;
}) {
  const labelId = `assignment-result-review-controls-${itemView.id}-label`;
  const valueId = `assignment-result-review-controls-${itemView.id}-value`;
  const descriptionId = `assignment-result-review-controls-${itemView.id}-description`;

  return (
    <div data-handoff-item={itemView.id}>
      <span id={labelId}>{itemView.label}</span>
      <output
        aria-describedby={descriptionId}
        aria-label={itemView.ariaLabel}
        aria-labelledby={`${labelId} ${valueId}`}
        id={valueId}
      >
        {itemView.value}
      </output>
      {itemView.statusLabel ? (
        <span aria-hidden="true">{itemView.statusLabel}</span>
      ) : null}
      <span id={descriptionId}>{itemView.description}</span>
    </div>
  );
}
