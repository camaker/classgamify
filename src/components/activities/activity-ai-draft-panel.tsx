import {
  ACTIVITY_AI_DRAFT_ITEM_COUNT_OPTIONS,
  type ActivityDraftResult,
} from '@/activities/ai-draft';
import type { buildActivityEditorAiDraftPanelView } from '@/activities/editor';
import { ActivityDraftMetaSummary } from '@/components/activities/activity-draft-meta-summary';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { IconLoader2, IconPaperclip, IconSparkles } from '@tabler/icons-react';

type ActivityAiDraftPanelView = ReturnType<
  typeof buildActivityEditorAiDraftPanelView
>;

type ActivityAiDraftPanelProps = {
  draftItemCount: number;
  draftResult?: ActivityDraftResult;
  draftSourceText: string;
  isGeneratingDraft: boolean;
  onDraftItemCountChange: (itemCount: number) => void;
  onDraftSourceTextChange: (sourceText: string) => void;
  onGenerateDraft: () => void;
  onSyncSourceMaterials: () => void;
  panelView: ActivityAiDraftPanelView;
};

export function ActivityAiDraftPanel({
  draftItemCount,
  draftResult,
  draftSourceText,
  isGeneratingDraft,
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
          <div className="grid gap-3 sm:grid-cols-[8rem_auto] lg:w-auto lg:grid-cols-[8rem_auto]">
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

      {draftResult ? <ActivityDraftMetaSummary result={draftResult} /> : null}
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
  panelView: ActivityAiDraftPanelView;
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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor="activity-ai-source" className="font-medium text-sm">
          {panelView.sourceTextLabel}
        </label>
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
      </div>
      <Textarea
        id="activity-ai-source"
        value={draftSourceText}
        onChange={(event) => onDraftSourceTextChange(event.currentTarget.value)}
        rows={3}
        placeholder={panelView.sourcePlaceholder}
      />
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
  panelView: ActivityAiDraftPanelView;
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

function ActivityAiDraftGenerateButton({
  isGeneratingDraft,
  onGenerateDraft,
  panelView,
}: {
  isGeneratingDraft: boolean;
  onGenerateDraft: () => void;
  panelView: ActivityAiDraftPanelView;
}) {
  return (
    <Button
      type="button"
      variant="secondary"
      onClick={onGenerateDraft}
      disabled={!panelView.canGenerateDraft}
      className="self-end"
    >
      {isGeneratingDraft ? (
        <IconLoader2 className="size-4 animate-spin" />
      ) : (
        <IconSparkles className="size-4" />
      )}
      {panelView.generateButtonLabel}
    </Button>
  );
}
