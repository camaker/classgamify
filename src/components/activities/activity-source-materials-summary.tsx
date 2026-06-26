import type { ActivitySourceMaterialSummaryView } from '@/activities/material-summary';
import { Badge } from '@/components/ui/badge';

type ActivitySourceMaterialsSummaryProps = {
  summary: ActivitySourceMaterialSummaryView;
};

export function ActivitySourceMaterialsSummary({
  summary,
}: ActivitySourceMaterialsSummaryProps) {
  if (!summary.hasMaterials) return null;

  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium text-sm">{summary.title}</p>
          <p className="mt-1 text-muted-foreground text-xs">
            {summary.countLabel}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {summary.kindBadges.map((badge) => (
            <Badge key={badge.kind} variant="secondary" className="rounded-md">
              {badge.label} · {badge.count}
            </Badge>
          ))}
        </div>
      </div>
      {summary.extractionActions.length ? (
        <div className="mt-3 border-t pt-3">
          <p className="text-muted-foreground text-xs">
            {summary.extractionTitle}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {summary.extractionActions.map((action) => (
              <Badge key={action.id} variant="outline" className="rounded-md">
                {action.label} · {action.sourceCount}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
