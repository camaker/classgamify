import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVITY_DUPLICATE_HANDOFF_ITEM_IDS,
  buildActivityDuplicateHandoffView,
  type ActivityDuplicateHandoffItemId,
  type ActivityDuplicateHandoffView,
} from '@/activities/duplicate';
import type { ActivityContent } from '@/activities/types';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER = 'SECRET_ANSWER_TEXT';
const SECRET_DESCRIPTION = 'SECRET_DESCRIPTION_TEXT';
const SECRET_EXPLANATION = 'SECRET_EXPLANATION_TEXT';
const SECRET_FILE_ID = 'secret-file-id';
const SECRET_FILENAME = 'secret worksheet.pdf';
const SECRET_OPTION = 'SECRET_OPTION_TEXT';
const SECRET_PROMPT = 'SECRET_PROMPT_TEXT';
const SECRET_SOURCE_SUMMARY = 'SECRET_SOURCE_SUMMARY_TEXT';
const SECRET_STORAGE_KEY = 'userfiles/teacher/private-key.pdf';
const SECRET_TEACHER_NOTE = 'SECRET_TEACHER_NOTE';

const ACTIVITY_LIBRARY_CARD_SOURCE = readFileSync(
  'src/components/activities/activity-library-card.tsx',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const duplicateSourceContent: ActivityContent = {
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
      explanation: SECRET_EXPLANATION,
      id: 'question-food',
      options: [
        {
          id: 'option-secret-answer',
          isCorrect: true,
          text: SECRET_ANSWER,
        },
        {
          id: 'option-secret-distractor',
          isCorrect: false,
          text: SECRET_OPTION,
        },
      ],
      prompt: SECRET_PROMPT,
    },
  ],
  sourceMaterials: [
    {
      contentType: 'audio/mpeg',
      fileId: SECRET_FILE_ID,
      kind: 'audio',
      originalName: SECRET_FILENAME,
      size: 1200,
    },
    {
      contentType: 'application/pdf',
      fileId: 'worksheet-file-id',
      kind: 'worksheet',
      originalName: 'worksheet.pdf',
      size: 2400,
    },
  ],
  sourceSummary: SECRET_SOURCE_SUMMARY,
  subject: 'English',
  teacherNotes: [SECRET_TEACHER_NOTE],
  vocabulary: ['apple', 'bread'],
};

