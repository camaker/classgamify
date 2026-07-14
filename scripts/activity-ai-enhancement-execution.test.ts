import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVITY_AI_ENHANCEMENT_EXECUTION_ITEM_IDS,
  buildActivityAiEnhancementExecutionPlan,
  buildActivityAiEnhancementExecutionView,
  type ActivityAiEnhancementExecutionSource,
} from '@/activities/ai-enhancement-execution';
import { ACTIVITY_AI_ENHANCEMENT_POLICY_ITEM_IDS } from '@/activities/ai-enhancement-policy';
import type {
  ActivityContent,
  ActivityMaterialReference,
} from '@/activities/types';

const PRIVATE_ANSWER_KEY = 'SECRET_AI_EXECUTION_ANSWER_KEY';
const PRIVATE_DRAFT_TEXT = 'SECRET_AI_EXECUTION_DRAFT_TEXT';
const PRIVATE_FILE_BYTES = 'SECRET_AI_EXECUTION_FILE_BYTES';
const PRIVATE_PROVIDER_OUTPUT = 'SECRET_AI_EXECUTION_PROVIDER_OUTPUT';
const PRIVATE_RAW_SOURCE_TEXT = 'SECRET_AI_EXECUTION_SOURCE_TEXT';
const PRIVATE_SOURCE_FILE_ID = 'secret-execution-file-id';
const PRIVATE_SOURCE_STORAGE_KEY =
  'source-materials/private/ai-execution-policy.pdf';

const EXECUTION_SOURCE = readFileSync(
  'src/activities/ai-enhancement-execution.ts',
  'utf8'
);
const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('activity AI enhancement execution exposes 30 stable plan slices', () => {
  const view = buildActivityAiEnhancementExecutionView(
    createExecutionSource({
      enhancementKind: 'answer-explanation',
      hasAuthenticatedTeacher: true,
      providerConfigured: true,
    })
  );
  const itemIds = view.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...ACTIVITY_AI_ENHANCEMENT_EXECUTION_ITEM_IDS]);
  assert.equal(itemIds.length, 30);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(view.title, 'Activity AI enhancement execution');
  assert.equal(view.plan.status, 'provider-ready');
  assert.equal(view.plan.mode, 'provider');
  assert.equal(view.plan.canExecute, true);
  assert.equal(view.plan.usesExternalProvider, true);
  assert.deepEqual(view.privacy, {
    blocksWithoutAuthenticatedTeacher: true,
    createsAssignmentLinksWithoutTeacherAction: false,
    exposesActivityContentText: false,
    exposesAnswerKeysToPublicPayload: false,
    exposesDraftText: false,
    exposesFileBytesToAi: false,
    exposesRawAiOutput: false,
    exposesRawSourceText: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialFilenames: false,
    exposesSourceMaterialStorageKeys: false,
    itemIds,
    mutatesExistingAssignmentSnapshots: false,
    persistsActivityWithoutTeacherAction: false,
    publishesAssignmentWithoutTeacherAction: false,
    readsSourceMaterialBytes: false,
    requiresEditorReview: true,
    scope: 'activity-ai-enhancement-execution',
    usesPolicyHandoff: true,
    usesPolicyDecision: true,
  });
  assertNoPrivateExecutionText(JSON.stringify(view));
});

test('activity AI enhancement execution chooses local fallback without provider credentials', () => {
  const plan = buildActivityAiEnhancementExecutionPlan(
    createExecutionSource({
      enhancementKind: 'answer-explanation',
      hasAuthenticatedTeacher: true,
      providerConfigured: false,
    })
  );

  assert.equal(plan.status, 'local-fallback-ready');
  assert.equal(plan.mode, 'local-fallback');
  assert.equal(plan.canExecute, true);
  assert.equal(plan.usesLocalFallback, true);
  assert.equal(plan.usesExternalProvider, false);
  assert.equal(plan.persistenceMode, 'not-persisted');
  assert.equal(plan.draftTarget, 'editor-only');
});

test('activity AI enhancement execution uses deterministic draft for ready remixes', () => {
  const plan = buildActivityAiEnhancementExecutionPlan(
    createExecutionSource({
      currentTemplateType: 'quiz',
      enhancementKind: 'ai-remix-completion',
      hasAuthenticatedTeacher: true,
      providerConfigured: true,
      targetTemplateType: 'match-up',
    })
  );

  assert.equal(plan.policy.status, 'deterministic-draft-available');
  assert.equal(plan.status, 'deterministic-draft');
  assert.equal(plan.mode, 'deterministic-draft');
  assert.equal(plan.usesDeterministicDraft, true);
  assert.equal(plan.usesExternalProvider, false);
});

