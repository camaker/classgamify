import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVITY_AI_REMIX_ASSIST_HANDOFF_ITEM_IDS,
  buildActivityAiRemixAssistHandoffView,
  buildActivityAiRemixAssistPlan,
  type ActivityAiRemixAssistHandoffItemId,
  type ActivityAiRemixAssistHandoffView,
} from '@/activities/ai-remix-assist';
import type { ActivityContent } from '@/activities/types';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER = 'SECRET_AI_REMIX_ANSWER';
const SECRET_FILE_ID = 'secret-ai-remix-file-id';
const SECRET_FILENAME = 'secret ai remix worksheet.pdf';
const SECRET_PROMPT = 'SECRET_AI_REMIX_PROMPT';
const SECRET_SOURCE_SUMMARY = 'SECRET_AI_REMIX_SOURCE_SUMMARY';
const SECRET_STORAGE_KEY = 'userfiles/teacher/ai-remix-private-key.pdf';
const SECRET_TEACHER_NOTE = 'SECRET_AI_REMIX_TEACHER_NOTE';

const ACTIVITY_LIBRARY_COMPATIBILITY_PANEL_SOURCE = readFileSync(
  'src/components/activities/activity-library-compatibility-panel.tsx',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const questionOnlyContent: ActivityContent = {
  difficulty: 'core',
  gradeBand: 'Grade 4',
  groups: [],
  language: 'en',
  learningGoal: 'Students review target words before a template remix.',
  pairs: [],
  questions: [
    {
      answer: SECRET_ANSWER,
      explanation: 'Teacher-only explanation',
      id: 'q-secret',
      prompt: SECRET_PROMPT,
    },
    {
      answer: 'visible fixture answer',
      id: 'q-fixture',
      prompt: 'Visible fixture prompt',
    },
  ],
  sourceMaterials: [
    {
      contentType: 'application/pdf',
      fileId: SECRET_FILE_ID,
      kind: 'worksheet',
      originalName: SECRET_FILENAME,
      size: 2048,
      storageKey: SECRET_STORAGE_KEY,
    } as ActivityContent['sourceMaterials'][number] & {
      storageKey: string;
    },
  ],
  sourceSummary: SECRET_SOURCE_SUMMARY,
  subject: 'English',
  teacherNotes: [SECRET_TEACHER_NOTE],
  vocabulary: ['fixture term'],
};

test('AI remix assist handoff exposes 30 safe teacher-reviewed slices', () => {
  const handoffView = buildActivityAiRemixAssistHandoffView({
    content: questionOnlyContent,
    currentTemplateType: 'quiz',
    sourceTitle: ' Question review ',
    visibility: 'draft',
  });
  const itemIds = handoffView.itemViews.map((itemView) => itemView.id);

  assert.deepEqual(itemIds, [...ACTIVITY_AI_REMIX_ASSIST_HANDOFF_ITEM_IDS]);
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
    aiCanFillMissingStructuredFields: true,
    appliesBeforeActivitySave: true,
    exposesActivityContentText: false,
    exposesAnswerText: false,
    exposesPromptText: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialFilenames: false,
    exposesSourceMaterialStorageKeys: false,
    exposesTeacherNotesText: false,
    itemIds,
    modifiesOriginalActivity: false,
    modifiesPublishedAssignmentSnapshots: false,
    publishesAssignmentWithoutTeacherAction: false,
    readsSourceMaterialBytes: false,
    requiresEditorReview: true,
    savesActivityWithoutTeacherAction: false,
    scope: 'teacher-reviewed-ai-remix-assist',
  });

  assert.deepEqual(getAiRemixAssistHandoffValues(handoffView), {
    'ai-completion-path': 'Draft assist ready',
    'assignment-snapshot-protection': 'Snapshots unchanged',
    'deterministic-remix-path': 'Needs structure',
    'draft-output': 'Editor draft',
    'editor-review-gate': 'Teacher review required',
    'group-count': '0',
    'locked-target-count': '4',
    'missing-requirement-count': '1',
    'missing-requirement-list': 'match pairs',
    'original-activity-protection': 'Source unchanged',
    'owner-scope': 'Current teacher',
    'pair-count': '0',
    'persistence-boundary': 'Not auto-saved',
    'privacy-guard': 'Private text hidden',
    'prompt-source': 'Structured editor context',
    'publish-boundary': 'Save before publish',
    'question-count': '2',
    'review-checklist': '5 checks',
    'source-file-byte-guard': 'Bytes not read',
    'source-lifecycle-gate': 'Ready',
    'source-material-provenance': '1 materials, 1 kinds',
    'source-template': 'Quiz',
    'storage-key-guard': 'Storage hidden',
    'suggested-ready-count': '3',
    'target-readiness': 'Needs AI completion',
    'target-template': 'Match',
    'teacher-note-count': '1',
    'template-switch': 'Match',
    'title-strategy': 'Question review (Match)',
    'vocabulary-count': '1',
  });
  assertNoPrivateAiRemixAssistText(JSON.stringify(handoffView));
});

