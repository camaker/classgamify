import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { ASSIGNMENT_ATTEMPT_LIMIT_HANDOFF_ITEM_IDS } from '@/assignments/attempt-limit-handoff';
import { ASSIGNMENT_ATTEMPT_PERSISTENCE_HANDOFF_ITEM_IDS } from '@/assignments/attempt-persistence-handoff';
import { ASSIGNMENT_ATTEMPT_REVIEW_CARD_HANDOFF_ITEM_IDS } from '@/assignments/attempt-review-card-handoff';
import { ASSIGNMENT_RESULT_STUDENT_SEARCH_HANDOFF_ITEM_IDS } from '@/assignments/result-student-search-handoff';
import { ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS } from '@/assignments/results-export';
import { STUDENT_RUNTIME_IDENTITY_HANDOFF_ITEM_IDS } from '@/assignments/runtime-identity-handoff';
import {
  STUDENT_IDENTITY_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS,
  STUDENT_IDENTITY_LIFECYCLE_CHAIN_SOURCE_FILES,
  buildStudentIdentityLifecycleChainHandoffView,
  type StudentIdentityLifecycleChainHandoffItemId,
  type StudentIdentityLifecycleChainHandoffView,
} from '@/assignments/student-identity-lifecycle-chain';
import { STUDENT_RUNNER_IDENTITY_HANDOFF_ITEM_IDS } from '@/assignments/student-runner-identity-handoff';
import {
  STUDENT_RUNNER_PLAY_CHAIN_HANDOFF_ITEM_IDS,
  STUDENT_RUNNER_PLAY_CHAIN_SOURCE_FILES,
} from '@/assignments/student-runner-play-chain';
import {
  STUDENT_RUNNER_START_HANDOFF_ITEM_IDS,
  STUDENT_RUNNER_SUBMISSION_HANDOFF_ITEM_IDS,
} from '@/assignments/student-runner-state';
import { STUDENT_RUNNER_SUBMIT_CONTROLS_HANDOFF_ITEM_IDS } from '@/assignments/student-runner-submit-controls-handoff';
import { ASSIGNMENT_STUDENT_SUMMARY_SORT_HANDOFF_ITEM_IDS } from '@/assignments/student-summary-sort-handoff';
import { TEACHER_RESULTS_REVIEW_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/teacher-results-review-chain';

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const IDENTITY_SOURCE = readFileSync('src/assignments/identity.ts', 'utf8');
const ATTEMPT_IDENTITY_QUERY_SOURCE = readFileSync(
  'src/assignments/attempt-identity-query.ts',
  'utf8'
);
const ATTEMPT_PERSISTENCE_SOURCE = readFileSync(
  'src/assignments/attempt-persistence.ts',
  'utf8'
);
const ATTEMPT_QUERY_SOURCE = readFileSync(
  'src/assignments/attempt-query.ts',
  'utf8'
);
const STUDENT_SUBMISSION_SOURCE = readFileSync(
  'src/assignments/student-submission.ts',
  'utf8'
);
const STUDENT_RUNNER_STATE_SOURCE = readFileSync(
  'src/assignments/student-runner-state.ts',
  'utf8'
);
const STUDENT_RUNNER_IDENTITY_SOURCE = readFileSync(
  'src/assignments/student-runner-identity-handoff.ts',
  'utf8'
);
const RUNTIME_IDENTITY_SOURCE = readFileSync(
  'src/assignments/runtime-identity-handoff.ts',
  'utf8'
);
const ASSIGNMENTS_API_SOURCE = readFileSync('src/api/assignments.ts', 'utf8');
const APP_SCHEMA_SOURCE = readFileSync('src/db/app.schema.ts', 'utf8');
const PUBLIC_ASSIGNMENT_SOURCE = readFileSync(
  'src/assignments/public.ts',
  'utf8'
);
const RESULTS_SOURCE = readFileSync('src/assignments/results.ts', 'utf8');
const RESULT_SEARCH_SOURCE = readFileSync(
  'src/assignments/result-student-search-handoff.ts',
  'utf8'
);
const STUDENT_SUMMARY_SORT_SOURCE = readFileSync(
  'src/assignments/student-summary-sort-handoff.ts',
  'utf8'
);
const ATTEMPT_REVIEW_CARD_SOURCE = readFileSync(
  'src/assignments/attempt-review-card-handoff.ts',
  'utf8'
);
const RESULTS_EXPORT_SOURCE = readFileSync(
  'src/assignments/results-export.ts',
  'utf8'
);
const STUDENT_RUNNER_SHELL_SOURCE = readFileSync(
  'src/components/assignments/student-runner-attempt-shell.tsx',
  'utf8'
);
const RESULT_SEARCH_COMPONENT_SOURCE = readFileSync(
  'src/components/assignments/assignment-results-student-search.tsx',
  'utf8'
);
const ATTEMPT_REVIEW_COMPONENT_SOURCE = readFileSync(
  'src/components/assignments/assignment-results-attempt-review-card.tsx',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const PRIVATE_RAW_ANONYMOUS_TOKEN =
  'SECRET_STUDENT_IDENTITY_RAW_ANONYMOUS_TOKEN';
const PRIVATE_STUDENT_NAME = 'SECRET_STUDENT_IDENTITY_NAME';
const PRIVATE_STUDENT_ANSWER = 'SECRET_STUDENT_IDENTITY_ANSWER';
const PRIVATE_TEACHER_ANSWER = 'SECRET_STUDENT_IDENTITY_TEACHER_ANSWER';
const PRIVATE_SOURCE_MATERIAL = 'source-materials/private/student.pdf';

test('student identity lifecycle chain exposes 30 safe identity slices', () => {
  const handoffView = buildStudentIdentityLifecycleChainHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...STUDENT_IDENTITY_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS,
  ]);
  assert.equal(handoffView.title, 'Student identity lifecycle chain');
  assert.match(
    handoffView.description,
    /Thirty-slice student identity lifecycle chain/
  );
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
    chainSourceFileCount: STUDENT_IDENTITY_LIFECYCLE_CHAIN_SOURCE_FILES.length,
    exposesAnonymousBrowserLabel: true,
    exposesRawAnonymousTokens: false,
    exposesRawSubmissionPayloads: false,
    exposesRuntimeItemIdsInIdentityHandoff: false,
    exposesSourceMaterialMetadataInIdentityHandoff: false,
    exposesStudentAnswerTextInIdentityHandoff: false,
    exposesStudentNameInputValues: false,
    exposesStudentNamesInHandoff: false,
    exposesTeacherAnswerKeysInIdentityHandoff: false,
    itemIds,
    keepsNameAndTokenModesExclusive: true,
    requiresNormalizedAnonymousTokens: true,
    requiresNormalizedStudentNames: true,
    resultConsumersUseNormalizedIdentity: true,
    sourceFiles: [...STUDENT_IDENTITY_LIFECYCLE_CHAIN_SOURCE_FILES],
    usesBrowserTokenForAnonymousAttempts: true,
    usesDisplayLabelsForAnonymousResults: true,
    usesScoredAttemptsForAttemptLimits: true,
    usesStudentRuntimeIdentityHandoff: true,
  });
  assertNoPrivateStudentIdentityText(JSON.stringify(handoffView));
});

