import { m } from '@/locale/paraglide/messages';

export type DashboardPaginationItemKind = 'activities' | 'assignments';

type DashboardPaginationView = {
  ariaLabel: string;
  nextLabel: string;
  pageLabel: string;
  previousLabel: string;
  summary: string;
};

export function buildDashboardPaginationView({
  currentPage,
  itemKind,
  pageSize,
  total,
  totalPages,
}: {
  currentPage: number;
  itemKind: DashboardPaginationItemKind;
  pageSize: number;
  total: number;
  totalPages: number;
}): DashboardPaginationView {
  const firstItem = (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(total, currentPage * pageSize);
  const itemLabel = formatDashboardPaginationItemLabel(itemKind);

  return {
    ariaLabel: formatDashboardPaginationAriaLabel(itemKind),
    nextLabel: m.dashboard_pagination_next(),
    pageLabel: m.dashboard_pagination_page_summary({
      currentPage,
      totalPages,
    }),
    previousLabel: m.dashboard_pagination_previous(),
    summary: m.dashboard_pagination_summary({
      firstItem,
      itemLabel,
      lastItem,
      total,
    }),
  };
}

function formatDashboardPaginationAriaLabel(
  itemKind: DashboardPaginationItemKind
) {
  switch (itemKind) {
    case 'activities':
      return m.dashboard_pagination_activities_aria_label();
    case 'assignments':
      return m.dashboard_pagination_assignments_aria_label();
  }
}

function formatDashboardPaginationItemLabel(
  itemKind: DashboardPaginationItemKind
) {
  switch (itemKind) {
    case 'activities':
      return m.dashboard_pagination_activities_item_label();
    case 'assignments':
      return m.dashboard_pagination_assignments_item_label();
  }
}
