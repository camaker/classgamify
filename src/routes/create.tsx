import { ActivityPreview } from '@/components/activities/activity-preview';
import { ActivityCreateForm } from '@/components/activities/activity-create-form';
import Container from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { buildActivityCreatePageEditorViewModel } from '@/activities/editor';
import { parseCreateActivityTemplateSearch } from '@/activities/template-entry';
import { websiteConfig } from '@/config/website';
import { m } from '@/locale/paraglide/messages';
import { seo } from '@/lib/seo';
import { IconSparkles } from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';
import { useMemo } from 'react';

export const Route = createFileRoute('/create')({
  validateSearch: (search: Record<string, unknown>) => ({
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
  const { template } = Route.useSearch();
  const pageView = useMemo(
    () => buildActivityCreatePageEditorViewModel(template),
    [template]
  );

  return (
    <Container className="px-4 py-12 md:py-16">
      <div className="mx-auto max-w-6xl space-y-8 pb-16">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(320px,0.65fr)] lg:items-end">
          <div className="space-y-4">
            <Badge variant="outline" className="rounded-md border-primary/30">
              <IconSparkles className="size-3.5" />
              {pageView.hero.badgeLabel}
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
              {pageView.hero.title}
            </h1>
            <p className="text-lg leading-8 text-muted-foreground">
              {pageView.hero.description}
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm font-medium">{pageView.inputShape.title}</p>
            <ol className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
              {pageView.inputShape.itemViews.map((itemView) => (
                <li key={itemView.id}>{itemView.label}</li>
              ))}
            </ol>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_26rem]">
          <div id={pageView.previewPanel.editorSectionId}>
            <ActivityCreateForm initialValues={pageView.initialValues} />
          </div>
          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground">
              {pageView.previewLabel}
            </p>
            <ActivityPreview
              activity={pageView.previewActivity}
              panel={pageView.previewPanel}
            />
          </div>
        </div>
      </div>
    </Container>
  );
}
