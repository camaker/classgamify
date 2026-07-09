import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { STARTER_FOOD_ASSIGNMENT_SHARE_ID } from '@/activities/starter-ids';
import type { AssignmentSeed } from '@/activities/types';
import { getAnonymousBrowserLabel } from '@/assignments/identity';
import {
  buildStudentRunnerPageViewModel,
  buildStudentRunnerReadyState,
  buildStudentRunnerStarterPreview,
} from '@/assignments/student-runner-state';
import {
  buildStudentRunnerIdentityHandoffView,
  STUDENT_RUNNER_IDENTITY_HANDOFF_ITEM_IDS,
  type StudentRunnerIdentityHandoffItemId,
  type StudentRunnerIdentityHandoffView,
} from '@/assignments/student-runner-identity-handoff';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER_TEXT = 'SECRET_IDENTITY_ANSWER';
const SECRET_PROMPT_TEXT = 'SECRET_IDENTITY_PROMPT';
const SECRET_STUDENT_NAME = 'Private Identity Student';
const SECRET_TOKEN = 'raw-identity-anonymous-token';

test('student runner identity handoff exposes 30 safe anonymous slices', () => {
  const starterPreview = buildStudentRunnerStarterPreview(
    STARTER_FOOD_ASSIGNMENT_SHARE_ID
  );
  const pageView = buildStudentRunnerPageViewModel({
    anonymousToken: SECRET_TOKEN,
    answers: {
      secret: SECRET_ANSWER_TEXT,
    },
    confirmIncompleteSubmit: false,
    fallbackStartedAt: 10_000,
    isSubmitting: false,
    pageState: buildStudentRunnerReadyState({
      activity: starterPreview.activity,
      assignment: withAssignmentSettings(starterPreview.assignment, {
        collectStudentName: false,
      }),
      runtimeItems: starterPreview.runtimeItems,
      source: 'public-assignment',
    }),
    shareId: STARTER_FOOD_ASSIGNMENT_SHARE_ID,
    submittedAttemptCount: 0,
  });
  assert.equal(pageView.identityView?.mode, 'anonymous');
  assert.ok(pageView.identityView);

  const handoffView = buildStudentRunnerIdentityHandoffView(
    pageView.identityView
  );
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...STUDENT_RUNNER_IDENTITY_HANDOFF_ITEM_IDS]);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(handoffView.itemViews.length, 30);
  assert.deepEqual(handoffView.privacy, {
    exposesAnonymousBrowserLabel: true,
    exposesAnonymousToken: false,
    exposesAnswerText: false,
    exposesRawSubmissionPayload: false,
    exposesSourceMaterialMetadata: false,
    exposesStudentName: false,
    exposesStudentNameInputValue: false,
    exposesTeacherOnlyAnswers: false,
    itemIds,
    mode: 'anonymous',
    scope: 'public-student-runner-identity',
    summaryItemIds: ['browser-label', 'retry-browser', 'token-privacy'],
  });
  assert.equal(getHandoffValue(handoffView, 'identity-mode'), 'Anonymous');
  assert.equal(
    getHandoffValue(handoffView, 'collection-policy'),
    'Use current browser'
  );
  assert.equal(
    getHandoffValue(handoffView, 'student-name-field'),
    'Not requested'
  );
  assert.equal(getHandoffValue(handoffView, 'anonymous-panel'), 'Visible');
  assert.equal(
    getHandoffValue(handoffView, 'browser-label'),
    getAnonymousBrowserLabel(SECRET_TOKEN)
  );
  assert.equal(getHandoffValue(handoffView, 'anonymous-summary-count'), '3');
  assert.equal(
    getHandoffValue(handoffView, 'anonymous-summary-ids'),
    'browser-label · retry-browser · token-privacy'
  );
  assert.equal(
    getHandoffValue(handoffView, 'browser-summary'),
    getAnonymousBrowserLabel(SECRET_TOKEN)
  );
  assert.equal(
    getHandoffValue(handoffView, 'token-privacy-summary'),
    'Token hidden'
  );
  assert.equal(
    getHandoffValue(handoffView, 'submission-identity-source'),
    'Browser token normalized'
  );
  assert.equal(
    getHandoffValue(handoffView, 'anonymous-token-boundary'),
    'Raw token omitted'
  );
  assert.equal(
    getHandoffValue(handoffView, 'privacy-guard'),
    'Private data omitted'
  );
  assertNoPrivateIdentityText(JSON.stringify(handoffView));
});

