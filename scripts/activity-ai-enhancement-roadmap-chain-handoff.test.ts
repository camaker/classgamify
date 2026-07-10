import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVITY_AI_AUTHORING_CHAIN_HANDOFF_ITEM_IDS,
  ACTIVITY_AI_AUTHORING_CHAIN_SOURCE_FILES,
} from '@/activities/ai-authoring-chain';
import {
  ACTIVITY_AI_ENHANCEMENT_ROADMAP_CHAIN_HANDOFF_ITEM_IDS,
  ACTIVITY_AI_ENHANCEMENT_ROADMAP_CHAIN_SOURCE_FILES,
  buildActivityAiEnhancementRoadmapChainHandoffView,
  type ActivityAiEnhancementRoadmapChainHandoffItemId,
  type ActivityAiEnhancementRoadmapChainHandoffView,
} from '@/activities/ai-enhancement-roadmap-chain';
import { ACTIVITY_AI_REMIX_ASSIST_HANDOFF_ITEM_IDS } from '@/activities/ai-remix-assist';
import { ACTIVITY_DRAFT_META_HANDOFF_ITEM_IDS } from '@/activities/draft-meta';
import { ACTIVITY_SOURCE_EXTRACTION_ASSIST_HANDOFF_ITEM_IDS } from '@/activities/source-extraction-assist';
import { SOURCE_EXTRACTION_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS } from '@/activities/source-extraction-lifecycle-chain';
import { SOURCE_MATERIAL_PRIVACY_CHAIN_HANDOFF_ITEM_IDS } from '@/activities/source-material-privacy-chain';
import { ACTIVITY_TEMPLATE_REMIX_HANDOFF_ITEM_IDS } from '@/activities/template-remix';
import {
  TEMPLATE_ROADMAP_CAPABILITY_CHAIN_HANDOFF_ITEM_IDS,
  TEMPLATE_ROADMAP_CAPABILITY_CHAIN_SOURCE_FILES,
} from '@/activities/template-roadmap-capability-chain';
import { QUESTION_CHOICE_GENERATION_HANDOFF_ITEM_IDS } from '@/activities/distractors';
import { ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS } from '@/assignments/results-export';
import { WORKSHEET_MODE_DELIVERY_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/worksheet-mode-delivery-chain';

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const AI_API_SOURCE = readFileSync('src/api/activity-ai.ts', 'utf8');
const AI_DRAFT_SOURCE = readFileSync('src/activities/ai-draft.ts', 'utf8');
const AI_AUTHORING_SOURCE = readFileSync(
  'src/activities/ai-authoring-chain.ts',
  'utf8'
);
const AI_REMIX_ASSIST_SOURCE = readFileSync(
  'src/activities/ai-remix-assist.ts',
  'utf8'
);
const DISTRACTORS_SOURCE = readFileSync(
  'src/activities/distractors.ts',
  'utf8'
);
const DRAFT_META_SOURCE = readFileSync('src/activities/draft-meta.ts', 'utf8');
const DRAFT_SOURCE_SOURCE = readFileSync(
  'src/activities/draft-source.ts',
  'utf8'
);
const SOURCE_EXTRACTION_SOURCE = readFileSync(
  'src/activities/source-extraction-assist.ts',
  'utf8'
);
const SOURCE_EXTRACTION_CHAIN_SOURCE = readFileSync(
  'src/activities/source-extraction-lifecycle-chain.ts',
  'utf8'
);
const TEMPLATE_ROADMAP_SOURCE = readFileSync(
  'src/activities/template-roadmap-capability-chain.ts',
  'utf8'
);
const WORKSHEET_CHAIN_SOURCE = readFileSync(
  'src/assignments/worksheet-mode-delivery-chain.ts',
  'utf8'
);
const RESULTS_EXPORT_SOURCE = readFileSync(
  'src/assignments/results-export.ts',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const PRIVATE_ANSWER_KEY = 'SECRET_AI_ENHANCEMENT_ANSWER_KEY';
const PRIVATE_FILE_BYTES = 'SECRET_AI_ENHANCEMENT_FILE_BYTES';
const PRIVATE_PROVIDER_OUTPUT = 'SECRET_AI_ENHANCEMENT_PROVIDER_OUTPUT';
const PRIVATE_RAW_SOURCE_TEXT = 'SECRET_AI_ENHANCEMENT_SOURCE_TEXT';
const PRIVATE_SOURCE_FILE_ID = 'SECRET_AI_ENHANCEMENT_FILE_ID';
const PRIVATE_SOURCE_STORAGE_KEY =
  'source-materials/private/ai-enhancement.pdf';

test('activity AI enhancement roadmap chain exposes 30 safe enhancement slices', () => {
  const handoffView = buildActivityAiEnhancementRoadmapChainHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...ACTIVITY_AI_ENHANCEMENT_ROADMAP_CHAIN_HANDOFF_ITEM_IDS,
  ]);
  assert.equal(handoffView.title, 'Activity AI enhancement roadmap chain');
  assert.match(handoffView.description, /Thirty-slice AI enhancement/);
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
    chainSourceFileCount:
      ACTIVITY_AI_ENHANCEMENT_ROADMAP_CHAIN_SOURCE_FILES.length,
    createsAssignmentLinksWithoutTeacherAction: false,
    exposesAnswerKeysToPublicPayload: false,
    exposesFileBytesToAi: false,
    exposesRawAiOutput: false,
    exposesRawSourceText: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialStorageKeys: false,
    itemIds,
    keepsLeveledVariantsAsDrafts: true,
    mutatesExistingAssignmentSnapshots: false,
    persistsActivityWithoutTeacherAction: false,
    publishesAssignmentWithoutTeacherAction: false,
    readsSourceMaterialBytes: false,
    requiresCreateActivityInputContract: true,
    requiresEditorReview: true,
    sourceFiles: [...ACTIVITY_AI_ENHANCEMENT_ROADMAP_CHAIN_SOURCE_FILES],
    usesDeterministicFallback: true,
    usesSharedActivityAssignmentModel: true,
    writesDistractorsToQuestionOptions: true,
  });
  assertNoPrivateAiEnhancementText(JSON.stringify(handoffView));
});

