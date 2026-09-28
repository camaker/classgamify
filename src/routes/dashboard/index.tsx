import {
  assignmentListActionCopy,
  buildAssignmentListCardViewModel,
} from '@/assignments/list-view';
import { DashboardOverviewLoopStatusPanel } from '@/components/dashboard/dashboard-overview-loop-status-panel';
import { DashboardOverviewMetricCard } from '@/components/dashboard/dashboard-overview-metric-card';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { useActivities } from '@/hooks/use-activities';
import { useAssignments } from '@/hooks/use-assignments';
import {
  buildDashboardOverviewRouteViewModel,
  dashboardOverviewPageCopy,
} from '@/dashboard/overview';
import { Routes } from '@/lib/routes';
import { m } from '@/locale/paraglide/messages';
import { cn } from '@/lib/utils';
import {
  IconChartBar,
  IconDeviceGamepad2,
  IconPlus,
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
      pageSize: RECENT_ASSIGNMENT_COUNT,
    });
  const pageView = buildDashboardOverviewRouteViewModel({
    activitiesData,
    activitiesLoading,
    assignmentsData,
    assignmentsLoading,
  });
  const recentAssignments = (assignmentsData?.items ?? []).map((item) =>
    buildAssignmentListCardViewModel(item)
  );

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
      <div className="grid gap-10">
        <section className="grid gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <Link to={Routes.Create} className={buttonVariants()}>
              <IconPlus className="size-4" />
              {dashboardOverviewPageCopy.heroPrimaryAction}
            </Link>
            <Link
              to={Routes.DashboardActivities}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'bg-background'
              )}
            >
              <IconDeviceGamepad2 className="size-4" />
              {dashboardOverviewPageCopy.heroSecondaryAction}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-5 sm:flex sm:flex-wrap sm:gap-x-12">
            {pageView.metrics.map((metric) => (
              <DashboardOverviewMetricCard key={metric.id} metric={metric} />
            ))}
          </div>
        </section>

        <DashboardOverviewLoopStatusPanel view={pageView.loopStatus} />

        {recentAssignments.length > 0 ? (
          <section className="grid gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold text-lg">
                {m.dashboard_overview_action_assignments_title()}
              </h2>
              <Link
                to={Routes.DashboardAssignments}
                className="font-medium text-primary text-sm underline-offset-4 hover:underline"
              >
                {m.dashboard_overview_action_assignments_cta()}
              </Link>
            </div>
            <ul className="grid divide-y rounded-lg border bg-card">
              {recentAssignments.map((assignment) => (
                <li
                  key={assignment.id}
                  className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3"
                >
                  <div className="grid min-w-0 gap-1">
                    <p className="truncate font-semibold">{assignment.title}</p>
                    <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-sm">
                      <Badge variant="secondary" className="rounded-md">
                        {assignment.statusLabel}
                      </Badge>
                      <span>{assignment.templateLabel}</span>
                      {assignment.statItems.map((stat) => (
                        <span key={stat.key}>
                          {stat.label}: {stat.value}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Link
                    to={Routes.DashboardAssignmentResults}
                    params={{ assignmentId: assignment.id }}
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'sm' }),
                      'bg-background'
                    )}
                  >
                    <IconChartBar className="size-4" />
                    {assignmentListActionCopy.viewResults}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </DashboardLayout>
  );
}

/** The dashboard shows the latest few assignments; the full list has more. */
const RECENT_ASSIGNMENT_COUNT = 5;
