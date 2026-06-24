import type { ActivityVisibility } from '@/activities/types';
import { buildActivityLifecycleActionView } from '@/activities/lifecycle';
import {
  assignmentPublishDialogCopy,
  buildAssignmentPublishDraft,
  buildAssignmentPublishCloseAfterMinLocal,
  buildAssignmentPublishDraftDefaults,
  buildAssignmentPublishDialogState,
  buildAssignmentPublishInputFromDraft,
  buildAssignmentPublishPreviewFromDraft,
  buildAssignmentPublishToggleViews,
  validateAssignmentPublishDraft,
} from '@/assignments/publish-input';
import { AssignmentSettingsSummary } from '@/components/assignments/assignment-settings-summary';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
  const [assignmentTitle, setAssignmentTitle] = useState(
    publishDraftDefaults.title
  );
  const [assignmentInstructions, setAssignmentInstructions] = useState(
    publishDraftDefaults.instructions
  );
  const [collectStudentName, setCollectStudentName] = useState(
    publishDraftDefaults.collectStudentName
  );
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(
    publishDraftDefaults.showCorrectAnswers
  );
  const [shuffleItems, setShuffleItems] = useState(
    publishDraftDefaults.shuffleItems
  );
  const [maxAttempts, setMaxAttempts] = useState(
    publishDraftDefaults.maxAttempts
  );
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(
    publishDraftDefaults.timeLimitMinutes
  );
  const [expiresAtLocal, setExpiresAtLocal] = useState(
    publishDraftDefaults.expiresAtLocal
  );
  const publishToggleViews = buildAssignmentPublishToggleViews({
    collectStudentName,
    showCorrectAnswers,
    shuffleItems,
  });
  const publishToggleSetters = {
    collectStudentName: setCollectStudentName,
    showCorrectAnswers: setShowCorrectAnswers,
    shuffleItems: setShuffleItems,
  };
  const publishDraft = buildAssignmentPublishDraft({
    defaults: publishDraftDefaults,
    values: {
      collectStudentName,
      expiresAtLocal,
      instructions: assignmentInstructions,
      maxAttempts,
      showCorrectAnswers,
      shuffleItems,
      timeLimitMinutes,
      title: assignmentTitle,
    },
  });
  const publishPreview = buildAssignmentPublishPreviewFromDraft(publishDraft);
  const publishValidation = validateAssignmentPublishDraft(publishDraft);
  const publishDialogState = buildAssignmentPublishDialogState({
    isPublishing: publishMutation.isPending,
    validation: publishValidation,
  });

  useEffect(() => {
    setAssignmentTitle(publishDraftDefaults.title);
    setAssignmentInstructions(publishDraftDefaults.instructions);
    setCollectStudentName(publishDraftDefaults.collectStudentName);
    setShowCorrectAnswers(publishDraftDefaults.showCorrectAnswers);
    setShuffleItems(publishDraftDefaults.shuffleItems);
    setMaxAttempts(publishDraftDefaults.maxAttempts);
    setTimeLimitMinutes(publishDraftDefaults.timeLimitMinutes);
    setExpiresAtLocal(publishDraftDefaults.expiresAtLocal);
  }, [publishDraftDefaults]);

  async function publishActivity() {
    const actionView = buildActivityLifecycleActionView({
      action: 'publish',
      visibility: activity.visibility,
    });
    if (actionView.gate.type === 'blocked') {
      toast.error(actionView.gate.message);
      return;
    }

    const draftResult = buildAssignmentPublishInputFromDraft(publishDraft);
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
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor={`assignment-title-${activity.id}`}>
              {assignmentPublishDialogCopy.titleLabel}
            </label>
            <Input
              id={`assignment-title-${activity.id}`}
              value={assignmentTitle}
              onChange={(event) =>
                setAssignmentTitle(event.currentTarget.value)
              }
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor={`assignment-instructions-${activity.id}`}>
              {assignmentPublishDialogCopy.instructionsLabel}
            </label>
            <Textarea
              id={`assignment-instructions-${activity.id}`}
              rows={3}
              maxLength={500}
              value={assignmentInstructions}
              placeholder={assignmentPublishDialogCopy.instructionsPlaceholder}
              onChange={(event) =>
                setAssignmentInstructions(event.currentTarget.value)
              }
            />
          </div>
          <div className="grid gap-3 rounded-lg border bg-muted/20 p-3">
            {publishToggleViews.map((option) => (
              <PublishSetting
                key={option.key}
                checked={option.checked}
                description={option.description}
                id={`${option.key}-${activity.id}`}
                label={option.label}
                onCheckedChange={publishToggleSetters[option.key]}
              />
            ))}
          </div>
          <div className="grid gap-2">
            <label htmlFor={`max-attempts-${activity.id}`}>
              {assignmentPublishDialogCopy.maxAttemptsLabel}
            </label>
            <Input
              id={`max-attempts-${activity.id}`}
              type="number"
              min={1}
              max={10}
              value={maxAttempts}
              onChange={(event) => setMaxAttempts(event.currentTarget.value)}
            />
            <p className="text-xs leading-5 text-muted-foreground">
              {assignmentPublishDialogCopy.maxAttemptsHelp}
            </p>
          </div>
          <div className="grid gap-2">
            <label htmlFor={`time-limit-${activity.id}`}>
              {assignmentPublishDialogCopy.timeLimitLabel}
            </label>
            <Input
              id={`time-limit-${activity.id}`}
              type="number"
              min={1}
              max={180}
              value={timeLimitMinutes}
              placeholder={assignmentPublishDialogCopy.timeLimitPlaceholder}
              onChange={(event) =>
                setTimeLimitMinutes(event.currentTarget.value)
              }
            />
            <p className="text-xs leading-5 text-muted-foreground">
              {assignmentPublishDialogCopy.timeLimitHelp}
            </p>
          </div>
          <div className="grid gap-2">
            <label htmlFor={`expires-at-${activity.id}`}>
              {assignmentPublishDialogCopy.closeAfterLabel}
            </label>
            <Input
              id={`expires-at-${activity.id}`}
              type="datetime-local"
              min={buildAssignmentPublishCloseAfterMinLocal()}
              value={expiresAtLocal}
              onChange={(event) => setExpiresAtLocal(event.currentTarget.value)}
            />
            <p className="text-xs leading-5 text-muted-foreground">
              {assignmentPublishDialogCopy.closeAfterHelp}
            </p>
          </div>
          <div className="grid gap-2">
            <p className="font-medium text-sm">
              {assignmentPublishDialogCopy.previewLabel}
            </p>
            <AssignmentSettingsSummary
              expiresAt={publishPreview.expiresAt}
              settings={publishPreview.settings}
            />
            {publishDialogState.errorMessage ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-destructive text-sm">
                {publishDialogState.errorMessage}
              </p>
            ) : null}
          </div>
        </div>
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
            disabled={publishDialogState.publishDisabled}
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

function PublishSetting({
  checked,
  description,
  id,
  label,
  onCheckedChange,
}: {
  checked: boolean;
  description: string;
  id: string;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <label htmlFor={id} className="font-medium text-sm">
          {label}
        </label>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
