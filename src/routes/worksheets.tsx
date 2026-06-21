import Container from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
  worksheetModeDefinitions,
  type WorksheetModeDefinition,
  type WorksheetModeTemplate,
} from '@/activities/worksheet-modes';
import {
  buildWorksheetHeroActions,
  buildWorksheetModeEntryAction,
} from '@/activities/template-entry';
import { websiteConfig } from '@/config/website';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';
import { cn } from '@/lib/utils';
import {
  IconArrowRight,
  IconCategory2,
  IconClipboardText,
  IconDownload,
  IconHeadphones,
  IconLayoutColumns,
  IconListDetails,
  IconPencilPlus,
  type TablerIcon,
} from '@tabler/icons-react';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/worksheets')({
  head: () =>
    seo('/worksheets', {
      title: `Worksheet modes | ${websiteConfig.metadata?.name}`,
      description:
        'Create worksheet-style classroom activities with fill blanks, line matching, listening prompts, group sorting, assignment links, and teacher results.',
    }),
  component: WorksheetsPage,
});

function WorksheetsPage() {
  const workflow = [
    'Paste lesson material once into questions, pairs, groups, vocabulary, and notes.',
    'Choose a worksheet-style template and review the scaffold before saving.',
    'Publish a student assignment link with attempts, timer, answer reveal, and close time.',
    'Review submissions, accepted answers, reteach priorities, and CSV exports.',
  ];

  const resultSignals = [
    'Attempt summaries',
    'Accepted answer alternatives',
    'Reteach priorities',
    'CSV export',
  ];
  const heroActions = buildWorksheetHeroActions(worksheetModeDefinitions);

  return (
    <Container className="px-4 py-12 md:py-16">
      <div className="mx-auto max-w-6xl space-y-12 pb-16">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center">
          <div className="min-w-0 space-y-6">
            <Badge variant="outline" className="rounded-md border-primary/30">
              <IconListDetails className="size-3.5" />
              Liveworksheets-style modes
            </Badge>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-balance md:text-5xl">
                Worksheet modes for the same activity content.
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
                ClassGamify treats fill-in practice, line matching, listening,
                and classification as playable assignment templates. Teachers
                create reusable content once, publish a student link, and review
                results without exposing answer keys before submission.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to={Routes.Create}
                search={heroActions[0].search}
                className={cn(buttonVariants({ size: 'lg' }), 'rounded-lg')}
              >
                <IconPencilPlus className="size-4" />
                {heroActions[0].label}
              </Link>
              <Link
                to={Routes.Create}
                search={heroActions[1].search}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'rounded-lg bg-background'
                )}
              >
                {heroActions[1].label}
                <IconArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-5">
            <p className="text-sm font-medium text-muted-foreground">
              Worksheet delivery loop
            </p>
            <ol className="mt-4 space-y-3">
              {workflow.map((item, index) => (
                <li
                  key={item}
                  className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-3 text-sm leading-6"
                >
                  <span className="flex size-7 items-center justify-center rounded-lg border bg-background text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {worksheetModeDefinitions.map((mode) => (
            <WorksheetModeCard key={mode.title} mode={mode} />
          ))}
        </section>

        <section className="grid gap-4 rounded-lg border bg-card p-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-center">
          <div className="min-w-0">
            <div className="flex size-9 items-center justify-center rounded-lg border bg-background text-primary">
              <IconDownload className="size-4" />
            </div>
            <h2 className="mt-4 text-xl font-semibold">
              Printable follow-up can build on the same assignment record.
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              The first product pass focuses on interactive worksheets with
              scoring, attempts, accepted answers, and result exports. Printable
              practice and teacher-uploaded worksheet extraction should extend
              the same activity snapshot and results model instead of creating a
              separate worksheet product.
            </p>
          </div>

          <div className="grid gap-2">
            {resultSignals.map((signal) => (
              <div
                key={signal}
                className="rounded-lg border bg-background px-3 py-2 text-sm font-medium"
              >
                {signal}
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-lg border bg-card p-5 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold">
              Want a different game view for the same lesson?
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Browse the full template library to switch the same structured
              content into quiz, matching, pairs, open-box, and group play.
            </p>
          </div>
          <Link
            to={Routes.Templates}
            className={cn(buttonVariants(), 'w-full md:w-auto')}
          >
            Browse templates
            <IconArrowRight className="size-4" />
          </Link>
        </section>
      </div>
    </Container>
  );
}

function WorksheetModeCard({ mode }: { mode: WorksheetModeDefinition }) {
  const Icon = worksheetModeIcons[mode.template];
  const action = buildWorksheetModeEntryAction(mode);

  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex size-9 items-center justify-center rounded-lg border bg-background text-primary">
        <Icon className="size-4" />
      </div>
      <h2 className="mt-4 font-semibold">{mode.title}</h2>
      <p className="mt-2 min-h-24 text-sm leading-6 text-muted-foreground">
        {mode.description}
      </p>
      <Link
        to={Routes.Create}
        search={action.search}
        className={cn(
          buttonVariants({ variant: 'outline' }),
          'mt-4 w-full bg-background'
        )}
      >
        {action.label}
      </Link>
    </div>
  );
}

const worksheetModeIcons = {
  'fill-blank': IconClipboardText,
  'group-sort': IconCategory2,
  'line-match': IconLayoutColumns,
  listening: IconHeadphones,
} satisfies Record<WorksheetModeTemplate, TablerIcon>;
