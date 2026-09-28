import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { STARTER_FOOD_ASSIGNMENT_SHARE_ID } from '@/activities/starter-ids';
import type { AssignmentSeed } from '@/activities/types';
import {
  buildAssignmentAttemptUsage,
  canUseAnotherAssignmentAttempt,
} from '@/assignments/attempt-limits';
import type {
  PublicAttemptReviewItem,
  PublicAttemptReviewSummary,
} from '@/assignments/public';
import {
  buildStudentRunnerPageViewModel,
  buildStudentRunnerReadyState,
  buildStudentRunnerStarterPreview,
  type StudentRunnerAttemptResult,
} from '@/assignments/student-runner-state';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER_TEXT = 'SECRET_ATTEMPT_LIMIT_ANSWER';
const SECRET_ANONYMOUS_TOKEN = 'secret-attempt-limit-token';
const SECRET_STUDENT_NAME = 'Secret Attempt Limit Student';

const API_ASSIGNMENTS_SOURCE = readFileSync('src/api/assignments.ts', 'utf8');
const ATTEMPT_LIMIT_SOURCE = readFileSync(
  'src/assignments/attempt-limits.ts',
  'utf8'
);
const DELIVERY_SUMMARY_SOURCE = readFileSync(
  'src/assignments/delivery-summary.ts',
  'utf8'
);
const RESULT_EXPORT_SOURCE = readFileSync(
  'src/assignments/results-export.ts',
  'utf8'
);
const RESULT_VIEW_SOURCE = readFileSync(
  'src/assignments/result-view.ts',
  'utf8'
);
const ROUTE_SOURCE = readFileSync('src/routes/play/$shareId.tsx', 'utf8');
const RUNNER_STATE_SOURCE = readFileSync(
  'src/assignments/student-runner-state.ts',
  'utf8'
);
const STUDENT_SUBMISSION_SOURCE = readFileSync(
  'src/assignments/student-submission.ts',
  'utf8'
);
const SUBMIT_CONTROLS_SOURCE = readFileSync(
  'src/components/assignments/student-runner-submit-controls.tsx',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('assignment attempt limit helpers preserve finite and unlimited retries', () => {
  const firstFiniteAttempt = buildAssignmentAttemptUsage({
    maxAttempts: 2,
    previousAttemptCount: 0,
  });
  const limitReachedAttempt = buildAssignmentAttemptUsage({
    maxAttempts: 2,
    previousAttemptCount: 1,
  });
  const unlimitedAttempt = buildAssignmentAttemptUsage({
    maxAttempts: null,
    previousAttemptCount: 48.7,
  });

  assert.deepEqual(firstFiniteAttempt, {
    maxAttempts: 2,
    remainingAttempts: 1,
    usedAttempts: 1,
  });
  assert.deepEqual(limitReachedAttempt, {
    maxAttempts: 2,
    remainingAttempts: 0,
    usedAttempts: 2,
  });
  assert.deepEqual(unlimitedAttempt, {
    maxAttempts: undefined,
    remainingAttempts: undefined,
    usedAttempts: 49,
  });
  assert.equal(
    canUseAnotherAssignmentAttempt({
      maxAttempts: firstFiniteAttempt.maxAttempts,
      usedAttempts: firstFiniteAttempt.usedAttempts,
    }),
    true
  );
  assert.equal(
    canUseAnotherAssignmentAttempt({
      maxAttempts: limitReachedAttempt.maxAttempts,
      usedAttempts: limitReachedAttempt.usedAttempts,
    }),
    false
  );
  assert.equal(
    canUseAnotherAssignmentAttempt({
      maxAttempts: unlimitedAttempt.maxAttempts,
      usedAttempts: unlimitedAttempt.usedAttempts,
    }),
    true
  );
});

test('student runner hides retry once the attempt limit is used', () => {
  const starterPreview = buildStudentRunnerStarterPreview(
    STARTER_FOOD_ASSIGNMENT_SHARE_ID
  );
  const runtimeItem = starterPreview.runtimeItems[0];
  assert.ok(runtimeItem);

  const pageView = buildStudentRunnerPageViewModel({
    anonymousToken: SECRET_ANONYMOUS_TOKEN,
    answers: {
      [runtimeItem.id]: SECRET_ANSWER_TEXT,
    },
    confirmIncompleteSubmit: false,
    fallbackStartedAt: 10_000,
    isSubmitting: false,
    pageState: buildStudentRunnerReadyState({
      activity: starterPreview.activity,
      assignment: withAssignmentSettings(starterPreview.assignment, {
        collectStudentName: false,
        maxAttempts: 2,
        showCorrectAnswers: false,
      }),
      runtimeItems: starterPreview.runtimeItems,
      source: 'public-assignment',
    }),
    result: buildAttemptResult({
      itemCount: starterPreview.runtimeItems.length,
      itemId: runtimeItem.id,
    }),
    shareId: STARTER_FOOD_ASSIGNMENT_SHARE_ID,
    submittedAttemptCount: 2,
  });

  assert.equal(pageView.showStartAnotherAttempt, false);
  assert.equal(pageView.resultPanelView.show, true);
  assert.ok(pageView.resultPanelView.show);
  assert.equal(pageView.resultPanelView.showStartAnotherAttempt, false);
  assertNoPrivateAttemptLimitText(JSON.stringify(pageView.resultPanelView));
  assert.equal(
    JSON.stringify(pageView.resultPanelView).includes(runtimeItem.id),
    false
  );
});

test('assignment attempt limit is wired to shared source boundaries', () => {
  assert.match(
    ATTEMPT_LIMIT_SOURCE,
    /export function normalizeAssignmentMaxAttempts[\s\S]*Math\.trunc\(value\)[\s\S]*normalized >= 1/,
    'Attempt-limit domain should expose max-attempt normalization through one shared helper.'
  );
  assert.match(
    API_ASSIGNMENTS_SOURCE,
    /export const submitAttempt[\s\S]*persistAttemptWithinIdentityLimit\(\{[\s\S]*countPreviousAttempts:[\s\S]*countPreviousIdentityAttempts\(\{[\s\S]*insertAttempt:[\s\S]*identitySlot,[\s\S]*maxAttempts: settings\.maxAttempts[\s\S]*persistence\.type === 'limit-reached'[\s\S]*assignment_api_error_attempt_limit_reached/,
    'Submit attempt API should enforce attempt limits through the shared concurrency helper.'
  );
  const apiIdentityBeforeAttemptLimitGate = new RegExp(
    [
      'const submissionIdentity = resolveAttemptSubmissionIdentity\\(\\{',
      'studentName: data\\.studentName,',
      '\\}\\);',
      'if \\(settings\\.collectStudentName && ' +
        '!submissionIdentity\\.studentName\\)',
      'if \\(!settings\\.collectStudentName && ' +
        '!submissionIdentity\\.anonymousToken\\)',
      'persistAttemptWithinIdentityLimit\\(\\{',
      'countPreviousAttempts:',
      'countPreviousIdentityAttempts\\(\\{',
      "anonymousToken: submissionIdentity\\.anonymousToken \\?\\? '',",
      "studentName: submissionIdentity\\.studentName \\?\\? '',",
      'insertAttempt: async \\(identitySlot\\)',
      'await db\\.insert\\(attempt\\)',
      'identitySlot,',
      'maxAttempts: settings\\.maxAttempts,',
      "persistence\\.type === 'limit-reached'",
    ].join('[\\s\\S]*')
  );
  assert.match(
    API_ASSIGNMENTS_SOURCE,
    apiIdentityBeforeAttemptLimitGate,
    'Submit attempt API should normalize identity before counting previous attempts and before writing the scored attempt.'
  );
  assert.match(
    STUDENT_SUBMISSION_SOURCE,
    /canStartAnotherStudentAttempt[\s\S]*canUseAnotherAssignmentAttempt\(\{[\s\S]*maxAttempts,[\s\S]*usedAttempts: submittedAttemptCount/,
    'Student retry availability should use the shared attempt-limit helper.'
  );
  assert.match(
    RUNNER_STATE_SOURCE,
    /const showStartAnotherAttempt = canStartAnotherStudentAttempt\(\{[\s\S]*maxAttempts:[\s\S]*result\?\.attemptUsage\.maxAttempts \?\? assignment\?\.settings\.maxAttempts/,
    'Student runner retry availability should come from server usage and assignment settings.'
  );
  assert.doesNotMatch(
    SUBMIT_CONTROLS_SOURCE,
    /data-handoff="assignment-attempt-limit"|function AssignmentAttemptLimitHandoff/,
    'Student submit controls should keep attempt-limit handoff diagnostics out of the public student DOM.'
  );
  assert.doesNotMatch(
    ROUTE_SOURCE,
    /attemptLimitHandoffView=\{runnerPageView\.attemptLimitHandoffView\}/,
    'Student play route should not pass attempt-limit handoff diagnostics into public submit controls.'
  );
  assert.match(
    DELIVERY_SUMMARY_SOURCE,
    /hasAttemptLimit[\s\S]*maxAttempts/,
    'Delivery summaries should derive attempt-limit status from normalized assignment settings.'
  );
  assert.match(
    DELIVERY_SUMMARY_SOURCE,
    /assignment_delivery_label_attempts/,
    'Public assignment rule summaries should expose the attempt-limit delivery policy.'
  );
  assert.match(
    RESULT_VIEW_SOURCE,
    /settingsSummaryView: buildAssignmentSettingsSummaryView\(\{[\s\S]*settings: assignment\.settingsJson/,
    'Teacher result pages should retain the delivery attempt-limit policy.'
  );
  assert.match(
    RESULT_EXPORT_SOURCE,
    /deliveryView\.maxAttempts/,
    'Result exports should retain the assignment delivery attempt-limit field.'
  );
});

test('assignment attempt limit focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /pnpm exec tsx --test scripts\/assignment-attempt-limit\.test\.ts/,
    'E2E catalog should point attempt-limit work at the focused script gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /max-attempt parsing[\s\S]*per-student attempt counters[\s\S]*retry availability[\s\S]*CSV\/export delivery-policy fields[\s\S]*attempt-limit privacy-scope\s+boundaries[\s\S]*no-public-audit DOM boundaries/,
    'E2E catalog should say which attempt-limit product boundaries need the focused gate.'
  );
});

function withAssignmentSettings(
  assignment: AssignmentSeed,
  settings: Partial<AssignmentSeed['settings']>
): AssignmentSeed {
  return {
    ...assignment,
    settings: {
      ...assignment.settings,
      ...settings,
    },
  };
}

function buildAttemptResult({
  itemCount,
  itemId,
}: {
  itemCount: number;
  itemId: string;
}): StudentRunnerAttemptResult {
  const reviewItems: PublicAttemptReviewItem[] = [
    {
      acceptedAnswers: ['Paris'],
      correct: false,
      correctAnswer: 'Paris',
      explanation: 'Review explanation',
      itemId,
      submitted: true,
      submittedAnswer: SECRET_ANSWER_TEXT,
    },
  ];
  const reviewSummary: PublicAttemptReviewSummary = {
    correctItemCount: 0,
    hiddenBySettings: true,
    needsReviewItemCount: 1,
    reviewItemCount: 0,
    showCorrectAnswers: false,
    submittedItemCount: 1,
    totalItemCount: itemCount,
    unansweredItemCount: itemCount - 1,
  };

  return {
    accuracy: 0,
    attemptUsage: {
      maxAttempts: 2,
      remainingAttempts: 0,
      usedAttempts: 2,
    },
    completedItemCount: 1,
    correctItemCount: 0,
    durationSeconds: 24,
    earnedPoints: 0,
    reviewItems,
    reviewSummary,
    totalPoints: itemCount,
  };
}

function assertNoPrivateAttemptLimitText(serialized: string) {
  for (const privateValue of [
    SECRET_ANSWER_TEXT,
    SECRET_ANONYMOUS_TOKEN,
    SECRET_STUDENT_NAME,
  ]) {
    assert.equal(
      serialized.includes(privateValue),
      false,
      `Attempt-limit handoff leaked private text: ${privateValue}`
    );
  }
}

test('assignment attempt limit source boundaries stay wired to shared helpers', () => {
  assert.match(
    API_ASSIGNMENTS_SOURCE,
    /countPreviousIdentityAttempts/,
    'apiPreviousCountUsesIdentityQuery'
  );
  assert.match(
    API_ASSIGNMENTS_SOURCE,
    /previousAttemptCount/,
    'attemptCounterUsesPreviousCount'
  );
  assert.match(
    ATTEMPT_LIMIT_SOURCE,
    /normalizeAssignmentMaxAttempts/,
    'maxAttemptParserUsesSharedHelper'
  );
  assert.match(
    RUNNER_STATE_SOURCE,
    /showStartAnotherAttempt = canStartAnotherStudentAttempt/,
    'retryButtonUsesLimitDecision'
  );
  assert.match(
    RUNNER_STATE_SOURCE,
    /formatStudentAttemptUsageLabel\(result\.attemptUsage\)/,
    'runnerResultUsesAttemptUsage'
  );
  assert.match(
    API_ASSIGNMENTS_SOURCE,
    /persistAttemptWithinIdentityLimit\(\{[\s\S]*maxAttempts: settings\.maxAttempts[\s\S]*persistence\.type === 'limit-reached'/,
    'serverEnforcesLimit'
  );
  assert.match(
    API_ASSIGNMENTS_SOURCE,
    /persistAttemptWithinIdentityLimit\(\{[\s\S]*insertAttempt:[\s\S]*await db\.insert\(attempt\)[\s\S]*identitySlot,[\s\S]*persistence\.type === 'limit-reached'[\s\S]*throw new Error\(m\.assignment_api_error_attempt_limit_reached\(\)\)/,
    'scoredAttemptWriteGatedByLimit'
  );
  assert.match(
    API_ASSIGNMENTS_SOURCE,
    /resolveAttemptSubmissionIdentity/,
    'studentNameIdentityUsesNameStrategy'
  );
  assert.match(
    STUDENT_SUBMISSION_SOURCE,
    /canStartAnotherStudentAttempt[\s\S]*canUseAnotherAssignmentAttempt/,
    'submissionGateUsesLimitHelper'
  );
});
