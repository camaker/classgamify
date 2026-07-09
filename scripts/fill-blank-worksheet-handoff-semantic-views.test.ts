import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import type {
  PublicAttemptReviewItem,
  PublicRuntimeItem,
} from '@/assignments/public';
import {
  buildFillBlankWorksheetHandoffView,
  FILL_BLANK_WORKSHEET_HANDOFF_ITEM_IDS,
  type FillBlankWorksheetHandoffItemId,
  type FillBlankWorksheetHandoffView,
} from '@/assignments/fill-blank-worksheet-handoff';
import { buildFillBlankWorksheetView } from '@/assignments/student-runner-view';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER_TEXT = 'SECRET_FILL_BLANK_ANSWER';
const SECRET_CHOICE_TEXT = 'SECRET_FILL_BLANK_CHOICE';
const SECRET_EXPLANATION_TEXT = 'SECRET_FILL_BLANK_EXPLANATION';
const SECRET_PROMPT_TEXT = 'SECRET_FILL_BLANK_PROMPT ___';
const SECRET_RUNTIME_ITEM_ID = 'secret-fill-blank-item-id';
const SECRET_RUNTIME_ITEM_ID_TWO = 'secret-fill-blank-item-id-two';
const SECRET_SOURCE_MATERIAL = 'secret-fill-blank-source.pdf';
const SECRET_STUDENT_NAME = 'Private Fill Blank Student';
const SECRET_TOKEN = 'raw-fill-blank-token';

test('fill-blank worksheet handoff exposes 20 safe worksheet slices', () => {
  const handoffView = buildFillBlankWorksheetHandoffView({
    revealAnswer: true,
    runnerView: buildFillBlankRunnerView({
      answers: {
        [SECRET_RUNTIME_ITEM_ID]: SECRET_ANSWER_TEXT,
        orphan: SECRET_ANSWER_TEXT,
      },
      items: buildFillBlankItems(),
      revealAnswer: true,
      reviewItems: buildFillBlankReviewItems(),
    }),
  });
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...FILL_BLANK_WORKSHEET_HANDOFF_ITEM_IDS]);
  assert.equal(new Set(itemIds).size, 20);
  assert.equal(
    handoffView.itemViews.every(
      (item) =>
        Boolean(item.ariaLabel) &&
        Boolean(item.description) &&
        Boolean(item.label) &&
        Boolean(item.value)
    ),
    true
  );
  assert.deepEqual(handoffView.privacy, {
    exposesAnswerKeys: false,
    exposesAnswerText: false,
    exposesRuntimeItemIds: false,
    exposesRuntimePromptText: false,
    exposesSourceMaterialMetadata: false,
    exposesStudentIdentity: false,
    exposesWordBankText: false,
    itemIds,
    runnerSurface: 'fill-blank',
    scope: 'fill-blank-worksheet',
    templateType: 'fill-blank',
    usesSharedSubmissionContract: true,
  });

  assert.equal(getHandoffValue(handoffView, 'template-type'), 'fill-blank');
  assert.equal(getHandoffValue(handoffView, 'runner-surface'), 'fill-blank');
  assert.equal(getHandoffValue(handoffView, 'worksheet-state'), 'Active');
  assert.equal(getHandoffValue(handoffView, 'runtime-item-count'), '2 items');
  assert.equal(getHandoffValue(handoffView, 'inline-blank-count'), '1 blank');
  assert.equal(
    getHandoffValue(handoffView, 'standalone-prompt-count'),
    '1 standalone prompt'
  );
  assert.equal(
    getHandoffValue(handoffView, 'word-bank-row-count'),
    '1 word bank row'
  );
  assert.equal(getHandoffValue(handoffView, 'answered-item-count'), '1');
  assert.equal(getHandoffValue(handoffView, 'unanswered-item-count'), '1');
  assert.equal(
    getHandoffValue(handoffView, 'completion-progress'),
    '1 of 2 completed'
  );
  assert.equal(
    getHandoffValue(handoffView, 'input-placement-policy'),
    'Inline when a blank marker exists'
  );
  assert.equal(getHandoffValue(handoffView, 'answer-input-state'), 'Ready');
  assert.equal(
    getHandoffValue(handoffView, 'disabled-action-policy'),
    'Actions enabled'
  );
  assert.equal(
    getHandoffValue(handoffView, 'review-feedback-state'),
    'Visible'
  );
  assert.equal(getHandoffValue(handoffView, 'review-item-count'), '2');
  assert.equal(
    getHandoffValue(handoffView, 'accepted-answer-boundary'),
    'Post-submit only'
  );
  assert.equal(
    getHandoffValue(handoffView, 'explanation-boundary'),
    'Post-submit only'
  );
  assert.equal(
    getHandoffValue(handoffView, 'public-payload-boundary'),
    'Sanitized runtime'
  );
  assert.equal(
    getHandoffValue(handoffView, 'submission-contract'),
    '{ itemId, answer }'
  );
  assert.equal(
    getHandoffValue(handoffView, 'privacy-guard'),
    'Private data omitted'
  );

  assertNoPrivateFillBlankText(JSON.stringify(handoffView));
});

