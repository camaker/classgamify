import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { STARTER_FOOD_ASSIGNMENT_SHARE_ID } from '@/activities/starter-ids';
import type { AssignmentSeed } from '@/activities/types';
import {
  buildStudentRunnerPageViewModel,
  buildStudentRunnerReadyState,
  buildStudentRunnerStarterPreview,
  STUDENT_RUNNER_START_HANDOFF_ITEM_IDS,
  type StudentRunnerStartHandoffItemId,
  type StudentRunnerStartHandoffView,
} from '@/assignments/student-runner-state';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER_TEXT = 'SECRET_STUDENT_ANSWER';
const SECRET_PROMPT_TEXT = 'SECRET_PROMPT_TEXT';
const SECRET_STUDENT_NAME = 'Student Private Name';
const SECRET_TOKEN = 'raw-anonymous-token-value';

test('student runner start handoff exposes 30 safe public-start slices', () => {
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
        instructions: '  Read the rules before starting.  ',
        maxAttempts: 2,
        showCorrectAnswers: false,
        shuffleItems: true,
        timeLimitSeconds: 120,
      }),
      runtimeItems: starterPreview.runtimeItems,
      source: 'public-assignment',
    }),
    shareId: STARTER_FOOD_ASSIGNMENT_SHARE_ID,
    submittedAttemptCount: 0,
  });
  const handoffView = requireStartHandoffView(pageView.startHandoffView);
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...STUDENT_RUNNER_START_HANDOFF_ITEM_IDS]);
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
    exposesRuntimeChoiceText: false,
    exposesRuntimeItemIds: false,
    exposesRuntimePromptText: false,
    exposesStudentName: false,
    exposesTeacherOnlyAnswers: false,
    exposesTeacherSourceMaterials: false,
    itemIds,
    prepareStepIds: ['review-rules', 'anonymous', 'timer', 'submit'],
    ruleIds: [
      'items',
      'attempts',
      'timer',
      'closes',
      'identity',
      'answerReveal',
      'itemOrder',
    ],
  });

  assert.equal(
    getHandoffItemValue(handoffView, 'share-link'),
    STARTER_FOOD_ASSIGNMENT_SHARE_ID
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'runner-source'),
    'Public assignment'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'source-boundary'),
    'Public assignment'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'runtime-availability'),
    'Ready to submit'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'submit-gate'),
    'Ready to submit'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'read-only-state'),
    'Submittable'
  );
  assert.equal(getHandoffItemValue(handoffView, 'rule-status'), 'Timer on');
  assert.equal(getHandoffItemValue(handoffView, 'rule-count'), '7 rules');
  assert.match(getHandoffItemValue(handoffView, 'item-count'), /\d+ items/);
  assert.equal(getHandoffItemValue(handoffView, 'attempt-limit'), '2 max');
  assert.equal(getHandoffItemValue(handoffView, 'timer-policy'), '2 min');
  assert.equal(
    getHandoffItemValue(handoffView, 'timer-start-boundary'),
    'After load'
  );
  assert.equal(getHandoffItemValue(handoffView, 'close-time'), 'No close time');
  assert.equal(getHandoffItemValue(handoffView, 'identity-mode'), 'Anonymous');
  assert.equal(
    getHandoffItemValue(handoffView, 'identity-privacy'),
    'Token hidden'
  );
  assert.equal(getHandoffItemValue(handoffView, 'review-behavior'), 'Hidden');
  assert.equal(getHandoffItemValue(handoffView, 'item-order'), 'Shuffled');
  assert.equal(
    getHandoffItemValue(handoffView, 'instructions'),
    'Read the rules before starting.'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'prepare-review-rules'),
    'Ready'
  );
  assert.equal(getHandoffItemValue(handoffView, 'prepare-identity'), 'Ready');
  assert.equal(getHandoffItemValue(handoffView, 'prepare-timer'), 'Ready');
  assert.equal(getHandoffItemValue(handoffView, 'prepare-submit'), 'Ready');
  assert.equal(
    getHandoffItemValue(handoffView, 'prepare-step-count'),
    '4 steps'
  );
  assert.match(
    getHandoffItemValue(handoffView, 'browser-label'),
    /^Anonymous browser [A-Z0-9]{6}$/
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'teacher-action'),
    'Teacher results'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'runtime-content-guard'),
    'Prompts and choices omitted'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'answer-key-guard'),
    'Answer keys hidden'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'student-data-guard'),
    'Student data omitted'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'privacy-guard'),
    'Private data omitted'
  );

  assertNoPrivateStartText(JSON.stringify(handoffView));
});

