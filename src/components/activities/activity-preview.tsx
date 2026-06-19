import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getTemplateByType } from '@/activities/catalog';
import type { ActivitySeed, AssignmentSeed } from '@/activities/types';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import {
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
};

export function ActivityPreview({
  activity,
  assignment,
  compact = false,
}: ActivityPreviewProps) {
  const template = getTemplateByType(activity.templateType);
  const visibleQuestions = activity.content.questions.slice(0, 3);
  const visiblePairs = activity.content.pairs.slice(0, 4);
  const visibleGroups = activity.content.groups.slice(0, 3);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <Card className="rounded-lg">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-md">
              <IconDeviceGamepad2 className="size-3.5" />
              {template?.name ?? activity.templateType}
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

          {!compact && (
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
            <h2 className="text-base font-semibold">Publish path</h2>
          </CardTitle>
          <CardDescription>
            <p>
              The same activity can become class play, homework, or a printable
              follow-up once the template runner is filled in.
            </p>
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
            value={template?.classroomMode ?? 'individual'}
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
          <div className="mt-2 flex flex-col gap-2">
            <Link to={Routes.Create} className={cn(buttonVariants(), 'w-full')}>
              <IconSparkles className="size-4" />
              Create activity
            </Link>
            <Link
              to={Routes.PlayDemo}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'w-full bg-background'
              )}
            >
              <IconShare3 className="size-4" />
              Open student preview
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

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
