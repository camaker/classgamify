import type { ActivityLibraryStatus } from '@/activities/library-filters';
import { buildAssignmentPublishDialogAccessView } from '@/assignments/publish-input';
import { buildAssignmentListRouteSearch } from '@/assignments/list-filters';
import { buildActivityLibraryRouteSearch } from '@/activities/library-filters';
import type {
  ActivityDuplicateHandoffItemView,
  ActivityDuplicateHandoffView,
} from '@/activities/duplicate';
import {
  buildActivityLibraryCardDisplayView,
  type ActivityLibraryCardActionButtonView,
  type ActivityLibraryCardActionView,
  type ActivityLibraryCardDerivativeActionView,
  type ActivityLibraryCardActionState,
  type ActivityLibraryCardStatusSummaryItem as ActivityLibraryCardStatusSummaryItemView,
  type ActivityLibraryCardStatusSummaryView,
  type ActivityLibraryCardRestoreActionView,
  type ActivityLibraryCardTemplateType,
  type ActivityLibraryCardViewModel,
  type ActivityLibraryEditorActionView,
} from '@/activities/library-view';
import {
  buildActivityDerivativeActionExecutionPlan,
  buildActivityVisibilityActionExecutionPlan,
} from '@/activities/lifecycle';
import { ActivityLibraryActionStatusBadge } from '@/components/activities/activity-library-action-status-badge';
import { ActivityLibraryCompatibilityPanel } from '@/components/activities/activity-library-compatibility-panel';
import { ActivityLibraryStats } from '@/components/activities/activity-library-stats';
import { ActivityPublishDialog } from '@/components/activities/activity-publish-dialog';
import { ActivitySourceMaterialsSummary } from '@/components/activities/activity-source-materials-summary';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  useArchiveActivity,
  useDuplicateActivity,
  useRemixActivityTemplate,
  useRestoreActivity,
} from '@/hooks/use-activities';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import {
  IconAlertCircle,
  IconCircleCheck,
  IconCopy,
  IconDeviceGamepad2,
  IconEdit,
  IconFolderOff,
  IconInfoCircle,
  IconPlus,
  IconRotateClockwise,
} from '@tabler/icons-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useId, useState } from 'react';
import { toast } from 'sonner';

type ActivityLibraryCardProps = {
  activity: ActivityLibraryCardViewModel;
  libraryStatus: ActivityLibraryStatus;
};

