import type { DashboardCoreLoopReadinessRow } from '@/dashboard/overview';
import { Progress } from '@/components/ui/progress';

type DashboardOverviewReadinessRowProps = {
  row: DashboardCoreLoopReadinessRow;
};

export function DashboardOverviewReadinessRow({
  row,
}: DashboardOverviewReadinessRowProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span>{row.label}</span>
        <span className="text-muted-foreground">{row.value}%</span>
      </div>
      <Progress value={row.value} />
    </div>
  );
}
