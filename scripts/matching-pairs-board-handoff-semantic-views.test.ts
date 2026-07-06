import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import type {
  PublicAttemptReviewItem,
  PublicRuntimeItem,
} from '@/assignments/public';
import {
  buildMatchingPairsBoardHandoffView,
  MATCHING_PAIRS_BOARD_HANDOFF_ITEM_IDS,
  type MatchingPairsBoardHandoffItemId,
  type MatchingPairsBoardHandoffView,
} from '@/assignments/matching-pairs-board-handoff';
import { buildChoicePairingRunnerView } from '@/assignments/student-runner-view';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER_TEXT = 'SECRET_MATCHING_PAIRS_ANSWER';
const SECRET_CHOICE_TEXT = 'SECRET_MATCHING_PAIRS_CHOICE';
const SECRET_EXPLANATION = 'SECRET_MATCHING_PAIRS_EXPLANATION';
const SECRET_PROMPT_TEXT = 'SECRET_MATCHING_PAIRS_PROMPT';
const SECRET_RUNTIME_ITEM_ID = 'secret-matching-pairs-item-id';
const SECRET_RUNTIME_ITEM_ID_TWO = 'secret-matching-pairs-item-id-two';
const SECRET_RUNTIME_ITEM_ID_THREE = 'secret-matching-pairs-item-id-three';
const SECRET_SOURCE_MATERIAL = 'secret-matching-pairs-source.pdf';
const SECRET_STUDENT_NAME = 'Private Matching Pairs Student';
const SECRET_TOKEN = 'raw-matching-pairs-browser-token';

test('matching-pairs board handoff exposes 30 safe card-board slices', () => {
  const runnerView = buildChoicePairingRunnerView({
    answers: {
      [SECRET_RUNTIME_ITEM_ID]: SECRET_CHOICE_TEXT,
      orphan: SECRET_ANSWER_TEXT,
    },
    items: buildMatchingPairsItems(),
    revealAnswer: true,
    reviewItems: buildMatchingPairsReviewItems(),
    selectedItemId: SECRET_RUNTIME_ITEM_ID_TWO,
  });
  const handoffView = buildMatchingPairsBoardHandoffView({
    revealAnswer: true,
    runnerView,
  });
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...MATCHING_PAIRS_BOARD_HANDOFF_ITEM_IDS]);
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
    runnerSurface: 'matching-pairs',
    scope: 'matching-pairs-card-board',
    templateType: 'matching-pairs',
    usesSharedSubmissionContract: true,
  });

  assert.equal(getHandoffValue(handoffView, 'template-type'), 'matching-pairs');
  assert.equal(
    getHandoffValue(handoffView, 'runner-surface'),
    'matching-pairs'
  );
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
    '1 of 3 paired'
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

  assertNoPrivateMatchingPairsText(JSON.stringify(handoffView));
});

