import {
  ACTIVITY_AI_DRAFT_ITEM_COUNT_OPTIONS,
  type ActivityDraftResult,
} from '@/activities/ai-draft';
import {
  buildActivityAiDraftBoundaryHandoffView,
  type ActivityAiDraftBoundaryHandoffItemView,
  type ActivityAiDraftBoundaryHandoffView,
} from '@/activities/ai-draft-boundary';
import type { ActivityAiDraftFocus } from '@/activities/ai-draft-focus';
import type { ActivityTemplateType } from '@/activities/types';
import type {
  ActivityEditorAiDraftPanelView,
  ActivityEditorAiDraftSourceCapabilityCardView,
  ActivityEditorAiDraftSourceMaterialSafetyMetricView,
  ActivityEditorAiDraftSourceMaterialSafetyView,
} from '@/activities/editor';
import { ActivityDraftMetaSummary } from '@/components/activities/activity-draft-meta-summary';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { IconLoader2, IconPaperclip, IconSparkles } from '@tabler/icons-react';

const ACTIVITY_AI_SOURCE_READINESS_DESCRIPTION_ID =
  'activity-ai-source-readiness-description';
const ACTIVITY_AI_SOURCE_READINESS_TITLE_ID =
  'activity-ai-source-readiness-title';

type ActivityAiDraftPanelProps = {
  draftFocus: ActivityAiDraftFocus;
  draftItemCount: number;
  draftResult?: ActivityDraftResult;
  draftSourceText: string;
  isGeneratingDraft: boolean;
  onDraftFocusChange: (draftFocus: ActivityAiDraftFocus) => void;
  onDraftItemCountChange: (itemCount: number) => void;
  onDraftSourceTextChange: (sourceText: string) => void;
  onGenerateDraft: () => void;
  onSyncSourceMaterials: () => void;
  panelView: ActivityEditorAiDraftPanelView;
  templateType: ActivityTemplateType;
};

export function ActivityAiDraftPanel({
  draftFocus,
  draftItemCount,
  draftResult,
  draftSourceText,
  isGeneratingDraft,
  onDraftFocusChange,
  onDraftItemCountChange,
  onDraftSourceTextChange,
  onGenerateDraft,
  onSyncSourceMaterials,
  panelView,
  templateType,
}: ActivityAiDraftPanelProps) {
  const boundaryHandoffView = buildActivityAiDraftBoundaryHandoffView({
    draftFocus,
    draftItemCount,
    draftResult,
    panelView,
    templateType,
  });

  return (
    <div className="space-y-3">
      <ActivityAiDraftBoundaryHandoff view={boundaryHandoffView} />
      <div className="@container/ai-draft rounded-lg border border-primary/20 bg-primary/5 p-4">
        <div className="flex flex-col gap-4 @3xl/ai-draft:flex-row @3xl/ai-draft:items-end">
          <ActivityAiDraftSourceControls
            draftSourceText={draftSourceText}
            onDraftSourceTextChange={onDraftSourceTextChange}
            onSyncSourceMaterials={onSyncSourceMaterials}
            panelView={panelView}
          />
          <div className="grid gap-3 @sm/ai-draft:grid-cols-[minmax(12rem,1fr)_8rem] @3xl/ai-draft:w-[28rem]">
            <ActivityAiDraftFocusSelect
              draftFocus={draftFocus}
              onDraftFocusChange={onDraftFocusChange}
              panelView={panelView}
            />
            <ActivityAiDraftItemCountSelect
              draftItemCount={draftItemCount}
              onDraftItemCountChange={onDraftItemCountChange}
              panelView={panelView}
            />
            <ActivityAiDraftGenerateButton
              isGeneratingDraft={isGeneratingDraft}
              onGenerateDraft={onGenerateDraft}
              panelView={panelView}
            />
          </div>
        </div>
      </div>

      {draftResult ? (
        <ActivityDraftMetaSummary
          result={draftResult}
          sourceMaterialNoteViews={panelView.sourceMaterialNoteViews}
        />
      ) : null}
    </div>
  );
}

function ActivityAiDraftBoundaryHandoff({
  view,
}: {
  view: ActivityAiDraftBoundaryHandoffView;
}) {
  const titleId = 'activity-ai-draft-boundary-handoff-title';
  const descriptionId = 'activity-ai-draft-boundary-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="activity-ai-draft-boundary"
    >
      <h2 id={titleId}>{view.title}</h2>
      <p id={descriptionId}>{view.description}</p>
      <dl>
        {view.itemViews.map((itemView) => (
          <ActivityAiDraftBoundaryHandoffItem
            itemView={itemView}
            key={itemView.id}
          />
        ))}
      </dl>
    </section>
  );
}

