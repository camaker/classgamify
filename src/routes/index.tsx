import { ActivityPreview } from '@/components/activities/activity-preview';
import Container from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { websiteConfig } from '@/config/website';
import { getLocale, localeConfig } from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';
import {
  buildHomePageViewModel,
  type HomePageFeatureId,
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
  IconPlayerPlay,
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
    <Container className="px-4 pt-7 pb-16 md:pt-10">
      <div className="mx-auto max-w-7xl space-y-16">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start lg:gap-12">
          <div className="min-w-0 space-y-5 lg:pt-10">
            <Badge variant="outline" className="rounded-md border-primary/30">
              <IconSparkles className="size-3.5" />
              {pageView.hero.badgeLabel}
            </Badge>
            <div className="space-y-3">
              <h1 className="max-w-2xl text-4xl leading-[1.08] font-bold tracking-tight text-balance sm:text-5xl lg:text-[3.5rem]">
                {pageView.hero.title}
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                {pageView.hero.description}
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3">
                <Link
                  to={pageView.hero.primaryAction.to}
                  aria-label={pageView.hero.primaryAction.ariaLabel}
                  className={cn(buttonVariants({ size: 'lg' }), 'rounded-lg')}
                >
                  <IconPlus className="size-4" />
                  {pageView.hero.primaryAction.label}
                </Link>
                <Link
                  to={Routes.StudentPreview}
                  className={cn(
                    buttonVariants({ size: 'lg', variant: 'outline' }),
                    'rounded-lg bg-background'
                  )}
                >
                  <IconPlayerPlay className="size-4" />
                  {m.home_hero_play_sample()}
                </Link>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <Link
                  to={pageView.hero.browseTemplatesAction.to}
                  aria-label={pageView.hero.browseTemplatesAction.ariaLabel}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {pageView.hero.browseTemplatesAction.label} →
                </Link>
                <Link
                  to={pageView.hero.worksheetAction.to}
                  aria-label={pageView.hero.worksheetAction.ariaLabel}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {pageView.hero.worksheetAction.label} →
                </Link>
              </div>
            </div>
          </div>

          <section aria-label={m.home_hero_preview_label()} className="min-w-0">
            <p className="mb-3 text-sm font-semibold text-primary">
              {m.home_hero_preview_label()}
            </p>
            <ActivityPreview
              activity={pageView.preview.activity}
              compact
              layout="stacked"
            />
          </section>
        </section>

        <section
          aria-label={pageView.signalPanel.ariaLabel}
          className="grid gap-6 border-y py-8 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:items-center"
        >
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              {pageView.signalPanel.title}
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {pageView.signalPanel.description}
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {pageView.signals.map((signal) => (
              <Signal
                key={signal.id}
                icon={homeSignalIcons[signal.id]}
                signal={signal}
              />
            ))}
          </div>
        </section>

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
      className="border-l-2 border-primary/30 pl-4"
    >
      <Icon className="size-5 text-primary" aria-hidden="true" />
      <dt className="mt-2 text-sm text-muted-foreground">{signal.label}</dt>
      <dd>
        <output className="text-2xl font-semibold text-foreground">
          {signal.value}
        </output>
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
