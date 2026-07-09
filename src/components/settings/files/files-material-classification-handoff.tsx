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
      data-handoff="settings-files-material-classification"
      data-handoff-scope={view.privacy.scope}
    >
      <h2 id={titleId}>{view.title}</h2>
      <p id={descriptionId}>{view.description}</p>
      <dl>
        {view.itemViews.map((itemView) => (
          <FilesMaterialClassificationHandoffItem
            itemView={itemView}
            key={itemView.id}
          />
        ))}
      </dl>
    </section>
  );
}

function FilesMaterialClassificationHandoffItem({
  itemView,
}: {
  itemView: SettingsFilesMaterialClassificationHandoffView['itemViews'][number];
}) {
  const labelId = `settings-files-material-classification-handoff-${itemView.id}-label`;
  const valueId = `settings-files-material-classification-handoff-${itemView.id}-value`;
  const descriptionId = `settings-files-material-classification-handoff-${itemView.id}-description`;

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
