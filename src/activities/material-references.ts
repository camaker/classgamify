import type { ActivityMaterialReference } from '@/activities/types';
import {
  isUserFileMaterialKind,
  normalizeUserFileContentType,
  resolveUserFileMaterialKind,
} from '@/storage/file-materials';

export const ACTIVITY_SOURCE_MATERIALS_MAX_COUNT = 12;

type UserFileMaterialReferenceInput = {
  contentType?: string | null;
  filename?: string | null;
  id?: string | null;
  originalName?: string | null;
  size?: number | null;
};

type ActivityMaterialReferenceDraft = Omit<
  ActivityMaterialReference,
  'contentType' | 'size'
> & {
  contentType?: string | undefined;
  size?: number | undefined;
};

export function buildActivityMaterialReferenceFromUserFile(
  file: UserFileMaterialReferenceInput
): ActivityMaterialReference | null {
  const fileId = normalizeReferenceText(file.id, 120);
  const originalName = normalizeReferenceText(
    file.originalName ?? file.filename,
    200
  );

  if (!fileId || !originalName) return null;

  return compactActivityMaterialReference({
    contentType: normalizeUserFileContentType(file.contentType),
    fileId,
    kind: resolveUserFileMaterialKind(file),
    originalName,
    size: normalizeReferenceSize(file.size),
  });
}

export function normalizeActivityMaterialReferences(
  value: unknown
): ActivityMaterialReference[] {
  const values = Array.isArray(value) ? value : [];
  const materials = new Map<string, ActivityMaterialReference>();

  for (const item of values) {
    const material = normalizeActivityMaterialReference(item);
    if (!material || materials.has(material.fileId)) continue;

    materials.set(material.fileId, material);

    if (materials.size >= ACTIVITY_SOURCE_MATERIALS_MAX_COUNT) break;
  }

  return [...materials.values()];
}

function normalizeActivityMaterialReference(
  value: unknown
): ActivityMaterialReference | null {
  if (!isRecord(value)) return null;

  const fileId = normalizeReferenceText(value.fileId, 120);
  const originalName = normalizeReferenceText(value.originalName, 200);

  if (!fileId || !originalName) return null;

  const contentType = normalizeUserFileContentType(
    getStringOrNull(value.contentType)
  );
  const kind = getStringOrNull(value.kind);

  return compactActivityMaterialReference({
    contentType,
    fileId,
    kind: isUserFileMaterialKind(kind)
      ? kind
      : resolveUserFileMaterialKind({
          contentType,
          originalName,
        }),
    originalName,
    size: normalizeReferenceSize(value.size),
  });
}

function compactActivityMaterialReference(
  material: ActivityMaterialReferenceDraft
): ActivityMaterialReference {
  return {
    ...(material.contentType ? { contentType: material.contentType } : {}),
    fileId: material.fileId,
    kind: material.kind,
    originalName: material.originalName,
    ...(typeof material.size === 'number' ? { size: material.size } : {}),
  };
}

function normalizeReferenceText(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return undefined;

  const normalized = value.trim();
  if (!normalized) return undefined;

  return normalized.slice(0, maxLength);
}

function normalizeReferenceSize(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;

  return Math.max(0, Math.floor(value));
}

function getStringOrNull(value: unknown) {
  return typeof value === 'string' ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
