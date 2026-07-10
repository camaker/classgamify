import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVITY_AI_AUTHORING_CHAIN_HANDOFF_ITEM_IDS,
  ACTIVITY_AI_AUTHORING_CHAIN_SOURCE_FILES,
} from '@/activities/ai-authoring-chain';
import { ACTIVITY_AI_DRAFT_BOUNDARY_HANDOFF_ITEM_IDS } from '@/activities/ai-draft-boundary';
import { ACTIVITY_AI_FALLBACK_HANDOFF_ITEM_IDS } from '@/activities/ai-draft-fallback-handoff';
import {
  ACTIVITY_AI_FALLBACK_DRAFT_CHAIN_HANDOFF_ITEM_IDS,
  ACTIVITY_AI_FALLBACK_DRAFT_CHAIN_SOURCE_FILES,
  buildActivityAiFallbackDraftChainHandoffView,
  type ActivityAiFallbackDraftChainHandoffItemId,
  type ActivityAiFallbackDraftChainHandoffView,
} from '@/activities/ai-fallback-draft-chain';
import {
  ACTIVITY_AI_FALLBACK_SOURCE_TERM_PLAN_ITEM_IDS,
  ACTIVITY_DRAFT_REVIEW_STATE,
} from '@/activities/ai-draft';
import { ACTIVITY_AI_ENHANCEMENT_EXECUTION_ITEM_IDS } from '@/activities/ai-enhancement-execution';
import { ACTIVITY_DRAFT_META_HANDOFF_ITEM_IDS } from '@/activities/draft-meta';
import { ACTIVITY_SOURCE_EXTRACTION_ASSIST_HANDOFF_ITEM_IDS } from '@/activities/source-extraction-assist';
import { SOURCE_EXTRACTION_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS } from '@/activities/source-extraction-lifecycle-chain';
import { SOURCE_MATERIAL_PRIVACY_CHAIN_HANDOFF_ITEM_IDS } from '@/activities/source-material-privacy-chain';
import { ACTIVITY_TEMPLATE_REMIX_HANDOFF_ITEM_IDS } from '@/activities/template-remix';
import { QUESTION_CHOICE_GENERATION_HANDOFF_ITEM_IDS } from '@/activities/distractors';
import {
  ACTIVITY_EDITOR_AI_DRAFT_SOURCE_HANDOFF_ITEM_IDS,
  ACTIVITY_EDITOR_WORKFLOW_HANDOFF_ITEM_IDS,
} from '@/activities/editor';
import { ACTIVITY_SOURCE_MATERIAL_PICKER_HANDOFF_ITEM_IDS } from '@/activities/material-summary';

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

const PRIVATE_ANSWER_TEXT = 'SECRET_AI_FALLBACK_ANSWER';
const PRIVATE_FILE_BYTES = 'SECRET_AI_FALLBACK_FILE_BYTES';
const PRIVATE_FILE_ID = 'SECRET_AI_FALLBACK_FILE_ID';
const PRIVATE_PROVIDER_TOKEN = 'SECRET_AI_FALLBACK_PROVIDER_TOKEN';
const PRIVATE_PROVIDER_RESPONSE = 'SECRET_AI_FALLBACK_PROVIDER_RESPONSE';
const PRIVATE_RAW_FALLBACK_DRAFT = 'SECRET_AI_FALLBACK_RAW_DRAFT';
const PRIVATE_SOURCE_TEXT = 'SECRET_AI_FALLBACK_SOURCE_TEXT';
const PRIVATE_STORAGE_KEY = 'source-materials/private/fallback-draft.pdf';

