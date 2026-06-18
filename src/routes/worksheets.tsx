import {
  WORKSHEET_PAPER_SIZES,
  WorksheetPage,
  type WorksheetPaperSize,
} from '@/components/learn/worksheet-page';
import { websiteConfig } from '@/config/website';
import { parseCharactersSearch } from '@/lib/character-search';
import { getLocale, localeConfig } from '@/lib/locale';
import { seo } from '@/lib/seo';
import { jsonLdScript } from '@/lib/structured-data';
import { getCanonicalUrl } from '@/lib/urls';
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
    feedback?: boolean;
    grid?: WorksheetGridCount;
    note?: string;
    paper?: WorksheetPaperSize;
    trace?: WorksheetTraceMode;
  } => ({
    characters: parseCharactersSearch(search.characters),
    details: parseDetailsSearch(search.details),
    feedback: parseDetailsSearch(search.feedback),
    grid: parseGridSearch(search.grid),
    note: parseNoteSearch(search.note),
    paper: parsePaperSearch(search.paper),
    trace: parseTraceSearch(search.trace),
  }),
  head: () => {
    const currentLocale = getLocale() === 'zh' ? 'zh' : 'en';
    const title =
      currentLocale === 'zh'
        ? `中文汉字练习纸生成器 | ${websiteConfig.metadata?.name}`
        : `Chinese Character Worksheet Generator | ${websiteConfig.metadata?.name}`;
    const description =
      currentLocale === 'zh'
        ? '从 HSK1 入门汉字生成可打印中文书写练习纸，适合自学、家长辅导和课堂作业。'
        : 'Create printable HSK1 Chinese character handwriting worksheets from the Lang Study starter set.';
    const url = getCanonicalUrl('/worksheets');
    const applicationJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name:
        currentLocale === 'zh'
          ? '中文汉字练习纸生成器'
          : 'Chinese Character Worksheet Generator',
      description,
      url,
      inLanguage: localeConfig[getLocale()].hreflang,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web',
      provider: {
        '@type': 'Organization',
        name: websiteConfig.metadata?.name ?? '',
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
    };
    const metadata = seo('/worksheets', { title, description });

    return {
      ...metadata,
      scripts: [jsonLdScript(applicationJsonLd)],
    };
  },
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
      initialShowFeedbackSection={search.feedback}
      initialTraceMode={search.trace}
    />
  );
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
