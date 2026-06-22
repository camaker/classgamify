import { Button } from '@/components/ui/button';
import {
  buildDashboardPaginationView,
  type DashboardPaginationItemKind,
} from '@/dashboard/pagination';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

type DashboardPaginationProps = {
  currentPage: number;
  isLoading?: boolean;
  itemKind: DashboardPaginationItemKind;
  onPageChange: (page: number) => void;
  pageSize: number;
  total: number;
  totalPages: number;
};

export function DashboardPagination({
  currentPage,
  isLoading = false,
  itemKind,
  onPageChange,
  pageSize,
  total,
  totalPages,
}: DashboardPaginationProps) {
  if (totalPages <= 1) return null;

  const view = buildDashboardPaginationView({
    currentPage,
    itemKind,
    pageSize,
    total,
    totalPages,
  });

  return (
    <nav
      aria-label={view.ariaLabel}
      className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-muted-foreground">{view.summary}</p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="bg-background"
          disabled={isLoading || currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <IconChevronLeft className="size-4" />
          {view.previousLabel}
        </Button>
        <span className="min-w-24 text-center text-sm text-muted-foreground">
          {view.pageLabel}
        </span>
        <Button
          type="button"
          variant="outline"
          className="bg-background"
          disabled={isLoading || currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          {view.nextLabel}
          <IconChevronRight className="size-4" />
        </Button>
      </div>
    </nav>
  );
}
