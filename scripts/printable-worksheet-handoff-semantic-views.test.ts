import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import type { PrintableAssignmentWorksheet } from '@/assignments/printable-worksheet';
import {
  PRINTABLE_WORKSHEET_HANDOFF_ITEM_IDS,
  buildPrintableWorksheetPageViewModel,
  type PrintableWorksheetHandoffItemId,
} from '@/assignments/printable-worksheet-view';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER_TEXT = 'SECRET_ANSWER_TEXT';
const SECRET_CHOICE_TEXT = 'SECRET_CHOICE_TEXT';
const SECRET_PROMPT_TEXT = 'SECRET_PROMPT_TEXT';

test('printable worksheet handoff exposes 30 paper handoff slices safely', () => {
  const pageView = buildPrintableWorksheetPageViewModel({
    answerKey: false,
    assignmentId: 'assignment-1',
    worksheet: buildWorksheet(),
  });

  assert.deepEqual(
    pageView.handoffView.itemViews.map((item) => item.id),
    [...PRINTABLE_WORKSHEET_HANDOFF_ITEM_IDS]
  );
  assert.equal(pageView.handoffView.itemViews.length, 30);
  assert.deepEqual(pageView.handoffView.privacy, {
    exposesAnswerKeyText: false,
    exposesChoiceText: false,
    exposesPromptText: false,
    exposesStudentResponseText: false,
    itemIds: [...PRINTABLE_WORKSHEET_HANDOFF_ITEM_IDS],
  });
  assert.equal(
    getHandoffItemValue(pageView, 'answer-key'),
    'Hidden by default'
  );
  assert.equal(
    getHandoffItemValue(pageView, 'answer-key-access'),
    'Hidden by default'
  );
  assert.equal(
    getHandoffItemValue(pageView, 'answer-key-items'),
    'Hidden by default'
  );
  assert.equal(
    getHandoffItemValue(pageView, 'handout-overview'),
    'Ready to print'
  );
  assert.equal(
    getHandoffItemValue(pageView, 'preparation-metric-count'),
    '3 checks'
  );
  assert.equal(
    getHandoffItemValue(pageView, 'assignment-field-count'),
    '8 fields'
  );
  assert.equal(getHandoffItemValue(pageView, 'printable-items'), '1 item');
  assert.equal(getHandoffItemValue(pageView, 'choice-bank-coverage'), '1 item');
  assert.equal(
    getHandoffItemValue(pageView, 'choice-bank-choice-count'),
    '2 choices'
  );
  assert.equal(
    getHandoffItemValue(pageView, 'writing-area-coverage'),
    '1 answer line'
  );
  assert.equal(
    getHandoffItemValue(pageView, 'answer-line-count'),
    '1 answer line'
  );
  assert.equal(
    getHandoffItemValue(pageView, 'answer-key-toggle-boundary'),
    'Teacher toggle'
  );
  assert.equal(
    getHandoffItemValue(pageView, 'print-route-boundary'),
    'Teacher print route'
  );
  assert.equal(
    getHandoffItemValue(pageView, 'public-runner-boundary'),
    'Runner unchanged'
  );
  assert.equal(
    getHandoffItemValue(pageView, 'privacy-guard'),
    'Private data omitted'
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
  assert.equal(
    getHandoffItemValue(pageView, 'answer-key-access'),
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
    getHandoffItemValue(pageView, 'answer-key-access'),
    'No answer key available'
  );
  assert.equal(
    getHandoffItemValue(pageView, 'answer-key-details'),
    'No answer key available'
  );
});

test('printable worksheet handoff renders stable DOM item relationships', () => {
  const source = readFileSync(
    'src/components/assignments/printable-worksheet-handoff.tsx',
    'utf8'
  );

  assert.match(
    source,
    /PrintableWorksheetHandoffItemView[\s\S]*PrintableWorksheetHandoffView[\s\S]*data-handoff="printable-worksheet"[\s\S]*view\.itemViews\.map[\s\S]*PrintableWorksheetHandoffItem[\s\S]*function PrintableWorksheetHandoffItem[\s\S]*const labelId = `printable-worksheet-handoff-\$\{itemView\.id\}-label`[\s\S]*const valueId = `printable-worksheet-handoff-\$\{itemView\.id\}-value`[\s\S]*const descriptionId = `printable-worksheet-handoff-\$\{itemView\.id\}-description`[\s\S]*data-handoff-item=\{itemView\.id\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{itemView\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/,
    'Printable worksheet handoff should render each paper handoff item with stable label, value, and description relationships.'
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
