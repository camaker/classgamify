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
  const titleId = 'assignment-list-scope-panel-title';
  const summaryId = 'assignment-list-scope-panel-summary';

  return (
    <section
      aria-labelledby={titleId}
      aria-describedby={summaryId}
      className="grid gap-4 rounded-lg border bg-card p-4"
    >
      <div className="grid gap-1">
        <h2 id={titleId} className="font-semibold text-base">
          {view.label}
        </h2>
        <p id={summaryId} className="text-muted-foreground text-sm">
          {view.summary}
        </p>
      </div>
      <dl
        aria-labelledby={titleId}
        aria-describedby={summaryId}
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {view.items.map((item) => (
          <AssignmentListScopeItem item={item} key={item.id} />
        ))}
      </dl>
    </section>
  );
}

function AssignmentListScopeItem({
  item,
}: {
  item: AssignmentListPageScopeItem;
}) {
  const labelId = `assignment-list-scope-${item.id}-label`;
  const valueId = `assignment-list-scope-${item.id}-value`;
  const descriptionId = `assignment-list-scope-${item.id}-description`;

  return (
    <div className="rounded-md border bg-background p-3">
      <dt id={labelId} className="text-muted-foreground text-xs">
        {item.label}
      </dt>
      <dd className="mt-1 break-words font-semibold text-base">
        <output
          id={valueId}
          aria-labelledby={`${labelId} ${valueId}`}
          aria-describedby={descriptionId}
        >
          {item.value}
        </output>
      </dd>
      <dd
        id={descriptionId}
        className="mt-1 text-muted-foreground text-xs leading-5"
      >
        {item.description}
      </dd>
    </div>
  );
}
