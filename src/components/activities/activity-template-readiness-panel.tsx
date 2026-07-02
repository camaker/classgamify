import type {
  ActivityTemplateQuizChoiceReadinessItemView,
  ActivityTemplateQuizChoiceReadinessView,
  ActivityTemplateReadinessPanelLockedOption,
  ActivityTemplateReadinessPanelOption,
  ActivityTemplateReadinessPanelSummary,
} from '@/activities/draft-meta';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { IconLayoutGrid, IconSparkles } from '@tabler/icons-react';

type ActivityTemplateReadinessPanelProps = {
  sectionId?: string;
  summary: ActivityTemplateReadinessPanelSummary;
};

export function ActivityTemplateReadinessPanel({
  sectionId,
  summary,
}: ActivityTemplateReadinessPanelProps) {
  return (
    <div id={sectionId} className="rounded-lg border bg-muted/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <IconLayoutGrid className="size-4 text-primary" />
            <h3 className="font-semibold text-sm">{summary.title}</h3>
          </div>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {summary.description}
          </p>
        </div>
        <Badge variant="secondary" className="w-fit rounded-md">
          {summary.readyCountLabel}
        </Badge>
      </div>
      {summary.readyOptions.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {summary.readyOptions.map((option) => (
            <ActivityTemplateReadyOption
              key={option.template}
              option={option}
            />
          ))}
        </div>
      ) : (
        <p className="mt-4 text-muted-foreground text-sm">
          {summary.emptyText}
        </p>
      )}
      {summary.lockedOptions.length > 0 ? (
        <div className="mt-4 grid gap-1.5">
          {summary.lockedOptions.map((option) => (
            <ActivityTemplateLockedOption
              key={option.template}
              option={option}
            />
          ))}
        </div>
      ) : null}
      {summary.questionChoiceReadiness ? (
        <ActivityTemplateQuizChoiceReadinessPanel
          readiness={summary.questionChoiceReadiness}
        />
      ) : null}
    </div>
  );
}

function ActivityTemplateReadyOption({
  option,
}: {
  option: ActivityTemplateReadinessPanelOption;
}) {
  return (
    <Badge variant="outline" className="rounded-md">
      {option.shortName}
    </Badge>
  );
}

function ActivityTemplateLockedOption({
  option,
}: {
  option: ActivityTemplateReadinessPanelLockedOption;
}) {
  return (
    <p className="text-muted-foreground text-xs leading-5">
      {option.diagnosis}
    </p>
  );
}

function ActivityTemplateQuizChoiceReadinessPanel({
  readiness,
}: {
  readiness: ActivityTemplateQuizChoiceReadinessView;
}) {
  return (
    <div className="mt-5 border-t pt-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <IconSparkles className="size-4 text-primary" />
            <h4 className="font-medium text-sm">{readiness.title}</h4>
          </div>
          <p className="mt-1 text-muted-foreground text-xs leading-5">
            {readiness.description}
          </p>
        </div>
        <Badge variant="outline" className="w-fit rounded-md">
          {readiness.summaryLabel}
        </Badge>
      </div>
      {readiness.itemViews.length > 0 ? (
        <div className="mt-3 grid gap-2">
          {readiness.itemViews.map((itemView) => (
            <ActivityTemplateQuizChoiceReadinessItem
              itemView={itemView}
              key={itemView.key}
            />
          ))}
        </div>
      ) : (
        <p className="mt-3 text-muted-foreground text-sm">
          {readiness.emptyText}
        </p>
      )}
    </div>
  );
}

function ActivityTemplateQuizChoiceReadinessItem({
  itemView,
}: {
  itemView: ActivityTemplateQuizChoiceReadinessItemView;
}) {
  return (
    <div className="rounded-md border bg-background/70 p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <p className="font-medium text-sm leading-5">{itemView.promptLabel}</p>
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
      <p className="mt-1 text-muted-foreground text-xs leading-5">
        {itemView.sourceLabel}
      </p>
      {itemView.issueLabel ? (
        <p className="mt-1 text-amber-700 text-xs leading-5">
          {itemView.issueLabel}
        </p>
      ) : null}
    </div>
  );
}
