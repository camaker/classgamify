import {
  type AssignmentDeliverySummaryItem,
  type AssignmentDeliverySummaryId,
  type AssignmentInstructionSummary,
  type AssignmentSettingsSummaryStatusView,
  type AssignmentSettingsSummaryView,
  buildAssignmentSettingsSummaryView,
} from '@/assignments/delivery-summary';
import { Badge } from '@/components/ui/badge';
import type { AssignmentSettings } from '@/activities/types';
import type { AssignmentDate } from '@/assignments/lifecycle';
import { cn } from '@/lib/utils';
import {
  IconAlertCircle,
  IconArrowsShuffle,
  IconCalendarTime,
  IconClock,
  IconClipboardText,
  IconEye,
  IconInfoCircle,
  IconRepeat,
  IconUser,
  IconUserOff,
} from '@tabler/icons-react';

type AssignmentSettingsSummaryPreparedProps = {
  view: AssignmentSettingsSummaryView;
};

type AssignmentSettingsSummaryRawProps = {
  collectStudentName?: boolean;
  expiresAt: AssignmentDate;
  instructions?: string;
  maxAttempts?: number | null;
  settings?: Partial<AssignmentSettings> | null;
  showCorrectAnswers?: boolean;
  shuffleItems?: boolean;
  timeLimitSeconds?: number;
};

type AssignmentSettingsSummaryProps =
  | AssignmentSettingsSummaryPreparedProps
  | AssignmentSettingsSummaryRawProps;

export function AssignmentSettingsSummary(
  props: AssignmentSettingsSummaryProps
) {
  const summaryView =
    'view' in props
      ? props.view
      : buildAssignmentSettingsSummaryView({
          collectStudentName: props.collectStudentName,
          expiresAt: props.expiresAt,
          instructions: props.instructions,
          maxAttempts: props.maxAttempts,
          settings: props.settings,
          showCorrectAnswers: props.showCorrectAnswers,
          shuffleItems: props.shuffleItems,
          timeLimitSeconds: props.timeLimitSeconds,
        });

  return (
    <div className="grid gap-3">
      <AssignmentSettingsStatusTile statusView={summaryView.status} />
      <AssignmentInstructionsTile instructions={summaryView.instructions} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {summaryView.items.map((item) => (
          <AssignmentSettingTile
            collectStudentName={summaryView.settings.collectStudentName}
            item={item}
            key={item.id}
          />
        ))}
      </div>
    </div>
  );
}

function AssignmentSettingsStatusTile({
  statusView,
}: {
  statusView: AssignmentSettingsSummaryStatusView;
}) {
  const Icon =
    statusView.tone === 'attention' ? IconAlertCircle : IconInfoCircle;

  return (
    <section
      aria-label={statusView.ariaLabel}
      className="rounded-lg border bg-muted/30 p-3"
      data-tone={statusView.tone}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium text-sm">
          <Icon aria-hidden="true" className="size-4 text-primary" />
          {statusView.label}
        </div>
        <Badge
          variant={statusView.tone === 'attention' ? 'secondary' : 'outline'}
          className="rounded-md"
        >
          {statusView.value}
        </Badge>
      </div>
      <p className="mt-2 text-muted-foreground text-xs leading-5">
        {statusView.description}
      </p>
    </section>
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

function AssignmentInstructionsTile({
  instructions,
}: {
  instructions: AssignmentInstructionSummary;
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3 text-sm leading-6">
      <div className="flex items-center gap-2 font-medium text-foreground">
        <IconClipboardText className="size-4 text-primary" />
        {instructions.label}
      </div>
      <p
        className={cn(
          'mt-2 text-muted-foreground',
          instructions.isEmpty && 'italic'
        )}
      >
        {instructions.value}
      </p>
    </div>
  );
}

function AssignmentSettingTile({
  collectStudentName,
  item,
}: {
  collectStudentName: boolean;
  item: AssignmentDeliverySummaryItem;
}) {
  const Icon = getAssignmentSettingIcon(item.id, collectStudentName);

  return (
    <div className="rounded-lg border bg-background p-3">
      <Icon className="size-4 text-primary" />
      <p className="mt-2 text-sm font-medium">{item.value}</p>
      <p className="text-xs text-muted-foreground">{item.label}</p>
    </div>
  );
}
