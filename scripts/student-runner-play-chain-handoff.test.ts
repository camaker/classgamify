import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { ASSIGNMENT_ANSWER_FEEDBACK_HANDOFF_ITEM_IDS } from '@/assignments/answer-feedback-handoff';
import { ASSIGNMENT_ATTEMPT_DURATION_HANDOFF_ITEM_IDS } from '@/assignments/attempt-duration-handoff';
import { ASSIGNMENT_ATTEMPT_LIMIT_HANDOFF_ITEM_IDS } from '@/assignments/attempt-limit-handoff';
import { ASSIGNMENT_ATTEMPT_PERSISTENCE_HANDOFF_ITEM_IDS } from '@/assignments/attempt-persistence-handoff';
import { PUBLIC_ASSIGNMENT_RULES_HANDOFF_ITEM_IDS } from '@/assignments/delivery-summary';
import { FILL_BLANK_WORKSHEET_HANDOFF_ITEM_IDS } from '@/assignments/fill-blank-worksheet-handoff';
import { GROUP_SORT_BOARD_HANDOFF_ITEM_IDS } from '@/assignments/group-sort-board-handoff';
import { LINE_MATCH_BOARD_HANDOFF_ITEM_IDS } from '@/assignments/line-match-board-handoff';
import { LISTENING_SPEECH_HANDOFF_ITEM_IDS } from '@/assignments/listening-speech-handoff';
import { MATCHING_PAIRS_BOARD_HANDOFF_ITEM_IDS } from '@/assignments/matching-pairs-board-handoff';
import { OPEN_BOX_REVEAL_HANDOFF_ITEM_IDS } from '@/assignments/open-box-reveal-handoff';
import { PUBLIC_ASSIGNMENT_ACCESS_HANDOFF_ITEM_IDS } from '@/assignments/public';
import { STUDENT_RUNTIME_CHOICE_ASSIGNMENT_HANDOFF_ITEM_IDS } from '@/assignments/runtime-choice-assignment-handoff';
import { STUDENT_RUNTIME_IDENTITY_HANDOFF_ITEM_IDS } from '@/assignments/runtime-identity-handoff';
import {
  STUDENT_RUNNER_PLAY_CHAIN_HANDOFF_ITEM_IDS,
  STUDENT_RUNNER_PLAY_CHAIN_SOURCE_FILES,
  buildStudentRunnerPlayChainHandoffView,
  type StudentRunnerPlayChainHandoffItemId,
  type StudentRunnerPlayChainHandoffView,
} from '@/assignments/student-runner-play-chain';
import { STUDENT_RUNNER_IDENTITY_HANDOFF_ITEM_IDS } from '@/assignments/student-runner-identity-handoff';
import { STUDENT_RUNNER_LOADING_HANDOFF_ITEM_IDS } from '@/assignments/student-runner-loading-handoff';
import {
  STUDENT_RUNNER_START_HANDOFF_ITEM_IDS,
  STUDENT_RUNNER_SUBMISSION_HANDOFF_ITEM_IDS,
} from '@/assignments/student-runner-state';
import { STUDENT_RUNNER_SUBMIT_CONTROLS_HANDOFF_ITEM_IDS } from '@/assignments/student-runner-submit-controls-handoff';
import {
  STUDENT_RUNTIME_INTERACTION_HANDOFF_ITEM_IDS,
  STUDENT_RUNTIME_SEMANTIC_BUNDLE_HANDOFF_ITEM_IDS,
} from '@/assignments/student-runtime-item-list';
import { ASSIGNMENT_SUBMISSION_VALIDATION_HANDOFF_ITEM_IDS } from '@/assignments/submission-validation-handoff';
import { PUBLIC_ASSIGNMENT_UNAVAILABLE_ACCESS_HANDOFF_ITEM_IDS } from '@/assignments/unavailable-access';

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const ASSIGNMENTS_API_SOURCE = readFileSync('src/api/assignments.ts', 'utf8');
const PUBLIC_ASSIGNMENT_SOURCE = readFileSync(
  'src/assignments/public.ts',
  'utf8'
);
const PLAY_ROUTE_SOURCE = readFileSync('src/routes/play/$shareId.tsx', 'utf8');
const STUDENT_RUNNER_STATE_SOURCE = readFileSync(
  'src/assignments/student-runner-state.ts',
  'utf8'
);
const STUDENT_SUBMISSION_SOURCE = readFileSync(
  'src/assignments/student-submission.ts',
  'utf8'
);
const STUDENT_RUNTIME_SOURCE = readFileSync(
  'src/assignments/student-runtime-item-list.ts',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const PRIVATE_ANSWER_KEY = 'SECRET_STUDENT_RUNNER_ANSWER';
const PRIVATE_RUNTIME_ID = 'SECRET_RUNTIME_ITEM_ID';
const PRIVATE_SOURCE_MATERIAL = 'source-material/private/student-runner.pdf';
const PRIVATE_STUDENT_NAME = 'SECRET_STUDENT_NAME';
const PRIVATE_TOKEN = 'SECRET_RAW_ANONYMOUS_TOKEN';

test('student runner play chain exposes 30 public-runner slices', () => {
  const handoffView = buildStudentRunnerPlayChainHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...STUDENT_RUNNER_PLAY_CHAIN_HANDOFF_ITEM_IDS]);
  assert.equal(handoffView.title, 'Student runner play chain');
  assert.match(handoffView.description, /Thirty-slice public student runner/);
  assert.equal(handoffView.itemViews.length, 30);
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
    chainSourceFileCount: STUDENT_RUNNER_PLAY_CHAIN_SOURCE_FILES.length,
    exposesAnswerKeysBeforeReview: false,
    exposesAnswerTextInSubmitControls: false,
    exposesRawAnonymousTokens: false,
    exposesRawSubmissionPayloadInSubmitControls: false,
    exposesRuntimeItemIdsInHandoffs: false,
    exposesSourceMaterialMetadata: false,
    exposesStudentAnswersBeforeSubmit: false,
    exposesStudentNameInHandoffs: false,
    exposesTeacherOnlyAnswersInSubmitControls: false,
    exposesTeacherSourceMaterialsInSubmitControls: false,
    itemIds,
    preservesTeacherReviewBoundary: true,
    publicPayloadUsesSanitizedRuntimeItems: true,
    rejectsClosedOrExpiredSubmissions: true,
    rejectsInvalidSubmittedAnswers: true,
    sourceFiles: [...STUDENT_RUNNER_PLAY_CHAIN_SOURCE_FILES],
    submissionPayloadUsesRuntimeItemIds: true,
    usesSubmitControlsHandoff: true,
  });
  assertNoPrivateStudentRunnerText(JSON.stringify(handoffView));
});

