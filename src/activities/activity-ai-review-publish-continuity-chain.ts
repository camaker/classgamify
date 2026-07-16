import { ACTIVITY_AI_AUTHORING_CHAIN_HANDOFF_ITEM_IDS } from '@/activities/ai-authoring-chain';
import { ACTIVITY_AI_ENHANCEMENT_EDITOR_REVIEW_ITEM_IDS } from '@/activities/ai-enhancement-editor-review';
import { ACTIVITY_AI_ENHANCEMENT_LIFECYCLE_CHAIN_ITEM_IDS } from '@/activities/ai-enhancement-lifecycle-chain';
import { ACTIVITY_AI_ENHANCEMENT_PUBLISH_BOUNDARY_ITEM_IDS } from '@/activities/ai-enhancement-publish-boundary';
import { ACTIVITY_AI_ENHANCEMENT_SAVE_BOUNDARY_ITEM_IDS } from '@/activities/ai-enhancement-save-boundary';
import { ACTIVITY_AI_FALLBACK_DRAFT_CHAIN_HANDOFF_ITEM_IDS } from '@/activities/ai-fallback-draft-chain';

export const ACTIVITY_AI_REVIEW_PUBLISH_CONTINUITY_CHAIN_STAGES = [
  stage('safe-source-readiness', 'source'),
  stage('source-text-sanitization', 'source'),
  stage('material-provenance-sanitization', 'source'),
  stage('authenticated-generation', 'generation'),
  stage('provider-model-selection', 'generation'),
  stage('deterministic-fallback', 'generation'),
  stage('structured-draft-output', 'generation'),
  stage('create-input-validation', 'application'),
  stage('editor-only-application', 'application'),
  stage('field-target-coverage', 'application'),
  stage('template-readiness', 'application'),
  stage('quiz-choice-readiness', 'application'),
  stage('teacher-review-checklist', 'review'),
  stage('required-review-confirmation', 'review'),
  stage('blocked-before-review', 'review'),
  stage('manual-save-action', 'save'),
  stage('authenticated-save-gate', 'save'),
  stage('activity-record-only-target', 'save'),
  stage('create-or-update-boundary', 'save'),
  stage('existing-snapshot-protection', 'save'),
  stage('saved-activity-publish-source', 'publish'),
  stage('publish-dialog-validation', 'publish'),
  stage('teacher-publish-action', 'publish'),
  stage('assignment-snapshot-freeze', 'publish'),
  stage('result-export-continuity', 'publish'),
  stage('raw-source-hidden', 'privacy'),
  stage('raw-provider-output-hidden', 'privacy'),
  stage('file-bytes-and-storage-hidden', 'privacy'),
  stage('answer-and-prompt-text-hidden', 'privacy'),
  stage('student-and-link-data-hidden', 'privacy'),
] as const;

export const ACTIVITY_AI_REVIEW_PUBLISH_CONTINUITY_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/api/activity-ai.ts',
  'src/api/activities.ts',
  'src/api/assignments.ts',
  'src/ai/workers.ts',
  'src/activities/ai-authoring-chain.ts',
  'src/activities/ai-fallback-draft-chain.ts',
  'src/activities/ai-enhancement-lifecycle-chain.ts',
  'src/activities/ai-enhancement-editor-review.ts',
  'src/activities/ai-enhancement-save-boundary.ts',
  'src/activities/ai-enhancement-publish-boundary.ts',
  'src/activities/ai-enhancement-draft-output.ts',
  'src/activities/ai-enhancement-draft-application.ts',
  'src/activities/ai-draft.ts',
  'src/activities/ai-draft-boundary.ts',
  'src/activities/draft-source.ts',
  'src/activities/draft-meta.ts',
  'src/activities/editor.ts',
  'src/activities/validation.ts',
  'src/activities/persistence.ts',
  'src/activities/source-material-privacy-chain.ts',
  'src/activities/template-remix.ts',
  'src/assignments/publish-input.ts',
  'src/assignments/snapshot.ts',
  'src/components/activities/activity-ai-draft-panel.tsx',
  'src/components/activities/activity-create-form.tsx',
  'scripts/activity-ai-authoring-chain-handoff.test.ts',
  'scripts/activity-ai-fallback-draft-chain-handoff.test.ts',
  'scripts/activity-ai-enhancement-lifecycle-chain.test.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export function buildActivityAiReviewPublishContinuityChainView() {
  return {
    description:
      'Thirty-stage AI review-to-publish continuity from sanitized teacher source and deterministic draft generation through editor-only application, required review, manual activity save, explicit assignment publishing, snapshot protection, and privacy.',
    itemViews: ACTIVITY_AI_REVIEW_PUBLISH_CONTINUITY_CHAIN_STAGES.map(
      (item) => ({
        id: item.id,
        label: item.id
          .split('-')
          .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
          .join(' '),
        value: `${item.layer} boundary`,
      })
    ),
    privacy: {
      createsAssignmentLinksWithoutTeacherAction: false as const,
      createsSnapshotsWithoutTeacherAction: false as const,
      exposesAnswerText: false as const,
      exposesFileBytes: false as const,
      exposesPromptText: false as const,
      exposesRawProviderOutput: false as const,
      exposesRawSourceText: false as const,
      exposesShareSlugs: false as const,
      exposesSourceMaterialStorageKeys: false as const,
      exposesStudentData: false as const,
      persistsActivityWithoutTeacherAction: false as const,
      preservesExistingAssignmentSnapshots: true as const,
      requiresTeacherReview: true as const,
      requiresTeacherSave: true as const,
      sourceFileCount:
        ACTIVITY_AI_REVIEW_PUBLISH_CONTINUITY_CHAIN_SOURCE_FILES.length,
    },
    sourceContracts: {
      authoring: ACTIVITY_AI_AUTHORING_CHAIN_HANDOFF_ITEM_IDS.length,
      editorReview: ACTIVITY_AI_ENHANCEMENT_EDITOR_REVIEW_ITEM_IDS.length,
      fallback: ACTIVITY_AI_FALLBACK_DRAFT_CHAIN_HANDOFF_ITEM_IDS.length,
      lifecycle: ACTIVITY_AI_ENHANCEMENT_LIFECYCLE_CHAIN_ITEM_IDS.length,
      publish: ACTIVITY_AI_ENHANCEMENT_PUBLISH_BOUNDARY_ITEM_IDS.length,
      save: ACTIVITY_AI_ENHANCEMENT_SAVE_BOUNDARY_ITEM_IDS.length,
    },
    title: 'Activity AI review to publish continuity chain',
  };
}

function stage(
  id: string,
  layer:
    | 'application'
    | 'generation'
    | 'privacy'
    | 'publish'
    | 'review'
    | 'save'
    | 'source'
) {
  return { id, layer };
}
