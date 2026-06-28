import {
  assignmentListActionCopy,
  assignmentListPublishedPanelCopy,
} from '@/assignments/list-view';
import { buildPublishedAssignmentPanelContext } from '@/assignments/published-assignment';
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
  context: ReturnType<typeof buildPublishedAssignmentPanelContext> | undefined;
  onDismiss: () => void;
  shareSlug: string;
};
type PublishedAssignmentPanelContext = ReturnType<
  typeof buildPublishedAssignmentPanelContext
>;
type PublishedAssignmentPanelAssignment = NonNullable<
  PublishedAssignmentPanelContext['assignment']
>;
type PublishedAssignmentPanelPrintAction = NonNullable<
  PublishedAssignmentPanelContext['printAction']
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
  const { assignment } = panelContext;

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
        assignment={assignment}
        context={panelContext}
        onDismiss={onDismiss}
        shareSlug={shareSlug}
      />
    </section>
  );
}

function PublishedAssignmentPanelActions({
  assignment,
  context,
  onDismiss,
  shareSlug,
}: {
  assignment: PublishedAssignmentPanelContext['assignment'];
  context: PublishedAssignmentPanelContext;
  onDismiss: () => void;
  shareSlug: string;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
      {context.showResultsAction && assignment ? (
        <PublishedAssignmentResultsActionLink assignment={assignment} />
      ) : null}
      {context.printAction ? (
        <PublishedAssignmentPrintActionLink action={context.printAction} />
      ) : null}
      {context.showShareActions ? (
        <PublishedAssignmentShareActions shareSlug={shareSlug} />
      ) : null}
      {context.showDismissAction ? (
        <PublishedAssignmentDismissActionButton onClick={onDismiss} />
      ) : null}
    </div>
  );
}

function PublishedAssignmentResultsActionLink({
  assignment,
}: {
  assignment: PublishedAssignmentPanelAssignment;
}) {
  return (
    <Link
      to="/dashboard/assignments/$assignmentId"
      params={{ assignmentId: assignment.id }}
      className={cn(
        buttonVariants({ variant: 'outline' }),
        'w-full bg-background sm:w-auto'
      )}
    >
      <IconChartBar className="size-4" />
      {assignmentListActionCopy.viewResults}
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
      {assignmentListActionCopy.printWorksheet}
    </Link>
  );
}

function PublishedAssignmentShareActions({ shareSlug }: { shareSlug: string }) {
  return (
    <>
      <Link
        to="/play/$shareId"
        params={{ shareId: shareSlug }}
        className={cn(
          buttonVariants({ variant: 'outline' }),
          'w-full bg-background sm:w-auto'
        )}
      >
        <IconPlayerPlay className="size-4" />
        {assignmentListActionCopy.openPublishedLink}
      </Link>
      <CopyAssignmentShareLinkButton
        shareSlug={shareSlug}
        className="w-full bg-background sm:w-auto"
      />
    </>
  );
}

function PublishedAssignmentDismissActionButton({
  onClick,
}: {
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
      {assignmentListActionCopy.dismiss}
    </Button>
  );
}
