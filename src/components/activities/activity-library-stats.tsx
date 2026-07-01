import type { ActivityLibraryCardStat } from '@/activities/library-view';

type ActivityLibraryStatsProps = {
  label: string;
  stats: ActivityLibraryCardStat[];
};

export function ActivityLibraryStats({
  label,
  stats,
}: ActivityLibraryStatsProps) {
  return (
    <dl aria-label={label} className="grid gap-3 sm:grid-cols-3">
      {stats.map((stat) => (
        <ActivityLibraryStat
          key={stat.key}
          ariaLabel={stat.ariaLabel}
          description={stat.description}
          label={stat.label}
          value={stat.value}
        />
      ))}
    </dl>
  );
}

function ActivityLibraryStat({
  ariaLabel,
  description,
  label,
  value,
}: {
  ariaLabel: string;
  description: string;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-xl font-semibold">
        <output aria-label={ariaLabel}>{value}</output>
      </dd>
      <dd className="sr-only">{description}</dd>
    </div>
  );
}
