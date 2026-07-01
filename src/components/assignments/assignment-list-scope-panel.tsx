import type {
  AssignmentListPageScopeItem,
  AssignmentListPageScopeView,
} from '@/assignments/list-view';

type AssignmentListScopePanelProps = {
  view: AssignmentListPageScopeView;
};

export function AssignmentListScopePanel({
  view,
}: AssignmentListScopePanelProps) {
  return (
    <section
      aria-label={view.label}
      className="grid gap-4 rounded-lg border bg-card p-4"
    >
      <div className="grid gap-1">
        <h2 className="font-semibold text-base">{view.label}</h2>
        <p className="text-muted-foreground text-sm">{view.summary}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {view.items.map((item) => (
          <AssignmentListScopeItem item={item} key={item.id} />
        ))}
      </div>
    </section>
  );
}

function AssignmentListScopeItem({
  item,
}: {
  item: AssignmentListPageScopeItem;
}) {
  return (
    <div className="rounded-md border bg-background p-3">
      <p className="text-muted-foreground text-xs">{item.label}</p>
      <p className="mt-1 break-words font-semibold text-base">{item.value}</p>
      <p className="mt-1 text-muted-foreground text-xs leading-5">
        {item.description}
      </p>
    </div>
  );
}
