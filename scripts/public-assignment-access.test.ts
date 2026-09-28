import assert from 'node:assert/strict';
import test from 'node:test';
import type { ActivityContent, AssignmentSettings } from '@/activities/types';
import { buildPublicAssignmentLookupResult } from '@/assignments/public';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER = 'SECRET_TEACHER_ANSWER';
const SECRET_CHOICE = 'SECRET_CHOICE_TEXT';
const SECRET_EXPLANATION = 'SECRET_EXPLANATION_TEXT';
const SECRET_PROMPT = 'SECRET_PROMPT_TEXT';
const SECRET_SOURCE_KEY = 'classroom/private/source-material.pdf';
const SECRET_STUDENT_ANSWER = 'SECRET_STUDENT_ANSWER';
const SECRET_TOKEN = 'raw-anonymous-token-value';

test('public assignment access keeps unavailable links content-free', () => {
  const lookupResult = buildPublicAssignmentLookupResult(
    buildPublicAssignmentSource({
      status: 'closed',
    })
  );

  assert.equal(lookupResult.status, 'unavailable');
  assert.ok(lookupResult.status === 'unavailable');
  assert.equal(lookupResult.reason, 'closed');
  assert.equal('payload' in lookupResult, false);
  assert.equal(lookupResult.unavailable.contentPolicy.runtimeItemsHidden, true);
  assert.equal(lookupResult.unavailable.contentPolicy.answerKeysHidden, true);
  assert.equal(
    lookupResult.unavailable.submissionPolicy.submissionsBlocked,
    true
  );
  assertNoPrivatePublicAssignmentText(JSON.stringify(lookupResult));
});

test('public assignment access keeps expired links content-free', () => {
  const lookupResult = buildPublicAssignmentLookupResult(
    buildPublicAssignmentSource({
      expiresAt: new Date('2026-01-01T00:00:00.000Z'),
      status: 'published',
    }),
    Date.parse('2026-01-02T00:00:00.000Z')
  );

  assert.ok(lookupResult.status === 'unavailable');
  assert.equal(lookupResult.reason, 'expired');
  assert.equal('payload' in lookupResult, false);
  assert.equal(
    lookupResult.unavailable.submissionPolicy.submissionsBlocked,
    true
  );
  assertNoPrivatePublicAssignmentText(JSON.stringify(lookupResult));
});

function buildPublicAssignmentSource({
  expiresAt = null,
  settings = {
    collectStudentName: true,
    maxAttempts: null,
    showCorrectAnswers: false,
    shuffleItems: false,
  },
  status,
}: {
  expiresAt?: Date | null;
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
      expiresAt,
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
      `Public assignment access leaked private text: ${privateValue}`
    );
  }
}
