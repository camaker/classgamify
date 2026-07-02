import type { ActivityLibraryActionStatusView } from '@/activities/library-view';
import { Badge } from '@/components/ui/badge';

type ActivityLibraryActionStatusBadgeProps = {
  descriptionId: string;
  view: ActivityLibraryActionStatusView;
};

export function ActivityLibraryActionStatusBadge({
  descriptionId,
  view,
}: ActivityLibraryActionStatusBadgeProps) {
  return (
    <span className="inline-flex min-w-0 items-center">
      <Badge
        data-tone={view.tone}
        variant={view.tone === 'blocked' ? 'destructive' : 'outline'}
        className="max-w-full rounded-md bg-background"
      >
        <output aria-label={view.ariaLabel} className="truncate">
          {view.value}
        </output>
      </Badge>
      <span id={descriptionId} className="sr-only">
        {view.description}
      </span>
    </span>
  );
}
