import type {
  AssignmentResultMetricItem,
  AssignmentResultMetricKey,
} from '@/assignments/result-view';
import {
  IconCalendarTime,
  IconChartBar,
  IconClock,
  IconUsers,
} from '@tabler/icons-react';

type AssignmentResultsMetricCardProps = {
  metric: AssignmentResultMetricItem;
};

/** One figure in the results summary row: label, big value. */
export function AssignmentResultsMetricCard({
  metric,
}: AssignmentResultsMetricCardProps) {
  const Icon = resultMetricIconByKey[metric.key];
  const labelId = `assignment-result-metric-${metric.key}-label`;
  const valueId = `assignment-result-metric-${metric.key}-value`;
  const descriptionId = `assignment-result-metric-${metric.key}-description`;

  return (
    <article
      aria-describedby={descriptionId}
      aria-label={metric.ariaLabel}
      aria-labelledby={`${labelId} ${valueId}`}
      className="grid min-w-32 gap-1"
    >
      <p
        id={labelId}
        className="flex items-center gap-1.5 text-muted-foreground text-sm"
      >
        <Icon aria-hidden="true" className="size-4" />
        {metric.label}
      </p>
      <output
        aria-describedby={descriptionId}
        aria-label={metric.ariaLabel}
        aria-labelledby={`${labelId} ${valueId}`}
        className="block"
        id={valueId}
      >
        <span className="font-bold text-3xl tabular-nums tracking-tight">
          {metric.value}
        </span>
      </output>
      <p id={descriptionId} className="sr-only">
        {metric.description}
      </p>
    </article>
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
