import type { AssignmentAttemptStatsHandoffView } from '@/assignments/attempt-stats-handoff';

type AssignmentResultsAttemptStatsHandoffProps = {
  view: AssignmentAttemptStatsHandoffView;
};

export function AssignmentResultsAttemptStatsHandoff({
  view,
}: AssignmentResultsAttemptStatsHandoffProps) {
  const titleId = 'assignment-attempt-stats-handoff-title';
  const descriptionId = 'assignment-attempt-stats-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="assignment-attempt-stats"
    >
      <h3 id={titleId}>{view.title}</h3>
      <p id={descriptionId}>{view.description}</p>
      {view.itemViews.map((itemView) => (
        <AssignmentAttemptStatsHandoffItem
          itemView={itemView}
          key={itemView.id}
        />
      ))}
    </section>
  );
}

function AssignmentAttemptStatsHandoffItem({
  itemView,
}: {
  itemView: AssignmentAttemptStatsHandoffView['itemViews'][number];
}) {
  const labelId = `assignment-attempt-stats-${itemView.id}-label`;
  const valueId = `assignment-attempt-stats-${itemView.id}-value`;
  const descriptionId = `assignment-attempt-stats-${itemView.id}-description`;

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
      <span id={descriptionId}>{itemView.description}</span>
    </div>
  );
}
