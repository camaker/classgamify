import type { DashboardBreadcrumbItem } from '@/components/layout/dashboard-header';
import { m } from '@/locale/paraglide/messages';
import type { SortingState } from '@tanstack/react-table';

export const ADMIN_USERS_HANDOFF_ITEM_IDS = [
  'admin-scope',
  'route-gate',
  'admin-role-boundary',
  'user-list-query',
  'search-state',
  'role-filter',
  'status-filter',
  'sort-state',
  'pagination-state',
  'visible-rows',
  'total-users',
  'loading-state',
  'table-columns',
  'name-column',
  'email-column',
  'email-copy-action',
  'email-verification-status',
  'role-column',
  'status-column',
  'ban-reason-column',
  'ban-expiry-column',
  'detail-drawer',
  'ban-action',
  'unban-action',
  'ban-reason-required',
  'ban-expiry-optional',
  'mutation-feedback',
  'activity-content-boundary',
  'assignment-link-boundary',
  'student-result-boundary',
] as const;

export type AdminUsersHandoffItemId =
  (typeof ADMIN_USERS_HANDOFF_ITEM_IDS)[number];

export type AdminUsersHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: AdminUsersHandoffItemId;
  label: string;
  value: string;
};

export type AdminUsersHandoffPrivacyContract = {
  changesActivityContent: false;
  changesAssignmentLinks: false;
  exposesActivityContent: false;
  exposesAssignmentSnapshots: false;
  exposesRawStudentIdentifiers: false;
  exposesSearchText: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentAnswers: false;
  exposesUserEmails: false;
  itemIds: AdminUsersHandoffItemId[];
  scope: 'admin-user-governance';
};

export type AdminUsersHandoffView = {
  description: string;
  itemViews: AdminUsersHandoffItemView[];
  privacy: AdminUsersHandoffPrivacyContract;
  title: string;
};

export type AdminUsersPageViewModel = {
  breadcrumbs: DashboardBreadcrumbItem[];
  contentAriaLabel: string;
  title: string;
};

export type AdminUsersHandoffInput = {
  filters?: Array<{ id: string; value: string }>;
  loading?: boolean;
  pageIndex: number;
  pageSize: number;
  search?: string;
  sorting?: SortingState;
  total: number;
  visibleCount: number;
};

export function buildAdminUsersPageViewModel(): AdminUsersPageViewModel {
  const title = m.admin_users_title();

  return {
    breadcrumbs: [
      { id: 'admin', label: m.admin_title(), isCurrentPage: false },
      { id: 'users', label: title, isCurrentPage: true },
    ],
    contentAriaLabel: m.admin_users_content_aria_label({
      title,
    }),
    title,
  };
}

export function buildAdminUsersHandoffView({
  filters = [],
  loading = false,
  pageIndex,
  pageSize,
  search = '',
  sorting = [],
  total,
  visibleCount,
}: AdminUsersHandoffInput): AdminUsersHandoffView {
  const summary = buildAdminUsersHandoffSummary({
    filters,
    loading,
    pageIndex,
    pageSize,
    search,
    sorting,
    total,
    visibleCount,
  });
  const itemViews = ADMIN_USERS_HANDOFF_ITEM_IDS.map((id) =>
    buildAdminUsersHandoffItemView({ id, summary })
  );

  return {
    description: m.admin_users_handoff_description(),
    itemViews,
    privacy: buildAdminUsersHandoffPrivacyContract(itemViews),
    title: m.admin_users_handoff_title(),
  };
}

type AdminUsersHandoffSummary = {
  loadingValue: string;
  pageValue: string;
  roleFilterValue: string;
  searchValue: string;
  sortValue: string;
  statusFilterValue: string;
  totalValue: string;
  visibleRowsValue: string;
};

