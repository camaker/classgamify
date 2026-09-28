import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { ACTIVITY_DRAFT_REVIEW_STATE } from '@/activities/ai-draft';

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const ACTIVITY_AI_API_SOURCE = readFileSync('src/api/activity-ai.ts', 'utf8');
const AI_DRAFT_SOURCE = readFileSync('src/activities/ai-draft.ts', 'utf8');
const AI_WORKERS_SOURCE = readFileSync('src/ai/workers.ts', 'utf8');
const DRAFT_SOURCE_SOURCE = readFileSync(
  'src/activities/draft-source.ts',
  'utf8'
);
const ENV_SERVER_SOURCE = readFileSync('src/env/server.ts', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('activity AI fallback draft chain is backed by adjacent focused gates', () => {
  assert.deepEqual(ACTIVITY_DRAFT_REVIEW_STATE, {
    applicationMode: 'editor-review',
    persistenceMode: 'not-persisted',
    reviewRequired: true,
  });
});

test('activity AI fallback draft sources preserve provider failure semantics', () => {
  assert.match(
    PRODUCT_SOURCE,
    /If Workers AI credentials are missing or model output is not valid JSON[\s\S]*deterministic local draft[\s\S]*fallback draft generator is a product-domain contract[\s\S]*CLOUDFLARE_ACCOUNT_ID[\s\S]*CLOUDFLARE_API_TOKEN/,
    'docs/product.md should define the deterministic fallback product contract.'
  );
  assert.match(
    ENV_SERVER_SOURCE,
    /CLOUDFLARE_ACCOUNT_ID: z\.string\(\)\.optional\(\)[\s\S]*CLOUDFLARE_API_TOKEN: z\.string\(\)\.optional\(\)/,
    'Cloudflare Workers AI credentials should remain optional server-side env values.'
  );
  assert.match(
    AI_WORKERS_SOURCE,
    /hasWorkersAiCredentials\(\)[\s\S]*serverEnv\.CLOUDFLARE_ACCOUNT_ID[\s\S]*serverEnv\.CLOUDFLARE_API_TOKEN/,
    'Workers AI credential checks should require both account id and API token.'
  );
  assert.match(
    AI_WORKERS_SOURCE,
    /runWorkersAi[\s\S]*const accountId = serverEnv\.CLOUDFLARE_ACCOUNT_ID[\s\S]*const apiKey = serverEnv\.CLOUDFLARE_API_TOKEN[\s\S]*Authorization: `Bearer \$\{apiKey\}`/,
    'Workers AI calls should use server-side provider credentials only.'
  );
  assert.match(
    ACTIVITY_AI_API_SOURCE,
    /createServerFn\(\{ method: 'POST' \}\)[\s\S]*\.validator\(generateActivityDraftInputSchema\)[\s\S]*\.middleware\(\[authApiMiddleware\]\)[\s\S]*generateActivityDraftFromAi\(data\)/,
    'Activity AI draft generation should stay schema-validated and authenticated.'
  );
  assert.match(
    AI_DRAFT_SOURCE,
    /export async function generateActivityDraftFromAi[\s\S]*generateActivityDraftInputSchema\.parse\(input\)[\s\S]*if \(!hasWorkersAiCredentials\(\)\) \{[\s\S]*createFallbackActivityDraftResult\(\{[\s\S]*notice: m\.activity_ai_notice_missing_credentials\(\)/,
    'Missing provider credentials should return a deterministic fallback draft result.'
  );
  assert.match(
    AI_DRAFT_SOURCE,
    /try \{[\s\S]*parsedDraft = parseAiDraftResponse\(result\.response, data\);[\s\S]*\} catch \{[\s\S]*createFallbackActivityDraftResult\(\{[\s\S]*notice: m\.activity_ai_notice_invalid_draft\(\)/,
    'Invalid provider draft JSON should return a deterministic fallback draft result.'
  );
});

test('activity AI fallback draft sources preserve sanitized draft creation', () => {
  assert.match(
    AI_DRAFT_SOURCE,
    /export function createFallbackActivityDraftResult[\s\S]*generateActivityDraftInputSchema\.parse\(input\)[\s\S]*createFallbackActivityDraft\(data\)[\s\S]*draftFocus: data\.draftFocus[\s\S]*provider: 'fallback'/,
    'Fallback draft results should parse input, create fallback content, preserve focus, and mark provider as fallback.'
  );
  assert.match(
    AI_DRAFT_SOURCE,
    /export function createFallbackActivityDraft[\s\S]*generateActivityDraftInputSchema\.parse\(input\)[\s\S]*buildFallbackActivityDraftTerms\(\{[\s\S]*buildFallbackQuestions[\s\S]*buildFallbackPairs[\s\S]*buildFallbackGroups[\s\S]*sanitizeActivityDraftSourceTextForAi\(data\.sourceText\)[\s\S]*createActivityInputSchema\.parse\(activity\)/,
    'Fallback draft creation should produce complete CreateActivityInput fields from sanitized source text.'
  );
  assert.match(
    AI_DRAFT_SOURCE,
    /export function buildFallbackActivityDraftSourceTermPlan[\s\S]*sanitizeActivityDraftSourceTextForAi\(data\.sourceText\)[\s\S]*extractActivityDraftSourceTerms\(\{[\s\S]*sourceTerms\.slice\(0, data\.itemCount\)[\s\S]*usedFallbackPadding[\s\S]*buildFallbackActivityDraftPaddingTerms\(locale\)[\s\S]*ACTIVITY_AI_FALLBACK_SOURCE_TERM_PLAN_ITEM_IDS\.map/,
    'Fallback source-term planning should sanitize, select, deterministically pad, and expose stable item views.'
  );
  assert.match(
    DRAFT_SOURCE_SOURCE,
    /sanitizeActivityDraftSourceTextForAi\(sourceText: string\)[\s\S]*removeActivitySourceMaterialDraftNotes\(sourceText\)[\s\S]*normalizeActivityDraftSourceText/,
    'Draft source sanitization should remove raw material notes before prompt or fallback planning.'
  );
  assert.match(
    AI_DRAFT_SOURCE,
    /function buildFallbackQuestions[\s\S]*explanation[\s\S]*options: buildAiDraftQuestionOptions[\s\S]*case 'fill-blank'[\s\S]*case 'listening'[\s\S]*case 'open-box'/,
    'Fallback questions should include answer support across quiz, fill-blank, listening, and open-box modes.'
  );
  assert.match(
    AI_DRAFT_SOURCE,
    /function buildFallbackGroups[\s\S]*activity_ai_fallback_group_practice[\s\S]*activity_ai_fallback_group_review/,
    'Fallback drafts should include group data for reusable classroom modes.'
  );
});

test('activity AI fallback draft chain is documented in product and catalog', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /Activity AI fallback draft chain has a fast script-level gate via[\s\S]*scripts\/activity-ai-fallback-draft-chain\.test\.ts[\s\S]*missing Workers AI credentials[\s\S]*invalid provider JSON[\s\S]*deterministic local draft[\s\S]*source-term planning[\s\S]*CreateActivityInput[\s\S]*teacher review[\s\S]*save\/publish boundaries/,
    'TEST-CATALOG should document the activity AI fallback draft chain gate.'
  );
});
