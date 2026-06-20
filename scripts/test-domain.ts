import assert from 'node:assert/strict';
import { assertSubmittedAnswersMatchRuntimeItems } from '@/assignments/attempt-answers';
import { normalizeAttemptDurationSeconds } from '@/assignments/attempt-duration';
import { analyzeAssignmentResults } from '@/assignments/results';
import {
  buildAttemptSubmissionAnswers,
  getAttemptCompletionSummary,
  isStudentAnswerFilled,
} from '@/assignments/student-submission';
import type { RuntimeItem } from '@/activities/runtime';

const submissionRuntimeItems = [
  { id: 'item-1' },
  { id: 'item-2' },
  { id: 'item-3' },
];

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
    runtimeItems: submissionRuntimeItems,
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
    runtimeItems: submissionRuntimeItems,
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
    runtimeItems: submissionRuntimeItems,
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
      runtimeItems: submissionRuntimeItems,
    }),
  /exceed assignment item count/
);

assert.throws(
  () =>
    assertSubmittedAnswersMatchRuntimeItems({
      answers: [{ itemId: 'unknown-item' }],
      runtimeItems: submissionRuntimeItems,
    }),
  /unknown item/
);

assert.throws(
  () =>
    assertSubmittedAnswersMatchRuntimeItems({
      answers: [{ itemId: 'item-1' }, { itemId: 'item-1' }],
      runtimeItems: submissionRuntimeItems,
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

const resultRuntimeItems = [
  {
    answer: 'Paris / Paris, France',
    choices: ['Paris', 'Rome'],
    explanation: 'Paris is the capital of France.',
    id: 'q-1',
    kind: 'question',
    prompt: 'Capital of France?',
  },
  {
    answer: 'Cold',
    choices: ['Cold', 'Warm'],
    id: 'pair-1',
    kind: 'pair',
    prompt: 'Hot',
  },
] satisfies RuntimeItem[];

const resultAnalysis = analyzeAssignmentResults({
  attempts: [
    {
      anonymousToken: null,
      answersJson: {
        answers: [
          { answer: 'paris france', correct: true, itemId: 'q-1' },
          { answer: 'Warm', correct: false, itemId: 'pair-1' },
        ],
        templateType: 'quiz',
      },
      completedAt: new Date('2026-01-01T10:00:00.000Z'),
      id: 'attempt-1',
      resultJson: {
        accuracy: 50,
        completedItemCount: 2,
        correctItemCount: 1,
        earnedPoints: 1,
        totalPoints: 2,
      },
      score: 1,
      studentName: ' Alice ',
    },
    {
      anonymousToken: null,
      answersJson: {
        answers: [
          { answer: 'Paris', correct: true, itemId: 'q-1' },
          { answer: 'Cold', correct: true, itemId: 'pair-1' },
        ],
        templateType: 'quiz',
      },
      completedAt: new Date('2026-01-02T10:00:00.000Z'),
      id: 'attempt-2',
      resultJson: {
        accuracy: 100,
        completedItemCount: 2,
        correctItemCount: 2,
        earnedPoints: 2,
        totalPoints: 2,
      },
      score: 2,
      studentName: 'alice',
    },
    {
      anonymousToken: 'browser-token-1',
      answersJson: {
        answers: [{ answer: 'Rome', correct: false, itemId: 'q-1' }],
        templateType: 'quiz',
      },
      completedAt: new Date('2026-01-03T10:00:00.000Z'),
      id: 'attempt-3',
      resultJson: {
        accuracy: 0,
        completedItemCount: 1,
        correctItemCount: 0,
        earnedPoints: 0,
        totalPoints: 2,
      },
      score: 0,
      studentName: null,
    },
  ],
  runtimeItems: resultRuntimeItems,
});

assert.equal(resultAnalysis.perItem[0]?.correctCount, 2);
assert.equal(resultAnalysis.perItem[0]?.submittedCount, 3);
assert.equal(resultAnalysis.perItem[0]?.correctRate, 67);
assert.deepEqual(resultAnalysis.perItem[0]?.acceptedAnswers, [
  'Paris',
  'Paris, France',
]);
assert.equal(
  resultAnalysis.attempts[0]?.answers[0]?.explanation,
  'Paris is the capital of France.'
);
assert.equal(resultAnalysis.attempts[0]?.studentLabel, 'Alice');
assert.equal(resultAnalysis.attempts[1]?.studentLabel, 'Alice');
assert.equal(resultAnalysis.attempts[2]?.studentLabel, 'Anonymous student 1');
assert.equal(resultAnalysis.students[0]?.studentLabel, 'Anonymous student 1');
assert.equal(resultAnalysis.students[0]?.latestAccuracy, 0);
assert.equal(resultAnalysis.students[1]?.studentKey, 'name:alice');
assert.equal(resultAnalysis.students[1]?.attempts, 2);
assert.equal(resultAnalysis.students[1]?.averageAccuracy, 75);
assert.equal(resultAnalysis.students[1]?.bestAccuracy, 100);
assert.equal(resultAnalysis.students[1]?.latestAccuracy, 100);
assert.equal(resultAnalysis.students[1]?.needsReviewCount, 0);
assert.equal(resultAnalysis.needsReview[0]?.itemId, 'pair-1');
assert.equal(resultAnalysis.needsReview[0]?.correctRate, 50);

console.log('Domain tests passed.');
