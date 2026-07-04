import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ACTIVITY_TEMPLATE_SCAFFOLD_QUALITY_HANDOFF_ITEM_IDS,
  buildActivityTemplateScaffoldInput,
  buildActivityTemplateScaffoldQualityHandoffView,
  buildActivityTemplateScaffoldReadinessSummary,
  type ActivityTemplateScaffoldQualityHandoffItemId,
  type ActivityTemplateScaffoldQualityHandoffView,
} from '@/activities/scaffolds';
import { getActivityEditorDefaultInput } from '@/activities/editor';
import { getRuntimeItems } from '@/activities/runtime';
import {
  ACTIVITY_TEMPLATE_TYPES,
  type ActivityTemplateType,
} from '@/activities/types';
import { buildActivityContent } from '@/activities/validation';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

const SECRET_ANSWER = 'SECRET_SCAFFOLD_ANSWER_SHOULD_NOT_LEAK';
const SECRET_CURRENT_FIELD = 'SECRET_CURRENT_FIELD_SHOULD_NOT_LEAK';
const SECRET_FILE_ID = 'SECRET_SCAFFOLD_FILE_ID_SHOULD_NOT_LEAK';
const SECRET_STORAGE_KEY = 'classroom/private/scaffold-source.pdf';

const EXPECTED_RUNTIME_ITEM_COUNTS = {
  'fill-blank': 4,
  'group-sort': 8,
  'line-match': 8,
  listening: 4,
  'match-up': 8,
  'matching-pairs': 8,
  'open-box': 4,
  quiz: 4,
} as const satisfies Record<ActivityTemplateType, number>;

overwriteGetLocale(() => 'en');

test('activity template scaffold quality handoff exposes 30 safe slices', () => {
  const handoffView = buildActivityTemplateScaffoldQualityHandoffView({
    current: buildPrivateCurrentInput(),
  });
  const itemIds = handoffView.itemViews.map((itemView) => itemView.id);

  assert.deepEqual(itemIds, [
    ...ACTIVITY_TEMPLATE_SCAFFOLD_QUALITY_HANDOFF_ITEM_IDS,
  ]);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(
    handoffView.itemViews.every(
      (itemView) =>
        Boolean(itemView.ariaLabel) &&
        Boolean(itemView.description) &&
        Boolean(itemView.label) &&
        Boolean(itemView.value)
    ),
    true
  );
  assert.deepEqual(handoffView.privacy, {
    exposesAnswerText: false,
    exposesCurrentFieldText: false,
    exposesQuestionPromptText: false,
    exposesRawScaffoldContent: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialStorageKeys: false,
    exposesTeacherNotesText: false,
    itemIds,
    scope: 'activity-template-scaffold-quality',
    usesCreateActivityInputContract: true,
    verifiesAllTemplateScaffolds: true,
  });

  assert.equal(getHandoffValue(handoffView, 'scope'), 'Scaffold quality');
  assert.equal(getHandoffValue(handoffView, 'template-count'), '8 templates');
  assert.equal(
    getHandoffValue(handoffView, 'create-input-contract'),
    'CreateActivityInput'
  );
  assert.equal(getHandoffValue(handoffView, 'catalog-coverage'), '8/8');
  assert.equal(getHandoffValue(handoffView, 'scaffold-parse-contract'), '8/8');
  assert.equal(
    getHandoffValue(handoffView, 'runtime-item-contract'),
    '48 playable items'
  );
  assert.equal(getHandoffValue(handoffView, 'ready-template-target'), '8/8');
  assert.equal(getHandoffValue(handoffView, 'reusable-target'), '8/8');
  assert.equal(getHandoffValue(handoffView, 'question-coverage'), '8/8');
  assert.equal(getHandoffValue(handoffView, 'pair-coverage'), '8/8');
  assert.equal(getHandoffValue(handoffView, 'group-coverage'), '8/8');
  assert.equal(getHandoffValue(handoffView, 'vocabulary-coverage'), '8/8');
  assert.equal(getHandoffValue(handoffView, 'teacher-note-coverage'), '8/8');
  assert.equal(
    getHandoffValue(handoffView, 'quiz-scaffold'),
    '4 items · 8 modes'
  );
  assert.equal(
    getHandoffValue(handoffView, 'match-up-scaffold'),
    '8 items · 8 modes'
  );
  assert.equal(
    getHandoffValue(handoffView, 'line-match-scaffold'),
    '8 items · 8 modes'
  );
  assert.equal(
    getHandoffValue(handoffView, 'group-sort-scaffold'),
    '8 items · 8 modes'
  );
  assert.equal(
    getHandoffValue(handoffView, 'fill-blank-scaffold'),
    '4 items · 8 modes'
  );
  assert.equal(
    getHandoffValue(handoffView, 'listening-scaffold'),
    '4 items · 8 modes'
  );
  assert.equal(
    getHandoffValue(handoffView, 'matching-pairs-scaffold'),
    '8 items · 8 modes'
  );
  assert.equal(
    getHandoffValue(handoffView, 'open-box-scaffold'),
    '4 items · 8 modes'
  );
  assert.equal(
    getHandoffValue(handoffView, 'public-template-entry'),
    'Create entry'
  );
  assert.equal(
    getHandoffValue(handoffView, 'worksheet-entry'),
    'Worksheet entry'
  );
  assert.equal(
    getHandoffValue(handoffView, 'editor-review-loop'),
    'Review before save'
  );
  assert.equal(
    getHandoffValue(handoffView, 'save-before-publish'),
    'Save before publish'
  );
  assert.equal(
    getHandoffValue(handoffView, 'source-material-boundary'),
    'Hidden'
  );
  assert.equal(getHandoffValue(handoffView, 'raw-scaffold-boundary'), 'Hidden');
  assert.equal(
    getHandoffValue(handoffView, 'current-field-boundary'),
    'Hidden'
  );
  assert.equal(getHandoffValue(handoffView, 'answer-key-boundary'), 'Hidden');
  assert.equal(getHandoffValue(handoffView, 'privacy-guard'), 'Hidden');

  assertNoPrivateScaffoldQualityText(JSON.stringify(handoffView));
});