test('activity duplicate handoff exposes 30 safe draft-copy slices', () => {
  const handoffView = buildActivityDuplicateHandoffView({
    content: duplicateSourceContent,
    description: SECRET_DESCRIPTION,
    persisted: true,
    status: 'private',
    templateType: 'group-sort',
    title: ' Food words quick check ',
  });
  const itemIds = handoffView.itemViews.map((itemView) => itemView.id);

  assert.deepEqual(itemIds, [...ACTIVITY_DUPLICATE_HANDOFF_ITEM_IDS]);
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
    clonesAnswerExplanations: true,
    clonesQuestionOptions: true,
    clonesSourceMaterialReferences: true,
    exposesAnswerExplanationText: false,
    exposesActivityContentText: false,
    exposesAnswerText: false,
    exposesQuestionOptionText: false,
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
    preservesTemplateType: true,
    requiresOwnerScopedSource: true,
    requiresPersistedSourceForAction: true,
    resetsVisibilityToDraft: true,
    scope: 'owner-activity-duplicate',
  });

  assert.equal(
    getDuplicateHandoffValue(handoffView, 'source-activity'),
    'Food words quick check'
  );
  assert.equal(
    getDuplicateHandoffValue(handoffView, 'owner-scope'),
    'Current teacher'
  );
  assert.equal(
    getDuplicateHandoffValue(handoffView, 'persisted-source'),
    'Saved source'
  );
  assert.equal(
    getDuplicateHandoffValue(handoffView, 'source-status'),
    'Private'
  );
  assert.equal(
    getDuplicateHandoffValue(handoffView, 'action-availability'),
    'Ready'
  );
  assert.equal(
    getDuplicateHandoffValue(handoffView, 'lifecycle-gate'),
    'Derivative allowed'
  );
  assert.equal(
    getDuplicateHandoffValue(handoffView, 'derivative-scope'),
    'Owner draft'
  );
  assert.equal(
    getDuplicateHandoffValue(handoffView, 'draft-output'),
    'Draft copy'
  );
  assert.equal(
    getDuplicateHandoffValue(handoffView, 'visibility-reset'),
    'Draft visibility'
  );
  assert.equal(
    getDuplicateHandoffValue(handoffView, 'title-strategy'),
    'Copy of Food words quick check'
  );
  assert.equal(
    getDuplicateHandoffValue(handoffView, 'title-normalization'),
    'Whitespace normalized'
  );
  assert.equal(
    getDuplicateHandoffValue(handoffView, 'title-limit'),
    '120 chars'
  );
  assert.equal(
    getDuplicateHandoffValue(handoffView, 'template-preserved'),
    'Group sort'
  );
  assert.equal(
    getDuplicateHandoffValue(handoffView, 'template-transform'),
    'No transform'
  );
  assert.equal(
    getDuplicateHandoffValue(handoffView, 'description-preserved'),
    'Description copied'
  );
  assert.equal(
    getDuplicateHandoffValue(handoffView, 'content-clone'),
    'Structured copy'
  );
  assert.equal(
    getDuplicateHandoffValue(handoffView, 'reference-isolation'),
    'Independent copy'
  );
  assert.equal(getDuplicateHandoffValue(handoffView, 'questions'), '1');
  assert.equal(getDuplicateHandoffValue(handoffView, 'question-options'), '2');
  assert.equal(
    getDuplicateHandoffValue(handoffView, 'answer-explanations'),
    '1'
  );
  assert.equal(getDuplicateHandoffValue(handoffView, 'pairs'), '1');
  assert.equal(getDuplicateHandoffValue(handoffView, 'groups'), '1');
  assert.equal(getDuplicateHandoffValue(handoffView, 'vocabulary'), '2');
  assert.equal(getDuplicateHandoffValue(handoffView, 'teacher-notes'), '1');
  assert.equal(
    getDuplicateHandoffValue(handoffView, 'source-summary-privacy'),
    'Summary hidden'
  );
  assert.equal(getDuplicateHandoffValue(handoffView, 'source-materials'), '2');
  assert.equal(
    getDuplicateHandoffValue(handoffView, 'source-material-kinds'),
    '2'
  );
  assert.equal(
    getDuplicateHandoffValue(handoffView, 'source-material-privacy'),
    'File ids hidden'
  );
  assert.equal(
    getDuplicateHandoffValue(handoffView, 'assignment-snapshot-protection'),
    'Snapshots unchanged'
  );
  assert.equal(
    getDuplicateHandoffValue(handoffView, 'original-activity-protection'),
    'Unchanged'
  );

  assertNoPrivateDuplicateHandoffText(JSON.stringify(handoffView));
});

test('activity duplicate handoff keeps archived and preview sources blocked', () => {
  const archivedHandoffView = buildActivityDuplicateHandoffView({
    content: duplicateSourceContent,
    persisted: true,
    status: 'archived',
    templateType: 'quiz',
    title: 'Archived food quiz',
  });
  const previewHandoffView = buildActivityDuplicateHandoffView({
    content: duplicateSourceContent,
    persisted: false,
    status: 'private',
    templateType: 'quiz',
    title: 'Starter preview',
  });

  assert.equal(
    getDuplicateHandoffValue(archivedHandoffView, 'action-availability'),
    'Blocked'
  );
  assert.equal(
    getDuplicateHandoffValue(archivedHandoffView, 'lifecycle-gate'),
    'Restore required'
  );
  assert.equal(
    getDuplicateHandoffValue(archivedHandoffView, 'source-status'),
    'Archived'
  );
  assert.equal(
    getDuplicateHandoffValue(previewHandoffView, 'action-availability'),
    'Preview only'
  );
  assert.equal(
    getDuplicateHandoffValue(previewHandoffView, 'source-status'),
    'Preview'
  );
  assert.equal(
    getDuplicateHandoffValue(previewHandoffView, 'persisted-source'),
    'Preview source'
  );
  assertNoPrivateDuplicateHandoffText(JSON.stringify(archivedHandoffView));
  assertNoPrivateDuplicateHandoffText(JSON.stringify(previewHandoffView));
});

