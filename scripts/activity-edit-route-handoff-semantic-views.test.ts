import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ACTIVITY_EDIT_ROUTE_HANDOFF_ITEM_IDS,
  buildActivityEditRouteHandoffView,
  type ActivityEditRouteHandoffItemId,
  type ActivityEditRouteHandoffView,
} from '@/activities/editor';
import type { ActivityContent } from '@/activities/types';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ACTIVITY_ID = 'SECRET_ACTIVITY_ID_SHOULD_NOT_LEAK';
const SECRET_ANSWER = 'SECRET_ANSWER_TEXT';
const SECRET_DESCRIPTION = 'SECRET_DESCRIPTION_TEXT';
const SECRET_EXPLANATION = 'SECRET_EXPLANATION_TEXT';
const SECRET_FILE_ID = 'SECRET_FILE_ID_SHOULD_NOT_LEAK';
const SECRET_FILENAME = 'secret worksheet.pdf';
const SECRET_OPTION = 'SECRET_OPTION_TEXT';
const SECRET_PROMPT = 'SECRET_PROMPT_TEXT';
const SECRET_SOURCE_SUMMARY = 'SECRET_SOURCE_SUMMARY_TEXT';
const SECRET_STORAGE_KEY = 'userfiles/teacher/private-storage-key.pdf';
const SECRET_TEACHER_NOTE = 'SECRET_TEACHER_NOTE_TEXT';
const SECRET_TITLE = 'SECRET_TITLE_TEXT';

const editableActivityContent: ActivityContent = {
  difficulty: 'core',
  gradeBand: 'Grade 4',
  groups: [
    {
      id: 'group-food',
      items: ['apple', 'bread'],
      label: 'Food',
    },
    {
      id: 'group-drink',
      items: ['milk', 'water'],
      label: 'Drink',
    },
  ],
  language: 'en',
  learningGoal: 'Students classify classroom food words.',
  pairs: [
    {
      id: 'pair-apple',
      left: 'apple',
      right: 'fruit',
    },
    {
      id: 'pair-milk',
      left: 'milk',
      right: 'drink',
    },
  ],
  questions: [
    {
      answer: SECRET_ANSWER,
      explanation: SECRET_EXPLANATION,
      id: 'question-secret',
      options: [
        {
          id: 'option-answer',
          isCorrect: true,
          text: SECRET_ANSWER,
        },
        {
          id: 'option-distractor',
          isCorrect: false,
          text: SECRET_OPTION,
        },
        {
          id: 'option-extra',
          isCorrect: false,
          text: 'safe distractor',
        },
      ],
      prompt: SECRET_PROMPT,
    },
    {
      answer: 'milk',
      id: 'question-milk',
      options: [
        {
          id: 'option-milk',
          isCorrect: true,
          text: 'milk',
        },
        {
          id: 'option-water',
          isCorrect: false,
          text: 'water',
        },
      ],
      prompt: 'Which one is a drink?',
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
  sourceSummary: `${SECRET_SOURCE_SUMMARY} ${SECRET_STORAGE_KEY}`,
  subject: 'English',
  teacherNotes: [SECRET_TEACHER_NOTE],
  vocabulary: ['apple', 'bread', 'milk'],
};

const editableActivity = {
  contentJson: editableActivityContent,
  description: SECRET_DESCRIPTION,
  id: SECRET_ACTIVITY_ID,
  templateType: 'group-sort' as const,
  title: SECRET_TITLE,
  visibility: 'private' as const,
};

test('activity edit route handoff exposes 30 safe hydration slices', () => {
  const handoffView = buildActivityEditRouteHandoffView({
    activity: editableActivity,
    routeStatus: 'ready',
  });
  const itemIds = handoffView.itemViews.map((itemView) => itemView.id);

  assert.deepEqual(itemIds, [...ACTIVITY_EDIT_ROUTE_HANDOFF_ITEM_IDS]);
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
    exposesActivityContentText: false,
    exposesAnswerExplanationText: false,
    exposesAnswerText: false,
    exposesInternalActivityId: false,
    exposesQuestionOptionText: false,
    exposesQuestionPromptText: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialStorageKeys: false,
    exposesSourceSummaryText: false,
    exposesTeacherNotesText: false,
    itemIds,
    mutatesPublishedAssignmentSnapshots: false,
    scope: 'owner-activity-edit-route',
    usesCreateActivityInputContract: true,
  });

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['route-status', 'Ready'],
      ['activity-source', 'Saved activity loaded'],
      ['owner-scope', 'Current teacher'],
      ['persisted-source', 'Saved source'],
      ['edit-access', 'Ready'],
      ['lifecycle-gate', 'Editable'],
      ['archived-restore-action', 'Not required'],
      ['editor-mode', 'Edit mode'],
      ['shared-input-contract', 'CreateActivityInput'],
      ['title-hydration', 'Field hydrated'],
      ['description-hydration', 'Field hydrated'],
      ['template-hydration', 'Group sort'],
      ['visibility-hydration', 'Private'],
      ['learning-goal-hydration', 'Field hydrated'],
      ['question-row-count', '2'],
      ['question-option-count', '5'],
      ['answer-explanation-count', '1'],
      ['pair-row-count', '2'],
      ['group-row-count', '2'],
      ['vocabulary-count', '3'],
      ['teacher-note-count', '1'],
      ['source-summary-privacy', 'Summary hidden'],
      ['source-material-count', '2'],
      ['source-material-kind-count', '2'],
      ['source-reference-hydration', 'References hydrated'],
      ['readiness-after-load', '8 ready modes'],
      ['future-assignment-boundary', 'Future links only'],
      ['snapshot-protection', 'Snapshots unchanged'],
      ['save-target', 'Update saved activity'],
      ['privacy-guard', 'Private content hidden'],
    ]
  );
  assertNoPrivateEditRouteHandoffText(JSON.stringify(handoffView));
});

