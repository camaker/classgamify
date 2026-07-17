import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVITY_TEMPLATE_REMIX_HANDOFF_ITEM_IDS,
  buildActivityTemplateRemixHandoffView,
  type ActivityTemplateRemixHandoffItemId,
  type ActivityTemplateRemixHandoffView,
} from '@/activities/template-remix';
import type { ActivityContent } from '@/activities/types';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER = 'SECRET_ANSWER_TEXT';
const SECRET_FILE_ID = 'secret-remix-file-id';
const SECRET_FILENAME = 'secret remix worksheet.pdf';
const SECRET_PROMPT = 'SECRET_PROMPT_TEXT';
const SECRET_SOURCE_SUMMARY = 'SECRET_SOURCE_SUMMARY_TEXT';
const SECRET_STORAGE_KEY = 'userfiles/teacher/remix-private-key.pdf';
const SECRET_TEACHER_NOTE = 'SECRET_TEACHER_NOTE';

const ACTIVITY_LIBRARY_COMPATIBILITY_PANEL_SOURCE = readFileSync(
  'src/components/activities/activity-library-compatibility-panel.tsx',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const remixReadyContent: ActivityContent = {
  difficulty: 'core',
  gradeBand: 'Grade 4',
  groups: [
    {
      id: 'group-food',
      items: ['apple', 'bread'],
      label: 'Food',
    },
  ],
  language: 'en',
  learningGoal: 'Students review food words before homework.',
  pairs: [
    {
      id: 'pair-hot',
      left: 'hot',
      right: 'cold',
    },
  ],
  questions: [
    {
      answer: SECRET_ANSWER,
      explanation: 'Teacher-only answer explanation',
      id: 'question-food',
      prompt: SECRET_PROMPT,
    },
  ],
  sourceMaterials: [
    {
      contentType: 'application/pdf',
      fileId: SECRET_FILE_ID,
      kind: 'worksheet',
      originalName: SECRET_FILENAME,
      size: 2400,
      storageKey: SECRET_STORAGE_KEY,
    } as ActivityContent['sourceMaterials'][number] & {
      storageKey: string;
    },
  ],
  sourceSummary: SECRET_SOURCE_SUMMARY,
  subject: 'English',
  teacherNotes: [SECRET_TEACHER_NOTE],
  vocabulary: ['apple', 'bread'],
};

test('activity template remix handoff exposes 30 safe draft-copy slices', () => {
  const handoffView = buildActivityTemplateRemixHandoffView({
    content: remixReadyContent,
    currentTemplateType: 'quiz',
    sourceTitle: ' Food words quick check ',
    visibility: 'private',
  });
  const itemIds = handoffView.itemViews.map((itemView) => itemView.id);

  assert.deepEqual(itemIds, [...ACTIVITY_TEMPLATE_REMIX_HANDOFF_ITEM_IDS]);
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
    clonesSourceMaterialReferences: true,
    excludesCurrentTemplate: true,
    exposesActivityContentText: false,
    exposesAnswerText: false,
    exposesQuestionPromptText: false,
    exposesSourceMaterialFilenames: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialStorageKeys: false,
    exposesSourceSummaryText: false,
    exposesTeacherNotesText: false,
    itemIds,
    modifiesOriginalActivity: false,
    modifiesPublishedAssignmentSnapshots: false,
    outputVisibility: 'draft',
    requiresOwnerScopedSource: true,
    scope: 'deterministic-template-remix',
    targetTemplatesAreReadyOnly: true,
  });

  assert.equal(getRemixHandoffValue(handoffView, 'current-template'), 'Quiz');
  assert.equal(getRemixHandoffValue(handoffView, 'current-readiness'), 'Ready');
  assert.equal(getRemixHandoffValue(handoffView, 'ready-template-count'), '8');
  assert.equal(getRemixHandoffValue(handoffView, 'suggested-remix-count'), '7');
  assert.equal(
    getRemixHandoffValue(handoffView, 'suggested-remix-actions'),
    'Match, Lines, and Sort'
  );
  assert.equal(getRemixHandoffValue(handoffView, 'locked-template-count'), '0');
  assert.equal(getRemixHandoffValue(handoffView, 'locked-diagnostics'), '0');
  assert.equal(getRemixHandoffValue(handoffView, 'missing-requirements'), '0');
  assert.equal(
    getRemixHandoffValue(handoffView, 'owner-scope'),
    'Current teacher'
  );
  assert.equal(getRemixHandoffValue(handoffView, 'source-status'), 'Private');
  assert.equal(
    getRemixHandoffValue(handoffView, 'lifecycle-gate'),
    'Ready to remix'
  );
  assert.equal(
    getRemixHandoffValue(handoffView, 'ready-target-only'),
    'Ready targets'
  );
  assert.equal(
    getRemixHandoffValue(handoffView, 'current-template-excluded'),
    'Current excluded'
  );
  assert.equal(
    getRemixHandoffValue(handoffView, 'visible-action-limit'),
    '3 actions'
  );
  assert.equal(getRemixHandoffValue(handoffView, 'draft-output'), 'Draft copy');
  assert.equal(
    getRemixHandoffValue(handoffView, 'title-strategy'),
    'Food words quick check (Match)'
  );
  assert.equal(getRemixHandoffValue(handoffView, 'title-limit'), '120 chars');
  assert.equal(getRemixHandoffValue(handoffView, 'template-switch'), 'Match');
  assert.equal(
    getRemixHandoffValue(handoffView, 'content-clone'),
    'Same structured content'
  );
  assert.equal(getRemixHandoffValue(handoffView, 'questions'), '1');
  assert.equal(getRemixHandoffValue(handoffView, 'pairs'), '1');
  assert.equal(getRemixHandoffValue(handoffView, 'groups'), '1');
  assert.equal(getRemixHandoffValue(handoffView, 'vocabulary'), '2');
  assert.equal(getRemixHandoffValue(handoffView, 'teacher-notes'), '1');
  assert.equal(getRemixHandoffValue(handoffView, 'source-materials'), '1');
  assert.equal(getRemixHandoffValue(handoffView, 'source-material-kinds'), '1');
  assert.equal(
    getRemixHandoffValue(handoffView, 'source-material-privacy'),
    'File ids hidden'
  );
  assert.equal(
    getRemixHandoffValue(handoffView, 'assignment-snapshot-protection'),
    'Snapshots unchanged'
  );
  assert.equal(
    getRemixHandoffValue(handoffView, 'original-activity-protection'),
    'Source unchanged'
  );
  assert.equal(
    getRemixHandoffValue(handoffView, 'privacy-guard'),
    'Content hidden'
  );

  assertNoPrivateRemixHandoffText(JSON.stringify(handoffView));
});

