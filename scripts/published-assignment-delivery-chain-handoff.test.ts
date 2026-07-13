import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  PUBLISHED_ASSIGNMENT_DELIVERY_CHAIN_HANDOFF_ITEM_IDS,
  PUBLISHED_ASSIGNMENT_DELIVERY_CHAIN_SOURCE_FILES,
  buildPublishedAssignmentDeliveryChainHandoffView,
  type PublishedAssignmentDeliveryChainHandoffItemId,
  type PublishedAssignmentDeliveryChainHandoffView,
} from '@/assignments/published-assignment-delivery-chain';
import {
  ASSIGNMENT_PUBLISH_CONTROL_BOUNDARY_ITEM_IDS,
  ASSIGNMENT_PUBLISH_HANDOFF_ITEM_IDS,
} from '@/assignments/publish-input';
import {
  ASSIGNMENT_DELIVERY_POLICY_HANDOFF_ITEM_IDS,
  PUBLIC_ASSIGNMENT_RULES_HANDOFF_ITEM_IDS,
} from '@/assignments/delivery-summary';
import { ASSIGNMENT_SHARE_LINK_HANDOFF_ITEM_IDS } from '@/assignments/share-link';
import { ASSIGNMENT_LIST_PAGE_HANDOFF_ITEM_IDS } from '@/assignments/list-view';
import { ASSIGNMENT_LIFECYCLE_HANDOFF_ITEM_IDS } from '@/assignments/lifecycle';
import { PUBLIC_ASSIGNMENT_ACCESS_HANDOFF_ITEM_IDS } from '@/assignments/public';
import { PUBLIC_ASSIGNMENT_UNAVAILABLE_ACCESS_HANDOFF_ITEM_IDS } from '@/assignments/unavailable-access';
import { ASSIGNMENT_ITEM_ORDER_HANDOFF_ITEM_IDS } from '@/assignments/item-order-handoff';
import { ASSIGNMENT_ATTEMPT_LIMIT_HANDOFF_ITEM_IDS } from '@/assignments/attempt-limit-handoff';
import { ASSIGNMENT_SUBMISSION_VALIDATION_HANDOFF_ITEM_IDS } from '@/assignments/submission-validation-handoff';
import { ASSIGNMENT_ATTEMPT_PERSISTENCE_HANDOFF_ITEM_IDS } from '@/assignments/attempt-persistence-handoff';
import { ASSIGNMENT_ATTEMPT_DURATION_HANDOFF_ITEM_IDS } from '@/assignments/attempt-duration-handoff';
import { STUDENT_RUNNER_SUBMISSION_HANDOFF_ITEM_IDS } from '@/assignments/student-runner-state';
import { ASSIGNMENT_ANSWER_FEEDBACK_HANDOFF_ITEM_IDS } from '@/assignments/answer-feedback-handoff';
import { ASSIGNMENT_ATTEMPT_STATS_HANDOFF_ITEM_IDS } from '@/assignments/attempt-stats-handoff';
import { ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS } from '@/assignments/results-export';

const ASSIGNMENTS_API_SOURCE = readFileSync('src/api/assignments.ts', 'utf8');
const PUBLISH_INPUT_SOURCE = readFileSync(
  'src/assignments/publish-input.ts',
  'utf8'
);
const DELIVERY_SUMMARY_SOURCE = readFileSync(
  'src/assignments/delivery-summary.ts',
  'utf8'
);
const SHARE_LINK_SOURCE = readFileSync('src/assignments/share-link.ts', 'utf8');
const PUBLIC_ASSIGNMENT_SOURCE = readFileSync(
  'src/assignments/public.ts',
  'utf8'
);
const SUBMISSION_VALIDATION_SOURCE = readFileSync(
  'src/assignments/submission-validation-handoff.ts',
  'utf8'
);
const STUDENT_RUNNER_SOURCE = readFileSync(
  'src/assignments/student-runner-state.ts',
  'utf8'
);
const RESULTS_EXPORT_SOURCE = readFileSync(
  'src/assignments/results-export.ts',
  'utf8'
);
const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const PRIVATE_ACTIVITY_CONTENT = 'SECRET_ACTIVITY_CONTENT_JSON';
const PRIVATE_ANSWER_KEY = 'SECRET_TEACHER_ANSWER';
const PRIVATE_RAW_SETTINGS = 'SECRET_RAW_SETTINGS_JSON';
const PRIVATE_SOURCE_STORAGE_KEY = 'source-materials/private/key.pdf';
const PRIVATE_STUDENT_ANSWER = 'SECRET_STUDENT_ANSWER';
const PRIVATE_STUDENT_NAME = 'SECRET_STUDENT_NAME';
const PRIVATE_TOKEN = 'SECRET_RAW_ANONYMOUS_TOKEN';

