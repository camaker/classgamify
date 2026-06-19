import { getStarterActivity, getStarterAssignment } from '@/activities/catalog';
import type { ActivitySeed, AssignmentSeed } from '@/activities/types';
import { ActivityPreview } from '@/components/activities/activity-preview';
import Container from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { websiteConfig } from '@/config/website';
import { usePublicAssignment, useSubmitAttempt } from '@/hooks/use-assignments';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';
import { cn } from '@/lib/utils';
import {
  IconCheck,
  IconDeviceGamepad2,
  IconPlayerPlay,
} from '@tabler/icons-react';
import { Link, createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

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
  const submitAttemptMutation = useSubmitAttempt();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [studentName, setStudentName] = useState('');
  const [startedAt] = useState(() => Date.now());
  const [result, setResult] = useState<AttemptSubmissionResult>();
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
  const questionCount = activity?.content.questions.length ?? 0;
  const canSubmit = Boolean(data) && questionCount > 0;
  const completedCount = useMemo(
    () =>
      activity?.content.questions.filter((question) =>
        answers[question.id]?.trim()
      ).length ?? 0,
    [activity, answers]
  );

  async function submitAnswers() {
    if (!activity || !canSubmit) {
      toast.error('This demo assignment is read-only for now.');
      return;
    }

    try {
      const response = await submitAttemptMutation.mutateAsync({
        answers: activity.content.questions.map((question) => ({
          answer: answers[question.id] ?? '',
          itemId: question.id,
        })),
        durationSeconds: Math.round((Date.now() - startedAt) / 1000),
        shareSlug: assignment?.shareId ?? shareId,
        studentName,
      });
      setResult(response.result);
      toast.success('Attempt submitted.');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Attempt could not be saved.'
      );
    }
  }
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <IconPlayerPlay className="size-4 text-primary" />
              Student runner
            </div>
            <Badge variant="secondary" className="rounded-md">
              {completedCount}/{questionCount} answered
            </Badge>
          </div>

          <div className="mt-4 grid gap-3 rounded-lg border bg-card p-3 md:grid-cols-[minmax(0,1fr)_14rem] md:items-end">
            <div>
              <label
                htmlFor="student-name"
                className="text-sm font-medium text-foreground"
              >
                Student name
              </label>
              <Input
                id="student-name"
                value={studentName}
                onChange={(event) => setStudentName(event.target.value)}
                placeholder={
                  assignment.settings.collectStudentName
                    ? 'Type your name'
                    : 'Optional'
                }
                className="mt-2"
              />
            </div>
            {result ? (
              <div className="rounded-lg border bg-primary/5 p-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <IconCheck className="size-4 text-primary" />
                  Score submitted
                </div>
                <p className="mt-2 text-2xl font-semibold">
                  {result.earnedPoints}/{result.totalPoints}
                </p>
                <p className="text-xs text-muted-foreground">
                  {result.accuracy}% accuracy
                </p>
              </div>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3">
            {activity.content.questions.map((question, index) => (
              <div key={question.id} className="rounded-lg border bg-card p-3">
                <p className="text-sm font-medium">
                  {index + 1}. {question.prompt}
                </p>
                <Input
                  value={answers[question.id] ?? ''}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      [question.id]: event.target.value,
                    }))
                  }
                  placeholder="Type your answer"
                  className="mt-3"
                />
                {result && assignment.settings.showCorrectAnswers ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Correct answer: {question.answer}
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          <Button
            type="button"
            className="mt-4 w-full sm:w-fit"
            disabled={!canSubmit || submitAttemptMutation.isPending}
            onClick={submitAnswers}
          >
            <IconCheck className="size-4" />
            Submit answers
          </Button>
          {!canSubmit ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Demo assignments are preview-only until they are saved from a
              teacher account.
            </p>
          ) : null}
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

type AttemptSubmissionResult = {
  accuracy: number;
  earnedPoints: number;
  totalPoints: number;
};
