import { ACTIVITY_LIBRARY_FILTER_STATE_CHAIN_HANDOFF_ITEM_IDS } from '@/activities/activity-library-filter-state-chain';
import { ACTIVITY_LIFECYCLE_GOVERNANCE_CHAIN_HANDOFF_ITEM_IDS } from '@/activities/activity-lifecycle-governance-chain';
import { ACTIVITY_MUTATION_CONTINUITY_CHAIN_STAGES } from '@/activities/activity-mutation-continuity-chain';
import { ACTIVITY_AUTHORING_LIBRARY_CHAIN_HANDOFF_ITEM_IDS } from '@/activities/authoring-library-chain';
import { ACTIVITY_DERIVATIVE_SOURCE_CONTINUITY_CHAIN_STAGES } from '@/activities/derivative-source-continuity-chain';
import { ASSIGNMENT_PUBLISH_SOURCE_CONTINUITY_CHAIN_STAGES } from '@/assignments/publish-source-continuity-chain';

export const ACTIVITY_AUTHORING_PUBLISH_CONTINUITY_CHAIN_STAGES = [
  stage('public-template-entry', 'authoring'),
  stage('shared-create-editor', 'authoring'),
  stage('structured-content-validation', 'authoring'),
  stage('teacher-save-action', 'authoring'),
  stage('owner-scoped-persistence', 'authoring'),
  stage('edit-contract-roundtrip', 'authoring'),
  stage('owner-scoped-library', 'library'),
  stage('normalized-library-search', 'library'),
  stage('status-template-source-filters', 'library'),
  stage('bounded-pagination', 'library'),
  stage('created-activity-context', 'library'),
  stage('safe-library-summary', 'library'),
  stage('edit-lifecycle-gate', 'mutation'),
  stage('archive-lifecycle-gate', 'mutation'),
  stage('restore-lifecycle-gate', 'mutation'),
  stage('monotonic-revision', 'mutation'),
  stage('owner-visibility-revision-cas', 'mutation'),
  stage('update-returning-conflict-reload', 'mutation'),
  stage('duplicate-source-read', 'derivative'),
  stage('remix-readiness-check', 'derivative'),
  stage('source-provenance-write-guard', 'derivative'),
  stage('independent-draft-persistence', 'derivative'),
  stage('publish-source-owner-read', 'publish'),
  stage('restore-before-publish', 'publish'),
  stage('assignment-snapshot-transaction', 'publish'),
  stage('d1-publish-source-guard', 'publish'),
  stage('existing-snapshot-isolation', 'publish'),
  stage('activity-content-hidden', 'privacy'),
  stage('source-provenance-hidden', 'privacy'),
  stage('teacher-and-student-data-hidden', 'privacy'),
] as const;

export const ACTIVITY_AUTHORING_PUBLISH_CONTINUITY_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/routes/templates.tsx',
  'src/routes/create.tsx',
  'src/routes/dashboard/activities.tsx',
  'src/routes/dashboard/activities/$activityId.tsx',
  'src/components/activities/activity-create-form.tsx',
  'src/components/activities/activity-library-card.tsx',
  'src/components/activities/activity-publish-dialog.tsx',
  'src/api/activities.ts',
  'src/api/assignments.ts',
  'src/activities/authoring-library-chain.ts',
  'src/activities/activity-library-filter-state-chain.ts',
  'src/activities/activity-lifecycle-governance-chain.ts',
  'src/activities/activity-mutation-continuity-chain.ts',
  'src/activities/derivative-source-continuity-chain.ts',
  'src/activities/editor.ts',
  'src/activities/validation.ts',
  'src/activities/persistence.ts',
  'src/activities/library-query.ts',
  'src/activities/lifecycle.ts',
  'src/activities/duplicate.ts',
  'src/activities/template-remix.ts',
  'src/assignments/publish-source-continuity-chain.ts',
  'src/assignments/snapshot.ts',
  'src/assignments/public.ts',
  'scripts/activity-authoring-library-chain-handoff.test.ts',
  'scripts/activity-library-filter-state-chain-handoff.test.ts',
  'scripts/activity-mutation-continuity-chain-handoff.test.ts',
  'scripts/activity-derivative-source-continuity-chain-handoff.test.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export function buildActivityAuthoringPublishContinuityChainView() {
  return {
    description:
      'Thirty-stage activity authoring-to-publish continuity from public template entry through teacher-reviewed persistence, owner-scoped library reuse, atomic lifecycle changes, derivative drafts, assignment snapshot publishing, and privacy.',
    itemViews: ACTIVITY_AUTHORING_PUBLISH_CONTINUITY_CHAIN_STAGES.map(
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
      createsAssignmentWithoutTeacherAction: false as const,
      exposesActivityContent: false as const,
      exposesAssignmentSnapshots: false as const,
      exposesSourceMaterialMetadata: false as const,
      exposesSourceProvenance: false as const,
      exposesStudentData: false as const,
      exposesTeacherOwnerIds: false as const,
      preservesExistingAssignmentSnapshots: true as const,
      sourceFileCount:
        ACTIVITY_AUTHORING_PUBLISH_CONTINUITY_CHAIN_SOURCE_FILES.length,
      usesAtomicLifecycleMutations: true as const,
      usesGuardedDerivativeWrites: true as const,
      usesGuardedPublishWrites: true as const,
    },
    sourceContracts: {
      authoringLibrary:
        ACTIVITY_AUTHORING_LIBRARY_CHAIN_HANDOFF_ITEM_IDS.length,
      derivative: ACTIVITY_DERIVATIVE_SOURCE_CONTINUITY_CHAIN_STAGES.length,
      filterState: ACTIVITY_LIBRARY_FILTER_STATE_CHAIN_HANDOFF_ITEM_IDS.length,
      lifecycle: ACTIVITY_LIFECYCLE_GOVERNANCE_CHAIN_HANDOFF_ITEM_IDS.length,
      mutation: ACTIVITY_MUTATION_CONTINUITY_CHAIN_STAGES.length,
      publish: ASSIGNMENT_PUBLISH_SOURCE_CONTINUITY_CHAIN_STAGES.length,
    },
    title: 'Activity authoring to publish continuity chain',
  };
}

function stage(
  id: string,
  layer:
    | 'authoring'
    | 'derivative'
    | 'library'
    | 'mutation'
    | 'privacy'
    | 'publish'
) {
  return { id, layer };
}
