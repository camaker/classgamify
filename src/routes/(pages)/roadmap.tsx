import Container from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { websiteConfig } from '@/config/website';
import { m } from '@/locale/paraglide/messages';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';
import {
  buildRoadmapPageViewModel,
  type RoadmapColumnId,
  type RoadmapColumnView,
  type RoadmapPrincipleId,
  type RoadmapPrincipleView,
  type RoadmapPublicHandoffItemView,
  type RoadmapPublicHandoffView,
} from '@/pages/public-page-view';
import { cn } from '@/lib/utils';
import {
  IconArrowRight,
  IconChartBar,
  IconCheck,
  IconCircle,
  IconDeviceGamepad2,
  IconLayoutGrid,
  IconListCheck,
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
  const pageView = buildRoadmapPageViewModel();

  return (
    <Container className="px-4 py-12 md:py-16">
      <div className="mx-auto max-w-6xl space-y-10 pb-16">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-center">
          <div className="space-y-5">
            <Badge variant="outline" className="rounded-md border-primary/30">
              <IconDeviceGamepad2 className="size-3.5" />
              {pageView.hero.badgeLabel}
            </Badge>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-balance md:text-5xl">
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
                {pageView.hero.primaryAction.label}
                <IconArrowRight className="size-4" />
              </Link>
              <Link
                to={pageView.hero.secondaryAction.to}
                aria-label={pageView.hero.secondaryAction.ariaLabel}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'rounded-lg bg-background'
                )}
              >
                {pageView.hero.secondaryAction.label}
              </Link>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-5">
            <div className="space-y-4">
              {pageView.snapshots.map((snapshot, index) => (
                <div
                  key={snapshot.id}
                  className={cn(index > 0 && 'border-t pt-4')}
                >
                  <p className="text-sm font-medium text-muted-foreground">
                    {snapshot.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {snapshot.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {pageView.columns.map((column) => (
            <RoadmapColumn key={column.id} column={column} />
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {pageView.principles.map((item) => (
            <PrincipleCard key={item.id} item={item} />
          ))}
        </section>

        <section className="grid gap-4 rounded-lg border bg-card p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="min-w-0">
            <p className="text-sm font-medium text-primary">
              {pageView.validation.eyebrowLabel}
            </p>
            <h2 className="mt-2 text-xl font-semibold">
              {pageView.validation.title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {pageView.validation.description}
            </p>
          </div>
          <Link
            to={pageView.validation.action.to}
            aria-label={pageView.validation.action.ariaLabel}
            className={cn(buttonVariants(), 'w-full md:w-auto')}
          >
            {pageView.validation.action.label}
          </Link>
        </section>

        <RoadmapPublicHandoff view={pageView.handoffView} />
      </div>
    </Container>
  );
}

function RoadmapPublicHandoff({ view }: { view: RoadmapPublicHandoffView }) {
  const titleId = 'roadmap-public-handoff-title';
  const descriptionId = 'roadmap-public-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="roadmap-public-boundary"
    >
      <h2 id={titleId}>{view.title}</h2>
      <p id={descriptionId}>{view.description}</p>
      <dl>
        {view.itemViews.map((itemView) => (
          <RoadmapPublicHandoffItem itemView={itemView} key={itemView.id} />
        ))}
      </dl>
    </section>
  );
}

function RoadmapPublicHandoffItem({
  itemView,
}: {
  itemView: RoadmapPublicHandoffItemView;
}) {
  return (
    <div data-handoff-item={itemView.id}>
      <dt>{itemView.label}</dt>
      <dd>
        <output aria-label={itemView.ariaLabel}>{itemView.value}</output>
        {itemView.statusLabel ? <span>{itemView.statusLabel}</span> : null}
        <span>{itemView.description}</span>
      </dd>
    </div>
  );
}

function RoadmapColumn({ column }: { column: RoadmapColumnView }) {
  const Icon = roadmapColumnIcons[column.id];

  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg border bg-background text-primary">
            <Icon className="size-4" />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold">{column.title}</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {column.description}
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="shrink-0 rounded-md">
          {column.status}
        </Badge>
      </div>
      <ul className="mt-5 space-y-3">
        {column.items.map((item) => (
          <RoadmapTaskItem item={item} key={item.id} />
        ))}
      </ul>
    </div>
  );
}

function RoadmapTaskItem({
  item,
}: {
  item: RoadmapColumnView['items'][number];
}) {
  const Icon = roadmapTaskStatusIcons[item.status];

  return (
    <li className="grid grid-cols-[1rem_minmax(0,1fr)] gap-2 text-sm leading-6">
      <Icon className="mt-1 size-4 text-primary" />
      <div className="min-w-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <span className="font-medium">{item.title}</span>
          <Badge
            aria-label={item.statusAriaLabel}
            variant={getRoadmapTaskStatusBadgeVariant(item.status)}
            className="w-fit shrink-0 rounded-md"
          >
            {item.statusLabel}
          </Badge>
        </div>
        <p className="mt-1 text-muted-foreground">{item.description}</p>
        <dl className="mt-3 grid gap-2 text-xs leading-5">
          <div>
            <dt className="font-medium text-foreground">
              {item.evidenceLabel}
            </dt>
            <dd className="mt-0.5 text-muted-foreground">{item.evidence}</dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">
              {item.nextStepLabel}
            </dt>
            <dd className="mt-0.5 text-muted-foreground">{item.nextStep}</dd>
          </div>
        </dl>
      </div>
    </li>
  );
}

function PrincipleCard({ item }: { item: RoadmapPrincipleView }) {
  const Icon = roadmapPrincipleIcons[item.id];

  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex size-9 items-center justify-center rounded-lg border bg-background text-primary">
        <Icon className="size-4" />
      </div>
      <h2 className="mt-4 font-semibold">{item.title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {item.description}
      </p>
    </div>
  );
}

const roadmapColumnIcons = {
  backlog: IconSparkles,
  done: IconCheck,
  'in-progress': IconDeviceGamepad2,
} satisfies Record<RoadmapColumnId, TablerIcon>;

const roadmapPrincipleIcons = {
  focus: IconLayoutGrid,
  learning: IconListCheck,
  validation: IconChartBar,
} satisfies Record<RoadmapPrincipleId, TablerIcon>;

const roadmapTaskStatusIcons = {
  available: IconCheck,
  improving: IconDeviceGamepad2,
  planned: IconCircle,
} satisfies Record<RoadmapColumnView['items'][number]['status'], TablerIcon>;

function getRoadmapTaskStatusBadgeVariant(
  status: RoadmapColumnView['items'][number]['status']
) {
  if (status === 'available') return 'secondary';
  if (status === 'improving') return 'default';

  return 'outline';
}
