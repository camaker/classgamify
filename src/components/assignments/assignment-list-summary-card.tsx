import type {
  AssignmentListSummaryMetric,
  AssignmentListSummaryMetricId,
} from '@/assignments/list-summary';
import { Card, CardContent } from '@/components/ui/card';
import {
  IconChartBar,
  IconListCheck,
  IconShare3,
  IconUsers,
} from '@tabler/icons-react';

type AssignmentListSummaryCardProps = {
  metric: AssignmentListSummaryMetric;
};

export function AssignmentListSummaryCard({
  metric,
}: AssignmentListSummaryCardProps) {
  const Icon = assignmentSummaryMetricIcons[metric.id];

  return (
    <Card className="rounded-lg">
      <CardContent className="p-4">
        <Icon className="size-5 text-primary" />
        <p className="mt-4 text-2xl font-semibold">{metric.value}</p>
        <p className="text-sm text-muted-foreground">{metric.label}</p>
      </CardContent>
    </Card>
  );
}

const assignmentSummaryMetricIcons: Record<
  AssignmentListSummaryMetricId,
  typeof IconShare3
> = {
  average: IconChartBar,
  completions: IconUsers,
  open: IconShare3,
  total: IconListCheck,
};
