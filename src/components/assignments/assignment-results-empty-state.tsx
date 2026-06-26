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
      <h2 className="text-base font-semibold">{state.title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {state.description}
      </p>
    </div>
  );
}