test('AI remix assist distinguishes ready targets and archived sources', () => {
  const readyPlan = buildActivityAiRemixAssistPlan({
    content: questionOnlyContent,
    currentTemplateType: 'quiz',
    sourceTitle: 'Question review',
    targetTemplateType: 'fill-blank',
    visibility: 'draft',
  });
  const readyHandoffView = buildActivityAiRemixAssistHandoffView({
    content: questionOnlyContent,
    currentTemplateType: 'quiz',
    sourceTitle: 'Question review',
    targetTemplateType: 'fill-blank',
    visibility: 'draft',
  });
  const archivedHandoffView = buildActivityAiRemixAssistHandoffView({
    content: questionOnlyContent,
    currentTemplateType: 'quiz',
    sourceTitle: 'Question review',
    visibility: 'archived',
  });

  assert.equal(readyPlan.targetStatus, 'deterministic-ready');
  assert.equal(
    getAiRemixAssistHandoffValue(readyHandoffView, 'target-readiness'),
    'Ready without AI'
  );
  assert.equal(
    getAiRemixAssistHandoffValue(readyHandoffView, 'missing-requirement-list'),
    'None'
  );
  assert.equal(
    getAiRemixAssistHandoffValue(readyHandoffView, 'deterministic-remix-path'),
    'Copy as draft'
  );
  assert.equal(
    getAiRemixAssistHandoffValue(readyHandoffView, 'ai-completion-path'),
    'Not needed'
  );
  assert.equal(
    getAiRemixAssistHandoffValue(archivedHandoffView, 'target-readiness'),
    'Restore required'
  );
  assert.equal(
    getAiRemixAssistHandoffValue(archivedHandoffView, 'source-lifecycle-gate'),
    'Restore first'
  );
  assertNoPrivateAiRemixAssistText(JSON.stringify(readyHandoffView));
  assertNoPrivateAiRemixAssistText(JSON.stringify(archivedHandoffView));
});

test('AI remix assist handoff localizes Chinese target readiness', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const handoffView = buildActivityAiRemixAssistHandoffView({
      content: questionOnlyContent,
      currentTemplateType: 'quiz',
      sourceTitle: '问题复习',
      visibility: 'draft',
    });

    assert.equal(handoffView.title, 'AI 改编辅助交接');
    assert.match(handoffView.description, /30 切片/);
    assert.equal(
      getAiRemixAssistHandoffValue(handoffView, 'target-readiness'),
      '需要 AI 补全'
    );
    assert.equal(
      getAiRemixAssistHandoffValue(handoffView, 'missing-requirement-list'),
      '配对项'
    );
    assert.equal(
      getAiRemixAssistHandoffValue(handoffView, 'source-file-byte-guard'),
      '不读取文件内容'
    );
    assertNoPrivateAiRemixAssistText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

test('AI remix assist handoff renders stable DOM relationships', () => {
  assert.match(
    ACTIVITY_LIBRARY_COMPATIBILITY_PANEL_SOURCE,
    /ActivityAiRemixAssistHandoffItemView[\s\S]*ActivityAiRemixAssistHandoffView[\s\S]*function ActivityLibraryAiRemixAssistHandoff[\s\S]*const titleId = useId\(\)[\s\S]*const descriptionId = useId\(\)[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-labelledby=\{titleId\}[\s\S]*className="sr-only"[\s\S]*data-handoff="activity-ai-remix-assist"[\s\S]*id=\{titleId\}[\s\S]*id=\{descriptionId\}[\s\S]*handoff\.itemViews\.map[\s\S]*ActivityLibraryAiRemixAssistHandoffItem[\s\S]*function ActivityLibraryAiRemixAssistHandoffItem[\s\S]*const labelId = `activity-ai-remix-assist-handoff-\$\{item\.id\}-label`[\s\S]*const valueId = `activity-ai-remix-assist-handoff-\$\{item\.id\}-value`[\s\S]*const descriptionId = `activity-ai-remix-assist-handoff-\$\{item\.id\}-description`[\s\S]*data-handoff-item=\{item\.id\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{item\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/,
    'AI remix assist handoff should render each teacher-reviewed assist slice with stable label, value, and description relationships.'
  );
});

test('AI remix assist focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /pnpm exec tsx --test scripts\/activity-ai-remix-assist-handoff-semantic-views\.test\.ts/,
    'E2E catalog should point AI remix assist work at the focused script gate.'
  );
  for (const boundary of [
    'source/target template diagnosis',
    'target readiness',
    'missing structured requirements',
    'deterministic-remix versus AI-completion paths',
    'editor-review gates',
    'draft/persist/publish boundaries',
    'source-material provenance guards',
    'content coverage counts',
    'hidden AI remix assist handoff',
  ]) {
    assert.match(
      TEST_CATALOG_SOURCE,
      new RegExp(boundary.replace(/[ /-]+/g, '[\\s/-]+')),
      `E2E catalog should mention AI remix assist boundary: ${boundary}`
    );
  }
});

function getAiRemixAssistHandoffValues(view: ActivityAiRemixAssistHandoffView) {
  return Object.fromEntries(
    view.itemViews.map((itemView) => [itemView.id, itemView.value])
  );
}

function getAiRemixAssistHandoffValue(
  view: ActivityAiRemixAssistHandoffView,
  id: ActivityAiRemixAssistHandoffItemId
) {
  const itemView = view.itemViews.find((item) => item.id === id);
  assert.ok(itemView, `Missing AI remix assist handoff item ${id}`);
  return itemView.value;
}

function assertNoPrivateAiRemixAssistText(serializedView: string) {
  for (const privateValue of [
    SECRET_ANSWER,
    SECRET_FILE_ID,
    SECRET_FILENAME,
    SECRET_PROMPT,
    SECRET_SOURCE_SUMMARY,
    SECRET_STORAGE_KEY,
    SECRET_TEACHER_NOTE,
    'visible fixture answer',
    'Visible fixture prompt',
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `AI remix assist handoff leaked private text: ${privateValue}`
    );
  }
}
