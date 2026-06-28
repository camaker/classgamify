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

type AssignmentResultsAttemptRows = ReturnType<
  typeof buildAssignmentResultsPageViewModel
>['attemptRowViews'];

type AssignmentResultsAttemptsTableProps = {
  attempts: AssignmentResultsAttemptRows;
};

export function AssignmentResultsAttemptsTable({
  attempts,
}: AssignmentResultsAttemptsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {assignmentResultTableHeaders.studentAttempts.map((header) => (
            <TableHead key={header}>{header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {attempts.map((rowDisplay) => (
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
