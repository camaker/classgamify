import { ActivityPreview } from '@/components/activities/activity-preview';
import { ActivityCreateForm } from '@/components/activities/activity-create-form';
import Container from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import {
  type ActivityCreatePageEditorViewModel,
  type ActivityEditorWorkflowHandoffView,
  type ActivityEditorWorkflowStepView,
  buildActivityCreatePageEditorViewModel,
} from '@/activities/editor';
import {
  parseCreateActivityTemplateSearch,
  parseCreateActivityTemplateSourceSearch,
} from '@/activities/template-entry';
import { websiteConfig } from '@/config/website';
import { m } from '@/locale/paraglide/messages';
import { seo } from '@/lib/seo';
import {
  IconChevronDown,
  IconClipboardList,
  IconDeviceGamepad2,
  IconLayoutGrid,
  IconPaperclip,
  IconPencil,
  IconSparkles,
} from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';
import { useMemo } from 'react';

export const Route = createFileRoute('/create')({
  validateSearch: (search: Record<string, unknown>) => ({
    source: parseCreateActivityTemplateSourceSearch(search.source),
    template: parseCreateActivityTemplateSearch(search.template),
  }),
  head: () =>
    seo('/create', {
      title: `${m.create_page_seo_title()} | ${websiteConfig.metadata?.name}`,
      description: m.create_page_seo_description(),
    }),
  component: CreatePage,
});

function CreatePage() {
  const { source, template } = Route.useSearch();
  const pageView = useMemo(
    () =>
      buildActivityCreatePageEditorViewModel({
        templateSource: source,
        templateType: template,
      }),
    [source, template]
  );

  return (
    <Container className="px-4 py-8 md:py-10">
      <div className="mx-auto max-w-7xl pb-16">
        <section className="border-b pb-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-end">
            <div className="space-y-4">
              <Badge variant="outline" className="rounded-md border-primary/30">
                <IconSparkles className="size-3.5" />
                {pageView.hero.badgeLabel}
              </Badge>
              <div className="max-w-3xl space-y-3">
                <h1 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
                  {pageView.hero.title}
                </h1>
                <p className="max-w-2xl text-muted-foreground text-base leading-7">
                  {pageView.hero.description}
                </p>
              </div>
            </div>
            <TemplateEntryPanel templateEntry={pageView.templateEntry} />
          </div>

          <WorkflowNav workflow={pageView.workflow} />
          <ActivityEditorWorkflowHandoff
            handoffView={pageView.workflow.handoffView}
          />
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_25rem] 2xl:grid-cols-[minmax(0,1fr)_26rem]">
          <ActivityCreateForm initialValues={pageView.initialValues} />
          <aside className="space-y-4 xl:sticky xl:top-24 xl:max-h-[calc(100dvh-7rem)] xl:overflow-y-auto xl:pr-1">
            <InputShapePanel inputShape={pageView.inputShape} />
            <section className="space-y-3" aria-label={pageView.previewLabel}>
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                <IconDeviceGamepad2 className="size-4 text-primary" />
                {pageView.previewLabel}
              </div>
              <ActivityPreview
                activity={pageView.previewActivity}
                layout="stacked"
                panel={pageView.previewPanel}
              />
            </section>
          </aside>
        </div>
      </div>
    </Container>
  );
}

function WorkflowNav({
  workflow,
}: {
  workflow: ActivityCreatePageEditorViewModel['workflow'];
}) {
  return (
    <nav
      aria-label={workflow.ariaLabel}
      className="mt-6 grid gap-2 md:grid-cols-5"
    >
      {workflow.steps.map((item) => {
        const Icon = getWorkflowIcon(item.icon);

        return (
          <a
            className="group rounded-lg border bg-card p-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
            href={item.href}
            key={item.id}
          >
            <div className="flex items-center gap-2">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold tabular-nums group-hover:bg-primary group-hover:text-primary-foreground">
                {item.number}
              </span>
              <Icon className="size-4 text-primary" />
            </div>
            <p className="mt-3 font-medium text-sm leading-5">{item.title}</p>
            <p className="mt-1 line-clamp-2 text-muted-foreground text-xs leading-5">
              {item.description}
            </p>
          </a>
        );
      })}
    </nav>
  );
}

