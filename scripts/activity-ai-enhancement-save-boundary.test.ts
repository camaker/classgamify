import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVITY_AI_ENHANCEMENT_SAVE_BOUNDARY_ITEM_IDS,
  buildActivityAiEnhancementSaveBoundaryPlan,
  buildActivityAiEnhancementSaveBoundaryView,
  type ActivityAiEnhancementSaveBoundarySource,
} from '@/activities/ai-enhancement-save-boundary';
import { ACTIVITY_AI_ENHANCEMENT_EDITOR_REVIEW_CHECK_IDS } from '@/activities/ai-enhancement-editor-review';
import type {
  ActivityContent,
  ActivityMaterialReference,
} from '@/activities/types';
import type { CreateActivityInput } from '@/activities/validation';

const PRIVATE_ANSWER_KEY = 'SECRET_AI_SAVE_ANSWER_KEY';
const PRIVATE_DRAFT_TEXT = 'SECRET_AI_SAVE_DRAFT_TEXT';
const PRIVATE_FILE_BYTES = 'SECRET_AI_SAVE_FILE_BYTES';
const PRIVATE_PROVIDER_OUTPUT = 'SECRET_AI_SAVE_PROVIDER_OUTPUT';
const PRIVATE_RAW_SOURCE_TEXT = 'SECRET_AI_SAVE_SOURCE_TEXT';
const PRIVATE_SOURCE_FILE_ID = 'secret-save-file-id';
const PRIVATE_SOURCE_STORAGE_KEY = 'source-materials/private/ai-save.pdf';

const SAVE_BOUNDARY_SOURCE = readFileSync(
  'src/activities/ai-enhancement-save-boundary.ts',
  'utf8'
);
const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('activity AI enhancement save boundary exposes 30 stable save slices', () => {
  const view = buildActivityAiEnhancementSaveBoundaryView(
    createSaveBoundarySource({
      existingAssignmentSnapshotCount: 3,
      reviewedCheckIds: ACTIVITY_AI_ENHANCEMENT_EDITOR_REVIEW_CHECK_IDS,
      teacherSubmittedSave: true,
    })
  );
  const itemIds = view.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...ACTIVITY_AI_ENHANCEMENT_SAVE_BOUNDARY_ITEM_IDS,
  ]);
  assert.equal(itemIds.length, 30);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(view.title, 'Activity AI enhancement save boundary');
  assert.equal(view.plan.status, 'ready-for-activity-create');
  assert.equal(view.plan.persistenceTarget, 'activity-create');
  assert.equal(view.plan.mutationTarget, 'activity-record');
  assert.equal(view.plan.canPersistActivity, true);
  assert.equal(view.plan.saveExecution?.type, 'create');
  assert.deepEqual(view.privacy, {
    appliesAfterEditorReview: true,
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
    persistsActivityWithoutTeacherAction: false,
    preservesResultExportContinuity: true,
    publishesAssignmentWithoutTeacherAction: false,
    readsSourceMaterialBytes: false,
    requiresTeacherSaveAction: true,
    scope: 'activity-ai-enhancement-save-boundary',
    usesActivityEditorSaveGate: true,
    usesEditorReviewPlan: true,
    writesOnlyActivityRecord: true,
  });
  assertNoPrivateSaveText(JSON.stringify(view));
});

test('activity AI enhancement save boundary waits for teacher save action', () => {
  const view = buildActivityAiEnhancementSaveBoundaryView(
    createSaveBoundarySource({
      existingAssignmentSnapshotCount: 2,
      reviewedCheckIds: ACTIVITY_AI_ENHANCEMENT_EDITOR_REVIEW_CHECK_IDS,
    })
  );
  const values = new Map(view.itemViews.map((item) => [item.id, item.value]));

  assert.equal(view.plan.status, 'awaiting-teacher-save-action');
  assert.equal(view.plan.canPersistActivity, false);
  assert.equal(view.plan.saveExecution, null);
  assert.equal(values.get('teacher-save-action'), 'Awaiting save click');
  assert.equal(
    values.get('manual-persistence-boundary'),
    'Teacher save required'
  );
  assert.equal(values.get('blocked-reason'), 'teacher-save-action-required');
  assert.equal(values.get('protected-snapshot-count'), '2 snapshots protected');
  assertNoPrivateSaveText(JSON.stringify(view));
});

test('activity AI enhancement save boundary blocks before review completes', () => {
  const plan = buildActivityAiEnhancementSaveBoundaryPlan(
    createSaveBoundarySource({
      reviewedCheckIds: ['title', 'questions', 'answers'],
      teacherSubmittedSave: true,
    })
  );

  assert.equal(plan.review.status, 'needs-teacher-review');
  assert.equal(plan.status, 'blocked-before-review');
  assert.equal(plan.canPersistActivity, false);
  assert.equal(plan.persistenceTarget, 'none');
  assert.equal(plan.saveExecution, null);
});

