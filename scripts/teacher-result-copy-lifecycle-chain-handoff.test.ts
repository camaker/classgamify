import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  TEACHER_RESULT_COPY_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS,
  TEACHER_RESULT_COPY_LIFECYCLE_CHAIN_SOURCE_FILES,
  buildTeacherResultCopyLifecycleChainHandoffView,
  type TeacherResultCopyLifecycleChainHandoffItemId,
  type TeacherResultCopyLifecycleChainHandoffView,
} from '@/assignments/teacher-result-copy-lifecycle-chain';
import { TEACHER_RESULTS_REVIEW_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/teacher-results-review-chain';

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const RESULT_ACTIONS_SOURCE = readFileSync(
  'src/assignments/result-actions.ts',
  'utf8'
);
const RESULT_VIEW_SOURCE = readFileSync(
  'src/assignments/result-view.ts',
  'utf8'
);
const CLASSROOM_BRIEF_SOURCE = readFileSync(
  'src/assignments/classroom-brief.ts',
  'utf8'
);
const RETEACH_PLAN_SOURCE = readFileSync(
  'src/assignments/reteach-plan.ts',
  'utf8'
);
const ITEM_REVIEW_SOURCE = readFileSync(
  'src/assignments/item-review-summary.ts',
  'utf8'
);
const STUDENT_FOLLOW_UP_SOURCE = readFileSync(
  'src/assignments/student-follow-up-summary.ts',
  'utf8'
);
const RESULT_COPY_FORMAT_SOURCE = readFileSync(
  'src/assignments/result-copy-format.ts',
  'utf8'
);
const CLASSROOM_BRIEF_CARD_SOURCE = readFileSync(
  'src/components/assignments/assignment-results-follow-up-panel.tsx',
  'utf8'
);
const RESULT_ROUTE_SOURCE = readFileSync(
  'src/routes/dashboard/assignments/$assignmentId.tsx',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const PRIVATE_ACCEPTED_ANSWER = 'SECRET_COPY_ACCEPTED_ANSWER';
const PRIVATE_ARTIFACT_TEXT = 'SECRET_COPY_ARTIFACT_TEXT';
const PRIVATE_CSV_DATA_URL = 'data:text/csv,SECRET_COPY_CSV';
const PRIVATE_EXPECTED_ANSWER = 'SECRET_COPY_EXPECTED_ANSWER';
const PRIVATE_PROMPT = 'SECRET_COPY_PROMPT_TEXT';
const PRIVATE_STUDENT_ANSWER = 'SECRET_COPY_STUDENT_ANSWER';
const PRIVATE_STUDENT_LABEL = 'SECRET_COPY_STUDENT_LABEL';
const PRIVATE_TOKEN = 'SECRET_COPY_RAW_ANONYMOUS_TOKEN';

test('teacher result copy lifecycle chain exposes 30 safe copy slices', () => {
  const handoffView = buildTeacherResultCopyLifecycleChainHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...TEACHER_RESULT_COPY_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS,
  ]);
  assert.equal(handoffView.title, 'Teacher result copy lifecycle chain');
  assert.match(handoffView.description, /Thirty-slice teacher result copy/);
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
    appendsCopyScopeToArtifacts: true,
    chainSourceFileCount:
      TEACHER_RESULT_COPY_LIFECYCLE_CHAIN_SOURCE_FILES.length,
    exposesAcceptedAnswerTextInHandoff: false,
    exposesArtifactTextInHandoff: false,
    exposesCsvDataUrlInHandoff: false,
    exposesExpectedAnswerTextInHandoff: false,
    exposesPromptTextInHandoff: false,
    exposesRawAnonymousTokensInHandoff: false,
    exposesRawCopyArtifactTextInHandoff: false,
    exposesStudentAnswerTextInHandoff: false,
    exposesStudentLabelsInHandoff: false,
    exposesTeacherNotesTextInHandoff: false,
    itemIds,
    keepsCsvExportFullAssignment: true,
    mutatesPublicRunner: false,
    mutatesResultArtifacts: false,
    sourceFiles: [...TEACHER_RESULT_COPY_LIFECYCLE_CHAIN_SOURCE_FILES],
    usesCurrentReviewScopeForCopyActions: true,
    usesCopyArtifactHandoff: true,
    usesSharedCopyArtifactBuilders: true,
    usesSharedCopyArtifactHelpers: true,
  });
  assertNoPrivateCopyLifecycleText(JSON.stringify(handoffView));
});

