import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVITY_LIBRARY_FILTER_STATE_CHAIN_HANDOFF_ITEM_IDS,
  ACTIVITY_LIBRARY_FILTER_STATE_CHAIN_SOURCE_FILES,
  buildActivityLibraryFilterStateChainHandoffView,
  type ActivityLibraryFilterStateChainHandoffItemId,
  type ActivityLibraryFilterStateChainHandoffView,
} from '@/activities/activity-library-filter-state-chain';
import { ACTIVITY_SOURCE_MATERIAL_SUMMARY_CHAIN_HANDOFF_ITEM_IDS } from '@/activities/activity-source-material-summary-chain';
import { getActivityTemplates } from '@/activities/catalog';
import {
  ACTIVITY_LIBRARY_PAGE_SIZE,
  ACTIVITY_LIBRARY_STATUSES,
  ACTIVITY_SOURCE_MATERIAL_FILTERS,
  buildActivityLibraryFilterRouteSearch,
  buildActivityLibraryPageRouteSearch,
  buildActivityLibraryRouteSearch,
  buildActivityLibraryValidatedSearch,
  normalizeActivityLibrarySearch,
} from '@/activities/library-filters';
import {
  ACTIVITY_LIBRARY_FILTER_HANDOFF_ITEM_IDS,
  ACTIVITY_LIBRARY_PAGE_HANDOFF_ITEM_IDS,
  buildActivityLibrarySearchPanelView,
} from '@/activities/library-view';

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');
const FILTER_SOURCE = readFileSync('src/activities/library-filters.ts', 'utf8');
const LIBRARY_QUERY_SOURCE = readFileSync(
  'src/activities/library-query.ts',
  'utf8'
);
const ROUTE_SOURCE = readFileSync(
  'src/routes/dashboard/activities.tsx',
  'utf8'
);
const API_SOURCE = readFileSync('src/api/activities.ts', 'utf8');
const COMPONENT_SOURCE = readFileSync(
  'src/components/activities/activity-library-search.tsx',
  'utf8'
);

const SECRET_ACTIVITY_ID = 'SECRET_ACTIVITY_LIBRARY_FILTER_ACTIVITY_ID';
const SECRET_ANSWER = 'SECRET_ACTIVITY_LIBRARY_FILTER_ANSWER';
const SECRET_FILE_ID = 'SECRET_ACTIVITY_LIBRARY_FILTER_FILE_ID';
const SECRET_FILENAME = 'secret-activity-library-filter.pdf';
const SECRET_STORAGE_KEY = 'source-materials/private/filter-state.pdf';
const SECRET_STUDENT_TOKEN = 'SECRET_ACTIVITY_LIBRARY_FILTER_STUDENT_TOKEN';

test('activity library filter-state chain exposes 30 safe slices', () => {
  const handoffView = buildActivityLibraryFilterStateChainHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...ACTIVITY_LIBRARY_FILTER_STATE_CHAIN_HANDOFF_ITEM_IDS,
  ]);
  assert.deepEqual(itemIds, [...ACTIVITY_LIBRARY_FILTER_HANDOFF_ITEM_IDS]);
  assert.equal(handoffView.title, 'Activity library filter-state chain');
  assert.match(
    handoffView.description,
    /Thirty-slice activity-library filter-state chain/
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
      ACTIVITY_LIBRARY_FILTER_STATE_CHAIN_SOURCE_FILES.length,
    exposesActivityIds: false,
    exposesAnswerText: false,
    exposesPrivateActivityContent: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialFilenames: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentData: false,
    itemIds,
    pageSize: ACTIVITY_LIBRARY_PAGE_SIZE,
    preservesCreatedActivityContext: true,
    resetsPageOnFilterChange: true,
    routesThroughValidatedSearch: true,
    sharesRulesWithDashboardControls: true,
    sharesRulesWithListApi: true,
    sourceFiles: [...ACTIVITY_LIBRARY_FILTER_STATE_CHAIN_SOURCE_FILES],
    sourceFilters: [...ACTIVITY_SOURCE_MATERIAL_FILTERS],
    statusFilters: [...ACTIVITY_LIBRARY_STATUSES],
    templateFamilyCount: getActivityTemplates().length,
    usesActivityLibraryFilterHandoff: true,
    usesActivitySourceMaterialSummaryChain: true,
    usesDomainSearchNormalization: true,
    usesOwnerScopedListApi: true,
    usesSourceMaterialPostFilter: true,
  });
  assertNoPrivateActivityLibraryFilterStateText(JSON.stringify(handoffView));
});