test('student identity lifecycle chain summarizes each identity step', () => {
  const handoffView = buildStudentIdentityLifecycleChainHandoffView();

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['product-identity-policy', 'Name or browser token'],
      ['student-name-normalization', 'NFKC + collapsed spaces'],
      ['anonymous-token-normalization', 'NFKC + no whitespace'],
      ['anonymous-browser-label', '6-char browser code'],
      ['anonymous-token-storage-key', 'classgamify:attempt-token'],
      ['anonymous-token-create-reuse', 'Reuse or create'],
      ['student-name-identity-key', 'name:*'],
      ['anonymous-identity-key', 'anonymous:*'],
      ['identity-grouping-priority', 'Name before token'],
      ['identity-resolver-display', 'Safe labels'],
      ['submission-name-mode', 'Name only'],
      ['submission-anonymous-mode', 'Token only'],
      ['attempt-count-strategy', 'Normalized strategy'],
      ['attempt-limit-count-query', 'Scored attempts'],
      ['runner-identity-view', 'Prepared identity view'],
      ['runner-anonymous-guidance', 'Browser guidance'],
      ['runner-identity-handoff', '30 identity slices'],
      ['runner-start-privacy', 'Start handoff hidden'],
      ['runner-submission-privacy', 'Submission handoff hidden'],
      ['submission-input-builder', 'Sanitized input'],
      ['submission-plan-token-resolution', 'Anonymous only'],
      ['api-submission-identity', 'Resolved identity'],
      ['attempt-persistence-identity-fields', 'Name or token'],
      ['scored-attempt-query-identity', 'Identity selects'],
      ['result-analysis-identity', 'Identity resolver'],
      ['result-search-anonymous-label', 'Normalized labels'],
      ['student-summary-sort-identity', 'Student label sort'],
      ['attempt-review-identity', 'Review label only'],
      ['result-export-token-guard', 'Raw token hidden'],
      ['runtime-identity-handoff-boundary', '30 runtime identity slices'],
    ]
  );
  assert.equal(
    getHandoffValue(handoffView, 'identity-resolver-display'),
    'Safe labels'
  );
});

