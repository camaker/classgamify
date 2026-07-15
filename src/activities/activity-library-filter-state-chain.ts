import {
  ACTIVITY_LIBRARY_PAGE_SIZE,
  ACTIVITY_LIBRARY_STATUSES,
  ACTIVITY_SOURCE_MATERIAL_FILTERS,
} from '@/activities/library-filters';
import { getActivityTemplates } from '@/activities/catalog';

export const ACTIVITY_LIBRARY_FILTER_STATE_CHAIN_HANDOFF_ITEM_IDS = [
  'route-validate-search',
  'route-default-elision',
  'search-normalized-query',
  'search-width-normalization',
  'search-whitespace-collapse',
  'search-empty-default',
  'search-owner-fields',
  'status-parser',
  'status-active-default',
  'status-archived-filter',
  'template-parser',
  'template-all-default',
  'template-exact-family',
  'source-parser',
  'source-all-default',
  'source-audio-filter',
  'source-extractable-filter',
  'source-spreadsheet-filter',
  'source-worksheet-filter',
  'page-parser',
  'page-size-boundary',
  'filter-change-page-reset',
  'page-change-filter-preservation',
  'created-activity-context',
  'clear-search-control',
  'clear-filter-control',
  'dashboard-control-options',
  'list-api-owner-scope',
  'list-api-source-post-filter',
  'privacy-guard',
] as const;

export const ACTIVITY_LIBRARY_FILTER_STATE_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/activities/library-filters.ts',
  'src/activities/library-view.ts',
  'src/activities/library-query.ts',
  'src/activities/library-summary.ts',
  'src/activities/activity-source-material-summary-chain.ts',
  'src/activities/material-summary.ts',
  'src/activities/catalog.ts',
  'src/activities/types.ts',
  'src/routes/dashboard/activities.tsx',
  'src/api/activities.ts',
  'src/components/activities/activity-library-search.tsx',
  'src/components/activities/activity-library-card.tsx',
  'src/components/activities/activity-library-summary-card.tsx',
  'src/components/activities/activity-library-scope-panel.tsx',
  'src/components/activities/activity-library-stats.tsx',
  'src/components/activities/activity-library-compatibility-panel.tsx',
  'src/components/activities/created-activity-panel.tsx',
  'src/components/dashboard/dashboard-pagination.tsx',
  'src/lib/sql-like.ts',
  'src/lib/routes.ts',
  'src/storage/file-materials.ts',
  'src/storage/file-material-labels.ts',
  'src/activities/lifecycle.ts',
  'src/activities/duplicate.ts',
  'scripts/activity-library-filter-state-handoff-semantic-views.test.ts',
  'scripts/activity-library-handoff-semantic-views.test.ts',
  'scripts/activity-source-material-summary-chain-handoff.test.ts',
  'scripts/activity-library-semantic-views.test.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type ActivityLibraryFilterStateChainHandoffItemId =
  (typeof ACTIVITY_LIBRARY_FILTER_STATE_CHAIN_HANDOFF_ITEM_IDS)[number];

export type ActivityLibraryFilterStateChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: ActivityLibraryFilterStateChainHandoffItemId;
  label: string;
  value: string;
};

export type ActivityLibraryFilterStateChainPrivacyContract = {
  chainSourceFileCount: number;
  exposesActivityIds: false;
  exposesAnswerText: false;
  exposesPrivateActivityContent: false;
  exposesSourceMaterialFileIds: false;
  exposesSourceMaterialFilenames: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentData: false;
  itemIds: ActivityLibraryFilterStateChainHandoffItemId[];
  pageSize: number;
  preservesCreatedActivityContext: true;
  resetsPageOnFilterChange: true;
  routesThroughValidatedSearch: true;
  sharesRulesWithDashboardControls: true;
  sharesRulesWithListApi: true;
  sourceFiles: string[];
  sourceFilters: readonly string[];
  statusFilters: readonly string[];
  templateFamilyCount: number;
  usesActivityLibraryFilterHandoff: true;
  usesActivitySourceMaterialSummaryChain: true;
  usesDomainSearchNormalization: true;
  usesOwnerScopedListApi: true;
  usesSourceMaterialPostFilter: true;
};

