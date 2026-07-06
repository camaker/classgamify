import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  CLASSROOM_CONTROL_SEMANTICS_HANDOFF_ITEM_IDS,
  CLASSROOM_CONTROL_SEMANTICS_HANDOFF_ROUTE_SCOPES,
  buildClassroomControlSemanticsHandoffView,
  shouldRenderClassroomControlSemanticsHandoff,
  type ClassroomControlSemanticsHandoffItemId,
  type ClassroomControlSemanticsHandoffView,
} from '@/classroom/control-semantics';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ACTIVITY_CONTENT = 'SECRET_ACTIVITY_CONTENT';
const SECRET_ANSWER_KEY = 'SECRET_ANSWER_KEY';
const SECRET_ASSIGNMENT_TITLE = 'SECRET_ASSIGNMENT_TITLE';
const SECRET_CSV_DATA_URL = 'data:text/csv;base64,SECRET';
const SECRET_PROMPT = 'SECRET_PROMPT';
const SECRET_STUDENT_ANSWER = 'SECRET_STUDENT_ANSWER';
const SECRET_STUDENT_NAME = 'SECRET_STUDENT_NAME';
const SECRET_TOKEN = 'SECRET_ANONYMOUS_TOKEN';

const ACTIVITY_AI_PANEL_SOURCE = readSource(
  'src/components/activities/activity-ai-draft-panel.tsx'
);
const ACTIVITY_LIBRARY_SEARCH_SOURCE = readSource(
  'src/components/activities/activity-library-search.tsx'
);
const ASSIGNMENT_LIST_FILTERS_SOURCE = readSource(
  'src/components/assignments/assignment-list-filters.tsx'
);
const ASSIGNMENT_RESULTS_CLASSROOM_BRIEF_SOURCE = readSource(
  'src/components/assignments/assignment-results-classroom-brief-card.tsx'
);
const ASSIGNMENT_RESULTS_HEADER_ACTIONS_SOURCE = readSource(
  'src/components/assignments/assignment-results-header-actions.tsx'
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
const ASSIGNMENT_RESULTS_REVIEW_SCOPE_SOURCE = readSource(
  'src/components/assignments/assignment-results-review-scope-panel.tsx'
);
const CLASSROOM_CONTROL_COMPONENT_SOURCE = readSource(
  'src/components/classroom/classroom-control-semantics-handoff.tsx'
);
const PRINTABLE_TOOLBAR_SOURCE = readSource(
  'src/components/assignments/printable-worksheet-toolbar.tsx'
);
const PUBLISH_SETTINGS_FORM_SOURCE = readSource(
  'src/components/activities/activity-publish-settings-form.tsx'
);
const ROOT_SOURCE = readSource('src/routes/__root.tsx');
const STUDENT_RUNNER_ATTEMPT_SHELL_SOURCE = readSource(
  'src/components/assignments/student-runner-attempt-shell.tsx'
);
const STUDENT_RUNNER_SUBMIT_CONTROLS_SOURCE = readSource(
  'src/components/assignments/student-runner-submit-controls.tsx'
);

test('classroom control semantics handoff exposes 30 stable control slices', () => {
  const handoffView = buildClassroomControlSemanticsHandoffView();
  const itemIds = handoffView.itemViews.map((itemView) => itemView.id);

  assert.deepEqual(itemIds, [...CLASSROOM_CONTROL_SEMANTICS_HANDOFF_ITEM_IDS]);
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
    exposesActivityContentText: false,
    exposesAnswerKeys: false,
    exposesAssignmentTitleText: false,
    exposesCsvDataUrl: false,
    exposesPromptText: false,
    exposesRawAnonymousTokens: false,
    exposesStudentAnswers: false,
    exposesStudentName: false,
    itemIds,
    mutatesActivity: false,
    mutatesAssignment: false,
    scope: 'classroom-control-semantics',
    submitsAttempt: false,
    usesPreparedViewModels: true,
  });
  assertNoPrivateControlSemanticsText(JSON.stringify(handoffView));
});

test('classroom control semantics handoff summarizes prepared control evidence', () => {
  const handoffView = buildClassroomControlSemanticsHandoffView();

  assert.deepEqual(getHandoffValues(handoffView), {
    'activity-source-filter': 'Route state',
    'ai-draft-summary': 'Semantic region',
    'ai-focus-control': 'Prepared control',
    'ai-generate-action': 'Prepared control',
    'ai-material-safety': 'Prepared help',
    'ai-safe-source-note': 'Prepared help',
    'ai-source-capabilities': 'Prepared help',
    'ai-source-readiness': 'Prepared help',
    'ai-source-textarea': 'Prepared control',
    'ai-synced-provenance': 'Prepared help',
    'assignment-status-filter': 'Route state',
    'printable-answer-key-toggle': 'Prepared control',
    'printable-print-action': 'Prepared control',
    'privacy-guard': 'Private data hidden',
    'publish-attempt-limit-field': 'Prepared control',
    'publish-close-time-field': 'Prepared control',
    'publish-delivery-toggles': 'Prepared control',
    'publish-instructions-field': 'Prepared control',
    'publish-preview-region': 'Semantic region',
    'publish-timer-field': 'Prepared control',
    'publish-title-field': 'Prepared control',
    'result-answer-review-filter': 'Route state',
    'result-copy-scope': 'Semantic region',
    'result-csv-coverage': 'Semantic region',
    'result-item-sort': 'Route state',
    'result-review-scope': 'Semantic region',
    'result-student-search': 'Route state',
    'result-student-sort': 'Route state',
    'student-identity-input': 'Prepared control',
    'student-submit-button': 'Prepared state',
  });
  assertNoPrivateControlSemanticsText(JSON.stringify(handoffView));
});