test('activity AI fallback draft chain exposes 30 stable slices', () => {
  const handoffView = buildActivityAiFallbackDraftChainHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...ACTIVITY_AI_FALLBACK_DRAFT_CHAIN_HANDOFF_ITEM_IDS,
  ]);
  assert.equal(handoffView.title, 'Activity AI fallback draft chain');
  assert.match(
    handoffView.description,
    /Thirty-slice deterministic AI fallback draft chain/
  );
  assert.equal(handoffView.itemViews.length, 30);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(
    handoffView.itemViews.every(
      (item) =>
        Boolean(item.ariaLabel) &&
        Boolean(item.description) &&
        Boolean(item.label) &&
        Boolean(item.value)
    ),
    true
  );
  assert.deepEqual(handoffView.privacy, {
    callsWorkersAiWithoutCredentials: false,
    chainSourceFileCount: ACTIVITY_AI_FALLBACK_DRAFT_CHAIN_SOURCE_FILES.length,
    createsAssignmentLinks: false,
    exposesActivityContentBeforeTeacherReview: false,
    exposesAnswerText: false,
    exposesFileBytesToAi: false,
    exposesProviderApiTokens: false,
    exposesRawFallbackDraft: false,
    exposesRawProviderResponse: false,
    exposesRawSourceMaterialNotes: false,
    exposesRawSourceText: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialStorageKeys: false,
    itemIds,
    keepsLocalCiStable: true,
    persistsActivityWithoutTeacherAction: false,
    providerCredentialsServerSide: true,
    publishesAssignmentWithoutTeacherAction: false,
    requiresCreateActivityInputContract: true,
    requiresDeterministicFallback: true,
    requiresEditorApplication: true,
    requiresTeacherReview: true,
    sourceFiles: [...ACTIVITY_AI_FALLBACK_DRAFT_CHAIN_SOURCE_FILES],
    usesSanitizedSourceText: true,
  });
  assertNoPrivateFallbackChainText(JSON.stringify(handoffView));
});

test('activity AI fallback draft chain summarizes the fallback lifecycle', () => {
  const handoffView = buildActivityAiFallbackDraftChainHandoffView();

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['fallback-contract-owner', 'ai-draft.ts'],
      ['credential-missing-path', 'Missing credentials -> fallback'],
      ['invalid-json-path', 'Invalid provider JSON -> fallback'],
      ['provider-call-boundary', 'Workers AI only when configured'],
      ['local-draft-generator', 'createFallbackActivityDraft'],
      ['input-schema-boundary', 'GenerateActivityDraftInput'],
      ['source-sanitization', 'sanitizeActivityDraftSourceTextForAi'],
      ['material-note-omission', 'Raw material notes omitted'],
      ['safe-provenance-boundary', 'Kind and basename only'],
      ['source-term-plan', '30 planning slices'],
      ['fallback-padding', 'Deterministic classroom terms'],
      ['target-item-count', 'Bounded item target'],
      ['template-preservation', 'Selected template kept'],
      ['draft-focus-preservation', 'Selected focus kept'],
      ['complete-question-fields', 'Questions with explanations'],
      ['complete-pair-fields', 'Pairs ready'],
      ['complete-group-fields', 'Groups ready'],
      ['vocabulary-coverage', 'Vocabulary terms'],
      ['teacher-note-coverage', 'Review notes'],
      ['explanation-coverage', 'Answer explanations'],
      ['create-input-mapping', 'CreateActivityInput'],
      ['draft-metadata-summary', 'Coverage + trust'],
      ['template-readiness-preview', 'Ready and locked modes'],
      ['quiz-choice-readiness', 'Local choices checked'],
      ['editor-application', 'Apply to editor'],
      ['teacher-review-gate', 'Review required'],
      ['save-boundary', 'Teacher saves first'],
      ['publish-boundary', 'Save before publish'],
      ['provider-secret-guard', 'Worker secrets only'],
      ['fallback-chain-gate', '30 source files'],
    ]
  );
  assert.equal(
    getHandoffValue(handoffView, 'create-input-mapping'),
    'CreateActivityInput'
  );
});

