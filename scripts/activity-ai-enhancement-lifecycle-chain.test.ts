import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { ACTIVITY_AI_ENHANCEMENT_DRAFT_APPLICATION_ITEM_IDS } from '@/activities/ai-enhancement-draft-application';
import { ACTIVITY_AI_ENHANCEMENT_DRAFT_OUTPUT_ITEM_IDS } from '@/activities/ai-enhancement-draft-output';
import { ACTIVITY_AI_ENHANCEMENT_EDITOR_REVIEW_CHECK_IDS } from '@/activities/ai-enhancement-editor-review';
import { ACTIVITY_AI_ENHANCEMENT_EXECUTION_ITEM_IDS } from '@/activities/ai-enhancement-execution';
import {
  ACTIVITY_AI_ENHANCEMENT_LIFECYCLE_CHAIN_ITEM_IDS,
  ACTIVITY_AI_ENHANCEMENT_LIFECYCLE_CHAIN_SOURCE_FILES,
  buildActivityAiEnhancementLifecycleChainPlan,
  buildActivityAiEnhancementLifecycleChainView,
  type ActivityAiEnhancementLifecycleChainItemId,
  type ActivityAiEnhancementLifecycleChainSource,
  type ActivityAiEnhancementLifecycleChainView,
} from '@/activities/ai-enhancement-lifecycle-chain';
import { ACTIVITY_AI_ENHANCEMENT_POLICY_ITEM_IDS } from '@/activities/ai-enhancement-policy';
import { ACTIVITY_AI_ENHANCEMENT_PUBLISH_BOUNDARY_ITEM_IDS } from '@/activities/ai-enhancement-publish-boundary';
import { ACTIVITY_AI_ENHANCEMENT_SAVE_BOUNDARY_ITEM_IDS } from '@/activities/ai-enhancement-save-boundary';
import type {
  ActivityContent,
  ActivityMaterialReference,
} from '@/activities/types';
import type { CreateActivityInput } from '@/activities/validation';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const PRIVATE_ACTIVITY_ID = 'activity_ai_lifecycle_private_id';
const PRIVATE_ANSWER_KEY = 'SECRET_AI_LIFECYCLE_ANSWER_KEY';
const PRIVATE_DRAFT_TEXT = 'SECRET_AI_LIFECYCLE_DRAFT_TEXT';
const PRIVATE_FILE_BYTES = 'SECRET_AI_LIFECYCLE_FILE_BYTES';
const PRIVATE_PROVIDER_OUTPUT = 'SECRET_AI_LIFECYCLE_PROVIDER_OUTPUT';
const PRIVATE_RAW_SOURCE_TEXT = 'SECRET_AI_LIFECYCLE_SOURCE_TEXT';
const PRIVATE_SHARE_SLUG = 'secret-ai-lifecycle-share-slug';
const PRIVATE_SOURCE_FILE_ID = 'secret-lifecycle-file-id';
const PRIVATE_SOURCE_STORAGE_KEY = 'source-materials/private/ai-lifecycle.pdf';
const PRIVATE_STUDENT_INSTRUCTIONS = 'SECRET_LIFECYCLE_INSTRUCTIONS';
const PRIVATE_TITLE = 'SECRET_AI_LIFECYCLE_TITLE';

