import { assignmentListPublishedPanelCopy } from '@/assignments/list-view';
import {
  type PublishedAssignmentPanelActionView,
  type PublishedAssignmentPanelContext,
  type PublishedAssignmentPanelDismissAction,
  type PublishedAssignmentPanelPrintAction,
  type PublishedAssignmentPanelResultAction,
  type PublishedAssignmentPanelShareAction,
  type PublishedAssignmentPanelNextStepView,
  buildPublishedAssignmentPanelContext,
} from '@/assignments/published-assignment';
import { buildAssignmentShareLinkHandoffView } from '@/assignments/share-link';
import { AssignmentShareLinkHandoff } from '@/components/assignments/assignment-share-link-handoff';
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
  const shareSummaryDescriptionId =
    getPublishedAssignmentShareSummaryDescriptionId(shareSlug);

  return (
    <section className="grid gap-4 rounded-lg border border-primary/25 bg-primary/5 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <IconCircleCheck aria-hidden="true" className="size-4" />
          {assignmentListPublishedPanelCopy.publishedLabel}
        </div>
        <h2 className="mt-2 text-lg font-semibold">{panelContext.title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {panelContext.body}
        </p>
        <PublishedAssignmentShareSummary
          descriptionId={shareSummaryDescriptionId}
          panelContext={panelContext}
        />
        <PublishedAssignmentNextSteps
          label={panelContext.nextStepsLabel}
          stepViews={panelContext.nextStepViews}
        />
        {panelContext.showMissingHint ? (
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            {assignmentListPublishedPanelCopy.missingHint}
          </p>
        ) : null}
      </div>
      <PublishedAssignmentPanelActions
        actionView={panelContext.actionView}
        onDismiss={onDismiss}
        shareSummaryDescriptionId={shareSummaryDescriptionId}
      />
    </section>
  );
}

function PublishedAssignmentShareSummary({
  descriptionId,
  panelContext,
}: {
  descriptionId: string;
  panelContext: PublishedAssignmentPanelContext;
}) {
  const shareUrlLabelId = getPublishedAssignmentShareSummaryElementId(
    descriptionId,
    'url-label'
  );
  const shareUrlValueId = getPublishedAssignmentShareSummaryElementId(
    descriptionId,
    'url-value'
  );
  const sharePathLabelId = getPublishedAssignmentShareSummaryElementId(
    descriptionId,
    'path-label'
  );
  const sharePathValueId = getPublishedAssignmentShareSummaryElementId(
    descriptionId,
    'path-value'
  );

  return (
    <section
      aria-labelledby={shareUrlLabelId}
      aria-describedby={descriptionId}
      className="mt-2 grid w-fit max-w-full gap-1 rounded-md border bg-background px-2 py-1 text-xs text-muted-foreground"
    >
      <span>
        <span id={shareUrlLabelId} className="font-medium">
          {panelContext.shareUrlLabel}
        </span>
        <span id={shareUrlValueId} className="ml-2 break-all font-mono">
          {panelContext.shareUrl}
        </span>
      </span>
      <span>
        <span id={sharePathLabelId} className="font-medium">
          {panelContext.sharePathLabel}
        </span>
        <span id={sharePathValueId} className="ml-2 font-mono">
          {panelContext.sharePath}
        </span>
      </span>
      <span id={descriptionId} className="sr-only">
        {panelContext.shareUrlLabel} {panelContext.shareUrl}{' '}
        {panelContext.sharePathLabel} {panelContext.sharePath}
      </span>
    </section>
  );
}

function PublishedAssignmentNextSteps({
  label,
  stepViews,
}: {
  label: string;
  stepViews: PublishedAssignmentPanelNextStepView[];
}) {
  if (!stepViews.length) return null;

  return (
    <section aria-label={label} className="mt-3">
      <p className="font-medium text-muted-foreground text-xs">{label}</p>
      <ul className="mt-2 grid gap-2 md:grid-cols-2">
        {stepViews.map((stepView) => (
          <li key={stepView.id}>
            <section
              aria-label={stepView.ariaLabel}
              className="rounded-md border bg-background px-3 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-sm">{stepView.label}</span>
                <span className="rounded-md border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                  {stepView.statusLabel}
                </span>
              </div>
              <p className="mt-1 text-muted-foreground text-xs leading-5">
                {stepView.description}
              </p>
            </section>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PublishedAssignmentPanelActions({
  actionView,
  onDismiss,
  shareSummaryDescriptionId,
}: {
  actionView: PublishedAssignmentPanelActionView;
  onDismiss: () => void;
  shareSummaryDescriptionId: string;
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
        <PublishedAssignmentShareActions
          action={actionView.shareAction}
          shareSummaryDescriptionId={shareSummaryDescriptionId}
        />
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
      <IconChartBar aria-hidden="true" className="size-4" />
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
      <IconPrinter aria-hidden="true" className="size-4" />
      {action.label}
    </Link>
  );
}

function PublishedAssignmentShareActions({
  action,
  shareSummaryDescriptionId,
}: {
  action: PublishedAssignmentPanelShareAction;
  shareSummaryDescriptionId: string;
}) {
  const disabledReasonId = getPublishedAssignmentShareDisabledReasonId(action);
  const handoffView = buildAssignmentShareLinkHandoffView(action, {
    surface: 'publish-success',
  });

  return (
    <>
      <AssignmentShareLinkHandoff handoff={handoffView} />
      <PublishedAssignmentSharePreviewAction
        action={action}
        disabledReasonId={disabledReasonId}
        shareSummaryDescriptionId={shareSummaryDescriptionId}
      />
      <CopyAssignmentShareLinkButton
        disabled={!action.isAvailable}
        disabledReasonCode={action.disabledReasonCode}
        disabledMessage={action.disabledReason}
        disabledReasonId={disabledReasonId}
        descriptionId={shareSummaryDescriptionId}
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
  shareSummaryDescriptionId,
}: {
  action: PublishedAssignmentPanelShareAction;
  disabledReasonId: string | undefined;
  shareSummaryDescriptionId: string;
}) {
  const describedBy = buildPublishedAssignmentShareDescriptionIds(
    shareSummaryDescriptionId,
    disabledReasonId
  );

  if (!action.isAvailable) {
    return (
      <Button
        type="button"
        variant="outline"
        className="w-full bg-background sm:w-auto"
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
        buttonVariants({ variant: 'outline' }),
        'w-full bg-background sm:w-auto'
      )}
      aria-describedby={shareSummaryDescriptionId}
    >
      <IconPlayerPlay aria-hidden="true" className="size-4" />
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
    ? `published-assignment-share-${getPublishedAssignmentShareDomIdPart(
        shareSlug
      )}-disabled-reason`
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
      <IconX aria-hidden="true" className="size-4" />
      {action.label}
    </Button>
  );
}

function getPublishedAssignmentShareSummaryDescriptionId(shareSlug: string) {
  return `published-assignment-share-${getPublishedAssignmentShareDomIdPart(
    shareSlug
  )}-description`;
}

function getPublishedAssignmentShareSummaryElementId(
  descriptionId: string,
  suffix: string
) {
  return `${descriptionId}-${suffix}`;
}

function getPublishedAssignmentShareDomIdPart(shareSlug: string) {
  const normalizedShareSlug = shareSlug.normalize('NFKC').trim();
  return encodeURIComponent(normalizedShareSlug || 'missing-share-slug');
}

function buildPublishedAssignmentShareDescriptionIds(
  ...ids: Array<string | undefined>
) {
  const descriptionIds = ids.filter(Boolean).join(' ');
  return descriptionIds || undefined;
}
