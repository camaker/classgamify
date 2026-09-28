import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

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
    /usePublicAssignment\(normalizedShareId\)[\s\S]*buildStudentRunnerPageViewModel\(\{[\s\S]*buildStudentRunnerSubmissionExecutionPlan\(\{[\s\S]*submitAttemptMutation\.mutateAsync\([\s\S]*StudentRuntimeItemList[\s\S]*StudentRunnerSubmitControls/s,
    'The play route should compose public payload, runner state, runtime list, and submit controls.'
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

test('student runner clocks, submit confirmation, and runtime surfaces stay explicit', () => {
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
    /buildStudentRuntimeItemListView[\s\S]*getActivityTemplateRunnerKind\(templateType\)[\s\S]*buildDefaultRuntimeItemCardViews\(\{/,
    'Student runtime helpers should pick the template runner surface and build the visible item cards.'
  );
  assert.doesNotMatch(
    STUDENT_RUNTIME_SOURCE,
    /Handoff/,
    'Student runtime helpers should not rebuild hidden handoff markup.'
  );
});

test('student runner play chain focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /Student runner play chain has a fast script-level gate via[\s\S]*scripts\/student-runner-play-chain\.test\.ts/,
    'TEST-CATALOG should document the student runner play chain gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE.replace(/\s+/g, ' '),
    /public payload[\s\S]*rule summary[\s\S]*identity[\s\S]*template renderers[\s\S]*partial-submit[\s\S]*attempt persistence[\s\S]*answer feedback/,
    'TEST-CATALOG should document the student runner play-chain scope.'
  );
  assert.match(
    TEST_CATALOG_SOURCE.replace(/\s+/g, ' '),
    /visible submit controls/,
    'TEST-CATALOG should document the visible submit controls boundary.'
  );
});
