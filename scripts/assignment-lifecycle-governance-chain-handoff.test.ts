import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { ASSIGNMENT_ATTEMPT_STATS_HANDOFF_ITEM_IDS } from '@/assignments/attempt-stats-handoff';
import {
  ASSIGNMENT_LIFECYCLE_GOVERNANCE_CHAIN_HANDOFF_ITEM_IDS,
  ASSIGNMENT_LIFECYCLE_GOVERNANCE_CHAIN_SOURCE_FILES,
  buildAssignmentLifecycleGovernanceChainHandoffView,
  type AssignmentLifecycleGovernanceChainHandoffItemId,
  type AssignmentLifecycleGovernanceChainHandoffView,
} from '@/assignments/assignment-lifecycle-governance-chain';
import {
  ASSIGNMENT_DELIVERY_POLICY_HANDOFF_ITEM_IDS,
  PUBLIC_ASSIGNMENT_RULES_HANDOFF_ITEM_IDS,
} from '@/assignments/delivery-summary';
import { ASSIGNMENT_LIFECYCLE_HANDOFF_ITEM_IDS } from '@/assignments/lifecycle';
import { ASSIGNMENT_LIST_PAGE_HANDOFF_ITEM_IDS } from '@/assignments/list-view';
import {
  PUBLISHED_ASSIGNMENT_DELIVERY_CHAIN_HANDOFF_ITEM_IDS,
  PUBLISHED_ASSIGNMENT_DELIVERY_CHAIN_SOURCE_FILES,
} from '@/assignments/published-assignment-delivery-chain';
import { PUBLIC_ASSIGNMENT_ACCESS_HANDOFF_ITEM_IDS } from '@/assignments/public';
import { ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS } from '@/assignments/results-export';
import { ASSIGNMENT_SHARE_LINK_HANDOFF_ITEM_IDS } from '@/assignments/share-link';
import { PUBLIC_ASSIGNMENT_UNAVAILABLE_ACCESS_HANDOFF_ITEM_IDS } from '@/assignments/unavailable-access';

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const LIFECYCLE_SOURCE = readFileSync('src/assignments/lifecycle.ts', 'utf8');
const LIFECYCLE_QUERY_SOURCE = readFileSync(
  'src/assignments/lifecycle-query.ts',
  'utf8'
);
const LIST_FILTERS_SOURCE = readFileSync(
  'src/assignments/list-filters.ts',
  'utf8'
);
const LIST_QUERY_SOURCE = readFileSync('src/assignments/list-query.ts', 'utf8');
const LIST_SUMMARY_SOURCE = readFileSync(
  'src/assignments/list-summary.ts',
  'utf8'
);
const LIST_VIEW_SOURCE = readFileSync('src/assignments/list-view.ts', 'utf8');
const SHARE_LINK_SOURCE = readFileSync('src/assignments/share-link.ts', 'utf8');
const PUBLIC_ASSIGNMENT_SOURCE = readFileSync(
  'src/assignments/public.ts',
  'utf8'
);
const UNAVAILABLE_ACCESS_SOURCE = readFileSync(
  'src/assignments/unavailable-access.ts',
  'utf8'
);
const PERSISTENCE_SOURCE = readFileSync(
  'src/assignments/persistence.ts',
  'utf8'
);
const SNAPSHOT_SOURCE = readFileSync('src/assignments/snapshot.ts', 'utf8');
const DETAIL_QUERY_SOURCE = readFileSync(
  'src/assignments/detail-query.ts',
  'utf8'
);
const ATTEMPT_QUERY_SOURCE = readFileSync(
  'src/assignments/attempt-query.ts',
  'utf8'
);
const ATTEMPT_STATS_SOURCE = readFileSync(
  'src/assignments/attempt-stats.ts',
  'utf8'
);
const RESULTS_EXPORT_SOURCE = readFileSync(
  'src/assignments/results-export.ts',
  'utf8'
);
const RESULT_VIEW_SOURCE = readFileSync(
  'src/assignments/result-view.ts',
  'utf8'
);
const ASSIGNMENTS_API_SOURCE = readFileSync('src/api/assignments.ts', 'utf8');
const APP_SCHEMA_SOURCE = readFileSync('src/db/app.schema.ts', 'utf8');
const ASSIGNMENT_LIST_CARD_SOURCE = readFileSync(
  'src/components/assignments/assignment-list-card.tsx',
  'utf8'
);
const ASSIGNMENT_LIST_FILTERS_COMPONENT_SOURCE = readFileSync(
  'src/components/assignments/assignment-list-filters.tsx',
  'utf8'
);
const ASSIGNMENT_LIST_SUMMARY_CARD_SOURCE = readFileSync(
  'src/components/assignments/assignment-list-summary-card.tsx',
  'utf8'
);
const ASSIGNMENT_RESULTS_HEADER_CARD_SOURCE = readFileSync(
  'src/components/assignments/assignment-results-header-card.tsx',
  'utf8'
);
const ASSIGNMENT_RESULTS_HEADER_ACTIONS_SOURCE = readFileSync(
  'src/components/assignments/assignment-results-header-actions.tsx',
  'utf8'
);
const ASSIGNMENTS_ROUTE_SOURCE = readFileSync(
  'src/routes/dashboard/assignments.tsx',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const PRIVATE_ACTIVITY_CONTENT =
  'SECRET_LIFECYCLE_ACTIVITY_CONTENT_SHOULD_NOT_LEAK';
const PRIVATE_ANSWER_KEY = 'SECRET_LIFECYCLE_ANSWER_KEY_SHOULD_NOT_LEAK';
const PRIVATE_ASSIGNMENT_ID = 'SECRET_LIFECYCLE_ASSIGNMENT_ID_SHOULD_NOT_LEAK';
const PRIVATE_SHARE_SLUG = 'SECRET_LIFECYCLE_SHARE_SLUG_SHOULD_NOT_LEAK';
const PRIVATE_STUDENT_ANSWER =
  'SECRET_LIFECYCLE_STUDENT_ANSWER_SHOULD_NOT_LEAK';
const PRIVATE_STUDENT_NAME = 'SECRET_LIFECYCLE_STUDENT_NAME_SHOULD_NOT_LEAK';
const PRIVATE_TOKEN = 'SECRET_LIFECYCLE_RAW_TOKEN_SHOULD_NOT_LEAK';

test('assignment lifecycle governance chain exposes 30 safe slices', () => {
  const handoffView = buildAssignmentLifecycleGovernanceChainHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...ASSIGNMENT_LIFECYCLE_GOVERNANCE_CHAIN_HANDOFF_ITEM_IDS,
  ]);
  assert.equal(handoffView.title, 'Assignment lifecycle governance chain');
  assert.match(
    handoffView.description,
    /Thirty-slice assignment lifecycle governance chain/
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
    blocksClosedOrExpiredSubmissions: true,
    blocksDraftPublicAccess: true,
    chainSourceFileCount:
      ASSIGNMENT_LIFECYCLE_GOVERNANCE_CHAIN_SOURCE_FILES.length,
    exposesActivityContentInLifecycleHandoff: false,
    exposesAnswerKeysInLifecycleHandoff: false,
    exposesInternalAssignmentIdsInLifecycleHandoff: false,
    exposesPublicShareSlugsInLifecycleHandoff: false,
    exposesRawAnonymousTokensInLifecycleHandoff: false,
    exposesStudentAnswerTextInLifecycleHandoff: false,
    exposesStudentNamesInLifecycleHandoff: false,
    itemIds,
    keepsExpiredReopenBlocked: true,
    preservesAttemptsAfterClose: true,
    preservesSnapshotsAfterClose: true,
    publicUnavailablePayloadHidesRuntime: true,
    requiresOwnerScopedTeacherQueries: true,
    sourceFiles: [...ASSIGNMENT_LIFECYCLE_GOVERNANCE_CHAIN_SOURCE_FILES],
    statusFiltersUseLifecycleStatus: true,
    usesUnavailableAccessHandoff: true,
  });
  assertNoPrivateLifecycleGovernanceText(JSON.stringify(handoffView));
});

