import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVITY_AI_AUTHORING_CHAIN_HANDOFF_ITEM_IDS,
  ACTIVITY_AI_AUTHORING_CHAIN_SOURCE_FILES,
  buildActivityAiAuthoringChainHandoffView,
  type ActivityAiAuthoringChainHandoffItemId,
  type ActivityAiAuthoringChainHandoffView,
} from '@/activities/ai-authoring-chain';
import {
  ACTIVITY_AI_FALLBACK_SOURCE_TERM_PLAN_ITEM_IDS,
  ACTIVITY_DRAFT_REVIEW_STATE,
} from '@/activities/ai-draft';
import { ACTIVITY_AI_DRAFT_BOUNDARY_HANDOFF_ITEM_IDS } from '@/activities/ai-draft-boundary';
import { ACTIVITY_AI_FALLBACK_HANDOFF_ITEM_IDS } from '@/activities/ai-draft-fallback-handoff';
import { ACTIVITY_AI_FALLBACK_DRAFT_CHAIN_HANDOFF_ITEM_IDS } from '@/activities/ai-fallback-draft-chain';
import { ACTIVITY_AI_REMIX_ASSIST_HANDOFF_ITEM_IDS } from '@/activities/ai-remix-assist';
import { ACTIVITY_DRAFT_META_HANDOFF_ITEM_IDS } from '@/activities/draft-meta';
import {
  ACTIVITY_EDITOR_AI_DRAFT_SOURCE_HANDOFF_ITEM_IDS,
  ACTIVITY_EDITOR_TEMPLATE_HANDOFF_ITEM_IDS,
  ACTIVITY_EDITOR_WORKFLOW_HANDOFF_ITEM_IDS,
} from '@/activities/editor';
import { QUESTION_CHOICE_GENERATION_HANDOFF_ITEM_IDS } from '@/activities/distractors';
import {
  ACTIVITY_SOURCE_MATERIAL_PICKER_HANDOFF_ITEM_IDS,
  ACTIVITY_SOURCE_MATERIAL_READINESS_CAPABILITIES,
} from '@/activities/material-summary';
import { ACTIVITY_TEMPLATE_SCAFFOLD_QUALITY_HANDOFF_ITEM_IDS } from '@/activities/scaffolds';
import { ACTIVITY_SOURCE_EXTRACTION_ASSIST_HANDOFF_ITEM_IDS } from '@/activities/source-extraction-assist';
import { SOURCE_MATERIAL_PRIVACY_CHAIN_HANDOFF_ITEM_IDS } from '@/activities/source-material-privacy-chain';
import { ACTIVITY_TEMPLATE_REMIX_HANDOFF_ITEM_IDS } from '@/activities/template-remix';

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const ACTIVITY_AI_API_SOURCE = readFileSync('src/api/activity-ai.ts', 'utf8');
const AI_DRAFT_SOURCE = readFileSync('src/activities/ai-draft.ts', 'utf8');
const AI_DRAFT_BOUNDARY_SOURCE = readFileSync(
  'src/activities/ai-draft-boundary.ts',
  'utf8'
);
const AI_REMIX_ASSIST_SOURCE = readFileSync(
  'src/activities/ai-remix-assist.ts',
  'utf8'
);
const DRAFT_META_SOURCE = readFileSync('src/activities/draft-meta.ts', 'utf8');
const DRAFT_SOURCE_SOURCE = readFileSync(
  'src/activities/draft-source.ts',
  'utf8'
);
const DISTRACTORS_SOURCE = readFileSync(
  'src/activities/distractors.ts',
  'utf8'
);
const EDITOR_SOURCE = readFileSync('src/activities/editor.ts', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const PRIVATE_ANSWER_TEXT = 'SECRET_AI_AUTHORING_ANSWER';
const PRIVATE_FILE_BYTES = 'SECRET_AI_AUTHORING_FILE_BYTES';
const PRIVATE_PROVIDER_RESPONSE = 'SECRET_RAW_PROVIDER_RESPONSE';
const PRIVATE_SOURCE_TEXT = 'SECRET_RAW_SOURCE_TEXT';
const PRIVATE_STORAGE_KEY = 'source-materials/private/ai-authoring.pdf';

test('activity AI authoring chain exposes 30 teacher-reviewed slices', () => {
  const handoffView = buildActivityAiAuthoringChainHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...ACTIVITY_AI_AUTHORING_CHAIN_HANDOFF_ITEM_IDS]);
  assert.equal(handoffView.title, 'Activity AI authoring chain');
  assert.match(handoffView.description, /Thirty-slice AI authoring chain/);
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
    chainSourceFileCount: ACTIVITY_AI_AUTHORING_CHAIN_SOURCE_FILES.length,
    createsAssignmentLinks: false,
    exposesActivityContentBeforeTeacherReview: false,
    exposesAnswerText: false,
    exposesFileBytesToAi: false,
    exposesRawProviderResponse: false,
    exposesRawSourceText: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialStorageKeys: false,
    itemIds,
    persistsActivityWithoutTeacherAction: false,
    publishesAssignmentWithoutTeacherAction: false,
    requiresAuthenticatedTeacher: true,
    requiresCreateActivityInputContract: true,
    requiresDeterministicFallback: true,
    requiresTeacherReview: true,
    sourceFiles: [...ACTIVITY_AI_AUTHORING_CHAIN_SOURCE_FILES],
    usesFallbackDraftChain: true,
  });
  assertNoPrivateAiAuthoringText(JSON.stringify(handoffView));
});

