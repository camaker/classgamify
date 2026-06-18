import { m } from '@/locale/paraglide/messages';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  getCourseStats,
  getFreeCharacters,
  type LessonCharacter,
} from '@/learn/hanzi-course';
import {
  getDisplayStrokeNumber,
  getHanziProgressSummary,
  getPracticeAgeDays,
  readStoredHanziProgress,
  writeStoredHanziProgress,
  type CharacterProgress,
  type HanziReviewItem,
  type NextPracticeTarget,
  type StoredProgress,
} from '@/learn/hanzi-progress';
import { getLocale } from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import {
  IconArrowRight,
  IconBook2,
  IconCheck,
  IconCircleCheck,
  IconClockHour4,
  IconCopy,
  IconFileText,
  IconLock,
  IconMailForward,
  IconPencil,
  IconPlayerPlay,
  IconReload,
  IconRotate,
  IconSparkles,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

const HANZI_WRITER_SCRIPT =
  'https://cdn.jsdelivr.net/npm/hanzi-writer@3.7.3/dist/hanzi-writer.min.js';
const HANZI_WRITER_SCRIPT_ID = 'hanzi-writer-cdn';

type HanziWriterStatus = 'idle' | 'loading' | 'ready' | 'animating' | 'quiz';

type HanziQuizStrokeData = {
  character: string;
  strokeNum: number;
  mistakesOnStroke: number;
  totalMistakes: number;
  strokesRemaining: number;
};

type HanziQuizSummaryData = {
  character: string;
  totalMistakes: number;
};

type HanziWriterInstance = {
  animateCharacter: (options?: { onComplete?: () => void }) => void;
  cancelQuiz?: () => void;
  quiz: (options?: {
    onMistake?: (strokeData: HanziQuizStrokeData) => void;
    onCorrectStroke?: (strokeData: HanziQuizStrokeData) => void;
    onComplete?: (summaryData: HanziQuizSummaryData) => void;
  }) => void;
};

type HanziWriterStatic = {
  create: (
    target: HTMLElement,
    character: string,
    options: Record<string, unknown>
  ) => HanziWriterInstance;
};

declare global {
  interface Window {
    HanziWriter?: HanziWriterStatic;
  }
}

let hanziWriterPromise: Promise<HanziWriterStatic> | null = null;

function loadHanziWriter() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Hanzi Writer only runs in the browser.'));
  }

  if (window.HanziWriter) {
    return Promise.resolve(window.HanziWriter);
  }

  if (hanziWriterPromise) {
    return hanziWriterPromise;
  }

  hanziWriterPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(
      HANZI_WRITER_SCRIPT_ID
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if (window.HanziWriter) resolve(window.HanziWriter);
        else reject(new Error('Hanzi Writer loaded without a global export.'));
      });
      existingScript.addEventListener('error', () => {
        reject(new Error('Could not load Hanzi Writer.'));
      });
      return;
    }

    const script = document.createElement('script');
    script.id = HANZI_WRITER_SCRIPT_ID;
    script.src = HANZI_WRITER_SCRIPT;
    script.async = true;
    script.onload = () => {
      if (window.HanziWriter) resolve(window.HanziWriter);
      else reject(new Error('Hanzi Writer loaded without a global export.'));
    };
    script.onerror = () => reject(new Error('Could not load Hanzi Writer.'));
    document.head.appendChild(script);
  });

  return hanziWriterPromise;
}

