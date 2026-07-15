import {
  ASSIGNMENT_LIFECYCLE_STATUS_FILTERS,
  ASSIGNMENT_LIST_PAGE_SIZE,
} from '@/assignments/list-filters';

export const ASSIGNMENT_LIST_FILTER_STATE_CHAIN_HANDOFF_ITEM_IDS = [
  'route-validate-search',
  'route-default-elision',
  'published-context-normalization',
  'published-context-preservation',
  'search-normalized-query',
  'search-width-normalization',
  'search-whitespace-collapse',
  'search-empty-default',
  'search-assignment-title',
  'search-share-id',
  'search-source-activity',
  'status-parser',
  'status-all-default',
  'status-published-alias',
  'status-open-filter',
  'status-closed-filter',
  'status-expired-filter',
  'status-draft-filter',
  'page-parser',
  'page-size-boundary',
  'filter-change-page-reset',
  'page-change-filter-preservation',
  'clear-search-control',
  'clear-filter-control',
  'dashboard-control-options',
  'list-api-owner-scope',
  'list-api-search-where',
  'list-api-status-filter',
  'full-summary-filter-result',
  'privacy-guard',
] as const;

export const ASSIGNMENT_LIST_FILTER_STATE_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/assignments/list-filters.ts',
  'src/assignments/list-view.ts',
  'src/assignments/list-query.ts',
  'src/assignments/list-summary.ts',
  'src/assignments/lifecycle.ts',
  'src/assignments/lifecycle-query.ts',
  'src/assignments/share-link.ts',
  'src/assignments/share-slug.ts',
  'src/assignments/assignment-display.ts',
  'src/assignments/source-activity-context-chain.ts',
  'src/assignments/assignment-distribution-lifecycle-chain.ts',
  'src/assignments/published-assignment-delivery-chain.ts',
  'src/routes/dashboard/assignments.tsx',
  'src/api/assignments.ts',
  'src/components/assignments/assignment-list-filters.tsx',
  'src/components/assignments/assignment-list-card.tsx',
  'src/components/assignments/assignment-list-summary-card.tsx',
  'src/components/assignments/assignment-list-scope-panel.tsx',
  'src/components/assignments/assignment-list-stats.tsx',
  'src/components/assignments/published-assignment-panel.tsx',
  'src/components/assignments/copy-assignment-share-link-button.tsx',
  'src/components/dashboard/dashboard-pagination.tsx',
  'src/lib/sql-like.ts',
  'src/lib/routes.ts',
  'scripts/assignment-list-filter-state-handoff-semantic-views.test.ts',
  'scripts/assignment-list-semantic-views.test.ts',
  'scripts/assignment-distribution-lifecycle-chain-handoff.test.ts',
  'scripts/published-assignment-delivery-chain-handoff.test.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type AssignmentListFilterStateChainHandoffItemId =
  (typeof ASSIGNMENT_LIST_FILTER_STATE_CHAIN_HANDOFF_ITEM_IDS)[number];

export type AssignmentListFilterStateChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: AssignmentListFilterStateChainHandoffItemId;
  label: string;
  value: string;
};

export type AssignmentListFilterStateChainPrivacyContract = {
  chainSourceFileCount: number;
  exposesInternalAssignmentIds: false;
  exposesInternalOwnerId: false;
  exposesPublicRuntimeContent: false;
  exposesRawAnonymousToken: false;
  exposesResultExportRows: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentAnswerText: false;
  exposesTeacherOnlyAnswers: false;
  itemIds: AssignmentListFilterStateChainHandoffItemId[];
  pageSize: number;
  preservesPublishedContext: true;
  resetsPageOnFilterChange: true;
  routesThroughValidatedSearch: true;
  searchMatchesAssignmentTitle: true;
  searchMatchesShareSlug: true;
  searchMatchesSourceActivityText: true;
  sharesRulesWithDashboardControls: true;
  sharesRulesWithListApi: true;
  sourceFiles: string[];
  statusFilters: readonly string[];
  usesAssignmentListFilterHandoff: true;
  usesDistributionLifecycleChain: true;
  usesDomainSearchNormalization: true;
  usesFullFilteredSummaryForOverview: true;
  usesLifecycleStatusFilter: true;
  usesOwnerScopedListApi: true;
  usesPublishedContextHandoff: true;
};

