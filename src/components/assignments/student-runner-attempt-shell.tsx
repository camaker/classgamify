import type {
  StudentRunnerControlView,
  StudentRunnerIdentityView,
  StudentRunnerResultPanelView,
} from '@/assignments/student-runner-state';
import type { StudentAttemptReviewSummaryView } from '@/assignments/student-submission';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconAlarm, IconConfetti, IconRepeat } from '@tabler/icons-react';
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
      className="mt-8 grid gap-6"
    >
      <p id="student-runner-attempt-region-description" className="sr-only">
        {controlView.attemptRegionDescription}
      </p>

      <StudentRunnerResultPanel
        onStartAnotherAttempt={onStartAnotherAttempt}
        view={resultPanelView}
      />

      <StudentRunnerIdentityPanel
        identityView={identityView}
        onStudentNameChange={onStudentNameChange}
        studentName={studentName}
      />

      <StudentRunnerTimeExpiredNotice controlView={controlView} />

      {children}
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
      className="flex items-center gap-3 rounded-lg border border-warning/50 bg-warning/10 p-4 font-medium text-base text-warning-text"
    >
      <IconAlarm aria-hidden="true" className="size-5 shrink-0" />
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
        className="grid max-w-md gap-2"
      >
        <label htmlFor="student-name" className="font-semibold text-base">
          {identityView.label}
        </label>
        <Input
          id="student-name"
          value={studentName}
          disabled={identityView.disabled}
          aria-describedby={studentNameDescriptionId}
          onChange={(event) => onStudentNameChange(event.target.value)}
          placeholder={identityView.placeholder}
          autoComplete="name"
          className="h-12 bg-background text-base md:text-base"
        />
        <p
          id={studentNameDescriptionId}
          className="text-muted-foreground text-sm"
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
    <section aria-label={identityView.ariaLabel} className="grid gap-1">
      <p className="font-semibold text-base">{identityView.copy.title}</p>
      <p className="text-muted-foreground text-sm leading-6">
        {identityView.copy.description}{' '}
        <span id={browserLabelCaptionId}>
          {identityView.copy.browserLabelCaption}:
        </span>{' '}
        <output
          aria-label={identityView.copy.browserLabelAriaLabel}
          aria-labelledby={`${browserLabelCaptionId} ${browserLabelValueId}`}
          className="font-medium text-foreground"
          id={browserLabelValueId}
        >
          {identityView.copy.browserLabel}
        </output>
      </p>
      <p className="text-muted-foreground text-sm leading-6">
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
      className="grid gap-5 rounded-2xl border-2 border-success/50 bg-background p-6 shadow-sm md:p-8"
    >
      <div className="grid gap-2">
        <div
          id={resultStatusId}
          className="flex items-center gap-2 font-semibold text-base text-success-text"
        >
          <IconConfetti aria-hidden="true" className="size-5" />
          {view.statusLabel}
        </div>
        <output
          className="block font-bold text-5xl tracking-tight tabular-nums"
          aria-label={view.scoreAriaLabel}
          id={resultScoreId}
        >
          {view.scoreLabel}
        </output>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-sm">
          <output aria-label={view.accuracyLabel} id={resultAccuracyId}>
            {view.accuracyLabel}
          </output>
          <output
            aria-description={view.durationView.description}
            aria-label={view.durationView.ariaLabel}
            id={resultDurationId}
          >
            {view.durationLabel}
          </output>
          {view.attemptUsageLabel ? (
            <output
              aria-label={view.attemptUsageLabel}
              id={resultAttemptUsageId}
            >
              {view.attemptUsageLabel}
            </output>
          ) : null}
        </div>
      </div>

      <StudentRunnerReviewSummary view={view.reviewSummaryView} />

      {view.feedbackScopeView.hiddenBySettings ? (
        <p className="text-muted-foreground text-sm leading-6">
          {view.feedbackScopeView.description}
        </p>
      ) : null}

      {view.showStartAnotherAttempt ? (
        <div>
          <Button
            type="button"
            size="lg"
            variant="outline"
            aria-describedby={startAnotherAttemptDescriptionId}
            aria-label={view.startAnotherAttemptAriaLabel}
            onClick={onStartAnotherAttempt}
          >
            <IconRepeat className="size-4" />
            {view.startAnotherAttemptLabel}
          </Button>
          <p id={startAnotherAttemptDescriptionId} className="sr-only">
            {view.startAnotherAttemptDescription}
          </p>
        </div>
      ) : null}
    </section>
  );
}

function StudentRunnerReviewSummary({
  view,
}: {
  view: StudentAttemptReviewSummaryView;
}) {
  return (
    <dl
      aria-label={view.metricsLabel}
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
    >
      {view.metrics.map((metric) => {
        const labelId = `student-runner-review-summary-${metric.key}-label`;
        const valueId = `student-runner-review-summary-${metric.key}-value`;

        return (
          <div className="grid gap-0.5" key={metric.key}>
            <dt id={labelId} className="text-muted-foreground text-sm">
              {metric.label}
            </dt>
            <dd className="font-semibold text-xl tabular-nums">
              <output
                aria-label={metric.ariaLabel}
                aria-labelledby={`${labelId} ${valueId}`}
                id={valueId}
              >
                {metric.value}
              </output>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