test('activity template remix handoff handles restore and no-target gates', () => {
  const archivedHandoffView = buildActivityTemplateRemixHandoffView({
    content: remixReadyContent,
    currentTemplateType: 'quiz',
    sourceTitle: 'Archived food quiz',
    visibility: 'archived',
  });
  const sparseHandoffView = buildActivityTemplateRemixHandoffView({
    content: {
      ...remixReadyContent,
      groups: [],
      pairs: [],
      questions: [],
    },
    currentTemplateType: 'quiz',
    sourceTitle: 'Sparse review',
    visibility: 'private',
  });

  assert.equal(
    getRemixHandoffValue(archivedHandoffView, 'lifecycle-gate'),
    'Restore required'
  );
  assert.equal(
    getRemixHandoffValue(sparseHandoffView, 'current-readiness'),
    'Needs more content'
  );
  assert.equal(
    getRemixHandoffValue(sparseHandoffView, 'ready-template-count'),
    '0'
  );
  assert.equal(
    getRemixHandoffValue(sparseHandoffView, 'suggested-remix-count'),
    '0'
  );
  assert.equal(
    getRemixHandoffValue(sparseHandoffView, 'suggested-remix-actions'),
    'None'
  );
  assert.equal(
    getRemixHandoffValue(sparseHandoffView, 'locked-template-count'),
    '8'
  );
  assert.equal(
    getRemixHandoffValue(sparseHandoffView, 'missing-requirements'),
    '3'
  );
  assert.equal(
    getRemixHandoffValue(sparseHandoffView, 'lifecycle-gate'),
    'No ready target'
  );
  assert.equal(
    getRemixHandoffValue(sparseHandoffView, 'title-strategy'),
    'No ready target'
  );
  assert.equal(
    getRemixHandoffValue(sparseHandoffView, 'template-switch'),
    'No ready target'
  );
  assertNoPrivateRemixHandoffText(JSON.stringify(archivedHandoffView));
  assertNoPrivateRemixHandoffText(JSON.stringify(sparseHandoffView));
});

