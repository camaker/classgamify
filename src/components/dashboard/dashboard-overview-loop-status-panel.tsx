import type {
  DashboardOverviewLoopStatusView,
  DashboardOverviewNextActionId,
  DashboardOverviewNextActionStatus,
} from '@/dashboard/overview';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  IconArrowRight,
  IconChartBar,
  IconCircleCheck,
  IconClipboardList,
  IconLock,
  IconPlus,
  IconShare3,
  type TablerIcon,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';

type DashboardOverviewLoopStatusPanelProps = {
  view: DashboardOverviewLoopStatusView;
};

export function DashboardOverviewLoopStatusPanel({
  view,
}: DashboardOverviewLoopStatusPanelProps) {
  return (
    <Card className="rounded-lg">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="outline" className="rounded-md border-primary/30">
            {view.statusLabel}
          </Badge>
        </div>
        <CardTitle>
          <h2 className="text-base font-semibold">{view.title}</h2>
        </CardTitle>
        <p className="text-sm leading-6 text-muted-foreground">
          {view.description}
        </p>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {view.nextActions.map((action) => {
          const Icon = dashboardNextActionIcons[action.id];
          const StatusIcon = dashboardNextActionStatusIcons[action.status];

          return (
            <fieldset
              key={action.id}
              aria-label={action.ariaLabel}
              className={cn(
                'grid min-h-40 min-w-0 gap-3 rounded-lg border bg-background p-3',
                action.status === 'ready' && 'border-primary/40 bg-primary/5'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg border bg-card text-primary">
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                <Badge
                  variant={getDashboardNextActionBadgeVariant(action.status)}
                  className="rounded-md"
                >
                  <StatusIcon aria-hidden="true" className="size-3" />
                  {action.statusLabel}
                </Badge>
              </div>
              <div className="min-w-0 space-y-1">
                <h3 className="text-sm font-semibold">{action.label}</h3>
                <p className="text-xs leading-5 text-muted-foreground">
                  {action.description}
                </p>
              </div>
              {action.status === 'ready' ? (
                <Link
                  to={action.to}
                  aria-label={action.ariaLabel}
                  className={cn(
                    buttonVariants({ size: 'sm' }),
                    'w-full justify-between'
                  )}
                >
                  {action.cta}
                  <IconArrowRight aria-hidden="true" className="size-4" />
                </Link>
              ) : null}
            </fieldset>
          );
        })}
      </CardContent>
    </Card>
  );
}

const dashboardNextActionIcons: Record<
  DashboardOverviewNextActionId,
  TablerIcon
> = {
  'create-activity': IconPlus,
  'publish-assignment': IconClipboardList,
  'review-results': IconChartBar,
  'share-assignment': IconShare3,
};

const dashboardNextActionStatusIcons: Record<
  DashboardOverviewNextActionStatus,
  TablerIcon
> = {
  blocked: IconLock,
  done: IconCircleCheck,
  ready: IconArrowRight,
};

function getDashboardNextActionBadgeVariant(
  status: DashboardOverviewNextActionStatus
) {
  if (status === 'ready') return 'default';
  if (status === 'done') return 'secondary';

  return 'outline';
}
