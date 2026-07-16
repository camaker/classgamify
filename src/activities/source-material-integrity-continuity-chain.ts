import { SOURCE_MATERIAL_INTEGRITY_STAGES } from '@/activities/source-material-integrity';

export const SOURCE_MATERIAL_INTEGRITY_CONTINUITY_CHAIN_STAGES =
  SOURCE_MATERIAL_INTEGRITY_STAGES;
export const SOURCE_MATERIAL_INTEGRITY_CONTINUITY_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'docs/db.md',
  'docs/storage.md',
  'src/activities/source-material-integrity.ts',
  'src/activities/source-material-write-continuity-chain.ts',
  'src/activities/source-material-delete-continuity-chain.ts',
  'src/activities/material-references.ts',
  'src/activities/persistence.ts',
  'src/api/activities.ts',
  'src/api/assignments.ts',
  'src/api/user-files.ts',
  'src/storage/provider/r2.ts',
  'src/storage/file-query.ts',
  'src/storage/user-file-response.ts',
  'src/assignments/snapshot.ts',
  'src/assignments/public.ts',
  'src/activities/activity-mutation-continuity-chain.ts',
  'src/assignments/publish-source-continuity-chain.ts',
  'src/db/app.schema.ts',
  'src/db/migrations/0014_source_material_integrity_guard.sql',
  'scripts/source-material-integrity-guard-contract.test.ts',
  'scripts/activity-source-material-write-contract.test.ts',
  'scripts/activity-source-material-delete-contract.test.ts',
  'scripts/storage-file-access-boundary.test.ts',
  'scripts/user-file-upload-persistence-contract.test.ts',
  'src/routes/settings/files.tsx',
  'src/hooks/use-user-files.ts',
  'tests/e2e/specs/activity-authoring.spec.ts',
  'tests/e2e/specs/settings-profile.spec.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export function buildSourceMaterialIntegrityContinuityChainView() {
  const itemViews = SOURCE_MATERIAL_INTEGRITY_CONTINUITY_CHAIN_STAGES.map(
    (stage) => {
      const label = stage.id
        .split('-')
        .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
        .join(' ');
      return {
        ariaLabel: `${label}: ${stage.layer} boundary`,
        description: `${label} stays aligned across activity and snapshot writes, metadata claims, R2 deletion recovery, and privacy.`,
        id: stage.id,
        label,
        value: `${stage.layer} boundary`,
      };
    }
  );
  return {
    description:
      'Thirty-slice source-material integrity continuity chain from initial reference validation through D1 write and delete triggers, metadata claims, R2 presence probes, bounded metadata restoration, safe failures, and privacy.',
    itemViews,
    privacy: {
      chainSourceFileCount:
        SOURCE_MATERIAL_INTEGRITY_CONTINUITY_CHAIN_SOURCE_FILES.length,
      exposesActivityContent: false as const,
      exposesSnapshotContent: false as const,
      exposesStorageKeys: false as const,
      exposesStudentData: false as const,
      itemIds: SOURCE_MATERIAL_INTEGRITY_CONTINUITY_CHAIN_STAGES.map(
        (stage) => stage.id
      ),
      sourceFiles: [...SOURCE_MATERIAL_INTEGRITY_CONTINUITY_CHAIN_SOURCE_FILES],
      usesDatabaseWriteGuards: true as const,
      usesGuardedMetadataClaim: true as const,
      usesStoragePresenceRecovery: true as const,
      preservesSingleWriterOrdering: true as const,
    },
    title: 'Source material integrity continuity chain',
  };
}
