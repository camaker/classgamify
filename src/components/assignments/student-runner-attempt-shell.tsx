import type {
  StudentRunnerControlView,
  StudentRunnerIdentityView,
  StudentRunnerResultPanelView,
} from '@/assignments/student-runner-state';
import type {
  StudentAttemptFeedbackScopeView,
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
    <section
      aria-label={controlView.attemptRegionLabel}
      aria-describedby="student-runner-attempt-region-description"
      className="rounded-lg border bg-muted/20 p-4"
    >
      <p id="student-runner-attempt-region-description" className="sr-only">
        {controlView.attemptRegionDescription}
      </p>
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
    </section>
  );
}

function StudentRunnerAttemptStatusBar({
  controlView,
}: {
  controlView: StudentRunnerControlView;
}) {
  const progressDescriptionId = 'student-runner-progress-description';
  const timerDescriptionId = 'student-runner-timer-description';

  return (
    <section
      aria-label={controlView.statusBarLabel}
      className="flex flex-wrap items-center justify-between gap-3"
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        <IconPlayerPlay className="size-4 text-primary" />
        {controlView.runnerTitle}
      </div>
      <Badge
        variant="secondary"
        className="rounded-md"
        aria-label={controlView.progressView.ariaLabel}
        aria-describedby={progressDescriptionId}
      >
        <output>{controlView.progressView.label}</output>
      </Badge>
      <span id={progressDescriptionId} className="sr-only">
        {controlView.progressView.description}
      </span>
      {controlView.timerBadge.show ? (
        <Badge
          variant="outline"
          className="rounded-md"
          aria-describedby={timerDescriptionId}
          aria-label={controlView.timerBadge.ariaLabel}
        >
          {controlView.timerBadge.label}
        </Badge>
      ) : null}
      <span id={timerDescriptionId} className="sr-only">
        {controlView.timerBadge.description}
      </span>
    </section>
  );
}

function StudentRunnerTimeExpiredNotice({
  controlView,
}: {
  controlView: StudentRunnerControlView;
}) {
  if (!controlView.showTimeExpiredMessage) return null;

  return (
    <section
      aria-label={controlView.timeExpiredNoticeLabel}
      className="mt-4 rounded-lg border bg-background p-3 text-sm text-muted-foreground"
    >
      {controlView.timeExpiredMessage}
    </section>
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
      <section aria-label={identityView.ariaLabel}>
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
      </section>
    );
  }

  return (
    <section
      aria-label={identityView.ariaLabel}
      className="rounded-lg border bg-muted/20 p-3"
    >
      <p className="text-sm font-medium">{identityView.copy.title}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        {identityView.copy.description}
      </p>
      <section
        aria-label={identityView.copy.browserLabelAriaLabel}
        className="mt-3 rounded-md border bg-background px-3 py-2"
      >
        <p className="text-[11px] uppercase text-muted-foreground">
          {identityView.copy.browserLabelCaption}
        </p>
        <p className="mt-1 font-medium text-sm">
          {identityView.copy.browserLabel}
        </p>
      </section>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {identityView.copy.summaryItems.map((summaryItem) => (
          <section
            aria-label={summaryItem.ariaLabel}
            className="rounded-md border bg-background px-3 py-2"
            key={summaryItem.id}
          >
            <p className="text-[11px] leading-4 text-muted-foreground">
              {summaryItem.label}
            </p>
            <p className="mt-1 break-words font-medium text-sm">
              {summaryItem.value}
            </p>
            <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
              {summaryItem.description}
            </p>
          </section>
        ))}
      </div>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        {identityView.copy.retryDescription}
      </p>
    </section>
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

  const startAnotherAttemptDescriptionId =
    'student-runner-start-another-attempt-description';

  return (
    <section
      aria-label={view.ariaLabel}
      className="rounded-lg border bg-primary/5 p-3"
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        <IconCheck className="size-4 text-primary" />
        {view.statusLabel}
      </div>
      <output
        className="mt-2 block text-2xl font-semibold"
        aria-label={view.scoreAriaLabel}
      >
        {view.scoreLabel}
      </output>
      <p className="text-xs text-muted-foreground">{view.accuracyLabel}</p>
      <output
        aria-description={view.durationView.description}
        aria-label={view.durationView.ariaLabel}
        className="block text-xs text-muted-foreground"
      >
        {view.durationLabel}
      </output>
      {view.attemptUsageLabel ? (
        <p className="text-xs text-muted-foreground">
          {view.attemptUsageLabel}
        </p>
      ) : null}
      <StudentRunnerReviewSummary view={view.reviewSummaryView} />
      <StudentRunnerFeedbackScope view={view.feedbackScopeView} />
      <StudentRunnerResultNextSteps view={view.nextStepsView} />
      {view.showStartAnotherAttempt ? (
        <>
          <Button
            type="button"
            size="sm"
            variant="outline"
            aria-describedby={startAnotherAttemptDescriptionId}
            aria-label={view.startAnotherAttemptAriaLabel}
            className="mt-3 w-full justify-start bg-background"
            onClick={onStartAnotherAttempt}
          >
            <IconRepeat className="size-4" />
            {view.startAnotherAttemptLabel}
          </Button>
          <p id={startAnotherAttemptDescriptionId} className="sr-only">
            {view.startAnotherAttemptDescription}
          </p>
        </>
      ) : null}
    </section>
  );
}

