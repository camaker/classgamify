import {
  WORKSHEET_PAPER_SIZES,
  WorksheetPage,
  type WorksheetPaperSize,
} from '@/components/learn/worksheet-page';
import { websiteConfig } from '@/config/website';
import { seo } from '@/lib/seo';
import { createFileRoute } from '@tanstack/react-router';

const WORKSHEET_GRID_OPTIONS = [6, 9, 12] as const;
const WORKSHEET_TRACE_MODES = ['first', 'guided', 'blank'] as const;
const MAX_WORKSHEET_NOTE_LENGTH = 180;

type WorksheetGridCount = (typeof WORKSHEET_GRID_OPTIONS)[number];
type WorksheetTraceMode = (typeof WORKSHEET_TRACE_MODES)[number];

export const Route = createFileRoute('/worksheets')({
  validateSearch: (
    search
  ): {
    characters?: string[];
    details?: boolean;
    grid?: WorksheetGridCount;
    note?: string;
    paper?: WorksheetPaperSize;
    trace?: WorksheetTraceMode;
  } => ({
    characters: parseCharactersSearch(search.characters),
    details: parseDetailsSearch(search.details),
    grid: parseGridSearch(search.grid),
    note: parseNoteSearch(search.note),
    paper: parsePaperSearch(search.paper),
    trace: parseTraceSearch(search.trace),
  }),
  head: () =>
    seo('/worksheets', {
      title: `Chinese Character Worksheet Generator | ${websiteConfig.metadata?.name}`,
      description:
        'Create printable HSK1 Chinese character handwriting worksheets from the Lang Study starter set.',
    }),
  component: WorksheetRoutePage,
});

function WorksheetRoutePage() {
  const search = Route.useSearch();
  return (
    <WorksheetPage
      initialCharacters={search.characters}
      initialGridCount={search.grid}
      initialAssignmentNote={search.note}
      initialPaperSize={search.paper}
      initialShowCharacterDetails={search.details}
      initialTraceMode={search.trace}
    />
  );
}

function parseCharactersSearch(value: unknown) {
  if (Array.isArray(value)) {
    return normalizeCharacters(value);
  }

  if (typeof value !== 'string') return undefined;

  const trimmedValue = value.trim();
  if (!trimmedValue) return undefined;

  if (trimmedValue.startsWith('[')) {
    try {
      const parsedValue = JSON.parse(trimmedValue) as unknown;
      if (Array.isArray(parsedValue)) {
        return normalizeCharacters(parsedValue);
      }
    } catch {
      return undefined;
    }
  }

  return normalizeCharacters(trimmedValue.split(','));
}

function normalizeCharacters(values: unknown[]) {
  const characters = values
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
  return characters.length > 0 ? characters : undefined;
}

function parseGridSearch(value: unknown) {
  const normalizedValue = Array.isArray(value) ? value[0] : value;
  const parsedValue =
    typeof normalizedValue === 'number'
      ? normalizedValue
      : Number(normalizedValue);

  return WORKSHEET_GRID_OPTIONS.find((option) => option === parsedValue);
}

function parseTraceSearch(value: unknown) {
  const normalizedValue = Array.isArray(value) ? value[0] : value;

  if (typeof normalizedValue !== 'string') return undefined;

  return WORKSHEET_TRACE_MODES.find((mode) => mode === normalizedValue);
}

function parsePaperSearch(value: unknown) {
  const normalizedValue = Array.isArray(value) ? value[0] : value;

  if (typeof normalizedValue !== 'string') return undefined;

  return WORKSHEET_PAPER_SIZES.find((size) => size === normalizedValue);
}

function parseDetailsSearch(value: unknown) {
  const normalizedValue = Array.isArray(value) ? value[0] : value;

  if (typeof normalizedValue === 'boolean') return normalizedValue;
  if (typeof normalizedValue !== 'string') return undefined;

  const normalizedDetails = normalizedValue.trim().toLowerCase();

  if (
    ['0', 'false', 'hide', 'hidden', 'no', 'off'].includes(normalizedDetails)
  ) {
    return false;
  }

  if (['1', 'on', 'show', 'true', 'yes'].includes(normalizedDetails)) {
    return true;
  }

  return undefined;
}

function parseNoteSearch(value: unknown) {
  const normalizedValue = Array.isArray(value) ? value[0] : value;

  if (typeof normalizedValue !== 'string') return undefined;

  const note = normalizedValue.trim();
  if (!note) return undefined;

  return Array.from(note).slice(0, MAX_WORKSHEET_NOTE_LENGTH).join('');
}
