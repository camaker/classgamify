import { starterActivities, starterAssignments } from '@/activities/catalog';
import { ActivityPreview } from '@/components/activities/activity-preview';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useActivities } from '@/hooks/use-activities';
import { useAssignments } from '@/hooks/use-assignments';
import {
  buildDashboardCoreLoopReadiness,
  buildDashboardOverviewMetrics,
  dashboardOverviewPageCopy,
  getDashboardOverviewActionCards,
  type DashboardOverviewActionCard,
  type DashboardOverviewActionCardId,
  type DashboardOverviewMetricId,
  type DashboardCoreLoopReadinessRow,
} from '@/dashboard/overview';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import {
  IconChartBar,
  IconClipboardList,
  IconDeviceGamepad2,
  IconLayoutGrid,
  IconListCheck,
  IconPlayerPlay,
  IconPlus,
  IconSparkles,
  type TablerIcon,
} from '@tabler/icons-react';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
});

function DashboardPage() {
  const activity = starterActivities[0];
  const assignment = starterAssignments[0];
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
  const activitySummary = activitiesData?.summary;
  const assignmentSummary = assignmentsData?.summary;
  const isMetricLoading = activitiesLoading || assignmentsLoading;
  const metrics = buildDashboardOverviewMetrics({
    activitySummary,
    assignmentSummary,
    isLoading: isMetricLoading,
  });
  const readinessRows = buildDashboardCoreLoopReadiness();
  const actionCards = getDashboardOverviewActionCards();

  return (
    <DashboardLayout
      breadcrumbs={[
        {
          label: dashboardOverviewPageCopy.breadcrumbLabel,
          isCurrentPage: true,
        },
      ]}
      title={dashboardOverviewPageCopy.title}
      description={dashboardOverviewPageCopy.description}
    >
      <div className="grid gap-6">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
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
              <CardTitle>
                <h2 className="text-base font-semibold">
                  {dashboardOverviewPageCopy.readinessTitle}
                </h2>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {readinessRows.map((row) => (
                <ReadinessRow key={row.id} row={row} />
              ))}
            </CardContent>
          </Card>
        </section>

        <ActivityPreview activity={activity} assignment={assignment} />

        <section className="grid gap-4 md:grid-cols-3">
          {actionCards.map((card) => (
            <ActionCard key={card.id} card={card} />
          ))}
        </section>
      </div>
    </DashboardLayout>
  );
}

function MetricCard({
  metric,
}: {
  metric: {
    description: string;
    id: DashboardOverviewMetricId;
    label: string;
    value: string;
  };
}) {
  const Icon = dashboardMetricIcons[metric.id];

  return (
    <Card className="rounded-lg">
      <CardContent className="p-4">
        <Icon className="size-5 text-primary" />
        <p className="mt-4 text-2xl font-semibold">{metric.value}</p>
        <p className="text-sm font-medium">{metric.label}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {metric.description}
        </p>
      </CardContent>
    </Card>
  );
}

const dashboardMetricIcons: Record<DashboardOverviewMetricId, TablerIcon> = {
  activities: IconDeviceGamepad2,
  assignments: IconClipboardList,
  results: IconChartBar,
  templates: IconLayoutGrid,
};

const dashboardActionIcons: Record<DashboardOverviewActionCardId, TablerIcon> =
  {
    activities: IconDeviceGamepad2,
    assignments: IconListCheck,
    'student-preview': IconPlayerPlay,
  };

const dashboardActionHrefs: Record<DashboardOverviewActionCardId, string> = {
  activities: Routes.DashboardActivities,
  assignments: Routes.DashboardAssignments,
  'student-preview': Routes.PlayDemo,
};

function ReadinessRow({ row }: { row: DashboardCoreLoopReadinessRow }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span>{row.label}</span>
        <span className="text-muted-foreground">{row.value}%</span>
      </div>
      <Progress value={row.value} />
    </div>
  );
}

function ActionCard({ card }: { card: DashboardOverviewActionCard }) {
  const Icon = dashboardActionIcons[card.id];

  return (
    <Link
      to={dashboardActionHrefs[card.id]}
      className="group rounded-lg border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex size-9 items-center justify-center rounded-lg border bg-background text-primary">
        <Icon className="size-4" />
      </div>
      <h2 className="mt-4 font-semibold">{card.title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {card.description}
      </p>
      <span className="mt-4 inline-flex text-sm font-medium text-primary">
        {card.cta}
      </span>
    </Link>
  );
}
