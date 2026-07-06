import type { AssignmentResultEmptyState } from '@/assignments/result-view';

type AssignmentResultsEmptyStateProps = {
  state: AssignmentResultEmptyState | undefined;
};

export function AssignmentResultsEmptyState({
  state,
}: AssignmentResultsEmptyStateProps) {
  if (!state) return null;

  return (
    <div className="rounded-lg border border-dashed bg-muted/20 p-6">
      <AssignmentResultEmptyStateHandoff state={state} />
      <h2 className="text-base font-semibold">{state.title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {state.description}
      </p>
    </div>
  );
}

function AssignmentResultEmptyStateHandoff({
  state,
}: {
  state: AssignmentResultEmptyState;
}) {
  const titleId = 'assignment-result-empty-state-handoff-title';
  const descriptionId = 'assignment-result-empty-state-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="assignment-result-empty-state"
      data-handoff-scope={state.handoffView.privacy.scope}
    >
      <h3 id={titleId}>{state.handoffView.title}</h3>
      <p id={descriptionId}>{state.handoffView.description}</p>
      <dl>
        {state.handoffView.itemViews.map((itemView) => (
          <div data-handoff-item={itemView.id} key={itemView.id}>
            <dt>{itemView.label}</dt>
            <dd>
              <output aria-label={itemView.ariaLabel}>{itemView.value}</output>
              <span>{itemView.description}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
