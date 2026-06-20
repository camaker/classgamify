import { activityTemplates, starterActivities } from '@/activities/catalog';
import {
  ARCHIVED_ACTIVITY_DERIVATION_ERROR,
  canDeriveActivityWork,
  isActivityArchived,
} from '@/activities/lifecycle';
import {
  type ActivityLibraryStatus,
  type ActivityTemplateFilter,
  isActivityTemplateType,
  normalizeActivityLibrarySearch,
  parseActivityLibraryStatus,
  parseActivityTemplateFilter,
} from '@/activities/library-filters';
import {
  formatTemplateRequirement,
  getTemplateRemixPlan,
} from '@/activities/template-remix';
import type {
  ActivityContent,
  ActivityTemplateType,
  ActivityVisibility,
} from '@/activities/types';
import { defaultAssignmentSettings } from '@/assignments/validation';
import { AssignmentSettingsSummary } from '@/components/assignments/assignment-settings-summary';
import { DashboardPagination } from '@/components/dashboard/dashboard-pagination';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
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
import { Textarea } from '@/components/ui/textarea';
import {
  useArchiveActivity,
  useActivities,
  useDuplicateActivity,
  useRemixActivityTemplate,
  useRestoreActivity,
} from '@/hooks/use-activities';
import { usePublishAssignment } from '@/hooks/use-assignments';
import { parseDashboardPageSearch } from '@/lib/dashboard-pagination';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import {
  IconCopy,
  IconDeviceGamepad2,
  IconEdit,
  IconFolder,
  IconFolderOff,
  IconLayoutGrid,
  IconPlus,
  IconRotateClockwise,
  IconSearch,
  IconSparkles,
  IconSwitchHorizontal,
  IconX,
} from '@tabler/icons-react';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type ActivityCardData = {
  content: ActivityContent;
  description: string;
  id: string;
  persisted: boolean;
  status: ActivityVisibility;
  templateType: ActivityTemplateType;
  title: string;
};

const ACTIVITY_LIBRARY_PAGE_SIZE = 12;

export const Route = createFileRoute('/dashboard/activities')({
  validateSearch: (search: Record<string, unknown>) => ({
    created: typeof search.created === 'string' ? search.created : undefined,
    page: parseDashboardPageSearch(search.page),
    q: typeof search.q === 'string' ? search.q : undefined,
    status: parseActivityLibraryStatus(search.status),
    template: parseActivityTemplateFilter(search.template),
  }),
  component: DashboardActivitiesPage,
});

