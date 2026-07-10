import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVITY_AI_ENHANCEMENT_DRAFT_APPLICATION_ITEM_IDS,
  buildActivityAiEnhancementDraftApplicationPlan,
  buildActivityAiEnhancementDraftApplicationView,
  type ActivityAiEnhancementDraftApplicationSource,
} from '@/activities/ai-enhancement-draft-application';
import type {
  ActivityContent,
  ActivityMaterialReference,
} from '@/activities/types';
import type { CreateActivityInput } from '@/activities/validation';

const PRIVATE_ANSWER_KEY = 'SECRET_AI_APPLICATION_ANSWER_KEY';
const PRIVATE_DRAFT_TEXT = 'SECRET_AI_APPLICATION_DRAFT_TEXT';
const PRIVATE_FILE_BYTES = 'SECRET_AI_APPLICATION_FILE_BYTES';
const PRIVATE_PROVIDER_OUTPUT = 'SECRET_AI_APPLICATION_PROVIDER_OUTPUT';
const PRIVATE_RAW_SOURCE_TEXT = 'SECRET_AI_APPLICATION_SOURCE_TEXT';
const PRIVATE_SOURCE_FILE_ID = 'secret-application-file-id';
const PRIVATE_SOURCE_STORAGE_KEY =
  'source-materials/private/ai-application.pdf';

const APPLICATION_SOURCE = readFileSync(
  'src/activities/ai-enhancement-draft-application.ts',
  'utf8'
);
const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('activity AI enhancement draft application exposes 30 stable slices', () => {
  const view = buildActivityAiEnhancementDraftApplicationView(
    createApplicationSource({
      enhancementKind: 'answer-explanation',
      providerConfigured: true,
    })
  );
  const itemIds = view.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...ACTIVITY_AI_ENHANCEMENT_DRAFT_APPLICATION_ITEM_IDS,
  ]);
  assert.equal(itemIds.length, 30);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(view.title, 'Activity AI enhancement draft application');
  assert.equal(view.plan.applicationStatus, 'ready-for-editor-review');
  assert.equal(view.plan.validationStatus, 'valid');
  assert.equal(view.plan.canApplyToEditor, true);
  assert.equal(view.plan.draftTarget, 'editor-only');
  assert.deepEqual(view.privacy, {
    appliesAfterExecutionPlan: true,
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
    fillsEditorOnly: true,
    itemIds,
    mutatesExistingAssignmentSnapshots: false,
    persistsActivityWithoutTeacherAction: false,
    publishesAssignmentWithoutTeacherAction: false,
    readsSourceMaterialBytes: false,
    requiresCreateActivityInputContract: true,
    requiresEditorReview: true,
    scope: 'activity-ai-enhancement-draft-application',
    usesDraftMeta: true,
    usesExecutionPlan: true,
    usesTemplateReadinessDomain: true,
  });
  assertNoPrivateApplicationText(JSON.stringify(view));
});

test('activity AI enhancement draft application refreshes coverage and readiness', () => {
  const view = buildActivityAiEnhancementDraftApplicationView(
    createApplicationSource({
      enhancementKind: 'answer-explanation',
      providerConfigured: true,
    })
  );
  const values = new Map(view.itemViews.map((item) => [item.id, item.value]));

  assert.equal(view.plan.execution.status, 'provider-ready');
  assert.equal(view.plan.coveredFieldTargetCount, 2);
  assert.equal(view.plan.fieldTargetCount, 2);
  assert.equal(view.plan.readyTemplateCount > 0, true);
  assert.equal(view.plan.reviewChecklistCount > 0, true);
  assert.equal(values.get('field-target-coverage'), '2/2 targets');
  assert.equal(
    values.get('create-input-contract'),
    'CreateActivityInput valid'
  );
  assert.match(
    values.get('template-readiness-refresh') ?? '',
    /^\d+ ready \/ \d+ locked$/
  );
  assert.equal(
    values.get('source-provenance-summary'),
    '2 references / 2 kinds'
  );
  assert.equal(values.get('raw-provider-output-guard'), 'Parsed draft only');
});

test('activity AI enhancement draft application handles fallback and deterministic modes', () => {
  const localFallback = buildActivityAiEnhancementDraftApplicationPlan(
    createApplicationSource({
      enhancementKind: 'answer-explanation',
      providerConfigured: false,
    })
  );
  const deterministic = buildActivityAiEnhancementDraftApplicationPlan(
    createApplicationSource({
      currentTemplateType: 'quiz',
      enhancementKind: 'ai-remix-completion',
      providerConfigured: true,
      targetTemplateType: 'match-up',
    })
  );

  assert.equal(localFallback.execution.status, 'local-fallback-ready');
  assert.equal(localFallback.execution.usesLocalFallback, true);
  assert.equal(localFallback.applicationStatus, 'ready-for-editor-review');
  assert.equal(deterministic.execution.status, 'deterministic-draft');
  assert.equal(deterministic.execution.usesDeterministicDraft, true);
  assert.equal(deterministic.validationStatus, 'valid');
  assert.equal(deterministic.canApplyToEditor, true);
});

