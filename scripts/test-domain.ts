import assert from 'node:assert/strict';
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

console.log('Domain tests passed.');
