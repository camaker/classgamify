import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ASSIGNMENT_LIST_FILTER_HANDOFF_ITEM_IDS,
  buildAssignmentListSearchPanelView,
  type AssignmentListFilterHandoffItemId,
  type AssignmentListFilterHandoffView,
} from '@/assignments/list-view';
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
  type AssignmentStatusFilter,
} from '@/assignments/list-filters';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

const COMPONENT_SOURCE = readFileSync(
  'src/components/assignments/assignment-list-filters.tsx',
  'utf8'
);
const ROUTE_SOURCE = readFileSync(
  'src/routes/dashboard/assignments.tsx',
  'utf8'
);
const API_SOURCE = readFileSync('src/api/assignments.ts', 'utf8');
const FILTER_SOURCE = readFileSync('src/assignments/list-filters.ts', 'utf8');
const LIST_QUERY_SOURCE = readFileSync('src/assignments/list-query.ts', 'utf8');
const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const SECRET_ASSIGNMENT_ID = 'SECRET_ASSIGNMENT_ID_SHOULD_NOT_LEAK';
const SECRET_OWNER_ID = 'SECRET_OWNER_ID_SHOULD_NOT_LEAK';
const SECRET_RUNTIME_CONTENT = 'SECRET_RUNTIME_CONTENT_SHOULD_NOT_LEAK';
const SECRET_SHARE_TOKEN = 'secret-share-token';
const SECRET_EXPORT_ROW = 'student,score,answer';
const SECRET_STORAGE_KEY = 'source-materials/private/assignment.pdf';
const SECRET_STUDENT_ANSWER = 'student wrote private answer';
const SECRET_TEACHER_ANSWER = 'teacher answer key';

test('assignment list filter handoff exposes 30 localized owner-scoped slices', () => {
  overwriteGetLocale(() => 'en');

  const filterHandoffView = buildAssignmentListFilterView({
    search: '  Ｗｅｅｋ   １  ',
    status: 'closed',
    total: 9,
  });
  const itemIds = filterHandoffView.itemViews.map((item) => item.id);
  const values = getHandoffValues(filterHandoffView);

  assert.deepEqual(itemIds, [...ASSIGNMENT_LIST_FILTER_HANDOFF_ITEM_IDS]);
  assert.equal(itemIds.length, 30);
  assert.equal(new Set(itemIds).size, 30);
  assert.ok(
    filterHandoffView.itemViews.every(
      (item) =>
        Boolean(item.ariaLabel) &&
        Boolean(item.description) &&
        Boolean(item.label) &&
        Boolean(item.value)
    )
  );
  assert.deepEqual(filterHandoffView.privacy, {
    exposesInternalAssignmentIds: false,
    exposesInternalOwnerId: false,
    exposesPublicRuntimeContent: false,
    exposesRawAnonymousToken: false,
    exposesResultExportRows: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAnswerText: false,
    exposesTeacherOnlyAnswers: false,
    itemIds: [...ASSIGNMENT_LIST_FILTER_HANDOFF_ITEM_IDS],
    preservesPublishedContext: true,
    resetsPageOnFilterChange: true,
    routesThroughValidatedSearch: true,
    scope: 'owner-assignment-list-filter-state',
    searchMatchesAssignmentTitle: true,
    searchMatchesShareSlug: true,
    searchMatchesSourceActivityText: true,
    sharesRulesWithDashboardControls: true,
    sharesRulesWithListApi: true,
    statusFilters: [...ASSIGNMENT_LIFECYCLE_STATUS_FILTERS],
    usesDomainSearchNormalization: true,
    usesFullFilteredSummaryForOverview: true,
  });

  assert.equal(filterHandoffView.title, 'Assignment list filter state');
  assert.match(filterHandoffView.description, /URL parsing/);
  assert.equal(values.get('route-validate-search'), 'Validated URL state');
  assert.equal(values.get('route-default-elision'), 'Defaults omitted');
  assert.equal(
    values.get('published-context-normalization'),
    'Share id normalized'
  );
  assert.equal(
    values.get('published-context-preservation'),
    'Published context preserved'
  );
  assert.equal(values.get('search-normalized-query'), 'Week 1');
  assert.equal(values.get('search-width-normalization'), 'NFKC normalized');
  assert.equal(
    values.get('search-whitespace-collapse'),
    'Whitespace collapsed'
  );
  assert.equal(values.get('search-empty-default'), 'Search filtered');
  assert.equal(values.get('search-assignment-title'), 'Assignment title');
  assert.equal(values.get('search-share-id'), 'Share id');
  assert.equal(
    values.get('search-source-activity'),
    'Live and frozen source activity'
  );
  assert.equal(values.get('status-parser'), 'open, closed, expired, draft');
  assert.equal(values.get('status-all-default'), 'All statuses');
  assert.equal(values.get('status-published-alias'), 'published -> open');
  assert.equal(values.get('status-open-filter'), 'Open');
  assert.equal(values.get('status-closed-filter'), 'Closed');
  assert.equal(values.get('status-expired-filter'), 'Expired');
  assert.equal(values.get('status-draft-filter'), 'Draft');
  assert.equal(values.get('page-parser'), 'First page unless page > 1');
  assert.equal(
    values.get('page-size-boundary'),
    `${ASSIGNMENT_LIST_PAGE_SIZE} per page`
  );
  assert.equal(values.get('filter-change-page-reset'), 'Reset to page 1');
  assert.equal(
    values.get('page-change-filter-preservation'),
    'Filters preserved'
  );
  assert.equal(values.get('clear-search-control'), 'Search removed');
  assert.equal(values.get('clear-filter-control'), 'Defaults restored');
  assert.equal(values.get('dashboard-control-options'), 'Search and status');
  assert.equal(values.get('list-api-owner-scope'), 'Teacher owner only');
  assert.equal(
    values.get('list-api-search-where'),
    'Title, share id, source activity'
  );
  assert.equal(values.get('list-api-status-filter'), 'Lifecycle helper');
  assert.equal(values.get('full-summary-filter-result'), '9 matches');
  assert.equal(
    values.get('privacy-guard'),
    'No ids, tokens, answers, exports, or storage keys'
  );
  assertNoPrivateFilterText(JSON.stringify(filterHandoffView));
});

