import type {
  StudentRunnerSubmissionHandoffItemView,
  StudentRunnerSubmissionHandoffView,
} from '@/assignments/student-runner-state';

type StudentRunnerSubmissionHandoffProps = {
  view: StudentRunnerSubmissionHandoffView;
};

export function StudentRunnerSubmissionHandoff({
  view,
}: StudentRunnerSubmissionHandoffProps) {
  const titleId = 'student-runner-submission-handoff-title';
  const descriptionId = 'student-runner-submission-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="student-runner-submission"
      data-handoff-scope={view.privacy.scope}
    >
      <h2 id={titleId}>{view.title}</h2>
      <p id={descriptionId}>{view.description}</p>
      <dl>
        {view.itemViews.map((itemView) => (
          <StudentRunnerSubmissionHandoffItem
            itemView={itemView}
            key={itemView.id}
          />
        ))}
      </dl>
    </section>
  );
}

function StudentRunnerSubmissionHandoffItem({
  itemView,
}: {
  itemView: StudentRunnerSubmissionHandoffItemView;
}) {
  const labelId = `student-runner-submission-handoff-${itemView.id}-label`;
  const valueId = `student-runner-submission-handoff-${itemView.id}-value`;
  const descriptionId = `student-runner-submission-handoff-${itemView.id}-description`;

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
