import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { getFreeCharacters } from '@/learn/hanzi-course';
import { getLocale } from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import {
  IconArrowLeft,
  IconArrowRight,
  IconCircleCheck,
  IconClipboardText,
  IconCopy,
  IconEraser,
  IconMailForward,
  IconLock,
  IconPrinter,
  IconRefresh,
  IconSparkles,
  IconX,
  IconWorldWww,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const GRID_OPTIONS = [6, 9, 12] as const;
const TRACE_MODES = ['first', 'guided', 'blank'] as const;
export const WORKSHEET_PAPER_SIZES = ['a4', 'letter', 'legal', 'a5'] as const;
const DEFAULT_GRID_COUNT: WorksheetGridCount = 9;
const DEFAULT_PAPER_SIZE: WorksheetPaperSize = 'a4';
const DEFAULT_TRACE_MODE: TraceMode = 'first';
const DEFAULT_SHOW_CHARACTER_DETAILS = true;
const DEFAULT_SHOW_FEEDBACK_SECTION = true;
const MAX_ASSIGNMENT_NOTE_LENGTH = 180;
const MAX_WORKSHEET_CHARACTERS = 12;
const MAX_RECENT_WORKSHEET_SETS = 4;
const RECENT_WORKSHEET_SET_STORAGE_KEY = 'lang-study:recent-worksheet-sets:v1';
const WORKSHEET_PRINT_MODE = 'worksheet';
const WORKSHEET_PRINT_STYLE_ID = 'worksheet-print-style';
const WORKSHEET_DOMAIN = 'getlangstudy.com';
const WORKSHEET_URL = 'getlangstudy.com/worksheets';
const HANZI_CHARACTER_PATTERN = /\p{Script=Han}/gu;
const STARTER_SET_SIZE = 6;

type WorksheetCharacter = ReturnType<typeof getFreeCharacters>[number] & {
  custom?: boolean;
};

export type WorksheetPaperSize = (typeof WORKSHEET_PAPER_SIZES)[number];
type TraceMode = (typeof TRACE_MODES)[number];
type WorksheetGridCount = (typeof GRID_OPTIONS)[number];

type WorksheetQuickSet = {
  characters: string[];
  description: string;
  id: string;
  title: string;
};

type WorksheetRecentSet = {
  assignmentNote: string;
  characters: string[];
  gridCount: WorksheetGridCount;
  id: string;
  paperSize: WorksheetPaperSize;
  showCharacterDetails: boolean;
  showFeedbackSection: boolean;
  traceMode: TraceMode;
  updatedAt: string;
};

type WorksheetShareConfig = Pick<
  WorksheetRecentSet,
  | 'assignmentNote'
  | 'characters'
  | 'gridCount'
  | 'paperSize'
  | 'showCharacterDetails'
  | 'showFeedbackSection'
  | 'traceMode'
>;

type WorksheetPaperPrintConfig = {
  assignmentGap: string;
  assignmentPadding: string;
  characterMarginTop: string;
  feedbackMarginTop: string;
  feedbackPadding: string;
  footerGap: string;
  footerMarginTop: string;
  gridGap: string;
  gridMax: string;
  gridMin: string;
  margin: string;
  pageSize: string;
  headerGap: string;
};

const WORKSHEET_PAPER_PRINT_CONFIG: Record<
  WorksheetPaperSize,
  WorksheetPaperPrintConfig
> = {
  a4: {
    assignmentGap: '8pt',
    assignmentPadding: '8pt',
    characterMarginTop: '14pt',
    feedbackMarginTop: '14pt',
    feedbackPadding: '8pt',
    footerGap: '8pt',
    footerMarginTop: '14pt',
    gridGap: '5pt',
    gridMax: '28mm',
    gridMin: '22mm',
    headerGap: '12pt',
    margin: '10mm',
    pageSize: 'A4',
  },
  a5: {
    assignmentGap: '6pt',
    assignmentPadding: '7pt',
    characterMarginTop: '10pt',
    feedbackMarginTop: '10pt',
    feedbackPadding: '7pt',
    footerGap: '6pt',
    footerMarginTop: '10pt',
    gridGap: '4pt',
    gridMax: '21mm',
    gridMin: '17mm',
    headerGap: '8pt',
    margin: '6mm',
    pageSize: 'A5',
  },
  legal: {
    assignmentGap: '8pt',
    assignmentPadding: '8pt',
    characterMarginTop: '14pt',
    feedbackMarginTop: '14pt',
    feedbackPadding: '8pt',
    footerGap: '8pt',
    footerMarginTop: '14pt',
    gridGap: '5pt',
    gridMax: '28mm',
    gridMin: '22mm',
    headerGap: '12pt',
    margin: '10mm',
    pageSize: 'Legal',
  },
  letter: {
    assignmentGap: '8pt',
    assignmentPadding: '8pt',
    characterMarginTop: '14pt',
    feedbackMarginTop: '14pt',
    feedbackPadding: '8pt',
    footerGap: '8pt',
    footerMarginTop: '14pt',
    gridGap: '5pt',
    gridMax: '28mm',
    gridMin: '22mm',
    headerGap: '12pt',
    margin: '10mm',
    pageSize: 'Letter',
  },
};

function enableWorksheetPrintMode() {
  document.body.dataset.printMode = WORKSHEET_PRINT_MODE;
}

function clearWorksheetPrintMode() {
  if (document.body.dataset.printMode === WORKSHEET_PRINT_MODE) {
    delete document.body.dataset.printMode;
  }

  clearWorksheetPrintPaper();
  clearWorksheetPrintStyles();
}

function syncWorksheetPrintPaper(paperSize: WorksheetPaperSize) {
  document.body.dataset.printPaper = paperSize;
}

function clearWorksheetPrintPaper() {
  if (document.body.dataset.printPaper) {
    delete document.body.dataset.printPaper;
  }
}

function syncWorksheetPrintStyles(paperSize: WorksheetPaperSize) {
  const currentConfig = WORKSHEET_PAPER_PRINT_CONFIG[paperSize];
  let style = document.getElementById(
    WORKSHEET_PRINT_STYLE_ID
  ) as HTMLStyleElement | null;

  if (!style) {
    style = document.createElement('style');
    style.id = WORKSHEET_PRINT_STYLE_ID;
    document.head.append(style);
  }

  style.textContent = buildWorksheetPrintStyleText(paperSize, currentConfig);
}

function clearWorksheetPrintStyles() {
  const style = document.getElementById(WORKSHEET_PRINT_STYLE_ID);
  style?.remove();
}

function readStoredRecentWorksheetSets(): WorksheetRecentSet[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(RECENT_WORKSHEET_SET_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => normalizeRecentWorksheetSet(item))
      .filter((item): item is WorksheetRecentSet => Boolean(item))
      .slice(0, MAX_RECENT_WORKSHEET_SETS);
  } catch {
    return [];
  }
}

function writeStoredRecentWorksheetSets(sets: WorksheetRecentSet[]) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(
      RECENT_WORKSHEET_SET_STORAGE_KEY,
      JSON.stringify(sets.slice(0, MAX_RECENT_WORKSHEET_SETS))
    );
  } catch {
    // Storage can be unavailable in private browsing or restricted browsers.
  }
}

function normalizeRecentWorksheetSet(value: unknown) {
  if (!value || typeof value !== 'object') return null;

  const item = value as Partial<WorksheetRecentSet>;
  const characters = normalizeHanziCharacters(item.characters?.join('')).slice(
    0,
    MAX_WORKSHEET_CHARACTERS
  );

  if (characters.length === 0) return null;

  const gridCount = GRID_OPTIONS.find((option) => option === item.gridCount);
  const paperSize = WORKSHEET_PAPER_SIZES.find(
    (option) => option === item.paperSize
  );
  const traceMode = TRACE_MODES.find((option) => option === item.traceMode);

  if (!gridCount || !paperSize || !traceMode) return null;

  const assignmentNote = normalizeAssignmentNote(item.assignmentNote);

  return {
    assignmentNote,
    characters,
    gridCount,
    id: createRecentWorksheetSetId({
      assignmentNote,
      characters,
      gridCount,
      paperSize,
      showCharacterDetails: item.showCharacterDetails !== false,
      showFeedbackSection: item.showFeedbackSection !== false,
      traceMode,
    }),
    paperSize,
    showCharacterDetails: item.showCharacterDetails !== false,
    showFeedbackSection: item.showFeedbackSection !== false,
    traceMode,
    updatedAt: normalizeRecentWorksheetUpdatedAt(item.updatedAt),
  };
}

