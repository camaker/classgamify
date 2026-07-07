import {
  buildActivityEditRouteHandoffView,
  buildActivityEditRouteState,
  type ActivityEditRouteHandoffView,
} from '@/activities/editor';
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
  const handoffView = useMemo(
    () =>
      buildActivityEditRouteHandoffView({
        activity,
        routeStatus: routeState.status,
      }),
    [activity, routeState.status]
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

        <ActivityEditRouteHandoff handoffView={handoffView} />

        {routeState.status === 'loading' ? (
          <Card className="min-h-96 rounded-lg" />
        ) : routeState.status === 'error' ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {pageView.loadErrorMessage}
          </div>
        ) : routeState.status === 'blocked' ? (
          <div className="rounded-lg border border-dashed bg-muted/20 p-6">
            <h2 className="text-lg font-semibold">
              {pageView.editAccessView.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {pageView.editAccessView.description}
            </p>
            <Button asChild className="mt-4">
              <Link
                to={pageView.archivedActivitiesAction.href}
                search={pageView.archivedActivitiesAction.search}
              >
                {pageView.editAccessView.actionLabel}
              </Link>
            </Button>
          </div>
        ) : routeState.status === 'ready' ? (
          <ActivityCreateForm
            activityId={pageView.editor.activityId}
            initialValues={pageView.editor.initialValues}
            mode={pageView.editor.mode}
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

function ActivityEditRouteHandoff({
  handoffView,
}: {
  handoffView: ActivityEditRouteHandoffView;
}) {
  const titleId = 'activity-edit-route-handoff-title';
  const descriptionId = 'activity-edit-route-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="activity-edit-route"
    >
      <h2 id={titleId}>{handoffView.title}</h2>
      <p id={descriptionId}>{handoffView.description}</p>
      <dl>
        {handoffView.itemViews.map((item) => (
          <ActivityEditRouteHandoffItem item={item} key={item.id} />
        ))}
      </dl>
    </section>
  );
}

function ActivityEditRouteHandoffItem({
  item,
}: {
  item: ActivityEditRouteHandoffView['itemViews'][number];
}) {
  const labelId = `activity-edit-route-handoff-${item.id}-label`;
  const valueId = `activity-edit-route-handoff-${item.id}-value`;
  const descriptionId = `activity-edit-route-handoff-${item.id}-description`;

  return (
    <div data-handoff-item={item.id}>
      <dt id={labelId}>{item.label}</dt>
      <dd>
        <output
          aria-describedby={descriptionId}
          aria-label={item.ariaLabel}
          aria-labelledby={`${labelId} ${valueId}`}
          id={valueId}
        >
          {item.value}
        </output>
        <span id={descriptionId}>{item.description}</span>
      </dd>
    </div>
  );
}
