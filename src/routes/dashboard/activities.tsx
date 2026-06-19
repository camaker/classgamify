import { activityTemplates, starterActivities } from '@/activities/catalog';
import type { ActivityContent } from '@/activities/types';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useActivities } from '@/hooks/use-activities';
import { usePublishAssignment } from '@/hooks/use-assignments';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import {
  IconDeviceGamepad2,
  IconLayoutGrid,
  IconPlus,
  IconSparkles,
} from '@tabler/icons-react';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

type ActivityCardData = {
  content: ActivityContent;
  description: string;
  id: string;
  persisted: boolean;
  status: string;
  templateType: string;
  title: string;
};

export const Route = createFileRoute('/dashboard/activities')({
  validateSearch: (search: Record<string, unknown>) => ({
    created: typeof search.created === 'string' ? search.created : undefined,
  }),
  component: DashboardActivitiesPage,
});

function DashboardActivitiesPage() {
  const { data, isError, isLoading } = useActivities({
    pageIndex: 0,
    pageSize: 50,
  });
  const activities = data?.items ?? [];
  const hasActivities = activities.length > 0;

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

        {isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            Activities could not be loaded. Refresh the page or sign in again.
          </div>
        ) : null}

        {isLoading ? (
          <section className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <Card key={index} className="min-h-56 rounded-lg" />
            ))}
          </section>
        ) : null}

        {!isLoading && hasActivities ? (
          <section className="grid gap-4 lg:grid-cols-2">
            {activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={{
                  content: activity.contentJson,
                  description: activity.description ?? '',
                  id: activity.id,
                  persisted: true,
                  status: activity.visibility,
                  templateType: activity.templateType,
                  title: activity.title,
                }}
              />
            ))}
          </section>
        ) : null}

        {!isLoading && !hasActivities ? (
          <div className="grid gap-4">
            <div className="rounded-lg border border-dashed bg-muted/20 p-6">
              <h2 className="text-lg font-semibold">
                No saved activities yet.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Create the first reusable classroom activity, then publish it as
                a student assignment in the next product wave.
              </p>
              <Link
                to={Routes.Create}
                className={cn(buttonVariants(), 'mt-4 w-fit')}
              >
                <IconPlus className="size-4" />
                Create activity
              </Link>
            </div>
            <section className="grid gap-4 lg:grid-cols-2">
              {starterActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={{
                    content: activity.content,
                    description: activity.description,
                    id: activity.id,
                    persisted: false,
                    status: activity.status,
                    templateType: activity.templateType,
                    title: activity.title,
                  }}
                />
              ))}
            </section>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}

function ActivityCard({ activity }: { activity: ActivityCardData }) {
  const navigate = useNavigate();
  const publishMutation = usePublishAssignment();
  const template = activityTemplates.find(
    (item) => item.type === activity.templateType
  );

  async function publishActivity() {
    try {
      const result = await publishMutation.mutateAsync(activity.id);
      toast.success('Assignment link published.');
      navigate({
        to: Routes.DashboardAssignments,
        search: { published: result.assignment.shareSlug },
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Assignment could not be published.'
      );
    }
  }

  return (
    <Card className="rounded-lg">
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
          <ActivityStat label="Pairs" value={activity.content.pairs.length} />
          <ActivityStat label="Groups" value={activity.content.groups.length} />
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
                <Badge key={item.type} variant="outline" className="rounded-md">
                  {item.shortName}
                </Badge>
              ))}
          </div>
        </div>
        {activity.persisted ? (
          <Button
            type="button"
            className="w-full sm:w-fit"
            disabled={publishMutation.isPending}
            onClick={publishActivity}
          >
            <IconPlus className="size-4" />
            Publish assignment
          </Button>
        ) : null}
      </CardContent>
    </Card>
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
