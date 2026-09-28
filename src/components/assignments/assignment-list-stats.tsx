import type {
  AssignmentListCardStatItems,
  AssignmentListCardStatKey,
} from '@/assignments/list-view';
import { IconChartBar, IconUsers } from '@tabler/icons-react';

type AssignmentListStatsProps = {
  idPrefix: string;
  label: string;
  statItems: AssignmentListCardStatItems;
};

export function AssignmentListStats({
  idPrefix,
  label,
  statItems,
}: AssignmentListStatsProps) {
  return (
    <dl aria-label={label} className="flex gap-6">
      {statItems.map((stat) => (
        <AssignmentListStat idPrefix={idPrefix} key={stat.key} stat={stat} />
      ))}
    </dl>
  );
}

const assignmentListCardStatIcons: Record<
  AssignmentListCardStatKey,
  typeof IconUsers
> = {
  average: IconChartBar,
  completions: IconUsers,
};

function AssignmentListStat({
  idPrefix,
  stat,
}: {
  idPrefix: string;
  stat: AssignmentListCardStatItems[number];
}) {
  const Icon = assignmentListCardStatIcons[stat.key];
  const labelId = `${idPrefix}-stat-${stat.key}-label`;
  const valueId = `${idPrefix}-stat-${stat.key}-value`;
  const descriptionId = `${idPrefix}-stat-${stat.key}-description`;

  return (
    <div className="grid gap-0.5">
      <dt
        id={labelId}
        className="flex items-center gap-1.5 text-muted-foreground text-xs"
      >
        <Icon aria-hidden="true" className="size-3.5" />
        {stat.label}
      </dt>
      <dd className="font-semibold text-lg tabular-nums">
        <output
          id={valueId}
          aria-label={stat.ariaLabel}
          aria-labelledby={`${labelId} ${valueId}`}
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
