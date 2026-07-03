import type {
  ActivityLibrarySummaryMetric,
  ActivityLibrarySummaryMetricId,
} from '@/activities/library-summary';
import { Card, CardContent } from '@/components/ui/card';
import {
  IconDeviceGamepad2,
  IconFolder,
  IconPaperclip,
  IconSwitchHorizontal,
} from '@tabler/icons-react';

type ActivityLibrarySummaryCardProps = {
  metric: ActivityLibrarySummaryMetric;
};

export function ActivityLibrarySummaryCard({
  metric,
}: ActivityLibrarySummaryCardProps) {
  const Icon = activitySummaryMetricIcons[metric.id];
  const labelId = `activity-library-summary-${metric.id}-label`;
  const valueId = `activity-library-summary-${metric.id}-value`;
  const descriptionId = `activity-library-summary-${metric.id}-description`;

  return (
    <Card
      role="article"
      aria-label={metric.ariaLabel}
      aria-describedby={descriptionId}
      className="rounded-lg"
    >
      <CardContent className="p-4">
        <Icon aria-hidden="true" className="size-5 text-primary" />
        <p className="mt-4 text-2xl font-semibold">
          <output id={valueId} aria-labelledby={`${labelId} ${valueId}`}>
            {metric.value}
          </output>
        </p>
        <p id={labelId} className="text-sm text-muted-foreground">
          {metric.label}
        </p>
        <p
          id={descriptionId}
          className="mt-1 text-xs leading-5 text-muted-foreground"
        >
          {metric.description}
        </p>
      </CardContent>
    </Card>
  );
}

const activitySummaryMetricIcons: Record<
  ActivityLibrarySummaryMetricId,
  typeof IconFolder
> = {
  coverage: IconDeviceGamepad2,
  remix: IconSwitchHorizontal,
  sourceExtraction: IconPaperclip,
  total: IconFolder,
};