test('assignment lifecycle governance chain summarizes each state boundary', () => {
  const handoffView = buildAssignmentLifecycleGovernanceChainHandoffView();

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['product-lifecycle-policy', 'Open, closed, expired, draft'],
      ['managed-status-boundary', 'published + closed'],
      ['lifecycle-status-resolution', 'getAssignmentLifecycleStatus'],
      ['expiry-timestamp-normalization', 'Finite timestamp'],
      ['open-access-policy', 'Open only'],
      ['submission-error-policy', 'Reasoned rejection'],
      ['close-transition-rule', 'Published -> closed'],
      ['reopen-transition-rule', 'Closed -> published'],
      ['expired-reopen-block', 'Expired blocked'],
      ['status-action-view', 'Prepared action'],
      ['status-action-execution-plan', 'update-status or blocked'],
      ['api-list-owner-scope', 'Owner scoped'],
      ['api-status-filter', 'Lifecycle SQL filter'],
      ['list-route-status-filter', 'URL status state'],
      ['status-filter-open-alias', 'published -> open'],
      ['list-summary-status-metrics', 'Open/closed/expired/draft'],
      ['assignment-card-lifecycle-handoff', 'Hidden card handoff'],
      ['share-link-availability', 'Open persisted links'],
      ['public-lookup-lifecycle', 'Available or unavailable'],
      ['public-unavailable-policy', 'Runtime hidden'],
      ['submit-api-lifecycle-gate', 'assertAssignmentAcceptsSubmissions'],
      ['result-page-owner-scope', 'Owner results only'],
      ['result-page-retention', 'Closed attempts retained'],
      ['snapshot-retention', 'Frozen snapshot'],
      ['attempt-review-retention', 'Scored attempts'],
      ['published-delivery-chain-alignment', 'Delivery chain'],
      ['public-access-handoff-alignment', 'Public access handoff'],
      ['unavailable-access-handoff-alignment', 'Unavailable handoff'],
      ['lifecycle-privacy-guard', 'Private data hidden'],
      [
        'public-unavailable-access-handoff-boundary',
        '30 unavailable access slices',
      ],
    ]
  );
  assert.equal(
    getHandoffValue(handoffView, 'expired-reopen-block'),
    'Expired blocked'
  );
  assert.equal(
    getHandoffValue(handoffView, 'public-unavailable-access-handoff-boundary'),
    `${PUBLIC_ASSIGNMENT_UNAVAILABLE_ACCESS_HANDOFF_ITEM_IDS.length} unavailable access slices`
  );
});

