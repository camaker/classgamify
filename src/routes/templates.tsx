import Container from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { activityTemplates } from '@/activities/catalog';
import { websiteConfig } from '@/config/website';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  IconDeviceGamepad2,
  IconLayoutGrid,
  IconPlus,
} from '@tabler/icons-react';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/templates')({
  head: () =>
    seo('/templates', {
      title: `Activity templates | ${websiteConfig.metadata?.name}`,
      description:
        'Browse the first ClassGamify activity templates for quiz, match-up, group sort, fill-blank, matching pairs, and open-box classroom play.',
    }),
  component: TemplatesPage,
});

function TemplatesPage() {
  return (
    <Container className="px-4 py-12 md:py-16">
      <div className="mx-auto max-w-6xl space-y-8 pb-16">
        <div className="max-w-3xl space-y-4">
          <Badge variant="outline" className="rounded-md border-primary/30">
            <IconLayoutGrid className="size-3.5" />
            Template engine skeleton
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
            Start with six classroom activity templates.
          </h1>
          <p className="text-lg leading-8 text-muted-foreground">
            These are intentionally small and foundational. Each template reads
            from the same activity content model, so future AI generation can
            produce one lesson and render it several ways.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {activityTemplates.map((template) => (
            <Card key={template.type} className="rounded-lg">
              <CardHeader>
                <div className="mb-2 flex size-9 items-center justify-center rounded-lg border bg-background text-primary">
                  <IconDeviceGamepad2 className="size-4" />
                </div>
                <CardTitle>
                  <h2 className="font-semibold">{template.name}</h2>
                </CardTitle>
                <CardDescription>
                  <p>{template.description}</p>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Best for
                  </p>
                  <p className="mt-1 text-sm">{template.bestFor}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {template.contentRequirements.map((requirement) => (
                    <Badge
                      key={requirement}
                      variant="secondary"
                      className="rounded-md"
                    >
                      {requirement}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="rounded-lg border bg-card p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Ready to draft one?</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                The create flow currently shows the data contract that the AI
                generator and editor will fill in next.
              </p>
            </div>
            <Link to={Routes.Create} className={cn(buttonVariants(), 'w-fit')}>
              <IconPlus className="size-4" />
              Create activity
            </Link>
          </div>
        </div>
      </div>
    </Container>
  );
}