const LIFECYCLE_SOURCE = readFileSync(
  'src/activities/ai-enhancement-lifecycle-chain.ts',
  'utf8'
);
const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('activity AI enhancement lifecycle chain exposes 30 stable slices', () => {
  const view = buildActivityAiEnhancementLifecycleChainView(
    createLifecycleSource({
      activityPersisted: true,
      existingAssignmentSnapshotCount: 3,
      existingPublishedAssignmentCount: 5,
      publishSubmitted: true,
      publishValues: {
        instructions: PRIVATE_STUDENT_INSTRUCTIONS,
        maxAttempts: '3',
        timeLimitMinutes: '15',
      },
      savedActivityId: PRIVATE_ACTIVITY_ID,
      teacherSubmittedSave: true,
    })
  );
  const itemIds = view.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...ACTIVITY_AI_ENHANCEMENT_LIFECYCLE_CHAIN_ITEM_IDS,
  ]);
  assert.equal(itemIds.length, 30);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(view.title, 'Activity AI enhancement lifecycle chain');
  assert.match(view.description, /Thirty-slice AI enhancement lifecycle/);
  assert.equal(view.plan.chainStatus, 'ready-for-assignment-publish');
  assert.equal(view.plan.canPassDraftOutputToApplication, true);
  assert.equal(view.plan.canReachManualSave, true);
  assert.equal(view.plan.canPersistActivity, true);
  assert.equal(view.plan.canCreateAssignmentLink, true);
  assert.equal(
    getLifecycleValue(view, 'share-link-stage'),
    'Publish flow creates link'
  );
  assert.equal(
    getLifecycleValue(view, 'snapshot-freeze-stage'),
    'Saved activity snapshot'
  );
  assert.deepEqual(view.privacy, {
    chainSourceFileCount:
      ACTIVITY_AI_ENHANCEMENT_LIFECYCLE_CHAIN_SOURCE_FILES.length,
    createsAssignmentLinksWithoutTeacherAction: false,
    exposesActivityContentText: false,
    exposesAnswerKeysToPublicPayload: false,
    exposesAssignmentTitle: false,
    exposesDraftText: false,
    exposesFileBytesToAi: false,
    exposesInternalActivityIds: false,
    exposesQuestionPromptText: false,
    exposesRawAiOutput: false,
    exposesRawSourceText: false,
    exposesShareSlug: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialFilenames: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentInstructions: false,
    itemIds,
    mutatesExistingAssignmentSnapshots: false,
    persistsActivityWithoutTeacherAction: false,
    publishesAssignmentWithoutTeacherAction: false,
    readsSourceMaterialBytes: false,
    requiresCreateActivityInputContract: true,
    requiresEditorReview: true,
    requiresTeacherPublishAction: true,
    requiresTeacherSaveAction: true,
    sourceFiles: [...ACTIVITY_AI_ENHANCEMENT_LIFECYCLE_CHAIN_SOURCE_FILES],
    usesAssignmentPublishPreflight: true,
    usesAssignmentSnapshotFreeze: true,
    usesDraftOutputPlan: true,
    usesPublishBoundaryPlan: true,
    usesSaveBoundaryPlan: true,
  });
  assertNoPrivateLifecycleText(JSON.stringify(view));
});

test('activity AI enhancement lifecycle chain summarizes ordered gates', () => {
  const view = buildActivityAiEnhancementLifecycleChainView(
    createLifecycleSource({
      activityPersisted: true,
      existingAssignmentSnapshotCount: 3,
      existingPublishedAssignmentCount: 5,
      publishSubmitted: true,
      savedActivityId: PRIVATE_ACTIVITY_ID,
      teacherSubmittedSave: true,
    })
  );

  assert.deepEqual(
    view.itemViews.map((item) => [item.id, item.value]),
    [
      ['policy-stage', 'ready-for-editor-draft'],
      ['execution-stage', 'provider-ready'],
      ['draft-output-stage', 'normalized-draft-ready'],
      ['draft-application-stage', 'ready-for-editor-review'],
      ['teacher-review-stage', 'ready-for-manual-save'],
      ['manual-save-stage', 'ready-for-activity-create'],
      ['activity-record-stage', 'Saved activity record'],
      ['assignment-publish-stage', 'ready-for-assignment-publish'],
      ['share-link-stage', 'Publish flow creates link'],
      ['snapshot-freeze-stage', 'Saved activity snapshot'],
      ['source-material-stage', '1 references / 1 kinds'],
      ['provider-mode-stage', 'Provider selected'],
      ['fallback-mode-stage', 'Fallback available'],
      ['deterministic-mode-stage', 'Deterministic optional'],
      ['blocked-reason-stage', 'None'],
      ['field-target-stage', '4 targets'],
      ['coverage-stage', '4/4 targets'],
      ['review-checklist-stage', '12/12 reviewed'],
      ['save-action-stage', 'Save clicked'],
      ['publish-action-stage', 'Publish clicked'],
      ['public-payload-stage', 'Sanitized runtime only'],
      ['answer-key-stage', 'No public answer keys'],
      ['raw-output-stage', 'Raw output hidden'],
      ['source-byte-stage', 'No file bytes'],
      ['storage-key-stage', 'Storage hidden'],
      ['student-data-stage', 'No student records touched'],
      ['result-export-stage', 'Shared result model'],
      ['chain-state-stage', 'ready-for-assignment-publish'],
      ['documentation-stage', '30 source files'],
      ['lifecycle-chain-gate', '30 lifecycle slices'],
    ]
  );
});