test('student runner start handoff marks starter previews as read-only', () => {
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
        collectStudentName: true,
        instructions: '',
        maxAttempts: null,
        showCorrectAnswers: true,
        shuffleItems: false,
        timeLimitSeconds: null,
      }),
      runtimeItems: starterPreview.runtimeItems,
      source: 'starter-preview',
    }),
    shareId: STARTER_FOOD_ASSIGNMENT_SHARE_ID,
    submittedAttemptCount: 0,
  });
  const handoffView = requireStartHandoffView(pageView.startHandoffView);

  assert.deepEqual(
    handoffView.itemViews.map((item) => item.id),
    [...STUDENT_RUNNER_START_HANDOFF_ITEM_IDS]
  );
  assert.deepEqual(handoffView.privacy.prepareStepIds, [
    'review-rules',
    'student-name',
    'no-timer',
    'submit',
  ]);
  assert.equal(
    getHandoffItemValue(handoffView, 'runner-source'),
    'Starter preview'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'source-boundary'),
    'Starter preview'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'runtime-availability'),
    'Preview only'
  );
  assert.equal(getHandoffItemValue(handoffView, 'submit-gate'), 'Preview only');
  assert.equal(
    getHandoffItemValue(handoffView, 'read-only-state'),
    'Read-only'
  );
  assert.equal(getHandoffItemValue(handoffView, 'rule-count'), '7 rules');
  assert.equal(
    getHandoffItemValue(handoffView, 'prepare-step-count'),
    '4 steps'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'timer-start-boundary'),
    'No timer'
  );
  assert.equal(getHandoffItemValue(handoffView, 'identity-mode'), 'Names');
  assert.equal(
    getHandoffItemValue(handoffView, 'identity-privacy'),
    'Name withheld'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'browser-label'),
    'Student name entry'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'instructions'),
    'No instructions'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'teacher-action'),
    'Create activity'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'runtime-content-guard'),
    'Prompts and choices omitted'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'answer-key-guard'),
    'Answer keys hidden'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'student-data-guard'),
    'Student data omitted'
  );
  assertNoPrivateStartText(JSON.stringify(handoffView));
});

test('student runner start handoff renders hidden DOM relationships', () => {
  const componentSource = readFileSync(
    'src/components/assignments/student-runner-start-handoff.tsx',
    'utf8'
  );
  const routeSource = readFileSync('src/routes/play/$shareId.tsx', 'utf8');

  assert.match(
    componentSource,
    /StudentRunnerStartHandoffItemView[\s\S]*StudentRunnerStartHandoffView[\s\S]*data-handoff="student-runner-start"[\s\S]*view\.itemViews\.map[\s\S]*StudentRunnerStartHandoffItem[\s\S]*function StudentRunnerStartHandoffItem[\s\S]*const labelId = `student-runner-start-handoff-\$\{itemView\.id\}-label`[\s\S]*const valueId = `student-runner-start-handoff-\$\{itemView\.id\}-value`[\s\S]*const descriptionId = `student-runner-start-handoff-\$\{itemView\.id\}-description`[\s\S]*data-handoff-item=\{itemView\.id\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{itemView\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/,
    'Student runner start handoff should render each safe start slice with stable label, value, and description relationships.'
  );
  assert.match(
    routeSource,
    /StudentRunnerStartHandoff[\s\S]*from '@\/components\/assignments\/student-runner-start-handoff'[\s\S]*runnerPageView\.startHandoffView[\s\S]*<StudentRunnerStartHandoff[\s\S]*view=\{runnerPageView\.startHandoffView\}/,
    'Student runner route should render the prepared hidden start handoff view.'
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

function requireStartHandoffView(
  view: StudentRunnerStartHandoffView | undefined
) {
  assert.ok(view, 'Expected student runner start handoff view');
  return view;
}

function getHandoffItemValue(
  view: {
    itemViews: Array<{
      id: StudentRunnerStartHandoffItemId;
      value: string;
    }>;
  },
  id: StudentRunnerStartHandoffItemId
) {
  const item = view.itemViews.find((handoffItem) => handoffItem.id === id);
  assert.ok(item, `Missing start handoff item ${id}`);
  return item.value;
}

function assertNoPrivateStartText(serializedView: string) {
  for (const privateValue of [
    SECRET_ANSWER_TEXT,
    SECRET_PROMPT_TEXT,
    SECRET_STUDENT_NAME,
    SECRET_TOKEN,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Student runner start handoff leaked private text: ${privateValue}`
    );
  }
}
