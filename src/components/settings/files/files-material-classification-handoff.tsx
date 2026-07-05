import type { SettingsFilesMaterialClassificationHandoffView } from '@/settings/files-material-classification-view';

type FilesMaterialClassificationHandoffProps = {
  view: SettingsFilesMaterialClassificationHandoffView;
};

export function FilesMaterialClassificationHandoff({
  view,
}: FilesMaterialClassificationHandoffProps) {
  const titleId = 'settings-files-material-classification-handoff-title';
  const descriptionId =
    'settings-files-material-classification-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
    >
      <h2 id={titleId}>{view.title}</h2>
      <p id={descriptionId}>{view.description}</p>
      <dl>
        {view.itemViews.map((itemView) => (
          <div key={itemView.id}>
            <dt>{itemView.label}</dt>
            <dd>
              <output aria-label={itemView.ariaLabel}>{itemView.value}</output>
            </dd>
            <dd>{itemView.description}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
