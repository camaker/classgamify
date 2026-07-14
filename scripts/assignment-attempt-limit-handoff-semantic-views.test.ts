import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { STARTER_FOOD_ASSIGNMENT_SHARE_ID } from '@/activities/starter-ids';
import type { AssignmentSeed } from '@/activities/types';
import {
  ASSIGNMENT_ATTEMPT_LIMIT_HANDOFF_ITEM_IDS,
  buildAssignmentAttemptLimitHandoffEvidence,
  buildAssignmentAttemptLimitHandoffView,
  type AssignmentAttemptLimitHandoffItemId,
  type AssignmentAttemptLimitHandoffView,
} from '@/assignments/attempt-limit-handoff';
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
import {
  canStartAnotherStudentAttempt,
  formatStudentAttemptUsageLabel,
} from '@/assignments/student-submission';
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
const PUBLIC_ASSIGNMENT_SOURCE = readFileSync(
  'src/assignments/public.ts',
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

test('assignment attempt limit handoff exposes 30 safe limit slices', () => {
  const evidence = buildAttemptLimitEvidence();
  const handoffView = buildAssignmentAttemptLimitHandoffView(evidence);
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...ASSIGNMENT_ATTEMPT_LIMIT_HANDOFF_ITEM_IDS]);
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
    exposesAnonymousToken: false,
    exposesAnswerText: false,
    exposesRawIdentityKey: false,
    exposesRawSubmissionPayload: false,
    exposesStudentName: false,
    exposesTeacherOnlyAnswers: false,
    itemIds,
    mutatesAttempts: false,
    readsBrowserStorage: false,
    scope: 'assignment-attempt-limit-boundary',
    usesSharedAttemptLimitHelpers: true,
  });
  assertNoPrivateAttemptLimitText(JSON.stringify(handoffView));
});

test('assignment attempt limit handoff summarizes normalized retry state', () => {
  const handoffView = buildAssignmentAttemptLimitHandoffView(
    buildAttemptLimitEvidence()
  );

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['attempt-scope', 'Per-student attempt limit'],
      ['max-attempt-normalization', '3 max'],
      ['previous-count-normalization', '1 previous'],
      ['used-attempts', '2 used'],
      ['remaining-attempts', '1 attempt left'],
      ['unlimited-attempts', '3 max'],
      ['limit-reached', 'Blocked'],
      ['retry-availability', 'Available'],
      ['result-usage-label', '1 attempt left'],
      ['student-name-identity', 'Normalized name'],
      ['anonymous-token-identity', 'Normalized token'],
      ['identity-mode', 'Student name'],
      ['attempt-counter-source', 'Previous count'],
      ['max-attempt-parser', 'Ready'],
      ['api-previous-count-query', 'Ready'],
      ['server-enforcement', 'Ready'],
      ['scored-attempt-write-gate', 'Ready'],
      ['runner-result-boundary', 'Ready'],
      ['retry-button-boundary', 'Available'],
      ['submission-gate-boundary', 'Ready'],
      ['delivery-summary-boundary', 'Ready'],
      ['public-rule-boundary', 'Ready'],
      ['result-page-boundary', 'Ready'],
      ['result-export-boundary', 'Ready'],
      ['negative-count-guard', '0'],
      ['fractional-count-guard', '2'],
      ['nonfinite-max-guard', 'Unlimited'],
      ['zero-max-guard', 'Unlimited'],
      ['raw-token-guard', 'Raw token hidden'],
      ['privacy-guard', 'Private data hidden'],
    ]
  );
  assertNoPrivateAttemptLimitText(JSON.stringify(handoffView));
});