function buildAdminUsersHandoffSummary({
  filters,
  loading,
  pageIndex,
  pageSize,
  search,
  sorting,
  total,
  visibleCount,
}: Required<Pick<AdminUsersHandoffInput, 'loading' | 'search' | 'sorting'>> &
  Pick<
    AdminUsersHandoffInput,
    'filters' | 'pageIndex' | 'pageSize' | 'total' | 'visibleCount'
  >): AdminUsersHandoffSummary {
  return {
    loadingValue: loading
      ? m.admin_users_handoff_loading_value()
      : m.admin_users_handoff_ready_value(),
    pageValue: m.admin_users_handoff_pagination_value({
      page: formatAdminUsersHandoffCount(pageIndex + 1),
      pageSize: formatAdminUsersHandoffCount(pageSize),
    }),
    roleFilterValue: formatAdminUsersRoleFilter(
      filters?.find((filter) => filter.id === 'role')?.value
    ),
    searchValue: search.trim()
      ? m.admin_users_handoff_search_active_value()
      : m.admin_users_handoff_search_empty_value(),
    sortValue: formatAdminUsersSortValue(sorting),
    statusFilterValue: formatAdminUsersStatusFilter(
      filters?.find((filter) => filter.id === 'status')?.value
    ),
    totalValue: formatAdminUsersHandoffCount(total),
    visibleRowsValue: formatAdminUsersHandoffCount(visibleCount),
  };
}

function buildAdminUsersHandoffItemView({
  id,
  summary,
}: {
  id: AdminUsersHandoffItemId;
  summary: AdminUsersHandoffSummary;
}): AdminUsersHandoffItemView {
  const item = buildAdminUsersHandoffItem({ id, summary });

  return {
    ...item,
    ariaLabel: m.admin_users_handoff_item_aria_label({
      description: item.description,
      label: item.label,
      value: item.value,
    }),
  };
}