test('activity duplicate handoff localizes Chinese draft-copy boundaries', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const handoffView = buildActivityDuplicateHandoffView({
      content: duplicateSourceContent,
      description: SECRET_DESCRIPTION,
      persisted: true,
      status: 'private',
      templateType: 'group-sort',
      title: '食物词汇复习',
    });

    assert.equal(handoffView.title, '复制安全检查');
    assert.match(handoffView.description, /可编辑草稿/);
    assert.equal(
      getDuplicateHandoffValue(handoffView, 'action-availability'),
      '可执行'
    );
    assert.equal(
      getDuplicateHandoffValue(handoffView, 'lifecycle-gate'),
      '可派生活动'
    );
    assert.equal(
      getDuplicateHandoffValue(handoffView, 'draft-output'),
      '草稿副本'
    );
    assert.equal(
      getDuplicateHandoffValue(handoffView, 'visibility-reset'),
      '草稿可见性'
    );
    assert.equal(
      getDuplicateHandoffValue(handoffView, 'template-transform'),
      '不转换'
    );
    assertNoPrivateDuplicateHandoffText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

test('activity duplicate handoff renders stable DOM relationships', () => {
  assert.match(
    ACTIVITY_LIBRARY_CARD_SOURCE,
    /ActivityDuplicateHandoffItemView[\s\S]*ActivityDuplicateHandoffView[\s\S]*function ActivityLibraryDuplicateHandoff[\s\S]*const titleId = useId\(\)[\s\S]*const descriptionId = useId\(\)[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-labelledby=\{titleId\}[\s\S]*className="sr-only"[\s\S]*data-handoff="activity-duplicate"[\s\S]*data-handoff-scope=\{handoff\.privacy\.scope\}[\s\S]*id=\{titleId\}[\s\S]*id=\{descriptionId\}[\s\S]*handoff\.itemViews\.map[\s\S]*ActivityLibraryDuplicateHandoffItem[\s\S]*function ActivityLibraryDuplicateHandoffItem[\s\S]*const labelId = `activity-duplicate-handoff-\$\{item\.id\}-label`[\s\S]*const valueId = `activity-duplicate-handoff-\$\{item\.id\}-value`[\s\S]*const descriptionId = `activity-duplicate-handoff-\$\{item\.id\}-description`[\s\S]*data-handoff-item=\{item\.id\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{item\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/,
    'Activity duplicate handoff should render each draft-copy slice with stable label, value, and description relationships.'
  );
});

test('activity duplicate focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /pnpm exec tsx --test scripts\/activity-duplicate-handoff-semantic-views\.test\.ts/,
    'E2E catalog should point activity duplicate work at the focused script gate.'
  );
  for (const boundary of [
    'owner-scoped duplicate availability',
    'persisted-source requirements',
    'archived restore gates',
    'draft visibility reset',
    'duplicate title strategy/limit',
    'template preservation',
    'structured content cloning',
    'source material reference normalization',
    'assignment snapshot protection',
    'original activity protection',
    'activity duplicate privacy-scope boundaries',
    'hidden activity duplicate handoff',
  ]) {
    assert.match(
      TEST_CATALOG_SOURCE,
      new RegExp(boundary.replace(/[ /-]+/g, '[\\s/-]+')),
      `E2E catalog should mention activity duplicate boundary: ${boundary}`
    );
  }
});

function getDuplicateHandoffValue(
  view: ActivityDuplicateHandoffView,
  id: ActivityDuplicateHandoffItemId
) {
  const itemView = view.itemViews.find((item) => item.id === id);
  assert.ok(itemView, `Missing duplicate handoff item ${id}`);
  return itemView.value;
}

function assertNoPrivateDuplicateHandoffText(serializedView: string) {
  for (const privateValue of [
    SECRET_ANSWER,
    SECRET_DESCRIPTION,
    SECRET_EXPLANATION,
    SECRET_FILE_ID,
    SECRET_FILENAME,
    SECRET_OPTION,
    SECRET_PROMPT,
    SECRET_SOURCE_SUMMARY,
    SECRET_STORAGE_KEY,
    SECRET_TEACHER_NOTE,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Duplicate handoff leaked private text: ${privateValue}`
    );
  }
}