function DashboardActivitiesPage() {
  const navigate = useNavigate({ from: '/dashboard/activities' });
  const { created, page, q, status, template } = Route.useSearch();
  const searchQuery = q ?? '';
  const libraryStatus = status ?? 'active';
  const templateFilter: ActivityTemplateFilter = template ?? 'all';
  const currentPage = page ?? 1;
  const normalizedSearchQuery = normalizeActivityLibrarySearch(searchQuery);
  const { data, isError, isLoading } = useActivities({
    pageIndex: currentPage - 1,
    pageSize: ACTIVITY_LIBRARY_PAGE_SIZE,
    search: normalizedSearchQuery,
    status: libraryStatus,
    template,
  });
  const activities = data?.items ?? [];
  const totalActivities = data?.total ?? 0;
  const summary = data?.summary ?? {
    archivedActivities: 0,
    draftActivities: 0,
    remixReadyActivities: 0,
    templateCoverage: 0,
    templateCoverageTotal: activityTemplates.length,
    totalActivities,
    totalReadyTemplateOptions: 0,
  };
  const totalPages = Math.max(
    1,
    Math.ceil(totalActivities / ACTIVITY_LIBRARY_PAGE_SIZE)
  );
  const hasActivities = activities.length > 0;
  const hasFilters =
    Boolean(normalizedSearchQuery) ||
    templateFilter !== 'all' ||
    libraryStatus !== 'active';
  const hasContentFilters =
    Boolean(normalizedSearchQuery) || templateFilter !== 'all';
  const emptyFilterTitle =
    libraryStatus === 'archived' && !hasContentFilters
      ? 'No archived activities.'
      : 'No matching activities.';
  const emptyFilterDescription =
    libraryStatus === 'archived' && !hasContentFilters
      ? 'Archived activities will appear here after you move them out of the active library.'
      : 'Try another title, description, template keyword, or template family from your classroom activity library.';

  useEffect(() => {
    if (!isLoading && currentPage > totalPages) {
      navigateToActivityPage(totalPages, true);
    }
  }, [currentPage, isLoading, totalActivities, totalPages]);

  function updateLibraryFilters(next: {
    q?: string;
    status?: ActivityLibraryStatus;
    template?: ActivityTemplateFilter;
  }) {
    const nextQuery = next.q ?? searchQuery;
    const nextStatus = next.status ?? libraryStatus;
    const nextTemplate = next.template ?? templateFilter;

    void navigate({
      replace: true,
      search: {
        created,
        page: undefined,
        q: nextQuery.trim() ? nextQuery : undefined,
        status: nextStatus === 'active' ? undefined : nextStatus,
        template: nextTemplate === 'all' ? undefined : nextTemplate,
      },
    });
  }

  function navigateToActivityPage(nextPage: number, replace = false) {
    const boundedPage = Math.max(1, nextPage);

    void navigate({
      replace,
      search: {
        created,
        page: boundedPage === 1 ? undefined : boundedPage,
        q: searchQuery.trim() ? searchQuery : undefined,
        status: libraryStatus === 'active' ? undefined : libraryStatus,
        template: templateFilter === 'all' ? undefined : templateFilter,
      },
    });
  }

  function clearLibraryFilters() {
    void navigate({
      replace: true,
      search: { created },
    });
  }

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

        <section className="grid gap-4 md:grid-cols-4">
          <ActivitySummaryCard
            icon={IconFolder}
            label={hasFilters ? 'Matching activities' : 'Activities'}
            value={String(summary.totalActivities)}
          />
          <ActivitySummaryCard
            icon={IconDeviceGamepad2}
            label="Template coverage"
            value={`${summary.templateCoverage}/${summary.templateCoverageTotal}`}
          />
          <ActivitySummaryCard
            icon={IconSwitchHorizontal}
            label="Ready to remix"
            value={String(summary.remixReadyActivities)}
          />
          <ActivitySummaryCard
            icon={IconLayoutGrid}
            label="Ready modes"
            value={String(summary.totalReadyTemplateOptions)}
          />
        </section>

        <ActivityLibrarySearch
          isLoading={isLoading}
          onClearFilters={clearLibraryFilters}
          onClearSearch={() => updateLibraryFilters({ q: '' })}
          onSearch={(value) => updateLibraryFilters({ q: value })}
          onStatusChange={(value) => updateLibraryFilters({ status: value })}
          onTemplateChange={(value) =>
            updateLibraryFilters({ template: value })
          }
          status={libraryStatus}
          template={templateFilter}
          total={totalActivities}
          value={searchQuery}
        />

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
          <>
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
                  libraryStatus={libraryStatus}
                />
              ))}
            </section>
            <DashboardPagination
              currentPage={currentPage}
              isLoading={isLoading}
              itemLabel="activities"
              onPageChange={(nextPage) => navigateToActivityPage(nextPage)}
              pageSize={ACTIVITY_LIBRARY_PAGE_SIZE}
              total={totalActivities}
              totalPages={totalPages}
            />
          </>
        ) : null}

        {!isLoading && !hasActivities && hasFilters ? (
          <div className="rounded-lg border border-dashed bg-muted/20 p-6">
            <h2 className="text-lg font-semibold">{emptyFilterTitle}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {emptyFilterDescription}
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4 bg-background"
              onClick={clearLibraryFilters}
            >
              <IconX className="size-4" />
              Clear filters
            </Button>
          </div>
        ) : null}

        {!isLoading && !hasActivities && !hasFilters ? (
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
                  libraryStatus="active"
                />
              ))}
            </section>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}

