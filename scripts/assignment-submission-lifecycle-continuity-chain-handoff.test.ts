import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ASSIGNMENT_SUBMISSION_LIFECYCLE_CONTINUITY_CHAIN_SOURCE_FILES,
  ASSIGNMENT_SUBMISSION_LIFECYCLE_CONTINUITY_CHAIN_STAGES,
  buildAssignmentSubmissionLifecycleContinuityChainView,
} from '@/assignments/submission-lifecycle-continuity-chain';
import { ASSIGNMENT_SUBMISSION_WRITE_GUARD_STAGES } from '@/assignments/submission-lifecycle-write';

const read = (path: string) => readFileSync(path, 'utf8');

test('submission lifecycle continuity carries 30 aligned stages', () => {
  const view = buildAssignmentSubmissionLifecycleContinuityChainView();
  assert.equal(
    ASSIGNMENT_SUBMISSION_LIFECYCLE_CONTINUITY_CHAIN_STAGES.length,
    30
  );
  assert.deepEqual(
    ASSIGNMENT_SUBMISSION_LIFECYCLE_CONTINUITY_CHAIN_STAGES,
    ASSIGNMENT_SUBMISSION_WRITE_GUARD_STAGES
  );
  assert.deepEqual(
    view.itemViews.map((item) => item.id),
    ASSIGNMENT_SUBMISSION_WRITE_GUARD_STAGES.map((stage) => stage.id)
  );
});

test('submission lifecycle continuity keeps a real 30-file boundary', () => {
  const view = buildAssignmentSubmissionLifecycleContinuityChainView();
  assert.equal(
    ASSIGNMENT_SUBMISSION_LIFECYCLE_CONTINUITY_CHAIN_SOURCE_FILES.length,
    30
  );
  assert.equal(
    new Set(ASSIGNMENT_SUBMISSION_LIFECYCLE_CONTINUITY_CHAIN_SOURCE_FILES).size,
    30
  );
  for (const path of ASSIGNMENT_SUBMISSION_LIFECYCLE_CONTINUITY_CHAIN_SOURCE_FILES) {
    assert.ok(existsSync(path), `Missing lifecycle source: ${path}`);
  }
  assert.equal(view.privacy.chainSourceFileCount, 30);
});

test('API preserves replay before lifecycle, validation, scoring, and writes', () => {
  const api = read('src/api/assignments.ts');
  const replay = api.indexOf(
    'const replayResponse = await recoverAttemptSubmissionResponse'
  );
  const lifecycle = api.indexOf('assertAssignmentAcceptsSubmissions', replay);
  const validation = api.indexOf(
    'assertSubmittedAnswersMatchRuntimeItems',
    lifecycle
  );
  const scoring = api.indexOf('evaluateRuntimeAnswers', validation);
  const persistence = api.indexOf(
    'persistAttemptWithinIdentityLimit({',
    scoring
  );
  const writeMapping = api.indexOf(
    '.catch(rethrowAssignmentSubmissionWriteError)',
    persistence
  );
  assert.ok(replay >= 0);
  assert.ok(lifecycle > replay);
  assert.ok(validation > lifecycle);
  assert.ok(scoring > validation);
  assert.ok(persistence > scoring);
  assert.ok(writeMapping > persistence);
});

test('D1 guards status and expiry at the before-insert boundary', () => {
  const migration = read(
    'src/db/migrations/0011_attempt_submission_lifecycle_guard.sql'
  );
  assert.match(
    migration,
    /CREATE TRIGGER `attempt_assignment_submission_status_guard`/
  );
  assert.match(
    migration,
    /CREATE TRIGGER `attempt_assignment_submission_expiry_guard`/
  );
  assert.match(migration, /BEFORE INSERT ON `attempt`/);
  assert.match(migration, /`status` = 'published'/);
  assert.match(migration, /unixepoch\('subsecond'\) \* 1000/);
  assert.match(migration, /classgamify_assignment_submission_status_blocked/);
  assert.match(migration, /classgamify_assignment_submission_expired/);
});

test('write errors classify lifecycle and slot conflicts without overlap', () => {
  const lifecycle = read('src/assignments/submission-lifecycle-write.ts');
  const concurrency = read('src/assignments/attempt-limit-concurrency.ts');
  assert.match(lifecycle, /getErrorTextChain/);
  assert.match(lifecycle, /getAssignmentSubmissionLifecycleWriteErrorMessage/);
  assert.match(lifecycle, /isAttemptIdentitySlotConflict/);
  assert.match(lifecycle, /attempt_assignment_identity_number_unique/);
  assert.match(
    concurrency,
    /recoverReplay\(\)[\s\S]*!isSlotConflict\(error\)[\s\S]*isSlotOccupied/
  );
});

test('public feedback and teacher results hide write-boundary metadata', () => {
  const api = read('src/api/assignments.ts');
  const response = api.slice(
    api.indexOf('function buildAttemptSubmissionResponse')
  );
  assert.doesNotMatch(
    response,
    /classgamify_assignment_submission_|identityKey:|attemptNumber:/
  );
  assert.doesNotMatch(
    read('src/assignments/results-export.ts'),
    /classgamify_assignment_submission_|identityKey|attemptNumber/
  );
});

test('submission lifecycle continuity hides internal write details', () => {
  const view = buildAssignmentSubmissionLifecycleContinuityChainView();
  assert.equal(view.privacy.preservesReplayBeforeLifecycleRejection, true);
  assert.equal(view.privacy.usesDatabaseClockForExpiry, true);
  assert.equal(view.privacy.usesLocalizedLifecycleErrors, true);
  assert.equal(view.privacy.usesSameStatementWriteGuard, true);
  for (const [key, value] of Object.entries(view.privacy)) {
    if (key.startsWith('exposes')) assert.equal(value, false, key);
  }
});

test('product and catalog register submission lifecycle continuity', () => {
  assert.match(
    read('docs/product.md'),
    /submission lifecycle continuity chain[\s\S]*30[\s\S]*replay[\s\S]*BEFORE INSERT[\s\S]*localized[\s\S]*privacy/i
  );
  assert.match(
    read('tests/e2e/TEST-CATALOG.md'),
    /assignment-submission-lifecycle-continuity-chain-handoff\.test\.ts[\s\S]*30-slice source-level contract/i
  );
});
