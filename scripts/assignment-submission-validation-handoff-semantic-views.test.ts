import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { STARTER_FOOD_ASSIGNMENT_SHARE_ID } from '@/activities/starter-ids';
import {
  ASSIGNMENT_SUBMISSION_VALIDATION_HANDOFF_ITEM_IDS,
  buildAssignmentSubmissionValidationHandoffEvidence,
  buildAssignmentSubmissionValidationHandoffView,
  type AssignmentSubmissionValidationHandoffItemId,
  type AssignmentSubmissionValidationHandoffView,
} from '@/assignments/submission-validation-handoff';
import {
  buildStudentRunnerPageViewModel,
  buildStudentRunnerReadyState,
  buildStudentRunnerStarterPreview,
} from '@/assignments/student-runner-state';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER_TEXT = 'SECRET_SUBMISSION_VALIDATION_ANSWER';
const SECRET_ANONYMOUS_TOKEN = 'secret-submission-validation-token';
const SECRET_RUNTIME_ITEM_ID = 'secret-runtime-item-id';
const SECRET_STUDENT_NAME = 'Secret Submission Validation Student';

const API_ASSIGNMENTS_SOURCE = readFileSync('src/api/assignments.ts', 'utf8');
const ATTEMPT_ANSWERS_SOURCE = readFileSync(
  'src/assignments/attempt-answers.ts',
  'utf8'
);
const PUBLIC_ASSIGNMENT_SOURCE = readFileSync(
  'src/assignments/public.ts',
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
const SUBMISSION_VALIDATION_SOURCE = readFileSync(
  'src/assignments/submission-validation-handoff.ts',
  'utf8'
);
const SUBMIT_CONTROLS_SOURCE = readFileSync(
  'src/components/assignments/student-runner-submit-controls.tsx',
  'utf8'
);

test('submission validation handoff exposes 30 safe validation slices', () => {
  const handoffView = buildAssignmentSubmissionValidationHandoffView(
    buildValidationEvidence()
  );
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...ASSIGNMENT_SUBMISSION_VALIDATION_HANDOFF_ITEM_IDS,
  ]);
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
    exposesAnswerText: false,
    exposesRawAnonymousToken: false,
    exposesRawPayloadRows: false,
    exposesRuntimeItemIds: false,
    exposesStudentName: false,
    exposesTeacherOnlyAnswers: false,
    itemIds,
    mutatesAttempts: false,
    scope: 'assignment-submission-validation-boundary',
    usesSharedAttemptAnswerHelpers: true,
  });
  assertNoPrivateSubmissionValidationText(JSON.stringify(handoffView));
});

test('submission validation handoff summarizes validation rules', () => {
  const handoffView = buildAssignmentSubmissionValidationHandoffView(
    buildValidationEvidence()
  );

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['validation-scope', 'Frozen runtime validation'],
      ['runtime-source', 'Frozen runtime'],
      ['runtime-item-count', '3 runtime items'],
      ['submitted-answer-count', '2 answers'],
      ['partial-submission', 'Partial attempts allowed'],
      ['empty-answer-omission', 'Empty answers omitted'],
      ['runtime-id-normalization', 'Ready'],
      ['submitted-id-normalization', 'Ready'],
      ['runtime-id-uniqueness', 'Unique ids'],
      ['blank-id-rejection', 'Rejected'],
      ['unknown-item-rejection', 'Rejected'],
      ['duplicate-item-rejection', 'Rejected'],
      ['too-many-rejection', 'Rejected'],
      ['duplicate-runtime-rejection', 'Rejected'],
      ['fullwidth-id-normalization', 'Normalized'],
      ['api-answer-limit', '200 max'],
      ['api-item-id-limit', '120 max'],
      ['api-answer-text-limit', '500 chars'],
      ['api-max-answers-limit', '200 max'],
      ['api-normalizes-answers', 'Ready'],
      ['api-validates-before-scoring', 'Ready'],
      ['scoring-normalized-answers', 'Ready'],
      ['persistence-normalized-answers', 'Ready'],
      ['client-payload-builder', 'Ready'],
      ['client-progress-source', 'Ready'],
      ['safe-failure-mapping', 'Safe failure messages'],
      ['teacher-result-boundary', 'Ready'],
      ['public-payload-boundary', 'Ready'],
      ['raw-payload-guard', 'Raw payload hidden'],
      ['privacy-guard', 'Private data hidden'],
    ]
  );
  assertNoPrivateSubmissionValidationText(JSON.stringify(handoffView));
});

