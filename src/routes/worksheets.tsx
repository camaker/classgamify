import Container from '@/components/layout/container';
import { WorksheetModeCard } from '@/components/activities/worksheet-mode-card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { buildWorksheetsPageViewModel } from '@/activities/entry-page-view';
import { websiteConfig } from '@/config/website';
import { m } from '@/locale/paraglide/messages';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';
import { cn } from '@/lib/utils';
import {
  IconArrowRight,
  IconDownload,
  IconListDetails,
  IconPencilPlus,
} from '@tabler/icons-react';
import { Link, createFileRoute } from '@tanstack/react-router';

type WorksheetsPageViewModel = ReturnType<typeof buildWorksheetsPageViewModel>;

export const Route = createFileRoute('/worksheets')({
  head: () =>
    seo('/worksheets', {
      title: `${m.worksheets_page_seo_title()} | ${websiteConfig.metadata?.name}`,
      description: m.worksheets_page_seo_description(),
    }),
  component: WorksheetsPage,
});

function WorksheetsPage() {
  const pageView = buildWorksheetsPageViewModel();

  return (
    <Container className="px-4 py-12 md:py-16">
      <div className="mx-auto max-w-6xl space-y-12 pb-16">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center">
          <div className="min-w-0 space-y-6">
            <Badge variant="outline" className="rounded-md border-primary/30">
              <IconListDetails className="size-3.5" />
              {pageView.hero.badgeLabel}
            </Badge>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-balance md:text-5xl">
                {pageView.hero.title}
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
                {pageView.hero.description}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {pageView.heroActions.map((action) => (
                <WorksheetHeroActionLink
                  action={action}
                  key={action.template}
                />
              ))}
            </div>
          </div>

          <div className="rounded-lg border bg-card p-5">
            <p className="text-sm font-medium text-muted-foreground">
              {m.worksheets_page_delivery_loop_title()}
            </p>
            <ol className="mt-4 space-y-3">
              {pageView.workflowSteps.map((item, index) => (
                <WorksheetWorkflowStep index={index} item={item} key={item} />
              ))}
            </ol>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {pageView.modeCards.map((mode) => (
            <WorksheetModeCard key={mode.template} mode={mode} />
          ))}
        </section>

        <section className="grid gap-4 rounded-lg border bg-card p-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-center">
          <div className="min-w-0">
            <div className="flex size-9 items-center justify-center rounded-lg border bg-background text-primary">
              <IconDownload className="size-4" />
            </div>
            <h2 className="mt-4 text-xl font-semibold">
              {pageView.printable.title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {pageView.printable.description}
            </p>
          </div>

          <div className="grid gap-2">
            {pageView.resultSignals.map((signal) => (
              <WorksheetResultSignal key={signal} signal={signal} />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-lg border bg-card p-5 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold">
              {pageView.templatesCta.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {pageView.templatesCta.description}
            </p>
          </div>
          <Link
            to={Routes.Templates}
            className={cn(buttonVariants(), 'w-full md:w-auto')}
          >
            {pageView.templatesCta.label}
            <IconArrowRight className="size-4" />
          </Link>
        </section>
      </div>
    </Container>
  );
}

function WorksheetHeroActionLink({
  action,
}: {
  action: WorksheetsPageViewModel['heroActions'][number];
}) {
  return (
    <Link
      to={action.to}
      search={action.search}
      className={cn(
        buttonVariants({
          size: 'lg',
          variant: action.isPrimary ? 'default' : 'outline',
        }),
        'rounded-lg',
        action.isPrimary ? '' : 'bg-background'
      )}
    >
      {action.isPrimary ? <IconPencilPlus className="size-4" /> : null}
      {action.label}
      {action.isPrimary ? null : <IconArrowRight className="size-4" />}
    </Link>
  );
}

function WorksheetWorkflowStep({
  index,
  item,
}: {
  index: number;
  item: string;
}) {
  return (
    <li className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-3 text-sm leading-6">
      <span className="flex size-7 items-center justify-center rounded-lg border bg-background text-xs font-semibold text-primary">
        {index + 1}
      </span>
      <span>{item}</span>
    </li>
  );
}

function WorksheetResultSignal({ signal }: { signal: string }) {
  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-sm font-medium">
      {signal}
    </div>
  );
}
