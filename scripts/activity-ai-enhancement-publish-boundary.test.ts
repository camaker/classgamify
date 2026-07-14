import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { ACTIVITY_AI_ENHANCEMENT_EDITOR_REVIEW_CHECK_IDS } from '@/activities/ai-enhancement-editor-review';
import {
  ACTIVITY_AI_ENHANCEMENT_PUBLISH_BOUNDARY_ITEM_IDS,
  buildActivityAiEnhancementPublishBoundaryPlan,
  buildActivityAiEnhancementPublishBoundaryView,
  type ActivityAiEnhancementPublishBoundarySource,
} from '@/activities/ai-enhancement-publish-boundary';
import { ACTIVITY_AI_ENHANCEMENT_SAVE_BOUNDARY_ITEM_IDS } from '@/activities/ai-enhancement-save-boundary';
import type {
  ActivityContent,
  ActivityMaterialReference,
} from '@/activities/types';
import type { CreateActivityInput } from '@/activities/validation';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const PRIVATE_ACTIVITY_ID = 'activity_ai_publish_private_id';
const PRIVATE_ANSWER_KEY = 'SECRET_AI_PUBLISH_ANSWER_KEY';
const PRIVATE_DRAFT_TEXT = 'SECRET_AI_PUBLISH_DRAFT_TEXT';
const PRIVATE_FILE_BYTES = 'SECRET_AI_PUBLISH_FILE_BYTES';
const PRIVATE_PROVIDER_OUTPUT = 'SECRET_AI_PUBLISH_PROVIDER_OUTPUT';
const PRIVATE_RAW_SOURCE_TEXT = 'SECRET_AI_PUBLISH_SOURCE_TEXT';
const PRIVATE_SOURCE_FILE_ID = 'secret-publish-file-id';
const PRIVATE_SOURCE_STORAGE_KEY = 'source-materials/private/ai-publish.pdf';
const PRIVATE_STUDENT_INSTRUCTIONS = 'SECRET_STUDENT_INSTRUCTIONS';
const PRIVATE_TITLE = 'SECRET_AI_PUBLISH_TITLE';

const PUBLISH_BOUNDARY_SOURCE = readFileSync(
  'src/activities/ai-enhancement-publish-boundary.ts',
  'utf8'
);
const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('activity AI enhancement publish boundary exposes 30 stable publish slices', () => {
  const view = buildActivityAiEnhancementPublishBoundaryView(
    createPublishBoundarySource({
      activityPersisted: true,
      existingPublishedAssignmentCount: 5,
      publishSubmitted: true,
      publishValues: {
        instructions: PRIVATE_STUDENT_INSTRUCTIONS,
        maxAttempts: '3',
        timeLimitMinutes: '15',
      },
      savedActivityId: PRIVATE_ACTIVITY_ID,
    })
  );
  const itemIds = view.itemViews.map((item) => item.id);
  const values = new Map(view.itemViews.map((item) => [item.id, item.value]));

  assert.deepEqual(itemIds, [
    ...ACTIVITY_AI_ENHANCEMENT_PUBLISH_BOUNDARY_ITEM_IDS,
  ]);
  assert.equal(itemIds.length, 30);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(view.title, 'Activity AI enhancement publish boundary');
  assert.equal(view.plan.status, 'ready-for-assignment-publish');
  assert.equal(view.plan.canPublishAssignment, true);
  assert.equal(view.plan.canCreateAssignmentLink, true);
  assert.equal(view.plan.publishExecution?.type, 'publish');
  assert.equal(view.plan.snapshotSource, 'saved-activity-record');
  assert.equal(
    values.get('assignment-link-boundary'),
    'Publish flow creates link'
  );
  assert.equal(
    values.get('assignment-record-target'),
    'Assignment record and snapshot'
  );
  assert.equal(
    values.get('protected-existing-snapshots'),
    '5 existing links protected'
  );
  assert.deepEqual(view.privacy, {
    appliesAfterActivitySave: true,
    createsAssignmentLinksWithoutTeacherAction: false,
    createsAssignmentSnapshotsWithoutTeacherAction: false,
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
    publishesAssignmentWithoutTeacherAction: false,
    readsSourceMaterialBytes: false,
    requiresAssignmentPublishFlow: true,
    requiresSavedActivityRecord: true,
    requiresTeacherPublishAction: true,
    scope: 'activity-ai-enhancement-publish-boundary',
    usesAssignmentPublishPreflight: true,
    usesAssignmentSnapshotFreeze: true,
    usesSaveBoundaryHandoff: true,
    usesSaveBoundaryPlan: true,
  });
  assertNoPrivatePublishBoundaryText(JSON.stringify(view));
});

test('activity AI enhancement publish boundary waits for the teacher publish action', () => {
  const view = buildActivityAiEnhancementPublishBoundaryView(
    createPublishBoundarySource({
      activityPersisted: true,
      existingPublishedAssignmentCount: 1,
      savedActivityId: PRIVATE_ACTIVITY_ID,
    })
  );
  const values = new Map(view.itemViews.map((item) => [item.id, item.value]));

  assert.equal(view.plan.status, 'awaiting-publish-action');
  assert.equal(view.plan.canPublishAssignment, false);
  assert.equal(view.plan.canCreateAssignmentLink, false);
  assert.equal(view.plan.publishExecution?.type, 'publish');
  assert.equal(values.get('teacher-publish-action'), 'Awaiting publish click');
  assert.equal(values.get('assignment-link-boundary'), 'No share link');
  assert.equal(values.get('blocked-reason'), 'teacher-publish-action-required');
  assert.equal(
    values.get('manual-save-handoff-boundary'),
    '30 save boundary slices'
  );
  assertNoPrivatePublishBoundaryText(JSON.stringify(view));
});

