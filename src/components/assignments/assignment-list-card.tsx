import type {
  AssignmentListCardActionView,
  AssignmentListCardViewModel,
  AssignmentListPrintAction,
  AssignmentListResultAction,
  AssignmentListShareAction,
  AssignmentListStatusAction,
} from '@/assignments/list-view';
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
import { m } from '@/locale/paraglide/messages';
import { cn } from '@/lib/utils';
import {
  IconChartBar,
  IconChevronDown,
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

export function AssignmentListCard({ assignment }: AssignmentListCardProps) {
  const updateStatusMutation = useUpdateAssignmentStatus();
  const cardElementId = formatAssignmentListElementId(
    `assignment-list-card-${assignment.id}`
  );

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
    <Card
      role="article"
      aria-label={assignment.ariaLabel}
      className="rounded-lg"
    >
      <AssignmentListCardHeader
        assignment={assignment}
        idPrefix={cardElementId}
      />
      <CardContent className="grid min-w-0 gap-3">
        {assignment.actionView.shareAction ? (
          <AssignmentListShareActions
            action={assignment.actionView.shareAction}
          />
        ) : null}
        <AssignmentListCardActions
          assignmentId={assignment.id}
          label={assignment.actionsLabel}
          actionView={assignment.actionView}
          statusPending={updateStatusMutation.isPending}
          onUpdateStatus={updateStatus}
        />
        <details
          aria-label={assignment.summaryLabel}
          className="group rounded-lg border"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 font-medium text-sm [&::-webkit-details-marker]:hidden">
            {m.assignment_results_settings_toggle()}
            <IconChevronDown
              aria-hidden="true"
              className="size-4 text-muted-foreground transition-transform group-open:rotate-180"
            />
          </summary>
          <div className="border-t p-3">
            <AssignmentSettingsSummary view={assignment.settingsSummaryView} />
          </div>
        </details>
      </CardContent>
    </Card>
  );
}

function AssignmentListCardHeader({
  assignment,
  idPrefix,
}: {
  assignment: AssignmentListCardViewModel;
  idPrefix: string;
}) {
  return (
    <CardHeader className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
      <div className="grid min-w-0 flex-1 basis-64 gap-1.5">
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
      </div>
      <AssignmentListStats
        idPrefix={idPrefix}
        label={assignment.statsLabel}
        statItems={assignment.statItems}
      />
    </CardHeader>
  );
}

function AssignmentListCardActions({
  assignmentId,
  actionView,
  label,
  onUpdateStatus,
  statusPending,
}: {
  assignmentId: string;
  actionView: AssignmentListCardActionView;
  label: string;
  onUpdateStatus: () => void;
  statusPending: boolean;
}) {
  return (
    <section aria-label={label} className="flex flex-wrap gap-2">
      {actionView.resultAction ? (
        <AssignmentListResultActionLink action={actionView.resultAction} />
      ) : null}
      {actionView.printAction ? (
        <AssignmentListPrintActionLink action={actionView.printAction} />
      ) : null}
      {actionView.statusAction ? (
        <AssignmentListStatusActionButton
          assignmentId={assignmentId}
          isPending={statusPending}
          statusAction={actionView.statusAction}
          onUpdateStatus={onUpdateStatus}
        />
      ) : null}
    </section>
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
        buttonVariants({ variant: 'outline', size: 'sm' }),
        'bg-background'
      )}
    >
      <IconChartBar aria-hidden="true" className="size-4" />
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
      search={action.search}
      className={cn(
        buttonVariants({ variant: 'outline', size: 'sm' }),
        'bg-background'
      )}
    >
      <IconPrinter aria-hidden="true" className="size-4" />
      {action.label}
    </Link>
  );
}

function AssignmentListStatusActionButton({
  assignmentId,
  isPending,
  onUpdateStatus,
  statusAction,
}: {
  assignmentId: string;
  isPending: boolean;
  onUpdateStatus: () => void;
  statusAction: AssignmentListStatusAction;
}) {
  const Icon = statusAction.kind === 'close-link' ? IconLock : IconLockOpen;
  const descriptionId = getAssignmentListStatusActionElementId({
    assignmentId,
    statusAction,
    suffix: 'description',
  });
  const currentStatusId = getAssignmentListStatusActionElementId({
    assignmentId,
    statusAction,
    suffix: 'current-status',
  });
  const nextStatusId = getAssignmentListStatusActionElementId({
    assignmentId,
    statusAction,
    suffix: 'next-status',
  });
  const describedBy = buildAssignmentListStatusActionDescriptionIds(
    descriptionId,
    currentStatusId,
    nextStatusId
  );

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="bg-background"
        disabled={isPending}
        aria-label={statusAction.ariaLabel}
        aria-describedby={describedBy}
        onClick={onUpdateStatus}
      >
        <Icon aria-hidden="true" className="size-4" />
        {isPending ? statusAction.pendingLabel : statusAction.label}
      </Button>
      <p id={descriptionId} className="sr-only">
        {statusAction.description}
      </p>
      <dl className="sr-only">
        <div>
          <dt>{statusAction.currentStatusLabel}</dt>
          <dd id={currentStatusId}>{statusAction.currentStatusValue}</dd>
        </div>
        <div>
          <dt>{statusAction.nextStatusLabel}</dt>
          <dd id={nextStatusId}>{statusAction.nextStatusValue}</dd>
        </div>
      </dl>
    </div>
  );
}

