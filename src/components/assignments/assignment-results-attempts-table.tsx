import type { buildAssignmentResultsPageViewModel } from '@/assignments/result-view';
import { AssignmentResultsTableHeader } from '@/components/assignments/assignment-results-table-header';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

type AssignmentResultsAttemptTableView = ReturnType<
  typeof buildAssignmentResultsPageViewModel
>['attemptTableView'];
type AssignmentResultsAttemptRows = AssignmentResultsAttemptTableView['rows'];

type AssignmentResultsAttemptsTableProps = {
  tableView: AssignmentResultsAttemptTableView;
};

export function AssignmentResultsAttemptsTable({
  tableView,
}: AssignmentResultsAttemptsTableProps) {
  return (
    <Table>
      <AssignmentResultsTableHeader headers={tableView.headers} />
      <TableBody>
        {tableView.rows.map((rowDisplay) => (
          <AssignmentResultsAttemptRow
            key={rowDisplay.id}
            rowDisplay={rowDisplay}
          />
        ))}
      </TableBody>
    </Table>
  );
}

function AssignmentResultsAttemptRow({
  rowDisplay,
}: {
  rowDisplay: AssignmentResultsAttemptRows[number];
}) {
  return (
    <TableRow>
      <TableCell>{rowDisplay.studentLabel}</TableCell>
      <TableCell>{rowDisplay.scoreLabel}</TableCell>
      <TableCell>{rowDisplay.accuracyLabel}</TableCell>
      <TableCell>{rowDisplay.answeredLabel}</TableCell>
      <TableCell>{rowDisplay.durationLabel}</TableCell>
      <TableCell>{rowDisplay.submittedAtLabel}</TableCell>
    </TableRow>
  );
}
