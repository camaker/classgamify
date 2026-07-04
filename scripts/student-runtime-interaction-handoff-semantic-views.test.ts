import assert from 'node:assert/strict';
import test from 'node:test';
import type { PublicRuntimeItem } from '@/assignments/public';
import {
  buildStudentRuntimeItemListView,
  STUDENT_RUNTIME_INTERACTION_HANDOFF_ITEM_IDS,
  type StudentRuntimeInteractionHandoffItemId,
  type StudentRuntimeInteractionHandoffView,
} from '@/assignments/student-runtime-item-list';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER_TEXT = 'SECRET_STUDENT_ANSWER';
const SECRET_PROMPT_TEXT = 'SECRET_PROMPT_TEXT';
const SECRET_RUNTIME_CHOICE = 'SECRET_RUNTIME_CHOICE';
const SECRET_RUNTIME_CHOICE_TWO = 'SECRET_RUNTIME_CHOICE_TWO';
const SECRET_RUNTIME_ITEM_ID = 'secret-runtime-item-id';
const SECRET_STUDENT_NAME = 'Student Private Name';
const SECRET_TOKEN = 'raw-anonymous-token-value';

test('student runtime interaction handoff exposes 30 safe choice-list slices', () => {
  const handoffView = buildStudentRuntimeItemListView({
    answers: {
      [SECRET_RUNTIME_ITEM_ID]: SECRET_ANSWER_TEXT,
    },
    items: [
      {
        choices: [SECRET_RUNTIME_CHOICE, SECRET_RUNTIME_CHOICE_TWO],
        id: SECRET_RUNTIME_ITEM_ID,
        kind: 'question',
        prompt: SECRET_PROMPT_TEXT,
      },
    ],
    revealAnswer: false,
    templateType: 'quiz',
  }).interactionHandoffView;
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...STUDENT_RUNTIME_INTERACTION_HANDOFF_ITEM_IDS]);
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
    exposesRuntimeChoiceText: false,
    exposesRuntimeItemIds: false,
    exposesRuntimePromptText: false,
    exposesStudentNames: false,
    exposesTeacherOnlyAnswers: false,
    itemIds,
    runnerSurface: 'choice-list',
    templateType: 'quiz',
  });

  assert.equal(getHandoffItemValue(handoffView, 'template-type'), 'Quiz');
  assert.equal(
    getHandoffItemValue(handoffView, 'runner-surface'),
    'choice-list'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'renderer-surface-count'),
    '7 surfaces'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'renderer-dispatch-boundary'),
    'Template-driven'
  );
  assert.equal(getHandoffItemValue(handoffView, 'runner-title'), 'Quiz');
  assert.equal(getHandoffItemValue(handoffView, 'runtime-items'), '1 items');
  assert.equal(
    getHandoffItemValue(handoffView, 'runtime-kind-summary'),
    'Questions: 1; pairs: 0; group items: 0'
  );
  assert.equal(getHandoffItemValue(handoffView, 'choice-count'), '2 choices');
  assert.equal(
    getHandoffItemValue(handoffView, 'choice-list-renderer'),
    'Active'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'line-match-renderer'),
    'Inactive'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'listening-language'),
    'Not applicable'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'answer-contract'),
    '{ itemId, answer }'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'answer-change-contract'),
    'Single answer change'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'submission-payload-boundary'),
    'Shared answer rows'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'selection-scope'),
    'Per-item answer'
  );
  assert.equal(getHandoffItemValue(handoffView, 'review-feedback'), 'Hidden');
  assert.equal(
    getHandoffItemValue(handoffView, 'review-item-count'),
    '0 review items'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'feedback-data-boundary'),
    'Review summary only'
  );
  assert.equal(getHandoffItemValue(handoffView, 'disabled-state'), 'Enabled');
  assert.equal(
    getHandoffItemValue(handoffView, 'public-payload-boundary'),
    'Sanitized runtime'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'runtime-id-boundary'),
    'Ids hidden'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'prompt-text-boundary'),
    'Prompts omitted'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'choice-text-boundary'),
    'Choice text omitted'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'answer-text-boundary'),
    'Answers omitted'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'privacy-guard'),
    'Private data omitted'
  );

  assertNoPrivateInteractionText(JSON.stringify(handoffView));
});