test('assignment lifecycle governance chain is backed by adjacent gates', () => {
  assert.equal(ASSIGNMENT_LIFECYCLE_GOVERNANCE_CHAIN_SOURCE_FILES.length, 30);
  for (const filePath of ASSIGNMENT_LIFECYCLE_GOVERNANCE_CHAIN_SOURCE_FILES) {
    assert.ok(
      existsSync(filePath),
      `Missing assignment lifecycle governance file ${filePath}`
    );
  }

  assert.deepEqual(
    [
      ASSIGNMENT_LIFECYCLE_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_LIST_PAGE_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_SHARE_LINK_HANDOFF_ITEM_IDS.length,
      PUBLIC_ASSIGNMENT_ACCESS_HANDOFF_ITEM_IDS.length,
      PUBLIC_ASSIGNMENT_UNAVAILABLE_ACCESS_HANDOFF_ITEM_IDS.length,
      PUBLISHED_ASSIGNMENT_DELIVERY_CHAIN_HANDOFF_ITEM_IDS.length,
      PUBLISHED_ASSIGNMENT_DELIVERY_CHAIN_SOURCE_FILES.length,
      ASSIGNMENT_DELIVERY_POLICY_HANDOFF_ITEM_IDS.length,
      PUBLIC_ASSIGNMENT_RULES_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_ATTEMPT_STATS_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS.length,
    ],
    Array.from({ length: 11 }, () => 30)
  );
});

