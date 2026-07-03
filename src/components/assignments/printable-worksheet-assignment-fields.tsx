import type {
  PrintableWorksheetAssignmentFieldView,
  PrintableWorksheetBlankFieldView,
  PrintableWorksheetTextFieldView,
} from '@/assignments/printable-worksheet-view';

type PrintableWorksheetAssignmentFieldsProps = {
  fieldViews: PrintableWorksheetAssignmentFieldView[];
};

export function PrintableWorksheetAssignmentFields({
  fieldViews,
}: PrintableWorksheetAssignmentFieldsProps) {
  return (
    <section
      data-print-assignment
      className="grid gap-3 rounded-lg border bg-muted/20 p-4 text-sm sm:grid-cols-2"
    >
      {fieldViews.map((fieldView) => (
        <PrintableWorksheetAssignmentField
          key={fieldView.id}
          fieldView={fieldView}
        />
      ))}
    </section>
  );
}

function PrintableWorksheetAssignmentField({
  fieldView,
}: {
  fieldView: PrintableWorksheetAssignmentFieldView;
}) {
  if (fieldView.kind === 'blank-line') {
    return <PrintableWorksheetBlankField fieldView={fieldView} />;
  }

  return <PrintableWorksheetTextField fieldView={fieldView} />;
}

function PrintableWorksheetBlankField({
  fieldView,
}: {
  fieldView: PrintableWorksheetBlankFieldView;
}) {
  const labelId = `printable-worksheet-assignment-field-${fieldView.id}-label`;
  const valueId = `printable-worksheet-assignment-field-${fieldView.id}-value`;
  const descriptionId = `printable-worksheet-assignment-field-${fieldView.id}-description`;

  return (
    <article
      aria-describedby={descriptionId}
      aria-labelledby={`${labelId} ${valueId}`}
    >
      <p id={labelId} className="font-medium">
        {fieldView.label}
      </p>
      <output
        aria-describedby={descriptionId}
        aria-label={fieldView.ariaLabel}
        aria-labelledby={`${labelId} ${valueId}`}
        className="sr-only"
        id={valueId}
      >
        {fieldView.value}
      </output>
      <div aria-hidden="true" className="mt-3 h-8 border-b" />
      <p id={descriptionId} className="sr-only">
        {fieldView.description}
      </p>
    </article>
  );
}

function PrintableWorksheetTextField({
  fieldView,
}: {
  fieldView: PrintableWorksheetTextFieldView;
}) {
  const labelId = `printable-worksheet-assignment-field-${fieldView.id}-label`;
  const valueId = `printable-worksheet-assignment-field-${fieldView.id}-value`;
  const descriptionId = `printable-worksheet-assignment-field-${fieldView.id}-description`;

  return (
    <article
      aria-describedby={descriptionId}
      aria-labelledby={`${labelId} ${valueId}`}
    >
      <p id={labelId} className="font-medium">
        {fieldView.label}
      </p>
      <output
        aria-describedby={descriptionId}
        aria-label={fieldView.ariaLabel}
        aria-labelledby={`${labelId} ${valueId}`}
        className="mt-2 block text-muted-foreground"
        id={valueId}
      >
        {fieldView.value}
      </output>
      <p id={descriptionId} className="sr-only">
        {fieldView.description}
      </p>
    </article>
  );
}
