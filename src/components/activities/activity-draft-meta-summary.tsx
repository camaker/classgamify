import type { ActivityDraftResult } from '@/activities/ai-draft';
import type { ActivitySourceMaterialDraftNoteView } from '@/activities/draft-source';
import {
  buildActivityDraftMetaSummaryView,
  type ActivityDraftMetaHandoffItemView,
  type ActivityDraftMetaHandoffView,
  type ActivityDraftMetaReviewGateMetricView,
  type ActivityDraftMetaReviewGateView,
  type ActivityDraftMetaSummaryCoverageStatView,
  type ActivityDraftMetaSummaryQuestionChoiceReadinessItemView,
  type ActivityDraftMetaSummaryQuestionChoiceReadinessView,
  type ActivityDraftMetaSummaryReadinessOption,
  type ActivityDraftMetaSummarySourceMaterialCapabilityView,
  type ActivityDraftMetaSummarySourceMaterialSafetyMetricView,
  type ActivityDraftMetaSummarySourceMaterialSafetyView,
  type ActivityDraftMetaSummaryTrustItemView,
  type ActivityDraftMetaSummaryTrustView,
  type ActivityDraftReviewChecklistItemView,
} from '@/activities/draft-meta';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type ActivityDraftMetaSummaryProps = {
  result: ActivityDraftResult;
  sourceMaterialNoteViews?: ActivitySourceMaterialDraftNoteView[];
};

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
      <ActivityDraftTrustPanel trustView={summaryView.trustView} />
      <ActivityDraftReviewGate reviewGateView={summaryView.reviewGateView} />
      <ActivityDraftMetaHandoff handoffView={summaryView.handoffView} />
      <div className="mt-3 rounded-lg border bg-background p-3 text-xs leading-5 text-muted-foreground">
        <p className="font-medium">{summaryView.draftFocusLineText}</p>
        <p className="mt-1">{summaryView.draftFocusDescription}</p>
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
          <ActivityDraftCoverageStat key={stat.id} stat={stat} />
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
      {summaryView.sourceMaterialSafetyView.hasInput ? (
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
          <ActivityDraftSourceMaterialSafety
            safetyView={summaryView.sourceMaterialSafetyView}
          />
          {summaryView.sourceMaterialNoteViews.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {summaryView.sourceMaterialNoteViews.map((noteView) => (
                <Badge
                  key={noteView.key}
                  aria-label={noteView.ariaLabel}
                  variant="outline"
                  className="max-w-full rounded-md"
                >
                  <span className="truncate">{noteView.displayText}</span>
                </Badge>
              ))}
            </div>
          ) : null}
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
            key={itemView.key}
          />
        ))}
      </div>
    </div>
  );
}

