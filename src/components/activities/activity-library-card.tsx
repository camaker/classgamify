import type { ActivityLibraryStatus } from '@/activities/library-filters';
import { buildAssignmentListRouteSearch } from '@/assignments/list-filters';
import { buildActivityLibraryRouteSearch } from '@/activities/library-filters';
import {
  activityLibraryCardCopy,
  buildActivityLibraryCardDisplayView,
  type ActivityLibraryCardActionState,
  type ActivityLibraryCardDisplayView,
  type ActivityLibraryCardTemplateType,
  type ActivityLibraryCardViewModel,
  type ActivityLibraryEditorActionView,
} from '@/activities/library-view';
import {
  buildActivityDerivativeActionExecutionPlan,
  buildActivityVisibilityActionExecutionPlan,
} from '@/activities/lifecycle';
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
  IconCopy,
  IconDeviceGamepad2,
  IconEdit,
  IconFolderOff,
  IconPlus,
  IconRotateClockwise,
} from '@tabler/icons-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
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

  async function remixActivity(
    targetTemplateType: ActivityLibraryCardTemplateType
  ) {
    const executionPlan = buildActivityDerivativeActionExecutionPlan({
      action: 'remix',
      activityId: activity.id,
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

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-md">
            {cardDisplayView.statusLabel}
          </Badge>
          <Badge variant="outline" className="rounded-md">
            <IconDeviceGamepad2 className="size-3.5" />
            {cardDisplayView.templateName}
          </Badge>
        </div>
        <CardTitle>
          <h2 className="text-lg font-semibold">{activity.title}</h2>
        </CardTitle>
        <CardDescription>
          <p>{activity.description}</p>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ActivityLibraryStats stats={cardDisplayView.stats} />
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
          summary={cardDisplayView.sourceMaterials}
        />
        <ActivityLibraryCompatibilityPanel
          actionState={cardDisplayView.actionState}
          compatibility={cardDisplayView.compatibility}
          isRemixing={remixMutation.isPending}
          onRemix={remixActivity}
        />
        <ActivityLibraryCardActions
          actionState={cardDisplayView.actionState}
          editAction={cardDisplayView.editAction}
          isArchiving={archiveMutation.isPending}
          isDuplicating={duplicateMutation.isPending}
          isRestoring={restoreMutation.isPending}
          onArchive={archiveActivity}
          onDuplicate={duplicateActivity}
          onPublish={() => setPublishDialogOpen(true)}
          onRestore={restoreActivity}
        />
      </CardContent>
      <ActivityPublishDialog
        activity={{
          id: activity.id,
          title: activity.title,
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
  editAction,
  isArchiving,
  isDuplicating,
  isRestoring,
  onArchive,
  onDuplicate,
  onPublish,
  onRestore,
}: {
  actionState: ActivityLibraryCardActionState;
  editAction: ActivityLibraryEditorActionView;
  isArchiving: boolean;
  isDuplicating: boolean;
  isRestoring: boolean;
  onArchive: () => void;
  onDuplicate: () => void;
  onPublish: () => void;
  onRestore: () => void;
}) {
  if (!actionState.showPersistedActions) return null;

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      {actionState.showEditAction ? (
        <ActivityLibraryEditActionLink action={editAction} />
      ) : null}
      {actionState.showDerivativeActions ? (
        <ActivityLibraryDuplicateActionButton
          disabled={isDuplicating}
          onClick={onDuplicate}
        />
      ) : null}
      {actionState.showArchiveAction || actionState.showPublishAction ? (
        <>
          {actionState.showArchiveAction ? (
            <ActivityLibraryArchiveActionButton
              disabled={isArchiving}
              onClick={onArchive}
            />
          ) : null}
          {actionState.showPublishAction ? (
            <ActivityLibraryPublishActionButton onClick={onPublish} />
          ) : null}
        </>
      ) : (
        <ActivityLibraryRestoreAction
          actionState={actionState}
          disabled={isRestoring}
          onRestore={onRestore}
        />
      )}
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
      <IconEdit className="size-4" />
      {action.label}
    </Link>
  );
}

function ActivityLibraryDuplicateActionButton({
  disabled,
  onClick,
}: {
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full bg-background sm:w-fit"
      disabled={disabled}
      onClick={onClick}
    >
      <IconCopy className="size-4" />
      {activityLibraryCardCopy.actionLabels.duplicate}
    </Button>
  );
}

function ActivityLibraryArchiveActionButton({
  disabled,
  onClick,
}: {
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full bg-background sm:w-fit"
      disabled={disabled}
      onClick={onClick}
    >
      <IconFolderOff className="size-4" />
      {activityLibraryCardCopy.actionLabels.archive}
    </Button>
  );
}

function ActivityLibraryPublishActionButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <Button type="button" className="w-full sm:w-fit" onClick={onClick}>
      <IconPlus className="size-4" />
      {activityLibraryCardCopy.actionLabels.publish}
    </Button>
  );
}

function ActivityLibraryRestoreAction({
  actionState,
  disabled,
  onRestore,
}: {
  actionState: ActivityLibraryCardActionState;
  disabled: boolean;
  onRestore: () => void;
}) {
  return (
    <>
      {actionState.showRestoreRequiredMessage ? (
        <ActivityLibraryRestoreRequiredMessage />
      ) : null}
      {actionState.showRestoreAction ? (
        <ActivityLibraryRestoreActionButton
          disabled={disabled}
          onClick={onRestore}
        />
      ) : null}
    </>
  );
}

function ActivityLibraryRestoreRequiredMessage() {
  return (
    <p className="text-sm text-muted-foreground sm:mr-auto">
      {activityLibraryCardCopy.restoreRequiredMessage}
    </p>
  );
}

function ActivityLibraryRestoreActionButton({
  disabled,
  onClick,
}: {
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      className="w-full sm:w-fit"
      disabled={disabled}
      onClick={onClick}
    >
      <IconRotateClockwise className="size-4" />
      {activityLibraryCardCopy.actionLabels.restore}
    </Button>
  );
}
