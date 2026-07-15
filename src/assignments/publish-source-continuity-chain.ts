import { ASSIGNMENT_PUBLISH_SOURCE_WRITE_GUARD_STAGES } from '@/assignments/publish-source-write';

export const ASSIGNMENT_PUBLISH_SOURCE_CONTINUITY_CHAIN_STAGES =
  ASSIGNMENT_PUBLISH_SOURCE_WRITE_GUARD_STAGES;

export const ASSIGNMENT_PUBLISH_SOURCE_CONTINUITY_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'docs/db.md',
  'src/assignments/publish-source-write.ts',
  'src/lib/error-text.ts',
  'src/activities/lifecycle.ts',
  'src/activities/source-material-integrity.ts',
  'src/api/assignments.ts',
  'src/assignments/publish-input.ts',
  'src/assignments/publish-schedule.ts',
  'src/assignments/snapshot.ts',
  'src/assignments/persistence.ts',
  'src/assignments/published-assignment.ts',
  'src/assignments/published-assignment-delivery-chain.ts',
  'src/assignments/assignment-distribution-lifecycle-chain.ts',
  'src/assignments/source-activity-context-chain.ts',
  'src/activities/activity-lifecycle-governance-chain.ts',
  'src/activities/mutation-concurrency.ts',
  'src/assignments/public.ts',
  'src/assignments/results.ts',
  'src/assignments/results-export.ts',
  'src/components/assignments/assignment-settings-summary.tsx',
  'src/components/assignments/published-assignment-panel.tsx',
  'src/components/activities/activity-publish-settings-form.tsx',
  'src/components/activities/activity-publish-dialog.tsx',
  'src/components/activities/activity-create-form.tsx',
  'src/db/app.schema.ts',
  'src/db/migrations/0012_assignment_publish_source_guard.sql',
  'scripts/assignment-publish-source-write-guard-contract.test.ts',
  'tests/e2e/specs/activity-authoring.spec.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type AssignmentPublishSourceContinuityChainPrivacyContract = {
  chainSourceFileCount: number;
  exposesActivityContent: false;
  exposesAssignmentIds: false;
  exposesInternalTriggerMarkers: false;
  exposesSourceMaterialMetadata: false;
  exposesTeacherOwnerIds: false;
  itemIds: string[];
  preservesExistingAssignments: true;
  preservesExistingSnapshots: true;
  sourceFiles: string[];
  usesOwnerScopedSourceRead: true;
  usesTransactionalSnapshotFreeze: true;
  usesWriteTimeSourceGuard: true;
};

export function buildAssignmentPublishSourceContinuityChainView() {
  const itemViews = ASSIGNMENT_PUBLISH_SOURCE_CONTINUITY_CHAIN_STAGES.map(
    (stage) => {
      const label = stage.id
        .split('-')
        .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
        .join(' ');
      const value = `${stage.layer} boundary`;
      return {
        ariaLabel: `${label}: ${value}`,
        description: `${label} stays aligned from teacher publish intent through the D1 source guard, transactional snapshot freeze, published delivery, and retained results.`,
        id: stage.id,
        label,
        value,
      };
    }
  );

  const privacy: AssignmentPublishSourceContinuityChainPrivacyContract = {
    chainSourceFileCount:
      ASSIGNMENT_PUBLISH_SOURCE_CONTINUITY_CHAIN_SOURCE_FILES.length,
    exposesActivityContent: false,
    exposesAssignmentIds: false,
    exposesInternalTriggerMarkers: false,
    exposesSourceMaterialMetadata: false,
    exposesTeacherOwnerIds: false,
    itemIds: ASSIGNMENT_PUBLISH_SOURCE_CONTINUITY_CHAIN_STAGES.map(
      (stage) => stage.id
    ),
    preservesExistingAssignments: true,
    preservesExistingSnapshots: true,
    sourceFiles: [...ASSIGNMENT_PUBLISH_SOURCE_CONTINUITY_CHAIN_SOURCE_FILES],
    usesOwnerScopedSourceRead: true,
    usesTransactionalSnapshotFreeze: true,
    usesWriteTimeSourceGuard: true,
  };

  return {
    description:
      'Thirty-slice assignment publish source continuity chain from owner-scoped source reads and restore checks through D1 write-time guards, transactional snapshot freeze, published delivery, existing assignment retention, and privacy.',
    itemViews,
    privacy,
    title: 'Assignment publish source continuity chain',
  };
}
