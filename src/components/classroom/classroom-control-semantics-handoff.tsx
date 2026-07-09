import { useRouterState } from '@tanstack/react-router';
import {
  buildClassroomControlSemanticsHandoffView,
  shouldRenderClassroomControlSemanticsHandoff,
  type ClassroomControlSemanticsHandoffItemView,
} from '@/classroom/control-semantics';
import { getCanonicalPathname } from '@/lib/locale';

export function ClassroomControlSemanticsHandoffMount() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const canonicalPathname = getCanonicalPathname(pathname);

  if (!shouldRenderClassroomControlSemanticsHandoff(canonicalPathname)) {
    return null;
  }

  return <ClassroomControlSemanticsHandoff />;
}

function ClassroomControlSemanticsHandoff() {
  const handoffView = buildClassroomControlSemanticsHandoffView();

  return (
    <section
      aria-describedby="classroom-control-semantics-handoff-description"
      aria-labelledby="classroom-control-semantics-handoff-title"
      className="sr-only"
      data-handoff="classroom-control-semantics"
      data-handoff-scope={handoffView.privacy.scope}
    >
      <h2 id="classroom-control-semantics-handoff-title">
        {handoffView.title}
      </h2>
      <p id="classroom-control-semantics-handoff-description">
        {handoffView.description}
      </p>
      <dl>
        {handoffView.itemViews.map((itemView) => (
          <ClassroomControlSemanticsHandoffItem
            itemView={itemView}
            key={itemView.id}
          />
        ))}
      </dl>
    </section>
  );
}

function ClassroomControlSemanticsHandoffItem({
  itemView,
}: {
  itemView: ClassroomControlSemanticsHandoffItemView;
}) {
  const labelId = `classroom-control-semantics-handoff-${itemView.id}-label`;
  const valueId = `classroom-control-semantics-handoff-${itemView.id}-value`;
  const descriptionId = `classroom-control-semantics-handoff-${itemView.id}-description`;

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
      </dd>
      <dd id={descriptionId}>{itemView.description}</dd>
    </div>
  );
}
