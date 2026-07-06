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

export function ClassroomControlSemanticsHandoff() {
  const handoffView = buildClassroomControlSemanticsHandoffView();

  return (
    <section
      aria-describedby="classroom-control-semantics-handoff-description"
      aria-labelledby="classroom-control-semantics-handoff-title"
      className="sr-only"
      data-handoff="classroom-control-semantics"
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
  return (
    <div data-handoff-item={itemView.id}>
      <dt>{itemView.label}</dt>
      <dd>
        <output aria-label={itemView.ariaLabel}>{itemView.value}</output>
        <span>{itemView.description}</span>
      </dd>
    </div>
  );
}
