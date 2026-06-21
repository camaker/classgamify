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
  formatActivityTemplateClassroomMode,
  getTemplateByType,
} from '@/activities/catalog';
import type { ActivitySeed, AssignmentSeed } from '@/activities/types';
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

type ActivityPreviewAction = {
  href?: string;
  icon?: ActivityPreviewActionIcon;
  label: string;
  to?: string;
  variant?: 'default' | 'outline';
};

type ActivityPreviewActionIcon = 'edit' | 'share' | 'sparkles';

type ActivityPreviewPanel = {
  actions?: ActivityPreviewAction[];
  description: string;
  title: string;
};

export function ActivityPreview({
  activity,
  assignment,
  compact = false,
  hideAnswers = false,
  panel,
}: ActivityPreviewProps) {
  const template = getTemplateByType(activity.templateType);
  const visibleQuestions = activity.content.questions.slice(0, 3);
  const visiblePairs = activity.content.pairs.slice(0, 4);
  const visibleGroups = activity.content.groups.slice(0, 3);
  const previewPanel = panel ?? defaultActivityPreviewPanel;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <Card className="rounded-lg">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-md">
              <IconDeviceGamepad2 className="size-3.5" />
              {template.name}
            </Badge>
            <Badge variant="secondary" className="rounded-md">
              {activity.content.subject}
            </Badge>
            <Badge variant="secondary" className="rounded-md">
              {activity.content.gradeBand}
            </Badge>
          </div>
          <CardTitle>
            <h2 className="text-xl font-semibold tracking-tight">
              {activity.title}
            </h2>
          </CardTitle>
          <CardDescription>
            <p>{activity.description}</p>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-start gap-2">
              <IconSparkles className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium">Reusable activity content</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {activity.content.learningGoal}
                </p>
              </div>
            </div>
          </div>

          {!compact && !hideAnswers && (
            <div className="grid gap-3 md:grid-cols-3">
              <PreviewPanel title="Questions" icon={IconListCheck}>
                {visibleQuestions.map((question) => (
                  <li key={question.id}>{question.prompt}</li>
                ))}
              </PreviewPanel>
              <PreviewPanel title="Pairs" icon={IconCards}>
                {visiblePairs.map((pair) => (
                  <li key={pair.id}>
                    {pair.left}
                    {' -> '}
                    {pair.right}
                  </li>
                ))}
              </PreviewPanel>
              <PreviewPanel title="Groups" icon={IconSwitchHorizontal}>
                {visibleGroups.map((group) => (
                  <li key={group.id}>
                    {group.label}: {group.items.join(', ')}
                  </li>
                ))}
              </PreviewPanel>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>
            <h2 className="text-base font-semibold">{previewPanel.title}</h2>
          </CardTitle>
          <CardDescription>
            <p>{previewPanel.description}</p>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <MetricRow
            icon={IconClock}
            label="Estimated time"
            value={`${activity.estimatedMinutes} min`}
          />
          <MetricRow
            icon={IconUsers}
            label="Classroom mode"
            value={formatActivityTemplateClassroomMode(template.classroomMode)}
          />
          <MetricRow
            icon={IconChartBar}
            label="Result target"
            value={
              assignment
                ? `${assignment.completions} completions · ${assignment.averageScore}% avg`
                : 'completion + score'
            }
          />
          {previewPanel.actions?.length ? (
            <div className="mt-2 flex flex-col gap-2">
              {previewPanel.actions.map((action) => (
                <ActivityPreviewActionLink
                  action={action}
                  key={`${action.label}-${action.to ?? action.href}`}
                />
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

const defaultActivityPreviewPanel = {
  actions: [
    {
      icon: 'sparkles',
      label: 'Create activity',
      to: Routes.Create,
    },
    {
      icon: 'share',
      label: 'Open student preview',
      to: Routes.PlayDemo,
      variant: 'outline',
    },
  ],
  description:
    'The same activity can become class play, homework, or a printable follow-up once the template runner is filled in.',
  title: 'Publish path',
} satisfies ActivityPreviewPanel;

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