function buildAdminUsersHandoffItem({
  id,
  summary,
}: {
  id: AdminUsersHandoffItemId;
  summary: AdminUsersHandoffSummary;
}): Omit<AdminUsersHandoffItemView, 'ariaLabel'> {
  switch (id) {
    case 'admin-scope':
      return buildAdminUsersHandoffStaticItem({
        description: m.admin_users_handoff_admin_scope_description(),
        id,
        label: m.admin_users_handoff_admin_scope_label(),
        value: m.admin_users_handoff_admin_scope_value(),
      });
    case 'route-gate':
      return buildAdminUsersHandoffStaticItem({
        description: m.admin_users_handoff_route_gate_description(),
        id,
        label: m.admin_users_handoff_route_gate_label(),
        value: m.admin_users_handoff_route_gate_value(),
      });
    case 'admin-role-boundary':
      return buildAdminUsersHandoffStaticItem({
        description: m.admin_users_handoff_admin_role_boundary_description(),
        id,
        label: m.admin_users_handoff_admin_role_boundary_label(),
        value: m.admin_users_handoff_admin_role_boundary_value(),
      });
    case 'user-list-query':
      return buildAdminUsersHandoffStaticItem({
        description: m.admin_users_handoff_user_list_query_description(),
        id,
        label: m.admin_users_handoff_user_list_query_label(),
        value: m.admin_users_handoff_user_list_query_value(),
      });
    case 'search-state':
      return buildAdminUsersHandoffStaticItem({
        description: m.admin_users_handoff_search_state_description(),
        id,
        label: m.admin_users_handoff_search_state_label(),
        value: summary.searchValue,
      });
    case 'role-filter':
      return buildAdminUsersHandoffStaticItem({
        description: m.admin_users_handoff_role_filter_description(),
        id,
        label: m.admin_users_handoff_role_filter_label(),
        value: summary.roleFilterValue,
      });
    case 'status-filter':
      return buildAdminUsersHandoffStaticItem({
        description: m.admin_users_handoff_status_filter_description(),
        id,
        label: m.admin_users_handoff_status_filter_label(),
        value: summary.statusFilterValue,
      });
    case 'sort-state':
      return buildAdminUsersHandoffStaticItem({
        description: m.admin_users_handoff_sort_state_description(),
        id,
        label: m.admin_users_handoff_sort_state_label(),
        value: summary.sortValue,
      });
    case 'pagination-state':
      return buildAdminUsersHandoffStaticItem({
        description: m.admin_users_handoff_pagination_state_description(),
        id,
        label: m.admin_users_handoff_pagination_state_label(),
        value: summary.pageValue,
      });
    case 'visible-rows':
      return buildAdminUsersHandoffStaticItem({
        description: m.admin_users_handoff_visible_rows_description(),
        id,
        label: m.admin_users_handoff_visible_rows_label(),
        value: summary.visibleRowsValue,
      });
    case 'total-users':
      return buildAdminUsersHandoffStaticItem({
        description: m.admin_users_handoff_total_users_description(),
        id,
        label: m.admin_users_handoff_total_users_label(),
        value: summary.totalValue,
      });
    case 'loading-state':
      return buildAdminUsersHandoffStaticItem({
        description: m.admin_users_handoff_loading_state_description(),
        id,
        label: m.admin_users_handoff_loading_state_label(),
        value: summary.loadingValue,
      });
    case 'table-columns':
      return buildAdminUsersHandoffStaticItem({
        description: m.admin_users_handoff_table_columns_description(),
        id,
        label: m.admin_users_handoff_table_columns_label(),
        value: m.admin_users_handoff_table_columns_value(),
      });
    case 'name-column':
      return buildAdminUsersHandoffStaticItem({
        description: m.admin_users_handoff_name_column_description(),
        id,
        label: m.admin_users_handoff_name_column_label(),
        value: m.admin_users_columns_name(),
      });
    case 'email-column':
      return buildAdminUsersHandoffStaticItem({
        description: m.admin_users_handoff_email_column_description(),
        id,
        label: m.admin_users_handoff_email_column_label(),
        value: m.admin_users_columns_email(),
      });
    case 'email-copy-action':
      return buildAdminUsersHandoffStaticItem({
        description: m.admin_users_handoff_email_copy_action_description(),
        id,
        label: m.admin_users_handoff_email_copy_action_label(),
        value: m.admin_users_handoff_clipboard_guard_value(),
      });
    case 'email-verification-status':
      return buildAdminUsersHandoffStaticItem({
        description:
          m.admin_users_handoff_email_verification_status_description(),
        id,
        label: m.admin_users_handoff_email_verification_status_label(),
        value: m.admin_users_handoff_status_badges_value(),
      });
    case 'role-column':
      return buildAdminUsersHandoffStaticItem({
        description: m.admin_users_handoff_role_column_description(),
        id,
        label: m.admin_users_handoff_role_column_label(),
        value: m.admin_users_columns_role(),
      });
    case 'status-column':
      return buildAdminUsersHandoffStaticItem({
        description: m.admin_users_handoff_status_column_description(),
        id,
        label: m.admin_users_handoff_status_column_label(),
        value: m.admin_users_columns_status(),
      });
    case 'ban-reason-column':
      return buildAdminUsersHandoffStaticItem({
        description: m.admin_users_handoff_ban_reason_column_description(),
        id,
        label: m.admin_users_handoff_ban_reason_column_label(),
        value: m.admin_users_columns_ban_reason(),
      });
    case 'ban-expiry-column':
      return buildAdminUsersHandoffStaticItem({
        description: m.admin_users_handoff_ban_expiry_column_description(),
        id,
        label: m.admin_users_handoff_ban_expiry_column_label(),
        value: m.admin_users_columns_ban_expires(),
      });
    case 'detail-drawer':
      return buildAdminUsersHandoffStaticItem({
        description: m.admin_users_handoff_detail_drawer_description(),
        id,
        label: m.admin_users_handoff_detail_drawer_label(),
        value: m.admin_users_handoff_admin_only_value(),
      });
    case 'ban-action':
      return buildAdminUsersHandoffStaticItem({
        description: m.admin_users_handoff_ban_action_description(),
        id,
        label: m.admin_users_handoff_ban_action_label(),
        value: m.admin_users_ban_button(),
      });
    case 'unban-action':
      return buildAdminUsersHandoffStaticItem({
        description: m.admin_users_handoff_unban_action_description(),
        id,
        label: m.admin_users_handoff_unban_action_label(),
        value: m.admin_users_unban_button(),
      });
    case 'ban-reason-required':
      return buildAdminUsersHandoffStaticItem({
        description: m.admin_users_handoff_ban_reason_required_description(),
        id,
        label: m.admin_users_handoff_ban_reason_required_label(),
        value: m.admin_users_handoff_required_value(),
      });
    case 'ban-expiry-optional':
      return buildAdminUsersHandoffStaticItem({
        description: m.admin_users_handoff_ban_expiry_optional_description(),
        id,
        label: m.admin_users_handoff_ban_expiry_optional_label(),
        value: m.admin_users_handoff_optional_value(),
      });
    case 'mutation-feedback':
      return buildAdminUsersHandoffStaticItem({
        description: m.admin_users_handoff_mutation_feedback_description(),
        id,
        label: m.admin_users_handoff_mutation_feedback_label(),
        value: m.admin_users_handoff_localized_toasts_value(),
      });
    case 'activity-content-boundary':
      return buildAdminUsersHandoffStaticItem({
        description:
          m.admin_users_handoff_activity_content_boundary_description(),
        id,
        label: m.admin_users_handoff_activity_content_boundary_label(),
        value: m.admin_users_handoff_not_exposed_value(),
      });
    case 'assignment-link-boundary':
      return buildAdminUsersHandoffStaticItem({
        description:
          m.admin_users_handoff_assignment_link_boundary_description(),
        id,
        label: m.admin_users_handoff_assignment_link_boundary_label(),
        value: m.admin_users_handoff_no_link_changes_value(),
      });
    case 'student-result-boundary':
      return buildAdminUsersHandoffStaticItem({
        description:
          m.admin_users_handoff_student_result_boundary_description(),
        id,
        label: m.admin_users_handoff_student_result_boundary_label(),
        value: m.admin_users_handoff_private_results_value(),
      });
  }
}

