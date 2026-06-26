import type { DashboardOverviewMetricId } from '@/dashboard/overview';
import { Card, CardContent } from '@/components/ui/card';
import {
  IconChartBar,
  IconClipboardList,
  IconDeviceGamepad2,
  IconLayoutGrid,
  type TablerIcon,
} from '@tabler/icons-react';

type DashboardOverviewMetricCardProps = {
  metric: {
    description: string;
    id: DashboardOverviewMetricId;
    label: string;
    value: string;
  };
};

export function DashboardOverviewMetricCard({
  metric,
}: DashboardOverviewMetricCardProps) {
  const Icon = dashboardMetricIcons[metric.id];

  return (
    <Card className="rounded-lg">
      <CardContent className="p-4">
        <Icon className="size-5 text-primary" />
        <p className="mt-4 text-2xl font-semibold">{metric.value}</p>
        <p className="text-sm font-medium">{metric.label}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {metric.description}
        </p>
      </CardContent>
    </Card>
  );
}

const dashboardMetricIcons: Record<DashboardOverviewMetricId, TablerIcon> = {
  activities: IconDeviceGamepad2,
  assignments: IconClipboardList,
  results: IconChartBar,
  templates: IconLayoutGrid,
};
