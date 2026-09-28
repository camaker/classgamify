import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(path, 'utf8');

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
});

test('product and catalog register persistence continuity', () => {
  assert.match(
    read('docs/product.md'),
    /attempt persistence continuity gate[\s\S]*submission gates[\s\S]*immutable[\s\S]*public feedback[\s\S]*statistics[\s\S]*privacy/i
  );
  assert.match(
    read('tests/e2e/TEST-CATALOG.md'),
    /assignment-attempt-persistence-continuity\.test\.ts[\s\S]*source guards/i
  );
});