test('assignment attempt limit handoff localizes unlimited Chinese state', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const evidence = buildAssignmentAttemptLimitHandoffEvidence({
      identityMode: 'anonymous',
      maxAttempts: null,
      retryAvailable: true,
      submittedAttemptCount: 0,
    });
    const handoffView = buildAssignmentAttemptLimitHandoffView(evidence);

    assert.equal(handoffView.title, '作答次数限制交接');
    assert.match(handoffView.description, /30 个安全切片/);
    assert.equal(
      getHandoffValue(handoffView, 'max-attempt-normalization'),
      '不限次数'
    );
    assert.equal(
      getHandoffValue(handoffView, 'remaining-attempts'),
      '仍可继续作答'
    );
    assert.equal(
      getHandoffValue(handoffView, 'nonfinite-max-guard'),
      '不限次数'
    );
    assert.equal(
      getHandoffValue(handoffView, 'privacy-guard'),
      '私密数据已隐藏'
    );
    assertNoPrivateAttemptLimitText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

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

  const handoffView = buildAssignmentAttemptLimitHandoffView(
    buildAssignmentAttemptLimitHandoffEvidence({
      attemptUsage: unlimitedAttempt,
      attemptUsageLabel: formatStudentAttemptUsageLabel(unlimitedAttempt),
      identityMode: 'anonymous',
      retryAvailable: true,
      submittedAttemptCount: unlimitedAttempt.usedAttempts,
    })
  );

  assert.equal(
    getHandoffValue(handoffView, 'max-attempt-normalization'),
    'Open'
  );
  assert.equal(
    getHandoffValue(handoffView, 'remaining-attempts'),
    'Additional attempts allowed'
  );
  assert.equal(getHandoffValue(handoffView, 'unlimited-attempts'), 'Unlimited');
  assert.equal(
    getHandoffValue(handoffView, 'result-usage-label'),
    'Additional attempts allowed'
  );
  assert.equal(getHandoffValue(handoffView, 'retry-availability'), 'Available');
  assertNoPrivateAttemptLimitText(JSON.stringify(handoffView));
});

test('student runner renders the attempt-limit handoff from page state', () => {
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

  assert.deepEqual(
    pageView.attemptLimitHandoffView.itemViews.map((item) => item.id),
    [...ASSIGNMENT_ATTEMPT_LIMIT_HANDOFF_ITEM_IDS]
  );
  assert.equal(
    getHandoffValue(
      pageView.attemptLimitHandoffView,
      'max-attempt-normalization'
    ),
    '2 max'
  );
  assert.equal(
    getHandoffValue(pageView.attemptLimitHandoffView, 'remaining-attempts'),
    'No attempts left'
  );
  assert.equal(
    getHandoffValue(pageView.attemptLimitHandoffView, 'retry-availability'),
    'Unavailable'
  );
  assert.equal(
    getHandoffValue(pageView.attemptLimitHandoffView, 'retry-button-boundary'),
    'Unavailable'
  );
  assert.equal(
    getHandoffValue(pageView.attemptLimitHandoffView, 'privacy-guard'),
    'Private data hidden'
  );
  assertNoPrivateAttemptLimitText(
    JSON.stringify(pageView.attemptLimitHandoffView)
  );
  assert.equal(
    JSON.stringify(pageView.attemptLimitHandoffView).includes(runtimeItem.id),
    false
  );
});

