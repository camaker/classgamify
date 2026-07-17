import type { SettingsFilesSourceMaterialHandoffView } from '@/settings/files-view';
import { Badge } from '@/components/ui/badge';

type FilesSourceMaterialHandoffPanelProps = {
  view: SettingsFilesSourceMaterialHandoffView;
};

export function FilesSourceMaterialHandoffPanel({
  view,
}: FilesSourceMaterialHandoffPanelProps) {
  const titleId = 'settings-files-source-material-handoff-title';
  const descriptionId = 'settings-files-source-material-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="settings-files-source-material"
      data-handoff-scope={view.privacy.scope}
    >
      <div className="grid gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id={titleId} className="font-semibold text-sm">
            {view.title}
          </h2>
          <Badge variant="secondary" className="rounded-md">
            {view.itemViews.length}
          </Badge>
        </div>
        <p id={descriptionId} className="text-muted-foreground text-xs">
          {view.description}
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        {view.itemViews.map((itemView) => (
          <FilesSourceMaterialHandoffItem
            itemView={itemView}
            key={itemView.id}
          />
        ))}
      </div>
    </section>
  );
}

function FilesSourceMaterialHandoffItem({
  itemView,
}: {
  itemView: SettingsFilesSourceMaterialHandoffView['itemViews'][number];
}) {
  const labelId = `settings-files-source-material-handoff-${itemView.id}-label`;
  const valueId = `settings-files-source-material-handoff-${itemView.id}-value`;
  const descriptionId = `settings-files-source-material-handoff-${itemView.id}-description`;

  return (
    <article
      aria-describedby={descriptionId}
      aria-label={itemView.ariaLabel}
      className="grid gap-1 rounded-md border bg-background p-3"
      data-handoff-item={itemView.id}
    >
      <p className="text-muted-foreground text-xs" id={labelId}>
        {itemView.label}
      </p>
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
