import type { AssignmentListCardViewModel } from '@/assignments/list-view';
import { buildAssignmentStatusActionExecutionPlan } from '@/assignments/lifecycle';
import { AssignmentListStats } from '@/components/assignments/assignment-list-stats';
import { AssignmentSettingsSummary } from '@/components/assignments/assignment-settings-summary';
import { CopyAssignmentShareLinkButton } from '@/components/assignments/copy-assignment-share-link-button';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUpdateAssignmentStatus } from '@/hooks/use-assignments';
import { cn } from '@/lib/utils';
import {
  IconChartBar,
  IconListCheck,
  IconLock,
  IconLockOpen,
  IconPlayerPlay,
  IconPrinter,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { toast } from 'sonner';

type AssignmentListCardProps = {
  assignment: AssignmentListCardViewModel;
};

type AssignmentListCardView = AssignmentListCardViewModel;
type AssignmentListCardActionView = AssignmentListCardView['actionView'];
type AssignmentListPrintAction = NonNullable<
  AssignmentListCardActionView['printAction']
>;
type AssignmentListResultAction = NonNullable<
  AssignmentListCardActionView['resultAction']
>;
type AssignmentListShareAction = NonNullable<
  AssignmentListCardActionView['shareAction']
>;
type AssignmentListStatusAction = NonNullable<
  AssignmentListCardActionView['statusAction']
>;

export function AssignmentListCard({ assignment }: AssignmentListCardProps) {
  const updateStatusMutation = useUpdateAssignmentStatus();

  async function updateStatus() {
    const plan = buildAssignmentStatusActionExecutionPlan({
      assignmentId: assignment.id,
      statusAction: assignment.actionView.statusAction,
    });

    if (plan.type === 'blocked') return;

    try {
      await updateStatusMutation.mutateAsync(plan.input);
      toast.success(plan.successMessage);
    } catch {
      toast.error(plan.failureMessage);
    }
  }

  return (
    <Card className="rounded-lg">
      <AssignmentListCardHeader assignment={assignment} />
      <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <AssignmentListCardSummary assignment={assignment} />
        <AssignmentListCardActions
          actionView={assignment.actionView}
          statusPending={updateStatusMutation.isPending}
          onUpdateStatus={updateStatus}
        />
      </CardContent>
    </Card>
  );
}

function AssignmentListCardHeader({
  assignment,
}: {
  assignment: AssignmentListCardView;
}) {
  return (
    <CardHeader>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="rounded-md">
          {assignment.statusLabel}
        </Badge>
        <Badge variant="outline" className="rounded-md">
          <IconListCheck className="size-3.5" />
          {assignment.templateLabel}
        </Badge>
      </div>
      <CardTitle>
        <h2 className="text-lg font-semibold">{assignment.title}</h2>
      </CardTitle>
      <CardDescription>
        <p>{assignment.activityDescription}</p>
      </CardDescription>
    </CardHeader>
  );
}

function AssignmentListCardSummary({
  assignment,
}: {
  assignment: AssignmentListCardView;
}) {
  return (
    <div className="grid gap-4">
      <AssignmentSettingsSummary view={assignment.settingsSummaryView} />
      <AssignmentListStats statItems={assignment.statItems} />
    </div>
  );
}

function AssignmentListCardActions({
  actionView,
  onUpdateStatus,
  statusPending,
}: {
  actionView: AssignmentListCardActionView;
  onUpdateStatus: () => void;
  statusPending: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
      {actionView.resultAction ? (
        <AssignmentListResultActionLink action={actionView.resultAction} />
      ) : null}
      {actionView.printAction ? (
        <AssignmentListPrintActionLink action={actionView.printAction} />
      ) : null}
      {actionView.statusAction ? (
        <AssignmentListStatusActionButton
          disabled={statusPending}
          statusAction={actionView.statusAction}
          onUpdateStatus={onUpdateStatus}
        />
      ) : null}
      {actionView.shareAction ? (
        <AssignmentListShareActions action={actionView.shareAction} />
      ) : null}
    </div>
  );
}

function AssignmentListResultActionLink({
  action,
}: {
  action: AssignmentListResultAction;
}) {
  return (
    <Link
      to={action.to}
      params={{ assignmentId: action.assignmentId }}
      className={cn(
        buttonVariants({ variant: 'outline' }),
        'w-full bg-background lg:w-auto'
      )}
    >
      <IconChartBar className="size-4" />
      {action.label}
    </Link>
  );
}

function AssignmentListPrintActionLink({
  action,
}: {
  action: AssignmentListPrintAction;
}) {
  return (
    <Link
      to={action.to}
      params={{ assignmentId: action.assignmentId }}
      className={cn(
        buttonVariants({ variant: 'outline' }),
        'w-full bg-background lg:w-auto'
      )}
    >
      <IconPrinter className="size-4" />
      {action.label}
    </Link>
  );
}

function AssignmentListStatusActionButton({
  disabled,
  onUpdateStatus,
  statusAction,
}: {
  disabled: boolean;
  onUpdateStatus: () => void;
  statusAction: AssignmentListStatusAction;
}) {
  const Icon = statusAction.kind === 'close-link' ? IconLock : IconLockOpen;

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full bg-background lg:w-auto"
      disabled={disabled}
      onClick={onUpdateStatus}
    >
      <Icon className="size-4" />
      {statusAction.label}
    </Button>
  );
}

