import type {
  AssignmentListCardActionView,
  AssignmentListCardViewModel,
  AssignmentListDistributionStepId,
  AssignmentListDistributionStepView,
  AssignmentListDistributionView,
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
import { cn } from '@/lib/utils';
import {
  IconChartBar,
  IconClipboardText,
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
      <AssignmentListCardHeader assignment={assignment} />
      <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <AssignmentListCardSummary assignment={assignment} />
        <AssignmentListCardActions
          assignmentId={assignment.id}
          label={assignment.actionsLabel}
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
  assignment: AssignmentListCardViewModel;
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
  assignment: AssignmentListCardViewModel;
}) {
  return (
    <section aria-label={assignment.summaryLabel} className="grid gap-4">
      <AssignmentListDistribution view={assignment.distributionView} />
      <AssignmentSettingsSummary view={assignment.settingsSummaryView} />
      <AssignmentListStats
        label={assignment.statsLabel}
        statItems={assignment.statItems}
      />
    </section>
  );
}

function AssignmentListDistribution({
  view,
}: {
  view: AssignmentListDistributionView;
}) {
  return (
    <section aria-label={view.ariaLabel} className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-medium text-sm">{view.title}</h3>
          <p className="mt-1 text-muted-foreground text-xs leading-5">
            {view.description}
          </p>
        </div>
        <Badge
          variant={view.status === 'ready-to-share' ? 'secondary' : 'outline'}
          className={cn(
            'rounded-md',
            view.status === 'blocked' && 'border-amber-300 text-amber-800',
            view.status === 'collecting-results' &&
              'border-blue-200 bg-blue-50 text-blue-700'
          )}
        >
          {view.statusLabel}
        </Badge>
      </div>
      <dl className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {view.stepViews.map((stepView) => (
          <AssignmentListDistributionStep
            key={stepView.id}
            stepView={stepView}
          />
        ))}
      </dl>
    </section>
  );
}

function AssignmentListDistributionStep({
  stepView,
}: {
  stepView: AssignmentListDistributionStepView;
}) {
  const Icon = assignmentListDistributionStepIcons[stepView.id];

  return (
    <div
      className="rounded-lg border bg-muted/20 p-3"
      data-status={stepView.status}
    >
      <div className="flex items-start justify-between gap-2">
        <dt className="flex items-center gap-2 font-medium text-xs leading-5">
          <Icon aria-hidden="true" className="size-4 text-primary" />
          {stepView.label}
        </dt>
        <dd>
          <Badge
            variant={stepView.status === 'ready' ? 'secondary' : 'outline'}
            className="rounded-md"
          >
            {stepView.statusLabel}
          </Badge>
        </dd>
      </div>
      <dd className="mt-2 text-muted-foreground text-xs leading-5">
        <output aria-label={stepView.ariaLabel}>{stepView.description}</output>
      </dd>
    </div>
  );
}

const assignmentListDistributionStepIcons = {
  'copy-link': IconClipboardText,
  'preview-link': IconPlayerPlay,
  'print-worksheet': IconPrinter,
  'review-results': IconChartBar,
} satisfies Record<AssignmentListDistributionStepId, typeof IconChartBar>;

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
    <section
      aria-label={label}
      className="flex flex-col gap-2 sm:flex-row lg:flex-col"
    >
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
      {actionView.shareAction ? (
        <AssignmentListShareActions action={actionView.shareAction} />
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
        buttonVariants({ variant: 'outline' }),
        'w-full bg-background lg:w-auto'
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
        buttonVariants({ variant: 'outline' }),
        'w-full bg-background lg:w-auto'
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
    <div className="grid gap-1">
      <Button
        type="button"
        variant="outline"
        className="w-full bg-background lg:w-auto"
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
    <div className="grid gap-2">
      <AssignmentListSharePath
        action={action}
        descriptionId={sharePathDescriptionId}
      />
      <AssignmentListSharePreviewAction
        action={action}
        disabledReasonId={disabledReasonId}
        sharePathDescriptionId={sharePathDescriptionId}
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
      className="max-w-64 rounded-lg border bg-muted/30 px-3 py-2 text-muted-foreground text-xs leading-5"
    >
      <span id={shareUrlLabelId} className="font-medium">
        {action.shareUrlLabel}
      </span>
      <span id={shareUrlValueId} className="mt-1 block break-all font-mono">
        {action.shareUrl}
      </span>
      <span id={sharePathLabelId} className="mt-1 block font-medium">
        {action.sharePathLabel}
      </span>
      <span id={sharePathValueId} className="mt-1 block truncate font-mono">
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
        className="w-full lg:w-auto"
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
      className={cn(buttonVariants(), 'w-full lg:w-auto')}
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
