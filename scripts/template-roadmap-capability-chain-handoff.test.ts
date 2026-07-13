import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { ACTIVITY_AI_AUTHORING_CHAIN_HANDOFF_ITEM_IDS } from '@/activities/ai-authoring-chain';
import { ACTIVITY_AI_REMIX_ASSIST_HANDOFF_ITEM_IDS } from '@/activities/ai-remix-assist';
import { ACTIVITY_AUTHORING_LIBRARY_CHAIN_HANDOFF_ITEM_IDS } from '@/activities/authoring-library-chain';
import { ACTIVITY_TEMPLATE_SCAFFOLD_QUALITY_HANDOFF_ITEM_IDS } from '@/activities/scaffolds';
import { ACTIVITY_SOURCE_EXTRACTION_ASSIST_HANDOFF_ITEM_IDS } from '@/activities/source-extraction-assist';
import { ACTIVITY_TEMPLATE_REMIX_HANDOFF_ITEM_IDS } from '@/activities/template-remix';
import {
  TEMPLATE_ROADMAP_CAPABILITY_CHAIN_HANDOFF_ITEM_IDS,
  TEMPLATE_ROADMAP_CAPABILITY_CHAIN_SOURCE_FILES,
  buildTemplateRoadmapCapabilityChainHandoffView,
  type TemplateRoadmapCapabilityChainHandoffItemId,
  type TemplateRoadmapCapabilityChainHandoffView,
} from '@/activities/template-roadmap-capability-chain';
import { ACTIVITY_TEMPLATE_TYPES } from '@/activities/types';
import { WORKSHEET_MODE_TEMPLATES } from '@/activities/worksheet-modes';
import {
  DEFAULT_QUESTION_CHOICE_COUNT,
  QUESTION_CHOICE_GENERATION_HANDOFF_ITEM_IDS,
} from '@/activities/distractors';
import { PUBLIC_TEMPLATE_ENTRY_HANDOFF_ITEM_IDS } from '@/activities/entry-page-view';
import { FILL_BLANK_WORKSHEET_HANDOFF_ITEM_IDS } from '@/assignments/fill-blank-worksheet-handoff';
import { GROUP_SORT_BOARD_HANDOFF_ITEM_IDS } from '@/assignments/group-sort-board-handoff';
import { LINE_MATCH_BOARD_HANDOFF_ITEM_IDS } from '@/assignments/line-match-board-handoff';
import { LISTENING_SPEECH_HANDOFF_ITEM_IDS } from '@/assignments/listening-speech-handoff';
import { MATCHING_PAIRS_BOARD_HANDOFF_ITEM_IDS } from '@/assignments/matching-pairs-board-handoff';
import { OPEN_BOX_REVEAL_HANDOFF_ITEM_IDS } from '@/assignments/open-box-reveal-handoff';
import { PRINTABLE_WORKSHEET_HANDOFF_ITEM_IDS } from '@/assignments/printable-worksheet-view';
import { ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS } from '@/assignments/results-export';
import { STUDENT_RUNNER_PLAY_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/student-runner-play-chain';
import { WORKSHEET_MODE_DELIVERY_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/worksheet-mode-delivery-chain';
import { Routes } from '@/lib/routes';
import { ROADMAP_PUBLIC_HANDOFF_ITEM_IDS } from '@/pages/public-page-view';

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const PUBLIC_PAGE_VIEW_SOURCE = readFileSync(
  'src/pages/public-page-view.ts',
  'utf8'
);
const TEMPLATE_ENTRY_SOURCE = readFileSync(
  'src/activities/template-entry.ts',
  'utf8'
);
const ENTRY_PAGE_SOURCE = readFileSync(
  'src/activities/entry-page-view.ts',
  'utf8'
);
const SOURCE_EXTRACTION_SOURCE = readFileSync(
  'src/activities/source-extraction-assist.ts',
  'utf8'
);
const AI_AUTHORING_CHAIN_SOURCE = readFileSync(
  'src/activities/ai-authoring-chain.ts',
  'utf8'
);
const WORKSHEET_CHAIN_SOURCE = readFileSync(
  'src/assignments/worksheet-mode-delivery-chain.ts',
  'utf8'
);
const STUDENT_RUNNER_CHAIN_SOURCE = readFileSync(
  'src/assignments/student-runner-play-chain.ts',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const PRIVATE_ANSWER_KEY = 'SECRET_TEMPLATE_ROADMAP_ANSWER_KEY';
const PRIVATE_PROMPT = 'SECRET_TEMPLATE_ROADMAP_PROMPT';
const PRIVATE_RAW_AI_OUTPUT = 'SECRET_TEMPLATE_ROADMAP_RAW_AI_OUTPUT';
const PRIVATE_RAW_SOURCE_TEXT = 'SECRET_TEMPLATE_ROADMAP_RAW_SOURCE_TEXT';
const PRIVATE_SOURCE_FILE_ID = 'SECRET_TEMPLATE_ROADMAP_FILE_ID';
const PRIVATE_SOURCE_STORAGE_KEY = 'source-materials/private/roadmap.pdf';

test('template roadmap capability chain exposes 30 roadmap slices', () => {
  const handoffView = buildTemplateRoadmapCapabilityChainHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...TEMPLATE_ROADMAP_CAPABILITY_CHAIN_HANDOFF_ITEM_IDS,
  ]);
  assert.equal(handoffView.title, 'Template roadmap capability chain');
  assert.match(handoffView.description, /Thirty-slice template roadmap/);
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
    chainSourceFileCount: TEMPLATE_ROADMAP_CAPABILITY_CHAIN_SOURCE_FILES.length,
    createsAssignmentLinksWithoutTeacherAction: false,
    createsParallelWorksheetModel: false,
    exposesAnswerKeysToPublicPayload: false,
    exposesPromptTextInHandoff: false,
    exposesRawAiOutput: false,
    exposesRawSourceText: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialStorageKeys: false,
    itemIds,
    mutatesExistingAssignmentSnapshots: false,
    readsSourceMaterialFileBytes: false,
    requiresCreateActivityInputContract: true,
    requiresTeacherReviewBeforePersistence: true,
    sourceFiles: [...TEMPLATE_ROADMAP_CAPABILITY_CHAIN_SOURCE_FILES],
    usesSharedActivityAssignmentModel: true,
    usesAuthoringLibraryChain: true,
  });
  assertNoPrivateTemplateRoadmapText(JSON.stringify(handoffView));
});

