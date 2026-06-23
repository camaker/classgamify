export const USER_FILE_MATERIAL_KINDS = [
  'archive',
  'audio',
  'data',
  'file',
  'spreadsheet',
  'video',
  'worksheet-document',
  'worksheet-image',
] as const;

export type UserFileMaterialKind = (typeof USER_FILE_MATERIAL_KINDS)[number];

export function isUserFileMaterialKind(
  value: string | null | undefined
): value is UserFileMaterialKind {
  return USER_FILE_MATERIAL_KINDS.includes(value as UserFileMaterialKind);
}

interface UserFileMaterialInput {
  contentType?: string | null;
  filename?: string | null;
  originalName?: string | null;
}

const EXTENSION_KIND_MAP: Record<string, UserFileMaterialKind> = {
  csv: 'spreadsheet',
  doc: 'worksheet-document',
  docx: 'worksheet-document',
  gif: 'worksheet-image',
  gz: 'archive',
  jpeg: 'worksheet-image',
  jpg: 'worksheet-image',
  json: 'data',
  mp3: 'audio',
  mp4: 'video',
  pdf: 'worksheet-document',
  png: 'worksheet-image',
  txt: 'worksheet-document',
  wav: 'audio',
  webm: 'video',
  webp: 'worksheet-image',
  xls: 'spreadsheet',
  xlsx: 'spreadsheet',
  zip: 'archive',
};

export function getUserFileExtension(
  file: UserFileMaterialInput
): string | undefined {
  const name = file.originalName ?? file.filename;
  if (!name) return undefined;

  const lastSegment = name.split(/[\\/]/).at(-1) ?? name;
  const dotIndex = lastSegment.lastIndexOf('.');
  if (dotIndex < 0 || dotIndex === lastSegment.length - 1) {
    return undefined;
  }

  return lastSegment
    .slice(dotIndex + 1)
    .trim()
    .toLowerCase();
}

export function normalizeUserFileContentType(
  contentType: string | null | undefined
): string | undefined {
  const normalized = contentType?.trim().toLowerCase();
  return normalized === '' ? undefined : normalized;
}

export function resolveUserFileMaterialKind(
  file: UserFileMaterialInput
): UserFileMaterialKind {
  const contentType = normalizeUserFileContentType(file.contentType);

  if (contentType?.startsWith('audio/')) return 'audio';
  if (contentType?.startsWith('image/')) return 'worksheet-image';
  if (contentType?.startsWith('video/')) return 'video';

  switch (contentType) {
    case 'application/gzip':
    case 'application/zip':
      return 'archive';
    case 'application/json':
      return 'data';
    case 'application/msword':
    case 'application/pdf':
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    case 'text/plain':
      return 'worksheet-document';
    case 'application/vnd.ms-excel':
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    case 'text/csv':
      return 'spreadsheet';
  }

  const extension = getUserFileExtension(file);
  return extension ? (EXTENSION_KIND_MAP[extension] ?? 'file') : 'file';
}
