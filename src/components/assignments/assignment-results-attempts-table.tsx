import type {
  AssignmentResultAttemptRowView,
  AssignmentResultAttemptTableView,
} from '@/assignments/result-view';
import { AssignmentResultsTableHeader } from '@/components/assignments/assignment-results-table-header';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

type AssignmentResultsAttemptsTableProps = {
  tableView: AssignmentResultAttemptTableView;
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
  rowDisplay: AssignmentResultAttemptRowView;
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
