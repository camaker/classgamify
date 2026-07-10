import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVITY_AI_ENHANCEMENT_DRAFT_OUTPUT_ITEM_IDS,
  buildActivityAiEnhancementDraftOutputPlan,
  buildActivityAiEnhancementDraftOutputView,
  type ActivityAiEnhancementDraftOutputSource,
} from '@/activities/ai-enhancement-draft-output';
import type {
  ActivityContent,
  ActivityMaterialReference,
} from '@/activities/types';
import type { CreateActivityInput } from '@/activities/validation';

const PRIVATE_ANSWER_KEY = 'SECRET_AI_OUTPUT_ANSWER_KEY';
const PRIVATE_DRAFT_TEXT = 'SECRET_AI_OUTPUT_DRAFT_TEXT';
const PRIVATE_FILE_BYTES = 'SECRET_AI_OUTPUT_FILE_BYTES';
const PRIVATE_PROVIDER_OUTPUT = 'SECRET_AI_OUTPUT_PROVIDER_OUTPUT';
const PRIVATE_RAW_SOURCE_TEXT = 'SECRET_AI_OUTPUT_SOURCE_TEXT';
const PRIVATE_SOURCE_FILE_ID = 'secret-output-file-id';
const PRIVATE_SOURCE_STORAGE_KEY = 'source-materials/private/ai-output.pdf';

const OUTPUT_SOURCE = readFileSync(
  'src/activities/ai-enhancement-draft-output.ts',
  'utf8'
);
const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('activity AI enhancement draft output exposes 30 stable slices', () => {
  const view = buildActivityAiEnhancementDraftOutputView(
    createOutputSource({
      enhancementKind: 'answer-explanation',
      providerConfigured: true,
    })
  );
  const itemIds = view.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...ACTIVITY_AI_ENHANCEMENT_DRAFT_OUTPUT_ITEM_IDS]);
  assert.equal(itemIds.length, 30);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(view.title, 'Activity AI enhancement draft output');
  assert.equal(view.plan.status, 'normalized-draft-ready');
  assert.equal(view.plan.validationStatus, 'valid');
  assert.equal(view.plan.canPassToEditorApplication, true);
  assert.equal(view.plan.outputSource, 'provider');
  assert.deepEqual(view.privacy, {
    appliesAfterExecutionPlan: true,
    appliesBeforeEditorApplication: true,
    createsAssignmentLinksWithoutTeacherAction: false,
    exposesAnswerKeysToPublicPayload: false,
    exposesAnswerText: false,
    exposesDraftText: false,
    exposesFileBytesToAi: false,
    exposesQuestionPromptText: false,
    exposesRawAiOutput: false,
    exposesRawSourceText: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialFilenames: false,
    exposesSourceMaterialStorageKeys: false,
    itemIds,
    mutatesExistingAssignmentSnapshots: false,
    normalizesCreateActivityInput: true,
    persistsActivityWithoutTeacherAction: false,
    publishesAssignmentWithoutTeacherAction: false,
    readsSourceMaterialBytes: false,
    requiresEditorReview: true,
    scope: 'activity-ai-enhancement-draft-output',
    usesDraftMeta: true,
    usesExecutionPlan: true,
  });
  assertNoPrivateOutputText(JSON.stringify(view));
});

test('activity AI enhancement draft output summarizes normalized coverage only', () => {
  const view = buildActivityAiEnhancementDraftOutputView(
    createOutputSource({
      enhancementKind: 'answer-explanation',
      providerConfigured: true,
    })
  );
  const values = new Map(view.itemViews.map((item) => [item.id, item.value]));

  assert.equal(view.plan.execution.status, 'provider-ready');
  assert.equal(view.plan.coveredFieldTargetCount, 2);
  assert.equal(view.plan.fieldTargetCount, 2);
  assert.equal(view.plan.contentCoverage.questions, 1);
  assert.equal(view.plan.contentCoverage.sourceMaterials, 1);
  assert.equal(values.get('field-target-coverage'), '2/2 targets');
  assert.equal(
    values.get('create-input-contract'),
    'CreateActivityInput valid'
  );
  assert.equal(
    values.get('source-material-guard'),
    '1 references / storage hidden'
  );
  assert.equal(values.get('raw-output-guard'), 'Raw output hidden');
  assert.equal(values.get('provider-output-path'), 'Provider output selected');
});

