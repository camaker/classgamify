import { ActivityPreview } from '@/components/activities/activity-preview';
import Container from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { getStarterActivity, getStarterAssignment } from '@/activities/catalog';
import { websiteConfig } from '@/config/website';
import { getLocale, localeConfig } from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';
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
  const activity = getStarterActivity();
  const assignment = getStarterAssignment();

  return (
    <Container className="px-4 py-12 md:py-16">
      <div className="mx-auto max-w-6xl space-y-12 pb-16">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)] lg:items-center">
          <div className="min-w-0 space-y-6">
            <Badge variant="outline" className="rounded-md border-primary/30">
              <IconSparkles className="size-3.5" />
              {m.home_hero_introduction()}
            </Badge>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-balance md:text-6xl">
                {m.home_hero_title()}
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
                {m.home_hero_description()}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to={Routes.Create}
                className={cn(buttonVariants({ size: 'lg' }), 'rounded-lg')}
              >
                <IconPlus className="size-4" />
                {m.home_hero_primary()}
              </Link>
              <Link
                to={Routes.Templates}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'rounded-lg bg-background'
                )}
              >
                <IconLayoutGrid className="size-4" />
                {m.home_hero_browse_templates()}
              </Link>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <Signal
                icon={IconDeviceGamepad2}
                label={m.home_signal_templates_label()}
                value={m.home_signal_templates_value()}
              />
              <Signal
                icon={IconUsers}
                label={m.home_signal_delivery_label()}
                value={m.home_signal_delivery_value()}
              />
              <Signal
                icon={IconChartBar}
                label={m.home_signal_results_label()}
                value={m.home_signal_results_value()}
              />
            </div>
          </div>
        </section>

        <ActivityPreview activity={activity} assignment={assignment} />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              icon: IconSparkles,
              title: m.home_features_items_item_1_title(),
              description: m.home_features_items_item_1_description(),
            },
            {
              icon: IconDeviceGamepad2,
              title: m.home_features_items_item_2_title(),
              description: m.home_features_items_item_2_description(),
            },
            {
              icon: IconChartBar,
              title: m.home_features_items_item_3_title(),
              description: m.home_features_items_item_3_description(),
            },
            {
              icon: IconUsers,
              title: m.home_features_items_item_4_title(),
              description: m.home_features_items_item_4_description(),
            },
          ].map((item) => (
            <div key={item.title} className="rounded-lg border bg-card p-5">
              <div className="mb-4 flex size-9 items-center justify-center rounded-lg border bg-background text-primary">
                <item.icon className="size-4" />
              </div>
              <h2 className="font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </section>
      </div>
    </Container>
  );
}

function Signal({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof IconDeviceGamepad2;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <Icon className="size-5 text-primary" />
      <p className="mt-4 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
