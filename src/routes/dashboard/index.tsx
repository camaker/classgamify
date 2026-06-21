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
  buildDashboardOverviewMetrics,
  type DashboardOverviewMetricId,
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

  return (
    <DashboardLayout
      breadcrumbs={[{ label: 'Dashboard', isCurrentPage: true }]}
      title="Teacher dashboard"
      description="Manage reusable activities, publish classroom assignments, and track student attempts from one workspace."
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
                Teacher workspace
              </Badge>
              <Badge variant="secondary" className="rounded-md">
                Wordwall-core loop
              </Badge>
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">
              Activity content is now the center of the product.
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              ClassGamify separates reusable teacher activities from published
              assignments and student attempts. Create, publish, play, and
              review now share one activity data contract that AI drafting and
              template remixing can build on.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Link
                to={Routes.Create}
                className={cn(buttonVariants(), 'w-full sm:w-auto')}
              >
                <IconPlus className="size-4" />
                Create activity
              </Link>
              <Link
                to={Routes.DashboardActivities}
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'w-full bg-background sm:w-auto'
                )}
              >
                <IconDeviceGamepad2 className="size-4" />
                Open activity library
              </Link>
            </div>
          </div>

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>
                <h2 className="text-base font-semibold">Core loop readiness</h2>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ReadinessRow label="Activity authoring" value={100} />
              <ReadinessRow label="Assignment links" value={100} />
              <ReadinessRow label="Student runner" value={85} />
              <ReadinessRow label="Teacher results" value={90} />
            </CardContent>
          </Card>
        </section>

        <ActivityPreview activity={activity} assignment={assignment} />

        <section className="grid gap-4 md:grid-cols-3">
          <ActionCard
            icon={IconDeviceGamepad2}
            title="Activities"
            description="Review your activity library and the structured content each template consumes."
            href={Routes.DashboardActivities}
            cta="Open activities"
          />
          <ActionCard
            icon={IconListCheck}
            title="Assignments"
            description="Track published share links, assignment settings, completions, and average scores."
            href={Routes.DashboardAssignments}
            cta="Open assignments"
          />
          <ActionCard
            icon={IconPlayerPlay}
            title="Student preview"
            description="Open a playable student assignment route with progress, timing, scoring, and review behavior."
            href={Routes.PlayDemo}
            cta="Preview play route"
          />
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

function ReadinessRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span>{label}</span>
        <span className="text-muted-foreground">{value}%</span>
      </div>
      <Progress value={value} />
    </div>
  );
}

function ActionCard({
  cta,
  description,
  href,
  icon: Icon,
  title,
}: {
  cta: string;
  description: string;
  href: string;
  icon: TablerIcon;
  title: string;
}) {
  return (
    <Link
      to={href}
      className="group rounded-lg border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex size-9 items-center justify-center rounded-lg border bg-background text-primary">
        <Icon className="size-4" />
      </div>
      <h2 className="mt-4 font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      <span className="mt-4 inline-flex text-sm font-medium text-primary">
        {cta}
      </span>
    </Link>
  );
}
