import type {
  ActivityLibraryCardActionState,
  ActivityLibraryCardTemplateType,
  ActivityLibraryCompatibilityView,
  ActivityLibraryLockedTemplateDiagnosticView,
  ActivityLibraryReadyTemplateOptionView,
  ActivityLibraryRemixActionOptionView,
} from '@/activities/library-view';
import { activityLibraryCardCopy } from '@/activities/library-view';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconLayoutGrid, IconSwitchHorizontal } from '@tabler/icons-react';

type ActivityLibraryCompatibilityPanelProps = {
  actionState: ActivityLibraryCardActionState;
  compatibility: ActivityLibraryCompatibilityView;
  isRemixing: boolean;
  onRemix: (targetTemplateType: ActivityLibraryCardTemplateType) => void;
};

export function ActivityLibraryCompatibilityPanel({
  actionState,
  compatibility,
  isRemixing,
  onRemix,
}: ActivityLibraryCompatibilityPanelProps) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <IconLayoutGrid className="size-4 text-primary" />
        {activityLibraryCardCopy.compatibleTemplatesLabel}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {compatibility.readyTemplateOptions.map((option) => (
          <ActivityLibraryReadyTemplateBadge
            key={option.template}
            option={option}
          />
        ))}
      </div>
      {compatibility.remixHint ? (
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          {compatibility.remixHint}
        </p>
      ) : null}
      {actionState.showRemixActions ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {compatibility.remixActionOptions.map((option) => (
            <ActivityLibraryRemixActionButton
              key={option.template}
              disabled={isRemixing}
              option={option}
              onClick={() => onRemix(option.template)}
            />
          ))}
        </div>
      ) : null}
      {compatibility.lockedTemplateDiagnostics.length ? (
        <div className="mt-3 grid gap-1.5">
          {compatibility.lockedTemplateDiagnostics.map((diagnostic) => (
            <ActivityLibraryLockedTemplateDiagnostic
              diagnostic={diagnostic}
              key={diagnostic.id}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ActivityLibraryReadyTemplateBadge({
  option,
}: {
  option: ActivityLibraryReadyTemplateOptionView;
}) {
  return (
    <Badge
      variant={option.isCurrent ? 'secondary' : 'outline'}
      className="rounded-md"
    >
      {option.shortName}
    </Badge>
  );
}

function ActivityLibraryRemixActionButton({
  disabled,
  onClick,
  option,
}: {
  disabled: boolean;
  onClick: () => void;
  option: ActivityLibraryRemixActionOptionView;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="bg-background"
      disabled={disabled}
      onClick={onClick}
    >
      <IconSwitchHorizontal className="size-4" />
      {option.actionLabel}
    </Button>
  );
}

function ActivityLibraryLockedTemplateDiagnostic({
  diagnostic,
}: {
  diagnostic: ActivityLibraryLockedTemplateDiagnosticView;
}) {
  return (
    <p className="text-xs leading-5 text-muted-foreground">
      {diagnostic.diagnosis}
    </p>
  );
}