function getWorkflowIcon(icon: ActivityEditorWorkflowStepView['icon']) {
  switch (icon) {
    case 'clipboard-list':
      return IconClipboardList;
    case 'layout-grid':
      return IconLayoutGrid;
    case 'paperclip':
      return IconPaperclip;
    case 'pencil':
      return IconPencil;
    case 'sparkles':
      return IconSparkles;
  }
}

function ActivityEditorWorkflowHandoff({
  handoffView,
}: {
  handoffView: ActivityEditorWorkflowHandoffView;
}) {
  const titleId = 'activity-editor-workflow-handoff-title';
  const descriptionId = 'activity-editor-workflow-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="activity-editor-workflow"
    >
      <h2 id={titleId}>{handoffView.title}</h2>
      <p id={descriptionId}>{handoffView.description}</p>
      <dl>
        {handoffView.itemViews.map((item) => (
          <ActivityEditorWorkflowHandoffItem item={item} key={item.id} />
        ))}
      </dl>
    </section>
  );
}

function ActivityEditorWorkflowHandoffItem({
  item,
}: {
  item: ActivityEditorWorkflowHandoffView['itemViews'][number];
}) {
  const labelId = `activity-editor-workflow-handoff-${item.id}-label`;
  const valueId = `activity-editor-workflow-handoff-${item.id}-value`;
  const descriptionId = `activity-editor-workflow-handoff-${item.id}-description`;

  return (
    <div data-handoff-item={item.id}>
      <dt id={labelId}>{item.label}</dt>
      <dd>
        <output
          aria-describedby={descriptionId}
          aria-label={item.ariaLabel}
          aria-labelledby={`${labelId} ${valueId}`}
          id={valueId}
        >
          {item.value}
        </output>
        <span id={descriptionId}>{item.description}</span>
      </dd>
    </div>
  );
}

function TemplateEntryPanel({
  templateEntry,
}: {
  templateEntry: ActivityCreatePageEditorViewModel['templateEntry'];
}) {
  return (
    <section className="rounded-lg border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="rounded-md">
          {templateEntry.sourceLabel}
        </Badge>
        <Badge variant="secondary" className="rounded-md">
          {templateEntry.shortName}
        </Badge>
      </div>
      <h2 className="mt-3 font-semibold text-base leading-6">
        {templateEntry.title}
      </h2>
      <p className="mt-2 text-muted-foreground text-sm leading-6">
        {templateEntry.description}
      </p>
      <p className="mt-2 text-muted-foreground text-xs leading-5">
        {templateEntry.sourceDescription}
      </p>
      <dl className="mt-4 grid gap-2 sm:grid-cols-2">
        {templateEntry.metrics.map((metric) => (
          <div
            className="rounded-md border bg-muted/30 px-3 py-2"
            key={metric.id}
          >
            <dt className="text-muted-foreground text-xs">{metric.label}</dt>
            <dd className="font-medium text-sm">{metric.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 flex items-center gap-2 text-primary text-sm">
        <IconChevronDown className="size-4 shrink-0" />
        {templateEntry.nextStep}
      </p>
    </section>
  );
}

function InputShapePanel({
  inputShape,
}: {
  inputShape: ActivityCreatePageEditorViewModel['inputShape'];
}) {
  return (
    <section className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2">
        <IconClipboardList className="size-4 text-primary" />
        <h2 className="font-semibold text-sm">{inputShape.title}</h2>
      </div>
      <ol className="mt-3 grid gap-2">
        {inputShape.itemViews.map((itemView, index) => (
          <li className="flex gap-2 text-sm leading-6" key={itemView.id}>
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-muted font-medium text-[0.7rem] tabular-nums">
              {index + 1}
            </span>
            <span className="text-muted-foreground">{itemView.label}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