function buildAdminUsersHandoffStaticItem({
  description,
  id,
  label,
  value,
}: Omit<AdminUsersHandoffItemView, 'ariaLabel'>) {
  return {
    description,
    id,
    label,
    value,
  };
}

function buildAdminUsersHandoffPrivacyContract(
  itemViews: AdminUsersHandoffItemView[]
): AdminUsersHandoffPrivacyContract {
  return {
    changesActivityContent: false,
    changesAssignmentLinks: false,
    exposesActivityContent: false,
    exposesAssignmentSnapshots: false,
    exposesRawStudentIdentifiers: false,
    exposesSearchText: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAnswers: false,
    exposesUserEmails: false,
    itemIds: itemViews.map((item) => item.id),
    scope: 'admin-user-governance',
  };
}

function formatAdminUsersRoleFilter(value: string | undefined) {
  if (value === 'admin') return m.admin_users_admin();
  if (value === 'user') return m.admin_users_user();

  return value
    ? m.admin_users_handoff_custom_role_value()
    : m.admin_users_handoff_all_roles_value();
}

function formatAdminUsersStatusFilter(value: string | undefined) {
  if (value === 'active') return m.admin_users_active();
  if (value === 'inactive') return m.admin_users_inactive();

  return m.admin_users_handoff_all_statuses_value();
}

function formatAdminUsersSortValue(sorting: SortingState) {
  const primarySort = sorting[0];
  if (!primarySort) return m.admin_users_handoff_sort_default_value();

  const direction = primarySort.desc
    ? m.admin_users_handoff_sort_desc_value()
    : m.admin_users_handoff_sort_asc_value();

  if (primarySort.id === 'email') {
    return m.admin_users_handoff_sort_value({
      direction,
      field: m.admin_users_columns_email(),
    });
  }

  if (primarySort.id === 'name') {
    return m.admin_users_handoff_sort_value({
      direction,
      field: m.admin_users_columns_name(),
    });
  }

  return m.admin_users_handoff_sort_value({
    direction,
    field: m.admin_users_columns_created_at(),
  });
}

function formatAdminUsersHandoffCount(value: number) {
  if (!Number.isFinite(value)) return '0';

  return String(Math.max(0, Math.floor(value)));
}
