import Container from '@/components/layout/container';
import { HomeHeroGame } from '@/components/page/home-hero-game';
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
  faqPageJsonLd,
  graphJsonLd,
  jsonLdScript,
  organizationJsonLd,
  softwareApplicationJsonLd,
  websiteJsonLd,
} from '@/lib/structured-data';
import {
  buildHomeGuideView,
  type HomeGuideStepId,
} from '@/pages/home-guide-view';
import { cn } from '@/lib/utils';
import {
  IconArrowRight,
  IconChartBar,
  IconDeviceGamepad2,
  IconLayoutGrid,
  IconLink,
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
    const guide = buildHomeGuideView();

    return {
      ...metadata,
      scripts: [
        jsonLdScript(
          graphJsonLd([
            organizationJsonLd(),
            websiteJsonLd({ description, inLanguage, name, path: '/' }),
            softwareApplicationJsonLd({ description, inLanguage }),
            faqPageJsonLd({ faqs: guide.faq.items, path: '/' }),
          ])
        ),
      ],
    };
  },
  component: HomePage,
});

function HomePage() {
  const pageView = buildHomePageViewModel();
  const guide = buildHomeGuideView();

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
            <HomeHeroGame />
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

        <section aria-labelledby="home-steps-heading" className="space-y-6">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-primary">
              {guide.steps.eyebrow}
            </p>
            <h2
              id="home-steps-heading"
              className="mt-2 text-2xl font-semibold tracking-normal md:text-3xl"
            >
              {guide.steps.title}
            </h2>
          </div>
          <ol className="grid gap-4 md:grid-cols-3">
            {guide.steps.items.map((step, index) => {
              const Icon = homeStepIcons[step.id];

              return (
                <li key={step.id} className="rounded-lg border bg-card p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-lg border bg-background text-primary">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-semibold text-primary">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="mt-4 font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {step.description}
                  </p>
                </li>
              );
            })}
          </ol>
        </section>

        <section aria-labelledby="home-examples-heading" className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-medium text-primary">
                {guide.examples.eyebrow}
              </p>
              <h2
                id="home-examples-heading"
                className="mt-2 text-2xl font-semibold tracking-normal md:text-3xl"
              >
                {guide.examples.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {guide.examples.description}
              </p>
            </div>
            <Link
              to={Routes.Templates}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'w-fit rounded-lg bg-background'
              )}
            >
              {guide.examples.allLabel}
              <IconArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {guide.examples.templates.map((template) => {
              const content = (
                <>
                  <span className="font-semibold text-foreground">
                    {template.name}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                    {template.description}
                  </span>
                </>
              );
              const className =
                'block h-full rounded-lg border bg-card p-4 transition-colors hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-primary';

              return (
                <li key={template.type}>
                  {template.guideHref ? (
                    <a href={template.guideHref} className={className}>
                      {content}
                    </a>
                  ) : (
                    <Link to={Routes.Templates} className={className}>
                      {content}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <section
          id="faqs"
          aria-labelledby="home-faq-heading"
          className="grid gap-8 border-t pt-12 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,1.4fr)]"
        >
          <div>
            <p className="text-sm font-medium text-primary">
              {guide.faq.eyebrow}
            </p>
            <h2
              id="home-faq-heading"
              className="mt-2 text-2xl font-semibold tracking-normal md:text-3xl"
            >
              {guide.faq.title}
            </h2>
            <nav aria-label={guide.more.title} className="mt-6">
              <h3 className="text-sm font-semibold">{guide.more.title}</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {guide.more.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      {link.label} →
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <dl className="divide-y rounded-lg border bg-card">
            {guide.faq.items.map((item) => (
              <div key={item.question} className="p-5">
                <dt className="font-semibold">{item.question}</dt>
                <dd className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
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

const homeStepIcons = {
  publish: IconLink,
  results: IconChartBar,
  template: IconLayoutGrid,
} satisfies Record<HomeGuideStepId, TablerIcon>;

const homeSignalIcons = {
  delivery: IconUsers,
  results: IconChartBar,
  templates: IconDeviceGamepad2,
} satisfies Record<HomePageSignalId, TablerIcon>;
