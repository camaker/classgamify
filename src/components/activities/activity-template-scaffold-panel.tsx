import type {
  ActivityEditorTemplateRequirementBadgeView,
  ActivityEditorTemplateSetupView,
} from '@/activities/editor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconSparkles } from '@tabler/icons-react';

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
