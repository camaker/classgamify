import { ActivityPreview } from '@/components/activities/activity-preview';
import Container from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { starterActivities, starterAssignments } from '@/activities/catalog';
import { websiteConfig } from '@/config/website';
import { getLocale, localeConfig } from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';
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
    const title = `${name} | AI-ready classroom activity platform`;
    const description =
      'Create game-based classroom activities, publish student play links, and track assignment results from one teacher workspace.';
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
  const activity = starterActivities[0];
  const assignment = starterAssignments[0];

  return (
    <Container className="px-4 py-12 md:py-16">
      <div className="mx-auto max-w-6xl space-y-12 pb-16">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)] lg:items-center">
          <div className="min-w-0 space-y-6">
            <Badge variant="outline" className="rounded-md border-primary/30">
              <IconSparkles className="size-3.5" />
              Wordwall-core platform reset
            </Badge>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-balance md:text-6xl">
                Turn lesson content into game-based classroom activities.
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
                ClassGamify is being rebuilt around the core Wordwall loop:
                teacher-owned activities, reusable templates, student play
                links, and result tracking. AI creation plugs into this
                structure next.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to={Routes.Create}
                className={cn(buttonVariants({ size: 'lg' }), 'rounded-lg')}
              >
                <IconPlus className="size-4" />
                Create activity
              </Link>
              <Link
                to={Routes.Templates}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'rounded-lg bg-background'
                )}
              >
                <IconLayoutGrid className="size-4" />
                Browse templates
              </Link>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <Signal
                icon={IconDeviceGamepad2}
                label="Templates"
                value="7 first"
              />
              <Signal icon={IconUsers} label="Delivery" value="Share link" />
              <Signal icon={IconChartBar} label="Results" value="Attempt log" />
            </div>
          </div>
        </section>

        <ActivityPreview activity={activity} assignment={assignment} />

        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: IconSparkles,
              title: 'AI-ready content model',
              description:
                'Questions, pairs, groups, and vocabulary live in one structured shape that multiple templates can render.',
            },
            {
              icon: IconDeviceGamepad2,
              title: 'Template-first gameplay',
              description:
                'The first platform skeleton supports quiz, match-up, group sort, fill-blank, listening, matching pairs, and open-box paths.',
            },
            {
              icon: IconChartBar,
              title: 'Assignments and attempts',
              description:
                'Published activities are separate from reusable activities, so teachers can track each class run cleanly.',
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
