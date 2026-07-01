import type {
  AssignmentResultMetricItem,
  AssignmentResultMetricKey,
} from '@/assignments/result-view';
import { Card, CardContent } from '@/components/ui/card';
import {
  IconCalendarTime,
  IconChartBar,
  IconClock,
  IconUsers,
} from '@tabler/icons-react';

type AssignmentResultsMetricCardProps = {
  metric: AssignmentResultMetricItem;
};

export function AssignmentResultsMetricCard({
  metric,
}: AssignmentResultsMetricCardProps) {
  const Icon = resultMetricIconByKey[metric.key];

  return (
    <Card aria-label={metric.ariaLabel} className="rounded-lg" role="article">
      <CardContent className="p-4">
        <Icon aria-hidden="true" className="size-5 text-primary" />
        <output aria-label={metric.ariaLabel} className="mt-4 block">
          <span className="text-2xl font-semibold">{metric.value}</span>
        </output>
        <p className="text-sm text-muted-foreground">{metric.label}</p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {metric.description}
        </p>
      </CardContent>
    </Card>
  );
}

const resultMetricIconByKey: Record<
  AssignmentResultMetricKey,
  typeof IconUsers
> = {
  'average-accuracy': IconChartBar,
  'average-points': IconClock,
  'average-time': IconClock,
  closes: IconCalendarTime,
  completions: IconUsers,
};
