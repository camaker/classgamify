import type { buildAssignmentListCardViewModel } from '@/assignments/list-view';
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
  assignment: ReturnType<typeof buildAssignmentListCardViewModel>;
};

type AssignmentListCardView = ReturnType<
  typeof buildAssignmentListCardViewModel
>;
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
      <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="grid gap-4">
          <AssignmentSettingsSummary view={assignment.settingsSummaryView} />
          <AssignmentListStats statItems={assignment.statItems} />
        </div>
        <AssignmentListCardActions
          actionView={assignment.actionView}
          statusPending={updateStatusMutation.isPending}
          onUpdateStatus={updateStatus}
        />
      </CardContent>
    </Card>
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
      to="/dashboard/assignments/$assignmentId"
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
      to="/print/assignments/$assignmentId"
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
  return (
    <>
      <Link
        to="/play/$shareId"
        params={{ shareId: action.shareSlug }}
        className={cn(buttonVariants(), 'w-full lg:w-auto')}
      >
        <IconPlayerPlay className="size-4" />
        {action.label}
      </Link>
      <CopyAssignmentShareLinkButton
        shareSlug={action.shareSlug}
        className="w-full bg-background lg:w-auto"
      />
    </>
  );
}
