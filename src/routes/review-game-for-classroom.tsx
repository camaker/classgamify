import Container from '@/components/layout/container';
import {
  GuideFaqSection,
  GuideStepCard,
  RelatedGuides,
} from '@/components/page/guide-sections';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { websiteConfig } from '@/config/website';
import { getLocale } from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  graphJsonLd,
  jsonLdScript,
} from '@/lib/structured-data';
import { cn } from '@/lib/utils';
import { REVIEW_GUIDE_FAQS } from '@/pages/guide-faq-content';
import {
  IconArrowRight,
  IconPlayerPlay,
  IconRepeat,
} from '@tabler/icons-react';
import { createFileRoute, notFound } from '@tanstack/react-router';

const path = '/review-game-for-classroom';
const title = `Review Game for Classroom: Make One in Minutes | ${websiteConfig.metadata?.name}`;
const description =
  'Turn a unit review into a review game for the classroom. Pick a format, add your own questions, share one student link, and see what the class still mixes up.';

export const Route = createFileRoute('/review-game-for-classroom')({
  loader: () => {
    if (getLocale() !== 'en') throw notFound();
    return null;
  },
  head: () => ({
    ...seo(path, {
      title,
      description,
      alternateLocales: ['en'],
      canonicalLocale: 'en',
      robots: getLocale() === 'en' ? undefined : 'noindex,follow',
    }),
    scripts: [
      jsonLdScript(
        graphJsonLd([
          breadcrumbJsonLd([
            { name: 'Classroom game templates', path: Routes.Templates },
            { name: 'Review game', path },
          ]),
          faqPageJsonLd({ faqs: REVIEW_GUIDE_FAQS, path }),
        ])
      ),
    ],
  }),
  component: ReviewGameForClassroomPage,
});

const FORMATS = [
  {
    detail:
      'Facts, definitions, and grammar choices with one clear answer. Students see one question at a time.',
    href: '/classroom-quiz-game',
    name: 'Quiz',
  },
  {
    detail:
      'Terms and their meanings, words and translations. Students connect each card with its partner.',
    href: '/classroom-matching-game',
    name: 'Matching pairs',
  },
  {
    detail:
      'Categories, parts of speech, or types. Students place each item in the right group.',
    href: '/templates/group-sort',
    name: 'Group sort',
  },
  {
    detail:
      'Sentences with a missing word for grammar and vocabulary in context.',
    href: '/templates/fill-blank',
    name: 'Fill blank',
  },
  {
    detail:
      'Reveal a prompt and answer one box at a time for whole-class review.',
    href: '/templates/open-box',
    name: 'Open the box',
  },
  {
    detail: 'Students hear a sentence and pick or type the key word.',
    href: '/templates/listening',
    name: 'Listening',
  },
] as const;

function ReviewGameForClassroomPage() {
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
          <span className="text-foreground">Review game</span>
        </nav>

        <section className="space-y-6 border-b pb-14">
          <Badge variant="outline" className="rounded-md border-primary/30">
            <IconRepeat className="size-3.5" />
            Teacher activity guide
          </Badge>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight md:text-5xl">
              Review game for the classroom: turn a unit into something students
              play
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              A good review game finds out what students still mix up while
              there is time to reteach. List what the unit covered, pick a
              format that fits, and share one link. Students play in a browser
              without an account.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              className={cn(buttonVariants({ size: 'lg' }), 'w-fit rounded-lg')}
              href="/create?source=templates&template=quiz"
            >
              Make a review quiz
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
              Play a sample review
            </a>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            The sample is a public food-words quiz. Saving your own activity and
            publishing a link use a teacher account.
          </p>
        </section>

        <section aria-labelledby="review-steps-heading" className="space-y-7">
          <div className="max-w-3xl space-y-3">
            <h2 id="review-steps-heading" className="text-3xl font-semibold">
              Build a review game in three steps
            </h2>
            <p className="leading-7 text-muted-foreground">
              Keep the review short. Eight to twelve items played in five to ten
              minutes is easy to repeat, and the results tell you what to cover
              next.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <GuideStepCard
              number="01"
              title="List what students must know"
              detail="Write down eight to twelve facts, terms, or sentences from the unit. Skip anything students already answered correctly on the last quiz."
            />
            <GuideStepCard
              number="02"
              title="Pick a format and replace the example"
              detail="Every template opens with an editable example. Replace it with your own questions, word pairs, or groups, then save the activity."
            />
            <GuideStepCard
              number="03"
              title="Share the link and read the results"
              detail="Publish an assignment link for class or homework. After students submit, see which items the class missed and start there."
            />
          </div>
        </section>

        <section aria-labelledby="review-formats-heading" className="space-y-6">
          <div className="max-w-3xl space-y-3">
            <h2 id="review-formats-heading" className="text-3xl font-semibold">
              Which review game format fits your content
            </h2>
            <p className="leading-7 text-muted-foreground">
              The same lesson content can often move between templates that use
              the same kind of content, such as questions or word pairs, so you
              can try a second format without retyping.
            </p>
          </div>
          <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {FORMATS.map((format) => (
              <li key={format.href}>
                <a
                  className="block h-full rounded-lg border bg-card p-4 transition-colors hover:border-primary/50"
                  href={format.href}
                >
                  <span className="font-semibold">{format.name}</span>
                  <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                    {format.detail}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-4 rounded-xl border bg-muted/30 p-6 md:p-8">
          <h2 className="text-2xl font-semibold">
            A review plan for the day before a test
          </h2>
          <p className="max-w-3xl leading-7 text-muted-foreground">
            Share a ten-item review quiz at the start of class and give students
            five minutes. While they play, nobody waits for the slowest student.
            Afterwards open the results, pick the two items most students
            missed, and spend the next ten minutes on those. The students who
            finish early can try a matching review of the same terms.
          </p>
        </section>

        <GuideFaqSection faqs={REVIEW_GUIDE_FAQS} headingId="review-faq" />

        <RelatedGuides
          links={[
            {
              href: '/classroom-quiz-game',
              label: 'Classroom quiz game',
              detail: 'Turn review questions into a quiz students play.',
            },
            {
              href: '/classroom-matching-game',
              label: 'Matching game maker',
              detail: 'Make a matching game from terms and meanings.',
            },
            {
              href: '/spelling-game-generator',
              label: 'Spelling game generator',
              detail: 'Practice a word list in the browser.',
            },
          ]}
        />
      </div>
    </Container>
  );
}
