import { m } from '@/locale/paraglide/messages';
import { Roadmap } from '@/components/roadmap/roadmap';
import Container from '@/components/layout/container';
import { buttonVariants } from '@/components/ui/button';
import { websiteConfig } from '@/config/website';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';
import { cn } from '@/lib/utils';
import {
  IconArrowRight,
  IconBook2,
  IconFileText,
  IconLanguage,
  IconPencil,
  IconSparkles,
  type TablerIcon,
} from '@tabler/icons-react';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(pages)/roadmap')({
  head: () =>
    seo(Routes.Roadmap, {
      title: `${m.roadmap_title()} | ${websiteConfig.metadata?.name}`,
      description: m.roadmap_description(),
    }),
  component: RoadmapPage,
});

function RoadmapPage() {
  const snapshots = [
    {
      icon: IconPencil,
      title: m.roadmap_snapshot_live_title(),
      description: m.roadmap_snapshot_live_description(),
    },
    {
      icon: IconFileText,
      title: m.roadmap_snapshot_loop_title(),
      description: m.roadmap_snapshot_loop_description(),
    },
    {
      icon: IconLanguage,
      title: m.roadmap_snapshot_expansion_title(),
      description: m.roadmap_snapshot_expansion_description(),
    },
  ];

  const principles = [
    {
      icon: IconBook2,
      title: m.roadmap_principle_learning_title(),
      description: m.roadmap_principle_learning_description(),
    },
    {
      icon: IconSparkles,
      title: m.roadmap_principle_focus_title(),
      description: m.roadmap_principle_focus_description(),
    },
  ];

  const validationItems = [
    {
      icon: IconBook2,
      title: m.roadmap_validation_item_learning_title(),
      description: m.roadmap_validation_item_learning_description(),
    },
    {
      icon: IconFileText,
      title: m.roadmap_validation_item_workflow_title(),
      description: m.roadmap_validation_item_workflow_description(),
    },
    {
      icon: IconSparkles,
      title: m.roadmap_validation_item_business_title(),
      description: m.roadmap_validation_item_business_description(),
    },
  ];

  return (
    <Container className="px-4 pt-10 pb-12 md:pt-12 md:pb-14">
      <div className="mx-auto max-w-6xl space-y-10 pb-14">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:items-start">
          <div className="min-w-0 space-y-5">
            <p className="text-sm font-semibold uppercase tracking-normal text-primary">
              {m.roadmap_eyebrow()}
            </p>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-3xl font-bold text-balance md:text-5xl">
                {m.roadmap_title()}
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
                {m.roadmap_subtitle()}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to={Routes.Learn}
                className={cn(buttonVariants({ size: 'lg' }), 'rounded-lg')}
              >
                <IconPencil className="size-4" />
                {m.roadmap_primary_cta()}
              </Link>
              <Link
                to={Routes.Worksheets}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'rounded-lg bg-background'
                )}
              >
                <IconFileText className="size-4" />
                {m.roadmap_secondary_cta()}
              </Link>
            </div>
          </div>
          <div className="grid gap-3">
            {snapshots.map((item) => (
              <DirectionSignal key={item.title} item={item} />
            ))}
          </div>
        </section>

        <Roadmap />

        <section className="grid gap-6 rounded-lg border bg-background p-5 md:p-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
          <div className="min-w-0 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-normal text-primary">
              {m.roadmap_validation_eyebrow()}
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-balance">
              {m.roadmap_validation_title()}
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              {m.roadmap_validation_description()}
            </p>
          </div>
          <ul className="min-w-0 divide-y">
            {validationItems.map((item) => (
              <RoadmapValidationItem key={item.title} item={item} />
            ))}
          </ul>
        </section>

        <section className="grid gap-4 rounded-lg border bg-card p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-5">
          <div className="min-w-0 space-y-2">
            <h2 className="text-xl font-semibold">
              {m.roadmap_feedback_title()}
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {m.roadmap_feedback_description()}
            </p>
          </div>
          <Link
            to={Routes.ContactClassroom}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'w-full rounded-lg bg-background md:w-auto'
            )}
          >
            {m.roadmap_feedback_cta()}
            <IconArrowRight className="size-4" />
          </Link>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {principles.map((item) => (
            <DirectionPrinciple key={item.title} item={item} />
          ))}
        </section>
      </div>
    </Container>
  );
}

function RoadmapValidationItem({
  item,
}: {
  item: {
    description: string;
    icon: TablerIcon;
    title: string;
  };
}) {
  return (
    <li className="flex min-w-0 gap-3 py-4 first:pt-0 last:pb-0">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted/40 text-primary">
        <item.icon className="size-4" />
      </div>
      <div className="min-w-0">
        <h3 className="font-medium leading-6">{item.title}</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {item.description}
        </p>
      </div>
    </li>
  );
}

function DirectionSignal({
  item,
}: {
  item: {
    description: string;
    icon: TablerIcon;
    title: string;
  };
}) {
  return (
    <div className="min-w-0 rounded-lg border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-primary">
          <item.icon className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="font-medium">{item.title}</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {item.description}
          </p>
        </div>
      </div>
    </div>
  );
}

function DirectionPrinciple({
  item,
}: {
  item: {
    description: string;
    icon: TablerIcon;
    title: string;
  };
}) {
  return (
    <div className="min-w-0 rounded-lg border bg-background p-5">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/40 text-primary">
          <item.icon className="size-4" />
        </div>
        <div className="min-w-0">
          <h2 className="font-semibold">{item.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {item.description}
          </p>
        </div>
      </div>
    </div>
  );
}
