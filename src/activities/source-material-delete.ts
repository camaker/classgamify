import { activity, assignment, assignmentSnapshot } from '@/db/app.schema';
import { and, eq, sql } from 'drizzle-orm';

export const ACTIVITY_SOURCE_MATERIAL_DELETE_STAGES = [
  stage('authenticated-teacher', 'server'),
  stage('owner-scoped-file-read', 'server'),
  stage('file-not-found-boundary', 'server'),
  stage('parallel-reference-checks', 'server'),
  stage('activity-reference-result', 'server'),
  stage('snapshot-reference-result', 'server'),
  stage('in-use-delete-block', 'server'),
  stage('metadata-claim-after-check', 'server'),
  stage('storage-delete-after-claim', 'server'),
  stage('successful-delete-response', 'server'),
  stage('activity-owner-predicate', 'database'),
  stage('activity-content-json-each', 'database'),
  stage('activity-file-id-extract', 'database'),
  stage('assignment-owner-predicate', 'database'),
  stage('snapshot-assignment-join', 'database'),
  stage('snapshot-content-json-each', 'database'),
  stage('snapshot-file-id-extract', 'database'),
  stage('minimal-id-evidence', 'database'),
  stage('active-activity-reference', 'domain'),
  stage('archived-activity-reference', 'domain'),
  stage('frozen-snapshot-reference', 'domain'),
  stage('unreferenced-file-delete', 'domain'),
  stage('same-owner-reference-scope', 'domain'),
  stage('single-safe-in-use-message', 'domain'),
  stage('activity-content-retention', 'domain'),
  stage('snapshot-provenance-retention', 'domain'),
  stage('activity-content-hidden', 'privacy'),
  stage('assignment-content-hidden', 'privacy'),
  stage('student-data-unread', 'privacy'),
  stage('storage-key-server-only', 'privacy'),
] as const;

export function buildActivitySourceMaterialFileReferenceWhere({
  fileId,
  userId,
}: {
  fileId: string;
  userId: string;
}) {
  return and(
    eq(activity.ownerId, userId),
    sql`EXISTS (
      SELECT 1
      FROM json_each(${activity.contentJson}, '$.sourceMaterials') AS material
      WHERE json_extract(material.value, '$.fileId') = ${fileId}
    )`
  );
}

export function buildAssignmentSnapshotSourceMaterialFileReferenceWhere({
  fileId,
  userId,
}: {
  fileId: string;
  userId: string;
}) {
  return and(
    eq(assignment.ownerId, userId),
    sql`EXISTS (
      SELECT 1
      FROM json_each(${assignmentSnapshot.contentJson}, '$.sourceMaterials') AS material
      WHERE json_extract(material.value, '$.fileId') = ${fileId}
    )`
  );
}

function stage(
  id: string,
  layer: 'database' | 'domain' | 'privacy' | 'server'
) {
  return { id, layer };
}
