import type { DashboardOverviewMetric } from '@/dashboard/overview';
import {
  IconChartBar,
  IconClipboardList,
  IconDeviceGamepad2,
  IconLayoutGrid,
  type TablerIcon,
} from '@tabler/icons-react';

type DashboardOverviewMetricCardProps = {
  metric: DashboardOverviewMetric;
};

/** One figure in the dashboard summary row: label, big value. */
export function DashboardOverviewMetricCard({
  metric,
}: DashboardOverviewMetricCardProps) {
  const Icon = dashboardMetricIcons[metric.id];

  return (
    <article aria-label={metric.ariaLabel} className="grid min-w-28 gap-1">
      <p className="flex items-center gap-1.5 text-muted-foreground text-sm">
        <Icon aria-hidden="true" className="size-4" />
        {metric.label}
      </p>
      <output
        aria-label={metric.ariaLabel}
        className="block font-bold text-3xl tabular-nums tracking-tight"
      >
        {metric.value}
      </output>
      <p className="sr-only">{metric.description}</p>
    </article>
  );
}

const dashboardMetricIcons: Record<DashboardOverviewMetric['id'], TablerIcon> =
  {
    activities: IconDeviceGamepad2,
    assignments: IconClipboardList,
    results: IconChartBar,
    templates: IconLayoutGrid,
  };
