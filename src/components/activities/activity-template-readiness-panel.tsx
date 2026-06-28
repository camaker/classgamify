import type { ActivityTemplateReadinessPanelSummary } from '@/activities/draft-meta';
import { Badge } from '@/components/ui/badge';
import { IconLayoutGrid } from '@tabler/icons-react';

type ActivityTemplateReadinessPanelProps = {
  summary: ActivityTemplateReadinessPanelSummary;
};

type ActivityTemplateReadinessOption =
  ActivityTemplateReadinessPanelSummary['readyOptions'][number];

export function ActivityTemplateReadinessPanel({
  summary,
}: ActivityTemplateReadinessPanelProps) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
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
    </div>
  );
}

function ActivityTemplateReadyOption({
  option,
}: {
  option: ActivityTemplateReadinessOption;
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
  option: ActivityTemplateReadinessOption;
}) {
  return (
    <p className="text-muted-foreground text-xs leading-5">
      {option.diagnosis}
    </p>
  );
}
