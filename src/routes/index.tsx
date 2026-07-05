import { ActivityPreview } from '@/components/activities/activity-preview';
import Container from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { websiteConfig } from '@/config/website';
import { getLocale, localeConfig } from '@/lib/locale';
import { seo } from '@/lib/seo';
import {
  buildHomePageViewModel,
  type HomePageFeatureId,
  type HomePageProductLoopHandoffView,
  type HomePageSignalId,
} from '@/pages/public-page-view';
import * as m from '@/locale/paraglide/messages';
import {
  graphJsonLd,
  jsonLdScript,
  organizationJsonLd,
  websiteJsonLd,
} from '@/lib/structured-data';
import { cn } from '@/lib/utils';
import {
  IconChartBar,
  IconDeviceGamepad2,
  IconLayoutGrid,
  IconPlus,
  IconSparkles,
  IconUsers,
  type TablerIcon,
} from '@tabler/icons-react';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  head: () => {
    const name = websiteConfig.metadata?.name ?? 'ClassGamify';
    const inLanguage = localeConfig[getLocale()].hreflang;
    const title = `${name} | ${m.home_page_seo_title()}`;
    const description = m.home_page_seo_description();
    const metadata = seo('/', { title, description });

    return {
      ...metadata,
      scripts: [
        jsonLdScript(
          graphJsonLd([
            organizationJsonLd(),
            websiteJsonLd({ description, inLanguage, name, path: '/' }),
          ])
        ),
      ],
    };
  },
  component: HomePage,
});

function HomePage() {
  const pageView = buildHomePageViewModel();

  return (
    <Container className="px-4 py-12 md:py-16">
      <HomePageProductLoopHandoff view={pageView.handoffView} />
      <div className="mx-auto max-w-6xl space-y-12 pb-16">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)] lg:items-center">
          <div className="min-w-0 space-y-6">
            <Badge variant="outline" className="rounded-md border-primary/30">
              <IconSparkles className="size-3.5" />
              {pageView.hero.badgeLabel}
            </Badge>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-balance md:text-6xl">
                {pageView.hero.title}
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
                {pageView.hero.description}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to={pageView.hero.primaryAction.to}
                aria-label={pageView.hero.primaryAction.ariaLabel}
                className={cn(buttonVariants({ size: 'lg' }), 'rounded-lg')}
              >
                <IconPlus className="size-4" />
                {pageView.hero.primaryAction.label}
              </Link>
              <Link
                to={pageView.hero.browseTemplatesAction.to}
                aria-label={pageView.hero.browseTemplatesAction.ariaLabel}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'rounded-lg bg-background'
                )}
              >
                <IconLayoutGrid className="size-4" />
                {pageView.hero.browseTemplatesAction.label}
              </Link>
              <Link
                to={pageView.hero.worksheetAction.to}
                aria-label={pageView.hero.worksheetAction.ariaLabel}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'rounded-lg bg-background'
                )}
              >
                <IconSparkles className="size-4" />
                {pageView.hero.worksheetAction.label}
              </Link>
            </div>
          </div>

          <section
            aria-label={pageView.signalPanel.ariaLabel}
            className="rounded-lg border bg-card p-4"
          >
            <div className="mb-4">
              <h2 className="font-semibold text-sm">
                {pageView.signalPanel.title}
              </h2>
              <p className="mt-1 text-muted-foreground text-sm">
                {pageView.signalPanel.description}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {pageView.signals.map((signal) => (
                <Signal
                  key={signal.id}
                  icon={homeSignalIcons[signal.id]}
                  signal={signal}
                />
              ))}
            </div>
          </section>
        </section>

        <ActivityPreview
          activity={pageView.preview.activity}
          assignment={pageView.preview.assignment}
        />

        <section
          aria-label={pageView.featureSection.ariaLabel}
          className="space-y-4"
        >
          <div>
            <p className="text-sm font-medium text-primary">
              {pageView.featureSection.eyebrowLabel}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal">
              {pageView.featureSection.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {pageView.featureSection.description}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {pageView.features.map((item) => {
              const Icon = homeFeatureIcons[item.id];

              return (
                <article
                  aria-label={item.ariaLabel}
                  key={item.id}
                  className="rounded-lg border bg-card p-5"
                >
                  <div className="mb-4 flex size-9 items-center justify-center rounded-lg border bg-background text-primary">
                    <Icon className="size-4" />
                  </div>
                  <h2 className="font-semibold">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </Container>
  );
}

function HomePageProductLoopHandoff({
  view,
}: {
  view: HomePageProductLoopHandoffView;
}) {
  const titleId = 'home-product-loop-handoff-title';
  const descriptionId = 'home-product-loop-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="home-product-loop"
    >
      <h2 id={titleId}>{view.title}</h2>
      <p id={descriptionId}>{view.description}</p>
      <dl>
        {view.itemViews.map((item) => (
          <div data-handoff-item={item.id} key={item.id}>
            <dt>{item.label}</dt>
            <dd>
              <output aria-label={item.ariaLabel}>{item.value}</output>
              <span>{item.description}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Signal({
  icon: Icon,
  signal,
}: {
  icon: TablerIcon;
  signal: ReturnType<typeof buildHomePageViewModel>['signals'][number];
}) {
  return (
    <dl
      aria-label={signal.ariaLabel}
      className="rounded-lg border bg-background p-4"
    >
      <Icon className="size-5 text-primary" />
      <dt className="mt-4 text-sm text-muted-foreground">{signal.label}</dt>
      <dd>
        <output className="text-2xl font-semibold">{signal.value}</output>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {signal.description}
        </p>
      </dd>
    </dl>
  );
}

const homeFeatureIcons = {
  'activity-templates': IconDeviceGamepad2,
  'assignment-links': IconUsers,
  results: IconChartBar,
  'teacher-workflows': IconSparkles,
} satisfies Record<HomePageFeatureId, TablerIcon>;

const homeSignalIcons = {
  delivery: IconUsers,
  results: IconChartBar,
  templates: IconDeviceGamepad2,
} satisfies Record<HomePageSignalId, TablerIcon>;
