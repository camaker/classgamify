import assert from 'node:assert/strict';
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

test('activity template remix handoff exposes 20 safe draft-copy slices', () => {
  const handoffView = buildActivityTemplateRemixHandoffView({
    content: remixReadyContent,
    currentTemplateType: 'quiz',
    sourceTitle: ' Food words quick check ',
    visibility: 'private',
  });
  const itemIds = handoffView.itemViews.map((itemView) => itemView.id);

  assert.deepEqual(itemIds, [...ACTIVITY_TEMPLATE_REMIX_HANDOFF_ITEM_IDS]);
  assert.equal(new Set(itemIds).size, 20);
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
    exposesAnswerText: false,
    exposesQuestionPromptText: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialStorageKeys: false,
    exposesTeacherNotesText: false,
    itemIds,
    modifiesOriginalActivity: false,
    modifiesPublishedAssignmentSnapshots: false,
    outputVisibility: 'draft',
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
    getRemixHandoffValue(handoffView, 'lifecycle-gate'),
    'Ready to remix'
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
