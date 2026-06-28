import type { buildAssignmentResultsPageViewModel } from '@/assignments/result-view';
import { Card, CardContent } from '@/components/ui/card';
import {
  IconCalendarTime,
  IconChartBar,
  IconClock,
  IconUsers,
} from '@tabler/icons-react';

type AssignmentResultsMetric = ReturnType<
  typeof buildAssignmentResultsPageViewModel
>['metricItems'][number];

type AssignmentResultsMetricCardProps = {
  metric: AssignmentResultsMetric;
};

export function AssignmentResultsMetricCard({
  metric,
}: AssignmentResultsMetricCardProps) {
  const Icon = resultMetricIconByKey[metric.key];

  return (
    <Card className="rounded-lg">
      <CardContent className="p-4">
        <Icon className="size-5 text-primary" />
        <p className="mt-4 text-2xl font-semibold">{metric.value}</p>
        <p className="text-sm text-muted-foreground">{metric.label}</p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {metric.description}
        </p>
      </CardContent>
    </Card>
  );
}

const resultMetricIconByKey: Record<
  AssignmentResultsMetric['key'],
  typeof IconUsers
> = {
  'average-accuracy': IconChartBar,
  'average-points': IconClock,
  'average-time': IconClock,
  closes: IconCalendarTime,
  completions: IconUsers,
};
