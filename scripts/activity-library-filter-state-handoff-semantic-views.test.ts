import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVITY_LIBRARY_FILTER_HANDOFF_ITEM_IDS,
  buildActivityLibrarySearchPanelView,
  type ActivityLibraryFilterHandoffItemId,
  type ActivityLibraryFilterHandoffView,
} from '@/activities/library-view';
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
import { getActivityTemplates } from '@/activities/catalog';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

const COMPONENT_SOURCE = readFileSync(
  'src/components/activities/activity-library-search.tsx',
  'utf8'
);
const ROUTE_SOURCE = readFileSync(
  'src/routes/dashboard/activities.tsx',
  'utf8'
);
const API_SOURCE = readFileSync('src/api/activities.ts', 'utf8');
const FILTER_SOURCE = readFileSync('src/activities/library-filters.ts', 'utf8');
const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const SECRET_ACTIVITY_ID = 'SECRET_ACTIVITY_ID_SHOULD_NOT_LEAK';
const SECRET_ANSWER = 'SECRET_FILTER_ANSWER_SHOULD_NOT_LEAK';
const SECRET_FILE_ID = 'SECRET_FILTER_FILE_ID_SHOULD_NOT_LEAK';
const SECRET_FILENAME = 'secret-filter-worksheet.pdf';
const SECRET_STORAGE_KEY = 'source-materials/private/filter.pdf';
const SECRET_STUDENT_TOKEN = 'anonymous-secret-token';

test('activity library filter handoff exposes 30 localized owner-scoped slices', () => {
  overwriteGetLocale(() => 'en');

  const filterHandoffView = buildActivityLibraryFilterView({
    search: '  Ｕｎｉｔ   １  ',
    source: 'worksheet',
    status: 'archived',
    template: 'quiz',
    total: 7,
  });
  const itemIds = filterHandoffView.itemViews.map((item) => item.id);
  const values = getHandoffValues(filterHandoffView);

  assert.deepEqual(itemIds, [...ACTIVITY_LIBRARY_FILTER_HANDOFF_ITEM_IDS]);
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
    exposesActivityIds: false,
    exposesAnswerText: false,
    exposesPrivateActivityContent: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialFilenames: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentData: false,
    itemIds: [...ACTIVITY_LIBRARY_FILTER_HANDOFF_ITEM_IDS],
    resetsPageOnFilterChange: true,
    routesThroughValidatedSearch: true,
    scope: 'owner-activity-library-filter-state',
    sharesRulesWithDashboardControls: true,
    sharesRulesWithListApi: true,
    statusFilters: [...ACTIVITY_LIBRARY_STATUSES],
    sourceFilters: [...ACTIVITY_SOURCE_MATERIAL_FILTERS],
    templateFilter: 'quiz',
    usesDomainSearchNormalization: true,
  });

  assert.equal(filterHandoffView.title, 'Activity library filter state');
  assert.match(filterHandoffView.description, /URL parsing/);
  assert.equal(values.get('route-validate-search'), 'Validated URL state');
  assert.equal(values.get('route-default-elision'), 'Defaults omitted');
  assert.equal(values.get('search-normalized-query'), 'Unit 1');
  assert.equal(values.get('search-width-normalization'), 'NFKC normalized');
  assert.equal(
    values.get('search-whitespace-collapse'),
    'Whitespace collapsed'
  );
  assert.equal(values.get('search-empty-default'), 'Search filtered');
  assert.equal(
    values.get('search-owner-fields'),
    'Title, description, template'
  );
  assert.equal(values.get('status-parser'), 'active or archived');
  assert.equal(values.get('status-active-default'), 'Active');
  assert.equal(values.get('status-archived-filter'), 'Archived');
  assert.equal(
    values.get('template-parser'),
    `${getActivityTemplates().length} template families`
  );
  assert.equal(values.get('template-exact-family'), 'Quiz');
  assert.equal(
    values.get('source-parser'),
    'all, audio, extractable, spreadsheet, worksheet'
  );
  assert.equal(values.get('source-all-default'), 'All source materials');
  assert.equal(values.get('source-audio-filter'), 'Audio');
  assert.equal(
    values.get('source-extractable-filter'),
    'Any extractable source'
  );
  assert.equal(values.get('source-spreadsheet-filter'), 'Spreadsheet');
  assert.equal(values.get('source-worksheet-filter'), 'Worksheet');
  assert.equal(values.get('page-parser'), 'First page unless page > 1');
  assert.equal(
    values.get('page-size-boundary'),
    `${ACTIVITY_LIBRARY_PAGE_SIZE} per page`
  );
  assert.equal(values.get('filter-change-page-reset'), 'Reset to page 1');
  assert.equal(
    values.get('page-change-filter-preservation'),
    'Filters preserved'
  );
  assert.equal(
    values.get('created-activity-context'),
    'Created panel preserved'
  );
  assert.equal(values.get('clear-search-control'), 'Search removed');
  assert.equal(values.get('clear-filter-control'), 'Defaults restored');
  assert.equal(
    values.get('dashboard-control-options'),
    'Search, template, source, status'
  );
  assert.equal(values.get('list-api-owner-scope'), 'Teacher owner only');
  assert.equal(values.get('list-api-source-post-filter'), '7 matches');
  assert.equal(
    values.get('privacy-guard'),
    'No ids, answers, files, or students'
  );
  assertNoPrivateFilterText(JSON.stringify(filterHandoffView));
});

