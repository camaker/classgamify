import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { STARTER_FOOD_ASSIGNMENT_SHARE_ID } from '@/activities/starter-ids';
import {
  STUDENT_RUNNER_LOADING_HANDOFF_ITEM_IDS,
  buildStudentRunnerLoadingHandoffView,
  type StudentRunnerLoadingHandoffItemId,
  type StudentRunnerLoadingHandoffView,
} from '@/assignments/student-runner-loading-handoff';
import {
  buildStudentRunnerAttemptClockStartPlan,
  buildStudentRunnerPageState,
  buildStudentRunnerPageViewModel,
  buildStudentRunnerRouteState,
  buildStudentRunnerStarterPreview,
} from '@/assignments/student-runner-state';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ACTIVITY_CONTENT = 'SECRET_LOADING_ACTIVITY_CONTENT';
const SECRET_ANSWER_KEY = 'SECRET_LOADING_ANSWER_KEY';
const SECRET_ASSIGNMENT_TITLE = 'SECRET_LOADING_ASSIGNMENT_TITLE';
const SECRET_CHOICE_TEXT = 'SECRET_LOADING_CHOICE_TEXT';
const SECRET_EXPLANATION = 'SECRET_LOADING_EXPLANATION';
const SECRET_PROMPT_TEXT = 'SECRET_LOADING_PROMPT_TEXT';
const SECRET_RAW_SETTINGS = 'SECRET_LOADING_RAW_SETTINGS_JSON';
const SECRET_SHARE_ID = 'secret-loading-share-id';
const SECRET_SOURCE_MATERIAL = 'source-materials/private/loading.pdf';
const SECRET_STUDENT_ANSWER = 'SECRET_LOADING_STUDENT_ANSWER';
const SECRET_STUDENT_NAME = 'Secret Loading Student';
const SECRET_TOKEN = 'raw-loading-anonymous-token';

test('student runner loading handoff exposes 30 safe preparation slices', () => {
  const handoffView = buildStudentRunnerLoadingHandoffView({
    message: 'Loading student activity...',
    shareId: ` ${SECRET_SHARE_ID} `,
  });
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...STUDENT_RUNNER_LOADING_HANDOFF_ITEM_IDS]);
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
    allowsSubmission: false,
    exposesActivityContent: false,
    exposesActualShareSlug: false,
    exposesAnonymousToken: false,
    exposesAnswerKeys: false,
    exposesAssignmentTitle: false,
    exposesBrowserLabel: false,
    exposesExplanations: false,
    exposesRawSettingsJson: false,
    exposesRuntimeChoiceText: false,
    exposesRuntimeItemIds: false,
    exposesRuntimePromptText: false,
    exposesSourceMaterialMetadata: false,
    exposesStudentAnswerText: false,
    exposesStudentName: false,
    itemIds,
    scope: 'public-student-runner-loading',
    startsAttemptClock: false,
  });

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['route-status', 'Loading'],
      ['share-link', 'Share id hidden'],
      ['lookup-state', 'Pending'],
      ['query-source', 'Public assignment query'],
      ['loading-message', 'Loading student activity...'],
      ['public-payload-status', 'Not ready'],
      ['runtime-items-status', 'No items yet'],
      ['item-order-status', 'Deferred'],
      ['timer-start-boundary', 'After runtime load'],
      ['attempt-clock-status', 'Not started'],
      ['submit-gate', 'Blocked'],
      ['submission-policy', 'No payload'],
      ['identity-policy', 'Deferred'],
      ['browser-token-policy', 'Not created'],
      ['student-name-policy', 'Not collected'],
      ['rule-summary-status', 'Pending settings'],
      ['unavailable-check', 'Pending lookup'],
      ['starter-preview-fallback', 'Deferred'],
      ['sanitized-payload-boundary', 'Pending available assignment'],
      ['activity-content-boundary', 'Hidden'],
      ['answer-key-boundary', 'Hidden'],
      ['explanation-boundary', 'Hidden'],
      ['source-material-boundary', 'Private'],
      ['runtime-prompt-boundary', 'Omitted'],
      ['runtime-choice-boundary', 'Omitted'],
      ['runtime-id-boundary', 'Omitted'],
      ['student-answer-boundary', 'None'],
      ['result-boundary', 'Unavailable'],
      ['indexing-policy', 'noindex'],
      ['privacy-guard', 'Private data omitted'],
    ]
  );
  assertNoPrivateLoadingText(JSON.stringify(handoffView));
});

