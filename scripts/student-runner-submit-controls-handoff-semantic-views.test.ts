import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { STARTER_FOOD_ASSIGNMENT_SHARE_ID } from '@/activities/starter-ids';
import type { AssignmentSeed } from '@/activities/types';
import {
  buildStudentRunnerPageViewModel,
  buildStudentRunnerReadyState,
  buildStudentRunnerStarterPreview,
  type StudentRunnerAttemptResult,
} from '@/assignments/student-runner-state';
import {
  buildStudentRunnerSubmitControlsHandoffView,
  STUDENT_RUNNER_SUBMIT_CONTROLS_HANDOFF_ITEM_IDS,
  type StudentRunnerSubmitControlsHandoffItemId,
  type StudentRunnerSubmitControlsHandoffView,
} from '@/assignments/student-runner-submit-controls-handoff';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER_TEXT = 'SECRET_SUBMIT_CONTROL_ANSWER';
const SECRET_STUDENT_NAME = 'Secret Submit Control Student';
const SECRET_TOKEN = 'raw-submit-control-token';

test('student runner submit controls handoff exposes 20 safe ready slices', () => {
  const starterPreview = buildStudentRunnerStarterPreview(
    STARTER_FOOD_ASSIGNMENT_SHARE_ID
  );
  const answers = Object.fromEntries(
    starterPreview.runtimeItems.map((item, index) => [
      item.id,
      `${SECRET_ANSWER_TEXT}_${index}`,
    ])
  );
  const pageView = buildStudentRunnerPageViewModel({
    anonymousToken: SECRET_TOKEN,
    answers,
    confirmIncompleteSubmit: false,
    fallbackStartedAt: 10_000,
    isSubmitting: false,
    pageState: buildStudentRunnerReadyState({
      activity: starterPreview.activity,
      assignment: withAssignmentSettings(starterPreview.assignment, {
        collectStudentName: false,
        showCorrectAnswers: false,
      }),
      runtimeItems: starterPreview.runtimeItems,
      source: 'public-assignment',
    }),
    shareId: STARTER_FOOD_ASSIGNMENT_SHARE_ID,
    submittedAttemptCount: 0,
  });
  const handoffView = buildStudentRunnerSubmitControlsHandoffView(
    pageView.controlView
  );

  assert.deepEqual(
    handoffView.itemViews.map((item) => item.id),
    [...STUDENT_RUNNER_SUBMIT_CONTROLS_HANDOFF_ITEM_IDS]
  );
  assert.equal(handoffView.itemViews.length, 20);
  assert.deepEqual(handoffView.privacy, {
    exposesAnonymousToken: false,
    exposesAnswerText: false,
    exposesRawSubmissionPayload: false,
    exposesRuntimeItemIds: false,
    exposesStudentName: false,
    exposesTeacherOnlyAnswers: false,
    exposesTeacherSourceMaterials: false,
    hintIds: [],
    itemIds: [...STUDENT_RUNNER_SUBMIT_CONTROLS_HANDOFF_ITEM_IDS],
    payloadMetricKeys: ['share-link', 'items', 'answers', 'unanswered'],
    readinessItemIds: [
      'share-link',
      'runtime-items',
      'completion',
      'incomplete-confirmation',
      'submission-state',
    ],
    scope: 'public-student-runner-submit-controls',
  });
  assert.equal(getHandoffItemValue(handoffView, 'readiness-status'), 'Ready');
  assert.equal(
    getHandoffItemValue(handoffView, 'completion-counts'),
    `${starterPreview.runtimeItems.length}/${starterPreview.runtimeItems.length}`
  );
  assert.equal(getHandoffItemValue(handoffView, 'unanswered-count'), '0');
  assert.equal(
    getHandoffItemValue(handoffView, 'button-label'),
    'Submit answers'
  );
  assert.equal(getHandoffItemValue(handoffView, 'button-disabled'), 'No');
  assert.equal(
    getHandoffItemValue(handoffView, 'confirm-incomplete-state'),
    'No'
  );
  assert.equal(getHandoffItemValue(handoffView, 'hint-count'), '0');
  assert.equal(
    getHandoffItemValue(handoffView, 'submit-action-boundary'),
    'No mutation'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'privacy-guard'),
    'Private data omitted'
  );
  assertNoPrivateSubmitControlText(JSON.stringify(handoffView));
});