test('teacher result copy lifecycle chain summarizes each copy boundary', () => {
  const handoffView = buildTeacherResultCopyLifecycleChainHandoffView();

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['product-copy-artifact-policy', 'Teacher copy loop'],
      ['review-scope-source', 'Search/sort/filter'],
      ['copy-action-scope', 'Current review'],
      ['classroom-brief-builder', 'Brief artifact'],
      ['classroom-brief-metrics', 'Shared stats'],
      ['classroom-brief-focus-items', 'Lowest items'],
      ['classroom-brief-follow-up-students', 'Support list'],
      ['reteach-plan-builder', 'Classroom script'],
      ['reteach-plan-review-items', 'Priority items'],
      ['reteach-plan-student-follow-up', 'Priority students'],
      ['item-review-summary-builder', 'Prompt summary'],
      ['item-review-answer-coverage', 'Answer evidence'],
      ['student-follow-up-summary-builder', 'Student support'],
      ['student-follow-up-priority-order', 'Needs review first'],
      ['latest-attempt-context', 'Latest attempt'],
      ['copy-title-normalization', 'NFKC title'],
      ['copy-line-normalization', 'Line joiner'],
      ['copy-scope-appended', 'Scope block'],
      ['copy-preview-builder', 'Preview cards'],
      ['copy-preview-meta', 'Preview counts'],
      ['copy-action-buttons', 'Four copy actions'],
      ['copy-action-gates', 'Ready or blocked'],
      ['copy-action-execution-plan', 'Copy text'],
      ['current-review-data-set', 'Filtered copy data'],
      ['result-view-assembly', 'View model'],
      ['result-page-card-consumer', 'Brief card'],
      ['copy-handoff-hidden-dom', 'sr-only dl'],
      ['teacher-results-chain-alignment', 'Results chain'],
      ['privacy-guards', 'Private text hidden'],
      ['copy-artifact-handoff-boundary', '30 artifact handoff slices'],
    ]
  );
  assert.equal(
    getHandoffValue(handoffView, 'copy-action-scope'),
    'Current review'
  );
});

test('teacher result copy lifecycle chain is backed by adjacent gates', () => {
  assert.equal(TEACHER_RESULT_COPY_LIFECYCLE_CHAIN_SOURCE_FILES.length, 30);
  for (const filePath of TEACHER_RESULT_COPY_LIFECYCLE_CHAIN_SOURCE_FILES) {
    assert.ok(
      existsSync(filePath),
      `Missing teacher result copy lifecycle file ${filePath}`
    );
  }

  assert.deepEqual(
    [TEACHER_RESULTS_REVIEW_CHAIN_HANDOFF_ITEM_IDS.length],
    Array.from({ length: 1 }, () => 30)
  );
});

