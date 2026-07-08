import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ASSIGNMENT_RESULT_MATERIAL_HANDOFF_ITEM_IDS,
  buildAssignmentResultActionButtons,
  buildAssignmentResultActionState,
  buildAssignmentResultMaterialHandoffView,
  type AssignmentResultCopyAction,
  type AssignmentResultCopyArtifactPreview,
  type AssignmentResultMaterialHandoffItemId,
  type AssignmentResultMaterialHandoffView,
} from '@/assignments/result-actions';
import {
  ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS,
  type AssignmentResultsExportPreparationView,
} from '@/assignments/results-export';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_COPY_TEXT = 'SECRET_COPY_ARTIFACT_TEXT';
const SECRET_STUDENT_ANSWER = 'SECRET_STUDENT_ANSWER';
const SECRET_TOKEN = 'raw-anonymous-token-value';
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('assignment result material handoff exposes 30 safe teacher-material slices', () => {
  const actionButtons = buildAssignmentResultActionButtons(
    buildAssignmentResultActionState({
      attemptCount: 3,
      classroomBriefReady: true,
      itemCount: 4,
      studentCount: 2,
    })
  );
  const copyScopeView = buildCopyScopeView();
  const exportPreparationView = buildExportPreparationView();
  const handoffView = buildAssignmentResultMaterialHandoffView({
    actionButtons,
    copyArtifactPreviews: buildCopyArtifactPreviews(),
    copyScopeView,
    exportPreparationView,
    printAction: {
      assignmentId: 'assignment-1',
      label: 'Print worksheet',
    },
    reviewStatusView: {
      description: 'Reviewing the filtered class evidence.',
      statusLabel: 'Focused review',
      title: 'Review status',
    },
  });
  const itemIds = handoffView.itemViews.map((itemView) => itemView.id);

  assert.deepEqual(itemIds, [...ASSIGNMENT_RESULT_MATERIAL_HANDOFF_ITEM_IDS]);
  assert.equal(new Set(itemIds).size, 30);
  assert.ok(
    handoffView.itemViews.every(
      (itemView) =>
        itemView.ariaLabel &&
        itemView.description &&
        itemView.label &&
        itemView.value
    )
  );
  assert.deepEqual(handoffView.privacy, {
    exposesCopyArtifactText: false,
    exposesCsvDataUrl: false,
    exposesPublicRunnerContent: false,
    exposesRawAnonymousToken: false,
    exposesStudentAnswerText: false,
    exposesTeacherAnswerKey: false,
    itemIds,
    scope: 'teacher-result-materials',
  });

  assert.equal(getHandoffValue(handoffView, 'review-status'), 'Focused review');
  assert.equal(getHandoffValue(handoffView, 'matched-students'), '2');
  assert.equal(getHandoffValue(handoffView, 'matched-attempts'), '3');
  assert.equal(getHandoffValue(handoffView, 'matched-items'), '4');
  assert.equal(getHandoffValue(handoffView, 'matched-answer-reviews'), '5');
  assert.equal(
    getHandoffValue(handoffView, 'action-export-csv'),
    'Full assignment results | Ready'
  );
  assert.equal(
    getHandoffValue(handoffView, 'preview-copy-brief'),
    'Focus items: 2'
  );
  assert.equal(
    getHandoffValue(handoffView, 'csv-export-preparation'),
    '30 slices'
  );
  assert.equal(getHandoffValue(handoffView, 'csv-delivery-policy'), '7 fields');
  assert.equal(getHandoffValue(handoffView, 'csv-answer-columns'), '9');
  assert.equal(getHandoffValue(handoffView, 'print-worksheet-action'), 'Ready');
  assert.equal(
    getHandoffValue(handoffView, 'data-scope-current-review'),
    'Current review'
  );
  assert.equal(
    getHandoffValue(handoffView, 'data-scope-full-assignment'),
    'Full assignment results'
  );
  assert.equal(getHandoffValue(handoffView, 'snapshot-source'), 'Quiz');
  assert.equal(
    getHandoffValue(handoffView, 'normalized-student-labels'),
    'Protected'
  );
  assert.equal(getHandoffValue(handoffView, 'anonymous-token-guard'), 'Hidden');
  assert.equal(
    getHandoffValue(handoffView, 'copy-artifact-text-guard'),
    'Hidden'
  );
  assert.equal(
    getHandoffValue(handoffView, 'teacher-answer-key-guard'),
    'Hidden'
  );

  assertNoPrivateMaterialHandoffText(JSON.stringify(handoffView));
});