test('student runner submit controls handoff reports incomplete confirmation state', () => {
  const starterPreview = buildStudentRunnerStarterPreview(
    STARTER_FOOD_ASSIGNMENT_SHARE_ID
  );
  const runtimeItem = starterPreview.runtimeItems[0];
  assert.ok(runtimeItem);

  const beforeConfirmPageView = buildStudentRunnerPageViewModel({
    anonymousToken: SECRET_TOKEN,
    answers: {
      [runtimeItem.id]: SECRET_ANSWER_TEXT,
    },
    confirmIncompleteSubmit: false,
    fallbackStartedAt: 10_000,
    isSubmitting: false,
    pageState: buildStudentRunnerReadyState({
      activity: starterPreview.activity,
      assignment: starterPreview.assignment,
      runtimeItems: starterPreview.runtimeItems,
      source: 'public-assignment',
    }),
    shareId: STARTER_FOOD_ASSIGNMENT_SHARE_ID,
    submittedAttemptCount: 0,
  });
  const beforeConfirmHandoff = buildStudentRunnerSubmitControlsHandoffView(
    beforeConfirmPageView.controlView
  );

  assert.equal(
    getHandoffItemValue(beforeConfirmHandoff, 'readiness-status'),
    'Needs review'
  );
  assert.equal(
    getHandoffItemValue(beforeConfirmHandoff, 'unanswered-count'),
    String(starterPreview.runtimeItems.length - 1)
  );
  assert.equal(
    getHandoffItemValue(beforeConfirmHandoff, 'unanswered-hint'),
    'Yes'
  );
  assert.equal(
    getHandoffItemValue(beforeConfirmHandoff, 'confirm-incomplete-hint'),
    'No'
  );
  assert.equal(
    getHandoffItemValue(beforeConfirmHandoff, 'confirm-incomplete-state'),
    'No'
  );
  assert.deepEqual(beforeConfirmHandoff.privacy.hintIds, ['unanswered']);

  const confirmPageView = buildStudentRunnerPageViewModel({
    anonymousToken: SECRET_TOKEN,
    answers: {
      [runtimeItem.id]: SECRET_ANSWER_TEXT,
    },
    confirmIncompleteSubmit: true,
    fallbackStartedAt: 10_000,
    isSubmitting: false,
    pageState: buildStudentRunnerReadyState({
      activity: starterPreview.activity,
      assignment: starterPreview.assignment,
      runtimeItems: starterPreview.runtimeItems,
      source: 'public-assignment',
    }),
    shareId: STARTER_FOOD_ASSIGNMENT_SHARE_ID,
    submittedAttemptCount: 0,
  });
  const confirmHandoff = buildStudentRunnerSubmitControlsHandoffView(
    confirmPageView.controlView
  );

  assert.equal(
    getHandoffItemValue(confirmHandoff, 'readiness-status'),
    'Needs review'
  );
  assert.equal(
    getHandoffItemValue(confirmHandoff, 'button-label'),
    'Submit anyway'
  );
  assert.equal(
    getHandoffItemValue(confirmHandoff, 'confirm-incomplete-state'),
    'Yes'
  );
  assert.equal(
    getHandoffItemValue(confirmHandoff, 'confirm-incomplete-hint'),
    'Yes'
  );
  assert.deepEqual(confirmHandoff.privacy.hintIds, [
    'unanswered',
    'confirm-incomplete',
  ]);
  assertNoPrivateSubmitControlText(JSON.stringify(confirmHandoff));
});

