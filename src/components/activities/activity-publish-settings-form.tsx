import {
  assignmentPublishDialogCopy,
  type AssignmentPublishDialogViewModel,
  type AssignmentPublishDraft,
  type AssignmentPublishDraftValues,
  type AssignmentPublishHandoffView,
  type AssignmentPublishPreviewContextTone,
  type AssignmentPublishPreviewContextStatView,
  type AssignmentPublishPreviewContextView,
  type AssignmentPublishPreviewReviewItemView,
  type AssignmentPublishToggleView,
} from '@/assignments/publish-input';
import { buildAssignmentPublishCloseAfterMinLocal } from '@/assignments/publish-schedule';
import {
  ASSIGNMENT_MAX_ATTEMPTS_RANGE,
  ASSIGNMENT_PUBLISH_FIELD_LIMITS,
  ASSIGNMENT_TIME_LIMIT_MINUTES_RANGE,
} from '@/assignments/validation';
import { AssignmentSettingsSummary } from '@/components/assignments/assignment-settings-summary';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

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
  const titleHelpId = `assignment-title-${activityId}-help`;
  const instructionsHelpId = `assignment-instructions-${activityId}-help`;

  return (
    <>
      <div className="grid gap-2">
        <label htmlFor={`assignment-title-${activityId}`}>
          {assignmentPublishDialogCopy.titleLabel}
        </label>
        <Input
          id={`assignment-title-${activityId}`}
          value={draft.title}
          aria-describedby={titleHelpId}
          onChange={(event) =>
            onDraftChange('title', event.currentTarget.value)
          }
        />
        <p id={titleHelpId} className="text-xs leading-5 text-muted-foreground">
          {assignmentPublishDialogCopy.titleHelp}
        </p>
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
          aria-describedby={instructionsHelpId}
          onChange={(event) =>
            onDraftChange('instructions', event.currentTarget.value)
          }
        />
        <p
          id={instructionsHelpId}
          className="text-xs leading-5 text-muted-foreground"
        >
          {assignmentPublishDialogCopy.instructionsHelp}
        </p>
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
  toggleViews: AssignmentPublishToggleView[];
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
  const maxAttemptsHelpId = `max-attempts-${activityId}-help`;
  const timeLimitHelpId = `time-limit-${activityId}-help`;
  const closeAfterHelpId = `expires-at-${activityId}-help`;

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
          aria-describedby={maxAttemptsHelpId}
          onChange={(event) =>
            onDraftChange('maxAttempts', event.currentTarget.value)
          }
        />
        <p
          id={maxAttemptsHelpId}
          className="text-xs leading-5 text-muted-foreground"
        >
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
          aria-describedby={timeLimitHelpId}
          onChange={(event) =>
            onDraftChange('timeLimitMinutes', event.currentTarget.value)
          }
        />
        <p
          id={timeLimitHelpId}
          className="text-xs leading-5 text-muted-foreground"
        >
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
          aria-describedby={closeAfterHelpId}
          onChange={(event) =>
            onDraftChange('expiresAtLocal', event.currentTarget.value)
          }
        />
        <p
          id={closeAfterHelpId}
          className="text-xs leading-5 text-muted-foreground"
        >
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
    <section
      aria-labelledby="assignment-publish-preview-label"
      className="grid gap-2"
    >
      <p id="assignment-publish-preview-label" className="font-medium text-sm">
        {assignmentPublishDialogCopy.previewLabel}
      </p>
      <ActivityPublishPreviewContext context={view.preview.context} />
      <AssignmentSettingsSummary view={view.preview.settingsSummaryView} />
      <AssignmentPublishHandoff view={view.handoffView} />
      {view.dialogState.errorMessage ? (
        <p
          className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-destructive text-sm"
          role="alert"
        >
          {view.dialogState.errorMessage}
        </p>
      ) : null}
    </section>
  );
}

