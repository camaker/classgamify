import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(path, 'utf8');

test('duplicate and remix persist guarded provenance before reload', () => {
  const api = read('src/api/activities.ts');
  for (const [start, end] of [
    [
      'export const duplicateActivity',
      'const remixActivityTemplateInputSchema',
    ],
    ['export const remixActivityTemplate', 'const updateActivityInputSchema'],
  ]) {
    const startIndex = api.indexOf(start);
    const handler = api.slice(startIndex, api.indexOf(end, startIndex));
    const lifecycle = handler.indexOf('assertActivityCanDeriveWork');
    const insert = handler.indexOf('.insert(activity)');
    const mapping = handler.indexOf(
      '.catch(rethrowActivityDerivativeSourceWriteError)'
    );
    const reload = handler.indexOf(
      '.select(buildActivityDetailSelect())',
      mapping
    );
    assert.ok(lifecycle >= 0);
    assert.ok(insert > lifecycle);
    assert.ok(mapping > insert);
    assert.ok(reload > mapping);
  }
});

test('D1 validates provenance pair owner archive and revision', () => {
  const migration = read(
    'src/db/migrations/0013_activity_derivative_source_guard.sql'
  );
  assert.match(migration, /BEFORE INSERT ON `activity`/);
  assert.match(
    migration,
    /classgamify_activity_derivative_source_pair_invalid/
  );
  assert.match(
    migration,
    /classgamify_activity_derivative_source_owner_mismatch/
  );
  assert.match(migration, /classgamify_activity_derivative_source_archived/);
  assert.match(
    migration,
    /classgamify_activity_derivative_source_revision_mismatch/
  );
});

test('persistence carries exact source id and revision for derivatives', () => {
  const source = read('src/activities/persistence.ts');
  assert.match(source, /buildDuplicatedActivityInsert/);
  assert.match(source, /buildRemixedActivityInsert/);
  assert.match(source, /derivationSourceActivityId: sourceActivity\.id/);
  assert.match(source, /derivationSourceUpdatedAt: sourceActivity\.updatedAt/);
});

test('source errors preserve safe lifecycle and conflict mappings', () => {
  const source = read('src/activities/derivative-source-write.ts');
  assert.match(source, /getErrorTextChain/);
  assert.match(source, /activity_api_error_activity_not_found/);
  assert.match(source, /getArchivedActivityDerivationError/);
  assert.match(source, /activity_api_error_write_conflict/);
  assert.match(source, /throw error/);
});

test('product and catalog register derivative source continuity', () => {
  assert.match(
    read('docs/product.md'),
    /derivative source continuity gate[\s\S]*provenance[\s\S]*revision[\s\S]*independent draft[\s\S]*privacy/i
  );
  assert.match(
    read('tests/e2e/TEST-CATALOG.md'),
    /activity-derivative-source-continuity\.test\.ts[\s\S]*source guards/i
  );
});