test('submission validation handoff localizes Chinese safe values', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const handoffView = buildAssignmentSubmissionValidationHandoffView(
      buildValidationEvidence()
    );

    assert.equal(handoffView.title, '提交校验交接');
    assert.match(handoffView.description, /30 个安全切片/);
    assert.equal(
      getHandoffValue(handoffView, 'runtime-source'),
      '冻结运行题目'
    );
    assert.equal(
      getHandoffValue(handoffView, 'partial-submission'),
      '允许局部提交'
    );
    assert.equal(
      getHandoffValue(handoffView, 'unknown-item-rejection'),
      '已拒绝'
    );
    assert.equal(
      getHandoffValue(handoffView, 'raw-payload-guard'),
      'Raw payload 已隐藏'
    );
    assertNoPrivateSubmissionValidationText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

test('student runner page state renders submission validation handoff', () => {
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
      assignment: starterPreview.assignment,
      runtimeItems: starterPreview.runtimeItems,
      source: 'public-assignment',
    }),
    shareId: STARTER_FOOD_ASSIGNMENT_SHARE_ID,
    submittedAttemptCount: 0,
  });

  assert.deepEqual(
    pageView.submissionValidationHandoffView.itemViews.map((item) => item.id),
    [...ASSIGNMENT_SUBMISSION_VALIDATION_HANDOFF_ITEM_IDS]
  );
  assert.equal(
    getHandoffValue(
      pageView.submissionValidationHandoffView,
      'runtime-item-count'
    ),
    `${starterPreview.runtimeItems.length} runtime items`
  );
  assert.equal(
    getHandoffValue(
      pageView.submissionValidationHandoffView,
      'submitted-answer-count'
    ),
    '1 answers'
  );
  assert.equal(
    getHandoffValue(pageView.submissionValidationHandoffView, 'privacy-guard'),
    'Private data hidden'
  );
  assertNoPrivateSubmissionValidationText(
    JSON.stringify(pageView.submissionValidationHandoffView)
  );
  assert.equal(
    JSON.stringify(pageView.submissionValidationHandoffView).includes(
      runtimeItem.id
    ),
    false
  );
});

