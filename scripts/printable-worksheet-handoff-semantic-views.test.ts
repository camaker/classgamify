import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import type { RuntimeItem } from '@/activities/runtime';
import {
  buildPrintableAssignmentSearch,
  buildPrintableAssignmentWorksheet,
  getPrintableWorksheetResponsePolicy,
  parsePrintableAssignmentSearch,
  summarizePrintableAssignmentWorksheet,
  type PrintableAssignmentWorksheet,
} from '@/assignments/printable-worksheet';
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

const API_ASSIGNMENTS_SOURCE = readFileSync('src/api/assignments.ts', 'utf8');
const HOOK_SOURCE = readFileSync('src/hooks/use-assignments.ts', 'utf8');
const PRINTABLE_WORKSHEET_SOURCE = readFileSync(
  'src/assignments/printable-worksheet.ts',
  'utf8'
);
const PRINTABLE_WORKSHEET_VIEW_SOURCE = readFileSync(
  'src/assignments/printable-worksheet-view.ts',
  'utf8'
);
const ROUTE_SOURCE = readFileSync(
  'src/routes/print/assignments/$assignmentId.tsx',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');
const TOOLBAR_SOURCE = readFileSync(
  'src/components/assignments/printable-worksheet-toolbar.tsx',
  'utf8'
);

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
    scope: 'teacher-printable-worksheet',
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
    '9 fields'
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

test('printable worksheet builder preserves snapshot, delivery, and answer-key contracts', () => {
  const hiddenWorksheet = buildSourceWorksheet({ includeAnswerKey: false });
  const answerKeyWorksheet = buildSourceWorksheet({ includeAnswerKey: true });
  const hiddenPageView = buildPrintableWorksheetPageViewModel({
    answerKey: false,
    assignmentId: 'assignment-1',
    worksheet: hiddenWorksheet,
  });
  const answerKeyPageView = buildPrintableWorksheetPageViewModel({
    answerKey: true,
    assignmentId: 'assignment-1',
    worksheet: answerKeyWorksheet,
  });
  const answerKeySummary = summarizePrintableAssignmentWorksheet(
    answerKeyWorksheet,
    {
      includeAnswerKey: true,
    }
  );

  assert.equal(hiddenWorksheet.activityTitle, 'Frozen Snapshot Title');
  assert.equal(hiddenWorksheet.activityDescription, 'Frozen snapshot copy.');
  assert.deepEqual(
    hiddenPageView.assignmentFieldViews.find(
      (fieldView) => fieldView.id === 'activity-description'
    ),
    {
      ariaLabel:
        'Activity description: Frozen snapshot copy.. Printed context copied from the frozen assignment snapshot.',
      description:
        'Printed context copied from the frozen assignment snapshot.',
      id: 'activity-description',
      kind: 'text',
      label: 'Activity description',
      value: 'Frozen snapshot copy.',
    }
  );
  assert.equal(hiddenWorksheet.templateType, 'quiz');
  assert.equal(hiddenWorksheet.shareSlug, 'paper-review');
  assert.equal(hiddenWorksheet.sharePath, '/play/paper-review');
  assert.equal(hiddenWorksheet.assignmentTitle, 'Paper Review Assignment');
  assert.equal(hiddenWorksheet.instructions, 'Bring a pencil.');
  assert.equal(hiddenWorksheet.answerKey, undefined);
  assert.equal(hiddenWorksheet.includeAnswerKey, false);
  assert.equal(hiddenWorksheet.items.length, 2);
  assert.deepEqual(
    hiddenWorksheet.items.map((item) => item.sequenceNumber),
    [1, 2]
  );
  assert.deepEqual(
    hiddenWorksheet.items.map((item) => item.responseMode),
    ['choice', 'choice']
  );
  assert.deepEqual(
    hiddenWorksheet.items.map((item) => item.choicePresentation),
    ['choice-list', 'choice-list']
  );
  assert.deepEqual(hiddenWorksheet.items[0]?.choices, [
    SECRET_ANSWER_TEXT,
    SECRET_CHOICE_TEXT,
  ]);
  assert.equal(answerKeyWorksheet.includeAnswerKey, true);
  assert.equal(answerKeyWorksheet.answerKey?.length, 2);
  assert.deepEqual(answerKeyWorksheet.answerKey?.[0]?.acceptedAnswers, [
    SECRET_ANSWER_TEXT,
    'Backup answer',
    'Alt answer',
  ]);
  assert.equal(answerKeyWorksheet.answerKey?.[0]?.answer, SECRET_ANSWER_TEXT);
  assert.equal(
    answerKeyWorksheet.answerKey?.[0]?.explanation,
    'Teacher-only explanation text.'
  );
  assert.equal(answerKeySummary.itemCount, 2);
  assert.equal(answerKeySummary.answerKeyItemCount, 2);
  assert.equal(answerKeySummary.choiceBankItemCount, 2);
  assert.equal(answerKeySummary.showAnswerKey, true);
  assert.equal(hiddenPageView.showAnswerKey, false);
  assert.equal(hiddenPageView.answerKeyItemViews.length, 0);
  assert.equal(hiddenPageView.answerKeyView.accessView.state, 'hidden');
  assert.equal(answerKeyPageView.showAnswerKey, true);
  assert.equal(answerKeyPageView.answerKeyItemViews.length, 2);
  assert.equal(answerKeyPageView.answerKeyView.accessView.state, 'included');
  assert.equal(
    getHandoffItemValue(answerKeyPageView, 'answer-key-items'),
    '2 items'
  );
  assert.equal(
    getHandoffItemValue(answerKeyPageView, 'answer-key-details'),
    '4 items'
  );
  assertNoPrivatePrintableText(JSON.stringify(hiddenPageView.handoffView));
  assertNoPrivatePrintableText(JSON.stringify(answerKeyPageView.handoffView));
});

test('printable worksheet source contract keeps print route teacher-scoped and snapshot-backed', () => {
  assert.deepEqual(parsePrintableAssignmentSearch({ answerKey: true }), {
    answerKey: true,
  });
  assert.deepEqual(parsePrintableAssignmentSearch({ answerKey: '1' }), {
    answerKey: true,
  });
  assert.deepEqual(parsePrintableAssignmentSearch({ answerKey: 'false' }), {
    answerKey: undefined,
  });
  assert.deepEqual(buildPrintableAssignmentSearch({ answerKey: true }), {
    answerKey: true,
  });
  assert.deepEqual(buildPrintableAssignmentSearch({ answerKey: false }), {
    answerKey: undefined,
  });
  assert.deepEqual(getPrintableWorksheetResponsePolicy('quiz'), {
    answerSpaceLines: 1,
    choicePresentation: 'choice-list',
    itemLayout: 'multiple-choice',
    responseMode: 'choice',
  });
  assert.deepEqual(getPrintableWorksheetResponsePolicy('fill-blank'), {
    answerSpaceLines: 2,
    choicePresentation: 'none',
    itemLayout: 'short-answer',
    responseMode: 'short-answer',
  });
  assert.deepEqual(getPrintableWorksheetResponsePolicy('group-sort'), {
    answerSpaceLines: 1,
    choicePresentation: 'group-bank',
    itemLayout: 'classification',
    responseMode: 'group-choice',
  });
  assert.deepEqual(getPrintableWorksheetResponsePolicy('line-match'), {
    answerSpaceLines: 1,
    choicePresentation: 'answer-bank',
    itemLayout: 'matching',
    responseMode: 'line-match',
  });
  assert.deepEqual(getPrintableWorksheetResponsePolicy('matching-pairs'), {
    answerSpaceLines: 1,
    choicePresentation: 'answer-bank',
    itemLayout: 'matching',
    responseMode: 'matching-pairs',
  });
  assert.deepEqual(getPrintableWorksheetResponsePolicy('open-box'), {
    answerSpaceLines: 2,
    choicePresentation: 'none',
    itemLayout: 'short-answer',
    responseMode: 'short-answer',
  });

  assert.match(
    PRINTABLE_WORKSHEET_SOURCE,
    /resolveAssignmentSettings\(assignment\.settingsJson\)[\s\S]*normalizeAssignmentShareSlug\(assignment\.shareSlug\)[\s\S]*resolveAssignmentSnapshotSource\(\{[\s\S]*activity,[\s\S]*snapshot,[\s\S]*\}\)[\s\S]*buildPrintableAssignmentDeliveryView\(\{[\s\S]*expiresAt: assignment\.expiresAt,[\s\S]*settings,[\s\S]*\}\)[\s\S]*orderAssignmentRuntimeItems\(\{[\s\S]*items: runtimeItems,[\s\S]*shareSlug,[\s\S]*shuffleItems: settings\.shuffleItems/,
    'Printable worksheets should resolve delivery settings, share paths, frozen snapshot source, and assignment ordering through shared helpers.'
  );
  assert.match(
    PRINTABLE_WORKSHEET_SOURCE,
    /answerKey: includeAnswerKey[\s\S]*orderedRuntimeItems\.map\(toPrintableWorksheetAnswerKeyItem\)[\s\S]*items: orderedRuntimeItems\.map\(\(item, index\) =>[\s\S]*toPrintableWorksheetItem/,
    'Printable worksheets should derive both student items and optional teacher answer keys from the same frozen ordered runtime items.'
  );
  assert.match(
    PRINTABLE_WORKSHEET_SOURCE,
    /function toPrintableWorksheetAnswerKeyItem[\s\S]*getRuntimeDisplayAcceptedAnswers\(item\.answer\)[\s\S]*normalizeOptionalRuntimeDisplayText\(item\.explanation\)[\s\S]*getPrintableWorksheetSequenceNumber\(index\)/,
    'Printable answer keys should reuse accepted-answer parsing, explanation normalization, and shared sequence numbering.'
  );
  assert.match(
    PRINTABLE_WORKSHEET_VIEW_SOURCE,
    /const answerKeyAccessView = buildPrintableWorksheetAnswerKeyAccessView[\s\S]*buildPrintableWorksheetHeaderView\(worksheet, \{[\s\S]*answerKeyAccessView,[\s\S]*includeAnswerKey: answerKeyView\.show,[\s\S]*\}\)[\s\S]*buildPrintableWorksheetControlView\(\{[\s\S]*answerKeyAccessView,[\s\S]*buildPrintableWorksheetPreparationView\(summary, \{[\s\S]*answerKeyAccessView/,
    'Printable page state should reuse one answer-key access view across header, toolbar, and preparation summary.'
  );
  assert.match(
    API_ASSIGNMENTS_SOURCE,
    /export const getPrintableAssignmentWorksheet = createServerFn\(\{[\s\S]*method: 'GET'[\s\S]*\.middleware\(\[authApiMiddleware\]\)[\s\S]*buildAssignmentDetailOwnerWhere\(\{[\s\S]*assignmentId: data\.assignmentId,[\s\S]*userId,[\s\S]*\}\)[\s\S]*resolveAssignmentRuntimeSource\(row\)[\s\S]*buildPrintableAssignmentWorksheet\(\{[\s\S]*includeAnswerKey: data\.includeAnswerKey,[\s\S]*runtimeItems: resolvedSource\.runtimeItems,[\s\S]*snapshot: row\.snapshot/,
    'Printable worksheet API should stay authenticated, owner-scoped, snapshot-backed, and explicit about answer-key inclusion.'
  );
  assert.match(
    HOOK_SOURCE,
    /usePrintableAssignmentWorksheet[\s\S]*getPrintableAssignmentWorksheet\(\{[\s\S]*data: \{ assignmentId, includeAnswerKey \}[\s\S]*queryKey: \[[\s\S]*'printable'[\s\S]*\{ includeAnswerKey \}/,
    'Printable worksheet query should cache answer-key and no-key variants separately.'
  );
  assert.match(
    ROUTE_SOURCE,
    /validateSearch: parsePrintableAssignmentSearch[\s\S]*robots: 'noindex, nofollow'[\s\S]*middleware: \[authRouteMiddleware\][\s\S]*usePrintableAssignmentWorksheet\(\{[\s\S]*assignmentId,[\s\S]*includeAnswerKey: answerKey,[\s\S]*\}\)[\s\S]*buildPrintableWorksheetRouteState[\s\S]*document\.body\.dataset\.printMode = PRINTABLE_WORKSHEET_BODY_PRINT_MODE[\s\S]*search: buildPrintableAssignmentSearch\(\{ answerKey: nextAnswerKey \}\)[\s\S]*<PrintableWorksheetHandoff view=\{pageView\.handoffView\} \/>/,
    'Printable route should stay teacher-only, noindex, print-mode scoped, URL-toggle backed, and handoff-rendered.'
  );
  assert.match(
    TOOLBAR_SOURCE,
    /Switch[\s\S]*id="printable-answer-key"[\s\S]*checked=\{toggleView\.value\}[\s\S]*aria-describedby=\{`\$\{answerKeyDescriptionId\} \$\{answerKeyStatusDescriptionId\}`\}[\s\S]*onCheckedChange=\{onAnswerKeyChange\}[\s\S]*Button[\s\S]*aria-describedby=\{printDescriptionId\}[\s\S]*onClick=\{onPrint\}/,
    'Printable toolbar should keep the answer-key switch and print action tied to prepared accessible descriptions.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /scripts\/printable-worksheet-handoff-semantic-views\.test\.ts/,
    'The E2E catalog should list the printable worksheet fast gate.'
  );
});

test('printable worksheet handoff renders stable DOM item relationships', () => {
  const source = readFileSync(
    'src/components/assignments/printable-worksheet-handoff.tsx',
    'utf8'
  );

  assert.match(
    source,
    /PrintableWorksheetHandoffItemView[\s\S]*PrintableWorksheetHandoffView[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-labelledby=\{titleId\}[\s\S]*data-handoff="printable-worksheet"[\s\S]*data-handoff-scope=\{view\.privacy\.scope\}[\s\S]*view\.itemViews\.map[\s\S]*PrintableWorksheetHandoffItem[\s\S]*function PrintableWorksheetHandoffItem[\s\S]*const labelId = `printable-worksheet-handoff-\$\{itemView\.id\}-label`[\s\S]*const valueId = `printable-worksheet-handoff-\$\{itemView\.id\}-value`[\s\S]*const descriptionId = `printable-worksheet-handoff-\$\{itemView\.id\}-description`[\s\S]*data-handoff-item=\{itemView\.id\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{itemView\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/,
    'Printable worksheet handoff should render each paper handoff item with privacy scope plus stable label, value, and description relationships.'
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

function buildSourceWorksheet({
  includeAnswerKey,
}: {
  includeAnswerKey: boolean;
}) {
  return buildPrintableAssignmentWorksheet({
    activity: {
      description: 'Original activity description.',
      templateType: 'fill-blank',
      title: 'Original Activity Title',
    },
    assignment: {
      expiresAt: '2026-07-15T10:00:00.000Z',
      settingsJson: {
        collectStudentName: true,
        instructions: 'Bring a pencil.',
        maxAttempts: null,
        showCorrectAnswers: true,
        shuffleItems: false,
        timeLimitSeconds: 600,
      },
      shareSlug: ' paper-review ',
      title: ' Paper Review Assignment ',
    },
    includeAnswerKey,
    runtimeItems: SOURCE_RUNTIME_ITEMS,
    snapshot: {
      activityDescription: 'Frozen snapshot copy.',
      activityTitle: 'Frozen Snapshot Title',
      templateType: 'quiz',
    },
  });
}

const SOURCE_RUNTIME_ITEMS: RuntimeItem[] = [
  {
    answer: `${SECRET_ANSWER_TEXT} / Backup answer; Alt answer`,
    choices: [SECRET_ANSWER_TEXT, SECRET_CHOICE_TEXT],
    explanation: 'Teacher-only explanation text.',
    id: 'question-1',
    kind: 'question',
    prompt: SECRET_PROMPT_TEXT,
  },
  {
    answer: 'Second answer',
    choices: ['Second answer', 'Second choice'],
    id: 'question-2',
    kind: 'question',
    prompt: 'Second prompt',
  },
];

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
