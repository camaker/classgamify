import type { CreateActivityInput } from '@/activities/validation';
import { normalizeActivityMaterialReferences } from '@/activities/material-references';
import type { ActivityMaterialReference } from '@/activities/types';
import { m } from '@/locale/paraglide/messages';
import { formatUserFileMaterialKind } from '@/storage/file-material-labels';

export const DEFAULT_ACTIVITY_DRAFT_SOURCE =
  'apple, bread, milk, rice, water, egg';
export const ACTIVITY_DRAFT_SOURCE_MAX_LENGTH = 2000;

const ACTIVITY_DRAFT_SOURCE_FIELDS = [
  'sourceSummary',
  'vocabularyText',
  'questionsText',
  'pairsText',
  'groupsText',
  'teacherNotesText',
] as const satisfies ReadonlyArray<keyof CreateActivityInput>;

export function getActivityDraftSourceText(values: CreateActivityInput) {
  const sourceText = buildActivityDraftSourceText([
    ...ACTIVITY_DRAFT_SOURCE_FIELDS.map((field) => values[field]),
    buildActivitySourceMaterialDraftNotes(values.sourceMaterials),
  ]);

  return sourceText || DEFAULT_ACTIVITY_DRAFT_SOURCE;
}

export function buildActivitySourceMaterialDraftNotes(value: unknown) {
  const materials = normalizeActivityMaterialReferences(value);
  if (materials.length === 0) return undefined;

  const safeNotes = materials.map(toActivitySourceMaterialDraftNote);

  return [
    m.activity_draft_source_materials_heading(),
    ...safeNotes.map((note) =>
      m.activity_draft_source_materials_item({
        kind: note.kindLabel,
        name: note.name,
      })
    ),
  ].join('\n');
}

function toActivitySourceMaterialDraftNote(
  material: ActivityMaterialReference
) {
  return {
    kindLabel: formatUserFileMaterialKind(material.kind),
    name: material.originalName,
  };
}

function buildActivityDraftSourceText(values: Array<string | undefined>) {
  const parts = unique(
    values.map((value) => value?.trim() ?? '').filter(Boolean)
  );

  return limitActivityDraftSourceText(parts);
}

function limitActivityDraftSourceText(parts: string[]) {
  let sourceText = '';

  for (const part of parts) {
    const separator = sourceText ? '\n\n' : '';
    const next = `${sourceText}${separator}${part}`;

    if (next.length <= ACTIVITY_DRAFT_SOURCE_MAX_LENGTH) {
      sourceText = next;
      continue;
    }

    const remainingLength =
      ACTIVITY_DRAFT_SOURCE_MAX_LENGTH - sourceText.length - separator.length;
    if (remainingLength <= 3) break;

    sourceText = `${sourceText}${separator}${part
      .slice(0, remainingLength - 3)
      .trimEnd()}...`;
    break;
  }

  return sourceText;
}

function unique(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const key = normalizeDraftSourceTextKey(value);
    if (seen.has(key)) continue;

    seen.add(key);
    result.push(value);
  }

  return result;
}

function normalizeDraftSourceTextKey(value: string) {
  return value
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase();
}
