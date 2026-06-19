import { activityTemplates, starterActivities } from '@/activities/catalog';
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
  IconDeviceGamepad2,
  IconLayoutGrid,
  IconPlus,
  IconSparkles,
} from '@tabler/icons-react';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/activities')({
  component: DashboardActivitiesPage,
});

function DashboardActivitiesPage() {
  return (
    <DashboardLayout
      breadcrumbs={[
        { label: 'Dashboard', href: Routes.Dashboard },
        { label: 'Activities', isCurrentPage: true },
      ]}
      title="Activity library"
      description="Reusable teacher-owned activities. Each activity stores template-neutral content so it can render as different classroom games."
    >
      <div className="grid gap-6">
        <section className="grid gap-4 rounded-lg border bg-card p-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="min-w-0">
            <Badge variant="outline" className="rounded-md border-primary/30">
              <IconSparkles className="size-3.5" />
              Structured activity content
            </Badge>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">
              One lesson, several renderings.
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              The activity model separates questions, pairs, groups, vocabulary,
              and teacher notes. Template switching and AI creation can both
              build on this shared contract.
            </p>
          </div>
          <Link
            to={Routes.Create}
            className={cn(buttonVariants(), 'h-fit w-full lg:w-auto')}
          >
            <IconPlus className="size-4" />
            Create activity
          </Link>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          {starterActivities.map((activity) => {
            const template = activityTemplates.find(
              (item) => item.type === activity.templateType
            );

            return (
              <Card key={activity.id} className="rounded-lg">
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="rounded-md">
                      {activity.status}
                    </Badge>
                    <Badge variant="outline" className="rounded-md">
                      <IconDeviceGamepad2 className="size-3.5" />
                      {template?.name ?? activity.templateType}
                    </Badge>
                  </div>
                  <CardTitle>
                    <h2 className="text-lg font-semibold">{activity.title}</h2>
                  </CardTitle>
                  <CardDescription>
                    <p>{activity.description}</p>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <ActivityStat
                      label="Questions"
                      value={activity.content.questions.length}
                    />
                    <ActivityStat
                      label="Pairs"
                      value={activity.content.pairs.length}
                    />
                    <ActivityStat
                      label="Groups"
                      value={activity.content.groups.length}
                    />
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <IconLayoutGrid className="size-4 text-primary" />
                      Compatible template families
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {activityTemplates
                        .filter((item) =>
                          item.contentRequirements.every((requirement) => {
                            const content = activity.content[requirement];
                            return Array.isArray(content)
                              ? content.length > 0
                              : Boolean(content);
                          })
                        )
                        .map((item) => (
                          <Badge
                            key={item.type}
                            variant="outline"
                            className="rounded-md"
                          >
                            {item.shortName}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      </div>
    </DashboardLayout>
  );
}

function ActivityStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