test('assignment attempt limit handoff is wired to shared source boundaries', () => {
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
    /attemptLimitHandoffView: AssignmentAttemptLimitHandoffView;[\s\S]*buildAssignmentAttemptLimitHandoffView\([\s\S]*buildAssignmentAttemptLimitHandoffEvidence\(\{[\s\S]*attemptUsage: result\?\.attemptUsage,[\s\S]*maxAttempts:[\s\S]*assignment\?\.settings\.maxAttempts,[\s\S]*retryAvailable: showStartAnotherAttempt/,
    'Student runner page view-model should compose the attempt-limit handoff from server usage and assignment settings.'
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
    PUBLIC_ASSIGNMENT_SOURCE,
    /case 'attempt-limit':[\s\S]*assignment_delivery_label_attempts/,
    'Public assignment rule summaries should expose the attempt-limit delivery policy.'
  );
  assert.match(
    RESULT_VIEW_SOURCE,
    /settingsSummaryView: buildAssignmentSettingsSummaryView\(\{[\s\S]*settings: assignment\.settingsJson/,
    'Teacher result pages should retain the delivery attempt-limit policy.'
  );
  assert.match(
    RESULT_EXPORT_SOURCE,
    /delivery-attempt-limit/,
    'Result exports should retain the assignment delivery attempt-limit field.'
  );
});

test('assignment attempt limit focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /pnpm exec tsx --test scripts\/assignment-attempt-limit-handoff-semantic-views\.test\.ts/,
    'E2E catalog should point attempt-limit work at the focused script gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /max-attempt parsing[\s\S]*per-student attempt counters[\s\S]*retry availability[\s\S]*CSV\/export delivery-policy fields[\s\S]*attempt-limit privacy-scope\s+boundaries[\s\S]*no-public-audit DOM boundaries/,
    'E2E catalog should say which attempt-limit product boundaries need the focused gate.'
  );
});

function buildAttemptLimitEvidence() {
  const attemptUsage = buildAssignmentAttemptUsage({
    maxAttempts: 3.8,
    previousAttemptCount: 1.9,
  });
  const retryAvailable = canStartAnotherStudentAttempt({
    canSubmit: true,
    hasResult: true,
    maxAttempts: attemptUsage.maxAttempts,
    submittedAttemptCount: attemptUsage.usedAttempts,
  });

  return buildAssignmentAttemptLimitHandoffEvidence({
    attemptUsage,
    attemptUsageLabel: formatStudentAttemptUsageLabel(attemptUsage),
    apiPreviousCountUsesIdentityQuery: /countPreviousIdentityAttempts/.test(
      API_ASSIGNMENTS_SOURCE
    ),
    attemptCounterUsesPreviousCount: /previousAttemptCount/.test(
      API_ASSIGNMENTS_SOURCE
    ),
    deliverySummaryUsesAttemptLimit: /hasAttemptLimit[\s\S]*maxAttempts/.test(
      DELIVERY_SUMMARY_SOURCE
    ),
    identityMode: 'student-name',
    maxAttemptParserUsesSharedHelper: /normalizeAssignmentMaxAttempts/.test(
      ATTEMPT_LIMIT_SOURCE
    ),
    publicRulesUseAttemptLimit:
      /case 'attempt-limit':[\s\S]*assignment_delivery_label_attempts/.test(
        PUBLIC_ASSIGNMENT_SOURCE
      ),
    resultExportUsesAttemptLimit: /delivery-attempt-limit/.test(
      RESULT_EXPORT_SOURCE
    ),
    resultPageUsesAttemptLimit:
      /settingsSummaryView: buildAssignmentSettingsSummaryView\(\{[\s\S]*settings: assignment\.settingsJson/.test(
        RESULT_VIEW_SOURCE
      ),
    retryAvailable,
    retryButtonUsesLimitDecision:
      /showStartAnotherAttempt = canStartAnotherStudentAttempt/.test(
        RUNNER_STATE_SOURCE
      ),
    runnerResultUsesAttemptUsage:
      /formatStudentAttemptUsageLabel\(result\.attemptUsage\)/.test(
        RUNNER_STATE_SOURCE
      ),
    serverEnforcesLimit:
      /persistAttemptWithinIdentityLimit\(\{[\s\S]*maxAttempts: settings\.maxAttempts[\s\S]*persistence\.type === 'limit-reached'/.test(
        API_ASSIGNMENTS_SOURCE
      ),
    scoredAttemptWriteGatedByLimit:
      /persistAttemptWithinIdentityLimit\(\{[\s\S]*insertAttempt:[\s\S]*await db\.insert\(attempt\)[\s\S]*identitySlot,[\s\S]*persistence\.type === 'limit-reached'[\s\S]*throw new Error\(m\.assignment_api_error_attempt_limit_reached\(\)\)/.test(
        API_ASSIGNMENTS_SOURCE
      ),
    studentNameIdentityUsesNameStrategy:
      /resolveAttemptSubmissionIdentity/.test(API_ASSIGNMENTS_SOURCE),
    submittedAttemptCount: attemptUsage.usedAttempts,
    submissionGateUsesLimitHelper:
      /canStartAnotherStudentAttempt[\s\S]*canUseAnotherAssignmentAttempt/.test(
        STUDENT_SUBMISSION_SOURCE
      ),
  });
}

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

function getHandoffValue(
  view: AssignmentAttemptLimitHandoffView,
  id: AssignmentAttemptLimitHandoffItemId
) {
  const item = view.itemViews.find((candidate) => candidate.id === id);
  assert.ok(item, `Missing attempt-limit handoff item ${id}`);
  return item.value;
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
