import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const RESULT_VIEW_SOURCE = readFileSync(
  'src/assignments/result-view.ts',
  'utf8'
);
const RESULT_ROUTE_SOURCE = readFileSync(
  'src/routes/dashboard/assignments/$assignmentId.tsx',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('teacher results review sources preserve private review boundaries', () => {
  assert.match(
    PRODUCT_SOURCE,
    /Teacher results should answer the classroom question[\s\S]*per-item correct rates[\s\S]*student-level follow-up summaries[\s\S]*CSV exports should include the assignment\s+delivery policy[\s\S]*Result pages and CSV exports should share\s+assignment-domain formatting/,
    'docs/product.md should define the teacher result-review and export boundary.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /Teachers can also view and copy a compact classroom brief[\s\S]*copy a text reteach plan[\s\S]*copy the full item review summary[\s\S]*copy a student follow-up summary/,
    'docs/product.md should keep teacher copy artifacts first-class.'
  );
  assert.match(
    RESULT_VIEW_SOURCE,
    /buildAssignmentResultsPageViewModel[\s\S]*filterAssignmentResultCompletedAttemptRows[\s\S]*buildAssignmentResultCopyScopeView[\s\S]*buildAssignmentResultReviewScopeView/,
    'Result page view model should assemble completed rows, review scope, and copy scope.'
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
  assert.doesNotMatch(
    RESULT_ROUTE_SOURCE,
    /data-handoff|Handoff\b/,
    'The results page should render no hidden audit sections.'
  );
});

test('teacher results review chain focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /Teacher results review chain has a fast script-level gate via[\s\S]*scripts\/teacher-results-review-chain\.test\.ts/,
    'TEST-CATALOG should document the teacher results review chain gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /owner-scoped result routes[\s\S]*frozen snapshots[\s\S]*attempt\s+stats[\s\S]*review controls[\s\S]*result review controls boundary[\s\S]*copy artifacts[\s\S]*CSV exports[\s\S]*result-material privacy/,
    'TEST-CATALOG should document the teacher results review-chain scope.'
  );
});
