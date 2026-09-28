import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  formatAssignmentResultCsvDate,
  formatAssignmentResultDate,
} from '@/assignments/result-format';
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
    /export function getAssignmentDateLocale[\s\S]*return getLocale\(\)[\s\S]*export function formatAssignmentResultDate[\s\S]*new Intl\.DateTimeFormat\(\s*options\?\.locale \?\? getAssignmentDateLocale\(\),[\s\S]*timeZone: options\?\.timeZone/,
    'Result UI dates should use the shared locale/time-zone aware formatter, defaulting to the app language rather than the host locale.'
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
    /Assignment result submitted-date continuity chain has a fast script-level gate[\s\S]*via[\s\S]*scripts\/assignment-result-submitted-date-chain\.test\.ts/,
    'TEST-CATALOG should document the submitted-date continuity chain.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /result date formatting[\s\S]*attempt submitted labels[\s\S]*student\s+last-submitted labels[\s\S]*CSV[\s\S]*submitted-date columns/,
    'TEST-CATALOG should document the submitted-date chain scope.'
  );
});