test('matching-pairs board handoff reports locked choice state', () => {
  const handoffView = buildMatchingPairsBoardHandoffView({
    disabled: true,
    runnerView: buildChoicePairingRunnerView({
      answers: {},
      items: buildMatchingPairsItems().slice(0, 1),
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

  assertNoPrivateMatchingPairsText(JSON.stringify(handoffView));
});

test('matching-pairs board handoff localizes Chinese card boundaries', () => {
  try {
    overwriteGetLocale(() => 'zh');

    const handoffView = buildMatchingPairsBoardHandoffView({
      revealAnswer: true,
      runnerView: buildChoicePairingRunnerView({
        answers: {
          [SECRET_RUNTIME_ITEM_ID]: SECRET_CHOICE_TEXT,
        },
        items: buildMatchingPairsItems(),
        revealAnswer: true,
        reviewItems: buildMatchingPairsReviewItems(),
        selectedItemId: SECRET_RUNTIME_ITEM_ID_TWO,
      }),
    });

    assert.equal(handoffView.title, '配对卡片板摘要');
    assert.match(handoffView.description, /提交规则/);
    assert.equal(getHandoffValue(handoffView, 'board-state'), '已启用');
    assert.equal(getHandoffValue(handoffView, 'prompt-card-count'), '3 个提示');
    assert.equal(getHandoffValue(handoffView, 'choice-card-count'), '2 个选项');
    assert.equal(
      getHandoffValue(handoffView, 'available-choice-count'),
      '2 个可用选项'
    );
    assert.equal(
      getHandoffValue(handoffView, 'used-choice-count'),
      '1 个已用选项'
    );
    assert.equal(
      getHandoffValue(handoffView, 'completion-progress'),
      '1/3 已配对'
    );
    assert.equal(
      getHandoffValue(handoffView, 'public-payload-boundary'),
      '隐私安全的作业内容'
    );
    assert.equal(
      getHandoffValue(handoffView, 'privacy-guard'),
      '已省略私有数据'
    );

    assertNoPrivateMatchingPairsText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

test('matching-pairs board attaches the card-board handoff to the component', () => {
  const source = readFileSync(
    'src/components/activities/matching-pairs-board.tsx',
    'utf8'
  );

  assert.match(
    source,
    /buildMatchingPairsBoardHandoffView[\s\S]*disabled,[\s\S]*revealAnswer,[\s\S]*runnerView,/
  );
  assert.match(source, /data-handoff="matching-pairs-board"/);
  assert.match(
    source,
    /view\.itemViews\.map\(\(item\) =>[\s\S]*data-handoff-item=\{item\.id\}[\s\S]*<output aria-label=\{item\.ariaLabel\}>/
  );
});

function buildMatchingPairsItems(): PublicRuntimeItem[] {
  return [
    {
      choices: [SECRET_CHOICE_TEXT, 'SAFE_MATCH_CHOICE'],
      id: SECRET_RUNTIME_ITEM_ID,
      kind: 'pair',
      prompt: SECRET_PROMPT_TEXT,
    },
    {
      choices: [SECRET_CHOICE_TEXT, 'SAFE_MATCH_CHOICE'],
      id: SECRET_RUNTIME_ITEM_ID_TWO,
      kind: 'pair',
      prompt: `${SECRET_PROMPT_TEXT}_TWO`,
    },
    {
      choices: [SECRET_CHOICE_TEXT, 'SAFE_MATCH_CHOICE'],
      id: SECRET_RUNTIME_ITEM_ID_THREE,
      kind: 'pair',
      prompt: `${SECRET_PROMPT_TEXT}_THREE`,
    },
  ];
}

function buildMatchingPairsReviewItems(): PublicAttemptReviewItem[] {
  return [
    {
      acceptedAnswers: [SECRET_CHOICE_TEXT],
      correct: true,
      correctAnswer: SECRET_CHOICE_TEXT,
      explanation: SECRET_EXPLANATION,
      itemId: SECRET_RUNTIME_ITEM_ID,
      submitted: true,
      submittedAnswer: SECRET_CHOICE_TEXT,
    },
    {
      acceptedAnswers: [SECRET_CHOICE_TEXT],
      correct: false,
      correctAnswer: SECRET_CHOICE_TEXT,
      explanation: SECRET_EXPLANATION,
      itemId: SECRET_RUNTIME_ITEM_ID_TWO,
      submitted: false,
      submittedAnswer: '',
    },
    {
      acceptedAnswers: [SECRET_CHOICE_TEXT],
      correct: false,
      correctAnswer: SECRET_CHOICE_TEXT,
      explanation: SECRET_EXPLANATION,
      itemId: SECRET_RUNTIME_ITEM_ID_THREE,
      submitted: false,
      submittedAnswer: '',
    },
  ];
}

function getHandoffValue(
  view: MatchingPairsBoardHandoffView,
  id: MatchingPairsBoardHandoffItemId
) {
  const item = view.itemViews.find((itemView) => itemView.id === id);
  assert.ok(item, `Missing matching-pairs board handoff item ${id}`);
  return item.value;
}

function assertNoPrivateMatchingPairsText(serializedView: string) {
  for (const privateValue of [
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
      serializedView.includes(privateValue),
      false,
      `Matching-pairs board handoff leaked private text: ${privateValue}`
    );
  }
}
