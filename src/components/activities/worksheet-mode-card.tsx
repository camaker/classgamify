import type { WorksheetsPageModeCardView } from '@/activities/entry-page-view';
import type { WorksheetModeTemplate } from '@/activities/worksheet-modes';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getPathWithLocale } from '@/lib/urls';
import {
  IconCategory2,
  IconClipboardText,
  IconHeadphones,
  IconLayoutColumns,
  type TablerIcon,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';

type WorksheetModeCardProps = {
  mode: WorksheetsPageModeCardView;
};

export function WorksheetModeCard({ mode }: WorksheetModeCardProps) {
  const Icon = worksheetModeIcons[mode.template];

  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex size-9 items-center justify-center rounded-lg border bg-background text-primary">
        <Icon className="size-4" />
      </div>
      <h2 className="mt-4 font-semibold">{mode.title}</h2>
      <p className="mt-2 min-h-24 text-sm leading-6 text-muted-foreground">
        {mode.description}
      </p>
      {mode.contentRequirements.length ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {mode.contentRequirements.map((requirement) => (
            <Badge
              variant="secondary"
              className="rounded-md"
              key={requirement.id}
            >
              {requirement.label}
            </Badge>
          ))}
        </div>
      ) : null}
      <Link
        to={getPathWithLocale(mode.action.to)}
        search={mode.action.search}
        className={cn(
          buttonVariants({ variant: 'outline' }),
          'mt-4 w-full bg-background'
        )}
      >
        {mode.action.label}
      </Link>
    </div>
  );
}

const worksheetModeIcons = {
  'fill-blank': IconClipboardText,
  'group-sort': IconCategory2,
  'line-match': IconLayoutColumns,
  listening: IconHeadphones,
} satisfies Record<WorksheetModeTemplate, TablerIcon>;
