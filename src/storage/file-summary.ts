import {
  USER_FILE_MATERIAL_KINDS,
  resolveUserFileMaterialKind,
  type UserFileMaterialKind,
} from '@/storage/file-materials';

interface UserFileSummaryInput {
  contentType?: string | null;
  filename?: string | null;
  isPublic?: boolean | null;
  originalName?: string | null;
  size?: number | null;
}

export interface UserFileMaterialSummary {
  audioFiles: number;
  byKind: Record<UserFileMaterialKind, number>;
  privateFiles: number;
  publicFiles: number;
  totalBytes: number;
  totalFiles: number;
  worksheetFiles: number;
}

function createEmptyUserFileMaterialSummary(): UserFileMaterialSummary {
  return {
    audioFiles: 0,
    byKind: Object.fromEntries(
      USER_FILE_MATERIAL_KINDS.map((kind) => [kind, 0])
    ) as Record<UserFileMaterialKind, number>,
    privateFiles: 0,
    publicFiles: 0,
    totalBytes: 0,
    totalFiles: 0,
    worksheetFiles: 0,
  };
}

export function buildUserFileMaterialSummary(
  files: UserFileSummaryInput[]
): UserFileMaterialSummary {
  const summary = createEmptyUserFileMaterialSummary();

  for (const file of files) {
    const kind = resolveUserFileMaterialKind(file);

    summary.totalFiles += 1;
    summary.totalBytes += normalizeUserFileSummaryBytes(file.size);
    summary.byKind[kind] += 1;

    if (file.isPublic) {
      summary.publicFiles += 1;
    } else {
      summary.privateFiles += 1;
    }

    if (kind === 'audio') {
      summary.audioFiles += 1;
    }

    if (kind === 'worksheet-document' || kind === 'worksheet-image') {
      summary.worksheetFiles += 1;
    }
  }

  return summary;
}

function normalizeUserFileSummaryBytes(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.floor(value));
}
