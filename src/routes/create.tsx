import { ActivityPreview } from '@/components/activities/activity-preview';
import { ActivityCreateForm } from '@/components/activities/activity-create-form';
import Container from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import {
  buildActivityEditorInitialValues,
  buildActivityEditorPreviewPanel,
  buildActivityEditorPreviewSeed,
} from '@/activities/editor';
import { parseCreateActivityTemplateSearch } from '@/activities/library-filters';
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
  const initialValues = useMemo(
    () => buildActivityEditorInitialValues(template),
    [template]
  );
  const previewActivity = useMemo(
    () => buildActivityEditorPreviewSeed(initialValues),
    [initialValues]
  );
  const previewPanel = useMemo(
    () => buildActivityEditorPreviewPanel(initialValues),
    [initialValues]
  );

  return (
    <Container className="px-4 py-12 md:py-16">
      <div className="mx-auto max-w-6xl space-y-8 pb-16">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(320px,0.65fr)] lg:items-end">
          <div className="space-y-4">
            <Badge variant="outline" className="rounded-md border-primary/30">
              <IconSparkles className="size-3.5" />
              {m.create_page_eyebrow()}
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
              {m.create_page_title()}
            </h1>
            <p className="text-lg leading-8 text-muted-foreground">
              {m.create_page_description()}
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm font-medium">
              {m.create_page_input_shapes_title()}
            </p>
            <ol className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
              <li>{m.create_page_input_shape_questions()}</li>
              <li>{m.create_page_input_shape_pairs()}</li>
              <li>{m.create_page_input_shape_groups()}</li>
              <li>{m.create_page_input_shape_notes()}</li>
            </ol>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_26rem]">
          <div id={previewPanel.editorSectionId}>
            <ActivityCreateForm initialValues={initialValues} />
          </div>
          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground">
              {m.create_page_preview_label()}
            </p>
            <ActivityPreview activity={previewActivity} panel={previewPanel} />
          </div>
        </div>
      </div>
    </Container>
  );
}
