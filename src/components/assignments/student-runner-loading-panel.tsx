import type { buildStudentRunnerPageViewModel } from '@/assignments/student-runner-state';
import Container from '@/components/layout/container';

type StudentRunnerPageViewModel = ReturnType<
  typeof buildStudentRunnerPageViewModel
>;

type StudentRunnerLoadingPanelProps = {
  view: StudentRunnerPageViewModel['loadingView'];
};

export function StudentRunnerLoadingPanel({
  view,
}: StudentRunnerLoadingPanelProps) {
  return (
    <Container className="px-4 py-10 md:py-14">
      <div className="mx-auto max-w-6xl rounded-lg border bg-card p-6">
        <p className="text-sm text-muted-foreground">{view.message}</p>
      </div>
    </Container>
  );
}
