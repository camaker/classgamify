import assert from 'node:assert/strict';
import test from 'node:test';
import type { ActivitySourceMaterialDraftNoteView } from '@/activities/draft-source';
import {
  ACTIVITY_DRAFT_META_HANDOFF_ITEM_IDS,
  buildActivityDraftMeta,
  buildActivityDraftMetaSummaryView,
  type ActivityDraftMetaHandoffItemId,
  type ActivityDraftMetaHandoffView,
} from '@/activities/draft-meta';
import type { CreateActivityInput } from '@/activities/validation';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER_TEXT = 'SECRET_ANSWER_TEXT';
const SECRET_EXPLANATION_TEXT = 'SECRET_EXPLANATION_TEXT';
const SECRET_FILE_ID = 'SECRET_FILE_ID_SHOULD_NOT_LEAK';
const SECRET_OPTION_TEXT = 'SECRET_OPTION_TEXT';
const SECRET_PROMPT_TEXT = 'SECRET_PROMPT_TEXT';
const SECRET_SOURCE_SUMMARY = 'SECRET_SOURCE_SUMMARY_TEXT';
const SECRET_STORAGE_KEY = 'classroom/private/SECRET_STORAGE_KEY.pdf';
const SECRET_TEACHER_NOTE = 'SECRET_TEACHER_NOTE';

const reviewedDraftInput: CreateActivityInput = {
  description: 'Weather vocabulary review',
  difficulty: 'core',
  gradeBand: 'Grade 4',
  groupsText: 'Weather | rain, storm',
  language: 'en',
  learningGoal: 'Students review weather words before a class activity.',
  pairsText: 'hot | cold',
  questionsText: [
    SECRET_PROMPT_TEXT,
    SECRET_ANSWER_TEXT,
    `${SECRET_ANSWER_TEXT}, ${SECRET_OPTION_TEXT}, forecast, climate`,
    SECRET_EXPLANATION_TEXT,
  ].join(' | '),
  sourceSummary: SECRET_SOURCE_SUMMARY,
  subject: 'Science',
  teacherNotesText: SECRET_TEACHER_NOTE,
  templateType: 'quiz',
  title: 'Weather quick check',
  visibility: 'draft',
  vocabularyText: 'rain, storm',
};

const safeSourceMaterialNoteViews: ActivitySourceMaterialDraftNoteView[] = [
  {
    kindLabel: 'Worksheet document',
    name: 'Weather worksheet.pdf',
  },
  {
    kindLabel: 'Audio',
    name: 'Listening track.mp3',
  },
  {
    kindLabel: 'storageKey',
    name: SECRET_STORAGE_KEY,
  },
  {
    kindLabel: 'Worksheet document',
    name: 'Weather worksheet.pdf',
  },
];

