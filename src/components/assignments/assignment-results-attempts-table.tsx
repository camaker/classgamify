import type {
  AssignmentResultAttemptRowView,
  AssignmentResultAttemptTableView,
} from '@/assignments/result-view';
import { AssignmentResultsTableHeader } from '@/components/assignments/assignment-results-table-header';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableRow,
} from '@/components/ui/table';

type AssignmentResultsAttemptsTableProps = {
  tableView: AssignmentResultAttemptTableView;
};

export function AssignmentResultsAttemptsTable({
  tableView,
}: AssignmentResultsAttemptsTableProps) {
  return (
    <Table aria-label={tableView.ariaLabel}>
      <TableCaption className="sr-only">{tableView.caption}</TableCaption>
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
    <TableRow aria-label={rowDisplay.ariaLabel}>
      <TableCell>{rowDisplay.studentLabel}</TableCell>
      <TableCell>{rowDisplay.scoreLabel}</TableCell>
      <TableCell>{rowDisplay.accuracyLabel}</TableCell>
      <TableCell>{rowDisplay.answeredLabel}</TableCell>
      <TableCell>
        <output
          aria-description={rowDisplay.durationView.description}
          aria-label={rowDisplay.durationView.ariaLabel}
        >
          {rowDisplay.durationView.label}
        </output>
      </TableCell>
      <TableCell>{rowDisplay.submittedAtLabel}</TableCell>
    </TableRow>
  );
}