test('activity library filter-state chain summarizes the route contract', () => {
  const handoffView = buildActivityLibraryFilterStateChainHandoffView();

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['route-validate-search', 'Validated URL state'],
      ['route-default-elision', 'Defaults omitted'],
      ['search-normalized-query', 'NFKC search value'],
      ['search-width-normalization', 'NFKC normalized'],
      ['search-whitespace-collapse', 'Whitespace collapsed'],
      ['search-empty-default', 'All saved activities'],
      ['search-owner-fields', 'Title, description, template'],
      ['status-parser', 'active or archived'],
      ['status-active-default', 'Active'],
      ['status-archived-filter', 'Archived'],
      ['template-parser', `${getActivityTemplates().length} template families`],
      ['template-all-default', 'All templates'],
      ['template-exact-family', 'Exact template family'],
      ['source-parser', 'all, audio, extractable, spreadsheet, worksheet'],
      ['source-all-default', 'All source materials'],
      ['source-audio-filter', 'Audio'],
      ['source-extractable-filter', 'Any extractable source'],
      ['source-spreadsheet-filter', 'Spreadsheet'],
      ['source-worksheet-filter', 'Worksheet'],
      ['page-parser', 'First page unless page > 1'],
      ['page-size-boundary', `${ACTIVITY_LIBRARY_PAGE_SIZE} per page`],
      ['filter-change-page-reset', 'Reset to page 1'],
      ['page-change-filter-preservation', 'Filters preserved'],
      ['created-activity-context', 'Created panel preserved'],
      ['clear-search-control', 'Search removed'],
      ['clear-filter-control', 'Defaults restored'],
      ['dashboard-control-options', 'Search, template, source, status'],
      ['list-api-owner-scope', 'Teacher owner only'],
      ['list-api-source-post-filter', 'Source filter after owner read'],
      ['privacy-guard', 'No ids, answers, files, or students'],
    ]
  );
  assert.equal(
    getHandoffValue(handoffView, 'page-size-boundary'),
    `${ACTIVITY_LIBRARY_PAGE_SIZE} per page`
  );
});

test('activity library filter-state chain is backed by adjacent gates', () => {
  assert.equal(ACTIVITY_LIBRARY_FILTER_STATE_CHAIN_SOURCE_FILES.length, 30);
  for (const filePath of ACTIVITY_LIBRARY_FILTER_STATE_CHAIN_SOURCE_FILES) {
    assert.ok(
      existsSync(filePath),
      `Missing activity library filter-state chain file ${filePath}`
    );
  }

  assert.deepEqual(
    [
      ACTIVITY_LIBRARY_FILTER_HANDOFF_ITEM_IDS.length,
      ACTIVITY_LIBRARY_PAGE_HANDOFF_ITEM_IDS.length,
      ACTIVITY_SOURCE_MATERIAL_SUMMARY_CHAIN_HANDOFF_ITEM_IDS.length,
    ],
    [30, 30, 30]
  );
});

test('activity library filter-state chain preserves product docs', () => {
  assert.match(
    PRODUCT_SOURCE,
    /activity-library filter-state chain[\s\S]*30 slices[\s\S]*URL validation[\s\S]*NFKC search normalization[\s\S]*source-material filter parsing[\s\S]*page reset[\s\S]*dashboard control options[\s\S]*list API owner scope[\s\S]*privacy guards/i,
    'docs/product.md should preserve the activity-library filter-state chain scope.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /src\/activities\/activity-library-filter-state-chain\.ts[\s\S]*source-level contract/i,
    'docs/product.md should name the activity library filter-state chain source file.'
  );
});

test('activity library route helpers normalize URL state predictably', () => {
  assert.equal(
    normalizeActivityLibrarySearch('  Ｇｒｏｕｐ   １  '),
    'Group 1'
  );
  assert.equal(normalizeActivityLibrarySearch('   '), undefined);
  assert.deepEqual(
    buildActivityLibraryValidatedSearch({
      created: 'created-1',
      createdFrom: 'duplicate',
      page: '4',
      q: '  Ｇｒｏｕｐ   １  ',
      source: 'worksheet',
      status: 'archived',
      template: 'group-sort',
    }),
    {
      created: 'created-1',
      createdFrom: 'duplicate',
      page: 4,
      q: 'Group 1',
      source: 'worksheet',
      status: 'archived',
      template: 'group-sort',
    }
  );
  assert.deepEqual(
    buildActivityLibraryRouteSearch({
      page: 1,
      q: ' ',
      source: 'all',
      status: 'active',
      template: 'all',
    }),
    {
      created: undefined,
      createdFrom: undefined,
      page: undefined,
      q: undefined,
      source: undefined,
      status: undefined,
      template: undefined,
    }
  );
  assert.deepEqual(
    buildActivityLibraryFilterRouteSearch({
      created: 'saved-activity',
      createdFrom: 'duplicate',
      current: {
        q: 'old',
        source: 'audio',
        status: 'archived',
        template: 'quiz',
      },
      next: {
        q: '  Ｎｅｗ   search  ',
        source: 'worksheet',
      },
    }),
    {
      created: 'saved-activity',
      createdFrom: 'duplicate',
      page: undefined,
      q: 'New search',
      source: 'worksheet',
      status: 'archived',
      template: 'quiz',
    }
  );
  assert.deepEqual(
    buildActivityLibraryPageRouteSearch({
      current: {
        created: 'saved-activity',
        createdFrom: 'remix',
        q: 'unit',
        source: 'spreadsheet',
        status: 'archived',
        template: 'group-sort',
      },
      page: 3,
    }),
    {
      created: 'saved-activity',
      createdFrom: 'remix',
      page: 3,
      q: 'unit',
      source: 'spreadsheet',
      status: 'archived',
      template: 'group-sort',
    }
  );
});

