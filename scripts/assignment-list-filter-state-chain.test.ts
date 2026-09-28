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

test('assignment list filter-state chain preserves product docs', () => {
  assert.match(
    PRODUCT_SOURCE,
    /assignment-list filter-state chain[\s\S]*30-slice contract[\s\S]*URL validation[\s\S]*published-share context[\s\S]*search normalization[\s\S]*status parsing[\s\S]*list\s+API[\s\S]*privacy guards/,
    'docs/product.md should preserve the assignment-list filter-state chain scope.'
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
  assert.doesNotMatch(
    COMPONENT_SOURCE,
    /data-handoff/,
    'The assignment list filters should render no hidden audit output.'
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

test('assignment list filter-state chain focused gate is documented', () => {
  const normalizedCatalog = TEST_CATALOG_SOURCE.replace(/\s+/g, ' ');

  assert.match(
    TEST_CATALOG_SOURCE,
    /Assignment list filter-state chain has a fast script-level gate via[\s\S]*scripts\/assignment-list-filter-state-chain\.test\.ts/,
    'TEST-CATALOG should document the assignment list filter-state chain gate.'
  );
  assert.match(
    normalizedCatalog,
    /URL validateSearch[\s\S]*published context[\s\S]*search normalization[\s\S]*lifecycle status filters[\s\S]*page reset[\s\S]*dashboard controls[\s\S]*list API owner scope[\s\S]*full filtered summary[\s\S]*privacy/,
    'TEST-CATALOG should document the assignment list filter-state chain scope.'
  );
});
