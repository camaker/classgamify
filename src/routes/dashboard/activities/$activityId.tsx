import { activityContentToEditorInput } from '@/activities/editor';
import { ActivityCreateForm } from '@/components/activities/activity-create-form';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useActivity } from '@/hooks/use-activities';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { IconArrowLeft } from '@tabler/icons-react';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/activities/$activityId')({
  component: ActivityEditPage,
});

function ActivityEditPage() {
  const { activityId } = Route.useParams();
  const { data: activity, isError, isLoading } = useActivity(activityId);
  const title = activity?.title ?? 'Edit activity';

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: 'Dashboard', href: Routes.Dashboard },
        { label: 'Activities', href: Routes.DashboardActivities },
        { label: title, isCurrentPage: true },
      ]}
      title={title}
      description="Update reusable activity content before publishing or reusing it across templates."
    >
      <div className="grid gap-4">
        <Link
          to={Routes.DashboardActivities}
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'w-fit bg-background'
          )}
        >
          <IconArrowLeft className="size-4" />
          Back to library
        </Link>

        {isLoading ? (
          <Card className="min-h-96 rounded-lg" />
        ) : isError || !activity ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            Activity could not be loaded. Refresh the page or return to the
            activity library.
          </div>
        ) : (
          <ActivityCreateForm
            activityId={activity.id}
            initialValues={activityContentToEditorInput({
              content: activity.contentJson,
              description: activity.description,
              templateType: activity.templateType,
              title: activity.title,
              visibility: activity.visibility,
            })}
            mode="edit"
          />
        )}
      </div>
    </DashboardLayout>
  );
}