test('student runner submit controls handoff reports submitted locked state', () => {
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
      assignment: starterPreview.assignment,
      runtimeItems: starterPreview.runtimeItems,
      source: 'public-assignment',
    }),
    result: buildSubmittedAttemptResult(starterPreview.runtimeItems.length),
    shareId: STARTER_FOOD_ASSIGNMENT_SHARE_ID,
    submittedAttemptCount: 0,
  });
  const handoffView = buildStudentRunnerSubmitControlsHandoffView(
    pageView.controlView
  );

  assert.equal(
    getHandoffItemValue(handoffView, 'readiness-status'),
    'Needs review'
  );
  assert.equal(getHandoffItemValue(handoffView, 'button-disabled'), 'Yes');
  assert.equal(getHandoffItemValue(handoffView, 'hint-count'), '0');
  assert.equal(getHandoffItemValue(handoffView, 'read-only-hint'), 'No');
  assert.deepEqual(handoffView.privacy.hintIds, []);
  assertNoPrivateSubmitControlText(JSON.stringify(handoffView));
});

test('student runner submit controls handoff renders hidden DOM relationships', () => {
  const componentSource = readFileSync(
    'src/components/assignments/student-runner-submit-controls.tsx',
    'utf8'
  );
  const catalogSource = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

  assert.match(
    componentSource,
    /buildStudentRunnerSubmitControlsHandoffView[\s\S]*const submitControlsHandoffView =[\s\S]*<StudentRunnerSubmitControlsHandoff view=\{submitControlsHandoffView\} \/>/,
    'Student runner submit controls should build and render the prepared hidden handoff beside the visible controls.'
  );
  assert.match(
    componentSource,
    /function StudentRunnerSubmitControlsHandoff[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-labelledby=\{titleId\}[\s\S]*data-handoff="student-runner-submit-controls"[\s\S]*data-handoff-scope=\{view\.privacy\.scope\}[\s\S]*view\.itemViews\.map\(\(itemView\)[\s\S]*StudentRunnerSubmitControlsHandoffItem[\s\S]*function StudentRunnerSubmitControlsHandoffItem[\s\S]*const labelId = `student-runner-submit-controls-handoff-\$\{itemView\.id\}-label`[\s\S]*const valueId = `student-runner-submit-controls-handoff-\$\{itemView\.id\}-value`[\s\S]*const descriptionId = `student-runner-submit-controls-handoff-\$\{itemView\.id\}-description`[\s\S]*data-handoff-item=\{itemView\.id\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{itemView\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/,
    'Student runner submit controls handoff should render privacy scope plus stable label, value, and description relationships.'
  );
  assert.match(
    catalogSource,
    /student-runner-submit-controls-handoff-semantic-views\.test\.ts[\s\S]*submit-control readiness[\s\S]*hidden\s+student-runner-submit-controls handoff/,
    'E2E catalog should list the focused submit-controls handoff gate.'
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

function getHandoffItemValue(
  view: StudentRunnerSubmitControlsHandoffView,
  id: StudentRunnerSubmitControlsHandoffItemId
) {
  const item = view.itemViews.find((handoffItem) => handoffItem.id === id);
  assert.ok(item, `Missing submit-controls handoff item ${id}`);
  return item.value;
}

function buildSubmittedAttemptResult(
  itemCount: number
): StudentRunnerAttemptResult {
  return {
    accuracy: 0,
    attemptUsage: {
      maxAttempts: 1,
      remainingAttempts: 0,
      usedAttempts: 1,
    },
    completedItemCount: 0,
    correctItemCount: 0,
    durationSeconds: 12,
    earnedPoints: 0,
    reviewItems: [],
    reviewSummary: {
      correctItemCount: 0,
      hiddenBySettings: true,
      needsReviewItemCount: 0,
      reviewItemCount: 0,
      showCorrectAnswers: false,
      submittedItemCount: 0,
      totalItemCount: itemCount,
      unansweredItemCount: itemCount,
    },
    totalPoints: itemCount,
  };
}

function assertNoPrivateSubmitControlText(serializedView: string) {
  for (const privateValue of [
    SECRET_ANSWER_TEXT,
    SECRET_STUDENT_NAME,
    SECRET_TOKEN,
    STARTER_FOOD_ASSIGNMENT_SHARE_ID,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Student runner submit controls handoff leaked private text: ${privateValue}`
    );
  }
}
