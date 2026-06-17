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
  getHanziProgressSummary,
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
  IconFileText,
  IconLock,
  IconPencil,
  IconPlayerPlay,
  IconReload,
  IconRotate,
  IconSparkles,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
}: {
  initialCharacter?: string;
}) {
  const currentLocale = getLocale() === 'zh' ? 'zh' : 'en';
  const copy = getPracticeCopy(currentLocale);
  const lessonCharacters = useMemo(
    () => getFreeCharacters(currentLocale),
    [currentLocale]
  );
  const courseStats = useMemo(() => getCourseStats(), []);
  const initialIndex = Math.max(
    lessonCharacters.findIndex((item) => item.character === initialCharacter),
    0
  );
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState<StoredProgress>({});
  const currentCharacter = lessonCharacters[currentIndex];
  const progressSummary = useMemo(
    () => getHanziProgressSummary(lessonCharacters, progress),
    [lessonCharacters, progress]
  );

  useEffect(() => {
    setProgress(readStoredHanziProgress());
  }, []);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

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
    setProgress({});
    writeStoredHanziProgress({});
  }, [initialIndex]);

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

  return (
    <section className="min-h-[calc(100vh-12rem)] bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
          <div className="flex flex-col gap-5">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-primary/30">
                  {copy.badge}
                </Badge>
                <Badge variant="secondary">
                  {copy.freeBadge(courseStats.free)}
                </Badge>
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
                  to={Routes.Worksheets}
                  search={{ characters: worksheetCharacters }}
                  className={buttonVariants()}
                >
                  <IconFileText className="size-4" />
                  {copy.worksheetCta}
                </Link>
                <Link
                  to={Routes.Pricing}
                  className={cn(buttonVariants({ variant: 'outline' }))}
                >
                  <IconSparkles className="size-4" />
                  {copy.packCta}
                </Link>
              </div>
            </div>

            <Card className="rounded-lg">
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
                    const done = progress[item.character]?.completed;
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
                          done && 'border-emerald-500/40 bg-emerald-500/10'
                        )}
                      >
                        <span className="text-3xl font-semibold leading-none">
                          {item.character}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {done ? m.learn_done() : item.pinyin}
                        </span>
                      </button>
                    );
                  })}
                </div>
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

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {lessonCharacters.map((item) => (
                <div
                  key={item.character}
                  className="rounded-lg border bg-muted/30 p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-2xl font-semibold">
                      {item.character}
                    </span>
                    {progress[item.character]?.completed ? (
                      <IconCheck className="size-4 text-emerald-600" />
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

            <Card className="rounded-lg border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-background p-2 ring-1 ring-border">
                    <IconBook2 className="size-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      {copy.packTitle}
                    </CardTitle>
                    <CardDescription>{copy.packDescription}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-3">
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
  worksheetCharacters: string[];
};

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
  const lastStats = sessionStats ?? progress;
  const isLastCharacter = currentIndex === total - 1;

  return (
    <Card className="rounded-lg">
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
            <Badge variant="secondary" className="h-7 rounded-lg px-2.5">
              <IconCheck className="size-4" />
              {m.learn_done()}
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

        <div className="grid gap-2 sm:grid-cols-2">
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
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
            <div className="flex items-start gap-3">
              <IconCircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{m.learn_character_complete()}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {m.learn_character_stats({
                    mistakes: lastStats.mistakes,
                    strokes: character.strokes,
                  })}
                </p>
              </div>
            </div>
            <StrokeFeedback copy={copy} progress={lastStats} />
            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={startQuiz}>
                <IconRotate className="size-4" />
                {m.learn_practice_again()}
              </Button>
              {lessonComplete ? (
                <Button type="button" onClick={onReset}>
                  <IconReload className="size-4" />
                  {m.learn_restart_lesson()}
                </Button>
              ) : !isLastCharacter ? (
                <Button
                  type="button"
                  onClick={onNext}
                  disabled={isLastCharacter}
                >
                  <IconArrowRight className="size-4" />
                  {m.learn_next_character()}
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}

        {lessonComplete ? (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
            <p className="font-medium">{m.learn_summary_title()}</p>
            <p className="mt-1 text-sm text-muted-foreground">{copy.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to={Routes.Worksheets}
                search={{ characters: worksheetCharacters }}
                className={cn(buttonVariants({ variant: 'outline' }))}
              >
                <IconFileText className="size-4" />
                {copy.makeWorksheetCta}
              </Link>
              <Link to={Routes.Pricing} className={buttonVariants()}>
                <IconLock className="size-4" />
                {copy.seePackCta}
              </Link>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
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
                {copy.strokeNumber(stroke + 1)}
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
  total,
  worksheetCharacters,
}: {
  completedCount: number;
  copy: ReturnType<typeof getPracticeCopy>;
  nextPracticeTarget?: NextPracticeTarget;
  onSelect: (index: number) => void;
  reviewCharacters: string[];
  reviewItems: HanziReviewItem[];
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
          note: copy.loopWorksheetNote,
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
            {primaryAction?.description ?? copy.loopCompleteDescription}
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
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="text-2xl font-semibold">{reviewItems.length}</div>
            <div className="mt-1 text-muted-foreground">
              {copy.reviewDueLabel}
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
            <div className="space-y-2">
              {reviewItems.slice(0, 4).map((item) => (
                <button
                  key={item.character.character}
                  type="button"
                  onClick={() => onSelect(item.index)}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 rounded-lg border bg-background p-3 text-left transition-colors',
                    'hover:border-primary/50 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border bg-muted text-3xl font-semibold">
                      {item.character.character}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium">
                        {item.character.pinyin} · {item.character.meaning}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {copy.reviewTroubleStrokes(
                          item.progress.mistakeStrokes?.length ?? 0
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0 rounded-md">
                    {copy.reviewMistakes(item.progress.mistakes)}
                  </Badge>
                </button>
              ))}
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

function getPracticeCopy(locale: 'en' | 'zh') {
  if (locale === 'zh') {
    return {
      badge: 'HSK1 入门课程',
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
      loopTitle: '下一步',
      loopWorksheetCta: '打印练习纸',
      loopWorksheetHint: '打印后用纸笔复习，能把屏幕描写转成真正的书写记忆。',
      loopWorksheetNote: '把这一组汉字带到纸面上完成练习。',
      makeWorksheetCta: '制作练习纸',
      packCta: '查看 HSK1 套餐',
      packDescription:
        '继续学习完整 HSK1 路径，配套打印练习纸、复习历史和适合老师/家长的自定义字表。',
      packTitle: '继续学习完整 HSK1 路径',
      reviewCleanLabel: '零错完成',
      reviewDescription: '有错笔的汉字会自动进入这里，下一轮先复习它们。',
      reviewDueLabel: '待复习',
      reviewEmptyDescription: '开始描写练习后，有错笔的字会自动出现在这里。',
      reviewEmptyTitle: '当前没有错字队列',
      reviewFirstCta: '复习第一个',
      reviewMistakes: (count: number) => `${count} 次错误`,
      reviewTitle: '复习队列',
      reviewTroubleStrokes: (count: number) =>
        count > 0 ? `${count} 个笔画需要注意` : '重新完整描写一遍',
      reviewWorksheetCta: '打印复习纸',
      reviewWorksheetNote: (count: number) =>
        `先复习你错得最多的 ${count} 个汉字。`,
      seePackCta: '查看套餐',
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
      title: '通过书写学会中文汉字',
      worksheetCta: '生成练习纸',
    };
  }

  return {
    badge: 'HSK1 starter course',
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
    packTitle: 'Continue with the full HSK1 path',
    reviewCleanLabel: 'Clean runs',
    reviewDescription:
      'Characters with missed strokes are saved here so the next session has a clear focus.',
    reviewDueLabel: 'Due for review',
    reviewEmptyDescription:
      'Start a tracing quiz and missed characters will appear here automatically.',
    reviewEmptyTitle: 'No review queue yet',
    reviewFirstCta: 'Review first',
    reviewMistakes: (count: number) => `${count} mistakes`,
    reviewTitle: 'Review queue',
    reviewTroubleStrokes: (count: number) =>
      count > 0 ? `${count} strokes to revisit` : 'Trace it once more',
    reviewWorksheetCta: 'Print review sheet',
    reviewWorksheetNote: (count: number) =>
      `Start with the ${count} characters you missed most.`,
    seePackCta: 'See paid pack',
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