test('activity AI fallback draft chain is backed by adjacent focused gates', () => {
  assert.equal(ACTIVITY_AI_FALLBACK_DRAFT_CHAIN_SOURCE_FILES.length, 30);
  for (const filePath of ACTIVITY_AI_FALLBACK_DRAFT_CHAIN_SOURCE_FILES) {
    assert.ok(
      existsSync(filePath),
      `Missing activity AI fallback draft chain file ${filePath}`
    );
  }

  assert.deepEqual(
    [
      ACTIVITY_AI_FALLBACK_HANDOFF_ITEM_IDS.length,
      ACTIVITY_AI_FALLBACK_SOURCE_TERM_PLAN_ITEM_IDS.length,
      ACTIVITY_AI_DRAFT_BOUNDARY_HANDOFF_ITEM_IDS.length,
      ACTIVITY_DRAFT_META_HANDOFF_ITEM_IDS.length,
      ACTIVITY_TEMPLATE_REMIX_HANDOFF_ITEM_IDS.length,
      QUESTION_CHOICE_GENERATION_HANDOFF_ITEM_IDS.length,
      ACTIVITY_EDITOR_AI_DRAFT_SOURCE_HANDOFF_ITEM_IDS.length,
      ACTIVITY_EDITOR_WORKFLOW_HANDOFF_ITEM_IDS.length,
      ACTIVITY_SOURCE_MATERIAL_PICKER_HANDOFF_ITEM_IDS.length,
      ACTIVITY_SOURCE_EXTRACTION_ASSIST_HANDOFF_ITEM_IDS.length,
      SOURCE_EXTRACTION_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS.length,
      SOURCE_MATERIAL_PRIVACY_CHAIN_HANDOFF_ITEM_IDS.length,
      ACTIVITY_AI_AUTHORING_CHAIN_HANDOFF_ITEM_IDS.length,
      ACTIVITY_AI_AUTHORING_CHAIN_SOURCE_FILES.length,
      ACTIVITY_AI_ENHANCEMENT_EXECUTION_ITEM_IDS.length,
    ],
    Array.from({ length: 15 }, () => 30)
  );
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
    PRODUCT_SOURCE,
    /src\/activities\/ai-fallback-draft-chain\.ts`\s+owns the deterministic AI\s+fallback draft chain[\s\S]*missing Workers AI credentials[\s\S]*invalid provider\s+JSON[\s\S]*sanitized source-term planning[\s\S]*teacher review[\s\S]*save\/publish boundaries/,
    'docs/product.md should document the deterministic AI fallback draft chain owner.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Activity AI fallback draft chain has a fast script-level gate via[\s\S]*scripts\/activity-ai-fallback-draft-chain-handoff\.test\.ts[\s\S]*missing Workers AI credentials[\s\S]*invalid provider JSON[\s\S]*deterministic local draft[\s\S]*source-term planning[\s\S]*CreateActivityInput[\s\S]*teacher review[\s\S]*save\/publish boundaries/,
    'TEST-CATALOG should document the activity AI fallback draft chain gate.'
  );
});

function getHandoffValue(
  view: ActivityAiFallbackDraftChainHandoffView,
  id: ActivityAiFallbackDraftChainHandoffItemId
) {
  const item = view.itemViews.find((itemView) => itemView.id === id);
  assert.ok(item, `Missing activity AI fallback draft chain item ${id}`);
  return item.value;
}

function assertNoPrivateFallbackChainText(serializedView: string) {
  for (const privateValue of [
    PRIVATE_ANSWER_TEXT,
    PRIVATE_FILE_BYTES,
    PRIVATE_FILE_ID,
    PRIVATE_PROVIDER_TOKEN,
    PRIVATE_PROVIDER_RESPONSE,
    PRIVATE_RAW_FALLBACK_DRAFT,
    PRIVATE_SOURCE_TEXT,
    PRIVATE_STORAGE_KEY,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Activity AI fallback draft chain leaked private text: ${privateValue}`
    );
  }
}
