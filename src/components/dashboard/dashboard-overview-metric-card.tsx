import type { DashboardOverviewMetric } from '@/dashboard/overview';
import { Card, CardContent } from '@/components/ui/card';
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

export function DashboardOverviewMetricCard({
  metric,
}: DashboardOverviewMetricCardProps) {
  const Icon = dashboardMetricIcons[metric.id];

  return (
    <Card aria-label={metric.ariaLabel} className="rounded-lg">
      <CardContent className="p-4">
        <Icon className="size-5 text-primary" />
        <output
          aria-label={metric.ariaLabel}
          className="mt-4 block text-2xl font-semibold"
        >
          {metric.value}
        </output>
        <p className="text-sm font-medium">{metric.label}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {metric.description}
        </p>
      </CardContent>
    </Card>
  );
}

const dashboardMetricIcons: Record<DashboardOverviewMetric['id'], TablerIcon> =
  {
    activities: IconDeviceGamepad2,
    assignments: IconClipboardList,
    results: IconChartBar,
    templates: IconLayoutGrid,
  };
