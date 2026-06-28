import type { CreateActivityInput } from '@/activities/validation';
import { normalizeActivityMaterialReferences } from '@/activities/material-references';
import { normalizeRuntimeDisplayText } from '@/activities/runtime-display';
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

type ActivitySourceMaterialDraftNoteSource = Pick<
  ActivityMaterialReference,
  'kind' | 'originalName'
>;

export type ActivitySourceMaterialDraftSummary = {
  hasMaterials: boolean;
  kindCounts: Partial<Record<ActivityMaterialReference['kind'], number>>;
  noteViews: ActivitySourceMaterialDraftNoteView[];
  notesText?: string;
  totalCount: number;
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
  const sourceMaterialSummary = buildActivitySourceMaterialDraftSummary(
    values.sourceMaterials
  );
  const sourceText = buildActivityDraftSourceText([
    ...ACTIVITY_DRAFT_SOURCE_FIELDS.map((field) => values[field]),
    sourceMaterialSummary.notesText,
  ]);

  return sourceText || DEFAULT_ACTIVITY_DRAFT_SOURCE;
}

export function buildActivitySourceMaterialDraftSummary(
  value: unknown
): ActivitySourceMaterialDraftSummary {
  const materials = normalizeActivityMaterialReferences(value);
  const noteViews = materials.map(buildActivitySourceMaterialDraftNoteView);
  const notesText = formatActivitySourceMaterialDraftNotes(noteViews);

  return {
    hasMaterials: noteViews.length > 0,
    kindCounts: countActivitySourceMaterialDraftKinds(materials),
    noteViews,
    notesText,
    totalCount: noteViews.length,
  };
}

export function buildActivitySourceMaterialDraftNoteViews(
  value: unknown
): ActivitySourceMaterialDraftNoteView[] {
  return buildActivitySourceMaterialDraftSummary(value).noteViews;
}

export function buildActivitySourceMaterialDraftNotes(value: unknown) {
  return buildActivitySourceMaterialDraftSummary(value).notesText;
}

export function appendActivitySourceMaterialDraftNotes({
  sourceMaterials,
  sourceText,
}: {
  sourceMaterials: unknown;
  sourceText: string;
}) {
  const sourceMaterialSummary =
    buildActivitySourceMaterialDraftSummary(sourceMaterials);
  const cleanSourceText = removeActivitySourceMaterialDraftNotes(sourceText);

  if (!sourceMaterialSummary.notesText) return cleanSourceText;

  return buildActivityDraftSourceText([
    cleanSourceText,
    sourceMaterialSummary.notesText,
  ]);
}

export function hasActivitySourceMaterialDraftNotes(sourceText: string) {
  return getActivityDraftSourceTextParagraphs(sourceText).some(
    hasActivitySourceMaterialDraftNotesParagraph
  );
}

export function removeActivitySourceMaterialDraftNotes(sourceText: string) {
  return getActivityDraftSourceTextParagraphs(sourceText)
    .map(removeActivitySourceMaterialDraftNotesFromParagraph)
    .filter(Boolean)
    .join('\n\n');
}

export function buildActivitySourceMaterialDraftNoteView(
  material: ActivitySourceMaterialDraftNoteSource
): ActivitySourceMaterialDraftNoteView {
  return {
    kindLabel: formatUserFileMaterialKind(material.kind),
    name: normalizeDraftSourceText(material.originalName),
  };
}

function countActivitySourceMaterialDraftKinds(
  materials: ActivityMaterialReference[]
): ActivitySourceMaterialDraftSummary['kindCounts'] {
  const counts: ActivitySourceMaterialDraftSummary['kindCounts'] = {};

  for (const material of materials) {
    counts[material.kind] = (counts[material.kind] ?? 0) + 1;
  }

  return counts;
}

function formatActivitySourceMaterialDraftNotes(
  safeNotes: ActivitySourceMaterialDraftNoteView[]
) {
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

function buildActivityDraftSourceText(values: Array<string | undefined>) {
  const parts = unique(
    values.map((value) => normalizeDraftSourceText(value)).filter(Boolean)
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

function getActivityDraftSourceTextParagraphs(sourceText: string) {
  return sourceText
    .split(/\r?\n\s*\r?\n/)
    .map(normalizeDraftSourceText)
    .filter(Boolean);
}

function isActivitySourceMaterialDraftNotesParagraph(paragraph: string) {
  const heading = normalizeRuntimeDisplayText(
    m.activity_draft_source_materials_heading()
  );
  const paragraphHeading = normalizeRuntimeDisplayText(
    paragraph.split(/\r?\n/)[0]
  );

  return paragraphHeading === heading;
}

function hasActivitySourceMaterialDraftNotesParagraph(paragraph: string) {
  return paragraph
    .split(/\r?\n/)
    .some((line) => isActivitySourceMaterialDraftNotesParagraph(line));
}

function removeActivitySourceMaterialDraftNotesFromParagraph(
  paragraph: string
) {
  const lines = paragraph.split(/\r?\n/);
  const noteStartIndex = lines.findIndex((line) =>
    isActivitySourceMaterialDraftNotesParagraph(line)
  );

  if (noteStartIndex === -1) return paragraph;

  return normalizeDraftSourceText(lines.slice(0, noteStartIndex).join('\n'));
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
  return normalizeDraftSourceText(value).toLocaleLowerCase();
}

function normalizeDraftSourceText(value: string | undefined) {
  return (
    value
      ?.normalize('NFKC')
      .replace(/[ \t]+/gu, ' ')
      .trim() ?? ''
  );
}
