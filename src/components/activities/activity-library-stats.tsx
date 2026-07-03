import type { ActivityLibraryCardStat } from '@/activities/library-view';

type ActivityLibraryStatsProps = {
  idPrefix: string;
  label: string;
  stats: ActivityLibraryCardStat[];
};

export function ActivityLibraryStats({
  idPrefix,
  label,
  stats,
}: ActivityLibraryStatsProps) {
  return (
    <dl aria-label={label} className="grid gap-3 sm:grid-cols-3">
      {stats.map((stat) => (
        <ActivityLibraryStat idPrefix={idPrefix} key={stat.key} stat={stat} />
      ))}
    </dl>
  );
}

function ActivityLibraryStat({
  idPrefix,
  stat,
}: {
  idPrefix: string;
  stat: ActivityLibraryCardStat;
}) {
  const labelId = `${idPrefix}-stat-${stat.key}-label`;
  const valueId = `${idPrefix}-stat-${stat.key}-value`;
  const descriptionId = `${idPrefix}-stat-${stat.key}-description`;

  return (
    <div className="rounded-lg border bg-background p-3">
      <dt id={labelId} className="text-xs text-muted-foreground">
        {stat.label}
      </dt>
      <dd className="text-xl font-semibold">
        <output
          id={valueId}
          aria-label={stat.ariaLabel}
          aria-describedby={descriptionId}
        >
          {stat.value}
        </output>
      </dd>
      <dd id={descriptionId} className="sr-only">
        {stat.description}
      </dd>
    </div>
  );
}