function StudentRunnerFeedbackScope({
  view,
}: {
  view: StudentAttemptFeedbackScopeView;
}) {
  return (
    <section
      aria-label={view.ariaLabel}
      data-status={view.status}
      className="mt-3 rounded-md border bg-background/80 p-2"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium">{view.title}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {view.description}
          </p>
        </div>
        <output
          aria-label={view.statusAriaLabel}
          className={getStudentRunnerFeedbackScopeStatusClassName(view)}
        >
          {view.statusLabel}
        </output>
      </div>
      <dl
        aria-label={view.metricsLabel}
        className="mt-2 grid grid-cols-2 gap-2"
      >
        {view.metrics.map((metric) => (
          <div
            key={metric.key}
            className="rounded-md border bg-muted/20 px-2 py-1.5"
          >
            <dd className="text-sm font-semibold">
              <output aria-label={metric.ariaLabel}>{metric.value}</output>
            </dd>
            <dt className="text-[11px] leading-4 text-muted-foreground">
              {metric.label}
            </dt>
            <p className="sr-only">{metric.description}</p>
          </div>
        ))}
      </dl>
    </section>
  );
}

function getStudentRunnerFeedbackScopeStatusClassName(
  view: StudentAttemptFeedbackScopeView
) {
  const base =
    'inline-flex w-fit rounded-md border px-2 py-1 text-[0.6875rem] font-medium';

  if (view.hiddenBySettings) {
    return `${base} bg-muted/40 text-muted-foreground`;
  }

  return `${base} border-primary/30 bg-primary/10 text-primary`;
}

function StudentRunnerReviewSummary({
  view,
}: {
  view: StudentAttemptReviewSummaryView;
}) {
  return (
    <section
      aria-label={view.ariaLabel}
      className="mt-3 rounded-md border bg-background/80 p-2"
    >
      <p className="text-xs font-medium">{view.title}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        {view.description}
      </p>
      <dl
        aria-label={view.metricsLabel}
        className="mt-2 grid grid-cols-2 gap-2"
      >
        {view.metrics.map((metric) => (
          <div
            key={metric.key}
            className="rounded-md border bg-muted/20 px-2 py-1.5"
          >
            <dd className="text-sm font-semibold">
              <output aria-label={metric.ariaLabel}>{metric.value}</output>
            </dd>
            <dt className="text-[11px] leading-4 text-muted-foreground">
              {metric.label}
            </dt>
            <p className="sr-only">{metric.description}</p>
          </div>
        ))}
      </dl>
    </section>
  );
}

function StudentRunnerResultNextSteps({
  view,
}: {
  view: StudentAttemptResultNextStepsView;
}) {
  return (
    <section
      aria-label={view.ariaLabel}
      className="mt-3 rounded-md border bg-background/80 p-2"
    >
      <p className="text-xs font-medium">{view.title}</p>
      <ul className="mt-1 grid gap-1 text-muted-foreground text-xs leading-5">
        {view.stepViews.map((step) => (
          <li className="flex gap-2" key={step.id}>
            <span aria-hidden="true">-</span>
            <span>{step.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