export type ActivityLibraryFilterStateChainHandoffView = {
  description: string;
  itemViews: ActivityLibraryFilterStateChainHandoffItemView[];
  privacy: ActivityLibraryFilterStateChainPrivacyContract;
  title: string;
};

export function buildActivityLibraryFilterStateChainHandoffView(): ActivityLibraryFilterStateChainHandoffView {
  const itemViews = ACTIVITY_LIBRARY_FILTER_STATE_CHAIN_HANDOFF_ITEM_IDS.map(
    (id) => buildActivityLibraryFilterStateChainHandoffItemView(id)
  );
  const templateFamilyCount = getActivityTemplates().length;

  return {
    description:
      'Thirty-slice activity-library filter-state chain from URL validateSearch through normalized owner-scoped search, status/template/source filters, page reset and preservation rules, created-activity context, dashboard controls, list API owner scope, source-material post-filtering, and privacy guards.',
    itemViews,
    privacy: {
      chainSourceFileCount:
        ACTIVITY_LIBRARY_FILTER_STATE_CHAIN_SOURCE_FILES.length,
      exposesActivityIds: false,
      exposesAnswerText: false,
      exposesPrivateActivityContent: false,
      exposesSourceMaterialFileIds: false,
      exposesSourceMaterialFilenames: false,
      exposesSourceMaterialStorageKeys: false,
      exposesStudentData: false,
      itemIds: [...ACTIVITY_LIBRARY_FILTER_STATE_CHAIN_HANDOFF_ITEM_IDS],
      pageSize: ACTIVITY_LIBRARY_PAGE_SIZE,
      preservesCreatedActivityContext: true,
      resetsPageOnFilterChange: true,
      routesThroughValidatedSearch: true,
      sharesRulesWithDashboardControls: true,
      sharesRulesWithListApi: true,
      sourceFiles: [...ACTIVITY_LIBRARY_FILTER_STATE_CHAIN_SOURCE_FILES],
      sourceFilters: [...ACTIVITY_SOURCE_MATERIAL_FILTERS],
      statusFilters: [...ACTIVITY_LIBRARY_STATUSES],
      templateFamilyCount,
      usesActivityLibraryFilterHandoff: true,
      usesActivitySourceMaterialSummaryChain: true,
      usesDomainSearchNormalization: true,
      usesOwnerScopedListApi: true,
      usesSourceMaterialPostFilter: true,
    },
    title: 'Activity library filter-state chain',
  };
}

function buildActivityLibraryFilterStateChainHandoffItemView(
  id: ActivityLibraryFilterStateChainHandoffItemId
): ActivityLibraryFilterStateChainHandoffItemView {
  const item = getActivityLibraryFilterStateChainHandoffItem(id);

  return {
    ...item,
    ariaLabel: `${item.label}: ${item.value}`,
  };
}

