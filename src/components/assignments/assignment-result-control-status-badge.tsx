import type { AssignmentResultControlStatusView } from '@/assignments/result-view';
import { Badge } from '@/components/ui/badge';

type AssignmentResultControlStatusBadgeProps = {
  descriptionId: string;
  view: AssignmentResultControlStatusView;
};

export function AssignmentResultControlStatusBadge({
  descriptionId,
  view,
}: AssignmentResultControlStatusBadgeProps) {
  return (
    <span className="inline-flex min-w-0 items-center">
      <Badge
        data-tone={view.tone}
        variant={view.tone === 'custom' ? 'secondary' : 'outline'}
        className="max-w-full rounded-md"
      >
        <output
          aria-describedby={descriptionId}
          aria-label={view.ariaLabel}
          className="truncate"
        >
          {view.value}
        </output>
      </Badge>
      <span id={descriptionId} className="sr-only">
        {view.description}
      </span>
    </span>
  );
}
