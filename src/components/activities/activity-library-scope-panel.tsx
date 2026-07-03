import type {
  ActivityLibraryPageScopeItem,
  ActivityLibraryPageScopeView,
} from '@/activities/library-view';

type ActivityLibraryScopePanelProps = {
  view: ActivityLibraryPageScopeView;
};

export function ActivityLibraryScopePanel({
  view,
}: ActivityLibraryScopePanelProps) {
  const titleId = 'activity-library-scope-panel-title';
  const summaryId = 'activity-library-scope-panel-summary';

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
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6"
      >
        {view.items.map((item) => (
          <ActivityLibraryScopeItem item={item} key={item.id} />
        ))}
      </dl>
    </section>
  );
}

function ActivityLibraryScopeItem({
  item,
}: {
  item: ActivityLibraryPageScopeItem;
}) {
  const labelId = `activity-library-scope-${item.id}-label`;
  const valueId = `activity-library-scope-${item.id}-value`;
  const descriptionId = `activity-library-scope-${item.id}-description`;

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
