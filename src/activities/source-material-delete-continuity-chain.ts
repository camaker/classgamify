import { ACTIVITY_SOURCE_MATERIAL_DELETE_STAGES } from '@/activities/source-material-delete';

export const SOURCE_MATERIAL_DELETE_CONTINUITY_CHAIN_STAGES =
  ACTIVITY_SOURCE_MATERIAL_DELETE_STAGES;
export const SOURCE_MATERIAL_DELETE_CONTINUITY_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'docs/db.md',
  'docs/storage.md',
  'src/activities/source-material-delete.ts',
  'src/activities/material-references.ts',
  'src/activities/source-material-write-continuity-chain.ts',
  'src/activities/source-material-integrity.ts',
  'src/activities/source-material-privacy-chain.ts',
  'src/activities/source-extraction-lifecycle-chain.ts',
  'src/api/user-files.ts',
  'src/storage/file-query.ts',
  'src/storage/user-file-response.ts',
  'src/storage/provider/r2.ts',
  'src/activities/lifecycle.ts',
  'src/activities/persistence.ts',
  'src/assignments/snapshot.ts',
  'src/assignments/public.ts',
  'src/assignments/results.ts',
  'src/db/app.schema.ts',
  'src/components/activities/activity-source-materials-summary.tsx',
  'src/routes/settings/files.tsx',
  'src/hooks/use-user-files.ts',
  'project.inlang/messages/en.json',
  'project.inlang/messages/zh.json',
  'scripts/activity-source-material-delete-contract.test.ts',
  'scripts/source-material-integrity-guard-contract.test.ts',
  'scripts/storage-file-access-boundary.test.ts',
  'tests/e2e/specs/settings-profile.spec.ts',
  'tests/e2e/specs/activity-authoring.spec.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export function buildSourceMaterialDeleteContinuityChainView() {
  const itemViews = SOURCE_MATERIAL_DELETE_CONTINUITY_CHAIN_STAGES.map(
    (stage) => {
      const label = stage.id
        .split('-')
        .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
        .join(' ');
      return {
        ariaLabel: `${label}: ${stage.layer} boundary`,
        description: `${label} stays aligned from teacher file deletion intent through owner-scoped activity and snapshot reference checks, metadata claim, R2 deletion, and privacy.`,
        id: stage.id,
        label,
        value: `${stage.layer} boundary`,
      };
    }
  );
  return {
    description:
      'Thirty-slice source-material deletion continuity chain from owner-scoped file lookup through active, archived, and frozen-snapshot reference checks, metadata claim, storage deletion, retained provenance, and privacy.',
    itemViews,
    privacy: {
      chainSourceFileCount:
        SOURCE_MATERIAL_DELETE_CONTINUITY_CHAIN_SOURCE_FILES.length,
      exposesActivityContent: false as const,
      exposesAssignmentContent: false as const,
      exposesStudentData: false as const,
      exposesStorageKeys: false as const,
      itemIds: SOURCE_MATERIAL_DELETE_CONTINUITY_CHAIN_STAGES.map(
        (stage) => stage.id
      ),
      preservesActivityContent: true as const,
      preservesSnapshotProvenance: true as const,
      sourceFiles: [...SOURCE_MATERIAL_DELETE_CONTINUITY_CHAIN_SOURCE_FILES],
      usesOwnerScopedReferenceChecks: true as const,
      verifiesReferencesBeforeStorageDelete: true as const,
    },
    title: 'Source material delete continuity chain',
  };
}