test('activity AI enhancement draft output supports fallback and deterministic output paths', () => {
  const fallback = buildActivityAiEnhancementDraftOutputPlan(
    createOutputSource({
      enhancementKind: 'answer-explanation',
      providerConfigured: false,
    })
  );
  const deterministic = buildActivityAiEnhancementDraftOutputPlan(
    createOutputSource({
      currentTemplateType: 'quiz',
      enhancementKind: 'ai-remix-completion',
      providerConfigured: true,
      targetTemplateType: 'match-up',
    })
  );

  assert.equal(fallback.outputSource, 'local-fallback');
  assert.equal(fallback.usesLocalFallbackOutput, true);
  assert.equal(fallback.status, 'normalized-draft-ready');
  assert.equal(deterministic.outputSource, 'deterministic-draft');
  assert.equal(deterministic.usesDeterministicOutput, true);
  assert.equal(deterministic.status, 'normalized-draft-ready');
  assert.equal(deterministic.canPassToEditorApplication, true);
});

test('activity AI enhancement draft output blocks, waits, and rejects invalid output', () => {
  const unauthenticated = buildActivityAiEnhancementDraftOutputPlan(
    createOutputSource({
      hasAuthenticatedTeacher: false,
      providerConfigured: true,
    })
  );
  const awaitingOutput = buildActivityAiEnhancementDraftOutputPlan(
    createOutputSource({
      parsedDraft: null,
      providerConfigured: true,
    })
  );
  const invalidSchema = buildActivityAiEnhancementDraftOutputPlan(
    createOutputSource({
      parsedDraft: {
        ...createParsedDraft(),
        title: 'x',
      } as CreateActivityInput,
      providerConfigured: true,
    })
  );
  const invalidContent = buildActivityAiEnhancementDraftOutputPlan(
    createOutputSource({
      parsedDraft: {
        ...createParsedDraft(),
        groupsText: '',
        templateType: 'group-sort',
      },
      providerConfigured: true,
    })
  );

  assert.equal(unauthenticated.status, 'blocked-before-output');
  assert.equal(unauthenticated.validationStatus, 'blocked');
  assert.equal(unauthenticated.outputSource, 'unavailable');
  assert.equal(unauthenticated.canPassToEditorApplication, false);
  assert.equal(awaitingOutput.status, 'awaiting-output');
  assert.equal(awaitingOutput.validationStatus, 'missing');
  assert.equal(invalidSchema.status, 'rejected-output');
  assert.equal(invalidSchema.validationStatus, 'invalid-schema');
  assert.equal(invalidContent.status, 'rejected-output');
  assert.equal(invalidContent.validationStatus, 'invalid-content');
  assert.equal(invalidContent.contentCoverage.questions, 1);
});

