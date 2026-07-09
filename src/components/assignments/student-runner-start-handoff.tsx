import type {
  StudentRunnerStartHandoffItemView,
  StudentRunnerStartHandoffView,
} from '@/assignments/student-runner-state';

type StudentRunnerStartHandoffProps = {
  view: StudentRunnerStartHandoffView;
};

export function StudentRunnerStartHandoff({
  view,
}: StudentRunnerStartHandoffProps) {
  const titleId = 'student-runner-start-handoff-title';
  const descriptionId = 'student-runner-start-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="student-runner-start"
      data-handoff-scope={view.privacy.scope}
    >
      <h2 id={titleId}>{view.title}</h2>
      <p id={descriptionId}>{view.description}</p>
      <dl>
        {view.itemViews.map((itemView) => (
          <StudentRunnerStartHandoffItem
            itemView={itemView}
            key={itemView.id}
          />
        ))}
      </dl>
    </section>
  );
}

function StudentRunnerStartHandoffItem({
  itemView,
}: {
  itemView: StudentRunnerStartHandoffItemView;
}) {
  const labelId = `student-runner-start-handoff-${itemView.id}-label`;
  const valueId = `student-runner-start-handoff-${itemView.id}-value`;
  const descriptionId = `student-runner-start-handoff-${itemView.id}-description`;

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
