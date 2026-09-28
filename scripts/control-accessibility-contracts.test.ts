import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// Real controls keep their accessible descriptions. docs/design.md (Tokens
// And Hard Rules): screen-reader-only text describes the visible UI and must
// not add audit or implementation detail, so these checks cover what a
// screen-reader user hears on actual inputs, buttons, and selects.

function readSource(path: string) {
  return readFileSync(path, 'utf8');
}

const ACTIVITY_AI_PANEL_SOURCE = readSource(
  'src/components/activities/activity-ai-draft-panel.tsx'
);
const ACTIVITY_LIBRARY_SEARCH_SOURCE = readSource(
  'src/components/activities/activity-library-search.tsx'
);
const ASSIGNMENT_LIST_FILTERS_SOURCE = readSource(
  'src/components/assignments/assignment-list-filters.tsx'
);
const ASSIGNMENT_RESULTS_ITEM_SORT_SOURCE = readSource(
  'src/components/assignments/assignment-results-item-performance-sort-control.tsx'
);
const ASSIGNMENT_RESULTS_REVIEW_FILTER_SOURCE = readSource(
  'src/components/assignments/assignment-results-attempt-review-filter-control.tsx'
);
const ASSIGNMENT_RESULTS_STUDENT_SEARCH_SOURCE = readSource(
  'src/components/assignments/assignment-results-student-search.tsx'
);
const PRINTABLE_TOOLBAR_SOURCE = readSource(
  'src/components/assignments/printable-worksheet-toolbar.tsx'
);
const PUBLISH_SETTINGS_FORM_SOURCE = readSource(
  'src/components/activities/activity-publish-settings-form.tsx'
);
const STUDENT_RUNNER_ATTEMPT_SHELL_SOURCE = readSource(
  'src/components/assignments/student-runner-attempt-shell.tsx'
);
const STUDENT_RUNNER_SUBMIT_CONTROLS_SOURCE = readSource(
  'src/components/assignments/student-runner-submit-controls.tsx'
);
const PUBLIC_ASSIGNMENT_RULES_SOURCE = readSource(
  'src/components/assignments/public-assignment-rules.tsx'
);

test('teacher controls keep their prepared accessible descriptions', () => {
  assert.match(
    ACTIVITY_AI_PANEL_SOURCE,
    /sourceControlBoundary\.textareaDescribedByIds[\s\S]*Textarea[\s\S]*id=\{controlIds\.sourceInput\}[\s\S]*aria-describedby=\{sourceDescriptionIds\}/
  );
  assert.match(ACTIVITY_AI_PANEL_SOURCE, /controlIds\.safeSourceDescription/);
  assert.match(
    ACTIVITY_AI_PANEL_SOURCE,
    /controlIds\.sourceMaterialSafetyDescription/
  );
  assert.match(
    ACTIVITY_AI_PANEL_SOURCE,
    /aria-describedby=\{focusDescriptionId\}/
  );
  assert.match(
    ACTIVITY_AI_PANEL_SOURCE,
    /aria-describedby=\{generationDescriptionIds\}/
  );

  assert.match(
    ACTIVITY_LIBRARY_SEARCH_SOURCE,
    /id="activity-source-filter"[\s\S]*aria-describedby=\{sourceFilterDescriptionId\}/
  );
  assert.match(
    ASSIGNMENT_LIST_FILTERS_SOURCE,
    /id="assignment-status-filter"[\s\S]*aria-describedby=\{statusFilterDescriptionId\}/
  );

  for (const field of [
    'title',
    'instructions',
    'maxAttempts',
    'timeLimit',
    'closeAfter',
  ]) {
    assert.match(
      PUBLISH_SETTINGS_FORM_SOURCE,
      new RegExp(
        `fieldIds\\.${field}\\.inputId[\\s\\S]*aria-describedby=\\{joinDomIds\\(\\s*fieldIds\\.${field}\\.describedByIds`
      ),
      `Publish field ${field} should be described by its prepared help text.`
    );
  }
  assert.match(
    PUBLISH_SETTINGS_FORM_SOURCE,
    /descriptionId=\{controlIds\.toggleIds\[option\.key\]\.descriptionId\}[\s\S]*Switch[\s\S]*aria-describedby=\{joinDomIds\(describedByIds\)\}/
  );

  assert.match(
    ASSIGNMENT_RESULTS_STUDENT_SEARCH_SOURCE,
    /aria-describedby=\{searchDescriptionIds\}/
  );
  assert.match(
    ASSIGNMENT_RESULTS_STUDENT_SEARCH_SOURCE,
    /htmlFor=\{view\.sortIds\.select\}[\s\S]*id=\{view\.sortIds\.select\}[\s\S]*aria-label=\{view\.sortAriaLabel\}/
  );
  assert.match(
    ASSIGNMENT_RESULTS_ITEM_SORT_SOURCE,
    /htmlFor=\{view\.ids\.select\}[\s\S]*id=\{view\.ids\.select\}[\s\S]*aria-label=\{view\.ariaLabel\}/
  );
  assert.match(
    ASSIGNMENT_RESULTS_REVIEW_FILTER_SOURCE,
    /htmlFor=\{view\.ids\.select\}[\s\S]*id=\{view\.ids\.select\}[\s\S]*aria-label=\{view\.ariaLabel\}/
  );

  assert.match(
    PRINTABLE_TOOLBAR_SOURCE,
    /id="printable-answer-key"[\s\S]*aria-describedby=\{`\$\{answerKeyDescriptionId\} \$\{answerKeyStatusDescriptionId\}`\}/
  );
  assert.match(
    PRINTABLE_TOOLBAR_SOURCE,
    /aria-describedby=\{printDescriptionId\}/
  );
});

