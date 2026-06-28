import type {
  AssignmentResultActionButton,
  buildAssignmentResultsPageViewModel,
} from '@/assignments/result-view';
import { CopyAssignmentShareLinkButton } from '@/components/assignments/copy-assignment-share-link-button';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  IconClipboardText,
  IconCopy,
  IconDownload,
  IconPlayerPlay,
  IconPrinter,
  IconShare3,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';

type AssignmentResultsHeaderView = NonNullable<
  ReturnType<typeof buildAssignmentResultsPageViewModel>['headerView']
>;

type AssignmentResultsHeaderActionsProps = {
  assignmentId: string;
  onResultAction: (actionButton: AssignmentResultActionButton) => void;
  printAction: AssignmentResultsHeaderView['printAction'];
  resultActions: AssignmentResultActionButton[];
  shareAction: AssignmentResultsHeaderView['shareAction'];
};
type AssignmentResultsHeaderPrintAction =
  AssignmentResultsHeaderView['printAction'];
type AssignmentResultsHeaderShareAction =
  AssignmentResultsHeaderView['shareAction'];

export function AssignmentResultsHeaderActions({
  assignmentId,
  onResultAction,
  printAction,
  resultActions,
  shareAction,
}: AssignmentResultsHeaderActionsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <AssignmentResultsHeaderSharePreviewLink shareAction={shareAction} />
      <AssignmentResultsHeaderSharePath shareAction={shareAction} />
      <AssignmentResultsHeaderCopyShareAction shareAction={shareAction} />
      <AssignmentResultsHeaderPrintActionLink
        assignmentId={assignmentId}
        printAction={printAction}
      />
      <AssignmentResultsHeaderShareDisabledReason shareAction={shareAction} />
      <AssignmentResultsHeaderResultActions
        onResultAction={onResultAction}
        resultActions={resultActions}
      />
    </div>
  );
}

function AssignmentResultsHeaderSharePreviewLink({
  shareAction,
}: {
  shareAction: AssignmentResultsHeaderShareAction;
}) {
  if (!shareAction.isAvailable) {
    return (
      <Button type="button" className="w-full sm:w-auto" disabled>
        <IconPlayerPlay className="size-4" />
        {shareAction.label}
      </Button>
    );
  }

  return (
    <Link
      to="/play/$shareId"
      params={{
        shareId: shareAction.shareSlug,
      }}
      className={cn(buttonVariants(), 'w-full sm:w-auto')}
    >
      <IconPlayerPlay className="size-4" />
      {shareAction.label}
    </Link>
  );
}

function AssignmentResultsHeaderSharePath({
  shareAction,
}: {
  shareAction: AssignmentResultsHeaderShareAction;
}) {
  return (
    <div className="flex min-h-8 items-center gap-2 rounded-lg border bg-muted/30 px-3 text-sm text-muted-foreground">
      <IconShare3 className="size-4" />
      {shareAction.sharePath}
    </div>
  );
}

function AssignmentResultsHeaderCopyShareAction({
  shareAction,
}: {
  shareAction: AssignmentResultsHeaderShareAction;
}) {
  return (
    <CopyAssignmentShareLinkButton
      disabled={!shareAction.isAvailable}
      disabledMessage={shareAction.disabledReason}
      shareSlug={shareAction.shareSlug}
      className="w-full bg-background sm:w-auto"
    />
  );
}

function AssignmentResultsHeaderPrintActionLink({
  assignmentId,
  printAction,
}: {
  assignmentId: string;
  printAction: AssignmentResultsHeaderPrintAction;
}) {
  return (
    <Link
      to="/print/assignments/$assignmentId"
      params={{ assignmentId }}
      className={cn(
        buttonVariants({ variant: 'outline' }),
        'w-full bg-background sm:w-auto'
      )}
    >
      <IconPrinter className="size-4" />
      {printAction.label}
    </Link>
  );
}

function AssignmentResultsHeaderShareDisabledReason({
  shareAction,
}: {
  shareAction: AssignmentResultsHeaderShareAction;
}) {
  if (!shareAction.disabledReason) return null;

  return (
    <p className="basis-full text-sm text-muted-foreground">
      {shareAction.disabledReason}
    </p>
  );
}

function AssignmentResultsHeaderResultActions({
  onResultAction,
  resultActions,
}: {
  onResultAction: (actionButton: AssignmentResultActionButton) => void;
  resultActions: AssignmentResultActionButton[];
}) {
  return (
    <div className="grid basis-full gap-2 md:grid-cols-2 xl:grid-cols-5">
      {resultActions.map((actionButton) => (
        <AssignmentResultsHeaderResultActionButton
          actionButton={actionButton}
          key={actionButton.action}
          disabledReasonId={getResultActionDisabledReasonId(actionButton)}
          onClick={() => onResultAction(actionButton)}
        />
      ))}
      <AssignmentResultsHeaderResultActionDisabledReasons
        resultActions={resultActions}
      />
    </div>
  );
}

function AssignmentResultsHeaderResultActionButton({
  actionButton,
  disabledReasonId,
  onClick,
}: {
  actionButton: AssignmentResultActionButton;
  disabledReasonId: string | undefined;
  onClick: () => void;
}) {
  const Icon = resultActionIconByAction[actionButton.action];

  return (
    <div className="grid min-w-0 gap-1">
      <Button
        type="button"
        variant="outline"
        className="w-full justify-start bg-background"
        disabled={actionButton.disabled}
        onClick={onClick}
        aria-describedby={disabledReasonId}
      >
        <Icon className="size-4" />
        {actionButton.label}
      </Button>
      <p className="text-muted-foreground text-xs leading-snug">
        {actionButton.description}
      </p>
    </div>
  );
}

function AssignmentResultsHeaderResultActionDisabledReasons({
  resultActions,
}: {
  resultActions: AssignmentResultActionButton[];
}) {
  const disabledReasons = resultActions.flatMap((actionButton) =>
    actionButton.disabledReason
      ? [
          {
            action: actionButton.action,
            message: actionButton.disabledReason,
          },
        ]
      : []
  );

  if (disabledReasons.length === 0) return null;

  return (
    <div className="grid gap-1 text-sm text-muted-foreground md:col-span-2 xl:col-span-5">
      {disabledReasons.map((disabledReason) => (
        <p
          id={getResultActionDisabledReasonId({
            action: disabledReason.action,
            disabledReason: disabledReason.message,
          })}
          key={disabledReason.action}
        >
          {disabledReason.message}
        </p>
      ))}
    </div>
  );
}

function getResultActionDisabledReasonId({
  action,
  disabledReason,
}: Pick<AssignmentResultActionButton, 'action' | 'disabledReason'>) {
  return disabledReason
    ? `assignment-result-action-${action}-disabled-reason`
    : undefined;
}

const resultActionIconByAction: Record<
  AssignmentResultActionButton['action'],
  typeof IconCopy
> = {
  'copy-brief': IconClipboardText,
  'copy-follow-up': IconCopy,
  'copy-item-review': IconCopy,
  'copy-reteach-plan': IconCopy,
  'export-csv': IconDownload,
};