test('activity AI authoring chain summarizes the source-to-editor contract', () => {
  const handoffView = buildActivityAiAuthoringChainHandoffView();

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['source-panel-readiness', 'Teacher source gate'],
      ['source-text-priority', 'Structured notes first'],
      ['safe-material-provenance', 'Kind and basename only'],
      ['unsafe-material-omission', 'Unsafe notes omitted'],
      ['generate-input-schema', 'GenerateActivityDraftInput'],
      ['auth-server-boundary', 'Authenticated teacher'],
      ['provider-selection', 'Workers AI or fallback'],
      ['model-selection', 'Configured model'],
      ['fallback-draft-path', 'Deterministic local draft'],
      ['fallback-source-term-plan', 'Safe terms only'],
      ['local-completion-contract', 'Complete classroom fields'],
      ['create-input-contract', 'CreateActivityInput'],
      ['editor-review-gate', 'Review before save'],
      ['draft-coverage-summary', 'Coverage counts'],
      ['template-readiness-diagnosis', 'Ready and locked modes'],
      ['quiz-choice-readiness', 'Distractors checked'],
      ['template-remix-foundation', 'Deterministic readiness'],
      ['ai-remix-assist-boundary', 'Completion before save'],
      ['source-byte-guard', 'No file bytes'],
      ['storage-key-guard', 'Storage hidden'],
      ['raw-provider-response-guard', 'Parsed JSON only'],
      ['direct-persistence-guard', 'No direct save'],
      ['publish-boundary', 'No assignment link'],
      ['editor-application', 'Apply to form'],
      ['template-scaffold-context', 'Shared editor model'],
      ['save-gate-review', 'Teacher action required'],
      ['activity-persistence-handoff', 'Create/update helpers'],
      ['assignment-snapshot-protection', 'Future links only'],
      ['distractor-write-target', 'ActivityQuestion.options'],
      ['fallback-draft-chain-boundary', '30 fallback slices'],
    ]
  );
  assert.equal(
    getHandoffValue(handoffView, 'create-input-contract'),
    'CreateActivityInput'
  );
});

