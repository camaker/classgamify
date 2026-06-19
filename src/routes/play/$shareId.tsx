import { getStarterActivity, getStarterAssignment } from '@/activities/catalog';
import type { ActivitySeed, AssignmentSeed } from '@/activities/types';
import { ActivityPreview } from '@/components/activities/activity-preview';
import Container from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { websiteConfig } from '@/config/website';
import { usePublicAssignment } from '@/hooks/use-assignments';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';
import { cn } from '@/lib/utils';
import { IconDeviceGamepad2, IconPlayerPlay } from '@tabler/icons-react';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/play/$shareId')({
  head: ({ params }) =>
    seo(`/play/${params.shareId}`, {
      title: `Student activity | ${websiteConfig.metadata?.name}`,
      description:
        'Open a public student activity runner from a teacher assignment link.',
    }),
  component: PlayPage,
});

function PlayPage() {
  const { shareId } = Route.useParams();
  const { data, isLoading } = usePublicAssignment(shareId);
  const starterAssignment = getStarterAssignment(shareId);
  const starterActivity = getStarterActivity(starterAssignment.activityId);
  const assignment = data
    ? mapPersistedAssignment(data)
    : shareId === starterAssignment.shareId
      ? starterAssignment
      : undefined;
  const activity = data
    ? mapPersistedActivity(data)
    : assignment
      ? starterActivity
      : undefined;

  if (isLoading) {
    return (
      <Container className="px-4 py-10 md:py-14">
        <div className="mx-auto max-w-6xl rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Loading student activity...
          </p>
        </div>
      </Container>
    );
  }

  if (!assignment || !activity) {
    return (
      <Container className="px-4 py-10 md:py-14">
        <div className="mx-auto max-w-3xl rounded-lg border bg-card p-6">
          <Badge variant="outline" className="rounded-md border-primary/30">
            <IconDeviceGamepad2 className="size-3.5" />
            Student play route
          </Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">
            Assignment not found
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            This link may have been unpublished, closed, or typed incorrectly.
          </p>
          <Link
            to={Routes.Templates}
            className={cn(buttonVariants(), 'mt-5 w-fit')}
          >
            Browse templates
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="px-4 py-10 md:py-14">
      <div className="mx-auto max-w-6xl space-y-8 pb-16">
        <section className="grid gap-4 rounded-lg border bg-card p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="min-w-0 space-y-3">
            <Badge variant="outline" className="rounded-md border-primary/30">
              <IconDeviceGamepad2 className="size-3.5" />
              Student play route
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight">
              {assignment.title}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              This public assignment loads from the teacher share link. The next
              implementation pass fills in student identity, scoring, and
              attempt submission.
            </p>
          </div>
          <Link
            to={Routes.Create}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'w-fit bg-background'
            )}
          >
            Teacher view
          </Link>
        </section>

        <div className="rounded-lg border bg-muted/20 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <IconPlayerPlay className="size-4 text-primary" />
            Student runner placeholder
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-3">
            {activity.content.questions.map((question) => (
              <div key={question.id} className="rounded-lg border bg-card p-3">
                <p className="text-sm font-medium">{question.prompt}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Correct answer: {question.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        <ActivityPreview activity={activity} assignment={assignment} compact />
      </div>
    </Container>
  );
}

function mapPersistedActivity(data: NonNullable<PublicAssignmentData>) {
  const content = data.activity.contentJson;

  return {
    content,
    description: data.activity.description ?? '',
    estimatedMinutes: estimateMinutes(content.questions.length),
    id: data.activity.id,
    status: data.activity.visibility,
    templateType: data.activity.templateType,
    title: data.activity.title,
  } satisfies ActivitySeed;
}

function mapPersistedAssignment(data: NonNullable<PublicAssignmentData>) {
  return {
    activityId: data.activity.id,
    averageScore: 0,
    completions: 0,
    id: data.assignment.id,
    settings: data.assignment.settingsJson,
    shareId: data.assignment.shareSlug,
    status: data.assignment.status,
    title: data.assignment.title,
  } satisfies AssignmentSeed;
}

function estimateMinutes(questionCount: number) {
  return Math.max(5, Math.min(20, questionCount * 2));
}

type PublicAssignmentData = ReturnType<typeof usePublicAssignment>['data'];
