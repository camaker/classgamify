import assert from 'node:assert/strict';
import { assertSubmittedAnswersMatchRuntimeItems } from '@/assignments/attempt-answers';
import { normalizeAttemptDurationSeconds } from '@/assignments/attempt-duration';
import {
  buildAttemptSubmissionAnswers,
  getAttemptCompletionSummary,
  isStudentAnswerFilled,
} from '@/assignments/student-submission';

const runtimeItems = [{ id: 'item-1' }, { id: 'item-2' }, { id: 'item-3' }];

const answers = {
  'item-1': ' apple ',
  'item-2': '   ',
} satisfies Record<string, string>;

assert.equal(isStudentAnswerFilled(undefined), false);
assert.equal(isStudentAnswerFilled('   '), false);
assert.equal(isStudentAnswerFilled(' answer '), true);

assert.deepEqual(
  getAttemptCompletionSummary({
    answers,
    runtimeItems,
  }),
  {
    answeredItemCount: 1,
    itemCount: 3,
    unansweredItemCount: 2,
  }
);

assert.deepEqual(
  buildAttemptSubmissionAnswers({
    answers,
    runtimeItems,
  }),
  [
    { answer: ' apple ', itemId: 'item-1' },
    { answer: '   ', itemId: 'item-2' },
    { answer: '', itemId: 'item-3' },
  ]
);

assert.doesNotThrow(() =>
  assertSubmittedAnswersMatchRuntimeItems({
    answers: [{ itemId: 'item-1' }, { itemId: 'item-3' }],
    runtimeItems,
  })
);

assert.throws(
  () =>
    assertSubmittedAnswersMatchRuntimeItems({
      answers: [
        { itemId: 'item-1' },
        { itemId: 'item-2' },
        { itemId: 'item-3' },
        { itemId: 'item-4' },
      ],
      runtimeItems,
    }),
  /exceed assignment item count/
);

assert.throws(
  () =>
    assertSubmittedAnswersMatchRuntimeItems({
      answers: [{ itemId: 'unknown-item' }],
      runtimeItems,
    }),
  /unknown item/
);

assert.throws(
  () =>
    assertSubmittedAnswersMatchRuntimeItems({
      answers: [{ itemId: 'item-1' }, { itemId: 'item-1' }],
      runtimeItems,
    }),
  /duplicate item/
);

assert.equal(
  normalizeAttemptDurationSeconds({
    durationSeconds: undefined,
    timeLimitSeconds: 60,
  }),
  undefined
);
assert.equal(normalizeAttemptDurationSeconds({ durationSeconds: -3 }), 0);
assert.equal(normalizeAttemptDurationSeconds({ durationSeconds: 4.6 }), 5);
assert.equal(
  normalizeAttemptDurationSeconds({
    durationSeconds: 90,
    timeLimitSeconds: 60,
  }),
  60
);

console.log('Domain tests passed.');
