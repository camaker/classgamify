import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import type { ActivityContent, AssignmentSettings } from '@/activities/types';
import {
  buildPublicAssignmentLookupResult,
  type PublicAssignmentUnavailablePayload,
} from '@/assignments/public';
import {
  buildStudentRunnerUnavailableSafetyView,
  type StudentRunnerMissingPageView,
} from '@/assignments/student-runner-state';
import {
  buildStudentRunnerMissingView,
  type StudentRunnerMissingReason,
} from '@/assignments/student-submission';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER = 'SECRET_UNAVAILABLE_TEACHER_ANSWER';
const SECRET_CHOICE = 'SECRET_UNAVAILABLE_CHOICE';
const SECRET_EXPLANATION = 'SECRET_UNAVAILABLE_EXPLANATION';
const SECRET_PROMPT = 'SECRET_UNAVAILABLE_PROMPT';
const SECRET_SHARE_SLUG = 'secret-unavailable-share-slug';
const SECRET_SOURCE_KEY = 'source-materials/private/unavailable.pdf';

test('closed assignment unavailable access shows a content-free missing view', () => {
  const lookupResult = buildPublicAssignmentLookupResult(
    buildPublicAssignmentSource({
      status: 'closed',
    })
  );
  assert.ok(lookupResult.status === 'unavailable');
  const missingView = buildMissingPageView(
    lookupResult.reason,
    lookupResult.unavailable
  );

  assert.equal(missingView.reason, 'closed');
  assert.equal(missingView.title, 'Assignment closed');
  assert.equal(missingView.unavailableSafetyView?.items.length, 5);
  assertNoPrivateUnavailableText(JSON.stringify({ lookupResult, missingView }));
});

test('expired assignment unavailable access blocks runtime content and submit', () => {
  const lookupResult = buildPublicAssignmentLookupResult(
    buildPublicAssignmentSource({
      expiresAt: new Date('2026-01-01T00:00:00.000Z'),
      status: 'published',
    }),
    Date.parse('2026-01-02T00:00:00.000Z')
  );
  assert.equal(lookupResult.status, 'unavailable');
});

test('draft unavailable access localizes publish-first boundary', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const lookupResult = buildPublicAssignmentLookupResult(
      buildPublicAssignmentSource({
        status: 'draft',
      })
    );
    assert.equal(lookupResult.status, 'unavailable');
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

test('student missing panel renders a plain unavailable message', () => {
  const panelSource = readFileSync(
    'src/components/assignments/student-runner-missing-panel.tsx',
    'utf8'
  );
  const visibleDomSlices: Array<[string, RegExp]> = [
    [
      'prepares stable title id',
      /const titleId = 'student-runner-missing-title'/,
    ],
    [
      'prepares stable description id',
      /const descriptionId = 'student-runner-missing-description'/,
    ],
    [
      'binds main unavailable section',
      /<section[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-labelledby=\{titleId\}/,
    ],
    ['marks the unavailable reason', /data-missing-reason=\{view\.reason\}/],
    [
      'binds missing title heading',
      /<h1[\s\S]*id=\{titleId\}[\s\S]*view\.title/,
    ],
    [
      'binds missing description',
      /id=\{descriptionId\}[\s\S]*view\.description/,
    ],
  ];

  for (const [sliceName, pattern] of visibleDomSlices) {
    assert.match(panelSource, pattern, sliceName);
  }
  // Students on a closed link see one plain message: no system-status cards,
  // no teacher or marketing links, and no hidden audit output.
  assert.doesNotMatch(
    panelSource,
    /view\.scopeItems|view\.unavailableSafetyView/
  );
  assert.doesNotMatch(panelSource, /<Link\b|Routes\./);
  assert.doesNotMatch(panelSource, /data-handoff=/);
});

test('student missing panel omits unavailable access semantic handoffs from public DOM', () => {
  const panelSource = readFileSync(
    'src/components/assignments/student-runner-missing-panel.tsx',
    'utf8'
  );
  const routeSource = readFileSync('src/routes/play/$shareId.tsx', 'utf8');

  assert.doesNotMatch(
    panelSource,
    /data-handoff="public-assignment-unavailable-access"[\s\S]*view\.itemViews\.map/
  );
  assert.doesNotMatch(
    panelSource,
    /PublicAssignmentAccessHandoff|StudentRunnerUnavailableAccessHandoff/
  );
  assert.doesNotMatch(
    routeSource,
    /buildPublicAssignmentUnavailableAccessHandoffView\(\{[\s\S]*lookupResult: data,[\s\S]*missingView: runnerPageView\.missingView,[\s\S]*shareSlug: normalizedShareId/
  );
  assert.doesNotMatch(
    routeSource,
    /unavailableAccessHandoffView=\{unavailableAccessHandoffView\}/
  );
  assert.doesNotMatch(
    routeSource,
    /buildPublicAssignmentAccessHandoffView|accessHandoffView=/
  );
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
  status: 'closed' | 'draft' | 'published';
}) {
  return {
    activity: {
      contentJson: buildActivityContent(),
      description: 'Unavailable weather vocabulary practice.',
      id: 'unavailable-weather-activity',
      templateType: 'quiz' as const,
      title: 'Unavailable weather quiz',
      visibility: 'private' as const,
    },
    assignment: {
      expiresAt,
      id: 'secret-unavailable-assignment-id',
      settingsJson: settings,
      shareSlug: SECRET_SHARE_SLUG,
      status,
      title: 'Secret unavailable homework',
    },
    snapshot: {
      activityDescription: 'Frozen unavailable weather practice.',
      activityTitle: 'Frozen unavailable quiz',
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
    learningGoal: 'Students can review unavailable-link boundaries.',
    pairs: [],
    questions: [
      {
        answer: SECRET_ANSWER,
        explanation: SECRET_EXPLANATION,
        id: 'question-unavailable',
        options: [
          { id: 'secret-choice', isCorrect: true, text: SECRET_CHOICE },
          { id: 'safe-choice', text: 'safe visible text' },
        ],
        prompt: SECRET_PROMPT,
      },
    ],
    sourceMaterials: [
      {
        fileId: 'secret-unavailable-source-file-id',
        kind: 'worksheet-document',
        originalName: SECRET_SOURCE_KEY,
      },
    ],
    sourceSummary: SECRET_SOURCE_KEY,
    subject: 'English',
    teacherNotes: [SECRET_EXPLANATION],
    vocabulary: ['closed', 'expired'],
  };
}

function buildMissingPageView(
  reason: StudentRunnerMissingReason,
  unavailable: PublicAssignmentUnavailablePayload
): StudentRunnerMissingPageView {
  const missingView = buildStudentRunnerMissingView(reason, unavailable);

  return {
    badgeLabel: 'Student runner',
    browseTemplatesLabel: 'Browse templates',
    description: missingView.description,
    reason: missingView.reason,
    scopeItems: missingView.scopeItems,
    title: missingView.title,
    unavailable: missingView.unavailable,
    unavailableSafetyView: buildStudentRunnerUnavailableSafetyView(unavailable),
  };
}

function assertNoPrivateUnavailableText(serialized: string) {
  for (const privateValue of [
    SECRET_ANSWER,
    SECRET_CHOICE,
    SECRET_EXPLANATION,
    SECRET_PROMPT,
    SECRET_SHARE_SLUG,
    SECRET_SOURCE_KEY,
  ]) {
    assert.equal(
      serialized.includes(privateValue),
      false,
      `Unavailable access leaked private text: ${privateValue}`
    );
  }
}