test('student runner play chain summarizes each runner step', () => {
  const handoffView = buildStudentRunnerPlayChainHandoffView();

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['public-payload-gate', 'Open links only'],
      ['public-rules-summary', 'Student-visible policy'],
      ['unavailable-link-policy', 'Runtime hidden'],
      ['lifecycle-access-check', 'Published and open'],
      ['runtime-item-order', 'Stable order'],
      ['runner-loading-state', 'Payload pending'],
      ['runner-start-readiness', 'Rules before play'],
      ['runner-identity-policy', 'Name or browser'],
      ['anonymous-token-guard', 'Raw token hidden'],
      ['attempt-limit-enforcement', 'Per identity'],
      ['timer-start-boundary', 'After readiness'],
      ['duration-normalization', 'Whole seconds'],
      ['runtime-interaction-routing', 'Template renderer'],
      ['choice-assignment-contract', '{ itemId, answer }'],
      ['runtime-identity-contract', 'Identity hidden'],
      ['semantic-bundle-guard', 'Safe handoff bundle'],
      ['fill-blank-renderer', 'Worksheet blanks'],
      ['line-match-renderer', 'Connection flow'],
      ['group-sort-renderer', 'Category board'],
      ['matching-pairs-renderer', 'Left/right cards'],
      ['listening-renderer', 'Speech track'],
      ['open-box-renderer', 'Reveal flow'],
      ['progress-counts', 'Answered items'],
      ['partial-submit-confirmation', 'Explicit second action'],
      ['submit-controls-readiness', 'Prepared controls'],
      ['submission-validation', 'Shared answer guard'],
      ['attempt-persistence', 'Scored attempt'],
      ['answer-feedback-policy', 'Reveal if allowed'],
      ['post-submit-next-steps', 'Review or retry'],
      ['submit-controls-handoff-boundary', '30 submit control slices'],
    ]
  );
  assert.equal(
    getHandoffValue(handoffView, 'submission-validation'),
    'Shared answer guard'
  );
});

