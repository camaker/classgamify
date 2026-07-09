import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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
const ACTIVITY_CREATE_FORM_SOURCE = readFileSync(
  'src/components/activities/activity-create-form.tsx',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('activity editor template view exposes a 30-slice handoff contract', () => {
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
    exposesCurrentFieldText: false,
    exposesQuestionPromptText: false,
    exposesRawEditorInput: false,
    exposesRawScaffoldContent: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialStorageKeys: false,
    exposesTeacherNotesText: false,
    itemIds,
    scope: 'activity-editor-template-readiness',
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
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'shared-editor-contract'),
    'Shared structured input'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'parsed-content-status'),
    'Structured fields parsed'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'current-question-count'),
    '1 questions'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'current-pair-count'),
    '0 pairs'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'current-group-count'),
    '0 groups'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'current-vocabulary-count'),
    '6 words'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'current-teacher-note-count'),
    '2 notes'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'scaffold-review-steps'),
    '3 review steps'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'save-before-publish-boundary'),
    'Save before publish'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'privacy-guard'),
    'Private editor text hidden'
  );

  assertNoPrivateTemplateText(JSON.stringify(handoffView));
});

test('activity editor template handoff renders stable semantic outputs', () => {
  assert.match(
    ACTIVITY_CREATE_FORM_SOURCE,
    /ActivityEditorTemplateHandoffView[\s\S]*function ActivityEditorTemplateHandoff[\s\S]*const titleId = 'activity-editor-template-handoff-title'[\s\S]*const descriptionId = 'activity-editor-template-handoff-description'[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-labelledby=\{titleId\}[\s\S]*className="sr-only"[\s\S]*data-handoff="activity-editor-template"[\s\S]*data-handoff-scope=\{handoffView\.privacy\.scope\}[\s\S]*id=\{titleId\}[\s\S]*id=\{descriptionId\}[\s\S]*handoffView\.itemViews\.map[\s\S]*ActivityEditorTemplateHandoffItem[\s\S]*function ActivityEditorTemplateHandoffItem[\s\S]*item: ActivityEditorTemplateHandoffView\['itemViews'\]\[number\][\s\S]*const labelId = `activity-editor-template-handoff-\$\{item\.id\}-label`[\s\S]*const valueId = `activity-editor-template-handoff-\$\{item\.id\}-value`[\s\S]*const descriptionId = `activity-editor-template-handoff-\$\{item\.id\}-description`[\s\S]*data-handoff-item=\{item\.id\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{item\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/
  );
});

test('activity editor template focused gate is documented', () => {
  const normalizedCatalog = TEST_CATALOG_SOURCE.replace(/\s+/g, ' ');

  assert.match(
    TEST_CATALOG_SOURCE,
    /pnpm exec tsx --test scripts\/activity-editor-template-handoff-semantic-views\.test\.ts/
  );
  for (const boundary of [
    'selected-template badges',
    'required content',
    'current template readiness',
    'ready/locked template options',
    'suggested remixes',
    'quiz-choice readiness',
    'scaffold action',
    'scaffold runtime items',
    'scaffold ready modes',
    'reusable coverage',
    'scaffold field counts',
    'scaffold review steps',
    'shared editor contract',
    'parsed content status',
    'save-before-publish boundaries',
    'activity-editor-template privacy-scope boundaries',
    'hidden activity-editor-template handoff',
  ]) {
    assert.match(normalizedCatalog, new RegExp(boundary));
  }
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
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'parsed-content-status'),
    'Needs field review'
  );
  assert.equal(
    getHandoffItemValue(handoffView.itemViews, 'current-question-count'),
    '0 questions'
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
