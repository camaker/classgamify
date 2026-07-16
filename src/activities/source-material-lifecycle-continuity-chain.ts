import { SOURCE_MATERIAL_DELETE_CONTINUITY_CHAIN_STAGES } from '@/activities/source-material-delete-continuity-chain';
import { SOURCE_MATERIAL_INTEGRITY_CONTINUITY_CHAIN_STAGES } from '@/activities/source-material-integrity-continuity-chain';
import { SOURCE_MATERIAL_PRIVACY_CHAIN_HANDOFF_ITEM_IDS } from '@/activities/source-material-privacy-chain';
import { ACTIVITY_SOURCE_MATERIAL_WRITE_CONTINUITY_CHAIN_STAGES } from '@/activities/source-material-write-continuity-chain';
import { ASSIGNMENT_PUBLISH_SOURCE_CONTINUITY_CHAIN_STAGES } from '@/assignments/publish-source-continuity-chain';
import { PRIVATE_UPLOAD_TRANSACTION_CONTINUITY_CHAIN_STAGES } from '@/storage/private-upload-transaction-continuity-chain';

export const SOURCE_MATERIAL_LIFECYCLE_CONTINUITY_CHAIN_STAGES = [
  stage('private-upload-validation', 'upload'),
  stage('single-r2-write', 'upload'),
  stage('ambiguous-put-recovery', 'upload'),
  stage('owner-metadata-persistence', 'upload'),
  stage('bounded-upload-compensation', 'upload'),
  stage('safe-file-response', 'upload'),
  stage('compact-reference-shape', 'reference'),
  stage('safe-file-id', 'reference'),
  stage('safe-filename-basename', 'reference'),
  stage('material-kind-normalization', 'reference'),
  stage('duplicate-reference-collapse', 'reference'),
  stage('reference-limit', 'reference'),
  stage('owner-scoped-reference-resolution', 'write'),
  stage('all-or-nothing-activity-create', 'write'),
  stage('all-or-nothing-activity-edit', 'write'),
  stage('activity-write-trigger', 'write'),
  stage('derivative-write-guard', 'write'),
  stage('atomic-mutation-guard', 'write'),
  stage('publish-source-revision-check', 'publish'),
  stage('snapshot-reference-freeze', 'publish'),
  stage('snapshot-write-trigger', 'publish'),
  stage('public-payload-source-guard', 'publish'),
  stage('active-reference-delete-guard', 'delete'),
  stage('archived-reference-delete-guard', 'delete'),
  stage('snapshot-reference-delete-guard', 'delete'),
  stage('metadata-claim-before-r2-delete', 'delete'),
  stage('r2-delete-presence-recovery', 'delete'),
  stage('file-bytes-hidden', 'privacy'),
  stage('storage-keys-hidden', 'privacy'),
  stage('student-source-list-hidden', 'privacy'),
] as const;

export const SOURCE_MATERIAL_LIFECYCLE_CONTINUITY_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'docs/storage.md',
  'src/storage/private-upload-transaction-continuity-chain.ts',
  'src/storage/upload-put-recovery.ts',
  'src/storage/upload-persistence.ts',
  'src/storage/user-file-response.ts',
  'src/storage/provider/r2.ts',
  'src/api/user-files.ts',
  'src/activities/material-references.ts',
  'src/activities/persistence.ts',
  'src/activities/source-material-privacy-chain.ts',
  'src/activities/source-material-write-continuity-chain.ts',
  'src/activities/source-material-delete-continuity-chain.ts',
  'src/activities/source-material-integrity.ts',
  'src/activities/source-material-integrity-continuity-chain.ts',
  'src/activities/activity-mutation-continuity-chain.ts',
  'src/activities/derivative-source-continuity-chain.ts',
  'src/api/activities.ts',
  'src/api/assignments.ts',
  'src/assignments/publish-source-continuity-chain.ts',
  'src/assignments/snapshot.ts',
  'src/assignments/public.ts',
  'src/db/migrations/0014_source_material_integrity_guard.sql',
  'scripts/private-upload-transaction-continuity-chain-handoff.test.ts',
  'scripts/source-material-privacy-chain-handoff.test.ts',
  'scripts/activity-source-material-write-continuity-chain-handoff.test.ts',
  'scripts/assignment-publish-source-continuity-chain-handoff.test.ts',
  'scripts/source-material-delete-continuity-chain-handoff.test.ts',
  'scripts/source-material-integrity-continuity-chain-handoff.test.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export function buildSourceMaterialLifecycleContinuityChainView() {
  return {
    description:
      'Thirty-stage source-material lifecycle continuity from private upload through compact references, guarded activity writes, frozen assignment snapshots, protected deletion, recovery, and privacy.',
    itemViews: SOURCE_MATERIAL_LIFECYCLE_CONTINUITY_CHAIN_STAGES.map(
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
      exposesActivityContent: false as const,
      exposesFileBytes: false as const,
      exposesFileIds: false as const,
      exposesSnapshotContent: false as const,
      exposesStorageKeys: false as const,
      exposesStudentData: false as const,
      sourceFileCount:
        SOURCE_MATERIAL_LIFECYCLE_CONTINUITY_CHAIN_SOURCE_FILES.length,
      usesDatabaseIntegrityGuards: true as const,
      usesFrozenSnapshotReferences: true as const,
      usesGuardedMetadataClaims: true as const,
    },
    sourceContracts: {
      deleteContinuity: SOURCE_MATERIAL_DELETE_CONTINUITY_CHAIN_STAGES.length,
      integrityContinuity:
        SOURCE_MATERIAL_INTEGRITY_CONTINUITY_CHAIN_STAGES.length,
      privacy: SOURCE_MATERIAL_PRIVACY_CHAIN_HANDOFF_ITEM_IDS.length,
      publishContinuity:
        ASSIGNMENT_PUBLISH_SOURCE_CONTINUITY_CHAIN_STAGES.length,
      uploadTransaction:
        PRIVATE_UPLOAD_TRANSACTION_CONTINUITY_CHAIN_STAGES.length,
      writeContinuity:
        ACTIVITY_SOURCE_MATERIAL_WRITE_CONTINUITY_CHAIN_STAGES.length,
    },
    title: 'Source material lifecycle continuity chain',
  };
}

function stage(
  id: string,
  layer: 'delete' | 'privacy' | 'publish' | 'reference' | 'upload' | 'write'
) {
  return { id, layer };
}
