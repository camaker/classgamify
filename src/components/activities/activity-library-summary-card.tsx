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

  return (
    <Card role="article" aria-label={metric.ariaLabel} className="rounded-lg">
      <CardContent className="p-4">
        <Icon aria-hidden="true" className="size-5 text-primary" />
        <p className="mt-4 text-2xl font-semibold">{metric.value}</p>
        <p className="text-sm text-muted-foreground">{metric.label}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
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
