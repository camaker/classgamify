import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { ACTIVITY_AI_ENHANCEMENT_DRAFT_APPLICATION_ITEM_IDS } from '@/activities/ai-enhancement-draft-application';
import { ACTIVITY_AI_ENHANCEMENT_DRAFT_OUTPUT_ITEM_IDS } from '@/activities/ai-enhancement-draft-output';
import { ACTIVITY_AI_ENHANCEMENT_EDITOR_REVIEW_CHECK_IDS } from '@/activities/ai-enhancement-editor-review';
import { ACTIVITY_AI_ENHANCEMENT_EXECUTION_ITEM_IDS } from '@/activities/ai-enhancement-execution';
import { ACTIVITY_AI_ENHANCEMENT_POLICY_ITEM_IDS } from '@/activities/ai-enhancement-policy';
import { ACTIVITY_AI_ENHANCEMENT_PUBLISH_BOUNDARY_ITEM_IDS } from '@/activities/ai-enhancement-publish-boundary';
import { ACTIVITY_AI_ENHANCEMENT_SAVE_BOUNDARY_ITEM_IDS } from '@/activities/ai-enhancement-save-boundary';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('activity AI enhancement lifecycle chain is backed by focused gates', () => {
  assert.deepEqual(
    [
      ACTIVITY_AI_ENHANCEMENT_POLICY_ITEM_IDS.length,
      ACTIVITY_AI_ENHANCEMENT_EXECUTION_ITEM_IDS.length,
      ACTIVITY_AI_ENHANCEMENT_DRAFT_OUTPUT_ITEM_IDS.length,
      ACTIVITY_AI_ENHANCEMENT_DRAFT_APPLICATION_ITEM_IDS.length,
      ACTIVITY_AI_ENHANCEMENT_EDITOR_REVIEW_CHECK_IDS.length,
      ACTIVITY_AI_ENHANCEMENT_SAVE_BOUNDARY_ITEM_IDS.length,
      ACTIVITY_AI_ENHANCEMENT_PUBLISH_BOUNDARY_ITEM_IDS.length,
    ],
    [30, 30, 30, 30, 12, 30, 30]
  );
});

test('activity AI enhancement lifecycle chain gate is wired into docs and catalog', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /Activity AI enhancement lifecycle chain has a fast script-level gate via[\s\S]*scripts\/activity-ai-enhancement-lifecycle-chain\.test\.ts[\s\S]*policy-to-publish ordering[\s\S]*draft output handoffs[\s\S]*teacher review[\s\S]*manual save[\s\S]*assignment\s+publish actions[\s\S]*share-link\/snapshot boundaries[\s\S]*result-export continuity/,
    'TEST-CATALOG should document the AI enhancement lifecycle chain gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /assignment\s+publish\s+actions[\s\S]*result-export\s+continuity/,
    'TEST-CATALOG should document the assignment publish and result-export stages.'
  );
});
