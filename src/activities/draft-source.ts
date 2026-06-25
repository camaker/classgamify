import type { CreateActivityInput } from '@/activities/validation';
import { normalizeActivityMaterialReferences } from '@/activities/material-references';
import type { ActivityMaterialReference } from '@/activities/types';
import { m } from '@/locale/paraglide/messages';
import { formatUserFileMaterialKind } from '@/storage/file-material-labels';

export const DEFAULT_ACTIVITY_DRAFT_SOURCE =
  'apple, bread, milk, rice, water, egg';
export const ACTIVITY_DRAFT_SOURCE_MAX_LENGTH = 2000;

export type ActivitySourceMaterialDraftNoteView = {
  kindLabel: string;
  name: string;
};

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

export function buildActivitySourceMaterialDraftNoteViews(
  value: unknown
): ActivitySourceMaterialDraftNoteView[] {
  return normalizeActivityMaterialReferences(value).map(
    toActivitySourceMaterialDraftNoteView
  );
}

export function buildActivitySourceMaterialDraftNotes(value: unknown) {
  const safeNotes = buildActivitySourceMaterialDraftNoteViews(value);

  if (safeNotes.length === 0) return undefined;

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

export function appendActivitySourceMaterialDraftNotes({
  sourceMaterials,
  sourceText,
}: {
  sourceMaterials: unknown;
  sourceText: string;
}) {
  const sourceMaterialNotes =
    buildActivitySourceMaterialDraftNotes(sourceMaterials);
  const cleanSourceText = removeActivitySourceMaterialDraftNotes(sourceText);

  if (!sourceMaterialNotes) return cleanSourceText;

  return buildActivityDraftSourceText([cleanSourceText, sourceMaterialNotes]);
}

export function hasActivitySourceMaterialDraftNotes(sourceText: string) {
  return getActivityDraftSourceTextParagraphs(sourceText).some(
    isActivitySourceMaterialDraftNotesParagraph
  );
}

function toActivitySourceMaterialDraftNoteView(
  material: ActivityMaterialReference
): ActivitySourceMaterialDraftNoteView {
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

function removeActivitySourceMaterialDraftNotes(sourceText: string) {
  return getActivityDraftSourceTextParagraphs(sourceText)
    .filter((part) => !isActivitySourceMaterialDraftNotesParagraph(part))
    .join('\n\n');
}

function getActivityDraftSourceTextParagraphs(sourceText: string) {
  return sourceText
    .split(/\r?\n\s*\r?\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function isActivitySourceMaterialDraftNotesParagraph(paragraph: string) {
  const heading = m.activity_draft_source_materials_heading().trim();

  return paragraph.split(/\r?\n/)[0]?.trim() === heading;
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