test('activity library filter handoff localizes empty default state in zh', () => {
  overwriteGetLocale(() => 'zh');

  const filterHandoffView = buildActivityLibraryFilterView({
    search: '   ',
    source: 'all',
    status: 'active',
    template: 'all',
    total: 0,
  });
  const values = getHandoffValues(filterHandoffView);

  assert.equal(filterHandoffView.title, '活动库筛选状态');
  assert.match(filterHandoffView.description, /URL 解析/);
  assert.equal(values.get('search-normalized-query'), '全部已保存活动');
  assert.equal(values.get('search-empty-default'), '全部已保存活动');
  assert.equal(values.get('status-active-default'), '当前');
  assert.equal(values.get('template-all-default'), '全部模板');
  assert.equal(values.get('source-all-default'), '全部来源素材');
  assert.equal(
    values.get('page-size-boundary'),
    `每页 ${ACTIVITY_LIBRARY_PAGE_SIZE} 个`
  );
  assert.match(
    filterHandoffView.itemViews[0].ariaLabel,
    /路由 validateSearch：已验证 URL 状态。/
  );
});

test('activity library route, component, and API share the filter contract', () => {
  assert.match(
    COMPONENT_SOURCE,
    /data-handoff="activity-library-filter-state"[\s\S]*data-handoff-scope=\{handoffView\.privacy\.scope\}[\s\S]*<dl>[\s\S]*handoffView\.itemViews\.map\(\(item\) =>[\s\S]*ActivityLibraryFilterHandoffItem/,
    'ActivityLibrarySearch should render the hidden filter-state semantic contract.'
  );
  assert.match(
    COMPONENT_SOURCE,
    /function ActivityLibraryFilterHandoffItem[\s\S]*const labelId = `activity-library-filter-state-\$\{item\.id\}-label`[\s\S]*const valueId = `activity-library-filter-state-\$\{item\.id\}-value`[\s\S]*const descriptionId = `activity-library-filter-state-\$\{item\.id\}-description`[\s\S]*data-handoff-item=\{item\.id\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}/,
    'ActivityLibrarySearch should expose stable label/value/description ids for each filter-state item.'
  );
  assert.match(
    ROUTE_SOURCE,
    /validateSearch: buildActivityLibraryValidatedSearch[\s\S]*buildActivityLibraryFilterRouteSearch[\s\S]*buildActivityLibraryPageRouteSearch[\s\S]*buildActivityLibraryRouteSearch/,
    'The dashboard route should validate URL search and generate filter/page route state through shared helpers.'
  );
  assert.match(
    FILTER_SOURCE,
    /normalizeActivityLibrarySearch[\s\S]*normalize\('NFKC'\)[\s\S]*replace\(\/\\s\+\/g, ' '\)[\s\S]*buildActivityLibraryFilterRouteSearch[\s\S]*return buildActivityLibraryRouteSearch\(\{[\s\S]*q: next\.q \?\? current\.q/,
    'Filter helpers should normalize search text and reset page on filter changes.'
  );
  assert.match(
    API_SOURCE,
    /z\.enum\(ACTIVITY_LIBRARY_STATUSES\)[\s\S]*z\.enum\(ACTIVITY_SOURCE_MATERIAL_FILTERS\)[\s\S]*buildActivityLibraryWhere\(\{[\s\S]*userId[\s\S]*filterActivityLibrarySourceItems/,
    'The list API should use the shared status/source enums, owner-scoped where helper, and source-material post-filter.'
  );
});

test('activity library filter helpers normalize URL state predictably', () => {
  assert.equal(
    normalizeActivityLibrarySearch('  Ｇｒｏｕｐ   １  '),
    'Group 1'
  );
  assert.equal(normalizeActivityLibrarySearch('   '), undefined);
  assert.deepEqual(
    buildActivityLibraryValidatedSearch({
      page: '4',
      q: '  Ｇｒｏｕｐ   １  ',
      source: 'worksheet',
      status: 'archived',
      template: 'group-sort',
    }),
    {
      created: undefined,
      createdFrom: undefined,
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

test('activity library filter-state handoff is documented', () => {
  const normalizedCatalog = TEST_CATALOG_SOURCE.replace(/\s+/g, ' ');

  assert.match(
    PRODUCT_SOURCE,
    /activity-library filter-state chain[\s\S]*30 slices[\s\S]*URL validation[\s\S]*search normalization[\s\S]*dashboard control[\s\S]*list\s+API[\s\S]*privacy guards/,
    'docs/product.md should document the filter-state chain.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /pnpm exec tsx --test scripts\/activity-library-filter-state-handoff-semantic-views\.test\.ts/
  );
  for (const boundary of [
    'activity library filter-state handoff',
    'URL validation',
    'search normalization',
    'page reset',
    'dashboard controls',
    'list API owner scope',
    'source-material post-filter',
    'privacy guards',
  ]) {
    assert.match(normalizedCatalog, new RegExp(boundary));
  }
});

function buildActivityLibraryFilterView({
  search,
  source,
  status,
  template,
  total,
}: {
  search: string;
  source: 'all' | 'audio' | 'extractable' | 'spreadsheet' | 'worksheet';
  status: 'active' | 'archived';
  template: 'all' | 'quiz';
  total: number;
}) {
  return buildActivityLibrarySearchPanelView({
    isLoading: false,
    search,
    source,
    status,
    template,
    total,
  }).filterHandoffView;
}

function getHandoffValues(view: ActivityLibraryFilterHandoffView) {
  return new Map(
    view.itemViews.map((item) => [
      item.id satisfies ActivityLibraryFilterHandoffItemId,
      item.value,
    ])
  );
}

function assertNoPrivateFilterText(serializedView: string) {
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
      `Activity library filter handoff leaked private text: ${privateValue}`
    );
  }
}
