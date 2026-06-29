import type {
  AssignmentListCardStatItems,
  AssignmentListCardStatKey,
} from '@/assignments/list-view';
import { IconChartBar, IconUsers } from '@tabler/icons-react';

type AssignmentListStatsProps = {
  statItems: AssignmentListCardStatItems;
};

export function AssignmentListStats({ statItems }: AssignmentListStatsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {statItems.map((stat) => (
        <AssignmentListStat
          key={stat.key}
          icon={assignmentListCardStatIcons[stat.key]}
          label={stat.label}
          value={stat.value}
        />
      ))}
    </div>
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
  icon: Icon,
  label,
  value,
}: {
  icon: typeof IconUsers;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <Icon className="size-4 text-primary" />
      <p className="mt-2 text-sm font-medium">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