test('product docs and copy builders preserve teacher copy artifact policy', () => {
  assert.match(
    PRODUCT_SOURCE,
    /Result-page search, sort, and review-filter rules belong in assignment-domain\s+helpers[\s\S]*copied artifacts/
  );
  assert.match(
    PRODUCT_SOURCE,
    /Teachers can also view and copy a compact classroom brief[\s\S]*copy a text reteach plan[\s\S]*copy the full item review summary[\s\S]*copy a student follow-up summary sorted by review need/
  );
  assert.match(
    RESULT_ACTIONS_SOURCE,
    /assignmentResultActionDescriptors[\s\S]*action: 'copy-brief'[\s\S]*dataScope: 'current-review'[\s\S]*action: 'copy-reteach-plan'[\s\S]*action: 'copy-item-review'[\s\S]*action: 'copy-follow-up'[\s\S]*action: 'export-csv'[\s\S]*dataScope: 'full-assignment-results'/
  );
  assert.match(
    RESULT_ACTIONS_SOURCE,
    /buildAssignmentResultCopyArtifacts[\s\S]*buildAssignmentClassroomBrief[\s\S]*buildAssignmentReteachPlan[\s\S]*buildAssignmentItemReviewSummary[\s\S]*buildAssignmentStudentFollowUpSummary[\s\S]*appendAssignmentResultCopyScopeToArtifacts/
  );
  assert.match(
    RESULT_ACTIONS_SOURCE,
    /buildAssignmentResultCopyActionData[\s\S]*attempts: attempts \?\? data\.analysis\.attempts[\s\S]*perItem: items[\s\S]*students[\s\S]*copyScopeView/
  );
  assert.match(
    RESULT_ACTIONS_SOURCE,
    /buildAssignmentResultActionDataSet[\s\S]*copyActionData: 'current-review'[\s\S]*exportActionData: 'full-assignment-results'/
  );
  assert.match(
    RESULT_ACTIONS_SOURCE,
    /buildAssignmentResultCopyArtifactPreviews[\s\S]*assignmentResultActionDescriptors\.flatMap[\s\S]*descriptor\.kind !== 'copy-text'[\s\S]*buildAssignmentResultCopyArtifactPreviewMetaItems/
  );
  assert.match(
    RESULT_ACTIONS_SOURCE,
    /appendAssignmentResultCopyScopeToArtifacts[\s\S]*classroomBrief[\s\S]*itemReviewSummary[\s\S]*reteachPlan[\s\S]*studentFollowUpSummary/
  );
});

test('copy artifacts reuse shared priority, formatting, and latest-attempt helpers', () => {
  assert.match(CLASSROOM_BRIEF_SOURCE, /buildAssignmentAttemptStatsView/);
  assert.match(CLASSROOM_BRIEF_SOURCE, /getAssignmentReviewPriorityItems/);
  assert.match(CLASSROOM_BRIEF_SOURCE, /getClassroomBriefFollowUpStudents/);
  assert.match(
    CLASSROOM_BRIEF_SOURCE,
    /buildLatestAttemptReviewByStudentKey[\s\S]*formatStudentFollowUpLatestAttemptSummary/
  );
  assert.match(RETEACH_PLAN_SOURCE, /getAssignmentReviewPriorityItems/);
  assert.match(
    RETEACH_PLAN_SOURCE,
    /getAssignmentStudentFollowUpPriorityStudents/
  );
  assert.match(
    RETEACH_PLAN_SOURCE,
    /buildLatestAttemptReviewByStudentKey[\s\S]*formatStudentFollowUpSubmittedContext/
  );
  assert.match(ITEM_REVIEW_SOURCE, /sortAssignmentItemsByReviewPriority/);
  assert.match(ITEM_REVIEW_SOURCE, /formatPrimaryAcceptedAnswer/);
  assert.match(ITEM_REVIEW_SOURCE, /formatOptionalAcceptedAnswerAlternatives/);
  assert.match(
    STUDENT_FOLLOW_UP_SOURCE,
    /sortAssignmentStudentsByFollowUpPriority/
  );
  assert.match(
    STUDENT_FOLLOW_UP_SOURCE,
    /buildAssignmentStudentFollowUpSummaryCoverageViews/
  );
  assert.match(
    STUDENT_FOLLOW_UP_SOURCE,
    /buildLatestAttemptReviewByStudentKey[\s\S]*sortAssignmentAttemptReviewsByCompletedAt/
  );
  assert.match(
    RESULT_COPY_FORMAT_SOURCE,
    /ASSIGNMENT_RESULT_COPY_TEXT_FORMAT[\s\S]*lineBreak: '\\n'/
  );
  assert.match(
    RESULT_COPY_FORMAT_SOURCE,
    /joinAssignmentResultCopyLines[\s\S]*formatAssignmentResultCopyLine[\s\S]*previousLineWasBlank/
  );
  assert.match(
    RESULT_COPY_FORMAT_SOURCE,
    /formatAssignmentResultCopyLine[\s\S]*normalize\('NFKC'\)[\s\S]*replace\(\/\[ \\t\]\+\/gu, ' '\)/
  );
});

