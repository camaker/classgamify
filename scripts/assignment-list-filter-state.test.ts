import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  buildAssignmentListDismissPublishedRouteSearch,
  buildAssignmentListFilterRouteSearch,
  buildAssignmentListPageRouteSearch,
  buildAssignmentListRouteSearch,
  buildAssignmentListValidatedSearch,
  normalizeAssignmentListSearch,
  parseAssignmentStatusFilter,
} from '@/assignments/list-filters';
const ROUTE_SOURCE = readFileSync(
  'src/routes/dashboard/assignments.tsx',
  'utf8'
);
const API_SOURCE = readFileSync('src/api/assignments.ts', 'utf8');
const FILTER_SOURCE = readFileSync('src/assignments/list-filters.ts', 'utf8');
const LIST_QUERY_SOURCE = readFileSync('src/assignments/list-query.ts', 'utf8');
const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('assignment list route, component, and API share the filter contract', () => {
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

test('assignment list filter state is documented', () => {
  assert.match(
    PRODUCT_SOURCE,
    /assignment-list filter-state gate[\s\S]*URL validation[\s\S]*published-share context[\s\S]*search normalization[\s\S]*status parsing[\s\S]*list\s+API[\s\S]*privacy guards/,
    'docs/product.md should document the assignment-list filter-state chain.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Assignment list filter state has a focused fast gate via[\s\S]*scripts\/assignment-list-filter-state\.test\.ts/,
    'TEST-CATALOG should document the assignment list filter-state gate.'
  );
});
