import { ActivityPreview } from '@/components/activities/activity-preview';
import Container from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { starterActivities } from '@/activities/catalog';
import { websiteConfig } from '@/config/website';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';
import { cn } from '@/lib/utils';
import { IconArrowRight, IconSparkles } from '@tabler/icons-react';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/create')({
  head: () =>
    seo('/create', {
      title: `Create activity | ${websiteConfig.metadata?.name}`,
      description:
        'Create a structured classroom activity that can render as game templates and publish to students.',
    }),
  component: CreatePage,
});

function CreatePage() {
  const activity = starterActivities[0];

  return (
    <Container className="px-4 py-12 md:py-16">
      <div className="mx-auto max-w-6xl space-y-8 pb-16">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(320px,0.65fr)] lg:items-end">
          <div className="space-y-4">
            <Badge variant="outline" className="rounded-md border-primary/30">
              <IconSparkles className="size-3.5" />
              AI creation target
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
              Create once, render across game templates.
            </h1>
            <p className="text-lg leading-8 text-muted-foreground">
              This skeleton establishes the contract AI will fill: questions,
              pairs, groups, vocabulary, learning goal, and teacher notes. The
              UI editor and generation endpoint can now build on a stable shape.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm font-medium">Next engineering milestones</p>
            <ol className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
              <li>1. Persist teacher-owned activities in D1.</li>
              <li>2. Add editor controls for structured content.</li>
              <li>3. Generate the same content with AI.</li>
              <li>4. Publish assignments and collect attempts.</li>
            </ol>
          </div>
        </div>

        <ActivityPreview activity={activity} />

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link to={Routes.Templates} className={cn(buttonVariants(), 'w-fit')}>
            Browse templates
            <IconArrowRight className="size-4" />
          </Link>
          <Link
            to={Routes.PlayDemo}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'w-fit bg-background'
            )}
          >
            Open student preview
          </Link>
        </div>
      </div>
    </Container>
  );
}
