import type {
  StudentRunnerControlView,
  StudentRunnerSubmitHintView,
} from '@/assignments/student-runner-state';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { IconAlertTriangle, IconCheck, IconClock } from '@tabler/icons-react';

type StudentRunnerSubmitControlsProps = {
  controlView: StudentRunnerControlView;
  hidden?: boolean;
  onSubmit: () => void;
};

/**
 * Sticky bottom bar: progress, timer, and the one submit action. The
 * unanswered-item confirmation appears right above the button.
 */
export function StudentRunnerSubmitControls({
  controlView,
  hidden = false,
  onSubmit,
}: StudentRunnerSubmitControlsProps) {
  if (hidden) return null;

  const submitHintIds = controlView.submitHintViews.map((hintView) =>
    buildStudentRunnerSubmitHintId(hintView.id)
  );
  const submitControlsLabelId = 'student-runner-submit-controls-label';
  const progressDescriptionId = 'student-runner-progress-description';
  const { progressView, timerBadge } = controlView;
  const progressPercent =
    progressView.itemCount > 0
      ? Math.round(
          (progressView.answeredItemCount / progressView.itemCount) * 100
        )
      : 0;

  return (
    <section
      aria-labelledby={submitControlsLabelId}
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_16px_rgb(0_0_0/0.06)] backdrop-blur"
    >
      <h2 id={submitControlsLabelId} className="sr-only">
        {controlView.submitControlsLabel}
      </h2>
      <div className="mx-auto grid max-w-4xl gap-2 px-4 py-3">
        {controlView.submitHintViews.map((hintView) => (
          <StudentRunnerSubmitHint
            hintView={hintView}
            id={buildStudentRunnerSubmitHintId(hintView.id)}
            key={hintView.id}
          />
        ))}
        <div className="flex items-center gap-4">
          <div className="grid min-w-0 flex-1 gap-1.5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <output
                aria-describedby={progressDescriptionId}
                aria-label={progressView.ariaLabel}
                className="font-semibold tabular-nums"
              >
                {progressView.label}
              </output>
              <span id={progressDescriptionId} className="sr-only">
                {progressView.description}
              </span>
              {timerBadge.show ? (
                <output
                  aria-label={timerBadge.ariaLabel}
                  className="inline-flex items-center gap-1 font-semibold tabular-nums"
                >
                  <IconClock aria-hidden="true" className="size-4" />
                  {timerBadge.label}
                </output>
              ) : null}
            </div>
            <div
              aria-hidden="true"
              className="h-2 overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <Button
            type="button"
            size="lg"
            className={cn(
              'h-12 shrink-0 px-6 text-base',
              controlView.requiresIncompleteSubmitConfirmation &&
                'bg-warning text-warning-foreground hover:bg-warning/90'
            )}
            data-confirm-incomplete={
              controlView.requiresIncompleteSubmitConfirmation
                ? true
                : undefined
            }
            disabled={controlView.submitDisabled}
            aria-label={controlView.submitButtonAriaLabel}
            aria-describedby={[progressDescriptionId, ...submitHintIds].join(
              ' '
            )}
            onClick={onSubmit}
          >
            <IconCheck className="size-5" />
            {controlView.submitButtonLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}

function StudentRunnerSubmitHint({
  hintView,
  id,
}: {
  hintView: StudentRunnerSubmitHintView;
  id: string;
}) {
  const isWarning = hintView.tone === 'warning';

  // The progress bar already shows how many items are left.
  if (hintView.id === 'unanswered') {
    return (
      <p
        aria-label={hintView.ariaLabel}
        className="sr-only"
        data-tone={hintView.tone}
        id={id}
        role="note"
      >
        {hintView.text}
      </p>
    );
  }

  return (
    <p
      aria-label={hintView.ariaLabel}
      data-tone={hintView.tone}
      id={id}
      role="note"
      className={cn(
        'flex items-center gap-2 text-sm',
        isWarning
          ? 'rounded-md bg-warning/15 px-3 py-2 font-medium text-warning-text'
          : 'text-muted-foreground'
      )}
    >
      {isWarning ? (
        <IconAlertTriangle aria-hidden="true" className="size-4 shrink-0" />
      ) : null}
      {hintView.text}
    </p>
  );
}

function buildStudentRunnerSubmitHintId(id: string) {
  return `student-runner-submit-${id}-hint`;
}