function ActivityAiDraftBoundaryHandoffItem({
  itemView,
}: {
  itemView: ActivityAiDraftBoundaryHandoffItemView;
}) {
  const labelId = `activity-ai-draft-boundary-handoff-${itemView.id}-label`;
  const valueId = `activity-ai-draft-boundary-handoff-${itemView.id}-value`;
  const descriptionId = `activity-ai-draft-boundary-handoff-${itemView.id}-description`;

  return (
    <div data-handoff-item={itemView.id}>
      <dt id={labelId}>{itemView.label}</dt>
      <dd>
        <output
          aria-describedby={descriptionId}
          aria-label={itemView.ariaLabel}
          aria-labelledby={`${labelId} ${valueId}`}
          id={valueId}
        >
          {itemView.value}
        </output>
        <span id={descriptionId}>{itemView.description}</span>
      </dd>
    </div>
  );
}

function ActivityAiDraftSourceControls({
  draftSourceText,
  onDraftSourceTextChange,
  onSyncSourceMaterials,
  panelView,
}: {
  draftSourceText: string;
  onDraftSourceTextChange: (sourceText: string) => void;
  onSyncSourceMaterials: () => void;
  panelView: ActivityEditorAiDraftPanelView;
}) {
  const syncMaterialsHelpTextId = 'activity-ai-sync-materials-help';
  const safeSourceDescriptionId = 'activity-ai-safe-source-description';
  const sourceMaterialSafetyTitleId =
    'activity-ai-source-material-safety-title';
  const sourceMaterialSafetyDescriptionId =
    'activity-ai-source-material-safety-description';
  const sourceCapabilityTitleId = 'activity-ai-source-capability-title';
  const sourceMaterialNotesLabelId = 'activity-ai-source-material-notes-label';
  const sourceDescriptionIds = joinDomIds([
    safeSourceDescriptionId,
    ACTIVITY_AI_SOURCE_READINESS_DESCRIPTION_ID,
    panelView.sourceMaterialSafetyView.hasInput
      ? sourceMaterialSafetyDescriptionId
      : undefined,
    panelView.sourceCapabilityViews.length > 0
      ? sourceCapabilityTitleId
      : undefined,
    panelView.sourceMaterialNoteViews.length > 0 &&
    panelView.sourceMaterialSummaryLabel
      ? sourceMaterialNotesLabelId
      : undefined,
  ]);

  return (
    <div className="min-w-0 flex-1 space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="rounded-md bg-background">
          <IconSparkles className="size-3.5" />
          {panelView.badgeLabel}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {panelView.reviewNote}
        </span>
      </div>
      <p
        id={safeSourceDescriptionId}
        className="text-xs leading-5 text-muted-foreground"
      >
        {panelView.safeSourceDescription}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor="activity-ai-source" className="font-medium text-sm">
          {panelView.sourceTextLabel}
        </label>
        <div className="flex flex-col items-start gap-1 sm:items-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="bg-background"
            onClick={onSyncSourceMaterials}
            disabled={!panelView.canSyncDraftSourceMaterials}
            aria-describedby={syncMaterialsHelpTextId}
          >
            <IconPaperclip className="size-3.5" />
            {panelView.syncMaterialsLabel}
          </Button>
          <span
            id={syncMaterialsHelpTextId}
            className="text-xs text-muted-foreground"
          >
            {panelView.syncMaterialsHelpText}
          </span>
        </div>
      </div>
      <Textarea
        id="activity-ai-source"
        className="max-h-52"
        value={draftSourceText}
        onChange={(event) => onDraftSourceTextChange(event.currentTarget.value)}
        rows={3}
        placeholder={panelView.sourcePlaceholder}
        aria-describedby={sourceDescriptionIds}
      />
      <ActivityAiDraftSourceReadiness
        descriptionId={ACTIVITY_AI_SOURCE_READINESS_DESCRIPTION_ID}
        panelView={panelView}
        titleId={ACTIVITY_AI_SOURCE_READINESS_TITLE_ID}
      />
      {panelView.sourceMaterialSafetyView.hasInput ? (
        <ActivityAiDraftSourceMaterialSafety
          descriptionId={sourceMaterialSafetyDescriptionId}
          safetyView={panelView.sourceMaterialSafetyView}
          titleId={sourceMaterialSafetyTitleId}
        />
      ) : null}
      {panelView.sourceCapabilityViews.length > 0 ? (
        <ActivityAiDraftSourceCapabilities
          panelView={panelView}
          titleId={sourceCapabilityTitleId}
        />
      ) : null}
      {panelView.sourceMaterialNoteViews.length > 0 ? (
        <section
          aria-label={
            panelView.sourceMaterialSummaryLabel
              ? undefined
              : panelView.sourceTextLabel
          }
          aria-labelledby={
            panelView.sourceMaterialSummaryLabel
              ? sourceMaterialNotesLabelId
              : undefined
          }
          className="space-y-2 rounded-md border bg-background p-3"
        >
          {panelView.sourceMaterialSummaryLabel ? (
            <p id={sourceMaterialNotesLabelId} className="font-medium text-xs">
              {panelView.sourceMaterialSummaryLabel}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-1.5">
            {panelView.sourceMaterialNoteViews.map((noteView) => (
              <Badge
                key={noteView.key}
                variant="outline"
                className="max-w-full rounded-md"
              >
                <span className="truncate">{noteView.displayText}</span>
              </Badge>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function ActivityAiDraftSourceMaterialSafety({
  descriptionId,
  safetyView,
  titleId,
}: {
  descriptionId: string;
  safetyView: ActivityEditorAiDraftSourceMaterialSafetyView;
  titleId: string;
}) {
  return (
    <section
      aria-label={safetyView.ariaLabel}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="rounded-md border bg-background p-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p id={titleId} className="font-medium text-xs">
          {safetyView.title}
        </p>
        {safetyView.hasOmitted ? (
          <Badge variant="outline" className="rounded-md">
            {
              safetyView.metricViews.find(
                (metricView) => metricView.id === 'omitted'
              )?.value
            }
          </Badge>
        ) : null}
      </div>
      <p
        id={descriptionId}
        className="mt-1 text-muted-foreground text-xs leading-5"
      >
        {safetyView.description}
      </p>
      <dl className="mt-2 grid gap-2 sm:grid-cols-2">
        {safetyView.metricViews.map((metricView) => (
          <ActivityAiDraftSourceMaterialSafetyMetric
            key={metricView.id}
            metricView={metricView}
          />
        ))}
      </dl>
    </section>
  );
}

function ActivityAiDraftSourceMaterialSafetyMetric({
  metricView,
}: {
  metricView: ActivityEditorAiDraftSourceMaterialSafetyMetricView;
}) {
  return (
    <div className="rounded-md border bg-muted/20 p-2">
      <dt className="text-muted-foreground text-xs leading-5">
        {metricView.label}
      </dt>
      <dd className="mt-1 font-medium text-xs leading-5">
        <output aria-label={metricView.ariaLabel}>{metricView.value}</output>
      </dd>
      <dd className="mt-1 text-muted-foreground text-xs leading-5">
        {metricView.description}
      </dd>
    </div>
  );
}

function ActivityAiDraftSourceCapabilities({
  panelView,
  titleId,
}: {
  panelView: ActivityEditorAiDraftPanelView;
  titleId: string;
}) {
  return (
    <section
      aria-labelledby={titleId}
      className="rounded-md border bg-background p-3"
    >
      <p id={titleId} className="font-medium text-xs">
        {panelView.sourceCapabilityTitle}
      </p>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {panelView.sourceCapabilityViews.map((capability) => (
          <ActivityAiDraftSourceCapabilityBadge
            capability={capability}
            key={capability.capability}
          />
        ))}
      </div>
    </section>
  );
}

function ActivityAiDraftSourceCapabilityBadge({
  capability,
}: {
  capability: ActivityEditorAiDraftSourceCapabilityCardView;
}) {
  const titleId = `activity-ai-source-capability-${capability.capability}-title`;
  const valueId = `activity-ai-source-capability-${capability.capability}-value`;
  const descriptionId = `activity-ai-source-capability-${capability.capability}-description`;

  return (
    <section
      aria-labelledby={`${titleId} ${valueId}`}
      aria-describedby={descriptionId}
      className="rounded-md border bg-muted/20 p-2"
    >
      <div className="flex items-center justify-between gap-2">
        <span id={titleId} className="font-medium text-xs">
          {capability.label}
        </span>
        <Badge id={valueId} variant="outline" className="rounded-md">
          {capability.value}
        </Badge>
      </div>
      <p
        id={descriptionId}
        className="mt-1 text-muted-foreground text-xs leading-5"
      >
        {capability.description}
      </p>
    </section>
  );
}

function ActivityAiDraftSourceReadiness({
  descriptionId,
  panelView,
  titleId,
}: {
  descriptionId: string;
  panelView: ActivityEditorAiDraftPanelView;
  titleId: string;
}) {
  return (
    <section
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="rounded-md border bg-background p-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p id={titleId} className="font-medium text-xs">
          {panelView.sourceReadiness.title}
        </p>
        <Badge
          variant={
            panelView.sourceReadiness.hasWarnings ? 'outline' : 'secondary'
          }
          className="rounded-md"
        >
          {panelView.sourceReadiness.characterCountLabel}
        </Badge>
      </div>
      <p
        id={descriptionId}
        className="mt-1 text-muted-foreground text-xs leading-5"
      >
        {panelView.sourceReadiness.description}
      </p>
    </section>
  );
}

function ActivityAiDraftItemCountSelect({
  draftItemCount,
  onDraftItemCountChange,
  panelView,
}: {
  draftItemCount: number;
  onDraftItemCountChange: (itemCount: number) => void;
  panelView: ActivityEditorAiDraftPanelView;
}) {
  const itemCountDescriptionId = 'activity-ai-item-count-description';

  return (
    <div className="space-y-2">
      <label htmlFor="activity-ai-item-count" className="font-medium text-sm">
        {panelView.itemCountLabel}
      </label>
      <NativeSelect
        id="activity-ai-item-count"
        value={String(draftItemCount)}
        aria-describedby={itemCountDescriptionId}
        onChange={(event) =>
          onDraftItemCountChange(Number(event.currentTarget.value))
        }
        className="w-full"
      >
        {ACTIVITY_AI_DRAFT_ITEM_COUNT_OPTIONS.map((count) => (
          <NativeSelectOption key={count} value={String(count)}>
            {count}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <p id={itemCountDescriptionId} className="text-xs text-muted-foreground">
        {panelView.itemCountDescription}
      </p>
    </div>
  );
}

function ActivityAiDraftFocusSelect({
  draftFocus,
  onDraftFocusChange,
  panelView,
}: {
  draftFocus: ActivityAiDraftFocus;
  onDraftFocusChange: (draftFocus: ActivityAiDraftFocus) => void;
  panelView: ActivityEditorAiDraftPanelView;
}) {
  const selectedFocusOption =
    panelView.focusOptions.find((option) => option.value === draftFocus) ??
    panelView.focusOptions[0];
  const focusDescriptionId = 'activity-ai-focus-description';

  return (
    <div className="space-y-2">
      <label htmlFor="activity-ai-focus" className="font-medium text-sm">
        {panelView.focusLabel}
      </label>
      <NativeSelect
        id="activity-ai-focus"
        value={draftFocus}
        aria-describedby={focusDescriptionId}
        onChange={(event) =>
          onDraftFocusChange(event.currentTarget.value as ActivityAiDraftFocus)
        }
        className="w-full"
      >
        {panelView.focusOptions.map((option) => (
          <NativeSelectOption key={option.value} value={option.value}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      {selectedFocusOption ? (
        <p id={focusDescriptionId} className="text-xs text-muted-foreground">
          {selectedFocusOption.description}
        </p>
      ) : null}
    </div>
  );
}

function ActivityAiDraftGenerateButton({
  isGeneratingDraft,
  onGenerateDraft,
  panelView,
}: {
  isGeneratingDraft: boolean;
  onGenerateDraft: () => void;
  panelView: ActivityEditorAiDraftPanelView;
}) {
  const generationDisabledReasonId = 'activity-ai-generate-disabled-reason';
  const generationDescriptionIds = joinDomIds([
    ACTIVITY_AI_SOURCE_READINESS_DESCRIPTION_ID,
    panelView.generationDisabledReason ? generationDisabledReasonId : undefined,
  ]);

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={onGenerateDraft}
        disabled={!panelView.canGenerateDraft}
        aria-describedby={generationDescriptionIds}
        className="self-end sm:col-span-2"
      >
        {isGeneratingDraft ? (
          <IconLoader2 className="size-4 animate-spin" />
        ) : (
          <IconSparkles className="size-4" />
        )}
        {panelView.generateButtonLabel}
      </Button>
      {panelView.generationDisabledReason ? (
        <p
          id={generationDisabledReasonId}
          className="sm:col-span-2 text-xs text-muted-foreground"
        >
          {panelView.generationDisabledReason}
        </p>
      ) : null}
    </>
  );
}

function joinDomIds(ids: Array<string | undefined>) {
  return ids.filter((id): id is string => Boolean(id)).join(' ');
}
