import type { ActivityVisibility } from '@/activities/types';
import {
  assignmentPublishDialogCopy,
  buildAssignmentPublishDraftDefaults,
  buildAssignmentPublishDialogViewModel,
  buildActivityPublishExecutionPlan,
  type AssignmentPublishDraftValues,
} from '@/assignments/publish-input';
import { ActivityPublishSettingsForm } from '@/components/activities/activity-publish-settings-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { usePublishAssignment } from '@/hooks/use-assignments';
import { IconPlus } from '@tabler/icons-react';
import { useEffect, useId, useMemo, useState } from 'react';
import { toast } from 'sonner';

type ActivityPublishDialogActivity = {
  id: string;
  title: string;
  visibility: ActivityVisibility;
};

type ActivityPublishDialogResult = {
  assignment: {
    shareSlug: string;
  };
};

export function ActivityPublishDialog({
  activity,
  onOpenChange,
  onPublished,
  open,
}: {
  activity: ActivityPublishDialogActivity;
  onOpenChange: (open: boolean) => void;
  onPublished?: (result: ActivityPublishDialogResult) => void;
  open: boolean;
}) {
  const publishMutation = usePublishAssignment();
  const accessDescriptionId = useId();
  const controlIdBase = useId();
  const publishDraftDefaults = useMemo(
    () =>
      buildAssignmentPublishDraftDefaults({
        activityId: activity.id,
        title: activity.title,
      }),
    [activity.id, activity.title]
  );
  const [publishDraft, setPublishDraft] = useState(publishDraftDefaults);
  const publishView = buildAssignmentPublishDialogViewModel({
    controlIdBase,
    defaults: publishDraftDefaults,
    isPublishing: publishMutation.isPending,
    values: publishDraft,
    visibility: activity.visibility,
  });

  useEffect(() => {
    setPublishDraft(publishDraftDefaults);
  }, [publishDraftDefaults]);

  function updatePublishDraft<TKey extends keyof AssignmentPublishDraftValues>(
    key: TKey,
    value: AssignmentPublishDraftValues[TKey]
  ) {
    setPublishDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function publishActivity() {
    const executionPlan = buildActivityPublishExecutionPlan({
      draft: publishView.draft,
      visibility: activity.visibility,
    });
    if (executionPlan.type === 'blocked') {
      toast.error(executionPlan.message);
      return;
    }

    try {
      const result = await publishMutation.mutateAsync(executionPlan.input);
      toast.success(executionPlan.successMessage);
      onOpenChange(false);
      onPublished?.(result);
    } catch {
      toast.error(executionPlan.failureMessage);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen && !publishView.accessView.canOpen) {
      toast.error(
        publishView.accessView.message ?? publishView.accessView.description
      );
      onOpenChange(false);
      return;
    }

    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{assignmentPublishDialogCopy.title}</DialogTitle>
          <DialogDescription>
            {assignmentPublishDialogCopy.description}
          </DialogDescription>
        </DialogHeader>
        <section
          aria-label={publishView.accessView.label}
          aria-describedby={accessDescriptionId}
          className="flex flex-wrap items-start justify-between gap-3 rounded-lg border bg-muted/30 p-3"
        >
          <div className="min-w-0">
            <p className="font-medium text-sm">
              {publishView.accessView.label}
            </p>
            <p
              className="mt-1 text-muted-foreground text-xs leading-5"
              id={accessDescriptionId}
            >
              {publishView.accessView.description}
            </p>
          </div>
          <Badge
            aria-label={publishView.accessView.ariaLabel}
            className="rounded-md"
            data-status={publishView.accessView.status}
            variant={
              publishView.accessView.status === 'blocked'
                ? 'destructive'
                : 'outline'
            }
          >
            {publishView.accessView.value}
          </Badge>
        </section>
        <ActivityPublishSettingsForm
          draft={publishView.draft}
          onDraftChange={updatePublishDraft}
          view={publishView}
        />
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {assignmentPublishDialogCopy.cancelLabel}
          </Button>
          <Button
            type="button"
            disabled={publishView.dialogState.publishDisabled}
            onClick={publishActivity}
          >
            <IconPlus className="size-4" />
            {assignmentPublishDialogCopy.publishLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
