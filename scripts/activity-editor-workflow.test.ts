import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVITY_EDITOR_WORKFLOW_STEP_IDS,
  buildActivityCreatePageEditorViewModel,
  buildActivityEditorWorkflowView,
  getActivityEditorWorkflowStepView,
} from '@/activities/editor';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const CREATE_ROUTE_SOURCE = readFileSync('src/routes/create.tsx', 'utf8');
const ACTIVITY_CREATE_FORM_SOURCE = readFileSync(
  'src/components/activities/activity-create-form.tsx',
  'utf8'
);

test('activity editor workflow exposes 5 shared steps', () => {
  const workflowView = buildActivityEditorWorkflowView();

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
});

test('activity create page and form consume the shared workflow view', () => {
  const pageView = buildActivityCreatePageEditorViewModel('line-match');

  assert.equal(pageView.workflow.steps.length, 5);
  assert.equal(
    getActivityEditorWorkflowStepView(pageView.workflow, 'review').href,
    '#activity-template-readiness'
  );
  // The form sections carry the step titles; a separate step bar above the
  // form repeated them.
  assert.doesNotMatch(CREATE_ROUTE_SOURCE, /<WorkflowNav\b/);
  assert.match(
    ACTIVITY_CREATE_FORM_SOURCE,
    /buildActivityEditorWorkflowView\(\)[\s\S]*getActivityEditorWorkflowStepView\(workflowView, 'frame'\)[\s\S]*getActivityEditorWorkflowStepView\([\s\S]*'ai-draft'[\s\S]*getActivityEditorWorkflowStepView\(workflowView, 'content'\)[\s\S]*getActivityEditorWorkflowStepView\([\s\S]*'source-materials'[\s\S]*getActivityEditorWorkflowStepView\(workflowView, 'review'\)/
  );
  assert.doesNotMatch(
    CREATE_ROUTE_SOURCE,
    /const items = \[[\s\S]*activity_form_step_frame_title/
  );
});
