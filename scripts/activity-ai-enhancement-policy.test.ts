import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVITY_AI_ENHANCEMENT_KINDS,
  ACTIVITY_AI_ENHANCEMENT_POLICY_ITEM_IDS,
  buildActivityAiEnhancementPolicyDecision,
  buildActivityAiEnhancementPolicyTargetFields,
  buildActivityAiEnhancementPolicyView,
  type ActivityAiEnhancementPolicySource,
} from '@/activities/ai-enhancement-policy';
import type {
  ActivityContent,
  ActivityMaterialReference,
} from '@/activities/types';

const PRIVATE_ANSWER_KEY = 'SECRET_AI_ENHANCEMENT_POLICY_ANSWER_KEY';
const PRIVATE_FILE_BYTES = 'SECRET_AI_ENHANCEMENT_POLICY_FILE_BYTES';
const PRIVATE_PROVIDER_OUTPUT = 'SECRET_AI_ENHANCEMENT_POLICY_RAW_OUTPUT';
const PRIVATE_RAW_SOURCE_TEXT = 'SECRET_AI_ENHANCEMENT_POLICY_SOURCE_TEXT';
const PRIVATE_SOURCE_FILE_ID = 'secret-file-id-123';
const PRIVATE_SOURCE_STORAGE_KEY =
  'source-materials/private/ai-enhancement-policy.pdf';

const POLICY_SOURCE = readFileSync(
  'src/activities/ai-enhancement-policy.ts',
  'utf8'
);
const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('activity AI enhancement policy exposes 30 stable product slices', () => {
  const view = buildActivityAiEnhancementPolicyView(
    createPolicySource({
      enhancementKind: 'answer-explanation',
      providerConfigured: true,
    })
  );
  const itemIds = view.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...ACTIVITY_AI_ENHANCEMENT_POLICY_ITEM_IDS]);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(view.itemViews.length, 30);
  assert.equal(view.title, 'Activity AI enhancement policy');
  assert.equal(view.decision.enhancementKind, 'answer-explanation');
  assert.equal(view.decision.canEnterEditorDraftFlow, true);
  assert.equal(view.decision.canCallExternalProvider, true);
  assert.deepEqual(view.privacy, {
    appliesBeforeActivitySave: true,
    createsAssignmentLinksWithoutTeacherAction: false,
    exposesActivityContentText: false,
    exposesAnswerKeysToPublicPayload: false,
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
    requiresAuthenticatedTeacher: true,
    requiresCreateActivityInputContract: true,
    requiresEditorReview: true,
    scope: 'activity-ai-enhancement-policy',
    usesActivityContentModel: true,
    usesDeterministicReadinessFirst: true,
    writesDistractorsToQuestionOptions: true,
  });
  assertNoPrivatePolicyText(JSON.stringify(view));
});

test('activity AI enhancement policy blocks archived source derivations', () => {
  const decision = buildActivityAiEnhancementPolicyDecision(
    createPolicySource({
      enhancementKind: 'leveled-variant',
      providerConfigured: true,
      visibility: 'archived',
    })
  );
  const view = buildActivityAiEnhancementPolicyView(
    createPolicySource({
      enhancementKind: 'leveled-variant',
      providerConfigured: true,
      visibility: 'archived',
    })
  );
  const values = new Map(view.itemViews.map((item) => [item.id, item.value]));

  assert.equal(decision.status, 'restore-source-first');
  assert.equal(decision.canEnterEditorDraftFlow, false);
  assert.equal(decision.canCallExternalProvider, false);
  assert.equal(values.get('source-activity-state'), 'archived');
  assert.equal(values.get('draft-output'), 'Blocked before draft');
  assert.equal(values.get('publish-boundary'), 'No assignment link');
  assert.equal(
    values.get('assignment-snapshot-protection'),
    'Existing snapshots protected'
  );
});

test('activity AI enhancement policy keeps distractors on question options', () => {
  const decision = buildActivityAiEnhancementPolicyDecision(
    createPolicySource({
      content: createActivityContent({
        questions: [
          {
            answer: 'evaporation',
            id: 'q1',
            prompt: 'Which process turns liquid water into vapor?',
          },
        ],
        vocabulary: ['water cycle'],
      }),
      enhancementKind: 'distractor-generation',
    })
  );
  const fields = buildActivityAiEnhancementPolicyTargetFields({
    kind: 'distractor-generation',
  });
  const view = buildActivityAiEnhancementPolicyView(
    createPolicySource({
      content: createActivityContent({
        questions: [
          {
            answer: 'evaporation',
            id: 'q1',
            prompt: 'Which process turns liquid water into vapor?',
          },
        ],
        vocabulary: ['water cycle'],
      }),
      enhancementKind: 'distractor-generation',
    })
  );
  const values = new Map(view.itemViews.map((item) => [item.id, item.value]));

  assert.deepEqual(fields, ['questionOptions']);
  assert.equal(decision.questionChoiceNeedsCandidateCount, 1);
  assert.equal(decision.questionChoiceReadyCount, 0);
  assert.equal(
    values.get('question-option-target'),
    'ActivityQuestion.options'
  );
  assert.equal(values.get('public-payload-guard'), 'Sanitized runtime only');
});

