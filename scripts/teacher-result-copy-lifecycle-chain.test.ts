import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

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
});

test('teacher result copy lifecycle focused gate is documented', () => {
  const normalizedCatalog = TEST_CATALOG_SOURCE.replace(/\s+/g, ' ');

  assert.match(
    TEST_CATALOG_SOURCE,
    /Teacher result copy lifecycle chain has a fast script-level gate via[\s\S]*scripts\/teacher-result-copy-lifecycle-chain\.test\.ts/
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
