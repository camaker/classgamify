import type {
  AssignmentResultReviewControlsHandoffItemView,
  AssignmentResultReviewControlsHandoffView,
  AssignmentResultReviewHandoffItemView,
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
      data-handoff="assignment-result-review"
      data-handoff-scope={view.privacy.scope}
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
          <AssignmentResultReviewHandoffItem
            itemView={itemView}
            key={itemView.id}
          />
        ))}
      </div>
      <AssignmentResultReviewControlsHandoff view={controlsView} />
    </section>
  );
}

function AssignmentResultReviewHandoffItem({
  itemView,
}: {
  itemView: AssignmentResultReviewHandoffItemView;
}) {
  const labelId = `assignment-result-review-${itemView.id}-label`;
  const valueId = `assignment-result-review-${itemView.id}-value`;
  const descriptionId = `assignment-result-review-${itemView.id}-description`;

  return (
    <article
      aria-describedby={descriptionId}
      aria-label={itemView.ariaLabel}
      aria-labelledby={`${labelId} ${valueId}`}
      className="grid gap-1 rounded-md border bg-background p-3"
      data-handoff-item={itemView.id}
      data-scope={itemView.dataScope}
    >
      <div className="flex min-w-0 items-center justify-between gap-2">
        <p className="text-muted-foreground text-xs" id={labelId}>
          {itemView.label}
        </p>
        {itemView.statusLabel ? (
          <Badge aria-hidden="true" variant="secondary" className="rounded-md">
            {itemView.statusLabel}
          </Badge>
        ) : null}
      </div>
      <output
        aria-describedby={descriptionId}
        aria-label={itemView.ariaLabel}
        aria-labelledby={`${labelId} ${valueId}`}
        id={valueId}
      >
        <span className="font-semibold text-base">{itemView.value}</span>
      </output>
      <p className="text-muted-foreground text-xs leading-5" id={descriptionId}>
        {itemView.description}
      </p>
    </article>
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
      data-handoff-scope={view.privacy.scope}
    >
      <h3 id={titleId}>{view.title}</h3>
      <p id={descriptionId}>{view.description}</p>
      <dl>
        {view.itemViews.map((itemView) => (
          <AssignmentResultReviewControlsHandoffItem
            itemView={itemView}
            key={itemView.id}
          />
        ))}
      </dl>
    </section>
  );
}

function AssignmentResultReviewControlsHandoffItem({
  itemView,
}: {
  itemView: AssignmentResultReviewControlsHandoffItemView;
}) {
  const labelId = `assignment-result-review-controls-handoff-${itemView.id}-label`;
  const valueId = `assignment-result-review-controls-handoff-${itemView.id}-value`;
  const descriptionId = `assignment-result-review-controls-handoff-${itemView.id}-description`;

  return (
    <div data-handoff-item={itemView.id}>
      <dt id={labelId}>{itemView.label}</dt>
      <dd>
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
        <p id={descriptionId}>{itemView.description}</p>
      </dd>
    </div>
  );
}
