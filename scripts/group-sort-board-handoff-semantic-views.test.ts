import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import type {
  PublicAttemptReviewItem,
  PublicRuntimeItem,
} from '@/assignments/public';
import {
  buildGroupSortBoardHandoffView,
  GROUP_SORT_BOARD_HANDOFF_ITEM_IDS,
  type GroupSortBoardHandoffItemId,
  type GroupSortBoardHandoffView,
} from '@/assignments/group-sort-board-handoff';
import { buildGroupSortRunnerView } from '@/assignments/student-runner-view';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER_TEXT = 'SECRET_GROUP_SORT_ANSWER';
const SECRET_EXPLANATION = 'SECRET_GROUP_SORT_EXPLANATION';
const SECRET_PROMPT_TEXT = 'SECRET_GROUP_SORT_PROMPT';
const SECRET_RUNTIME_ITEM_ID = 'secret-group-sort-item-id';
const SECRET_RUNTIME_ITEM_ID_TWO = 'secret-group-sort-item-id-two';
const SECRET_RUNTIME_ITEM_ID_THREE = 'secret-group-sort-item-id-three';
const SECRET_SOURCE_MATERIAL = 'secret-group-sort-worksheet.pdf';
const SECRET_STUDENT_NAME = 'Private Group Sort Student';
const SECRET_TOKEN = 'raw-group-sort-browser-token';
const SECRET_CATEGORY = 'SECRET_GROUP_SORT_CATEGORY';

test('group-sort board handoff exposes 30 safe category-board slices', () => {
  const runnerView = buildGroupSortRunnerView({
    answers: {
      [SECRET_RUNTIME_ITEM_ID]: SECRET_CATEGORY,
      orphan: SECRET_ANSWER_TEXT,
    },
    items: buildGroupSortItems(),
    revealAnswer: true,
    reviewItems: buildGroupSortReviewItems(),
    selectedItemId: SECRET_RUNTIME_ITEM_ID_TWO,
  });
  const handoffView = buildGroupSortBoardHandoffView({
    revealAnswer: true,
    runnerView,
  });
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...GROUP_SORT_BOARD_HANDOFF_ITEM_IDS]);
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
    exposesCategoryText: false,
    exposesRuntimeItemIds: false,
    exposesRuntimePromptText: false,
    exposesSourceMaterialMetadata: false,
    exposesStudentIdentity: false,
    itemIds,
    runnerSurface: 'group-sort',
    scope: 'group-sort-category-board',
    templateType: 'group-sort',
    usesSharedSubmissionContract: true,
  });

  assert.equal(getHandoffValue(handoffView, 'template-type'), 'group-sort');
  assert.equal(getHandoffValue(handoffView, 'runner-surface'), 'group-sort');
  assert.equal(getHandoffValue(handoffView, 'board-state'), 'Active');
  assert.equal(getHandoffValue(handoffView, 'category-count'), '2 categories');
  assert.equal(getHandoffValue(handoffView, 'item-count'), '3 items');
  assert.equal(getHandoffValue(handoffView, 'unplaced-item-count'), '2');
  assert.equal(getHandoffValue(handoffView, 'placed-item-count'), '1');
  assert.equal(getHandoffValue(handoffView, 'selected-item-state'), 'Selected');
  assert.equal(getHandoffValue(handoffView, 'selected-item-validity'), 'Valid');
  assert.equal(
    getHandoffValue(handoffView, 'selected-clear-action'),
    'Available'
  );
  assert.equal(getHandoffValue(handoffView, 'category-target-state'), 'Ready');
  assert.equal(
    getHandoffValue(handoffView, 'available-category-count'),
    '2 available categories'
  );
  assert.equal(
    getHandoffValue(handoffView, 'group-placement-action'),
    'Ready to place'
  );
  assert.equal(
    getHandoffValue(handoffView, 'item-selection-toggle'),
    'Available'
  );
  assert.equal(getHandoffValue(handoffView, 'answered-item-count'), '1');
  assert.equal(getHandoffValue(handoffView, 'unanswered-item-count'), '2');
  assert.equal(
    getHandoffValue(handoffView, 'completion-progress'),
    '1 of 3 sorted'
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
    'One answer per placed item'
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
    getHandoffValue(handoffView, 'answer-text-guard'),
    'Answers hidden'
  );
  assert.equal(
    getHandoffValue(handoffView, 'student-identity-guard'),
    'Student identity hidden'
  );
  assert.equal(
    getHandoffValue(handoffView, 'source-material-guard'),
    'Source materials hidden'
  );
  assert.equal(
    getHandoffValue(handoffView, 'privacy-guard'),
    'Private data omitted'
  );

  assertNoPrivateGroupSortText(JSON.stringify(handoffView));
});

test('group-sort board handoff reports locked placement state', () => {
  const handoffView = buildGroupSortBoardHandoffView({
    disabled: true,
    runnerView: buildGroupSortRunnerView({
      answers: {},
      items: buildGroupSortItems().slice(0, 1),
      selectedItemId: SECRET_RUNTIME_ITEM_ID,
    }),
  });

  assert.equal(getHandoffValue(handoffView, 'category-count'), '2 categories');
  assert.equal(getHandoffValue(handoffView, 'item-count'), '1 item');
  assert.equal(getHandoffValue(handoffView, 'selected-item-state'), 'Selected');
  assert.equal(getHandoffValue(handoffView, 'selected-clear-action'), 'Locked');
  assert.equal(getHandoffValue(handoffView, 'category-target-state'), 'Locked');
  assert.equal(
    getHandoffValue(handoffView, 'available-category-count'),
    '0 available categories'
  );
  assert.equal(
    getHandoffValue(handoffView, 'group-placement-action'),
    'Locked'
  );
  assert.equal(getHandoffValue(handoffView, 'item-selection-toggle'), 'Locked');
  assert.equal(getHandoffValue(handoffView, 'review-feedback-state'), 'Hidden');

  assertNoPrivateGroupSortText(JSON.stringify(handoffView));
});

