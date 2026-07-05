import type {
  SettingsFilesWorkspaceSummaryItemView,
  SettingsFilesWorkspaceSummaryView,
} from '@/settings/files-view';
import { Badge } from '@/components/ui/badge';

type FilesWorkspaceSummaryProps = {
  view: SettingsFilesWorkspaceSummaryView;
};

export function FilesWorkspaceSummary({ view }: FilesWorkspaceSummaryProps) {
  return (
    <section
      aria-label={view.ariaLabel}
      className="grid gap-3 rounded-lg border bg-muted/20 p-4"
    >
      <div>
        <h2 className="font-semibold text-sm">{view.title}</h2>
        <p className="mt-1 text-muted-foreground text-sm">{view.description}</p>
      </div>
      <ul className="grid gap-3 md:grid-cols-2">
        {view.itemViews.map((itemView) => (
          <FilesWorkspaceSummaryItem itemView={itemView} key={itemView.id} />
        ))}
      </ul>
    </section>
  );
}

function FilesWorkspaceSummaryItem({
  itemView,
}: {
  itemView: SettingsFilesWorkspaceSummaryItemView;
}) {
  return (
    <li
      aria-label={itemView.ariaLabel}
      className="grid gap-2 rounded-md border bg-background p-3"
    >
      <Badge className="w-fit rounded-md" variant="outline">
        {itemView.label}
      </Badge>
      <p className="text-muted-foreground text-sm leading-6">
        {itemView.description}
      </p>
    </li>
  );
}