test('activity AI enhancement publish boundary waits for a saved activity record', () => {
  const plan = buildActivityAiEnhancementPublishBoundaryPlan(
    createPublishBoundarySource({
      activityPersisted: false,
      publishSubmitted: true,
      savedActivityId: PRIVATE_ACTIVITY_ID,
    })
  );

  assert.equal(plan.save.status, 'ready-for-activity-create');
  assert.equal(plan.status, 'awaiting-activity-record');
  assert.equal(plan.publishDialog, null);
  assert.equal(plan.publishExecution, null);
  assert.equal(plan.canPublishAssignment, false);
});

test('activity AI enhancement publish boundary blocks before save boundary passes', () => {
  const plan = buildActivityAiEnhancementPublishBoundaryPlan(
    createPublishBoundarySource({
      activityPersisted: true,
      publishSubmitted: true,
      reviewedCheckIds: ['title', 'questions', 'answers'],
      savedActivityId: PRIVATE_ACTIVITY_ID,
    })
  );

  assert.equal(plan.save.status, 'blocked-before-review');
  assert.equal(plan.status, 'blocked-before-save');
  assert.equal(plan.publishDialog, null);
  assert.equal(plan.canCreateAssignmentLink, false);
});

test('activity AI enhancement publish boundary blocks archived and invalid publish preflight', () => {
  const archived = buildActivityAiEnhancementPublishBoundaryPlan(
    createPublishBoundarySource({
      activityPersisted: true,
      activityVisibility: 'archived',
      publishSubmitted: true,
      savedActivityId: PRIVATE_ACTIVITY_ID,
    })
  );
  const invalidTitle = buildActivityAiEnhancementPublishBoundaryPlan(
    createPublishBoundarySource({
      activityPersisted: true,
      publishSubmitted: true,
      publishValues: {
        title: '',
      },
      savedActivityId: PRIVATE_ACTIVITY_ID,
    })
  );

  assert.equal(archived.status, 'blocked-before-publish');
  assert.equal(archived.publishExecution?.type, 'blocked');
  assert.equal(invalidTitle.status, 'blocked-before-publish');
  assert.equal(invalidTitle.publishExecution?.type, 'blocked');
  assert.equal(
    invalidTitle.publishExecution?.type === 'blocked'
      ? invalidTitle.publishExecution.reason
      : null,
    'title-required'
  );
});

test('activity AI enhancement publish boundary gate is wired into docs and coverage', () => {
  assert.equal(
    existsSync('src/activities/ai-enhancement-publish-boundary.ts'),
    true
  );
  assert.equal(ACTIVITY_AI_ENHANCEMENT_SAVE_BOUNDARY_ITEM_IDS.length, 30);
  assert.match(
    PUBLISH_BOUNDARY_SOURCE,
    /export const ACTIVITY_AI_ENHANCEMENT_PUBLISH_BOUNDARY_ITEM_IDS = \[[\s\S]*'publish-scope'[\s\S]*'teacher-publish-action'[\s\S]*'publish-execution-plan'[\s\S]*'assignment-link-boundary'[\s\S]*'snapshot-freeze'[\s\S]*'manual-save-handoff-boundary'/,
    'Publish boundary source should preserve the 30-slice publish boundary.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /src\/activities\/ai-enhancement-publish-boundary\.ts` owns the assignment publish boundary[\s\S]*30-slice manual-save handoff/,
    'docs/product.md should document the AI enhancement publish boundary owner.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Activity AI enhancement publish boundary has a fast script-level gate via[\s\S]*scripts\/activity-ai-enhancement-publish-boundary\.test\.ts[\s\S]*saved activity records[\s\S]*teacher publish actions[\s\S]*assignment publish preflight[\s\S]*share-link creation\s+boundaries[\s\S]*snapshot\s+freezing[\s\S]*privacy guards/,
    'TEST-CATALOG should document the AI enhancement publish boundary gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /30-slice\s+manual-save\s+handoff/,
    'TEST-CATALOG should document the manual-save handoff.'
  );
});

function createPublishBoundarySource(
  overrides: Partial<ActivityAiEnhancementPublishBoundarySource> = {}
): ActivityAiEnhancementPublishBoundarySource {
  return {
    content: createActivityContent(),
    currentTemplateType: 'quiz',
    hasAuthenticatedTeacher: true,
    proposedDraft: createProposedDraft(),
    providerConfigured: true,
    reviewedCheckIds: ACTIVITY_AI_ENHANCEMENT_EDITOR_REVIEW_CHECK_IDS,
    teacherSubmittedSave: true,
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

function assertNoPrivatePublishBoundaryText(serializedView: string) {
  for (const privateValue of [
    PRIVATE_ACTIVITY_ID,
    PRIVATE_ANSWER_KEY,
    PRIVATE_DRAFT_TEXT,
    PRIVATE_FILE_BYTES,
    PRIVATE_PROVIDER_OUTPUT,
    PRIVATE_RAW_SOURCE_TEXT,
    PRIVATE_SOURCE_FILE_ID,
    PRIVATE_SOURCE_STORAGE_KEY,
    PRIVATE_STUDENT_INSTRUCTIONS,
    PRIVATE_TITLE,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `AI enhancement publish boundary leaked private text: ${privateValue}`
    );
  }
}