test('published assignment delivery chain exposes 30 product-loop slices', () => {
  const handoffView = buildPublishedAssignmentDeliveryChainHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...PUBLISHED_ASSIGNMENT_DELIVERY_CHAIN_HANDOFF_ITEM_IDS,
  ]);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(handoffView.title, 'Published assignment delivery chain');
  assert.match(handoffView.description, /Thirty-slice/);
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
    chainSourceFileCount:
      PUBLISHED_ASSIGNMENT_DELIVERY_CHAIN_SOURCE_FILES.length,
    deliveryPolicyResolvedBeforeSurfaces: true,
    exposesActivityContentToPublicPayload: false,
    exposesAnswerKeysBeforeAllowedReview: false,
    exposesRawAnonymousTokens: false,
    exposesRawSettingsJson: false,
    exposesSourceMaterialStorageKeys: false,
    exposesPreparedControlIdsInHandoff: false,
    freezesAssignmentSnapshots: true,
    itemIds,
    publicPayloadUsesRuntimeItemsOnly: true,
    rejectsInvalidSubmissions: true,
    resultExportsIncludeDeliveryPolicy: true,
    resultsPreserveAttempts: true,
    sourceFiles: [...PUBLISHED_ASSIGNMENT_DELIVERY_CHAIN_SOURCE_FILES],
    usesOpaquePublishControlScope: true,
    usesPublishControlHandoff: true,
  });
  assertNoPrivateDeliveryChainText(JSON.stringify(handoffView));
});

test('published assignment delivery chain summarizes each linked delivery step', () => {
  const handoffView = buildPublishedAssignmentDeliveryChainHandoffView();

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['publish-preflight-validation', '30 publish slices'],
      ['publish-delivery-preview', 'Rules before freeze'],
      ['publish-settings-json', 'Resolved settings'],
      ['assignment-persistence', 'Published row'],
      ['snapshot-freeze', 'Frozen ActivityContent'],
      ['share-link-distribution', 'Public play URL'],
      ['post-publish-list-surface', 'Immediate distribution'],
      ['list-filter-owner-scope', 'Owner assignments only'],
      ['delivery-policy-summary', 'Teacher-visible rules'],
      ['public-rules-summary', 'Student-visible rules'],
      ['public-access-lifecycle', 'Open links only'],
      ['unavailable-content-guard', 'Runtime hidden'],
      ['item-order-policy', 'Stable shuffled order'],
      ['student-identity-policy', 'Name or browser token'],
      ['attempt-limit-policy', 'Per-student cap'],
      ['timer-duration-policy', 'Normalized seconds'],
      ['close-time-lifecycle', 'Closed or expired blocked'],
      ['student-start-readiness', 'Payload ready first'],
      ['student-submit-readiness', 'Explicit partial confirmation'],
      ['submission-validation', 'Unknown and duplicate guard'],
      ['attempt-persistence', 'Scored attempt row'],
      ['answer-feedback-gate', 'Reveal policy respected'],
      ['result-stats', 'Shared attempt metrics'],
      ['result-review-scope', 'Teacher review state'],
      ['csv-export-policy', 'Delivery rules included'],
      ['result-copy-boundary', 'Teacher-only artifacts'],
      ['source-material-guard', 'Storage keys hidden'],
      ['raw-token-guard', 'Anonymous tokens hidden'],
      ['snapshot-results-retention', 'Attempts retained'],
      ['publish-control-handoff-boundary', '30 publish control slices'],
    ]
  );
  assert.equal(
    getHandoffValue(handoffView, 'submission-validation'),
    'Unknown and duplicate guard'
  );
});

