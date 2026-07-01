import type { TemplatesPageCardView } from '@/activities/entry-page-view';
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
