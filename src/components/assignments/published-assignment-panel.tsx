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
  IconX,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';

type PublishedAssignmentPanelProps = {
  context: ReturnType<typeof buildPublishedAssignmentPanelContext> | undefined;
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
      <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
        {panelContext.showResultsAction && assignment ? (
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
        ) : null}
        {panelContext.showShareActions ? (
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
        ) : null}
        {panelContext.showDismissAction ? (
          <Button
            type="button"
            variant="ghost"
            className="w-full sm:w-auto"
            onClick={onDismiss}
          >
            <IconX className="size-4" />
            {assignmentListActionCopy.dismiss}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
