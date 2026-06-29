import type { buildAssignmentResultsPageViewModel } from '@/assignments/result-view';
import { AssignmentResultsTableHeader } from '@/components/assignments/assignment-results-table-header';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

type AssignmentResultsStudentSummaryTableView = ReturnType<
  typeof buildAssignmentResultsPageViewModel
>['studentSummaryTableView'];
type AssignmentResultsStudentSummaryRows =
  AssignmentResultsStudentSummaryTableView['rows'];

type AssignmentResultsStudentSummaryTableProps = {
  tableView: AssignmentResultsStudentSummaryTableView;
};

export function AssignmentResultsStudentSummaryTable({
  tableView,
}: AssignmentResultsStudentSummaryTableProps) {
  return (
    <Table>
      <AssignmentResultsTableHeader headers={tableView.headers} />
      <TableBody>
        {tableView.rows.map((rowView) => (
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
