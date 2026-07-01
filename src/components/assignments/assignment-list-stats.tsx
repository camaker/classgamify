import type {
  AssignmentListCardStatItems,
  AssignmentListCardStatKey,
} from '@/assignments/list-view';
import { IconChartBar, IconUsers } from '@tabler/icons-react';

type AssignmentListStatsProps = {
  label: string;
  statItems: AssignmentListCardStatItems;
};

export function AssignmentListStats({
  label,
  statItems,
}: AssignmentListStatsProps) {
  return (
    <dl aria-label={label} className="grid gap-3 sm:grid-cols-2">
      {statItems.map((stat) => (
        <AssignmentListStat
          key={stat.key}
          ariaLabel={stat.ariaLabel}
          description={stat.description}
          icon={assignmentListCardStatIcons[stat.key]}
          label={stat.label}
          value={stat.value}
        />
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
  ariaLabel,
  description,
  icon: Icon,
  label,
  value,
}: {
  ariaLabel: string;
  description: string;
  icon: typeof IconUsers;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <Icon aria-hidden="true" className="size-4 text-primary" />
      <dt className="mt-2 text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">
        <output aria-label={ariaLabel}>{value}</output>
      </dd>
      <dd className="sr-only">{description}</dd>
    </div>
  );
}
