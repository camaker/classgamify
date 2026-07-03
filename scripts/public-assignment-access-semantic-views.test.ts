import assert from 'node:assert/strict';
import test from 'node:test';
import type { ActivityContent, AssignmentSettings } from '@/activities/types';
import {
  buildPublicAssignmentAccessHandoffView,
  buildPublicAssignmentLookupResult,
} from '@/assignments/public';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER = 'SECRET_TEACHER_ANSWER';
const SECRET_CHOICE = 'SECRET_CHOICE_TEXT';
const SECRET_EXPLANATION = 'SECRET_EXPLANATION_TEXT';
const SECRET_PROMPT = 'SECRET_PROMPT_TEXT';
const SECRET_SOURCE_KEY = 'classroom/private/source-material.pdf';
const SECRET_STUDENT_ANSWER = 'SECRET_STUDENT_ANSWER';
const SECRET_TOKEN = 'raw-anonymous-token-value';

test('public assignment access exposes a 20-slice safe handoff for open links', () => {
  const lookupResult = buildPublicAssignmentLookupResult(
    buildPublicAssignmentSource({
      settings: {
        collectStudentName: false,
        instructions: '  Finish before Friday.  ',
        maxAttempts: 2,
        showCorrectAnswers: true,
        shuffleItems: true,
        timeLimitSeconds: 180,
      },
      status: 'published',
    })
  );
  const handoffView = buildPublicAssignmentAccessHandoffView({
    lookupResult,
  });
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    'access-status',
    'lifecycle-status',
    'share-link',
    'assignment-title',
    'template',
    'item-count',
    'runtime-prompts',
    'runtime-choices',
    'answer-keys',
    'explanations',
    'source-materials',
    'instructions',
    'attempt-limit',
    'timer',
    'close-time',
    'identity-mode',
    'shuffle-policy',
    'review-behavior',
    'submission-policy',
    'unavailable-safety',
  ]);
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
    exposesAcceptedAlternatives: false,
    exposesActivityContentJson: false,
    exposesRawAnonymousToken: false,
    exposesRuntimeChoiceText: false,
    exposesRuntimePromptText: false,
    exposesStudentAnswerText: false,
    exposesTeacherOnlyAnswers: false,
    exposesTeacherSourceMaterials: false,
    itemIds,
  });

  assert.equal(
    getHandoffValue(handoffView.itemViews, 'access-status'),
    'Available'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'lifecycle-status'),
    'Open'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'share-link'),
    'weather-link'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'assignment-title'),
    'Weather homework'
  );
  assert.equal(getHandoffValue(handoffView.itemViews, 'template'), 'Quiz');
  assert.equal(getHandoffValue(handoffView.itemViews, 'item-count'), '2 items');
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'runtime-prompts'),
    '2 prompts'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'runtime-choices'),
    '8 choices'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'answer-keys'),
    'Hidden before scoring'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'explanations'),
    'After scoring'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'source-materials'),
    'Private'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'instructions'),
    'Finish before Friday.'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'attempt-limit'),
    '2 max'
  );
  assert.equal(getHandoffValue(handoffView.itemViews, 'timer'), '3 min');
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'close-time'),
    'No close time'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'identity-mode'),
    'Anonymous'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'shuffle-policy'),
    'Shuffled'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'review-behavior'),
    'After submit'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'submission-policy'),
    'Submissions allowed'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'unavailable-safety'),
    'Open link'
  );

  assertNoPrivatePublicAssignmentText(JSON.stringify(handoffView));
});

test('public assignment access keeps unavailable links content-free', () => {
  const lookupResult = buildPublicAssignmentLookupResult(
    buildPublicAssignmentSource({
      status: 'closed',
    })
  );
  const handoffView = buildPublicAssignmentAccessHandoffView({
    lookupResult,
    shareSlug: ' closed-link ',
  });

  assert.equal(
    getHandoffValue(handoffView.itemViews, 'access-status'),
    'Unavailable'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'lifecycle-status'),
    'Closed'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'share-link'),
    'closed-link'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'assignment-title'),
    'Hidden'
  );
  assert.equal(getHandoffValue(handoffView.itemViews, 'template'), 'Hidden');
  assert.equal(getHandoffValue(handoffView.itemViews, 'item-count'), 'Hidden');
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'runtime-prompts'),
    'Hidden'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'runtime-choices'),
    'Hidden'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'submission-policy'),
    'Submissions blocked'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'unavailable-safety'),
    'Safety policy active'
  );
  assertNoPrivatePublicAssignmentText(JSON.stringify(handoffView));
});

function buildPublicAssignmentSource({
  settings = {
    collectStudentName: true,
    maxAttempts: null,
    showCorrectAnswers: false,
    shuffleItems: false,
  },
  status,
}: {
  settings?: AssignmentSettings;
  status: 'closed' | 'published';
}) {
  return {
    activity: {
      contentJson: buildActivityContent(),
      description: 'Weather vocabulary practice.',
      id: 'weather-activity',
      templateType: 'quiz' as const,
      title: 'Weather quiz',
      visibility: 'private' as const,
    },
    assignment: {
      expiresAt: null,
      id: 'assignment-weather',
      settingsJson: settings,
      shareSlug: ' weather-link ',
      status,
      title: '  Weather homework  ',
    },
    snapshot: {
      activityDescription: 'Frozen weather vocabulary practice.',
      activityTitle: 'Frozen weather quiz',
      contentJson: buildActivityContent(),
      templateType: 'quiz' as const,
    },
  };
}

function buildActivityContent(): ActivityContent {
  return {
    difficulty: 'core',
    gradeBand: 'Grade 4',
    groups: [],
    language: 'en',
    learningGoal: 'Students can review weather vocabulary.',
    pairs: [],
    questions: [
      {
        answer: SECRET_ANSWER,
        explanation: SECRET_EXPLANATION,
        id: 'question-rain',
        options: [
          { id: 'rain', isCorrect: true, text: SECRET_CHOICE },
          { id: 'sun', text: 'sunny' },
        ],
        prompt: SECRET_PROMPT,
      },
      {
        answer: 'windy',
        explanation: 'Windy means there is wind.',
        id: 'question-wind',
        options: [
          { id: 'windy', isCorrect: true, text: 'windy' },
          { id: 'cloudy', text: 'cloudy' },
        ],
        prompt: 'Which word means there is wind?',
      },
    ],
    sourceMaterials: [
      {
        fileId: 'secret-source-file-id',
        kind: 'worksheet-document',
        originalName: SECRET_SOURCE_KEY,
      },
    ],
    sourceSummary: SECRET_SOURCE_KEY,
    subject: 'English',
    teacherNotes: [SECRET_EXPLANATION],
    vocabulary: ['rain', 'windy'],
  };
}

function getHandoffValue(
  itemViews: Array<{ id: string; value: string }>,
  id: string
) {
  const item = itemViews.find((view) => view.id === id);
  assert.ok(item, `Expected public assignment access handoff item ${id}`);
  return item.value;
}

function assertNoPrivatePublicAssignmentText(value: string) {
  for (const privateValue of [
    SECRET_ANSWER,
    SECRET_CHOICE,
    SECRET_EXPLANATION,
    SECRET_PROMPT,
    SECRET_SOURCE_KEY,
    SECRET_STUDENT_ANSWER,
    SECRET_TOKEN,
  ]) {
    assert.equal(
      value.includes(privateValue),
      false,
      `Public assignment access handoff leaked private text: ${privateValue}`
    );
  }
}
