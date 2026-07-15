import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { ASSIGNMENT_DISTRIBUTION_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/assignment-distribution-lifecycle-chain';
import {
  ASSIGNMENT_LIST_FILTER_STATE_CHAIN_HANDOFF_ITEM_IDS,
  ASSIGNMENT_LIST_FILTER_STATE_CHAIN_SOURCE_FILES,
  buildAssignmentListFilterStateChainHandoffView,
  type AssignmentListFilterStateChainHandoffItemId,
  type AssignmentListFilterStateChainHandoffView,
} from '@/assignments/assignment-list-filter-state-chain';
import {
  ASSIGNMENT_LIFECYCLE_STATUS_FILTERS,
  ASSIGNMENT_LIST_PAGE_SIZE,
  buildAssignmentListDismissPublishedRouteSearch,
  buildAssignmentListFilterRouteSearch,
  buildAssignmentListPageRouteSearch,
  buildAssignmentListRouteSearch,
  buildAssignmentListValidatedSearch,
  normalizeAssignmentListSearch,
  parseAssignmentStatusFilter,
} from '@/assignments/list-filters';
import {
  ASSIGNMENT_LIST_FILTER_HANDOFF_ITEM_IDS,
  buildAssignmentListSearchPanelView,
} from '@/assignments/list-view';
import { PUBLISHED_ASSIGNMENT_DELIVERY_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/published-assignment-delivery-chain';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');
const FILTER_SOURCE = readFileSync('src/assignments/list-filters.ts', 'utf8');
const LIST_QUERY_SOURCE = readFileSync('src/assignments/list-query.ts', 'utf8');
const SUMMARY_SOURCE = readFileSync('src/assignments/list-summary.ts', 'utf8');
const ROUTE_SOURCE = readFileSync(
  'src/routes/dashboard/assignments.tsx',
  'utf8'
);
const API_SOURCE = readFileSync('src/api/assignments.ts', 'utf8');
const COMPONENT_SOURCE = readFileSync(
  'src/components/assignments/assignment-list-filters.tsx',
  'utf8'
);

const SECRET_ASSIGNMENT_ID = 'SECRET_ASSIGNMENT_FILTER_CHAIN_ASSIGNMENT_ID';
const SECRET_OWNER_ID = 'SECRET_ASSIGNMENT_FILTER_CHAIN_OWNER_ID';
const SECRET_RUNTIME_CONTENT = 'SECRET_ASSIGNMENT_FILTER_CHAIN_RUNTIME';
const SECRET_SHARE_TOKEN = 'secret-assignment-filter-chain-token';
const SECRET_EXPORT_ROW = 'student,score,private-answer';
const SECRET_STORAGE_KEY = 'source-materials/private/filter-chain.pdf';
const SECRET_STUDENT_ANSWER = 'student wrote a private filter-chain answer';
const SECRET_TEACHER_ANSWER = 'teacher-only answer key for filter-chain';

test('assignment list filter-state chain exposes 30 safe slices', () => {
  const handoffView = buildAssignmentListFilterStateChainHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...ASSIGNMENT_LIST_FILTER_STATE_CHAIN_HANDOFF_ITEM_IDS,
  ]);
  assert.deepEqual(itemIds, [...ASSIGNMENT_LIST_FILTER_HANDOFF_ITEM_IDS]);
  assert.equal(handoffView.title, 'Assignment list filter-state chain');
  assert.match(
    handoffView.description,
    /Thirty-slice assignment-list filter-state chain/
  );
  assert.equal(handoffView.itemViews.length, 30);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(
    handoffView.itemViews.every(
      (item) =>
        Boolean(item.ariaLabel) &&
        Boolean(item.description) &&
        Boolean(item.label) &&
        Boolean(item.value)
    ),
    true
  );
  assert.deepEqual(handoffView.privacy, {
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
    itemIds,
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
  });
  assertNoPrivateAssignmentListFilterStateText(JSON.stringify(handoffView));
});

