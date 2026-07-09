import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import type {
  PublicAttemptReviewItem,
  PublicRuntimeItem,
} from '@/assignments/public';
import {
  buildLineMatchBoardHandoffView,
  LINE_MATCH_BOARD_HANDOFF_ITEM_IDS,
  type LineMatchBoardHandoffItemId,
  type LineMatchBoardHandoffView,
} from '@/assignments/line-match-board-handoff';
import { buildChoicePairingRunnerView } from '@/assignments/student-runner-view';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER_TEXT = 'SECRET_LINE_MATCH_ANSWER';
const SECRET_CHOICE_TEXT = 'SECRET_LINE_MATCH_CHOICE';
const SECRET_EXPLANATION = 'SECRET_LINE_MATCH_EXPLANATION';
const SECRET_PROMPT_TEXT = 'SECRET_LINE_MATCH_PROMPT';
const SECRET_RUNTIME_ITEM_ID = 'secret-line-match-item-id';
const SECRET_RUNTIME_ITEM_ID_TWO = 'secret-line-match-item-id-two';
const SECRET_RUNTIME_ITEM_ID_THREE = 'secret-line-match-item-id-three';
const SECRET_SOURCE_MATERIAL = 'secret-line-match-source.pdf';
const SECRET_STUDENT_NAME = 'Private Line Match Student';
const SECRET_TOKEN = 'raw-line-match-browser-token';

test('line-match board handoff exposes 30 safe connection slices', () => {
  const runnerView = buildChoicePairingRunnerView({
    answers: {
      [SECRET_RUNTIME_ITEM_ID]: SECRET_CHOICE_TEXT,
      orphan: SECRET_ANSWER_TEXT,
    },
    items: buildLineMatchItems(),
    progressVerb: 'connected',
    revealAnswer: true,
    reviewItems: buildLineMatchReviewItems(),
    selectedItemId: SECRET_RUNTIME_ITEM_ID_TWO,
  });
  const handoffView = buildLineMatchBoardHandoffView({
    revealAnswer: true,
    runnerView,
  });
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...LINE_MATCH_BOARD_HANDOFF_ITEM_IDS]);
  assert.equal(new Set(itemIds).size, 30);
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
    exposesChoiceText: false,
    exposesRuntimeItemIds: false,
    exposesRuntimePromptText: false,
    exposesSourceMaterialMetadata: false,
    exposesStudentIdentity: false,
    itemIds,
    runnerSurface: 'line-match',
    scope: 'line-match-connection-board',
    templateType: 'line-match',
    usesSharedSubmissionContract: true,
  });

  assert.equal(getHandoffValue(handoffView, 'template-type'), 'line-match');
  assert.equal(getHandoffValue(handoffView, 'runner-surface'), 'line-match');
  assert.equal(getHandoffValue(handoffView, 'board-state'), 'Active');
  assert.equal(getHandoffValue(handoffView, 'prompt-card-count'), '3 prompts');
  assert.equal(getHandoffValue(handoffView, 'choice-card-count'), '2 choices');
  assert.equal(
    getHandoffValue(handoffView, 'selected-prompt-state'),
    'Selected'
  );
  assert.equal(
    getHandoffValue(handoffView, 'selected-prompt-validity'),
    'Valid'
  );
  assert.equal(
    getHandoffValue(handoffView, 'prompt-selection-toggle'),
    'Available'
  );
  assert.equal(getHandoffValue(handoffView, 'choice-target-state'), 'Ready');
  assert.equal(
    getHandoffValue(handoffView, 'available-choice-count'),
    '2 available choices'
  );
  assert.equal(
    getHandoffValue(handoffView, 'used-choice-count'),
    '1 used choice'
  );
  assert.equal(
    getHandoffValue(handoffView, 'unused-choice-count'),
    '1 unused choice'
  );
  assert.equal(
    getHandoffValue(handoffView, 'exclusive-choice-policy'),
    'One choice per prompt'
  );
  assert.equal(
    getHandoffValue(handoffView, 'reassignment-policy'),
    'Clears previous prompt'
  );
  assert.equal(getHandoffValue(handoffView, 'answered-prompt-count'), '1');
  assert.equal(getHandoffValue(handoffView, 'unanswered-prompt-count'), '2');
  assert.equal(
    getHandoffValue(handoffView, 'completion-progress'),
    '1/3 connected'
  );
  assert.equal(
    getHandoffValue(handoffView, 'disabled-action-policy'),
    'Actions enabled'
  );
  assert.equal(
    getHandoffValue(handoffView, 'review-feedback-state'),
    'Visible'
  );
  assert.equal(getHandoffValue(handoffView, 'review-item-count'), '3');
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
    'Privacy-safe assignment content'
  );
  assert.equal(
    getHandoffValue(handoffView, 'submission-contract'),
    'One answer per prompt'
  );
  assert.equal(
    getHandoffValue(handoffView, 'runtime-item-id-guard'),
    'Item ids hidden'
  );
  assert.equal(
    getHandoffValue(handoffView, 'prompt-text-guard'),
    'Prompts hidden'
  );
  assert.equal(
    getHandoffValue(handoffView, 'choice-text-guard'),
    'Choices hidden'
  );
  assert.equal(
    getHandoffValue(handoffView, 'answer-text-guard'),
    'Answers hidden'
  );
  assert.equal(
    getHandoffValue(handoffView, 'student-source-guard'),
    'Student and sources hidden'
  );
  assert.equal(
    getHandoffValue(handoffView, 'privacy-guard'),
    'Private data omitted'
  );

  assertNoPrivateLineMatchText(JSON.stringify(handoffView));
});