function AssignmentListShareActions({
  action,
}: {
  action: AssignmentListShareAction;
}) {
  const disabledReasonId = getAssignmentListShareDisabledReasonId(action);

  return (
    <div className="grid gap-2">
      <AssignmentListSharePath action={action} />
      <AssignmentListSharePreviewAction
        action={action}
        disabledReasonId={disabledReasonId}
      />
      <CopyAssignmentShareLinkButton
        disabled={!action.isAvailable}
        disabledMessage={action.disabledReason}
        label={action.copyLabel}
        shareSlug={action.shareSlug}
        className="w-full bg-background lg:w-auto"
      />
      <AssignmentListShareDisabledReason
        action={action}
        disabledReasonId={disabledReasonId}
      />
    </div>
  );
}

function AssignmentListSharePath({
  action,
}: {
  action: AssignmentListShareAction;
}) {
  return (
    <div className="max-w-56 rounded-lg border bg-muted/30 px-3 py-2 text-muted-foreground text-xs leading-5">
      <span className="font-medium">{action.sharePathLabel}</span>
      <span className="mt-1 block truncate font-mono">{action.sharePath}</span>
    </div>
  );
}

function AssignmentListSharePreviewAction({
  action,
  disabledReasonId,
}: {
  action: AssignmentListShareAction;
  disabledReasonId: string | undefined;
}) {
  if (!action.isAvailable) {
    return (
      <Button
        type="button"
        className="w-full lg:w-auto"
        disabled
        aria-describedby={disabledReasonId}
      >
        <IconPlayerPlay className="size-4" />
        {action.label}
      </Button>
    );
  }

  return (
    <Link
      to={action.to}
      params={{ shareId: action.shareSlug }}
      className={cn(buttonVariants(), 'w-full lg:w-auto')}
    >
      <IconPlayerPlay className="size-4" />
      {action.label}
    </Link>
  );
}

function AssignmentListShareDisabledReason({
  action,
  disabledReasonId,
}: {
  action: AssignmentListShareAction;
  disabledReasonId: string | undefined;
}) {
  if (!action.disabledReason) return null;

  return (
    <p
      id={disabledReasonId}
      className="max-w-56 text-muted-foreground text-xs leading-5"
    >
      {action.disabledReason}
    </p>
  );
}

function getAssignmentListShareDisabledReasonId({
  disabledReason,
  shareSlug,
}: AssignmentListShareAction) {
  return disabledReason
    ? `assignment-list-share-${shareSlug}-disabled-reason`
    : undefined;
}
