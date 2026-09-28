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
const ROUTE_SOURCE = readFileSync(
  'src/routes/dashboard/activities.tsx',
  'utf8'
);
const API_SOURCE = readFileSync('src/api/activities.ts', 'utf8');
const FILTER_SOURCE = readFileSync('src/activities/library-filters.ts', 'utf8');
const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('activity library route, component, and API share the filter contract', () => {
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

test('activity library filter state is documented', () => {
  assert.match(
    PRODUCT_SOURCE,
    /activity-library filter-state chain[\s\S]*30 slices[\s\S]*URL validation[\s\S]*search normalization[\s\S]*dashboard control[\s\S]*list\s+API[\s\S]*privacy guards/,
    'docs/product.md should document the filter-state chain.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Activity library filter state has a fast script-level gate via[\s\S]*scripts\/activity-library-filter-state\.test\.ts/,
    'TEST-CATALOG should document the activity library filter-state gate.'
  );
});