test('activity template scaffolds all parse into reusable classroom content', () => {
  for (const templateType of ACTIVITY_TEMPLATE_TYPES) {
    const scaffoldInput = buildActivityTemplateScaffoldInput({
      current: buildPrivateCurrentInput(),
      templateType,
    });
    const content = buildActivityContent(scaffoldInput);
    const summary = buildActivityTemplateScaffoldReadinessSummary({
      current: buildPrivateCurrentInput(),
      templateType,
    });

    assert.equal(content.questions.length, 4, `${templateType} questions`);
    assert.equal(content.pairs.length, 8, `${templateType} pairs`);
    assert.equal(content.groups.length, 3, `${templateType} groups`);
    assert.equal(content.vocabulary.length, 8, `${templateType} vocabulary`);
    assert.equal(content.teacherNotes.length, 2, `${templateType} notes`);
    assert.equal(
      content.sourceMaterials.length,
      1,
      `${templateType} materials`
    );
    assert.equal(summary.readyTemplateCount, 8, `${templateType} ready modes`);
    assert.equal(
      summary.isReusableAcrossTemplates,
      true,
      `${templateType} reusable`
    );
    assert.equal(
      getRuntimeItems(templateType, content).length,
      EXPECTED_RUNTIME_ITEM_COUNTS[templateType],
      `${templateType} runtime items`
    );
    assert.equal(
      summary.coverageMetrics.every((metric) => metric.meetsTarget),
      true,
      `${templateType} coverage target`
    );
  }
});

test('activity template scaffold quality handoff localizes Chinese boundaries', () => {
  overwriteGetLocale(() => 'zh');

  const handoffView = buildActivityTemplateScaffoldQualityHandoffView({
    current: buildPrivateCurrentInput(),
  });

  assert.equal(handoffView.title, '脚手架质量交接');
  assert.match(handoffView.description, /30 切片/);
  assert.equal(getHandoffValue(handoffView, 'scope'), '脚手架质量');
  assert.equal(getHandoffValue(handoffView, 'template-count'), '8 个模板');
  assert.equal(
    getHandoffValue(handoffView, 'runtime-item-contract'),
    '48 个可玩项目'
  );
  assert.equal(
    getHandoffValue(handoffView, 'quiz-scaffold'),
    '4 个项目 · 8 个模式'
  );
  assert.equal(
    getHandoffValue(handoffView, 'public-template-entry'),
    '创建入口'
  );
  assert.equal(
    getHandoffValue(handoffView, 'editor-review-loop'),
    '保存前复核'
  );
  assert.equal(getHandoffValue(handoffView, 'privacy-guard'), '已隐藏');

  overwriteGetLocale(() => 'en');
});

function buildPrivateCurrentInput() {
  return {
    ...getActivityEditorDefaultInput(),
    questionsText: `${SECRET_CURRENT_FIELD} | ${SECRET_ANSWER}`,
    sourceMaterials: [
      {
        fileId: SECRET_FILE_ID,
        kind: 'worksheet-document',
        originalName: `${SECRET_STORAGE_KEY}?token=private`,
      },
    ],
    teacherNotesText: SECRET_CURRENT_FIELD,
  };
}

function getHandoffValue(
  view: ActivityTemplateScaffoldQualityHandoffView,
  id: ActivityTemplateScaffoldQualityHandoffItemId
) {
  const itemView = view.itemViews.find((item) => item.id === id);
  assert.ok(itemView, `Missing scaffold quality handoff item ${id}`);
  return itemView.value;
}

function assertNoPrivateScaffoldQualityText(serializedView: string) {
  for (const privateValue of [
    SECRET_ANSWER,
    SECRET_CURRENT_FIELD,
    SECRET_FILE_ID,
    SECRET_STORAGE_KEY,
    'token=private',
    'apple',
    'milk',
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Scaffold quality handoff leaked private text: ${privateValue}`
    );
  }
}