test('student identity lifecycle chain is backed by adjacent gates', () => {
  assert.equal(STUDENT_IDENTITY_LIFECYCLE_CHAIN_SOURCE_FILES.length, 30);
  for (const filePath of STUDENT_IDENTITY_LIFECYCLE_CHAIN_SOURCE_FILES) {
    assert.ok(
      existsSync(filePath),
      `Missing student identity lifecycle chain file ${filePath}`
    );
  }

  assert.deepEqual(
    [
      STUDENT_RUNNER_IDENTITY_HANDOFF_ITEM_IDS.length,
      STUDENT_RUNNER_START_HANDOFF_ITEM_IDS.length,
      STUDENT_RUNNER_SUBMISSION_HANDOFF_ITEM_IDS.length,
      STUDENT_RUNNER_SUBMIT_CONTROLS_HANDOFF_ITEM_IDS.length,
      STUDENT_RUNTIME_IDENTITY_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_ATTEMPT_LIMIT_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_ATTEMPT_PERSISTENCE_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_RESULT_STUDENT_SEARCH_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_STUDENT_SUMMARY_SORT_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_ATTEMPT_REVIEW_CARD_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS.length,
      STUDENT_RUNNER_PLAY_CHAIN_HANDOFF_ITEM_IDS.length,
      STUDENT_RUNNER_PLAY_CHAIN_SOURCE_FILES.length,
      TEACHER_RESULTS_REVIEW_CHAIN_HANDOFF_ITEM_IDS.length,
    ],
    Array.from({ length: 14 }, () => 30)
  );
});

