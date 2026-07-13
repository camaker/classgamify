import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { ASSIGNMENT_COPY_ARTIFACT_HANDOFF_ITEM_IDS } from '@/assignments/copy-artifact-handoff';
import { ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS } from '@/assignments/results-export';
import {
  ASSIGNMENT_RESULT_SUBMITTED_DATE_CHAIN_HANDOFF_ITEM_IDS,
  ASSIGNMENT_RESULT_SUBMITTED_DATE_CHAIN_SOURCE_FILES,
  buildAssignmentResultSubmittedDateChainHandoffView,
  type AssignmentResultSubmittedDateChainHandoffItemId,
  type AssignmentResultSubmittedDateChainHandoffView,
} from '@/assignments/result-submitted-date-chain';
import {
  formatAssignmentResultCsvDate,
  formatAssignmentResultDate,
} from '@/assignments/result-format';
import { SCORED_ATTEMPT_RESULT_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/scored-attempt-result-chain';
import { TEACHER_RESULT_COPY_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/teacher-result-copy-lifecycle-chain';
import { TEACHER_RESULTS_REVIEW_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/teacher-results-review-chain';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const RESULT_FORMAT_SOURCE = readFileSync(
  'src/assignments/result-format.ts',
  'utf8'
);
const RESULT_VIEW_SOURCE = readFileSync(
  'src/assignments/result-view.ts',
  'utf8'
);
const RESULT_FILTERS_SOURCE = readFileSync(
  'src/assignments/result-filters.ts',
  'utf8'
);
const STUDENT_FOLLOW_UP_SOURCE = readFileSync(
  'src/assignments/student-follow-up-summary.ts',
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
const RESULT_ACTIONS_SOURCE = readFileSync(
  'src/assignments/result-actions.ts',
  'utf8'
);
const RESULTS_EXPORT_SOURCE = readFileSync(
  'src/assignments/results-export.ts',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const PRIVATE_COMPLETED_AT = '2026-03-04T05:06:07.000Z';
const PRIVATE_CSV_DATA_URL = 'data:text/csv,SECRET_SUBMITTED_DATE_CSV';
const PRIVATE_STUDENT_ANSWER = 'SECRET_SUBMITTED_DATE_STUDENT_ANSWER';
const PRIVATE_STUDENT_LABEL = 'SECRET_SUBMITTED_DATE_STUDENT_LABEL';
const PRIVATE_STUDENT_NAME = 'SECRET_SUBMITTED_DATE_STUDENT_NAME';
const PRIVATE_TOKEN = 'SECRET_SUBMITTED_DATE_RAW_TOKEN';

test('assignment result submitted-date chain exposes 30 safe slices', () => {
  const handoffView = buildAssignmentResultSubmittedDateChainHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...ASSIGNMENT_RESULT_SUBMITTED_DATE_CHAIN_HANDOFF_ITEM_IDS,
  ]);
  assert.equal(handoffView.title, 'Assignment result submitted-date chain');
  assert.match(handoffView.description, /Thirty-slice assignment result/);
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
      ASSIGNMENT_RESULT_SUBMITTED_DATE_CHAIN_SOURCE_FILES.length,
    copyArtifactsUseFormattedDates: true,
    csvDatesUseIsoFormatter: true,
    exportIncludesSubmittedDateColumns: true,
    exposesCsvDataUrlInHandoff: false,
    exposesRawAnonymousTokensInHandoff: false,
    exposesRawCompletedAtValuesInHandoff: false,
    exposesStudentAnswerTextInHandoff: false,
    exposesStudentLabelsInHandoff: false,
    exposesStudentNamesInHandoff: false,
    itemIds,
    preservesTeacherOnlyResultScope: true,
    sortingUsesTimestampParsing: true,
    sourceFiles: [...ASSIGNMENT_RESULT_SUBMITTED_DATE_CHAIN_SOURCE_FILES],
    uiDatesUseLocalizedFormatter: true,
    usesCopyArtifactHandoff: true,
  });
  assertNoPrivateSubmittedDateText(JSON.stringify(handoffView));
});

