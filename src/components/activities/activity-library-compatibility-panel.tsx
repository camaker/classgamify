import type {
  buildActivityLibraryCardDisplayView,
  buildActivityLibraryCardViewModel,
} from '@/activities/library-view';
import { activityLibraryCardCopy } from '@/activities/library-view';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconLayoutGrid, IconSwitchHorizontal } from '@tabler/icons-react';

type ActivityCardData = ReturnType<typeof buildActivityLibraryCardViewModel>;
type ActivityLibraryCardDisplayView = ReturnType<
  typeof buildActivityLibraryCardDisplayView
>;

type ActivityLibraryCompatibilityPanelProps = {
  actionState: ActivityLibraryCardDisplayView['actionState'];
  compatibility: ActivityLibraryCardDisplayView['compatibility'];
  isRemixing: boolean;
  onRemix: (targetTemplateType: ActivityCardData['templateType']) => void;
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
          <Badge
            key={option.template}
            variant={option.isCurrent ? 'secondary' : 'outline'}
            className="rounded-md"
          >
            {option.shortName}
          </Badge>
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
            <Button
              key={option.template}
              type="button"
              variant="outline"
              size="sm"
              className="bg-background"
              disabled={isRemixing}
              onClick={() => onRemix(option.template)}
            >
              <IconSwitchHorizontal className="size-4" />
              {option.actionLabel}
            </Button>
          ))}
        </div>
      ) : null}
      {compatibility.lockedTemplateDiagnostics.length ? (
        <div className="mt-3 grid gap-1.5">
          {compatibility.lockedTemplateDiagnostics.map((diagnosis) => (
            <p
              key={diagnosis}
              className="text-xs leading-5 text-muted-foreground"
            >
              {diagnosis}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