test('student runner loading handoff is carried by loading route view models', () => {
  const starterPreview = buildStudentRunnerStarterPreview(
    STARTER_FOOD_ASSIGNMENT_SHARE_ID
  );
  const pageState = buildStudentRunnerPageState({
    data: undefined,
    isLoading: true,
    shareId: SECRET_SHARE_ID,
    starterPreview,
  });
  const pageView = buildStudentRunnerPageViewModel({
    anonymousToken: SECRET_TOKEN,
    answers: {
      secret: SECRET_STUDENT_ANSWER,
    },
    confirmIncompleteSubmit: false,
    fallbackStartedAt: 10_000,
    isSubmitting: false,
    pageState,
    shareId: SECRET_SHARE_ID,
    submittedAttemptCount: 0,
  });
  const routeState = buildStudentRunnerRouteState(pageView);

  assert.equal(routeState.status, 'loading');
  assert.equal(pageView.attemptState.canSubmit, false);
  assert.equal(pageView.attemptState.runtimeItems.length, 0);
  assert.equal(
    pageView.loadingView.handoffView.privacy.startsAttemptClock,
    false
  );
  assert.equal(
    getHandoffValue(pageView.loadingView.handoffView, 'share-link'),
    'Share id hidden'
  );
  assert.equal(
    getHandoffValue(pageView.loadingView.handoffView, 'timer-start-boundary'),
    'After runtime load'
  );
  assert.equal(
    getHandoffValue(pageView.loadingView.handoffView, 'submit-gate'),
    'Blocked'
  );
  assert.equal(
    buildStudentRunnerAttemptClockStartPlan({
      activeShareId: pageView.activeShareId,
      attemptClock: undefined,
      canSubmit: pageView.attemptState.canSubmit,
      hasResult: false,
      now: 12_000,
    }).type,
    'skip'
  );
  assertNoPrivateLoadingText(JSON.stringify(pageView.loadingView.handoffView));
});

test('student runner loading handoff localizes Chinese preparation boundary', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const handoffView = buildStudentRunnerLoadingHandoffView({
      message: '正在加载学生活动...',
      shareId: SECRET_SHARE_ID,
    });

    assert.equal(handoffView.title, 'Runner 加载交接');
    assert.match(handoffView.description, /30 切片加载交接/);
    assert.equal(getHandoffValue(handoffView, 'route-status'), '加载中');
    assert.equal(getHandoffValue(handoffView, 'share-link'), '分享 ID 已隐藏');
    assert.equal(getHandoffValue(handoffView, 'lookup-state'), '等待中');
    assert.equal(
      getHandoffValue(handoffView, 'timer-start-boundary'),
      '运行内容加载后'
    );
    assert.equal(
      getHandoffValue(handoffView, 'attempt-clock-status'),
      '未启动'
    );
    assert.equal(getHandoffValue(handoffView, 'submit-gate'), '已阻止');
    assert.equal(
      getHandoffValue(handoffView, 'browser-token-policy'),
      '未创建'
    );
    assert.equal(
      getHandoffValue(handoffView, 'privacy-guard'),
      '已省略私密数据'
    );
    assertNoPrivateLoadingText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

test('student runner loading panel renders stable hidden handoff markers', () => {
  const componentSource = readFileSync(
    'src/components/assignments/student-runner-loading-panel.tsx',
    'utf8'
  );
  const routeSource = readFileSync('src/routes/play/$shareId.tsx', 'utf8');

  assert.match(
    componentSource,
    /StudentRunnerLoadingHandoffItemView[\s\S]*StudentRunnerLoadingHandoffView[\s\S]*<StudentRunnerLoadingHandoff view=\{view\.handoffView\} \/>[\s\S]*function StudentRunnerLoadingHandoff[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-labelledby=\{titleId\}[\s\S]*data-handoff="student-runner-loading"[\s\S]*data-handoff-scope=\{view\.privacy\.scope\}[\s\S]*view\.itemViews\.map[\s\S]*StudentRunnerLoadingHandoffItem[\s\S]*function StudentRunnerLoadingHandoffItem[\s\S]*const labelId = `student-runner-loading-handoff-\$\{itemView\.id\}-label`[\s\S]*const valueId = `student-runner-loading-handoff-\$\{itemView\.id\}-value`[\s\S]*const descriptionId = `student-runner-loading-handoff-\$\{itemView\.id\}-description`[\s\S]*data-handoff-item=\{itemView\.id\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{itemView\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/,
    'Student runner loading handoff should render privacy scope plus stable label, value, and description relationships.'
  );
  assert.match(
    routeSource,
    /runnerRouteState\.status === 'loading'[\s\S]*<StudentRunnerLoadingPanel view=\{runnerPageView\.loadingView\} \/>/,
    'Student runner route should pass the prepared loading view into the loading panel.'
  );
});

function getHandoffValue(
  view: StudentRunnerLoadingHandoffView,
  id: StudentRunnerLoadingHandoffItemId
) {
  const item = view.itemViews.find((handoffItem) => handoffItem.id === id);
  assert.ok(item, `Missing loading handoff item ${id}`);
  return item.value;
}

function assertNoPrivateLoadingText(value: string) {
  for (const privateValue of [
    SECRET_ACTIVITY_CONTENT,
    SECRET_ANSWER_KEY,
    SECRET_ASSIGNMENT_TITLE,
    SECRET_CHOICE_TEXT,
    SECRET_EXPLANATION,
    SECRET_PROMPT_TEXT,
    SECRET_RAW_SETTINGS,
    SECRET_SHARE_ID,
    SECRET_SOURCE_MATERIAL,
    SECRET_STUDENT_ANSWER,
    SECRET_STUDENT_NAME,
    SECRET_TOKEN,
  ]) {
    assert.equal(
      value.includes(privateValue),
      false,
      `Student runner loading handoff leaked private text: ${privateValue}`
    );
  }
}
