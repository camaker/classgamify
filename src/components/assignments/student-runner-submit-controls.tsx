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
    <div className="mt-4">
      <Button
        type="button"
        className="w-full sm:w-fit"
        data-confirm-incomplete={
          controlView.requiresIncompleteSubmitConfirmation ? true : undefined
        }
        disabled={controlView.submitDisabled}
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
          text={hintView.text}
        />
      ))}
    </div>
  );
}

function StudentRunnerSubmitHint({ id, text }: { id: string; text: string }) {
  return (
    <p id={id} className="mt-2 text-xs text-muted-foreground">
      {text}
    </p>
  );
}

function buildStudentRunnerSubmitHintId(id: string) {
  return `student-runner-submit-${id}-hint`;
}
