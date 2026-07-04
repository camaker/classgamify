import type {
  AssignmentShareLinkHandoffItemView,
  AssignmentShareLinkHandoffView,
} from '@/assignments/share-link';
import { useId } from 'react';

type AssignmentShareLinkHandoffProps = {
  handoff: AssignmentShareLinkHandoffView;
};

export function AssignmentShareLinkHandoff({
  handoff,
}: AssignmentShareLinkHandoffProps) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="assignment-share-link"
    >
      <h3 id={titleId}>{handoff.title}</h3>
      <p id={descriptionId}>{handoff.description}</p>
      <dl>
        {handoff.itemViews.map((item) => (
          <AssignmentShareLinkHandoffItem item={item} key={item.id} />
        ))}
      </dl>
    </section>
  );
}

function AssignmentShareLinkHandoffItem({
  item,
}: {
  item: AssignmentShareLinkHandoffItemView;
}) {
  return (
    <div data-handoff-item={item.id}>
      <dt>{item.label}</dt>
      <dd>
        <output aria-label={item.ariaLabel}>{item.value}</output>
        <span>{item.description}</span>
      </dd>
    </div>
  );
}