test('assignment list filter-state chain summarizes the route contract', () => {
  const handoffView = buildAssignmentListFilterStateChainHandoffView();

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['route-validate-search', 'Validated URL state'],
      ['route-default-elision', 'Defaults omitted'],
      ['published-context-normalization', 'Share id normalized'],
      ['published-context-preservation', 'Published context preserved'],
      ['search-normalized-query', 'NFKC search value'],
      ['search-width-normalization', 'NFKC normalized'],
      ['search-whitespace-collapse', 'Whitespace collapsed'],
      ['search-empty-default', 'All assignment links'],
      ['search-assignment-title', 'Assignment title'],
      ['search-share-id', 'Share id'],
      ['search-source-activity', 'Live and frozen source activity'],
      ['status-parser', 'open, closed, expired, draft'],
      ['status-all-default', 'All statuses'],
      ['status-published-alias', 'published -> open'],
      ['status-open-filter', 'Open'],
      ['status-closed-filter', 'Closed'],
      ['status-expired-filter', 'Expired'],
      ['status-draft-filter', 'Draft'],
      ['page-parser', 'First page unless page > 1'],
      ['page-size-boundary', `${ASSIGNMENT_LIST_PAGE_SIZE} per page`],
      ['filter-change-page-reset', 'Reset to page 1'],
      ['page-change-filter-preservation', 'Filters preserved'],
      ['clear-search-control', 'Search removed'],
      ['clear-filter-control', 'Defaults restored'],
      ['dashboard-control-options', 'Search and status'],
      ['list-api-owner-scope', 'Teacher owner only'],
      ['list-api-search-where', 'Title, share id, source activity'],
      ['list-api-status-filter', 'Lifecycle helper'],
      ['full-summary-filter-result', 'Full filtered summary'],
      ['privacy-guard', 'No ids, tokens, answers, exports, or storage keys'],
    ]
  );
  assert.equal(
    getHandoffValue(handoffView, 'page-size-boundary'),
    `${ASSIGNMENT_LIST_PAGE_SIZE} per page`
  );
});

test('assignment list filter-state chain is backed by adjacent gates', () => {
  assert.equal(ASSIGNMENT_LIST_FILTER_STATE_CHAIN_SOURCE_FILES.length, 30);
  for (const filePath of ASSIGNMENT_LIST_FILTER_STATE_CHAIN_SOURCE_FILES) {
    assert.ok(
      existsSync(filePath),
      `Missing assignment list filter-state chain file ${filePath}`
    );
  }

  assert.deepEqual(
    [
      ASSIGNMENT_LIST_FILTER_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_DISTRIBUTION_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS.length,
      PUBLISHED_ASSIGNMENT_DELIVERY_CHAIN_HANDOFF_ITEM_IDS.length,
    ],
    [30, 30, 30]
  );
});

test('assignment list filter-state chain preserves product docs', () => {
  assert.match(
    PRODUCT_SOURCE,
    /assignment-list filter-state chain[\s\S]*30-slice contract[\s\S]*URL validation[\s\S]*published-share context[\s\S]*search normalization[\s\S]*status parsing[\s\S]*list\s+API[\s\S]*privacy guards/,
    'docs/product.md should preserve the assignment-list filter-state chain scope.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /src\/assignments\/assignment-list-filter-state-chain\.ts[\s\S]*source-level contract/i,
    'docs/product.md should name the assignment list filter-state chain source file.'
  );
});

