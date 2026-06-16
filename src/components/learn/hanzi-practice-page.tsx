import { m } from '@/locale/paraglide/messages';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  IconArrowRight,
  IconCheck,
  IconCircleCheck,
  IconPencil,
  IconPlayerPlay,
  IconReload,
  IconRotate,
} from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const HANZI_WRITER_SCRIPT =
  'https://cdn.jsdelivr.net/npm/hanzi-writer@3.7.3/dist/hanzi-writer.min.js';
const HANZI_WRITER_SCRIPT_ID = 'hanzi-writer-cdn';
const PROGRESS_STORAGE_KEY = 'lang-study:beginner-hanzi-progress:v1';

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

type LessonCharacter = {
  character: string;
  pinyin: string;
  meaning: string;
  hint: string;
  strokes: number;
};

type CharacterProgress = {
  completed: boolean;
  correctStrokes: number;
  mistakes: number;
};

type StoredProgress = Record<string, CharacterProgress>;

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

function readStoredProgress(): StoredProgress {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as StoredProgress;
  } catch {
    return {};
  }
}

function writeStoredProgress(progress: StoredProgress) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}

function getLessonCharacters(): LessonCharacter[] {
  return [
    {
      character: '人',
      pinyin: 'rén',
      meaning: m.learn_character_ren_meaning(),
      hint: m.learn_character_ren_hint(),
      strokes: 2,
    },
    {
      character: '口',
      pinyin: 'kǒu',
      meaning: m.learn_character_kou_meaning(),
      hint: m.learn_character_kou_hint(),
      strokes: 3,
    },
    {
      character: '日',
      pinyin: 'rì',
      meaning: m.learn_character_ri_meaning(),
      hint: m.learn_character_ri_hint(),
      strokes: 4,
    },
  ];
}

export function HanziPracticePage() {
  const lessonCharacters = useMemo(() => getLessonCharacters(), []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState<StoredProgress>({});
  const currentCharacter = lessonCharacters[currentIndex];
  const completedCount = lessonCharacters.filter(
    (item) => progress[item.character]?.completed
  ).length;
  const lessonComplete = completedCount === lessonCharacters.length;
  const progressValue = Math.round(
    (completedCount / lessonCharacters.length) * 100
  );

  useEffect(() => {
    setProgress(readStoredProgress());
  }, []);

  const saveProgress = useCallback(
    (character: string, nextProgress: CharacterProgress) => {
      setProgress((previous) => {
        const updated = {
          ...previous,
          [character]: nextProgress,
        };
        writeStoredProgress(updated);
        return updated;
      });
    },
    []
  );

  const resetLesson = useCallback(() => {
    setCurrentIndex(0);
    setProgress({});
    writeStoredProgress({});
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((index) =>
      Math.min(index + 1, lessonCharacters.length - 1)
    );
  }, [lessonCharacters.length]);

  return (
    <section className="min-h-[calc(100vh-12rem)] bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
          <div className="flex flex-col gap-5">
            <div className="space-y-4">
              <Badge variant="outline" className="border-primary/30">
                {m.learn_badge()}
              </Badge>
              <div className="space-y-3">
                <h1 className="text-balance text-3xl font-semibold tracking-normal sm:text-4xl">
                  {m.learn_title()}
                </h1>
                <p className="max-w-2xl text-base text-muted-foreground">
                  {m.learn_description()}
                </p>
              </div>
            </div>

            <Card className="rounded-lg">
              <CardHeader>
                <CardTitle>{m.learn_progress_title()}</CardTitle>
                <CardDescription>
                  {m.learn_progress_description({
                    completed: completedCount,
                    total: lessonCharacters.length,
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={progressValue} />
                <div className="grid grid-cols-3 gap-2">
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
                  {lessonComplete ? (
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

            <div className="grid gap-3 sm:grid-cols-3">
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
                </div>
              ))}
            </div>
          </div>

          <HanziPracticeCard
            key={currentCharacter.character}
            character={currentCharacter}
            currentIndex={currentIndex}
            total={lessonCharacters.length}
            progress={progress[currentCharacter.character]}
            lessonComplete={lessonComplete}
            onComplete={(nextProgress) =>
              saveProgress(currentCharacter.character, nextProgress)
            }
            onNext={goToNext}
            onReset={resetLesson}
          />
        </div>
      </div>
    </section>
  );
}

type HanziPracticeCardProps = {
  character: LessonCharacter;
  currentIndex: number;
  total: number;
  progress?: CharacterProgress;
  lessonComplete: boolean;
  onComplete: (progress: CharacterProgress) => void;
  onNext: () => void;
  onReset: () => void;
};

function HanziPracticeCard({
  character,
  currentIndex,
  total,
  progress,
  lessonComplete,
  onComplete,
  onNext,
  onReset,
}: HanziPracticeCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriterInstance | null>(null);
  const mistakesRef = useRef(0);
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
          drawingColor: 'rgb(15 23 42)',
          height: size,
          highlightColor: 'rgb(14 165 233)',
          outlineColor: 'rgb(148 163 184)',
          padding: 16,
          radicalColor: 'rgb(16 185 129)',
          showCharacter: false,
          showOutline: true,
          strokeAnimationSpeed: 1,
          strokeColor: 'rgb(15 23 42)',
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
    correctStrokesRef.current = 0;
    setStatus('quiz');
    setSessionStats(null);

    writerRef.current.quiz({
      onMistake: (strokeData) => {
        mistakesRef.current = strokeData.totalMistakes;
      },
      onCorrectStroke: () => {
        correctStrokesRef.current += 1;
      },
      onComplete: (summaryData) => {
        const nextProgress = {
          completed: true,
          correctStrokes: correctStrokesRef.current,
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
              ) : (
                <Button
                  type="button"
                  onClick={onNext}
                  disabled={isLastCharacter}
                >
                  <IconArrowRight className="size-4" />
                  {m.learn_next_character()}
                </Button>
              )}
            </div>
          </div>
        ) : null}

        {lessonComplete ? (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
            <p className="font-medium">{m.learn_summary_title()}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {m.learn_summary_description()}
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
