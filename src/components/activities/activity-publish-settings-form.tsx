import {
  assignmentPublishDialogCopy,
  buildAssignmentPublishCloseAfterMinLocal,
  type AssignmentPublishDialogViewModel,
  type AssignmentPublishDraft,
  type AssignmentPublishDraftValues,
} from '@/assignments/publish-input';
import {
  ASSIGNMENT_MAX_ATTEMPTS_RANGE,
  ASSIGNMENT_PUBLISH_FIELD_LIMITS,
  ASSIGNMENT_TIME_LIMIT_MINUTES_RANGE,
} from '@/assignments/validation';
import { AssignmentSettingsSummary } from '@/components/assignments/assignment-settings-summary';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

type ActivityPublishDraftFieldChange = <
  TKey extends keyof AssignmentPublishDraftValues,
>(
  key: TKey,
  value: AssignmentPublishDraftValues[TKey]
) => void;

type ActivityPublishSettingsFormProps = {
  activityId: string;
  draft: AssignmentPublishDraft;
  onDraftChange: ActivityPublishDraftFieldChange;
  view: AssignmentPublishDialogViewModel;
};

export function ActivityPublishSettingsForm({
  activityId,
  draft,
  onDraftChange,
  view,
}: ActivityPublishSettingsFormProps) {
  return (
    <div className="grid gap-4">
      <ActivityPublishIdentityFields
        activityId={activityId}
        draft={draft}
        onDraftChange={onDraftChange}
      />
      <ActivityPublishToggleGroup
        activityId={activityId}
        onDraftChange={onDraftChange}
        toggleViews={view.toggleViews}
      />
      <ActivityPublishDeliveryLimitFields
        activityId={activityId}
        draft={draft}
        onDraftChange={onDraftChange}
      />
      <ActivityPublishPreview view={view} />
    </div>
  );
}

function ActivityPublishIdentityFields({
  activityId,
  draft,
  onDraftChange,
}: {
  activityId: string;
  draft: AssignmentPublishDraft;
  onDraftChange: ActivityPublishDraftFieldChange;
}) {
  return (
    <>
      <div className="grid gap-2">
        <label htmlFor={`assignment-title-${activityId}`}>
          {assignmentPublishDialogCopy.titleLabel}
        </label>
        <Input
          id={`assignment-title-${activityId}`}
          value={draft.title}
          onChange={(event) =>
            onDraftChange('title', event.currentTarget.value)
          }
        />
      </div>
      <div className="grid gap-2">
        <label htmlFor={`assignment-instructions-${activityId}`}>
          {assignmentPublishDialogCopy.instructionsLabel}
        </label>
        <Textarea
          id={`assignment-instructions-${activityId}`}
          rows={3}
          maxLength={ASSIGNMENT_PUBLISH_FIELD_LIMITS.instructionsMaxLength}
          value={draft.instructions}
          placeholder={assignmentPublishDialogCopy.instructionsPlaceholder}
          onChange={(event) =>
            onDraftChange('instructions', event.currentTarget.value)
          }
        />
      </div>
    </>
  );
}

function ActivityPublishToggleGroup({
  activityId,
  onDraftChange,
  toggleViews,
}: {
  activityId: string;
  onDraftChange: ActivityPublishDraftFieldChange;
  toggleViews: AssignmentPublishDialogViewModel['toggleViews'];
}) {
  return (
    <div className="grid gap-3 rounded-lg border bg-muted/20 p-3">
      {toggleViews.map((option) => (
        <PublishSetting
          key={option.key}
          checked={option.checked}
          description={option.description}
          id={`${option.key}-${activityId}`}
          label={option.label}
          onCheckedChange={(checked) => onDraftChange(option.key, checked)}
        />
      ))}
    </div>
  );
}

function ActivityPublishDeliveryLimitFields({
  activityId,
  draft,
  onDraftChange,
}: {
  activityId: string;
  draft: AssignmentPublishDraft;
  onDraftChange: ActivityPublishDraftFieldChange;
}) {
  return (
    <>
      <div className="grid gap-2">
        <label htmlFor={`max-attempts-${activityId}`}>
          {assignmentPublishDialogCopy.maxAttemptsLabel}
        </label>
        <Input
          id={`max-attempts-${activityId}`}
          type="number"
          min={ASSIGNMENT_MAX_ATTEMPTS_RANGE.min}
          max={ASSIGNMENT_MAX_ATTEMPTS_RANGE.max}
          value={draft.maxAttempts}
          onChange={(event) =>
            onDraftChange('maxAttempts', event.currentTarget.value)
          }
        />
        <p className="text-xs leading-5 text-muted-foreground">
          {assignmentPublishDialogCopy.maxAttemptsHelp}
        </p>
      </div>
      <div className="grid gap-2">
        <label htmlFor={`time-limit-${activityId}`}>
          {assignmentPublishDialogCopy.timeLimitLabel}
        </label>
        <Input
          id={`time-limit-${activityId}`}
          type="number"
          min={ASSIGNMENT_TIME_LIMIT_MINUTES_RANGE.min}
          max={ASSIGNMENT_TIME_LIMIT_MINUTES_RANGE.max}
          value={draft.timeLimitMinutes}
          placeholder={assignmentPublishDialogCopy.timeLimitPlaceholder}
          onChange={(event) =>
            onDraftChange('timeLimitMinutes', event.currentTarget.value)
          }
        />
        <p className="text-xs leading-5 text-muted-foreground">
          {assignmentPublishDialogCopy.timeLimitHelp}
        </p>
      </div>
      <div className="grid gap-2">
        <label htmlFor={`expires-at-${activityId}`}>
          {assignmentPublishDialogCopy.closeAfterLabel}
        </label>
        <Input
          id={`expires-at-${activityId}`}
          type="datetime-local"
          min={buildAssignmentPublishCloseAfterMinLocal()}
          value={draft.expiresAtLocal}
          onChange={(event) =>
            onDraftChange('expiresAtLocal', event.currentTarget.value)
          }
        />
        <p className="text-xs leading-5 text-muted-foreground">
          {assignmentPublishDialogCopy.closeAfterHelp}
        </p>
      </div>
    </>
  );
}

function ActivityPublishPreview({
  view,
}: {
  view: AssignmentPublishDialogViewModel;
}) {
  return (
    <div className="grid gap-2">
      <p className="font-medium text-sm">
        {assignmentPublishDialogCopy.previewLabel}
      </p>
      <AssignmentSettingsSummary view={view.preview.settingsSummaryView} />
      {view.dialogState.errorMessage ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-destructive text-sm">
          {view.dialogState.errorMessage}
        </p>
      ) : null}
    </div>
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
