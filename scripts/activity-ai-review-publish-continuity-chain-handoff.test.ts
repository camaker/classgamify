import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVITY_AI_REVIEW_PUBLISH_CONTINUITY_CHAIN_SOURCE_FILES,
  ACTIVITY_AI_REVIEW_PUBLISH_CONTINUITY_CHAIN_STAGES,
  buildActivityAiReviewPublishContinuityChainView,
} from '@/activities/activity-ai-review-publish-continuity-chain';

const read = (path: string) => readFileSync(path, 'utf8');

test('AI review publish continuity carries 30 unique stages', () => {
  const view = buildActivityAiReviewPublishContinuityChainView();
  assert.equal(ACTIVITY_AI_REVIEW_PUBLISH_CONTINUITY_CHAIN_STAGES.length, 30);
  assert.equal(
    new Set(
      ACTIVITY_AI_REVIEW_PUBLISH_CONTINUITY_CHAIN_STAGES.map(
        (stage) => stage.id
      )
    ).size,
    30
  );
  assert.deepEqual(view.sourceContracts, {
    authoring: 30,
    editorReview: 30,
    fallback: 30,
    lifecycle: 30,
    publish: 30,
    save: 30,
  });
});

test('AI review publish continuity keeps a real 30-file boundary', () => {
  const view = buildActivityAiReviewPublishContinuityChainView();
  assert.equal(
    ACTIVITY_AI_REVIEW_PUBLISH_CONTINUITY_CHAIN_SOURCE_FILES.length,
    30
  );
  assert.equal(
    new Set(ACTIVITY_AI_REVIEW_PUBLISH_CONTINUITY_CHAIN_SOURCE_FILES).size,
    30
  );
  for (const path of ACTIVITY_AI_REVIEW_PUBLISH_CONTINUITY_CHAIN_SOURCE_FILES)
    assert.ok(existsSync(path), path);
  assert.equal(view.privacy.sourceFileCount, 30);
});

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

test('AI continuity protects snapshots and public payloads', () => {
  const lifecycle = read('src/activities/ai-enhancement-lifecycle-chain.ts');
  assert.match(lifecycle, /protectedSnapshotCount/);
  assert.match(lifecycle, /canCreateAssignmentLink/);
  assert.match(lifecycle, /exposesAnswerKeysToPublicPayload: false/);
});

test('AI review publish aggregate hides source draft and classroom secrets', () => {
  const privacy = buildActivityAiReviewPublishContinuityChainView().privacy;
  assert.equal(privacy.requiresTeacherReview, true);
  assert.equal(privacy.requiresTeacherSave, true);
  assert.equal(privacy.preservesExistingAssignmentSnapshots, true);
  for (const [key, value] of Object.entries(privacy))
    if (
      key.startsWith('exposes') ||
      key.startsWith('creates') ||
      key.startsWith('persists')
    )
      assert.equal(value, false, key);
});

test('product and catalog register AI review publish continuity', () => {
  assert.match(
    read('docs/product.md'),
    /AI review-to-publish continuity chain[\s\S]*30[\s\S]*editor[\s\S]*save[\s\S]*snapshot[\s\S]*privacy/i
  );
  assert.match(
    read('tests/e2e/TEST-CATALOG.md'),
    /activity-ai-review-publish-continuity-chain-handoff\.test\.ts[\s\S]*30-stage source-level contract/i
  );
});
