import type { ActivitySourceMaterialSummaryView } from '@/activities/material-summary';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { IconPaperclip, IconSparkles } from '@tabler/icons-react';

type ActivitySourceMaterialsSummaryProps = {
  className?: string;
  summary: ActivitySourceMaterialSummaryView;
};

export function ActivitySourceMaterialsSummary({
  className,
  summary,
}: ActivitySourceMaterialsSummaryProps) {
  if (!summary.hasMaterials) return null;

  return (
    <div className={cn('rounded-lg border bg-background p-3', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <IconPaperclip className="size-4 text-primary" />
            <p className="font-medium text-sm">{summary.title}</p>
          </div>
          <p className="mt-1 text-muted-foreground text-xs">
            {summary.countLabel}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {summary.kindBadges.map((badge) => (
            <Badge key={badge.kind} variant="secondary" className="rounded-md">
              {badge.summaryText}
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
              <Badge
                key={action.id}
                variant="outline"
                className="rounded-md bg-background"
              >
                <IconSparkles className="size-3" />
                {action.summaryText}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