test('assignment list route helpers normalize URL state predictably', () => {
  assert.equal(normalizeAssignmentListSearch('  Ｗｅｅｋ   １  '), 'Week 1');
  assert.equal(normalizeAssignmentListSearch('   '), undefined);
  assert.equal(parseAssignmentStatusFilter('published'), 'open');
  assert.equal(parseAssignmentStatusFilter('draft'), 'draft');
  assert.equal(parseAssignmentStatusFilter('all'), undefined);
  assert.deepEqual(
    buildAssignmentListValidatedSearch({
      page: '4',
      published: ' share-1 ',
      q: '  Ｗｅｅｋ   １  ',
      status: 'published',
    }),
    {
      page: 4,
      published: 'share-1',
      q: 'Week 1',
      status: 'open',
    }
  );
  assert.deepEqual(
    buildAssignmentListRouteSearch({
      page: 1,
      published: ' share-1 ',
      q: ' ',
      status: 'all',
    }),
    {
      page: undefined,
      published: 'share-1',
      q: undefined,
      status: undefined,
    }
  );
  assert.deepEqual(
    buildAssignmentListFilterRouteSearch({
      current: {
        q: 'old',
        status: 'closed',
      },
      next: {
        q: '  Ｎｅｗ   search  ',
        status: 'expired',
      },
      published: ' share-1 ',
    }),
    {
      page: undefined,
      published: 'share-1',
      q: 'New search',
      status: 'expired',
    }
  );
  assert.deepEqual(
    buildAssignmentListPageRouteSearch({
      current: {
        published: ' share-1 ',
        q: 'unit',
        status: 'draft',
      },
      page: 3,
    }),
    {
      page: 3,
      published: 'share-1',
      q: 'unit',
      status: 'draft',
    }
  );
  assert.deepEqual(
    buildAssignmentListDismissPublishedRouteSearch({
      current: {
        page: 2,
        q: 'unit',
        status: 'open',
      },
    }),
    {
      page: 2,
      published: undefined,
      q: 'unit',
      status: 'open',
    }
  );
});

