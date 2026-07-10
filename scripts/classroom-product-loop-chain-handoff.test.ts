import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVITY_AI_AUTHORING_CHAIN_HANDOFF_ITEM_IDS,
  ACTIVITY_AI_AUTHORING_CHAIN_SOURCE_FILES,
} from '@/activities/ai-authoring-chain';
import {
  ACTIVITY_AI_ENHANCEMENT_LIFECYCLE_CHAIN_ITEM_IDS,
  ACTIVITY_AI_ENHANCEMENT_LIFECYCLE_CHAIN_SOURCE_FILES,
} from '@/activities/ai-enhancement-lifecycle-chain';
import {
  ACTIVITY_AUTHORING_LIBRARY_CHAIN_HANDOFF_ITEM_IDS,
  ACTIVITY_AUTHORING_LIBRARY_CHAIN_SOURCE_FILES,
} from '@/activities/authoring-library-chain';
import { ACTIVITY_LIFECYCLE_GOVERNANCE_CHAIN_HANDOFF_ITEM_IDS } from '@/activities/activity-lifecycle-governance-chain';
import {
  SOURCE_EXTRACTION_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS,
  SOURCE_EXTRACTION_LIFECYCLE_CHAIN_SOURCE_FILES,
} from '@/activities/source-extraction-lifecycle-chain';
import { SOURCE_MATERIAL_PRIVACY_CHAIN_HANDOFF_ITEM_IDS } from '@/activities/source-material-privacy-chain';
import {
  TEMPLATE_ROADMAP_CAPABILITY_CHAIN_HANDOFF_ITEM_IDS,
  TEMPLATE_ROADMAP_CAPABILITY_CHAIN_SOURCE_FILES,
} from '@/activities/template-roadmap-capability-chain';
import { ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS } from '@/assignments/results-export';
import { PRINTABLE_WORKSHEET_REVIEW_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/printable-worksheet-review-lifecycle-chain';
import { PUBLISHED_ASSIGNMENT_DELIVERY_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/published-assignment-delivery-chain';
import { ASSIGNMENT_RESULT_ACCEPTED_ANSWER_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/result-accepted-answer-chain';
import { ASSIGNMENT_RESULT_EXPLANATION_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/result-explanation-chain';
import { ASSIGNMENT_RESULT_SUBMITTED_DATE_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/result-submitted-date-chain';
import { SCORED_ATTEMPT_RESULT_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/scored-attempt-result-chain';
import { STUDENT_IDENTITY_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/student-identity-lifecycle-chain';
import { STUDENT_RUNNER_PLAY_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/student-runner-play-chain';
import { TEACHER_RESULT_COPY_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/teacher-result-copy-lifecycle-chain';
import { TEACHER_RESULTS_REVIEW_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/teacher-results-review-chain';
import {
  CLASSROOM_PRODUCT_LOOP_CHAIN_HANDOFF_ITEM_IDS,
  CLASSROOM_PRODUCT_LOOP_CHAIN_SOURCE_FILES,
  buildClassroomProductLoopChainHandoffView,
  type ClassroomProductLoopChainHandoffItemId,
  type ClassroomProductLoopChainHandoffView,
} from '@/config/classroom-product-loop-chain';
import { CLASSROOM_TRUST_COMMUNICATION_CHAIN_HANDOFF_ITEM_IDS } from '@/config/classroom-trust-communication-chain';
import { CLASSROOM_DATA_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS } from '@/db/classroom-data-lifecycle-chain';
import { DASHBOARD_OVERVIEW_HANDOFF_ITEM_IDS } from '@/dashboard/overview';
import { TEACHER_WORKSPACE_OPERATIONS_CHAIN_HANDOFF_ITEM_IDS } from '@/dashboard/teacher-workspace-operations-chain';
import { HOME_PAGE_PRODUCT_LOOP_HANDOFF_ITEM_IDS } from '@/pages/public-page-view';
import {
  PUBLIC_DISCOVERY_INDEXING_CHAIN_HANDOFF_ITEM_IDS,
  PUBLIC_DISCOVERY_INDEXING_CHAIN_SOURCE_FILES,
} from '@/seo/public-discovery-indexing-chain';

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const NORMALIZED_PRODUCT_SOURCE = PRODUCT_SOURCE.replace(/\s+/g, ' ');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');
const NORMALIZED_TEST_CATALOG_SOURCE = TEST_CATALOG_SOURCE.replace(/\s+/g, ' ');

const PRIVATE_ACTIVITY_CONTENT = 'SECRET_PRODUCT_LOOP_ACTIVITY_CONTENT';
const PRIVATE_ANSWER_KEY = 'SECRET_PRODUCT_LOOP_ANSWER_KEY';
const PRIVATE_CSV_DATA_URL = 'data:text/csv;charset=utf-8,SECRET_LOOP';
const PRIVATE_RAW_SUBMISSION = 'SECRET_PRODUCT_LOOP_RAW_SUBMISSION';
const PRIVATE_RESULT_EXPORT_ROW = 'SECRET_PRODUCT_LOOP_RESULT_EXPORT_ROW';
const PRIVATE_RUNTIME_ITEM_ID = 'SECRET_PRODUCT_LOOP_RUNTIME_ITEM_ID';
const PRIVATE_SOURCE_STORAGE_KEY = 'source-materials/private/product-loop.pdf';
const PRIVATE_STUDENT_ANSWER = 'SECRET_PRODUCT_LOOP_STUDENT_ANSWER';
const PRIVATE_STUDENT_NAME = 'SECRET_PRODUCT_LOOP_STUDENT_NAME';
const PRIVATE_STUDENT_TOKEN = 'SECRET_PRODUCT_LOOP_RAW_TOKEN';

test('classroom product loop chain exposes 30 safe product slices', () => {
  const handoffView = buildClassroomProductLoopChainHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...CLASSROOM_PRODUCT_LOOP_CHAIN_HANDOFF_ITEM_IDS]);
  assert.equal(handoffView.title, 'Classroom product loop chain');
  assert.match(handoffView.description, /Thirty-slice classroom product loop/);
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
    chainSourceFileCount: CLASSROOM_PRODUCT_LOOP_CHAIN_SOURCE_FILES.length,
    createsAssignmentLinksWithoutTeacherAction: false,
    exposesActivityContentJsonToPublicPayload: false,
    exposesAnswerKeysBeforeAllowedReview: false,
    exposesCsvDataUrlInHandoff: false,
    exposesPrivateActivityContent: false,
    exposesRawAnonymousTokens: false,
    exposesRawSubmissionPayload: false,
    exposesResultExportRows: false,
    exposesRuntimeItemIdsInHandoff: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAnswerTextInHandoff: false,
    exposesStudentNamesInHandoff: false,
    freezesAssignmentSnapshots: true,
    itemIds,
    requiresTeacherSaveBeforeActivityPersistence: true,
    keepsSourceMaterialExtractionEditorReviewed: true,
    keepsProtectedRoutesOutOfIndex: true,
    keepsPublicDiscoverySourceLevel: true,
    keepsActivityLibraryOwnerScoped: true,
    keepsAssignmentListOwnerScoped: true,
    keepsDashboardOwnerScoped: true,
    keepsTemplateRoadmapOnSharedActivityModel: true,
    publicPayloadUsesRuntimeItemsOnly: true,
    rejectsInvalidSubmissions: true,
    requiresTeacherReviewForAiEnhancements: true,
    requiresTeacherReviewForAiDrafts: true,
    resultConsumersUseScoredAttempts: true,
    sourceFiles: [...CLASSROOM_PRODUCT_LOOP_CHAIN_SOURCE_FILES],
    usesAiEnhancementLifecycleChain: true,
    usesActivityAuthoringLibraryChain: true,
    usesActivityAssignmentAttemptResultsLoop: true,
    usesPublicDiscoveryIndexingChain: true,
    usesSourceExtractionLifecycleChain: true,
    usesTemplateRoadmapCapabilityChain: true,
  });
  assertNoPrivateProductLoopText(JSON.stringify(handoffView));
});

test('classroom product loop chain summarizes activity to results flow', () => {
  const handoffView = buildClassroomProductLoopChainHandoffView();

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['product-loop-contract', 'Activity -> Assignment -> Attempt -> Results'],
      ['activity-model', 'Teacher-owned activity'],
      ['activity-content-contract', 'Template-neutral content'],
      ['activity-library-owner-scope', 'Owner activities only'],
      ['activity-authoring-library-boundary', '30 authoring slices'],
      ['template-roadmap-capability-boundary', '30 roadmap slices'],
      ['ai-enhancement-lifecycle-boundary', 'Policy-to-publish review'],
      ['source-extraction-lifecycle-boundary', '30 extraction slices'],
      ['activity-lifecycle-derivative-guard', 'Restore before derive'],
      ['assignment-publish-preflight', 'Delivery settings review'],
      ['assignment-snapshot-freeze', 'Frozen ActivityContent'],
      ['share-link-distribution', 'Copy/preview/print/review'],
      ['public-runner-access', 'Open links only'],
      ['public-rules-summary', 'Student-visible rules'],
      ['student-identity-boundary', 'Name or browser token'],
      ['runtime-item-contract', '{ itemId, answer }'],
      ['progress-submit-readiness', 'Explicit partial confirm'],
      ['submission-validation', 'Unknown duplicate guard'],
      ['attempt-persistence', 'Scored attempt row'],
      ['answer-feedback-policy', 'Reveal if allowed'],
      ['result-submitted-date-continuity', 'Submitted dates'],
      ['teacher-result-review', 'Reteach evidence'],
      ['result-accepted-answer-continuity', 'Accepted alternatives'],
      ['csv-export', 'Private offline records'],
      ['result-explanation-continuity', 'Answer explanations'],
      ['dashboard-loop-status', 'Create/publish/play/review'],
      ['teacher-workspace-routes', 'Dashboard workspace'],
      ['public-discovery-indexing-boundary', '30 discovery slices'],
      ['privacy-guards', 'Private data hidden'],
      ['product-loop-chain-gate', '30 source files'],
    ]
  );
  assert.equal(
    getHandoffValue(handoffView, 'runtime-item-contract'),
    '{ itemId, answer }'
  );
});

test('classroom product loop chain is backed by adjacent focused gates', () => {
  assert.equal(CLASSROOM_PRODUCT_LOOP_CHAIN_SOURCE_FILES.length, 30);
  for (const filePath of CLASSROOM_PRODUCT_LOOP_CHAIN_SOURCE_FILES) {
    assert.ok(
      existsSync(filePath),
      `Missing classroom product loop chain source ${filePath}`
    );
  }

  assert.deepEqual(
    [
      HOME_PAGE_PRODUCT_LOOP_HANDOFF_ITEM_IDS.length,
      DASHBOARD_OVERVIEW_HANDOFF_ITEM_IDS.length,
      TEACHER_WORKSPACE_OPERATIONS_CHAIN_HANDOFF_ITEM_IDS.length,
      CLASSROOM_DATA_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS.length,
      ACTIVITY_AUTHORING_LIBRARY_CHAIN_HANDOFF_ITEM_IDS.length,
      ACTIVITY_AUTHORING_LIBRARY_CHAIN_SOURCE_FILES.length,
      ACTIVITY_LIFECYCLE_GOVERNANCE_CHAIN_HANDOFF_ITEM_IDS.length,
      TEMPLATE_ROADMAP_CAPABILITY_CHAIN_HANDOFF_ITEM_IDS.length,
      TEMPLATE_ROADMAP_CAPABILITY_CHAIN_SOURCE_FILES.length,
      ACTIVITY_AI_AUTHORING_CHAIN_HANDOFF_ITEM_IDS.length,
      ACTIVITY_AI_AUTHORING_CHAIN_SOURCE_FILES.length,
      ACTIVITY_AI_ENHANCEMENT_LIFECYCLE_CHAIN_ITEM_IDS.length,
      ACTIVITY_AI_ENHANCEMENT_LIFECYCLE_CHAIN_SOURCE_FILES.length,
      SOURCE_EXTRACTION_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS.length,
      SOURCE_EXTRACTION_LIFECYCLE_CHAIN_SOURCE_FILES.length,
      SOURCE_MATERIAL_PRIVACY_CHAIN_HANDOFF_ITEM_IDS.length,
      PUBLISHED_ASSIGNMENT_DELIVERY_CHAIN_HANDOFF_ITEM_IDS.length,
      STUDENT_RUNNER_PLAY_CHAIN_HANDOFF_ITEM_IDS.length,
      STUDENT_IDENTITY_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS.length,
      SCORED_ATTEMPT_RESULT_CHAIN_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_RESULT_SUBMITTED_DATE_CHAIN_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_RESULT_ACCEPTED_ANSWER_CHAIN_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_RESULT_EXPLANATION_CHAIN_HANDOFF_ITEM_IDS.length,
      TEACHER_RESULTS_REVIEW_CHAIN_HANDOFF_ITEM_IDS.length,
      TEACHER_RESULT_COPY_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS.length,
      PRINTABLE_WORKSHEET_REVIEW_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS.length,
      PUBLIC_DISCOVERY_INDEXING_CHAIN_HANDOFF_ITEM_IDS.length,
      PUBLIC_DISCOVERY_INDEXING_CHAIN_SOURCE_FILES.length,
      CLASSROOM_TRUST_COMMUNICATION_CHAIN_HANDOFF_ITEM_IDS.length,
    ],
    Array.from({ length: 30 }, () => 30)
  );
});

test('classroom product loop chain is documented in product and catalog', () => {
  assert.match(
    PRODUCT_SOURCE,
    /ClassGamify is a teacher-first activity and assignment platform[\s\S]*teachers create reusable activity content[\s\S]*publish assignments[\s\S]*review student attempts/,
    'docs/product.md should define the teacher-first product loop.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /Activity -> Assignment -> Attempt -> Results/,
    'docs/product.md should keep the explicit classroom loop sequence.'
  );
  assert.match(
    NORMALIZED_PRODUCT_SOURCE,
    /src\/config\/classroom-product-loop-chain\.ts` owns the cross-surface product-loop handoff[\s\S]*teacher-owned activities[\s\S]*activity authoring\/library[\s\S]*source extraction lifecycle[\s\S]*template roadmap capability[\s\S]*AI enhancement lifecycle[\s\S]*assignment links[\s\S]*validated attempts[\s\S]*submitted-date[\s\S]*accepted-answer[\s\S]*explanation continuity[\s\S]*teacher result review[\s\S]*copy\/export\/print handoffs[\s\S]*public discovery\/indexing[\s\S]*privacy guards/,
    'docs/product.md should document the classroom product loop chain owner.'
  );
  assert.match(
    NORMALIZED_TEST_CATALOG_SOURCE,
    /Classroom product loop chain has a fast script-level gate via[\s\S]*scripts\/classroom-product-loop-chain-handoff\.test\.ts[\s\S]*Activity -> Assignment -> Attempt -> Results[\s\S]*activity authoring\/library workflow[\s\S]*source extraction lifecycle[\s\S]*template roadmap capability[\s\S]*AI enhancement lifecycle[\s\S]*assignment publish[\s\S]*student runner[\s\S]*scored attempts[\s\S]*submitted-date continuity[\s\S]*accepted-answer continuity[\s\S]*explanation continuity[\s\S]*teacher result review[\s\S]*copy\/export\/print handoffs[\s\S]*dashboard\/public discovery[\s\S]*privacy guards/,
    'TEST-CATALOG should document the classroom product loop chain gate.'
  );
});

function getHandoffValue(
  view: ClassroomProductLoopChainHandoffView,
  id: ClassroomProductLoopChainHandoffItemId
) {
  const item = view.itemViews.find((itemView) => itemView.id === id);
  assert.ok(item, `Missing classroom product loop chain item ${id}`);
  return item.value;
}

function assertNoPrivateProductLoopText(serializedView: string) {
  for (const privateValue of [
    PRIVATE_ACTIVITY_CONTENT,
    PRIVATE_ANSWER_KEY,
    PRIVATE_CSV_DATA_URL,
    PRIVATE_RAW_SUBMISSION,
    PRIVATE_RESULT_EXPORT_ROW,
    PRIVATE_RUNTIME_ITEM_ID,
    PRIVATE_SOURCE_STORAGE_KEY,
    PRIVATE_STUDENT_ANSWER,
    PRIVATE_STUDENT_NAME,
    PRIVATE_STUDENT_TOKEN,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Classroom product loop chain leaked private text: ${privateValue}`
    );
  }
}
