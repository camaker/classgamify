import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { ASSIGNMENT_ANSWER_FEEDBACK_HANDOFF_ITEM_IDS } from '@/assignments/answer-feedback-handoff';
import { ASSIGNMENT_ATTEMPT_DURATION_HANDOFF_ITEM_IDS } from '@/assignments/attempt-duration-handoff';
import { ASSIGNMENT_ATTEMPT_STATS_HANDOFF_ITEM_IDS } from '@/assignments/attempt-stats-handoff';
import { ASSIGNMENT_ATTEMPT_REVIEW_CARD_HANDOFF_ITEM_IDS } from '@/assignments/attempt-review-card-handoff';
import { ASSIGNMENT_COPY_ARTIFACT_HANDOFF_ITEM_IDS } from '@/assignments/copy-artifact-handoff';
import { ASSIGNMENT_ITEM_PERFORMANCE_SORT_HANDOFF_ITEM_IDS } from '@/assignments/item-performance-sort-handoff';
import { ASSIGNMENT_RESULT_EMPTY_STATE_HANDOFF_ITEM_IDS } from '@/assignments/result-empty-state-handoff';
import { ASSIGNMENT_RESULT_STUDENT_SEARCH_HANDOFF_ITEM_IDS } from '@/assignments/result-student-search-handoff';
import {
  ASSIGNMENT_RESULT_REVIEW_CONTROLS_HANDOFF_ITEM_IDS,
  ASSIGNMENT_RESULT_REVIEW_HANDOFF_ITEM_IDS,
} from '@/assignments/result-view';
import { ASSIGNMENT_RESULT_MATERIAL_HANDOFF_ITEM_IDS } from '@/assignments/result-actions';
import { ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS } from '@/assignments/results-export';
import { ASSIGNMENT_STUDENT_FOLLOW_UP_PRIORITY_HANDOFF_ITEM_IDS } from '@/assignments/student-follow-up-priority';
import { ASSIGNMENT_STUDENT_SUMMARY_SORT_HANDOFF_ITEM_IDS } from '@/assignments/student-summary-sort-handoff';
import {
  TEACHER_RESULTS_REVIEW_CHAIN_HANDOFF_ITEM_IDS,
  TEACHER_RESULTS_REVIEW_CHAIN_SOURCE_FILES,
  buildTeacherResultsReviewChainHandoffView,
  type TeacherResultsReviewChainHandoffItemId,
  type TeacherResultsReviewChainHandoffView,
} from '@/assignments/teacher-results-review-chain';

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const RESULT_VIEW_SOURCE = readFileSync(
  'src/assignments/result-view.ts',
  'utf8'
);
const RESULT_ROUTE_SOURCE = readFileSync(
  'src/routes/dashboard/assignments/$assignmentId.tsx',
  'utf8'
);
const REVIEW_PANEL_SOURCE = readFileSync(
  'src/components/assignments/assignment-results-review-handoff-panel.tsx',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const PRIVATE_ACCEPTED_ANSWER = 'SECRET_ACCEPTED_ANSWER';
const PRIVATE_ARTIFACT_TEXT = 'SECRET_COPY_ARTIFACT_TEXT';
const PRIVATE_CSV_DATA_URL = 'data:text/csv,SECRET_PRIVATE_CSV';
const PRIVATE_PROMPT = 'SECRET_PROMPT_TEXT';
const PRIVATE_SOURCE_STORAGE_KEY = 'source-materials/private/result-key.pdf';
const PRIVATE_STUDENT_ANSWER = 'SECRET_STUDENT_ANSWER';
const PRIVATE_STUDENT_NAME = 'SECRET_STUDENT_NAME';
const PRIVATE_TOKEN = 'SECRET_RAW_ANONYMOUS_TOKEN';

test('teacher results review chain exposes 30 teacher-review slices', () => {
  const handoffView = buildTeacherResultsReviewChainHandoffView();
  const itemIds = handoffView.itemViews.map((itemView) => itemView.id);

  assert.deepEqual(itemIds, [...TEACHER_RESULTS_REVIEW_CHAIN_HANDOFF_ITEM_IDS]);
  assert.equal(handoffView.title, 'Teacher results review chain');
  assert.match(handoffView.description, /Thirty-slice teacher results/);
  assert.equal(handoffView.itemViews.length, 30);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(
    handoffView.itemViews.every(
      (itemView) =>
        Boolean(itemView.ariaLabel) &&
        Boolean(itemView.description) &&
        Boolean(itemView.label) &&
        Boolean(itemView.value)
    ),
    true
  );
  assert.deepEqual(handoffView.privacy, {
    chainSourceFileCount: TEACHER_RESULTS_REVIEW_CHAIN_SOURCE_FILES.length,
    exposesAcceptedAlternativesToTeachersOnly: true,
    exposesAnswerKeysToPublicRunner: false,
    exposesCopyArtifactText: false,
    exposesRawAnonymousToken: false,
    exposesRawAnonymousTokens: false,
    exposesRawRouteQuery: false,
    exposesRawCopyArtifactsInHandoff: false,
    exposesRawCsvDataUrlInHandoff: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAnswerTextInHandoff: false,
    exposesStudentDisplayLabels: false,
    exposesTeacherAnswerKey: false,
    itemIds,
    mutatesResultData: false,
    preservesFrozenSnapshots: true,
    resultExportsIncludeDeliveryPolicy: true,
    sourceFiles: [...TEACHER_RESULTS_REVIEW_CHAIN_SOURCE_FILES],
    usesSharedAttemptStats: true,
    usesAssignmentDomainHelpers: true,
    usesResultReviewControlsHandoff: true,
    usesTeacherOnlyResultScope: true,
  });
  assertNoPrivateTeacherResultsText(JSON.stringify(handoffView));
});

test('teacher results review chain summarizes each linked result step', () => {
  const handoffView = buildTeacherResultsReviewChainHandoffView();

  assert.deepEqual(
    handoffView.itemViews.map((itemView) => [itemView.id, itemView.value]),
    [
      ['result-route-owner-scope', 'Teacher assignment only'],
      ['frozen-snapshot-source', 'AssignmentSnapshot'],
      ['attempt-stats-summary', 'Shared metrics'],
      ['assignment-metric-cards', 'Prepared metrics'],
      ['review-status-summary', 'Current review state'],
      ['review-scope-controls', 'URL-backed controls'],
      ['student-search-normalization', 'Anonymous labels'],
      ['attempt-review-filter', 'All or missed'],
      ['student-summary-sort', 'Review order'],
      ['item-performance-sort', 'Lowest accuracy first'],
      ['item-analysis-priority', 'Reteach priorities'],
      ['attempt-review-cards', 'Item-level review'],
      ['answer-review-status', 'Correct or needs review'],
      ['accepted-alternatives-format', 'Shared formatter'],
      ['duration-formatting', 'Shared duration labels'],
      ['classroom-brief', 'Teacher-only brief'],
      ['lowest-performing-items', 'Top reteach focus'],
      ['student-follow-up-priority', 'Needs support first'],
      ['reteach-plan-copy', 'Classroom script'],
      ['item-review-copy', 'Prompt summary'],
      ['student-follow-up-copy', 'Support list'],
      ['copy-artifact-boundary', 'Handoff hidden'],
      ['csv-export-preparation', 'Private export'],
      ['delivery-policy-export', 'Rules included'],
      ['result-material-handoff', 'Teacher material scope'],
      ['empty-state-guidance', 'No attempts yet'],
      ['anonymous-token-guard', 'Raw token hidden'],
      ['source-material-guard', 'Storage keys hidden'],
      ['public-runner-boundary', 'Teacher-only results'],
      ['result-review-controls-boundary', '30 control slices'],
    ]
  );
  assert.equal(
    getHandoffValue(handoffView, 'copy-artifact-boundary'),
    'Handoff hidden'
  );
});

test('teacher results review chain stays backed by focused contracts', () => {
  assert.equal(TEACHER_RESULTS_REVIEW_CHAIN_SOURCE_FILES.length, 30);
  for (const filePath of TEACHER_RESULTS_REVIEW_CHAIN_SOURCE_FILES) {
    assert.ok(
      existsSync(filePath),
      `Missing teacher results review chain file ${filePath}`
    );
  }

  assert.deepEqual(
    [
      ASSIGNMENT_ATTEMPT_STATS_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_RESULT_REVIEW_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_RESULT_REVIEW_CONTROLS_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_RESULT_STUDENT_SEARCH_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_ITEM_PERFORMANCE_SORT_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_STUDENT_SUMMARY_SORT_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_ATTEMPT_REVIEW_CARD_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_STUDENT_FOLLOW_UP_PRIORITY_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_COPY_ARTIFACT_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS.length,
      ASSIGNMENT_RESULT_MATERIAL_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_RESULT_EMPTY_STATE_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_ATTEMPT_DURATION_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_ANSWER_FEEDBACK_HANDOFF_ITEM_IDS.length,
    ],
    Array.from({ length: 14 }, () => 30)
  );
});

test('teacher results review sources preserve private review boundaries', () => {
  assert.match(
    PRODUCT_SOURCE,
    /result review controls boundary[\s\S]*Teacher results should answer the classroom question[\s\S]*per-item correct rates[\s\S]*student-level follow-up summaries[\s\S]*CSV exports should include the assignment\s+delivery policy[\s\S]*Result pages and CSV exports should share\s+assignment-domain formatting/,
    'docs/product.md should define the teacher result-review and export boundary.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /Teachers can also view and copy a compact classroom brief[\s\S]*copy a text reteach plan[\s\S]*copy the full item review summary[\s\S]*copy a student follow-up summary/,
    'docs/product.md should keep teacher copy artifacts first-class.'
  );
  assert.match(
    RESULT_VIEW_SOURCE,
    /buildAssignmentResultsPageViewModel[\s\S]*filterAssignmentResultCompletedAttemptRows[\s\S]*buildAssignmentResultCopyScopeView[\s\S]*buildAssignmentResultReviewScopeView[\s\S]*buildAssignmentResultReviewControlsHandoffView[\s\S]*buildAssignmentResultReviewHandoffView[\s\S]*buildAssignmentResultMaterialHandoffView[\s\S]*buildAssignmentAttemptStatsHandoffView[\s\S]*buildTeacherResultsReviewChainHandoffView/s,
    'Result page view model should assemble stats, review scope, controls, material, and chain handoffs.'
  );
  assert.match(
    RESULT_VIEW_SOURCE,
    /const copyActionData = data[\s\S]*buildAssignmentResultCopyActionData\(\{[\s\S]*attempts: resultView\.filteredAttemptReviews[\s\S]*items: resultView\.sortedPerformanceItems[\s\S]*students: resultView\.filteredStudents/,
    'Copy actions should use the current filtered review scope.'
  );
  assert.match(
    RESULT_VIEW_SOURCE,
    /actionDataSet = buildAssignmentResultActionDataSet\(\{[\s\S]*copyActionData,[\s\S]*exportActionData: data \?\? null/,
    'CSV export should keep full assignment results while copy actions use filtered scope.'
  );
  assert.match(
    RESULT_ROUTE_SOURCE,
    /teacherResultsReviewChainView=\{[\s\S]*pageView\.teacherResultsReviewChainHandoffView[\s\S]*\}/,
    'Result route should render the teacher results review chain handoff.'
  );
});

test('teacher results review chain renders as hidden semantic output', () => {
  assert.match(
    REVIEW_PANEL_SOURCE,
    /TeacherResultsReviewChainHandoff[\s\S]*const titleId = 'teacher-results-review-chain-handoff-title'[\s\S]*const descriptionId = 'teacher-results-review-chain-handoff-description'[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-labelledby=\{titleId\}[\s\S]*className="sr-only"[\s\S]*data-handoff="teacher-results-review-chain"[\s\S]*data-handoff-scope="teacher-results-review-chain"[\s\S]*id=\{titleId\}[\s\S]*id=\{descriptionId\}[\s\S]*<dl>[\s\S]*view\.itemViews\.map[\s\S]*TeacherResultsReviewChainHandoffItem[\s\S]*function TeacherResultsReviewChainHandoffItem[\s\S]*const labelId = `teacher-results-review-chain-handoff-\$\{itemView\.id\}-label`[\s\S]*const valueId = `teacher-results-review-chain-handoff-\$\{itemView\.id\}-value`[\s\S]*const descriptionId = `teacher-results-review-chain-handoff-\$\{itemView\.id\}-description`[\s\S]*data-handoff-item=\{itemView\.id\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{itemView\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/,
    'Teacher results review chain should render as hidden dl/dt/dd semantic output.'
  );
});

test('teacher results review chain focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /Teacher results review chain has a fast script-level gate via[\s\S]*scripts\/teacher-results-review-chain-handoff\.test\.ts/,
    'TEST-CATALOG should document the teacher results review chain gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /owner-scoped result routes[\s\S]*frozen snapshots[\s\S]*attempt\s+stats[\s\S]*review controls[\s\S]*result review controls boundary[\s\S]*copy artifacts[\s\S]*CSV exports[\s\S]*result-material privacy/,
    'TEST-CATALOG should document the teacher results review-chain scope.'
  );
});

function getHandoffValue(
  view: TeacherResultsReviewChainHandoffView,
  id: TeacherResultsReviewChainHandoffItemId
) {
  const item = view.itemViews.find((itemView) => itemView.id === id);
  assert.ok(item, `Missing teacher results review chain item ${id}`);
  return item.value;
}

function assertNoPrivateTeacherResultsText(serializedView: string) {
  for (const privateValue of [
    PRIVATE_ACCEPTED_ANSWER,
    PRIVATE_ARTIFACT_TEXT,
    PRIVATE_CSV_DATA_URL,
    PRIVATE_PROMPT,
    PRIVATE_SOURCE_STORAGE_KEY,
    PRIVATE_STUDENT_ANSWER,
    PRIVATE_STUDENT_NAME,
    PRIVATE_TOKEN,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Teacher results review chain leaked private text: ${privateValue}`
    );
  }
}
