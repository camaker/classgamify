import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  getCourseStats,
  getFreeCharacters,
  getHanziPath,
  getHsk1CourseLessons,
  type CourseLesson,
  type LessonCharacter,
} from '@/learn/hanzi-course';
import {
  getDisplayStrokeNumber,
  getHanziProgressSummary,
  readStoredHanziProgress,
  writeStoredHanziProgress,
  type CharacterProgress,
  type HanziProgressSummary,
  type HanziReviewItem,
  type StoredProgress,
} from '@/learn/hanzi-progress';
import { getLocale } from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import {
  IconArrowRight,
  IconBook2,
  IconCircleCheck,
  IconClockHour4,
  IconCopy,
  IconDatabaseExport,
  IconDatabaseImport,
  IconFileText,
  IconFlame,
  IconLock,
  IconPencil,
  IconRotate,
  IconSparkles,
  IconTargetArrow,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const COURSE_SHARE_DOMAIN = 'getlangstudy.com';
const PROGRESS_BACKUP_SCHEMA_VERSION = 1;
const PROGRESS_BACKUP_TYPE = 'hsk1-progress-backup';

export function HskCoursePage() {
  const currentLocale = getLocale() === 'zh' ? 'zh' : 'en';
  const copy = getCourseCopy(currentLocale);
  const lessons = useMemo(
    () => getHsk1CourseLessons(currentLocale),
    [currentLocale]
  );
  const stats = useMemo(() => getCourseStats(), []);
  const freeCharacters = useMemo(
    () => getFreeCharacters(currentLocale).map((item) => item.character),
    [currentLocale]
  );
  const freeLessonCharacters = useMemo(
    () => getFreeCharacters(currentLocale),
    [currentLocale]
  );
  const [progress, setProgress] = useState<StoredProgress>({});
  const [backupInput, setBackupInput] = useState('');
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const progressSummary = useMemo(
    () => getHanziProgressSummary(freeLessonCharacters, progress),
    [freeLessonCharacters, progress]
  );
  const primaryPracticeCharacter =
    progressSummary.reviewItems[0]?.character ??
    progressSummary.nextPracticeTarget?.character ??
    freeLessonCharacters[0];
  const primaryPracticeLabel =
    progressSummary.reviewItems.length > 0
      ? copy.reviewCta
      : progressSummary.completedCount > 0
        ? progressSummary.lessonComplete
          ? copy.practiceAgainCta
          : copy.continueCta
        : copy.practiceCta;
  const primaryWorksheetSearch: CourseWorksheetSearch = {
    characters:
      progressSummary.reviewCharacters.length > 0
        ? progressSummary.reviewCharacters
        : freeCharacters,
    details: true,
    note:
      progressSummary.reviewCharacters.length > 0
        ? copy.reviewWorksheetNote(progressSummary.reviewCharacters.length)
        : copy.continueWorksheetNote,
    trace: progressSummary.reviewCharacters.length > 0 ? 'guided' : 'first',
  };
  const primaryPracticeUrl = buildCoursePracticeUrl(
    primaryPracticeCharacter?.character,
    freeCharacters
  );
  const primaryWorksheetUrl = buildCourseWorksheetUrl(primaryWorksheetSearch);
  const copyProgressReport = async () => {
    if (
      typeof window === 'undefined' ||
      !window.navigator.clipboard?.writeText
    ) {
      toast.error(copy.shareError);
      return;
    }

    const report = copy.progressShareMessage({
      nextCharacter: primaryPracticeCharacter,
      practiceUrl: primaryPracticeUrl,
      progressSummary,
      reviewItems: progressSummary.reviewItems,
      worksheetUrl: primaryWorksheetUrl,
    });

    try {
      await window.navigator.clipboard.writeText(report);
      toast.success(copy.progressShareSuccess);
    } catch {
      toast.error(copy.shareError);
    }
  };
  const copyProgressBackup = async () => {
    if (
      typeof window === 'undefined' ||
      !window.navigator.clipboard?.writeText
    ) {
      toast.error(copy.shareError);
      return;
    }

    const backup = buildProgressBackup({
      locale: currentLocale,
      progress,
      progressSummary,
    });

    try {
      await window.navigator.clipboard.writeText(
        JSON.stringify(backup, null, 2)
      );
      toast.success(copy.progressBackupSuccess);
    } catch {
      toast.error(copy.shareError);
    }
  };
  const updateRestoreDialogOpen = (open: boolean) => {
    setRestoreDialogOpen(open);

    if (!open) {
      setBackupInput('');
    }
  };
  const restoreProgressBackup = () => {
    const nextProgress = parseProgressBackup(backupInput);

    if (!nextProgress) {
      toast.error(copy.progressRestoreError);
      return;
    }

    writeStoredHanziProgress(nextProgress);
    setProgress(nextProgress);
    updateRestoreDialogOpen(false);
    toast.success(copy.progressRestoreSuccess);
  };
  const dailyTarget = progressSummary.reviewItems.length > 0 ? 2 : 1;
  const lessonProgressItems = useMemo(
    () =>
      lessons.map((lesson) => {
        const availableCharacters = lesson.characters.filter(
          (item) => !item.premium
        );

        return {
          lesson,
          progressSummary: getHanziProgressSummary(
            availableCharacters,
            progress
          ),
          worksheetCharacters: availableCharacters.map(
            (item) => item.character
          ),
        };
      }),
    [lessons, progress]
  );

  useEffect(() => {
    setProgress(readStoredHanziProgress());
  }, []);

  return (
    <section className="min-h-[calc(100vh-12rem)] bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-primary/30">
                {copy.badge}
              </Badge>
              <Badge variant="secondary">{copy.levelBadge}</Badge>
            </div>
            <div className="max-w-3xl space-y-3">
              <h1 className="text-balance text-3xl font-semibold tracking-normal sm:text-4xl">
                {copy.title}
              </h1>
              <p className="text-base leading-7 text-muted-foreground">
                {copy.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {primaryPracticeCharacter ? (
                <Link
                  to={Routes.Learn}
                  search={{
                    character: primaryPracticeCharacter.character,
                    characters: freeCharacters,
                  }}
                  className={buttonVariants()}
                >
                  <IconPencil className="size-4" />
                  {primaryPracticeLabel}
                </Link>
              ) : null}
              <Link
                to={Routes.Worksheets}
                search={primaryWorksheetSearch}
                className={cn(buttonVariants({ variant: 'outline' }))}
              >
                <IconFileText className="size-4" />
                {progressSummary.reviewCharacters.length > 0
                  ? copy.reviewWorksheetCta
                  : copy.worksheetCta}
              </Link>
              <Button
                type="button"
                variant="outline"
                onClick={copyProgressReport}
              >
                <IconCopy className="size-4" />
                {copy.progressShareCta}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={copyProgressBackup}
              >
                <IconDatabaseExport className="size-4" />
                {copy.progressBackupCta}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => updateRestoreDialogOpen(true)}
              >
                <IconDatabaseImport className="size-4" />
                {copy.progressRestoreCta}
              </Button>
            </div>
          </div>

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <IconBook2 className="size-4" />
                {copy.summaryTitle}
              </CardTitle>
              <CardDescription>{copy.summaryDescription}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <Stat label={copy.totalLabel} value={stats.total} />
              <Stat label={copy.freeLabel} value={stats.free} />
              <Stat label={copy.premiumLabel} value={stats.locked} />
              <Stat label={copy.strokesLabel} value={stats.strokes} />
              <LearningRhythmStats
                copy={copy}
                progressSummary={progressSummary}
              />
              <NextReturnCard copy={copy} progressSummary={progressSummary} />
            </CardContent>
          </Card>
        </div>

        <Dialog open={restoreDialogOpen} onOpenChange={updateRestoreDialogOpen}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{copy.progressRestoreTitle}</DialogTitle>
              <DialogDescription>
                {copy.progressRestoreDescription}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <label
                className="text-sm font-medium"
                htmlFor="hsk-progress-backup"
              >
                {copy.progressRestoreInputLabel}
              </label>
              <Textarea
                id="hsk-progress-backup"
                value={backupInput}
                onChange={(event) => setBackupInput(event.target.value)}
                placeholder={copy.progressRestorePlaceholder}
                className="min-h-48 resize-y font-mono text-xs leading-5"
              />
              <p className="text-xs leading-5 text-muted-foreground">
                {copy.progressRestoreHint}
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => updateRestoreDialogOpen(false)}
              >
                {copy.cancelCta}
              </Button>
              <Button
                type="button"
                disabled={!backupInput.trim()}
                onClick={restoreProgressBackup}
              >
                <IconDatabaseImport className="size-4" />
                {copy.progressRestoreConfirmCta}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <DailyPracticePlanCard
          copy={copy}
          dailyTarget={dailyTarget}
          progressSummary={progressSummary}
          worksheetCharacters={freeCharacters}
        />

        <section className="grid gap-4">
          {lessonProgressItems.map((item, index) => (
            <LessonSection
              copy={copy}
              index={index}
              key={item.lesson.id}
              lesson={item.lesson}
              progress={progress}
              progressSummary={item.progressSummary}
              worksheetCharacters={item.worksheetCharacters}
            />
          ))}
        </section>

        <section className="grid gap-4 rounded-lg border border-primary/20 bg-primary/5 p-5 md:grid-cols-[1fr_auto] md:items-center">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <IconSparkles className="size-4" />
              {copy.upgradeEyebrow}
            </div>
            <h2 className="text-xl font-semibold">{copy.upgradeTitle}</h2>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              {copy.upgradeDescription}
            </p>
          </div>
          <Link to={Routes.Pricing} className={buttonVariants()}>
            <IconLock className="size-4" />
            {copy.upgradeCta}
          </Link>
        </section>
      </div>
    </section>
  );
}

