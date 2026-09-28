import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const ASSIGNMENT_SETTINGS_SUMMARY_SOURCE = readFileSync(
  'src/components/assignments/assignment-settings-summary.tsx',
  'utf8'
);
const ASSIGNMENT_LIST_CARD_SOURCE = readFileSync(
  'src/components/assignments/assignment-list-card.tsx',
  'utf8'
);
const ASSIGNMENT_LIST_VIEW_SOURCE = readFileSync(
  'src/assignments/list-view.ts',
  'utf8'
);
const ASSIGNMENT_RESULTS_HEADER_SOURCE = readFileSync(
  'src/components/assignments/assignment-results-header-card.tsx',
  'utf8'
);
const ASSIGNMENT_RESULT_VIEW_SOURCE = readFileSync(
  'src/assignments/result-view.ts',
  'utf8'
);
const ASSIGNMENT_PUBLISH_SOURCE = readFileSync(
  'src/assignments/publish-input.ts',
  'utf8'
);
const PUBLIC_ASSIGNMENT_RULES_SOURCE = readFileSync(
  'src/components/assignments/public-assignment-rules.tsx',
  'utf8'
);
const STUDENT_RUNNER_HEADER_SOURCE = readFileSync(
  'src/components/assignments/student-runner-header-card.tsx',
  'utf8'
);
const STUDENT_RUNNER_VIEW_SOURCE = readFileSync(
  'src/assignments/student-runner-view.ts',
  'utf8'
);

test('assignment delivery policy surfaces consume prepared summary views', () => {
  assert.match(
    ASSIGNMENT_SETTINGS_SUMMARY_SOURCE,
    /'view' in props[\s\S]*buildAssignmentSettingsSummaryView/
  );
  assert.match(
    ASSIGNMENT_PUBLISH_SOURCE,
    /const settingsSummaryView = buildAssignmentSettingsSummaryView\(\{[\s\S]*settingsSummaryView[\s\S]*deliveryRuleCount = settingsSummaryView\.summary\.deliveryRuleCount/
  );
  assert.match(
    ASSIGNMENT_LIST_VIEW_SOURCE,
    /settingsSummaryView: buildAssignmentSettingsSummaryView\(\{[\s\S]*settings: assignment\.settingsJson/
  );
  assert.match(
    ASSIGNMENT_LIST_CARD_SOURCE,
    /<AssignmentSettingsSummary view=\{assignment\.settingsSummaryView\} \/>/
  );
  assert.match(
    ASSIGNMENT_RESULT_VIEW_SOURCE,
    /settingsSummaryView: buildAssignmentSettingsSummaryView\(\{[\s\S]*settings: assignment\.settingsJson/
  );
  assert.match(
    ASSIGNMENT_RESULTS_HEADER_SOURCE,
    /<AssignmentSettingsSummary view=\{headerView\.settingsSummaryView\} \/>/
  );
  assert.match(
    STUDENT_RUNNER_VIEW_SOURCE,
    /const ruleSummaryView = buildPublicAssignmentRuleSummaryViewFromSettings\(\{[\s\S]*ruleSummaryView/
  );
  assert.match(
    STUDENT_RUNNER_HEADER_SOURCE,
    /<PublicAssignmentRules summaryView=\{view\.ruleSummaryView\} \/>/
  );
  assert.match(
    PUBLIC_ASSIGNMENT_RULES_SOURCE,
    /summaryView\.items\.map\(\(rule\) =>[\s\S]*<PublicAssignmentRuleItem key=\{rule\.id\} rule=\{rule\} \/>/
  );
});
