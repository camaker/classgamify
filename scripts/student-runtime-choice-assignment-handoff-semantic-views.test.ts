import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import type { PublicRuntimeItem } from '@/assignments/public';
import {
  buildStudentRuntimeChoiceAssignmentHandoffView,
  STUDENT_RUNTIME_CHOICE_ASSIGNMENT_HANDOFF_ITEM_IDS,
  type StudentRuntimeChoiceAssignmentHandoffItemId,
  type StudentRuntimeChoiceAssignmentHandoffView,
} from '@/assignments/runtime-choice-assignment-handoff';
import { buildStudentRuntimeItemListView } from '@/assignments/student-runtime-item-list';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER_TEXT = 'SECRET_STUDENT_ANSWER';
const SECRET_CHOICE_TEXT = 'SECRET_RUNTIME_CHOICE';
const SECRET_CHOICE_TEXT_TWO = 'SECRET_RUNTIME_CHOICE_TWO';
const SECRET_GROUP_TEXT = 'SECRET_GROUP_TEXT';
const SECRET_GROUP_TEXT_TWO = 'SECRET_GROUP_TEXT_TWO';
const SECRET_PROMPT_TEXT = 'SECRET_RUNTIME_PROMPT';
const SECRET_RUNTIME_ITEM_ID = 'secret-runtime-item-id';
const SECRET_RUNTIME_ITEM_ID_TWO = 'secret-runtime-item-id-two';
const SECRET_STALE_ITEM_ID = 'stale-secret-runtime-item-id';
const SECRET_STUDENT_NAME = 'Private Student Name';
const SECRET_TOKEN = 'raw-anonymous-token';

test('student runtime choice assignment handoff exposes 30 safe exclusive slices', () => {
  const handoffView = buildStudentRuntimeChoiceAssignmentHandoffView({
    answers: {
      [SECRET_RUNTIME_ITEM_ID]: SECRET_CHOICE_TEXT,
      orphaned: SECRET_ANSWER_TEXT,
    },
    items: buildPairRuntimeItems(),
    selectedChoice: SECRET_CHOICE_TEXT,
    selectedItemId: SECRET_RUNTIME_ITEM_ID_TWO,
    surface: 'matching-pairs',
    templateType: 'matching-pairs',
  });
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...STUDENT_RUNTIME_CHOICE_ASSIGNMENT_HANDOFF_ITEM_IDS,
  ]);
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
    exposesAnswerText: false,
    exposesRawChoiceOwnerItemId: false,
    exposesRuntimeChoiceText: false,
    exposesRuntimeItemIds: false,
    exposesRuntimePromptText: false,
    itemIds,
    runnerSurface: 'matching-pairs',
    scope: 'student-runtime-choice-assignment',
    templateType: 'matching-pairs',
    usesNormalizedChoiceKeys: true,
    usesSharedSubmissionContract: true,
  });

  assert.equal(getHandoffValue(handoffView, 'template-type'), 'matching-pairs');
  assert.equal(
    getHandoffValue(handoffView, 'runner-surface'),
    'matching-pairs'
  );
  assert.equal(
    getHandoffValue(handoffView, 'exclusive-surface-state'),
    'Active'
  );
  assert.equal(
    getHandoffValue(handoffView, 'group-placement-state'),
    'Inactive'
  );
  assert.equal(getHandoffValue(handoffView, 'choice-list-state'), 'Inactive');
  assert.equal(
    getHandoffValue(handoffView, 'normalized-choice-count'),
    '2 choices'
  );
  assert.equal(getHandoffValue(handoffView, 'duplicate-choice-count'), '2');
  assert.equal(
    getHandoffValue(handoffView, 'choice-key-normalization'),
    'NFKC choice key'
  );
  assert.equal(
    getHandoffValue(handoffView, 'selected-item-state'),
    'Valid selection'
  );
  assert.equal(
    getHandoffValue(handoffView, 'selected-item-validity'),
    'Selection valid'
  );
  assert.equal(
    getHandoffValue(handoffView, 'selected-choice-owner'),
    'Choice occupied'
  );
  assert.equal(getHandoffValue(handoffView, 'occupied-choice-count'), '1');
  assert.equal(getHandoffValue(handoffView, 'unassigned-choice-count'), '1');
  assert.equal(
    getHandoffValue(handoffView, 'answer-change-contract'),
    'Batched answer changes'
  );
  assert.equal(
    getHandoffValue(handoffView, 'exclusive-clear-change'),
    'Clears previous owner'
  );
  assert.equal(
    getHandoffValue(handoffView, 'exclusive-set-change'),
    'Sets selected prompt'
  );
  assert.equal(
    getHandoffValue(handoffView, 'disabled-action-policy'),
    'Actions enabled'
  );
  assert.equal(getHandoffValue(handoffView, 'no-selected-policy'), 'Ready');
  assert.equal(
    getHandoffValue(handoffView, 'stale-selection-policy'),
    'Selection safe'
  );
  assert.equal(
    getHandoffValue(handoffView, 'prompt-selection-toggle'),
    'Toggle prompt selection'
  );
  assert.equal(
    getHandoffValue(handoffView, 'choice-action-boundary'),
    'Choice requires prompt'
  );
  assert.equal(
    getHandoffValue(handoffView, 'group-action-boundary'),
    'Not applicable'
  );
  assert.equal(
    getHandoffValue(handoffView, 'group-clear-boundary'),
    'Not applicable'
  );
  assert.equal(
    getHandoffValue(handoffView, 'normalized-answer-scope'),
    'Runtime items only'
  );
  assert.equal(
    getHandoffValue(handoffView, 'submission-contract'),
    '{ itemId, answer }'
  );
  assert.equal(
    getHandoffValue(handoffView, 'public-payload-boundary'),
    'Sanitized runtime'
  );
  assert.equal(
    getHandoffValue(handoffView, 'runtime-choice-text-guard'),
    'Choices hidden'
  );
  assert.equal(
    getHandoffValue(handoffView, 'runtime-item-id-guard'),
    'Item ids hidden'
  );
  assert.equal(
    getHandoffValue(handoffView, 'answer-text-guard'),
    'Answers hidden'
  );
  assert.equal(
    getHandoffValue(handoffView, 'privacy-guard'),
    'Private data omitted'
  );

  assertNoPrivateChoiceAssignmentText(JSON.stringify(handoffView));
});