test('activity library route component and API share filter state', () => {
  assert.match(
    ROUTE_SOURCE,
    /validateSearch: buildActivityLibraryValidatedSearch[\s\S]*buildActivityLibraryFilterRouteSearch[\s\S]*buildActivityLibraryPageRouteSearch[\s\S]*buildActivityLibraryRouteSearch/,
    'The dashboard route should validate and build activity-library filter route state through shared helpers.'
  );
  assert.match(
    COMPONENT_SOURCE,
    /data-handoff="activity-library-filter-state"[\s\S]*data-handoff-scope=\{handoffView\.privacy\.scope\}[\s\S]*handoffView\.itemViews\.map/,
    'The activity library search component should render the hidden filter-state handoff.'
  );
  assert.match(
    FILTER_SOURCE,
    /normalizeActivityLibrarySearch[\s\S]*normalize\('NFKC'\)[\s\S]*replace\(\/\\s\+\/g, ' '\)[\s\S]*buildActivityLibraryFilterRouteSearch[\s\S]*q: next\.q \?\? current\.q/,
    'Filter helpers should own search normalization and filter-change route construction.'
  );
  assert.match(
    API_SOURCE,
    /z\.enum\(ACTIVITY_LIBRARY_STATUSES\)[\s\S]*z\.enum\(ACTIVITY_SOURCE_MATERIAL_FILTERS\)[\s\S]*buildActivityLibraryWhere\(\{[\s\S]*userId[\s\S]*filterActivityLibrarySourceItems/,
    'The API should reuse status/source enums, owner-scoped where helper, and source-material post-filtering.'
  );
  assert.match(
    LIBRARY_QUERY_SOURCE,
    /const filters: SQL\[\] = \[eq\(activity\.ownerId, userId\)\][\s\S]*sqlLikeContains\(activity\.title, normalizedSearch\)[\s\S]*sqlLikeContains\(activity\.description, normalizedSearch\)[\s\S]*sqlLikeContains\(activity\.templateType, normalizedSearch\)/,
    'Activity library queries should keep search fields behind owner scope.'
  );
});

test('activity library filter-state chain matches the visible handoff privacy', () => {
  const filterHandoffView = buildActivityLibrarySearchPanelView({
    isLoading: false,
    search: '  Ｕｎｉｔ   １  ',
    source: 'worksheet',
    status: 'archived',
    template: 'quiz',
    total: 7,
  }).filterHandoffView;

  assert.deepEqual(
    filterHandoffView.itemViews.map((item) => item.id),
    [...ACTIVITY_LIBRARY_FILTER_STATE_CHAIN_HANDOFF_ITEM_IDS]
  );
  assert.equal(filterHandoffView.privacy.exposesActivityIds, false);
  assert.equal(filterHandoffView.privacy.exposesAnswerText, false);
  assert.equal(filterHandoffView.privacy.exposesPrivateActivityContent, false);
  assert.equal(filterHandoffView.privacy.exposesSourceMaterialFileIds, false);
  assert.equal(
    filterHandoffView.privacy.exposesSourceMaterialStorageKeys,
    false
  );
  assert.equal(filterHandoffView.privacy.exposesStudentData, false);
  assert.equal(filterHandoffView.privacy.routesThroughValidatedSearch, true);
  assert.equal(filterHandoffView.privacy.sharesRulesWithListApi, true);
  assertNoPrivateActivityLibraryFilterStateText(
    JSON.stringify(filterHandoffView)
  );
});

test('activity library filter-state chain focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /Activity library filter-state chain has a fast script-level gate via[\s\S]*scripts\/activity-library-filter-state-chain-handoff\.test\.ts/,
    'TEST-CATALOG should document the activity library filter-state chain gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE.replace(/\s+/g, ' '),
    /URL validateSearch[\s\S]*NFKC search normalization[\s\S]*status\/template\/source filters[\s\S]*page reset[\s\S]*created-activity context[\s\S]*dashboard controls[\s\S]*list API owner scope[\s\S]*privacy guards/,
    'TEST-CATALOG should document the activity library filter-state chain scope.'
  );
});

function getHandoffValue(
  view: ActivityLibraryFilterStateChainHandoffView,
  id: ActivityLibraryFilterStateChainHandoffItemId
) {
  const item = view.itemViews.find((candidate) => candidate.id === id);
  assert.ok(item, `Missing activity library filter-state chain item ${id}`);
  return item.value;
}

function assertNoPrivateActivityLibraryFilterStateText(serializedView: string) {
  for (const privateValue of [
    SECRET_ACTIVITY_ID,
    SECRET_ANSWER,
    SECRET_FILE_ID,
    SECRET_FILENAME,
    SECRET_STORAGE_KEY,
    SECRET_STUDENT_TOKEN,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Activity library filter-state chain leaked private text: ${privateValue}`
    );
  }
}
