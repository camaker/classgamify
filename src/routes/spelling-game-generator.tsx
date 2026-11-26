import Container from '@/components/layout/container';
import {
  GuideFaqSection,
  GuideStepCard,
  RelatedGuides,
} from '@/components/page/guide-sections';
import { SpellingPractice } from '@/components/page/spelling-practice';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
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
import { SPELLING_GUIDE_FAQS } from '@/pages/guide-faq-content';
import { IconAbc, IconArrowRight } from '@tabler/icons-react';
import { createFileRoute, notFound } from '@tanstack/react-router';

const path = '/spelling-game-generator';
const title = 'Spelling Game Generator: Paste Words, Practice Now';
const description =
  'Free spelling game generator for teachers. Paste a word list and practice spelling in your browser right away, then save it as a student link with scores.';

export const Route = createFileRoute('/spelling-game-generator')({
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
            { name: 'Spelling game generator', path },
          ]),
          faqPageJsonLd({ faqs: SPELLING_GUIDE_FAQS, path }),
        ])
      ),
    ],
  }),
  component: SpellingGameGeneratorPage,
});

function SpellingGameGeneratorPage() {
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
          <span className="text-foreground">Spelling game generator</span>
        </nav>

        <section className="space-y-8 border-b pb-14">
          <div className="space-y-4">
            <Badge variant="outline" className="rounded-md border-primary/30">
              <IconAbc className="size-3.5" />
              Free tool, no account needed
            </Badge>
            <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight md:text-5xl">
              Spelling game generator for your word list
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              Paste your spelling words below and practice right away. Each word
              shows its first letter and its length, and you type the rest. The
              practice runs in your browser and nothing is saved.
            </p>
          </div>
          <SpellingPractice />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              className={cn(buttonVariants({ size: 'lg' }), 'w-fit rounded-lg')}
              href="/create?source=templates&template=listening"
            >
              Save as a dictation activity
              <IconArrowRight className="size-4" />
            </a>
            <a
              className={cn(
                buttonVariants({ size: 'lg', variant: 'outline' }),
                'w-fit rounded-lg bg-background'
              )}
              href="/create?source=templates&template=fill-blank"
            >
              Save as fill in the blank
            </a>
            <p className="text-sm leading-6 text-muted-foreground">
              A teacher account saves your list, gives students one link, and
              shows each score.
            </p>
          </div>
        </section>

        <section aria-labelledby="spelling-steps-heading" className="space-y-7">
          <div className="max-w-3xl space-y-3">
            <h2 id="spelling-steps-heading" className="text-3xl font-semibold">
              From a word list to student spelling scores
            </h2>
            <p className="leading-7 text-muted-foreground">
              Practice on this page is for you or one student at a time. To see
              scores for a whole class, turn the same list into an assignment.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <GuideStepCard
              number="01"
              title="Try the list on this page"
              detail="Paste the words, check the hints, and use the hear button to confirm each word sounds the way you expect."
            />
            <GuideStepCard
              number="02"
              title="Save it as an activity"
              detail="Open the listening template for dictation or the fill in the blank template for words in sentences, replace the example, and save it in your teacher workspace."
            />
            <GuideStepCard
              number="03"
              title="Share one link and read the results"
              detail="Students open the link without an account. After they submit, the results show each score and the words that were missed."
            />
          </div>
        </section>

        <section className="grid gap-4 rounded-xl border bg-muted/30 p-6 md:p-8">
          <h2 className="text-2xl font-semibold">
            Spelling lists that work well
          </h2>
          <p className="max-w-3xl leading-7 text-muted-foreground">
            Eight to twelve words is a good length for daily practice. Group
            words by pattern, such as silent letters or doubled consonants, so
            students notice the pattern as well as the word. For dictation, the{' '}
            <a
              className="font-medium text-primary underline-offset-4 hover:underline"
              href="/templates/listening"
            >
              listening template
            </a>{' '}
            reads each sentence aloud and students type the key word. To
            practice words inside sentences, use the{' '}
            <a
              className="font-medium text-primary underline-offset-4 hover:underline"
              href="/templates/fill-blank"
            >
              fill blank template
            </a>
            . For multiple-choice checks use the{' '}
            <a
              className="font-medium text-primary underline-offset-4 hover:underline"
              href="/classroom-quiz-game"
            >
              classroom quiz game
            </a>
            , for a printable version try the{' '}
            <a
              className="font-medium text-primary underline-offset-4 hover:underline"
              href="/worksheets"
            >
              worksheet generator
            </a>
            , or{' '}
            <a
              className="font-medium text-primary underline-offset-4 hover:underline"
              href="/templates"
            >
              browse all classroom game templates
            </a>
            .
          </p>
        </section>

        <GuideFaqSection faqs={SPELLING_GUIDE_FAQS} headingId="spelling-faq" />

        <RelatedGuides
          links={[
            {
              href: '/review-game-for-classroom',
              label: 'Review game for the classroom',
              detail: 'Turn a unit review into a game students play.',
            },
            {
              href: '/classroom-matching-game',
              label: 'Matching game maker',
              detail: 'Match words with their meanings.',
            },
            {
              href: '/worksheets',
              label: 'Matching worksheet generator',
              detail: 'Make a worksheet students finish online or on paper.',
            },
          ]}
        />
      </div>
    </Container>
  );
}
