import type { buildStudentRunnerPageViewModel } from '@/assignments/student-runner-state';
import Container from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { IconDeviceGamepad2 } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';

type StudentRunnerPageViewModel = ReturnType<
  typeof buildStudentRunnerPageViewModel
>;

type StudentRunnerMissingPanelProps = {
  view: NonNullable<StudentRunnerPageViewModel['missingView']>;
};

export function StudentRunnerMissingPanel({
  view,
}: StudentRunnerMissingPanelProps) {
  return (
    <Container className="px-4 py-10 md:py-14">
      <div className="mx-auto max-w-3xl rounded-lg border bg-card p-6">
        <Badge variant="outline" className="rounded-md border-primary/30">
          <IconDeviceGamepad2 className="size-3.5" />
          {view.badgeLabel}
        </Badge>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">{view.title}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {view.description}
        </p>
        <Link
          to={Routes.Templates}
          className={cn(buttonVariants(), 'mt-5 w-fit')}
        >
          {view.browseTemplatesLabel}
        </Link>
      </div>
    </Container>
  );
}
