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

const SENSITIVE_REFERENCE_FILENAME_KEYS = [
  'auth',
  'authorization',
  'credential',
  'key',
  'ownerid',
  'permission',
  'r2key',
  'secret',
  'signature',
  'signed',
  'storagekey',
  'token',
] as const;

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
    const materialKey = getActivityMaterialReferenceKey(material?.fileId);
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

export function getActivityMaterialReferenceKey(value: unknown) {
  return normalizeReferenceKey(value);
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
  const withDecodedPathSeparators =
    decodeReferenceFilenamePathSeparators(value);
  const withoutUrlSuffix =
    withDecodedPathSeparators.split(/[?#]/u)[0]?.trim() ?? '';
  const withoutSensitiveParts =
    removeSensitiveReferenceFilenameParts(withoutUrlSuffix);
  const lastSegment =
    withoutSensitiveParts.split(/[\\/]/u).at(-1)?.trim() ??
    withoutSensitiveParts;
  const normalized = lastSegment.replace(/[\r\n"<>]/gu, '').trim();
  if (!normalized) return undefined;

  return normalized;
}

function decodeReferenceFilenamePathSeparators(value: string) {
  return value.replace(/%(?:2f|5c)/giu, (match) =>
    match.toLowerCase() === '%2f' ? '/' : '\\'
  );
}

function removeSensitiveReferenceFilenameParts(value: string) {
  return value
    .split(/[\s,;&]+/u)
    .filter((part) => !isSensitiveReferenceFilenamePart(part))
    .join(' ')
    .replace(/\s+/gu, ' ')
    .trim();
}

function isSensitiveReferenceFilenamePart(value: string) {
  const [rawKey] = value.split(/[:=]/u);
  const key = rawKey?.replace(/[^a-z0-9]/giu, '').toLowerCase() ?? '';

  return Boolean(
    key &&
      value !== rawKey &&
      SENSITIVE_REFERENCE_FILENAME_KEYS.some((sensitiveKey) =>
        key.includes(sensitiveKey)
      )
  );
}

function normalizeReferenceKey(value: unknown) {
  if (typeof value !== 'string') return undefined;

  const normalized = value
    .normalize('NFKC')
    .replace(/\s+/gu, ' ')
    .trim()
    .toLowerCase();

  return normalized || undefined;
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
