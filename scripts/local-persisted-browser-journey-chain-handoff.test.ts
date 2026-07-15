import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { ACTIVITY_EDITOR_WORKFLOW_HANDOFF_ITEM_IDS } from '@/activities/editor';
import { ACTIVITY_LIBRARY_PAGE_HANDOFF_ITEM_IDS } from '@/activities/library-view';
import { ASSIGNMENT_COPY_ARTIFACT_HANDOFF_ITEM_IDS } from '@/assignments/copy-artifact-handoff';
import { ASSIGNMENT_PUBLISH_HANDOFF_ITEM_IDS } from '@/assignments/publish-input';
import { ASSIGNMENT_RESULT_MATERIAL_HANDOFF_ITEM_IDS } from '@/assignments/result-actions';
import { ASSIGNMENT_RESULT_REVIEW_HANDOFF_ITEM_IDS } from '@/assignments/result-view';
import { ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS } from '@/assignments/results-export';
import { ASSIGNMENT_SHARE_LINK_HANDOFF_ITEM_IDS } from '@/assignments/share-link';
import { PRINTABLE_WORKSHEET_HANDOFF_ITEM_IDS } from '@/assignments/printable-worksheet-view';
import {
  STUDENT_RUNNER_START_HANDOFF_ITEM_IDS,
  STUDENT_RUNNER_SUBMISSION_HANDOFF_ITEM_IDS,
} from '@/assignments/student-runner-state';
import {
  LOCAL_PERSISTED_BROWSER_JOURNEY_CHAIN_HANDOFF_ITEM_IDS,
  LOCAL_PERSISTED_BROWSER_JOURNEY_CHAIN_SOURCE_FILES,
  buildLocalPersistedBrowserJourneyChainHandoffView,
  type LocalPersistedBrowserJourneyChainHandoffItemId,
  type LocalPersistedBrowserJourneyChainHandoffView,
} from '@/config/local-persisted-browser-journey-chain';
import { Routes } from '@/lib/routes';

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');
const ACTIVITY_AUTHORING_SPEC_SOURCE = readFileSync(
  'tests/e2e/specs/activity-authoring.spec.ts',
  'utf8'
);

const PRIVATE_ACTIVITY_CONTENT =
  'SECRET_LOCAL_JOURNEY_PRIVATE_ACTIVITY_CONTENT';
const PRIVATE_ANSWER_KEY = 'SECRET_LOCAL_JOURNEY_TEACHER_ANSWER_KEY';
const PRIVATE_CSV_DATA_URL =
  'data:text/csv;charset=utf-8,SECRET_LOCAL_JOURNEY_CSV';
const PRIVATE_INTERNAL_ACTIVITY_ID = 'activity-secret-local-journey';
const PRIVATE_INTERNAL_ASSIGNMENT_ID = 'assignment-secret-local-journey';
const PRIVATE_PROVIDER_SECRET = 'SECRET_LOCAL_JOURNEY_PROVIDER_SECRET';
const PRIVATE_ROUTE_SEARCH = 'student=Secret%20Local%20Journey';
const PRIVATE_SHARE_SLUG = 'secret-local-journey-share-slug';
const PRIVATE_SOURCE_STORAGE_KEY = 'source-materials/private/local-journey.pdf';
const PRIVATE_STUDENT_ANSWER = 'SECRET_LOCAL_JOURNEY_STUDENT_ANSWER';
const PRIVATE_STUDENT_TOKEN = 'SECRET_LOCAL_JOURNEY_RAW_TOKEN';
const PRIVATE_TEACHER_EMAIL = 'local-journey-teacher@example.test';

test('local persisted browser journey chain exposes 30 safe slices', () => {
  const handoffView = buildLocalPersistedBrowserJourneyChainHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...LOCAL_PERSISTED_BROWSER_JOURNEY_CHAIN_HANDOFF_ITEM_IDS,
  ]);
  assert.equal(handoffView.title, 'Local persisted browser journey chain');
  assert.match(
    handoffView.description,
    /Thirty-slice local persisted browser journey/
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
    chainSourceFileCount:
      LOCAL_PERSISTED_BROWSER_JOURNEY_CHAIN_SOURCE_FILES.length,
    createsAssignmentLinksWithoutTeacherAction: false,
    exposesActivityContentJson: false,
    exposesAnswerKeyTextInHandoff: false,
    exposesAnswerKeysBeforeExplicitToggle: false,
    exposesClipboardPrivateData: false,
    exposesCsvDataUrl: false,
    exposesInternalActivityIds: false,
    exposesInternalAssignmentIds: false,
    exposesProviderSecrets: false,
    exposesRawAnonymousTokens: false,
    exposesRawRouteSearchText: false,
    exposesRawStudentIdentity: false,
    exposesResultExportRows: false,
    exposesRuntimeItemIds: false,
    exposesShareSlugInHandoff: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAnswerTextInHandoff: false,
    exposesTeacherEmail: false,
    itemIds,
    keepsCopyCsvPrintReadOnly: true,
    keepsPublicRunnerStudentSafe: true,
    keepsResultReviewTeacherScoped: true,
    keepsStudentAttemptPersistedBeforeResults: true,
    requiresAuthenticatedTeacher: true,
    requiresExplicitAnswerKeyToggle: true,
    requiresLocalE2eAccountIsolation: true,
    scope: 'local-persisted-browser-journey',
    sourceFiles: [...LOCAL_PERSISTED_BROWSER_JOURNEY_CHAIN_SOURCE_FILES],
    usesActivityEditorSaveFlow: true,
    usesAssignmentPublishHandoff: true,
    usesAssignmentResultCopyHandoff: true,
    usesAssignmentResultMaterialHandoff: true,
    usesAssignmentResultReviewHandoff: true,
    usesCsvExportPreparationHandoff: true,
    usesPageHealthMonitor: true,
    usesPrintableWorksheetHandoff: true,
    usesStudentRunnerSubmissionHandoff: true,
  });
  assertNoPrivateLocalJourneyText(JSON.stringify(handoffView));
});

