import type {
  AssignmentResultAction,
  AssignmentResultActionButton,
} from '@/assignments/result-actions';
import type { AssignmentResultsExportPreparationView } from '@/assignments/results-export';
import type {
  AssignmentResultHeaderPrintAction,
  AssignmentResultHeaderShareAction,
} from '@/assignments/result-view';
import { Badge } from '@/components/ui/badge';
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

type AssignmentResultsHeaderActionsProps = {
  exportPreparationView: AssignmentResultsExportPreparationView;
  onResultAction: (actionButton: AssignmentResultActionButton) => void;
  printAction: AssignmentResultHeaderPrintAction;
  resultActionsLabel: string;
  resultActions: AssignmentResultActionButton[];
  shareAction: AssignmentResultHeaderShareAction;
};

export function AssignmentResultsHeaderActions({
  exportPreparationView,
  onResultAction,
  printAction,
  resultActionsLabel,
  resultActions,
  shareAction,
}: AssignmentResultsHeaderActionsProps) {
  const shareDisabledReasonId =
    getAssignmentResultHeaderShareDisabledReasonId(shareAction);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <AssignmentResultsHeaderSharePreviewLink
        disabledReasonId={shareDisabledReasonId}
        shareAction={shareAction}
      />
      <AssignmentResultsHeaderSharePath shareAction={shareAction} />
      <AssignmentResultsHeaderCopyShareAction
        disabledReasonId={shareDisabledReasonId}
        shareAction={shareAction}
      />
      <AssignmentResultsHeaderPrintActionLink printAction={printAction} />
      <AssignmentResultsHeaderShareDisabledReason
        disabledReasonId={shareDisabledReasonId}
        shareAction={shareAction}
      />
      <AssignmentResultsHeaderResultActions
        onResultAction={onResultAction}
        resultActionsLabel={resultActionsLabel}
        resultActions={resultActions}
      />
      <AssignmentResultsExportPreparation
        exportPreparationView={exportPreparationView}
      />
    </div>
  );
}

function AssignmentResultsHeaderSharePreviewLink({
  disabledReasonId,
  shareAction,
}: {
  disabledReasonId: string | undefined;
  shareAction: AssignmentResultHeaderShareAction;
}) {
  if (!shareAction.isAvailable) {
    return (
      <Button
        type="button"
        className="w-full sm:w-auto"
        disabled
        aria-describedby={disabledReasonId}
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
    >
      <IconPlayerPlay aria-hidden="true" className="size-4" />
      {shareAction.label}
    </Link>
  );
}

function AssignmentResultsHeaderSharePath({
  shareAction,
}: {
  shareAction: AssignmentResultHeaderShareAction;
}) {
  return (
    <div className="flex min-h-8 max-w-full flex-wrap items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
      <IconShare3 aria-hidden="true" className="size-4" />
      <span className="font-medium">{shareAction.shareUrlLabel}</span>
      <span className="break-all font-mono text-xs">
        {shareAction.shareUrl}
      </span>
      <span className="font-medium">{shareAction.sharePathLabel}</span>
      <span className="font-mono text-xs">{shareAction.sharePath}</span>
    </div>
  );
}

function AssignmentResultsHeaderCopyShareAction({
  disabledReasonId,
  shareAction,
}: {
  disabledReasonId: string | undefined;
  shareAction: AssignmentResultHeaderShareAction;
}) {
  return (
    <CopyAssignmentShareLinkButton
      disabled={!shareAction.isAvailable}
      disabledReasonCode={shareAction.disabledReasonCode}
      disabledMessage={shareAction.disabledReason}
      disabledReasonId={disabledReasonId}
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
    ? `assignment-result-share-${shareSlug}-disabled-reason`
    : undefined;
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
    <section
      aria-label={resultActionsLabel}
      className="grid basis-full gap-2 md:grid-cols-2 xl:grid-cols-5"
    >
      {resultActions.map((actionButton) => (
        <AssignmentResultsHeaderResultActionButton
          actionButton={actionButton}
          key={actionButton.id}
          disabledReasonId={getResultActionDisabledReasonId(actionButton)}
          onClick={() => onResultAction(actionButton)}
        />
      ))}
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

  return (
    <div className="grid min-w-0 gap-1">
      <Button
        type="button"
        variant="outline"
        className="w-full justify-start bg-background"
        disabled={actionButton.disabled}
        onClick={onClick}
        aria-label={actionButton.ariaLabel}
        aria-describedby={disabledReasonId}
      >
        <Icon aria-hidden="true" className="size-4" />
        {actionButton.label}
      </Button>
      <p className="text-muted-foreground text-xs leading-snug">
        {actionButton.description}
      </p>
      <dl className="grid gap-1 text-xs">
        <AssignmentResultActionSummaryItem
          ariaLabel={actionButton.scopeView.ariaLabel}
          description={actionButton.scopeView.description}
          id={`${actionButton.id}-scope`}
          label={actionButton.scopeView.label}
          value={actionButton.scopeView.value}
        />
        <AssignmentResultActionSummaryItem
          ariaLabel={actionButton.statusView.ariaLabel}
          description={actionButton.statusView.description}
          id={`${actionButton.id}-status`}
          label={actionButton.statusView.label}
          tone={actionButton.statusView.tone}
          value={actionButton.statusView.value}
        />
      </dl>
    </div>
  );
}

function AssignmentResultActionSummaryItem({
  ariaLabel,
  description,
  id,
  label,
  tone,
  value,
}: {
  ariaLabel: string;
  description: string;
  id: string;
  label: string;
  tone?: AssignmentResultActionButton['statusView']['tone'];
  value: string;
}) {
  const descriptionId = `assignment-result-action-summary-${id}-description`;

  return (
    <div className="grid gap-1">
      <dt className="sr-only">{label}</dt>
      <dd aria-describedby={descriptionId} className="min-w-0">
        <Badge
          data-tone={tone}
          variant={tone === 'blocked' ? 'destructive' : 'secondary'}
          className="max-w-full rounded-md"
        >
          <output aria-label={ariaLabel} className="truncate">
            {value}
          </output>
        </Badge>
      </dd>
      <dd id={descriptionId} className="sr-only">
        {description}
      </dd>
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
            id: actionButton.id,
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

function AssignmentResultsExportPreparation({
  exportPreparationView,
}: {
  exportPreparationView: AssignmentResultsExportPreparationView;
}) {
  const titleId = 'assignment-results-export-preparation-title';
  const descriptionId = 'assignment-results-export-preparation-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="grid basis-full gap-3 rounded-lg border bg-muted/20 p-3"
    >
      <div className="grid gap-1">
        <h3 id={titleId} className="font-medium text-sm">
          {exportPreparationView.title}
        </h3>
        <p id={descriptionId} className="text-muted-foreground text-xs">
          {exportPreparationView.description}
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        {exportPreparationView.itemViews.map((itemView) => (
          <article
            aria-label={itemView.ariaLabel}
            className="grid gap-1 rounded-md border bg-background p-3"
            key={itemView.id}
          >
            <p className="text-muted-foreground text-xs">{itemView.label}</p>
            <output aria-label={itemView.ariaLabel}>
              <span className="font-semibold text-lg">{itemView.value}</span>
            </output>
            <p className="text-muted-foreground text-xs">
              {itemView.description}
            </p>
          </article>
        ))}
      </div>
    </section>
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