function getActivityLibraryFilterStateChainHandoffItem(
  id: ActivityLibraryFilterStateChainHandoffItemId
): Omit<ActivityLibraryFilterStateChainHandoffItemView, 'ariaLabel' | 'id'> {
  switch (id) {
    case 'route-validate-search':
      return item(
        id,
        'Route validateSearch',
        'Validated URL state',
        'The dashboard activity route validates search, status, template, source, page, and created-activity context before rendering.'
      );
    case 'route-default-elision':
      return item(
        id,
        'Route default elision',
        'Defaults omitted',
        'Default active/all/first-page route state is omitted so shared teacher URLs stay predictable.'
      );
    case 'search-normalized-query':
      return item(
        id,
        'Search normalized query',
        'NFKC search value',
        'Search text is normalized before route state, dashboard controls, and list API queries consume it.'
      );
    case 'search-width-normalization':
      return item(
        id,
        'Search width normalization',
        'NFKC normalized',
        'Full-width classroom text normalizes through NFKC before matching saved activities.'
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
        'All saved activities',
        'Blank search input returns to the default owner-scoped activity collection.'
      );
    case 'search-owner-fields':
      return item(
        id,
        'Search owner fields',
        'Title, description, template',
        'Owner-scoped search matches safe activity title, description, and template family fields.'
      );
    case 'status-parser':
      return item(
        id,
        'Status parser',
        'active or archived',
        'Status route parsing accepts only active or archived lifecycle views.'
      );
    case 'status-active-default':
      return item(
        id,
        'Status active default',
        'Active',
        'Active activities remain the default library view.'
      );
    case 'status-archived-filter':
      return item(
        id,
        'Status archived filter',
        'Archived',
        'Archived activities require an explicit URL/control state.'
      );
    case 'template-parser':
      return item(
        id,
        'Template parser',
        `${getActivityTemplates().length} template families`,
        'Template filters accept only configured activity template families.'
      );
    case 'template-all-default':
      return item(
        id,
        'Template all default',
        'All templates',
        'All templates is the default filter state and is omitted from route search.'
      );
    case 'template-exact-family':
      return item(
        id,
        'Template exact family',
        'Exact template family',
        'Template filtering matches one configured template family instead of fuzzy UI text.'
      );
    case 'source-parser':
      return item(
        id,
        'Source parser',
        'all, audio, extractable, spreadsheet, worksheet',
        'Source-material filters accept all, audio, extractable, spreadsheet, and worksheet views.'
      );
    case 'source-all-default':
      return item(
        id,
        'Source all default',
        'All source materials',
        'All source materials is the default source filter and is omitted from route search.'
      );
    case 'source-audio-filter':
      return item(
        id,
        'Source audio filter',
        'Audio',
        'Audio filtering uses the shared source-material summary readiness semantics.'
      );
    case 'source-extractable-filter':
      return item(
        id,
        'Source extractable filter',
        'Any extractable source',
        'Extractable filtering matches activities with audio, worksheet, or spreadsheet readiness.'
      );
    case 'source-spreadsheet-filter':
      return item(
        id,
        'Source spreadsheet filter',
        'Spreadsheet',
        'Spreadsheet filtering matches activities with spreadsheet import readiness.'
      );
    case 'source-worksheet-filter':
      return item(
        id,
        'Source worksheet filter',
        'Worksheet',
        'Worksheet filtering matches worksheet image or worksheet document readiness.'
      );
    case 'page-parser':
      return item(
        id,
        'Page parser',
        'First page unless page > 1',
        'Invalid, blank, or first-page search state normalizes to the first page.'
      );
    case 'page-size-boundary':
      return item(
        id,
        'Page size boundary',
        `${ACTIVITY_LIBRARY_PAGE_SIZE} per page`,
        'Activity library pages stay bounded by the shared page-size constant.'
      );
    case 'filter-change-page-reset':
      return item(
        id,
        'Filter-change page reset',
        'Reset to page 1',
        'Changing search, status, template, or source filters resets pagination.'
      );
    case 'page-change-filter-preservation':
      return item(
        id,
        'Page-change filter preservation',
        'Filters preserved',
        'Changing pages preserves active filters and created-activity context.'
      );
    case 'created-activity-context':
      return item(
        id,
        'Created activity context',
        'Created panel preserved',
        'The created-activity return panel survives filter and page route construction until dismissed.'
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
        'Clear-filter controls restore active, all-template, all-source defaults.'
      );
    case 'dashboard-control-options':
      return item(
        id,
        'Dashboard control options',
        'Search, template, source, status',
        'Dashboard controls expose the same search, template, source, and status options as route/API helpers.'
      );
    case 'list-api-owner-scope':
      return item(
        id,
        'List API owner scope',
        'Teacher owner only',
        'The list API combines filters with the current teacher owner condition.'
      );
    case 'list-api-source-post-filter':
      return item(
        id,
        'List API source post-filter',
        'Source filter after owner read',
        'Source-material filtering runs through activity-domain summaries after the owner-scoped read.'
      );
    case 'privacy-guard':
      return item(
        id,
        'Privacy guard',
        'No ids, answers, files, or students',
        'The chain exposes route state and aggregate counts without leaking ids, answers, source files, storage keys, or student data.'
      );
  }
}

function item(
  id: ActivityLibraryFilterStateChainHandoffItemId,
  label: string,
  value: string,
  description: string
): Omit<ActivityLibraryFilterStateChainHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