test('activity AI enhancement execution blocks unauthenticated and archived sources', () => {
  const unauthenticated = buildActivityAiEnhancementExecutionPlan(
    createExecutionSource({
      hasAuthenticatedTeacher: false,
      providerConfigured: true,
    })
  );
  const archived = buildActivityAiEnhancementExecutionPlan(
    createExecutionSource({
      enhancementKind: 'leveled-variant',
      hasAuthenticatedTeacher: true,
      providerConfigured: true,
      visibility: 'archived',
    })
  );

  assert.equal(unauthenticated.status, 'blocked');
  assert.equal(unauthenticated.blockedReason, 'teacher-auth-required');
  assert.equal(unauthenticated.canExecute, false);
  assert.equal(archived.status, 'blocked');
  assert.equal(archived.blockedReason, 'restore-source-first');
  assert.equal(archived.usesExternalProvider, false);
});

test('activity AI enhancement execution blocks missing source material or structure', () => {
  const missingWorksheet = buildActivityAiEnhancementExecutionPlan(
    createExecutionSource({
      content: createActivityContent({ sourceMaterials: [] }),
      enhancementKind: 'worksheet-extraction',
      hasAuthenticatedTeacher: true,
      providerConfigured: true,
    })
  );
  const missingStructure = buildActivityAiEnhancementExecutionPlan(
    createExecutionSource({
      content: createActivityContent({
        groups: [],
        pairs: [],
      }),
      currentTemplateType: 'quiz',
      enhancementKind: 'template-transform',
      hasAuthenticatedTeacher: true,
      providerConfigured: true,
      targetTemplateType: 'group-sort',
    })
  );

  assert.equal(missingWorksheet.status, 'blocked');
  assert.equal(missingWorksheet.blockedReason, 'source-material-required');
  assert.equal(missingStructure.status, 'blocked');
  assert.equal(missingStructure.blockedReason, 'structured-content-required');
});

test('activity AI enhancement execution summarizes safe source readiness only', () => {
  const view = buildActivityAiEnhancementExecutionView(
    createExecutionSource({
      content: createActivityContent({
        sourceMaterials: [
          createMaterial({
            fileId: PRIVATE_SOURCE_FILE_ID,
            kind: 'audio',
            originalName: 'speaking prompt.mp3',
          }),
          createMaterial({
            fileId: 'worksheet-file-id',
            kind: 'worksheet-image',
            originalName: 'worksheet.png',
          }),
        ],
      }),
      enhancementKind: 'audio-extraction',
      hasAuthenticatedTeacher: true,
      providerConfigured: true,
    })
  );
  const values = new Map(view.itemViews.map((item) => [item.id, item.value]));

  assert.equal(
    values.get('source-material-readiness'),
    '1 audio / 1 worksheet / 0 spreadsheet'
  );
  assert.equal(values.get('provider-call-boundary'), 'Provider call allowed');
  assert.equal(values.get('policy-handoff-boundary'), '30 policy slices');
  assertNoPrivateExecutionText(JSON.stringify(view));
});

test('activity AI enhancement execution gate is wired into docs and domain coverage', () => {
  assert.equal(existsSync('src/activities/ai-enhancement-execution.ts'), true);
  assert.equal(ACTIVITY_AI_ENHANCEMENT_POLICY_ITEM_IDS.length, 30);
  assert.match(
    EXECUTION_SOURCE,
    /export const ACTIVITY_AI_ENHANCEMENT_EXECUTION_ITEM_IDS = \[[\s\S]*'execution-scope'[\s\S]*'policy-source'[\s\S]*'provider-mode'[\s\S]*'local-fallback-mode'[\s\S]*'deterministic-draft-mode'[\s\S]*'auth-gate'[\s\S]*'source-byte-guard'[\s\S]*'result-export-continuity'[\s\S]*'policy-handoff-boundary'/,
    'Execution source should preserve the 30-slice AI enhancement execution boundary.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /src\/activities\/ai-enhancement-execution\.ts` owns the structured execution\s+plan[\s\S]*30-slice request-policy handoff/,
    'docs/product.md should document the AI enhancement execution owner.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Activity AI enhancement execution has a fast script-level gate via[\s\S]*scripts\/activity-ai-enhancement-execution\.test\.ts[\s\S]*provider-ready[\s\S]*local-fallback[\s\S]*deterministic-draft[\s\S]*blocked-reason[\s\S]*editor-only draft targets[\s\S]*privacy guards/,
    'TEST-CATALOG should document the AI enhancement execution gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /30-slice\s+policy\s+handoff/,
    'TEST-CATALOG should document the policy handoff.'
  );
});

function createExecutionSource(
  overrides: Partial<ActivityAiEnhancementExecutionSource> = {}
): ActivityAiEnhancementExecutionSource {
  return {
    content: createActivityContent(),
    currentTemplateType: 'quiz',
    hasAuthenticatedTeacher: true,
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
        explanation: 'Evaporation changes liquid into vapor.',
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
    sourceMaterials: [],
    sourceSummary: 'Teacher notes about the water cycle.',
    subject: 'Science',
    teacherNotes: ['Ask students to explain their reasoning.'],
    vocabulary: ['evaporation', 'condensation', 'precipitation'],
    ...overrides,
  };
}

function createMaterial(
  material: ActivityMaterialReference
): ActivityMaterialReference {
  return material;
}

function assertNoPrivateExecutionText(serializedView: string) {
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
      `AI enhancement execution leaked private text: ${privateValue}`
    );
  }
}
