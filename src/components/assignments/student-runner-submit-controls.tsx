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
  return (
    <div className="mt-4">
      <Button
        type="button"
        className="w-full sm:w-fit"
        data-confirm-incomplete={
          controlView.requiresIncompleteSubmitConfirmation ? true : undefined
        }
        disabled={controlView.submitDisabled}
        onClick={onSubmit}
      >
        <IconCheck className="size-4" />
        {controlView.submitButtonLabel}
      </Button>
      {controlView.submitHintViews.map((hintView) => (
        <StudentRunnerSubmitHint key={hintView.id} text={hintView.text} />
      ))}
    </div>
  );
}

function StudentRunnerSubmitHint({ text }: { text: string }) {
  return <p className="mt-2 text-xs text-muted-foreground">{text}</p>;
}