test('submission validation handoff is wired to source boundaries', () => {
  assert.match(
    SUBMISSION_VALIDATION_SOURCE,
    /export const ASSIGNMENT_SUBMISSION_VALIDATION_HANDOFF_ITEM_IDS = \[(?=[\s\S]*'validation-scope')(?=[\s\S]*'runtime-source')(?=[\s\S]*'runtime-item-count')(?=[\s\S]*'submitted-answer-count')(?=[\s\S]*'partial-submission')(?=[\s\S]*'empty-answer-omission')(?=[\s\S]*'runtime-id-normalization')(?=[\s\S]*'submitted-id-normalization')(?=[\s\S]*'runtime-id-uniqueness')(?=[\s\S]*'blank-id-rejection')(?=[\s\S]*'unknown-item-rejection')(?=[\s\S]*'duplicate-item-rejection')(?=[\s\S]*'too-many-rejection')(?=[\s\S]*'duplicate-runtime-rejection')(?=[\s\S]*'fullwidth-id-normalization')(?=[\s\S]*'api-answer-limit')(?=[\s\S]*'api-item-id-limit')(?=[\s\S]*'api-answer-text-limit')(?=[\s\S]*'api-max-answers-limit')(?=[\s\S]*'api-normalizes-answers')(?=[\s\S]*'api-validates-before-scoring')(?=[\s\S]*'scoring-normalized-answers')(?=[\s\S]*'persistence-normalized-answers')(?=[\s\S]*'client-payload-builder')(?=[\s\S]*'client-progress-source')(?=[\s\S]*'safe-failure-mapping')(?=[\s\S]*'teacher-result-boundary')(?=[\s\S]*'public-payload-boundary')(?=[\s\S]*'raw-payload-guard')(?=[\s\S]*'privacy-guard')[\s\S]*\] as const;/,
    'Submission validation handoff should expose the full 30-slice id contract.'
  );
  assert.match(
    ATTEMPT_ANSWERS_SOURCE,
    /assertSubmittedAnswersMatchRuntimeItems[\s\S]*answers\.length > runtimeItems\.length[\s\S]*unknown-item[\s\S]*duplicate-item[\s\S]*duplicate-runtime-item/,
    'Attempt-answer helper should reject too-many, unknown, duplicate, and duplicate-runtime ids.'
  );
  assert.match(
    API_ASSIGNMENTS_SOURCE,
    /const submittedAnswers = normalizeSubmittedAttemptAnswers\(data\.answers\)[\s\S]*assertSubmittedAnswersMatchRuntimeItems\(\{[\s\S]*answers: submittedAnswers,[\s\S]*runtimeItems: orderedRuntimeItems,[\s\S]*\}\)[\s\S]*evaluateRuntimeAnswers\(\{[\s\S]*answers: submittedAnswers/,
    'Submit attempt API should normalize and validate answers before scoring.'
  );
  assert.match(
    API_ASSIGNMENTS_SOURCE,
    /const evaluation = evaluateRuntimeAnswers\(\{[\s\S]*answers: submittedAnswers[\s\S]*buildScoredAttemptInsert\(\{[\s\S]*evaluation,/,
    'Scored attempt persistence should receive the evaluation produced from normalized submitted answers.'
  );
  assert.match(
    STUDENT_SUBMISSION_SOURCE,
    /buildAttemptSubmissionAnswers[\s\S]*getUniqueSubmissionRuntimeItemEntries\(runtimeItems\)[\s\S]*if \(!isStudentAnswerFilled\(answer\)\) return \[\]/,
    'Browser payload builder should derive rows from runtime items and omit empty answers.'
  );
  assert.match(
    RUNNER_STATE_SOURCE,
    /submissionValidationHandoffView: AssignmentSubmissionValidationHandoffView;[\s\S]*buildAssignmentSubmissionValidationHandoffView\([\s\S]*buildAssignmentSubmissionValidationHandoffEvidence\(\{[\s\S]*runtimeItems: attemptState\.runtimeItems,[\s\S]*submittedAnswerCount: currentPayloadSummary\.answerCount/,
    'Student runner page view-model should compose the submission validation handoff from runtime and payload counts.'
  );
  assert.match(
    SUBMIT_CONTROLS_SOURCE,
    /data-handoff="assignment-submission-validation"[\s\S]*view\.itemViews\.map\(\(item\)[\s\S]*data-handoff-item=\{item\.id\}[\s\S]*<output aria-label=\{item\.ariaLabel\}>/,
    'Student submit controls should render the hidden submission validation handoff outputs.'
  );
  assert.match(
    ROUTE_SOURCE,
    /submissionValidationHandoffView=\{\s*runnerPageView\.submissionValidationHandoffView\s*\}/,
    'Student play route should pass the prepared submission validation handoff into submit controls.'
  );
  assert.match(
    PUBLIC_ASSIGNMENT_SOURCE,
    /stripRuntimeAnswers[\s\S]*answer:[\s\S]*undefined/,
    'Public assignment payloads should strip teacher-only answers before student delivery.'
  );
  assert.match(
    RESULT_VIEW_SOURCE,
    /buildAssignmentResultsPageViewModel[\s\S]*reviews: data\?\.analysis\.attempts/,
    'Teacher result views should rely on stored attempt analysis rather than public payload internals.'
  );
});

function buildValidationEvidence() {
  return buildAssignmentSubmissionValidationHandoffEvidence({
    apiNormalizesAnswersBeforeValidation:
      /const submittedAnswers = normalizeSubmittedAttemptAnswers/.test(
        API_ASSIGNMENTS_SOURCE
      ),
    apiValidatesBeforeScoring:
      /assertSubmittedAnswersMatchRuntimeItems[\s\S]*evaluateRuntimeAnswers/.test(
        API_ASSIGNMENTS_SOURCE
      ),
    clientPayloadUsesRuntimeItems:
      /buildAttemptSubmissionAnswers[\s\S]*getUniqueSubmissionRuntimeItemEntries/.test(
        STUDENT_SUBMISSION_SOURCE
      ),
    clientProgressUsesRuntimeItems:
      /getAttemptCompletionSummary[\s\S]*getUniqueSubmissionRuntimeItemEntries/.test(
        STUDENT_SUBMISSION_SOURCE
      ),
    persistenceUsesNormalizedAnswers:
      /const evaluation = evaluateRuntimeAnswers\(\{[\s\S]*answers: submittedAnswers[\s\S]*buildScoredAttemptInsert\(\{[\s\S]*evaluation,/.test(
        API_ASSIGNMENTS_SOURCE
      ),
    publicPayloadExcludesTeacherAnswers: /stripRuntimeAnswers/.test(
      PUBLIC_ASSIGNMENT_SOURCE
    ),
    runtimeItems: [{ id: 'item-1' }, { id: 'item-2' }, { id: 'item-3' }],
    safeFailureMapping:
      /isSafeStudentAttemptAnswerValidationErrorCode[\s\S]*unknown-item/.test(
        STUDENT_SUBMISSION_SOURCE
      ),
    scoringUsesNormalizedAnswers:
      /evaluateRuntimeAnswers\(\{[\s\S]*answers: submittedAnswers/.test(
        API_ASSIGNMENTS_SOURCE
      ),
    submittedAnswerCount: 2,
    teacherResultsUseStoredScoredAnswers:
      /buildAssignmentResultsPageViewModel[\s\S]*reviews: data\?\.analysis\.attempts/.test(
        RESULT_VIEW_SOURCE
      ),
  });
}

function getHandoffValue(
  view: AssignmentSubmissionValidationHandoffView,
  id: AssignmentSubmissionValidationHandoffItemId
) {
  const item = view.itemViews.find((candidate) => candidate.id === id);
  assert.ok(item, `Missing submission validation handoff item ${id}`);
  return item.value;
}

function assertNoPrivateSubmissionValidationText(serialized: string) {
  for (const privateValue of [
    SECRET_ANSWER_TEXT,
    SECRET_ANONYMOUS_TOKEN,
    SECRET_RUNTIME_ITEM_ID,
    SECRET_STUDENT_NAME,
  ]) {
    assert.equal(
      serialized.includes(privateValue),
      false,
      `Submission validation handoff leaked private text: ${privateValue}`
    );
  }
}