export function ActivityLibraryCard({
  activity,
  libraryStatus,
}: ActivityLibraryCardProps) {
  const navigate = useNavigate();
  const archiveMutation = useArchiveActivity();
  const duplicateMutation = useDuplicateActivity();
  const remixMutation = useRemixActivityTemplate();
  const restoreMutation = useRestoreActivity();
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const cardDisplayView = buildActivityLibraryCardDisplayView({
    activity,
    libraryStatus,
  });
  const cardElementId = formatActivityLibraryElementId(
    `activity-library-card-${activity.id}`
  );

  async function remixActivity(
    targetTemplateType: ActivityLibraryCardTemplateType
  ) {
    const executionPlan = buildActivityDerivativeActionExecutionPlan({
      action: 'remix',
      activityId: activity.id,
      currentTemplateType: activity.templateType,
      targetTemplateType,
      visibility: activity.status,
    });
    if (executionPlan.type === 'blocked') {
      toast.error(executionPlan.message);
      return;
    }
    try {
      const result = await remixMutation.mutateAsync(executionPlan.input);
      toast.success(executionPlan.successMessage);
      navigate({
        to: Routes.DashboardActivities,
        search: buildActivityLibraryRouteSearch({
          created: result.id,
          createdFrom: 'remix',
        }),
      });
    } catch {
      toast.error(executionPlan.failureMessage);
    }
  }

  async function duplicateActivity() {
    const executionPlan = buildActivityDerivativeActionExecutionPlan({
      action: 'duplicate',
      activityId: activity.id,
      visibility: activity.status,
    });
    if (executionPlan.type === 'blocked') {
      toast.error(executionPlan.message);
      return;
    }
    try {
      const result = await duplicateMutation.mutateAsync(executionPlan.input);
      toast.success(executionPlan.successMessage);
      navigate({
        to: Routes.DashboardActivities,
        search: buildActivityLibraryRouteSearch({
          created: result.id,
          createdFrom: 'duplicate',
        }),
      });
    } catch {
      toast.error(executionPlan.failureMessage);
    }
  }

  async function archiveActivity() {
    const executionPlan = buildActivityVisibilityActionExecutionPlan({
      action: 'archive',
      activityId: activity.id,
      visibility: activity.status,
    });
    if (executionPlan.type === 'blocked') {
      toast.error(executionPlan.message);
      return;
    }
    try {
      await archiveMutation.mutateAsync(executionPlan.input);
      toast.success(executionPlan.successMessage);
    } catch {
      toast.error(executionPlan.failureMessage);
    }
  }

  async function restoreActivity() {
    const executionPlan = buildActivityVisibilityActionExecutionPlan({
      action: 'restore',
      activityId: activity.id,
      visibility: activity.status,
    });
    if (executionPlan.type === 'blocked') {
      toast.error(executionPlan.message);
      return;
    }
    try {
      await restoreMutation.mutateAsync(executionPlan.input);
      toast.success(executionPlan.successMessage);
    } catch {
      toast.error(executionPlan.failureMessage);
    }
  }

  function openPublishDialog() {
    const accessView = buildAssignmentPublishDialogAccessView(activity.status);
    if (!accessView.canOpen) {
      toast.error(accessView.message ?? accessView.description);
      return;
    }

    setPublishDialogOpen(true);
  }

  return (
    <Card
      role="article"
      aria-label={cardDisplayView.ariaLabel}
      className="rounded-lg"
    >
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-md">
            {cardDisplayView.statusLabel}
          </Badge>
          <Badge variant="outline" className="rounded-md">
            <IconDeviceGamepad2 aria-hidden="true" className="size-3.5" />
            {cardDisplayView.templateName}
          </Badge>
        </div>
        <CardTitle>
          <h2 className="text-lg font-semibold">
            {cardDisplayView.displayTitle}
          </h2>
        </CardTitle>
        <CardDescription>
          <p>{cardDisplayView.displayDescription}</p>
        </CardDescription>
        <ActivityLibraryCardStatusSummary
          idPrefix={cardElementId}
          summary={cardDisplayView.statusSummary}
        />
      </CardHeader>
      <CardContent className="space-y-4">
        <section
          aria-label={cardDisplayView.detailsLabel}
          className="space-y-4"
        >
          <ActivityLibraryStats
            idPrefix={cardElementId}
            label={cardDisplayView.contentLabel}
            stats={cardDisplayView.stats}
          />
          <ActivitySourceMaterialsSummary
            actionSlot={
              cardDisplayView.actionState.showEditAction &&
              cardDisplayView.sourceMaterials.hasMaterials ? (
                <ActivityLibrarySourceMaterialEditAction
                  action={cardDisplayView.sourceMaterialEditAction}
                />
              ) : undefined
            }
            className="bg-muted/30"
            label={cardDisplayView.sourceMaterialsLabel}
            summary={cardDisplayView.sourceMaterials}
          />
        </section>
        <ActivityLibraryCompatibilityPanel
          actionState={cardDisplayView.actionState}
          compatibility={cardDisplayView.compatibility}
          isRemixing={remixMutation.isPending}
          label={cardDisplayView.compatibilityLabel}
          onRemix={remixActivity}
        />
        <ActivityLibraryCardActions
          actionState={cardDisplayView.actionState}
          actionView={cardDisplayView.actionView}
          label={cardDisplayView.actionsLabel}
          restoreRequiredLabel={cardDisplayView.restoreRequiredLabel}
          editAction={cardDisplayView.editAction}
          isArchiving={archiveMutation.isPending}
          isDuplicating={duplicateMutation.isPending}
          isRestoring={restoreMutation.isPending}
          onArchive={archiveActivity}
          onDuplicate={duplicateActivity}
          onPublish={openPublishDialog}
          onRestore={restoreActivity}
        />
      </CardContent>
      <ActivityPublishDialog
        activity={{
          id: activity.id,
          title: cardDisplayView.displayTitle,
          visibility: activity.status,
        }}
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        onPublished={(result) =>
          navigate({
            to: Routes.DashboardAssignments,
            search: buildAssignmentListRouteSearch({
              published: result.assignment.shareSlug,
            }),
          })
        }
      />
    </Card>
  );
}

