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
    <>
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
      <AssignmentStudentSummarySortHandoff view={tableView.sortHandoffView} />
    </>
  );
}

function AssignmentStudentSummarySortHandoff({
  view,
}: {
  view: AssignmentResultStudentSummaryTableView['sortHandoffView'];
}) {
  const titleId = 'assignment-student-summary-sort-handoff-title';
  const descriptionId = 'assignment-student-summary-sort-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="assignment-student-summary-sort"
    >
      <h3 id={titleId}>{view.title}</h3>
      <p id={descriptionId}>{view.description}</p>
      {view.itemViews.map((itemView) => (
        <AssignmentStudentSummarySortHandoffItem
          itemView={itemView}
          key={itemView.id}
        />
      ))}
    </section>
  );
}

function AssignmentStudentSummarySortHandoffItem({
  itemView,
}: {
  itemView: AssignmentResultStudentSummaryTableView['sortHandoffView']['itemViews'][number];
}) {
  const labelId = `assignment-student-summary-sort-${itemView.id}-label`;
  const valueId = `assignment-student-summary-sort-${itemView.id}-value`;
  const descriptionId = `assignment-student-summary-sort-${itemView.id}-description`;

  return (
    <div data-handoff-item={itemView.id}>
      <span id={labelId}>{itemView.label}</span>
      <output
        aria-describedby={descriptionId}
        aria-label={itemView.ariaLabel}
        aria-labelledby={`${labelId} ${valueId}`}
        id={valueId}
      >
        {itemView.value}
      </output>
      {itemView.statusLabel ? (
        <span aria-hidden="true">{itemView.statusLabel}</span>
      ) : null}
      <span id={descriptionId}>{itemView.description}</span>
    </div>
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
