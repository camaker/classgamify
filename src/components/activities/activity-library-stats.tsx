import type { ActivityLibraryCardStat } from '@/activities/library-view';

type ActivityLibraryStatsProps = {
  stats: ActivityLibraryCardStat[];
};

export function ActivityLibraryStats({ stats }: ActivityLibraryStatsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {stats.map((stat) => (
        <ActivityLibraryStat
          key={stat.key}
          label={stat.label}
          value={stat.value}
        />
      ))}
    </div>
  );
}

function ActivityLibraryStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
