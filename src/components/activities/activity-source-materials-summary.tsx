import type {
  ActivitySourceMaterialExtractionActionView,
  ActivitySourceMaterialKindBadgeView,
  ActivitySourceMaterialSummaryView,
} from '@/activities/material-summary';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { IconPaperclip, IconSparkles } from '@tabler/icons-react';
import type { ReactNode } from 'react';

type ActivitySourceMaterialsSummaryProps = {
  actionSlot?: ReactNode;
  className?: string;
  label?: string;
  summary: ActivitySourceMaterialSummaryView;
};

export function ActivitySourceMaterialsSummary({
  actionSlot,
  className,
  label,
  summary,
}: ActivitySourceMaterialsSummaryProps) {
  if (!summary.hasMaterials) return null;

  return (
    <section
      aria-label={label ?? summary.ariaLabel}
      className={cn('rounded-lg border bg-background p-3', className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <IconPaperclip aria-hidden="true" className="size-4 text-primary" />
            <p className="font-medium text-sm">{summary.title}</p>
          </div>
          <p className="mt-1 text-muted-foreground text-xs">
            {summary.compactSummaryText}
          </p>
          <p className="mt-1 text-muted-foreground text-xs leading-5">
            {summary.readinessStatus.description}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            variant={summary.readinessStatus.badgeVariant}
            className="rounded-md"
          >
            {summary.readinessStatus.value}
          </Badge>
          {actionSlot}
          <div className="flex flex-wrap gap-1.5">
            {summary.kindBadges.map((badge) => (
              <ActivitySourceMaterialKindBadge badge={badge} key={badge.kind} />
            ))}
          </div>
        </div>
      </div>
      {summary.extractionActions.length ? (
        <ActivitySourceMaterialExtractionSummary summary={summary} />
      ) : null}
    </section>
  );
}

function ActivitySourceMaterialKindBadge({
  badge,
}: {
  badge: ActivitySourceMaterialKindBadgeView;
}) {
  return (
    <Badge variant="secondary" className="rounded-md">
      {badge.summaryText}
    </Badge>
  );
}

function ActivitySourceMaterialExtractionSummary({
  summary,
}: {
  summary: ActivitySourceMaterialSummaryView;
}) {
  return (
    <div className="mt-3 border-t pt-3">
      <p className="text-muted-foreground text-xs">{summary.extractionTitle}</p>
      {summary.primaryNextStep ? (
        <div className="mt-2 rounded-md border bg-muted/30 p-2.5">
          <p className="font-medium text-xs">{summary.primaryNextStep.label}</p>
          <p className="mt-0.5 text-muted-foreground text-xs leading-5">
            {summary.primaryNextStep.description}
          </p>
        </div>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {summary.extractionActions.map((action) => (
          <ActivitySourceMaterialExtractionBadge
            action={action}
            key={action.id}
          />
        ))}
      </div>
    </div>
  );
}

function ActivitySourceMaterialExtractionBadge({
  action,
}: {
  action: ActivitySourceMaterialExtractionActionView;
}) {
  return (
    <div className="rounded-md border bg-background px-2.5 py-2">
      <Badge variant="outline" className="rounded-md bg-background">
        <IconSparkles aria-hidden="true" className="size-3" />
        {action.summaryText}
      </Badge>
      <p className="mt-1 font-medium text-xs">{action.nextStep.label}</p>
      <p className="mt-0.5 text-muted-foreground text-xs leading-5">
        {action.nextStep.description}
      </p>
    </div>
  );
}
