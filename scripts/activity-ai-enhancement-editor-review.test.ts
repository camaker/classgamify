import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVITY_AI_ENHANCEMENT_EDITOR_REVIEW_CHECK_IDS,
  ACTIVITY_AI_ENHANCEMENT_EDITOR_REVIEW_ITEM_IDS,
  buildActivityAiEnhancementEditorReviewPlan,
  buildActivityAiEnhancementEditorReviewView,
  type ActivityAiEnhancementEditorReviewSource,
} from '@/activities/ai-enhancement-editor-review';
import type {
  ActivityContent,
  ActivityMaterialReference,
} from '@/activities/types';
import type { CreateActivityInput } from '@/activities/validation';

const PRIVATE_ANSWER_KEY = 'SECRET_AI_REVIEW_ANSWER_KEY';
const PRIVATE_DRAFT_TEXT = 'SECRET_AI_REVIEW_DRAFT_TEXT';
const PRIVATE_FILE_BYTES = 'SECRET_AI_REVIEW_FILE_BYTES';
const PRIVATE_PROVIDER_OUTPUT = 'SECRET_AI_REVIEW_PROVIDER_OUTPUT';
const PRIVATE_RAW_SOURCE_TEXT = 'SECRET_AI_REVIEW_SOURCE_TEXT';
const PRIVATE_SOURCE_FILE_ID = 'secret-review-file-id';
const PRIVATE_SOURCE_STORAGE_KEY = 'source-materials/private/ai-review.pdf';

const REVIEW_SOURCE = readFileSync(
  'src/activities/ai-enhancement-editor-review.ts',
  'utf8'
);
const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('activity AI enhancement editor review exposes 30 stable review slices', () => {
  const view = buildActivityAiEnhancementEditorReviewView(
    createReviewSource({
      reviewedCheckIds: ACTIVITY_AI_ENHANCEMENT_EDITOR_REVIEW_CHECK_IDS,
    })
  );
  const itemIds = view.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...ACTIVITY_AI_ENHANCEMENT_EDITOR_REVIEW_ITEM_IDS,
  ]);
  assert.equal(itemIds.length, 30);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(view.title, 'Activity AI enhancement editor review');
  assert.equal(view.plan.status, 'ready-for-manual-save');
  assert.equal(view.plan.canReachManualSave, true);
  assert.equal(view.plan.requiredReviewCount, 12);
  assert.deepEqual(view.privacy, {
    appliesAfterDraftApplication: true,
    blocksSaveUntilTeacherReview: true,
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
    publishesAssignmentWithoutTeacherAction: false,
    readsSourceMaterialBytes: false,
    requiresEditorReview: true,
    scope: 'activity-ai-enhancement-editor-review',
    usesDraftApplicationPlan: true,
  });
  assertNoPrivateReviewText(JSON.stringify(view));
});

test('activity AI enhancement editor review blocks manual save until review completes', () => {
  const partial = buildActivityAiEnhancementEditorReviewPlan(
    createReviewSource({
      reviewedCheckIds: ['title', 'learning-goal', 'questions'],
    })
  );
  const confirmed = buildActivityAiEnhancementEditorReviewPlan(
    createReviewSource({
      teacherConfirmedReview: true,
    })
  );

  assert.equal(partial.status, 'needs-teacher-review');
  assert.equal(partial.canReachManualSave, false);
  assert.equal(partial.reviewedCheckCount, 3);
  assert.equal(partial.missingReviewCount, 9);
  assert.equal(confirmed.status, 'ready-for-manual-save');
  assert.equal(confirmed.canReachManualSave, true);
  assert.equal(confirmed.reviewedCheckCount, 12);
  assert.equal(confirmed.missingReviewCount, 0);
});

test('activity AI enhancement editor review reports review status without leaking draft text', () => {
  const view = buildActivityAiEnhancementEditorReviewView(
    createReviewSource({
      reviewedCheckIds: ['title', 'questions', 'answers', 'template-readiness'],
    })
  );
  const values = new Map(view.itemViews.map((item) => [item.id, item.value]));

  assert.equal(values.get('review-status'), 'needs-teacher-review');
  assert.equal(values.get('reviewed-check-count'), '4');
  assert.equal(values.get('missing-review-count'), '8');
  assert.equal(values.get('title-review'), 'Reviewed');
  assert.equal(values.get('learning-goal-review'), 'Needs review');
  assert.equal(values.get('manual-save-boundary'), 'Manual save blocked');
  assert.equal(values.get('publish-boundary'), 'No assignment link');
  assert.equal(values.get('snapshot-protection'), 'Frozen snapshots protected');
  assertNoPrivateReviewText(JSON.stringify(view));
});

test('activity AI enhancement editor review blocks before invalid application', () => {
  const unauthenticated = buildActivityAiEnhancementEditorReviewPlan(
    createReviewSource({
      hasAuthenticatedTeacher: false,
      teacherConfirmedReview: true,
    })
  );
  const invalidDraft = buildActivityAiEnhancementEditorReviewPlan(
    createReviewSource({
      proposedDraft: {
        ...createProposedDraft(),
        title: 'x',
      } as CreateActivityInput,
      teacherConfirmedReview: true,
    })
  );

  assert.equal(unauthenticated.status, 'blocked-before-review');
  assert.equal(unauthenticated.canReachManualSave, false);
  assert.equal(unauthenticated.application.canApplyToEditor, false);
  assert.equal(invalidDraft.status, 'blocked-before-review');
  assert.equal(invalidDraft.application.validationStatus, 'invalid');
  assert.equal(invalidDraft.canReachManualSave, false);
});

test('activity AI enhancement editor review gate is wired into docs and coverage', () => {
  assert.equal(
    existsSync('src/activities/ai-enhancement-editor-review.ts'),
    true
  );
  assert.match(
    REVIEW_SOURCE,
    /export const ACTIVITY_AI_ENHANCEMENT_EDITOR_REVIEW_ITEM_IDS = \[[\s\S]*'review-scope'[\s\S]*'application-plan-source'[\s\S]*'teacher-review-required'[\s\S]*'ready-to-save-gate'[\s\S]*'manual-save-boundary'[\s\S]*'review-chain-gate'/,
    'Editor review source should preserve the 30-slice review boundary.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /src\/activities\/ai-enhancement-editor-review\.ts` owns the teacher review gate/,
    'docs/product.md should document the AI enhancement editor review owner.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /Activity AI enhancement editor review has a fast script-level gate via[\s\S]*scripts\/activity-ai-enhancement-editor-review\.test\.ts[\s\S]*teacher review checklists[\s\S]*manual-save readiness[\s\S]*editor-only boundaries[\s\S]*snapshot protection[\s\S]*privacy guards/,
    'TEST-CATALOG should document the AI enhancement editor review gate.'
  );
});

function createReviewSource(
  overrides: Partial<ActivityAiEnhancementEditorReviewSource> = {}
): ActivityAiEnhancementEditorReviewSource {
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

function assertNoPrivateReviewText(serializedView: string) {
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
      `AI enhancement editor review leaked private text: ${privateValue}`
    );
  }
}