test('classroom control semantics handoff localizes Chinese control values', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const handoffView = buildClassroomControlSemanticsHandoffView();

    assert.equal(handoffView.title, '课堂控件语义交接');
    assert.match(handoffView.description, /30 切片/);
    assert.equal(
      getHandoffValue(handoffView, 'ai-source-textarea'),
      '已准备控件'
    );
    assert.equal(
      getHandoffValue(handoffView, 'result-student-search'),
      '路由状态'
    );
    assert.equal(
      getHandoffValue(handoffView, 'publish-preview-region'),
      '语义区域'
    );
    assert.equal(
      getHandoffValue(handoffView, 'student-submit-button'),
      '已准备状态'
    );
    assert.equal(getHandoffValue(handoffView, 'privacy-guard'), '私有数据隐藏');
    assertNoPrivateControlSemanticsText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

test('classroom control semantics handoff renders from the root document', () => {
  assert.match(
    ROOT_SOURCE,
    /ClassroomControlSemanticsHandoffMount[\s\S]*<ClassroomControlSemanticsHandoffMount \/>/
  );
  assert.match(
    CLASSROOM_CONTROL_COMPONENT_SOURCE,
    /function ClassroomControlSemanticsHandoffMount[\s\S]*useRouterState[\s\S]*getCanonicalPathname[\s\S]*shouldRenderClassroomControlSemanticsHandoff[\s\S]*<ClassroomControlSemanticsHandoff \/>/
  );
  assert.match(
    CLASSROOM_CONTROL_COMPONENT_SOURCE,
    /data-handoff="classroom-control-semantics"[\s\S]*handoffView\.itemViews\.map[\s\S]*data-handoff-item=\{itemView\.id\}[\s\S]*<output aria-label=\{itemView\.ariaLabel\}>/
  );
});

test('classroom control semantics handoff is route gated', () => {
  assert.deepEqual(CLASSROOM_CONTROL_SEMANTICS_HANDOFF_ROUTE_SCOPES, [
    '/create',
    '/dashboard',
    '/play',
    '/print',
  ]);

  for (const pathname of [
    '/create',
    '/create?template=quiz',
    '/dashboard',
    '/dashboard/',
    '/dashboard/activities',
    '/dashboard/assignments/classroom-results',
    '/play/demo-food',
    '/play/demo-food?attempt=2',
    '/print/assignments/classroom-results',
    '/print/assignments/classroom-results#answer-key',
  ]) {
    assert.equal(
      shouldRenderClassroomControlSemanticsHandoff(pathname),
      true,
      `${pathname} should render classroom control semantics`
    );
  }

  for (const pathname of [
    '/',
    '/templates',
    '/templates/',
    '/worksheets',
    '/pricing',
    '/teachers',
    '/contact',
    '/blog',
    '/blog?utm_source=classroom',
    '/terms',
    '/privacy',
    '/cookie',
    '/auth/login',
    '/auth/login#workspace',
    '/auth/register',
    '/settings',
    '/settings/profile',
    '/admin/users',
  ]) {
    assert.equal(
      shouldRenderClassroomControlSemanticsHandoff(pathname),
      false,
      `${pathname} should keep public/internal pages free of control handoff`
    );
  }
});

test('classroom control semantics evidence comes from described controls', () => {
  assert.match(
    ACTIVITY_AI_PANEL_SOURCE,
    /Textarea[\s\S]*id="activity-ai-source"[\s\S]*aria-describedby=\{sourceDescriptionIds\}/
  );
  assert.match(ACTIVITY_AI_PANEL_SOURCE, /safeSourceDescriptionId/);
  assert.match(ACTIVITY_AI_PANEL_SOURCE, /sourceMaterialSafetyDescriptionId/);
  assert.match(ACTIVITY_AI_PANEL_SOURCE, /sourceCapabilityTitleId/);
  assert.match(ACTIVITY_AI_PANEL_SOURCE, /sourceMaterialNotesLabelId/);
  assert.match(
    ACTIVITY_AI_PANEL_SOURCE,
    /aria-describedby=\{focusDescriptionId\}/
  );
  assert.match(
    ACTIVITY_AI_PANEL_SOURCE,
    /aria-describedby=\{generationDescriptionIds\}/
  );
  assert.match(ACTIVITY_AI_PANEL_SOURCE, /ActivityDraftMetaSummary/);

  assert.match(
    ACTIVITY_LIBRARY_SEARCH_SOURCE,
    /id="activity-source-filter"[\s\S]*aria-describedby=\{sourceFilterDescriptionId\}/
  );
  assert.match(
    ASSIGNMENT_LIST_FILTERS_SOURCE,
    /id="assignment-status-filter"[\s\S]*aria-describedby=\{statusFilterDescriptionId\}/
  );

  assert.match(
    PUBLISH_SETTINGS_FORM_SOURCE,
    /aria-describedby=\{titleHelpId\}/
  );
  assert.match(
    PUBLISH_SETTINGS_FORM_SOURCE,
    /aria-describedby=\{instructionsHelpId\}/
  );
  assert.match(
    PUBLISH_SETTINGS_FORM_SOURCE,
    /aria-describedby=\{maxAttemptsHelpId\}/
  );
  assert.match(
    PUBLISH_SETTINGS_FORM_SOURCE,
    /aria-describedby=\{timeLimitHelpId\}/
  );
  assert.match(
    PUBLISH_SETTINGS_FORM_SOURCE,
    /aria-describedby=\{closeAfterHelpId\}/
  );
  assert.match(
    PUBLISH_SETTINGS_FORM_SOURCE,
    /Switch[\s\S]*aria-describedby=\{descriptionId\}/
  );
  assert.match(PUBLISH_SETTINGS_FORM_SOURCE, /ActivityPublishPreviewContext/);

  assert.match(
    ASSIGNMENT_RESULTS_STUDENT_SEARCH_SOURCE,
    /aria-describedby=\{searchDescriptionIds\}/
  );
  assert.match(
    ASSIGNMENT_RESULTS_STUDENT_SEARCH_SOURCE,
    /aria-describedby=\{sortDescriptionIds\}/
  );
  assert.match(
    ASSIGNMENT_RESULTS_ITEM_SORT_SOURCE,
    /aria-describedby=\{descriptionIds\}/
  );
  assert.match(
    ASSIGNMENT_RESULTS_REVIEW_FILTER_SOURCE,
    /aria-describedby=\{descriptionIds\}/
  );
  assert.match(
    ASSIGNMENT_RESULTS_REVIEW_SCOPE_SOURCE,
    /aria-describedby=\{descriptionId\}[\s\S]*view\.itemViews\.map/
  );
  assert.match(
    ASSIGNMENT_RESULTS_CLASSROOM_BRIEF_SOURCE,
    /AssignmentResultsCopyScopeView[\s\S]*copyScopeView\.itemViews\.map/
  );
  assert.match(
    ASSIGNMENT_RESULTS_HEADER_ACTIONS_SOURCE,
    /exportPreparationView\.itemViews\.map/
  );

  assert.match(
    PRINTABLE_TOOLBAR_SOURCE,
    /id="printable-answer-key"[\s\S]*aria-describedby=\{`\$\{answerKeyDescriptionId\} \$\{answerKeyStatusDescriptionId\}`\}/
  );
  assert.match(
    PRINTABLE_TOOLBAR_SOURCE,
    /aria-describedby=\{printDescriptionId\}/
  );

  assert.match(
    STUDENT_RUNNER_ATTEMPT_SHELL_SOURCE,
    /id="student-name"[\s\S]*aria-describedby=\{studentNameDescriptionId\}/
  );
  assert.match(
    STUDENT_RUNNER_SUBMIT_CONTROLS_SOURCE,
    /aria-describedby=\{buttonDescriptionIds\.join\(' '\)\}/
  );
});

function readSource(path: string) {
  return readFileSync(path, 'utf8');
}

function getHandoffValues(view: ClassroomControlSemanticsHandoffView) {
  return Object.fromEntries(
    view.itemViews.map((itemView) => [itemView.id, itemView.value])
  );
}

function getHandoffValue(
  view: ClassroomControlSemanticsHandoffView,
  id: ClassroomControlSemanticsHandoffItemId
) {
  const itemView = view.itemViews.find((item) => item.id === id);
  assert.ok(itemView, `Missing classroom control semantics item: ${id}`);
  return itemView.value;
}

function assertNoPrivateControlSemanticsText(serialized: string) {
  for (const secret of [
    SECRET_ACTIVITY_CONTENT,
    SECRET_ANSWER_KEY,
    SECRET_ASSIGNMENT_TITLE,
    SECRET_CSV_DATA_URL,
    SECRET_PROMPT,
    SECRET_STUDENT_ANSWER,
    SECRET_STUDENT_NAME,
    SECRET_TOKEN,
  ]) {
    assert.equal(
      serialized.includes(secret),
      false,
      `Leaked private classroom control text: ${secret}`
    );
  }
}
