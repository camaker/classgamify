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
  const progressValueId = 'student-runner-progress-value';
  const timerDescriptionId = 'student-runner-timer-description';
  const timerValueId = 'student-runner-timer-value';

  return (
    <section
      aria-label={controlView.statusBarLabel}
      aria-describedby={
        controlView.timerBadge.show
          ? `${progressDescriptionId} ${timerDescriptionId}`
          : progressDescriptionId
      }
      className="flex flex-wrap items-center justify-between gap-3"
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        <IconPlayerPlay aria-hidden="true" className="size-4 text-primary" />
        {controlView.runnerTitle}
      </div>
      <Badge variant="secondary" className="rounded-md">
        <output
          aria-describedby={progressDescriptionId}
          aria-label={controlView.progressView.ariaLabel}
          id={progressValueId}
        >
          {controlView.progressView.label}
        </output>
      </Badge>
      <span id={progressDescriptionId} className="sr-only">
        {controlView.progressView.description}
      </span>
      {controlView.timerBadge.show ? (
        <Badge variant="outline" className="rounded-md">
          <output
            aria-describedby={timerDescriptionId}
            aria-label={controlView.timerBadge.ariaLabel}
            id={timerValueId}
          >
            {controlView.timerBadge.label}
          </output>
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
      <section
        aria-describedby={studentNameDescriptionId}
        aria-label={identityView.ariaLabel}
      >
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

  const browserLabelCaptionId =
    'student-runner-anonymous-browser-label-caption';
  const browserLabelValueId = 'student-runner-anonymous-browser-label-value';

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
        <p
          id={browserLabelCaptionId}
          className="text-[11px] uppercase text-muted-foreground"
        >
          {identityView.copy.browserLabelCaption}
        </p>
        <output
          aria-label={identityView.copy.browserLabelAriaLabel}
          aria-labelledby={`${browserLabelCaptionId} ${browserLabelValueId}`}
          className="mt-1 block font-medium text-sm"
          id={browserLabelValueId}
        >
          {identityView.copy.browserLabel}
        </output>
      </section>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {identityView.copy.summaryItems.map((summaryItem) => (
          <StudentRunnerAnonymousSummaryItem
            key={summaryItem.id}
            summaryItem={summaryItem}
          />
        ))}
      </div>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        {identityView.copy.retryDescription}
      </p>
    </section>
  );
}

function StudentRunnerAnonymousSummaryItem({
  summaryItem,
}: {
  summaryItem: Extract<
    StudentRunnerIdentityView,
    { mode: 'anonymous' }
  >['copy']['summaryItems'][number];
}) {
  const labelId = `student-runner-anonymous-summary-${summaryItem.id}-label`;
  const valueId = `student-runner-anonymous-summary-${summaryItem.id}-value`;
  const descriptionId = `student-runner-anonymous-summary-${summaryItem.id}-description`;

  return (
    <section
      aria-describedby={descriptionId}
      aria-label={summaryItem.ariaLabel}
      aria-labelledby={`${labelId} ${valueId}`}
      className="rounded-md border bg-background px-3 py-2"
    >
      <p id={labelId} className="text-[11px] leading-4 text-muted-foreground">
        {summaryItem.label}
      </p>
      <output
        aria-describedby={descriptionId}
        aria-label={summaryItem.ariaLabel}
        aria-labelledby={`${labelId} ${valueId}`}
        className="mt-1 block break-words font-medium text-sm"
        id={valueId}
      >
        {summaryItem.value}
      </output>
      <p
        id={descriptionId}
        className="mt-1 text-[11px] leading-4 text-muted-foreground"
      >
        {summaryItem.description}
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
  const resultStatusId = 'student-runner-result-status';
  const resultScoreId = 'student-runner-result-score';
  const resultAccuracyId = 'student-runner-result-accuracy';
  const resultDurationId = 'student-runner-result-duration';
  const resultAttemptUsageId = 'student-runner-result-attempt-usage';

  return (
    <section
      aria-describedby={
        view.attemptUsageLabel
          ? `${resultAccuracyId} ${resultDurationId} ${resultAttemptUsageId}`
          : `${resultAccuracyId} ${resultDurationId}`
      }
      aria-label={view.ariaLabel}
      aria-labelledby={resultStatusId}
      className="rounded-lg border bg-primary/5 p-3"
    >
      <div
        id={resultStatusId}
        className="flex items-center gap-2 text-sm font-medium"
      >
        <IconCheck aria-hidden="true" className="size-4 text-primary" />
        {view.statusLabel}
      </div>
      <output
        className="mt-2 block text-2xl font-semibold"
        aria-label={view.scoreAriaLabel}
        id={resultScoreId}
      >
        {view.scoreLabel}
      </output>
      <output
        aria-label={view.accuracyLabel}
        className="block text-xs text-muted-foreground"
        id={resultAccuracyId}
      >
        {view.accuracyLabel}
      </output>
      <output
        aria-description={view.durationView.description}
        aria-label={view.durationView.ariaLabel}
        className="block text-xs text-muted-foreground"
        id={resultDurationId}
      >
        {view.durationLabel}
      </output>
      {view.attemptUsageLabel ? (
        <output
          aria-label={view.attemptUsageLabel}
          className="block text-xs text-muted-foreground"
          id={resultAttemptUsageId}
        >
          {view.attemptUsageLabel}
        </output>
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
  const titleId = 'student-runner-feedback-scope-title';
  const descriptionId = 'student-runner-feedback-scope-description';
  const statusLabelId = 'student-runner-feedback-scope-status-label';
  const statusValueId = 'student-runner-feedback-scope-status-value';

  return (
    <section
      aria-describedby={`${descriptionId} ${statusValueId}`}
      aria-label={view.ariaLabel}
      aria-labelledby={titleId}
      data-status={view.status}
      className="mt-3 rounded-md border bg-background/80 p-2"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p id={titleId} className="text-xs font-medium">
            {view.title}
          </p>
          <p
            id={descriptionId}
            className="mt-1 text-xs leading-5 text-muted-foreground"
          >
            {view.description}
          </p>
        </div>
        <output
          aria-describedby={descriptionId}
          aria-label={view.statusAriaLabel}
          aria-labelledby={`${statusLabelId} ${statusValueId}`}
          className={getStudentRunnerFeedbackScopeStatusClassName(view)}
          id={statusValueId}
        >
          <span id={statusLabelId} className="sr-only">
            {view.title}
          </span>
          {view.statusLabel}
        </output>
      </div>
      <dl
        aria-label={view.metricsLabel}
        className="mt-2 grid grid-cols-2 gap-2"
      >
        {view.metrics.map((metric) => (
          <StudentRunnerMetricOutput
            key={metric.key}
            metric={metric}
            prefix="student-runner-feedback-scope"
          />
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
  const titleId = 'student-runner-review-summary-title';
  const descriptionId = 'student-runner-review-summary-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-label={view.ariaLabel}
      aria-labelledby={titleId}
      className="mt-3 rounded-md border bg-background/80 p-2"
    >
      <p id={titleId} className="text-xs font-medium">
        {view.title}
      </p>
      <p
        id={descriptionId}
        className="mt-1 text-xs leading-5 text-muted-foreground"
      >
        {view.description}
      </p>
      <dl
        aria-label={view.metricsLabel}
        className="mt-2 grid grid-cols-2 gap-2"
      >
        {view.metrics.map((metric) => (
          <StudentRunnerMetricOutput
            key={metric.key}
            metric={metric}
            prefix="student-runner-review-summary"
          />
        ))}
      </dl>
    </section>
  );
}

function StudentRunnerMetricOutput({
  metric,
  prefix,
}: {
  metric: {
    ariaLabel: string;
    description: string;
    key: string;
    label: string;
    value: string;
  };
  prefix: string;
}) {
  const labelId = `${prefix}-${metric.key}-label`;
  const valueId = `${prefix}-${metric.key}-value`;
  const descriptionId = `${prefix}-${metric.key}-description`;

  return (
    <div className="rounded-md border bg-muted/20 px-2 py-1.5">
      <dt id={labelId} className="text-[11px] leading-4 text-muted-foreground">
        {metric.label}
      </dt>
      <dd className="text-sm font-semibold">
        <output
          aria-describedby={descriptionId}
          aria-label={metric.ariaLabel}
          aria-labelledby={`${labelId} ${valueId}`}
          id={valueId}
        >
          {metric.value}
        </output>
      </dd>
      <p id={descriptionId} className="sr-only">
        {metric.description}
      </p>
    </div>
  );
}

function StudentRunnerResultNextSteps({
  view,
}: {
  view: StudentAttemptResultNextStepsView;
}) {
  const titleId = 'student-runner-result-next-steps-title';

  return (
    <section
      aria-label={view.ariaLabel}
      aria-labelledby={titleId}
      className="mt-3 rounded-md border bg-background/80 p-2"
    >
      <p id={titleId} className="text-xs font-medium">
        {view.title}
      </p>
      <ul className="mt-1 grid gap-1 text-muted-foreground text-xs leading-5">
        {view.stepViews.map((step) => (
          <li
            className="flex gap-2"
            id={`student-runner-result-next-step-${step.id}`}
            key={step.id}
          >
            <span aria-hidden="true">-</span>
            <span>{step.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