test('group-sort board handoff localizes Chinese category boundaries', () => {
  try {
    overwriteGetLocale(() => 'zh');

    const handoffView = buildGroupSortBoardHandoffView({
      revealAnswer: true,
      runnerView: buildGroupSortRunnerView({
        answers: {
          [SECRET_RUNTIME_ITEM_ID]: SECRET_CATEGORY,
        },
        items: buildGroupSortItems(),
        revealAnswer: true,
        reviewItems: buildGroupSortReviewItems(),
        selectedItemId: SECRET_RUNTIME_ITEM_ID_TWO,
      }),
    });

    assert.equal(handoffView.title, '分类板面摘要');
    assert.match(handoffView.description, /提交规则/);
    assert.equal(getHandoffValue(handoffView, 'board-state'), '已启用');
    assert.equal(getHandoffValue(handoffView, 'category-count'), '2 个分类');
    assert.equal(getHandoffValue(handoffView, 'item-count'), '3 个项目');
    assert.equal(
      getHandoffValue(handoffView, 'available-category-count'),
      '2 个可用分类'
    );
    assert.equal(
      getHandoffValue(handoffView, 'completion-progress'),
      '1/3 已分类'
    );
    assert.equal(
      getHandoffValue(handoffView, 'public-payload-boundary'),
      '隐私安全的作业内容'
    );
    assert.equal(
      getHandoffValue(handoffView, 'privacy-guard'),
      '已省略私有数据'
    );

    assertNoPrivateGroupSortText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

test('group-sort board attaches the category-board handoff to the component', () => {
  const source = readFileSync(
    'src/components/activities/group-sort-board.tsx',
    'utf8'
  );

  assert.match(
    source,
    /buildGroupSortBoardHandoffView[\s\S]*disabled,[\s\S]*revealAnswer,[\s\S]*runnerView,/
  );
  assert.match(source, /data-handoff="group-sort-board"/);
  assert.match(
    source,
    /GroupSortBoardHandoffItemView[\s\S]*GroupSortBoardHandoffView[\s\S]*view\.itemViews\.map\(\(item\) =>[\s\S]*GroupSortBoardHandoffItem[\s\S]*function GroupSortBoardHandoffItem[\s\S]*const labelId = `group-sort-board-handoff-\$\{item\.id\}-label`[\s\S]*const valueId = `group-sort-board-handoff-\$\{item\.id\}-value`[\s\S]*const descriptionId = `group-sort-board-handoff-\$\{item\.id\}-description`[\s\S]*data-handoff-item=\{item\.id\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{item\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/
  );
});

function buildGroupSortItems(): PublicRuntimeItem[] {
  return [
    {
      choices: [SECRET_CATEGORY, 'SAFE_DRINK_CATEGORY'],
      id: SECRET_RUNTIME_ITEM_ID,
      kind: 'group-item',
      prompt: SECRET_PROMPT_TEXT,
    },
    {
      choices: [SECRET_CATEGORY, 'SAFE_DRINK_CATEGORY'],
      id: SECRET_RUNTIME_ITEM_ID_TWO,
      kind: 'group-item',
      prompt: `${SECRET_PROMPT_TEXT}_TWO`,
    },
    {
      choices: [SECRET_CATEGORY, 'SAFE_DRINK_CATEGORY'],
      id: SECRET_RUNTIME_ITEM_ID_THREE,
      kind: 'group-item',
      prompt: `${SECRET_PROMPT_TEXT}_THREE`,
    },
  ];
}

function buildGroupSortReviewItems(): PublicAttemptReviewItem[] {
  return [
    {
      acceptedAnswers: [SECRET_CATEGORY],
      correct: true,
      correctAnswer: SECRET_CATEGORY,
      explanation: SECRET_EXPLANATION,
      itemId: SECRET_RUNTIME_ITEM_ID,
      submitted: true,
      submittedAnswer: SECRET_CATEGORY,
    },
    {
      acceptedAnswers: [SECRET_CATEGORY],
      correct: false,
      correctAnswer: SECRET_CATEGORY,
      explanation: SECRET_EXPLANATION,
      itemId: SECRET_RUNTIME_ITEM_ID_TWO,
      submitted: false,
      submittedAnswer: '',
    },
    {
      acceptedAnswers: [SECRET_CATEGORY],
      correct: false,
      correctAnswer: SECRET_CATEGORY,
      explanation: SECRET_EXPLANATION,
      itemId: SECRET_RUNTIME_ITEM_ID_THREE,
      submitted: false,
      submittedAnswer: '',
    },
  ];
}

function getHandoffValue(
  view: GroupSortBoardHandoffView,
  id: GroupSortBoardHandoffItemId
) {
  const item = view.itemViews.find((itemView) => itemView.id === id);
  assert.ok(item, `Missing group-sort board handoff item ${id}`);
  return item.value;
}

function assertNoPrivateGroupSortText(serializedView: string) {
  for (const privateValue of [
    SECRET_ANSWER_TEXT,
    SECRET_EXPLANATION,
    SECRET_PROMPT_TEXT,
    SECRET_RUNTIME_ITEM_ID,
    SECRET_RUNTIME_ITEM_ID_TWO,
    SECRET_RUNTIME_ITEM_ID_THREE,
    SECRET_SOURCE_MATERIAL,
    SECRET_STUDENT_NAME,
    SECRET_TOKEN,
    SECRET_CATEGORY,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Group-sort board handoff leaked private text: ${privateValue}`
    );
  }
}
