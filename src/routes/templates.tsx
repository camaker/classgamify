import Container from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  formatActivityTemplateClassroomMode,
  getActivityTemplates,
} from '@/activities/catalog';
import { buildTemplateEntryAction } from '@/activities/template-entry';
import { formatTemplateRequirement } from '@/activities/template-remix';
import { websiteConfig } from '@/config/website';
import { m } from '@/locale/paraglide/messages';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  IconDeviceGamepad2,
  IconLayoutGrid,
  IconPlayerPlay,
  IconPlus,
} from '@tabler/icons-react';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/templates')({
  head: () =>
    seo('/templates', {
      title: `${m.templates_page_seo_title()} | ${websiteConfig.metadata?.name}`,
      description: m.templates_page_seo_description(),
    }),
  component: TemplatesPage,
});

function TemplatesPage() {
  const activityTemplates = getActivityTemplates();

  return (
    <Container className="px-4 py-12 md:py-16">
      <div className="mx-auto max-w-6xl space-y-8 pb-16">
        <div className="max-w-3xl space-y-4">
          <Badge variant="outline" className="rounded-md border-primary/30">
            <IconLayoutGrid className="size-3.5" />
            {m.templates_page_eyebrow()}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
            {m.templates_page_title()}
          </h1>
          <p className="text-lg leading-8 text-muted-foreground">
            {m.templates_page_description()}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to={Routes.Create} className={cn(buttonVariants(), 'w-fit')}>
              <IconPlus className="size-4" />
              {m.templates_page_create_from_template()}
            </Link>
            <Link
              to={Routes.PlayDemo}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'w-fit bg-background'
              )}
            >
              <IconPlayerPlay className="size-4" />
              {m.templates_page_open_student_demo()}
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {activityTemplates.map((template) => {
            const action = buildTemplateEntryAction(template);

            return (
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
                      {m.templates_page_best_for_label()}
                    </p>
                    <p className="mt-1 text-sm">{template.bestFor}</p>
                  </div>
                  <div className="rounded-lg border bg-background p-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      {m.templates_page_classroom_mode_label()}
                    </p>
                    <p className="mt-1 text-sm">
                      {formatActivityTemplateClassroomMode(
                        template.classroomMode
                      )}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {template.contentRequirements.map((requirement) => (
                      <Badge
                        key={requirement}
                        variant="secondary"
                        className="rounded-md"
                      >
                        {formatTemplateRequirement(requirement)}
                      </Badge>
                    ))}
                  </div>
                  <Link
                    to={Routes.Create}
                    search={action.search}
                    className={cn(
                      buttonVariants({ variant: 'outline' }),
                      'w-full bg-background'
                    )}
                  >
                    <IconPlus className="size-4" />
                    {action.label}
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="rounded-lg border bg-card p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                {m.templates_page_bottom_title()}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {m.templates_page_bottom_description()}
              </p>
            </div>
            <Link to={Routes.Create} className={cn(buttonVariants(), 'w-fit')}>
              <IconPlus className="size-4" />
              {m.templates_page_create_activity()}
            </Link>
          </div>
        </div>
      </div>
    </Container>
  );
}