test('assignment result submitted-date chain summarizes each boundary', () => {
  const handoffView = buildAssignmentResultSubmittedDateChainHandoffView();

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['product-submitted-date-policy', 'Shared result formatting'],
      ['result-format-source', 'result-format.ts'],
      ['ui-date-empty-value', 'Empty value'],
      ['ui-date-invalid-guard', 'Invalid hidden'],
      ['ui-date-locale-option', 'Locale aware'],
      ['ui-date-timezone-option', 'Timezone aware'],
      ['csv-date-source', 'CSV formatter'],
      ['csv-date-empty-value', 'Blank cell'],
      ['csv-date-invalid-guard', 'Blank cell'],
      ['csv-date-iso-output', 'ISO string'],
      ['attempt-row-submitted-label', 'Table label'],
      ['attempt-review-card-submitted-label', 'Card label'],
      ['student-summary-last-submitted', 'Summary label'],
      ['latest-attempt-completed-at', 'Latest attempt'],
      ['follow-up-last-submitted-context', 'Last submitted'],
      ['attempt-review-sort-timestamp', 'Parsed timestamp'],
      ['attempt-row-sort-timestamp', 'Parsed timestamp'],
      ['student-summary-sort-timestamp', 'Last submitted'],
      ['review-scope-submitted-at', 'Scoped attempts'],
      ['copy-artifact-latest-attempt', 'Formatted copy'],
      ['copy-artifact-follow-up-context', 'Formatted copy'],
      ['csv-attempt-submitted-column', 'attempt submitted_at'],
      ['csv-student-last-submitted-column', 'student last submitted'],
      ['export-preparation-date-slice', 'submitted-date-format'],
      ['result-view-format-consumer', 'UI formatter'],
      ['results-export-format-consumer', 'CSV formatter'],
      ['teacher-results-chain-alignment', 'Results chain'],
      ['scored-result-chain-alignment', 'Scored attempts'],
      ['submitted-date-privacy-guard', 'Raw data hidden'],
      ['copy-artifact-handoff-boundary', '30 artifact slices'],
    ]
  );
  assert.equal(
    getHandoffValue(handoffView, 'csv-date-iso-output'),
    'ISO string'
  );
});

test('assignment result submitted-date chain is backed by adjacent gates', () => {
  assert.equal(ASSIGNMENT_RESULT_SUBMITTED_DATE_CHAIN_SOURCE_FILES.length, 30);
  for (const filePath of ASSIGNMENT_RESULT_SUBMITTED_DATE_CHAIN_SOURCE_FILES) {
    assert.ok(
      existsSync(filePath),
      `Missing submitted-date chain file ${filePath}`
    );
  }

  assert.deepEqual(
    [
      ASSIGNMENT_COPY_ARTIFACT_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS.length,
      SCORED_ATTEMPT_RESULT_CHAIN_HANDOFF_ITEM_IDS.length,
      TEACHER_RESULT_COPY_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS.length,
      TEACHER_RESULTS_REVIEW_CHAIN_HANDOFF_ITEM_IDS.length,
    ],
    Array.from({ length: 5 }, () => 30)
  );
});

test('submitted-date formatters keep UI and CSV behavior explicit', () => {
  const date = new Date('2026-01-01T10:00:00.000Z');

  assert.match(
    formatAssignmentResultDate(date, {
      locale: 'en-US',
      timeZone: 'UTC',
    }),
    /Jan 1, 2026, 10:00 AM/
  );
  assert.equal(formatAssignmentResultDate(null), '-');
  assert.equal(formatAssignmentResultDate('not-a-date'), '-');
  assert.equal(formatAssignmentResultCsvDate(date), '2026-01-01T10:00:00.000Z');
  assert.equal(formatAssignmentResultCsvDate(null), '');
  assert.equal(formatAssignmentResultCsvDate('not-a-date'), '');
});