test('activity edit route handoff blocks archived activity editing', () => {
  const handoffView = buildActivityEditRouteHandoffView({
    activity: {
      ...editableActivity,
      visibility: 'archived',
    },
    routeStatus: 'blocked',
  });

  assert.equal(
    getEditRouteHandoffValue(handoffView, 'route-status'),
    'Blocked'
  );
  assert.equal(
    getEditRouteHandoffValue(handoffView, 'edit-access'),
    'Restore required'
  );
  assert.equal(
    getEditRouteHandoffValue(handoffView, 'lifecycle-gate'),
    'Restore first'
  );
  assert.equal(
    getEditRouteHandoffValue(handoffView, 'archived-restore-action'),
    'Open archived activities'
  );
  assert.equal(
    getEditRouteHandoffValue(handoffView, 'editor-mode'),
    'Unavailable'
  );
  assert.equal(
    getEditRouteHandoffValue(handoffView, 'visibility-hydration'),
    'Archived'
  );
  assert.equal(
    getEditRouteHandoffValue(handoffView, 'save-target'),
    'Unavailable'
  );
  assert.equal(
    getEditRouteHandoffValue(handoffView, 'snapshot-protection'),
    'Snapshots unchanged'
  );
  assertNoPrivateEditRouteHandoffText(JSON.stringify(handoffView));
});

test('activity edit route handoff keeps loading state non-editable', () => {
  const handoffView = buildActivityEditRouteHandoffView({
    activity: null,
    routeStatus: 'loading',
  });

  assert.equal(
    getEditRouteHandoffValue(handoffView, 'route-status'),
    'Loading'
  );
  assert.equal(
    getEditRouteHandoffValue(handoffView, 'activity-source'),
    'No activity loaded'
  );
  assert.equal(
    getEditRouteHandoffValue(handoffView, 'persisted-source'),
    'Pending load'
  );
  assert.equal(
    getEditRouteHandoffValue(handoffView, 'edit-access'),
    'Unavailable'
  );
  assert.equal(
    getEditRouteHandoffValue(handoffView, 'lifecycle-gate'),
    'Load required'
  );
  assert.equal(
    getEditRouteHandoffValue(handoffView, 'readiness-after-load'),
    'Not loaded'
  );
  assert.equal(
    getEditRouteHandoffValue(handoffView, 'question-row-count'),
    '0'
  );
  assert.equal(
    getEditRouteHandoffValue(handoffView, 'source-material-count'),
    '0'
  );
  assert.equal(
    getEditRouteHandoffValue(handoffView, 'save-target'),
    'Unavailable'
  );
  assertNoPrivateEditRouteHandoffText(JSON.stringify(handoffView));
});

function getEditRouteHandoffValue(
  view: ActivityEditRouteHandoffView,
  id: ActivityEditRouteHandoffItemId
) {
  const itemView = view.itemViews.find((item) => item.id === id);
  assert.ok(itemView, `Missing activity edit route handoff item ${id}`);
  return itemView.value;
}

function assertNoPrivateEditRouteHandoffText(serializedView: string) {
  for (const privateValue of [
    SECRET_ACTIVITY_ID,
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
    SECRET_TITLE,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Activity edit route handoff leaked private text: ${privateValue}`
    );
  }
}
