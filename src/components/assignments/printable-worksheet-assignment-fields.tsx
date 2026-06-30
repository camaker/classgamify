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
  return (
    <div>
      <p className="font-medium">{fieldView.label}</p>
      <div className="mt-3 h-8 border-b" />
    </div>
  );
}

function PrintableWorksheetTextField({
  fieldView,
}: {
  fieldView: PrintableWorksheetTextFieldView;
}) {
  return (
    <div>
      <p className="font-medium">{fieldView.label}</p>
      <p className="mt-2 text-muted-foreground">{fieldView.value}</p>
    </div>
  );
}
