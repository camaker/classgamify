import type { ActivityVisibility } from '@/activities/types';
import { buildActivityLifecycleActionView } from '@/activities/lifecycle';
import {
  assignmentPublishDialogCopy,
  buildAssignmentPublishDraftDefaults,
  buildAssignmentPublishDialogViewModel,
  buildAssignmentPublishInputFromDraft,
  type AssignmentPublishDraftValues,
} from '@/assignments/publish-input';
import { ActivityPublishSettingsForm } from '@/components/activities/activity-publish-settings-form';
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
import { useEffect, useMemo, useState } from 'react';
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
    defaults: publishDraftDefaults,
    isPublishing: publishMutation.isPending,
    values: publishDraft,
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
    const actionView = buildActivityLifecycleActionView({
      action: 'publish',
      visibility: activity.visibility,
    });
    if (actionView.gate.type === 'blocked') {
      toast.error(actionView.gate.message);
      return;
    }

    const draftResult = buildAssignmentPublishInputFromDraft(publishView.draft);
    if (!draftResult.ok) {
      toast.error(draftResult.message);
      return;
    }

    try {
      const result = await publishMutation.mutateAsync(draftResult.input);
      toast.success(actionView.successMessage);
      onOpenChange(false);
      onPublished?.(result);
    } catch {
      toast.error(actionView.failureMessage);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{assignmentPublishDialogCopy.title}</DialogTitle>
          <DialogDescription>
            {assignmentPublishDialogCopy.description}
          </DialogDescription>
        </DialogHeader>
        <ActivityPublishSettingsForm
          activityId={activity.id}
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
