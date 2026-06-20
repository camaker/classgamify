import { ActivityPreview } from '@/components/activities/activity-preview';
import { ActivityCreateForm } from '@/components/activities/activity-create-form';
import Container from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { starterActivities } from '@/activities/catalog';
import { activityContentToEditorInput } from '@/activities/editor';
import type { ActivityTemplateType } from '@/activities/types';
import { activityTemplateTypeSchema } from '@/activities/validation';
import { websiteConfig } from '@/config/website';
import { seo } from '@/lib/seo';
import { IconSparkles } from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/create')({
  validateSearch: (search: Record<string, unknown>) => ({
    template: parseTemplateSearch(search.template),
  }),
  head: () =>
    seo('/create', {
      title: `Create activity | ${websiteConfig.metadata?.name}`,
      description:
        'Create a structured classroom activity that can render as game templates and publish to students.',
    }),
  component: CreatePage,
});

function CreatePage() {
  const { template } = Route.useSearch();
  const activity = starterActivities[0];
  const initialValues = template
    ? activityContentToEditorInput({
        content: activity.content,
        description: activity.description,
        templateType: template,
        title: activity.title,
        visibility: 'draft',
      })
    : undefined;

  return (
    <Container className="px-4 py-12 md:py-16">
      <div className="mx-auto max-w-6xl space-y-8 pb-16">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(320px,0.65fr)] lg:items-end">
          <div className="space-y-4">
            <Badge variant="outline" className="rounded-md border-primary/30">
              <IconSparkles className="size-3.5" />
              Teacher activity builder
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
              Create once, teach through many templates.
            </h1>
            <p className="text-lg leading-8 text-muted-foreground">
              Start with structured classroom content: questions, match pairs,
              categories, vocabulary, learning goal, and teacher notes. The same
              saved activity can later become a quiz, match game, group sort,
              worksheet, or assignment.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm font-medium">Supported input shapes</p>
            <ol className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
              <li>1. Questions: prompt | answer | options.</li>
              <li>2. Match pairs: left | right.</li>
              <li>3. Groups: label | item one, item two.</li>
              <li>4. Notes and vocabulary as simple lists.</li>
            </ol>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_26rem]">
          <ActivityCreateForm initialValues={initialValues} />
          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground">
              Example rendering
            </p>
            <ActivityPreview activity={activity} />
          </div>
        </div>
      </div>
    </Container>
  );
}

function parseTemplateSearch(value: unknown): ActivityTemplateType | undefined {
  if (typeof value !== 'string') return undefined;
  const parsed = activityTemplateTypeSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}
