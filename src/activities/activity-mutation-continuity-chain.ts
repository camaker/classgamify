import { ACTIVITY_MUTATION_CONCURRENCY_STAGES } from '@/activities/mutation-concurrency';

export const ACTIVITY_MUTATION_CONTINUITY_CHAIN_STAGES =
  ACTIVITY_MUTATION_CONCURRENCY_STAGES;

export const ACTIVITY_MUTATION_CONTINUITY_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'docs/db.md',
  'src/activities/mutation-concurrency.ts',
  'src/activities/detail-query.ts',
  'src/activities/lifecycle.ts',
  'src/activities/types.ts',
  'src/api/activities.ts',
  'src/activities/activity-lifecycle-governance-chain.ts',
  'src/activities/authoring-library-chain.ts',
  'src/activities/library-view.ts',
  'src/activities/library-filters.ts',
  'src/activities/persistence.ts',
  'src/activities/duplicate.ts',
  'src/activities/template-remix.ts',
  'src/activities/derivative-source-write.ts',
  'src/assignments/publish-source-continuity-chain.ts',
  'src/assignments/snapshot.ts',
  'src/assignments/public.ts',
  'src/assignments/results.ts',
  'src/components/activities/activity-library-card.tsx',
  'src/components/activities/activity-library-action-status-badge.tsx',
  'src/components/activities/activity-create-form.tsx',
  'src/components/activities/activity-editor-shell.tsx',
  'src/routes/dashboard/activities/$activityId.tsx',
  'src/db/app.schema.ts',
  'scripts/activity-mutation-concurrency-contract.test.ts',
  'scripts/activity-lifecycle-governance-chain-handoff.test.ts',
  'scripts/activity-edit-route-handoff-semantic-views.test.ts',
  'tests/e2e/specs/activity-authoring.spec.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type ActivityMutationContinuityChainPrivacyContract = {
  chainSourceFileCount: number;
  exposesActivityContent: false;
  exposesActivityIds: false;
  exposesAssignmentRecords: false;
  exposesSourceMaterialMetadata: false;
  exposesTeacherOwnerIds: false;
  itemIds: string[];
  preservesAssignmentSnapshots: true;
  sourceFiles: string[];
  usesMonotonicRevision: true;
  usesOwnerScopedCompareAndSet: true;
  usesSingleUpdateReturning: true;
};

export function buildActivityMutationContinuityChainView() {
  const itemViews = ACTIVITY_MUTATION_CONTINUITY_CHAIN_STAGES.map((stage) => {
    const label = stage.id
      .split('-')
      .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
      .join(' ');
    const value = `${stage.layer} boundary`;
    return {
      ariaLabel: `${label}: ${value}`,
      description: `${label} stays aligned from teacher edit, archive, or restore intent through owner-scoped compare-and-set persistence, conflict recovery, derivative gates, and retained assignment snapshots.`,
      id: stage.id,
      label,
      value,
    };
  });

  const privacy: ActivityMutationContinuityChainPrivacyContract = {
    chainSourceFileCount:
      ACTIVITY_MUTATION_CONTINUITY_CHAIN_SOURCE_FILES.length,
    exposesActivityContent: false,
    exposesActivityIds: false,
    exposesAssignmentRecords: false,
    exposesSourceMaterialMetadata: false,
    exposesTeacherOwnerIds: false,
    itemIds: ACTIVITY_MUTATION_CONTINUITY_CHAIN_STAGES.map((stage) => stage.id),
    preservesAssignmentSnapshots: true,
    sourceFiles: [...ACTIVITY_MUTATION_CONTINUITY_CHAIN_SOURCE_FILES],
    usesMonotonicRevision: true,
    usesOwnerScopedCompareAndSet: true,
    usesSingleUpdateReturning: true,
  };

  return {
    description:
      'Thirty-slice activity mutation continuity chain from teacher edit, archive, and restore intent through monotonic owner-scoped compare-and-set writes, conflict reloads, derivative gates, retained assignment snapshots, and privacy.',
    itemViews,
    privacy,
    title: 'Activity mutation continuity chain',
  };
}