test('assignment result material handoff renders stable page markers', () => {
  const source = readFileSync(
    'src/components/assignments/assignment-results-header-actions.tsx',
    'utf8'
  );

  assert.match(
    source,
    /function AssignmentResultsMaterialHandoff[\s\S]*const titleId = 'assignment-results-material-handoff-title'[\s\S]*const descriptionId = 'assignment-results-material-handoff-description'[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-labelledby=\{titleId\}[\s\S]*className="sr-only"[\s\S]*data-handoff="assignment-result-material"[\s\S]*data-handoff-scope=\{materialHandoffView\.privacy\.scope\}[\s\S]*id=\{titleId\}[\s\S]*id=\{descriptionId\}[\s\S]*<dl>[\s\S]*materialHandoffView\.itemViews\.map[\s\S]*AssignmentResultsMaterialHandoffItem[\s\S]*function AssignmentResultsMaterialHandoffItem[\s\S]*itemView: AssignmentResultMaterialHandoffView\['itemViews'\]\[number\][\s\S]*const labelId = `assignment-result-material-handoff-\$\{itemView\.id\}-label`[\s\S]*const valueId = `assignment-result-material-handoff-\$\{itemView\.id\}-value`[\s\S]*const descriptionId =[\s\S]*`assignment-result-material-handoff-\$\{itemView\.id\}-description`[\s\S]*data-handoff-item=\{itemView\.id\}[\s\S]*data-scope=\{itemView\.dataScope\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{itemView\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/,
    'Assignment result material handoff should expose the localized result-page marker, privacy scope, item ids, data scopes, and stable label/value/description relationships.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /\|\s*6a\s*\|\s*Result materials expose a 30-slice handoff\s*\|[\s\S]*`assignment-result-material`[\s\S]*`dl\/dt\/dd`[\s\S]*label\/value\/description[\s\S]*`data-handoff-item`/,
    'E2E catalog should document the result-material hidden semantic structure and stable item markers.'
  );
});

function buildCopyScopeView() {
  return {
    description:
      'Current copy artifacts use the active search, sort, and review filter.',
    itemViews: [
      {
        description: 'Student scan order is filtered by search.',
        id: 'students',
        label: 'Students',
        value: '2 students',
      },
      {
        description: 'Item performance uses the selected sort.',
        id: 'items',
        label: 'Items',
        value: 'Lowest accuracy',
      },
      {
        description: 'Answer cards use the selected review filter.',
        id: 'review',
        label: 'Review',
        value: 'Needs review',
      },
    ],
    summaryItems: [
      buildScopeSummaryItem('students', 'Students', '2'),
      buildScopeSummaryItem('attempts', 'Attempts', '3'),
      buildScopeSummaryItem('items', 'Items', '4'),
      buildScopeSummaryItem('answer-reviews', 'Answer reviews', '5'),
    ],
    title: 'Copy scope',
  } satisfies Parameters<
    typeof buildAssignmentResultMaterialHandoffView
  >[0]['copyScopeView'];
}

function buildScopeSummaryItem(
  id: 'answer-reviews' | 'attempts' | 'items' | 'students',
  label: string,
  value: string
) {
  return {
    ariaLabel: `${label}: ${value}`,
    description: `${label} included in the current review scope.`,
    id,
    label,
    value,
  };
}

function buildCopyArtifactPreviews(): AssignmentResultCopyArtifactPreview[] {
  return (
    [
      ['copy-brief', 'Copy brief', 'Focus items: 2'],
      ['copy-reteach-plan', 'Copy reteach plan', 'Review items: 4'],
      ['copy-item-review', 'Copy item review', 'Reviewed items: 4'],
      ['copy-follow-up', 'Copy follow-up', 'Students: 2'],
    ] as const
  ).map(([action, label, summaryLabel]) =>
    buildCopyArtifactPreview(action, label, summaryLabel)
  );
}

function buildCopyArtifactPreview(
  action: AssignmentResultCopyAction,
  label: string,
  summaryLabel: string
): AssignmentResultCopyArtifactPreview {
  return {
    action,
    actionButtonId: `${action}:current-review`,
    copyScopeView: buildCopyScopeView(),
    dataScope: 'current-review',
    description: `${label} preview is ready.`,
    id: `preview:${action}`,
    label,
    metaItems: [],
    summaryLabel,
    text: `${SECRET_COPY_TEXT}: ${SECRET_STUDENT_ANSWER}`,
  };
}

function buildExportPreparationView(): AssignmentResultsExportPreparationView {
  return {
    description: 'Full export coverage.',
    itemViews: ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS.map((id) => ({
      ariaLabel: `${id}: ${getExportPreparationValue(id)}.`,
      description: `${id} coverage.`,
      id,
      label: id,
      value: getExportPreparationValue(id),
    })),
    privacy: {
      exposesCopyArtifactText: false,
      exposesCsvDataUrl: false,
      exposesRawAnonymousToken: false,
      exposesStudentAnswerText: false,
      exposesTeacherAnswerText: false,
      itemIds: [...ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS],
      scope: 'full-assignment-results',
    },
    title: 'CSV export coverage',
  };
}

function getExportPreparationValue(
  id: (typeof ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS)[number]
) {
  if (id === 'activity-snapshot') return 'Quiz';
  if (id === 'answer-rows') return '9';
  if (id === 'student-privacy') return 'Protected';
  return 'Prepared';
}

function getHandoffValue(
  view: AssignmentResultMaterialHandoffView,
  id: AssignmentResultMaterialHandoffItemId
) {
  const itemView = view.itemViews.find((item) => item.id === id);
  assert.ok(itemView, `Missing material handoff item ${id}`);
  return itemView.value;
}

function assertNoPrivateMaterialHandoffText(serializedView: string) {
  for (const privateValue of [
    SECRET_COPY_TEXT,
    SECRET_STUDENT_ANSWER,
    SECRET_TOKEN,
    'data:text/csv',
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Material handoff leaked private text: ${privateValue}`
    );
  }
}
