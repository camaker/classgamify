import type { StudentRunnerControlView } from '@/assignments/student-runner-state';
import { Button } from '@/components/ui/button';
import { IconCheck } from '@tabler/icons-react';

type StudentRunnerSubmitControlsProps = {
  controlView: StudentRunnerControlView;
  onSubmit: () => void;
};

export function StudentRunnerSubmitControls({
  controlView,
  onSubmit,
}: StudentRunnerSubmitControlsProps) {
  const submitHintIds = controlView.submitHintViews.map((hintView) =>
    buildStudentRunnerSubmitHintId(hintView.id)
  );
  const payloadSummaryDescriptionId =
    'student-runner-submit-payload-summary-description';

  return (
    <section aria-label={controlView.submitControlsLabel} className="mt-4">
      <fieldset
        aria-label={controlView.payloadSummaryView.ariaLabel}
        aria-describedby={payloadSummaryDescriptionId}
        className="mb-4 rounded-md border bg-muted/20 p-4"
      >
        <legend className="text-sm font-medium">
          {controlView.payloadSummaryView.title}
        </legend>
        <p
          id={payloadSummaryDescriptionId}
          className="mt-1 text-xs text-muted-foreground"
        >
          {controlView.payloadSummaryView.description}
        </p>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          {controlView.payloadSummaryView.metrics.map((metric) => (
            <div key={metric.key} className="space-y-1">
              <dt className="text-xs font-medium text-muted-foreground">
                {metric.label}
              </dt>
              <dd className="space-y-1">
                <output
                  aria-label={metric.ariaLabel}
                  className="block text-sm font-semibold text-foreground"
                >
                  {metric.value}
                </output>
                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>
              </dd>
            </div>
          ))}
        </dl>
      </fieldset>
      <Button
        type="button"
        className="w-full sm:w-fit"
        data-confirm-incomplete={
          controlView.requiresIncompleteSubmitConfirmation ? true : undefined
        }
        disabled={controlView.submitDisabled}
        aria-label={controlView.submitButtonAriaLabel}
        aria-describedby={
          submitHintIds.length > 0 ? submitHintIds.join(' ') : undefined
        }
        onClick={onSubmit}
      >
        <IconCheck className="size-4" />
        {controlView.submitButtonLabel}
      </Button>
      {controlView.submitHintViews.map((hintView) => (
        <StudentRunnerSubmitHint
          id={buildStudentRunnerSubmitHintId(hintView.id)}
          key={hintView.id}
          ariaLabel={hintView.ariaLabel}
          text={hintView.text}
          tone={hintView.tone}
        />
      ))}
    </section>
  );
}

function StudentRunnerSubmitHint({
  ariaLabel,
  id,
  text,
  tone,
}: {
  ariaLabel: string;
  id: string;
  text: string;
  tone: 'info' | 'warning';
}) {
  return (
    <p
      aria-label={ariaLabel}
      data-tone={tone}
      id={id}
      role="note"
      className="mt-2 text-xs text-muted-foreground"
    >
      {text}
    </p>
  );
}

function buildStudentRunnerSubmitHintId(id: string) {
  return `student-runner-submit-${id}-hint`;
}