export type AssignmentListFilterStateChainHandoffView = {
  description: string;
  itemViews: AssignmentListFilterStateChainHandoffItemView[];
  privacy: AssignmentListFilterStateChainPrivacyContract;
  title: string;
};

export function buildAssignmentListFilterStateChainHandoffView(): AssignmentListFilterStateChainHandoffView {
  const itemViews = ASSIGNMENT_LIST_FILTER_STATE_CHAIN_HANDOFF_ITEM_IDS.map(
    (id) => buildAssignmentListFilterStateChainHandoffItemView(id)
  );

  return {
    description:
      'Thirty-slice assignment-list filter-state chain from URL validateSearch and published-share context through normalized search, lifecycle status filters, page reset and preservation rules, dashboard controls, owner-scoped list API queries, full filtered summaries, and privacy guards.',
    itemViews,
    privacy: {
      chainSourceFileCount:
        ASSIGNMENT_LIST_FILTER_STATE_CHAIN_SOURCE_FILES.length,
      exposesInternalAssignmentIds: false,
      exposesInternalOwnerId: false,
      exposesPublicRuntimeContent: false,
      exposesRawAnonymousToken: false,
      exposesResultExportRows: false,
      exposesSourceMaterialStorageKeys: false,
      exposesStudentAnswerText: false,
      exposesTeacherOnlyAnswers: false,
      itemIds: [...ASSIGNMENT_LIST_FILTER_STATE_CHAIN_HANDOFF_ITEM_IDS],
      pageSize: ASSIGNMENT_LIST_PAGE_SIZE,
      preservesPublishedContext: true,
      resetsPageOnFilterChange: true,
      routesThroughValidatedSearch: true,
      searchMatchesAssignmentTitle: true,
      searchMatchesShareSlug: true,
      searchMatchesSourceActivityText: true,
      sharesRulesWithDashboardControls: true,
      sharesRulesWithListApi: true,
      sourceFiles: [...ASSIGNMENT_LIST_FILTER_STATE_CHAIN_SOURCE_FILES],
      statusFilters: [...ASSIGNMENT_LIFECYCLE_STATUS_FILTERS],
      usesAssignmentListFilterHandoff: true,
      usesDistributionLifecycleChain: true,
      usesDomainSearchNormalization: true,
      usesFullFilteredSummaryForOverview: true,
      usesLifecycleStatusFilter: true,
      usesOwnerScopedListApi: true,
      usesPublishedContextHandoff: true,
    },
    title: 'Assignment list filter-state chain',
  };
}

function buildAssignmentListFilterStateChainHandoffItemView(
  id: AssignmentListFilterStateChainHandoffItemId
): AssignmentListFilterStateChainHandoffItemView {
  const item = getAssignmentListFilterStateChainHandoffItem(id);

  return {
    ...item,
    ariaLabel: `${item.label}: ${item.value}`,
  };
}