function ActivityLibraryCardStatusSummary({
  idPrefix,
  summary,
}: {
  idPrefix: string;
  summary: ActivityLibraryCardStatusSummaryView;
}) {
  const labelId = `${idPrefix}-status-summary-label`;

  return (
    <section
      aria-label={summary.ariaLabel}
      aria-labelledby={labelId}
      className="mt-3 grid gap-2 sm:grid-cols-2"
    >
      <h3 id={labelId} className="sr-only">
        {summary.label}
      </h3>
      {summary.items.map((item) => (
        <ActivityLibraryCardStatusSummaryEntry
          idPrefix={idPrefix}
          item={item}
          key={item.id}
        />
      ))}
    </section>
  );
}

function ActivityLibraryCardStatusSummaryEntry({
  idPrefix,
  item,
}: {
  idPrefix: string;
  item: ActivityLibraryCardStatusSummaryItemView;
}) {
  const Icon =
    item.tone === 'blocked'
      ? IconAlertCircle
      : item.tone === 'ready'
        ? IconCircleCheck
        : IconInfoCircle;
  const itemId = `${idPrefix}-status-${item.id}`;
  const labelId = `${itemId}-label`;
  const valueId = `${itemId}-value`;
  const descriptionId = `${itemId}-description`;

  return (
    <section
      aria-label={item.ariaLabel}
      aria-describedby={descriptionId}
      className="rounded-md border bg-muted/30 p-2.5"
      data-tone={item.tone}
    >
      <div className="flex min-w-0 items-center justify-between gap-2">
        <p
          id={labelId}
          className="flex min-w-0 items-center gap-1.5 font-medium text-xs"
        >
          <Icon aria-hidden="true" className="size-3.5 shrink-0" />
          <span className="truncate">{item.label}</span>
        </p>
        <Badge
          id={valueId}
          aria-labelledby={`${labelId} ${valueId}`}
          aria-describedby={descriptionId}
          variant={
            item.tone === 'blocked'
              ? 'destructive'
              : item.tone === 'ready'
                ? 'secondary'
                : 'outline'
          }
          className="rounded-md"
        >
          {item.value}
        </Badge>
      </div>
      <p
        id={descriptionId}
        className="mt-1 line-clamp-2 text-muted-foreground text-xs leading-5"
      >
        {item.description}
      </p>
    </section>
  );
}

function ActivityLibrarySourceMaterialEditAction({
  action,
}: {
  action: ActivityLibraryEditorActionView;
}) {
  return (
    <Link
      to={action.to}
      params={{ activityId: action.activityId }}
      className={cn(
        buttonVariants({ size: 'sm', variant: 'outline' }),
        'h-7 rounded-md bg-background px-2 text-xs'
      )}
    >
      {action.label}
    </Link>
  );
}

function ActivityLibraryCardActions({
  actionState,
  actionView,
  editAction,
  isArchiving,
  isDuplicating,
  isRestoring,
  label,
  onArchive,
  onDuplicate,
  onPublish,
  onRestore,
  restoreRequiredLabel,
}: {
  actionState: ActivityLibraryCardActionState;
  actionView: ActivityLibraryCardActionView;
  editAction: ActivityLibraryEditorActionView;
  isArchiving: boolean;
  isDuplicating: boolean;
  isRestoring: boolean;
  label: string;
  onArchive: () => void;
  onDuplicate: () => void;
  onPublish: () => void;
  onRestore: () => void;
  restoreRequiredLabel: string;
}) {
  if (!actionState.showPersistedActions) return null;

  return (
    <section aria-label={label} className="flex flex-col gap-2 sm:flex-row">
      {actionView.duplicate.duplicateHandoffView ? (
        <ActivityLibraryDuplicateHandoff
          handoff={actionView.duplicate.duplicateHandoffView}
        />
      ) : null}
      {actionState.showEditAction ? (
        <ActivityLibraryEditActionLink action={editAction} />
      ) : null}
      {actionState.showDerivativeActions ? (
        <ActivityLibraryDuplicateActionButton
          action={actionView.duplicate}
          disabled={isDuplicating}
          onClick={onDuplicate}
        />
      ) : null}
      {actionState.showArchiveAction ? (
        <ActivityLibraryArchiveActionButton
          action={actionView.archive}
          disabled={isArchiving}
          onClick={onArchive}
        />
      ) : null}
      {actionState.showPublishAction ? (
        <ActivityLibraryPublishActionButton
          action={actionView.publish}
          onClick={onPublish}
        />
      ) : null}
      {actionState.showRestoreAction ||
      actionState.showRestoreRequiredMessage ? (
        <ActivityLibraryRestoreAction
          action={actionView.restore}
          actionState={actionState}
          disabled={isRestoring}
          onRestore={onRestore}
          requiredLabel={restoreRequiredLabel}
        />
      ) : null}
    </section>
  );
}

