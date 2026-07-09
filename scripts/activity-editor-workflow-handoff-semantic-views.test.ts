import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVITY_EDITOR_WORKFLOW_HANDOFF_ITEM_IDS,
  ACTIVITY_EDITOR_WORKFLOW_STEP_IDS,
  buildActivityCreatePageEditorViewModel,
  buildActivityEditorWorkflowView,
  getActivityEditorWorkflowStepView,
} from '@/activities/editor';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const PRIVATE_PROMPT = 'PRIVATE_PROMPT_TEXT';
const PRIVATE_ANSWER = 'PRIVATE_ANSWER_TEXT';
const PRIVATE_TEACHER_NOTE = 'PRIVATE_TEACHER_NOTE_TEXT';
const PRIVATE_RAW_INPUT = '{"questionsText":"PRIVATE_PROMPT_TEXT"}';
const PRIVATE_FILE_ID = 'file_private_123';
const PRIVATE_STORAGE_KEY = 'source-materials/private/key.pdf';

const CREATE_ROUTE_SOURCE = readFileSync('src/routes/create.tsx', 'utf8');
const ACTIVITY_CREATE_FORM_SOURCE = readFileSync(
  'src/components/activities/activity-create-form.tsx',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('activity editor workflow exposes 5 shared steps and 30 safe slices', () => {
  const workflowView = buildActivityEditorWorkflowView();
  const itemIds = workflowView.handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(
    workflowView.steps.map((step) => step.id),
    [...ACTIVITY_EDITOR_WORKFLOW_STEP_IDS]
  );
  assert.deepEqual(
    workflowView.steps.map((step) => [
      step.id,
      step.number,
      step.sectionId,
      step.href,
      step.icon,
      step.title,
    ]),
    [
      [
        'frame',
        1,
        'activity-editor-frame',
        '#activity-editor-frame',
        'pencil',
        'Set the activity frame',
      ],
      [
        'ai-draft',
        2,
        'activity-editor-ai-draft',
        '#activity-editor-ai-draft',
        'sparkles',
        'Draft from material',
      ],
      [
        'content',
        3,
        'activity-editor-content',
        '#activity-editor-content',
        'clipboard-list',
        'Edit reusable content',
      ],
      [
        'source-materials',
        4,
        'activity-editor-source-materials',
        '#activity-editor-source-materials',
        'paperclip',
        'Attach source materials',
      ],
      [
        'review',
        5,
        'activity-template-readiness',
        '#activity-template-readiness',
        'layout-grid',
        'Review before saving',
      ],
    ]
  );
  assert.deepEqual(itemIds, [...ACTIVITY_EDITOR_WORKFLOW_HANDOFF_ITEM_IDS]);
  assert.equal(new Set(itemIds).size, 30);
  assert.deepEqual(workflowView.handoffView.privacy, {
    createsAssignmentLinks: false,
    exposesAnswerText: false,
    exposesPromptText: false,
    exposesRawEditorInput: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialStorageKeys: false,
    exposesTeacherNotesText: false,
    itemIds,
    mutatesActivity: false,
    persistsActivityWithoutTeacherSave: false,
    publishesAssignment: false,
    scope: 'activity-editor-workflow',
    usesCreateActivityInputContract: true,
  });
  assert.deepEqual(
    workflowView.handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['workflow-source', 'editor.ts'],
      ['step-count', '5 steps'],
      [
        'workflow-order',
        'frame -> ai-draft -> content -> source-materials -> review',
      ],
      ['create-page-surface', 'Create page'],
      ['edit-page-surface', 'Create/edit form'],
      ['nav-surface', 'Shared step nav'],
      ['form-section-surface', 'ActivityCreateForm'],
      ['side-preview-surface', 'Template + preview aside'],
      ['frame-section', 'Set the activity frame'],
      ['primary-fields', 'ActivityEditorPrimaryFields'],
      ['template-handoff', 'ActivityEditorTemplateHandoffView'],
      ['scaffold-panel', 'Template scaffold'],
      ['ai-draft-section', 'Draft from material'],
      ['ai-source-state', 'ActivityEditorAiDraftPanelView'],
      ['ai-sync-action', 'Source material sync'],
      ['content-section', 'Edit reusable content'],
      ['details-fields', 'ActivityEditorDetailsFields'],
      ['structured-content-fields', 'ActivityEditorStructuredContentFields'],
      ['source-materials-section', 'Attach source materials'],
      ['material-picker', 'Source material picker'],
      ['review-section', 'Review before saving'],
      ['readiness-panel', 'Template readiness'],
      ['save-footer', 'Save action footer'],
      ['auth-gate', 'Teacher sign-in required'],
      ['input-contract', 'CreateActivityInput'],
      ['template-readiness-contract', 'TemplateRemixPlan'],
      ['ai-editor-boundary', 'Draft fills editor only'],
      ['source-privacy-boundary', 'Private materials hidden'],
      ['publish-boundary', 'Save before publish'],
      ['privacy-guard', 'Private classroom text hidden'],
    ]
  );
  assertNoPrivateWorkflowText(JSON.stringify(workflowView.handoffView));
});