test('assignment list route component and API share filter state', () => {
  assert.match(
    ROUTE_SOURCE,
    /validateSearch: buildAssignmentListValidatedSearch[\s\S]*buildAssignmentListFilterRouteSearch[\s\S]*buildAssignmentListPageRouteSearch[\s\S]*buildAssignmentListRouteSearch[\s\S]*buildAssignmentListDismissPublishedRouteSearch/,
    'The dashboard route should validate and build assignment-list filter route state through shared helpers.'
  );
  assert.match(
    COMPONENT_SOURCE,
    /data-handoff="assignment-list-filter-state"[\s\S]*data-handoff-scope=\{handoffView\.privacy\.scope\}[\s\S]*handoffView\.itemViews\.map/,
    'The assignment list filter component should render the hidden filter-state handoff.'
  );
  assert.match(
    FILTER_SOURCE,
    /normalizeAssignmentListSearch[\s\S]*normalize\('NFKC'\)[\s\S]*replace\(\/\\s\+\/g, ' '\)[\s\S]*buildAssignmentListFilterRouteSearch[\s\S]*published,[\s\S]*q: next\.q \?\? current\.q[\s\S]*status: next\.status \?\? current\.status/,
    'Filter helpers should own search normalization, page reset, and published-context preservation.'
  );
  assert.match(
    API_SOURCE,
    /z\.preprocess\(\s*parseAssignmentStatusFilter,\s*z\.enum\(ASSIGNMENT_LIFECYCLE_STATUS_FILTERS\)\.optional\(\)\s*\)[\s\S]*buildAssignmentListWhere\(\{[\s\S]*search: data\.search,[\s\S]*status: data\.status,[\s\S]*userId/,
    'The API should validate status and call the owner-scoped list where helper with search and status.'
  );
  assert.match(
    LIST_QUERY_SOURCE,
    /const filters: SQL\[\] = \[eq\(assignment\.ownerId, userId\)\][\s\S]*buildAssignmentLifecycleStatusFilter[\s\S]*sqlLikeContains\(assignment\.title, normalizedSearch\)[\s\S]*sqlLikeContains\(assignment\.shareSlug, normalizedSearch\)[\s\S]*sqlLikeContains\(activity\.title, normalizedSearch\)[\s\S]*sqlLikeContains\(assignmentSnapshot\.activityTitle, normalizedSearch\)/,
    'Assignment list queries should keep search fields behind owner scope.'
  );
  assert.match(
    SUMMARY_SOURCE,
    /buildAssignmentListFilterSummary[\s\S]*total[\s\S]*buildAssignmentListSummaryMetrics/,
    'Assignment list summaries should keep full-filter overview helpers in the assignment domain.'
  );
});

test('assignment list filter-state chain matches the visible handoff privacy', () => {
  overwriteGetLocale(() => 'en');

  const filterHandoffView = buildAssignmentListSearchPanelView({
    isLoading: false,
    search: '  Ｗｅｅｋ   １  ',
    status: 'closed',
    total: 9,
  }).filterHandoffView;

  assert.deepEqual(
    filterHandoffView.itemViews.map((item) => item.id),
    [...ASSIGNMENT_LIST_FILTER_STATE_CHAIN_HANDOFF_ITEM_IDS]
  );
  assert.equal(filterHandoffView.privacy.exposesInternalAssignmentIds, false);
  assert.equal(filterHandoffView.privacy.exposesInternalOwnerId, false);
  assert.equal(filterHandoffView.privacy.exposesPublicRuntimeContent, false);
  assert.equal(filterHandoffView.privacy.exposesRawAnonymousToken, false);
  assert.equal(filterHandoffView.privacy.exposesResultExportRows, false);
  assert.equal(
    filterHandoffView.privacy.exposesSourceMaterialStorageKeys,
    false
  );
  assert.equal(filterHandoffView.privacy.exposesStudentAnswerText, false);
  assert.equal(filterHandoffView.privacy.exposesTeacherOnlyAnswers, false);
  assert.equal(filterHandoffView.privacy.preservesPublishedContext, true);
  assert.equal(filterHandoffView.privacy.resetsPageOnFilterChange, true);
  assert.equal(filterHandoffView.privacy.routesThroughValidatedSearch, true);
  assert.equal(
    filterHandoffView.privacy.sharesRulesWithDashboardControls,
    true
  );
  assert.equal(filterHandoffView.privacy.sharesRulesWithListApi, true);
  assert.equal(
    filterHandoffView.privacy.usesFullFilteredSummaryForOverview,
    true
  );
  assertNoPrivateAssignmentListFilterStateText(
    JSON.stringify(filterHandoffView)
  );
});

test('assignment list filter-state chain focused gate is documented', () => {
  const normalizedCatalog = TEST_CATALOG_SOURCE.replace(/\s+/g, ' ');

  assert.match(
    TEST_CATALOG_SOURCE,
    /Assignment list filter-state chain has a fast script-level gate via[\s\S]*scripts\/assignment-list-filter-state-chain-handoff\.test\.ts/,
    'TEST-CATALOG should document the assignment list filter-state chain gate.'
  );
  assert.match(
    normalizedCatalog,
    /URL validateSearch[\s\S]*published context[\s\S]*search normalization[\s\S]*lifecycle status filters[\s\S]*page reset[\s\S]*dashboard controls[\s\S]*list API owner scope[\s\S]*full filtered summary[\s\S]*privacy/,
    'TEST-CATALOG should document the assignment list filter-state chain scope.'
  );
});

function getHandoffValue(
  view: AssignmentListFilterStateChainHandoffView,
  id: AssignmentListFilterStateChainHandoffItemId
) {
  const item = view.itemViews.find((candidate) => candidate.id === id);
  assert.ok(item, `Missing assignment list filter-state chain item ${id}`);
  return item.value;
}

function assertNoPrivateAssignmentListFilterStateText(serializedView: string) {
  for (const privateValue of [
    SECRET_ASSIGNMENT_ID,
    SECRET_OWNER_ID,
    SECRET_RUNTIME_CONTENT,
    SECRET_SHARE_TOKEN,
    SECRET_EXPORT_ROW,
    SECRET_STORAGE_KEY,
    SECRET_STUDENT_ANSWER,
    SECRET_TEACHER_ANSWER,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Assignment list filter-state chain leaked private text: ${privateValue}`
    );
  }
}
