import type {
  AssignmentResultAction,
  AssignmentResultActionButton,
} from '@/assignments/result-actions';
import type {
  AssignmentResultHeaderPrintAction,
  AssignmentResultHeaderShareAction,
} from '@/assignments/result-view';
import { CopyAssignmentShareLinkButton } from '@/components/assignments/copy-assignment-share-link-button';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { m } from '@/locale/paraglide/messages';
import { cn } from '@/lib/utils';
import {
  IconChevronDown,
  IconClipboardText,
  IconCopy,
  IconDownload,
  IconPlayerPlay,
  IconPrinter,
  IconShare3,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';

type AssignmentResultsHeaderActionsProps = {
  onResultAction: (actionButton: AssignmentResultActionButton) => void;
  printAction: AssignmentResultHeaderPrintAction;
  resultActionsLabel: string;
  resultActions: AssignmentResultActionButton[];
  shareAction: AssignmentResultHeaderShareAction;
  /** Copy and export actions only make sense once students have submitted. */
  showResultActions?: boolean;
};

export function AssignmentResultsHeaderActions({
  onResultAction,
  printAction,
  resultActionsLabel,
  resultActions,
  shareAction,
  showResultActions = true,
}: AssignmentResultsHeaderActionsProps) {
  const shareDisabledReasonId =
    getAssignmentResultHeaderShareDisabledReasonId(shareAction);
  const sharePathDescriptionId =
    getAssignmentResultHeaderSharePathDescriptionId(shareAction);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <AssignmentResultsHeaderCopyShareAction
        disabledReasonId={shareDisabledReasonId}
        sharePathDescriptionId={sharePathDescriptionId}
        shareAction={shareAction}
      />
      <AssignmentResultsHeaderSharePreviewLink
        disabledReasonId={shareDisabledReasonId}
        sharePathDescriptionId={sharePathDescriptionId}
        shareAction={shareAction}
      />
      <AssignmentResultsHeaderPrintActionLink printAction={printAction} />
      {showResultActions ? (
        <AssignmentResultsHeaderResultActions
          onResultAction={onResultAction}
          resultActionsLabel={resultActionsLabel}
          resultActions={resultActions}
        />
      ) : null}
      <AssignmentResultsHeaderSharePath
        descriptionId={sharePathDescriptionId}
        shareAction={shareAction}
      />
      <AssignmentResultsHeaderShareDisabledReason
        disabledReasonId={shareDisabledReasonId}
        shareAction={shareAction}
      />
    </div>
  );
}

function AssignmentResultsHeaderSharePreviewLink({
  disabledReasonId,
  sharePathDescriptionId,
  shareAction,
}: {
  disabledReasonId: string | undefined;
  sharePathDescriptionId: string;
  shareAction: AssignmentResultHeaderShareAction;
}) {
  const describedBy = buildAssignmentResultHeaderShareDescriptionIds(
    sharePathDescriptionId,
    disabledReasonId
  );

  if (!shareAction.isAvailable) {
    return (
      <Button
        type="button"
        className="w-full sm:w-auto"
        disabled
        aria-describedby={describedBy}
      >
        <IconPlayerPlay aria-hidden="true" className="size-4" />
        {shareAction.label}
      </Button>
    );
  }

  return (
    <Link
      to={shareAction.to}
      params={{
        shareId: shareAction.shareSlug,
      }}
      className={cn(buttonVariants(), 'w-full sm:w-auto')}
      aria-describedby={sharePathDescriptionId}
    >
      <IconPlayerPlay aria-hidden="true" className="size-4" />
      {shareAction.label}
    </Link>
  );
}

function AssignmentResultsHeaderSharePath({
  descriptionId,
  shareAction,
}: {
  descriptionId: string;
  shareAction: AssignmentResultHeaderShareAction;
}) {
  const shareUrlLabelId = getAssignmentResultHeaderSharePathElementId(
    shareAction,
    'url-label'
  );
  const shareUrlValueId = getAssignmentResultHeaderSharePathElementId(
    shareAction,
    'url-value'
  );
  const sharePathLabelId = getAssignmentResultHeaderSharePathElementId(
    shareAction,
    'path-label'
  );
  const sharePathValueId = getAssignmentResultHeaderSharePathElementId(
    shareAction,
    'path-value'
  );

  return (
    <section
      aria-labelledby={shareUrlLabelId}
      aria-describedby={descriptionId}
      className="sr-only"
    >
      <IconShare3 aria-hidden="true" className="size-4" />
      <span id={shareUrlLabelId} className="font-medium">
        {shareAction.shareUrlLabel}
      </span>
      <span id={shareUrlValueId} className="break-all font-mono text-xs">
        {shareAction.shareUrl}
      </span>
      <span id={sharePathLabelId} className="font-medium">
        {shareAction.sharePathLabel}
      </span>
      <span id={sharePathValueId} className="font-mono text-xs">
        {shareAction.sharePath}
      </span>
      <span id={descriptionId} className="sr-only">
        {shareAction.shareUrlLabel} {shareAction.shareUrl}{' '}
        {shareAction.sharePathLabel} {shareAction.sharePath}
      </span>
    </section>
  );
}

