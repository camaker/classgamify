import type {
  AssignmentResultReviewControlsHandoffItemView,
  AssignmentResultReviewControlsHandoffView,
  AssignmentResultReviewHandoffItemView,
  AssignmentResultReviewHandoffView,
} from '@/assignments/result-view';
import type {
  TeacherResultsReviewChainHandoffItemView,
  TeacherResultsReviewChainHandoffView,
} from '@/assignments/teacher-results-review-chain';

type AssignmentResultsReviewHandoffPanelProps = {
  controlsView: AssignmentResultReviewControlsHandoffView;
  teacherResultsReviewChainView: TeacherResultsReviewChainHandoffView;
  view: AssignmentResultReviewHandoffView;
};

export function AssignmentResultsReviewHandoffPanel({
  controlsView,
  teacherResultsReviewChainView,
  view,
}: AssignmentResultsReviewHandoffPanelProps) {
  const titleId = 'assignment-result-review-handoff-title';
  const descriptionId = 'assignment-result-review-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="assignment-result-review"
      data-handoff-scope={view.privacy.scope}
    >
      <h2 id={titleId}>{view.title}</h2>
      <p id={descriptionId}>{view.description}</p>
      <dl>
        {view.itemViews.map((itemView) => (
          <AssignmentResultReviewHandoffItem
            itemView={itemView}
            key={itemView.id}
          />
        ))}
      </dl>
      <AssignmentResultReviewControlsHandoff view={controlsView} />
      <TeacherResultsReviewChainHandoff view={teacherResultsReviewChainView} />
    </section>
  );
}

function AssignmentResultReviewHandoffItem({
  itemView,
}: {
  itemView: AssignmentResultReviewHandoffItemView;
}) {
  const labelId = `assignment-result-review-${itemView.id}-label`;
  const valueId = `assignment-result-review-${itemView.id}-value`;
  const descriptionId = `assignment-result-review-${itemView.id}-description`;

  return (
    <div data-handoff-item={itemView.id} data-scope={itemView.dataScope}>
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
        {itemView.statusLabel ? (
          <span aria-hidden="true">{itemView.statusLabel}</span>
        ) : null}
        <p id={descriptionId}>{itemView.description}</p>
      </dd>
    </div>
  );
}

function AssignmentResultReviewControlsHandoff({
  view,
}: {
  view: AssignmentResultReviewControlsHandoffView;
}) {
  const titleId = 'assignment-result-review-controls-handoff-title';
  const descriptionId = 'assignment-result-review-controls-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="assignment-result-review-controls"
      data-handoff-scope={view.privacy.scope}
    >
      <h3 id={titleId}>{view.title}</h3>
      <p id={descriptionId}>{view.description}</p>
      <dl>
        {view.itemViews.map((itemView) => (
          <AssignmentResultReviewControlsHandoffItem
            itemView={itemView}
            key={itemView.id}
          />
        ))}
      </dl>
    </section>
  );
}

function AssignmentResultReviewControlsHandoffItem({
  itemView,
}: {
  itemView: AssignmentResultReviewControlsHandoffItemView;
}) {
  const labelId = `assignment-result-review-controls-handoff-${itemView.id}-label`;
  const valueId = `assignment-result-review-controls-handoff-${itemView.id}-value`;
  const descriptionId = `assignment-result-review-controls-handoff-${itemView.id}-description`;

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
        {itemView.statusLabel ? (
          <span aria-hidden="true">{itemView.statusLabel}</span>
        ) : null}
        <p id={descriptionId}>{itemView.description}</p>
      </dd>
    </div>
  );
}

function TeacherResultsReviewChainHandoff({
  view,
}: {
  view: TeacherResultsReviewChainHandoffView;
}) {
  const titleId = 'teacher-results-review-chain-handoff-title';
  const descriptionId = 'teacher-results-review-chain-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="teacher-results-review-chain"
      data-handoff-scope="teacher-results-review-chain"
    >
      <h3 id={titleId}>{view.title}</h3>
      <p id={descriptionId}>{view.description}</p>
      <dl>
        {view.itemViews.map((itemView) => (
          <TeacherResultsReviewChainHandoffItem
            itemView={itemView}
            key={itemView.id}
          />
        ))}
      </dl>
    </section>
  );
}

function TeacherResultsReviewChainHandoffItem({
  itemView,
}: {
  itemView: TeacherResultsReviewChainHandoffItemView;
}) {
  const labelId = `teacher-results-review-chain-handoff-${itemView.id}-label`;
  const valueId = `teacher-results-review-chain-handoff-${itemView.id}-value`;
  const descriptionId = `teacher-results-review-chain-handoff-${itemView.id}-description`;

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
        <p id={descriptionId}>{itemView.description}</p>
      </dd>
    </div>
  );
}