test('product docs and lifecycle helpers preserve status governance', () => {
  assert.match(
    PRODUCT_SOURCE,
    /Teachers can close and reopen published assignment links[\s\S]*without changing the\s+frozen snapshot[\s\S]*existing attempts remain available for review/,
    'docs/product.md should keep close/reopen, snapshot, and result-retention policy.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /status and expiry checks should flow through shared lifecycle helpers[\s\S]*student access, teacher lists, and result pages agree on open, closed, and\s+expired states/,
    'docs/product.md should require lifecycle agreement across surfaces.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /assignment\s+lifecycle\s+governance\s+chain[\s\S]*30-slice\s+public\s+unavailable-access\s+handoff[\s\S]*closed,\s+expired,\s+draft,\s+and\s+missing[\s\S]*runtime\s+content[\s\S]*submissions[\s\S]*results[\s\S]*privacy/,
    'docs/product.md should route unavailable lifecycle states through the shared public unavailable-access contract.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /only published links can be closed[\s\S]*only closed links can be\s+reopened[\s\S]*draft assignments cannot bypass the publish-and-snapshot flow[\s\S]*expired assignments cannot be reopened/,
    'docs/product.md should keep server transition rules explicit.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /Public student links must return a sanitized assignment payload only while the\s+assignment is open[\s\S]*Closed or expired links do not expose runtime content[\s\S]*submissions against closed or expired links are rejected/,
    'docs/product.md should keep public lifecycle access policy explicit.'
  );
  assert.match(
    LIFECYCLE_SOURCE,
    /ASSIGNMENT_MANAGED_STATUSES = \['published', 'closed'\]/,
    'Lifecycle helper should keep managed status actions narrow.'
  );
  assert.match(
    LIFECYCLE_SOURCE,
    /getAssignmentLifecycleStatus[\s\S]*status === 'published'[\s\S]*isAssignmentExpired\(expiresAt, now\) \? 'expired' : 'open'[\s\S]*status === 'closed'[\s\S]*return 'draft'/,
    'Lifecycle helper should resolve published, closed, and draft states.'
  );
  assert.match(
    LIFECYCLE_SOURCE,
    /normalizeAssignmentLifecycleTimestamp[\s\S]*Number\.isFinite\(timestamp\)/,
    'Lifecycle timestamps should normalize to finite values.'
  );
  assert.match(
    LIFECYCLE_SOURCE,
    /getAssignmentSubmissionErrorMessage[\s\S]*lifecycleStatus === 'open'[\s\S]*assignment_api_error_assignment_expired[\s\S]*assignment_api_error_assignment_closed[\s\S]*assignment_api_error_assignment_not_published/,
    'Submission errors should remain reasoned by lifecycle state.'
  );
  assert.match(
    LIFECYCLE_SOURCE,
    /getAssignmentStatusTransitionErrorView[\s\S]*nextStatus === 'closed'[\s\S]*currentStatus === 'published'[\s\S]*nextStatus === 'published'[\s\S]*currentStatus !== 'closed'[\s\S]*isAssignmentExpired\(expiresAt, now\)/,
    'Status transitions should keep close, reopen, and expired reopen guards.'
  );
  assert.match(
    LIFECYCLE_SOURCE,
    /buildAssignmentStatusActionExecutionPlan[\s\S]*type: 'blocked'[\s\S]*type: 'update-status'/,
    'Status actions should prepare blocked or update-status execution plans.'
  );
  assert.match(
    LIFECYCLE_SOURCE,
    /AssignmentLifecycleHandoffPrivacyContract[\s\S]*exposesActivityContent: false[\s\S]*exposesAnswerKeys: false[\s\S]*exposesInternalAssignmentIds: false[\s\S]*exposesPublicShareSlug: false[\s\S]*exposesRawAnonymousToken: false[\s\S]*exposesStudentAnswerText: false[\s\S]*exposesStudentNames: false/,
    'Lifecycle handoff should keep private classroom and student data hidden.'
  );
});