test('local persisted browser journey summarizes the real route order', () => {
  const handoffView = buildLocalPersistedBrowserJourneyChainHandoffView();

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['test-account-isolation', 'E2E user cleanup'],
      ['teacher-auth-session', 'Authenticated teacher'],
      ['create-route-entry', Routes.Create],
      ['activity-editor-save', 'Saved activity'],
      ['saved-activity-library-return', Routes.DashboardActivities],
      ['publish-dialog-entry', 'Teacher publish action'],
      ['assignment-title-settings', 'Title and delivery fields'],
      ['assignment-publish-success', 'Frozen share link'],
      ['share-link-distribution', Routes.DashboardAssignments],
      ['public-runner-open', '/play/:shareId'],
      ['student-identity-entry', 'Student name'],
      ['partial-answer-progress', 'Answered counter'],
      ['partial-submit-confirmation', 'Submit anyway gate'],
      ['completed-submit-persistence', 'Scored attempt'],
      ['retry-attempt-state', 'Remaining attempts'],
      ['results-route-entry', '/dashboard/assignments/:assignmentId'],
      ['result-material-handoff-dom', '30 material slices'],
      ['result-review-handoff-dom', '30 review slices'],
      ['result-filter-url-state', 'Search/sort/review route state'],
      ['copy-artifact-handoff-dom', '30 copy slices'],
      ['classroom-brief-copy', 'Clipboard text'],
      ['csv-export-download', 'Full assignment CSV'],
      ['printable-worksheet-route', '/print/assignments/:assignmentId'],
      ['printable-worksheet-handoff-dom', '30 worksheet slices'],
      ['answer-key-hidden-default', 'Hidden by default'],
      ['answer-key-explicit-toggle', 'Include answer key'],
      ['answer-key-url-state', 'answerKey=true'],
      ['return-to-results-route', Routes.DashboardAssignments],
      ['browser-health-monitor', 'No browser errors'],
      ['private-data-guard', 'Private data hidden'],
    ]
  );
  assert.equal(
    getHandoffValue(handoffView, 'create-route-entry'),
    Routes.Create
  );
  assert.equal(
    getHandoffValue(handoffView, 'saved-activity-library-return'),
    Routes.DashboardActivities
  );
});

test('local persisted browser journey is backed by adjacent gates', () => {
  assert.equal(LOCAL_PERSISTED_BROWSER_JOURNEY_CHAIN_SOURCE_FILES.length, 30);
  for (const filePath of LOCAL_PERSISTED_BROWSER_JOURNEY_CHAIN_SOURCE_FILES) {
    assert.ok(
      existsSync(filePath),
      `Missing local persisted browser journey file ${filePath}`
    );
  }

  assert.deepEqual(
    [
      ACTIVITY_EDITOR_WORKFLOW_HANDOFF_ITEM_IDS.length,
      ACTIVITY_LIBRARY_PAGE_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_PUBLISH_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_SHARE_LINK_HANDOFF_ITEM_IDS.length,
      STUDENT_RUNNER_START_HANDOFF_ITEM_IDS.length,
      STUDENT_RUNNER_SUBMISSION_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_RESULT_MATERIAL_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_RESULT_REVIEW_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_COPY_ARTIFACT_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS.length,
      PRINTABLE_WORKSHEET_HANDOFF_ITEM_IDS.length,
    ],
    Array.from({ length: 11 }, () => 30)
  );
});

test('local persisted browser journey preserves the product requirement', () => {
  assert.match(
    PRODUCT_SOURCE,
    /The local persisted browser journey should complete this same teacher loop[\s\S]*save an activity,[\s\S]*publish an assignment,[\s\S]*submit a student attempt,[\s\S]*review and filter the result,[\s\S]*copy a classroom brief,[\s\S]*download the full CSV,[\s\S]*open the printable worksheet,[\s\S]*teacher answer key,[\s\S]*return to results/i,
    'docs/product.md should preserve the complete local persisted browser journey.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /src\/config\/local-persisted-browser-journey-chain\.ts[\s\S]*30-slice source-level contract/i,
    'docs/product.md should name the local persisted browser journey chain.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /result-material,[\s\S]*result-review,[\s\S]*copy-artifact,[\s\S]*printable-worksheet 30-slice handoffs/i,
    'docs/product.md should keep the rendered DOM handoffs tied to the journey.'
  );
});