function ActivityLibraryDuplicateHandoff({
  handoff,
}: {
  handoff: ActivityDuplicateHandoffView;
}) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="activity-duplicate"
    >
      <h3 id={titleId}>{handoff.title}</h3>
      <p id={descriptionId}>{handoff.description}</p>
      <dl>
        {handoff.itemViews.map((item) => (
          <ActivityLibraryDuplicateHandoffItem item={item} key={item.id} />
        ))}
      </dl>
    </section>
  );
}

function ActivityLibraryDuplicateHandoffItem({
  item,
}: {
  item: ActivityDuplicateHandoffItemView;
}) {
  return (
    <div data-handoff-item={item.id}>
      <dt>{item.label}</dt>
      <dd>
        <output aria-label={item.ariaLabel}>{item.value}</output>
        <span>{item.description}</span>
      </dd>
    </div>
  );
}

function ActivityLibraryEditActionLink({
  action,
}: {
  action: ActivityLibraryEditorActionView;
}) {
  return (
    <Link
      to={action.to}
      params={{ activityId: action.activityId }}
      className={cn(
        buttonVariants({ variant: 'outline' }),
        'w-full bg-background sm:w-fit'
      )}
    >
      <IconEdit aria-hidden="true" className="size-4" />
      {action.label}
    </Link>
  );
}

function ActivityLibraryDuplicateActionButton({
  action,
  disabled,
  onClick,
}: {
  action: ActivityLibraryCardDerivativeActionView;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full bg-background sm:w-fit"
      aria-label={action.ariaLabel}
      disabled={disabled}
      onClick={onClick}
    >
      <IconCopy aria-hidden="true" className="size-4" />
      {action.label}
    </Button>
  );
}

function ActivityLibraryArchiveActionButton({
  action,
  disabled,
  onClick,
}: {
  action: ActivityLibraryCardActionButtonView;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full bg-background sm:w-fit"
      aria-label={action.ariaLabel}
      disabled={disabled}
      onClick={onClick}
    >
      <IconFolderOff aria-hidden="true" className="size-4" />
      {action.label}
    </Button>
  );
}

function ActivityLibraryPublishActionButton({
  action,
  onClick,
}: {
  action: ActivityLibraryCardDerivativeActionView;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      className="w-full sm:w-fit"
      aria-label={action.ariaLabel}
      onClick={onClick}
    >
      <IconPlus aria-hidden="true" className="size-4" />
      {action.label}
    </Button>
  );
}

function ActivityLibraryRestoreAction({
  action,
  actionState,
  disabled,
  onRestore,
  requiredLabel,
}: {
  action: ActivityLibraryCardRestoreActionView;
  actionState: ActivityLibraryCardActionState;
  disabled: boolean;
  onRestore: () => void;
  requiredLabel: string;
}) {
  return (
    <>
      {actionState.showRestoreRequiredMessage ? (
        <ActivityLibraryRestoreRequiredMessage
          message={action.requiredMessage}
          label={requiredLabel}
          statusView={action.statusView}
        />
      ) : null}
      {actionState.showRestoreAction ? (
        <ActivityLibraryRestoreActionButton
          action={action}
          disabled={disabled}
          onClick={onRestore}
        />
      ) : null}
    </>
  );
}

function ActivityLibraryRestoreRequiredMessage({
  label,
  message,
  statusView,
}: {
  label: string;
  message: string;
  statusView: ActivityLibraryCardRestoreActionView['statusView'];
}) {
  const statusDescriptionId = useId();

  return (
    <section
      aria-label={label}
      aria-describedby={statusDescriptionId}
      className="text-sm text-muted-foreground sm:mr-auto"
    >
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <p>{message}</p>
        <ActivityLibraryActionStatusBadge
          descriptionId={statusDescriptionId}
          view={statusView}
        />
      </div>
    </section>
  );
}

function ActivityLibraryRestoreActionButton({
  action,
  disabled,
  onClick,
}: {
  action: ActivityLibraryCardRestoreActionView;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      className="w-full sm:w-fit"
      aria-label={action.ariaLabel}
      disabled={disabled}
      onClick={onClick}
    >
      <IconRotateClockwise aria-hidden="true" className="size-4" />
      {action.label}
    </Button>
  );
}

function formatActivityLibraryElementId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, '-');
}
