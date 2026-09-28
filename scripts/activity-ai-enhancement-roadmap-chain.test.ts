import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const AI_API_SOURCE = readFileSync('src/api/activity-ai.ts', 'utf8');
const AI_DRAFT_SOURCE = readFileSync('src/activities/ai-draft.ts', 'utf8');
const DRAFT_SOURCE_SOURCE = readFileSync(
  'src/activities/draft-source.ts',
  'utf8'
);
const RESULTS_EXPORT_SOURCE = readFileSync(
  'src/assignments/results-export.ts',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('activity AI enhancement roadmap sources preserve editor-review execution policy', () => {
  assert.match(
    PRODUCT_SOURCE,
    /AI-assisted creation drafts teacher-reviewable `CreateActivityInput` payloads[\s\S]*must not bypass the activity editor or persist content directly/,
    'docs/product.md should keep AI creation inside teacher-reviewed drafts.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /Future AI enhancement work follows the same execution boundary[\s\S]*template\s+transforms[\s\S]*distractor\s+generation[\s\S]*leveled variants[\s\S]*answer\s+explanations[\s\S]*listening\s+scripts[\s\S]*worksheet\s+extraction[\s\S]*CreateActivityInput[\s\S]*must not create assignment links[\s\S]*mutate existing assignment snapshots[\s\S]*read\s+source-material file bytes or storage keys/,
    'docs/product.md should define the future AI enhancement execution boundary.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /AI enhancements: source-to-activity drafts, template transforms, distractor\s+generation, leveled variants, answer explanations, listening scripts, and\s+worksheet extraction from teacher-uploaded material\./,
    'docs/product.md should keep the near-term AI enhancement roadmap explicit.'
  );
  assert.match(
    AI_API_SOURCE,
    /createServerFn\(\{ method: 'POST' \}\)[\s\S]*\.validator\(generateActivityDraftInputSchema\)[\s\S]*\.middleware\(\[authApiMiddleware\]\)[\s\S]*generateActivityDraftFromAi\(data\)/,
    'AI draft generation should remain authenticated and schema validated.'
  );
  assert.match(
    AI_DRAFT_SOURCE,
    /generateActivityDraftInputSchema\.parse\(input\)[\s\S]*createFallbackActivityDraftResult[\s\S]*parseAiDraftResponse/,
    'AI draft service should keep schema parsing, fallback, and provider parsing connected.'
  );
  assert.match(
    DRAFT_SOURCE_SOURCE,
    /sanitizeActivityDraftSourceTextForAi\(sourceText: string\)[\s\S]*removeActivitySourceMaterialDraftNotes\(sourceText\)/,
    'Draft source sanitization should strip source-material note blocks before provider prompts.'
  );
});

test('activity AI enhancement roadmap sources preserve output targets and privacy guards', () => {
  assert.match(
    RESULTS_EXPORT_SOURCE,
    /deliveryView\.closeTime,[\s\S]*deliveryView\.policyText,[\s\S]*deliveryView\.identityMode,[\s\S]*deliveryView\.answerReveal,[\s\S]*deliveryView\.itemOrder,[\s\S]*deliveryView\.maxAttempts,[\s\S]*deliveryView\.timeLimitSeconds/,
    'Result CSV exports should keep delivery policy columns.'
  );
});

test('activity AI enhancement roadmap focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /Activity AI enhancement roadmap chain has a fast script-level gate via[\s\S]*scripts\/activity-ai-enhancement-roadmap-chain\.test\.ts/,
    'TEST-CATALOG should document the AI enhancement roadmap chain gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /template\s+transforms[\s\S]*distractor\s+write\s+targets[\s\S]*leveled\s+variants[\s\S]*answer\s+explanations[\s\S]*listening\s+scripts[\s\S]*worksheet\/audio\/spreadsheet\s+extraction[\s\S]*source-material\s+privacy[\s\S]*editor-review\/save\/publish\s+boundaries[\s\S]*snapshot\s+protection[\s\S]*result-export\s+continuity/,
    'TEST-CATALOG should describe the future AI enhancement execution scope.'
  );
});
