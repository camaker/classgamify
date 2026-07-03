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

test('AI draft meta handoff exposes 20 safe save-review slices', () => {
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
    appliesToEditorBeforeSave: true,
    exposesAnswerText: false,
    exposesQuestionPromptText: false,
    exposesRawDraftJson: false,
    exposesRawSourceText: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialStorageKeys: false,
    exposesTeacherNotesText: false,
    itemIds,
    publishesAssignmentWithoutTeacherAction: false,
    requiresTeacherReview: true,
    savesActivityWithoutTeacherAction: false,
    scope: 'teacher-reviewed-ai-draft',
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
    getHandoffValue(handoffView, 'teacher-review-gate'),
    'Teacher review required'
  );
  assert.equal(
    getHandoffValue(handoffView, 'review-gate-status'),
    'Action needed before save'
  );
  assert.equal(getHandoffValue(handoffView, 'action-needed-count'), '0');
  assert.equal(getHandoffValue(handoffView, 'review-required-count'), '3');
  assert.equal(getHandoffValue(handoffView, 'ready-check-count'), '1');
  assert.equal(getHandoffValue(handoffView, 'ready-template-count'), '8');
  assert.equal(getHandoffValue(handoffView, 'locked-template-count'), '0');
  assert.equal(getHandoffValue(handoffView, 'suggested-remix-count'), '7');
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
    getHandoffValue(handoffView, 'safe-source-count'),
    '2 safe sources'
  );
  assert.equal(
    getHandoffValue(handoffView, 'omitted-source-count'),
    '2 omitted sources'
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
  assert.equal(getHandoffValue(handoffView, 'draft-provider'), 'Fallback');
  assert.equal(getHandoffValue(handoffView, 'draft-model'), 'local-fallback');
  assert.equal(
    getHandoffValue(handoffView, 'generation-notice'),
    'No generation notice'
  );
  assert.equal(
    getHandoffValue(handoffView, 'review-gate-status'),
    'Action needed before save'
  );
  assert.equal(getHandoffValue(handoffView, 'action-needed-count'), '2');
  assert.equal(getHandoffValue(handoffView, 'review-required-count'), '2');
  assert.equal(getHandoffValue(handoffView, 'ready-check-count'), '0');
  assert.equal(getHandoffValue(handoffView, 'ready-template-count'), '1');
  assert.equal(getHandoffValue(handoffView, 'locked-template-count'), '7');
  assert.equal(getHandoffValue(handoffView, 'suggested-remix-count'), '0');
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
    getHandoffValue(handoffView, 'safe-source-count'),
    '0 safe sources'
  );
  assert.equal(
    getHandoffValue(handoffView, 'omitted-source-count'),
    '0 omitted sources'
  );
  assert.equal(
    getHandoffValue(handoffView, 'save-boundary'),
    'Teacher saves first'
  );

  assertNoPrivateDraftText(JSON.stringify(handoffView));
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