test('activity AI enhancement draft application blocks before unavailable execution', () => {
  const unauthenticated = buildActivityAiEnhancementDraftApplicationPlan(
    createApplicationSource({
      hasAuthenticatedTeacher: false,
      providerConfigured: true,
    })
  );
  const archived = buildActivityAiEnhancementDraftApplicationPlan(
    createApplicationSource({
      enhancementKind: 'leveled-variant',
      providerConfigured: true,
      visibility: 'archived',
    })
  );

  assert.equal(unauthenticated.applicationStatus, 'blocked-before-draft');
  assert.equal(unauthenticated.validationStatus, 'blocked');
  assert.equal(
    unauthenticated.execution.blockedReason,
    'teacher-auth-required'
  );
  assert.equal(unauthenticated.canApplyToEditor, false);
  assert.equal(archived.applicationStatus, 'blocked-before-draft');
  assert.equal(archived.execution.blockedReason, 'restore-source-first');
  assert.equal(archived.canApplyToEditor, false);
});

test('activity AI enhancement draft application waits for and validates draft output', () => {
  const awaitingDraft = buildActivityAiEnhancementDraftApplicationPlan(
    createApplicationSource({
      proposedDraft: null,
      providerConfigured: true,
    })
  );
  const invalidSchema = buildActivityAiEnhancementDraftApplicationPlan(
    createApplicationSource({
      proposedDraft: {
        ...createProposedDraft(),
        title: 'x',
      } as CreateActivityInput,
      providerConfigured: true,
    })
  );
  const invalidTemplateContent = buildActivityAiEnhancementDraftApplicationPlan(
    createApplicationSource({
      proposedDraft: {
        ...createProposedDraft(),
        groupsText: '',
        templateType: 'group-sort',
      },
      providerConfigured: true,
    })
  );

  assert.equal(awaitingDraft.applicationStatus, 'awaiting-draft-output');
  assert.equal(awaitingDraft.validationStatus, 'missing');
  assert.equal(awaitingDraft.canApplyToEditor, false);
  assert.equal(invalidSchema.applicationStatus, 'invalid-draft');
  assert.equal(invalidSchema.validationStatus, 'invalid');
  assert.equal(invalidSchema.canApplyToEditor, false);
  assert.equal(invalidTemplateContent.applicationStatus, 'invalid-draft');
  assert.equal(invalidTemplateContent.validationStatus, 'invalid');
  assert.equal(invalidTemplateContent.contentCoverage.questions, 1);
  assert.equal(invalidTemplateContent.canApplyToEditor, false);
});

test('activity AI enhancement draft application gate is wired into docs and coverage', () => {
  assert.equal(
    existsSync('src/activities/ai-enhancement-draft-application.ts'),
    true
  );
  assert.match(
    APPLICATION_SOURCE,
    /export const ACTIVITY_AI_ENHANCEMENT_DRAFT_APPLICATION_ITEM_IDS = \[[\s\S]*'application-scope'[\s\S]*'execution-plan-source'[\s\S]*'draft-contract-validation'[\s\S]*'field-target-coverage'[\s\S]*'teacher-review-gate'[\s\S]*'result-export-continuity'/,
    'Draft application source should preserve the 30-slice application boundary.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /src\/activities\/ai-enhancement-draft-application\.ts` owns the editor-only draft application\s+contract/,
    'docs/product.md should document the AI enhancement draft application owner.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Activity AI enhancement draft application has a fast script-level gate via[\s\S]*scripts\/activity-ai-enhancement-draft-application\.test\.ts[\s\S]*execution plans[\s\S]*CreateActivityInput validation[\s\S]*editor-only application[\s\S]*coverage\/readiness refresh[\s\S]*privacy guards/,
    'TEST-CATALOG should document the AI enhancement draft application gate.'
  );
});

function createApplicationSource(
  overrides: Partial<ActivityAiEnhancementDraftApplicationSource> = {}
): ActivityAiEnhancementDraftApplicationSource {
  return {
    content: createActivityContent(),
    currentTemplateType: 'quiz',
    hasAuthenticatedTeacher: true,
    proposedDraft: createProposedDraft(),
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
      createMaterial({
        fileId: 'worksheet-file-id',
        kind: 'worksheet-document',
        originalName: 'worksheet.pdf',
      }),
    ],
    sourceSummary: 'Teacher notes about the water cycle.',
    subject: 'Science',
    teacherNotes: ['Ask students to explain their reasoning.'],
    vocabulary: ['evaporation', 'condensation', 'precipitation'],
    ...overrides,
  };
}

function createProposedDraft(
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

function assertNoPrivateApplicationText(serializedView: string) {
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
      `AI enhancement draft application leaked private text: ${privateValue}`
    );
  }
}
