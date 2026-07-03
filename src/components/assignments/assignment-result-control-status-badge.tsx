import type { AssignmentResultControlStatusView } from '@/assignments/result-view';
import { Badge } from '@/components/ui/badge';

type AssignmentResultControlStatusBadgeProps = {
  descriptionId: string;
  labelId?: string;
  valueId?: string;
  view: AssignmentResultControlStatusView;
};

export function AssignmentResultControlStatusBadge({
  descriptionId,
  labelId,
  valueId,
  view,
}: AssignmentResultControlStatusBadgeProps) {
  const labelledBy = labelId && valueId ? `${labelId} ${valueId}` : undefined;

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
          aria-labelledby={labelledBy}
          className="truncate"
          id={valueId}
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