test('local persisted browser journey spec covers save through return', () => {
  assert.match(
    ACTIVITY_AUTHORING_SPEC_SOURCE,
    /test\('publishes a saved activity from the saved panel'/,
    'The activity-authoring spec should own the persisted browser journey.'
  );
  assert.match(
    ACTIVITY_AUTHORING_SPEC_SOURCE,
    /cleanupE2EUsers[\s\S]*registerE2EUser[\s\S]*loginByForm/,
    'The journey should isolate local e2e users before authenticating.'
  );
  assert.match(
    ACTIVITY_AUTHORING_SPEC_SOURCE,
    /saveActivityFromCreatePage[\s\S]*Publish assignment[\s\S]*Assignment published[\s\S]*Open published link/i,
    'The journey should save an activity, publish it, and open the generated student link.'
  );
  assert.match(
    ACTIVITY_AUTHORING_SPEC_SOURCE,
    /Student name[\s\S]*1\/2 answered[\s\S]*Submit anyway[\s\S]*2\/2 answered[\s\S]*Score submitted[\s\S]*Start another attempt/i,
    'The journey should exercise student identity, partial-submit confirmation, scoring, and retry state.'
  );
  assert.match(
    ACTIVITY_AUTHORING_SPEC_SOURCE,
    /assignment-result-material[\s\S]*assignment-result-review[\s\S]*assignment-copy-artifact/,
    'The journey should verify the result material, review, and copy handoff DOM.'
  );
  assert.match(
    ACTIVITY_AUTHORING_SPEC_SOURCE,
    /Find student[\s\S]*Sort students[\s\S]*Sort items[\s\S]*Review view[\s\S]*student-search-status[\s\S]*answer-review-status/,
    'The journey should verify result filter URL state and adjusted handoff status.'
  );
  assert.match(
    ACTIVITY_AUTHORING_SPEC_SOURCE,
    /clipboard-read[\s\S]*Copy brief[\s\S]*navigator\.clipboard\.readText/,
    'The journey should verify classroom brief copy through the real clipboard.'
  );
  assert.match(
    ACTIVITY_AUTHORING_SPEC_SOURCE,
    /waitForEvent\('download'\)[\s\S]*Download CSV[\s\S]*classgamify-\.\*-results\\\.csv[\s\S]*student_answer/,
    'The journey should verify full CSV download contents.'
  );
  assert.match(
    ACTIVITY_AUTHORING_SPEC_SOURCE,
    /Print worksheet[\s\S]*Hidden by default[\s\S]*printable-worksheet[\s\S]*Include answer key[\s\S]*answerKey=true[\s\S]*Teacher-only key included[\s\S]*Back to results/,
    'The journey should verify printable worksheet, explicit answer-key state, and return-to-results navigation.'
  );
  assert.match(
    ACTIVITY_AUTHORING_SPEC_SOURCE,
    /expectNoBrowserErrors\(monitor,[\s\S]*publish assignment from saved panel/,
    'The journey should finish with browser health verification.'
  );
});

test('local persisted browser journey focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /Local persisted browser journey chain has a fast script-level gate via[\s\S]*scripts\/local-persisted-browser-journey-chain-handoff\.test\.ts/,
    'TEST-CATALOG should document the local persisted browser journey gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE.replace(/\s+/g, ' '),
    /saved activity[\s\S]*published assignment[\s\S]*student attempt[\s\S]*result filters[\s\S]*classroom brief[\s\S]*CSV[\s\S]*printable worksheet[\s\S]*answer key[\s\S]*return-to-results/,
    'TEST-CATALOG should describe the full persisted browser journey scope.'
  );
});

function getHandoffValue(
  view: LocalPersistedBrowserJourneyChainHandoffView,
  id: LocalPersistedBrowserJourneyChainHandoffItemId
) {
  const item = view.itemViews.find((candidate) => candidate.id === id);
  assert.ok(item, `Missing local persisted browser journey item ${id}`);
  return item.value;
}

function assertNoPrivateLocalJourneyText(serializedView: string) {
  for (const privateValue of [
    PRIVATE_ACTIVITY_CONTENT,
    PRIVATE_ANSWER_KEY,
    PRIVATE_CSV_DATA_URL,
    PRIVATE_INTERNAL_ACTIVITY_ID,
    PRIVATE_INTERNAL_ASSIGNMENT_ID,
    PRIVATE_PROVIDER_SECRET,
    PRIVATE_ROUTE_SEARCH,
    PRIVATE_SHARE_SLUG,
    PRIVATE_SOURCE_STORAGE_KEY,
    PRIVATE_STUDENT_ANSWER,
    PRIVATE_STUDENT_TOKEN,
    PRIVATE_TEACHER_EMAIL,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Local persisted browser journey leaked private text: ${privateValue}`
    );
  }
}