test('template roadmap capability chain summarizes roadmap through delivery', () => {
  const handoffView = buildTemplateRoadmapCapabilityChainHandoffView();

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['product-roadmap-boundary', Routes.Roadmap],
      ['current-loop-signal', 'Create -> publish -> play -> results'],
      [
        'wordwall-template-set',
        `${ACTIVITY_TEMPLATE_TYPES.length} template modes`,
      ],
      [
        'liveworksheets-mode-set',
        `${WORKSHEET_MODE_TEMPLATES.length} worksheet modes`,
      ],
      ['public-template-entry', Routes.Templates],
      ['public-worksheet-entry', Routes.Worksheets],
      ['shared-create-editor', Routes.Create],
      ['template-scaffold-coverage', 'All template scaffolds'],
      ['create-input-contract', 'CreateActivityInput'],
      ['template-readiness-diagnosis', 'Ready and locked modes'],
      ['deterministic-remix-foundation', 'Ready targets first'],
      ['quiz-choice-generation', 'ActivityQuestion.options'],
      ['ai-draft-capability', 'Teacher-reviewed draft'],
      ['ai-remix-assist', 'Missing-field completion'],
      ['source-extraction-readiness', 'Future extraction paths'],
      ['teacher-audio-path', 'Listening draft readiness'],
      ['worksheet-extraction-path', 'Worksheet import readiness'],
      ['spreadsheet-import-path', 'Structured import readiness'],
      ['assignment-snapshot-extension', 'AssignmentSnapshot'],
      ['student-runtime-routing', 'Runtime item kind'],
      ['fill-blank-runtime', 'Inline blanks'],
      ['line-match-runtime', 'Connection board'],
      ['group-sort-runtime', 'Category board'],
      ['matching-pairs-runtime', 'Left/right cards'],
      ['listening-runtime', 'Speech track'],
      ['open-box-runtime', 'Reveal flow'],
      ['printable-follow-up', 'Teacher print route'],
      ['result-export-continuity', 'Shared result export'],
      ['privacy-model-guard', 'No parallel model'],
      ['authoring-library-chain-boundary', '30 authoring slices'],
    ]
  );
  assert.equal(
    getHandoffValue(handoffView, 'public-template-entry'),
    Routes.Templates
  );
  assert.equal(
    getHandoffValue(handoffView, 'shared-create-editor'),
    Routes.Create
  );
});

