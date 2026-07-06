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
    <>
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
      <AssignmentItemPerformanceSortHandoff view={tableView.sortHandoffView} />
    </>
  );
}

function AssignmentItemPerformanceSortHandoff({
  view,
}: {
  view: AssignmentResultItemPerformanceTableView['sortHandoffView'];
}) {
  const titleId = 'assignment-item-performance-sort-handoff-title';
  const descriptionId = 'assignment-item-performance-sort-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="assignment-item-performance-sort"
    >
      <h3 id={titleId}>{view.title}</h3>
      <p id={descriptionId}>{view.description}</p>
      {view.itemViews.map((itemView) => (
        <AssignmentItemPerformanceSortHandoffItem
          itemView={itemView}
          key={itemView.id}
        />
      ))}
    </section>
  );
}

function AssignmentItemPerformanceSortHandoffItem({
  itemView,
}: {
  itemView: AssignmentResultItemPerformanceTableView['sortHandoffView']['itemViews'][number];
}) {
  const labelId = `assignment-item-performance-sort-${itemView.id}-label`;
  const valueId = `assignment-item-performance-sort-${itemView.id}-value`;
  const descriptionId = `assignment-item-performance-sort-${itemView.id}-description`;

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
