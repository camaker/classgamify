import { getStarterActivities } from '@/activities/catalog';
import Container from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { websiteConfig } from '@/config/website';
import { getLocale } from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';
import { cn } from '@/lib/utils';
import {
  IconArrowRight,
  IconCircleCheck,
  IconClipboardList,
  IconPlayerPlay,
} from '@tabler/icons-react';
import { createFileRoute, notFound } from '@tanstack/react-router';

const path = '/classroom-quiz-game';
const title = `Classroom Quiz Game for Teachers | ${websiteConfig.metadata?.name}`;
const description =
  'Build a classroom quiz game from your own review questions. See a real food-words example, try the student quiz, then create, assign, and review your activity.';

export const Route = createFileRoute('/classroom-quiz-game')({
  loader: () => {
    if (getLocale() !== 'en') throw notFound();

    const activity = getStarterActivities().find(
      (item) => item.id === 'english-food-quiz'
    );
    const question = activity?.content.questions[0];
    if (!activity || !question) throw notFound();

    return {
      activityTitle: activity.title,
      estimatedMinutes: activity.estimatedMinutes,
      options: question.options?.map((option) => option.text) ?? [],
      prompt: question.prompt,
    };
  },
  head: () =>
    seo(path, {
      title,
      description,
      alternateLocales: ['en'],
      canonicalLocale: 'en',
      robots: getLocale() === 'en' ? undefined : 'noindex,follow',
    }),
  component: ClassroomQuizGamePage,
});

function ClassroomQuizGamePage() {
  const example = Route.useLoaderData();

  return (
    <Container className="px-4 py-10 md:py-16">
      <div className="mx-auto max-w-6xl space-y-16 pb-16">
        <nav aria-label="Breadcrumb" className="text-muted-foreground text-sm">
          <a
            className="hover:text-foreground hover:underline"
            href="/templates"
          >
            Activity templates
          </a>
          <span aria-hidden="true" className="mx-2">
            /
          </span>
          <span className="text-foreground">Classroom quiz</span>
        </nav>

        <section className="grid gap-10 border-b pb-14 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.8fr)] lg:items-center">
          <div className="space-y-6">
            <Badge variant="outline" className="rounded-md border-primary/30">
              <IconClipboardList className="size-3.5" />
              Teacher activity guide
            </Badge>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight md:text-5xl">
                Turn review questions into a classroom quiz game
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                Start with a question and answer choices, then give students a
                published link they can complete at their own pace. ClassGamify
                keeps the activity, assignment, attempts, and teacher results
                connected.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'w-fit rounded-lg'
                )}
                href="/create?source=templates&template=quiz"
              >
                Create a classroom quiz
                <IconArrowRight className="size-4" />
              </a>
              <a
                className={cn(
                  buttonVariants({ size: 'lg', variant: 'outline' }),
                  'w-fit rounded-lg bg-background'
                )}
                href={Routes.StudentPreview}
              >
                <IconPlayerPlay className="size-4" />
                Try the student quiz
              </a>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              The public food-words quiz is available to try. Saving your own
              activity and publishing an assignment use a teacher account.
            </p>
          </div>

          <aside className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-4">
              <span className="font-medium text-sm text-primary">
                Real starter question
              </span>
              <span className="text-muted-foreground text-xs">
                {example.estimatedMinutes} minute activity
              </span>
            </div>
            <h2 className="mt-5 text-lg font-semibold">
              {example.activityTitle}
            </h2>
            <p className="mt-5 text-base font-medium">{example.prompt}</p>
            <ol className="mt-4 grid gap-2" type="A">
              {example.options.map((option: string, index: number) => (
                <li
                  className="flex gap-3 rounded-lg border bg-background px-4 py-3 text-sm"
                  key={`${option}-${index}`}
                >
                  <span className="font-semibold text-primary">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span>{option}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-xs leading-5 text-muted-foreground">
              This is a preview of the question and choices. Open the student
              quiz to answer and submit it.
            </p>
          </aside>
        </section>

        <section aria-labelledby="quiz-build-heading" className="space-y-7">
          <div className="max-w-3xl space-y-3">
            <h2 id="quiz-build-heading" className="text-3xl font-semibold">
              Build a quiz that tells you what to teach next
            </h2>
            <p className="text-muted-foreground leading-7">
              A short quiz works well after a vocabulary lesson or before a unit
              review. In the food-words starter, students choose among plausible
              words rather than just recognizing a picture. You can replace the
              sample with your own subject, grade band, questions, choices, and
              explanations in the editor.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <GuideStep
              number="01"
              title="Choose the quiz template"
              detail="The create page opens an editable food-words scaffold. Replace its sample questions with the exact concepts your class practiced."
            />
            <GuideStep
              number="02"
              title="Publish an assignment link"
              detail="Save the activity in your teacher workspace, set the assignment rules, and share the published link with students."
            />
            <GuideStep
              number="03"
              title="Review attempts"
              detail="After students submit, inspect scores and question-level results to see which concept deserves another example."
            />
          </div>
        </section>

        <section className="grid gap-8 rounded-xl border bg-muted/30 p-6 md:grid-cols-[minmax(0,1fr)_minmax(16rem,0.7fr)] md:p-8">
          <div className="space-y-3">
            <IconCircleCheck
              className="size-6 text-primary"
              aria-hidden="true"
            />
            <h2 className="text-2xl font-semibold">
              A practical first quiz for tomorrow's class
            </h2>
            <p className="leading-7 text-muted-foreground">
              Pick three terms students met today. Ask one clear question per
              term and give two or three distinct choices. Share the link as an
              exit ticket, then use the missed questions to start tomorrow's
              reteaching. The public food-words demo shows the student side of
              this flow before you create anything.
            </p>
          </div>
          <div className="space-y-4 self-center">
            <a
              className={cn(buttonVariants(), 'w-full rounded-lg')}
              href="/create?source=templates&template=quiz"
            >
              Start with the quiz scaffold
              <IconArrowRight className="size-4" />
            </a>
            <p className="text-center text-muted-foreground text-sm">
              Need vocabulary or definition pairs instead?{' '}
              <a
                className="font-medium text-primary underline-offset-4 hover:underline"
                href="/classroom-matching-game"
              >
                See the matching game guide
              </a>
              .
            </p>
          </div>
        </section>
      </div>
    </Container>
  );
}

function GuideStep({
  detail,
  number,
  title,
}: {
  detail: string;
  number: string;
  title: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <span className="text-primary text-sm font-semibold">{number}</span>
      <h3 className="mt-3 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p>
    </div>
  );
}
