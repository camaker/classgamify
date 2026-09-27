import type {
  AssignmentResultStudentSummaryRowView,
  AssignmentResultStudentSummaryTableView,
} from '@/assignments/result-view';
import { AssignmentResultsTableHeader } from '@/components/assignments/assignment-results-table-header';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableRow,
} from '@/components/ui/table';

type AssignmentResultsStudentSummaryTableProps = {
  tableView: AssignmentResultStudentSummaryTableView;
};

export function AssignmentResultsStudentSummaryTable({
  tableView,
}: AssignmentResultsStudentSummaryTableProps) {
  return (
    <Table aria-label={tableView.ariaLabel}>
      <TableCaption className="sr-only">{tableView.caption}</TableCaption>
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
  rowView: AssignmentResultStudentSummaryRowView;
}) {
  return (
    <TableRow aria-label={rowView.ariaLabel}>
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
