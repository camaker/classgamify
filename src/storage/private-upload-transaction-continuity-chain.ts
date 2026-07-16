import { R2_UPLOAD_PUT_RECOVERY_STAGES } from '@/storage/upload-put-recovery';
import { USER_FILE_UPLOAD_PERSISTENCE_STAGES } from '@/storage/upload-persistence';
import { USER_FILE_RESPONSE_BOUNDARY_STAGES } from '@/storage/user-file-response';

export const PRIVATE_UPLOAD_TRANSACTION_CONTINUITY_CHAIN_STAGES = [
  stage('validated-private-upload', 'put'),
  stage('server-generated-file-id', 'put'),
  stage('deterministic-private-object-key', 'put'),
  stage('file-id-evidence-marker', 'put'),
  stage('single-r2-put-attempt', 'put'),
  stage('same-key-head-probe', 'put'),
  stage('marker-size-content-type-match', 'put'),
  stage('committed-put-recovery', 'put'),
  stage('original-put-error-rethrow', 'put'),
  stage('no-blind-put-retry', 'put'),
  stage('owner-scoped-metadata-result', 'persistence'),
  stage('d1-metadata-insert', 'persistence'),
  stage('exact-metadata-commit-probe', 'persistence'),
  stage('committed-metadata-recovery', 'persistence'),
  stage('unknown-commit-preserves-object', 'persistence'),
  stage('confirmed-missing-compensation', 'persistence'),
  stage('first-object-delete', 'persistence'),
  stage('object-presence-probe', 'persistence'),
  stage('bounded-delete-retry', 'persistence'),
  stage('localized-cleanup-failure', 'persistence'),
  stage('safe-private-file-item', 'response'),
  stage('public-url-only-response', 'response'),
  stage('stable-file-id-access-path', 'response'),
  stage('server-side-object-key-resolution', 'response'),
  stage('owner-access-decision', 'response'),
  stage('source-reference-continuity', 'response'),
  stage('object-key-hidden', 'privacy'),
  stage('upload-marker-hidden', 'privacy'),
  stage('teacher-owner-hidden', 'privacy'),
  stage('student-payload-unchanged', 'privacy'),
] as const;

export const PRIVATE_UPLOAD_TRANSACTION_CONTINUITY_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'docs/storage.md',
  'src/storage/types.ts',
  'src/storage/constants.ts',
  'src/storage/utils.ts',
  'src/storage/upload-readiness.ts',
  'src/storage/upload-put-recovery.ts',
  'src/storage/upload-persistence.ts',
  'src/storage/provider/r2.ts',
  'src/storage/file-query.ts',
  'src/storage/user-file-response.ts',
  'src/api/user-files.ts',
  'src/routes/api/storage/file.ts',
  'src/db/app.schema.ts',
  'src/db/migrations/0014_source_material_integrity_guard.sql',
  'src/hooks/use-user-files.ts',
  'src/routes/settings/files.tsx',
  'src/components/settings/files/files-table.tsx',
  'src/activities/material-references.ts',
  'src/activities/persistence.ts',
  'src/activities/source-material-integrity.ts',
  'src/activities/source-material-write-continuity-chain.ts',
  'src/activities/source-material-delete-continuity-chain.ts',
  'src/activities/source-material-integrity-continuity-chain.ts',
  'src/assignments/snapshot.ts',
  'src/assignments/public.ts',
  'scripts/r2-upload-put-recovery-contract.test.ts',
  'scripts/user-file-upload-persistence-contract.test.ts',
  'scripts/user-file-response-boundary-contract.test.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export function buildPrivateUploadTransactionContinuityChainView() {
  return {
    description:
      'Thirty-stage private upload transaction continuity from one R2 put through exact evidence recovery, D1 metadata persistence, bounded compensation, safe teacher responses, and source-reference privacy.',
    itemViews: PRIVATE_UPLOAD_TRANSACTION_CONTINUITY_CHAIN_STAGES.map(
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
      exposesFileBytes: false as const,
      exposesObjectKeys: false as const,
      exposesStudentData: false as const,
      exposesTeacherOwnerIds: false as const,
      exposesUploadMarkers: false as const,
      sourceFileCount:
        PRIVATE_UPLOAD_TRANSACTION_CONTINUITY_CHAIN_SOURCE_FILES.length,
      usesBoundedCompensation: true as const,
      usesExactPutEvidence: true as const,
      usesSafeClientResponses: true as const,
    },
    sourceContracts: {
      persistence: USER_FILE_UPLOAD_PERSISTENCE_STAGES.length,
      putRecovery: R2_UPLOAD_PUT_RECOVERY_STAGES.length,
      responseBoundary: USER_FILE_RESPONSE_BOUNDARY_STAGES.length,
    },
    title: 'Private upload transaction continuity chain',
  };
}

function stage(
  id: string,
  layer: 'persistence' | 'privacy' | 'put' | 'response'
) {
  return { id, layer };
}
