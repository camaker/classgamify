import type {
  AssignmentListSummaryMetric,
  AssignmentListSummaryMetricId,
} from '@/assignments/list-summary';
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
    <article
      aria-label={metric.ariaLabel}
      aria-describedby={descriptionId}
      className="grid min-w-28 gap-1"
    >
      <p
        id={labelId}
        className="flex items-center gap-1.5 text-muted-foreground text-sm"
      >
        <Icon aria-hidden="true" className="size-4" />
        {metric.label}
      </p>
      <p className="font-bold text-3xl tabular-nums tracking-tight">
        <output id={valueId} aria-labelledby={`${labelId} ${valueId}`}>
          {metric.value}
        </output>
      </p>
      <p id={descriptionId} className="sr-only">
        {metric.description}
      </p>
    </article>
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