test('activity create page and form consume the shared workflow view', () => {
  const pageView = buildActivityCreatePageEditorViewModel('line-match');

  assert.equal(pageView.workflow.steps.length, 5);
  assert.equal(
    getActivityEditorWorkflowStepView(pageView.workflow, 'review').href,
    '#activity-template-readiness'
  );
  assert.match(
    CREATE_ROUTE_SOURCE,
    /<WorkflowNav workflow=\{pageView\.workflow\} \/>[\s\S]*<ActivityEditorWorkflowHandoff[\s\S]*handoffView=\{pageView\.workflow\.handoffView\}/
  );
  assert.match(
    CREATE_ROUTE_SOURCE,
    /ActivityEditorWorkflowHandoffView[\s\S]*function ActivityEditorWorkflowHandoff[\s\S]*const titleId = 'activity-editor-workflow-handoff-title'[\s\S]*const descriptionId = 'activity-editor-workflow-handoff-description'[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-labelledby=\{titleId\}[\s\S]*className="sr-only"[\s\S]*data-handoff="activity-editor-workflow"[\s\S]*data-handoff-scope=\{handoffView\.privacy\.scope\}[\s\S]*id=\{titleId\}[\s\S]*id=\{descriptionId\}[\s\S]*handoffView\.itemViews\.map[\s\S]*ActivityEditorWorkflowHandoffItem[\s\S]*function ActivityEditorWorkflowHandoffItem[\s\S]*item: ActivityEditorWorkflowHandoffView\['itemViews'\]\[number\][\s\S]*const labelId = `activity-editor-workflow-handoff-\$\{item\.id\}-label`[\s\S]*const valueId = `activity-editor-workflow-handoff-\$\{item\.id\}-value`[\s\S]*const descriptionId =[\s\S]*`activity-editor-workflow-handoff-\$\{item\.id\}-description`[\s\S]*data-handoff-item=\{item\.id\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{item\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/
  );
  assert.match(
    ACTIVITY_CREATE_FORM_SOURCE,
    /buildActivityEditorWorkflowView\(\)[\s\S]*getActivityEditorWorkflowStepView\(workflowView, 'frame'\)[\s\S]*getActivityEditorWorkflowStepView\([\s\S]*'ai-draft'[\s\S]*getActivityEditorWorkflowStepView\(workflowView, 'content'\)[\s\S]*getActivityEditorWorkflowStepView\([\s\S]*'source-materials'[\s\S]*getActivityEditorWorkflowStepView\(workflowView, 'review'\)/
  );
  assert.doesNotMatch(
    CREATE_ROUTE_SOURCE,
    /const items = \[[\s\S]*activity_form_step_frame_title/
  );
});

test('activity editor workflow focused gate is documented', () => {
  const normalizedCatalog = TEST_CATALOG_SOURCE.replace(/\s+/g, ' ');

  assert.match(
    TEST_CATALOG_SOURCE,
    /pnpm exec tsx --test scripts\/activity-editor-workflow-handoff-semantic-views\.test\.ts/
  );
  for (const boundary of [
    'page layout',
    'workflow navigation',
    'form sections',
    'AI draft boundaries',
    'source-material safety',
    'readiness review',
    'save gating',
    'CreateActivityInput contracts',
    'template-readiness contracts',
    'publish boundaries',
    'activity-editor-workflow privacy-scope boundaries',
    'hidden activity-editor-workflow handoff',
  ]) {
    assert.match(normalizedCatalog, new RegExp(boundary));
  }
});

test('activity editor workflow handoff localizes Chinese boundaries', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const workflowView = buildActivityEditorWorkflowView();
    const valueById = new Map(
      workflowView.handoffView.itemViews.map((item) => [item.id, item.value])
    );

    assert.equal(workflowView.handoffView.title, '活动编辑器工作流交接');
    assert.equal(workflowView.steps[0]?.title, '确定活动框架');
    assert.equal(workflowView.steps[1]?.title, '从素材起草');
    assert.equal(valueById.get('step-count'), '5 个步骤');
    assert.equal(valueById.get('create-page-surface'), '创建页');
    assert.equal(valueById.get('ai-sync-action'), '来源素材同步');
    assert.equal(valueById.get('ai-editor-boundary'), '草稿只填入编辑器');
    assert.equal(valueById.get('source-privacy-boundary'), '私有素材隐藏');
    assert.equal(valueById.get('publish-boundary'), '先保存再发布');
    assert.equal(valueById.get('privacy-guard'), '私密课堂文本隐藏');
    assertNoPrivateWorkflowText(JSON.stringify(workflowView.handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

function assertNoPrivateWorkflowText(serializedView: string) {
  for (const privateValue of [
    PRIVATE_PROMPT,
    PRIVATE_ANSWER,
    PRIVATE_TEACHER_NOTE,
    PRIVATE_RAW_INPUT,
    PRIVATE_FILE_ID,
    PRIVATE_STORAGE_KEY,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Activity editor workflow handoff leaked private text: ${privateValue}`
    );
  }
}
