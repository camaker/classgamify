import type { StudentRunnerMissingPageView } from '@/assignments/student-runner-state';
import { IconLinkOff } from '@tabler/icons-react';

type StudentRunnerMissingPanelProps = {
  view: StudentRunnerMissingPageView;
};

/**
 * Closed, draft, expired, or mistyped links: tell the student plainly and
 * stop. Nothing about the activity or the teacher's setup is shown.
 */
export function StudentRunnerMissingPanel({
  view,
}: StudentRunnerMissingPanelProps) {
  const titleId = 'student-runner-missing-title';
  const descriptionId = 'student-runner-missing-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="grid justify-items-start gap-4 py-10"
      data-missing-reason={view.reason}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-muted">
        <IconLinkOff
          aria-hidden="true"
          className="size-6 text-muted-foreground"
        />
      </span>
      <h1
        id={titleId}
        className="text-balance font-bold text-3xl tracking-tight"
      >
        {view.title}
      </h1>
      <p
        id={descriptionId}
        className="max-w-xl text-base text-muted-foreground leading-7"
      >
        {view.description}
      </p>
    </section>
  );
}