test('activity AI enhancement save boundary keeps edit saves behind activity id', () => {
  const missingActivityId = buildActivityAiEnhancementSaveBoundaryPlan(
    createSaveBoundarySource({
      reviewedCheckIds: ACTIVITY_AI_ENHANCEMENT_EDITOR_REVIEW_CHECK_IDS,
      saveMode: 'edit',
      teacherSubmittedSave: true,
    })
  );
  const readyUpdate = buildActivityAiEnhancementSaveBoundaryPlan(
    createSaveBoundarySource({
      activityId: 'activity_123',
      reviewedCheckIds: ACTIVITY_AI_ENHANCEMENT_EDITOR_REVIEW_CHECK_IDS,
      saveMode: 'edit',
      teacherSubmittedSave: true,
    })
  );

  assert.equal(missingActivityId.status, 'blocked-before-save');
  assert.equal(missingActivityId.activityIdRequired, true);
  assert.equal(missingActivityId.hasActivityId, false);
  assert.equal(missingActivityId.saveExecution?.type, 'blocked');
  assert.equal(
    missingActivityId.saveExecution?.type === 'blocked'
      ? missingActivityId.saveExecution.reason
      : null,
    'missing-activity-id'
  );
  assert.equal(readyUpdate.status, 'ready-for-activity-update');
  assert.equal(readyUpdate.persistenceTarget, 'activity-update');
  assert.equal(readyUpdate.canPersistActivity, true);
  assert.equal(readyUpdate.saveExecution?.type, 'edit');
  assert.equal(
    readyUpdate.saveExecution?.type === 'edit'
      ? readyUpdate.saveExecution.activityId
      : null,
    'activity_123'
  );
});

test('activity AI enhancement save boundary blocks invalid or unauthenticated drafts', () => {
  const unauthenticated = buildActivityAiEnhancementSaveBoundaryPlan(
    createSaveBoundarySource({
      hasAuthenticatedTeacher: false,
      reviewedCheckIds: ACTIVITY_AI_ENHANCEMENT_EDITOR_REVIEW_CHECK_IDS,
      teacherSubmittedSave: true,
    })
  );
  const invalidDraft = buildActivityAiEnhancementSaveBoundaryPlan(
    createSaveBoundarySource({
      proposedDraft: {
        ...createProposedDraft(),
        title: 'x',
      } as CreateActivityInput,
      reviewedCheckIds: ACTIVITY_AI_ENHANCEMENT_EDITOR_REVIEW_CHECK_IDS,
      teacherSubmittedSave: true,
    })
  );

  assert.equal(unauthenticated.status, 'blocked-before-review');
  assert.equal(unauthenticated.canPersistActivity, false);
  assert.equal(unauthenticated.saveExecution, null);
  assert.equal(
    unauthenticated.review.application.execution.blockedReason,
    'teacher-auth-required'
  );
  assert.equal(invalidDraft.status, 'blocked-before-review');
  assert.equal(invalidDraft.review.application.validationStatus, 'invalid');
  assert.equal(invalidDraft.createInputReady, false);
});

test('activity AI enhancement save boundary gate is wired into docs and coverage', () => {
  assert.equal(
    existsSync('src/activities/ai-enhancement-save-boundary.ts'),
    true
  );
  assert.match(
    SAVE_BOUNDARY_SOURCE,
    /export const ACTIVITY_AI_ENHANCEMENT_SAVE_BOUNDARY_ITEM_IDS = \[[\s\S]*'save-scope'[\s\S]*'teacher-save-action'[\s\S]*'save-execution-plan'[\s\S]*'activity-record-target'[\s\S]*'manual-persistence-boundary'[\s\S]*'save-chain-gate'/,
    'Save boundary source should preserve the 30-slice save boundary.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /src\/activities\/ai-enhancement-save-boundary\.ts` owns the manual save boundary/,
    'docs/product.md should document the AI enhancement save boundary owner.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Activity AI enhancement save boundary has a fast script-level gate via[\s\S]*scripts\/activity-ai-enhancement-save-boundary\.test\.ts[\s\S]*teacher save actions[\s\S]*create\/edit save plans[\s\S]*activity-id\s+gates[\s\S]*manual persistence boundaries[\s\S]*snapshot protection[\s\S]*privacy guards/,
    'TEST-CATALOG should document the AI enhancement save boundary gate.'
  );
});

function createSaveBoundarySource(
  overrides: Partial<ActivityAiEnhancementSaveBoundarySource> = {}
): ActivityAiEnhancementSaveBoundarySource {
  return {
    content: createActivityContent(),
    currentTemplateType: 'quiz',
    hasAuthenticatedTeacher: true,
    proposedDraft: createProposedDraft(),
    providerConfigured: true,
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

function assertNoPrivateSaveText(serializedView: string) {
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
      `AI enhancement save boundary leaked private text: ${privateValue}`
    );
  }
}