export function HanziPracticePage({
  initialCharacter,
  initialCharacters,
}: {
  initialCharacter?: string;
  initialCharacters?: string[];
}) {
  const currentLocale = getLocale() === 'zh' ? 'zh' : 'en';
  const copy = getPracticeCopy(currentLocale);
  const freeCharacters = useMemo(
    () => getFreeCharacters(currentLocale),
    [currentLocale]
  );
  const lessonCharacters = useMemo(() => {
    if (!initialCharacters?.length) return freeCharacters;

    const allowedCharacters = new Set(initialCharacters);
    const scopedCharacters = freeCharacters.filter((item) =>
      allowedCharacters.has(item.character)
    );

    return scopedCharacters.length > 0 ? scopedCharacters : freeCharacters;
  }, [freeCharacters, initialCharacters]);
  const scopeLabel =
    initialCharacters?.length && lessonCharacters.length < freeCharacters.length
      ? lessonCharacters[0]?.lessonLabel
      : undefined;
  const courseStats = useMemo(() => getCourseStats(), []);
  const initialIndex = Math.max(
    lessonCharacters.findIndex((item) => item.character === initialCharacter),
    0
  );
  const autoSelectedScopeRef = useRef<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [progress, setProgress] = useState<StoredProgress>({});
  const currentCharacter = lessonCharacters[currentIndex];
  const lessonScopeKey = lessonCharacters
    .map((item) => item.character)
    .join('');
  const progressSummary = useMemo(
    () => getHanziProgressSummary(lessonCharacters, progress),
    [lessonCharacters, progress]
  );

  useEffect(() => {
    setProgress(readStoredHanziProgress());
    setProgressLoaded(true);
  }, []);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (
      !progressLoaded ||
      initialCharacter ||
      autoSelectedScopeRef.current === lessonScopeKey
    ) {
      return;
    }

    autoSelectedScopeRef.current = lessonScopeKey;
    const resumeTarget =
      progressSummary.reviewItems[0] ?? progressSummary.nextPracticeTarget;
    if (!resumeTarget) return;

    setCurrentIndex(resumeTarget.index);
  }, [initialCharacter, lessonScopeKey, progressLoaded, progressSummary]);

  useEffect(() => {
    setCurrentIndex((index) =>
      Math.min(index, Math.max(lessonCharacters.length - 1, 0))
    );
  }, [lessonCharacters.length]);

  const saveProgress = useCallback(
    (character: string, nextProgress: CharacterProgress) => {
      setProgress((previous) => {
        const updated = {
          ...previous,
          [character]: nextProgress,
        };
        writeStoredHanziProgress(updated);
        return updated;
      });
    },
    []
  );

  const resetLesson = useCallback(() => {
    setCurrentIndex(initialIndex);
    setProgress((previous) => {
      const charactersToReset = new Set(
        lessonCharacters.map((item) => item.character)
      );
      const updated: StoredProgress = {};

      for (const [character, itemProgress] of Object.entries(previous)) {
        if (!charactersToReset.has(character)) {
          updated[character] = itemProgress;
        }
      }

      writeStoredHanziProgress(updated);
      return updated;
    });
  }, [initialIndex, lessonCharacters]);

  const goToNext = useCallback(() => {
    setCurrentIndex((index) =>
      Math.min(index + 1, lessonCharacters.length - 1)
    );
  }, [lessonCharacters.length]);

  const worksheetCharacters = useMemo(
    () =>
      lessonCharacters
        .filter((item) => !item.premium)
        .map((item) => item.character),
    [lessonCharacters]
  );
  const worksheetSearch = {
    characters: worksheetCharacters,
    details: true,
    note: copy.summaryWorksheetNote,
    trace: progressSummary.reviewCharacters.length > 0 ? 'guided' : 'first',
  } as const;
  const practiceSharePath = useMemo(() => {
    const params = new URLSearchParams();

    if (currentCharacter?.character) {
      params.set('character', currentCharacter.character);
    }

    for (const item of lessonCharacters) {
      params.append('characters', item.character);
    }

    const search = params.toString();
    return search ? `${Routes.Learn}?${search}` : Routes.Learn;
  }, [currentCharacter?.character, lessonCharacters]);
  const copyPracticeLink = useCallback(async () => {
    if (
      typeof window === 'undefined' ||
      !window.navigator.clipboard?.writeText
    ) {
      toast.error(copy.shareError);
      return;
    }

    const url = new URL(practiceSharePath, window.location.origin).toString();

    try {
      await window.navigator.clipboard.writeText(url);
      toast.success(copy.shareSuccess);
    } catch {
      toast.error(copy.shareError);
    }
  }, [copy.shareError, copy.shareSuccess, practiceSharePath]);

  return (
    <section className="min-h-[calc(100vh-12rem)] bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
          <div className="flex min-w-0 flex-col gap-5">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-primary/30">
                  {copy.badge}
                </Badge>
                <Badge variant="secondary">
                  {copy.freeBadge(lessonCharacters.length)}
                </Badge>
                {progressSummary.reviewCharacters.length > 0 ? (
                  <Badge variant="outline" className="border-amber-500/40">
                    <IconRotate className="size-3.5" />
                    {copy.reviewBadge(progressSummary.reviewCharacters.length)}
                  </Badge>
                ) : null}
              </div>
              <div className="space-y-3">
                <h1 className="text-balance text-3xl font-semibold tracking-normal sm:text-4xl">
                  {copy.title}
                </h1>
                <p className="max-w-2xl text-base text-muted-foreground">
                  {copy.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  to={Routes.Hsk1}
                  className={cn(buttonVariants({ variant: 'outline' }))}
                >
                  <IconBook2 className="size-4" />
                  {copy.courseCta}
                </Link>
                <Link
                  to={Routes.Worksheets}
                  search={worksheetSearch}
                  className={buttonVariants()}
                >
                  <IconFileText className="size-4" />
                  {copy.worksheetCta}
                </Link>
                <Button
                  type="button"
                  variant="outline"
                  onClick={copyPracticeLink}
                >
                  <IconCopy className="size-4" />
                  {copy.sharePracticeCta}
                </Button>
                <Link
                  to={Routes.Pricing}
                  className={cn(buttonVariants({ variant: 'outline' }))}
                >
                  <IconSparkles className="size-4" />
                  {copy.packCta}
                </Link>
              </div>
            </div>

            <Card className="min-w-0 rounded-lg">
              <CardHeader>
                <CardTitle>{copy.courseTitle}</CardTitle>
                <CardDescription>
                  {m.learn_progress_description({
                    completed: progressSummary.completedCount,
                    total: lessonCharacters.length,
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={progressSummary.progressValue} />
                <div className="grid grid-cols-5 gap-2">
                  {lessonCharacters.map((item, index) => {
                    const itemProgress = progress[item.character];
                    const done = itemProgress?.completed;
                    const needsReview = done && itemProgress.mistakes > 0;
                    const active = index === currentIndex;
                    return (
                      <button
                        type="button"
                        key={item.character}
                        onClick={() => setCurrentIndex(index)}
                        className={cn(
                          'flex aspect-[5/4] flex-col items-center justify-center gap-1 rounded-lg border bg-card text-center transition-colors',
                          'hover:border-primary/50 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          active && 'border-primary bg-primary/5',
                          done &&
                            !needsReview &&
                            'border-emerald-500/40 bg-emerald-500/10',
                          needsReview && 'border-amber-500/40 bg-amber-500/10'
                        )}
                      >
                        <span className="text-3xl font-semibold leading-none">
                          {item.character}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {needsReview
                            ? copy.progressNeedsReview
                            : done
                              ? m.learn_done()
                              : item.pinyin}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <ProgressLegend copy={copy} />
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={resetLesson}>
                    <IconReload className="size-4" />
                    {m.learn_reset()}
                  </Button>
                  {progressSummary.lessonComplete ? (
                    <Badge
                      variant="secondary"
                      className="h-8 rounded-lg px-3 text-sm"
                    >
                      <IconCircleCheck className="size-4" />
                      {m.learn_lesson_complete_badge()}
                    </Badge>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <LearningLoopCard
              completedCount={progressSummary.completedCount}
              copy={copy}
              nextPracticeTarget={progressSummary.nextPracticeTarget}
              onSelect={(index) => setCurrentIndex(index)}
              reviewCharacters={progressSummary.reviewCharacters}
              reviewItems={progressSummary.reviewItems}
              scopeLabel={scopeLabel}
              total={lessonCharacters.length}
              worksheetCharacters={worksheetCharacters}
            />

            <ReviewQueueCard
              cleanCount={progressSummary.cleanCount}
              copy={copy}
              onSelect={(index) => setCurrentIndex(index)}
              reviewCharacters={progressSummary.reviewCharacters}
              reviewItems={progressSummary.reviewItems}
              total={lessonCharacters.length}
            />

            <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {lessonCharacters.map((item) => (
                <div
                  key={item.character}
                  className="min-w-0 rounded-lg border bg-muted/30 p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-2xl font-semibold">
                      {item.character}
                    </span>
                    {progress[item.character]?.completed ? (
                      progress[item.character]?.mistakes ? (
                        <Badge
                          variant="outline"
                          className="rounded-md border-amber-500/40 text-amber-700 dark:text-amber-300"
                        >
                          <IconRotate className="size-3.5" />
                          {copy.progressNeedsReview}
                        </Badge>
                      ) : (
                        <IconCheck className="size-4 text-emerald-600" />
                      )
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {item.strokes}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium">{item.meaning}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.hint}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {item.examples.map((example) => (
                      <Badge
                        key={example}
                        variant="outline"
                        className="rounded-md"
                      >
                        {example}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Card className="min-w-0 rounded-lg border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="rounded-lg bg-background p-2 ring-1 ring-border">
                    <IconBook2 className="size-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base">
                      {copy.packTitle}
                    </CardTitle>
                    <CardDescription>{copy.packDescription}</CardDescription>
                  </div>
                  <Link
                    to={Routes.Pricing}
                    className={cn(buttonVariants(), 'w-fit shrink-0')}
                  >
                    <IconSparkles className="size-4" />
                    {copy.packCta}
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-3">
                  {[
                    copy.statCharacters(courseStats.total),
                    copy.statStrokes(courseStats.strokes),
                    copy.statWorksheets,
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-lg border bg-background/80 p-3 text-sm"
                    >
                      {item}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-3">
                  {copy.packFeatures.map((feature) => (
                    <div
                      key={feature}
                      className="rounded-lg border bg-background/70 p-3 text-sm leading-6 text-muted-foreground"
                    >
                      {feature}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <HanziPracticeCard
            key={currentCharacter.character}
            character={currentCharacter}
            copy={copy}
            currentIndex={currentIndex}
            total={lessonCharacters.length}
            progress={progress[currentCharacter.character]}
            lessonComplete={progressSummary.lessonComplete}
            onComplete={(nextProgress) =>
              saveProgress(currentCharacter.character, nextProgress)
            }
            onNext={goToNext}
            onReset={resetLesson}
            scopeLabel={scopeLabel}
            worksheetCharacters={worksheetCharacters}
          />
        </div>
      </div>
    </section>
  );
}

type HanziPracticeCardProps = {
  character: LessonCharacter;
  copy: ReturnType<typeof getPracticeCopy>;
  currentIndex: number;
  total: number;
  progress?: CharacterProgress;
  lessonComplete: boolean;
  onComplete: (progress: CharacterProgress) => void;
  onNext: () => void;
  onReset: () => void;
  scopeLabel?: string;
  worksheetCharacters: string[];
};

function ProgressLegend({
  copy,
}: {
  copy: ReturnType<typeof getPracticeCopy>;
}) {
  const items = [
    {
      className: 'border-border bg-card',
      label: copy.progressNotStarted,
    },
    {
      className: 'border-emerald-500/40 bg-emerald-500/10',
      label: copy.reviewCleanLabel,
    },
    {
      className: 'border-amber-500/40 bg-amber-500/10',
      label: copy.progressNeedsReview,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="inline-flex h-7 items-center gap-2 rounded-md border bg-background px-2.5 text-xs text-muted-foreground"
        >
          <span className={cn('size-2.5 rounded-sm border', item.className)} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function HanziPracticeCard({
  character,
  copy,
  currentIndex,
  total,
  progress,
  lessonComplete,
  onComplete,
  onNext,
  onReset,
  scopeLabel,
  worksheetCharacters,
}: HanziPracticeCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriterInstance | null>(null);
  const mistakesRef = useRef(0);
  const mistakeStrokesRef = useRef<number[]>([]);
  const correctStrokesRef = useRef(0);
  const [status, setStatus] = useState<HanziWriterStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [sessionStats, setSessionStats] = useState<CharacterProgress | null>(
    null
  );

  const initializeWriter = useCallback(async () => {
    if (!targetRef.current) return;

    setStatus('loading');
    setError(null);
    setSessionStats(null);

    try {
      const HanziWriter = await loadHanziWriter();
      if (!targetRef.current) return;

      targetRef.current.innerHTML = '';
      const width = containerRef.current?.clientWidth ?? 320;
      const size = Math.max(240, Math.min(width, 340));
      writerRef.current = HanziWriter.create(
        targetRef.current,
        character.character,
        {
          delayBetweenStrokes: 280,
          drawingColor: '#0f172a',
          height: size,
          highlightColor: '#0ea5e9',
          outlineColor: '#94a3b8',
          padding: 16,
          radicalColor: '#10b981',
          showCharacter: false,
          showOutline: true,
          strokeAnimationSpeed: 1,
          strokeColor: '#0f172a',
          width: size,
        }
      );
      setStatus('ready');
    } catch {
      setError(m.learn_writer_error());
      setStatus('idle');
    }
  }, [character.character]);

  useEffect(() => {
    initializeWriter();

    return () => {
      writerRef.current?.cancelQuiz?.();
      writerRef.current = null;
    };
  }, [initializeWriter]);

  const animateCharacter = useCallback(() => {
    if (!writerRef.current) return;
    writerRef.current.cancelQuiz?.();
    setStatus('animating');
    setSessionStats(null);
    writerRef.current.animateCharacter({
      onComplete: () => setStatus('ready'),
    });
  }, []);

  const startQuiz = useCallback(() => {
    if (!writerRef.current) return;

    mistakesRef.current = 0;
    mistakeStrokesRef.current = [];
    correctStrokesRef.current = 0;
    setStatus('quiz');
    setSessionStats(null);

    writerRef.current.quiz({
      onMistake: (strokeData) => {
        mistakesRef.current = strokeData.totalMistakes;
        mistakeStrokesRef.current = Array.from(
          new Set([...mistakeStrokesRef.current, strokeData.strokeNum])
        );
      },
      onCorrectStroke: () => {
        correctStrokesRef.current += 1;
      },
      onComplete: (summaryData) => {
        const nextProgress = {
          completed: true,
          completedAt: new Date().toISOString(),
          correctStrokes: correctStrokesRef.current,
          mistakeStrokes: mistakeStrokesRef.current,
          mistakes: summaryData.totalMistakes,
        };
        setStatus('ready');
        setSessionStats(nextProgress);
        onComplete(nextProgress);
      },
    });
  }, [onComplete]);

  const completed = progress?.completed;
  const needsReview = completed && progress.mistakes > 0;
  const lastStats = sessionStats ?? progress;
  const isLastCharacter = currentIndex === total - 1;
  const completionSummary = scopeLabel
    ? copy.scopedSummary(scopeLabel)
    : copy.summary;
  const completionWorksheetSearch = buildWorksheetSearch(worksheetCharacters, {
    details: true,
    note: scopeLabel
      ? copy.scopedWorksheetNote(scopeLabel)
      : copy.loopWorksheetNote,
    trace: 'first',
  });
  const currentReviewWorksheetSearch = buildWorksheetSearch(
    [character.character],
    {
      details: true,
      note: copy.characterReviewWorksheetNote(
        character.character,
        lastStats?.mistakeStrokes ?? []
      ),
      trace: 'guided',
    }
  );

  return (
    <Card className="min-w-0 rounded-lg">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardDescription>
              {m.learn_step_label({
                current: currentIndex + 1,
                total,
              })}
            </CardDescription>
            <CardTitle className="mt-1 text-2xl">
              {m.learn_practice_title({
                character: character.character,
                pinyin: character.pinyin,
              })}
            </CardTitle>
          </div>
          {completed ? (
            <Badge
              variant={needsReview ? 'outline' : 'secondary'}
              className={cn(
                'h-7 rounded-lg px-2.5',
                needsReview &&
                  'border-amber-500/40 text-amber-700 dark:text-amber-300'
              )}
            >
              {needsReview ? (
                <IconRotate className="size-4" />
              ) : (
                <IconCheck className="size-4" />
              )}
              {needsReview ? copy.progressNeedsReview : m.learn_done()}
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="flex size-18 items-center justify-center rounded-lg bg-background text-5xl font-semibold shadow-sm ring-1 ring-border">
              {character.character}
            </div>
            <div>
              <p className="text-sm font-medium">
                {character.meaning} · {character.pinyin}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {character.hint}
              </p>
            </div>
          </div>
        </div>

        <div
          ref={containerRef}
          className="flex min-h-[280px] items-center justify-center rounded-lg border bg-background p-3"
        >
          {error ? (
            <div className="max-w-sm text-center text-sm text-destructive">
              {error}
            </div>
          ) : (
            <div ref={targetRef} className="size-[min(340px,100%)]" />
          )}
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            onClick={animateCharacter}
            disabled={status === 'loading' || status === 'animating'}
          >
            <IconPlayerPlay className="size-4" />
            {status === 'animating'
              ? m.learn_animating()
              : m.learn_watch_strokes()}
          </Button>
          <Button
            type="button"
            onClick={startQuiz}
            disabled={status === 'loading' || status === 'animating'}
          >
            <IconPencil className="size-4" />
            {m.learn_start_quiz()}
          </Button>
        </div>

        {status === 'quiz' ? (
          <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 p-3 text-sm text-sky-950 dark:text-sky-100">
            {m.learn_quiz_active()}
          </div>
        ) : null}

        {lastStats?.completed ? (
          <div
            className={cn(
              'rounded-lg border p-4',
              lastStats.mistakes > 0
                ? 'border-amber-500/30 bg-amber-500/10'
                : 'border-emerald-500/30 bg-emerald-500/10'
            )}
          >
            <div className="flex items-start gap-3">
              {lastStats.mistakes > 0 ? (
                <IconRotate className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-300" />
              ) : (
                <IconCircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {lastStats.mistakes > 0
                    ? copy.characterNeedsReview
                    : m.learn_character_complete()}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {m.learn_character_stats({
                    mistakes: lastStats.mistakes,
                    strokes: character.strokes,
                  })}
                </p>
              </div>
            </div>
            <StrokeFeedback copy={copy} progress={lastStats} />
            <PracticeSessionRecap
              copy={copy}
              isLastCharacter={isLastCharacter}
              lessonComplete={lessonComplete}
              progress={lastStats}
            />
            <PracticeCompletionActions
              character={character}
              completionWorksheetSearch={completionWorksheetSearch}
              copy={copy}
              currentReviewWorksheetSearch={currentReviewWorksheetSearch}
              isLastCharacter={isLastCharacter}
              lessonComplete={lessonComplete}
              onNext={onNext}
              onReset={onReset}
              onRetry={startQuiz}
              progress={lastStats}
            />
          </div>
        ) : null}

        {lessonComplete ? (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
            <p className="font-medium">{m.learn_summary_title()}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {completionSummary}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {scopeLabel ? (
                <Link to={Routes.Hsk1} className={buttonVariants()}>
                  <IconBook2 className="size-4" />
                  {copy.backToCourseCta}
                </Link>
              ) : (
                <Link to={Routes.Pricing} className={buttonVariants()}>
                  <IconLock className="size-4" />
                  {copy.seePackCta}
                </Link>
              )}
              <Link
                to={Routes.Worksheets}
                search={completionWorksheetSearch}
                className={cn(buttonVariants({ variant: 'outline' }))}
              >
                <IconFileText className="size-4" />
                {copy.makeWorksheetCta}
              </Link>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function PracticeSessionRecap({
  copy,
  isLastCharacter,
  lessonComplete,
  progress,
}: {
  copy: ReturnType<typeof getPracticeCopy>;
  isLastCharacter: boolean;
  lessonComplete: boolean;
  progress: CharacterProgress;
}) {
  const hasMistakes = progress.mistakes > 0;
  const items = [
    {
      label: copy.sessionRecapResultLabel,
      value: copy.sessionRecapResult(progress.mistakes),
    },
    {
      label: copy.sessionRecapNextLabel,
      value: copy.sessionRecapNext(
        hasMistakes,
        isLastCharacter,
        lessonComplete
      ),
    },
    {
      label: copy.sessionRecapTimingLabel,
      value: copy.sessionRecapTiming(hasMistakes, lessonComplete),
    },
  ];

  return (
    <div className="mt-4 rounded-lg border bg-background/70 p-3">
      <div className="flex items-start gap-3">
        {hasMistakes ? (
          <IconRotate className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-300" />
        ) : (
          <IconCircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{copy.sessionRecapTitle}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {copy.sessionRecapDescription(hasMistakes, lessonComplete)}
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.label}
                className="rounded-md border bg-muted/30 px-3 py-2"
              >
                <p className="text-[11px] font-medium uppercase text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-1 text-xs leading-5">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-md border bg-primary/5 px-3 py-2">
            <div className="flex items-start gap-2">
              <IconClockHour4 className="mt-0.5 size-3.5 shrink-0 text-primary" />
              <div>
                <p className="text-xs font-medium">
                  {copy.sessionRecapReminderLabel}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {copy.sessionRecapReminder(
                    hasMistakes,
                    isLastCharacter,
                    lessonComplete
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PracticeCompletionActions({
  character,
  completionWorksheetSearch,
  copy,
  currentReviewWorksheetSearch,
  isLastCharacter,
  lessonComplete,
  onNext,
  onReset,
  onRetry,
  progress,
}: {
  character: LessonCharacter;
  completionWorksheetSearch: ReturnType<typeof buildWorksheetSearch>;
  copy: ReturnType<typeof getPracticeCopy>;
  currentReviewWorksheetSearch: ReturnType<typeof buildWorksheetSearch>;
  isLastCharacter: boolean;
  lessonComplete: boolean;
  onNext: () => void;
  onReset: () => void;
  onRetry: () => void;
  progress: CharacterProgress;
}) {
  const hasMistakes = progress.mistakes > 0;
  const worksheetSearch = hasMistakes
    ? currentReviewWorksheetSearch
    : completionWorksheetSearch;
  const title = hasMistakes
    ? copy.completionReviewTitle
    : lessonComplete
      ? copy.completionLessonTitle
      : copy.completionCleanTitle;
  const description = hasMistakes
    ? copy.completionReviewDescription
    : lessonComplete
      ? copy.completionLessonDescription
      : copy.completionCleanDescription;
  const copyResult = async () => {
    if (
      typeof window === 'undefined' ||
      !window.navigator.clipboard?.writeText
    ) {
      toast.error(copy.shareError);
      return;
    }

    const worksheetUrl = new URL(
      buildWorksheetPath(worksheetSearch),
      window.location.origin
    ).toString();
    const message = copy.characterResultShareMessage({
      character,
      isLastCharacter,
      lessonComplete,
      progress,
      worksheetUrl,
    });

    try {
      await window.navigator.clipboard.writeText(message);
      toast.success(copy.characterResultShareSuccess);
    } catch {
      toast.error(copy.shareError);
    }
  };
  const copyAssignment = async () => {
    if (
      typeof window === 'undefined' ||
      !window.navigator.clipboard?.writeText
    ) {
      toast.error(copy.shareError);
      return;
    }

    const practiceUrl = new URL(
      buildPracticePath(character.character, worksheetSearch.characters),
      window.location.origin
    ).toString();
    const worksheetUrl = new URL(
      buildWorksheetPath(worksheetSearch),
      window.location.origin
    ).toString();
    const message = copy.characterAssignmentShareMessage({
      character,
      isLastCharacter,
      lessonComplete,
      practiceUrl,
      progress,
      worksheetUrl,
    });

    try {
      await window.navigator.clipboard.writeText(message);
      toast.success(copy.characterAssignmentShareSuccess);
    } catch {
      toast.error(copy.shareError);
    }
  };

  if (hasMistakes) {
    return (
      <div className="mt-4 border-t border-amber-500/20 pt-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-md bg-amber-500/10 p-1.5 text-amber-600 dark:text-amber-300">
            <IconRotate className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{title}</p>
            <p className="mt-1 max-w-[34rem] text-xs leading-5 text-muted-foreground">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Button type="button" className="w-full" onClick={onRetry}>
            <IconRotate className="size-4" />
            {copy.completionRetryCta}
          </Button>
          <Link
            to={Routes.Worksheets}
            search={currentReviewWorksheetSearch}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'w-full bg-background/80'
            )}
          >
            <IconFileText className="size-4" />
            {copy.characterReviewWorksheetCta}
          </Link>
        </div>

        <div className="mt-3 border-t border-amber-500/20 pt-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              type="button"
              variant="outline"
              className="w-full bg-background/70 sm:w-auto"
              onClick={copyResult}
            >
              <IconCopy className="size-4" />
              {copy.characterResultShareCta}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full bg-background/70 sm:w-auto"
              onClick={copyAssignment}
            >
              <IconMailForward className="size-4" />
              {copy.characterAssignmentShareCta}
            </Button>
            {lessonComplete ? (
              <Button
                type="button"
                variant="outline"
                className="w-full bg-background/70 sm:w-auto"
                onClick={onReset}
              >
                <IconReload className="size-4" />
                {m.learn_restart_lesson()}
              </Button>
            ) : !isLastCharacter ? (
              <Button
                type="button"
                variant="outline"
                className="w-full bg-background/70 sm:w-auto"
                onClick={onNext}
              >
                <IconArrowRight className="size-4" />
                {m.learn_next_character()}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 border-t border-border/70 pt-4">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={copyResult}
        >
          <IconCopy className="size-4" />
          {copy.characterResultShareCta}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={copyAssignment}
        >
          <IconMailForward className="size-4" />
          {copy.characterAssignmentShareCta}
        </Button>
        {lessonComplete ? (
          <Button type="button" className="w-full sm:w-auto" onClick={onReset}>
            <IconReload className="size-4" />
            {m.learn_restart_lesson()}
          </Button>
        ) : !isLastCharacter ? (
          <Button type="button" className="w-full sm:w-auto" onClick={onNext}>
            <IconArrowRight className="size-4" />
            {m.learn_next_character()}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={onRetry}
        >
          <IconRotate className="size-4" />
          {m.learn_practice_again()}
        </Button>
        <Link
          to={Routes.Worksheets}
          search={completionWorksheetSearch}
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'w-full sm:w-auto'
          )}
        >
          <IconFileText className="size-4" />
          {copy.completionPrintSetCta}
        </Link>
      </div>
    </div>
  );
}

function StrokeFeedback({
  copy,
  progress,
}: {
  copy: ReturnType<typeof getPracticeCopy>;
  progress: CharacterProgress;
}) {
  const mistakeStrokes = progress.mistakeStrokes ?? [];

  return (
    <div
      className={cn(
        'mt-4 rounded-lg border bg-background/70 p-3',
        mistakeStrokes.length > 0
          ? 'border-amber-500/30'
          : 'border-emerald-500/30'
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium">
            {mistakeStrokes.length > 0
              ? copy.strokeFeedbackTitle
              : copy.strokeCleanTitle}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {mistakeStrokes.length > 0
              ? copy.strokeFeedbackDescription
              : copy.strokeCleanDescription}
          </p>
        </div>
        {mistakeStrokes.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {mistakeStrokes.map((stroke) => (
              <Badge key={stroke} variant="outline" className="rounded-md">
                {copy.strokeNumber(getDisplayStrokeNumber(stroke))}
              </Badge>
            ))}
          </div>
        ) : (
          <Badge variant="secondary" className="w-fit rounded-md">
            <IconCircleCheck className="size-3.5" />
            {copy.strokeCleanBadge}
          </Badge>
        )}
      </div>
    </div>
  );
}

function LearningLoopCard({
  completedCount,
  copy,
  nextPracticeTarget,
  onSelect,
  reviewCharacters,
  reviewItems,
  scopeLabel,
  total,
  worksheetCharacters,
}: {
  completedCount: number;
  copy: ReturnType<typeof getPracticeCopy>;
  nextPracticeTarget?: NextPracticeTarget;
  onSelect: (index: number) => void;
  reviewCharacters: string[];
  reviewItems: HanziReviewItem[];
  scopeLabel?: string;
  total: number;
  worksheetCharacters: string[];
}) {
  const firstReview = reviewItems[0];
  const worksheetSearch =
    reviewItems.length > 0
      ? buildWorksheetSearch(reviewCharacters, {
          details: true,
          note: copy.reviewWorksheetNote(reviewCharacters.length),
          trace: 'guided',
        })
      : buildWorksheetSearch(worksheetCharacters, {
          details: true,
          note: scopeLabel
            ? copy.scopedWorksheetNote(scopeLabel)
            : copy.loopWorksheetNote,
          trace: 'first',
        });
  const primaryAction = firstReview
    ? {
        description: copy.loopReviewDescription(
          firstReview.character.character,
          firstReview.progress.mistakes
        ),
        label: copy.loopReviewCta,
        onClick: () => onSelect(firstReview.index),
      }
    : nextPracticeTarget
      ? {
          description: copy.loopNextDescription(
            nextPracticeTarget.character.character,
            nextPracticeTarget.character.pinyin
          ),
          label: copy.loopNextCta,
          onClick: () => onSelect(nextPracticeTarget.index),
        }
      : undefined;

  return (
    <Card className="rounded-lg border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-background p-2 ring-1 ring-border">
            <IconArrowRight className="size-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">{copy.loopTitle}</CardTitle>
            <CardDescription>
              {copy.loopDescription(completedCount, total)}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="min-w-0">
          <p className="text-sm font-medium">
            {primaryAction?.description ??
              (scopeLabel
                ? copy.loopScopedCompleteDescription(scopeLabel)
                : copy.loopCompleteDescription)}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {reviewItems.length > 0
              ? copy.loopReviewHint(reviewItems.length)
              : copy.loopWorksheetHint}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          {primaryAction ? (
            <Button type="button" onClick={primaryAction.onClick}>
              <IconPencil className="size-4" />
              {primaryAction.label}
            </Button>
          ) : null}
          <Link
            to={Routes.Worksheets}
            search={worksheetSearch}
            className={cn(buttonVariants({ variant: 'outline' }))}
          >
            <IconFileText className="size-4" />
            {reviewCharacters.length > 0
              ? copy.loopReviewWorksheetCta
              : copy.loopWorksheetCta}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewQueueCard({
  cleanCount,
  copy,
  onSelect,
  reviewCharacters,
  reviewItems,
  total,
}: {
  cleanCount: number;
  copy: ReturnType<typeof getPracticeCopy>;
  onSelect: (index: number) => void;
  reviewCharacters: string[];
  reviewItems: HanziReviewItem[];
  total: number;
}) {
  const firstReview = reviewItems[0];
  const priorityCount = reviewItems.filter((item) =>
    ['overdue', 'unscheduled'].includes(item.urgency)
  ).length;
  const dueCount = reviewItems.filter((item) => item.urgency === 'due').length;
  const freshCount = reviewItems.filter(
    (item) => item.urgency === 'fresh'
  ).length;
  const reviewWorksheetSearch = buildWorksheetSearch(reviewCharacters, {
    details: true,
    note: copy.reviewWorksheetNote(reviewCharacters.length),
    trace: 'guided',
  });

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconRotate className="size-5 text-primary" />
          {copy.reviewTitle}
        </CardTitle>
        <CardDescription>{copy.reviewDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="text-2xl font-semibold">{priorityCount}</div>
            <div className="mt-1 text-muted-foreground">
              {copy.reviewPriorityLabel}
            </div>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="text-2xl font-semibold">{dueCount}</div>
            <div className="mt-1 text-muted-foreground">
              {copy.reviewDueLabel}
            </div>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="text-2xl font-semibold">{freshCount}</div>
            <div className="mt-1 text-muted-foreground">
              {copy.reviewFreshLabel}
            </div>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="text-2xl font-semibold">
              {cleanCount}/{total}
            </div>
            <div className="mt-1 text-muted-foreground">
              {copy.reviewCleanLabel}
            </div>
          </div>
        </div>

        {reviewItems.length > 0 ? (
          <>
            {firstReview ? (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="text-sm font-medium">{copy.reviewPlanTitle}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {copy.reviewPlanDescription(
                    firstReview.character.character,
                    firstReview.urgency,
                    priorityCount
                  )}
                </p>
              </div>
            ) : null}
            <div className="space-y-2">
              {reviewItems.slice(0, 4).map((item) => {
                const mistakeStrokes = item.progress.mistakeStrokes ?? [];

                return (
                  <button
                    key={item.character.character}
                    type="button"
                    onClick={() => onSelect(item.index)}
                    className={cn(
                      'flex w-full flex-col gap-3 rounded-lg border',
                      'bg-background p-3 text-left transition-colors',
                      'hover:border-primary/50 hover:bg-muted/40',
                      'focus-visible:outline-none focus-visible:ring-2',
                      'focus-visible:ring-ring sm:flex-row sm:items-center',
                      'sm:justify-between'
                    )}
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border bg-muted text-3xl font-semibold">
                        {item.character.character}
                      </div>
                      <div className="min-w-0 space-y-2">
                        <div>
                          <div className="font-medium">
                            {item.character.pinyin} · {item.character.meaning}
                          </div>
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            {copy.reviewFreshness(item.progress.completedAt)}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <Badge
                            variant="outline"
                            className={cn(
                              'rounded-md',
                              item.urgency === 'overdue' &&
                                'border-red-500/40 text-red-700 dark:text-red-300',
                              item.urgency === 'due' &&
                                'border-amber-500/40 text-amber-700 dark:text-amber-300'
                            )}
                          >
                            {copy.reviewUrgency[item.urgency]}
                          </Badge>
                          {mistakeStrokes.length > 0 ? (
                            mistakeStrokes.map((stroke) => (
                              <Badge
                                key={`${item.character.character}-${stroke}`}
                                variant="secondary"
                                className="rounded-md"
                              >
                                {copy.strokeNumber(
                                  getDisplayStrokeNumber(stroke)
                                )}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="outline" className="rounded-md">
                              {copy.reviewFullTraceBadge}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="w-fit shrink-0 rounded-md sm:ml-3"
                    >
                      {copy.reviewMistakes(item.progress.mistakes)}
                    </Badge>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => {
                  if (firstReview) onSelect(firstReview.index);
                }}
              >
                <IconPencil className="size-4" />
                {copy.reviewFirstCta}
              </Button>
              <Link
                to={Routes.Worksheets}
                search={reviewWorksheetSearch}
                className={cn(buttonVariants({ variant: 'outline' }))}
              >
                <IconFileText className="size-4" />
                {copy.reviewWorksheetCta}
              </Link>
            </div>
          </>
        ) : (
          <div className="rounded-lg border border-dashed bg-muted/20 p-4">
            <div className="flex items-start gap-3">
              <IconCircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-medium">{copy.reviewEmptyTitle}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {copy.reviewEmptyDescription}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type CharacterResultShareMessageParams = {
  character: LessonCharacter;
  isLastCharacter: boolean;
  lessonComplete: boolean;
  progress: CharacterProgress;
  worksheetUrl: string;
};

type CharacterAssignmentShareMessageParams =
  CharacterResultShareMessageParams & {
    practiceUrl: string;
  };

function getPracticeCopy(locale: 'en' | 'zh') {
  if (locale === 'zh') {
    return {
      backToCourseCta: '返回课程',
      badge: 'HSK1 入门课程',
      courseCta: '查看课程路径',
      courseTitle: 'HSK1 课程预览',
      description:
        '从一条实用的 HSK1 路径开始：观看笔顺、跟着描写、在本浏览器保存进度，并把同一组汉字生成可打印练习纸。',
      freeBadge: (count: number) => `${count} 个免费汉字`,
      loopCompleteDescription:
        '入门组已完成。现在最适合把整组汉字打印出来做纸笔复习。',
      loopDescription: (completed: number, total: number) =>
        `已完成 ${completed}/${total}，下一步保持练习节奏。`,
      loopNextCta: '继续练习',
      loopNextDescription: (character: string, pinyin: string) =>
        `继续下一个汉字：${character} · ${pinyin}`,
      loopReviewCta: '先复习',
      loopReviewDescription: (character: string, mistakes: number) =>
        `先处理最容易出错的字：${character}，上次错误 ${mistakes} 次。`,
      loopReviewHint: (count: number) =>
        `${count} 个汉字需要复习，可以直接生成错字练习纸。`,
      loopReviewWorksheetCta: '打印错字纸',
      loopScopedCompleteDescription: (scope: string) =>
        `${scope} 已完成。回到课程路径继续下一组，或先打印本组练习纸。`,
      loopTitle: '下一步',
      loopWorksheetCta: '打印练习纸',
      loopWorksheetHint: '打印后用纸笔复习，能把屏幕描写转成真正的书写记忆。',
      loopWorksheetNote: '把这一组汉字带到纸面上完成练习。',
      makeWorksheetCta: '制作练习纸',
      packCta: '查看 HSK1 套餐',
      packDescription:
        '继续学习完整 HSK1 路径，配套打印练习纸、复习历史和适合老师/家长的自定义字表。',
      packFeatures: [
        '把免费入门组扩展成完整 HSK1 书写路径',
        '用错字记录和复习队列安排下一次练习',
        '为课堂、家长辅导和自学生成可打印练习纸',
      ],
      packTitle: '继续学习完整 HSK1 路径',
      characterAssignmentShareCta: '复制下次作业',
      characterAssignmentShareMessage: ({
        character,
        isLastCharacter,
        lessonComplete,
        practiceUrl,
        progress,
        worksheetUrl,
      }: CharacterAssignmentShareMessageParams) => {
        const mistakeStrokes = progress.mistakeStrokes ?? [];
        const hasMistakes = progress.mistakes > 0;
        const assignment = hasMistakes
          ? '先打开线上复习链接，重练错笔；再打印单字练习纸，慢写一遍。'
          : lessonComplete
            ? '打印本组练习纸，完成纸笔复习后回课程路径继续下一组。'
            : isLastCharacter
              ? '回到课程路径开始下一组；开始前在线回看这个字。'
              : '先在线回看这个字，再继续同组下一个汉字。';

        return [
          'Lang Study 下次汉字作业',
          '',
          `本次汉字：${character.character} · ${character.pinyin}`,
          `完成情况：${hasMistakes ? `${progress.mistakes} 次错误` : '零错完成'}`,
          mistakeStrokes.length > 0
            ? `重点笔画：${mistakeStrokes
                .map((stroke) => `第 ${getDisplayStrokeNumber(stroke)} 笔`)
                .join('、')}`
            : '重点笔画：本次没有记录错笔',
          `下次任务：${assignment}`,
          `线上复习：${practiceUrl}`,
          `打印练习纸：${worksheetUrl}`,
          '来自：getlangstudy.com',
        ].join('\n');
      },
      characterAssignmentShareSuccess: '下次作业说明已复制。',
      characterNeedsReview: '已完成，需要复习',
      characterResultShareCta: '复制本次结果',
      characterResultShareMessage: ({
        character,
        isLastCharacter,
        lessonComplete,
        progress,
        worksheetUrl,
      }: CharacterResultShareMessageParams) => {
        const mistakeStrokes = progress.mistakeStrokes ?? [];
        const hasMistakes = progress.mistakes > 0;
        const nextStep = hasMistakes
          ? '先重练错笔，或打印单字复习纸。'
          : lessonComplete
            ? '打印本组练习纸，完成纸笔复习。'
            : isLastCharacter
              ? '回到课程路径，继续下一组。'
              : '继续下一个字，保持学习节奏。';

        return [
          'Lang Study 汉字练习结果',
          '',
          `汉字：${character.character} · ${character.pinyin}`,
          `结果：${hasMistakes ? `${progress.mistakes} 次错误` : '零错完成'}`,
          mistakeStrokes.length > 0
            ? `重点笔画：${mistakeStrokes
                .map((stroke) => `第 ${getDisplayStrokeNumber(stroke)} 笔`)
                .join('、')}`
            : '重点笔画：本次没有记录错笔',
          `下一步：${nextStep}`,
          `复习纸：${worksheetUrl}`,
        ].join('\n');
      },
      characterResultShareSuccess: '本次练习结果已复制。',
      characterReviewWorksheetCta: '打印这个错字',
      characterReviewWorksheetNote: (
        character: string,
        mistakeStrokes: number[]
      ) => {
        if (mistakeStrokes.length === 0) {
          return `重点复习 ${character}：先看引导格，再慢慢独立书写。`;
        }

        return `重点复习 ${character} 的${mistakeStrokes
          .map((stroke) => `第 ${getDisplayStrokeNumber(stroke)} 笔`)
          .join('、')}：先看引导格，再慢慢独立书写。`;
      },
      completionCleanDescription:
        '这一字可以暂时放下，继续新字；也可以把整组打印出来做一次纸笔巩固。',
      completionCleanTitle: '这一字已经稳了',
      completionLessonDescription:
        '完成一整组后，最好马上打印一次，隔着屏幕再写一遍。',
      completionLessonTitle: '本组可以进入纸笔复习',
      completionPrintSetCta: '打印本组',
      completionRetryCta: '再练错笔',
      completionReviewDescription:
        '先把错笔修掉，或打印单字复习纸，避免把错误手感带到下一个字。',
      completionReviewTitle: '先处理错笔',
      progressNeedsReview: '复习',
      progressNotStarted: '未开始',
      reviewCleanLabel: '零错完成',
      reviewDescription: '有错笔的汉字会自动进入这里，下一轮先复习它们。',
      reviewBadge: (count: number) => `${count} 个待复习`,
      reviewDueLabel: '待复习',
      reviewEmptyDescription: '开始描写练习后，有错笔的字会自动出现在这里。',
      reviewEmptyTitle: '当前没有错字队列',
      reviewFirstCta: '复习第一个',
      reviewFreshLabel: '今日已练',
      reviewFreshness: (completedAt?: string) => {
        const days = getPracticeAgeDays(completedAt);
        if (days === null) return '上次练习时间未记录';
        if (days === 0) return '今天刚练过';
        if (days === 1) return '上次练习：昨天';
        return `上次练习：${days} 天前`;
      },
      reviewFullTraceBadge: '完整描写',
      reviewMistakes: (count: number) => `${count} 次错误`,
      reviewPlanDescription: (
        character: string,
        urgency: HanziReviewItem['urgency'],
        priorityCount: number
      ) => {
        if (urgency === 'overdue') {
          return `先复习 ${character}。它已经隔了几天，而且有错笔记录。`;
        }
        if (urgency === 'unscheduled') {
          return `先复习 ${character}，重新记录一次练习时间，后续复习会更准确。`;
        }
        if (urgency === 'due') {
          return `先复习 ${character}，今天完成一次可以把它从待复习队列里清掉。`;
        }
        return priorityCount > 0
          ? `先处理优先复习的字，再回到 ${character}。`
          : `今天刚练过 ${character}，可以快速修正错笔后继续新字。`;
      },
      reviewPlanTitle: '建议顺序',
      reviewPriorityLabel: '优先',
      reviewTitle: '复习队列',
      reviewTroubleStrokes: (count: number) =>
        count > 0 ? `${count} 个笔画需要注意` : '重新完整描写一遍',
      reviewUrgency: {
        due: '该复习',
        fresh: '今日已练',
        overdue: '优先复习',
        unscheduled: '待安排',
      },
      reviewWorksheetCta: '打印复习纸',
      reviewWorksheetNote: (count: number) =>
        `先复习你错得最多的 ${count} 个汉字。`,
      sessionRecapDescription: (
        hasMistakes: boolean,
        lessonComplete: boolean
      ) => {
        if (hasMistakes) {
          return '先把错误手感修掉，再决定要不要进入下一个字。';
        }
        if (lessonComplete) {
          return '这组已经完成，马上做一次纸笔复习能巩固记忆。';
        }
        return '本次书写稳定，可以继续推进，但不要跳过短复习。';
      },
      sessionRecapNext: (
        hasMistakes: boolean,
        isLastCharacter: boolean,
        lessonComplete: boolean
      ) => {
        if (hasMistakes) return '重做一次错笔，或打印单字复习纸。';
        if (lessonComplete) return '打印本组练习纸，完成一次纸面复习。';
        if (isLastCharacter) return '回到课程路径，选择下一组汉字。';
        return '继续下一个字，保持同一组学习节奏。';
      },
      sessionRecapNextLabel: '下一步',
      sessionRecapResult: (mistakes: number) =>
        mistakes > 0 ? `${mistakes} 次错误` : '零错完成',
      sessionRecapResultLabel: '本次结果',
      sessionRecapTiming: (hasMistakes: boolean, lessonComplete: boolean) => {
        if (hasMistakes) return '今天内再复习一次。';
        if (lessonComplete) return '纸面复习后明天快速回看。';
        return '下次开始前快速看一遍。';
      },
      sessionRecapTimingLabel: '复习节奏',
      sessionRecapReminder: (
        hasMistakes: boolean,
        isLastCharacter: boolean,
        lessonComplete: boolean
      ) => {
        if (hasMistakes) {
          return '下次回来先打开复习队列，把这个字的错笔清掉，再继续新字。';
        }
        if (lessonComplete) {
          return '下次从课程路径继续下一组；如果时间短，先打印本组做纸笔复习。';
        }
        if (isLastCharacter) {
          return '下次回到课程路径选下一组，先看第一个新字的笔顺。';
        }
        return '下次直接继续同组下一个字，开始前快速回看这个字的形状。';
      },
      sessionRecapReminderLabel: '下次回来',
      sessionRecapTitle: '本次复盘',
      scopedSummary: (scope: string) =>
        `你已经完成 ${scope} 这一组。下一步可以回到课程路径继续新组，或打印本组练习纸做纸笔巩固。`,
      scopedWorksheetNote: (scope: string) =>
        `${scope}：把这组汉字带到纸面上完成复习。`,
      seePackCta: '查看套餐',
      shareError: '复制失败，请稍后重试。',
      sharePracticeCta: '复制练习链接',
      shareSuccess: '练习链接已复制。',
      strokeCleanBadge: '零错',
      strokeCleanDescription: '这次没有记录到错笔，可以进入下一个汉字。',
      strokeCleanTitle: '书写很稳',
      strokeFeedbackDescription: '下一轮先看动画，再重点练这些笔画。',
      strokeFeedbackTitle: '重点复习这些笔画',
      strokeNumber: (stroke: number) => `第 ${stroke} 笔`,
      statCharacters: (count: number) => `${count}+ 个启动汉字`,
      statStrokes: (count: number) => `${count} 个引导笔画`,
      statWorksheets: '练习纸已就绪',
      summary:
        '你已经完成免费入门组。下一步可以生成打印练习纸，或继续查看完整 HSK1 学习路径。',
      summaryWorksheetNote: '把这一组汉字打印出来，完成一次纸笔复习。',
      title: '通过书写学会中文汉字',
      worksheetCta: '生成练习纸',
    };
  }

  return {
    backToCourseCta: 'Back to course',
    badge: 'HSK1 starter course',
    courseCta: 'View course path',
    courseTitle: 'HSK1 course preview',
    description:
      'Start with a practical HSK1 path: watch stroke order, trace each character, save progress in this browser, then turn the same set into printable practice sheets.',
    freeBadge: (count: number) => `${count} free characters`,
    loopCompleteDescription:
      'Starter set complete. This is a good moment to print the whole set for paper review.',
    loopDescription: (completed: number, total: number) =>
      `${completed}/${total} complete. Keep the practice loop moving.`,
    loopNextCta: 'Keep practicing',
    loopNextDescription: (character: string, pinyin: string) =>
      `Continue with ${character} · ${pinyin}`,
    loopReviewCta: 'Review first',
    loopReviewDescription: (character: string, mistakes: number) =>
      `Start with the trickiest character: ${character}, missed ${mistakes} times last run.`,
    loopReviewHint: (count: number) =>
      `${count} characters need review. Turn them into a focused worksheet when you want paper practice.`,
    loopReviewWorksheetCta: 'Print review sheet',
    loopScopedCompleteDescription: (scope: string) =>
      `${scope} complete. Return to the course path for the next lesson, or print this set first.`,
    loopTitle: 'Next step',
    loopWorksheetCta: 'Print worksheet',
    loopWorksheetHint:
      'Paper practice helps turn screen tracing into real handwriting memory.',
    loopWorksheetNote:
      'Take this lesson set onto paper to finish the practice loop.',
    makeWorksheetCta: 'Make worksheet',
    packCta: 'View HSK1 pack',
    packDescription:
      'Continue into the full HSK1 path with printable worksheets, review history, and custom lists for teachers and parents.',
    packFeatures: [
      'Extend the free starter into the full HSK1 writing path',
      'Use mistake history and review queues to plan the next session',
      'Create printable worksheets for tutoring, family practice, or self-study',
    ],
    packTitle: 'Continue with the full HSK1 path',
    characterAssignmentShareCta: 'Copy assignment',
    characterAssignmentShareMessage: ({
      character,
      isLastCharacter,
      lessonComplete,
      practiceUrl,
      progress,
      worksheetUrl,
    }: CharacterAssignmentShareMessageParams) => {
      const mistakeStrokes = progress.mistakeStrokes ?? [];
      const hasMistakes = progress.mistakes > 0;
      const assignment = hasMistakes
        ? 'Open the online review first, retry the missed strokes, then print the single-character sheet and write it slowly once.'
        : lessonComplete
          ? 'Print this set, finish one paper pass, then return to the course path for the next set.'
          : isLastCharacter
            ? 'Return to the course path for the next set; quickly review this character online first.'
            : 'Review this character online first, then continue with the next character in the same set.';

      return [
        'Lang Study next character assignment',
        '',
        `Character practiced: ${character.character} · ${character.pinyin}`,
        `Result: ${hasMistakes ? `${progress.mistakes} mistakes` : 'clean run'}`,
        mistakeStrokes.length > 0
          ? `Focus strokes: ${mistakeStrokes
              .map((stroke) => `stroke ${getDisplayStrokeNumber(stroke)}`)
              .join(', ')}`
          : 'Focus strokes: no missed strokes recorded',
        `Next assignment: ${assignment}`,
        `Online review: ${practiceUrl}`,
        `Printable worksheet: ${worksheetUrl}`,
        'From: getlangstudy.com',
      ].join('\n');
    },
    characterAssignmentShareSuccess: 'Next assignment copied.',
    characterNeedsReview: 'Complete, review needed',
    characterResultShareCta: 'Copy result',
    characterResultShareMessage: ({
      character,
      isLastCharacter,
      lessonComplete,
      progress,
      worksheetUrl,
    }: CharacterResultShareMessageParams) => {
      const mistakeStrokes = progress.mistakeStrokes ?? [];
      const hasMistakes = progress.mistakes > 0;
      const nextStep = hasMistakes
        ? 'Retry the missed strokes or print a review.'
        : lessonComplete
          ? 'Print this set for paper reinforcement.'
          : isLastCharacter
            ? 'Return to the course path for the next set.'
            : 'Continue with the next character while the rhythm is fresh.';

      return [
        'Lang Study character practice result',
        '',
        `Character: ${character.character} · ${character.pinyin}`,
        `Result: ${hasMistakes ? `${progress.mistakes} mistakes` : 'clean run'}`,
        mistakeStrokes.length > 0
          ? `Focus strokes: ${mistakeStrokes
              .map((stroke) => `stroke ${getDisplayStrokeNumber(stroke)}`)
              .join(', ')}`
          : 'Focus strokes: no missed strokes recorded',
        `Next step: ${nextStep}`,
        `Review sheet: ${worksheetUrl}`,
      ].join('\n');
    },
    characterResultShareSuccess: 'Practice result copied.',
    characterReviewWorksheetCta: 'Print this review',
    characterReviewWorksheetNote: (
      character: string,
      mistakeStrokes: number[]
    ) => {
      if (mistakeStrokes.length === 0) {
        return `Focus on ${character}: use the guided grid first, then write it slowly on your own.`;
      }

      return `Focus on ${character} ${
        mistakeStrokes.length === 1 ? 'stroke' : 'strokes'
      } ${mistakeStrokes
        .map((stroke) => getDisplayStrokeNumber(stroke))
        .join(
          ', '
        )}: use the guided grid first, then write it slowly on your own.`;
    },
    completionCleanDescription:
      'Move on while the shape is fresh, or print the full set for one paper pass.',
    completionCleanTitle: 'This character is solid',
    completionLessonDescription:
      'After finishing a set, print it once and write it away from the screen.',
    completionLessonTitle: 'Take this set to paper',
    completionPrintSetCta: 'Print set',
    completionRetryCta: 'Retry missed strokes',
    completionReviewDescription:
      'Fix the missed strokes first, or print a single-character review before moving on.',
    completionReviewTitle: 'Review the missed strokes first',
    progressNeedsReview: 'Review',
    progressNotStarted: 'Not started',
    reviewCleanLabel: 'Clean runs',
    reviewDescription:
      'Characters with missed strokes are saved here so the next session has a clear focus.',
    reviewBadge: (count: number) => `${count} to review`,
    reviewDueLabel: 'Due for review',
    reviewEmptyDescription:
      'Start a tracing quiz and missed characters will appear here automatically.',
    reviewEmptyTitle: 'No review queue yet',
    reviewFirstCta: 'Review first',
    reviewFreshLabel: 'Practiced today',
    reviewFreshness: (completedAt?: string) => {
      const days = getPracticeAgeDays(completedAt);
      if (days === null) return 'Last practice date not saved';
      if (days === 0) return 'Practiced today';
      if (days === 1) return 'Last practiced yesterday';
      return `Last practiced ${days} days ago`;
    },
    reviewFullTraceBadge: 'Full trace',
    reviewMistakes: (count: number) => `${count} mistakes`,
    reviewPlanDescription: (
      character: string,
      urgency: HanziReviewItem['urgency'],
      priorityCount: number
    ) => {
      if (urgency === 'overdue') {
        return `Start with ${character}. It has been waiting for a few days and still has missed strokes.`;
      }
      if (urgency === 'unscheduled') {
        return `Start with ${character} and record a fresh practice date so future reviews are more accurate.`;
      }
      if (urgency === 'due') {
        return `Start with ${character}. One review today can clear it from the due queue.`;
      }
      return priorityCount > 0
        ? `Clear the priority characters first, then come back to ${character}.`
        : `${character} was practiced today. Fix the missed strokes quickly, then continue.`;
    },
    reviewPlanTitle: 'Suggested order',
    reviewPriorityLabel: 'Priority',
    reviewTitle: 'Review queue',
    reviewTroubleStrokes: (count: number) =>
      count > 0 ? `${count} strokes to revisit` : 'Trace it once more',
    reviewUrgency: {
      due: 'Due',
      fresh: 'Practiced today',
      overdue: 'Priority',
      unscheduled: 'Needs date',
    },
    reviewWorksheetCta: 'Print review sheet',
    reviewWorksheetNote: (count: number) =>
      `Start with the ${count} characters you missed most.`,
    sessionRecapDescription: (
      hasMistakes: boolean,
      lessonComplete: boolean
    ) => {
      if (hasMistakes) {
        return 'Fix the wrong stroke memory before deciding whether to move on.';
      }
      if (lessonComplete) {
        return 'This set is complete. A paper pass now will lock in the memory.';
      }
      return 'This run is stable. Keep moving, but keep the refresh loop short.';
    },
    sessionRecapNext: (
      hasMistakes: boolean,
      isLastCharacter: boolean,
      lessonComplete: boolean
    ) => {
      if (hasMistakes) {
        return 'Retry the missed strokes, or print a single-character review.';
      }
      if (lessonComplete) return 'Print this set and complete one paper pass.';
      if (isLastCharacter) return 'Return to the course path for the next set.';
      return 'Continue with the next character in this set.';
    },
    sessionRecapNextLabel: 'Next',
    sessionRecapResult: (mistakes: number) =>
      mistakes > 0 ? `${mistakes} mistakes` : 'Clean run',
    sessionRecapResultLabel: 'Result',
    sessionRecapTiming: (hasMistakes: boolean, lessonComplete: boolean) => {
      if (hasMistakes) return 'Review once more today.';
      if (lessonComplete)
        return 'Do a quick refresh tomorrow after paper work.';
      return 'Refresh it briefly before your next session.';
    },
    sessionRecapTimingLabel: 'Timing',
    sessionRecapReminder: (
      hasMistakes: boolean,
      isLastCharacter: boolean,
      lessonComplete: boolean
    ) => {
      if (hasMistakes) {
        return 'Next time, start from the review queue and clear the missed strokes before adding a new character.';
      }
      if (lessonComplete) {
        return 'Next time, continue from the course path; for a short session, print this set for paper review first.';
      }
      if (isLastCharacter) {
        return 'Next time, return to the course path and start the first character in the next set.';
      }
      return 'Next time, continue with the next character in this set after a quick shape refresh.';
    },
    sessionRecapReminderLabel: 'Next return',
    sessionRecapTitle: 'Session recap',
    scopedSummary: (scope: string) =>
      `You completed ${scope}. Return to the course path for the next lesson, or print this set for paper review.`,
    scopedWorksheetNote: (scope: string) =>
      `${scope}: take this character set onto paper for review.`,
    seePackCta: 'See paid pack',
    shareError: 'Could not copy the practice link. Please try again.',
    sharePracticeCta: 'Copy practice link',
    shareSuccess: 'Practice link copied.',
    strokeCleanBadge: 'Clean',
    strokeCleanDescription:
      'No missed strokes were recorded. Move on to the next character.',
    strokeCleanTitle: 'Solid writing run',
    strokeFeedbackDescription:
      'Watch the animation once, then focus on these strokes next run.',
    strokeFeedbackTitle: 'Revisit these strokes',
    strokeNumber: (stroke: number) => `Stroke ${stroke}`,
    statCharacters: (count: number) => `${count}+ launch characters`,
    statStrokes: (count: number) => `${count} guided strokes`,
    statWorksheets: 'Worksheets ready',
    summary:
      'You finished the free starter set. Generate a printable worksheet now, or continue into the full HSK1 path.',
    summaryWorksheetNote:
      'Print this character set and complete one paper review pass.',
    title: 'Learn Chinese characters by writing them',
    worksheetCta: 'Create worksheet',
  };
}

function buildWorksheetSearch(
  characters: string[],
  options: {
    details?: boolean;
    note?: string;
    trace?: 'first' | 'guided' | 'blank';
  }
) {
  return {
    characters,
    ...(options.details !== undefined ? { details: options.details } : {}),
    ...(options.note ? { note: options.note } : {}),
    ...(options.trace ? { trace: options.trace } : {}),
  };
}

function buildWorksheetPath(search: ReturnType<typeof buildWorksheetSearch>) {
  const params = new URLSearchParams();

  for (const character of search.characters) {
    params.append('characters', character);
  }

  if (search.details !== undefined) {
    params.set('details', search.details ? 'true' : 'false');
  }

  if (search.note) {
    params.set('note', search.note);
  }

  if (search.trace) {
    params.set('trace', search.trace);
  }

  const query = params.toString();
  return `${Routes.Worksheets}${query ? `?${query}` : ''}`;
}

function buildPracticePath(character: string, characters: string[]) {
  const params = new URLSearchParams();

  params.set('character', character);

  for (const item of characters) {
    params.append('characters', item);
  }

  const query = params.toString();
  return `${Routes.Learn}${query ? `?${query}` : ''}`;
}
