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
        disabled={controlView.submitDisabled}
        onClick={onSubmit}
      >
        <IconCheck className="size-4" />
        {controlView.submitButtonLabel}
      </Button>
      <StudentRunnerSubmitHint text={controlView.unansweredLabel} />
      <StudentRunnerSubmitHint text={controlView.submitConfirmationMessage} />
      <StudentRunnerSubmitHint text={controlView.readOnlyMessage} />
    </div>
  );
}

function StudentRunnerSubmitHint({ text }: { text?: string }) {
  if (!text) return null;

  return <p className="mt-2 text-xs text-muted-foreground">{text}</p>;
}