function normalizeRecentWorksheetUpdatedAt(value: unknown) {
  if (typeof value !== 'string') return new Date().toISOString();

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toISOString();

  return date.toISOString();
}

function createRecentWorksheetSetId({
  assignmentNote,
  characters,
  gridCount,
  paperSize,
  showCharacterDetails,
  showFeedbackSection,
  traceMode,
}: Pick<
  WorksheetRecentSet,
  | 'assignmentNote'
  | 'characters'
  | 'gridCount'
  | 'paperSize'
  | 'showCharacterDetails'
  | 'showFeedbackSection'
  | 'traceMode'
>) {
  return [
    characters.join(''),
    gridCount,
    paperSize,
    traceMode,
    showCharacterDetails ? 'details' : 'simple',
    showFeedbackSection ? 'feedback' : 'no-feedback',
    assignmentNote,
  ].join('|');
}

function upsertRecentWorksheetSet(
  current: WorksheetRecentSet[],
  nextSet: WorksheetRecentSet
) {
  return [nextSet, ...current.filter((item) => item.id !== nextSet.id)].slice(
    0,
    MAX_RECENT_WORKSHEET_SETS
  );
}

function formatRecentWorksheetDate(value: string, locale: 'en' | 'zh') {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return locale === 'zh' ? '未知时间' : 'unknown date';
  }

  return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function buildWorksheetPrintStyleText(
  paperSize: WorksheetPaperSize,
  config: WorksheetPaperPrintConfig
) {
  return `
@media print {
  @page {
    size: ${config.pageSize};
    margin: ${config.margin};
  }

  body[data-print-mode="worksheet"][data-print-paper="${paperSize}"] [data-print-header] {
    gap: ${config.headerGap} !important;
  }

  body[data-print-mode="worksheet"][data-print-paper="${paperSize}"] [data-print-assignment] {
    gap: ${config.assignmentGap} !important;
    padding: ${config.assignmentPadding} !important;
  }

  body[data-print-mode="worksheet"][data-print-paper="${paperSize}"] [data-print-character] {
    margin-top: ${config.characterMarginTop} !important;
  }

  body[data-print-mode="worksheet"][data-print-paper="${paperSize}"] [data-print-feedback] {
    margin-block-start: ${config.feedbackMarginTop} !important;
    padding: ${config.feedbackPadding} !important;
  }

  body[data-print-mode="worksheet"][data-print-paper="${paperSize}"] [data-print-online-review] {
    margin-block-start: ${config.footerMarginTop} !important;
    padding: ${config.feedbackPadding} !important;
  }

  body[data-print-mode="worksheet"][data-print-paper="${paperSize}"] [data-print-grid] {
    gap: ${config.gridGap} !important;
    grid-template-columns: repeat(auto-fit, minmax(${config.gridMin}, ${config.gridMax})) !important;
  }

  body[data-print-mode="worksheet"][data-print-paper="${paperSize}"] [data-print-footer] {
    gap: ${config.footerGap} !important;
    margin-block-start: ${config.footerMarginTop} !important;
  }
}
`;
}

