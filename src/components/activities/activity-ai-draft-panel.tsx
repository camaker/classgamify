import {
  ACTIVITY_AI_DRAFT_ITEM_COUNT_OPTIONS,
  type ActivityDraftResult,
} from '@/activities/ai-draft';
import type { ActivityAiDraftFocus } from '@/activities/ai-draft-focus';
import type {
  ActivityEditorAiDraftPanelView,
  ActivityEditorAiDraftSourceCapabilityCardView,
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
}: ActivityAiDraftPanelProps) {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <ActivityAiDraftSourceControls
            draftSourceText={draftSourceText}
            onDraftSourceTextChange={onDraftSourceTextChange}
            onSyncSourceMaterials={onSyncSourceMaterials}
            panelView={panelView}
          />
          <div className="grid gap-3 sm:grid-cols-[minmax(12rem,1fr)_8rem] lg:w-[28rem]">
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
      <p className="text-xs leading-5 text-muted-foreground">
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
          >
            <IconPaperclip className="size-3.5" />
            {panelView.syncMaterialsLabel}
          </Button>
          <span className="text-xs text-muted-foreground">
            {panelView.syncMaterialsHelpText}
          </span>
        </div>
      </div>
      <Textarea
        id="activity-ai-source"
        value={draftSourceText}
        onChange={(event) => onDraftSourceTextChange(event.currentTarget.value)}
        rows={3}
        placeholder={panelView.sourcePlaceholder}
      />
      <ActivityAiDraftSourceReadiness panelView={panelView} />
      {panelView.sourceCapabilityViews.length > 0 ? (
        <ActivityAiDraftSourceCapabilities panelView={panelView} />
      ) : null}
      {panelView.sourceMaterialNoteViews.length > 0 ? (
        <div className="space-y-2 rounded-md border bg-background p-3">
          {panelView.sourceMaterialSummaryLabel ? (
            <p className="font-medium text-xs">
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
        </div>
      ) : null}
    </div>
  );
}

function ActivityAiDraftSourceCapabilities({
  panelView,
}: {
  panelView: ActivityEditorAiDraftPanelView;
}) {
  return (
    <div className="rounded-md border bg-background p-3">
      <p className="font-medium text-xs">{panelView.sourceCapabilityTitle}</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {panelView.sourceCapabilityViews.map((capability) => (
          <ActivityAiDraftSourceCapabilityBadge
            capability={capability}
            key={capability.capability}
          />
        ))}
      </div>
    </div>
  );
}

function ActivityAiDraftSourceCapabilityBadge({
  capability,
}: {
  capability: ActivityEditorAiDraftSourceCapabilityCardView;
}) {
  return (
    <div className="rounded-md border bg-muted/20 p-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-xs">{capability.label}</span>
        <Badge variant="outline" className="rounded-md">
          {capability.value}
        </Badge>
      </div>
      <p className="mt-1 text-muted-foreground text-xs leading-5">
        {capability.description}
      </p>
    </div>
  );
}

function ActivityAiDraftSourceReadiness({
  panelView,
}: {
  panelView: ActivityEditorAiDraftPanelView;
}) {
  return (
    <div className="rounded-md border bg-background p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium text-xs">{panelView.sourceReadiness.title}</p>
        <Badge
          variant={
            panelView.sourceReadiness.hasWarnings ? 'outline' : 'secondary'
          }
          className="rounded-md"
        >
          {panelView.sourceReadiness.characterCountLabel}
        </Badge>
      </div>
      <p className="mt-1 text-muted-foreground text-xs leading-5">
        {panelView.sourceReadiness.description}
      </p>
    </div>
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
  return (
    <div className="space-y-2">
      <label htmlFor="activity-ai-item-count" className="font-medium text-sm">
        {panelView.itemCountLabel}
      </label>
      <NativeSelect
        id="activity-ai-item-count"
        value={String(draftItemCount)}
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

  return (
    <div className="space-y-2">
      <label htmlFor="activity-ai-focus" className="font-medium text-sm">
        {panelView.focusLabel}
      </label>
      <NativeSelect
        id="activity-ai-focus"
        value={draftFocus}
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
        <p className="text-xs text-muted-foreground">
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
  return (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={onGenerateDraft}
        disabled={!panelView.canGenerateDraft}
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
        <p className="sm:col-span-2 text-xs text-muted-foreground">
          {panelView.generationDisabledReason}
        </p>
      ) : null}
    </>
  );
}
