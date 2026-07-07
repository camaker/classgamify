import type { AssignmentResultEmptyState } from '@/assignments/result-view';
import type { AssignmentResultEmptyStateHandoffItemView } from '@/assignments/result-empty-state-handoff';
import { useId } from 'react';

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
  const baseId = useId();
  const titleId = `${baseId}-assignment-result-empty-state-handoff-title`;
  const descriptionId = `${baseId}-assignment-result-empty-state-handoff-description`;

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
          <AssignmentResultEmptyStateHandoffItem
            baseId={baseId}
            itemView={itemView}
            key={itemView.id}
          />
        ))}
      </dl>
    </section>
  );
}

function AssignmentResultEmptyStateHandoffItem({
  baseId,
  itemView,
}: {
  baseId: string;
  itemView: AssignmentResultEmptyStateHandoffItemView;
}) {
  const itemId = `${baseId}-assignment-result-empty-state-${itemView.id}`;
  const labelId = `${itemId}-label`;
  const valueId = `${itemId}-value`;
  const descriptionId = `${itemId}-description`;

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
      </dd>
      <dd id={descriptionId}>{itemView.description}</dd>
    </div>
  );
}
