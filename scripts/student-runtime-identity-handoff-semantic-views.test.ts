import assert from 'node:assert/strict';
import test from 'node:test';
import { getRuntimeItems } from '@/activities/runtime';
import { buildActivityContent } from '@/activities/validation';
import type { PublicRuntimeItem } from '@/assignments/public';
import {
  buildStudentRuntimeIdentityHandoffView,
  STUDENT_RUNTIME_IDENTITY_HANDOFF_ITEM_IDS,
  type StudentRuntimeIdentityHandoffItemId,
  type StudentRuntimeIdentityHandoffView,
} from '@/assignments/runtime-identity-handoff';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER_TEXT = 'SECRET_RUNTIME_ANSWER';
const SECRET_CHOICE_TEXT = 'SECRET_RUNTIME_CHOICE';
const SECRET_PROMPT_TEXT = 'SECRET_RUNTIME_PROMPT';
const SECRET_RUNTIME_ITEM_ID = 'secret-runtime-item-id';
const SECRET_SOURCE_MATERIAL = 'secret-worksheet-storage-key.pdf';
const SECRET_STUDENT_NAME = 'Private Student Name';
const SECRET_TOKEN = 'raw-anonymous-token';

test('student runtime identity handoff exposes 30 safe multilingual slices', () => {
  const content = buildActivityContent({
    description: 'Chinese punctuation runtime identity coverage',
    difficulty: 'starter',
    gradeBand: 'Grade 1',
    groupsText: '食物 | 苹果, 苹果！, 苹果？',
    language: 'zh',
    learningGoal: 'Students can classify repeated Chinese classroom text.',
    pairsText: '',
    questionsText: '',
    sourceSummary: SECRET_SOURCE_MATERIAL,
    subject: 'Chinese',
    teacherNotesText: SECRET_ANSWER_TEXT,
    templateType: 'group-sort',
    title: '中文分类',
    visibility: 'draft',
    vocabularyText: '苹果, 苹果！, 苹果？',
  });
  const runtimeItems = getRuntimeItems('group-sort', content);

  assert.deepEqual(
    runtimeItems.map((item) => item.id),
    ['g-食物-苹果-1', 'g-食物-苹果-2', 'g-食物-苹果-3']
  );

  const handoffView = buildStudentRuntimeIdentityHandoffView({
    items: runtimeItems,
    templateType: 'group-sort',
  });
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...STUDENT_RUNTIME_IDENTITY_HANDOFF_ITEM_IDS]);
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
    exposesActivityContentJson: false,
    exposesAnswerText: false,
    exposesAnonymousToken: false,
    exposesRuntimeChoiceText: false,
    exposesRuntimeItemIds: false,
    exposesRuntimePromptText: false,
    exposesSourceMaterialMetadata: false,
    exposesStudentName: false,
    itemIds,
    normalizedRuntimeIdCount: 3,
    rejectsDuplicateAnswerIds: true,
    rejectsOverlongAnswerRows: true,
    rejectsUnknownRuntimeIds: true,
    runtimeIdsUnique: true,
    runtimeItemCount: 3,
    runnerSurface: 'group-sort',
    templateType: 'group-sort',
    usesFrozenSnapshotIdentity: true,
  });

  assert.equal(getHandoffValue(handoffView, 'template-type'), 'Group sort');
  assert.equal(getHandoffValue(handoffView, 'runner-surface'), 'group-sort');
  assert.equal(getHandoffValue(handoffView, 'runtime-item-count'), '3 items');
  assert.equal(
    getHandoffValue(handoffView, 'normalized-runtime-id-count'),
    '3 ids'
  );
  assert.equal(
    getHandoffValue(handoffView, 'unique-runtime-id-status'),
    'Unique'
  );
  assert.equal(
    getHandoffValue(handoffView, 'duplicate-runtime-id-count'),
    '0 duplicates'
  );
  assert.equal(
    getHandoffValue(handoffView, 'blank-runtime-id-count'),
    '0 blank ids'
  );
  assert.equal(getHandoffValue(handoffView, 'question-count'), '0 questions');
  assert.equal(getHandoffValue(handoffView, 'pair-count'), '0 pairs');
  assert.equal(
    getHandoffValue(handoffView, 'group-item-count'),
    '3 group items'
  );
  assert.equal(getHandoffValue(handoffView, 'choice-count'), '1 choices');
  assert.equal(
    getHandoffValue(handoffView, 'runtime-id-normalization-source'),
    'Shared helper'
  );
  assert.equal(
    getHandoffValue(handoffView, 'multilingual-id-collision-guard'),
    'Collision safe'
  );
  assert.equal(
    getHandoffValue(handoffView, 'submission-contract'),
    '{ itemId, answer }'
  );
  assert.equal(
    getHandoffValue(handoffView, 'submission-validation-boundary'),
    'Server validation'
  );
  assert.equal(
    getHandoffValue(handoffView, 'unknown-answer-id-policy'),
    'Rejected'
  );
  assert.equal(
    getHandoffValue(handoffView, 'duplicate-answer-id-policy'),
    'Rejected'
  );
  assert.equal(
    getHandoffValue(handoffView, 'answer-list-length-policy'),
    'Rejected'
  );
  assert.equal(
    getHandoffValue(handoffView, 'browser-answer-boundary'),
    'Normalized rows'
  );
  assert.equal(
    getHandoffValue(handoffView, 'scoring-lookup-boundary'),
    'Normalized lookup'
  );
  assert.equal(
    getHandoffValue(handoffView, 'teacher-results-boundary'),
    'Frozen identity set'
  );
  assert.equal(
    getHandoffValue(handoffView, 'public-payload-boundary'),
    'Sanitized runtime'
  );
  assert.equal(
    getHandoffValue(handoffView, 'assignment-snapshot-boundary'),
    'Frozen snapshot'
  );
  assert.equal(
    getHandoffValue(handoffView, 'activity-content-boundary'),
    'ActivityContent hidden'
  );
  assert.equal(
    getHandoffValue(handoffView, 'prompt-choice-boundary'),
    'Text omitted'
  );
  assert.equal(
    getHandoffValue(handoffView, 'answer-text-boundary'),
    'Answers omitted'
  );
  assert.equal(
    getHandoffValue(handoffView, 'student-name-boundary'),
    'Student name hidden'
  );
  assert.equal(
    getHandoffValue(handoffView, 'anonymous-token-boundary'),
    'Token hidden'
  );
  assert.equal(
    getHandoffValue(handoffView, 'source-material-boundary'),
    'Hidden'
  );
  assert.equal(
    getHandoffValue(handoffView, 'privacy-guard'),
    'Private data omitted'
  );

  assertNoPrivateIdentityText(JSON.stringify(handoffView));
});

