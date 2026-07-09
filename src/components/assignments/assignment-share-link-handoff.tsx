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
      data-handoff-scope={handoff.privacy.scope}
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
  const labelId = `assignment-share-link-handoff-${item.id}-label`;
  const valueId = `assignment-share-link-handoff-${item.id}-value`;
  const descriptionId = `assignment-share-link-handoff-${item.id}-description`;

  return (
    <div data-handoff-item={item.id}>
      <dt id={labelId}>{item.label}</dt>
      <dd>
        <output
          aria-describedby={descriptionId}
          aria-label={item.ariaLabel}
          aria-labelledby={`${labelId} ${valueId}`}
          id={valueId}
        >
          {item.value}
        </output>
        <span id={descriptionId}>{item.description}</span>
      </dd>
    </div>
  );
}
