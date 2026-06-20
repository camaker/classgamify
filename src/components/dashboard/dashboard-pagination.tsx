import { Button } from '@/components/ui/button';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

type DashboardPaginationProps = {
  currentPage: number;
  isLoading?: boolean;
  itemLabel: string;
  onPageChange: (page: number) => void;
  pageSize: number;
  total: number;
  totalPages: number;
};

export function DashboardPagination({
  currentPage,
  isLoading = false,
  itemLabel,
  onPageChange,
  pageSize,
  total,
  totalPages,
}: DashboardPaginationProps) {
  if (totalPages <= 1) return null;

  const firstItem = (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(total, currentPage * pageSize);

  return (
    <nav
      aria-label={`${itemLabel} pages`}
      className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-muted-foreground">
        Showing {firstItem}-{lastItem} of {total} {itemLabel}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="bg-background"
          disabled={isLoading || currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <IconChevronLeft className="size-4" />
          Previous
        </Button>
        <span className="min-w-24 text-center text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          className="bg-background"
          disabled={isLoading || currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
          <IconChevronRight className="size-4" />
        </Button>
      </div>
    </nav>
  );
}