test('activity AI enhancement lifecycle chain waits for upstream draft output', () => {
  const plan = buildActivityAiEnhancementLifecycleChainPlan(
    createLifecycleSource({
      activityPersisted: true,
      parsedDraft: null,
      publishSubmitted: true,
      savedActivityId: PRIVATE_ACTIVITY_ID,
      teacherSubmittedSave: true,
    })
  );

  assert.equal(plan.draftOutputStatus, 'awaiting-output');
  assert.equal(plan.canPassDraftOutputToApplication, false);
  assert.equal(plan.canPersistActivity, false);
  assert.equal(plan.canCreateAssignmentLink, false);
  assert.equal(plan.chainStatus, 'awaiting-draft-output');
  assert.equal(plan.blockedReason, 'missing');
});

test('activity AI enhancement lifecycle chain waits for review save and publish actions', () => {
  const review = buildActivityAiEnhancementLifecycleChainPlan(
    createLifecycleSource({
      reviewedCheckIds: ['title', 'questions', 'answers'],
      teacherSubmittedSave: true,
    })
  );
  const save = buildActivityAiEnhancementLifecycleChainPlan(
    createLifecycleSource({
      reviewedCheckIds: ACTIVITY_AI_ENHANCEMENT_EDITOR_REVIEW_CHECK_IDS,
    })
  );
  const record = buildActivityAiEnhancementLifecycleChainPlan(
    createLifecycleSource({
      reviewedCheckIds: ACTIVITY_AI_ENHANCEMENT_EDITOR_REVIEW_CHECK_IDS,
      teacherSubmittedSave: true,
    })
  );
  const publish = buildActivityAiEnhancementLifecycleChainPlan(
    createLifecycleSource({
      activityPersisted: true,
      reviewedCheckIds: ACTIVITY_AI_ENHANCEMENT_EDITOR_REVIEW_CHECK_IDS,
      savedActivityId: PRIVATE_ACTIVITY_ID,
      teacherSubmittedSave: true,
    })
  );

  assert.equal(review.chainStatus, 'awaiting-teacher-review');
  assert.equal(review.canReachManualSave, false);
  assert.equal(save.chainStatus, 'awaiting-teacher-save');
  assert.equal(save.canPersistActivity, false);
  assert.equal(record.chainStatus, 'awaiting-activity-record');
  assert.equal(record.canCreateAssignmentLink, false);
  assert.equal(publish.chainStatus, 'awaiting-teacher-publish');
  assert.equal(publish.canCreateAssignmentLink, false);
});

test('activity AI enhancement lifecycle chain blocks before execution when unauthenticated', () => {
  const plan = buildActivityAiEnhancementLifecycleChainPlan(
    createLifecycleSource({
      hasAuthenticatedTeacher: false,
      reviewedCheckIds: ACTIVITY_AI_ENHANCEMENT_EDITOR_REVIEW_CHECK_IDS,
      teacherSubmittedSave: true,
    })
  );

  assert.equal(plan.executionStatus, 'blocked');
  assert.equal(plan.chainStatus, 'blocked-before-execution');
  assert.equal(plan.blockedReason, 'teacher-auth-required');
  assert.equal(plan.canApplyToEditor, false);
});

