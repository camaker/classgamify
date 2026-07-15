import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVITY_DERIVATIVE_SOURCE_CONTINUITY_CHAIN_SOURCE_FILES,
  ACTIVITY_DERIVATIVE_SOURCE_CONTINUITY_CHAIN_STAGES,
  buildActivityDerivativeSourceContinuityChainView,
} from '@/activities/derivative-source-continuity-chain';
import { ACTIVITY_DERIVATIVE_SOURCE_WRITE_GUARD_STAGES } from '@/activities/derivative-source-write';

const read = (path: string) => readFileSync(path, 'utf8');

test('derivative source continuity carries 30 aligned stages', () => {
  const view = buildActivityDerivativeSourceContinuityChainView();
  assert.equal(ACTIVITY_DERIVATIVE_SOURCE_CONTINUITY_CHAIN_STAGES.length, 30);
  assert.deepEqual(
    ACTIVITY_DERIVATIVE_SOURCE_CONTINUITY_CHAIN_STAGES,
    ACTIVITY_DERIVATIVE_SOURCE_WRITE_GUARD_STAGES
  );
  assert.deepEqual(
    view.itemViews.map((item) => item.id),
    ACTIVITY_DERIVATIVE_SOURCE_WRITE_GUARD_STAGES.map((stage) => stage.id)
  );
});

test('derivative source continuity keeps a real 30-file boundary', () => {
  const view = buildActivityDerivativeSourceContinuityChainView();
  assert.equal(
    ACTIVITY_DERIVATIVE_SOURCE_CONTINUITY_CHAIN_SOURCE_FILES.length,
    30
  );
  assert.equal(
    new Set(ACTIVITY_DERIVATIVE_SOURCE_CONTINUITY_CHAIN_SOURCE_FILES).size,
    30
  );
  for (const path of ACTIVITY_DERIVATIVE_SOURCE_CONTINUITY_CHAIN_SOURCE_FILES) {
    assert.ok(existsSync(path), `Missing derivative source: ${path}`);
  }
  assert.equal(view.privacy.chainSourceFileCount, 30);
});

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

test('derivative source continuity hides private provenance details', () => {
  const view = buildActivityDerivativeSourceContinuityChainView();
  assert.equal(view.privacy.preservesIndependentDerivativeDrafts, true);
  assert.equal(view.privacy.usesExactSourceRevision, true);
  assert.equal(view.privacy.usesOwnerScopedSourceRead, true);
  assert.equal(view.privacy.usesWriteTimeProvenanceGuard, true);
  for (const [key, value] of Object.entries(view.privacy)) {
    if (key.startsWith('exposes')) assert.equal(value, false, key);
  }
});

test('product and catalog register derivative source continuity', () => {
  assert.match(
    read('docs/product.md'),
    /derivative source continuity chain[\s\S]*30[\s\S]*provenance[\s\S]*revision[\s\S]*independent draft[\s\S]*privacy/i
  );
  assert.match(
    read('tests/e2e/TEST-CATALOG.md'),
    /activity-derivative-source-continuity-chain-handoff\.test\.ts[\s\S]*30-slice source-level contract/i
  );
});
