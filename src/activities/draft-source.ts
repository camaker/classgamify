import type { CreateActivityInput } from '@/activities/validation';
import {
  normalizeActivityMaterialReferenceFilename,
  normalizeActivityMaterialReferences,
} from '@/activities/material-references';
import {
  normalizeRuntimeDisplaySearchKey,
  normalizeRuntimeDisplayText,
} from '@/activities/runtime-display';
import type { ActivityMaterialReference } from '@/activities/types';
import { m } from '@/locale/paraglide/messages';
import { formatUserFileMaterialKind } from '@/storage/file-material-labels';
import {
  USER_FILE_MATERIAL_KINDS,
  type UserFileMaterialKind,
} from '@/storage/file-materials';

export const ACTIVITY_DRAFT_SOURCE_MAX_LENGTH = 2000;

export type ActivitySourceMaterialDraftNoteView = {
  kindLabel: string;
  name: string;
};

export type ActivitySourceMaterialDraftKindCounts = Partial<
  Record<ActivityMaterialReference['kind'], number>
>;

export type ActivitySourceMaterialDraftSafetySummary = {
  inputCount: number;
  omittedCount: number;
  safeCount: number;
};

export type ActivitySourceMaterialDraftNoteSafetySummary =
  ActivitySourceMaterialDraftSafetySummary & {
    safeNoteViews: ActivitySourceMaterialDraftNoteView[];
  };

type ActivitySourceMaterialDraftNoteSource = Pick<
  ActivityMaterialReference,
  'kind' | 'originalName'
>;

export type ActivitySourceMaterialDraftSummary = {
  hasMaterials: boolean;
  kindCounts: ActivitySourceMaterialDraftKindCounts;
  noteViews: ActivitySourceMaterialDraftNoteView[];
  notesText?: string;
  safety: ActivitySourceMaterialDraftSafetySummary;
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

  return sourceText || getDefaultActivityDraftSource();
}

export function getDefaultActivityDraftSource() {
  return m.activity_draft_default_source();
}

export function isDefaultActivityDraftSourceText(value: string | undefined) {
  const normalizedValue = normalizeActivityDraftSourceText(value);
  if (!normalizedValue) return false;

  return getDefaultActivityDraftSourceTexts().some(
    (sourceText) =>
      normalizedValue === normalizeActivityDraftSourceText(sourceText)
  );
}

function getDefaultActivityDraftSourceTexts() {
  return [
    m.activity_draft_default_source(),
    m.activity_draft_default_source({}, { locale: 'en' }),
    m.activity_draft_default_source({}, { locale: 'zh' }),
  ];
}

export function buildActivitySourceMaterialDraftSummary(
  value: unknown
): ActivitySourceMaterialDraftSummary {
  const materials = normalizeActivityMaterialReferences(value);
  const noteViews = materials.map(buildActivitySourceMaterialDraftNoteView);
  const safety = toActivitySourceMaterialDraftSafetySummary(
    buildActivitySourceMaterialDraftNoteSafetySummary(noteViews)
  );
  const notesText = formatActivitySourceMaterialDraftNotes(noteViews);

  return {
    hasMaterials: noteViews.length > 0,
    kindCounts: countActivitySourceMaterialDraftKinds(materials),
    noteViews,
    notesText,
    safety,
    totalCount: noteViews.length,
  };
}

export function buildActivitySourceMaterialDraftNoteViews(
  value: unknown
): ActivitySourceMaterialDraftNoteView[] {
  return buildActivitySourceMaterialDraftSummary(value).noteViews;
}

export function buildActivitySourceMaterialDraftNoteViewsFromSourceText(
  sourceText: string
): ActivitySourceMaterialDraftNoteView[] {
  return uniqueActivitySourceMaterialDraftNoteViews(
    getActivityDraftSourceTextParagraphs(sourceText).flatMap(
      parseActivitySourceMaterialDraftNotesParagraph
    )
  );
}

export function buildActivitySourceMaterialDraftNotes(value: unknown) {
  return buildActivitySourceMaterialDraftSummary(value).notesText;
}

