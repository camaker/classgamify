import type {
  AssignmentResultItemPerformanceRowView,
  AssignmentResultItemPerformanceTableView,
} from '@/assignments/result-view';
import { AssignmentResultsTableHeader } from '@/components/assignments/assignment-results-table-header';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableRow,
} from '@/components/ui/table';

type AssignmentResultsItemPerformanceTableProps = {
  tableView: AssignmentResultItemPerformanceTableView;
};

export function AssignmentResultsItemPerformanceTable({
  tableView,
}: AssignmentResultsItemPerformanceTableProps) {
  return (
    <Table aria-label={tableView.ariaLabel}>
      <TableCaption className="sr-only">{tableView.caption}</TableCaption>
      <AssignmentResultsTableHeader headers={tableView.headers} />
      <TableBody>
        {tableView.rows.map((rowView) => (
          <AssignmentResultsItemPerformanceRow
            key={rowView.id}
            rowView={rowView}
          />
        ))}
      </TableBody>
    </Table>
  );
}

function AssignmentResultsItemPerformanceRow({
  rowView,
}: {
  rowView: AssignmentResultItemPerformanceRowView;
}) {
  return (
    <TableRow aria-label={rowView.ariaLabel}>
      <TableCell className="max-w-80">{rowView.promptLabel}</TableCell>
      <TableCell>{rowView.kindLabel}</TableCell>
      <TableCell>{rowView.correctRateLabel}</TableCell>
      <TableCell>{rowView.submittedLabel}</TableCell>
      <TableCell>{rowView.unansweredLabel}</TableCell>
      <TableCell>{rowView.expectedAnswerText}</TableCell>
      <TableCell>{rowView.acceptedAnswersText}</TableCell>
      <TableCell className="max-w-72">{rowView.explanationText}</TableCell>
    </TableRow>
  );
}