test('student runtime choice assignment handoff clears stale selected ids', () => {
  const handoffView = buildStudentRuntimeChoiceAssignmentHandoffView({
    answers: {},
    items: buildPairRuntimeItems(),
    selectedChoice: SECRET_CHOICE_TEXT,
    selectedItemId: SECRET_STALE_ITEM_ID,
    surface: 'line-match',
    templateType: 'line-match',
  });

  assert.equal(getHandoffValue(handoffView, 'runner-surface'), 'line-match');
  assert.equal(
    getHandoffValue(handoffView, 'selected-item-state'),
    'Stale selection'
  );
  assert.equal(
    getHandoffValue(handoffView, 'selected-item-validity'),
    'Selection cleared'
  );
  assert.equal(
    getHandoffValue(handoffView, 'no-selected-policy'),
    'Wait for prompt'
  );
  assert.equal(
    getHandoffValue(handoffView, 'stale-selection-policy'),
    'Selection cleared'
  );
  assert.equal(
    getHandoffValue(handoffView, 'exclusive-set-change'),
    'Wait for prompt'
  );

  assertNoPrivateChoiceAssignmentText(JSON.stringify(handoffView));
});

test('student runtime choice assignment handoff distinguishes group placement', () => {
  const handoffView = buildStudentRuntimeChoiceAssignmentHandoffView({
    answers: {
      [SECRET_RUNTIME_ITEM_ID]: SECRET_GROUP_TEXT,
    },
    items: buildGroupRuntimeItems(),
    selectedChoice: SECRET_GROUP_TEXT,
    selectedItemId: SECRET_RUNTIME_ITEM_ID_TWO,
    surface: 'group-sort',
    templateType: 'group-sort',
  });

  assert.equal(getHandoffValue(handoffView, 'runner-surface'), 'group-sort');
  assert.equal(
    getHandoffValue(handoffView, 'exclusive-surface-state'),
    'Inactive'
  );
  assert.equal(getHandoffValue(handoffView, 'group-placement-state'), 'Active');
  assert.equal(getHandoffValue(handoffView, 'choice-list-state'), 'Inactive');
  assert.equal(
    getHandoffValue(handoffView, 'selected-item-state'),
    'Valid selection'
  );
  assert.equal(
    getHandoffValue(handoffView, 'selected-choice-owner'),
    'Choice occupied'
  );
  assert.equal(
    getHandoffValue(handoffView, 'answer-change-contract'),
    'Single answer change'
  );
  assert.equal(
    getHandoffValue(handoffView, 'exclusive-clear-change'),
    'Not applicable'
  );
  assert.equal(
    getHandoffValue(handoffView, 'exclusive-set-change'),
    'Places selected item'
  );
  assert.equal(
    getHandoffValue(handoffView, 'prompt-selection-toggle'),
    'Toggle item selection'
  );
  assert.equal(
    getHandoffValue(handoffView, 'group-action-boundary'),
    'Group requires item'
  );
  assert.equal(
    getHandoffValue(handoffView, 'group-clear-boundary'),
    'Clear available'
  );

  assertNoPrivateChoiceAssignmentText(JSON.stringify(handoffView));
});

