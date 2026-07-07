import {
  assignmentPublishDialogCopy,
  type AssignmentPublishControlBoundaryView,
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

type AssignmentPublishStatControlIds =
  AssignmentPublishControlBoundaryView['controlIds']['statItemIds'][AssignmentPublishPreviewContextStatView['id']];

type AssignmentPublishReviewControlIds =
  AssignmentPublishControlBoundaryView['controlIds']['reviewItemIds'][AssignmentPublishPreviewReviewItemView['id']];

type ActivityPublishSettingsFormProps = {
  draft: AssignmentPublishDraft;
  onDraftChange: ActivityPublishDraftFieldChange;
  view: AssignmentPublishDialogViewModel;
};

export function ActivityPublishSettingsForm({
  draft,
  onDraftChange,
  view,
}: ActivityPublishSettingsFormProps) {
  return (
    <div className="grid gap-4">
      <ActivityPublishIdentityFields
        controlBoundary={view.controlBoundary}
        draft={draft}
        onDraftChange={onDraftChange}
      />
      <ActivityPublishToggleGroup
        controlBoundary={view.controlBoundary}
        onDraftChange={onDraftChange}
        toggleViews={view.toggleViews}
      />
      <ActivityPublishDeliveryLimitFields
        controlBoundary={view.controlBoundary}
        draft={draft}
        onDraftChange={onDraftChange}
      />
      <ActivityPublishPreview view={view} />
    </div>
  );
}

function ActivityPublishIdentityFields({
  controlBoundary,
  draft,
  onDraftChange,
}: {
  controlBoundary: AssignmentPublishControlBoundaryView;
  draft: AssignmentPublishDraft;
  onDraftChange: ActivityPublishDraftFieldChange;
}) {
  const { fieldIds } = controlBoundary.controlIds;

  return (
    <>
      <div className="grid gap-2">
        <label htmlFor={fieldIds.title.inputId}>
          {assignmentPublishDialogCopy.titleLabel}
        </label>
        <Input
          id={fieldIds.title.inputId}
          value={draft.title}
          aria-describedby={joinDomIds(fieldIds.title.describedByIds)}
          onChange={(event) =>
            onDraftChange('title', event.currentTarget.value)
          }
        />
        <p
          id={fieldIds.title.helpId}
          className="text-xs leading-5 text-muted-foreground"
        >
          {assignmentPublishDialogCopy.titleHelp}
        </p>
      </div>
      <div className="grid gap-2">
        <label htmlFor={fieldIds.instructions.inputId}>
          {assignmentPublishDialogCopy.instructionsLabel}
        </label>
        <Textarea
          id={fieldIds.instructions.inputId}
          rows={3}
          maxLength={ASSIGNMENT_PUBLISH_FIELD_LIMITS.instructionsMaxLength}
          value={draft.instructions}
          placeholder={assignmentPublishDialogCopy.instructionsPlaceholder}
          aria-describedby={joinDomIds(fieldIds.instructions.describedByIds)}
          onChange={(event) =>
            onDraftChange('instructions', event.currentTarget.value)
          }
        />
        <p
          id={fieldIds.instructions.helpId}
          className="text-xs leading-5 text-muted-foreground"
        >
          {assignmentPublishDialogCopy.instructionsHelp}
        </p>
      </div>
    </>
  );
}

function ActivityPublishToggleGroup({
  controlBoundary,
  onDraftChange,
  toggleViews,
}: {
  controlBoundary: AssignmentPublishControlBoundaryView;
  onDraftChange: ActivityPublishDraftFieldChange;
  toggleViews: AssignmentPublishToggleView[];
}) {
  const { controlIds } = controlBoundary;

  return (
    <div
      id={controlIds.toggleGroup}
      className="grid gap-3 rounded-lg border bg-muted/20 p-3"
    >
      {toggleViews.map((option) => (
        <PublishSetting
          key={option.key}
          checked={option.checked}
          description={option.description}
          descriptionId={controlIds.toggleIds[option.key].descriptionId}
          describedByIds={controlIds.toggleIds[option.key].describedByIds}
          id={controlIds.toggleIds[option.key].inputId}
          label={option.label}
          onCheckedChange={(checked) => onDraftChange(option.key, checked)}
        />
      ))}
    </div>
  );
}

function ActivityPublishDeliveryLimitFields({
  controlBoundary,
  draft,
  onDraftChange,
}: {
  controlBoundary: AssignmentPublishControlBoundaryView;
  draft: AssignmentPublishDraft;
  onDraftChange: ActivityPublishDraftFieldChange;
}) {
  const { fieldIds } = controlBoundary.controlIds;

  return (
    <>
      <div className="grid gap-2">
        <label htmlFor={fieldIds.maxAttempts.inputId}>
          {assignmentPublishDialogCopy.maxAttemptsLabel}
        </label>
        <Input
          id={fieldIds.maxAttempts.inputId}
          type="number"
          min={ASSIGNMENT_MAX_ATTEMPTS_RANGE.min}
          max={ASSIGNMENT_MAX_ATTEMPTS_RANGE.max}
          value={draft.maxAttempts}
          aria-describedby={joinDomIds(fieldIds.maxAttempts.describedByIds)}
          onChange={(event) =>
            onDraftChange('maxAttempts', event.currentTarget.value)
          }
        />
        <p
          id={fieldIds.maxAttempts.helpId}
          className="text-xs leading-5 text-muted-foreground"
        >
          {assignmentPublishDialogCopy.maxAttemptsHelp}
        </p>
      </div>
      <div className="grid gap-2">
        <label htmlFor={fieldIds.timeLimit.inputId}>
          {assignmentPublishDialogCopy.timeLimitLabel}
        </label>
        <Input
          id={fieldIds.timeLimit.inputId}
          type="number"
          min={ASSIGNMENT_TIME_LIMIT_MINUTES_RANGE.min}
          max={ASSIGNMENT_TIME_LIMIT_MINUTES_RANGE.max}
          value={draft.timeLimitMinutes}
          placeholder={assignmentPublishDialogCopy.timeLimitPlaceholder}
          aria-describedby={joinDomIds(fieldIds.timeLimit.describedByIds)}
          onChange={(event) =>
            onDraftChange('timeLimitMinutes', event.currentTarget.value)
          }
        />
        <p
          id={fieldIds.timeLimit.helpId}
          className="text-xs leading-5 text-muted-foreground"
        >
          {assignmentPublishDialogCopy.timeLimitHelp}
        </p>
      </div>
      <div className="grid gap-2">
        <label htmlFor={fieldIds.closeAfter.inputId}>
          {assignmentPublishDialogCopy.closeAfterLabel}
        </label>
        <Input
          id={fieldIds.closeAfter.inputId}
          type="datetime-local"
          min={buildAssignmentPublishCloseAfterMinLocal()}
          value={draft.expiresAtLocal}
          aria-describedby={joinDomIds(fieldIds.closeAfter.describedByIds)}
          onChange={(event) =>
            onDraftChange('expiresAtLocal', event.currentTarget.value)
          }
        />
        <p
          id={fieldIds.closeAfter.helpId}
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
  const { controlBoundary } = view;
  const { controlIds } = controlBoundary;

  return (
    <section
      aria-describedby={joinDomIds(controlBoundary.previewRegionDescribedByIds)}
      aria-labelledby={joinDomIds(controlBoundary.previewRegionLabelledByIds)}
      className="grid gap-2"
    >
      <p id={controlIds.previewLabel} className="font-medium text-sm">
        {assignmentPublishDialogCopy.previewLabel}
      </p>
      <ActivityPublishPreviewContext
        context={view.preview.context}
        controlBoundary={controlBoundary}
      />
      <AssignmentSettingsSummary view={view.preview.settingsSummaryView} />
      <AssignmentPublishHandoff view={view.handoffView} />
      {view.dialogState.errorMessage ? (
        <p
          id={controlIds.validationAlert}
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
  controlBoundary,
}: {
  context: AssignmentPublishPreviewContextView;
  controlBoundary: AssignmentPublishControlBoundaryView;
}) {
  const { controlIds } = controlBoundary;

  return (
    <section
      aria-labelledby={controlIds.previewContextTitle}
      aria-describedby={joinDomIds(controlBoundary.previewRegionDescribedByIds)}
      className="grid gap-3 rounded-lg border bg-muted/20 p-3"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            id={controlIds.previewContextTitle}
            className="font-medium text-sm"
          >
            {context.title}
          </p>
          <p
            id={controlIds.previewContextDescription}
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
          aria-describedby={controlIds.previewContextStatusMessage}
        >
          {context.status.label}
        </span>
      </div>
      <p
        className={cn(
          'rounded-md border px-3 py-2 text-sm',
          getActivityPublishPreviewMessageClass(context.status.tone)
        )}
        id={controlIds.previewContextStatusMessage}
        role={context.status.tone === 'blocked' ? 'alert' : 'status'}
      >
        {context.status.message}
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {context.statItems.map((item) => (
          <AssignmentPublishPreviewStatItem
            controlIds={controlIds.statItemIds[item.id]}
            item={item}
            key={item.id}
          />
        ))}
      </div>
      <div className="border-t pt-3">
        <p id={controlIds.previewReviewLabel} className="font-medium text-xs">
          {context.reviewLabel}
        </p>
        <ul
          aria-labelledby={joinDomIds(
            controlBoundary.reviewChecklistLabelledByIds
          )}
          className="mt-2 grid gap-2"
        >
          {context.reviewItems.map((item) => (
            <AssignmentPublishPreviewReviewItem
              controlIds={controlIds.reviewItemIds[item.id]}
              item={item}
              key={item.id}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

function AssignmentPublishPreviewStatItem({
  controlIds,
  item,
}: {
  controlIds: AssignmentPublishStatControlIds;
  item: AssignmentPublishPreviewContextStatView;
}) {
  return (
    <fieldset
      aria-labelledby={`${controlIds.labelId} ${controlIds.valueId}`}
      className="rounded-md border bg-background p-2"
    >
      <legend id={controlIds.labelId} className="text-muted-foreground text-xs">
        {item.label}
      </legend>
      <div id={controlIds.valueId} className="mt-1 font-medium text-sm">
        <output>{item.value}</output>
      </div>
    </fieldset>
  );
}

function AssignmentPublishPreviewReviewItem({
  controlIds,
  item,
}: {
  controlIds: AssignmentPublishReviewControlIds;
  item: AssignmentPublishPreviewReviewItemView;
}) {
  return (
    <li
      aria-label={item.ariaLabel}
      aria-labelledby={joinDomIds(controlIds.labelledByIds)}
      aria-describedby={joinDomIds(controlIds.describedByIds)}
      className="rounded-md border bg-background px-3 py-2 text-xs"
    >
      <span className="sr-only">{item.ariaLabel}</span>
      <p id={controlIds.labelId} className="font-medium">
        {item.label}
      </p>
      <p
        id={controlIds.descriptionId}
        className="mt-1 leading-5 text-muted-foreground"
      >
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
  describedByIds,
  descriptionId,
  id,
  label,
  onCheckedChange,
}: {
  checked: boolean;
  description: string;
  describedByIds: string[];
  descriptionId: string;
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
        aria-describedby={joinDomIds(describedByIds)}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}

function joinDomIds(ids: string[]) {
  return ids.filter(Boolean).join(' ');
}