function getAssignmentListStatusActionElementId({
  assignmentId,
  statusAction,
  suffix,
}: {
  assignmentId: string;
  statusAction: AssignmentListStatusAction;
  suffix: string;
}) {
  return `assignment-list-status-action-${getAssignmentActionDomIdPart(
    assignmentId
  )}-${statusAction.kind}-${suffix}`;
}

function getAssignmentActionDomIdPart(value: string) {
  const normalizedValue = value.normalize('NFKC').trim();
  return encodeURIComponent(normalizedValue || 'missing-assignment-id');
}

function buildAssignmentListStatusActionDescriptionIds(
  ...ids: Array<string | undefined>
) {
  const descriptionIds = ids.filter(Boolean).join(' ');
  return descriptionIds || undefined;
}

function AssignmentListShareActions({
  action,
}: {
  action: AssignmentListShareAction;
}) {
  const disabledReasonId = getAssignmentListShareDisabledReasonId(action);
  const sharePathDescriptionId =
    getAssignmentListSharePathDescriptionId(action);

  return (
    <div className="grid min-w-0 gap-1.5">
      <div className="flex min-w-0 flex-wrap items-center gap-2 rounded-lg border bg-muted/30 p-1.5 pl-3">
        <AssignmentListSharePath
          action={action}
          descriptionId={sharePathDescriptionId}
        />
        <CopyAssignmentShareLinkButton
          disabled={!action.isAvailable}
          disabledReasonCode={action.disabledReasonCode}
          disabledMessage={action.disabledReason}
          disabledReasonId={disabledReasonId}
          descriptionId={sharePathDescriptionId}
          label={action.copyLabel}
          shareSlug={action.shareSlug}
          shareUrl={action.shareUrl}
          size="sm"
          variant="default"
        />
        <AssignmentListSharePreviewAction
          action={action}
          disabledReasonId={disabledReasonId}
          sharePathDescriptionId={sharePathDescriptionId}
        />
      </div>
      <AssignmentListShareDisabledReason
        action={action}
        disabledReasonId={disabledReasonId}
      />
    </div>
  );
}

function AssignmentListSharePath({
  action,
  descriptionId,
}: {
  action: AssignmentListShareAction;
  descriptionId: string;
}) {
  const shareUrlLabelId = getAssignmentListSharePathElementId(
    action,
    'url-label'
  );
  const shareUrlValueId = getAssignmentListSharePathElementId(
    action,
    'url-value'
  );
  const sharePathLabelId = getAssignmentListSharePathElementId(
    action,
    'path-label'
  );
  const sharePathValueId = getAssignmentListSharePathElementId(
    action,
    'path-value'
  );

  return (
    <section
      aria-labelledby={shareUrlLabelId}
      aria-describedby={descriptionId}
      className="min-w-0 flex-1 basis-48"
    >
      <span id={shareUrlLabelId} className="sr-only">
        {action.shareUrlLabel}
      </span>
      <span
        id={shareUrlValueId}
        className="block truncate font-mono text-muted-foreground text-xs"
      >
        {action.shareUrl}
      </span>
      <span id={sharePathLabelId} className="sr-only">
        {action.sharePathLabel}
      </span>
      <span id={sharePathValueId} className="sr-only">
        {action.sharePath}
      </span>
      <span id={descriptionId} className="sr-only">
        {action.shareUrlLabel} {action.shareUrl} {action.sharePathLabel}{' '}
        {action.sharePath}
      </span>
    </section>
  );
}

function AssignmentListSharePreviewAction({
  action,
  disabledReasonId,
  sharePathDescriptionId,
}: {
  action: AssignmentListShareAction;
  disabledReasonId: string | undefined;
  sharePathDescriptionId: string;
}) {
  const describedBy = buildAssignmentListShareDescriptionIds(
    sharePathDescriptionId,
    disabledReasonId
  );

  if (!action.isAvailable) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="bg-background"
        disabled
        aria-describedby={describedBy}
      >
        <IconPlayerPlay aria-hidden="true" className="size-4" />
        {action.label}
      </Button>
    );
  }

  return (
    <Link
      to={action.to}
      params={{ shareId: action.shareSlug }}
      className={cn(
        buttonVariants({ variant: 'outline', size: 'sm' }),
        'bg-background'
      )}
      aria-describedby={sharePathDescriptionId}
    >
      <IconPlayerPlay aria-hidden="true" className="size-4" />
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
      className="text-muted-foreground text-xs leading-5"
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
    ? `assignment-list-share-${getAssignmentShareDomIdPart(
        shareSlug
      )}-disabled-reason`
    : undefined;
}

function getAssignmentListSharePathDescriptionId(
  action: AssignmentListShareAction
) {
  return getAssignmentListSharePathElementId(action, 'description');
}

function getAssignmentListSharePathElementId(
  { shareSlug }: AssignmentListShareAction,
  suffix: string
) {
  return `assignment-list-share-${getAssignmentShareDomIdPart(
    shareSlug
  )}-${suffix}`;
}

function getAssignmentShareDomIdPart(shareSlug: string) {
  const normalizedShareSlug = shareSlug.normalize('NFKC').trim();
  return encodeURIComponent(normalizedShareSlug || 'missing-share-slug');
}

function buildAssignmentListShareDescriptionIds(
  ...ids: Array<string | undefined>
) {
  const descriptionIds = ids.filter(Boolean).join(' ');
  return descriptionIds || undefined;
}

function formatAssignmentListElementId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, '-');
}