test('list queries, route filters, and list cards use lifecycle status', () => {
  assert.match(
    LIFECYCLE_QUERY_SOURCE,
    /buildAssignmentLifecycleStatusFilter[\s\S]*status === 'open'[\s\S]*eq\(assignment\.status, 'published'\)[\s\S]*gt\(assignment\.expiresAt, normalizedNow\)[\s\S]*status === 'expired'[\s\S]*lte\(assignment\.expiresAt, normalizedNow\)[\s\S]*return eq\(assignment\.status, status\)/,
    'Lifecycle status SQL filters should distinguish open, expired, closed, and draft.'
  );
  assert.match(
    LIST_FILTERS_SOURCE,
    /ASSIGNMENT_LIFECYCLE_STATUS_FILTERS = \[[\s\S]*'closed'[\s\S]*'draft'[\s\S]*'expired'[\s\S]*'open'[\s\S]*\]/,
    'List filters should expose all lifecycle statuses.'
  );
  assert.match(
    LIST_FILTERS_SOURCE,
    /parseAssignmentStatusFilter[\s\S]*value === 'published'[\s\S]*return 'open'/,
    'Legacy published status filters should normalize to open.'
  );
  assert.match(
    LIST_FILTERS_SOURCE,
    /buildAssignmentListFilterRouteSearch[\s\S]*q: next\.q \?\? current\.q[\s\S]*status: next\.status \?\? current\.status/,
    'Filter route search should preserve query and lifecycle status while resetting page.'
  );
  assert.match(
    LIST_QUERY_SOURCE,
    /const filters: SQL\[\] = \[eq\(assignment\.ownerId, userId\)\][\s\S]*buildAssignmentLifecycleStatusFilter\(\{[\s\S]*status/,
    'Assignment list SQL should stay owner-scoped and lifecycle-filtered.'
  );
  assert.match(
    LIST_SUMMARY_SOURCE,
    /openAssignments[\s\S]*closedAssignments[\s\S]*expiredAssignments[\s\S]*draftAssignments[\s\S]*countAssignmentsMatchingStatus/,
    'Assignment summaries should count open, closed, expired, and draft statuses.'
  );
  assert.match(
    LIST_VIEW_SOURCE,
    /buildAssignmentLifecycleHandoffView[\s\S]*surface: 'teacher-list'[\s\S]*buildAssignmentShareLinkAvailability[\s\S]*buildAssignmentStatusAction/,
    'List view models should prepare lifecycle handoff, share availability, and status actions together.'
  );
  assert.match(
    ASSIGNMENT_LIST_CARD_SOURCE,
    /buildAssignmentStatusActionExecutionPlan[\s\S]*handoff=\{assignment\.lifecycleHandoffView\}[\s\S]*data-handoff="assignment-lifecycle"[\s\S]*data-handoff-item=\{item\.id\}/,
    'Assignment cards should keep hidden lifecycle handoff and status execution planning together.'
  );
  assert.match(
    ASSIGNMENT_LIST_FILTERS_COMPONENT_SOURCE,
    /statusOptions\.map\(\(option\) =>[\s\S]*value=\{option\.value\}/,
    'Assignment list filter controls should render prepared lifecycle status options.'
  );
  assert.match(
    ASSIGNMENT_LIST_SUMMARY_CARD_SOURCE,
    /assignment-list-summary-\$\{metric\.id\}-label[\s\S]*assignment-list-summary-\$\{metric\.id\}-value[\s\S]*assignment-list-summary-\$\{metric\.id\}-description/,
    'Assignment list summary metrics should remain semantic label/value/description outputs.'
  );
  assert.match(
    ASSIGNMENTS_ROUTE_SOURCE,
    /validateSearch: buildAssignmentListValidatedSearch[\s\S]*buildAssignmentListRouteState/,
    'Assignment dashboard route should validate lifecycle search before building route state.'
  );
});

test('share links, public lookups, and unavailable states preserve lifecycle gates', () => {
  assert.match(
    SHARE_LINK_SOURCE,
    /buildAssignmentShareLinkAvailabilityState[\s\S]*resolveAssignmentShareLinkLifecycle[\s\S]*isAvailable: lifecycleStatus === 'open'/,
    'Share-link availability should be ready only for open lifecycle status.'
  );
  assert.match(
    SHARE_LINK_SOURCE,
    /getAssignmentShareLinkDisabledReason[\s\S]*if \(!shareSlug\)[\s\S]*if \(lifecycleStatus === 'open'\) return \{\}[\s\S]*return \{ disabledReasonCode: lifecycleStatus \}/,
    'Share-link disabled reasons should follow lifecycle status.'
  );
  assert.match(
    SHARE_LINK_SOURCE,
    /exposesRawAnonymousToken: false[\s\S]*exposesSourceMaterialStorageKeys: false[\s\S]*scope: 'assignment-share-link-distribution'/,
    'Share-link handoffs should not expose raw tokens or source material keys.'
  );
  assert.match(
    PUBLIC_ASSIGNMENT_SOURCE,
    /buildPublicAssignmentLookupResult[\s\S]*getAssignmentLifecycleStatus[\s\S]*lifecycleStatus === 'open'[\s\S]*payload: buildPublicAssignmentPayload[\s\S]*status: 'unavailable'[\s\S]*buildPublicAssignmentUnavailablePayload\(lifecycleStatus\)/,
    'Public assignment lookup should return available or unavailable by lifecycle.'
  );
  assert.match(
    PUBLIC_ASSIGNMENT_SOURCE,
    /buildPublicAssignmentUnavailablePayload[\s\S]*answerKeysHidden: true[\s\S]*runtimeItemsHidden: true[\s\S]*teacherMaterialsHidden: true[\s\S]*rawAnonymousTokenHidden: true[\s\S]*submissionsBlocked: true/,
    'Unavailable public payloads should be policy-only and hide runtime details.'
  );
  assert.match(
    PUBLIC_ASSIGNMENT_SOURCE,
    /resolveAssignmentRuntimeSource[\s\S]*orderAssignmentRuntimeItems[\s\S]*runtimeItems: stripRuntimeAnswers\(orderedRuntimeItems\)/,
    'Available public payloads should use sanitized runtime items.'
  );
  assert.match(
    UNAVAILABLE_ACCESS_SOURCE,
    /PUBLIC_ASSIGNMENT_UNAVAILABLE_ACCESS_HANDOFF_ITEM_IDS[\s\S]*'results-retention'[\s\S]*'reopen-guidance'[\s\S]*PublicAssignmentUnavailableAccessHandoffPrivacyView/,
    'Unavailable access handoff should cover result retention, reopen guidance, and privacy.'
  );
  assert.match(
    UNAVAILABLE_ACCESS_SOURCE,
    /runtime-content-policy[\s\S]*context\.unavailable\.contentPolicy\.runtimeItemsHidden[\s\S]*raw-token-policy[\s\S]*context\.unavailable\.identityPolicy\.rawAnonymousTokenHidden[\s\S]*submission-policy[\s\S]*context\.unavailable\.submissionPolicy\.submissionsBlocked/,
    'Unavailable access values should read the policy-only payload.'
  );
});

test('server functions preserve owner scope, lifecycle gates, and retained results', () => {
  assert.match(
    ASSIGNMENTS_API_SOURCE,
    /listAssignments[\s\S]*buildAssignmentListWhere\(\{[\s\S]*search: data\.search[\s\S]*status: data\.status[\s\S]*userId/,
    'Assignment list API should delegate owner-scoped lifecycle filters.'
  );
  assert.match(
    ASSIGNMENTS_API_SOURCE,
    /updateAssignmentStatus[\s\S]*buildAssignmentDetailOwnerWhere\(\{[\s\S]*assignmentId: data\.assignmentId[\s\S]*userId[\s\S]*assertAssignmentStatusTransition\(\{[\s\S]*expiresAt: existingAssignment\.expiresAt[\s\S]*nextStatus: data\.status/,
    'Status update API should load owner-scoped rows and enforce transitions.'
  );
  assert.match(
    ASSIGNMENTS_API_SOURCE,
    /getPublicAssignment[\s\S]*buildAssignmentDetailShareWhere\(\{ shareSlug: data\.shareSlug \}\)[\s\S]*buildPublicAssignmentLookupResult\(row\)/,
    'Public assignment API should delegate lifecycle lookup result building.'
  );
  assert.match(
    ASSIGNMENTS_API_SOURCE,
    /submitAttempt[\s\S]*assertAssignmentAcceptsSubmissions\(\{[\s\S]*expiresAt: row\.assignment\.expiresAt[\s\S]*status: row\.assignment\.status[\s\S]*buildScoredAttemptInsert/,
    'Submit-attempt API should recheck lifecycle before scoring and persistence.'
  );
  assert.match(
    ASSIGNMENTS_API_SOURCE,
    /getAssignmentResults[\s\S]*buildAssignmentDetailOwnerWhere\(\{[\s\S]*assignmentId: data\.assignmentId[\s\S]*userId[\s\S]*buildScoredAssignmentAttemptWhere/,
    'Result API should stay owner-scoped and load scored attempts after close.'
  );
  assert.match(
    PERSISTENCE_SOURCE,
    /buildPublishedAssignmentInsert[\s\S]*shareSlug: normalizeAssignmentShareSlug\(shareSlug\)[\s\S]*status: 'published'[\s\S]*buildAssignmentStatusUpdateSet[\s\S]*status: nextStatus/,
    'Persistence helpers should create published assignments and update managed statuses.'
  );
  assert.match(
    SNAPSHOT_SOURCE,
    /structuredClone\(sourceActivity\.contentJson\)/,
    'Runtime source resolution should preserve frozen snapshots after publish.'
  );
  assert.match(SNAPSHOT_SOURCE, /resolveAssignmentRuntimeSource/);
  assert.match(
    SNAPSHOT_SOURCE,
    /contentJson: snapshot\?\.contentJson \?\? activity\.contentJson/
  );
  assert.match(
    DETAIL_QUERY_SOURCE,
    /buildAssignmentDetailOwnerWhere[\s\S]*eq\(assignment\.id, assignmentId\)[\s\S]*eq\(assignment\.ownerId, userId\)/,
    'Assignment detail queries should stay owner-scoped.'
  );
  assert.match(
    ATTEMPT_QUERY_SOURCE,
    /buildAssignmentResultsAttemptSelect[\s\S]*resultJson: attempt\.resultJson[\s\S]*buildScoredAttemptWhere[\s\S]*isNotNull\(attempt\.resultJson\)/,
    'Result attempt queries should retain scored attempts.'
  );
  assert.match(
    ATTEMPT_STATS_SOURCE,
    /summarizeAssignmentAttempts[\s\S]*completedAttempts[\s\S]*averageScore[\s\S]*averageDurationSeconds/,
    'Attempt stats should continue from retained scored attempts.'
  );
  assert.match(
    RESULTS_EXPORT_SOURCE,
    /ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS[\s\S]*'delivery-close-time'/,
    'Results export preparation should include delivery lifecycle while hiding private data.'
  );
  assert.match(
    RESULTS_EXPORT_SOURCE,
    /formatAssignmentExportStatusLabel[\s\S]*getAssignmentStatusLabel/
  );
  assert.match(
    RESULTS_EXPORT_SOURCE,
    /exposesRawAnonymousToken: false[\s\S]*exposesStudentAnswerText: false/
  );
  assert.match(
    APP_SCHEMA_SOURCE,
    /export const assignment = sqliteTable[\s\S]*shareSlug:[\s\S]*status:[\s\S]*expiresAt:/,
    'Schema should keep assignment status, close time, snapshots, and attempts as related records.'
  );
  assert.match(
    APP_SCHEMA_SOURCE,
    /export const assignmentSnapshot = sqliteTable/
  );
  assert.match(APP_SCHEMA_SOURCE, /export const attempt = sqliteTable/);
});

test('result surfaces keep lifecycle sharing and retained review contracts', () => {
  assert.match(
    RESULT_VIEW_SOURCE,
    /resolveAssignmentSnapshotSource[\s\S]*buildAssignmentResultsExportPreparationView[\s\S]*getAssignmentStatusLabel/,
    'Result page view should combine lifecycle status, snapshot source, share availability, and export preparation.'
  );
  assert.match(
    RESULT_VIEW_SOURCE,
    /buildAssignmentResultHeaderShareAction[\s\S]*buildAssignmentShareLinkAvailability/,
    'Result page share actions should reuse assignment share-link availability.'
  );
  assert.match(
    RESULT_VIEW_SOURCE,
    /buildAssignmentResultReviewHandoffView[\s\S]*action-export-csv[\s\S]*full-export-boundary/,
    'Result review handoff should preserve export/review boundaries after lifecycle changes.'
  );
  assert.match(
    ASSIGNMENT_RESULTS_HEADER_CARD_SOURCE,
    /headerView\.statusLabel[\s\S]*AssignmentResultsHeaderActions[\s\S]*shareAction=\{headerView\.shareAction\}/,
    'Results header card should surface lifecycle status and share action together.'
  );
  assert.match(
    ASSIGNMENT_RESULTS_HEADER_ACTIONS_SOURCE,
    /buildAssignmentShareLinkHandoffView\([\s\S]*surface: 'result-page'[\s\S]*CopyAssignmentShareLinkButton[\s\S]*disabled=\{!shareAction\.isAvailable\}/,
    'Results header actions should keep result-page share link handoff and availability gates.'
  );
  assert.match(
    ASSIGNMENT_RESULTS_HEADER_ACTIONS_SOURCE,
    /data-handoff="assignment-results-export-preparation"[\s\S]*data-handoff-item=\{itemView\.id\}/,
    'Results header actions should keep hidden export-preparation handoff coverage.'
  );
});

test('assignment lifecycle governance focused gate is documented', () => {
  const normalizedCatalog = TEST_CATALOG_SOURCE.replace(/\s+/g, ' ');

  assert.match(
    TEST_CATALOG_SOURCE,
    /Assignment lifecycle governance chain has a fast script-level gate via[\s\S]*scripts\/assignment-lifecycle-governance-chain-handoff\.test\.ts[\s\S]*30-slice\s+public\s+unavailable-access\s+boundary/,
    'TEST-CATALOG should document the assignment lifecycle governance chain gate.'
  );
  assert.match(
    normalizedCatalog,
    /open\/closed\/expired\/draft status resolution[\s\S]*close\/reopen transition rules[\s\S]*expired reopen blocking[\s\S]*assignment list status filters[\s\S]*share-link availability[\s\S]*public unavailable payloads[\s\S]*submit API lifecycle gates[\s\S]*result retention[\s\S]*snapshot retention[\s\S]*lifecycle privacy guards/,
    'TEST-CATALOG should describe the assignment lifecycle governance scope.'
  );
});

function getHandoffValue(
  view: AssignmentLifecycleGovernanceChainHandoffView,
  id: AssignmentLifecycleGovernanceChainHandoffItemId
) {
  const item = view.itemViews.find((candidate) => candidate.id === id);
  assert.ok(item, `Missing assignment lifecycle governance chain item ${id}`);
  return item.value;
}

function assertNoPrivateLifecycleGovernanceText(serializedView: string) {
  for (const privateValue of [
    PRIVATE_ACTIVITY_CONTENT,
    PRIVATE_ANSWER_KEY,
    PRIVATE_ASSIGNMENT_ID,
    PRIVATE_SHARE_SLUG,
    PRIVATE_STUDENT_ANSWER,
    PRIVATE_STUDENT_NAME,
    PRIVATE_TOKEN,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Assignment lifecycle governance chain leaked private text: ${privateValue}`
    );
  }
}