test('template roadmap capability chain is backed by focused gates', () => {
  assert.equal(TEMPLATE_ROADMAP_CAPABILITY_CHAIN_SOURCE_FILES.length, 30);
  for (const filePath of TEMPLATE_ROADMAP_CAPABILITY_CHAIN_SOURCE_FILES) {
    assert.ok(
      existsSync(filePath),
      `Missing template roadmap capability chain file ${filePath}`
    );
  }

  assert.deepEqual(ACTIVITY_TEMPLATE_TYPES, [
    'quiz',
    'match-up',
    'line-match',
    'group-sort',
    'fill-blank',
    'listening',
    'matching-pairs',
    'open-box',
  ]);
  assert.deepEqual(
    [...WORKSHEET_MODE_TEMPLATES],
    ['fill-blank', 'line-match', 'listening', 'group-sort']
  );
  assert.equal(DEFAULT_QUESTION_CHOICE_COUNT, 4);
  assert.deepEqual(
    [
      ROADMAP_PUBLIC_HANDOFF_ITEM_IDS.length,
      PUBLIC_TEMPLATE_ENTRY_HANDOFF_ITEM_IDS.length,
      ACTIVITY_AUTHORING_LIBRARY_CHAIN_HANDOFF_ITEM_IDS.length,
      ACTIVITY_TEMPLATE_SCAFFOLD_QUALITY_HANDOFF_ITEM_IDS.length,
      ACTIVITY_TEMPLATE_REMIX_HANDOFF_ITEM_IDS.length,
      QUESTION_CHOICE_GENERATION_HANDOFF_ITEM_IDS.length,
      ACTIVITY_AI_AUTHORING_CHAIN_HANDOFF_ITEM_IDS.length,
      ACTIVITY_AI_REMIX_ASSIST_HANDOFF_ITEM_IDS.length,
      ACTIVITY_SOURCE_EXTRACTION_ASSIST_HANDOFF_ITEM_IDS.length,
      WORKSHEET_MODE_DELIVERY_CHAIN_HANDOFF_ITEM_IDS.length,
      STUDENT_RUNNER_PLAY_CHAIN_HANDOFF_ITEM_IDS.length,
      FILL_BLANK_WORKSHEET_HANDOFF_ITEM_IDS.length,
      LINE_MATCH_BOARD_HANDOFF_ITEM_IDS.length,
      GROUP_SORT_BOARD_HANDOFF_ITEM_IDS.length,
      MATCHING_PAIRS_BOARD_HANDOFF_ITEM_IDS.length,
      LISTENING_SPEECH_HANDOFF_ITEM_IDS.length,
      OPEN_BOX_REVEAL_HANDOFF_ITEM_IDS.length,
      PRINTABLE_WORKSHEET_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS.length,
    ],
    Array.from({ length: 19 }, () => 30)
  );
});

test('template roadmap capability chain preserves product roadmap boundaries', () => {
  assert.match(
    PRODUCT_SOURCE,
    /## Near-Term Template Roadmap[\s\S]*Wordwall-style: quiz, match-up, group sort, matching pairs, open box\./,
    'docs/product.md should keep the Wordwall-style template roadmap explicit.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /Liveworksheets-style: fill blanks, worksheet layout, first listening prompts,[\s\S]*while preserving the activity-assignment\s+data model/,
    'docs/product.md should keep worksheet modes inside the shared activity-assignment data model.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /AI enhancements: source-to-activity drafts, template transforms, distractor\s+generation, leveled variants, answer explanations, listening scripts, and\s+worksheet extraction from teacher-uploaded material\./,
    'docs/product.md should keep AI enhancements teacher-reviewable and template-oriented.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /The AI layer must not bypass the activity editor or persist content directly/,
    'AI authoring should remain editor-reviewed rather than direct persistence.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /Printable follow-up and teacher-uploaded worksheet\s+extraction should extend the same assignment snapshot[\s\S]*result-export model instead of creating a parallel worksheet data shape\./,
    'Worksheet roadmap work should extend snapshots and result exports without a parallel model.'
  );
});

