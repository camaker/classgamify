import type { ActivityDraftResult } from '@/activities/ai-draft';
import type { ActivitySourceMaterialDraftNoteView } from '@/activities/draft-source';
import { buildActivityDraftMetaSummaryView } from '@/activities/draft-meta';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type ActivityDraftMetaSummaryProps = {
  result: ActivityDraftResult;
  sourceMaterialNoteViews?: ActivitySourceMaterialDraftNoteView[];
};

type ActivityDraftMetaSummaryView = ReturnType<
  typeof buildActivityDraftMetaSummaryView
>;

export function ActivityDraftMetaSummary({
  result,
  sourceMaterialNoteViews,
}: ActivityDraftMetaSummaryProps) {
  const summaryView = buildActivityDraftMetaSummaryView({
    draftFocus: result.draftFocus,
    meta: result.meta,
    model: result.model,
    notice: result.notice,
    provider: result.provider,
    sourceMaterialNoteViews,
  });

  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-sm">{summaryView.title}</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {summaryView.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="rounded-md">
            {summaryView.readyTemplateLabel}
          </Badge>
          <Badge variant="outline" className="rounded-md">
            {summaryView.lockedTemplateLabel}
          </Badge>
          <Badge variant="outline" className="rounded-md">
            {summaryView.providerLabel}
          </Badge>
        </div>
      </div>
      <div className="mt-3 rounded-lg border bg-background p-3 text-xs leading-5 text-muted-foreground">
        <p className="font-medium">{summaryView.modelLineText}</p>
        <p className="mt-1 font-medium">{summaryView.draftFocusLineText}</p>
        <p className="mt-1">{summaryView.draftFocusDescription}</p>
        <p className="mt-1">{summaryView.providerDescription}</p>
        {summaryView.noticeLineText ? (
          <p className="mt-1 font-medium">{summaryView.noticeLineText}</p>
        ) : null}
      </div>
      <div className="mt-3 rounded-lg border bg-background p-3 text-xs leading-5 text-muted-foreground">
        <p className="font-medium text-foreground">
          {summaryView.appliedLabel}
        </p>
        <p className="mt-1">{summaryView.appliedDescription}</p>
        <p className="mt-2 font-medium text-foreground">
          {summaryView.nextStepLabel}
        </p>
        <p className="mt-1">{summaryView.nextStepText}</p>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-5">
        {summaryView.coverageStats.map((stat) => (
          <ActivityDraftCoverageStat key={stat.label} stat={stat} />
        ))}
      </div>
      <div className="mt-4 rounded-lg border bg-background p-3">
        <p className="font-medium text-sm">
          {summaryView.suggestedTemplatesTitle}
        </p>
        {summaryView.suggestedTemplateOptions.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {summaryView.suggestedTemplateOptions.map((option) => (
              <Badge
                key={option.template}
                variant="outline"
                className="rounded-md"
              >
                {option.shortName}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-muted-foreground text-xs leading-5">
            {summaryView.suggestedTemplatesEmptyText}
          </p>
        )}
      </div>
      {summaryView.questionChoiceReadiness ? (
        <ActivityDraftQuestionChoiceReadiness
          readiness={summaryView.questionChoiceReadiness}
        />
      ) : null}
      {summaryView.sourceMaterialNoteViews.length > 0 ? (
        <div className="mt-4 rounded-lg border bg-background p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium text-sm">
              {summaryView.sourceMaterialTitle}
            </p>
            {summaryView.sourceMaterialCountLabel ? (
              <Badge variant="outline" className="rounded-md">
                {summaryView.sourceMaterialCountLabel}
              </Badge>
            ) : null}
          </div>
          <p className="mt-1 text-muted-foreground text-xs leading-5">
            {summaryView.sourceMaterialDescription}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {summaryView.sourceMaterialNoteViews.map((noteView) => (
              <Badge
                key={noteView.displayText}
                variant="outline"
                className="max-w-full rounded-md"
              >
                <span className="truncate">{noteView.displayText}</span>
              </Badge>
            ))}
          </div>
        </div>
      ) : null}
      {summaryView.sourceMaterialCapabilityViews.length > 0 ? (
        <ActivityDraftSourceMaterialCapabilities
          capabilities={summaryView.sourceMaterialCapabilityViews}
          description={summaryView.sourceMaterialCapabilityDescription}
          title={summaryView.sourceMaterialCapabilityTitle}
        />
      ) : null}
      <p className="mt-4 font-medium text-sm">
        {summaryView.readyTemplatesTitle}
      </p>
      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {summaryView.templateReadinessOptions
          .filter((option) => option.isReady)
          .map((option) => (
            <ActivityDraftTemplateReadinessOption
              key={option.template}
              option={option}
            />
          ))}
      </div>
      {summaryView.lockedTemplateOptions.length > 0 ? (
        <>
          <p className="mt-4 font-medium text-sm">
            {summaryView.lockedTemplatesTitle}
          </p>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            {summaryView.lockedTemplateOptions.map((option) => (
              <ActivityDraftTemplateReadinessOption
                key={option.template}
                option={option}
              />
            ))}
          </div>
        </>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {summaryView.reviewChecklistStatusViews.map((statusView) => (
          <Badge
            key={statusView.id}
            variant={statusView.id === 'ready' ? 'secondary' : 'outline'}
            className="rounded-md"
          >
            {statusView.label}
          </Badge>
        ))}
      </div>
      <div className="mt-2 grid gap-2">
        {summaryView.reviewChecklistItems.map((itemView) => (
          <ActivityDraftReviewChecklistItem
            itemView={itemView}
            key={`${itemView.id}-${itemView.label}`}
          />
        ))}
      </div>
    </div>
  );
}

function ActivityDraftSourceMaterialCapabilities({
  capabilities,
  description,
  title,
}: {
  capabilities: ActivityDraftMetaSummaryView['sourceMaterialCapabilityViews'];
  description: string;
  title: string;
}) {
  return (
    <div className="mt-4 rounded-lg border bg-background p-3">
      <p className="font-medium text-sm">{title}</p>
      <p className="mt-1 text-muted-foreground text-xs leading-5">
        {description}
      </p>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {capabilities.map((capability) => (
          <ActivityDraftSourceMaterialCapabilityBadge
            capability={capability}
            key={capability.capability}
          />
        ))}
      </div>
    </div>
  );
}

function ActivityDraftSourceMaterialCapabilityBadge({
  capability,
}: {
  capability: ActivityDraftMetaSummaryView['sourceMaterialCapabilityViews'][number];
}) {
  return (
    <div className="rounded-md border bg-muted/20 p-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium text-xs leading-5">{capability.label}</p>
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

function ActivityDraftReviewChecklistItem({
  itemView,
}: {
  itemView: ActivityDraftMetaSummaryView['reviewChecklistItems'][number];
}) {
  return (
    <div
      className={cn(
        'rounded-md border bg-background p-2.5',
        itemView.priority === 'high' && 'border-primary/25 bg-primary/5'
      )}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <p className="font-medium text-xs leading-5">{itemView.label}</p>
        <Badge
          variant={itemView.status === 'ready' ? 'secondary' : 'outline'}
          className="w-fit rounded-md"
        >
          {itemView.statusLabel}
        </Badge>
      </div>
      <p className="mt-1 text-muted-foreground text-xs leading-5">
        {itemView.description}
      </p>
    </div>
  );
}

function ActivityDraftQuestionChoiceReadiness({
  readiness,
}: {
  readiness: NonNullable<
    ActivityDraftMetaSummaryView['questionChoiceReadiness']
  >;
}) {
  return (
    <div className="mt-4 rounded-lg border bg-background p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium text-sm">{readiness.title}</p>
        <Badge variant="outline" className="rounded-md">
          {readiness.summaryLabel}
        </Badge>
      </div>
      <p className="mt-1 text-muted-foreground text-xs leading-5">
        {readiness.description}
      </p>
      <div className="mt-2 grid gap-2">
        {readiness.itemViews.map((itemView) => (
          <ActivityDraftQuestionChoiceReadinessItem
            itemView={itemView}
            key={itemView.key}
          />
        ))}
      </div>
    </div>
  );
}

function ActivityDraftQuestionChoiceReadinessItem({
  itemView,
}: {
  itemView: NonNullable<
    ActivityDraftMetaSummaryView['questionChoiceReadiness']
  >['itemViews'][number];
}) {
  return (
    <div className="rounded-md border bg-muted/20 p-2.5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <p className="font-medium text-xs leading-5">{itemView.promptLabel}</p>
        <Badge
          variant="outline"
          className={cn(
            'w-fit shrink-0 rounded-md',
            itemView.status === 'explicit-ready' &&
              'border-emerald-200 bg-emerald-50 text-emerald-700',
            itemView.status === 'completed-locally' &&
              'border-blue-200 bg-blue-50 text-blue-700',
            itemView.status === 'needs-candidates' &&
              'border-amber-200 bg-amber-50 text-amber-800'
          )}
        >
          {itemView.statusLabel}
        </Badge>
      </div>
      <p className="mt-1 text-muted-foreground text-xs leading-5">
        {itemView.detail}
      </p>
    </div>
  );
}

function ActivityDraftCoverageStat({
  stat,
}: {
  stat: ActivityDraftMetaSummaryView['coverageStats'][number];
}) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="text-lg font-semibold">{stat.value}</p>
      <p className="text-xs text-muted-foreground">{stat.label}</p>
    </div>
  );
}

function ActivityDraftTemplateReadinessOption({
  option,
}: {
  option: ActivityDraftMetaSummaryView['templateReadinessOptions'][number];
}) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-background p-3',
        option.isReady && 'border-primary/25 bg-primary/5'
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant={option.isReady ? 'secondary' : 'outline'}
          className="rounded-md"
        >
          {option.shortName}
        </Badge>
        {option.selectedLabel ? (
          <Badge variant="outline" className="rounded-md">
            {option.selectedLabel}
          </Badge>
        ) : null}
        <span className="text-xs text-muted-foreground">
          {option.readinessLabel}
        </span>
        {option.missingRequirementLabel ? (
          <Badge variant="outline" className="rounded-md">
            {option.missingRequirementLabel}
          </Badge>
        ) : null}
      </div>
      {option.diagnosis ? (
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          {option.diagnosis}
        </p>
      ) : null}
    </div>
  );
}