test('AI draft meta handoff exposes 30 safe save-review slices', () => {
  const summaryView = buildActivityDraftMetaSummaryView({
    meta: buildActivityDraftMeta({
      activity: reviewedDraftInput,
      currentTemplateType: 'quiz',
    }),
    model: '@cf/meta/llama-3.1-8b-instruct',
    notice: 'Completed locally after provider draft.',
    provider: 'workers-ai',
    sourceMaterialNoteViews: safeSourceMaterialNoteViews,
  });
  const handoffView = summaryView.handoffView;
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...ACTIVITY_DRAFT_META_HANDOFF_ITEM_IDS]);
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
    appliesToEditorBeforeSave: true,
    createsAssignmentLinks: false,
    exposesAnswerText: false,
    exposesExplanationText: false,
    exposesOptionText: false,
    exposesQuestionPromptText: false,
    exposesRawDraftJson: false,
    exposesRawSourceText: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialStorageKeys: false,
    exposesTeacherNotesText: false,
    fillsEditorOnly: true,
    itemIds,
    mutatesActivityLibraryBeforeSave: false,
    persistsContentDirectly: false,
    publishesAssignmentWithoutTeacherAction: false,
    readsSourceMaterialFileBytes: false,
    requiresTeacherReview: true,
    savesActivityWithoutTeacherAction: false,
    scope: 'teacher-reviewed-ai-draft',
    usesCreateActivityInputContract: true,
    usesDeterministicFallbackContract: true,
    usesSafeSourceMaterialProvenance: true,
    usesStructuredReviewChecklist: true,
    usesTemplateReadinessDomain: true,
  });

  assert.equal(getHandoffValue(handoffView, 'draft-provider'), 'Workers AI');
  assert.equal(
    getHandoffValue(handoffView, 'draft-model'),
    '@cf/meta/llama-3.1-8b-instruct'
  );
  assert.equal(
    getHandoffValue(handoffView, 'generation-notice'),
    'Completed locally after provider draft.'
  );
  assert.equal(
    getHandoffValue(handoffView, 'fallback-stability-boundary'),
    'Deterministic fallback'
  );
  assert.equal(
    getHandoffValue(handoffView, 'teacher-review-gate'),
    'Teacher review required'
  );
  assert.equal(
    getHandoffValue(handoffView, 'editor-fill-boundary'),
    'Editor fill only'
  );
  assert.equal(
    getHandoffValue(handoffView, 'create-input-contract'),
    'CreateActivityInput'
  );
  assert.equal(
    getHandoffValue(handoffView, 'review-gate-status'),
    'Action needed before save'
  );
  assert.equal(
    getHandoffValue(handoffView, 'review-checklist-source'),
    'Structured checklist'
  );
  assert.equal(getHandoffValue(handoffView, 'action-needed-count'), '0');
  assert.equal(getHandoffValue(handoffView, 'review-required-count'), '3');
  assert.equal(getHandoffValue(handoffView, 'ready-check-count'), '1');
  assert.equal(
    getHandoffValue(handoffView, 'template-readiness-source'),
    'Template remix plan'
  );
  assert.equal(getHandoffValue(handoffView, 'ready-template-count'), '8');
  assert.equal(getHandoffValue(handoffView, 'locked-template-count'), '0');
  assert.equal(getHandoffValue(handoffView, 'suggested-remix-count'), '7');
  assert.equal(
    getHandoffValue(handoffView, 'coverage-field-count'),
    '5 coverage fields'
  );
  assert.equal(getHandoffValue(handoffView, 'question-count'), '1');
  assert.equal(getHandoffValue(handoffView, 'pair-count'), '1');
  assert.equal(getHandoffValue(handoffView, 'group-count'), '1');
  assert.equal(getHandoffValue(handoffView, 'vocabulary-count'), '2');
  assert.equal(getHandoffValue(handoffView, 'teacher-note-count'), '1');
  assert.equal(
    getHandoffValue(handoffView, 'quiz-choice-readiness'),
    '1/1 question ready'
  );
  assert.equal(
    getHandoffValue(handoffView, 'source-provenance-boundary'),
    'Safe material provenance'
  );
  assert.equal(
    getHandoffValue(handoffView, 'safe-source-count'),
    '2 safe sources'
  );
  assert.equal(
    getHandoffValue(handoffView, 'omitted-source-count'),
    '2 omitted sources'
  );
  assert.equal(
    getHandoffValue(handoffView, 'no-file-byte-read'),
    'No file bytes'
  );
  assert.equal(
    getHandoffValue(handoffView, 'no-direct-persist'),
    'No direct save'
  );
  assert.equal(
    getHandoffValue(handoffView, 'no-assignment-publish'),
    'No assignment publish'
  );
  assert.equal(
    getHandoffValue(handoffView, 'save-boundary'),
    'Teacher saves first'
  );

  assertNoPrivateDraftText(JSON.stringify(handoffView));
});

