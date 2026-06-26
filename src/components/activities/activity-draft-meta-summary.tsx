import type { ActivityDraftResult } from '@/activities/ai-draft';
import { buildActivityDraftMetaSummaryView } from '@/activities/draft-meta';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type ActivityDraftMetaSummaryProps = {
  result: ActivityDraftResult;
};

export function ActivityDraftMetaSummary({
  result,
}: ActivityDraftMetaSummaryProps) {
  const summaryView = buildActivityDraftMetaSummaryView({
    meta: result.meta,
    model: result.model,
    notice: result.notice,
    provider: result.provider,
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
            {summaryView.providerLabel}
          </Badge>
        </div>
      </div>
      <div className="mt-3 rounded-lg border bg-background p-3 text-xs leading-5 text-muted-foreground">
        <p>
          {summaryView.modelLabel}:{' '}
          <span className="font-medium">{summaryView.modelName}</span>
        </p>
        <p className="mt-1">{summaryView.providerDescription}</p>
        {summaryView.notice ? (
          <p className="mt-1">
            <span className="font-medium">{summaryView.noticeLabel}:</span>{' '}
            {summaryView.notice}
          </p>
        ) : null}
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-5">
        {summaryView.coverageStats.map((stat) => (
          <ActivityDraftCoverageStat
            key={stat.label}
            label={stat.label}
            value={stat.value}
          />
        ))}
      </div>
      {summaryView.suggestedTemplateOptions.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
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
      ) : null}
      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {summaryView.templateReadinessOptions.map((option) => (
          <div
            key={option.template}
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
            </div>
            {option.diagnosis ? (
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {option.diagnosis}
              </p>
            ) : null}
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-1.5">
        {summaryView.reviewChecklist.map((item) => (
          <p key={item} className="text-xs leading-5 text-muted-foreground">
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function ActivityDraftCoverageStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
