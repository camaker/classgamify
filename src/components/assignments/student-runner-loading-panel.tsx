import type {
  StudentRunnerLoadingHandoffItemView,
  StudentRunnerLoadingHandoffView,
} from '@/assignments/student-runner-loading-handoff';
import type { StudentRunnerLoadingView } from '@/assignments/student-runner-state';
import Container from '@/components/layout/container';

type StudentRunnerLoadingPanelProps = {
  view: StudentRunnerLoadingView;
};

export function StudentRunnerLoadingPanel({
  view,
}: StudentRunnerLoadingPanelProps) {
  return (
    <Container className="px-4 py-10 md:py-14">
      <div className="mx-auto max-w-6xl rounded-lg border bg-card p-6">
        <p className="text-sm text-muted-foreground">{view.message}</p>
        <StudentRunnerLoadingHandoff view={view.handoffView} />
      </div>
    </Container>
  );
}

function StudentRunnerLoadingHandoff({
  view,
}: {
  view: StudentRunnerLoadingHandoffView;
}) {
  const titleId = 'student-runner-loading-handoff-title';
  const descriptionId = 'student-runner-loading-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="student-runner-loading"
      data-handoff-scope={view.privacy.scope}
    >
      <h2 id={titleId}>{view.title}</h2>
      <p id={descriptionId}>{view.description}</p>
      <dl>
        {view.itemViews.map((itemView) => (
          <StudentRunnerLoadingHandoffItem
            itemView={itemView}
            key={itemView.id}
          />
        ))}
      </dl>
    </section>
  );
}

function StudentRunnerLoadingHandoffItem({
  itemView,
}: {
  itemView: StudentRunnerLoadingHandoffItemView;
}) {
  const labelId = `student-runner-loading-handoff-${itemView.id}-label`;
  const valueId = `student-runner-loading-handoff-${itemView.id}-value`;
  const descriptionId = `student-runner-loading-handoff-${itemView.id}-description`;

  return (
    <div data-handoff-item={itemView.id}>
      <dt id={labelId}>{itemView.label}</dt>
      <dd>
        <output
          aria-describedby={descriptionId}
          aria-label={itemView.ariaLabel}
          aria-labelledby={`${labelId} ${valueId}`}
          id={valueId}
        >
          {itemView.value}
        </output>
        <span id={descriptionId}>{itemView.description}</span>
      </dd>
    </div>
  );
}
