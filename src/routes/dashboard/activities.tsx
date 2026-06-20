import { activityTemplates, starterActivities } from '@/activities/catalog';
import {
  formatTemplateRequirement,
  getTemplateRemixPlan,
} from '@/activities/template-remix';
import type { ActivityContent, ActivityTemplateType } from '@/activities/types';
import { defaultAssignmentSettings } from '@/assignments/validation';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  useActivities,
  useRemixActivityTemplate,
} from '@/hooks/use-activities';
import { usePublishAssignment } from '@/hooks/use-assignments';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import {
  IconDeviceGamepad2,
  IconEdit,
  IconLayoutGrid,
  IconPlus,
  IconSparkles,
  IconSwitchHorizontal,
} from '@tabler/icons-react';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';

type ActivityCardData = {
  content: ActivityContent;
  description: string;
  id: string;
  persisted: boolean;
  status: string;
  templateType: ActivityTemplateType;
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
  const remixMutation = useRemixActivityTemplate();
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [assignmentTitle, setAssignmentTitle] = useState(activity.title);
  const [collectStudentName, setCollectStudentName] = useState(
    defaultAssignmentSettings.collectStudentName
  );
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(
    defaultAssignmentSettings.showCorrectAnswers
  );
  const [shuffleItems, setShuffleItems] = useState(
    defaultAssignmentSettings.shuffleItems
  );
  const [maxAttempts, setMaxAttempts] = useState(
    String(defaultAssignmentSettings.maxAttempts ?? 2)
  );
  const [expiresAtLocal, setExpiresAtLocal] = useState('');
  const template = activityTemplates.find(
    (item) => item.type === activity.templateType
  );
  const remixPlan = template
    ? getTemplateRemixPlan({
        content: activity.content,
        currentTemplateType: template.type,
      })
    : undefined;

  async function publishActivity() {
    const title = assignmentTitle.trim();
    const attempts = Number(maxAttempts);
    if (!title) {
      toast.error('Add an assignment title before publishing.');
      return;
    }
    if (!Number.isInteger(attempts) || attempts < 1 || attempts > 10) {
      toast.error('Max attempts must be a whole number from 1 to 10.');
      return;
    }
    const expiresAt = expiresAtLocal ? new Date(expiresAtLocal) : undefined;
    if (expiresAtLocal && Number.isNaN(expiresAt?.getTime())) {
      toast.error('Choose a valid close time.');
      return;
    }
    if (expiresAt && expiresAt.getTime() <= Date.now()) {
      toast.error('Close time must be in the future.');
      return;
    }

    try {
      const result = await publishMutation.mutateAsync({
        activityId: activity.id,
        expiresAt: expiresAt?.toISOString(),
        settings: {
          collectStudentName,
          maxAttempts: attempts,
          showCorrectAnswers,
          shuffleItems,
        },
        title,
      });
      toast.success('Assignment link published.');
      setPublishDialogOpen(false);
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

  async function remixActivity(
    targetTemplateType: ActivityCardData['templateType']
  ) {
    try {
      const result = await remixMutation.mutateAsync({
        activityId: activity.id,
        targetTemplateType,
      });
      toast.success('Template remix created.');
      navigate({
        to: '/dashboard/activities/$activityId',
        params: { activityId: result.id },
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Activity could not be remixed.'
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
            {remixPlan?.readyOptions.map((option) => (
              <Badge
                key={option.template.type}
                variant={option.isCurrent ? 'secondary' : 'outline'}
                className="rounded-md"
              >
                {option.template.shortName}
              </Badge>
            ))}
          </div>
          {remixPlan?.suggestedOptions.length ? (
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Ready to remix into{' '}
              {remixPlan.suggestedOptions
                .map((option) => option.template.shortName)
                .join(', ')}
              .
            </p>
          ) : null}
          {activity.persisted && remixPlan?.suggestedOptions.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {remixPlan.suggestedOptions.slice(0, 3).map((option) => (
                <Button
                  key={option.template.type}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-background"
                  disabled={remixMutation.isPending}
                  onClick={() => remixActivity(option.template.type)}
                >
                  <IconSwitchHorizontal className="size-4" />
                  Copy as {option.template.shortName}
                </Button>
              ))}
            </div>
          ) : null}
          {remixPlan?.options.some((option) => !option.isReady) ? (
            <div className="mt-3 grid gap-1.5">
              {remixPlan.options
                .filter((option) => !option.isReady)
                .slice(0, 2)
                .map((option) => (
                  <p
                    key={option.template.type}
                    className="text-xs leading-5 text-muted-foreground"
                  >
                    Add{' '}
                    {option.missingRequirements
                      .map(formatTemplateRequirement)
                      .join(', ')}{' '}
                    to unlock {option.template.shortName}.
                  </p>
                ))}
            </div>
          ) : null}
        </div>
        {activity.persisted ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              to="/dashboard/activities/$activityId"
              params={{ activityId: activity.id }}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'w-full bg-background sm:w-fit'
              )}
            >
              <IconEdit className="size-4" />
              Edit activity
            </Link>
            <Button
              type="button"
              className="w-full sm:w-fit"
              disabled={publishMutation.isPending}
              onClick={() => setPublishDialogOpen(true)}
            >
              <IconPlus className="size-4" />
              Publish assignment
            </Button>
          </div>
        ) : null}
      </CardContent>
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Publish assignment</DialogTitle>
            <DialogDescription>
              Freeze this activity into a student share link with classroom
              delivery settings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor={`assignment-title-${activity.id}`}>
                Assignment title
              </label>
              <Input
                id={`assignment-title-${activity.id}`}
                value={assignmentTitle}
                onChange={(event) =>
                  setAssignmentTitle(event.currentTarget.value)
                }
              />
            </div>
            <div className="grid gap-3 rounded-lg border bg-muted/20 p-3">
              <PublishSetting
                checked={collectStudentName}
                description="Ask learners to type their name before submitting."
                id={`collect-name-${activity.id}`}
                label="Collect student name"
                onCheckedChange={setCollectStudentName}
              />
              <PublishSetting
                checked={showCorrectAnswers}
                description="Reveal correct answers after an attempt is submitted."
                id={`show-answers-${activity.id}`}
                label="Show correct answers"
                onCheckedChange={setShowCorrectAnswers}
              />
              <PublishSetting
                checked={shuffleItems}
                description="Prepare this assignment for randomized item order."
                id={`shuffle-items-${activity.id}`}
                label="Shuffle items"
                onCheckedChange={setShuffleItems}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor={`max-attempts-${activity.id}`}>
                Max attempts
              </label>
              <Input
                id={`max-attempts-${activity.id}`}
                type="number"
                min={1}
                max={10}
                value={maxAttempts}
                onChange={(event) => setMaxAttempts(event.currentTarget.value)}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor={`expires-at-${activity.id}`}>Close after</label>
              <Input
                id={`expires-at-${activity.id}`}
                type="datetime-local"
                min={formatDateTimeLocal(new Date(Date.now() + 60 * 1000))}
                value={expiresAtLocal}
                onChange={(event) =>
                  setExpiresAtLocal(event.currentTarget.value)
                }
              />
              <p className="text-xs leading-5 text-muted-foreground">
                Optional. Leave blank to keep the link open until it is closed
                manually.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPublishDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={publishMutation.isPending}
              onClick={publishActivity}
            >
              <IconPlus className="size-4" />
              Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function PublishSetting({
  checked,
  description,
  id,
  label,
  onCheckedChange,
}: {
  checked: boolean;
  description: string;
  id: string;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <label htmlFor={id} className="font-medium text-sm">
          {label}
        </label>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
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

function formatDateTimeLocal(date: Date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}
