import {
  buildActivityMaterialReferenceFromUserFile,
  getActivityMaterialReferenceKey,
  normalizeActivityMaterialReferences,
} from '@/activities/material-references';
import type { ActivityMaterialReference } from '@/activities/types';

export const ACTIVITY_SOURCE_MATERIAL_WRITE_STAGES = [
  stage('authenticated-teacher', 'server'),
  stage('validated-activity-input', 'server'),
  stage('normalized-reference-request', 'server'),
  stage('empty-reference-bypass', 'server'),
  stage('owner-scoped-batch-read', 'server'),
  stage('minimal-metadata-select', 'server'),
  stage('complete-match-enforcement', 'server'),
  stage('canonical-reference-input', 'server'),
  stage('create-persistence-boundary', 'server'),
  stage('update-lifecycle-boundary', 'server'),
  stage('user-file-id-predicate', 'database'),
  stage('user-file-owner-predicate', 'database'),
  stage('requested-id-in-predicate', 'database'),
  stage('single-batch-query', 'database'),
  stage('id-metadata-column', 'database'),
  stage('filename-metadata-column', 'database'),
  stage('content-metadata-columns', 'database'),
  stage('storage-columns-omitted', 'database'),
  stage('safe-reference-normalization', 'domain'),
  stage('duplicate-id-collapse', 'domain'),
  stage('reference-count-limit', 'domain'),
  stage('requested-order-preservation', 'domain'),
  stage('owned-row-indexing', 'domain'),
  stage('missing-reference-detection', 'domain'),
  stage('authoritative-metadata-rebuild', 'domain'),
  stage('all-or-nothing-resolution', 'domain'),
  stage('other-owner-row-hidden', 'privacy'),
  stage('r2-key-hidden', 'privacy'),
  stage('permission-metadata-hidden', 'privacy'),
  stage('file-bytes-unread', 'privacy'),
] as const;

export type ActivitySourceMaterialOwnedFile = {
  contentType?: string | null;
  filename?: string | null;
  id: string;
  originalName?: string | null;
  size?: number | null;
};

export type ActivitySourceMaterialWriteResolution =
  | {
      references: ActivityMaterialReference[];
      requestedCount: number;
      type: 'ready';
    }
  | {
      missingCount: number;
      requestedCount: number;
      type: 'blocked';
    };

export function getActivitySourceMaterialWriteFileIds(value: unknown) {
  return normalizeActivityMaterialReferences(value).map(
    (material) => material.fileId
  );
}

export function resolveActivitySourceMaterialWrite({
  ownedFiles,
  value,
}: {
  ownedFiles: ActivitySourceMaterialOwnedFile[];
  value: unknown;
}): ActivitySourceMaterialWriteResolution {
  const requested = normalizeActivityMaterialReferences(value);
  const ownedById = new Map(
    ownedFiles.flatMap((file) => {
      const key = getActivityMaterialReferenceKey(file.id);
      return key ? [[key, file] as const] : [];
    })
  );
  const references: ActivityMaterialReference[] = [];
  let missingCount = 0;

  for (const requestedReference of requested) {
    const key = getActivityMaterialReferenceKey(requestedReference.fileId);
    const ownedFile = key ? ownedById.get(key) : undefined;
    const reference = ownedFile
      ? buildActivityMaterialReferenceFromUserFile(ownedFile)
      : null;
    if (!reference) {
      missingCount += 1;
      continue;
    }
    references.push(reference);
  }

  if (missingCount > 0 || references.length !== requested.length) {
    return {
      missingCount: Math.max(
        missingCount,
        requested.length - references.length
      ),
      requestedCount: requested.length,
      type: 'blocked',
    };
  }

  return {
    references,
    requestedCount: requested.length,
    type: 'ready',
  };
}

function stage(
  id: string,
  layer: 'database' | 'domain' | 'privacy' | 'server'
) {
  return { id, layer };
}
