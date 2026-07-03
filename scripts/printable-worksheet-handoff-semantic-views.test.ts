import assert from 'node:assert/strict';
import test from 'node:test';
import type { PrintableAssignmentWorksheet } from '@/assignments/printable-worksheet';
import {
  buildPrintableWorksheetPageViewModel,
  type PrintableWorksheetHandoffItemId,
} from '@/assignments/printable-worksheet-view';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER_TEXT = 'SECRET_ANSWER_TEXT';
const SECRET_CHOICE_TEXT = 'SECRET_CHOICE_TEXT';
const SECRET_PROMPT_TEXT = 'SECRET_PROMPT_TEXT';

const EXPECTED_HANDOFF_ITEM_IDS = [
  'student-fields',
  'response-plan',
  'answer-key',
  'printable-items',
  'response-modes',
  'choice-bank-coverage',
  'writing-area-coverage',
  'item-response-help',
  'student-name-field',
  'date-field',
  'score-field',
  'share-path',
  'template',
  'snapshot-source',
  'instructions',
  'delivery-policy',
  'answer-key-items',
  'answer-key-details',
  'results-return',
  'print-action',
] satisfies PrintableWorksheetHandoffItemId[];

test('printable worksheet handoff exposes 20 paper handoff slices safely', () => {
  const pageView = buildPrintableWorksheetPageViewModel({
    answerKey: false,
    assignmentId: 'assignment-1',
    worksheet: buildWorksheet(),
  });

  assert.deepEqual(
    pageView.handoffView.itemViews.map((item) => item.id),
    EXPECTED_HANDOFF_ITEM_IDS
  );
  assert.deepEqual(pageView.handoffView.privacy, {
    exposesAnswerKeyText: false,
    exposesChoiceText: false,
    exposesPromptText: false,
    exposesStudentResponseText: false,
    itemIds: EXPECTED_HANDOFF_ITEM_IDS,
  });
  assert.equal(
    getHandoffItemValue(pageView, 'answer-key'),
    'Hidden by default'
  );
  assert.equal(
    getHandoffItemValue(pageView, 'answer-key-items'),
    'Hidden by default'
  );
  assert.equal(getHandoffItemValue(pageView, 'printable-items'), '1 item');
  assert.equal(getHandoffItemValue(pageView, 'choice-bank-coverage'), '1 item');
  assert.equal(
    getHandoffItemValue(pageView, 'writing-area-coverage'),
    '1 answer line'
  );
  assert.equal(
    pageView.handoffView.itemViews.every((item) => Boolean(item.ariaLabel)),
    true
  );
  assertNoPrivatePrintableText(JSON.stringify(pageView.handoffView));
});

test('printable worksheet handoff summarizes included answer keys without key text', () => {
  const pageView = buildPrintableWorksheetPageViewModel({
    answerKey: true,
    assignmentId: 'assignment-1',
    worksheet: buildWorksheet(),
  });

  assert.equal(pageView.showAnswerKey, true);
  assert.equal(pageView.answerKeyView.accessView.state, 'included');
  assert.equal(
    getHandoffItemValue(pageView, 'answer-key'),
    'Teacher-only key included'
  );
  assert.equal(getHandoffItemValue(pageView, 'answer-key-items'), '1 item');
  assert.equal(getHandoffItemValue(pageView, 'answer-key-details'), '3 items');
  assertNoPrivatePrintableText(JSON.stringify(pageView.handoffView));
});

test('printable worksheet handoff keeps unavailable answer keys explicit', () => {
  const pageView = buildPrintableWorksheetPageViewModel({
    answerKey: true,
    assignmentId: 'assignment-1',
    worksheet: {
      ...buildWorksheet(),
      answerKey: [],
    },
  });

  assert.equal(pageView.showAnswerKey, false);
  assert.equal(pageView.answerKeyView.accessView.state, 'unavailable');
  assert.equal(
    getHandoffItemValue(pageView, 'answer-key-items'),
    'No answer key available'
  );
  assert.equal(
    getHandoffItemValue(pageView, 'answer-key-details'),
    'No answer key available'
  );
});

function buildWorksheet(): PrintableAssignmentWorksheet {
  return {
    activityDescription: 'Practice capital cities.',
    activityTitle: 'Capital city check',
    answerKey: [
      {
        acceptedAnswers: [SECRET_ANSWER_TEXT, 'City of Light'],
        answer: SECRET_ANSWER_TEXT,
        explanation: 'Teacher-only explanation text.',
        id: 'question-1',
        kind: 'question',
        prompt: SECRET_PROMPT_TEXT,
        sequenceNumber: 1,
      },
    ],
    assignmentTitle: 'Capital city exit ticket',
    deliveryPolicyText: 'Two attempts, no shuffle.',
    deliverySummary: [],
    includeAnswerKey: false,
    instructions: 'Write the best answer.',
    items: [
      {
        answerSpaceLines: 1,
        choicePresentation: 'choice-list',
        choices: [SECRET_CHOICE_TEXT, 'Lyon'],
        id: 'question-1',
        kind: 'question',
        layout: 'multiple-choice',
        prompt: SECRET_PROMPT_TEXT,
        responseMode: 'choice',
        sequenceNumber: 1,
      },
    ],
    sharePath: '/play/capital-review',
    shareSlug: 'capital-review',
    templateType: 'quiz',
  };
}

function getHandoffItemValue(
  pageView: ReturnType<typeof buildPrintableWorksheetPageViewModel>,
  id: PrintableWorksheetHandoffItemId
) {
  const item = pageView.handoffView.itemViews.find(
    (handoffItem) => handoffItem.id === id
  );
  assert.ok(item, `Missing handoff item ${id}`);
  return item.value;
}

function assertNoPrivatePrintableText(serializedView: string) {
  assert.equal(serializedView.includes(SECRET_ANSWER_TEXT), false);
  assert.equal(serializedView.includes(SECRET_CHOICE_TEXT), false);
  assert.equal(serializedView.includes(SECRET_PROMPT_TEXT), false);
}
