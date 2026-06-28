import type { buildStudentRunnerPageViewModel } from '@/assignments/student-runner-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconCheck, IconPlayerPlay, IconRepeat } from '@tabler/icons-react';
import type { ReactNode } from 'react';

type StudentRunnerPageViewModel = ReturnType<
  typeof buildStudentRunnerPageViewModel
>;

type StudentRunnerAttemptShellProps = {
  children: ReactNode;
  controlView: StudentRunnerPageViewModel['controlView'];
  identityView: NonNullable<StudentRunnerPageViewModel['identityView']>;
  onStartAnotherAttempt: () => void;
  onStudentNameChange: (studentName: string) => void;
  resultPanelView: StudentRunnerPageViewModel['resultPanelView'];
  studentName: string;
};

export function StudentRunnerAttemptShell({
  children,
  controlView,
  identityView,
  onStartAnotherAttempt,
  onStudentNameChange,
  resultPanelView,
  studentName,
}: StudentRunnerAttemptShellProps) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <StudentRunnerAttemptStatusBar controlView={controlView} />

      <div className="mt-4 grid gap-3 rounded-lg border bg-card p-3 md:grid-cols-[minmax(0,1fr)_14rem] md:items-end">
        <StudentRunnerIdentityPanel
          identityView={identityView}
          onStudentNameChange={onStudentNameChange}
          studentName={studentName}
        />
        <StudentRunnerResultPanel
          onStartAnotherAttempt={onStartAnotherAttempt}
          view={resultPanelView}
        />
      </div>

      {controlView.showTimeExpiredMessage ? (
        <div className="mt-4 rounded-lg border bg-background p-3 text-sm text-muted-foreground">
          {controlView.timeExpiredMessage}
        </div>
      ) : null}

      {children}
    </div>
  );
}

function StudentRunnerAttemptStatusBar({
  controlView,
}: {
  controlView: StudentRunnerPageViewModel['controlView'];
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <IconPlayerPlay className="size-4 text-primary" />
        {controlView.runnerTitle}
      </div>
      <Badge variant="secondary" className="rounded-md">
        {controlView.progressLabel}
      </Badge>
      {controlView.timerBadge.show ? (
        <Badge variant="outline" className="rounded-md">
          {controlView.timerBadge.label}
        </Badge>
      ) : null}
    </div>
  );
}

function StudentRunnerIdentityPanel({
  identityView,
  onStudentNameChange,
  studentName,
}: {
  identityView: NonNullable<StudentRunnerPageViewModel['identityView']>;
  onStudentNameChange: (studentName: string) => void;
  studentName: string;
}) {
  if (identityView.mode === 'student-name') {
    return (
      <div>
        <label
          htmlFor="student-name"
          className="text-sm font-medium text-foreground"
        >
          {identityView.label}
        </label>
        <Input
          id="student-name"
          value={studentName}
          onChange={(event) => onStudentNameChange(event.target.value)}
          placeholder={identityView.placeholder}
          className="mt-2"
        />
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <p className="text-sm font-medium">{identityView.copy.title}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        {identityView.copy.description}
      </p>
    </div>
  );
}

function StudentRunnerResultPanel({
  onStartAnotherAttempt,
  view,
}: {
  onStartAnotherAttempt: () => void;
  view: StudentRunnerPageViewModel['resultPanelView'];
}) {
  if (!view.show) return null;

  return (
    <div className="rounded-lg border bg-primary/5 p-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <IconCheck className="size-4 text-primary" />
        {view.statusLabel}
      </div>
      <p className="mt-2 text-2xl font-semibold">{view.scoreLabel}</p>
      <p className="text-xs text-muted-foreground">{view.accuracyLabel}</p>
      <p className="text-xs text-muted-foreground">{view.durationLabel}</p>
      {view.attemptUsageLabel ? (
        <p className="text-xs text-muted-foreground">
          {view.attemptUsageLabel}
        </p>
      ) : null}
      {view.showStartAnotherAttempt ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-3 w-full justify-start bg-background"
          onClick={onStartAnotherAttempt}
        >
          <IconRepeat className="size-4" />
          {view.startAnotherAttemptLabel}
        </Button>
      ) : null}
    </div>
  );
}