test('activity AI enhancement policy maps remix gaps to structured draft fields', () => {
  const decision = buildActivityAiEnhancementPolicyDecision(
    createPolicySource({
      content: createActivityContent({
        groups: [],
        pairs: [],
        questions: [
          {
            answer: 'photosynthesis',
            id: 'q1',
            prompt: 'Which process helps plants make food?',
          },
        ],
      }),
      currentTemplateType: 'quiz',
      enhancementKind: 'ai-remix-completion',
      targetTemplateType: 'group-sort',
    })
  );
  const fields = buildActivityAiEnhancementPolicyTargetFields({
    kind: 'ai-remix-completion',
    missingRequirements: decision.missingRequirements,
  });

  assert.equal(decision.status, 'ready-for-editor-draft');
  assert.equal(decision.targetTemplateType, 'group-sort');
  assert.ok(decision.missingRequirementLabels.length > 0);
  assert.ok(fields.includes('groups'));
  assert.equal(decision.canEnterEditorDraftFlow, true);
  assert.equal(decision.providerPath, 'local-fallback-or-disabled');
});

test('activity AI enhancement policy counts source capabilities without leaking identifiers', () => {
  const source = createPolicySource({
    content: createActivityContent({
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
        createMaterial({
          fileId: 'spreadsheet-file-id',
          kind: 'spreadsheet',
          originalName: 'class-list.csv',
        }),
      ],
    }),
    enhancementKind: 'worksheet-extraction',
    providerConfigured: true,
  });
  const view = buildActivityAiEnhancementPolicyView(source);
  const values = new Map(view.itemViews.map((item) => [item.id, item.value]));

  assert.equal(view.decision.audioSourceCount, 1);
  assert.equal(view.decision.worksheetSourceCount, 1);
  assert.equal(view.decision.spreadsheetSourceCount, 1);
  assert.equal(view.decision.sourceMaterialCount, 3);
  assert.equal(
    values.get('source-material-capability'),
    '1 audio / 1 worksheet / 1 spreadsheet'
  );
  assertNoPrivatePolicyText(JSON.stringify(view));
});

test('activity AI enhancement policy gate is wired into product docs and domain coverage', () => {
  assert.equal(existsSync('src/activities/ai-enhancement-policy.ts'), true);
  assert.deepEqual(ACTIVITY_AI_ENHANCEMENT_KINDS, [
    'source-to-activity-draft',
    'template-transform',
    'ai-remix-completion',
    'distractor-generation',
    'leveled-variant',
    'answer-explanation',
    'listening-script',
    'worksheet-extraction',
    'audio-extraction',
    'spreadsheet-import',
  ]);
  assert.match(
    POLICY_SOURCE,
    /export const ACTIVITY_AI_ENHANCEMENT_POLICY_ITEM_IDS = \[[\s\S]*'enhancement-kind'[\s\S]*'teacher-auth-gate'[\s\S]*'deterministic-readiness'[\s\S]*'question-option-target'[\s\S]*'source-byte-guard'[\s\S]*'publish-boundary'[\s\S]*'result-export-continuity'/,
    'Policy source should preserve the 30-slice AI enhancement boundary.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /src\/activities\/ai-enhancement-policy\.ts` owns the shared request policy/,
    'docs/product.md should document the AI enhancement policy owner.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Activity AI enhancement policy has a fast script-level gate via[\s\S]*scripts\/activity-ai-enhancement-policy\.test\.ts[\s\S]*teacher-auth gates[\s\S]*deterministic readiness[\s\S]*structured\s+draft targets[\s\S]*source-material capability counts[\s\S]*editor-review\/save\/publish boundaries/,
    'TEST-CATALOG should document the AI enhancement policy gate.'
  );
});

function createPolicySource(
  overrides: Partial<ActivityAiEnhancementPolicySource> = {}
): ActivityAiEnhancementPolicySource {
  return {
    content: createActivityContent(),
    currentTemplateType: 'quiz',
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

function assertNoPrivatePolicyText(serializedView: string) {
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
      `AI enhancement policy leaked private text: ${privateValue}`
    );
  }
}