function ActivityLibrarySearch({
  isLoading,
  onClearFilters,
  onClearSearch,
  onSearch,
  onStatusChange,
  onTemplateChange,
  status,
  template,
  total,
  value,
}: {
  isLoading: boolean;
  onClearFilters: () => void;
  onClearSearch: () => void;
  onSearch: (value: string) => void;
  onStatusChange: (value: ActivityLibraryStatus) => void;
  onTemplateChange: (value: ActivityTemplateFilter) => void;
  status: ActivityLibraryStatus;
  template: ActivityTemplateFilter;
  total: number;
  value: string;
}) {
  const normalizedValue = normalizeActivityLibrarySearch(value);
  const statusLabel = status === 'archived' ? 'archived' : 'saved';
  const hasFilters = Boolean(normalizedValue) || template !== 'all';
  const summary = hasFilters
    ? isLoading
      ? 'Filtering activities...'
      : `${total} ${total === 1 ? 'match' : 'matches'}`
    : isLoading
      ? 'Loading activities...'
      : `${total} ${statusLabel} ${total === 1 ? 'activity' : 'activities'}`;

  return (
    <section className="grid gap-4 rounded-lg border bg-card p-4 lg:grid-cols-[minmax(0,1fr)_13rem_auto] lg:items-end">
      <div className="grid gap-2">
        <label
          htmlFor="activity-library-search"
          className="font-medium text-sm"
        >
          Search activities
        </label>
        <div className="relative max-w-xl">
          <IconSearch className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
          <Input
            id="activity-library-search"
            value={value}
            placeholder="Search by title, description, or template"
            className="pl-9 pr-9"
            onChange={(event) => onSearch(event.currentTarget.value)}
          />
          {value ? (
            <button
              type="button"
              aria-label="Clear activity search"
              className="-translate-y-1/2 absolute top-1/2 right-3 text-muted-foreground transition-colors hover:text-foreground"
              onClick={onClearSearch}
            >
              <IconX className="size-4" />
            </button>
          ) : null}
        </div>
      </div>
      <div className="grid gap-2">
        <label
          htmlFor="activity-template-filter"
          className="font-medium text-sm"
        >
          Template
        </label>
        <NativeSelect
          id="activity-template-filter"
          value={template}
          onChange={(event) =>
            onTemplateChange(
              event.currentTarget.value as ActivityTemplateFilter
            )
          }
        >
          <NativeSelectOption value="all">All templates</NativeSelectOption>
          {activityTemplates.map((option) => (
            <NativeSelectOption key={option.type} value={option.type}>
              {option.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-3 lg:items-end">
        <div className="inline-flex rounded-lg border bg-background p-1">
          <Button
            type="button"
            variant={status === 'active' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onStatusChange('active')}
          >
            <IconFolder className="size-4" />
            Active
          </Button>
          <Button
            type="button"
            variant={status === 'archived' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onStatusChange('archived')}
          >
            <IconFolderOff className="size-4" />
            Archived
          </Button>
        </div>
        <p className="text-sm text-muted-foreground lg:text-right">{summary}</p>
        {hasFilters ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full bg-background lg:w-auto"
            onClick={onClearFilters}
          >
            <IconX className="size-4" />
            Clear filters
          </Button>
        ) : null}
      </div>
    </section>
  );
}

function ActivityCard({
  activity,
  libraryStatus,
}: {
  activity: ActivityCardData;
  libraryStatus: ActivityLibraryStatus;
}) {
  const navigate = useNavigate();
  const archiveMutation = useArchiveActivity();
  const duplicateMutation = useDuplicateActivity();
  const publishMutation = usePublishAssignment();
  const remixMutation = useRemixActivityTemplate();
  const restoreMutation = useRestoreActivity();
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [assignmentTitle, setAssignmentTitle] = useState(activity.title);
  const [assignmentInstructions, setAssignmentInstructions] = useState('');
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
  const [timeLimitMinutes, setTimeLimitMinutes] = useState('');
  const [expiresAtLocal, setExpiresAtLocal] = useState('');
  const previewTimeLimit = parseOptionalWholeNumber(timeLimitMinutes);
  const previewExpiresAt = parseDateTimeLocal(expiresAtLocal);
  const template = activityTemplates.find(
    (item) => item.type === activity.templateType
  );
  const isArchived = isActivityArchived(activity.status);
  const canCreateDerivedWork = canDeriveActivityWork(activity.status);
  const remixPlan = template
    ? getTemplateRemixPlan({
        content: activity.content,
        currentTemplateType: template.type,
      })
    : undefined;

  async function publishActivity() {
    if (!canCreateDerivedWork) {
      toast.error(ARCHIVED_ACTIVITY_DERIVATION_ERROR);
      return;
    }
    const title = assignmentTitle.trim();
    const attempts = Number(maxAttempts);
    if (!title) {
      toast.error('Add an assignment title before publishing.');
      return;
    }
    const instructions = assignmentInstructions.trim();
    if (!Number.isInteger(attempts) || attempts < 1 || attempts > 10) {
      toast.error('Max attempts must be a whole number from 1 to 10.');
      return;
    }
    const timeLimit = previewTimeLimit;
    if (
      timeLimitMinutes &&
      (!Number.isInteger(timeLimit) || timeLimit < 1 || timeLimit > 180)
    ) {
      toast.error('Time limit must be a whole number from 1 to 180 minutes.');
      return;
    }
    const expiresAt = previewExpiresAt ?? undefined;
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
          instructions: instructions || undefined,
          maxAttempts: attempts,
          showCorrectAnswers,
          shuffleItems,
          timeLimitSeconds: timeLimit ? timeLimit * 60 : undefined,
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
    if (!canCreateDerivedWork) {
      toast.error(ARCHIVED_ACTIVITY_DERIVATION_ERROR);
      return;
    }
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

  async function duplicateActivity() {
    if (!canCreateDerivedWork) {
      toast.error(ARCHIVED_ACTIVITY_DERIVATION_ERROR);
      return;
    }
    try {
      const result = await duplicateMutation.mutateAsync({
        activityId: activity.id,
      });
      toast.success('Activity duplicated.');
      navigate({
        to: '/dashboard/activities/$activityId',
        params: { activityId: result.id },
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Activity could not be duplicated.'
      );
    }
  }

  async function archiveActivity() {
    try {
      await archiveMutation.mutateAsync({ activityId: activity.id });
      toast.success('Activity archived.');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Activity could not be archived.'
      );
    }
  }

  async function restoreActivity() {
    try {
      await restoreMutation.mutateAsync({ activityId: activity.id });
      toast.success('Activity restored to drafts.');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Activity could not be restored.'
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
          {activity.persisted &&
          canCreateDerivedWork &&
          remixPlan?.suggestedOptions.length ? (
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
            {libraryStatus === 'active' ? (
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
            ) : null}
            {canCreateDerivedWork ? (
              <Button
                type="button"
                variant="outline"
                className="w-full bg-background sm:w-fit"
                disabled={duplicateMutation.isPending}
                onClick={duplicateActivity}
              >
                <IconCopy className="size-4" />
                Duplicate
              </Button>
            ) : null}
            {libraryStatus === 'active' ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-background sm:w-fit"
                  disabled={archiveMutation.isPending}
                  onClick={archiveActivity}
                >
                  <IconFolderOff className="size-4" />
                  Archive
                </Button>
                <Button
                  type="button"
                  className="w-full sm:w-fit"
                  disabled={publishMutation.isPending}
                  onClick={() => setPublishDialogOpen(true)}
                >
                  <IconPlus className="size-4" />
                  Publish assignment
                </Button>
              </>
            ) : (
              <>
                {isArchived ? (
                  <p className="text-sm text-muted-foreground sm:mr-auto">
                    Restore this activity before publishing, duplicating, or
                    remixing it.
                  </p>
                ) : null}
                <Button
                  type="button"
                  className="w-full sm:w-fit"
                  disabled={restoreMutation.isPending}
                  onClick={restoreActivity}
                >
                  <IconRotateClockwise className="size-4" />
                  Restore
                </Button>
              </>
            )}
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
            <div className="grid gap-2">
              <label htmlFor={`assignment-instructions-${activity.id}`}>
                Instructions
              </label>
              <Textarea
                id={`assignment-instructions-${activity.id}`}
                rows={3}
                maxLength={500}
                value={assignmentInstructions}
                placeholder="Optional student instructions"
                onChange={(event) =>
                  setAssignmentInstructions(event.currentTarget.value)
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
              <label htmlFor={`time-limit-${activity.id}`}>Time limit</label>
              <Input
                id={`time-limit-${activity.id}`}
                type="number"
                min={1}
                max={180}
                value={timeLimitMinutes}
                placeholder="No limit"
                onChange={(event) =>
                  setTimeLimitMinutes(event.currentTarget.value)
                }
              />
              <p className="text-xs leading-5 text-muted-foreground">
                Optional classroom timer in minutes. Leave blank for no time
                limit.
              </p>
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
            <div className="grid gap-2">
              <p className="font-medium text-sm">Delivery preview</p>
              <AssignmentSettingsSummary
                collectStudentName={collectStudentName}
                expiresAt={previewExpiresAt ?? null}
                instructions={assignmentInstructions.trim() || undefined}
                maxAttempts={Number(maxAttempts) || undefined}
                showCorrectAnswers={showCorrectAnswers}
                shuffleItems={shuffleItems}
                timeLimitSeconds={
                  previewTimeLimit ? previewTimeLimit * 60 : undefined
                }
              />
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

function ActivitySummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof IconFolder;
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

function formatDateTimeLocal(date: Date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function parseOptionalWholeNumber(value: string) {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : undefined;
}

function parseDateTimeLocal(value: string) {
  if (!value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
