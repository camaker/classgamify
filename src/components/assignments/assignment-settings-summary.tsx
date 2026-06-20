import {
  type AssignmentDeliverySummaryId,
  buildAssignmentDeliverySummary,
} from '@/assignments/delivery-summary';
import type { AssignmentDate } from '@/assignments/lifecycle';
import {
  IconArrowsShuffle,
  IconCalendarTime,
  IconClock,
  IconEye,
  IconRepeat,
  IconUser,
  IconUserOff,
} from '@tabler/icons-react';

type AssignmentSettingsSummaryProps = {
  collectStudentName?: boolean;
  expiresAt: AssignmentDate;
  instructions?: string;
  maxAttempts?: number;
  showCorrectAnswers?: boolean;
  shuffleItems?: boolean;
  timeLimitSeconds?: number;
};

export function AssignmentSettingsSummary({
  collectStudentName = true,
  expiresAt,
  instructions,
  maxAttempts,
  showCorrectAnswers = true,
  shuffleItems = true,
  timeLimitSeconds,
}: AssignmentSettingsSummaryProps) {
  const summary = buildAssignmentDeliverySummary({
    collectStudentName,
    expiresAt,
    maxAttempts,
    showCorrectAnswers,
    shuffleItems,
    timeLimitSeconds,
  });

  return (
    <div className="grid gap-3">
      {instructions ? (
        <div className="rounded-lg border bg-muted/20 p-3 text-sm leading-6 text-muted-foreground">
          {instructions}
        </div>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {summary.map((item) => (
          <AssignmentSettingTile
            icon={getAssignmentSettingIcon(item.id, collectStudentName)}
            key={item.id}
            label={item.label}
            value={item.value}
          />
        ))}
      </div>
    </div>
  );
}

function getAssignmentSettingIcon(
  id: AssignmentDeliverySummaryId,
  collectStudentName: boolean
) {
  if (id === 'identity') {
    return collectStudentName ? IconUser : IconUserOff;
  }

  return assignmentSettingIcons[id];
}

const assignmentSettingIcons = {
  answerReveal: IconEye,
  attempts: IconRepeat,
  closes: IconCalendarTime,
  itemOrder: IconArrowsShuffle,
  timer: IconClock,
} satisfies Record<
  Exclude<AssignmentDeliverySummaryId, 'identity'>,
  typeof IconClock
>;

function AssignmentSettingTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof IconClock;
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
