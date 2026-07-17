import type {
  ActivityAiRemixAssistHandoffItemView,
  ActivityAiRemixAssistHandoffView,
} from '@/activities/ai-remix-assist';
import type {
  ActivityLibraryCardActionState,
  ActivityLibraryCardTemplateType,
  ActivityLibraryCompatibilityView,
  ActivityLibraryLockedTemplateDiagnosticView,
  ActivityLibraryReadyTemplateOptionView,
  ActivityLibraryRemixActionOptionView,
} from '@/activities/library-view';
import { activityLibraryCardCopy } from '@/activities/library-view';
import type {
  ActivityTemplateRemixHandoffItemView,
  ActivityTemplateRemixHandoffView,
} from '@/activities/template-remix';
import { ActivityLibraryActionStatusBadge } from '@/components/activities/activity-library-action-status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  IconLayoutGrid,
  IconShieldCheck,
  IconSwitchHorizontal,
} from '@tabler/icons-react';
import { useId } from 'react';

type ActivityLibraryCompatibilityPanelProps = {
  actionState: ActivityLibraryCardActionState;
  compatibility: ActivityLibraryCompatibilityView;
  isRemixing: boolean;
  label: string;
  onRemix: (targetTemplateType: ActivityLibraryCardTemplateType) => void;
};

export function ActivityLibraryCompatibilityPanel({
  actionState,
  compatibility,
  isRemixing,
  label,
  onRemix,
}: ActivityLibraryCompatibilityPanelProps) {
  const remixStatusDescriptionId = useId();

  return (
    <section aria-label={label} className="rounded-lg border bg-muted/30 p-3">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 text-sm font-medium">
          <IconLayoutGrid aria-hidden="true" className="size-4 text-primary" />
          {activityLibraryCardCopy.compatibleTemplatesLabel}
        </div>
        <ActivityLibraryActionStatusBadge
          descriptionId={remixStatusDescriptionId}
          view={compatibility.remixStatusView}
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {compatibility.readyTemplateOptions.map((option) => (
          <ActivityLibraryReadyTemplateBadge
            key={option.template}
            option={option}
          />
        ))}
      </div>
      {actionState.showRemixHint && compatibility.remixHint ? (
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          {compatibility.remixHint}
        </p>
      ) : null}
      {actionState.showRestoreRequiredMessage &&
      compatibility.restoreRequiredMessage ? (
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          {compatibility.restoreRequiredMessage}
        </p>
      ) : null}
      <ActivityLibraryTemplateRemixHandoff
        handoff={compatibility.remixHandoffView}
      />
      <ActivityLibraryAiRemixAssistHandoff
        handoff={compatibility.aiRemixAssistHandoffView}
      />
      {actionState.showRemixActions ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {compatibility.remixActionOptions.map((option) => (
            <ActivityLibraryRemixActionButton
              key={option.template}
              disabled={isRemixing}
              option={option}
              onClick={() => onRemix(option.template)}
            />
          ))}
        </div>
      ) : null}
      {compatibility.lockedTemplateDiagnostics.length ? (
        <div className="mt-3 grid gap-1.5">
          {compatibility.lockedTemplateDiagnostics.map((diagnostic) => (
            <ActivityLibraryLockedTemplateDiagnostic
              diagnostic={diagnostic}
              key={diagnostic.id}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ActivityLibraryTemplateRemixHandoff({
  handoff,
}: {
  handoff: ActivityTemplateRemixHandoffView;
}) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="activity-template-remix"
      data-handoff-scope={handoff.privacy.scope}
    >
      <div className="flex min-w-0 items-center gap-2 text-xs font-medium">
        <IconShieldCheck aria-hidden="true" className="size-4 text-primary" />
        <span id={titleId}>{handoff.title}</span>
      </div>
      <p
        id={descriptionId}
        className="mt-1 text-xs leading-5 text-muted-foreground"
      >
        {handoff.description}
      </p>
      <dl className="mt-3 grid gap-2 sm:grid-cols-2">
        {handoff.itemViews.map((item) => (
          <ActivityLibraryTemplateRemixHandoffItem item={item} key={item.id} />
        ))}
      </dl>
    </section>
  );
}

function ActivityLibraryTemplateRemixHandoffItem({
  item,
}: {
  item: ActivityTemplateRemixHandoffItemView;
}) {
  const labelId = `activity-template-remix-handoff-${item.id}-label`;
  const valueId = `activity-template-remix-handoff-${item.id}-value`;
  const descriptionId = `activity-template-remix-handoff-${item.id}-description`;

  return (
    <div className="min-w-0" data-handoff-item={item.id}>
      <dt
        className="text-[0.68rem] font-medium uppercase tracking-normal text-muted-foreground"
        id={labelId}
      >
        {item.label}
      </dt>
      <dd className="break-words text-xs font-medium text-foreground">
        <output
          aria-describedby={descriptionId}
          aria-label={item.ariaLabel}
          aria-labelledby={`${labelId} ${valueId}`}
          id={valueId}
        >
          {item.value}
        </output>
      </dd>
      <p
        className="mt-0.5 text-[0.68rem] leading-4 text-muted-foreground"
        id={descriptionId}
      >
        {item.description}
      </p>
    </div>
  );
}

function ActivityLibraryAiRemixAssistHandoff({
  handoff,
}: {
  handoff: ActivityAiRemixAssistHandoffView;
}) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="activity-ai-remix-assist"
      data-handoff-scope={handoff.privacy.scope}
    >
      <h3 id={titleId}>{handoff.title}</h3>
      <p id={descriptionId}>{handoff.description}</p>
      <dl>
        {handoff.itemViews.map((item) => (
          <ActivityLibraryAiRemixAssistHandoffItem item={item} key={item.id} />
        ))}
      </dl>
    </section>
  );
}

function ActivityLibraryAiRemixAssistHandoffItem({
  item,
}: {
  item: ActivityAiRemixAssistHandoffItemView;
}) {
  const labelId = `activity-ai-remix-assist-handoff-${item.id}-label`;
  const valueId = `activity-ai-remix-assist-handoff-${item.id}-value`;
  const descriptionId = `activity-ai-remix-assist-handoff-${item.id}-description`;

  return (
    <div data-handoff-item={item.id}>
      <dt id={labelId}>{item.label}</dt>
      <dd>
        <output
          aria-describedby={descriptionId}
          aria-label={item.ariaLabel}
          aria-labelledby={`${labelId} ${valueId}`}
          id={valueId}
        >
          {item.value}
        </output>
        <span id={descriptionId}>{item.description}</span>
      </dd>
    </div>
  );
}

function ActivityLibraryReadyTemplateBadge({
  option,
}: {
  option: ActivityLibraryReadyTemplateOptionView;
}) {
  return (
    <Badge
      variant={option.isCurrent ? 'secondary' : 'outline'}
      className="rounded-md"
    >
      {option.shortName}
    </Badge>
  );
}

function ActivityLibraryRemixActionButton({
  disabled,
  onClick,
  option,
}: {
  disabled: boolean;
  onClick: () => void;
  option: ActivityLibraryRemixActionOptionView;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="bg-background"
      disabled={disabled}
      onClick={onClick}
    >
      <IconSwitchHorizontal aria-hidden="true" className="size-4" />
      {option.actionLabel}
    </Button>
  );
}

function ActivityLibraryLockedTemplateDiagnostic({
  diagnostic,
}: {
  diagnostic: ActivityLibraryLockedTemplateDiagnosticView;
}) {
  return (
    <p className="text-xs leading-5 text-muted-foreground">
      {diagnostic.diagnosis}
    </p>
  );
}