test('student runner play chain stays backed by focused contracts', () => {
  assert.equal(STUDENT_RUNNER_PLAY_CHAIN_SOURCE_FILES.length, 30);
  for (const filePath of STUDENT_RUNNER_PLAY_CHAIN_SOURCE_FILES) {
    assert.ok(
      existsSync(filePath),
      `Missing student runner play chain file ${filePath}`
    );
  }

  assert.deepEqual(
    [
      PUBLIC_ASSIGNMENT_ACCESS_HANDOFF_ITEM_IDS.length,
      PUBLIC_ASSIGNMENT_RULES_HANDOFF_ITEM_IDS.length,
      PUBLIC_ASSIGNMENT_UNAVAILABLE_ACCESS_HANDOFF_ITEM_IDS.length,
      STUDENT_RUNNER_LOADING_HANDOFF_ITEM_IDS.length,
      STUDENT_RUNNER_START_HANDOFF_ITEM_IDS.length,
      STUDENT_RUNNER_IDENTITY_HANDOFF_ITEM_IDS.length,
      STUDENT_RUNNER_SUBMIT_CONTROLS_HANDOFF_ITEM_IDS.length,
      STUDENT_RUNNER_SUBMISSION_HANDOFF_ITEM_IDS.length,
      STUDENT_RUNTIME_INTERACTION_HANDOFF_ITEM_IDS.length,
      STUDENT_RUNTIME_CHOICE_ASSIGNMENT_HANDOFF_ITEM_IDS.length,
      STUDENT_RUNTIME_IDENTITY_HANDOFF_ITEM_IDS.length,
      STUDENT_RUNTIME_SEMANTIC_BUNDLE_HANDOFF_ITEM_IDS.length,
      FILL_BLANK_WORKSHEET_HANDOFF_ITEM_IDS.length,
      LINE_MATCH_BOARD_HANDOFF_ITEM_IDS.length,
      GROUP_SORT_BOARD_HANDOFF_ITEM_IDS.length,
      MATCHING_PAIRS_BOARD_HANDOFF_ITEM_IDS.length,
      LISTENING_SPEECH_HANDOFF_ITEM_IDS.length,
      OPEN_BOX_REVEAL_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_ATTEMPT_LIMIT_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_ATTEMPT_DURATION_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_ANSWER_FEEDBACK_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_SUBMISSION_VALIDATION_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_ATTEMPT_PERSISTENCE_HANDOFF_ITEM_IDS.length,
    ],
    Array.from({ length: 23 }, () => 30)
  );
});