test('activity AI enhancement roadmap chain summarizes future execution boundaries', () => {
  const handoffView = buildActivityAiEnhancementRoadmapChainHandoffView();

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['product-ai-enhancement-boundary', 'Teacher-reviewed roadmap'],
      ['source-to-activity-draft', 'CreateActivityInput draft'],
      ['template-transform-boundary', 'Structured field proposal'],
      ['deterministic-remix-precheck', 'Readiness first'],
      ['ai-remix-completion', 'Missing fields only'],
      ['distractor-generation-target', 'ActivityQuestion.options'],
      ['question-option-contract', 'Four-choice readiness'],
      ['leveled-variant-boundary', 'Draft copy variant'],
      ['answer-explanation-target', 'Question explanations'],
      ['listening-script-boundary', 'Listening prompt draft'],
      ['worksheet-extraction-boundary', 'ActivityContent target'],
      ['audio-extraction-readiness', 'Listening draft path'],
      ['spreadsheet-import-readiness', 'Structured import path'],
      ['source-material-provenance', 'Kind and basename only'],
      ['source-byte-guard', 'No file bytes'],
      ['storage-key-guard', 'Storage hidden'],
      ['raw-provider-output-guard', 'Parsed fields only'],
      ['create-input-contract', 'CreateActivityInput'],
      ['activity-content-target', 'Questions/pairs/groups'],
      ['editor-review-gate', 'Review before save'],
      ['draft-coverage-summary', 'Coverage counts'],
      ['template-readiness-diagnosis', 'Ready and locked modes'],
      ['save-gate', 'Teacher action required'],
      ['publish-boundary', 'No assignment link'],
      ['assignment-snapshot-protection', 'Frozen links protected'],
      ['public-payload-guard', 'Sanitized runtime only'],
      ['result-export-continuity', 'Shared export model'],
      ['deterministic-fallback', 'Local stable draft'],
      ['provider-credential-gate', 'Configured provider only'],
      ['ai-enhancement-chain-gate', '30 source files'],
    ]
  );
  assert.equal(
    getHandoffValue(handoffView, 'distractor-generation-target'),
    'ActivityQuestion.options'
  );
  assert.equal(
    getHandoffValue(handoffView, 'worksheet-extraction-boundary'),
    'ActivityContent target'
  );
});