function ActivityDraftReviewGate({
  reviewGateView,
}: {
  reviewGateView: ActivityDraftMetaReviewGateView;
}) {
  return (
    <section
      aria-label={reviewGateView.ariaLabel}
      className={cn(
        'mt-4 rounded-lg border bg-background p-3',
        reviewGateView.status === 'action-needed' &&
          'border-amber-200 bg-amber-50/50',
        reviewGateView.status === 'ready-to-save' &&
          'border-emerald-200 bg-emerald-50/50'
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h4 className="font-medium text-sm">{reviewGateView.title}</h4>
          <p className="mt-1 text-muted-foreground text-xs leading-5">
            {reviewGateView.description}
          </p>
        </div>
        <Badge
          variant={
            reviewGateView.status === 'ready-to-save' ? 'secondary' : 'outline'
          }
          className={cn(
            'w-fit rounded-md',
            reviewGateView.status === 'action-needed' &&
              'border-amber-300 text-amber-800',
            reviewGateView.status === 'ready-to-save' &&
              'border-emerald-200 bg-emerald-50 text-emerald-700'
          )}
        >
          {reviewGateView.badgeLabel}
        </Badge>
      </div>
      <dl className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
        {reviewGateView.metricViews.map((metricView) => (
          <ActivityDraftReviewGateMetric
            key={metricView.id}
            metricView={metricView}
          />
        ))}
      </dl>
    </section>
  );
}

function ActivityDraftReviewGateMetric({
  metricView,
}: {
  metricView: ActivityDraftMetaReviewGateMetricView;
}) {
  return (
    <div className="rounded-md border bg-background/80 p-2.5">
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

function ActivityDraftMetaHandoff({
  handoffView,
}: {
  handoffView: ActivityDraftMetaHandoffView;
}) {
  const titleId = 'activity-draft-meta-handoff-title';
  const descriptionId = 'activity-draft-meta-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="mt-4 rounded-lg border bg-background p-3"
      data-handoff="activity-draft-meta"
      data-handoff-scope={handoffView.privacy.scope}
    >
      <h4 className="font-medium text-sm" id={titleId}>
        {handoffView.title}
      </h4>
      <p
        className="mt-1 text-muted-foreground text-xs leading-5"
        id={descriptionId}
      >
        {handoffView.description}
      </p>
      <dl className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {handoffView.itemViews.map((item) => (
          <ActivityDraftMetaHandoffItem item={item} key={item.id} />
        ))}
      </dl>
    </section>
  );
}

function ActivityDraftMetaHandoffItem({
  item,
}: {
  item: ActivityDraftMetaHandoffItemView;
}) {
  const labelId = `activity-draft-meta-handoff-${item.id}-label`;
  const valueId = `activity-draft-meta-handoff-${item.id}-value`;
  const descriptionId = `activity-draft-meta-handoff-${item.id}-description`;

  return (
    <div
      className="rounded-md border bg-muted/20 p-2.5"
      data-handoff-item={item.id}
    >
      <dt className="text-muted-foreground text-xs leading-5" id={labelId}>
        {item.label}
      </dt>
      <dd className="mt-1 break-words font-medium text-xs leading-5">
        <output
          aria-describedby={descriptionId}
          aria-label={item.ariaLabel}
          aria-labelledby={`${labelId} ${valueId}`}
          id={valueId}
        >
          {item.value}
        </output>
      </dd>
      <dd
        className="mt-1 text-muted-foreground text-xs leading-5"
        id={descriptionId}
      >
        {item.description}
      </dd>
    </div>
  );
}

function ActivityDraftTrustPanel({
  trustView,
}: {
  trustView: ActivityDraftMetaSummaryTrustView;
}) {
  return (
    <section
      aria-label={trustView.title}
      className="mt-4 rounded-lg border bg-background p-3"
    >
      <h4 className="font-medium text-sm">{trustView.title}</h4>
      <p className="mt-1 text-muted-foreground text-xs leading-5">
        {trustView.description}
      </p>
      <dl className="mt-3 grid gap-2 md:grid-cols-5">
        {trustView.items.map((item) => (
          <ActivityDraftTrustItem item={item} key={item.id} />
        ))}
      </dl>
    </section>
  );
}

function ActivityDraftTrustItem({
  item,
}: {
  item: ActivityDraftMetaSummaryTrustItemView;
}) {
  return (
    <div className="rounded-md border bg-muted/20 p-2.5">
      <dt className="text-muted-foreground text-xs leading-5">{item.label}</dt>
      <dd className="mt-1 break-words font-medium text-xs leading-5">
        <output aria-label={item.ariaLabel}>{item.value}</output>
      </dd>
      <dd className="mt-1 text-muted-foreground text-xs leading-5">
        {item.description}
      </dd>
    </div>
  );
}

function ActivityDraftSourceMaterialSafety({
  safetyView,
}: {
  safetyView: ActivityDraftMetaSummarySourceMaterialSafetyView;
}) {
  return (
    <section aria-label={safetyView.ariaLabel} className="mt-3">
      <p className="text-muted-foreground text-xs leading-5">
        {safetyView.description}
      </p>
      <dl className="mt-2 grid gap-2 sm:grid-cols-2">
        {safetyView.metricViews.map((metricView) => (
          <ActivityDraftSourceMaterialSafetyMetric
            key={metricView.id}
            metricView={metricView}
          />
        ))}
      </dl>
    </section>
  );
}

function ActivityDraftSourceMaterialSafetyMetric({
  metricView,
}: {
  metricView: ActivityDraftMetaSummarySourceMaterialSafetyMetricView;
}) {
  return (
    <div className="rounded-md border bg-muted/20 p-2.5">
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

function ActivityDraftSourceMaterialCapabilities({
  capabilities,
  description,
  title,
}: {
  capabilities: ActivityDraftMetaSummarySourceMaterialCapabilityView[];
  description: string;
  title: string;
}) {
  return (
    <section
      aria-label={title}
      className="mt-4 rounded-lg border bg-background p-3"
    >
      <h4 className="font-medium text-sm">{title}</h4>
      <p className="mt-1 text-muted-foreground text-xs leading-5">
        {description}
      </p>
      <dl className="mt-2 grid gap-2 sm:grid-cols-3">
        {capabilities.map((capability) => (
          <ActivityDraftSourceMaterialCapabilityBadge
            capability={capability}
            key={capability.capability}
          />
        ))}
      </dl>
    </section>
  );
}

function ActivityDraftSourceMaterialCapabilityBadge({
  capability,
}: {
  capability: ActivityDraftMetaSummarySourceMaterialCapabilityView;
}) {
  return (
    <div className="rounded-md border bg-muted/20 p-2.5">
      <div className="flex items-center justify-between gap-2">
        <dt className="font-medium text-xs leading-5">{capability.label}</dt>
        <dd>
          <Badge variant="outline" className="rounded-md">
            <output aria-label={capability.ariaLabel}>
              {capability.value}
            </output>
          </Badge>
        </dd>
      </div>
      <dd className="mt-1 text-muted-foreground text-xs leading-5">
        {capability.description}
      </dd>
    </div>
  );
}

function ActivityDraftReviewChecklistItem({
  itemView,
}: {
  itemView: ActivityDraftReviewChecklistItemView;
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
  readiness: ActivityDraftMetaSummaryQuestionChoiceReadinessView;
}) {
  return (
    <section
      aria-label={readiness.title}
      className="mt-4 rounded-lg border bg-background p-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-medium text-sm">{readiness.title}</h4>
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
    </section>
  );
}

function ActivityDraftQuestionChoiceReadinessItem({
  itemView,
}: {
  itemView: ActivityDraftMetaSummaryQuestionChoiceReadinessItemView;
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
      <div className="mt-2 grid gap-1 text-muted-foreground text-xs leading-5">
        <p>{itemView.choiceCountLabel}</p>
        <p>{itemView.sourceLabel}</p>
        <p>{itemView.answerLabel}</p>
      </div>
    </div>
  );
}

function ActivityDraftCoverageStat({
  stat,
}: {
  stat: ActivityDraftMetaSummaryCoverageStatView;
}) {
  return (
    <article
      aria-label={stat.ariaLabel}
      className="rounded-lg border bg-background p-3"
    >
      <p className="text-lg font-semibold">
        <output aria-label={stat.ariaLabel}>{stat.value}</output>
      </p>
      <p className="text-xs text-muted-foreground">{stat.label}</p>
      <p className="sr-only">{stat.description}</p>
    </article>
  );
}

function ActivityDraftTemplateReadinessOption({
  option,
}: {
  option: ActivityDraftMetaSummaryReadinessOption;
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