test('fill-blank worksheet handoff reports locked empty state', () => {
  const handoffView = buildFillBlankWorksheetHandoffView({
    disabled: true,
    runnerView: buildFillBlankRunnerView({
      items: [],
    }),
  });

  assert.equal(getHandoffValue(handoffView, 'worksheet-state'), 'Empty');
  assert.equal(getHandoffValue(handoffView, 'runtime-item-count'), '0 items');
  assert.equal(getHandoffValue(handoffView, 'inline-blank-count'), '0 blanks');
  assert.equal(
    getHandoffValue(handoffView, 'answer-input-state'),
    'Unavailable'
  );
  assert.equal(
    getHandoffValue(handoffView, 'disabled-action-policy'),
    'Actions locked'
  );
  assert.equal(getHandoffValue(handoffView, 'review-feedback-state'), 'Hidden');
  assert.equal(getHandoffValue(handoffView, 'review-item-count'), '0');

  assertNoPrivateFillBlankText(JSON.stringify(handoffView));
});

test('fill-blank worksheet handoff localizes Chinese worksheet boundaries', () => {
  try {
    overwriteGetLocale(() => 'zh');

    const handoffView = buildFillBlankWorksheetHandoffView({
      revealAnswer: true,
      runnerView: buildFillBlankRunnerView({
        answers: {
          [SECRET_RUNTIME_ITEM_ID]: SECRET_ANSWER_TEXT,
        },
        items: buildFillBlankItems(),
        revealAnswer: true,
        reviewItems: buildFillBlankReviewItems(),
      }),
    });

    assert.equal(handoffView.title, '填空练习纸交接');
    assert.match(handoffView.description, /20 切片/);
    assert.equal(getHandoffValue(handoffView, 'worksheet-state'), '已启用');
    assert.equal(
      getHandoffValue(handoffView, 'runtime-item-count'),
      '2 个项目'
    );
    assert.equal(
      getHandoffValue(handoffView, 'inline-blank-count'),
      '1 个空格'
    );
    assert.equal(
      getHandoffValue(handoffView, 'standalone-prompt-count'),
      '1 个独立提示'
    );
    assert.equal(
      getHandoffValue(handoffView, 'word-bank-row-count'),
      '1 行词库'
    );
    assert.equal(
      getHandoffValue(handoffView, 'completion-progress'),
      '1/2 已完成'
    );
    assert.equal(
      getHandoffValue(handoffView, 'input-placement-policy'),
      '存在空格标记时使用行内输入'
    );
    assert.equal(
      getHandoffValue(handoffView, 'public-payload-boundary'),
      '清理后的运行内容'
    );
    assert.equal(
      getHandoffValue(handoffView, 'privacy-guard'),
      '已省略私有数据'
    );

    assertNoPrivateFillBlankText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

test('fill-blank worksheet attaches the hidden handoff to the component', () => {
  const source = readFileSync(
    'src/components/activities/fill-blank-worksheet.tsx',
    'utf8'
  );

  assert.match(
    source,
    /buildFillBlankWorksheetHandoffView[\s\S]*disabled,[\s\S]*revealAnswer,[\s\S]*runnerView,/
  );
  assert.match(source, /data-handoff="fill-blank-worksheet"/);
  assert.match(
    source,
    /FillBlankWorksheetHandoffItemView[\s\S]*FillBlankWorksheetHandoffView[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-labelledby=\{titleId\}[\s\S]*data-handoff="fill-blank-worksheet"[\s\S]*data-handoff-scope=\{view\.privacy\.scope\}[\s\S]*view\.itemViews\.map\(\(item\) =>[\s\S]*FillBlankWorksheetHandoffItem[\s\S]*function FillBlankWorksheetHandoffItem[\s\S]*item: FillBlankWorksheetHandoffItemView[\s\S]*const labelId = `fill-blank-worksheet-handoff-\$\{item\.id\}-label`[\s\S]*const valueId = `fill-blank-worksheet-handoff-\$\{item\.id\}-value`[\s\S]*const descriptionId = `fill-blank-worksheet-handoff-\$\{item\.id\}-description`[\s\S]*data-handoff-item=\{item\.id\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{item\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/
  );
});

test('fill-blank worksheet focused gate is documented', () => {
  const catalogSource = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');
  const normalizedCatalog = catalogSource.replace(/\s+/g, ' ');

  assert.match(
    catalogSource,
    /pnpm exec tsx --test scripts\/fill-blank-worksheet-handoff-semantic-views\.test\.ts/
  );
  for (const boundary of [
    'worksheet state',
    'inline blank and standalone prompt counts',
    'word-bank row counts',
    'answer-input state',
    'review feedback',
    'fill-blank worksheet privacy-scope boundaries',
    'prompt/answer/word-bank/student/source-material guards',
    'hidden fill-blank-worksheet handoff',
  ]) {
    assert.match(normalizedCatalog, new RegExp(boundary));
  }
});

function buildFillBlankRunnerView({
  answers = {},
  items = buildFillBlankItems(),
  revealAnswer = false,
  reviewItems,
}: {
  answers?: Record<string, string>;
  items?: PublicRuntimeItem[];
  revealAnswer?: boolean;
  reviewItems?: PublicAttemptReviewItem[];
}) {
  return buildFillBlankWorksheetView({
    answers,
    items,
    progressVerb: 'completed',
    revealAnswer,
    reviewItems,
    wordBankLabel: 'Word bank',
  });
}

function buildFillBlankItems(): PublicRuntimeItem[] {
  return [
    {
      choices: [SECRET_CHOICE_TEXT, 'SAFE_FILL_BLANK_CHOICE'],
      id: SECRET_RUNTIME_ITEM_ID,
      kind: 'question',
      prompt: SECRET_PROMPT_TEXT,
    },
    {
      id: SECRET_RUNTIME_ITEM_ID_TWO,
      kind: 'question',
      prompt: 'SAFE_FILL_BLANK_STANDALONE_PROMPT',
    },
  ];
}

function buildFillBlankReviewItems(): PublicAttemptReviewItem[] {
  return [
    {
      acceptedAnswers: [SECRET_ANSWER_TEXT],
      correct: true,
      correctAnswer: SECRET_ANSWER_TEXT,
      explanation: SECRET_EXPLANATION_TEXT,
      itemId: SECRET_RUNTIME_ITEM_ID,
      submitted: true,
      submittedAnswer: SECRET_ANSWER_TEXT,
    },
    {
      acceptedAnswers: [SECRET_ANSWER_TEXT],
      correct: false,
      correctAnswer: SECRET_ANSWER_TEXT,
      explanation: SECRET_EXPLANATION_TEXT,
      itemId: SECRET_RUNTIME_ITEM_ID_TWO,
      submitted: false,
      submittedAnswer: '',
    },
  ];
}

function getHandoffValue(
  view: FillBlankWorksheetHandoffView,
  id: FillBlankWorksheetHandoffItemId
) {
  const item = view.itemViews.find((itemView) => itemView.id === id);
  assert.ok(item, `Missing fill-blank worksheet handoff item ${id}`);
  return item.value;
}

function assertNoPrivateFillBlankText(serializedView: string) {
  for (const privateValue of [
    SECRET_ANSWER_TEXT,
    SECRET_CHOICE_TEXT,
    SECRET_EXPLANATION_TEXT,
    SECRET_PROMPT_TEXT,
    SECRET_RUNTIME_ITEM_ID,
    SECRET_RUNTIME_ITEM_ID_TWO,
    SECRET_SOURCE_MATERIAL,
    SECRET_STUDENT_NAME,
    SECRET_TOKEN,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Fill-blank worksheet handoff leaked private text: ${privateValue}`
    );
  }
}
