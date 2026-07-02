import type { AssignmentResultTableHeaderView } from '@/assignments/result-view';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

type AssignmentResultsTableHeaderProps = {
  headers: AssignmentResultTableHeaderView[];
};

export function AssignmentResultsTableHeader({
  headers,
}: AssignmentResultsTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow>
        {headers.map((header) => (
          <TableHead key={header.id} scope="col">
            {header.label}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}
