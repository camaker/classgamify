import { ActivityPreview } from '@/components/activities/activity-preview';
import Container from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { getStarterActivity, getStarterAssignment } from '@/activities/catalog';
import { websiteConfig } from '@/config/website';
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
        'Preview the public student activity runner and assignment shell.',
    }),
  component: PlayPage,
});

function PlayPage() {
  const { shareId } = Route.useParams();
  const assignment = getStarterAssignment(shareId);
  const activity = getStarterActivity(assignment.activityId);

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
              This is the public assignment shell. The next implementation pass
              fills in the interactive game runner, student identity prompt,
              scoring, and attempt submission.
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
