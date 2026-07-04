import Container from '@/components/layout/container';
import { WorksheetModeCard } from '@/components/activities/worksheet-mode-card';
import { PublicTemplateEntryHandoffPanel } from '@/components/activities/public-template-entry-handoff-panel';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
  buildWorksheetsPageViewModel,
  type WorksheetsPageHeroActionView,
  type WorksheetsPageResultSignalView,
  type WorksheetsPageWorkflowStepView,
} from '@/activities/entry-page-view';
import { websiteConfig } from '@/config/website';
import { m } from '@/locale/paraglide/messages';
import { Routes } from '@/lib/routes';
import { getPathWithLocale } from '@/lib/urls';
import { seo } from '@/lib/seo';
import { cn } from '@/lib/utils';
import {
  IconArrowRight,
  IconDownload,
  IconListDetails,
  IconPencilPlus,
} from '@tabler/icons-react';
import { Link, createFileRoute } from '@tanstack/react-router';

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

          <section
            aria-label={pageView.deliveryLoop.ariaLabel}
            className="rounded-lg border bg-card p-5"
          >
            <p className="text-sm font-medium text-muted-foreground">
              {pageView.deliveryLoop.title}
            </p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {pageView.deliveryLoop.description}
            </p>
            <ol className="mt-4 space-y-3">
              {pageView.workflowSteps.map((stepView) => (
                <WorksheetWorkflowStep key={stepView.id} stepView={stepView} />
              ))}
            </ol>
          </section>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {pageView.modeCards.map((mode) => (
            <WorksheetModeCard key={mode.template} mode={mode} />
          ))}
        </section>

        <PublicTemplateEntryHandoffPanel view={pageView.handoffView} />

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
            {pageView.resultSignals.map((signalView) => (
              <WorksheetResultSignal
                key={signalView.id}
                signalView={signalView}
              />
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
            aria-label={pageView.templatesCta.action.ariaLabel}
            to={getPathWithLocale(pageView.templatesCta.action.to)}
            className={cn(buttonVariants(), 'w-full md:w-auto')}
          >
            {pageView.templatesCta.action.label}
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
  action: WorksheetsPageHeroActionView;
}) {
  return (
    <Link
      aria-label={action.ariaLabel}
      to={getPathWithLocale(action.to)}
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
  stepView,
}: {
  stepView: WorksheetsPageWorkflowStepView;
}) {
  return (
    <li
      aria-label={stepView.ariaLabel}
      className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-3 text-sm leading-6"
    >
      <span className="flex size-7 items-center justify-center rounded-lg border bg-background text-xs font-semibold text-primary">
        {stepView.positionLabel}
      </span>
      <span>
        <span className="font-medium">{stepView.label}</span>
        <span className="mt-0.5 block text-muted-foreground text-xs leading-5">
          {stepView.description}
        </span>
      </span>
    </li>
  );
}

function WorksheetResultSignal({
  signalView,
}: {
  signalView: WorksheetsPageResultSignalView;
}) {
  return (
    <dl
      aria-label={signalView.ariaLabel}
      className="rounded-lg border bg-background px-3 py-2 text-sm"
    >
      <dt className="font-medium">{signalView.label}</dt>
      <dd className="mt-1 text-muted-foreground text-xs">
        <output aria-label={signalView.ariaLabel}>{signalView.value}</output>
      </dd>
      <dd className="sr-only">{signalView.description}</dd>
    </dl>
  );
}