test('student runtime item-list exposes choice-list handoff through the runner view', () => {
  const handoffView = buildStudentRuntimeItemListView({
    answers: {
      [SECRET_RUNTIME_ITEM_ID]: SECRET_CHOICE_TEXT,
    },
    disabled: true,
    items: [
      {
        choices: [SECRET_CHOICE_TEXT, SECRET_CHOICE_TEXT_TWO],
        id: SECRET_RUNTIME_ITEM_ID,
        kind: 'question',
        prompt: SECRET_PROMPT_TEXT,
      },
    ],
    templateType: 'quiz',
  }).runtimeChoiceAssignmentHandoffView;

  assert.equal(handoffView.privacy.runnerSurface, 'choice-list');
  assert.equal(handoffView.privacy.templateType, 'quiz');
  assert.equal(getHandoffValue(handoffView, 'choice-list-state'), 'Active');
  assert.equal(
    getHandoffValue(handoffView, 'selected-item-state'),
    'No selection'
  );
  assert.equal(
    getHandoffValue(handoffView, 'selected-choice-owner'),
    'Choice occupied'
  );
  assert.equal(
    getHandoffValue(handoffView, 'disabled-action-policy'),
    'Actions locked'
  );
  assert.equal(
    getHandoffValue(handoffView, 'choice-action-boundary'),
    'Per-card choice'
  );
  assert.equal(
    getHandoffValue(handoffView, 'prompt-selection-toggle'),
    'Not applicable'
  );
  assert.equal(
    getHandoffValue(handoffView, 'submission-contract'),
    '{ itemId, answer }'
  );

  assertNoPrivateChoiceAssignmentText(JSON.stringify(handoffView));
});