test('student runtime identity handoff blocks duplicate and blank runtime ids', () => {
  const handoffView = buildStudentRuntimeIdentityHandoffView({
    items: [
      {
        choices: [SECRET_CHOICE_TEXT],
        id: 'item-1',
        kind: 'question',
        prompt: SECRET_PROMPT_TEXT,
      },
      {
        choices: [SECRET_CHOICE_TEXT],
        id: ' ｉｔｅｍ－１ ',
        kind: 'pair',
        prompt: SECRET_PROMPT_TEXT,
      },
      {
        choices: ['Secret Group'],
        id: '   ',
        kind: 'group-item',
        prompt: SECRET_PROMPT_TEXT,
      },
    ],
    templateType: 'matching-pairs',
  });

  assert.equal(handoffView.privacy.runtimeIdsUnique, false);
  assert.equal(handoffView.privacy.normalizedRuntimeIdCount, 1);
  assert.equal(
    getHandoffValue(handoffView, 'runner-surface'),
    'matching-pairs'
  );
  assert.equal(
    getHandoffValue(handoffView, 'unique-runtime-id-status'),
    'Blocked'
  );
  assert.equal(
    getHandoffValue(handoffView, 'multilingual-id-collision-guard'),
    'Collision blocked'
  );
  assert.equal(
    getHandoffValue(handoffView, 'duplicate-runtime-id-count'),
    '1 duplicates'
  );
  assert.equal(
    getHandoffValue(handoffView, 'blank-runtime-id-count'),
    '1 blank ids'
  );
  assert.equal(getHandoffValue(handoffView, 'question-count'), '1 questions');
  assert.equal(getHandoffValue(handoffView, 'pair-count'), '1 pairs');
  assert.equal(
    getHandoffValue(handoffView, 'group-item-count'),
    '1 group items'
  );

  assertNoPrivateIdentityText(JSON.stringify(handoffView));
});

test('student runtime identity handoff localizes Chinese identity boundaries', () => {
  try {
    overwriteGetLocale(() => 'zh');

    const handoffView = buildStudentRuntimeIdentityHandoffView({
      items: [
        {
          choices: ['水果'],
          id: 'g-food-苹果',
          kind: 'group-item',
          prompt: '苹果',
        },
      ],
      templateType: 'group-sort',
    });

    assert.equal(handoffView.title, '运行身份交接');
    assert.match(handoffView.description, /30 切片/);
    assert.equal(getHandoffValue(handoffView, 'template-type'), '分组分类');
    assert.equal(
      getHandoffValue(handoffView, 'runtime-id-normalization-source'),
      '共享 helper'
    );
    assert.equal(
      getHandoffValue(handoffView, 'submission-validation-boundary'),
      '服务器校验'
    );
    assert.equal(
      getHandoffValue(handoffView, 'unknown-answer-id-policy'),
      '已拒绝'
    );
    assert.equal(
      getHandoffValue(handoffView, 'unique-runtime-id-status'),
      '唯一'
    );
    assert.equal(
      getHandoffValue(handoffView, 'runtime-item-count'),
      '1 个项目'
    );
    assert.equal(
      getHandoffValue(handoffView, 'prompt-choice-boundary'),
      '文本已省略'
    );
    assert.equal(
      getHandoffValue(handoffView, 'source-material-boundary'),
      '已隐藏'
    );
    assert.equal(
      getHandoffValue(handoffView, 'anonymous-token-boundary'),
      '匿名令牌已隐藏'
    );

    assertNoPrivateIdentityText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

function getHandoffValue(
  view: StudentRuntimeIdentityHandoffView,
  id: StudentRuntimeIdentityHandoffItemId
) {
  const item = view.itemViews.find((itemView) => itemView.id === id);
  assert.ok(item, `Missing runtime identity handoff item ${id}`);
  return item.value;
}

function assertNoPrivateIdentityText(serializedView: string) {
  for (const privateValue of [
    SECRET_ANSWER_TEXT,
    SECRET_CHOICE_TEXT,
    SECRET_PROMPT_TEXT,
    SECRET_RUNTIME_ITEM_ID,
    SECRET_SOURCE_MATERIAL,
    SECRET_STUDENT_NAME,
    SECRET_TOKEN,
    'g-食物-苹果',
    'item-1',
    '苹果',
    '食物',
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Student runtime identity handoff leaked private text: ${privateValue}`
    );
  }
}