test('student identity product docs and helpers preserve normalization', () => {
  assert.match(
    PRODUCT_SOURCE,
    /Anonymous assignments use a browser token[\s\S]*without collecting student names[\s\S]*Student runners explain that anonymous work is tied to the current browser[\s\S]*normalized anonymous student labels instead of exposing raw tokens/,
    'docs/product.md should define browser tokens and raw-token privacy.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /Attempt identity must be normalized through shared helpers[\s\S]*Whitespace and case differences[\s\S]*should not create a new attempt identity[\s\S]*anonymous browser\s+tokens should remain separate students[\s\S]*without exposing\s+the\s+raw token/,
    'docs/product.md should keep the student identity normalization policy.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /Teachers can search result[\s\S]*normalized student display\s+label[\s\S]*anonymous student labels[\s\S]*without\s+exposing\s+raw anonymous tokens/,
    'docs/product.md should connect result search and anonymous labels.'
  );
  assert.match(
    IDENTITY_SOURCE,
    /normalizeStudentName[\s\S]*normalize\('NFKC'\)[\s\S]*replace\(\/\\s\+\/g, ' '\)\.trim\(\)/,
    'Student names should normalize NFKC, collapse spaces, and trim.'
  );
  assert.match(
    IDENTITY_SOURCE,
    /normalizeAnonymousToken[\s\S]*normalize\('NFKC'\)[\s\S]*replace\(\/\\s\+\/gu, ''\)/,
    'Anonymous tokens should normalize NFKC and remove whitespace.'
  );
  assert.match(
    IDENTITY_SOURCE,
    /ANONYMOUS_ATTEMPT_TOKEN_PREFIX = 'classgamify:attempt-token:'[\s\S]*buildAnonymousAttemptTokenStorageKey[\s\S]*normalizeAssignmentShareSlug/,
    'Anonymous browser-token storage keys should stay share-link scoped.'
  );
  assert.match(
    IDENTITY_SOURCE,
    /getOrCreateAnonymousAttemptToken[\s\S]*existingToken[\s\S]*storage\.setItem\(storageKey, existingToken\)[\s\S]*createToken\(\)[\s\S]*storage\.setItem\(storageKey, token\)/,
    'Anonymous tokens should be reused or normalized before storage.'
  );
  assert.match(
    IDENTITY_SOURCE,
    /buildStudentNameIdentityKey[\s\S]*name:\$\{normalizeStudentName\(studentName\)\.toLowerCase\(\)\}[\s\S]*buildAnonymousIdentityKey[\s\S]*anonymous:\$\{normalizeAnonymousToken\(anonymousToken\)\}/,
    'Identity keys should use normalized student names and anonymous tokens.'
  );
  assert.match(
    IDENTITY_SOURCE,
    /buildStudentIdentityGroupingKey[\s\S]*normalizeStudentName\(source\.studentName\)[\s\S]*return buildStudentNameIdentityKey[\s\S]*normalizeAnonymousToken\(source\.anonymousToken\)[\s\S]*return buildAnonymousIdentityKey[\s\S]*ANONYMOUS_UNKNOWN_IDENTITY_KEY/,
    'Identity grouping should prefer normalized names, then tokens, then unknown.'
  );
  assert.match(
    IDENTITY_SOURCE,
    /createStudentIdentityResolver[\s\S]*formatAnonymousStudentLabel\(anonymousIndex\)[\s\S]*buildAnonymousStudentDisplayKey\(anonymousIndex\)[\s\S]*return `anonymous:\$\{index\}`/,
    'Teacher result labels should use indexed anonymous display keys.'
  );
});