test('student runner identity handoff reports named editable and locked state', () => {
  const starterPreview = buildStudentRunnerStarterPreview(
    STARTER_FOOD_ASSIGNMENT_SHARE_ID
  );
  const editablePageView = buildStudentRunnerPageViewModel({
    anonymousToken: SECRET_TOKEN,
    answers: {
      secret: SECRET_ANSWER_TEXT,
    },
    confirmIncompleteSubmit: false,
    fallbackStartedAt: 10_000,
    isSubmitting: false,
    pageState: buildStudentRunnerReadyState({
      activity: starterPreview.activity,
      assignment: withAssignmentSettings(starterPreview.assignment, {
        collectStudentName: true,
      }),
      runtimeItems: starterPreview.runtimeItems,
      source: 'public-assignment',
    }),
    shareId: STARTER_FOOD_ASSIGNMENT_SHARE_ID,
    submittedAttemptCount: 0,
  });
  assert.equal(editablePageView.identityView?.mode, 'student-name');
  assert.ok(editablePageView.identityView);

  const editableHandoff = buildStudentRunnerIdentityHandoffView(
    editablePageView.identityView
  );
  assert.deepEqual(editableHandoff.privacy, {
    exposesAnonymousBrowserLabel: false,
    exposesAnonymousToken: false,
    exposesAnswerText: false,
    exposesRawSubmissionPayload: false,
    exposesSourceMaterialMetadata: false,
    exposesStudentName: false,
    exposesStudentNameInputValue: false,
    exposesTeacherOnlyAnswers: false,
    itemIds: [...STUDENT_RUNNER_IDENTITY_HANDOFF_ITEM_IDS],
    mode: 'student-name',
    scope: 'public-student-runner-identity',
    summaryItemIds: [],
  });
  assert.equal(
    getHandoffValue(editableHandoff, 'identity-mode'),
    'Student name'
  );
  assert.equal(
    getHandoffValue(editableHandoff, 'collection-policy'),
    'Collect student name'
  );
  assert.equal(
    getHandoffValue(editableHandoff, 'student-name-field'),
    'Available'
  );
  assert.equal(getHandoffValue(editableHandoff, 'student-name-disabled'), 'No');
  assert.equal(
    getHandoffValue(editableHandoff, 'student-name-lock-policy'),
    'Editable'
  );
  assert.equal(
    getHandoffValue(editableHandoff, 'student-name-value-guard'),
    'Input value omitted'
  );
  assert.equal(getHandoffValue(editableHandoff, 'anonymous-panel'), 'Hidden');
  assert.equal(
    getHandoffValue(editableHandoff, 'anonymous-summary-count'),
    '0'
  );
  assert.equal(
    getHandoffValue(editableHandoff, 'submission-identity-source'),
    'Typed name normalized'
  );
  assertNoPrivateIdentityText(JSON.stringify(editableHandoff));

  const lockedPageView = buildStudentRunnerPageViewModel({
    anonymousToken: SECRET_TOKEN,
    answers: {},
    confirmIncompleteSubmit: false,
    fallbackStartedAt: 10_000,
    isSubmitting: false,
    pageState: buildStudentRunnerReadyState({
      activity: starterPreview.activity,
      assignment: withAssignmentSettings(starterPreview.assignment, {
        collectStudentName: true,
      }),
      runtimeItems: starterPreview.runtimeItems,
      source: 'public-assignment',
    }),
    shareId: STARTER_FOOD_ASSIGNMENT_SHARE_ID,
    submittedAttemptCount: 1,
  });
  assert.equal(lockedPageView.identityView?.mode, 'student-name');
  assert.ok(lockedPageView.identityView);

  const lockedHandoff = buildStudentRunnerIdentityHandoffView(
    lockedPageView.identityView
  );
  assert.equal(getHandoffValue(lockedHandoff, 'student-name-disabled'), 'Yes');
  assert.equal(
    getHandoffValue(lockedHandoff, 'student-name-lock-policy'),
    'Locked'
  );
  assertNoPrivateIdentityText(JSON.stringify(lockedHandoff));
});

