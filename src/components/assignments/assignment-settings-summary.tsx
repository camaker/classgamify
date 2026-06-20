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
  return (
    <div className="grid gap-3">
      {instructions ? (
        <div className="rounded-lg border bg-muted/20 p-3 text-sm leading-6 text-muted-foreground">
          {instructions}
        </div>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <AssignmentSettingTile
          icon={IconRepeat}
          label="Attempts"
          value={formatAssignmentAttempts(maxAttempts)}
        />
        <AssignmentSettingTile
          icon={IconClock}
          label="Timer"
          value={formatAssignmentTimeLimit(timeLimitSeconds)}
        />
        <AssignmentSettingTile
          icon={IconCalendarTime}
          label="Closes"
          value={formatAssignmentExpiry(expiresAt)}
        />
        <AssignmentSettingTile
          icon={collectStudentName ? IconUser : IconUserOff}
          label="Student identity"
          value={formatStudentIdentity(collectStudentName)}
        />
        <AssignmentSettingTile
          icon={IconEye}
          label="Answer reveal"
          value={formatAnswerReveal(showCorrectAnswers)}
        />
        <AssignmentSettingTile
          icon={IconArrowsShuffle}
          label="Item order"
          value={formatShuffleItems(shuffleItems)}
        />
      </div>
    </div>
  );
}

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

export function formatAssignmentAttempts(maxAttempts?: number) {
  return maxAttempts ? `${maxAttempts} max` : 'Open';
}

export function formatAssignmentExpiry(expiresAt: AssignmentDate) {
  if (!expiresAt) return 'No close time';

  const date = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  if (Number.isNaN(date.getTime())) return 'No close time';

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatAssignmentTimeLimit(seconds?: number) {
  if (!seconds) return 'No timer';
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
}

export function formatStudentIdentity(collectStudentName: boolean) {
  return collectStudentName ? 'Names' : 'Anonymous';
}

export function formatAnswerReveal(showCorrectAnswers: boolean) {
  return showCorrectAnswers ? 'After submit' : 'Hidden';
}

export function formatShuffleItems(shuffleItems: boolean) {
  return shuffleItems ? 'Shuffled' : 'Fixed order';
}