export function WorksheetPage({
  initialCharacters,
  initialGridCount,
  initialAssignmentNote,
  initialPaperSize,
  initialShowCharacterDetails,
  initialShowFeedbackSection,
  initialTraceMode,
}: {
  initialCharacters?: string[];
  initialGridCount?: WorksheetGridCount;
  initialAssignmentNote?: string;
  initialPaperSize?: WorksheetPaperSize;
  initialShowCharacterDetails?: boolean;
  initialShowFeedbackSection?: boolean;
  initialTraceMode?: TraceMode;
}) {
  const currentLocale = getLocale() === 'zh' ? 'zh' : 'en';
  const copy = getWorksheetCopy(currentLocale);
  const characters = useMemo(
    () => getFreeCharacters(currentLocale),
    [currentLocale]
  );
  const characterMap = useMemo(
    () => new Map(characters.map((item) => [item.character, item])),
    [characters]
  );
  const initialSelectedCharacters = useMemo(() => {
    const normalized = normalizeHanziCharacters(initialCharacters?.join(''));
    if (normalized.length > 0) {
      return normalized.slice(0, MAX_WORKSHEET_CHARACTERS);
    }
    return characters.slice(0, 6).map((item) => item.character);
  }, [characters, initialCharacters]);
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>(
    initialSelectedCharacters
  );
  const [customInput, setCustomInput] = useState('');
  const initialAssignmentNoteValue = normalizeAssignmentNote(
    initialAssignmentNote
  );
  const initialGridCountValue = initialGridCount ?? DEFAULT_GRID_COUNT;
  const initialPaperSizeValue = initialPaperSize ?? DEFAULT_PAPER_SIZE;
  const initialShowCharacterDetailsValue =
    initialShowCharacterDetails ?? DEFAULT_SHOW_CHARACTER_DETAILS;
  const initialShowFeedbackSectionValue =
    initialShowFeedbackSection ?? DEFAULT_SHOW_FEEDBACK_SECTION;
  const initialTraceModeValue = initialTraceMode ?? DEFAULT_TRACE_MODE;
  const [gridCount, setGridCount] = useState<WorksheetGridCount>(
    initialGridCountValue
  );
  const [paperSize, setPaperSize] = useState<WorksheetPaperSize>(
    initialPaperSizeValue
  );
  const [showCharacterDetails, setShowCharacterDetails] = useState(
    initialShowCharacterDetailsValue
  );
  const [showFeedbackSection, setShowFeedbackSection] = useState(
    initialShowFeedbackSectionValue
  );
  const [traceMode, setTraceMode] = useState<TraceMode>(initialTraceModeValue);
  const [assignmentNote, setAssignmentNote] = useState(
    initialAssignmentNoteValue
  );
  const [printSessionStarted, setPrintSessionStarted] = useState(false);
  const [recentSets, setRecentSets] = useState<WorksheetRecentSet[]>([]);
  const quickSets = useMemo(
    () => createWorksheetQuickSets(characters, copy),
    [characters, copy]
  );

  useEffect(() => {
    setSelectedCharacters(initialSelectedCharacters);
  }, [initialSelectedCharacters]);

  useEffect(() => {
    setGridCount(initialGridCountValue);
  }, [initialGridCountValue]);

  useEffect(() => {
    setPaperSize(initialPaperSizeValue);
  }, [initialPaperSizeValue]);

  useEffect(() => {
    setShowCharacterDetails(initialShowCharacterDetailsValue);
  }, [initialShowCharacterDetailsValue]);

  useEffect(() => {
    setShowFeedbackSection(initialShowFeedbackSectionValue);
  }, [initialShowFeedbackSectionValue]);

  useEffect(() => {
    setTraceMode(initialTraceModeValue);
  }, [initialTraceModeValue]);

  useEffect(() => {
    setAssignmentNote(initialAssignmentNoteValue);
  }, [initialAssignmentNoteValue]);

  useEffect(() => {
    setRecentSets(readStoredRecentWorksheetSets());
  }, []);

  useEffect(() => {
    const handleBeforePrint = () => {
      setPrintSessionStarted(true);
      enableWorksheetPrintMode();
      syncWorksheetPrintPaper(paperSize);
      syncWorksheetPrintStyles(paperSize);
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', clearWorksheetPrintMode);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', clearWorksheetPrintMode);
      clearWorksheetPrintMode();
    };
  }, [paperSize]);

  const parsedCustomCharacters = useMemo(
    () => normalizeHanziCharacters(customInput),
    [customInput]
  );
  const customOverflowCount = Math.max(
    0,
    parsedCustomCharacters.length - MAX_WORKSHEET_CHARACTERS
  );
  const selectedItems = selectedCharacters.map(
    (character) =>
      characterMap.get(character) ??
      createCustomWorksheetCharacter(character, copy)
  );
  const normalizedAssignmentNote = normalizeAssignmentNote(assignmentNote);
  const practiceSearch = useMemo(
    () =>
      selectedCharacters.length > 0
        ? {
            character: selectedCharacters[0],
            characters: selectedCharacters,
          }
        : {},
    [selectedCharacters]
  );
  const practicePrintUrl = useMemo(
    () => buildPracticePrintUrl(selectedCharacters),
    [selectedCharacters]
  );

  const shareUrl = useMemo(
    () =>
      buildWorksheetSharePath({
        assignmentNote: normalizedAssignmentNote,
        characters: selectedCharacters,
        gridCount,
        paperSize,
        showCharacterDetails,
        showFeedbackSection,
        traceMode,
      }),
    [
      gridCount,
      normalizedAssignmentNote,
      paperSize,
      selectedCharacters,
      showCharacterDetails,
      showFeedbackSection,
      traceMode,
    ]
  );

  const toggleCharacter = (character: string) => {
    const selectionIsFull =
      !selectedCharacters.includes(character) &&
      selectedCharacters.length >= MAX_WORKSHEET_CHARACTERS;

    if (selectionIsFull) {
      toast.error(copy.selectionLimit(MAX_WORKSHEET_CHARACTERS));
      return;
    }

    setSelectedCharacters((current) => {
      if (current.includes(character)) {
        return current.filter((item) => item !== character);
      }

      if (current.length >= MAX_WORKSHEET_CHARACTERS) {
        return current;
      }

      return [...current, character];
    });
  };

  const applyCustomCharacters = () => {
    setSelectedCharacters(
      parsedCustomCharacters.slice(0, MAX_WORKSHEET_CHARACTERS)
    );
  };

  const applyFreePreviewCharacters = () => {
    setSelectedCharacters(
      parsedCustomCharacters.slice(0, MAX_WORKSHEET_CHARACTERS)
    );
    toast.success(copy.freePreviewApplied(MAX_WORKSHEET_CHARACTERS));
  };

  const applyQuickSet = (quickSet: WorksheetQuickSet) => {
    setSelectedCharacters(
      quickSet.characters.slice(0, MAX_WORKSHEET_CHARACTERS)
    );
    setCustomInput('');
  };

  const rememberCurrentSet = () => {
    if (selectedCharacters.length === 0) return;

    const nextSet = normalizeRecentWorksheetSet({
      assignmentNote: normalizedAssignmentNote,
      characters: selectedCharacters,
      gridCount,
      paperSize,
      showFeedbackSection,
      showCharacterDetails,
      traceMode,
      updatedAt: new Date().toISOString(),
    });

    if (!nextSet) return;

    setRecentSets((current) => {
      const updatedSets = upsertRecentWorksheetSet(current, nextSet);
      writeStoredRecentWorksheetSets(updatedSets);
      return updatedSets;
    });
  };

  const applyRecentSet = (recentSet: WorksheetRecentSet) => {
    setSelectedCharacters(recentSet.characters);
    setCustomInput('');
    setGridCount(recentSet.gridCount);
    setPaperSize(recentSet.paperSize);
    setShowFeedbackSection(recentSet.showFeedbackSection);
    setShowCharacterDetails(recentSet.showCharacterDetails);
    setAssignmentNote(recentSet.assignmentNote);
    setTraceMode(recentSet.traceMode);
    setPrintSessionStarted(false);
    toast.success(copy.recentRestoreSuccess);
  };

  const removeRecentSet = (recentSet: WorksheetRecentSet) => {
    setRecentSets((current) => {
      const updatedSets = current.filter((item) => item.id !== recentSet.id);
      writeStoredRecentWorksheetSets(updatedSets);
      return updatedSets;
    });
  };

  const clearRecentSets = () => {
    setRecentSets([]);
    writeStoredRecentWorksheetSets([]);
    toast.success(copy.recentClearSuccess);
  };

  const copyRecentShareLink = async (recentSet: WorksheetRecentSet) => {
    if (typeof window === 'undefined') return;

    const url = new URL(
      buildWorksheetSharePath(recentSet),
      window.location.origin
    ).toString();

    try {
      await window.navigator.clipboard.writeText(url);
      toast.success(copy.shareSuccess);
    } catch {
      toast.error(copy.shareError);
    }
  };

  const copyRecentAssignmentMessage = async (recentSet: WorksheetRecentSet) => {
    if (typeof window === 'undefined') return;

    const worksheetUrl = new URL(
      buildWorksheetSharePath(recentSet),
      window.location.origin
    ).toString();
    const reviewUrl = `https://${buildPracticePrintUrl(recentSet.characters)}`;
    const message = copy.assignmentShareMessage({
      assignmentNote: recentSet.assignmentNote,
      characters: recentSet.characters,
      reviewUrl,
      worksheetUrl,
    });

    try {
      await window.navigator.clipboard.writeText(message);
      toast.success(copy.assignmentShareSuccess);
    } catch {
      toast.error(copy.shareError);
    }
  };

  const resetSelection = () => {
    setSelectedCharacters(initialSelectedCharacters);
    setCustomInput('');
    setGridCount(initialGridCountValue);
    setPaperSize(initialPaperSizeValue);
    setShowFeedbackSection(initialShowFeedbackSectionValue);
    setShowCharacterDetails(initialShowCharacterDetailsValue);
    setAssignmentNote(initialAssignmentNoteValue);
    setTraceMode(initialTraceModeValue);
    setPrintSessionStarted(false);
  };

  const clearSelection = () => {
    setSelectedCharacters([]);
    setPrintSessionStarted(false);
  };

  const printWorksheet = () => {
    if (selectedCharacters.length === 0) {
      toast.error(copy.printEmptyError);
      return;
    }

    enableWorksheetPrintMode();
    syncWorksheetPrintPaper(paperSize);
    syncWorksheetPrintStyles(paperSize);
    rememberCurrentSet();
    setPrintSessionStarted(true);
    window.requestAnimationFrame(() => {
      window.print();
    });
  };

  const copyShareLink = async () => {
    if (typeof window === 'undefined') return;

    const url = new URL(shareUrl, window.location.origin).toString();

    try {
      await window.navigator.clipboard.writeText(url);
      rememberCurrentSet();
      toast.success(copy.shareSuccess);
    } catch {
      toast.error(copy.shareError);
    }
  };

  const copyAssignmentMessage = async () => {
    if (typeof window === 'undefined') return;

    const worksheetUrl = new URL(shareUrl, window.location.origin).toString();
    const reviewUrl = `https://${
      selectedCharacters.length > 0
        ? practicePrintUrl
        : `${WORKSHEET_DOMAIN}${Routes.Learn}`
    }`;
    const message = copy.assignmentShareMessage({
      assignmentNote: normalizedAssignmentNote,
      characters: selectedCharacters,
      reviewUrl,
      worksheetUrl,
    });

    try {
      await window.navigator.clipboard.writeText(message);
      rememberCurrentSet();
      toast.success(copy.assignmentShareSuccess);
    } catch {
      toast.error(copy.shareError);
    }
  };

  return (
    <section
      className="min-h-[calc(100vh-12rem)] bg-background"
      data-print-page="worksheet"
    >
      <div
        className="mx-auto flex w-full max-w-6xl flex-col gap-6 overflow-x-hidden px-4 py-8 sm:px-6 lg:px-8"
        data-print-shell
      >
        <div className="flex flex-col gap-4">
          <Link
            to={Routes.Learn}
            data-print-hidden
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              'w-fit print:hidden'
            )}
          >
            <IconArrowLeft className="size-4" />
            {copy.back}
          </Link>

          <div
            className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start"
            data-print-layout
          >
            <div className="min-w-0 space-y-5 print:hidden" data-print-hidden>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-primary/30">
                    {copy.badge}
                  </Badge>
                  <Badge variant="secondary">{copy.freeBadge}</Badge>
                </div>
                <h1 className="text-balance text-3xl font-semibold tracking-normal sm:text-4xl">
                  {copy.title}
                </h1>
                <p className="max-w-2xl text-base text-muted-foreground">
                  {copy.description}
                </p>
              </div>

              <Card className="min-w-0 rounded-lg">
                <CardHeader>
                  <CardTitle>{copy.selectTitle}</CardTitle>
                  <CardDescription>{copy.selectDescription}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">
                        {copy.quickSetsTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {copy.quickSetsDescription}
                      </p>
                    </div>
                    <div className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2">
                      {quickSets.map((quickSet) => {
                        const active = isSameSelection(
                          selectedCharacters,
                          quickSet.characters
                        );

                        return (
                          <button
                            key={quickSet.id}
                            type="button"
                            aria-pressed={active}
                            onClick={() => applyQuickSet(quickSet)}
                            className={cn(
                              'min-w-0 rounded-lg border bg-background p-3 text-left transition-colors',
                              'hover:border-primary/50 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                              active && 'border-primary bg-primary/10'
                            )}
                          >
                            <div className="flex min-w-0 items-start justify-between gap-3">
                              <span className="min-w-0 font-medium">
                                {quickSet.title}
                              </span>
                              <Badge
                                variant="outline"
                                className="shrink-0 rounded-md"
                              >
                                {copy.quickSetCount(quickSet.characters.length)}
                              </Badge>
                            </div>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                              {quickSet.description}
                            </p>
                            <p className="mt-2 break-words text-sm font-semibold">
                              {quickSet.characters.join(' ')}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {recentSets.length > 0 ? (
                    <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">
                            {copy.recentSetsTitle}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {copy.recentSetsDescription}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={clearRecentSets}
                        >
                          <IconEraser className="size-3.5" />
                          {copy.recentClearCta}
                        </Button>
                      </div>
                      <div className="grid gap-2">
                        {recentSets.map((recentSet) => (
                          <div
                            key={recentSet.id}
                            className="grid grid-cols-[minmax(0,1fr)] gap-3 rounded-lg border bg-background p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                          >
                            <button
                              type="button"
                              onClick={() => applyRecentSet(recentSet)}
                              className="min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold">
                                  {recentSet.characters.join(' ')}
                                </span>
                                <Badge variant="outline" className="rounded-md">
                                  {copy.quickSetCount(
                                    recentSet.characters.length
                                  )}
                                </Badge>
                              </div>
                              <p className="mt-1 truncate text-xs text-muted-foreground">
                                {copy.recentSetMeta(
                                  recentSet.gridCount,
                                  copy.paperSizes[recentSet.paperSize],
                                  copy.traceModes[recentSet.traceMode],
                                  recentSet.showFeedbackSection
                                )}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {copy.recentSavedAt(
                                  formatRecentWorksheetDate(
                                    recentSet.updatedAt,
                                    currentLocale
                                  )
                                )}
                              </p>
                              {recentSet.assignmentNote ? (
                                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                                  {recentSet.assignmentNote}
                                </p>
                              ) : null}
                            </button>
                            <div className="flex flex-wrap gap-2 sm:justify-end">
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => applyRecentSet(recentSet)}
                              >
                                <IconRefresh className="size-3.5" />
                                {copy.recentRestoreCta}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => copyRecentShareLink(recentSet)}
                              >
                                <IconCopy className="size-3.5" />
                                {copy.recentShareCta}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  copyRecentAssignmentMessage(recentSet)
                                }
                              >
                                <IconMailForward className="size-3.5" />
                                {copy.recentAssignmentShareCta}
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => removeRecentSet(recentSet)}
                                aria-label={copy.recentRemoveLabel}
                              >
                                <IconX className="size-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-5 gap-2">
                    {characters.map((item) => {
                      const selected = selectedCharacters.includes(
                        item.character
                      );
                      return (
                        <button
                          key={item.character}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => toggleCharacter(item.character)}
                          className={cn(
                            'flex aspect-square flex-col items-center justify-center rounded-lg border bg-card transition-colors',
                            'hover:border-primary/50 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            selected && 'border-primary bg-primary/10'
                          )}
                        >
                          <span className="text-3xl font-semibold">
                            {item.character}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {item.pinyin}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="rounded-lg border bg-muted/30 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">
                          {copy.selectedTitle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {copy.selectedDescription(
                            selectedCharacters.length,
                            MAX_WORKSHEET_CHARACTERS
                          )}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="rounded-md">
                          {copy.selectedCount(
                            selectedCharacters.length,
                            MAX_WORKSHEET_CHARACTERS
                          )}
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={clearSelection}
                          disabled={selectedCharacters.length === 0}
                          className="h-7 px-2 text-xs text-muted-foreground"
                        >
                          <IconEraser className="size-3.5" />
                          {copy.clearSelectionCta}
                        </Button>
                      </div>
                    </div>
                    {selectedItems.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedItems.map((item) => (
                          <button
                            key={item.character}
                            type="button"
                            onClick={() => toggleCharacter(item.character)}
                            className={cn(
                              'inline-flex h-8 items-center gap-1.5 rounded-md border bg-background px-2 text-sm transition-colors',
                              'hover:border-primary/50 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                            )}
                            aria-label={copy.removeCharacter(item.character)}
                          >
                            <span className="font-semibold">
                              {item.character}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {item.custom
                                ? copy.customCharacterLabel
                                : item.pinyin}
                            </span>
                            <IconX className="size-3.5 text-muted-foreground" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 rounded-md border border-dashed bg-background p-3 text-sm text-muted-foreground">
                        {copy.selectedEmpty}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-3 sm:p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">
                          {copy.printSettingsTitle}
                        </p>
                        <p className="text-xs leading-5 text-muted-foreground">
                          {copy.printSettingsDescription}
                        </p>
                      </div>
                      <Badge variant="outline" className="rounded-md bg-card">
                        {copy.selectedCount(
                          selectedCharacters.length,
                          MAX_WORKSHEET_CHARACTERS
                        )}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
                      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            {copy.practiceBoxesLabel}
                          </p>
                          <div className="grid grid-cols-3 gap-1 rounded-lg border bg-background p-1">
                            {GRID_OPTIONS.map((option) => (
                              <button
                                key={option}
                                type="button"
                                aria-pressed={gridCount === option}
                                onClick={() => setGridCount(option)}
                                className={cn(
                                  'min-h-10 rounded-md px-2 text-sm leading-tight transition-colors',
                                  'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                  gridCount === option &&
                                    'bg-primary/10 font-medium text-primary'
                                )}
                              >
                                {copy.gridOption(option)}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            {copy.paperSizeLabel}
                          </p>
                          <div className="grid grid-cols-2 gap-1 rounded-lg border bg-background p-1">
                            {WORKSHEET_PAPER_SIZES.map((size) => (
                              <button
                                key={size}
                                type="button"
                                aria-pressed={paperSize === size}
                                onClick={() => setPaperSize(size)}
                                className={cn(
                                  'min-h-10 rounded-md px-2 text-sm leading-tight transition-colors',
                                  'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                  paperSize === size &&
                                    'bg-primary/10 font-medium text-primary'
                                )}
                              >
                                {copy.paperSizes[size]}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium">
                            {copy.traceModeLabel}
                          </p>
                          <p className="text-xs leading-5 text-muted-foreground">
                            {copy.traceModeDescription}
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-1 rounded-lg border bg-background p-1">
                          {TRACE_MODES.map((mode) => (
                            <button
                              key={mode}
                              type="button"
                              aria-pressed={traceMode === mode}
                              onClick={() => setTraceMode(mode)}
                              className={cn(
                                'min-h-10 rounded-md px-2 text-sm leading-tight transition-colors',
                                'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                traceMode === mode &&
                                  'bg-primary/10 font-medium text-primary'
                              )}
                            >
                              {copy.traceModes[mode]}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <div className="flex items-start justify-between gap-3 rounded-lg border bg-background p-3">
                          <div className="min-w-0 space-y-1">
                            <Label
                              htmlFor="worksheet-character-details"
                              className="text-sm"
                            >
                              {copy.characterDetailsLabel}
                            </Label>
                            <p className="text-xs leading-5 text-muted-foreground">
                              {copy.characterDetailsDescription}
                            </p>
                          </div>
                          <Switch
                            id="worksheet-character-details"
                            checked={showCharacterDetails}
                            onCheckedChange={setShowCharacterDetails}
                            aria-label={copy.characterDetailsLabel}
                            className="mt-0.5 shrink-0"
                          />
                        </div>

                        <div className="flex items-start justify-between gap-3 rounded-lg border bg-background p-3">
                          <div className="min-w-0 space-y-1">
                            <Label
                              htmlFor="worksheet-feedback-section"
                              className="text-sm"
                            >
                              {copy.feedbackSectionLabel}
                            </Label>
                            <p className="text-xs leading-5 text-muted-foreground">
                              {copy.feedbackSectionDescription}
                            </p>
                          </div>
                          <Switch
                            id="worksheet-feedback-section"
                            checked={showFeedbackSection}
                            onCheckedChange={setShowFeedbackSection}
                            aria-label={copy.feedbackSectionLabel}
                            className="mt-0.5 shrink-0"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium">
                            {copy.assignmentNoteLabel}
                          </p>
                          <p className="text-xs leading-5 text-muted-foreground">
                            {copy.assignmentNoteDescription}
                          </p>
                        </div>
                        <Textarea
                          value={assignmentNote}
                          onChange={(event) =>
                            setAssignmentNote(
                              truncateWorksheetText(
                                event.target.value,
                                MAX_ASSIGNMENT_NOTE_LENGTH
                              )
                            )
                          }
                          placeholder={copy.assignmentNotePlaceholder}
                          className="min-h-20 resize-none bg-background"
                        />
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                          <span>{copy.assignmentNoteHint}</span>
                          <span>
                            {copy.assignmentNoteCount(
                              normalizedAssignmentNote.length,
                              MAX_ASSIGNMENT_NOTE_LENGTH
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2">
                        <Button
                          type="button"
                          onClick={printWorksheet}
                          disabled={selectedCharacters.length === 0}
                          className="w-full justify-center sm:col-span-2"
                        >
                          <IconPrinter className="size-4" />
                          {copy.printCta}
                        </Button>
                        <Link
                          to={Routes.Learn}
                          search={practiceSearch}
                          aria-disabled={selectedCharacters.length === 0}
                          className={cn(
                            buttonVariants({ variant: 'outline' }),
                            'w-full justify-center bg-background',
                            selectedCharacters.length === 0 &&
                              'pointer-events-none opacity-50'
                          )}
                        >
                          <IconArrowRight className="size-4" />
                          {copy.practiceCta}
                        </Link>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={copyShareLink}
                          disabled={selectedCharacters.length === 0}
                          className="w-full justify-center bg-background"
                        >
                          <IconCopy className="size-4" />
                          {copy.shareCta}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={copyAssignmentMessage}
                          disabled={selectedCharacters.length === 0}
                          className="w-full justify-center bg-background"
                        >
                          <IconMailForward className="size-4" />
                          {copy.assignmentShareCta}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={resetSelection}
                          className="w-full justify-center bg-background"
                        >
                          <IconRefresh className="size-4" />
                          {copy.resetCta}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {printSessionStarted && selectedCharacters.length > 0 ? (
                    <div
                      className="rounded-lg border border-primary/20 bg-primary/5 p-3"
                      aria-live="polite"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <IconCircleCheck className="size-4 text-primary" />
                            {copy.printFollowupTitle}
                          </div>
                          <p className="text-sm leading-6 text-muted-foreground">
                            {copy.printFollowupDescription}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {copy.printFollowupSteps.map((step) => (
                              <Badge
                                key={step}
                                variant="outline"
                                className="rounded-md bg-background"
                              >
                                {step}
                              </Badge>
                            ))}
                          </div>
                          <p className="truncate text-sm font-semibold">
                            {selectedCharacters.join(' ')}
                          </p>
                        </div>
                        <Link
                          to={Routes.Learn}
                          search={practiceSearch}
                          className={cn(
                            buttonVariants(),
                            'w-fit shrink-0 sm:mt-0'
                          )}
                        >
                          <IconArrowRight className="size-4" />
                          {copy.printFollowupCta}
                        </Link>
                      </div>
                    </div>
                  ) : null}

                  <div className="space-y-2 rounded-lg border border-dashed bg-muted/10 p-3">
                    <label
                      htmlFor="custom-worksheet-characters"
                      className="text-sm font-medium"
                    >
                      {copy.customTitle}
                    </label>
                    <Textarea
                      id="custom-worksheet-characters"
                      value={customInput}
                      onChange={(event) => setCustomInput(event.target.value)}
                      placeholder={copy.customPlaceholder}
                      className="min-h-24 resize-none"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>
                        {copy.customCount(
                          Math.min(
                            parsedCustomCharacters.length,
                            MAX_WORKSHEET_CHARACTERS
                          ),
                          MAX_WORKSHEET_CHARACTERS
                        )}
                      </span>
                      {customOverflowCount > 0 ? (
                        <Link
                          to={Routes.Pricing}
                          className="font-medium text-primary underline-offset-4 hover:underline"
                        >
                          {copy.customOverflow(customOverflowCount)}
                        </Link>
                      ) : null}
                    </div>
                    {customOverflowCount > 0 ? (
                      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                        <p className="text-sm leading-6 text-muted-foreground">
                          {copy.freePreviewLimitHint(
                            MAX_WORKSHEET_CHARACTERS,
                            customOverflowCount
                          )}
                        </p>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={applyFreePreviewCharacters}
                          className="mt-3"
                        >
                          <IconClipboardText className="size-4" />
                          {copy.freePreviewLimitCta(MAX_WORKSHEET_CHARACTERS)}
                        </Button>
                      </div>
                    ) : null}
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={applyCustomCharacters}
                      disabled={parsedCustomCharacters.length === 0}
                    >
                      <IconClipboardText className="size-4" />
                      {copy.customApplyCta}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="min-w-0 rounded-lg border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <IconLock className="size-4" />
                    {copy.packTitle}
                  </CardTitle>
                  <CardDescription>{copy.packDescription}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    {copy.packFeatures.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-start gap-2 rounded-lg border bg-background/80 p-3 text-sm leading-6"
                      >
                        <IconCircleCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    to={Routes.Pricing}
                    className={cn(buttonVariants(), 'w-fit')}
                  >
                    <IconSparkles className="size-4" />
                    {copy.packCta}
                  </Link>
                </CardContent>
              </Card>
            </div>

            <div
              className="min-w-0 rounded-lg border bg-background p-4 shadow-sm print:border-0 print:p-0 print:shadow-none"
              data-print-preview-frame
            >
              <WorksheetPreview
                copy={copy}
                assignmentNote={normalizedAssignmentNote}
                gridCount={gridCount}
                practicePrintUrl={practicePrintUrl}
                showCharacterDetails={showCharacterDetails}
                showFeedbackSection={showFeedbackSection}
                selectedItems={selectedItems}
                traceMode={traceMode}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type WorksheetPreviewProps = {
  copy: WorksheetCopy;
  assignmentNote: string;
  selectedItems: WorksheetCharacter[];
  gridCount: number;
  practicePrintUrl: string;
  showCharacterDetails: boolean;
  showFeedbackSection: boolean;
  traceMode: TraceMode;
};

function WorksheetPreview({
  copy,
  assignmentNote,
  selectedItems,
  gridCount,
  practicePrintUrl,
  showCharacterDetails,
  showFeedbackSection,
  traceMode,
}: WorksheetPreviewProps) {
  const assignmentChecks = showCharacterDetails
    ? copy.assignmentChecks
    : copy.handwritingAssignmentChecks;
  const assignmentDescription = showCharacterDetails
    ? copy.assignmentDescription
    : copy.handwritingAssignmentDescription;

  return (
    <div
      className="mx-auto w-full max-w-[820px] bg-white p-4 text-slate-950 sm:p-6 print:max-w-none print:p-0"
      data-print-root
    >
      <div
        className="mb-5 flex flex-col items-start gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:justify-between"
        data-print-header
      >
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Lang Study
          </p>
          <h2 className="mt-1 text-2xl font-semibold">{copy.previewTitle}</h2>
          <div className="mt-2 grid grid-cols-[minmax(0,1fr)] gap-2 text-sm text-slate-600 sm:grid-cols-2">
            <div className="flex min-w-0 items-end gap-2">
              <span className="shrink-0">{copy.nameLabel}:</span>
              <span
                className="h-6 min-w-0 flex-1 border-b border-slate-400"
                aria-hidden="true"
              />
            </div>
            <div className="flex min-w-0 items-end gap-2">
              <span className="shrink-0">{copy.dateLabel}:</span>
              <span
                className="h-6 min-w-0 flex-1 border-b border-slate-400"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
        <div
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm sm:w-auto sm:min-w-44"
          data-print-brand
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            <IconWorldWww className="size-3.5" />
            {copy.sourceLabel}
          </div>
          <div className="mt-1 font-semibold text-slate-950">
            {WORKSHEET_DOMAIN}
          </div>
          <div className="mt-0.5 text-xs text-slate-500">
            {copy.characterCount(selectedItems.length)}
          </div>
        </div>
      </div>

      <div
        className="mb-5 grid grid-cols-[minmax(0,1fr)] gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm sm:grid-cols-[minmax(0,1fr)_minmax(12rem,0.55fr)]"
        data-print-assignment
      >
        <div className="min-w-0">
          <div className="font-semibold text-slate-950">
            {copy.assignmentTitle}
          </div>
          <p className="mt-1 leading-6 text-slate-600">
            {assignmentDescription}
          </p>
          {assignmentNote ? (
            <div
              className="mt-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              data-print-assignment-note
            >
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {copy.assignmentNoteLabel}
              </div>
              <p className="mt-1 whitespace-pre-wrap leading-6">
                {assignmentNote}
              </p>
            </div>
          ) : null}
        </div>
        <div className="grid gap-2 text-xs text-slate-700">
          {assignmentChecks.map((item) => (
            <div key={item} className="flex items-start gap-2">
              <span
                className="mt-0.5 size-3.5 shrink-0 rounded-sm border border-slate-400 bg-white"
                aria-hidden="true"
              />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {selectedItems.length > 0 ? (
        <div className="space-y-6">
          {selectedItems.map((item) => (
            <section
              key={item.character}
              className="break-inside-avoid"
              data-print-character
            >
              <div
                className={cn(
                  'mb-2 grid gap-3 sm:items-center',
                  showCharacterDetails && 'sm:grid-cols-[auto_1fr]'
                )}
              >
                <div className="flex size-16 items-center justify-center rounded-lg border border-slate-300 text-4xl font-semibold">
                  {item.character}
                </div>
                {showCharacterDetails ? (
                  <div data-print-character-details>
                    <h3 className="text-lg font-semibold">
                      {item.character} ·{' '}
                      {item.custom ? copy.customCharacterLabel : item.pinyin}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {item.custom
                        ? copy.customCharacterDescription
                        : `${item.meaning} · ${item.hint}`}
                    </p>
                    {item.examples.length > 0 ? (
                      <p className="mt-1 text-xs text-slate-500">
                        {copy.examplesLabel}: {item.examples.join(', ')}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div
                className="grid grid-cols-3 gap-2 sm:grid-cols-6"
                data-print-grid
              >
                {Array.from({ length: gridCount }).map((_, index) => (
                  <PracticeBox
                    key={`${item.character}-${index}`}
                    character={
                      shouldShowTraceCharacter(index, traceMode)
                        ? item.character
                        : undefined
                    }
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="flex min-h-[420px] items-center justify-center rounded-lg border border-dashed border-slate-300 text-center text-sm text-slate-500">
          {copy.empty}
        </div>
      )}

      {showFeedbackSection && selectedItems.length > 0 ? (
        <WorksheetFeedbackSection copy={copy} />
      ) : null}

      {selectedItems.length > 0 ? (
        <div
          className="mt-5 break-inside-avoid rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm"
          data-print-online-review
        >
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(14rem,0.72fr)] sm:items-center">
            <div className="min-w-0">
              <div className="flex items-center gap-2 font-semibold text-slate-950">
                <IconArrowRight className="size-4 shrink-0" />
                {copy.onlineReviewTitle}
              </div>
              <p className="mt-1 leading-6 text-slate-600">
                {copy.onlineReviewDescription}
              </p>
              <p className="mt-2 truncate font-semibold text-slate-950">
                {selectedItems.map((item) => item.character).join(' ')}
              </p>
            </div>
            <div className="min-w-0 rounded-md border border-slate-200 bg-white px-3 py-2">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                <IconWorldWww className="size-3.5 shrink-0" />
                {copy.onlineReviewLinkLabel}
              </div>
              <div className="mt-1 break-all text-sm font-semibold leading-5 text-slate-950">
                {practicePrintUrl}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div
        className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-xs text-slate-500"
        data-print-footer
      >
        <div className="flex min-w-0 items-center gap-2">
          <IconCircleCheck className="size-4 shrink-0" />
          <span>{copy.footerTip}</span>
        </div>
        <div className="flex min-w-0 items-center gap-2 font-medium text-slate-700">
          <IconWorldWww className="size-4 shrink-0" />
          <span>
            {copy.footerSourcePrefix}{' '}
            <span className="font-semibold text-slate-950">
              {WORKSHEET_URL}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

function WorksheetFeedbackSection({ copy }: { copy: WorksheetCopy }) {
  return (
    <div
      className="mt-6 break-inside-avoid rounded-lg border border-slate-200 bg-white p-3 text-sm"
      data-print-feedback
    >
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,0.55fr)]">
        <div>
          <div className="font-semibold text-slate-950">
            {copy.feedbackTitle}
          </div>
          <p className="mt-1 leading-6 text-slate-600">
            {copy.feedbackDescription}
          </p>
          <div className="mt-3 grid gap-2 text-xs text-slate-700 sm:grid-cols-2">
            {copy.feedbackFields.map((field) => (
              <div
                key={field}
                className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <span className="font-medium text-slate-600">{field}</span>
                <span className="ml-2 text-slate-400">____________</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-2 text-xs text-slate-700">
          {copy.feedbackChecks.map((item) => (
            <div key={item} className="flex items-start gap-2">
              <span
                className="mt-0.5 size-3.5 shrink-0 rounded-sm border border-slate-400 bg-white"
                aria-hidden="true"
              />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type WorksheetCopy = ReturnType<typeof getWorksheetCopy>;

type WorksheetAssignmentShareMessageParams = {
  assignmentNote: string;
  characters: string[];
  reviewUrl: string;
  worksheetUrl: string;
};

function getWorksheetCopy(locale: 'en' | 'zh') {
  if (locale === 'zh') {
    return {
      assignmentChecks: [
        '先观察每个字的结构和例词',
        '描第一格，再独立写完后面的格子',
        '圈出最难的一笔，下次先复习',
      ],
      assignmentDescription:
        '建议每个汉字先读拼音和例词，再慢慢书写。完成后把最容易写错的字加入下一次复习。',
      assignmentNoteCount: (count: number, limit: number) =>
        `${count}/${limit}`,
      assignmentNoteDescription:
        '写一句课堂说明、家庭作业要求或复习提醒，会显示在打印页和分享链接里。',
      assignmentNoteHint: '建议简短清楚，打印时更好读。',
      assignmentNoteLabel: '作业备注',
      assignmentNotePlaceholder: '例如：先描前三格，再独立完成后面的格子。',
      assignmentShareCta: '复制作业说明',
      assignmentShareMessage: ({
        assignmentNote,
        characters,
        reviewUrl,
        worksheetUrl,
      }: WorksheetAssignmentShareMessageParams) =>
        [
          'Lang Study 汉字练习作业',
          '',
          `本次练习：${characters.join(' ')}`,
          assignmentNote ? `作业要求：${assignmentNote}` : undefined,
          `打印练习纸：${worksheetUrl}`,
          `线上复习同一组：${reviewUrl}`,
          '',
          '建议流程：先观察字形和例词，描写提示格，再独立完成剩余格子。完成后圈出最难写的字，下次先复习。',
        ]
          .filter(Boolean)
          .join('\n'),
      assignmentShareSuccess: '作业说明已复制。',
      assignmentTitle: '练习任务',
      back: '返回练习',
      badge: '练习纸生成器',
      characterCount: (count: number) => `${count} 个汉字`,
      characterDetailsDescription:
        '开启时打印拼音、字义和例词；关闭时只保留字样本和书写格。',
      characterDetailsLabel: '显示参考信息',
      clearSelectionCta: '清空',
      customApplyCta: '使用自定义字表',
      customCharacterDescription: '自定义汉字，适合课堂、作业或个人复习。',
      customCharacterLabel: '自定义',
      customCount: (count: number, limit: number) =>
        `${count}/${limit} 个可打印汉字`,
      customHint: '先观察结构，再慢慢书写。',
      customMeaning: '自定义汉字',
      customOverflow: (count: number) => `${count} 个字将在 Pro 中解锁`,
      customPlaceholder: '粘贴汉字，例如：你好学习中文',
      customTitle: '粘贴自定义字表',
      dateLabel: '日期',
      description:
        '从免费 HSK1 入门组里选择汉字，生成一张干净的手写练习纸，适合自学、家长辅导和老师布置作业。',
      empty: '至少选择一个汉字来生成练习纸。',
      examplesLabel: '例词',
      feedbackChecks: ['选出最满意的一格', '圈出最难写的字', '写下下次复习字'],
      feedbackDescription:
        '完成后用这一栏做一次简短回收，老师、家长或学习者自己都能看见下一次该复习什么。',
      feedbackFields: ['最好的一格', '最难的字', '下次复习'],
      feedbackSectionDescription:
        '打印页底部加入完成反馈栏，适合老师批改、家长回收和自学订正。',
      feedbackSectionLabel: '显示完成反馈栏',
      feedbackTitle: '完成后反馈',
      footerSourcePrefix: '更多练习纸：',
      footerTip: '慢慢练：先描第一格，再尝试凭记忆书写。',
      freeBadge: '免费预览',
      freePreviewApplied: (limit: number) => `已保留前 ${limit} 个汉字。`,
      freePreviewLimitCta: (limit: number) => `保留前 ${limit} 个继续`,
      freePreviewLimitHint: (limit: number, overflow: number) =>
        `免费预览可以马上打印前 ${limit} 个汉字，其余 ${overflow} 个适合用 Pro 自定义字表继续生成。`,
      gridOption: (count: number) => `每字 ${count} 格`,
      handwritingAssignmentChecks: [
        '先描有提示的格子',
        '后面的格子独立完成',
        '最后挑一个最难写的字复习',
      ],
      handwritingAssignmentDescription:
        '这是一张干净的手写作业纸。请按顺序慢慢书写，保持每个字居中、大小一致。',
      nameLabel: '姓名',
      onlineReviewDescription:
        '纸面写完后，回到线上先复习同一组汉字，再处理圈出的难写字。',
      onlineReviewLinkLabel: '线上复习链接',
      onlineReviewTitle: '线上复习同一组',
      packCta: '查看完整套餐',
      packDescription:
        '完整版本将提供 HSK1 全量练习纸、自定义字表、答案提示和学生作业记录。',
      packFeatures: [
        '解锁完整 HSK1 字表和更多练习纸组合',
        '保存常用自定义字表，方便老师和家长重复布置',
        '围绕错字、复习和纸笔作业形成长期学习流程',
      ],
      packTitle: '完整练习纸套装',
      paperSizeLabel: '纸张大小',
      paperSizes: {
        a4: 'A4',
        a5: 'A5',
        legal: 'Legal',
        letter: 'Letter',
      },
      previewTitle: 'HSK1 汉字书写练习',
      practiceCta: '继续线上练习',
      printEmptyError: '请先选择至少一个汉字。',
      printCta: '打印练习纸',
      printFollowupCta: '复习这组汉字',
      printFollowupDescription:
        '纸面写完后，把圈出的难写字带回线上描写练习，优先处理同一组汉字。',
      printFollowupSteps: ['圈出难写字', '回到线上复习', '再打印错字纸'],
      printFollowupTitle: '打印后继续复习',
      printSettingsDescription:
        '这些设置会同步到打印预览和分享链接，适合不同打印机与作业场景。',
      printSettingsTitle: '打印设置',
      practiceBoxesLabel: '练习格数量',
      quickSetCount: (count: number) => `${count} 字`,
      quickSets: {
        foundations: {
          description: '先练结构最清楚、最适合第一次书写的基础字。',
          title: '基础象形字',
        },
        fullFree: {
          description: '把当前免费开放的 HSK1 入门字一次生成出来。',
          title: '全部免费字',
        },
        nature: {
          description: '适合用图像联想记住笔顺方向的一组字。',
          title: '自然字',
        },
        starter: {
          description: '适合第一节课、家庭作业或 10 分钟复习。',
          title: '入门 6 字',
        },
      },
      quickSetsDescription: '一键套用常用作业组合，再按需要微调。',
      quickSetsTitle: '快速练习包',
      recentAssignmentShareCta: '复制作业',
      recentClearCta: '清空最近',
      recentClearSuccess: '最近练习纸已清空。',
      recentRemoveLabel: '移除最近练习纸',
      recentRestoreCta: '恢复',
      recentRestoreSuccess: '已恢复最近练习纸。',
      recentSavedAt: (date: string) => `保存于 ${date}`,
      recentSetMeta: (
        gridCount: number,
        paperSize: string,
        traceMode: string,
        hasFeedback: boolean
      ) =>
        `${paperSize} · 每字 ${gridCount} 格 · ${traceMode}${
          hasFeedback ? ' · 含反馈栏' : ''
        }`,
      recentSetsDescription:
        '打印或复制链接后会保存在本机，方便下次继续布置同一组作业。',
      recentSetsTitle: '最近练习纸',
      recentShareCta: '复制链接',
      resetCta: '重置',
      removeCharacter: (character: string) => `移除 ${character}`,
      selectDescription:
        '完整 HSK1 套装将支持自定义字表、保存作业和更多打印格式。',
      selectTitle: '选择汉字',
      selectedCount: (count: number, limit: number) => `${count}/${limit}`,
      selectedDescription: (count: number, limit: number) =>
        `这张练习纸会打印 ${count} 个汉字，免费预览最多 ${limit} 个。`,
      selectedEmpty: '从上方选择汉字，或粘贴自定义字表。',
      selectedTitle: '当前练习纸',
      selectionLimit: (limit: number) => `免费预览最多选择 ${limit} 个汉字。`,
      shareCta: '复制练习纸链接',
      shareError: '复制失败，请稍后重试。',
      shareSuccess: '练习纸链接已复制。',
      sourceLabel: '生成来源',
      title: '打印中文汉字书写练习纸',
      traceModeDescription: '选择练习格里显示多少描写提示。',
      traceModeLabel: '描写辅助',
      traceModes: {
        blank: '空白挑战',
        first: '第一格',
        guided: '多描几格',
      },
    };
  }

  return {
    assignmentChecks: [
      'Read the shape cue and example words first',
      'Trace the first box, then write from memory',
      'Circle the hardest stroke for the next review',
    ],
    assignmentDescription:
      'Read each character aloud, study the structure, then write slowly. When finished, mark the characters that should come back in the next review session.',
    assignmentNoteCount: (count: number, limit: number) => `${count}/${limit}`,
    assignmentNoteDescription:
      'Add one classroom instruction, homework reminder, or review cue. It appears in the printout and share link.',
    assignmentNoteHint: 'Keep it short so the printed worksheet stays clean.',
    assignmentNoteLabel: 'Assignment note',
    assignmentNotePlaceholder:
      'Example: Trace the first three boxes, then write the rest from memory.',
    assignmentShareCta: 'Copy assignment message',
    assignmentShareMessage: ({
      assignmentNote,
      characters,
      reviewUrl,
      worksheetUrl,
    }: WorksheetAssignmentShareMessageParams) =>
      [
        'Lang Study character practice assignment',
        '',
        `Practice set: ${characters.join(' ')}`,
        assignmentNote ? `Assignment note: ${assignmentNote}` : undefined,
        `Printable worksheet: ${worksheetUrl}`,
        `Online review for the same set: ${reviewUrl}`,
        '',
        'Suggested flow: study the shape and example words, trace the guided boxes, then write the remaining boxes independently. Circle the hardest character so it comes back first next time.',
      ]
        .filter(Boolean)
        .join('\n'),
    assignmentShareSuccess: 'Assignment message copied.',
    assignmentTitle: 'Practice task',
    back: 'Back to practice',
    badge: 'Worksheet generator',
    characterCount: (count: number) => `${count} characters`,
    characterDetailsDescription:
      'Show pinyin, meaning, and examples for study sheets; turn off for a cleaner handwriting assignment.',
    characterDetailsLabel: 'Show reference info',
    clearSelectionCta: 'Clear selection',
    customApplyCta: 'Use custom list',
    customCharacterDescription:
      'Custom character for classroom, homework, or personal review.',
    customCharacterLabel: 'custom',
    customCount: (count: number, limit: number) =>
      `${count}/${limit} printable characters`,
    customHint: 'Study the structure first, then write slowly.',
    customMeaning: 'custom character',
    customOverflow: (count: number) => `${count} more unlock with Pro`,
    customPlaceholder: 'Paste characters, e.g. 你好学习中文',
    customTitle: 'Paste a custom list',
    dateLabel: 'Date',
    description:
      'Pick characters from the free HSK1 starter set and print a clean handwriting worksheet for self-study, tutoring, or classroom practice.',
    empty: 'Select at least one character to build a worksheet.',
    examplesLabel: 'Examples',
    feedbackChecks: [
      'Choose the best box',
      'Circle the hardest character',
      'Write the next review target',
    ],
    feedbackDescription:
      'Use this section after writing so teachers, parents, or self-study learners can decide what should come back next.',
    feedbackFields: ['Best box', 'Hardest character', 'Review next'],
    feedbackSectionDescription:
      'Add a completion section to the printout for grading, parent review, or self-correction.',
    feedbackSectionLabel: 'Show feedback section',
    feedbackTitle: 'After-practice feedback',
    footerSourcePrefix: 'Make more worksheets:',
    footerTip: 'Practice slowly: trace the first box, then write from memory.',
    freeBadge: 'Free preview',
    freePreviewApplied: (limit: number) =>
      `Kept the first ${limit} characters.`,
    freePreviewLimitCta: (limit: number) => `Keep first ${limit}`,
    freePreviewLimitHint: (limit: number, overflow: number) =>
      `The free preview can print the first ${limit} characters now. The remaining ${overflow} fit better in Pro custom lists.`,
    gridOption: (count: number) => `${count} per character`,
    handwritingAssignmentChecks: [
      'Trace the guided boxes first',
      'Finish the remaining boxes independently',
      'Choose one difficult character for review',
    ],
    handwritingAssignmentDescription:
      'This is a clean handwriting assignment sheet. Write slowly, keep each character centered, and use consistent size.',
    nameLabel: 'Name',
    onlineReviewDescription:
      'After paper practice, reopen the same character set online before reviewing circled hard characters.',
    onlineReviewLinkLabel: 'Online review link',
    onlineReviewTitle: 'Review the same set online',
    packCta: 'View complete pack',
    packDescription:
      'The complete version will unlock full HSK1 worksheets, custom character lists, answer prompts, and saved student assignments.',
    packFeatures: [
      'Unlock the full HSK1 character set and more worksheet combinations',
      'Save reusable custom lists for teachers, tutors, and parents',
      'Connect mistakes, review, and paper assignments into one routine',
    ],
    packTitle: 'Complete worksheet pack',
    paperSizeLabel: 'Paper size',
    paperSizes: {
      a4: 'A4',
      a5: 'A5',
      legal: 'Legal',
      letter: 'Letter',
    },
    previewTitle: 'HSK1 Chinese Character Practice',
    practiceCta: 'Continue online',
    printEmptyError: 'Select at least one character before printing.',
    printCta: 'Print worksheet',
    printFollowupCta: 'Review this set',
    printFollowupDescription:
      'After writing on paper, bring the hardest characters back into online tracing and review the same set first.',
    printFollowupSteps: [
      'Circle hard characters',
      'Review online',
      'Print a focused sheet',
    ],
    printFollowupTitle: 'Keep reviewing after print',
    printSettingsDescription:
      'These choices carry into print preview and shared worksheet links.',
    printSettingsTitle: 'Print settings',
    practiceBoxesLabel: 'Practice boxes',
    quickSetCount: (count: number) => `${count} chars`,
    quickSets: {
      foundations: {
        description:
          'Start with compact shapes that are easiest to write first.',
        title: 'Foundation shapes',
      },
      fullFree: {
        description:
          'Generate every currently available free HSK1 starter character.',
        title: 'All free characters',
      },
      nature: {
        description:
          'Use visual characters that make stroke direction easier to recall.',
        title: 'Nature shapes',
      },
      starter: {
        description: 'Good for a first class, homework, or 10-minute review.',
        title: 'Starter six',
      },
    },
    quickSetsDescription:
      'Apply a common assignment set, then adjust the worksheet if needed.',
    quickSetsTitle: 'Quick sets',
    recentAssignmentShareCta: 'Copy assignment',
    recentClearCta: 'Clear recent',
    recentClearSuccess: 'Recent worksheets cleared.',
    recentRemoveLabel: 'Remove recent worksheet',
    recentRestoreCta: 'Restore',
    recentRestoreSuccess: 'Recent worksheet restored.',
    recentSavedAt: (date: string) => `Saved ${date}`,
    recentSetMeta: (
      gridCount: number,
      paperSize: string,
      traceMode: string,
      hasFeedback: boolean
    ) =>
      `${paperSize} · ${gridCount} boxes · ${traceMode}${
        hasFeedback ? ' · feedback' : ''
      }`,
    recentSetsDescription:
      'Printing or copying a link saves the setup on this device so repeat assignments are faster.',
    recentSetsTitle: 'Recent worksheets',
    recentShareCta: 'Copy link',
    resetCta: 'Reset',
    removeCharacter: (character: string) => `Remove ${character}`,
    selectDescription:
      'The full HSK1 pack will support custom lists, saved assignments, and more printable formats.',
    selectTitle: 'Select characters',
    selectedCount: (count: number, limit: number) => `${count}/${limit}`,
    selectedDescription: (count: number, limit: number) =>
      `This worksheet will print ${count} characters. Free preview supports up to ${limit}.`,
    selectedEmpty: 'Select characters above, or paste a custom list.',
    selectedTitle: 'Current worksheet',
    selectionLimit: (limit: number) =>
      `Free preview supports up to ${limit} characters.`,
    shareCta: 'Copy worksheet link',
    shareError: 'Could not copy the link. Please try again.',
    shareSuccess: 'Worksheet link copied.',
    sourceLabel: 'Created with',
    title: 'Print Chinese character practice sheets',
    traceModeDescription: 'Choose how much help appears in the practice boxes.',
    traceModeLabel: 'Tracing guide',
    traceModes: {
      blank: 'Blank',
      first: 'First box',
      guided: 'Guided',
    },
  };
}

function createWorksheetQuickSets(
  characters: WorksheetCharacter[],
  copy: WorksheetCopy
): WorksheetQuickSet[] {
  const charactersByLesson = new Map<string, string[]>();

  for (const item of characters) {
    const lessonCharacters = charactersByLesson.get(item.lesson) ?? [];
    lessonCharacters.push(item.character);
    charactersByLesson.set(item.lesson, lessonCharacters);
  }

  return [
    {
      characters: characters
        .slice(0, STARTER_SET_SIZE)
        .map((item) => item.character),
      description: copy.quickSets.starter.description,
      id: 'starter',
      title: copy.quickSets.starter.title,
    },
    {
      characters: charactersByLesson.get('Foundations') ?? [],
      description: copy.quickSets.foundations.description,
      id: 'foundations',
      title: copy.quickSets.foundations.title,
    },
    {
      characters: charactersByLesson.get('Nature') ?? [],
      description: copy.quickSets.nature.description,
      id: 'nature',
      title: copy.quickSets.nature.title,
    },
    {
      characters: characters.map((item) => item.character),
      description: copy.quickSets.fullFree.description,
      id: 'full-free',
      title: copy.quickSets.fullFree.title,
    },
  ].filter((quickSet) => quickSet.characters.length > 0);
}

function buildPracticePrintUrl(characters: string[]) {
  if (characters.length === 0) return `${WORKSHEET_DOMAIN}${Routes.Learn}`;

  return [
    `${WORKSHEET_DOMAIN}${Routes.Learn}?character=${characters[0]}`,
    `characters=${characters.join(',')}`,
  ].join('&');
}

function buildWorksheetSharePath(config: WorksheetShareConfig) {
  const params = new URLSearchParams();

  for (const character of config.characters) {
    params.append('characters', character);
  }

  params.set('grid', String(config.gridCount));
  params.set('paper', config.paperSize);
  params.set('trace', config.traceMode);

  if (!config.showCharacterDetails) {
    params.set('details', 'off');
  }

  if (!config.showFeedbackSection) {
    params.set('feedback', 'off');
  }

  if (config.assignmentNote.length > 0) {
    params.set('note', config.assignmentNote);
  }

  return `${Routes.Worksheets}?${params.toString()}`;
}

function isSameSelection(current: string[], next: string[]) {
  return (
    current.length === next.length &&
    current.every((character, index) => character === next[index])
  );
}

function normalizeHanziCharacters(value = '') {
  return Array.from(value.matchAll(HANZI_CHARACTER_PATTERN)).reduce<string[]>(
    (characters, match) => {
      const character = match[0];
      if (!characters.includes(character)) {
        characters.push(character);
      }
      return characters;
    },
    []
  );
}

function createCustomWorksheetCharacter(
  character: string,
  copy: WorksheetCopy
): WorksheetCharacter {
  return {
    character,
    custom: true,
    examples: [],
    hint: copy.customHint,
    lesson: 'Foundations',
    lessonLabel: copy.customCharacterLabel,
    meaning: copy.customMeaning,
    pinyin: copy.customCharacterLabel,
    strokes: 0,
  };
}

function normalizeAssignmentNote(value = '') {
  return truncateWorksheetText(value.trim(), MAX_ASSIGNMENT_NOTE_LENGTH);
}

function truncateWorksheetText(value: string, limit: number) {
  return Array.from(value).slice(0, limit).join('');
}

function shouldShowTraceCharacter(index: number, traceMode: TraceMode) {
  if (traceMode === 'blank') {
    return false;
  }

  if (traceMode === 'guided') {
    return index < 3;
  }

  return index === 0;
}

function PracticeBox({ character }: { character?: string }) {
  return (
    <div
      className="relative aspect-square border border-slate-300"
      data-print-practice-box
    >
      <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-slate-200" />
      <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-slate-200" />
      <div className="absolute inset-0 flex items-center justify-center text-4xl font-semibold text-slate-300">
        {character}
      </div>
    </div>
  );
}
