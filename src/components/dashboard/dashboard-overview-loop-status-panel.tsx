import type {
  DashboardOverviewLoopStatusView,
  DashboardOverviewNextActionStatus,
} from '@/dashboard/overview';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  IconArrowRight,
  IconCircleCheck,
  IconLock,
  type TablerIcon,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';

type DashboardOverviewLoopStatusPanelProps = {
  view: DashboardOverviewLoopStatusView;
};

export function DashboardOverviewLoopStatusPanel({
  view,
}: DashboardOverviewLoopStatusPanelProps) {
  const nextAction = view.nextActions.find(
    (action) => action.status === 'ready'
  );

  return (
    <Card aria-label={view.ariaLabel} className="gap-4 rounded-lg py-4">
      <CardHeader className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4">
        <div className="grid min-w-0 flex-1 basis-72 gap-1">
          <Badge
            variant="outline"
            className="w-fit rounded-md border-primary/30"
          >
            {view.statusLabel}
          </Badge>
          <CardTitle>
            <h2 className="text-base font-semibold">{view.title}</h2>
          </CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            {view.description}
          </p>
        </div>
        {nextAction ? (
          <Link
            to={nextAction.to}
            aria-label={nextAction.ariaLabel}
            className={buttonVariants()}
          >
            {nextAction.cta}
            <IconArrowRight aria-hidden="true" className="size-4" />
          </Link>
        ) : null}
      </CardHeader>
      <CardContent className="px-4">
        <ol className="flex flex-wrap gap-x-5 gap-y-2">
          {view.nextActions.map((action) => {
            const StatusIcon = dashboardNextActionStatusIcons[action.status];

            return (
              <li
                key={action.id}
                aria-label={action.ariaLabel}
                data-status={action.status}
                className={cn(
                  'flex items-center gap-1.5 text-sm',
                  action.status === 'done' && 'text-muted-foreground',
                  action.status === 'ready' && 'font-medium text-primary',
                  action.status === 'blocked' && 'text-muted-foreground/70'
                )}
              >
                <StatusIcon
                  aria-label={action.statusAriaLabel}
                  className={cn(
                    'size-4',
                    action.status === 'done' && 'text-success-text'
                  )}
                />
                {action.label}
                <span className="sr-only">
                  {action.statusLabel}. {action.description}{' '}
                  {action.statusDescription}
                </span>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

const dashboardNextActionStatusIcons: Record<
  DashboardOverviewNextActionStatus,
  TablerIcon
> = {
  blocked: IconLock,
  done: IconCircleCheck,
  ready: IconArrowRight,
};
