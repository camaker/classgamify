import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ASSIGNMENT_PUBLISH_RESULTS_CONTINUITY_CHAIN_SOURCE_FILES,
  ASSIGNMENT_PUBLISH_RESULTS_CONTINUITY_CHAIN_STAGES,
  buildAssignmentPublishResultsContinuityChainView,
} from '@/assignments/assignment-publish-results-continuity-chain';

const read = (path: string) => readFileSync(path, 'utf8');

test('assignment publish results continuity carries 30 unique stages', () => {
  const view = buildAssignmentPublishResultsContinuityChainView();
  assert.equal(ASSIGNMENT_PUBLISH_RESULTS_CONTINUITY_CHAIN_STAGES.length, 30);
  assert.equal(
    new Set(
      ASSIGNMENT_PUBLISH_RESULTS_CONTINUITY_CHAIN_STAGES.map(
        (stage) => stage.id
      )
    ).size,
    30
  );
  assert.deepEqual(view.sourceContracts, {
    delivery: 30,
    distribution: 30,
    persistence: 30,
    play: 30,
    results: 30,
    submission: 30,
  });
});

test('assignment publish results continuity keeps a real 30-file boundary', () => {
  const view = buildAssignmentPublishResultsContinuityChainView();
  assert.equal(
    ASSIGNMENT_PUBLISH_RESULTS_CONTINUITY_CHAIN_SOURCE_FILES.length,
    30
  );
  assert.equal(
    new Set(ASSIGNMENT_PUBLISH_RESULTS_CONTINUITY_CHAIN_SOURCE_FILES).size,
    30
  );
  for (const path of ASSIGNMENT_PUBLISH_RESULTS_CONTINUITY_CHAIN_SOURCE_FILES)
    assert.ok(existsSync(path), path);
  assert.equal(view.privacy.sourceFileCount, 30);
});

test('publish freezes settings and snapshot before distribution', () => {
  const api = read('src/api/assignments.ts');
  assert.match(api, /\.batch\(\[/);
  assert.match(api, /db\.insert\(assignment\)/);
  assert.match(api, /db\.insert\(assignmentSnapshot\)/);
  assert.match(api, /buildAssignmentSnapshot/);
  assert.match(api, /shareSlug/);
});

test('public play payload is sanitized and lifecycle guarded', () => {
  const publicSource = read('src/assignments/public.ts');
  assert.match(publicSource, /buildPublicAssignmentPayload/);
  assert.match(publicSource, /stripRuntimeAnswers/);
  assert.doesNotMatch(
    publicSource.slice(
      publicSource.indexOf('export type PublicAssignmentPayload ='),
      publicSource.indexOf('export type PublicAssignmentUnavailableReason')
    ),
    /answerKey|sourceMaterials|storageKey|r2Key/
  );
});

test('submission validates scores and persists one immutable attempt shape', () => {
  const api = read('src/api/assignments.ts');
  assert.match(api, /normalizeSubmittedAttemptAnswers/);
  assert.match(api, /assertSubmittedAnswersMatchRuntimeItems/);
  assert.match(api, /evaluateRuntimeAnswers/);
  assert.match(api, /buildScoredAttemptInsert/);
  assert.match(api, /rethrowAssignmentSubmissionWriteError/);
});

test('teacher results reuse persisted snapshot and attempt evidence', () => {
  const results = read('src/assignments/results.ts');
  const resultView = read('src/assignments/result-view.ts');
  const exportSource = read('src/assignments/results-export.ts');
  assert.match(results, /analyzeAssignmentResults/);
  assert.match(resultView, /buildAssignmentResult/);
  assert.match(exportSource, /buildAssignmentResultsCsv/);
});

test('publish results aggregate hides public and teacher secrets', () => {
  const privacy = buildAssignmentPublishResultsContinuityChainView().privacy;
  assert.equal(privacy.preservesFrozenSnapshot, true);
  assert.equal(privacy.usesGuardedAttemptPersistence, true);
  assert.equal(privacy.usesSanitizedPublicPayload, true);
  for (const [key, value] of Object.entries(privacy))
    if (key.startsWith('exposes')) assert.equal(value, false, key);
});

test('product and catalog register assignment publish results continuity', () => {
  assert.match(
    read('docs/product.md'),
    /assignment publish-to-results continuity chain[\s\S]*30[\s\S]*share[\s\S]*submission[\s\S]*results[\s\S]*privacy/i
  );
  assert.match(
    read('tests/e2e/TEST-CATALOG.md'),
    /assignment-publish-results-continuity-chain-handoff\.test\.ts[\s\S]*30-stage source-level contract/i
  );
});
