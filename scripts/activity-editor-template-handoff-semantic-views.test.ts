import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ACTIVITY_EDITOR_TEMPLATE_HANDOFF_ITEM_IDS,
  buildActivityEditorTemplateView,
  getActivityEditorDefaultInput,
  type ActivityEditorTemplateHandoffItemId,
} from '@/activities/editor';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_PROMPT = 'SECRET_TEMPLATE_PROMPT_SHOULD_NOT_LEAK';
const SECRET_ANSWER = 'SECRET_TEMPLATE_ANSWER_SHOULD_NOT_LEAK';
const SECRET_FILE_ID = 'SECRET_TEMPLATE_FILE_ID_SHOULD_NOT_LEAK';
const SECRET_STORAGE_KEY = 'classroom/private/template-source.pdf';

test('activity editor template view exposes a 20-slice handoff contract', () => {
  const templateView = buildActivityEditorTemplateView({
    input: {
      ...getActivityEditorDefaultInput(),
      groupsText: '',
      pairsText: '',
      questionsText: `${SECRET_PROMPT} | ${SECRET_ANSWER} | ${SECRET_ANSWER}, Rome`,
      sourceMaterials: [
        {
          fileId: SECRET_FILE_ID,
          kind: 'worksheet-document',
          originalName: `${SECRET_STORAGE_KEY}?token=private`,
        },
      ],
      templateType: 'quiz',
    },
    templateType: 'quiz',
  });
  const handoffView = templateView.handoffView;
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...ACTIVITY_EDITOR_TEMPLATE_HANDOFF_ITEM_IDS]);
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
    exposesAnswerText: false,
    exposesQuestionPromptText: false,
    exposesRawEditorInput: false,
    exposesRawScaffoldContent: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialStorageKeys: false,
    exposesTeacherNotesText: false,
    itemIds,
  });

  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'selected-template'),
    'Quiz'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'current-template-readiness'),
    'Quiz is selected and ready.'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'ready-template-count'),
    '4 ready'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'ready-template-options'),
    'Quiz, Fill, Listen, and Box'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'suggested-remix-options'),
    'Fill, Listen, and Box'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'locked-template-count'),
    '4 locked'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'question-choice-readiness'),
    '1/1 question ready'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'scaffold-runtime-items'),
    '4 playable items'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'scaffold-ready-modes'),
    '8 modes ready'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'scaffold-reusable-coverage'),
    'Ready'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'scaffold-questions'),
    '4 questions'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'scaffold-pairs'),
    '8 pairs'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'scaffold-groups'),
    '3 groups'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'scaffold-vocabulary'),
    '8 words'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'scaffold-teacher-notes'),
    '2 notes'
  );

  assertNoPrivateTemplateText(JSON.stringify(handoffView));
});

test('invalid editor fields still produce a safe template handoff', () => {
  const templateView = buildActivityEditorTemplateView({
    input: {
      ...getActivityEditorDefaultInput(),
      pairsText: `${SECRET_PROMPT} |`,
      sourceMaterials: [
        {
          fileId: SECRET_FILE_ID,
          kind: 'spreadsheet',
          originalName: SECRET_STORAGE_KEY,
        },
      ],
      templateType: 'line-match',
    },
    templateType: 'line-match',
  });
  const handoffView = templateView.handoffView;

  assert.deepEqual(
    handoffView.itemViews.map((item) => item.id),
    [...ACTIVITY_EDITOR_TEMPLATE_HANDOFF_ITEM_IDS]
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'selected-template'),
    'Line match'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'current-template-readiness'),
    'Add questions, pairs, or groups to unlock playable templates.'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'locked-template-count'),
    '8 locked'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'scaffold-runtime-items'),
    '8 playable items'
  );
  assertNoPrivateTemplateText(JSON.stringify(handoffView));
});

function getHandoffItemValue(
  itemViews: Array<{ id: ActivityEditorTemplateHandoffItemId; value: string }>,
  id: ActivityEditorTemplateHandoffItemId
) {
  const item = itemViews.find((view) => view.id === id);
  assert.ok(item, `Expected template handoff item ${id}`);
  return item.value;
}

function assertNoPrivateTemplateText(value: string) {
  for (const privateValue of [
    SECRET_PROMPT,
    SECRET_ANSWER,
    SECRET_FILE_ID,
    SECRET_STORAGE_KEY,
    'token=private',
  ]) {
    assert.equal(
      value.includes(privateValue),
      false,
      `Template handoff leaked private editor text: ${privateValue}`
    );
  }
}
