import { assignmentListPublishedPanelCopy } from '@/assignments/list-view';
import {
  type PublishedAssignmentPanelActionView,
  type PublishedAssignmentPanelContext,
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
type PublishedAssignmentPanelResultAction = NonNullable<
  PublishedAssignmentPanelActionView['resultAction']
>;
type PublishedAssignmentPanelPrintAction = NonNullable<
  PublishedAssignmentPanelActionView['printAction']
>;
type PublishedAssignmentPanelShareAction = NonNullable<
  PublishedAssignmentPanelActionView['shareAction']
>;
type PublishedAssignmentPanelDismissAction = NonNullable<
  PublishedAssignmentPanelActionView['dismissAction']
>;

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
        <p className="mt-2 w-fit rounded-md border bg-background px-2 py-1 font-mono text-xs text-muted-foreground">
          {panelContext.sharePath}
        </p>
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
      to="/dashboard/assignments/$assignmentId"
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
      to="/print/assignments/$assignmentId"
      params={{
        assignmentId: action.assignmentId,
      }}
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
  return (
    <>
      <Link
        to="/play/$shareId"
        params={{ shareId: action.shareSlug }}
        className={cn(
          buttonVariants({ variant: 'outline' }),
          'w-full bg-background sm:w-auto'
        )}
      >
        <IconPlayerPlay className="size-4" />
        {action.label}
      </Link>
      <CopyAssignmentShareLinkButton
        shareSlug={action.shareSlug}
        className="w-full bg-background sm:w-auto"
      />
    </>
  );
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