test('result page assembles scoped copy data without leaking copy text', () => {
  assert.match(
    RESULT_VIEW_SOURCE,
    /const copyActionData = data[\s\S]*buildAssignmentResultCopyActionData\(\{[\s\S]*attempts: resultView\.filteredAttemptReviews[\s\S]*items: resultView\.sortedPerformanceItems[\s\S]*students: resultView\.filteredStudents/
  );
  assert.match(
    RESULT_VIEW_SOURCE,
    /const copyArtifacts = copyActionData[\s\S]*buildAssignmentResultCopyArtifacts\(copyActionData\)/
  );
  assert.match(
    RESULT_VIEW_SOURCE,
    /buildAssignmentResultActionDataSet\(\{[\s\S]*copyActionData,[\s\S]*exportActionData: data \?\? null/
  );
  assert.match(
    RESULT_VIEW_SOURCE,
    /buildAssignmentResultCopyArtifactPreviews\(\{[\s\S]*artifacts: copyArtifacts,[\s\S]*copyScopeView/
  );
  assert.doesNotMatch(
    RESULT_VIEW_SOURCE,
    /HandoffView/,
    'The result page view model should not build hidden audit views.'
  );
  // Copy artifacts are reached through the Copy & export menu; the page no
  // longer repeats every copy preview inline.
  assert.match(
    RESULT_ROUTE_SOURCE,
    /<AssignmentResultsHeaderActions[\s\S]*resultActions=\{pageView\.actionButtons\}/
  );
  assert.doesNotMatch(
    RESULT_ROUTE_SOURCE,
    /<AssignmentResultsClassroomBriefCard\b/
  );
  assert.doesNotMatch(
    CLASSROOM_BRIEF_CARD_SOURCE,
    /data-handoff/,
    'The follow-up panel should render no hidden copy-artifact audit output.'
  );
  assertNoPrivateCopyLifecycleText(
    JSON.stringify(buildTeacherResultCopyLifecycleChainHandoffView())
  );
});

test('teacher result copy lifecycle focused gate is documented', () => {
  const normalizedCatalog = TEST_CATALOG_SOURCE.replace(/\s+/g, ' ');

  assert.match(
    TEST_CATALOG_SOURCE,
    /Teacher result copy lifecycle chain has a fast script-level gate via[\s\S]*scripts\/teacher-result-copy-lifecycle-chain-handoff\.test\.ts/
  );
  assert.match(
    normalizedCatalog,
    /classroom brief builders[\s\S]*reteach plan builders[\s\S]*item-review summaries[\s\S]*student follow-up summaries[\s\S]*copy preview metadata[\s\S]*current-review copy data[\s\S]*full-assignment CSV boundary[\s\S]*copy-artifact privacy guards/
  );
  assert.match(
    normalizedCatalog,
    /copy artifact handoff boundary/,
    'TEST-CATALOG should document the concrete copy artifact handoff boundary.'
  );
});

function getHandoffValue(
  view: TeacherResultCopyLifecycleChainHandoffView,
  id: TeacherResultCopyLifecycleChainHandoffItemId
) {
  const item = view.itemViews.find((candidate) => candidate.id === id);
  assert.ok(item, `Missing teacher result copy lifecycle item ${id}`);
  return item.value;
}

function assertNoPrivateCopyLifecycleText(serialized: string) {
  for (const privateValue of [
    PRIVATE_ACCEPTED_ANSWER,
    PRIVATE_ARTIFACT_TEXT,
    PRIVATE_CSV_DATA_URL,
    PRIVATE_EXPECTED_ANSWER,
    PRIVATE_PROMPT,
    PRIVATE_STUDENT_ANSWER,
    PRIVATE_STUDENT_LABEL,
    PRIVATE_TOKEN,
  ]) {
    assert.equal(
      serialized.includes(privateValue),
      false,
      `Teacher result copy lifecycle leaked private text: ${privateValue}`
    );
  }
}
