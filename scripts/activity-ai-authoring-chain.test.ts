import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { ACTIVITY_DRAFT_REVIEW_STATE } from '@/activities/ai-draft';
import { ACTIVITY_SOURCE_MATERIAL_READINESS_CAPABILITIES } from '@/activities/material-summary';

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const ACTIVITY_AI_API_SOURCE = readFileSync('src/api/activity-ai.ts', 'utf8');
const AI_DRAFT_SOURCE = readFileSync('src/activities/ai-draft.ts', 'utf8');
const DRAFT_SOURCE_SOURCE = readFileSync(
  'src/activities/draft-source.ts',
  'utf8'
);
const EDITOR_SOURCE = readFileSync('src/activities/editor.ts', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('activity AI authoring chain stays backed by focused gates', () => {
  assert.deepEqual(ACTIVITY_DRAFT_REVIEW_STATE, {
    applicationMode: 'editor-review',
    persistenceMode: 'not-persisted',
    reviewRequired: true,
  });
  assert.deepEqual(ACTIVITY_SOURCE_MATERIAL_READINESS_CAPABILITIES, [
    'audio-extraction',
    'worksheet-extraction',
    'spreadsheet-import',
  ]);
});

test('activity AI authoring sources preserve auth, fallback, and review boundaries', () => {
  assert.match(
    PRODUCT_SOURCE,
    /AI-assisted creation drafts teacher-reviewable `CreateActivityInput` payloads[\s\S]*must not bypass the activity editor or persist content directly[\s\S]*must not read file bytes, storage keys[\s\S]*deterministic local draft/,
    'docs/product.md should define the teacher-reviewed AI authoring boundary.'
  );
  assert.match(
    ACTIVITY_AI_API_SOURCE,
    /createServerFn\(\{ method: 'POST' \}\)[\s\S]*\.validator\(generateActivityDraftInputSchema\)[\s\S]*\.middleware\(\[authApiMiddleware\]\)[\s\S]*generateActivityDraftFromAi\(data\)/,
    'generateActivityDraft should stay authenticated and schema-validated before calling the draft service.'
  );
  assert.match(
    AI_DRAFT_SOURCE,
    /generateActivityDraftInputSchema\.parse\(input\)[\s\S]*!hasWorkersAiCredentials\(\)[\s\S]*createFallbackActivityDraftResult\(\{[\s\S]*notice: m\.activity_ai_notice_missing_credentials\(\)[\s\S]*runWorkersAi/,
    'AI draft generation should return deterministic fallback output when provider credentials are missing.'
  );
  assert.match(
    AI_DRAFT_SOURCE,
    /parseAiDraftResponse\(result\.response, data\)[\s\S]*catch \{[\s\S]*createFallbackActivityDraftResult\(\{[\s\S]*notice: m\.activity_ai_notice_invalid_draft\(\)/,
    'Invalid provider JSON should fall back to the deterministic draft contract.'
  );
  assert.match(
    AI_DRAFT_SOURCE,
    /buildActivityDraftPrompt[\s\S]*sanitizeActivityDraftSourceTextForAi\(data\.sourceText\)[\s\S]*m\.activity_ai_prompt_source_notes\(\{ sourceText: safeSourceText \}\)/,
    'AI prompts should use sanitized teacher source notes.'
  );
  assert.match(
    AI_DRAFT_SOURCE,
    /createFallbackActivityDraft[\s\S]*sanitizeActivityDraftSourceTextForAi\(data\.sourceText\)[\s\S]*sourceSummary/,
    'Fallback drafts should summarize sanitized source text.'
  );
  assert.match(
    AI_DRAFT_SOURCE,
    /buildFallbackActivityDraftSourceTermPlan[\s\S]*sanitizeActivityDraftSourceTextForAi\(data\.sourceText\)[\s\S]*sourceMaterialNotesDetected[\s\S]*sourceMaterialNotesOmitted/,
    'Fallback source-term planning should detect and omit source-material notes from the AI term contract.'
  );
});

test('activity AI authoring privacy contracts stay explicit across surfaces', () => {
  assert.match(
    DRAFT_SOURCE_SOURCE,
    /sanitizeActivityDraftSourceTextForAi\(sourceText: string\)[\s\S]*removeActivitySourceMaterialDraftNotes\(sourceText\)[\s\S]*normalizeActivityDraftSourceText/,
    'Draft source sanitization should remove source-material note blocks before AI prompt text is used.'
  );
  assert.match(
    EDITOR_SOURCE,
    /buildActivityEditorDraftGenerationGate[\s\S]*buildActivityEditorDraftGenerationExecutionPlan[\s\S]*buildActivityEditorSaveGate[\s\S]*buildActivityEditorSaveExecutionPlan/,
    'Editor generation and save plans should keep separate review gates around AI output and persistence.'
  );
});

test('activity AI authoring chain focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /Activity AI authoring chain has a fast script-level gate via[\s\S]*scripts\/activity-ai-authoring-chain\.test\.ts/,
    'TEST-CATALOG should document the activity AI authoring chain gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /source safety[\s\S]*deterministic fallback[\s\S]*CreateActivityInput[\s\S]*template readiness[\s\S]*editor review[\s\S]*save\/publish boundaries/,
    'TEST-CATALOG should document the source-to-editor AI authoring chain scope.'
  );
});