test('student runtime choice assignment handoff localizes Chinese boundaries', () => {
  try {
    overwriteGetLocale(() => 'zh');

    const handoffView = buildStudentRuntimeChoiceAssignmentHandoffView({
      answers: {},
      items: [
        {
          choices: ['水果'],
          id: SECRET_RUNTIME_ITEM_ID,
          kind: 'group-item',
          prompt: '苹果',
        },
      ],
      selectedItemId: SECRET_RUNTIME_ITEM_ID,
      surface: 'group-sort',
      templateType: 'group-sort',
    });

    assert.equal(handoffView.title, '运行选择分派交接');
    assert.match(handoffView.description, /30 切片/);
    assert.equal(getHandoffValue(handoffView, 'runner-surface'), 'group-sort');
    assert.equal(
      getHandoffValue(handoffView, 'group-placement-state'),
      '已启用'
    );
    assert.equal(
      getHandoffValue(handoffView, 'normalized-choice-count'),
      '1 个选择'
    );
    assert.equal(
      getHandoffValue(handoffView, 'group-action-boundary'),
      '分组需要项目'
    );
    assert.equal(
      getHandoffValue(handoffView, 'public-payload-boundary'),
      '清理后的运行内容'
    );
    assert.equal(
      getHandoffValue(handoffView, 'privacy-guard'),
      '已省略私有数据'
    );

    assertNoPrivateChoiceAssignmentText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

test('student runtime choice assignment handoff renders hidden DOM relationships', () => {
  const componentSource = readFileSync(
    'src/components/activities/student-runtime-item-list.tsx',
    'utf8'
  );

  assert.match(
    componentSource,
    /StudentRuntimeChoiceAssignmentHandoffItemView[\s\S]*StudentRuntimeChoiceAssignmentHandoffView[\s\S]*data-handoff="student-runtime-choice-assignment"[\s\S]*view\.itemViews\.map[\s\S]*StudentRuntimeChoiceAssignmentHandoffItem[\s\S]*function StudentRuntimeChoiceAssignmentHandoffItem[\s\S]*const labelId = `student-runtime-choice-assignment-handoff-\$\{itemView\.id\}-label`[\s\S]*const valueId = `student-runtime-choice-assignment-handoff-\$\{itemView\.id\}-value`[\s\S]*const descriptionId = `student-runtime-choice-assignment-handoff-\$\{itemView\.id\}-description`[\s\S]*data-handoff-item=\{itemView\.id\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{itemView\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/,
    'Student runtime choice assignment handoff should render each safe choice-assignment slice with stable label, value, and description relationships.'
  );
});

function buildPairRuntimeItems(): PublicRuntimeItem[] {
  return [
    {
      choices: [SECRET_CHOICE_TEXT, SECRET_CHOICE_TEXT_TWO],
      id: SECRET_RUNTIME_ITEM_ID,
      kind: 'pair',
      prompt: SECRET_PROMPT_TEXT,
    },
    {
      choices: [SECRET_CHOICE_TEXT, SECRET_CHOICE_TEXT_TWO],
      id: SECRET_RUNTIME_ITEM_ID_TWO,
      kind: 'pair',
      prompt: `${SECRET_PROMPT_TEXT}_TWO`,
    },
  ];
}

function buildGroupRuntimeItems(): PublicRuntimeItem[] {
  return [
    {
      choices: [SECRET_GROUP_TEXT, SECRET_GROUP_TEXT_TWO],
      id: SECRET_RUNTIME_ITEM_ID,
      kind: 'group-item',
      prompt: SECRET_PROMPT_TEXT,
    },
    {
      choices: [SECRET_GROUP_TEXT, SECRET_GROUP_TEXT_TWO],
      id: SECRET_RUNTIME_ITEM_ID_TWO,
      kind: 'group-item',
      prompt: `${SECRET_PROMPT_TEXT}_TWO`,
    },
  ];
}

function getHandoffValue(
  view: StudentRuntimeChoiceAssignmentHandoffView,
  id: StudentRuntimeChoiceAssignmentHandoffItemId
) {
  const item = view.itemViews.find((itemView) => itemView.id === id);
  assert.ok(item, `Missing runtime choice assignment handoff item ${id}`);
  return item.value;
}

function assertNoPrivateChoiceAssignmentText(serializedView: string) {
  for (const privateValue of [
    SECRET_ANSWER_TEXT,
    SECRET_CHOICE_TEXT,
    SECRET_CHOICE_TEXT_TWO,
    SECRET_GROUP_TEXT,
    SECRET_GROUP_TEXT_TWO,
    SECRET_PROMPT_TEXT,
    SECRET_RUNTIME_ITEM_ID,
    SECRET_RUNTIME_ITEM_ID_TWO,
    SECRET_STALE_ITEM_ID,
    SECRET_STUDENT_NAME,
    SECRET_TOKEN,
    '苹果',
    '水果',
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Student runtime choice assignment leaked private text: ${privateValue}`
    );
  }
}