test('activity AI authoring chain stays backed by focused gates', () => {
  assert.equal(ACTIVITY_AI_AUTHORING_CHAIN_SOURCE_FILES.length, 30);
  for (const filePath of ACTIVITY_AI_AUTHORING_CHAIN_SOURCE_FILES) {
    assert.ok(
      existsSync(filePath),
      `Missing activity AI authoring chain file ${filePath}`
    );
  }

  assert.deepEqual(
    [
      ACTIVITY_EDITOR_AI_DRAFT_SOURCE_HANDOFF_ITEM_IDS.length,
      ACTIVITY_EDITOR_TEMPLATE_HANDOFF_ITEM_IDS.length,
      ACTIVITY_EDITOR_WORKFLOW_HANDOFF_ITEM_IDS.length,
      ACTIVITY_AI_DRAFT_BOUNDARY_HANDOFF_ITEM_IDS.length,
      ACTIVITY_AI_FALLBACK_HANDOFF_ITEM_IDS.length,
      ACTIVITY_AI_FALLBACK_DRAFT_CHAIN_HANDOFF_ITEM_IDS.length,
      ACTIVITY_AI_FALLBACK_SOURCE_TERM_PLAN_ITEM_IDS.length,
      ACTIVITY_DRAFT_META_HANDOFF_ITEM_IDS.length,
      ACTIVITY_TEMPLATE_REMIX_HANDOFF_ITEM_IDS.length,
      ACTIVITY_AI_REMIX_ASSIST_HANDOFF_ITEM_IDS.length,
      QUESTION_CHOICE_GENERATION_HANDOFF_ITEM_IDS.length,
      ACTIVITY_SOURCE_MATERIAL_PICKER_HANDOFF_ITEM_IDS.length,
      ACTIVITY_SOURCE_EXTRACTION_ASSIST_HANDOFF_ITEM_IDS.length,
      SOURCE_MATERIAL_PRIVACY_CHAIN_HANDOFF_ITEM_IDS.length,
      ACTIVITY_TEMPLATE_SCAFFOLD_QUALITY_HANDOFF_ITEM_IDS.length,
    ],
    Array.from({ length: 15 }, () => 30)
  );
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
    AI_DRAFT_BOUNDARY_SOURCE,
    /ActivityAiDraftBoundaryHandoffPrivacyContract[\s\S]*exposesActivityDraftText: false[\s\S]*exposesRawProviderResponse: false[\s\S]*exposesSourceText: false[\s\S]*persistsActivity: false[\s\S]*publishesAssignment: false[\s\S]*requiresTeacherReview: true/,
    'AI draft boundary handoff should keep draft text, raw provider output, direct persistence, and publish paths private.'
  );
  assert.match(
    DRAFT_META_SOURCE,
    /ActivityDraftMetaHandoffPrivacyContract[\s\S]*exposesRawDraftJson: false[\s\S]*exposesRawSourceText: false[\s\S]*persistsContentDirectly: false[\s\S]*usesCreateActivityInputContract: true[\s\S]*usesDeterministicFallbackContract: true[\s\S]*usesTemplateReadinessDomain: true/,
    'Draft metadata should keep raw draft/source text private while using CreateActivityInput, fallback, and readiness contracts.'
  );
  assert.match(
    AI_REMIX_ASSIST_SOURCE,
    /ActivityAiRemixAssistHandoffPrivacyContract[\s\S]*appliesBeforeActivitySave: true[\s\S]*modifiesOriginalActivity: false[\s\S]*modifiesPublishedAssignmentSnapshots: false[\s\S]*requiresEditorReview: true[\s\S]*savesActivityWithoutTeacherAction: false/,
    'AI remix assist should remain a before-save, teacher-reviewed completion boundary.'
  );
  assert.match(
    DISTRACTORS_SOURCE,
    /QuestionChoiceGenerationHandoffPrivacyContract[\s\S]*exposesRawAiOutput: false[\s\S]*requiresTeacherReview: true[\s\S]*writeTarget: 'ActivityQuestion\.options'/,
    'Quiz distractor generation should target ActivityQuestion.options without exposing raw AI output.'
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
    /Activity AI authoring chain has a fast script-level gate via[\s\S]*scripts\/activity-ai-authoring-chain-handoff\.test\.ts/,
    'TEST-CATALOG should document the activity AI authoring chain gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /source safety[\s\S]*deterministic fallback[\s\S]*CreateActivityInput[\s\S]*template readiness[\s\S]*editor review[\s\S]*save\/publish boundaries/,
    'TEST-CATALOG should document the source-to-editor AI authoring chain scope.'
  );
});

function getHandoffValue(
  view: ActivityAiAuthoringChainHandoffView,
  id: ActivityAiAuthoringChainHandoffItemId
) {
  const item = view.itemViews.find((itemView) => itemView.id === id);
  assert.ok(item, `Missing activity AI authoring chain item ${id}`);
  return item.value;
}

function assertNoPrivateAiAuthoringText(serializedView: string) {
  for (const privateValue of [
    PRIVATE_ANSWER_TEXT,
    PRIVATE_FILE_BYTES,
    PRIVATE_PROVIDER_RESPONSE,
    PRIVATE_SOURCE_TEXT,
    PRIVATE_STORAGE_KEY,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Activity AI authoring chain leaked private text: ${privateValue}`
    );
  }
}