test('submitted-date sources preserve shared result formatting', () => {
  assert.match(
    PRODUCT_SOURCE,
    /Result pages and CSV exports should share\s+assignment-domain formatting for submitted dates/,
    'docs/product.md should keep submitted-date formatting shared.'
  );
  assert.match(
    RESULT_FORMAT_SOURCE,
    /export function formatAssignmentResultDate[\s\S]*new Intl\.DateTimeFormat\(options\?\.locale,[\s\S]*timeZone: options\?\.timeZone/,
    'Result UI dates should use the shared locale/time-zone aware formatter.'
  );
  assert.match(
    RESULT_FORMAT_SOURCE,
    /export function formatAssignmentResultCsvDate[\s\S]*if \(!value\) return ''[\s\S]*Number\.isNaN\(date\.getTime\(\)\)[\s\S]*return date\.toISOString\(\)/,
    'Result CSV dates should use the shared ISO formatter.'
  );
  assert.match(
    RESULT_VIEW_SOURCE,
    /const submittedAtLabel = formatAssignmentResultDate\(attempt\.completedAt\)[\s\S]*submittedAtLabel[\s\S]*lastSubmittedLabel: formatAssignmentResultDate\(student\.lastCompletedAt\)/,
    'Result rows, review cards, and student summaries should format submitted dates through result-format.'
  );
  assert.match(
    RESULT_FILTERS_SOURCE,
    /getAssignmentResultCompletedAtTimestamp[\s\S]*completedAt instanceof Date[\s\S]*Date\.parse\(completedAt\)[\s\S]*compareAssignmentResultCompletedAt/,
    'Result sorting should parse completed-at timestamps through shared filter helpers.'
  );
});

test('copy artifacts and CSV exports reuse formatted submitted dates', () => {
  assert.match(
    STUDENT_FOLLOW_UP_SOURCE,
    /formatStudentFollowUpLatestAttemptCompletedAt[\s\S]*formatAssignmentResultDate\(attempt\.completedAt[\s\S]*formatStudentFollowUpLastSubmitted[\s\S]*formatAssignmentResultDate\(\s*student\.lastCompletedAt/,
    'Student follow-up copy should use formatted latest and last-submitted dates.'
  );
  assert.match(
    CLASSROOM_BRIEF_SOURCE,
    /formatStudentFollowUpLastSubmitted\(student\)[\s\S]*formatStudentFollowUpLatestAttemptCompletedAt/,
    'Classroom briefs should reuse student follow-up submitted-date helpers.'
  );
  assert.match(
    RETEACH_PLAN_SOURCE,
    /formatStudentFollowUpLastSubmitted\(student\)[\s\S]*formatStudentFollowUpLatestAttemptCompletedAt/,
    'Reteach plan copy should reuse student follow-up submitted-date helpers.'
  );
  assert.match(
    RESULT_ACTIONS_SOURCE,
    /buildAssignmentResultCopyArtifactStudentAttemptMetaItems[\s\S]*lastSubmittedLabel: string \| null[\s\S]*latestAttemptCompletedAtLabel: string \| null[\s\S]*key: 'student-last-submitted'[\s\S]*countAssignmentResultCopyStudentLastSubmittedViews[\s\S]*Boolean\(studentView\.lastSubmittedLabel\)/,
    'Result action preview metadata should count formatted submitted-date context.'
  );
  assert.match(
    RESULTS_EXPORT_SOURCE,
    /formatAssignmentResultCsvDate\(attempt\.completedAt\)[\s\S]*formatAssignmentResultCsvDate\(studentSummary\?\.lastCompletedAt\)/,
    'CSV export should format attempt and student submitted dates through one helper.'
  );
});

test('assignment result submitted-date focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /Assignment result submitted-date continuity chain has a fast script-level gate[\s\S]*via[\s\S]*scripts\/assignment-result-submitted-date-chain-handoff\.test\.ts/,
    'TEST-CATALOG should document the submitted-date continuity chain.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /result date formatting[\s\S]*attempt submitted labels[\s\S]*student\s+last-submitted labels[\s\S]*CSV[\s\S]*submitted-date columns/,
    'TEST-CATALOG should document the submitted-date chain scope.'
  );
});

function getHandoffValue(
  view: AssignmentResultSubmittedDateChainHandoffView,
  id: AssignmentResultSubmittedDateChainHandoffItemId
) {
  const item = view.itemViews.find((candidate) => candidate.id === id);
  assert.ok(item, `Missing submitted-date chain item ${id}`);
  return item.value;
}

function assertNoPrivateSubmittedDateText(serializedView: string) {
  for (const privateValue of [
    PRIVATE_COMPLETED_AT,
    PRIVATE_CSV_DATA_URL,
    PRIVATE_STUDENT_ANSWER,
    PRIVATE_STUDENT_LABEL,
    PRIVATE_STUDENT_NAME,
    PRIVATE_TOKEN,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Submitted-date chain leaked private text: ${privateValue}`
    );
  }
}
