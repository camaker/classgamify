export const R2_UPLOAD_FILE_ID_METADATA_KEY = 'classgamifyFileId';

export const R2_UPLOAD_PUT_RECOVERY_STAGES = [
  stage('validated-file-before-put', 'provider'),
  stage('random-file-id-allocation', 'provider'),
  stage('deterministic-object-plan', 'provider'),
  stage('file-id-custom-metadata', 'provider'),
  stage('single-put-attempt', 'provider'),
  stage('put-error-capture', 'provider'),
  stage('same-key-head-probe', 'provider'),
  stage('exact-evidence-recovery', 'provider'),
  stage('original-error-rethrow', 'provider'),
  stage('ordinary-result-construction', 'provider'),
  stage('head-object-present', 'evidence'),
  stage('file-id-marker-match', 'evidence'),
  stage('byte-size-match', 'evidence'),
  stage('content-type-match', 'evidence'),
  stage('content-type-canonicalization', 'evidence'),
  stage('all-evidence-committed', 'evidence'),
  stage('missing-object-result', 'evidence'),
  stage('mismatched-object-result', 'evidence'),
  stage('probe-failure-result', 'evidence'),
  stage('no-second-put', 'evidence'),
  stage('ambiguous-put-response', 'domain'),
  stage('committed-write-continuity', 'domain'),
  stage('missing-write-failure', 'domain'),
  stage('collision-safe-mismatch', 'domain'),
  stage('unknown-write-failure', 'domain'),
  stage('metadata-persistence-continuity', 'domain'),
  stage('object-key-hidden', 'privacy'),
  stage('file-id-marker-hidden', 'privacy'),
  stage('file-bytes-unread', 'privacy'),
  stage('provider-error-details-hidden', 'privacy'),
] as const;

export type R2UploadPutRecoveryResult =
  | 'committed'
  | 'mismatched'
  | 'missing'
  | 'unconfirmed';

export type R2UploadObjectEvidence = {
  customMetadata?: Record<string, string>;
  httpMetadata?: { contentType?: string };
  size?: number;
};

export async function recoverR2UploadPutAfterFailure({
  contentType,
  fileId,
  probeObject,
  size,
}: {
  contentType: string;
  fileId: string;
  probeObject: () => Promise<R2UploadObjectEvidence | null>;
  size: number;
}): Promise<R2UploadPutRecoveryResult> {
  let object: R2UploadObjectEvidence | null;
  try {
    object = await probeObject();
  } catch {
    return 'unconfirmed';
  }
  if (!object) return 'missing';

  return object.customMetadata?.[R2_UPLOAD_FILE_ID_METADATA_KEY] === fileId &&
    object.size === size &&
    normalizeEvidenceContentType(object.httpMetadata?.contentType) ===
      normalizeEvidenceContentType(contentType)
    ? 'committed'
    : 'mismatched';
}

function normalizeEvidenceContentType(value: string | undefined) {
  return value?.trim().toLowerCase() ?? '';
}

function stage(
  id: string,
  layer: 'domain' | 'evidence' | 'privacy' | 'provider'
) {
  return { id, layer };
}
