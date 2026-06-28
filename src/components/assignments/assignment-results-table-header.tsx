import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

type AssignmentResultsTableHeaderProps = {
  headers: string[];
};

export function AssignmentResultsTableHeader({
  headers,
}: AssignmentResultsTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow>
        {headers.map((header) => (
          <TableHead key={header}>{header}</TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}
