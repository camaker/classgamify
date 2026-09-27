import type { StudentRunnerLoadingView } from '@/assignments/student-runner-state';
import { IconLoader2 } from '@tabler/icons-react';

type StudentRunnerLoadingPanelProps = {
  view: StudentRunnerLoadingView;
};

export function StudentRunnerLoadingPanel({
  view,
}: StudentRunnerLoadingPanelProps) {
  return (
    <output
      aria-live="polite"
      className="flex items-center gap-3 py-16 text-base text-muted-foreground"
    >
      <IconLoader2 aria-hidden="true" className="size-5 animate-spin" />
      {view.message}
    </output>
  );
}