test('activity AI enhancement draft output gate is wired into docs and coverage', () => {
  assert.equal(
    existsSync('src/activities/ai-enhancement-draft-output.ts'),
    true
  );
  assert.match(
    OUTPUT_SOURCE,
    /export const ACTIVITY_AI_ENHANCEMENT_DRAFT_OUTPUT_ITEM_IDS = \[[\s\S]*'output-scope'[\s\S]*'execution-plan-source'[\s\S]*'parser-boundary'[\s\S]*'schema-validation'[\s\S]*'normalized-draft'[\s\S]*'snapshot-result-continuity'/,
    'Draft output source should preserve the 30-slice output boundary.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /src\/activities\/ai-enhancement-draft-output\.ts` owns parsed AI enhancement draft output/,
    'docs/product.md should document the AI enhancement draft output owner.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Activity AI enhancement draft output has a fast script-level gate via[\s\S]*scripts\/activity-ai-enhancement-draft-output\.test\.ts[\s\S]*provider\/fallback\/deterministic output[\s\S]*CreateActivityInput parsing[\s\S]*normalized output counts[\s\S]*editor-application boundaries[\s\S]*privacy guards/,
    'TEST-CATALOG should document the AI enhancement draft output gate.'
  );
});

function createOutputSource(
  overrides: Partial<ActivityAiEnhancementDraftOutputSource> = {}
): ActivityAiEnhancementDraftOutputSource {
  return {
    content: createActivityContent(),
    currentTemplateType: 'quiz',
    hasAuthenticatedTeacher: true,
    parsedDraft: createParsedDraft(),
    ...overrides,
  };
}

function createActivityContent(
  overrides: Partial<ActivityContent> = {}
): ActivityContent {
  return {
    difficulty: 'starter',
    gradeBand: 'Grade 5',
    groups: [
      {
        id: 'g1',
        items: ['evaporation', 'condensation'],
        label: 'Water cycle',
      },
    ],
    language: 'en',
    learningGoal: 'Review water cycle vocabulary.',
    pairs: [
      {
        id: 'p1',
        left: 'evaporation',
        right: 'Liquid water becomes vapor',
      },
    ],
    questions: [
      {
        answer: 'evaporation',
        explanation: 'Evaporation changes liquid water into vapor.',
        id: 'q1',
        options: [
          { id: 'q1-a', text: 'evaporation' },
          { id: 'q1-b', text: 'condensation' },
          { id: 'q1-c', text: 'precipitation' },
          { id: 'q1-d', text: 'collection' },
        ],
        prompt: 'Which process turns liquid water into vapor?',
      },
    ],
    sourceMaterials: [
      createMaterial({
        fileId: PRIVATE_SOURCE_FILE_ID,
        kind: 'audio',
        originalName: 'speaking prompt.mp3',
      }),
    ],
    sourceSummary: 'Teacher notes about the water cycle.',
    subject: 'Science',
    teacherNotes: ['Ask students to explain their reasoning.'],
    vocabulary: ['evaporation', 'condensation', 'precipitation'],
    ...overrides,
  };
}

function createParsedDraft(
  overrides: Partial<CreateActivityInput> = {}
): CreateActivityInput {
  return {
    description: PRIVATE_DRAFT_TEXT,
    difficulty: 'starter',
    gradeBand: 'Grade 5',
    groupsText: 'Water cycle | evaporation, condensation',
    language: 'en',
    learningGoal: 'Review water cycle vocabulary.',
    pairsText: 'evaporation | Liquid water becomes vapor',
    questionsText: `Which process turns liquid water into vapor? | ${PRIVATE_ANSWER_KEY} / evaporation | evaporation; condensation; precipitation; collection | Evaporation changes liquid water into vapor.`,
    sourceMaterials: [
      {
        fileId: PRIVATE_SOURCE_FILE_ID,
        kind: 'audio',
        originalName: 'speaking prompt.mp3',
      },
    ],
    sourceSummary: PRIVATE_RAW_SOURCE_TEXT,
    subject: 'Science',
    teacherNotesText: 'Ask students to explain their reasoning.',
    templateType: 'quiz',
    title: 'Water Cycle Review',
    visibility: 'draft',
    vocabularyText: 'evaporation, condensation, precipitation',
    ...overrides,
  };
}

function createMaterial(
  material: ActivityMaterialReference
): ActivityMaterialReference {
  return material;
}

function assertNoPrivateOutputText(serializedView: string) {
  for (const privateValue of [
    PRIVATE_ANSWER_KEY,
    PRIVATE_DRAFT_TEXT,
    PRIVATE_FILE_BYTES,
    PRIVATE_PROVIDER_OUTPUT,
    PRIVATE_RAW_SOURCE_TEXT,
    PRIVATE_SOURCE_FILE_ID,
    PRIVATE_SOURCE_STORAGE_KEY,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `AI enhancement draft output leaked private text: ${privateValue}`
    );
  }
}
