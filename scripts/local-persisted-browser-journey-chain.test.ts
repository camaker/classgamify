import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');
const ACTIVITY_AUTHORING_SPEC_SOURCE = readFileSync(
  'tests/e2e/specs/activity-authoring.spec.ts',
  'utf8'
);

test('local persisted browser journey preserves the product requirement', () => {
  assert.match(
    PRODUCT_SOURCE,
    /The local persisted browser journey should complete this same teacher loop[\s\S]*save an activity,[\s\S]*publish an assignment,[\s\S]*submit a student attempt,[\s\S]*review and filter the result,[\s\S]*copy a classroom brief,[\s\S]*download the full CSV,[\s\S]*open the printable worksheet,[\s\S]*teacher answer key,[\s\S]*return to results/i,
    'docs/product.md should preserve the complete local persisted browser journey.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /result-material,[\s\S]*result-review,[\s\S]*copy-artifact,[\s\S]*printable-worksheet 30-slice handoffs/i,
    'docs/product.md should keep the rendered DOM handoffs tied to the journey.'
  );
});

test('local persisted browser journey spec covers save through return', () => {
  assert.match(
    ACTIVITY_AUTHORING_SPEC_SOURCE,
    /test\('publishes a saved activity from the saved panel'/,
    'The activity-authoring spec should own the persisted browser journey.'
  );
  assert.match(
    ACTIVITY_AUTHORING_SPEC_SOURCE,
    /cleanupE2EUsers[\s\S]*registerE2EUser[\s\S]*loginByForm/,
    'The journey should isolate local e2e users before authenticating.'
  );
  assert.match(
    ACTIVITY_AUTHORING_SPEC_SOURCE,
    /saveActivityFromCreatePage[\s\S]*Publish assignment[\s\S]*Assignment published[\s\S]*Open link/i,
    'The journey should save an activity, publish it, and open the generated student link.'
  );
  assert.match(
    ACTIVITY_AUTHORING_SPEC_SOURCE,
    /Student name[\s\S]*1\/2 answered[\s\S]*Submit anyway[\s\S]*2\/2 answered[\s\S]*Score submitted[\s\S]*Start another attempt/i,
    'The journey should exercise student identity, partial-submit confirmation, scoring, and retry state.'
  );
  assert.match(
    ACTIVITY_AUTHORING_SPEC_SOURCE,
    /Copy & export[\s\S]*locator\('\[data-handoff\]'\)\)\.toHaveCount\(0\)[\s\S]*Scope status: Adjusted[\s\S]*Copy brief/,
    'The journey should verify the results page renders no hidden audit sections, shows visible scope badges, then copies through the Copy & export menu.'
  );
  assert.match(
    ACTIVITY_AUTHORING_SPEC_SOURCE,
    /Find student[\s\S]*Sort students[\s\S]*Sort items[\s\S]*Review view[\s\S]*Scope status: Adjusted[\s\S]*toHaveCount\(4\)/,
    'The journey should verify result filter URL state and the visible Adjusted scope badges.'
  );
  assert.match(
    ACTIVITY_AUTHORING_SPEC_SOURCE,
    /clipboard-read[\s\S]*Copy brief[\s\S]*navigator\.clipboard\.readText/,
    'The journey should verify classroom brief copy through the real clipboard.'
  );
  assert.match(
    ACTIVITY_AUTHORING_SPEC_SOURCE,
    /waitForEvent\('download'\)[\s\S]*Download CSV[\s\S]*classgamify-\.\*-results\\\.csv[\s\S]*student_answer/,
    'The journey should verify full CSV download contents.'
  );
  assert.match(
    ACTIVITY_AUTHORING_SPEC_SOURCE,
    /Print worksheet[\s\S]*Hidden by default[\s\S]*toHaveCount\(0\)[\s\S]*Include answer key[\s\S]*answerKey=true[\s\S]*Teacher-only key included[\s\S]*Back to results/,
    'The journey should verify printable worksheet, explicit answer-key state, and return-to-results navigation.'
  );
  assert.match(
    ACTIVITY_AUTHORING_SPEC_SOURCE,
    /expectNoBrowserErrors\(monitor,[\s\S]*publish assignment from saved panel/,
    'The journey should finish with browser health verification.'
  );
});

test('local persisted browser journey focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /Local persisted browser journey chain has a fast script-level gate via[\s\S]*scripts\/local-persisted-browser-journey-chain\.test\.ts/,
    'TEST-CATALOG should document the local persisted browser journey gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE.replace(/\s+/g, ' '),
    /saved activity[\s\S]*published assignment[\s\S]*student attempt[\s\S]*result filters[\s\S]*classroom brief[\s\S]*CSV[\s\S]*printable worksheet[\s\S]*answer key[\s\S]*return-to-results/,
    'TEST-CATALOG should describe the full persisted browser journey scope.'
  );
});
