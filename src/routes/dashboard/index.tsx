import { ActivityPreview } from '@/components/activities/activity-preview';
import { DashboardOverviewActionCard } from '@/components/dashboard/dashboard-overview-action-card';
import { DashboardOverviewHandoffPanel } from '@/components/dashboard/dashboard-overview-handoff-panel';
import { DashboardOverviewLoopStatusPanel } from '@/components/dashboard/dashboard-overview-loop-status-panel';
import { DashboardOverviewMetricCard } from '@/components/dashboard/dashboard-overview-metric-card';
import { DashboardOverviewReadinessRow } from '@/components/dashboard/dashboard-overview-readiness-row';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useActivities } from '@/hooks/use-activities';
import { useAssignments } from '@/hooks/use-assignments';
import {
  buildDashboardOverviewRouteViewModel,
  dashboardOverviewPageCopy,
} from '@/dashboard/overview';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import {
  IconDeviceGamepad2,
  IconPlus,
  IconSparkles,
} from '@tabler/icons-react';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
});

function DashboardPage() {
  const { data: activitiesData, isLoading: activitiesLoading } = useActivities({
    pageIndex: 0,
    pageSize: 1,
    status: 'active',
  });
  const { data: assignmentsData, isLoading: assignmentsLoading } =
    useAssignments({
      pageIndex: 0,
      pageSize: 1,
    });
  const pageView = buildDashboardOverviewRouteViewModel({
    activitiesData,
    activitiesLoading,
    assignmentsData,
    assignmentsLoading,
  });

  return (
    <DashboardLayout
      breadcrumbs={[
        {
          id: 'dashboard',
          label: dashboardOverviewPageCopy.breadcrumbLabel,
          isCurrentPage: true,
        },
      ]}
      title={dashboardOverviewPageCopy.title}
      description={dashboardOverviewPageCopy.description}
    >
      <div className="grid gap-6">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {pageView.metrics.map((metric) => (
            <DashboardOverviewMetricCard key={metric.id} metric={metric} />
          ))}
        </section>

        <section className="grid gap-4 rounded-lg border bg-card p-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-md border-primary/30">
                <IconSparkles className="size-3.5" />
                {dashboardOverviewPageCopy.heroBadge}
              </Badge>
              <Badge variant="secondary" className="rounded-md">
                {dashboardOverviewPageCopy.loopBadge}
              </Badge>
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">
              {dashboardOverviewPageCopy.heroTitle}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {dashboardOverviewPageCopy.heroDescription}
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Link
                to={Routes.Create}
                className={cn(buttonVariants(), 'w-full sm:w-auto')}
              >
                <IconPlus className="size-4" />
                {dashboardOverviewPageCopy.heroPrimaryAction}
              </Link>
              <Link
                to={Routes.DashboardActivities}
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'w-full bg-background sm:w-auto'
                )}
              >
                <IconDeviceGamepad2 className="size-4" />
                {dashboardOverviewPageCopy.heroSecondaryAction}
              </Link>
            </div>
          </div>

          <Card className="rounded-lg">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 space-y-1">
                  <CardTitle>
                    <h2 className="text-base font-semibold">
                      {pageView.readinessView.title}
                    </h2>
                  </CardTitle>
                  <p className="text-muted-foreground text-xs leading-5">
                    {pageView.readinessView.description}
                  </p>
                </div>
                <Badge
                  aria-label={pageView.readinessView.ariaLabel}
                  variant={
                    pageView.readinessView.status === 'ready'
                      ? 'secondary'
                      : 'outline'
                  }
                  className="rounded-md"
                >
                  {pageView.readinessView.statusLabel}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {pageView.readinessView.rows.map((row) => (
                <DashboardOverviewReadinessRow key={row.id} row={row} />
              ))}
            </CardContent>
          </Card>
        </section>

        <DashboardOverviewLoopStatusPanel view={pageView.loopStatus} />

        <DashboardOverviewHandoffPanel view={pageView.handoffView} />

        <ActivityPreview
          activity={pageView.preview.activity}
          assignment={pageView.preview.assignment}
        />

        <section className="grid gap-4 md:grid-cols-3">
          {pageView.actionCards.map((card) => (
            <DashboardOverviewActionCard key={card.id} card={card} />
          ))}
        </section>
      </div>
    </DashboardLayout>
  );
}
