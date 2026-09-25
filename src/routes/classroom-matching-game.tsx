import { getStarterActivities } from '@/activities/catalog';
import type { ActivityPair } from '@/activities/types';
import Container from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { websiteConfig } from '@/config/website';
import { getLocale } from '@/lib/locale';
import { seo } from '@/lib/seo';
import { cn } from '@/lib/utils';
import {
  IconArrowRight,
  IconArrowsExchange,
  IconCards,
  IconLayoutGrid,
} from '@tabler/icons-react';
import { createFileRoute, notFound } from '@tanstack/react-router';

const path = '/classroom-matching-game';
const title = `Classroom Matching Game for Teachers | ${websiteConfig.metadata?.name}`;
const description =
  'Make a classroom matching game from words and their meanings, categories, or definitions. See a real pair set and open an editable matching-pairs template.';

export const Route = createFileRoute('/classroom-matching-game')({
  loader: () => {
    if (getLocale() !== 'en') throw notFound();

    const activity = getStarterActivities().find(
      (item) => item.id === 'english-food-quiz'
    );
    if (!activity?.content.pairs.length) throw notFound();

    return { pairs: activity.content.pairs.slice(0, 4) };
  },
  head: () =>
    seo(path, {
      title,
      description,
      alternateLocales: ['en'],
      canonicalLocale: 'en',
      robots: getLocale() === 'en' ? undefined : 'noindex,follow',
    }),
  component: ClassroomMatchingGamePage,
});

function ClassroomMatchingGamePage() {
  const { pairs } = Route.useLoaderData();

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
          <span className="text-foreground">Matching pairs</span>
        </nav>

        <section className="grid gap-10 border-b pb-14 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.85fr)] lg:items-center">
          <div className="space-y-6">
            <Badge variant="outline" className="rounded-md border-primary/30">
              <IconArrowsExchange className="size-3.5" />
              Matching pairs guide
            </Badge>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight md:text-5xl">
                Make a classroom matching game from pairs students should know
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                Match a word to a category, a term to a definition, or a concept
                to its explanation. Students select a prompt card and then a
                matching choice on the published assignment. You review their
                submitted attempts in your teacher workspace.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'w-fit rounded-lg'
                )}
                href="/create?source=templates&template=matching-pairs"
              >
                Create a matching game
                <IconArrowRight className="size-4" />
              </a>
              <a
                className={cn(
                  buttonVariants({ size: 'lg', variant: 'outline' }),
                  'w-fit rounded-lg bg-background'
                )}
                href="/templates"
              >
                Browse all templates
              </a>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              Opening the editor loads editable sample pairs. A teacher account
              is needed to save the activity and publish a student link.
            </p>
          </div>

          <aside className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2 border-b pb-4 text-primary">
              <IconCards className="size-5" aria-hidden="true" />
              <span className="font-medium text-sm">
                Example teacher pair set
              </span>
            </div>
            <h2 className="mt-5 text-lg font-semibold">
              Food words and categories
            </h2>
            <p className="mt-2 text-muted-foreground text-sm leading-6">
              These pairs come from ClassGamify's food-words starter content.
              Replace them with the relationships from your own lesson.
            </p>
            <table className="mt-5 w-full text-left text-sm">
              <caption className="sr-only">
                Example food word and category pairs
              </caption>
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="pb-2 font-medium" scope="col">
                    Prompt card
                  </th>
                  <th className="pb-2 font-medium" scope="col">
                    Matching choice
                  </th>
                </tr>
              </thead>
              <tbody>
                {pairs.map((pair: ActivityPair) => (
                  <tr className="border-b last:border-0" key={pair.id}>
                    <td className="py-3 font-medium">{pair.left}</td>
                    <td className="py-3 text-muted-foreground">{pair.right}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-xs leading-5 text-muted-foreground">
              This is the teacher's answer list. The student board presents
              prompt and choice cards for students to connect.
            </p>
          </aside>
        </section>

        <section aria-labelledby="matching-plan-heading" className="space-y-7">
          <div className="max-w-3xl space-y-3">
            <h2 id="matching-plan-heading" className="text-3xl font-semibold">
              Plan a pair set around one learning goal
            </h2>
            <p className="leading-7 text-muted-foreground">
              The sample checks whether students can connect food words to
              categories. For a science lesson, you might use a term and its
              definition. Keep each choice distinct so students can reason about
              the relationship, then check the pairs in the editor before
              publishing.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-card p-6">
              <IconLayoutGrid
                className="size-6 text-primary"
                aria-hidden="true"
              />
              <h3 className="mt-4 text-xl font-semibold">What students do</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Each prompt appears as a card beside a set of choices. A student
                picks a prompt, selects its match, and continues through the
                pair set before submitting the assignment.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <IconArrowsExchange
                className="size-6 text-primary"
                aria-hidden="true"
              />
              <h3 className="mt-4 text-xl font-semibold">
                What teachers review
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                The published link records submitted attempts. Review the
                results to find the pairs your class confuses, then revise the
                lesson or prepare a follow-up activity.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border bg-muted/30 p-6 md:p-8">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(16rem,0.65fr)] md:items-end">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">
                From a pair list to a student assignment
              </h2>
              <ol className="list-inside list-decimal space-y-2 text-sm leading-7 text-muted-foreground">
                <li>
                  Open the matching-pairs template and edit its example rows.
                </li>
                <li>
                  Save the activity, then publish and share an assignment link.
                </li>
                <li>
                  Use submitted results to decide which pairs need review.
                </li>
              </ol>
            </div>
            <div className="space-y-4">
              <a
                className={cn(buttonVariants(), 'w-full rounded-lg')}
                href="/create?source=templates&template=matching-pairs"
              >
                Open the matching-pairs editor
                <IconArrowRight className="size-4" />
              </a>
              <p className="text-center text-muted-foreground text-sm">
                Teaching with answer choices?{' '}
                <a
                  className="font-medium text-primary underline-offset-4 hover:underline"
                  href="/classroom-quiz-game"
                >
                  Explore the classroom quiz
                </a>
                .
              </p>
            </div>
          </div>
        </section>
      </div>
    </Container>
  );
}
