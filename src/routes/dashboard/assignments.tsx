import { getStarterActivity, starterAssignments } from '@/activities/catalog';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import {
  IconChartBar,
  IconClock,
  IconListCheck,
  IconPlayerPlay,
  IconShare3,
  IconUsers,
} from '@tabler/icons-react';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/assignments')({
  component: DashboardAssignmentsPage,
});

function DashboardAssignmentsPage() {
  return (
    <DashboardLayout
      breadcrumbs={[
        { label: 'Dashboard', href: Routes.Dashboard },
        { label: 'Assignments', isCurrentPage: true },
      ]}
      title="Assignments"
      description="Published activity instances with share links, classroom settings, and starter result metrics."
    >
      <div className="grid gap-6">
        <section className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            icon={IconShare3}
            label="Published links"
            value={String(starterAssignments.length)}
          />
          <SummaryCard
            icon={IconUsers}
            label="Completions"
            value={String(
              starterAssignments.reduce(
                (sum, assignment) => sum + assignment.completions,
                0
              )
            )}
          />
          <SummaryCard
            icon={IconChartBar}
            label="Average score"
            value={`${Math.round(
              starterAssignments.reduce(
                (sum, assignment) => sum + assignment.averageScore,
                0
              ) / starterAssignments.length
            )}%`}
          />
        </section>

        <section className="grid gap-4">
          {starterAssignments.map((assignment) => {
            const activity = getStarterActivity(assignment.activityId);

            return (
              <Card key={assignment.id} className="rounded-lg">
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="rounded-md">
                      {assignment.status}
                    </Badge>
                    <Badge variant="outline" className="rounded-md">
                      <IconListCheck className="size-3.5" />
                      {activity.templateType}
                    </Badge>
                  </div>
                  <CardTitle>
                    <h2 className="text-lg font-semibold">
                      {assignment.title}
                    </h2>
                  </CardTitle>
                  <CardDescription>
                    <p>{activity.description}</p>
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <AssignmentStat
                      icon={IconUsers}
                      label="Completions"
                      value={String(assignment.completions)}
                    />
                    <AssignmentStat
                      icon={IconChartBar}
                      label="Average"
                      value={`${assignment.averageScore}%`}
                    />
                    <AssignmentStat
                      icon={IconClock}
                      label="Attempts"
                      value={
                        assignment.settings.maxAttempts
                          ? `${assignment.settings.maxAttempts} max`
                          : 'open'
                      }
                    />
                  </div>
                  <Link
                    to="/play/$shareId"
                    params={{ shareId: assignment.shareId }}
                    className={cn(buttonVariants(), 'w-full lg:w-auto')}
                  >
                    <IconPlayerPlay className="size-4" />
                    Open share link
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </section>
      </div>
    </DashboardLayout>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof IconShare3;
  label: string;
  value: string;
}) {
  return (
    <Card className="rounded-lg">
      <CardContent className="p-4">
        <Icon className="size-5 text-primary" />
        <p className="mt-4 text-2xl font-semibold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function AssignmentStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof IconUsers;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <Icon className="size-4 text-primary" />
      <p className="mt-2 text-sm font-medium">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