test('line-match board handoff reports locked choice state', () => {
  const handoffView = buildLineMatchBoardHandoffView({
    disabled: true,
    runnerView: buildChoicePairingRunnerView({
      answers: {},
      items: buildLineMatchItems().slice(0, 1),
      progressVerb: 'connected',
      selectedItemId: SECRET_RUNTIME_ITEM_ID,
    }),
  });

  assert.equal(getHandoffValue(handoffView, 'prompt-card-count'), '1 prompt');
  assert.equal(getHandoffValue(handoffView, 'choice-card-count'), '2 choices');
  assert.equal(
    getHandoffValue(handoffView, 'selected-prompt-state'),
    'Selected'
  );
  assert.equal(
    getHandoffValue(handoffView, 'prompt-selection-toggle'),
    'Locked'
  );
  assert.equal(getHandoffValue(handoffView, 'choice-target-state'), 'Locked');
  assert.equal(
    getHandoffValue(handoffView, 'available-choice-count'),
    '0 available choices'
  );
  assert.equal(
    getHandoffValue(handoffView, 'disabled-action-policy'),
    'Actions locked'
  );
  assert.equal(getHandoffValue(handoffView, 'review-feedback-state'), 'Hidden');

  assertNoPrivateLineMatchText(JSON.stringify(handoffView));
});