function getAssignmentListFilterStateChainHandoffItem(
  id: AssignmentListFilterStateChainHandoffItemId
): Omit<AssignmentListFilterStateChainHandoffItemView, 'ariaLabel' | 'id'> {
  switch (id) {
    case 'route-validate-search':
      return item(
        id,
        'Route validateSearch',
        'Validated URL state',
        'The dashboard assignment route validates search, lifecycle status, page, and published-share context before rendering.'
      );
    case 'route-default-elision':
      return item(
        id,
        'Route default elision',
        'Defaults omitted',
        'Default all-status, blank-search, and first-page state is omitted from shared teacher URLs.'
      );
    case 'published-context-normalization':
      return item(
        id,
        'Published context normalization',
        'Share id normalized',
        'Recently published share ids normalize through the assignment share-slug helper.'
      );
    case 'published-context-preservation':
      return item(
        id,
        'Published context preservation',
        'Published context preserved',
        'Published assignment follow-up context survives filter and page route construction until dismissed.'
      );
    case 'search-normalized-query':
      return item(
        id,
        'Search normalized query',
        'NFKC search value',
        'Assignment search text is normalized before dashboard controls and the list API consume it.'
      );
    case 'search-width-normalization':
      return item(
        id,
        'Search width normalization',
        'NFKC normalized',
        'Full-width classroom text normalizes through NFKC before matching assignment rows.'
      );
    case 'search-whitespace-collapse':
      return item(
        id,
        'Search whitespace collapse',
        'Whitespace collapsed',
        'Repeated whitespace collapses to a single searchable separator.'
      );
    case 'search-empty-default':
      return item(
        id,
        'Search empty default',
        'All assignment links',
        'Blank search input returns to the default owner-scoped assignment list.'
      );
    case 'search-assignment-title':
      return item(
        id,
        'Search assignment title',
        'Assignment title',
        'Assignment title matching stays behind the current teacher owner scope.'
      );
    case 'search-share-id':
      return item(
        id,
        'Search share id',
        'Share id',
        'Share-id matching supports teacher distribution workflows without exposing raw student tokens.'
      );
    case 'search-source-activity':
      return item(
        id,
        'Search source activity',
        'Live and frozen source activity',
        'Search can match live source activity text and frozen assignment snapshot source text.'
      );
    case 'status-parser':
      return item(
        id,
        'Status parser',
        'open, closed, expired, draft',
        'Lifecycle status parsing accepts only open, closed, expired, and draft filters.'
      );
    case 'status-all-default':
      return item(
        id,
        'Status all default',
        'All statuses',
        'All statuses is the default status filter and is omitted from route search.'
      );
    case 'status-published-alias':
      return item(
        id,
        'Status published alias',
        'published -> open',
        'Legacy published status route state maps to the open lifecycle filter.'
      );
    case 'status-open-filter':
      return item(
        id,
        'Status open filter',
        'Open',
        'Open filters show currently available assignment links.'
      );
    case 'status-closed-filter':
      return item(
        id,
        'Status closed filter',
        'Closed',
        'Closed filters show teacher-closed assignment links.'
      );
    case 'status-expired-filter':
      return item(
        id,
        'Status expired filter',
        'Expired',
        'Expired filters show assignments blocked by close-time rules.'
      );
    case 'status-draft-filter':
      return item(
        id,
        'Status draft filter',
        'Draft',
        'Draft filters remain explicit so unpublished records do not appear as open links.'
      );
    case 'page-parser':
      return item(
        id,
        'Page parser',
        'First page unless page > 1',
        'Invalid, blank, or first-page route state normalizes to the first page.'
      );
    case 'page-size-boundary':
      return item(
        id,
        'Page size boundary',
        `${ASSIGNMENT_LIST_PAGE_SIZE} per page`,
        'Assignment list pages stay bounded by the shared page-size constant.'
      );
    case 'filter-change-page-reset':
      return item(
        id,
        'Filter-change page reset',
        'Reset to page 1',
        'Changing search or lifecycle status resets pagination.'
      );
    case 'page-change-filter-preservation':
      return item(
        id,
        'Page-change filter preservation',
        'Filters preserved',
        'Changing pages preserves active filters and published-share context.'
      );
    case 'clear-search-control':
      return item(
        id,
        'Clear search control',
        'Search removed',
        'Clear-search controls remove the query without widening beyond the current owner.'
      );
    case 'clear-filter-control':
      return item(
        id,
        'Clear filter control',
        'Defaults restored',
        'Clear-filter controls restore all-status and blank-search defaults.'
      );
    case 'dashboard-control-options':
      return item(
        id,
        'Dashboard control options',
        'Search and status',
        'Dashboard controls expose the same search and lifecycle status options as route/API helpers.'
      );
    case 'list-api-owner-scope':
      return item(
        id,
        'List API owner scope',
        'Teacher owner only',
        'The list API combines every filter with the current teacher owner condition.'
      );
    case 'list-api-search-where':
      return item(
        id,
        'List API search where',
        'Title, share id, source activity',
        'The list query searches assignment title, share slug, live source activity, and frozen source activity text.'
      );
    case 'list-api-status-filter':
      return item(
        id,
        'List API status filter',
        'Lifecycle helper',
        'Lifecycle status filters route through the shared assignment lifecycle helper.'
      );
    case 'full-summary-filter-result':
      return item(
        id,
        'Full summary filter result',
        'Full filtered summary',
        'Assignment overview metrics summarize the full filtered result, not only visible cards.'
      );
    case 'privacy-guard':
      return item(
        id,
        'Privacy guard',
        'No ids, tokens, answers, exports, or storage keys',
        'The chain exposes route state and aggregate counts without leaking ids, owner ids, runtime content, tokens, answers, export rows, or source-material storage keys.'
      );
  }
}

function item(
  id: AssignmentListFilterStateChainHandoffItemId,
  label: string,
  value: string,
  description: string
): Omit<AssignmentListFilterStateChainHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
