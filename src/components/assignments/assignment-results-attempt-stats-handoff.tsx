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
      data-handoff-scope={view.privacy.scope}
    >
      <h3 id={titleId}>{view.title}</h3>
      <p id={descriptionId}>{view.description}</p>
      <dl>
        {view.itemViews.map((itemView) => (
          <AssignmentAttemptStatsHandoffItem
            itemView={itemView}
            key={itemView.id}
          />
        ))}
      </dl>
    </section>
  );
}

function AssignmentAttemptStatsHandoffItem({
  itemView,
}: {
  itemView: AssignmentAttemptStatsHandoffView['itemViews'][number];
}) {
  const labelId = `assignment-attempt-stats-handoff-${itemView.id}-label`;
  const valueId = `assignment-attempt-stats-handoff-${itemView.id}-value`;
  const descriptionId = `assignment-attempt-stats-handoff-${itemView.id}-description`;

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
        <p id={descriptionId}>{itemView.description}</p>
      </dd>
    </div>
  );
}
