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

  return (
    <section aria-label={controlView.submitControlsLabel} className="mt-4">
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
