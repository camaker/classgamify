import type {
  ActivityEditorTemplateRequirementBadgeView,
  ActivityEditorTemplateScaffoldCoverageMetricView,
  ActivityEditorTemplateScaffoldReadyOptionView,
  ActivityEditorTemplateScaffoldReviewItemView,
  ActivityEditorTemplateScaffoldSummaryView,
  ActivityEditorTemplateSetupView,
} from '@/activities/editor';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { IconArrowRight, IconSparkles } from '@tabler/icons-react';

type ActivityTemplateScaffoldPanelProps = {
  onApplyScaffold: () => void;
  setupView: ActivityEditorTemplateSetupView;
};

export function ActivityTemplateScaffoldPanel({
  onApplyScaffold,
  setupView,
}: ActivityTemplateScaffoldPanelProps) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-md">
              {setupView.shortName}
            </Badge>
            <span className="text-sm font-medium">{setupView.title}</span>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {setupView.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {setupView.requirementBadges.map((requirement) => (
              <ActivityTemplateRequirementBadge
                key={requirement.id}
                requirement={requirement}
              />
            ))}
          </div>
          <ActivityTemplateScaffoldSummary
            summary={setupView.scaffoldSummary}
          />
          <ActivityTemplateScaffoldReviewChecklist setupView={setupView} />
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full bg-background sm:w-fit"
          onClick={onApplyScaffold}
        >
          <IconSparkles className="size-4" />
          {setupView.actionLabel}
        </Button>
      </div>
    </div>
  );
}

function ActivityTemplateScaffoldReviewChecklist({
  setupView,
}: {
  setupView: ActivityEditorTemplateSetupView;
}) {
  const labelId = `activity-template-scaffold-review-${setupView.shortName}`;

  return (
    <section className="mt-4 border-t pt-3" aria-labelledby={labelId}>
      <p id={labelId} className="font-medium text-xs">
        {setupView.reviewChecklistLabel}
      </p>
      <ul className="mt-2 grid gap-2">
        {setupView.reviewChecklistItems.map((item) => (
          <ActivityTemplateScaffoldReviewItem key={item.id} item={item} />
        ))}
      </ul>
    </section>
  );
}

function ActivityTemplateScaffoldReviewItem({
  item,
}: {
  item: ActivityEditorTemplateScaffoldReviewItemView;
}) {
  return (
    <li className="rounded-md border bg-background px-3 py-2 text-xs">
      <span className="sr-only">{item.ariaLabel}</span>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <p className="font-medium">{item.label}</p>
        <a
          className={cn(
            buttonVariants({ size: 'xs', variant: 'link' }),
            'h-auto w-fit gap-1 px-0 text-xs'
          )}
          href={item.actionHref}
        >
          {item.actionLabel}
          <IconArrowRight className="size-3" />
        </a>
      </div>
      <p className="mt-1 leading-5 text-muted-foreground">{item.description}</p>
    </li>
  );
}

function ActivityTemplateRequirementBadge({
  requirement,
}: {
  requirement: ActivityEditorTemplateRequirementBadgeView;
}) {
  return (
    <Badge variant="secondary" className="rounded-md">
      {requirement.label}
    </Badge>
  );
}

function ActivityTemplateScaffoldSummary({
  summary,
}: {
  summary: ActivityEditorTemplateScaffoldSummaryView;
}) {
  return (
    <div className="mt-4 space-y-3 border-t pt-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-xs">{summary.title}</span>
        <Badge variant="secondary" className="rounded-md">
          {summary.runtimeItemLabel}
        </Badge>
        <Badge variant="outline" className="rounded-md">
          {summary.readyTemplateLabel}
        </Badge>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {summary.coverageMetrics.map((metric) => (
          <ActivityTemplateScaffoldMetricBadge
            key={metric.id}
            metric={metric}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {summary.readyTemplateOptions.map((option) => (
          <ActivityTemplateScaffoldReadyBadge
            key={option.template}
            option={option}
          />
        ))}
      </div>
    </div>
  );
}

function ActivityTemplateScaffoldMetricBadge({
  metric,
}: {
  metric: ActivityEditorTemplateScaffoldCoverageMetricView;
}) {
  return (
    <Badge variant="secondary" className="rounded-md bg-background">
      {metric.label}
    </Badge>
  );
}

function ActivityTemplateScaffoldReadyBadge({
  option,
}: {
  option: ActivityEditorTemplateScaffoldReadyOptionView;
}) {
  return (
    <Badge variant="outline" className="rounded-md bg-background">
      {option.shortName}
    </Badge>
  );
}
