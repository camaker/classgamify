import { assignmentListPublishedPanelCopy } from '@/assignments/list-view';
import {
  type PublishedAssignmentPanelActionView,
  type PublishedAssignmentPanelContext,
  type PublishedAssignmentPanelDismissAction,
  type PublishedAssignmentPanelPrintAction,
  type PublishedAssignmentPanelResultAction,
  type PublishedAssignmentPanelShareAction,
  buildPublishedAssignmentPanelContext,
} from '@/assignments/published-assignment';
import { CopyAssignmentShareLinkButton } from '@/components/assignments/copy-assignment-share-link-button';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  IconChartBar,
  IconCircleCheck,
  IconPlayerPlay,
  IconPrinter,
  IconX,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';

type PublishedAssignmentPanelProps = {
  context: PublishedAssignmentPanelContext | undefined;
  onDismiss: () => void;
  shareSlug: string;
};

export function PublishedAssignmentPanel({
  context,
  onDismiss,
  shareSlug,
}: PublishedAssignmentPanelProps) {
  const panelContext =
    context ??
    buildPublishedAssignmentPanelContext({
      assignment: undefined,
      isLoading: true,
      shareSlug,
    });

  return (
    <section className="grid gap-4 rounded-lg border border-primary/25 bg-primary/5 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <IconCircleCheck className="size-4" />
          {assignmentListPublishedPanelCopy.publishedLabel}
        </div>
        <h2 className="mt-2 text-lg font-semibold">{panelContext.title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {panelContext.body}
        </p>
        <div className="mt-2 grid w-fit max-w-full gap-1 rounded-md border bg-background px-2 py-1 text-xs text-muted-foreground">
          <span>
            <span className="font-medium">{panelContext.shareUrlLabel}</span>
            <span className="ml-2 break-all font-mono">
              {panelContext.shareUrl}
            </span>
          </span>
          <span>
            <span className="font-medium">{panelContext.sharePathLabel}</span>
            <span className="ml-2 font-mono">{panelContext.sharePath}</span>
          </span>
        </div>
        {panelContext.nextStepViews.length ? (
          <ul className="mt-3 grid gap-1 text-muted-foreground text-xs leading-5">
            {panelContext.nextStepViews.map((step) => (
              <li className="flex gap-2" key={step.id}>
                <span aria-hidden="true">-</span>
                <span>{step.label}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {panelContext.showMissingHint ? (
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            {assignmentListPublishedPanelCopy.missingHint}
          </p>
        ) : null}
      </div>
      <PublishedAssignmentPanelActions
        actionView={panelContext.actionView}
        onDismiss={onDismiss}
      />
    </section>
  );
}

function PublishedAssignmentPanelActions({
  actionView,
  onDismiss,
}: {
  actionView: PublishedAssignmentPanelActionView;
  onDismiss: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
      {actionView.resultAction ? (
        <PublishedAssignmentResultsActionLink
          action={actionView.resultAction}
        />
      ) : null}
      {actionView.printAction ? (
        <PublishedAssignmentPrintActionLink action={actionView.printAction} />
      ) : null}
      {actionView.shareAction ? (
        <PublishedAssignmentShareActions action={actionView.shareAction} />
      ) : null}
      {actionView.dismissAction ? (
        <PublishedAssignmentDismissActionButton
          action={actionView.dismissAction}
          onClick={onDismiss}
        />
      ) : null}
    </div>
  );
}

function PublishedAssignmentResultsActionLink({
  action,
}: {
  action: PublishedAssignmentPanelResultAction;
}) {
  return (
    <Link
      to={action.to}
      params={{ assignmentId: action.assignmentId }}
      className={cn(
        buttonVariants({ variant: 'outline' }),
        'w-full bg-background sm:w-auto'
      )}
    >
      <IconChartBar className="size-4" />
      {action.label}
    </Link>
  );
}

function PublishedAssignmentPrintActionLink({
  action,
}: {
  action: PublishedAssignmentPanelPrintAction;
}) {
  return (
    <Link
      to={action.to}
      params={{
        assignmentId: action.assignmentId,
      }}
      search={action.search}
      className={cn(
        buttonVariants({ variant: 'outline' }),
        'w-full bg-background sm:w-auto'
      )}
    >
      <IconPrinter className="size-4" />
      {action.label}
    </Link>
  );
}

function PublishedAssignmentShareActions({
  action,
}: {
  action: PublishedAssignmentPanelShareAction;
}) {
  const disabledReasonId = getPublishedAssignmentShareDisabledReasonId(action);

  return (
    <>
      <PublishedAssignmentSharePreviewAction
        action={action}
        disabledReasonId={disabledReasonId}
      />
      <CopyAssignmentShareLinkButton
        disabled={!action.isAvailable}
        disabledReasonCode={action.disabledReasonCode}
        disabledMessage={action.disabledReason}
        disabledReasonId={disabledReasonId}
        label={action.copyLabel}
        shareSlug={action.shareSlug}
        shareUrl={action.shareUrl}
        className="w-full bg-background sm:w-auto"
      />
      <PublishedAssignmentShareDisabledReason
        action={action}
        disabledReasonId={disabledReasonId}
      />
    </>
  );
}

function PublishedAssignmentSharePreviewAction({
  action,
  disabledReasonId,
}: {
  action: PublishedAssignmentPanelShareAction;
  disabledReasonId: string | undefined;
}) {
  if (!action.isAvailable) {
    return (
      <Button
        type="button"
        variant="outline"
        className="w-full bg-background sm:w-auto"
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
      className={cn(
        buttonVariants({ variant: 'outline' }),
        'w-full bg-background sm:w-auto'
      )}
    >
      <IconPlayerPlay className="size-4" />
      {action.label}
    </Link>
  );
}

function PublishedAssignmentShareDisabledReason({
  action,
  disabledReasonId,
}: {
  action: PublishedAssignmentPanelShareAction;
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

function getPublishedAssignmentShareDisabledReasonId({
  disabledReason,
  shareSlug,
}: PublishedAssignmentPanelShareAction) {
  return disabledReason
    ? `published-assignment-share-${shareSlug}-disabled-reason`
    : undefined;
}

function PublishedAssignmentDismissActionButton({
  action,
  onClick,
}: {
  action: PublishedAssignmentPanelDismissAction;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      className="w-full sm:w-auto"
      onClick={onClick}
    >
      <IconX className="size-4" />
      {action.label}
    </Button>
  );
}