test('submission, runner, api, and attempt sources preserve identity privacy', () => {
  assert.match(
    STUDENT_SUBMISSION_SOURCE,
    /buildAnonymousAttemptCopy[\s\S]*hidesRawToken: true[\s\S]*showsBrowserLabel/,
    'Anonymous runner copy should expose browser label while hiding raw tokens.'
  );
  assert.match(
    STUDENT_SUBMISSION_SOURCE,
    /buildStudentAttemptSubmissionInput[\s\S]*collectStudentName[\s\S]*normalizeStudentName\(studentName\)[\s\S]*input\.studentName = normalizedStudentName[\s\S]*return input[\s\S]*normalizeAnonymousToken\(anonymousToken\)[\s\S]*input\.anonymousToken = normalizedAnonymousToken/,
    'Browser submission input should keep name and anonymous modes exclusive.'
  );
  assert.match(
    STUDENT_SUBMISSION_SOURCE,
    /buildStudentAttemptSubmissionPlan[\s\S]*resolveStudentAttemptAnonymousToken[\s\S]*buildStudentAttemptSubmissionInput/,
    'Submission planning should resolve identity before building API input.'
  );
  assert.match(
    STUDENT_SUBMISSION_SOURCE,
    /resolveStudentAttemptAnonymousToken[\s\S]*if \(collectStudentName\) return undefined[\s\S]*normalizeAnonymousToken\(currentAnonymousToken\)[\s\S]*normalizeAnonymousToken\(createAnonymousToken\(\)\)/,
    'Anonymous tokens should resolve only for anonymous assignment mode.'
  );
  assert.match(
    STUDENT_SUBMISSION_SOURCE,
    /buildStudentAttemptSubmitGate[\s\S]*collectStudentName && !normalizeStudentName\(studentName\)[\s\S]*missing-student-name/,
    'Name-collecting assignments should require normalized student names.'
  );
  assert.match(
    STUDENT_RUNNER_STATE_SOURCE,
    /buildStudentRunnerIdentityView[\s\S]*settings\.collectStudentName[\s\S]*mode: 'student-name'[\s\S]*buildAnonymousAttemptCopy/,
    'Runner state should build named or anonymous identity views from settings.'
  );
  assert.match(
    STUDENT_RUNNER_STATE_SOURCE,
    /StudentRunnerStartHandoffPrivacyContract[\s\S]*exposesAnonymousToken: false[\s\S]*exposesStudentName: false[\s\S]*exposesTeacherOnlyAnswers: false/,
    'Start handoff privacy should hide identity and answer details.'
  );
  assert.match(
    STUDENT_RUNNER_STATE_SOURCE,
    /StudentRunnerSubmissionHandoffPrivacyContract[\s\S]*exposesAnonymousToken: false[\s\S]*exposesRawSubmissionPayload: false[\s\S]*exposesStudentName: false/,
    'Submission handoff privacy should hide raw payload and identity details.'
  );
  assert.match(
    STUDENT_RUNNER_STATE_SOURCE,
    /buildStudentRunnerAnonymousTokenPlan[\s\S]*settings\.collectStudentName[\s\S]*return \{ type: 'skip' \}[\s\S]*type: 'resolve'/,
    'Runner anonymous-token plan should resolve tokens only for anonymous mode.'
  );
  assert.match(
    ASSIGNMENTS_API_SOURCE,
    /resolveAttemptSubmissionIdentity\(\{[\s\S]*anonymousToken: data\.anonymousToken[\s\S]*collectStudentName: settings\.collectStudentName[\s\S]*studentName: data\.studentName/,
    'Submit-attempt API should resolve identity from assignment settings.'
  );
  assert.match(
    ASSIGNMENTS_API_SOURCE,
    /settings\.collectStudentName && !submissionIdentity\.studentName[\s\S]*assignment_api_error_student_name_required[\s\S]*!settings\.collectStudentName && !submissionIdentity\.anonymousToken[\s\S]*assignment_api_error_anonymous_token_required/,
    'Submit-attempt API should reject missing name or anonymous token.'
  );
  assert.match(
    ASSIGNMENTS_API_SOURCE,
    /countPreviousIdentityAttempts\(\{[\s\S]*anonymousToken: submissionIdentity\.anonymousToken[\s\S]*studentName: submissionIdentity\.studentName[\s\S]*buildScoredAttemptInsert\(\{[\s\S]*identity: submissionIdentity/,
    'Submit-attempt API should count and persist by resolved identity.'
  );
  assert.match(
    ATTEMPT_PERSISTENCE_SOURCE,
    /ScoredAttemptInsert[\s\S]*anonymousToken: string \| null[\s\S]*studentName: string \| null[\s\S]*anonymousToken: identity\.anonymousToken[\s\S]*studentName: identity\.studentName/,
    'Scored-attempt persistence should carry the resolved identity fields.'
  );
  assert.match(
    ATTEMPT_QUERY_SOURCE,
    /buildAssignmentResultsAttemptSelect[\s\S]*anonymousToken: attempt\.anonymousToken[\s\S]*resultJson: attempt\.resultJson[\s\S]*studentName: attempt\.studentName[\s\S]*buildScoredAttemptWhere[\s\S]*isNotNull\(attempt\.resultJson\)/,
    'Result attempt queries should select identity fields from scored attempts.'
  );
});

test('attempt limits and teacher result consumers preserve identity guards', () => {
  assert.match(
    ATTEMPT_IDENTITY_QUERY_SOURCE,
    /resolveAttemptIdentityCountStrategy[\s\S]*normalizeStudentName\(source\.studentName\)[\s\S]*type: 'normalized-student-name'[\s\S]*normalizeAnonymousToken\(source\.anonymousToken\)[\s\S]*type: 'anonymous-token'/,
    'Attempt-limit count strategy should normalize names before tokens.'
  );
  assert.match(
    ATTEMPT_IDENTITY_QUERY_SOURCE,
    /resolveAttemptSubmissionIdentity[\s\S]*collectStudentName[\s\S]*anonymousToken: null[\s\S]*studentName: normalizedStudentName \|\| null[\s\S]*studentName: null[\s\S]*type: normalizedAnonymousToken \? 'anonymous-token' : 'missing'/,
    'Submission identity should keep name and anonymous modes exclusive.'
  );
  assert.match(
    ATTEMPT_IDENTITY_QUERY_SOURCE,
    /countPreviousIdentityAttempts[\s\S]*buildScoredAnonymousAssignmentAttemptWhere[\s\S]*buildScoredAssignmentAttemptWhere[\s\S]*countMatchingStudentIdentityAttempts/,
    'Previous-attempt counts should use scored rows and normalized grouping.'
  );
  assert.match(
    APP_SCHEMA_SOURCE,
    /studentName: text\('student_name'\)[\s\S]*anonymousToken: text\('anonymous_token'\)[\s\S]*attempt_assignment_anonymous_token_idx[\s\S]*attempt_assignment_student_name_idx/,
    'Attempt schema should keep indexed name and anonymous token fields.'
  );
  assert.match(
    PUBLIC_ASSIGNMENT_SOURCE,
    /collectStudentName[\s\S]*rawAnonymousTokenHidden: true[\s\S]*exposesRawAnonymousToken: false/,
    'Public payloads should expose identity mode without raw anonymous tokens.'
  );
  assert.match(
    RESULTS_SOURCE,
    /createStudentIdentityResolver\(completedAttempts\)[\s\S]*identityResolver\.resolve/,
    'Result analysis should resolve normalized display identities once.'
  );
  assert.match(
    RESULT_SEARCH_SOURCE,
    /exposesRawAnonymousToken: false[\s\S]*exposesStudentDisplayLabels: false[\s\S]*usesAssignmentDomainHelpers: true/,
    'Student search handoff should hide raw tokens and display labels.'
  );
  assert.match(
    STUDENT_SUMMARY_SORT_SOURCE,
    /exposesRawAnonymousToken: false[\s\S]*exposesStudentDisplayLabels: false[\s\S]*usesSortedTableRows: true/,
    'Student summary sort handoff should hide raw identity values.'
  );
  assert.match(
    ATTEMPT_REVIEW_CARD_SOURCE,
    /exposesRawAnonymousToken: false[\s\S]*exposesStudentDisplayLabel: false[\s\S]*scope: 'teacher-result-attempt-review-card'/,
    'Attempt review card handoff should hide raw identity values.'
  );
  assert.match(
    RESULTS_EXPORT_SOURCE,
    /student-privacy[\s\S]*delivery-identity[\s\S]*exposesRawAnonymousToken: false[\s\S]*scope: 'full-assignment-results'/,
    'Result export preparation should preserve identity policy and token guard.'
  );
});

test('identity handoffs remain hidden semantic structures', () => {
  assert.match(
    STUDENT_RUNNER_IDENTITY_SOURCE,
    /STUDENT_RUNNER_IDENTITY_HANDOFF_ITEM_IDS[\s\S]*'browser-label'[\s\S]*'token-privacy-summary'[\s\S]*'anonymous-token-boundary'[\s\S]*'privacy-guard'[\s\S]*exposesAnonymousToken: false[\s\S]*exposesStudentNameInputValue: false/,
    'Runner identity handoff should keep browser label and token privacy slices.'
  );
  assert.match(
    RUNTIME_IDENTITY_SOURCE,
    /STUDENT_RUNTIME_IDENTITY_HANDOFF_ITEM_IDS[\s\S]*'student-name-boundary'[\s\S]*'anonymous-token-boundary'[\s\S]*exposesAnonymousToken: false[\s\S]*exposesStudentName: false/,
    'Runtime identity handoff should hide names and anonymous tokens.'
  );
  assert.match(
    STUDENT_RUNNER_SHELL_SOURCE,
    /buildStudentRunnerIdentityHandoffView\(identityView\)[\s\S]*className="sr-only"[\s\S]*data-handoff="student-runner-identity"[\s\S]*data-handoff-item=\{itemView\.id\}/,
    'Runner identity handoff should stay a hidden semantic dl structure.'
  );
  assert.match(
    RESULT_SEARCH_COMPONENT_SOURCE,
    /className="sr-only"[\s\S]*data-handoff="assignment-result-student-search"[\s\S]*data-handoff-item=\{itemView\.id\}/,
    'Result search handoff should remain hidden semantic output.'
  );
  assert.match(
    ATTEMPT_REVIEW_COMPONENT_SOURCE,
    /className="sr-only"[\s\S]*data-handoff="assignment-attempt-review-card"[\s\S]*data-handoff-item=\{itemView\.id\}/,
    'Attempt review card handoff should remain hidden semantic output.'
  );
});

test('student identity lifecycle chain focused gate is documented', () => {
  const normalizedCatalog = TEST_CATALOG_SOURCE.replace(/\s+/g, ' ');

  assert.match(
    PRODUCT_SOURCE,
    /student identity lifecycle[\s\S]*runtime identity handoff's[\s\S]*30 slices[\s\S]*normalized and unique[\s\S]*collision and blank-id guards[\s\S]*must not expose runtime item ids[\s\S]*raw browser tokens[\s\S]*source-material metadata/,
    'docs/product.md should describe the runtime identity handoff and its private-id boundary.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Student identity lifecycle chain has a fast script-level gate via[\s\S]*scripts\/student-identity-lifecycle-chain-handoff\.test\.ts/,
    'TEST-CATALOG should document the student identity lifecycle chain gate.'
  );
  assert.match(
    normalizedCatalog,
    /student-name normalization[\s\S]*anonymous browser tokens[\s\S]*identity grouping[\s\S]*30-slice runtime identity handoff boundary[\s\S]*attempt-limit identity counting[\s\S]*student runner identity views[\s\S]*submission input identity[\s\S]*attempt persistence identity fields[\s\S]*teacher result identity labels\/search\/sort\/review[\s\S]*result export privacy[\s\S]*raw-token guards/,
    'TEST-CATALOG should describe the student identity chain gate scope.'
  );
});

function getHandoffValue(
  view: StudentIdentityLifecycleChainHandoffView,
  id: StudentIdentityLifecycleChainHandoffItemId
) {
  const item = view.itemViews.find((candidate) => candidate.id === id);
  assert.ok(item, `Missing student identity lifecycle chain item ${id}`);
  return item.value;
}

function assertNoPrivateStudentIdentityText(serializedView: string) {
  for (const privateValue of [
    PRIVATE_RAW_ANONYMOUS_TOKEN,
    PRIVATE_STUDENT_NAME,
    PRIVATE_STUDENT_ANSWER,
    PRIVATE_TEACHER_ANSWER,
    PRIVATE_SOURCE_MATERIAL,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Student identity lifecycle chain leaked private text: ${privateValue}`
    );
  }
}