function NextReturnCard({
  copy,
  progressSummary,
}: {
  copy: ReturnType<typeof getCourseCopy>;
  progressSummary: HanziProgressSummary;
}) {
  const firstReview = progressSummary.reviewItems[0];
  const nextCharacter = progressSummary.nextPracticeTarget?.character;
  const title = firstReview
    ? copy.returnReviewTitle(firstReview.character.character)
    : progressSummary.lessonComplete
      ? copy.returnCompleteTitle
      : nextCharacter
        ? copy.returnContinueTitle(nextCharacter.character)
        : copy.returnStartTitle;
  const description = firstReview
    ? copy.returnReviewDescription(
        firstReview.progress.mistakes,
        firstReview.urgency
      )
    : progressSummary.lessonComplete
      ? copy.returnCompleteDescription
      : nextCharacter
        ? copy.returnContinueDescription(nextCharacter.pinyin)
        : copy.returnStartDescription;

  return (
    <div className="col-span-2 rounded-lg border bg-background p-3">
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-primary/10 p-2 text-primary">
          <IconFlame className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium">{copy.returnTitle}</div>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {copy.returnDescription}
          </p>
          <div className="mt-3 rounded-md border bg-muted/30 px-3 py-2">
            <p className="text-sm font-medium">{title}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DailyPracticePlanCard({
  copy,
  dailyTarget,
  progressSummary,
  worksheetCharacters,
}: {
  copy: ReturnType<typeof getCourseCopy>;
  dailyTarget: number;
  progressSummary: HanziProgressSummary;
  worksheetCharacters: string[];
}) {
  const firstReview = progressSummary.reviewItems[0];
  const nextCharacter =
    firstReview?.character ?? progressSummary.nextPracticeTarget?.character;
  const primaryCharacter = nextCharacter?.character ?? worksheetCharacters[0];
  const hasReview = progressSummary.reviewItems.length > 0;
  const hasStarted = progressSummary.completedCount > 0;
  const planTitle = hasReview
    ? copy.todayReviewTitle
    : progressSummary.lessonComplete
      ? copy.todayCompleteTitle
      : hasStarted
        ? copy.todayContinueTitle
        : copy.todayStartTitle;
  const planDescription =
    hasReview && firstReview
      ? copy.todayReviewDescription(progressSummary.reviewItems.length)
      : progressSummary.lessonComplete
        ? copy.todayCompleteDescription
        : progressSummary.nextPracticeTarget
          ? copy.todayContinueDescription(
              progressSummary.nextPracticeTarget.character.character,
              progressSummary.nextPracticeTarget.character.pinyin
            )
          : copy.todayStartDescription;
  const planSteps = hasReview
    ? copy.todayReviewSteps(progressSummary.reviewItems.length)
    : progressSummary.lessonComplete
      ? copy.todayCompleteSteps
      : hasStarted && progressSummary.nextPracticeTarget
        ? copy.todayContinueSteps(
            progressSummary.nextPracticeTarget.character.character
          )
        : copy.todayStartSteps(primaryCharacter);
  const primaryActionLabel = hasReview
    ? copy.reviewCta
    : progressSummary.lessonComplete
      ? copy.practiceAgainCta
      : hasStarted
        ? copy.continueCta
        : copy.practiceCta;
  const worksheetActionLabel = hasReview
    ? copy.reviewWorksheetCta
    : hasStarted
      ? copy.continueWorksheetCta
      : copy.worksheetCta;
  const reviewWorksheetSearch: CourseWorksheetSearch = {
    characters:
      progressSummary.reviewCharacters.length > 0
        ? progressSummary.reviewCharacters
        : worksheetCharacters,
    details: true,
    note:
      progressSummary.reviewCharacters.length > 0
        ? copy.reviewWorksheetNote(progressSummary.reviewCharacters.length)
        : copy.continueWorksheetNote,
    trace: progressSummary.reviewCharacters.length > 0 ? 'guided' : 'first',
  };
  const targetProgressValue = Math.min(
    100,
    Math.round((progressSummary.completedTodayCount / dailyTarget) * 100)
  );

  return (
    <section className="grid gap-5 rounded-lg border border-primary/20 bg-primary/5 p-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-md">
            <IconFlame className="size-3.5" />
            {copy.todayBadge}
          </Badge>
          {hasStarted ? (
            <Badge variant="outline" className="rounded-md">
              <IconTargetArrow className="size-3.5" />
              {copy.streakBadge(progressSummary.currentStreakDays)}
            </Badge>
          ) : null}
          {hasStarted ? (
            <Badge variant="outline" className="rounded-md">
              {copy.progressBadge(
                progressSummary.completedCount,
                progressSummary.total
              )}
            </Badge>
          ) : null}
          {hasReview ? (
            <Badge variant="outline" className="rounded-md">
              <IconRotate className="size-3.5" />
              {copy.reviewBadge(progressSummary.reviewItems.length)}
            </Badge>
          ) : null}
        </div>
        <div className="max-w-3xl space-y-1">
          <h2 className="text-xl font-semibold">{planTitle}</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            {planDescription}
          </p>
        </div>
        {hasReview ? (
          <ReviewFocusList
            copy={copy}
            reviewItems={progressSummary.reviewItems}
            scopeCharacters={worksheetCharacters}
          />
        ) : null}
      </div>
      <div className="rounded-lg border bg-background/85 p-3">
        <div className="mb-4 border-b pb-4">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-primary/10 p-2 text-primary">
              <IconClockHour4 className="size-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">{copy.todayTargetTitle}</p>
                <Badge variant="secondary" className="rounded-md">
                  {copy.todayTargetBadge(
                    progressSummary.completedTodayCount,
                    dailyTarget
                  )}
                </Badge>
              </div>
              <Progress className="mt-3" value={targetProgressValue} />
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {progressSummary.completedTodayCount >= dailyTarget
                  ? copy.todayTargetComplete
                  : copy.todayTargetDescription(
                      dailyTarget - progressSummary.completedTodayCount
                    )}
              </p>
            </div>
          </div>
        </div>
        <p className="text-sm font-medium">{copy.todayStepsTitle}</p>
        <ol className="mt-3 grid gap-2">
          {planSteps.map((step, index) => (
            <li key={step} className="flex items-start gap-2 text-sm">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-medium text-primary">
                {index + 1}
              </span>
              <span className="leading-5 text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>
        <div className="mt-4 flex flex-wrap gap-2">
          {primaryCharacter ? (
            <Link
              to={Routes.Learn}
              search={{
                character: primaryCharacter,
                characters: worksheetCharacters,
              }}
              className={buttonVariants()}
            >
              <IconPencil className="size-4" />
              {primaryActionLabel}
            </Link>
          ) : null}
          <Link
            to={Routes.Worksheets}
            search={reviewWorksheetSearch}
            className={cn(buttonVariants({ variant: 'outline' }))}
          >
            <IconFileText className="size-4" />
            {worksheetActionLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}

function LessonSection({
  copy,
  index,
  lesson,
  progress,
  progressSummary,
  worksheetCharacters,
}: {
  copy: ReturnType<typeof getCourseCopy>;
  index: number;
  lesson: CourseLesson;
  progress: StoredProgress;
  progressSummary: HanziProgressSummary;
  worksheetCharacters: string[];
}) {
  const firstReview = progressSummary.reviewItems[0];
  const firstAvailableCharacter = lesson.characters.find(
    (item) => !item.premium
  );
  const actionCharacter =
    firstReview?.character ??
    progressSummary.nextPracticeTarget?.character ??
    firstAvailableCharacter;
  const hasReview = progressSummary.reviewItems.length > 0;
  const lessonComplete =
    progressSummary.total > 0 && progressSummary.lessonComplete;
  const lessonPrompt = hasReview
    ? copy.lessonReviewPrompt(progressSummary.reviewItems.length)
    : lessonComplete
      ? copy.lessonCompletePrompt
      : progressSummary.completedCount > 0
        ? copy.lessonContinuePrompt(
            progressSummary.completedCount,
            progressSummary.total
          )
        : copy.lessonStartPrompt;
  const lessonActionLabel = hasReview
    ? copy.lessonReviewCta
    : lessonComplete
      ? copy.lessonPracticeAgainCta
      : progressSummary.completedCount > 0
        ? copy.lessonContinueCta
        : copy.lessonStartCta;
  const worksheetSearch: CourseWorksheetSearch = {
    characters: hasReview
      ? progressSummary.reviewCharacters
      : worksheetCharacters,
    details: true,
    note: hasReview
      ? copy.lessonReviewWorksheetNote(
          lesson.title,
          progressSummary.reviewCharacters.length
        )
      : copy.lessonWorksheetNote(lesson.title),
    trace: hasReview ? ('guided' as const) : ('first' as const),
  };

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <CardDescription>{copy.lessonLabel(index + 1)}</CardDescription>
            <CardTitle>{lesson.title}</CardTitle>
            <CardDescription className="max-w-2xl">
              {lesson.description}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {copy.lessonCharacters(lesson.characters.length)}
            </Badge>
            {lesson.lockedCount > 0 ? (
              <Badge variant="outline">
                <IconLock className="size-3.5" />
                {copy.lockedCharacters(lesson.lockedCount)}
              </Badge>
            ) : (
              <Badge variant="outline">
                <IconCircleCheck className="size-3.5" />
                {copy.freeLesson}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid gap-3 rounded-lg bg-muted/30 p-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium">
                {copy.lessonProgressTitle}
              </span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {copy.progressBadge(
                  progressSummary.completedCount,
                  progressSummary.total
                )}
              </span>
            </div>
            <Progress value={progressSummary.progressValue} />
            <p className="text-xs leading-5 text-muted-foreground">
              {lessonPrompt}
            </p>
            {hasReview ? (
              <ReviewFocusList
                compact
                copy={copy}
                reviewItems={progressSummary.reviewItems}
                scopeCharacters={worksheetCharacters}
              />
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            {actionCharacter ? (
              <Link
                to={Routes.Learn}
                search={{
                  character: actionCharacter.character,
                  characters: worksheetCharacters,
                }}
                className={buttonVariants()}
              >
                <IconPencil className="size-4" />
                {lessonActionLabel}
              </Link>
            ) : null}
            {worksheetCharacters.length > 0 ? (
              <Link
                to={Routes.Worksheets}
                search={worksheetSearch}
                className={cn(buttonVariants({ variant: 'outline' }))}
              >
                <IconFileText className="size-4" />
                {hasReview
                  ? copy.lessonReviewWorksheetCta
                  : copy.lessonWorksheetCta}
              </Link>
            ) : null}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {lesson.characters.map((character) => (
            <CharacterTile
              character={character}
              copy={copy}
              key={character.character}
              progress={progress[character.character]}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewFocusList({
  compact = false,
  copy,
  reviewItems,
  scopeCharacters,
}: {
  compact?: boolean;
  copy: ReturnType<typeof getCourseCopy>;
  reviewItems: HanziReviewItem[];
  scopeCharacters: string[];
}) {
  const visibleItems = reviewItems.slice(0, compact ? 2 : 3);

  return (
    <div
      className={cn(
        'grid gap-2',
        compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2 xl:grid-cols-3'
      )}
    >
      {visibleItems.map((item) => {
        const mistakeStrokes = item.progress.mistakeStrokes ?? [];

        return (
          <Link
            key={item.character.character}
            to={Routes.Learn}
            search={{
              character: item.character.character,
              characters: scopeCharacters,
            }}
            className={cn(
              'group rounded-lg border bg-background/75 p-3 text-left',
              'transition-colors hover:border-primary/50 hover:bg-background'
            )}
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-2xl font-semibold">
                {item.character.character}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  {item.character.pinyin} · {item.character.meaning}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {copy.reviewFocusMistakes(item.progress.mistakes)}
                </div>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
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
                {copy.reviewFocusUrgency[item.urgency]}
              </Badge>
              {mistakeStrokes.length > 0 ? (
                mistakeStrokes.slice(0, 3).map((stroke) => (
                  <Badge
                    key={`${item.character.character}-${stroke}`}
                    variant="secondary"
                    className="rounded-md"
                  >
                    {copy.reviewFocusStroke(getDisplayStrokeNumber(stroke))}
                  </Badge>
                ))
              ) : (
                <Badge variant="outline" className="rounded-md">
                  {copy.reviewFocusFullTrace}
                </Badge>
              )}
              {mistakeStrokes.length > 3 ? (
                <Badge variant="outline" className="rounded-md">
                  {copy.reviewFocusMore(mistakeStrokes.length - 3)}
                </Badge>
              ) : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function LearningRhythmStats({
  copy,
  progressSummary,
}: {
  copy: ReturnType<typeof getCourseCopy>;
  progressSummary: HanziProgressSummary;
}) {
  const stats = [
    {
      label: copy.streakLabel,
      value: copy.streakValue(progressSummary.currentStreakDays),
    },
    {
      label: copy.activeDaysLabel,
      value: copy.activeDaysValue(progressSummary.activeDayCount),
    },
  ];

  return (
    <div className="col-span-2 rounded-lg border bg-muted/30 p-3">
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-background p-2 ring-1 ring-border">
          <IconTargetArrow className="size-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium">{copy.rhythmTitle}</div>
          <div className="mt-1 text-xs leading-5 text-muted-foreground">
            {progressSummary.completedCount > 0
              ? copy.rhythmDescription(
                  progressSummary.currentStreakDays,
                  progressSummary.practicedToday
                )
              : copy.rhythmEmptyDescription}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {stats.map((item) => (
              <div key={item.label} className="rounded-md bg-background p-2">
                <div className="text-lg font-semibold">{item.value}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CharacterTile({
  character,
  copy,
  progress,
}: {
  character: LessonCharacter;
  copy: ReturnType<typeof getCourseCopy>;
  progress?: CharacterProgress;
}) {
  const completed = progress?.completed;
  const needsReview = completed && progress.mistakes > 0;

  return (
    <Link
      to={getHanziPath(character.character)}
      className={cn(
        'group rounded-lg border bg-card p-4 transition-colors',
        'hover:border-primary/50 hover:bg-muted/40'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-14 items-center justify-center rounded-lg bg-muted text-4xl font-semibold">
          {character.character}
        </div>
        {character.premium ? (
          <Badge variant="outline" className="rounded-md">
            <IconLock className="size-3.5" />
            {copy.proBadge}
          </Badge>
        ) : needsReview ? (
          <Badge
            variant="outline"
            className="rounded-md border-amber-500/40 text-amber-700 dark:text-amber-300"
          >
            <IconRotate className="size-3.5" />
            {copy.tileReviewBadge}
          </Badge>
        ) : completed ? (
          <Badge variant="secondary" className="rounded-md">
            <IconCircleCheck className="size-3.5" />
            {copy.tileCompleteBadge}
          </Badge>
        ) : (
          <Badge variant="secondary" className="rounded-md">
            {copy.freeBadge}
          </Badge>
        )}
      </div>
      <div className="mt-4 space-y-1">
        <h3 className="font-medium">
          {character.pinyin} · {character.meaning}
        </h3>
        <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
          {character.hint}
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>{copy.strokeCount(character.strokes)}</span>
        <span className="inline-flex items-center gap-1 text-primary opacity-90">
          {copy.details}
          <IconArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="mt-1 text-muted-foreground">{label}</div>
    </div>
  );
}

type CourseWorksheetSearch = {
  characters: string[];
  details: boolean;
  note: string;
  trace: 'first' | 'guided';
};

type ProgressShareMessageParams = {
  nextCharacter?: LessonCharacter;
  practiceUrl: string;
  progressSummary: HanziProgressSummary;
  reviewItems: HanziReviewItem[];
  worksheetUrl: string;
};

type ProgressBackupParams = {
  locale: 'en' | 'zh';
  progress: StoredProgress;
  progressSummary: HanziProgressSummary;
};

function getCourseCopy(locale: 'en' | 'zh') {
  if (locale === 'zh') {
    return {
      badge: '课程目录',
      description:
        '一条适合中文初学者、家长和老师的 HSK1 汉字路径：先练能马上上手的基础字，再逐步进入词汇、复习和打印练习。',
      details: '详情',
      freeBadge: '免费',
      freeLabel: '免费字',
      freeLesson: '免费小课',
      activeDaysLabel: '活跃学习日',
      activeDaysValue: (count: number) => `${count} 天`,
      cancelCta: '取消',
      continueBadge: '继续学习',
      continueCta: '继续练习',
      continueDescription: (character: string, pinyin: string) =>
        `下一步练 ${character} · ${pinyin}，保持上次的学习节奏。`,
      continueTitle: '接着上次学',
      continueWorksheetCta: '打印本课练习纸',
      continueWorksheetNote: '把已学汉字带到纸面上复习一遍。',
      finishedDescription:
        '免费入门组已经完成。现在适合打印整组练习纸，巩固真正的手写记忆。',
      finishedTitle: '入门组已完成',
      lessonCharacters: (count: number) => `${count} 个汉字`,
      lessonCompletePrompt: '这一组已经完成，适合打印出来做一次纸笔巩固。',
      lessonContinueCta: '继续本组',
      lessonContinuePrompt: (completed: number, total: number) =>
        `本组已完成 ${completed}/${total}，继续把剩下的字练完。`,
      lessonLabel: (index: number) => `第 ${index} 组`,
      lessonPracticeAgainCta: '再练本组',
      lessonProgressTitle: '本组进度',
      lessonReviewCta: '复习本组错字',
      lessonReviewPrompt: (count: number) =>
        `${count} 个字有错笔，先复习它们再继续新字。`,
      lessonReviewWorksheetCta: '打印本组错字',
      lessonReviewWorksheetNote: (lesson: string, count: number) =>
        `${lesson}：优先复习 ${count} 个有错笔的汉字。`,
      lessonStartCta: '练这一组',
      lessonStartPrompt: '从本组第一个免费汉字开始，先看笔顺再描写。',
      lessonWorksheetCta: '打印本组',
      lessonWorksheetNote: (lesson: string) =>
        `${lesson}：完成这一组汉字的纸笔练习。`,
      levelBadge: '中文初学者',
      lockedCharacters: (count: number) => `${count} 个 Pro 字`,
      practiceAgainCta: '再练一遍',
      practiceCta: '开始练习',
      premiumLabel: 'Pro 字',
      proBadge: 'Pro',
      progressBackupCta: '复制进度备份',
      progressBackupSuccess: '进度备份已复制。',
      progressRestoreConfirmCta: '恢复进度',
      progressRestoreCta: '恢复进度',
      progressRestoreDescription:
        '粘贴之前复制的 Lang Study 进度备份。恢复后会替换这个浏览器里的 HSK1 本地进度，不会上传到服务器。',
      progressRestoreError: '无法识别这个备份，请检查是否粘贴了完整 JSON。',
      progressRestoreHint:
        '只支持 Lang Study 生成的 HSK1 进度备份，恢复前建议先复制一份当前进度备份。',
      progressRestoreInputLabel: '进度备份 JSON',
      progressRestorePlaceholder: '粘贴从“复制进度备份”得到的 JSON 内容...',
      progressRestoreSuccess: '进度已恢复。',
      progressRestoreTitle: '恢复 HSK1 学习进度',
      progressShareCta: '复制进度报告',
      progressShareMessage: ({
        nextCharacter,
        practiceUrl,
        progressSummary,
        reviewItems,
        worksheetUrl,
      }: ProgressShareMessageParams) => {
        const reviewCharacters = reviewItems
          .slice(0, 4)
          .map((item) => item.character.character)
          .join(' ');

        return [
          'Lang Study HSK1 学习进度',
          '',
          `已完成：${progressSummary.completedCount}/${progressSummary.total}`,
          `今日练习：${progressSummary.completedTodayCount}`,
          `连续记录：${progressSummary.currentStreakDays} 天`,
          reviewItems.length > 0
            ? `待复习：${reviewCharacters}${
                reviewItems.length > 4 ? ` 等 ${reviewItems.length} 个` : ''
              }`
            : '待复习：暂无错字队列',
          nextCharacter
            ? `下一步：练习 ${nextCharacter.character} · ${nextCharacter.pinyin}`
            : '下一步：打印整组练习纸做纸笔巩固',
          '',
          `线上练习：${practiceUrl}`,
          `练习纸：${worksheetUrl}`,
        ].join('\n');
      },
      progressShareSuccess: '学习进度报告已复制。',
      progressBadge: (completed: number, total: number) =>
        `${completed}/${total} 已完成`,
      reviewBadge: (count: number) => `${count} 个待复习`,
      reviewCta: '先复习错字',
      reviewDescription: (character: string, mistakes: number) =>
        `先处理最容易出错的字：${character}，上次错误 ${mistakes} 次。`,
      reviewFocusFullTrace: '完整描写',
      reviewFocusMistakes: (count: number) => `${count} 次错误`,
      reviewFocusMore: (count: number) => `+${count} 笔`,
      reviewFocusStroke: (stroke: number) => `第 ${stroke} 笔`,
      reviewFocusUrgency: {
        due: '该复习',
        fresh: '今日已练',
        overdue: '优先',
        unscheduled: '待安排',
      },
      returnCompleteDescription:
        '下次回来先打印整组练习纸，再把圈出的难字带回线上复习。',
      returnCompleteTitle: '下次做纸笔巩固',
      returnContinueDescription: (pinyin: string) =>
        `先复习上次字形，再继续 ${pinyin} 这个字。`,
      returnContinueTitle: (character: string) => `下次继续 ${character}`,
      returnDescription:
        '给下一次学习留一个明确入口，减少重新打开时的选择成本。',
      returnReviewDescription: (
        mistakes: number,
        urgency: HanziReviewItem['urgency']
      ) =>
        urgency === 'fresh'
          ? `今天已经练过但还有 ${mistakes} 次错误，适合短复习一次。`
          : `上次记录 ${mistakes} 次错误，下次先清掉这个复习项。`,
      returnReviewTitle: (character: string) => `下次先复习 ${character}`,
      returnStartDescription:
        '从第一个免费字开始，完成一次描写就能建立学习节奏。',
      returnStartTitle: '下次从第一个字开始',
      returnTitle: '下次回来',
      reviewTitle: '先复习，再继续',
      reviewWorksheetCta: '打印错字复习纸',
      reviewWorksheetNote: (count: number) =>
        `优先复习你错得最多的 ${count} 个汉字。`,
      rhythmDescription: (streakDays: number, practicedToday: boolean) =>
        practicedToday
          ? `今天已经完成一次练习，连续学习 ${Math.max(streakDays, 1)} 天。`
          : streakDays > 0
            ? `昨天还在练，今天完成一个字就能延续 ${streakDays} 天连续记录。`
            : '今天完成一个字，就能重新开始连续学习记录。',
      rhythmEmptyDescription: '完成第一个描写练习后，这里会记录学习节奏。',
      rhythmTitle: '学习节奏',
      streakBadge: (count: number) =>
        count > 0 ? `${count} 天连续` : '今日待练',
      streakLabel: '连续天数',
      streakValue: (count: number) => `${count} 天`,
      strokesLabel: '总笔画',
      strokeCount: (count: number) => `${count} 画`,
      summaryDescription: '当前公开的启动课程数据。',
      summaryTitle: 'HSK1 Starter',
      shareError: '复制失败，请稍后重试。',
      tileCompleteBadge: '已完成',
      tileReviewBadge: '复习',
      todayBadge: '今日计划',
      todayCompleteDescription:
        '免费入门组已经完成。今天适合做一次纸笔复习，再挑错笔回到线上巩固。',
      todayCompleteSteps: [
        '打印整组练习纸',
        '圈出最难写的字',
        '回到线上复习错笔',
      ],
      todayCompleteTitle: '今天做一次纸笔巩固',
      todayContinueDescription: (character: string, pinyin: string) =>
        `下一步练 ${character} · ${pinyin}，先看笔顺，再完成一次描写。`,
      todayContinueSteps: (character: string) => [
        `继续练 ${character}`,
        '完成一次描写并记录错笔',
        '把本组打印出来做纸面复习',
      ],
      todayContinueTitle: '接着上次继续',
      todayReviewDescription: (count: number) =>
        `${count} 个汉字有错笔记录。今天先把它们清掉，再继续新字。`,
      todayReviewSteps: (count: number) => [
        `先复习 ${count} 个错字`,
        '重点看错笔对应的笔顺动画',
        '打印错字复习纸做一遍纸笔练习',
      ],
      todayReviewTitle: '今天先复习错笔',
      todayStartDescription:
        '用 10 分钟完成第一个免费汉字：先看笔顺，再跟着描写，最后打印一张小练习纸。',
      todayStartSteps: (character: string) => [
        `从 ${character} 开始看笔顺`,
        '完成一次跟随描写',
        '打印入门 6 字练习纸',
      ],
      todayStartTitle: '从 10 分钟入门练习开始',
      todayStepsTitle: '建议顺序',
      todayTargetBadge: (completed: number, target: number) =>
        `${completed}/${target} 今日目标`,
      todayTargetComplete: '今天的最低练习量已经完成，可以进入纸笔巩固。',
      todayTargetDescription: (remaining: number) =>
        `再完成 ${remaining} 个汉字，就能达成今天的最低练习量。`,
      todayTargetTitle: '今日目标',
      title: 'HSK1 汉字学习路径',
      totalLabel: '总汉字',
      upgradeCta: '查看套餐',
      upgradeDescription:
        '下一阶段会把完整 HSK1 字表、间隔复习、错字历史、自定义字表和老师/家长作业场景串起来。现在先用公开内容验证真实学习体验。',
      upgradeEyebrow: '商业化路径',
      upgradeTitle: '从免费练习过渡到完整 HSK1 工具包',
      worksheetCta: '生成练习纸',
    };
  }

  return {
    badge: 'Course catalog',
    description:
      'A practical HSK1 character path for Chinese beginners, parents, and teachers: start with writable foundation characters, then move into words, review, and printable practice.',
    details: 'Details',
    freeBadge: 'Free',
    freeLabel: 'Free',
    freeLesson: 'Free lesson',
    activeDaysLabel: 'Active days',
    activeDaysValue: (count: number) => `${count} days`,
    cancelCta: 'Cancel',
    continueBadge: 'Continue',
    continueCta: 'Continue practice',
    continueDescription: (character: string, pinyin: string) =>
      `Next up: ${character} · ${pinyin}. Pick up where you left off.`,
    continueTitle: 'Pick up your last session',
    continueWorksheetCta: 'Print lesson sheet',
    continueWorksheetNote: 'Review the characters you have learned on paper.',
    finishedDescription:
      'You finished the free starter set. Print the full set now to reinforce real handwriting memory.',
    finishedTitle: 'Starter set complete',
    lessonCharacters: (count: number) => `${count} characters`,
    lessonCompletePrompt:
      'This lesson is complete. Print it once to reinforce handwriting memory.',
    lessonContinueCta: 'Continue lesson',
    lessonContinuePrompt: (completed: number, total: number) =>
      `${completed}/${total} complete in this lesson. Finish the remaining characters next.`,
    lessonLabel: (index: number) => `Lesson ${index}`,
    lessonPracticeAgainCta: 'Practice again',
    lessonProgressTitle: 'Lesson progress',
    lessonReviewCta: 'Review lesson',
    lessonReviewPrompt: (count: number) =>
      `${count} characters have missed strokes. Review them before adding new ones.`,
    lessonReviewWorksheetCta: 'Print review',
    lessonReviewWorksheetNote: (lesson: string, count: number) =>
      `${lesson}: review the ${count} characters with missed strokes first.`,
    lessonStartCta: 'Practice lesson',
    lessonStartPrompt:
      'Start with the first free character in this lesson: watch, trace, then review.',
    lessonWorksheetCta: 'Print lesson',
    lessonWorksheetNote: (lesson: string) =>
      `${lesson}: finish this character set on paper.`,
    levelBadge: 'Beginner Chinese',
    lockedCharacters: (count: number) => `${count} Pro`,
    practiceAgainCta: 'Practice again',
    practiceCta: 'Start practice',
    premiumLabel: 'Pro',
    proBadge: 'Pro',
    progressBackupCta: 'Copy progress backup',
    progressBackupSuccess: 'Progress backup copied.',
    progressRestoreConfirmCta: 'Restore progress',
    progressRestoreCta: 'Restore progress',
    progressRestoreDescription:
      'Paste a Lang Study progress backup you copied earlier. Restoring replaces the HSK1 progress stored in this browser and does not upload anything.',
    progressRestoreError:
      'This backup could not be read. Check that the full JSON was pasted.',
    progressRestoreHint:
      'Only HSK1 progress backups generated by Lang Study are supported. Copy your current backup first if you may need it later.',
    progressRestoreInputLabel: 'Progress backup JSON',
    progressRestorePlaceholder: 'Paste the JSON from "Copy progress backup"...',
    progressRestoreSuccess: 'Progress restored.',
    progressRestoreTitle: 'Restore HSK1 progress',
    progressShareCta: 'Copy progress report',
    progressShareMessage: ({
      nextCharacter,
      practiceUrl,
      progressSummary,
      reviewItems,
      worksheetUrl,
    }: ProgressShareMessageParams) => {
      const reviewCharacters = reviewItems
        .slice(0, 4)
        .map((item) => item.character.character)
        .join(' ');

      return [
        'Lang Study HSK1 progress report',
        '',
        `Completed: ${progressSummary.completedCount}/${progressSummary.total}`,
        `Practiced today: ${progressSummary.completedTodayCount}`,
        `Current streak: ${progressSummary.currentStreakDays} days`,
        reviewItems.length > 0
          ? `Review queue: ${reviewCharacters}${
              reviewItems.length > 4
                ? ` and ${reviewItems.length - 4} more`
                : ''
            }`
          : 'Review queue: no missed-stroke items yet',
        nextCharacter
          ? `Next step: practice ${nextCharacter.character} · ${nextCharacter.pinyin}`
          : 'Next step: print the full starter set for paper reinforcement',
        '',
        `Online practice: ${practiceUrl}`,
        `Worksheet: ${worksheetUrl}`,
      ].join('\n');
    },
    progressShareSuccess: 'Progress report copied.',
    progressBadge: (completed: number, total: number) =>
      `${completed}/${total} complete`,
    reviewBadge: (count: number) => `${count} to review`,
    reviewCta: 'Review mistakes',
    reviewDescription: (character: string, mistakes: number) =>
      `Start with ${character}, the character you missed ${mistakes} times last run.`,
    reviewFocusFullTrace: 'Full trace',
    reviewFocusMistakes: (count: number) => `${count} mistakes`,
    reviewFocusMore: (count: number) => `+${count} strokes`,
    reviewFocusStroke: (stroke: number) => `Stroke ${stroke}`,
    reviewFocusUrgency: {
      due: 'Due',
      fresh: 'Today',
      overdue: 'Priority',
      unscheduled: 'Needs date',
    },
    returnCompleteDescription:
      'Start by printing the set, then bring circled hard characters back into tracing.',
    returnCompleteTitle: 'Do a paper reinforcement pass',
    returnContinueDescription: (pinyin: string) =>
      `Refresh the previous shape, then continue with ${pinyin}.`,
    returnContinueTitle: (character: string) =>
      `Continue with ${character} next`,
    returnDescription:
      'Leave a clear entry point for the next session so restarting takes less thought.',
    returnReviewDescription: (
      mistakes: number,
      urgency: HanziReviewItem['urgency']
    ) =>
      urgency === 'fresh'
        ? `You practiced today but still logged ${mistakes} mistakes. Make the next visit a short review.`
        : `Last run logged ${mistakes} mistakes. Clear this review item first next time.`,
    returnReviewTitle: (character: string) =>
      `Review ${character} first next time`,
    returnStartDescription:
      'Start with the first free character and complete one tracing run to build rhythm.',
    returnStartTitle: 'Start with the first character',
    returnTitle: 'Next return',
    reviewTitle: 'Review first, then continue',
    reviewWorksheetCta: 'Print review sheet',
    reviewWorksheetNote: (count: number) =>
      `Review the ${count} characters you missed most.`,
    rhythmDescription: (streakDays: number, practicedToday: boolean) =>
      practicedToday
        ? `You have practiced today and kept a ${Math.max(streakDays, 1)}-day streak.`
        : streakDays > 0
          ? `You practiced yesterday. Finish one character today to keep the ${streakDays}-day streak alive.`
          : 'Finish one character today to restart your learning streak.',
    rhythmEmptyDescription:
      'Finish your first tracing run and this will start tracking your rhythm.',
    rhythmTitle: 'Learning rhythm',
    streakBadge: (count: number) =>
      count > 0 ? `${count}-day streak` : 'Practice today',
    streakLabel: 'Streak',
    streakValue: (count: number) => `${count} days`,
    strokesLabel: 'Strokes',
    strokeCount: (count: number) => `${count} strokes`,
    summaryDescription: 'Currently published starter course data.',
    summaryTitle: 'HSK1 Starter',
    shareError: 'Could not copy. Please try again.',
    tileCompleteBadge: 'Done',
    tileReviewBadge: 'Review',
    todayBadge: 'Today',
    todayCompleteDescription:
      'The free starter set is complete. Use today for one paper pass, then bring tricky characters back into tracing.',
    todayCompleteSteps: [
      'Print the full starter set',
      'Circle the hardest characters',
      'Review missed strokes online',
    ],
    todayCompleteTitle: 'Do one paper review pass today',
    todayContinueDescription: (character: string, pinyin: string) =>
      `Next up: ${character} · ${pinyin}. Watch the stroke order, then finish one tracing run.`,
    todayContinueSteps: (character: string) => [
      `Continue with ${character}`,
      'Finish one tracing run and record missed strokes',
      'Print this lesson set for paper review',
    ],
    todayContinueTitle: 'Pick up where you left off',
    todayReviewDescription: (count: number) =>
      `${count} characters have missed strokes saved. Clear those first, then add a new character.`,
    todayReviewSteps: (count: number) => [
      `Review ${count} missed characters`,
      'Watch the stroke animation for the missed strokes',
      'Print a focused review sheet',
    ],
    todayReviewTitle: 'Review missed strokes first',
    todayStartDescription:
      'Spend 10 minutes on the first free character: watch stroke order, trace once, then print a small starter sheet.',
    todayStartSteps: (character: string) => [
      `Start with ${character}`,
      'Complete one guided tracing run',
      'Print the starter-six worksheet',
    ],
    todayStartTitle: 'Start with a 10-minute practice plan',
    todayStepsTitle: 'Suggested order',
    todayTargetBadge: (completed: number, target: number) =>
      `${completed}/${target} today`,
    todayTargetComplete:
      'The minimum practice target is complete. Move into paper reinforcement.',
    todayTargetDescription: (remaining: number) =>
      `Complete ${remaining} more ${
        remaining === 1 ? 'character' : 'characters'
      } to hit today's minimum practice target.`,
    todayTargetTitle: "Today's target",
    title: 'HSK1 Chinese Character Learning Path',
    totalLabel: 'Total',
    upgradeCta: 'View plans',
    upgradeDescription:
      'The next stage connects the full HSK1 character list, spaced review, mistake history, custom lists, and teacher/parent assignment workflows. The public starter set validates the core learning experience first.',
    upgradeEyebrow: 'Commercial path',
    upgradeTitle: 'Move from free practice into the complete HSK1 toolkit',
    worksheetCta: 'Make worksheet',
  };
}

function buildCoursePracticeUrl(
  character: string | undefined,
  characters: string[]
) {
  const params = new URLSearchParams();

  if (character) {
    params.set('character', character);
  }

  for (const item of characters) {
    params.append('characters', item);
  }

  const search = params.toString();
  return `https://${COURSE_SHARE_DOMAIN}${Routes.Learn}${
    search ? `?${search}` : ''
  }`;
}

function buildCourseWorksheetUrl(search: CourseWorksheetSearch) {
  const params = new URLSearchParams();

  for (const character of search.characters) {
    params.append('characters', character);
  }

  params.set('details', search.details ? 'true' : 'false');
  params.set('note', search.note);
  params.set('trace', search.trace);

  return `https://${COURSE_SHARE_DOMAIN}${Routes.Worksheets}?${params.toString()}`;
}

function buildProgressBackup({
  locale,
  progress,
  progressSummary,
}: ProgressBackupParams) {
  return {
    app: 'Lang Study',
    exportedAt: new Date().toISOString(),
    locale,
    progress,
    schemaVersion: 1,
    source: `https://${COURSE_SHARE_DOMAIN}${Routes.Hsk1}`,
    summary: {
      activeDayCount: progressSummary.activeDayCount,
      cleanCount: progressSummary.cleanCount,
      completedCount: progressSummary.completedCount,
      completedTodayCount: progressSummary.completedTodayCount,
      currentStreakDays: progressSummary.currentStreakDays,
      lessonComplete: progressSummary.lessonComplete,
      reviewCharacters: progressSummary.reviewCharacters,
      total: progressSummary.total,
    },
    type: PROGRESS_BACKUP_TYPE,
  };
}

function parseProgressBackup(value: string): StoredProgress | null {
  let parsed: unknown;

  try {
    parsed = JSON.parse(value);
  } catch {
    return null;
  }

  if (
    !isPlainRecord(parsed) ||
    parsed.schemaVersion !== PROGRESS_BACKUP_SCHEMA_VERSION ||
    parsed.type !== PROGRESS_BACKUP_TYPE ||
    !isPlainRecord(parsed.progress)
  ) {
    return null;
  }

  const nextProgress: StoredProgress = {};

  for (const [character, item] of Object.entries(parsed.progress)) {
    const characterProgress = parseCharacterProgress(item);

    if (!character.trim() || !characterProgress) {
      return null;
    }

    nextProgress[character] = characterProgress;
  }

  return nextProgress;
}

function parseCharacterProgress(value: unknown): CharacterProgress | null {
  if (!isPlainRecord(value)) {
    return null;
  }

  if (
    typeof value.completed !== 'boolean' ||
    !isValidProgressCount(value.correctStrokes) ||
    !isValidProgressCount(value.mistakes)
  ) {
    return null;
  }

  if (
    value.completedAt !== undefined &&
    (typeof value.completedAt !== 'string' ||
      Number.isNaN(Date.parse(value.completedAt)))
  ) {
    return null;
  }

  const mistakeStrokes = parseMistakeStrokes(value.mistakeStrokes);

  if (mistakeStrokes === null) {
    return null;
  }

  return {
    completed: value.completed,
    completedAt: value.completedAt,
    correctStrokes: value.correctStrokes,
    mistakeStrokes,
    mistakes: value.mistakes,
  };
}

function parseMistakeStrokes(value: unknown): number[] | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (
    !Array.isArray(value) ||
    value.some((item) => !Number.isInteger(item) || item < 0)
  ) {
    return null;
  }

  return value;
}

function isValidProgressCount(value: unknown): value is number {
  return Number.isInteger(value) && value >= 0;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
