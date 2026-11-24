import { m } from '@/locale/paraglide/messages';
import { buildActivityEditRouteState } from '@/activities/editor';
import { ActivityCreateForm } from '@/components/activities/activity-create-form';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useActivity } from '@/hooks/use-activities';
import { cn } from '@/lib/utils';
import { IconArrowLeft } from '@tabler/icons-react';
import { Link, createFileRoute } from '@tanstack/react-router';
import { useMemo } from 'react';

export const Route = createFileRoute('/dashboard/activities/$activityId')({
  head: () => ({
    meta: [{ title: `${m.activity_edit_access_ready_title()} | ClassGamify` }],
  }),
  component: ActivityEditPage,
});

function ActivityEditPage() {
  const { activityId } = Route.useParams();
  const { data: activity, isError, isLoading } = useActivity(activityId);
  const routeState = useMemo(
    () =>
      buildActivityEditRouteState({
        activity,
        isError,
        isLoading,
      }),
    [activity, isError, isLoading]
  );
  const pageView = routeState.pageView;

  return (
    <DashboardLayout
      breadcrumbs={pageView.breadcrumbs}
      title={pageView.title}
      description={pageView.description}
    >
      <div className="grid gap-4">
        <Link
          to={pageView.backAction.href}
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'w-fit bg-background'
          )}
        >
          <IconArrowLeft className="size-4" />
          {pageView.backAction.label}
        </Link>

        {routeState.status === 'loading' ? (
          <Card className="min-h-96 rounded-lg" />
        ) : routeState.status === 'error' ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {pageView.loadErrorMessage}
          </div>
        ) : routeState.status === 'blocked' ? (
          <div className="rounded-lg border border-dashed bg-muted/20 p-6">
            <h2 className="text-lg font-semibold">
              {routeState.pageView.editAccessView.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {routeState.pageView.editAccessView.description}
            </p>
            <Button
              className="mt-4"
              nativeButton={false}
              render={
                <Link
                  to={pageView.archivedActivitiesAction.href}
                  search={pageView.archivedActivitiesAction.search}
                />
              }
            >
              {routeState.pageView.editAccessView.actionLabel}
            </Button>
          </div>
        ) : routeState.status === 'ready' ? (
          <ActivityCreateForm
            activityId={routeState.pageView.editor.activityId}
            initialValues={routeState.pageView.editor.initialValues}
            mode={routeState.pageView.editor.mode}
          />
        ) : (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {pageView.loadErrorMessage}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
