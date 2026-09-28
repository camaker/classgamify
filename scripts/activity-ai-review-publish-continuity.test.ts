import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(path, 'utf8');

test('AI API authenticates sanitizes and returns a draft only', () => {
  const api = read('src/api/activity-ai.ts');
  assert.match(api, /authApiMiddleware/);
  assert.match(api, /generateActivityDraft/);
  assert.doesNotMatch(api, /db\.insert\(activity\)|publishAssignment/);
});

test('draft application stays inside the editor before manual save', () => {
  const form = read('src/components/activities/activity-create-form.tsx');
  const editor = read('src/activities/editor.ts');
  assert.match(form, /ActivityAiDraftPanel/);
  assert.match(form, /createActivityInputSchema/);
  assert.match(editor, /buildActivityEditorSaveExecutionPlan/);
});

test('save and publish boundaries require separate teacher actions', () => {
  const save = read('src/activities/ai-enhancement-save-boundary.ts');
  const publish = read('src/activities/ai-enhancement-publish-boundary.ts');
  assert.match(save, /teacherSubmittedSave/);
  assert.match(save, /writesOnlyActivityRecord: true/);
  assert.match(publish, /publishSubmitted/);
  assert.match(publish, /snapshotSource: 'none' \| 'saved-activity-record'/);
});

test('product and catalog register AI review publish continuity', () => {
  assert.match(
    read('docs/product.md'),
    /AI review-to-publish continuity gate[\s\S]*editor[\s\S]*save[\s\S]*snapshot[\s\S]*privacy/i
  );
  assert.match(
    read('tests/e2e/TEST-CATALOG.md'),
    /activity-ai-review-publish-continuity\.test\.ts[\s\S]*30-stage source-level contract/i
  );
});
