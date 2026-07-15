import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ASSIGNMENT_ATTEMPT_PERSISTENCE_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS,
  ASSIGNMENT_ATTEMPT_PERSISTENCE_CONTINUITY_CHAIN_SOURCE_FILES,
  buildAssignmentAttemptPersistenceContinuityChainHandoffView,
} from '@/assignments/attempt-persistence-continuity-chain';
import { ASSIGNMENT_ATTEMPT_PERSISTENCE_HANDOFF_ITEM_IDS } from '@/assignments/attempt-persistence-handoff';

const read = (path: string) => readFileSync(path, 'utf8');

test('attempt persistence continuity carries 30 aligned slices', () => {
  const view = buildAssignmentAttemptPersistenceContinuityChainHandoffView();
  assert.equal(
    ASSIGNMENT_ATTEMPT_PERSISTENCE_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS.length,
    30
  );
  assert.deepEqual(
    ASSIGNMENT_ATTEMPT_PERSISTENCE_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS,
    ASSIGNMENT_ATTEMPT_PERSISTENCE_HANDOFF_ITEM_IDS
  );
  assert.deepEqual(
    view.itemViews.map((item) => item.id),
    [...ASSIGNMENT_ATTEMPT_PERSISTENCE_HANDOFF_ITEM_IDS]
  );
});

test('attempt persistence continuity keeps a real 30-file boundary', () => {
  const view = buildAssignmentAttemptPersistenceContinuityChainHandoffView();
  assert.equal(
    ASSIGNMENT_ATTEMPT_PERSISTENCE_CONTINUITY_CHAIN_SOURCE_FILES.length,
    30
  );
  assert.equal(
    new Set(ASSIGNMENT_ATTEMPT_PERSISTENCE_CONTINUITY_CHAIN_SOURCE_FILES).size,
    30
  );
  for (const path of ASSIGNMENT_ATTEMPT_PERSISTENCE_CONTINUITY_CHAIN_SOURCE_FILES)
    assert.ok(existsSync(path), path);
  assert.equal(view.privacy.chainSourceFileCount, 30);
});

test('insert helper clones answers and result into one scored row', () => {
  const source = read('src/assignments/attempt-persistence.ts');
  assert.match(
    source,
    /answers: cloneAttemptAnswerRows\(evaluation\.answers\)/
  );
  assert.match(source, /resultJson: cloneAttemptResult\(evaluation\.result\)/);
  assert.match(source, /score: evaluation\.result\.earnedPoints/);
  assert.match(source, /maxScore: evaluation\.result\.totalPoints/);
});

test('API reaches insert only after gates, validation, and scoring', () => {
  const api = read('src/api/assignments.ts');
  assert.match(
    api,
    /assertSubmittedAnswersMatchRuntimeItems[\s\S]*evaluateRuntimeAnswers[\s\S]*persistAttemptWithinIdentityLimit[\s\S]*buildScoredAttemptInsert/
  );
  assert.match(api, /buildAttemptStartedAt/);
});

test('stored scored attempts feed results, stats, and exports', () => {
  assert.match(
    read('src/assignments/results.ts'),
    /attempt\.answersJson\.answers/
  );
  assert.match(read('src/assignments/attempt-stats.ts'), /attempt\.resultJson/);
  assert.match(
    read('src/assignments/results-export.ts'),
    /storedAttempt\?\.resultJson/
  );
  assert.match(read('src/assignments/result-view.ts'), /analysis\.attempts/);
});

test('public feedback is sanitized from the same scored result', () => {
  const api = read('src/api/assignments.ts');
  assert.match(api, /buildAttemptSubmissionResponse/);
  assert.match(read('src/assignments/public.ts'), /PublicAttemptResult/);
  assert.match(
    read('src/assignments/scored-attempt-result-chain.ts'),
    /public-result-sanitization/
  );
});

test('persistence continuity keeps private values hidden', () => {
  const view = buildAssignmentAttemptPersistenceContinuityChainHandoffView();
  assert.equal(view.privacy.storesImmutableAnswerJson, true);
  assert.equal(view.privacy.storesImmutableResultJson, true);
  assert.equal(view.privacy.storesScoredAttemptsOnly, true);
  assert.equal(view.privacy.usesScoredAttemptInsertHelper, true);
  for (const [key, value] of Object.entries(view.privacy))
    if (key.startsWith('exposes')) assert.equal(value, false, key);
});

test('product and catalog register persistence continuity', () => {
  assert.match(
    read('docs/product.md'),
    /attempt persistence continuity chain[\s\S]*30-slice[\s\S]*submission gates[\s\S]*immutable[\s\S]*public feedback[\s\S]*statistics[\s\S]*privacy/i
  );
  assert.match(
    read('tests/e2e/TEST-CATALOG.md'),
    /assignment-attempt-persistence-continuity-chain-handoff\.test\.ts[\s\S]*30-slice source-level contract/i
  );
});