test('assignment list filter handoff localizes empty default state in zh', () => {
  overwriteGetLocale(() => 'zh');

  const filterHandoffView = buildAssignmentListFilterView({
    search: '   ',
    status: 'all',
    total: 0,
  });
  const values = getHandoffValues(filterHandoffView);

  assert.equal(filterHandoffView.title, '作业列表筛选状态');
  assert.match(filterHandoffView.description, /URL 解析/);
  assert.equal(values.get('search-normalized-query'), '全部作业链接');
  assert.equal(values.get('search-empty-default'), '全部作业链接');
  assert.equal(values.get('status-all-default'), '全部状态');
  assert.equal(values.get('status-open-filter'), '开放中');
  assert.equal(values.get('status-closed-filter'), '已关闭');
  assert.equal(values.get('status-expired-filter'), '已过期');
  assert.equal(values.get('status-draft-filter'), '草稿');
  assert.equal(
    values.get('page-size-boundary'),
    `每页 ${ASSIGNMENT_LIST_PAGE_SIZE} 个`
  );
  assert.match(
    filterHandoffView.itemViews[0].ariaLabel,
    /路由 validateSearch：已验证 URL 状态。/
  );
});

test('assignment list route, component, and API share the filter contract', () => {
  assert.match(
    COMPONENT_SOURCE,
    /data-handoff="assignment-list-filter-state"[\s\S]*data-handoff-scope=\{handoffView\.privacy\.scope\}[\s\S]*<dl>[\s\S]*handoffView\.itemViews\.map\(\(item\) =>[\s\S]*AssignmentListFilterHandoffItem/,
    'AssignmentListFilters should render the hidden filter-state semantic contract.'
  );
  assert.match(
    COMPONENT_SOURCE,
    /function AssignmentListFilterHandoffItem[\s\S]*const labelId = `assignment-list-filter-state-\$\{item\.id\}-label`[\s\S]*const valueId = `assignment-list-filter-state-\$\{item\.id\}-value`[\s\S]*const descriptionId = `assignment-list-filter-state-\$\{item\.id\}-description`[\s\S]*data-handoff-item=\{item\.id\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}/,
    'AssignmentListFilters should expose stable label/value/description ids for each filter-state item.'
  );
  assert.match(
    ROUTE_SOURCE,
    /validateSearch: buildAssignmentListValidatedSearch[\s\S]*buildAssignmentListFilterRouteSearch[\s\S]*buildAssignmentListPageRouteSearch[\s\S]*buildAssignmentListRouteSearch[\s\S]*buildAssignmentListDismissPublishedRouteSearch/,
    'The dashboard route should validate URL search and generate filter, page, clear, and published-dismiss route state through shared helpers.'
  );
  assert.match(
    FILTER_SOURCE,
    /normalizeAssignmentListSearch[\s\S]*normalize\('NFKC'\)[\s\S]*replace\(\/\\s\+\/g, ' '\)/,
    'Filter helpers should normalize assignment-list search text.'
  );
  assert.match(
    FILTER_SOURCE,
    /buildAssignmentListFilterRouteSearch[\s\S]*return buildAssignmentListRouteSearch\(\{[\s\S]*published,[\s\S]*q: next\.q \?\? current\.q[\s\S]*status: next\.status \?\? current\.status/,
    'Filter helpers should reset page while preserving resolved filters and published context on filter changes.'
  );
  assert.match(
    FILTER_SOURCE,
    /parseAssignmentStatusFilter[\s\S]*value === 'published'[\s\S]*return 'open'/,
    'Filter helpers should keep the legacy published status alias mapped to open.'
  );
  assert.match(
    API_SOURCE,
    /z\.preprocess\(\s*parseAssignmentStatusFilter,\s*z\.enum\(ASSIGNMENT_LIFECYCLE_STATUS_FILTERS\)\.optional\(\)\s*\)[\s\S]*buildAssignmentListWhere\(\{[\s\S]*search: data\.search,[\s\S]*status: data\.status,[\s\S]*userId/,
    'The list API should validate lifecycle status and call the owner-scoped list where helper with search and status.'
  );
  assert.match(
    LIST_QUERY_SOURCE,
    /normalizeAssignmentListSearch\(search\)[\s\S]*const filters: SQL\[\] = \[eq\(assignment\.ownerId, userId\)\][\s\S]*buildAssignmentLifecycleStatusFilter[\s\S]*sqlLikeContains\(assignment\.title[\s\S]*sqlLikeContains\(assignment\.shareSlug[\s\S]*sqlLikeContains\(activity\.title[\s\S]*sqlLikeContains\(assignmentSnapshot\.activityTitle/,
    'The assignment list query should apply owner scope before status and multi-field search where clauses.'
  );
});

test('assignment list filter helpers normalize URL state predictably', () => {
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

test('assignment list filter-state handoff is documented', () => {
  const normalizedCatalog = TEST_CATALOG_SOURCE.replace(/\s+/g, ' ');

  assert.match(
    PRODUCT_SOURCE,
    /assignment-list filter-state chain[\s\S]*30-slice contract[\s\S]*URL validation[\s\S]*published-share context[\s\S]*search normalization[\s\S]*status parsing[\s\S]*list\s+API[\s\S]*privacy guards/,
    'docs/product.md should document the assignment-list filter-state chain.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /pnpm exec tsx --test scripts\/assignment-list-filter-state-handoff-semantic-views\.test\.ts/
  );
  for (const boundary of [
    'assignment list filter-state handoff',
    'URL validation',
    'published context',
    'search normalization',
    'page reset',
    'dashboard controls',
    'list API owner scope',
    'status filters',
    'privacy guards',
  ]) {
    assert.match(normalizedCatalog, new RegExp(boundary));
  }
});

function buildAssignmentListFilterView({
  search,
  status,
  total,
}: {
  search: string;
  status: AssignmentStatusFilter;
  total: number;
}) {
  return buildAssignmentListSearchPanelView({
    isLoading: false,
    search,
    status,
    total,
  }).filterHandoffView;
}

function getHandoffValues(view: AssignmentListFilterHandoffView) {
  return new Map(
    view.itemViews.map((item) => [
      item.id satisfies AssignmentListFilterHandoffItemId,
      item.value,
    ])
  );
}

function assertNoPrivateFilterText(serializedView: string) {
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
      `Assignment list filter handoff leaked private text: ${privateValue}`
    );
  }
}