test('activity AI enhancement lifecycle chain is backed by focused gates', () => {
  assert.equal(
    existsSync('src/activities/ai-enhancement-lifecycle-chain.ts'),
    true
  );
  assert.equal(ACTIVITY_AI_ENHANCEMENT_LIFECYCLE_CHAIN_SOURCE_FILES.length, 30);
  for (const filePath of ACTIVITY_AI_ENHANCEMENT_LIFECYCLE_CHAIN_SOURCE_FILES) {
    assert.ok(
      existsSync(filePath),
      `Missing activity AI enhancement lifecycle source ${filePath}`
    );
  }

  assert.deepEqual(
    [
      ACTIVITY_AI_ENHANCEMENT_POLICY_ITEM_IDS.length,
      ACTIVITY_AI_ENHANCEMENT_EXECUTION_ITEM_IDS.length,
      ACTIVITY_AI_ENHANCEMENT_DRAFT_OUTPUT_ITEM_IDS.length,
      ACTIVITY_AI_ENHANCEMENT_DRAFT_APPLICATION_ITEM_IDS.length,
      ACTIVITY_AI_ENHANCEMENT_EDITOR_REVIEW_CHECK_IDS.length,
      ACTIVITY_AI_ENHANCEMENT_SAVE_BOUNDARY_ITEM_IDS.length,
      ACTIVITY_AI_ENHANCEMENT_PUBLISH_BOUNDARY_ITEM_IDS.length,
    ],
    [30, 30, 30, 30, 12, 30, 30]
  );
});

test('activity AI enhancement lifecycle chain gate is wired into docs and catalog', () => {
  assert.match(
    LIFECYCLE_SOURCE,
    /buildActivityAiEnhancementPolicyDecision[\s\S]*buildActivityAiEnhancementExecutionPlan[\s\S]*buildActivityAiEnhancementDraftOutputPlan[\s\S]*buildActivityAiEnhancementDraftApplicationPlan[\s\S]*buildActivityAiEnhancementEditorReviewPlan[\s\S]*buildActivityAiEnhancementSaveBoundaryPlan[\s\S]*buildActivityAiEnhancementPublishBoundaryPlan/,
    'Lifecycle source should compose the existing policy-to-publish stages.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /src\/activities\/ai-enhancement-lifecycle-chain\.ts` owns the full AI enhancement lifecycle handoff/,
    'docs/product.md should document the AI enhancement lifecycle owner.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Activity AI enhancement lifecycle chain has a fast script-level gate via[\s\S]*scripts\/activity-ai-enhancement-lifecycle-chain\.test\.ts[\s\S]*policy-to-publish ordering[\s\S]*draft output handoffs[\s\S]*teacher review[\s\S]*manual save[\s\S]*assignment\s+publish actions[\s\S]*share-link\/snapshot boundaries[\s\S]*result-export continuity/,
    'TEST-CATALOG should document the AI enhancement lifecycle chain gate.'
  );
});

function createLifecycleSource(
  overrides: Partial<ActivityAiEnhancementLifecycleChainSource> = {}
): ActivityAiEnhancementLifecycleChainSource {
  return {
    content: createActivityContent(),
    currentTemplateType: 'quiz',
    hasAuthenticatedTeacher: true,
    proposedDraft: createProposedDraft(),
    providerConfigured: true,
    reviewedCheckIds: ACTIVITY_AI_ENHANCEMENT_EDITOR_REVIEW_CHECK_IDS,
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
    title: PRIVATE_TITLE,
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

function getLifecycleValue(
  view: ActivityAiEnhancementLifecycleChainView,
  id: ActivityAiEnhancementLifecycleChainItemId
) {
  const item = view.itemViews.find((candidate) => candidate.id === id);
  assert.ok(item, `Missing lifecycle item ${id}`);
  return item.value;
}

function assertNoPrivateLifecycleText(serializedView: string) {
  for (const privateValue of [
    PRIVATE_ACTIVITY_ID,
    PRIVATE_ANSWER_KEY,
    PRIVATE_DRAFT_TEXT,
    PRIVATE_FILE_BYTES,
    PRIVATE_PROVIDER_OUTPUT,
    PRIVATE_RAW_SOURCE_TEXT,
    PRIVATE_SHARE_SLUG,
    PRIVATE_SOURCE_FILE_ID,
    PRIVATE_SOURCE_STORAGE_KEY,
    PRIVATE_STUDENT_INSTRUCTIONS,
    PRIVATE_TITLE,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `AI enhancement lifecycle chain leaked private text: ${privateValue}`
    );
  }
}