test('student runtime interaction handoff preserves listening language and review state', () => {
  const handoffView = buildStudentRuntimeItemListView({
    answers: {},
    disabled: true,
    items: [
      {
        id: SECRET_RUNTIME_ITEM_ID,
        kind: 'question',
        prompt: SECRET_PROMPT_TEXT,
      },
    ],
    language: '中文',
    revealAnswer: true,
    reviewItems: [
      {
        acceptedAnswers: [SECRET_ANSWER_TEXT],
        correct: false,
        correctAnswer: SECRET_ANSWER_TEXT,
        explanation: 'Teacher-only explanation text.',
        itemId: SECRET_RUNTIME_ITEM_ID,
        submitted: true,
        submittedAnswer: SECRET_ANSWER_TEXT,
      },
    ],
    templateType: 'listening',
  }).interactionHandoffView;

  assert.deepEqual(
    handoffView.itemViews.map((item) => item.id),
    [...STUDENT_RUNTIME_INTERACTION_HANDOFF_ITEM_IDS]
  );
  assert.equal(handoffView.privacy.runnerSurface, 'listening');
  assert.equal(handoffView.privacy.templateType, 'listening');
  assert.equal(
    getHandoffItemValue(handoffView, 'listening-renderer'),
    'Active'
  );
  assert.equal(getHandoffItemValue(handoffView, 'listening-language'), 'zh-CN');
  assert.equal(
    getHandoffItemValue(handoffView, 'selection-scope'),
    'Sequential item focus'
  );
  assert.equal(getHandoffItemValue(handoffView, 'review-feedback'), 'Visible');
  assert.equal(
    getHandoffItemValue(handoffView, 'review-item-count'),
    '1 review item'
  );
  assert.equal(getHandoffItemValue(handoffView, 'disabled-state'), 'Disabled');

  assertNoPrivateInteractionText(JSON.stringify(handoffView));
});

test('student runtime interaction handoff distinguishes pair and group interactions', () => {
  const pairHandoffView = buildStudentRuntimeItemListView({
    answers: {},
    items: [buildPairRuntimeItem()],
    templateType: 'matching-pairs',
  }).interactionHandoffView;
  const groupHandoffView = buildStudentRuntimeItemListView({
    answers: {},
    items: [
      {
        choices: ['Fruit', 'Drink'],
        id: SECRET_RUNTIME_ITEM_ID,
        kind: 'group-item',
        prompt: SECRET_PROMPT_TEXT,
      },
    ],
    templateType: 'group-sort',
  }).interactionHandoffView;

  assert.equal(
    getHandoffItemValue(pairHandoffView, 'matching-pairs-renderer'),
    'Active'
  );
  assert.equal(
    getHandoffItemValue(pairHandoffView, 'answer-change-contract'),
    'Batched answer changes'
  );
  assert.equal(
    getHandoffItemValue(pairHandoffView, 'selection-scope'),
    'Prompt-choice pairing'
  );
  assert.equal(
    getHandoffItemValue(groupHandoffView, 'group-sort-renderer'),
    'Active'
  );
  assert.equal(
    getHandoffItemValue(groupHandoffView, 'answer-change-contract'),
    'Single answer change'
  );
  assert.equal(
    getHandoffItemValue(groupHandoffView, 'selection-scope'),
    'Item-to-group placement'
  );
});

function buildPairRuntimeItem(): PublicRuntimeItem {
  return {
    choices: [SECRET_RUNTIME_CHOICE, SECRET_RUNTIME_CHOICE_TWO],
    id: SECRET_RUNTIME_ITEM_ID,
    kind: 'pair',
    prompt: SECRET_PROMPT_TEXT,
  };
}

function getHandoffItemValue(
  view: StudentRuntimeInteractionHandoffView,
  id: StudentRuntimeInteractionHandoffItemId
) {
  const item = view.itemViews.find((handoffItem) => handoffItem.id === id);
  assert.ok(item, `Missing runtime interaction handoff item ${id}`);
  return item.value;
}

function assertNoPrivateInteractionText(serializedView: string) {
  for (const privateValue of [
    SECRET_ANSWER_TEXT,
    SECRET_PROMPT_TEXT,
    SECRET_RUNTIME_CHOICE,
    SECRET_RUNTIME_CHOICE_TWO,
    SECRET_RUNTIME_ITEM_ID,
    SECRET_STUDENT_NAME,
    SECRET_TOKEN,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Student runtime interaction handoff leaked private text: ${privateValue}`
    );
  }
}
