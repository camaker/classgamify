import {
  assignmentResultTableHeaders,
  type buildAssignmentResultsPageViewModel,
} from '@/assignments/result-view';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type AssignmentResultsStudentSummaryRows = ReturnType<
  typeof buildAssignmentResultsPageViewModel
>['studentSummaryRowViews'];

type AssignmentResultsStudentSummaryTableProps = {
  students: AssignmentResultsStudentSummaryRows;
};

export function AssignmentResultsStudentSummaryTable({
  students,
}: AssignmentResultsStudentSummaryTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {assignmentResultTableHeaders.studentSummary.map((header) => (
            <TableHead key={header}>{header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((rowView) => (
          <AssignmentResultsStudentSummaryRow
            key={rowView.id}
            rowView={rowView}
          />
        ))}
      </TableBody>
    </Table>
  );
}

function AssignmentResultsStudentSummaryRow({
  rowView,
}: {
  rowView: AssignmentResultsStudentSummaryRows[number];
}) {
  return (
    <TableRow>
      <TableCell>{rowView.studentLabel}</TableCell>
      <TableCell>{rowView.attemptsLabel}</TableCell>
      <TableCell>{rowView.latestAccuracyLabel}</TableCell>
      <TableCell>{rowView.averageAccuracyLabel}</TableCell>
      <TableCell>{rowView.bestAccuracyLabel}</TableCell>
      <TableCell>{rowView.needsReviewLabel}</TableCell>
      <TableCell>{rowView.lastSubmittedLabel}</TableCell>
    </TableRow>
  );
}
