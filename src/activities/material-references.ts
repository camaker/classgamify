import type { ActivityMaterialReference } from '@/activities/types';
import {
  isUserFileMaterialKind,
  normalizeUserFileContentType,
  resolveUserFileMaterialKind,
} from '@/storage/file-materials';

export const ACTIVITY_SOURCE_MATERIALS_MAX_COUNT = 12;
export const ACTIVITY_SOURCE_MATERIAL_REFERENCE_LIMITS = {
  fileIdMaxLength: 120,
  originalNameMaxLength: 200,
} as const;

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
  const fileId = normalizeReferenceText(
    file.id,
    ACTIVITY_SOURCE_MATERIAL_REFERENCE_LIMITS.fileIdMaxLength
  );
  const originalName = normalizeReferenceText(
    file.originalName ?? file.filename,
    ACTIVITY_SOURCE_MATERIAL_REFERENCE_LIMITS.originalNameMaxLength,
    { filename: true }
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
    const materialKey = normalizeReferenceKey(material?.fileId);
    if (!material || !materialKey || materials.has(materialKey)) continue;

    materials.set(materialKey, material);

    if (materials.size >= ACTIVITY_SOURCE_MATERIALS_MAX_COUNT) break;
  }

  return [...materials.values()];
}

function normalizeActivityMaterialReference(
  value: unknown
): ActivityMaterialReference | null {
  if (!isRecord(value)) return null;

  const fileId = normalizeReferenceText(
    value.fileId,
    ACTIVITY_SOURCE_MATERIAL_REFERENCE_LIMITS.fileIdMaxLength
  );
  const originalName = normalizeReferenceText(
    value.originalName,
    ACTIVITY_SOURCE_MATERIAL_REFERENCE_LIMITS.originalNameMaxLength,
    { filename: true }
  );

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

export function normalizeActivityMaterialReferenceFilename(value: unknown) {
  return normalizeReferenceText(
    value,
    ACTIVITY_SOURCE_MATERIAL_REFERENCE_LIMITS.originalNameMaxLength,
    { filename: true }
  );
}

function normalizeReferenceText(
  value: unknown,
  maxLength: number,
  options?: { filename?: boolean }
) {
  if (typeof value !== 'string') return undefined;

  const normalized = value.normalize('NFKC').replace(/\s+/gu, ' ').trim();
  const safeText = options?.filename
    ? getSafeReferenceFilename(normalized)
    : normalized;
  if (!safeText) return undefined;

  return safeText.slice(0, maxLength);
}

function getSafeReferenceFilename(value: string) {
  const withoutUrlSuffix = value.split(/[?#]/u)[0]?.trim() ?? '';
  const lastSegment =
    withoutUrlSuffix.split(/[\\/]/u).at(-1)?.trim() ?? withoutUrlSuffix;
  const normalized = lastSegment.replace(/[\r\n"<>]/gu, '').trim();
  if (!normalized) return undefined;

  return normalized;
}

function normalizeReferenceKey(value: string | undefined) {
  return value?.normalize('NFKC').replace(/\s+/gu, ' ').trim().toLowerCase();
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