export function buildActivitySourceMaterialDraftNoteSafetySummary(
  noteViews: ActivitySourceMaterialDraftNoteView[] | undefined
): ActivitySourceMaterialDraftNoteSafetySummary {
  const inputCount = normalizeActivitySourceMaterialDraftCount(
    noteViews?.length ?? 0
  );
  const safeNoteViews = uniqueActivitySourceMaterialDraftNoteViews(
    noteViews ?? []
  );
  const safeCount = normalizeActivitySourceMaterialDraftCount(
    safeNoteViews.length
  );

  return {
    inputCount,
    omittedCount: Math.max(0, inputCount - safeCount),
    safeCount,
    safeNoteViews,
  };
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

export function sanitizeActivityDraftSourceTextForAi(sourceText: string) {
  const cleanSourceText = removeActivitySourceMaterialDraftNotes(sourceText);
  const safeNoteViews =
    buildActivitySourceMaterialDraftNoteViewsFromSourceText(sourceText);
  const safeNotesText = formatActivitySourceMaterialDraftNotes(safeNoteViews);

  if (!safeNotesText) return cleanSourceText;

  return buildActivityDraftSourceText([cleanSourceText, safeNotesText]);
}

export function normalizeActivityDraftSourceText(value: string | undefined) {
  return normalizeDraftSourceText(value);
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
  return normalizeActivitySourceMaterialDraftNoteView({
    kindLabel: formatUserFileMaterialKind(material.kind),
    name: material.originalName,
  });
}

export function isSafeActivitySourceMaterialDraftKind(kindLabel: string) {
  return Boolean(getSafeActivitySourceMaterialDraftKind(kindLabel));
}

export function normalizeActivitySourceMaterialDraftNoteView(
  noteView: ActivitySourceMaterialDraftNoteView
): ActivitySourceMaterialDraftNoteView {
  const kindLabel = normalizeRuntimeDisplayText(noteView.kindLabel);
  const name = normalizeActivityMaterialReferenceFilename(noteView.name) ?? '';

  return {
    kindLabel,
    name,
  };
}

export function getActivitySourceMaterialDraftNoteIdentityKey(
  noteView: ActivitySourceMaterialDraftNoteView
) {
  const normalizedNoteView =
    normalizeActivitySourceMaterialDraftNoteView(noteView);
  const kindKey = getActivitySourceMaterialDraftKindIdentityKey(
    normalizedNoteView.kindLabel
  );
  const nameKey = normalizeRuntimeDisplaySearchKey(normalizedNoteView.name);

  return kindKey && nameKey ? `${kindKey}\u0000${nameKey}` : undefined;
}

export function isSafeActivitySourceMaterialDraftNoteView(
  noteView: ActivitySourceMaterialDraftNoteView
) {
  const normalizedNoteView =
    normalizeActivitySourceMaterialDraftNoteView(noteView);

  return (
    Boolean(normalizedNoteView.kindLabel) &&
    Boolean(normalizedNoteView.name) &&
    isSafeActivitySourceMaterialDraftKind(normalizedNoteView.kindLabel)
  );
}

function countActivitySourceMaterialDraftKinds(
  materials: ActivityMaterialReference[]
): ActivitySourceMaterialDraftKindCounts {
  const counts: ActivitySourceMaterialDraftKindCounts = {};

  for (const material of materials) {
    counts[material.kind] = (counts[material.kind] ?? 0) + 1;
  }

  return counts;
}

function toActivitySourceMaterialDraftSafetySummary(
  summary: ActivitySourceMaterialDraftNoteSafetySummary
): ActivitySourceMaterialDraftSafetySummary {
  return {
    inputCount: summary.inputCount,
    omittedCount: summary.omittedCount,
    safeCount: summary.safeCount,
  };
}

function getSafeActivitySourceMaterialDraftKind(
  kindLabel: string
): UserFileMaterialKind | undefined {
  const kindKey = normalizeRuntimeDisplaySearchKey(kindLabel);
  if (!kindKey) return undefined;

  return USER_FILE_MATERIAL_KINDS.find((kind) =>
    getActivitySourceMaterialDraftKindLabelKeys(kind).includes(kindKey)
  );
}

function getActivitySourceMaterialDraftKindIdentityKey(kindLabel: string) {
  return (
    getSafeActivitySourceMaterialDraftKind(kindLabel) ??
    normalizeRuntimeDisplaySearchKey(kindLabel)
  );
}

function getActivitySourceMaterialDraftKindLabelKeys(
  kind: UserFileMaterialKind
) {
  return [
    formatUserFileMaterialKind(kind),
    formatUserFileMaterialKind(kind, { locale: 'en' }),
    formatUserFileMaterialKind(kind, { locale: 'zh' }),
  ].map(normalizeRuntimeDisplaySearchKey);
}

function formatActivitySourceMaterialDraftNotes(
  safeNotes: ActivitySourceMaterialDraftNoteView[]
) {
  const uniqueNotes = uniqueActivitySourceMaterialDraftNoteViews(safeNotes);
  if (uniqueNotes.length === 0) return undefined;

  return [
    m.activity_draft_source_materials_heading(),
    ...uniqueNotes.map((note) =>
      m.activity_draft_source_materials_item({
        kind: note.kindLabel,
        name: note.name,
      })
    ),
  ].join('\n');
}

function uniqueActivitySourceMaterialDraftNoteViews(
  noteViews: ActivitySourceMaterialDraftNoteView[]
) {
  const seen = new Set<string>();
  const result: ActivitySourceMaterialDraftNoteView[] = [];

  for (const noteView of noteViews) {
    const normalizedNoteView =
      normalizeActivitySourceMaterialDraftNoteView(noteView);
    const key =
      getActivitySourceMaterialDraftNoteIdentityKey(normalizedNoteView);

    if (
      !key ||
      !isSafeActivitySourceMaterialDraftNoteView(normalizedNoteView) ||
      seen.has(key)
    ) {
      continue;
    }

    seen.add(key);
    result.push(normalizedNoteView);
  }

  return result;
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
  const headings = [
    m.activity_draft_source_materials_heading(),
    m.activity_draft_source_materials_heading({}, { locale: 'en' }),
    m.activity_draft_source_materials_heading({}, { locale: 'zh' }),
  ].map(normalizeRuntimeDisplayText);
  const paragraphHeading = normalizeRuntimeDisplayText(
    paragraph.split(/\r?\n/)[0]
  );

  return headings.includes(paragraphHeading);
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

function parseActivitySourceMaterialDraftNoteLine(
  line: string
): ActivitySourceMaterialDraftNoteView | null {
  const match = line.match(
    /^-\s*(?<kindLabel>[^:：]+)\s*[:：]\s*(?<name>.+)$/u
  );
  const noteView = normalizeActivitySourceMaterialDraftNoteView({
    kindLabel: match?.groups?.kindLabel ?? '',
    name: match?.groups?.name ?? '',
  });

  if (!isSafeActivitySourceMaterialDraftNoteView(noteView)) {
    return null;
  }

  return noteView;
}

function parseActivitySourceMaterialDraftNotesParagraph(paragraph: string) {
  if (!hasActivitySourceMaterialDraftNotesParagraph(paragraph)) return [];

  const lines = paragraph.split(/\r?\n/);
  const noteStartIndex = lines.findIndex((line) =>
    isActivitySourceMaterialDraftNotesParagraph(line)
  );

  if (noteStartIndex === -1) return [];

  return lines
    .slice(noteStartIndex + 1)
    .map(parseActivitySourceMaterialDraftNoteLine)
    .filter((noteView) => noteView !== null);
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
  return normalizeRuntimeDisplaySearchKey(normalizeDraftSourceText(value));
}

function normalizeDraftSourceText(value: string | undefined) {
  return (
    value
      ?.normalize('NFKC')
      .replace(/[ \t]+/gu, ' ')
      .trim() ?? ''
  );
}

function normalizeActivitySourceMaterialDraftCount(count: number) {
  if (!Number.isFinite(count)) return 0;
  return Math.max(0, Math.floor(count));
}