test('activity AI enhancement roadmap chain is backed by focused product gates', () => {
  assert.equal(ACTIVITY_AI_ENHANCEMENT_ROADMAP_CHAIN_SOURCE_FILES.length, 30);
  for (const filePath of ACTIVITY_AI_ENHANCEMENT_ROADMAP_CHAIN_SOURCE_FILES) {
    assert.ok(
      existsSync(filePath),
      `Missing activity AI enhancement roadmap chain file ${filePath}`
    );
  }

  assert.equal(ACTIVITY_AI_AUTHORING_CHAIN_SOURCE_FILES.length, 30);
  assert.equal(TEMPLATE_ROADMAP_CAPABILITY_CHAIN_SOURCE_FILES.length, 30);
  assert.deepEqual(
    [
      ACTIVITY_AI_AUTHORING_CHAIN_HANDOFF_ITEM_IDS.length,
      ACTIVITY_AI_REMIX_ASSIST_HANDOFF_ITEM_IDS.length,
      ACTIVITY_DRAFT_META_HANDOFF_ITEM_IDS.length,
      ACTIVITY_TEMPLATE_REMIX_HANDOFF_ITEM_IDS.length,
      QUESTION_CHOICE_GENERATION_HANDOFF_ITEM_IDS.length,
      ACTIVITY_SOURCE_EXTRACTION_ASSIST_HANDOFF_ITEM_IDS.length,
      SOURCE_EXTRACTION_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS.length,
      SOURCE_MATERIAL_PRIVACY_CHAIN_HANDOFF_ITEM_IDS.length,
      TEMPLATE_ROADMAP_CAPABILITY_CHAIN_HANDOFF_ITEM_IDS.length,
      WORKSHEET_MODE_DELIVERY_CHAIN_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS.length,
    ],
    Array.from({ length: 11 }, () => 30)
  );
});

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
    AI_AUTHORING_SOURCE,
    /distractor-write-target[\s\S]*Future AI distractors must write into the existing question option structure/,
    'AI authoring chain should keep future distractors on the existing option target.'
  );
  assert.match(
    AI_REMIX_ASSIST_SOURCE,
    /ActivityAiRemixAssistHandoffPrivacyContract[\s\S]*appliesBeforeActivitySave: true[\s\S]*modifiesOriginalActivity: false[\s\S]*modifiesPublishedAssignmentSnapshots: false[\s\S]*requiresEditorReview: true[\s\S]*savesActivityWithoutTeacherAction: false/,
    'AI remix assist should stay before-save and teacher-reviewed.'
  );
  assert.match(
    DISTRACTORS_SOURCE,
    /QuestionChoiceGenerationHandoffPrivacyContract[\s\S]*exposesRawAiOutput: false[\s\S]*requiresTeacherReview: true[\s\S]*writeTarget: 'ActivityQuestion\.options'/,
    'Question choice generation should keep raw AI output private and target ActivityQuestion.options.'
  );
  assert.match(
    DRAFT_META_SOURCE,
    /usesCreateActivityInputContract: true[\s\S]*usesTemplateReadinessDomain: true/,
    'Draft metadata should keep CreateActivityInput and template-readiness domains aligned.'
  );
  assert.match(
    SOURCE_EXTRACTION_SOURCE,
    /audio-draft-path[\s\S]*worksheet-extraction-path[\s\S]*spreadsheet-import-path[\s\S]*targetModel: 'ActivityContent'/,
    'Source extraction assist should route future extraction paths to ActivityContent.'
  );
  assert.match(
    SOURCE_EXTRACTION_CHAIN_SOURCE,
    /createsParallelWorksheetModel: false[\s\S]*readsSourceMaterialBytes: false[\s\S]*requiresEditorReview: true/,
    'Source extraction lifecycle should avoid parallel worksheet models and file-byte reads.'
  );
  assert.match(
    TEMPLATE_ROADMAP_SOURCE,
    /teacher-reviewed AI enhancements[\s\S]*requiresCreateActivityInputContract: true[\s\S]*requiresTeacherReviewBeforePersistence: true/,
    'Template roadmap should keep AI enhancements teacher reviewed.'
  );
  assert.match(
    WORKSHEET_CHAIN_SOURCE,
    /createsParallelWorksheetModel: false[\s\S]*requiresAssignmentSnapshot: true[\s\S]*requiresCreateActivityInputContract: true/,
    'Worksheet delivery should preserve shared snapshots and CreateActivityInput.'
  );
  assert.match(
    RESULTS_EXPORT_SOURCE,
    /ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS[\s\S]*'delivery-identity'[\s\S]*'delivery-answer-reveal'[\s\S]*'delivery-item-order'[\s\S]*'raw-settings'[\s\S]*buildAssignmentResultsExportPreparationPrivacyContract[\s\S]*exposesPromptText: false[\s\S]*exposesStudentAnswerText: false[\s\S]*exposesTeacherAnswerText: false/,
    'Result exports should keep delivery policy, raw-settings coverage, and privacy guards.'
  );
});

test('activity AI enhancement roadmap focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /Activity AI enhancement roadmap chain has a fast script-level gate via[\s\S]*scripts\/activity-ai-enhancement-roadmap-chain-handoff\.test\.ts/,
    'TEST-CATALOG should document the AI enhancement roadmap chain gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /template\s+transforms[\s\S]*distractor write\s+targets[\s\S]*leveled variants[\s\S]*answer\s+explanations[\s\S]*listening\s+scripts[\s\S]*worksheet\/audio\/spreadsheet\s+extraction[\s\S]*source-material privacy[\s\S]*editor-review\/save\/publish boundaries[\s\S]*snapshot\s+protection[\s\S]*result-export continuity/,
    'TEST-CATALOG should describe the future AI enhancement execution scope.'
  );
});

function getHandoffValue(
  view: ActivityAiEnhancementRoadmapChainHandoffView,
  id: ActivityAiEnhancementRoadmapChainHandoffItemId
) {
  const item = view.itemViews.find((candidate) => candidate.id === id);
  assert.ok(item, `Missing AI enhancement roadmap chain item ${id}`);
  return item.value;
}

function assertNoPrivateAiEnhancementText(serializedView: string) {
  for (const privateValue of [
    PRIVATE_ANSWER_KEY,
    PRIVATE_FILE_BYTES,
    PRIVATE_PROVIDER_OUTPUT,
    PRIVATE_RAW_SOURCE_TEXT,
    PRIVATE_SOURCE_FILE_ID,
    PRIVATE_SOURCE_STORAGE_KEY,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `AI enhancement roadmap chain leaked private text: ${privateValue}`
    );
  }
}
