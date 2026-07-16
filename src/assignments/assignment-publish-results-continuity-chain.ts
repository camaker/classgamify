import { ASSIGNMENT_DISTRIBUTION_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/assignment-distribution-lifecycle-chain';
import { ASSIGNMENT_ATTEMPT_PERSISTENCE_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/attempt-persistence-continuity-chain';
import { PUBLISHED_ASSIGNMENT_DELIVERY_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/published-assignment-delivery-chain';
import { STUDENT_RUNNER_PLAY_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/student-runner-play-chain';
import { STUDENT_RUNNER_SUBMISSION_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/student-runner-submission-chain';
import { TEACHER_RESULTS_REVIEW_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/teacher-results-review-chain';

export const ASSIGNMENT_PUBLISH_RESULTS_CONTINUITY_CHAIN_STAGES = [
  stage('teacher-publish-settings', 'publish'),
  stage('delivery-policy-preview', 'publish'),
  stage('assignment-snapshot-freeze', 'publish'),
  stage('share-slug-allocation', 'publish'),
  stage('published-link-context', 'publish'),
  stage('absolute-play-url', 'distribution'),
  stage('copy-and-preview-actions', 'distribution'),
  stage('public-open-state', 'distribution'),
  stage('sanitized-public-payload', 'distribution'),
  stage('stable-item-order', 'distribution'),
  stage('runner-loading-readiness', 'runner'),
  stage('public-rule-summary', 'runner'),
  stage('student-identity-strategy', 'runner'),
  stage('template-runtime-interaction', 'runner'),
  stage('completion-progress', 'runner'),
  stage('partial-submit-confirmation', 'submission'),
  stage('frozen-runtime-validation', 'submission'),
  stage('idempotent-submission-key', 'submission'),
  stage('lifecycle-write-guard', 'submission'),
  stage('attempt-limit-slot', 'submission'),
  stage('deterministic-scoring', 'persistence'),
  stage('immutable-attempt-persistence', 'persistence'),
  stage('sanitized-student-feedback', 'persistence'),
  stage('attempt-statistics', 'results'),
  stage('item-performance-analysis', 'results'),
  stage('student-follow-up-summary', 'results'),
  stage('copy-export-print-actions', 'results'),
  stage('teacher-answer-data-hidden', 'privacy'),
  stage('student-identity-hidden', 'privacy'),
  stage('source-and-storage-data-hidden', 'privacy'),
] as const;

export const ASSIGNMENT_PUBLISH_RESULTS_CONTINUITY_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/api/assignments.ts',
  'src/assignments/published-assignment-delivery-chain.ts',
  'src/assignments/assignment-distribution-lifecycle-chain.ts',
  'src/assignments/student-runner-play-chain.ts',
  'src/assignments/student-runner-submission-chain.ts',
  'src/assignments/attempt-persistence-continuity-chain.ts',
  'src/assignments/teacher-results-review-chain.ts',
  'src/assignments/publish-input.ts',
  'src/assignments/snapshot.ts',
  'src/assignments/public.ts',
  'src/assignments/share-link.ts',
  'src/assignments/delivery-summary.ts',
  'src/assignments/item-order.ts',
  'src/assignments/student-runner-state.ts',
  'src/assignments/attempt-answers.ts',
  'src/assignments/submission-idempotency.ts',
  'src/assignments/submission-lifecycle-write.ts',
  'src/assignments/attempt-persistence.ts',
  'src/activities/runtime.ts',
  'src/assignments/results.ts',
  'src/assignments/result-view.ts',
  'src/assignments/results-export.ts',
  'src/routes/play/$shareId.tsx',
  'src/routes/dashboard/assignments/$assignmentId.tsx',
  'scripts/published-assignment-delivery-chain-handoff.test.ts',
  'scripts/assignment-distribution-lifecycle-chain-handoff.test.ts',
  'scripts/student-runner-submission-chain-handoff.test.ts',
  'scripts/teacher-results-review-chain-handoff.test.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export function buildAssignmentPublishResultsContinuityChainView() {
  return {
    description:
      'Thirty-stage assignment publish-to-results continuity from teacher delivery settings and frozen snapshots through share-link distribution, sanitized student play, guarded attempt persistence, teacher analysis, and privacy.',
    itemViews: ASSIGNMENT_PUBLISH_RESULTS_CONTINUITY_CHAIN_STAGES.map(
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
      exposesAnswerText: false as const,
      exposesAttemptIds: false as const,
      exposesRuntimeItemIds: false as const,
      exposesSourceMaterialMetadata: false as const,
      exposesStorageKeys: false as const,
      exposesStudentIdentity: false as const,
      exposesTeacherAnswerKeys: false as const,
      preservesFrozenSnapshot: true as const,
      sourceFileCount:
        ASSIGNMENT_PUBLISH_RESULTS_CONTINUITY_CHAIN_SOURCE_FILES.length,
      usesGuardedAttemptPersistence: true as const,
      usesSanitizedPublicPayload: true as const,
    },
    sourceContracts: {
      delivery: PUBLISHED_ASSIGNMENT_DELIVERY_CHAIN_HANDOFF_ITEM_IDS.length,
      distribution:
        ASSIGNMENT_DISTRIBUTION_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS.length,
      persistence:
        ASSIGNMENT_ATTEMPT_PERSISTENCE_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS.length,
      play: STUDENT_RUNNER_PLAY_CHAIN_HANDOFF_ITEM_IDS.length,
      results: TEACHER_RESULTS_REVIEW_CHAIN_HANDOFF_ITEM_IDS.length,
      submission: STUDENT_RUNNER_SUBMISSION_CHAIN_HANDOFF_ITEM_IDS.length,
    },
    title: 'Assignment publish to results continuity chain',
  };
}

function stage(
  id: string,
  layer:
    | 'distribution'
    | 'persistence'
    | 'privacy'
    | 'publish'
    | 'results'
    | 'runner'
    | 'submission'
) {
  return { id, layer };
}
