import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(path, 'utf8');

test('shared answer validation rejects invalid ids before scoring', () => {
  const answers = read('src/assignments/attempt-answers.ts');
  assert.match(answers, /answers\.length > runtimeItems\.length/);
  assert.match(answers, /unknown-item/);
  assert.match(answers, /duplicate-item/);
  assert.match(answers, /duplicate-runtime-item/);
  assert.match(answers, /normalizeAttemptAnswerItemId/);
});

test('API normalizes and validates frozen runtime answers before scoring', () => {
  const api = read('src/api/assignments.ts');
  assert.match(
    api,
    /normalizeSubmittedAttemptAnswers\(data\.answers\)[\s\S]*assertSubmittedAnswersMatchRuntimeItems[\s\S]*evaluateRuntimeAnswers/
  );
  assert.match(api, /runtimeItems: orderedRuntimeItems/);
});

test('browser payload and progress derive from runtime items', () => {
  const submission = read('src/assignments/student-submission.ts');
  assert.match(
    submission,
    /buildAttemptSubmissionAnswers[\s\S]*getUniqueSubmissionRuntimeItemEntries/
  );
  assert.match(
    submission,
    /getAttemptCompletionSummary[\s\S]*getUniqueSubmissionRuntimeItemEntries/
  );
  assert.match(submission, /isSafeStudentAttemptAnswerValidationErrorCode/);
});

test('public payload strips answers while teacher results use scored attempts', () => {
  assert.match(
    read('src/assignments/public.ts'),
    /stripRuntimeAnswers[\s\S]*answer:[\s\S]*undefined/
  );
  assert.match(
    read('src/assignments/result-view.ts'),
    /reviews: data\?\.analysis\.attempts/
  );
  assert.match(
    read('src/assignments/attempt-persistence.ts'),
    /resultJson: cloneAttemptResult\(evaluation\.result\)/
  );
});

test('public controls do not render submission validation audit DOM', () => {
  const controls = read(
    'src/components/assignments/student-runner-submit-controls.tsx'
  );
  const route = read('src/routes/play/$shareId.tsx');
  assert.doesNotMatch(
    controls,
    /data-handoff="assignment-submission-validation"/
  );
  assert.doesNotMatch(route, /submissionValidationHandoffView=\{/);
});

test('product and catalog register submission validation continuity', () => {
  assert.match(
    read('docs/product.md'),
    /submission validation continuity gate[\s\S]*frozen runtime[\s\S]*partial[\s\S]*validate-before-scoring[\s\S]*privacy/i
  );
  assert.match(
    read('tests/e2e/TEST-CATALOG.md'),
    /assignment-submission-validation-continuity\.test\.ts[\s\S]*source guards/i
  );
});