test('AI draft meta handoff keeps sparse fallback drafts explicit', () => {
  const handoffView = buildActivityDraftMetaSummaryView({
    meta: buildActivityDraftMeta({
      activity: {
        ...reviewedDraftInput,
        groupsText: 'Weather | rain, storm',
        pairsText: '',
        questionsText: '',
        sourceSummary: '',
        teacherNotesText: '',
        templateType: 'group-sort',
        title: 'Sparse local draft',
        vocabularyText: 'rain, storm',
      },
      currentTemplateType: 'group-sort',
    }),
    model: 'local-fallback',
    provider: 'fallback',
    sourceMaterialNoteViews: [],
  }).handoffView;

  assert.deepEqual(
    handoffView.itemViews.map((item) => item.id),
    [...ACTIVITY_DRAFT_META_HANDOFF_ITEM_IDS]
  );
  assert.equal(new Set(handoffView.itemViews.map((item) => item.id)).size, 30);
  assert.equal(getHandoffValue(handoffView, 'draft-provider'), 'Fallback');
  assert.equal(getHandoffValue(handoffView, 'draft-model'), 'local-fallback');
  assert.equal(
    getHandoffValue(handoffView, 'generation-notice'),
    'No generation notice'
  );
  assert.equal(
    getHandoffValue(handoffView, 'fallback-stability-boundary'),
    'Deterministic fallback'
  );
  assert.equal(
    getHandoffValue(handoffView, 'create-input-contract'),
    'CreateActivityInput'
  );
  assert.equal(
    getHandoffValue(handoffView, 'review-gate-status'),
    'Action needed before save'
  );
  assert.equal(
    getHandoffValue(handoffView, 'review-checklist-source'),
    'Structured checklist'
  );
  assert.equal(getHandoffValue(handoffView, 'action-needed-count'), '2');
  assert.equal(getHandoffValue(handoffView, 'review-required-count'), '2');
  assert.equal(getHandoffValue(handoffView, 'ready-check-count'), '0');
  assert.equal(
    getHandoffValue(handoffView, 'template-readiness-source'),
    'Template remix plan'
  );
  assert.equal(getHandoffValue(handoffView, 'ready-template-count'), '1');
  assert.equal(getHandoffValue(handoffView, 'locked-template-count'), '7');
  assert.equal(getHandoffValue(handoffView, 'suggested-remix-count'), '0');
  assert.equal(
    getHandoffValue(handoffView, 'coverage-field-count'),
    '5 coverage fields'
  );
  assert.equal(getHandoffValue(handoffView, 'question-count'), '0');
  assert.equal(getHandoffValue(handoffView, 'pair-count'), '0');
  assert.equal(getHandoffValue(handoffView, 'group-count'), '1');
  assert.equal(getHandoffValue(handoffView, 'vocabulary-count'), '2');
  assert.equal(getHandoffValue(handoffView, 'teacher-note-count'), '0');
  assert.equal(
    getHandoffValue(handoffView, 'quiz-choice-readiness'),
    'No quiz questions'
  );
  assert.equal(
    getHandoffValue(handoffView, 'source-provenance-boundary'),
    'Safe material provenance'
  );
  assert.equal(
    getHandoffValue(handoffView, 'safe-source-count'),
    '0 safe sources'
  );
  assert.equal(
    getHandoffValue(handoffView, 'omitted-source-count'),
    '0 omitted sources'
  );
  assert.equal(
    getHandoffValue(handoffView, 'no-direct-persist'),
    'No direct save'
  );
  assert.equal(
    getHandoffValue(handoffView, 'no-assignment-publish'),
    'No assignment publish'
  );
  assert.equal(
    getHandoffValue(handoffView, 'save-boundary'),
    'Teacher saves first'
  );

  assertNoPrivateDraftText(JSON.stringify(handoffView));
});

test('AI draft meta handoff localizes Chinese save-review boundaries', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const handoffView = buildActivityDraftMetaSummaryView({
      meta: buildActivityDraftMeta({
        activity: reviewedDraftInput,
        currentTemplateType: 'quiz',
      }),
      model: '@cf/meta/llama-3.1-8b-instruct',
      notice: 'Completed locally after provider draft.',
      provider: 'workers-ai',
      sourceMaterialNoteViews: safeSourceMaterialNoteViews,
    }).handoffView;

    assert.equal(handoffView.title, 'AI 草稿保存交接');
    assert.match(handoffView.description, /30 切片 AI 草稿契约/);
    assert.equal(
      getHandoffValue(handoffView, 'editor-fill-boundary'),
      '只填入编辑器'
    );
    assert.equal(
      getHandoffValue(handoffView, 'create-input-contract'),
      'CreateActivityInput'
    );
    assert.equal(
      getHandoffValue(handoffView, 'review-checklist-source'),
      '结构化检查清单'
    );
    assert.equal(
      getHandoffValue(handoffView, 'template-readiness-source'),
      '模板改编计划'
    );
    assert.equal(
      getHandoffValue(handoffView, 'coverage-field-count'),
      '5 个覆盖字段'
    );
    assert.equal(
      getHandoffValue(handoffView, 'source-provenance-boundary'),
      '安全素材来源'
    );
    assert.equal(
      getHandoffValue(handoffView, 'no-direct-persist'),
      '不直接保存'
    );
    assert.equal(
      getHandoffValue(handoffView, 'no-assignment-publish'),
      '不发布作业'
    );
    assert.equal(getHandoffValue(handoffView, 'save-boundary'), '老师先保存');
    assertNoPrivateDraftText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

function getHandoffValue(
  view: ActivityDraftMetaHandoffView,
  id: ActivityDraftMetaHandoffItemId
) {
  const item = view.itemViews.find((itemView) => itemView.id === id);
  assert.ok(item, `Missing AI draft meta handoff item ${id}`);
  return item.value;
}

function assertNoPrivateDraftText(serializedView: string) {
  for (const privateValue of [
    SECRET_ANSWER_TEXT,
    SECRET_EXPLANATION_TEXT,
    SECRET_FILE_ID,
    SECRET_OPTION_TEXT,
    SECRET_PROMPT_TEXT,
    SECRET_SOURCE_SUMMARY,
    SECRET_STORAGE_KEY,
    SECRET_TEACHER_NOTE,
    'storageKey',
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `AI draft meta handoff leaked private draft text: ${privateValue}`
    );
  }
}
