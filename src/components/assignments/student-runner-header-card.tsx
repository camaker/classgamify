import type { buildStudentRunnerPageViewModel } from '@/assignments/student-runner-state';
import { PublicAssignmentRules } from '@/components/assignments/public-assignment-rules';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { IconClipboardText, IconDeviceGamepad2 } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';

type StudentRunnerPageViewModel = ReturnType<
  typeof buildStudentRunnerPageViewModel
>;

type StudentRunnerHeaderCardProps = {
  badgeLabel: string;
  view: NonNullable<StudentRunnerPageViewModel['headerView']>;
};

export function StudentRunnerHeaderCard({
  badgeLabel,
  view,
}: StudentRunnerHeaderCardProps) {
  return (
    <section className="grid gap-4 rounded-lg border bg-card p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
      <div className="min-w-0 space-y-3">
        <Badge variant="outline" className="rounded-md border-primary/30">
          <IconDeviceGamepad2 className="size-3.5" />
          {badgeLabel}
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">{view.title}</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          {view.description}
        </p>
        {view.instructions ? (
          <div className="max-w-2xl rounded-lg border bg-background p-3 text-sm leading-6">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <IconClipboardText className="size-4 text-primary" />
              {view.instructions.label}
            </div>
            <p className="mt-2 text-muted-foreground">
              {view.instructions.value}
            </p>
          </div>
        ) : null}
        <PublicAssignmentRules rules={view.ruleItems} />
      </div>
      <Link
        to={Routes.Create}
        className={cn(
          buttonVariants({ variant: 'outline' }),
          'w-fit bg-background'
        )}
      >
        {view.teacherActionLabel}
      </Link>
    </section>
  );
}