test('student runner identity handoff localizes Chinese privacy boundary', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const starterPreview = buildStudentRunnerStarterPreview(
      STARTER_FOOD_ASSIGNMENT_SHARE_ID
    );
    const pageView = buildStudentRunnerPageViewModel({
      anonymousToken: SECRET_TOKEN,
      answers: {},
      confirmIncompleteSubmit: false,
      fallbackStartedAt: 10_000,
      isSubmitting: false,
      pageState: buildStudentRunnerReadyState({
        activity: starterPreview.activity,
        assignment: withAssignmentSettings(starterPreview.assignment, {
          collectStudentName: false,
        }),
        runtimeItems: starterPreview.runtimeItems,
        source: 'public-assignment',
      }),
      shareId: STARTER_FOOD_ASSIGNMENT_SHARE_ID,
      submittedAttemptCount: 0,
    });
    assert.ok(pageView.identityView);

    const handoffView = buildStudentRunnerIdentityHandoffView(
      pageView.identityView
    );
    assert.equal(handoffView.title, 'Runner 身份交接');
    assert.equal(getHandoffValue(handoffView, 'identity-mode'), '匿名');
    assert.equal(
      getHandoffValue(handoffView, 'collection-policy'),
      '使用当前浏览器'
    );
    assert.equal(
      getHandoffValue(handoffView, 'anonymous-token-boundary'),
      '原始令牌已省略'
    );
    assert.equal(
      getHandoffValue(handoffView, 'privacy-guard'),
      '已省略私密数据'
    );
    assertNoPrivateIdentityText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

test('student runner identity handoff renders hidden DOM relationships', () => {
  const componentSource = readFileSync(
    'src/components/assignments/student-runner-attempt-shell.tsx',
    'utf8'
  );
  const catalogSource = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

  assert.match(
    componentSource,
    /buildStudentRunnerIdentityHandoffView[\s\S]*const identityHandoffView =[\s\S]*buildStudentRunnerIdentityHandoffView\(identityView\)[\s\S]*<StudentRunnerIdentityHandoff view=\{identityHandoffView\} \/>/,
    'Student runner identity panel should build and render the prepared hidden identity handoff.'
  );
  assert.match(
    componentSource,
    /function StudentRunnerIdentityHandoff[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-labelledby=\{titleId\}[\s\S]*data-handoff="student-runner-identity"[\s\S]*data-handoff-scope=\{view\.privacy\.scope\}[\s\S]*view\.itemViews\.map\(\(itemView\)[\s\S]*StudentRunnerIdentityHandoffItem[\s\S]*function StudentRunnerIdentityHandoffItem[\s\S]*const labelId = `student-runner-identity-handoff-\$\{itemView\.id\}-label`[\s\S]*const valueId = `student-runner-identity-handoff-\$\{itemView\.id\}-value`[\s\S]*const descriptionId = `student-runner-identity-handoff-\$\{itemView\.id\}-description`[\s\S]*data-handoff-item=\{itemView\.id\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{itemView\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/,
    'Student runner identity handoff should render privacy scope plus stable label, value, and description relationships.'
  );
  assert.match(
    catalogSource,
    /student-runner-identity-handoff-semantic-views\.test\.ts[\s\S]*named-student input state[\s\S]*hidden\s+student-runner-identity handoff/,
    'E2E catalog should list the focused student-runner identity handoff gate.'
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

function getHandoffValue(
  view: StudentRunnerIdentityHandoffView,
  id: StudentRunnerIdentityHandoffItemId
) {
  const item = view.itemViews.find((handoffItem) => handoffItem.id === id);
  assert.ok(item, `Missing identity handoff item ${id}`);
  return item.value;
}

function assertNoPrivateIdentityText(serializedView: string) {
  for (const privateValue of [
    SECRET_ANSWER_TEXT,
    SECRET_PROMPT_TEXT,
    SECRET_STUDENT_NAME,
    SECRET_TOKEN,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Student runner identity handoff leaked private text: ${privateValue}`
    );
  }
}