function AssignmentPublishHandoff({
  view,
}: {
  view: AssignmentPublishHandoffView;
}) {
  const titleId = 'assignment-publish-handoff-title';
  const descriptionId = 'assignment-publish-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="assignment-publish"
    >
      <h3 id={titleId}>{view.title}</h3>
      <p id={descriptionId}>{view.description}</p>
      <dl>
        {view.itemViews.map((item) => (
          <div data-handoff-item={item.id} key={item.id}>
            <dt>{item.label}</dt>
            <dd>
              <output aria-label={item.ariaLabel}>{item.value}</output>
              <span>{item.description}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function ActivityPublishPreviewContext({
  context,
}: {
  context: AssignmentPublishPreviewContextView;
}) {
  const titleId = 'assignment-publish-preview-context-title';
  const descriptionId = 'assignment-publish-preview-context-description';
  const statusMessageId = 'assignment-publish-preview-context-status-message';
  const reviewLabelId = 'assignment-publish-preview-review-label';

  return (
    <section
      aria-labelledby={titleId}
      aria-describedby={`${descriptionId} ${statusMessageId}`}
      className="grid gap-3 rounded-lg border bg-muted/20 p-3"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p id={titleId} className="font-medium text-sm">
            {context.title}
          </p>
          <p
            id={descriptionId}
            className="mt-1 text-muted-foreground text-xs leading-5"
          >
            {context.description}
          </p>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-md px-2 py-1 font-medium text-xs',
            getActivityPublishPreviewStatusClass(context.status.tone)
          )}
          aria-describedby={statusMessageId}
        >
          {context.status.label}
        </span>
      </div>
      <p
        className={cn(
          'rounded-md border px-3 py-2 text-sm',
          getActivityPublishPreviewMessageClass(context.status.tone)
        )}
        id={statusMessageId}
        role={context.status.tone === 'blocked' ? 'alert' : 'status'}
      >
        {context.status.message}
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {context.statItems.map((item) => (
          <AssignmentPublishPreviewStatItem item={item} key={item.id} />
        ))}
      </div>
      <div className="border-t pt-3">
        <p id={reviewLabelId} className="font-medium text-xs">
          {context.reviewLabel}
        </p>
        <ul aria-labelledby={reviewLabelId} className="mt-2 grid gap-2">
          {context.reviewItems.map((item) => (
            <AssignmentPublishPreviewReviewItem item={item} key={item.id} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function AssignmentPublishPreviewStatItem({
  item,
}: {
  item: AssignmentPublishPreviewContextStatView;
}) {
  const labelId = `assignment-publish-preview-stat-${item.id}-label`;
  const valueId = `assignment-publish-preview-stat-${item.id}-value`;

  return (
    <fieldset
      aria-labelledby={`${labelId} ${valueId}`}
      className="rounded-md border bg-background p-2"
    >
      <legend id={labelId} className="text-muted-foreground text-xs">
        {item.label}
      </legend>
      <div id={valueId} className="mt-1 font-medium text-sm">
        <output>{item.value}</output>
      </div>
    </fieldset>
  );
}

function AssignmentPublishPreviewReviewItem({
  item,
}: {
  item: AssignmentPublishPreviewReviewItemView;
}) {
  const labelId = `assignment-publish-preview-review-${item.id}-label`;
  const descriptionId = `assignment-publish-preview-review-${item.id}-description`;

  return (
    <li
      aria-label={item.ariaLabel}
      aria-labelledby={labelId}
      aria-describedby={descriptionId}
      className="rounded-md border bg-background px-3 py-2 text-xs"
    >
      <span className="sr-only">{item.ariaLabel}</span>
      <p id={labelId} className="font-medium">
        {item.label}
      </p>
      <p id={descriptionId} className="mt-1 leading-5 text-muted-foreground">
        {item.description}
      </p>
    </li>
  );
}

function getActivityPublishPreviewStatusClass(
  tone: AssignmentPublishPreviewContextTone
) {
  return tone === 'ready'
    ? 'border border-primary/20 bg-primary/10 text-primary'
    : 'border border-destructive/30 bg-destructive/10 text-destructive';
}

function getActivityPublishPreviewMessageClass(
  tone: AssignmentPublishPreviewContextTone
) {
  return tone === 'ready'
    ? 'border-primary/20 bg-primary/5 text-primary'
    : 'border-destructive/30 bg-destructive/5 text-destructive';
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
  const descriptionId = `${id}-description`;

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <label htmlFor={id} className="font-medium text-sm">
          {label}
        </label>
        <p
          id={descriptionId}
          className="mt-1 text-xs leading-5 text-muted-foreground"
        >
          {description}
        </p>
      </div>
      <Switch
        id={id}
        checked={checked}
        aria-describedby={descriptionId}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}
