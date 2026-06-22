import { activityContentToEditorInput } from '@/activities/editor';
import {
  activityEditPageCopy,
  buildActivityEditAccessView,
} from '@/activities/lifecycle';
import { ActivityCreateForm } from '@/components/activities/activity-create-form';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button, buttonVariants } from '@/components/ui/button';
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
  const title = activity?.title ?? activityEditPageCopy.fallbackTitle;
  const editAccessView = activity
    ? buildActivityEditAccessView(activity.visibility)
    : null;

  return (
    <DashboardLayout
      breadcrumbs={[
        {
          label: activityEditPageCopy.breadcrumbDashboard,
          href: Routes.Dashboard,
        },
        {
          label: activityEditPageCopy.breadcrumbActivities,
          href: Routes.DashboardActivities,
        },
        { label: title, isCurrentPage: true },
      ]}
      title={title}
      description={
        editAccessView?.description ?? activityEditPageCopy.fallbackDescription
      }
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
          {activityEditPageCopy.backToLibraryLabel}
        </Link>

        {isLoading ? (
          <Card className="min-h-96 rounded-lg" />
        ) : isError || !activity ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {activityEditPageCopy.loadErrorMessage}
          </div>
        ) : editAccessView && !editAccessView.canEdit ? (
          <div className="rounded-lg border border-dashed bg-muted/20 p-6">
            <h2 className="text-lg font-semibold">{editAccessView.title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {editAccessView.description}
            </p>
            <Button asChild className="mt-4">
              <Link
                to={Routes.DashboardActivities}
                search={{ status: 'archived' }}
              >
                {editAccessView.actionLabel}
              </Link>
            </Button>
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
