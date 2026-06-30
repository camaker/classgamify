import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  buildActivityPreviewViewModel,
  type ActivityPreviewAction,
  type ActivityPreviewActionIcon,
  type ActivityPreviewPanel,
} from '@/activities/preview-view';
import type { ActivitySeed, AssignmentSeed } from '@/activities/types';
import { m } from '@/locale/paraglide/messages';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import {
  IconEdit,
  IconCards,
  IconChartBar,
  IconClock,
  IconDeviceGamepad2,
  IconListCheck,
  IconShare3,
  IconSparkles,
  IconSwitchHorizontal,
  IconUsers,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';

type ActivityPreviewProps = {
  activity: ActivitySeed;
  assignment?: AssignmentSeed;
  compact?: boolean;
  hideAnswers?: boolean;
  panel?: ActivityPreviewPanel;
};

export function ActivityPreview({
  activity,
  assignment,
  compact = false,
  hideAnswers = false,
  panel,
}: ActivityPreviewProps) {
  const previewView = buildActivityPreviewViewModel({
    activity,
    assignment,
    panel,
  });

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <Card className="rounded-lg">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-md">
              <IconDeviceGamepad2 className="size-3.5" />
              {previewView.templateName}
            </Badge>
            <Badge variant="secondary" className="rounded-md">
              {previewView.content.subject}
            </Badge>
            <Badge variant="secondary" className="rounded-md">
              {previewView.content.gradeBand}
            </Badge>
          </div>
          <CardTitle>
            <h2 className="text-xl font-semibold tracking-tight">
              {previewView.title}
            </h2>
          </CardTitle>
          <CardDescription>
            <p>{previewView.description}</p>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-start gap-2">
              <IconSparkles className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium">
                  {m.activity_preview_content_title()}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {previewView.content.learningGoal}
                </p>
              </div>
            </div>
          </div>

          {!compact && !hideAnswers && (
            <div className="grid gap-3 md:grid-cols-3">
              <PreviewPanel
                title={m.activity_preview_questions_title()}
                icon={IconListCheck}
              >
                {previewView.content.visibleQuestions.map((question) => (
                  <li key={question.id}>{question.summaryText}</li>
                ))}
              </PreviewPanel>
              <PreviewPanel
                title={m.activity_preview_pairs_title()}
                icon={IconCards}
              >
                {previewView.content.visiblePairs.map((pair) => (
                  <li key={pair.id}>{pair.summaryText}</li>
                ))}
              </PreviewPanel>
              <PreviewPanel
                title={m.activity_preview_groups_title()}
                icon={IconSwitchHorizontal}
              >
                {previewView.content.visibleGroups.map((group) => (
                  <li key={group.id}>{group.summaryText}</li>
                ))}
              </PreviewPanel>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>
            <h2 className="text-base font-semibold">
              {previewView.panel.title}
            </h2>
          </CardTitle>
          <CardDescription>
            <p>{previewView.panel.description}</p>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <MetricRow
            icon={IconClock}
            label={m.activity_preview_estimated_time_label()}
            value={previewView.metrics.estimatedTime}
          />
          <MetricRow
            icon={IconUsers}
            label={m.activity_preview_classroom_mode_label()}
            value={previewView.metrics.classroomMode}
          />
          <MetricRow
            icon={IconChartBar}
            label={m.activity_preview_result_target_label()}
            value={previewView.metrics.resultTarget}
          />
          {previewView.panel.actions?.length ? (
            <div className="mt-2 flex flex-col gap-2">
              {previewView.panel.actions.map((action) => (
                <ActivityPreviewActionLink action={action} key={action.id} />
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function ActivityPreviewActionLink({
  action,
}: {
  action: ActivityPreviewAction;
}) {
  const Icon = activityPreviewActionIcons[action.icon ?? 'sparkles'];
  const className = cn(
    buttonVariants(
      action.variant === 'outline' ? { variant: 'outline' } : undefined
    ),
    action.variant === 'outline' && 'bg-background',
    'w-full'
  );

  if (action.href) {
    return (
      <a href={action.href} className={className}>
        <Icon className="size-4" />
        {action.label}
      </a>
    );
  }

  return (
    <Link to={action.to ?? Routes.Create} className={className}>
      <Icon className="size-4" />
      {action.label}
    </Link>
  );
}

const activityPreviewActionIcons = {
  edit: IconEdit,
  share: IconShare3,
  sparkles: IconSparkles,
} satisfies Record<ActivityPreviewActionIcon, typeof IconSparkles>;

function PreviewPanel({
  children,
  icon: Icon,
  title,
}: {
  children: React.ReactNode;
  icon: typeof IconListCheck;
  title: string;
}) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Icon className="size-4 text-primary" />
        {title}
      </div>
      <ul className="mt-2 space-y-1 text-xs leading-5 text-muted-foreground">
        {children}
      </ul>
    </div>
  );
}

function MetricRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof IconClock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/20 p-3">
      <Icon className="size-4 text-primary" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