test('activity template remix handoff localizes Chinese draft-copy boundaries', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const handoffView = buildActivityTemplateRemixHandoffView({
      content: remixReadyContent,
      currentTemplateType: 'quiz',
      sourceTitle: '食物词汇复习',
      visibility: 'private',
    });

    assert.equal(handoffView.title, '模板改编安全检查');
    assert.match(handoffView.description, /草稿副本/);
    assert.equal(getRemixHandoffValue(handoffView, 'lifecycle-gate'), '可改编');
    assert.equal(
      getRemixHandoffValue(handoffView, 'ready-target-only'),
      '仅可用目标'
    );
    assert.equal(getRemixHandoffValue(handoffView, 'draft-output'), '草稿副本');
    assert.equal(
      getRemixHandoffValue(handoffView, 'content-clone'),
      '相同结构化内容'
    );
    assert.equal(
      getRemixHandoffValue(handoffView, 'privacy-guard'),
      '内容隐藏'
    );
    assertNoPrivateRemixHandoffText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

test('activity template remix handoff renders stable DOM relationships', () => {
  assert.match(
    ACTIVITY_LIBRARY_COMPATIBILITY_PANEL_SOURCE,
    /function ActivityLibraryTemplateRemixHandoff[\s\S]*className="sr-only"/,
    'Template-remix audit semantics should stay hidden while remix actions remain visible.'
  );
  assert.match(
    ACTIVITY_LIBRARY_COMPATIBILITY_PANEL_SOURCE,
    /ActivityTemplateRemixHandoffItemView[\s\S]*ActivityTemplateRemixHandoffView[\s\S]*function ActivityLibraryTemplateRemixHandoff[\s\S]*const titleId = useId\(\)[\s\S]*const descriptionId = useId\(\)[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-labelledby=\{titleId\}[\s\S]*data-handoff="activity-template-remix"[\s\S]*data-handoff-scope=\{handoff\.privacy\.scope\}[\s\S]*id=\{titleId\}[\s\S]*id=\{descriptionId\}[\s\S]*handoff\.itemViews\.map[\s\S]*ActivityLibraryTemplateRemixHandoffItem[\s\S]*function ActivityLibraryTemplateRemixHandoffItem[\s\S]*const labelId = `activity-template-remix-handoff-\$\{item\.id\}-label`[\s\S]*const valueId = `activity-template-remix-handoff-\$\{item\.id\}-value`[\s\S]*const descriptionId = `activity-template-remix-handoff-\$\{item\.id\}-description`[\s\S]*data-handoff-item=\{item\.id\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{item\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/,
    'Template remix handoff should render each draft-copy slice with stable label, value, and description relationships.'
  );
});

test('activity template remix focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /pnpm exec tsx --test scripts\/activity-template-remix-handoff-semantic-views\.test\.ts/,
    'E2E catalog should point deterministic template remix work at the focused script gate.'
  );
  for (const boundary of [
    'template readiness',
    'suggested Copy as actions',
    'ready-target-only gating',
    'archived restore gates',
    'remixed draft title strategy/limit',
    'content and source-material clone counts',
    'assignment snapshot protection',
    'original-activity protection',
    'template remix privacy-scope boundaries',
    'activity-card compatibility handoff',
  ]) {
    assert.match(
      TEST_CATALOG_SOURCE,
      new RegExp(boundary.replace(/[ /-]+/g, '[\\s/-]+')),
      `E2E catalog should mention template remix boundary: ${boundary}`
    );
  }
});

function getRemixHandoffValue(
  view: ActivityTemplateRemixHandoffView,
  id: ActivityTemplateRemixHandoffItemId
) {
  const itemView = view.itemViews.find((item) => item.id === id);
  assert.ok(itemView, `Missing template remix handoff item ${id}`);
  return itemView.value;
}

function assertNoPrivateRemixHandoffText(serializedView: string) {
  for (const privateValue of [
    SECRET_ANSWER,
    SECRET_FILE_ID,
    SECRET_FILENAME,
    SECRET_PROMPT,
    SECRET_SOURCE_SUMMARY,
    SECRET_STORAGE_KEY,
    SECRET_TEACHER_NOTE,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Template remix handoff leaked private text: ${privateValue}`
    );
  }
}
