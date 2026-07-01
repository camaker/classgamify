import type {
  StudentRunnerControlView,
  StudentRunnerIdentityView,
  StudentRunnerResultPanelView,
} from '@/assignments/student-runner-state';
import type {
  StudentAttemptReviewSummaryView,
  StudentAttemptResultNextStepsView,
} from '@/assignments/student-submission';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconCheck, IconPlayerPlay, IconRepeat } from '@tabler/icons-react';
import type { ReactNode } from 'react';

type StudentRunnerAttemptShellProps = {
  children: ReactNode;
  controlView: StudentRunnerControlView;
  identityView: StudentRunnerIdentityView;
  onStartAnotherAttempt: () => void;
  onStudentNameChange: (studentName: string) => void;
  resultPanelView: StudentRunnerResultPanelView;
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

      <StudentRunnerTimeExpiredNotice controlView={controlView} />

      {children}
    </div>
  );
}

function StudentRunnerAttemptStatusBar({
  controlView,
}: {
  controlView: StudentRunnerControlView;
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

function StudentRunnerTimeExpiredNotice({
  controlView,
}: {
  controlView: StudentRunnerControlView;
}) {
  if (!controlView.showTimeExpiredMessage) return null;

  return (
    <div className="mt-4 rounded-lg border bg-background p-3 text-sm text-muted-foreground">
      {controlView.timeExpiredMessage}
    </div>
  );
}

function StudentRunnerIdentityPanel({
  identityView,
  onStudentNameChange,
  studentName,
}: {
  identityView: StudentRunnerIdentityView;
  onStudentNameChange: (studentName: string) => void;
  studentName: string;
}) {
  if (identityView.mode === 'student-name') {
    const studentNameDescriptionId = 'student-name-description';

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
          disabled={identityView.disabled}
          aria-describedby={studentNameDescriptionId}
          onChange={(event) => onStudentNameChange(event.target.value)}
          placeholder={identityView.placeholder}
          className="mt-2"
        />
        <p
          id={studentNameDescriptionId}
          className="mt-1 text-xs leading-5 text-muted-foreground"
        >
          {identityView.description}
        </p>
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
  view: StudentRunnerResultPanelView;
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
      <StudentRunnerReviewSummary view={view.reviewSummaryView} />
      <StudentRunnerResultNextSteps view={view.nextStepsView} />
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

function StudentRunnerReviewSummary({
  view,
}: {
  view: StudentAttemptReviewSummaryView;
}) {
  return (
    <div className="mt-3 rounded-md border bg-background/80 p-2">
      <p className="text-xs font-medium">{view.title}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        {view.description}
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {view.metrics.map((metric) => (
          <div
            key={metric.key}
            className="rounded-md border bg-muted/20 px-2 py-1.5"
          >
            <p className="text-sm font-semibold">{metric.value}</p>
            <p className="text-[11px] leading-4 text-muted-foreground">
              {metric.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StudentRunnerResultNextSteps({
  view,
}: {
  view: StudentAttemptResultNextStepsView;
}) {
  return (
    <div className="mt-3 rounded-md border bg-background/80 p-2">
      <p className="text-xs font-medium">{view.title}</p>
      <ul className="mt-1 grid gap-1 text-muted-foreground text-xs leading-5">
        {view.stepViews.map((step) => (
          <li className="flex gap-2" key={step.id}>
            <span aria-hidden="true">-</span>
            <span>{step.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
