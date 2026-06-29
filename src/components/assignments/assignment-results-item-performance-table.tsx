import {
  assignmentResultTableHeaders,
  type buildAssignmentResultsPageViewModel,
} from '@/assignments/result-view';
import { AssignmentResultsTableHeader } from '@/components/assignments/assignment-results-table-header';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

type AssignmentResultsItemPerformanceRows = ReturnType<
  typeof buildAssignmentResultsPageViewModel
>['itemPerformanceRowViews'];

type AssignmentResultsItemPerformanceTableProps = {
  items: AssignmentResultsItemPerformanceRows;
};

export function AssignmentResultsItemPerformanceTable({
  items,
}: AssignmentResultsItemPerformanceTableProps) {
  return (
    <Table>
      <AssignmentResultsTableHeader
        headers={assignmentResultTableHeaders.itemPerformance}
      />
      <TableBody>
        {items.map((rowView) => (
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
  rowView: AssignmentResultsItemPerformanceRows[number];
}) {
  return (
    <TableRow>
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
