import {
  activityLibraryActionCopy,
  activityLibraryCardCopy,
  activityLibraryCreatedPanelCopy,
  activityLibraryPageCopy,
  buildCreatedActivityPanelContext,
} from '@/activities/library-view';
import { ActivityPublishDialog } from '@/components/activities/activity-publish-dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import {
  IconCircleCheck,
  IconEdit,
  IconPlus,
  IconX,
} from '@tabler/icons-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

type CreatedActivityPanelProps = {
  context: ReturnType<typeof buildCreatedActivityPanelContext> | undefined;
  onDismiss: () => void;
};
type CreatedActivityPanelContext = ReturnType<
  typeof buildCreatedActivityPanelContext
>;

export function CreatedActivityPanel({
  context,
  onDismiss,
}: CreatedActivityPanelProps) {
  const navigate = useNavigate();
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const panelContext =
    context ??
    buildCreatedActivityPanelContext({
      activity: undefined,
      isLoading: true,
    });
  const { activity } = panelContext;

  return (
    <>
      <section className="grid gap-4 rounded-lg border border-primary/25 bg-primary/5 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <IconCircleCheck className="size-4" />
            {activityLibraryCreatedPanelCopy.savedLabel}
          </div>
          <h2 className="mt-2 text-lg font-semibold">{panelContext.title}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {panelContext.body}
          </p>
          {panelContext.showMissingHint ? (
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {activityLibraryCreatedPanelCopy.missingHint}
            </p>
          ) : null}
        </div>
        <CreatedActivityPanelActions
          activity={activity}
          context={panelContext}
          onDismiss={onDismiss}
          onPublish={() => setPublishDialogOpen(true)}
        />
      </section>
      {activity ? (
        <ActivityPublishDialog
          activity={{
            id: activity.id,
            title: activity.title,
            visibility: activity.visibility,
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
      ) : null}
    </>
  );
}

function CreatedActivityPanelActions({
  activity,
  context,
  onDismiss,
  onPublish,
}: {
  activity: CreatedActivityPanelContext['activity'];
  context: CreatedActivityPanelContext;
  onDismiss: () => void;
  onPublish: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
      {context.showPublishAction && activity ? (
        <CreatedActivityPublishActionButton onClick={onPublish} />
      ) : null}
      {context.showEditAction && activity ? (
        <CreatedActivityEditActionLink activityId={activity.id} />
      ) : null}
      {context.showCreateAction ? <CreatedActivityNewActionLink /> : null}
      {context.showDismissAction ? (
        <CreatedActivityDismissActionButton onClick={onDismiss} />
      ) : null}
    </div>
  );
}

function CreatedActivityPublishActionButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <Button type="button" className="w-full sm:w-auto" onClick={onClick}>
      <IconPlus className="size-4" />
      {activityLibraryCardCopy.actionLabels.publish}
    </Button>
  );
}

function CreatedActivityEditActionLink({ activityId }: { activityId: string }) {
  return (
    <Link
      to="/dashboard/activities/$activityId"
      params={{ activityId }}
      className={cn(
        buttonVariants({ variant: 'outline' }),
        'w-full bg-background sm:w-auto'
      )}
    >
      <IconEdit className="size-4" />
      {activityLibraryCardCopy.actionLabels.edit}
    </Link>
  );
}

function CreatedActivityNewActionLink() {
  return (
    <Link
      to={Routes.Create}
      className={cn(
        buttonVariants({ variant: 'outline' }),
        'w-full bg-background sm:w-auto'
      )}
    >
      <IconPlus className="size-4" />
      {activityLibraryPageCopy.createActivityLabel}
    </Link>
  );
}

function CreatedActivityDismissActionButton({
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
      {activityLibraryActionCopy.dismiss}
    </Button>
  );
}
