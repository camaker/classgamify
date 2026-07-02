import {
  activityLibraryCreatedPanelCopy,
  buildCreatedActivityPanelContext,
  type CreatedActivityPanelActionView,
  type CreatedActivityPanelCreateActionView,
  type CreatedActivityPanelContext,
  type CreatedActivityPanelDismissActionView,
  type CreatedActivityPanelEditAction,
  type CreatedActivityPanelPublishActionView,
} from '@/activities/library-view';
import { buildAssignmentListRouteSearch } from '@/assignments/list-filters';
import { buildAssignmentPublishDialogAccessView } from '@/assignments/publish-input';
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
import { toast } from 'sonner';

type CreatedActivityPanelProps = {
  context: CreatedActivityPanelContext | undefined;
  onDismiss: () => void;
};

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

  function openPublishDialog() {
    if (!activity) return;

    const accessView = buildAssignmentPublishDialogAccessView(
      activity.visibility
    );
    if (!accessView.canOpen) {
      toast.error(accessView.message ?? accessView.description);
      return;
    }

    setPublishDialogOpen(true);
  }

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
          actionView={panelContext.actionView}
          context={panelContext}
          onDismiss={onDismiss}
          onPublish={openPublishDialog}
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
              search: buildAssignmentListRouteSearch({
                published: result.assignment.shareSlug,
              }),
            })
          }
        />
      ) : null}
    </>
  );
}

function CreatedActivityPanelActions({
  actionView,
  context,
  onDismiss,
  onPublish,
}: {
  actionView: CreatedActivityPanelActionView;
  context: CreatedActivityPanelContext;
  onDismiss: () => void;
  onPublish: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
      {context.showPublishAction ? (
        <CreatedActivityPublishActionButton
          action={actionView.publish}
          onClick={onPublish}
        />
      ) : null}
      {context.showEditAction && actionView.edit ? (
        <CreatedActivityEditActionLink action={actionView.edit} />
      ) : null}
      {context.showCreateAction ? (
        <CreatedActivityNewActionLink action={actionView.create} />
      ) : null}
      {context.showDismissAction ? (
        <CreatedActivityDismissActionButton
          action={actionView.dismiss}
          onClick={onDismiss}
        />
      ) : null}
    </div>
  );
}

function CreatedActivityPublishActionButton({
  action,
  onClick,
}: {
  action?: CreatedActivityPanelPublishActionView;
  onClick: () => void;
}) {
  if (!action) return null;

  return (
    <Button type="button" className="w-full sm:w-auto" onClick={onClick}>
      <IconPlus className="size-4" />
      {action.label}
    </Button>
  );
}

function CreatedActivityEditActionLink({
  action,
}: {
  action: CreatedActivityPanelEditAction;
}) {
  return (
    <Link
      to={action.to}
      params={{ activityId: action.activityId }}
      className={cn(
        buttonVariants({ variant: 'outline' }),
        'w-full bg-background sm:w-auto'
      )}
    >
      <IconEdit className="size-4" />
      {action.label}
    </Link>
  );
}

function CreatedActivityNewActionLink({
  action,
}: {
  action: CreatedActivityPanelCreateActionView;
}) {
  return (
    <Link
      to={action.to}
      className={cn(
        buttonVariants({ variant: 'outline' }),
        'w-full bg-background sm:w-auto'
      )}
    >
      <IconPlus className="size-4" />
      {action.label}
    </Link>
  );
}

function CreatedActivityDismissActionButton({
  action,
  onClick,
}: {
  action: CreatedActivityPanelDismissActionView;
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
      {action.label}
    </Button>
  );
}
