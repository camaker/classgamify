import type { DashboardCoreLoopReadinessRow } from '@/dashboard/overview';
import { Progress } from '@/components/ui/progress';

type DashboardOverviewReadinessRowProps = {
  row: DashboardCoreLoopReadinessRow;
};

export function DashboardOverviewReadinessRow({
  row,
}: DashboardOverviewReadinessRowProps) {
  return (
    <section aria-label={row.ariaLabel} className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span>{row.label}</span>
        <span className="text-muted-foreground">{row.percentLabel}</span>
      </div>
      <p className="text-muted-foreground text-xs leading-5">
        {row.description}
      </p>
      <Progress
        aria-label={row.ariaLabel}
        aria-valuetext={`${row.percentLabel}. ${row.statusLabel}`}
        value={row.value}
      />
    </section>
  );
}
