import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  buildActivityLibraryFilterRouteSearch,
  buildActivityLibraryPageRouteSearch,
  buildActivityLibraryRouteSearch,
  buildActivityLibraryValidatedSearch,
  normalizeActivityLibrarySearch,
} from '@/activities/library-filters';

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

test('activity library filter-state chain preserves product docs', () => {
  assert.match(
    PRODUCT_SOURCE,
    /activity-library filter-state chain[\s\S]*30 slices[\s\S]*URL validation[\s\S]*NFKC search normalization[\s\S]*source-material filter parsing[\s\S]*page reset[\s\S]*dashboard control options[\s\S]*list API owner scope[\s\S]*privacy guards/i,
    'docs/product.md should preserve the activity-library filter-state chain scope.'
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
  assert.doesNotMatch(
    COMPONENT_SOURCE,
    /data-handoff/,
    'The activity library search should render no hidden audit output.'
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

test('activity library filter-state chain focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /Activity library filter-state chain has a fast script-level gate via[\s\S]*scripts\/activity-library-filter-state-chain\.test\.ts/,
    'TEST-CATALOG should document the activity library filter-state chain gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE.replace(/\s+/g, ' '),
    /URL validateSearch[\s\S]*NFKC search normalization[\s\S]*status\/template\/source filters[\s\S]*page reset[\s\S]*created-activity context[\s\S]*dashboard controls[\s\S]*list API owner scope[\s\S]*privacy guards/,
    'TEST-CATALOG should document the activity library filter-state chain scope.'
  );
});
