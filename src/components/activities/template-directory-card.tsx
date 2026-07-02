import type {
  TemplatesPageCardEntryStepView,
  TemplatesPageCardView,
} from '@/activities/entry-page-view';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getPathWithLocale } from '@/lib/urls';
import { IconDeviceGamepad2, IconPlus } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';

type TemplateDirectoryCardProps = {
  template: TemplatesPageCardView;
};

export function TemplateDirectoryCard({
  template,
}: TemplateDirectoryCardProps) {
  const entryLabelId = `template-entry-${template.template}-label`;

  return (
    <Card className="rounded-lg">
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
            {template.bestForLabel}
          </p>
          <p className="mt-1 text-sm">{template.bestFor}</p>
        </div>
        <div className="rounded-lg border bg-background p-3">
          <p className="text-xs font-medium text-muted-foreground">
            {template.classroomModeLabel}
          </p>
          <p className="mt-1 text-sm">{template.classroomMode}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {template.contentRequirements.map((requirement) => (
            <Badge
              key={requirement.id}
              variant="secondary"
              className="rounded-md"
            >
              {requirement.label}
            </Badge>
          ))}
        </div>
        {template.entrySteps.length ? (
          <section
            className="grid gap-2 border-t pt-3"
            aria-labelledby={entryLabelId}
          >
            <p
              id={entryLabelId}
              className="font-medium text-muted-foreground text-xs"
            >
              {template.entryLabel}
            </p>
            <dl className="grid gap-2">
              {template.entrySteps.map((step) => (
                <TemplateEntryStep
                  key={step.id}
                  step={step}
                  templateType={template.template}
                />
              ))}
            </dl>
          </section>
        ) : null}
        <Link
          to={getPathWithLocale(template.action.to)}
          search={template.action.search}
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'w-full bg-background'
          )}
        >
          <IconPlus className="size-4" />
          {template.action.label}
        </Link>
      </CardContent>
    </Card>
  );
}

function TemplateEntryStep({
  step,
  templateType,
}: {
  step: TemplatesPageCardEntryStepView;
  templateType: TemplatesPageCardView['template'];
}) {
  const descriptionId = `template-entry-${templateType}-${step.id}-description`;

  return (
    <div className="grid grid-cols-[minmax(0,5.75rem)_minmax(0,1fr)] gap-2 text-xs">
      <dt className="truncate text-muted-foreground">{step.label}</dt>
      <dd aria-describedby={descriptionId} className="min-w-0 font-medium">
        <output aria-label={step.ariaLabel} className="break-words">
          {step.value}
        </output>
        <span id={descriptionId} className="sr-only">
          {step.description}
        </span>
      </dd>
    </div>
  );
}
