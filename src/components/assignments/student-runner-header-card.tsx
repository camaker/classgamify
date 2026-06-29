import type { buildStudentRunnerPageViewModel } from '@/assignments/student-runner-state';
import { PublicAssignmentRules } from '@/components/assignments/public-assignment-rules';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
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
          <StudentRunnerInstructionsCard instructions={view.instructions} />
        ) : null}
        <StudentRunnerPrepareCard prepareView={view.prepareView} />
        <PublicAssignmentRules rules={view.ruleItems} />
      </div>
      <StudentRunnerTeacherActionLink action={view.teacherAction} />
    </section>
  );
}

function StudentRunnerTeacherActionLink({
  action,
}: {
  action: NonNullable<
    StudentRunnerPageViewModel['headerView']
  >['teacherAction'];
}) {
  const className = cn(
    buttonVariants({ variant: 'outline' }),
    'w-fit bg-background'
  );

  if (action.type === 'view-results') {
    return (
      <Link
        to={action.to}
        params={{ assignmentId: action.assignmentId }}
        className={className}
      >
        {action.label}
      </Link>
    );
  }

  return (
    <Link to={action.to} className={className}>
      {action.label}
    </Link>
  );
}

function StudentRunnerPrepareCard({
  prepareView,
}: {
  prepareView: NonNullable<
    StudentRunnerPageViewModel['headerView']
  >['prepareView'];
}) {
  return (
    <div className="max-w-2xl rounded-lg border bg-background p-3 text-sm leading-6">
      <div className="font-medium text-foreground">{prepareView.title}</div>
      <ul className="mt-2 grid gap-1 text-muted-foreground text-xs leading-5">
        {prepareView.steps.map((step) => (
          <li className="flex gap-2" key={step}>
            <span aria-hidden="true">-</span>
            <span>{step}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StudentRunnerInstructionsCard({
  instructions,
}: {
  instructions: NonNullable<
    StudentRunnerPageViewModel['headerView']
  >['instructions'];
}) {
  if (!instructions) return null;

  return (
    <div className="max-w-2xl rounded-lg border bg-background p-3 text-sm leading-6">
      <div className="flex items-center gap-2 font-medium text-foreground">
        <IconClipboardText className="size-4 text-primary" />
        {instructions.label}
      </div>
      <p className="mt-2 text-muted-foreground">{instructions.value}</p>
    </div>
  );
}