test('student controls keep their prepared accessible descriptions', () => {
  assert.match(
    STUDENT_RUNNER_ATTEMPT_SHELL_SOURCE,
    /id="student-name"[\s\S]*aria-describedby=\{[\s\S]*studentNameDescriptionId[\s\S]*\}[\s\S]*aria-invalid=/
  );
  assert.match(
    STUDENT_RUNNER_SUBMIT_CONTROLS_SOURCE,
    /const buttonDescriptionIds = \[progressDescriptionId, \.\.\.submitHintIds\][\s\S]*aria-describedby=\{buttonDescriptionIds\.join\(' '\)\}/,
    'The submit button should be described by the progress text and every prepared hint.'
  );
  assert.match(
    PUBLIC_ASSIGNMENT_RULES_SOURCE,
    /summaryView\.items\.map\(\(rule\) =>[\s\S]*<PublicAssignmentRuleItem key=\{rule\.id\} rule=\{rule\} \/>/,
    'Public rules should render each rule from the prepared summary view.'
  );
});

test('the root layout and student play surface render no hidden audit sections', () => {
  const sources = [
    'src/routes/__root.tsx',
    'src/routes/play/$shareId.tsx',
    'src/components/activities/choice-question-stepper.tsx',
    'src/components/activities/fill-blank-worksheet.tsx',
    'src/components/activities/group-sort-board.tsx',
    'src/components/activities/line-match-board.tsx',
    'src/components/activities/listening-runner.tsx',
    'src/components/activities/matching-pairs-board.tsx',
    'src/components/activities/open-box-runner.tsx',
    'src/components/activities/public-answer-feedback.tsx',
    'src/components/activities/student-runtime-item-list.tsx',
    'src/components/assignments/public-assignment-rules.tsx',
    'src/components/assignments/student-runner-attempt-shell.tsx',
    'src/components/assignments/student-runner-frame.tsx',
    'src/components/assignments/student-runner-header-card.tsx',
    'src/components/assignments/student-runner-loading-panel.tsx',
    'src/components/assignments/student-runner-missing-panel.tsx',
    'src/components/assignments/student-runner-submit-controls.tsx',
  ];

  for (const path of sources) {
    assert.doesNotMatch(
      readSource(path),
      /data-handoff=|Handoff\b/,
      `${path} should not render hidden audit handoff output.`
    );
  }
});