function AssignmentResultsHeaderCopyShareAction({
  disabledReasonId,
  sharePathDescriptionId,
  shareAction,
}: {
  disabledReasonId: string | undefined;
  sharePathDescriptionId: string;
  shareAction: AssignmentResultHeaderShareAction;
}) {
  return (
    <CopyAssignmentShareLinkButton
      disabled={!shareAction.isAvailable}
      disabledReasonCode={shareAction.disabledReasonCode}
      disabledMessage={shareAction.disabledReason}
      disabledReasonId={disabledReasonId}
      descriptionId={sharePathDescriptionId}
      label={shareAction.copyLabel}
      shareSlug={shareAction.shareSlug}
      shareUrl={shareAction.shareUrl}
      className="w-full bg-background sm:w-auto"
    />
  );
}

function AssignmentResultsHeaderPrintActionLink({
  printAction,
}: {
  printAction: AssignmentResultHeaderPrintAction;
}) {
  return (
    <Link
      to={printAction.to}
      params={{ assignmentId: printAction.assignmentId }}
      search={printAction.search}
      className={cn(
        buttonVariants({ variant: 'outline' }),
        'w-full bg-background sm:w-auto'
      )}
    >
      <IconPrinter aria-hidden="true" className="size-4" />
      {printAction.label}
    </Link>
  );
}

function AssignmentResultsHeaderShareDisabledReason({
  disabledReasonId,
  shareAction,
}: {
  disabledReasonId: string | undefined;
  shareAction: AssignmentResultHeaderShareAction;
}) {
  if (!shareAction.disabledReason) return null;

  return (
    <p
      id={disabledReasonId}
      className="basis-full text-sm text-muted-foreground"
    >
      {shareAction.disabledReason}
    </p>
  );
}

function getAssignmentResultHeaderShareDisabledReasonId({
  disabledReason,
  shareSlug,
}: AssignmentResultHeaderShareAction) {
  return disabledReason
    ? `assignment-result-share-${getAssignmentResultHeaderShareDomIdPart(
        shareSlug
      )}-disabled-reason`
    : undefined;
}

function getAssignmentResultHeaderSharePathDescriptionId(
  action: AssignmentResultHeaderShareAction
) {
  return getAssignmentResultHeaderSharePathElementId(action, 'description');
}

function getAssignmentResultHeaderSharePathElementId(
  { shareSlug }: AssignmentResultHeaderShareAction,
  suffix: string
) {
  return `assignment-result-share-${getAssignmentResultHeaderShareDomIdPart(
    shareSlug
  )}-${suffix}`;
}

function getAssignmentResultHeaderShareDomIdPart(shareSlug: string) {
  const normalizedShareSlug = shareSlug.normalize('NFKC').trim();
  return encodeURIComponent(normalizedShareSlug || 'missing-share-slug');
}

function buildAssignmentResultHeaderShareDescriptionIds(
  ...ids: Array<string | undefined>
) {
  const descriptionIds = ids.filter(Boolean).join(' ');
  return descriptionIds || undefined;
}

function AssignmentResultsHeaderResultActions({
  onResultAction,
  resultActionsLabel,
  resultActions,
}: {
  onResultAction: (actionButton: AssignmentResultActionButton) => void;
  resultActionsLabel: string;
  resultActions: AssignmentResultActionButton[];
}) {
  return (
    <section aria-label={resultActionsLabel}>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'bg-background'
          )}
        >
          <IconDownload aria-hidden="true" className="size-4" />
          {m.assignment_results_export_menu()}
          <IconChevronDown aria-hidden="true" className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-1.5">
          {resultActions.map((actionButton) => (
            <AssignmentResultsHeaderResultActionButton
              actionButton={actionButton}
              key={actionButton.id}
              disabledReasonId={getResultActionDisabledReasonId(actionButton)}
              onClick={() => onResultAction(actionButton)}
            />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <AssignmentResultsHeaderResultActionDisabledReasons
        resultActions={resultActions}
      />
    </section>
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
  const actionDescriptionId = getResultActionDescriptionId(actionButton.id);
  const describedBy = [actionDescriptionId, disabledReasonId]
    .filter(Boolean)
    .join(' ');

  return (
    <DropdownMenuItem
      className="items-start gap-3 px-2.5 py-2"
      disabled={actionButton.disabled}
      onClick={onClick}
      aria-label={actionButton.ariaLabel}
      aria-describedby={describedBy}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-4" />
      <span className="grid gap-0.5">
        <span className="font-medium text-sm">{actionButton.label}</span>
        <span
          id={actionDescriptionId}
          className="text-muted-foreground text-xs leading-snug"
        >
          {actionButton.description}
        </span>
      </span>
    </DropdownMenuItem>
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
            id: actionButton.id,
            message: actionButton.disabledReason,
          },
        ]
      : []
  );

  if (disabledReasons.length === 0) return null;

  return (
    <div className="sr-only">
      {disabledReasons.map((disabledReason) => (
        <p
          id={getResultActionDisabledReasonId({
            id: disabledReason.id,
            disabledReason: disabledReason.message,
          })}
          key={disabledReason.id}
        >
          {disabledReason.message}
        </p>
      ))}
    </div>
  );
}

function getResultActionDisabledReasonId({
  id,
  disabledReason,
}: Pick<AssignmentResultActionButton, 'disabledReason' | 'id'>) {
  return disabledReason
    ? `assignment-result-action-${id}-disabled-reason`
    : undefined;
}

function getResultActionDescriptionId(id: AssignmentResultActionButton['id']) {
  return `assignment-result-action-${id}-description`;
}

const resultActionIconByAction: Record<
  AssignmentResultAction,
  typeof IconCopy
> = {
  'copy-brief': IconClipboardText,
  'copy-follow-up': IconCopy,
  'copy-item-review': IconCopy,
  'copy-reteach-plan': IconCopy,
  'export-csv': IconDownload,
};