test('template roadmap capability sources align entries, status, and review gates', () => {
  assert.match(
    PUBLIC_PAGE_VIEW_SOURCE,
    /id: 'ai-assisted-activity-drafting'[\s\S]*status: 'available'/,
    'Roadmap should mark AI-assisted activity drafting as available.'
  );
  assert.match(
    PUBLIC_PAGE_VIEW_SOURCE,
    /id: 'worksheet-style-delivery'[\s\S]*status: 'improving'/,
    'Roadmap should mark worksheet-style delivery as improving.'
  );
  assert.match(
    PUBLIC_PAGE_VIEW_SOURCE,
    /id: 'worksheet-extraction'[\s\S]*status: 'planned'/,
    'Roadmap should keep worksheet extraction as planned future work.'
  );
  assert.match(
    TEMPLATE_ENTRY_SOURCE,
    /buildTemplateEntryAction[\s\S]*search: buildTemplateCreateSearch\(template\.type, 'templates'\)[\s\S]*to: Routes\.Create/,
    'Template entry actions should route into the shared create editor.'
  );
  assert.match(
    TEMPLATE_ENTRY_SOURCE,
    /buildWorksheetModeEntryAction[\s\S]*search: buildTemplateCreateSearch\(mode\.template, 'worksheets'\)[\s\S]*to: Routes\.Create/,
    'Worksheet entry actions should route into the shared create editor.'
  );
  assert.match(
    ENTRY_PAGE_SOURCE,
    /buildWorksheetsPageViewModel[\s\S]*surface: 'worksheets'[\s\S]*modeCards: worksheetModeDefinitions\.map/,
    'Worksheet page view model should use shared template-entry handoff and mode cards.'
  );
  assert.match(
    SOURCE_EXTRACTION_SOURCE,
    /audio-draft-path[\s\S]*worksheet-extraction-path[\s\S]*spreadsheet-import-path[\s\S]*targetModel: 'ActivityContent'/,
    'Source extraction assist should keep audio, worksheet, and spreadsheet paths targeting ActivityContent.'
  );
});

test('template roadmap capability sources preserve privacy model boundaries', () => {
  assert.match(
    AI_AUTHORING_CHAIN_SOURCE,
    /createsAssignmentLinks: false[\s\S]*exposesFileBytesToAi: false[\s\S]*exposesRawProviderResponse: false[\s\S]*persistsActivityWithoutTeacherAction: false[\s\S]*requiresTeacherReview: true/,
    'AI authoring chain should require teacher review and avoid file bytes, raw provider output, and direct persistence.'
  );
  assert.match(
    SOURCE_EXTRACTION_SOURCE,
    /createsParallelWorksheetModel: false[\s\S]*exposesFileBytes: false[\s\S]*persistsActivityWithoutTeacherAction: false[\s\S]*readsSourceMaterialBytes: false[\s\S]*requiresEditorReview: true/,
    'Source extraction assist should not read bytes or persist without editor review.'
  );
  assert.match(
    WORKSHEET_CHAIN_SOURCE,
    /createsParallelWorksheetModel: false[\s\S]*exposesAnswerKeysToPublicPayload: false[\s\S]*requiresAssignmentSnapshot: true[\s\S]*requiresCreateActivityInputContract: true/,
    'Worksheet chain should avoid a parallel model and preserve snapshots, public answer-key privacy, and create input contract.'
  );
  assert.match(
    STUDENT_RUNNER_CHAIN_SOURCE,
    /publicPayloadUsesSanitizedRuntimeItems: true[\s\S]*rejectsClosedOrExpiredSubmissions: true[\s\S]*rejectsInvalidSubmittedAnswers: true[\s\S]*submissionPayloadUsesRuntimeItemIds: true/,
    'Student runner chain should keep template runtimes on sanitized payloads and shared submission validation.'
  );
});

test('template roadmap capability chain focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /Template roadmap capability chain has a fast script-level gate via[\s\S]*scripts\/template-roadmap-capability-chain-handoff\.test\.ts/,
    'TEST-CATALOG should document the template roadmap capability chain gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /roadmap template promises[\s\S]*Wordwall-style templates[\s\S]*Liveworksheets-style modes[\s\S]*AI enhancements[\s\S]*worksheet delivery[\s\S]*print follow-up[\s\S]*result\s+export\s+continuity/,
    'TEST-CATALOG should describe the full template roadmap capability chain scope.'
  );
});

function getHandoffValue(
  view: TemplateRoadmapCapabilityChainHandoffView,
  id: TemplateRoadmapCapabilityChainHandoffItemId
) {
  const item = view.itemViews.find((candidate) => candidate.id === id);
  assert.ok(item, `Missing template roadmap capability chain item ${id}`);
  return item.value;
}

function assertNoPrivateTemplateRoadmapText(serializedView: string) {
  for (const privateValue of [
    PRIVATE_ANSWER_KEY,
    PRIVATE_PROMPT,
    PRIVATE_RAW_AI_OUTPUT,
    PRIVATE_RAW_SOURCE_TEXT,
    PRIVATE_SOURCE_FILE_ID,
    PRIVATE_SOURCE_STORAGE_KEY,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Template roadmap capability chain leaked private text: ${privateValue}`
    );
  }
}