test('line-match board handoff localizes Chinese connection boundaries', () => {
  try {
    overwriteGetLocale(() => 'zh');

    const handoffView = buildLineMatchBoardHandoffView({
      revealAnswer: true,
      runnerView: buildChoicePairingRunnerView({
        answers: {
          [SECRET_RUNTIME_ITEM_ID]: SECRET_CHOICE_TEXT,
        },
        items: buildLineMatchItems(),
        progressVerb: '已连线',
        revealAnswer: true,
        reviewItems: buildLineMatchReviewItems(),
        selectedItemId: SECRET_RUNTIME_ITEM_ID_TWO,
      }),
    });

    assert.equal(handoffView.title, '连线匹配');
    assert.match(handoffView.description, /双栏连接/);
    assert.equal(getHandoffValue(handoffView, 'board-state'), '已启用');
    assert.equal(getHandoffValue(handoffView, 'prompt-card-count'), '3 个提示');
    assert.equal(getHandoffValue(handoffView, 'choice-card-count'), '2 个选项');
    assert.equal(
      getHandoffValue(handoffView, 'available-choice-count'),
      '2 个可用选项'
    );
    assert.equal(
      getHandoffValue(handoffView, 'completion-progress'),
      '1/3 已连线'
    );
    assert.equal(
      getHandoffValue(handoffView, 'public-payload-boundary'),
      '隐私安全的作业内容'
    );
    assert.equal(
      getHandoffValue(handoffView, 'privacy-guard'),
      '已省略私有数据'
    );

    assertNoPrivateLineMatchText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

test('line-match board attaches the connection-board handoff to the component', () => {
  const source = readFileSync(
    'src/components/activities/line-match-board.tsx',
    'utf8'
  );

  assert.match(
    source,
    /buildLineMatchBoardHandoffView[\s\S]*disabled,[\s\S]*revealAnswer,[\s\S]*runnerView,/
  );
  assert.match(source, /data-handoff="line-match-board"/);
  assert.match(
    source,
    /LineMatchBoardHandoffItemView[\s\S]*LineMatchBoardHandoffView[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-labelledby=\{titleId\}[\s\S]*data-handoff="line-match-board"[\s\S]*data-handoff-scope=\{view\.privacy\.scope\}[\s\S]*view\.itemViews\.map\(\(item\) =>[\s\S]*LineMatchBoardHandoffItem[\s\S]*function LineMatchBoardHandoffItem[\s\S]*const labelId = `line-match-board-handoff-\$\{item\.id\}-label`[\s\S]*const valueId = `line-match-board-handoff-\$\{item\.id\}-value`[\s\S]*const descriptionId = `line-match-board-handoff-\$\{item\.id\}-description`[\s\S]*data-handoff-item=\{item\.id\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{item\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/
  );
});

function buildLineMatchItems(): PublicRuntimeItem[] {
  return [
    {
      choices: [SECRET_CHOICE_TEXT, 'SAFE_LINE_MATCH_CHOICE'],
      id: SECRET_RUNTIME_ITEM_ID,
      kind: 'pair',
      prompt: SECRET_PROMPT_TEXT,
    },
    {
      choices: [SECRET_CHOICE_TEXT, 'SAFE_LINE_MATCH_CHOICE'],
      id: SECRET_RUNTIME_ITEM_ID_TWO,
      kind: 'pair',
      prompt: `${SECRET_PROMPT_TEXT}_TWO`,
    },
    {
      choices: [SECRET_CHOICE_TEXT, 'SAFE_LINE_MATCH_CHOICE'],
      id: SECRET_RUNTIME_ITEM_ID_THREE,
      kind: 'pair',
      prompt: `${SECRET_PROMPT_TEXT}_THREE`,
    },
  ];
}

function buildLineMatchReviewItems(): PublicAttemptReviewItem[] {
  return [
    {
      acceptedAnswers: [SECRET_CHOICE_TEXT],
      correct: true,
      correctAnswer: SECRET_CHOICE_TEXT,
      explanation: SECRET_EXPLANATION,
      itemId: SECRET_RUNTIME_ITEM_ID,
      prompt: SECRET_PROMPT_TEXT,
      studentAnswer: SECRET_CHOICE_TEXT,
      unanswered: false,
    },
    {
      acceptedAnswers: [SECRET_CHOICE_TEXT],
      correct: false,
      correctAnswer: SECRET_CHOICE_TEXT,
      explanation: SECRET_EXPLANATION,
      itemId: SECRET_RUNTIME_ITEM_ID_TWO,
      prompt: `${SECRET_PROMPT_TEXT}_TWO`,
      studentAnswer: SECRET_ANSWER_TEXT,
      unanswered: false,
    },
    {
      acceptedAnswers: [SECRET_CHOICE_TEXT],
      correct: false,
      correctAnswer: SECRET_CHOICE_TEXT,
      explanation: SECRET_EXPLANATION,
      itemId: SECRET_RUNTIME_ITEM_ID_THREE,
      prompt: `${SECRET_PROMPT_TEXT}_THREE`,
      studentAnswer: '',
      unanswered: true,
    },
  ];
}

function getHandoffValue(
  handoffView: LineMatchBoardHandoffView,
  id: LineMatchBoardHandoffItemId
) {
  return handoffView.itemViews.find((item) => item.id === id)?.value;
}

function assertNoPrivateLineMatchText(serialized: string) {
  for (const secret of [
    SECRET_ANSWER_TEXT,
    SECRET_CHOICE_TEXT,
    SECRET_EXPLANATION,
    SECRET_PROMPT_TEXT,
    SECRET_RUNTIME_ITEM_ID,
    SECRET_RUNTIME_ITEM_ID_TWO,
    SECRET_RUNTIME_ITEM_ID_THREE,
    SECRET_SOURCE_MATERIAL,
    SECRET_STUDENT_NAME,
    SECRET_TOKEN,
  ]) {
    assert.equal(
      serialized.includes(secret),
      false,
      `Line-match handoff leaked private text: ${secret}`
    );
  }
}
