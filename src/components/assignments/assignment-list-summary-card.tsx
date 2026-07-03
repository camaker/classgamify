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
  const labelId = `assignment-list-summary-${metric.id}-label`;
  const valueId = `assignment-list-summary-${metric.id}-value`;
  const descriptionId = `assignment-list-summary-${metric.id}-description`;

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

const assignmentSummaryMetricIcons: Record<
  AssignmentListSummaryMetricId,
  typeof IconShare3
> = {
  average: IconChartBar,
  completions: IconUsers,
  open: IconShare3,
  total: IconListCheck,
};
