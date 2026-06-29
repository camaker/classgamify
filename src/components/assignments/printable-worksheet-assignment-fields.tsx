import type { PrintableWorksheetAssignmentFieldView } from '@/assignments/printable-worksheet-view';

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
  return (
    <div>
      <p className="font-medium">{fieldView.label}</p>
      {fieldView.kind === 'blank-line' ? (
        <div className="mt-3 h-8 border-b" />
      ) : (
        <p className="mt-2 text-muted-foreground">{fieldView.value}</p>
      )}
    </div>
  );
}
