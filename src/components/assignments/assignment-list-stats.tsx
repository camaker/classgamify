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
    <dl aria-label={label} className="grid gap-3 sm:grid-cols-2">
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
    <div className="rounded-lg border bg-background p-3">
      <Icon aria-hidden="true" className="size-4 text-primary" />
      <dt id={labelId} className="mt-2 text-xs text-muted-foreground">
        {stat.label}
      </dt>
      <dd className="text-sm font-medium">
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