test('published assignment delivery chain stays backed by focused contracts', () => {
  assert.equal(PUBLISHED_ASSIGNMENT_DELIVERY_CHAIN_SOURCE_FILES.length, 30);
  for (const filePath of PUBLISHED_ASSIGNMENT_DELIVERY_CHAIN_SOURCE_FILES) {
    assert.ok(
      existsSync(filePath),
      `Missing published assignment delivery file ${filePath}`
    );
  }

  assert.deepEqual(
    [
      ASSIGNMENT_PUBLISH_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_DELIVERY_POLICY_HANDOFF_ITEM_IDS.length,
      PUBLIC_ASSIGNMENT_RULES_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_SHARE_LINK_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_LIST_PAGE_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_LIFECYCLE_HANDOFF_ITEM_IDS.length,
      PUBLIC_ASSIGNMENT_ACCESS_HANDOFF_ITEM_IDS.length,
      PUBLIC_ASSIGNMENT_UNAVAILABLE_ACCESS_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_ITEM_ORDER_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_ATTEMPT_LIMIT_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_SUBMISSION_VALIDATION_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_ATTEMPT_PERSISTENCE_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_ATTEMPT_DURATION_HANDOFF_ITEM_IDS.length,
      STUDENT_RUNNER_SUBMISSION_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_ANSWER_FEEDBACK_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_ATTEMPT_STATS_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS.length,
      ASSIGNMENT_PUBLISH_CONTROL_BOUNDARY_ITEM_IDS.length,
    ],
    Array.from({ length: 18 }, () => 30)
  );
});

