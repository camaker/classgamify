import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(path, 'utf8');

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

test('product and catalog register assignment publish results continuity', () => {
  assert.match(
    read('docs/product.md'),
    /assignment publish-to-results continuity chain[\s\S]*30[\s\S]*share[\s\S]*submission[\s\S]*result[\s\S]*privacy/i
  );
  assert.match(
    read('tests/e2e/TEST-CATALOG.md'),
    /assignment-publish-results-continuity\.test\.ts[\s\S]*30-stage source-level contract/i
  );
});