test('student runner sources preserve public payload and submit boundaries', () => {
  assert.match(
    PRODUCT_SOURCE,
    /Public student links must return a sanitized assignment payload only while the\s+assignment is open[\s\S]*Closed or expired links do not expose runtime content[\s\S]*Student runners should show a compact public rule summary[\s\S]*explicit\s+second confirmation/,
    'docs/product.md should define the public runner payload, rules, and partial-submit boundary.'
  );
  assert.match(
    PUBLIC_ASSIGNMENT_SOURCE,
    /buildOpenPublicAssignmentPayload[\s\S]*!isAssignmentOpen\([\s\S]*return null[\s\S]*return buildPublicAssignmentPayload/,
    'Open public assignment payload helper should hide payloads when lifecycle access is blocked.'
  );
  assert.match(
    PUBLIC_ASSIGNMENT_SOURCE,
    /buildPublicAssignmentLookupResult[\s\S]*getAssignmentLifecycleStatus[\s\S]*lifecycleStatus === 'open'[\s\S]*status: 'available'[\s\S]*status: 'unavailable'/,
    'Public assignment lookup should gate open payloads through lifecycle status.'
  );
  assert.match(
    PUBLIC_ASSIGNMENT_SOURCE,
    /orderAssignmentRuntimeItems\(\{[\s\S]*runtimeItems: stripRuntimeAnswers\(orderedRuntimeItems\)/,
    'Public payloads should order runtime items and strip answers before reaching the student runner.'
  );
  assert.match(
    PUBLIC_ASSIGNMENT_SOURCE,
    /runtimeItemsHidden: true[\s\S]*teacherMaterialsHidden: true[\s\S]*rawAnonymousTokenHidden: true/,
    'Unavailable payloads should hide runtime content, teacher material, and browser identity.'
  );
  assert.match(
    PLAY_ROUTE_SOURCE,
    /usePublicAssignment\(normalizedShareId\)[\s\S]*buildStudentRunnerPageViewModel\(\{[\s\S]*buildStudentRunnerSubmissionExecutionPlan\(\{[\s\S]*submitAttemptMutation\.mutateAsync\([\s\S]*StudentRuntimeItemList[\s\S]*StudentRunnerSubmitControls[\s\S]*StudentRunnerSubmissionHandoff/s,
    'The play route should compose public payload, runner state, runtime list, submit controls, and submission handoff.'
  );
  assert.match(
    ASSIGNMENTS_API_SOURCE,
    /assertAssignmentAcceptsSubmissions\(\{/,
    'Submit-attempt API should share lifecycle submission checks.'
  );
  assert.match(
    ASSIGNMENTS_API_SOURCE,
    /normalizeAttemptDurationSeconds\(\{/,
    'Submit-attempt API should normalize submitted attempt durations.'
  );
  assert.match(
    ASSIGNMENTS_API_SOURCE,
    /normalizeSubmittedAttemptAnswers\(data\.answers\)[\s\S]*assertSubmittedAnswersMatchRuntimeItems\(\{/,
    'Submit-attempt API should validate submitted answers against runtime items.'
  );
  assert.match(
    ASSIGNMENTS_API_SOURCE,
    /evaluateRuntimeAnswers\(\{[\s\S]*answers: submittedAnswers/,
    'Submit-attempt API should score normalized submitted answers.'
  );
  assert.match(
    ASSIGNMENTS_API_SOURCE,
    /buildScoredAttemptInsert\(\{/,
    'Submit-attempt API should persist through the scored-attempt insert helper.'
  );
});

test('student runner privacy contracts stay explicit across surfaces', () => {
  assert.match(
    STUDENT_RUNNER_STATE_SOURCE,
    /StudentRunnerStartHandoffPrivacyContract[\s\S]*exposesAnonymousToken: false[\s\S]*exposesRuntimeItemIds: false[\s\S]*exposesRuntimePromptText: false[\s\S]*scope: 'public-student-runner-start'/,
    'Student runner start handoff should hide tokens, runtime ids, prompts, answers, and teacher-only content.'
  );
  assert.match(
    STUDENT_RUNNER_STATE_SOURCE,
    /StudentRunnerSubmissionHandoffPrivacyContract[\s\S]*exposesAnonymousToken: false[\s\S]*exposesRawSubmissionPayload: false[\s\S]*exposesRuntimeItemIds: false[\s\S]*exposesStudentName: false/,
    'Student runner submission handoff should hide raw payload, runtime ids, student names, and anonymous tokens.'
  );
  assert.match(
    STUDENT_RUNNER_STATE_SOURCE,
    /buildStudentRunnerAttemptClockStartPlan[\s\S]*canSubmit[\s\S]*buildStudentRunnerSubmissionExecutionPlan[\s\S]*confirmIncompleteSubmit/,
    'Student runner state should start clocks after readiness and require explicit incomplete-submit confirmation.'
  );
  assert.match(
    STUDENT_SUBMISSION_SOURCE,
    /buildStudentAttemptSubmissionInput[\s\S]*getAttemptSubmitDecision[\s\S]*confirmIncompleteSubmit[\s\S]*type: 'confirm-incomplete'/,
    'Student submission helpers should keep incomplete confirmation before browser payload creation.'
  );
  assert.match(
    STUDENT_RUNTIME_SOURCE,
    /STUDENT_RUNTIME_RENDERER_SURFACES[\s\S]*buildStudentRuntimeInteractionHandoffView[\s\S]*buildStudentRuntimeSemanticBundleHandoffView[\s\S]*privacy: buildStudentRuntimeSemanticBundleHandoffPrivacyContract/,
    'Student runtime helpers should compose renderer, choice-assignment, and identity semantic bundles.'
  );
  assert.match(
    STUDENT_RUNTIME_SOURCE,
    /StudentRuntimeSemanticBundleHandoffPrivacyContract[\s\S]*exposesAnswerText: false[\s\S]*exposesRuntimeItemIds: false[\s\S]*exposesRuntimePromptText: false[\s\S]*scope: 'public-student-runtime-semantic-bundle'/,
    'Student runtime semantic bundle should keep runtime details private while using the shared answer contract.'
  );
});

test('student runner play chain focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /Student runner play chain has a fast script-level gate via[\s\S]*scripts\/student-runner-play-chain-handoff\.test\.ts/,
    'TEST-CATALOG should document the student runner play chain gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE.replace(/\s+/g, ' '),
    /public payload[\s\S]*rule summary[\s\S]*identity[\s\S]*template renderers[\s\S]*partial-submit[\s\S]*attempt persistence[\s\S]*answer feedback/,
    'TEST-CATALOG should document the student runner play-chain scope.'
  );
  assert.match(
    TEST_CATALOG_SOURCE.replace(/\s+/g, ' '),
    /submit controls handoff boundary/,
    'TEST-CATALOG should document the concrete submit controls handoff boundary.'
  );
});

function getHandoffValue(
  view: StudentRunnerPlayChainHandoffView,
  id: StudentRunnerPlayChainHandoffItemId
) {
  const item = view.itemViews.find((itemView) => itemView.id === id);
  assert.ok(item, `Missing student runner play chain item ${id}`);
  return item.value;
}

function assertNoPrivateStudentRunnerText(serializedView: string) {
  for (const privateValue of [
    PRIVATE_ANSWER_KEY,
    PRIVATE_RUNTIME_ID,
    PRIVATE_SOURCE_MATERIAL,
    PRIVATE_STUDENT_NAME,
    PRIVATE_TOKEN,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Student runner play chain leaked private text: ${privateValue}`
    );
  }
}