test('published assignment delivery sources preserve sanitized public and submission boundaries', () => {
  const publicAssignmentPayloadType = getSourceSlice(
    PUBLIC_ASSIGNMENT_SOURCE,
    'export type PublicAssignmentPayload = {',
    'export type PublicAssignmentUnavailableReason'
  );

  assert.doesNotMatch(
    publicAssignmentPayloadType,
    /\b(contentJson|sourceMaterials|teacherNotes|answerKeys|acceptedAlternatives|explanations)\b/,
    'PublicAssignmentPayload should not expose ActivityContent, source materials, answer keys, accepted alternatives, or explanations.'
  );
  assert.match(
    PUBLIC_ASSIGNMENT_SOURCE,
    /resolveAssignmentRuntimeSource\(\{[\s\S]*activity,[\s\S]*snapshot,[\s\S]*\}[\s\S]*orderAssignmentRuntimeItems\(\{[\s\S]*shareSlug,[\s\S]*shuffleItems: settings\.shuffleItems,[\s\S]*\}[\s\S]*runtimeItems: stripRuntimeAnswers\(orderedRuntimeItems\)/
  );
  assert.match(
    PUBLIC_ASSIGNMENT_SOURCE,
    /runtimeItemsHidden: true[\s\S]*teacherMaterialsHidden: true[\s\S]*rawAnonymousTokenHidden: true/
  );
  assert.match(
    ASSIGNMENTS_API_SOURCE,
    /tx\.insert\(assignment\)\.values\([\s\S]*buildPublishedAssignmentInsert\(\{[\s\S]*sourceActivity,[\s\S]*userId,[\s\S]*\}\)[\s\S]*tx\.insert\(assignmentSnapshot\)\.values\([\s\S]*buildPublishedAssignmentSnapshotInsert/
  );
  assert.match(
    ASSIGNMENTS_API_SOURCE,
    /resolveAssignmentRuntimeSource\(row\)[\s\S]*orderAssignmentRuntimeItems\(\{[\s\S]*items: resolvedSource\.runtimeItems,[\s\S]*normalizeSubmittedAttemptAnswers\(data\.answers\)[\s\S]*assertSubmittedAnswersMatchRuntimeItems\(\{[\s\S]*answers: submittedAnswers,[\s\S]*runtimeItems: orderedRuntimeItems[\s\S]*buildScoredAttemptInsert\(\{/
  );
  assert.match(
    SUBMISSION_VALIDATION_SOURCE,
    /assertSubmittedAnswersMatchRuntimeItems\(\{ answers, runtimeItems \}\)/
  );
  assert.match(
    STUDENT_RUNNER_SOURCE,
    /STUDENT_RUNNER_SUBMISSION_HANDOFF_ITEM_IDS[\s\S]*exposesRawSubmissionPayload: false[\s\S]*exposesRuntimeItemIds: false[\s\S]*exposesTeacherOnlyAnswers: false/
  );
});

test('published assignment delivery privacy contracts stay explicit across surfaces', () => {
  assert.match(
    PUBLISH_INPUT_SOURCE,
    /AssignmentPublishHandoffPrivacyContract[\s\S]*exposesPublicRuntimeContent: false[\s\S]*exposesRawSettingsJson: false[\s\S]*exposesShareSlug: false[\s\S]*scope: 'assignment-publish-preflight-boundary'/
  );
  assert.match(
    DELIVERY_SUMMARY_SOURCE,
    /PublicAssignmentRulesHandoffPrivacyContract[\s\S]*exposesAnswerKeys: false[\s\S]*exposesRawSettingsJson: false[\s\S]*exposesTeacherSourceMaterials: false[\s\S]*scope: 'public-assignment-rules'/
  );
  assert.match(
    DELIVERY_SUMMARY_SOURCE,
    /AssignmentDeliveryPolicyHandoffPrivacyContract[\s\S]*deliveryRuleCount: number;[\s\S]*exposesAnswerKeys: false[\s\S]*exposesRawSettingsJson: false[\s\S]*scope: 'assignment-delivery-policy-summary'/
  );
  assert.match(
    SHARE_LINK_SOURCE,
    /shareUrlIsPublicDeliveryLink: true[\s\S]*exposesRawAnonymousToken: false[\s\S]*exposesSourceMaterialStorageKeys: false[\s\S]*scope: 'assignment-share-link-distribution'/
  );
  assert.match(
    RESULTS_EXPORT_SOURCE,
    /ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS[\s\S]*'delivery-identity'[\s\S]*'delivery-answer-reveal'[\s\S]*'delivery-item-order'[\s\S]*'delivery-attempt-limit'[\s\S]*'delivery-timer'[\s\S]*'delivery-close-time'/
  );
  assert.match(
    RESULTS_EXPORT_SOURCE,
    /exposesCsvDataUrl: false[\s\S]*exposesRawAnonymousToken: false[\s\S]*exposesStudentAnswerText: false[\s\S]*exposesTeacherAnswerText: false[\s\S]*scope: 'full-assignment-results'/
  );
});

test('published assignment delivery chain focused gate is documented', () => {
  const normalizedCatalog = TEST_CATALOG_SOURCE.replace(/\s+/g, ' ');

  assert.match(
    PRODUCT_SOURCE,
    /published-assignment delivery chain[\s\S]*publish dialog's 30[\s\S]*review checklist[\s\S]*opaque[\s\S]*omit generated control ids[\s\S]*raw settings[\s\S]*source-material storage keys/,
    'docs/product.md should describe the publish-control handoff and opaque-id privacy boundary.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Published assignment delivery chain has a fast script-level gate via[\s\S]*scripts\/published-assignment-delivery-chain-handoff\.test\.ts/,
    'TEST-CATALOG should document the published assignment delivery chain gate.'
  );
  assert.match(
    normalizedCatalog,
    /publish preflight[\s\S]*30-slice publish control handoff boundary[\s\S]*frozen snapshots[\s\S]*share links[\s\S]*public student rules[\s\S]*validated submissions[\s\S]*results export/,
    'TEST-CATALOG should document the cross-module assignment delivery chain scope.'
  );
});

function getHandoffValue(
  view: PublishedAssignmentDeliveryChainHandoffView,
  id: PublishedAssignmentDeliveryChainHandoffItemId
) {
  const item = view.itemViews.find((itemView) => itemView.id === id);
  assert.ok(item, `Missing published assignment delivery chain item ${id}`);
  return item.value;
}

function getSourceSlice(
  source: string,
  startMarker: string,
  endMarker: string
) {
  const start = source.indexOf(startMarker);
  assert.notEqual(start, -1, `Missing source start marker: ${startMarker}`);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(end, -1, `Missing source end marker: ${endMarker}`);
  return source.slice(start, end);
}

function assertNoPrivateDeliveryChainText(serializedView: string) {
  for (const privateValue of [
    PRIVATE_ACTIVITY_CONTENT,
    PRIVATE_ANSWER_KEY,
    PRIVATE_RAW_SETTINGS,
    PRIVATE_SOURCE_STORAGE_KEY,
    PRIVATE_STUDENT_ANSWER,
    PRIVATE_STUDENT_NAME,
    PRIVATE_TOKEN,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Published assignment delivery chain leaked private text: ${privateValue}`
    );
  }
}
