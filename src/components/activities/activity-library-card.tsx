import type { ActivityLibraryStatus } from '@/activities/library-filters';
import {
  activityLibraryCardCopy,
  buildActivityLibraryCardDisplayView,
  type buildActivityLibraryCardViewModel,
} from '@/activities/library-view';
import { ActivityLibraryCompatibilityPanel } from '@/components/activities/activity-library-compatibility-panel';
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

type ActivityCardData = ReturnType<typeof buildActivityLibraryCardViewModel>;

type ActivityLibraryCardProps = {
  activity: ActivityCardData;
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
    targetTemplateType: ActivityCardData['templateType']
  ) {
    const actionView = cardDisplayView.actionView.remix;
    if (actionView.gate.type === 'blocked') {
      toast.error(actionView.gate.message);
      return;
    }
    try {
      const result = await remixMutation.mutateAsync({
        activityId: activity.id,
        targetTemplateType,
      });
      toast.success(actionView.successMessage);
      navigate({
        to: '/dashboard/activities/$activityId',
        params: { activityId: result.id },
      });
    } catch {
      toast.error(actionView.failureMessage);
    }
  }

  async function duplicateActivity() {
    const actionView = cardDisplayView.actionView.duplicate;
    if (actionView.gate.type === 'blocked') {
      toast.error(actionView.gate.message);
      return;
    }
    try {
      const result = await duplicateMutation.mutateAsync({
        activityId: activity.id,
      });
      toast.success(actionView.successMessage);
      navigate({
        to: '/dashboard/activities/$activityId',
        params: { activityId: result.id },
      });
    } catch {
      toast.error(actionView.failureMessage);
    }
  }

  async function archiveActivity() {
    const actionCopy = cardDisplayView.actionView.archive;
    try {
      await archiveMutation.mutateAsync({ activityId: activity.id });
      toast.success(actionCopy.successMessage);
    } catch {
      toast.error(actionCopy.failureMessage);
    }
  }

  async function restoreActivity() {
    const actionCopy = cardDisplayView.actionView.restore;
    try {
      await restoreMutation.mutateAsync({ activityId: activity.id });
      toast.success(actionCopy.successMessage);
    } catch {
      toast.error(actionCopy.failureMessage);
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
        <div className="grid gap-3 sm:grid-cols-3">
          {cardDisplayView.stats.map((stat) => (
            <ActivityStat
              key={stat.key}
              label={stat.label}
              value={stat.value}
            />
          ))}
        </div>
        <ActivitySourceMaterialsSummary
          className="bg-muted/30"
          summary={cardDisplayView.sourceMaterials}
        />
        <ActivityLibraryCompatibilityPanel
          actionState={cardDisplayView.actionState}
          compatibility={cardDisplayView.compatibility}
          isRemixing={remixMutation.isPending}
          onRemix={remixActivity}
        />
        {cardDisplayView.actionState.showPersistedActions ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            {cardDisplayView.actionState.showEditAction ? (
              <Link
                to="/dashboard/activities/$activityId"
                params={{ activityId: activity.id }}
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'w-full bg-background sm:w-fit'
                )}
              >
                <IconEdit className="size-4" />
                {activityLibraryCardCopy.actionLabels.edit}
              </Link>
            ) : null}
            {cardDisplayView.actionState.showDerivativeActions ? (
              <Button
                type="button"
                variant="outline"
                className="w-full bg-background sm:w-fit"
                disabled={duplicateMutation.isPending}
                onClick={duplicateActivity}
              >
                <IconCopy className="size-4" />
                {activityLibraryCardCopy.actionLabels.duplicate}
              </Button>
            ) : null}
            {cardDisplayView.actionState.showArchiveAction ||
            cardDisplayView.actionState.showPublishAction ? (
              <>
                {cardDisplayView.actionState.showArchiveAction ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-background sm:w-fit"
                    disabled={archiveMutation.isPending}
                    onClick={archiveActivity}
                  >
                    <IconFolderOff className="size-4" />
                    {activityLibraryCardCopy.actionLabels.archive}
                  </Button>
                ) : null}
                {cardDisplayView.actionState.showPublishAction ? (
                  <Button
                    type="button"
                    className="w-full sm:w-fit"
                    onClick={() => setPublishDialogOpen(true)}
                  >
                    <IconPlus className="size-4" />
                    {activityLibraryCardCopy.actionLabels.publish}
                  </Button>
                ) : null}
              </>
            ) : (
              <>
                {cardDisplayView.actionState.showRestoreRequiredMessage ? (
                  <p className="text-sm text-muted-foreground sm:mr-auto">
                    {activityLibraryCardCopy.restoreRequiredMessage}
                  </p>
                ) : null}
                {cardDisplayView.actionState.showRestoreAction ? (
                  <Button
                    type="button"
                    className="w-full sm:w-fit"
                    disabled={restoreMutation.isPending}
                    onClick={restoreActivity}
                  >
                    <IconRotateClockwise className="size-4" />
                    {activityLibraryCardCopy.actionLabels.restore}
                  </Button>
                ) : null}
              </>
            )}
          </div>
        ) : null}
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
            search: { published: result.assignment.shareSlug },
          })
        }
      />
    </Card>
  );
}

function ActivityStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
