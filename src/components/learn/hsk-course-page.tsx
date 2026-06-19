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
import { LearningGuideLinks } from '@/components/learn/learning-guide-links';
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
import { getPathWithLocale } from '@/lib/urls';
import { cn } from '@/lib/utils';
import {
  IconArrowRight,
  IconBook2,
  IconCircleCheck,
  IconClockHour4,
  IconCopy,
  IconDatabaseExport,
  IconDatabaseImport,
  IconDownload,
  IconEyeCheck,
  IconFileText,
  IconFlame,
  IconLock,
  IconPencil,
  IconRotate,
  IconSparkles,
  IconTargetArrow,
  IconUpload,
  IconUsers,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { toast } from 'sonner';

const COURSE_SHARE_DOMAIN = 'getlangstudy.com';
const PROGRESS_BACKUP_SCHEMA_VERSION = 1;
const PROGRESS_BACKUP_TYPE = 'hsk1-progress-backup';
const MAX_PROGRESS_BACKUP_FILE_SIZE = 256 * 1024;

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
  const backupFileInputRef = useRef<HTMLInputElement>(null);
  const backupPreview = useMemo(
    () => parseProgressBackup(backupInput.trim())?.preview,
    [backupInput]
  );
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
    freeCharacters,
    currentLocale
  );
  const primaryWorksheetUrl = buildCourseWorksheetUrl(
    primaryWorksheetSearch,
    currentLocale
  );
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
  const copyNextLessonPlan = async () => {
    if (
      typeof window === 'undefined' ||
      !window.navigator.clipboard?.writeText
    ) {
      toast.error(copy.shareError);
      return;
    }

    const plan = copy.nextLessonPlanMessage({
      nextCharacter: primaryPracticeCharacter,
      practiceUrl: primaryPracticeUrl,
      progressSummary,
      reviewItems: progressSummary.reviewItems,
      worksheetUrl: primaryWorksheetUrl,
    });

    try {
      await window.navigator.clipboard.writeText(plan);
      toast.success(copy.nextLessonPlanSuccess);
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
  const downloadProgressBackup = () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      toast.error(copy.progressBackupDownloadError);
      return;
    }

    const backup = buildProgressBackup({
      locale: currentLocale,
      progress,
      progressSummary,
    });

    try {
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = buildProgressBackupFileName();
      document.body.append(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(copy.progressBackupDownloadSuccess);
    } catch {
      toast.error(copy.progressBackupDownloadError);
    }
  };
  const updateRestoreDialogOpen = (open: boolean) => {
    setRestoreDialogOpen(open);

    if (!open) {
      setBackupInput('');
    }
  };
  const loadProgressBackupFile = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';

    if (!file) return;

    if (file.size > MAX_PROGRESS_BACKUP_FILE_SIZE) {
      toast.error(copy.progressRestoreFileTooLarge);
      return;
    }

    try {
      setBackupInput(await file.text());
      toast.success(copy.progressRestoreFileLoaded);
    } catch {
      toast.error(copy.progressRestoreError);
    }
  };
  const restoreProgressBackup = () => {
    const parsedBackup = parseProgressBackup(backupInput);

    if (!parsedBackup) {
      toast.error(copy.progressRestoreError);
      return;
    }

    writeStoredHanziProgress(parsedBackup.progress);
    setProgress(parsedBackup.progress);
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
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <div className="min-w-0 space-y-5">
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
                onClick={downloadProgressBackup}
              >
                <IconDownload className="size-4" />
                {copy.progressBackupDownloadCta}
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

          <Card className="min-w-0 rounded-lg">
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
              <input
                ref={backupFileInputRef}
                type="file"
                accept="application/json,.json"
                className="sr-only"
                onChange={loadProgressBackupFile}
              />
              <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-6 text-muted-foreground">
                  {copy.progressRestoreFileHint}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => backupFileInputRef.current?.click()}
                >
                  <IconUpload className="size-4" />
                  {copy.progressRestoreFileCta}
                </Button>
              </div>
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
              {backupInput.trim() ? (
                backupPreview ? (
                  <ProgressBackupPreviewCard
                    copy={copy}
                    preview={backupPreview}
                  />
                ) : (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                    {copy.progressRestoreInvalidPreview}
                  </div>
                )
              ) : null}
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
                disabled={!backupPreview}
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
          onCopyPlan={copyNextLessonPlan}
          progressSummary={progressSummary}
          worksheetCharacters={freeCharacters}
        />

        <LearningGuideLinks mode="course" />

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

        <section className="grid grid-cols-[minmax(0,1fr)] gap-5 rounded-lg border border-primary/20 bg-primary/5 p-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
          <div className="min-w-0 space-y-4">
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
            <div className="grid gap-2 md:grid-cols-3">
              {copy.upgradeValueItems.map((item) => (
                <div
                  key={item.title}
                  className="min-w-0 rounded-lg border bg-background/85 p-3"
                >
                  <div className="mb-2 flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <item.icon className="size-4" />
                  </div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="min-w-0 rounded-lg border bg-background/85 p-3">
            <p className="text-sm font-medium">{copy.upgradeSnapshotTitle}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {copy.upgradeSnapshotDescription}
            </p>
            <div className="mt-3 grid gap-2">
              {copy.upgradeSnapshotStats(stats).map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-3 rounded-md bg-muted/40 px-3 py-2"
                >
                  <span className="text-xs text-muted-foreground">
                    {item.label}
                  </span>
                  <span className="text-sm font-semibold tabular-nums">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-2">
              <Link to={Routes.Pricing} className={buttonVariants()}>
                <IconLock className="size-4" />
                {copy.upgradeCta}
              </Link>
              <Link
                to={Routes.Contact}
                search={{ subject: 'classroom' }}
                className={cn(buttonVariants({ variant: 'outline' }))}
              >
                <IconUsers className="size-4" />
                {copy.upgradeClassroomCta}
              </Link>
            </div>
          </div>
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
  onCopyPlan,
  progressSummary,
  worksheetCharacters,
}: {
  copy: ReturnType<typeof getCourseCopy>;
  dailyTarget: number;
  onCopyPlan: () => void;
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
  const practiceQueueItems = buildDailyPracticeQueueItems({
    copy,
    progressSummary,
    worksheetCharacters,
  });
  const targetProgressValue = Math.min(
    100,
    Math.round((progressSummary.completedTodayCount / dailyTarget) * 100)
  );

  return (
    <section className="grid grid-cols-[minmax(0,1fr)] gap-5 rounded-lg border border-primary/20 bg-primary/5 p-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
      <div className="min-w-0 space-y-3">
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
      <div className="min-w-0 rounded-lg border bg-background/85 p-3">
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
        <DailyPracticeQueue
          copy={copy}
          items={practiceQueueItems}
          worksheetCharacters={worksheetCharacters}
          worksheetSearch={reviewWorksheetSearch}
        />
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
          <Button type="button" variant="outline" onClick={onCopyPlan}>
            <IconCopy className="size-4" />
            {copy.nextLessonPlanCta}
          </Button>
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

function DailyPracticeQueue({
  copy,
  items,
  worksheetCharacters,
  worksheetSearch,
}: {
  copy: ReturnType<typeof getCourseCopy>;
  items: DailyPracticeQueueItem[];
  worksheetCharacters: string[];
  worksheetSearch: CourseWorksheetSearch;
}) {
  if (items.length === 0) return null;

  return (
    <div className="mt-4 border-t pt-4">
      <div className="space-y-1">
        <p className="text-sm font-medium">{copy.todayQueueTitle}</p>
        <p className="text-xs leading-5 text-muted-foreground">
          {copy.todayQueueDescription}
        </p>
      </div>
      <div className="mt-3 grid gap-2">
        {items.map((item, index) => {
          const content = (
            <>
              <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-medium text-primary">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2">
                  {item.kind === 'practice' ? (
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-xl font-semibold">
                      {item.character.character}
                    </span>
                  ) : (
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-primary">
                      <IconFileText className="size-4" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {item.title}
                    </div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">
                      {item.badge}
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <IconArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </>
          );

          if (item.kind === 'worksheet') {
            return (
              <Link
                key={`${item.kind}-${index}`}
                to={Routes.Worksheets}
                search={worksheetSearch}
                className={cn(
                  'group flex min-w-0 items-start gap-3 rounded-lg border',
                  'bg-background/80 p-3 text-left transition-colors',
                  'hover:border-primary/50 hover:bg-background'
                )}
              >
                {content}
              </Link>
            );
          }

          return (
            <Link
              key={`${item.kind}-${item.character.character}`}
              to={Routes.Learn}
              search={{
                character: item.character.character,
                characters: worksheetCharacters,
              }}
              className={cn(
                'group flex min-w-0 items-start gap-3 rounded-lg border',
                'bg-background/80 p-3 text-left transition-colors',
                'hover:border-primary/50 hover:bg-background'
              )}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </div>
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
  const isLockedLesson = !firstAvailableCharacter && lesson.lockedCount > 0;
  const actionCharacter =
    firstReview?.character ??
    progressSummary.nextPracticeTarget?.character ??
    firstAvailableCharacter;
  const hasReview = progressSummary.reviewItems.length > 0;
  const lessonComplete =
    progressSummary.total > 0 && progressSummary.lessonComplete;
  const lessonPrompt = hasReview
    ? copy.lessonReviewPrompt(progressSummary.reviewItems.length)
    : isLockedLesson
      ? copy.lessonLockedPrompt(lesson.lockedCount)
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
    : isLockedLesson
      ? copy.lessonLockedCta
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
    <Card className="min-w-0 rounded-lg">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
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
        <div className="mb-4 grid grid-cols-[minmax(0,1fr)] gap-3 rounded-lg bg-muted/30 p-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
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
            {isLockedLesson ? (
              <Link to={Routes.Pricing} className={buttonVariants()}>
                <IconLock className="size-4" />
                {lessonActionLabel}
              </Link>
            ) : actionCharacter ? (
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
        <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

function ProgressBackupPreviewCard({
  copy,
  preview,
}: {
  copy: ReturnType<typeof getCourseCopy>;
  preview: ProgressBackupPreview;
}) {
  const stats = [
    {
      label: copy.progressRestorePreviewCompletedLabel,
      value: copy.progressRestorePreviewCompleted(
        preview.completedCount,
        preview.total
      ),
    },
    {
      label: copy.progressRestorePreviewReviewLabel,
      value: preview.reviewCount,
    },
    {
      label: copy.streakLabel,
      value: copy.streakValue(preview.currentStreakDays),
    },
  ];

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-background p-2 ring-1 ring-border">
          <IconEyeCheck className="size-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium">
            {copy.progressRestorePreviewTitle}
          </div>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {copy.progressRestorePreviewDescription(
              preview.exportedAt,
              preview.locale
            )}
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {stats.map((item) => (
              <div key={item.label} className="rounded-md bg-background p-2">
                <div className="text-base font-semibold">{item.value}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            {copy.progressRestorePreviewWarning}
          </p>
        </div>
      </div>
    </div>
  );
}

type CourseWorksheetSearch = {
  characters: string[];
  details: boolean;
  note: string;
  trace: 'first' | 'guided';
};

type DailyPracticeQueueItem =
  | {
      badge: string;
      character: LessonCharacter;
      description: string;
      kind: 'practice';
      title: string;
    }
  | {
      badge: string;
      description: string;
      kind: 'worksheet';
      title: string;
    };

type ProgressShareMessageParams = {
  nextCharacter?: LessonCharacter;
  practiceUrl: string;
  progressSummary: HanziProgressSummary;
  reviewItems: HanziReviewItem[];
  worksheetUrl: string;
};

type NextLessonPlanMessageParams = ProgressShareMessageParams;

type ProgressBackupParams = {
  locale: 'en' | 'zh';
  progress: StoredProgress;
  progressSummary: HanziProgressSummary;
};

type ProgressBackupPreview = {
  completedCount: number;
  currentStreakDays: number;
  exportedAt?: string;
  locale?: string;
  reviewCount: number;
  total: number;
};

type ParsedProgressBackup = {
  preview: ProgressBackupPreview;
  progress: StoredProgress;
};

function buildDailyPracticeQueueItems({
  copy,
  progressSummary,
  worksheetCharacters,
}: {
  copy: ReturnType<typeof getCourseCopy>;
  progressSummary: HanziProgressSummary;
  worksheetCharacters: string[];
}): DailyPracticeQueueItem[] {
  const items: DailyPracticeQueueItem[] = [];

  for (const reviewItem of progressSummary.reviewItems.slice(0, 2)) {
    items.push({
      badge: copy.reviewFocusUrgency[reviewItem.urgency],
      character: reviewItem.character,
      description: copy.todayQueueReviewDescription(
        reviewItem.progress.mistakes,
        formatReviewStrokeFocus(reviewItem, copy)
      ),
      kind: 'practice',
      title: copy.todayQueueReviewTitle(reviewItem.character.character),
    });
  }

  const nextCharacter = progressSummary.nextPracticeTarget?.character;

  if (
    nextCharacter &&
    !items.some(
      (item) =>
        item.kind === 'practice' &&
        item.character.character === nextCharacter.character
    )
  ) {
    items.push({
      badge: copy.todayQueueNewBadge,
      character: nextCharacter,
      description: copy.todayQueueNewDescription(nextCharacter.pinyin),
      kind: 'practice',
      title: copy.todayQueueNewTitle(nextCharacter.character),
    });
  }

  if (items.length < 3 && worksheetCharacters.length > 0) {
    items.push({
      badge: copy.todayQueueWorksheetBadge,
      description: copy.todayQueueWorksheetDescription(
        progressSummary.reviewItems.length
      ),
      kind: 'worksheet',
      title: copy.todayQueueWorksheetTitle(
        progressSummary.reviewItems.length > 0
      ),
    });
  }

  return items.slice(0, 3);
}

function formatReviewStrokeFocus(
  item: HanziReviewItem,
  copy: ReturnType<typeof getCourseCopy>
) {
  const mistakeStrokes = item.progress.mistakeStrokes ?? [];

  if (mistakeStrokes.length === 0) {
    return copy.reviewFocusFullTrace;
  }

  const focus = mistakeStrokes
    .slice(0, 3)
    .map((stroke) => copy.reviewFocusStroke(getDisplayStrokeNumber(stroke)))
    .join(', ');

  if (mistakeStrokes.length <= 3) return focus;

  return `${focus}, ${copy.reviewFocusMore(mistakeStrokes.length - 3)}`;
}

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
      lessonLockedCta: '查看 Pro 内容包',
      lessonLockedPrompt: (count: number) =>
        `这一组包含 ${count} 个 Pro 预览汉字。你可以先看字卡和例词，升级后再加入完整练习与作业流程。`,
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
      progressBackupDownloadCta: '下载备份',
      progressBackupDownloadError: '备份文件生成失败，请稍后重试。',
      progressBackupDownloadSuccess: '进度备份文件已下载。',
      progressBackupSuccess: '进度备份已复制。',
      progressRestoreConfirmCta: '恢复进度',
      progressRestoreCta: '恢复进度',
      progressRestoreDescription:
        '粘贴之前复制的 Lang Study 进度备份。恢复后会替换这个浏览器里的 HSK1 本地进度，不会上传到服务器。',
      progressRestoreError: '无法识别这个备份，请检查是否粘贴了完整 JSON。',
      progressRestoreFileCta: '选择备份文件',
      progressRestoreFileHint:
        '你也可以直接选择从 Lang Study 下载的 .json 备份文件。',
      progressRestoreFileLoaded: '备份文件已载入，请确认后恢复。',
      progressRestoreFileTooLarge:
        '备份文件过大，请选择 Lang Study 导出的 JSON 文件。',
      progressRestoreHint:
        '只支持 Lang Study 生成的 HSK1 进度备份，恢复前建议先复制一份当前进度备份。',
      progressRestoreInputLabel: '进度备份 JSON',
      progressRestoreInvalidPreview:
        '这个备份无法预览，请检查 JSON 内容是否完整。',
      progressRestorePlaceholder: '粘贴从“复制进度备份”得到的 JSON 内容...',
      progressRestorePreviewCompleted: (completed: number, total: number) =>
        `${completed}/${total}`,
      progressRestorePreviewCompletedLabel: '已完成',
      progressRestorePreviewDescription: (
        exportedAt?: string,
        backupLocale?: string
      ) =>
        `导出时间：${formatBackupDate(exportedAt, 'zh')} · 语言：${
          backupLocale === 'zh' ? '中文' : 'English'
        }`,
      progressRestorePreviewReviewLabel: '待复习',
      progressRestorePreviewTitle: '备份预览',
      progressRestorePreviewWarning:
        '恢复后会覆盖当前浏览器里的 HSK1 本地进度。',
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
      nextLessonPlanCta: '复制下次计划',
      nextLessonPlanMessage: ({
        nextCharacter,
        practiceUrl,
        progressSummary,
        reviewItems,
        worksheetUrl,
      }: NextLessonPlanMessageParams) => {
        const reviewCharacters = reviewItems
          .slice(0, 6)
          .map((item) => item.character.character)
          .join(' ');
        const assignment =
          reviewItems.length > 0
            ? `先复习错字：${reviewCharacters}。完成线上描写后，再打印错字练习纸。`
            : nextCharacter
              ? `继续练 ${nextCharacter.character} · ${nextCharacter.pinyin}。先看笔顺，再完成一次描写。`
              : '免费入门组已完成。打印整组练习纸，完成一次纸笔巩固。';

        return [
          'Lang Study HSK1 下次学习计划',
          '',
          `当前进度：${progressSummary.completedCount}/${progressSummary.total}`,
          `今日已练：${progressSummary.completedTodayCount}`,
          `本次任务：${assignment}`,
          `线上练习：${practiceUrl}`,
          `打印练习纸：${worksheetUrl}`,
          '',
          '建议顺序：先线上描写记录错笔，再把同一组汉字带到纸面上慢慢写。完成后圈出最难写的字，下次先复习。',
        ].join('\n');
      },
      nextLessonPlanSuccess: '下次学习计划已复制。',
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
      summaryDescription: '当前已整理的 HSK1 第一阶段课程包。',
      summaryTitle: 'HSK1 Launch Pack',
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
      todayQueueDescription:
        '按这个顺序点开练习，先清错笔，再接新字，最后回到纸面巩固。',
      todayQueueNewBadge: '新字',
      todayQueueNewDescription: (pinyin: string) =>
        `先听读 ${pinyin}，再看笔顺动画，最后完成一次跟随描写。`,
      todayQueueNewTitle: (character: string) => `学习 ${character}`,
      todayQueueReviewDescription: (mistakes: number, focus: string) =>
        `上次错误 ${mistakes} 次。今天重点处理：${focus}。`,
      todayQueueReviewTitle: (character: string) => `复习 ${character}`,
      todayQueueTitle: '今日练习队列',
      todayQueueWorksheetBadge: '纸笔',
      todayQueueWorksheetDescription: (reviewCount: number) =>
        reviewCount > 0
          ? '线上复习后，把错字打印出来慢慢写一遍。'
          : '线上描写后，把同一组汉字打印出来做一次独立书写。',
      todayQueueWorksheetTitle: (hasReview: boolean) =>
        hasReview ? '打印错字纸' : '打印本组练习纸',
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
      upgradeClassroomCta: '咨询课堂使用',
      upgradeDescription:
        '免费入门组已经覆盖真实练习流程：看笔顺、跟随描写、记录错笔、打印练习纸。完整工具包会把这些流程扩展到更多汉字和可重复布置的学习场景。',
      upgradeEyebrow: '完整工具包预览',
      upgradeSnapshotDescription:
        '当前公开课程已经能验证核心体验；完整包围绕更长周期的练习、复习和作业布置继续扩展。',
      upgradeSnapshotStats: (stats: ReturnType<typeof getCourseStats>) => [
        { label: '当前公开', value: `${stats.free} 字` },
        { label: '第一阶段内容包', value: `${stats.total} 字` },
        { label: '学习场景', value: '自学 / 家庭 / 课堂' },
      ],
      upgradeSnapshotTitle: '从免费入门到 HSK1 第一阶段内容包',
      upgradeTitle: '把一次练习变成可持续的 HSK1 学习流程',
      upgradeValueItems: [
        {
          description:
            '从免费字扩展到更完整的 HSK1 第一阶段内容包，适合按周完成、反复复习和打印巩固。',
          icon: IconBook2,
          title: '扩展字表路径',
        },
        {
          description:
            '错笔、复习队列、今日目标和打印练习纸串在一起，减少每次重新安排的成本。',
          icon: IconRotate,
          title: '复习闭环',
        },
        {
          description:
            '给老师、tutor 和家长准备可复制的计划、练习纸和作业交付说明。',
          icon: IconUsers,
          title: '作业布置流程',
        },
      ],
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
    lessonLockedCta: 'View Pro pack',
    lessonLockedPrompt: (count: number) =>
      `This lesson includes ${count} Pro preview characters. You can inspect the cards and example words now, then unlock full practice and assignment workflows when ready.`,
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
    progressBackupDownloadCta: 'Download backup',
    progressBackupDownloadError:
      'Could not create a backup file. Please try again.',
    progressBackupDownloadSuccess: 'Progress backup file downloaded.',
    progressBackupSuccess: 'Progress backup copied.',
    progressRestoreConfirmCta: 'Restore progress',
    progressRestoreCta: 'Restore progress',
    progressRestoreDescription:
      'Paste a Lang Study progress backup you copied earlier. Restoring replaces the HSK1 progress stored in this browser and does not upload anything.',
    progressRestoreError:
      'This backup could not be read. Check that the full JSON was pasted.',
    progressRestoreFileCta: 'Choose backup file',
    progressRestoreFileHint:
      'You can also choose a .json backup file downloaded from Lang Study.',
    progressRestoreFileLoaded: 'Backup file loaded. Review it, then restore.',
    progressRestoreFileTooLarge:
      'This backup file is too large. Choose a JSON file exported by Lang Study.',
    progressRestoreHint:
      'Only HSK1 progress backups generated by Lang Study are supported. Copy your current backup first if you may need it later.',
    progressRestoreInputLabel: 'Progress backup JSON',
    progressRestoreInvalidPreview:
      'This backup cannot be previewed. Check that the JSON is complete.',
    progressRestorePlaceholder: 'Paste the JSON from "Copy progress backup"...',
    progressRestorePreviewCompleted: (completed: number, total: number) =>
      `${completed}/${total}`,
    progressRestorePreviewCompletedLabel: 'Completed',
    progressRestorePreviewDescription: (
      exportedAt?: string,
      backupLocale?: string
    ) =>
      `Exported: ${formatBackupDate(exportedAt, 'en')} · Language: ${
        backupLocale === 'zh' ? 'Chinese' : 'English'
      }`,
    progressRestorePreviewReviewLabel: 'Review queue',
    progressRestorePreviewTitle: 'Backup preview',
    progressRestorePreviewWarning:
      'Restoring will replace the HSK1 progress stored in this browser.',
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
    nextLessonPlanCta: 'Copy next plan',
    nextLessonPlanMessage: ({
      nextCharacter,
      practiceUrl,
      progressSummary,
      reviewItems,
      worksheetUrl,
    }: NextLessonPlanMessageParams) => {
      const reviewCharacters = reviewItems
        .slice(0, 6)
        .map((item) => item.character.character)
        .join(' ');
      const assignment =
        reviewItems.length > 0
          ? `Review missed characters first: ${reviewCharacters}. Finish online tracing, then print a focused review sheet.`
          : nextCharacter
            ? `Continue with ${nextCharacter.character} · ${nextCharacter.pinyin}. Watch stroke order, then complete one tracing run.`
            : 'The free starter set is complete. Print the full worksheet set for one paper reinforcement pass.';

      return [
        'Lang Study HSK1 next lesson plan',
        '',
        `Current progress: ${progressSummary.completedCount}/${progressSummary.total}`,
        `Practiced today: ${progressSummary.completedTodayCount}`,
        `Assignment: ${assignment}`,
        `Online practice: ${practiceUrl}`,
        `Printable worksheet: ${worksheetUrl}`,
        '',
        'Suggested order: trace online first to record missed strokes, then take the same character set onto paper. Circle the hardest character so the next session starts with review.',
      ].join('\n');
    },
    nextLessonPlanSuccess: 'Next lesson plan copied.',
    progressBadge: (completed: number, total: number) =>
      `${completed}/${total} complete`,
    reviewBadge: (count: number) => `${count} to review`,
    reviewCta: 'Review mistakes',
    reviewDescription: (character: string, mistakes: number) =>
      `Start with ${character}, the character you missed ${mistakes} times last run.`,
    reviewFocusFullTrace: 'Full trace',
    reviewFocusMistakes: (count: number) =>
      `${count} ${count === 1 ? 'mistake' : 'mistakes'}`,
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
    summaryDescription: 'Currently published HSK1 launch-pack data.',
    summaryTitle: 'HSK1 Launch Pack',
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
    todayQueueDescription:
      'Open these in order: clear missed strokes, add the next character, then reinforce on paper.',
    todayQueueNewBadge: 'New character',
    todayQueueNewDescription: (pinyin: string) =>
      `Say ${pinyin}, watch stroke order, then finish one guided tracing run.`,
    todayQueueNewTitle: (character: string) => `Learn ${character}`,
    todayQueueReviewDescription: (mistakes: number, focus: string) =>
      `Last run had ${mistakes} ${
        mistakes === 1 ? 'mistake' : 'mistakes'
      }. Focus today: ${focus}.`,
    todayQueueReviewTitle: (character: string) => `Review ${character}`,
    todayQueueTitle: 'Today practice queue',
    todayQueueWorksheetBadge: 'Paper pass',
    todayQueueWorksheetDescription: (reviewCount: number) =>
      reviewCount > 0
        ? 'After online review, print the missed characters and write them slowly once.'
        : 'After online tracing, print the same set for one independent writing pass.',
    todayQueueWorksheetTitle: (hasReview: boolean) =>
      hasReview ? 'Print missed characters' : 'Print this set',
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
    upgradeClassroomCta: 'Ask about classroom use',
    upgradeDescription:
      'The free starter set already proves the core loop: watch stroke order, trace, save missed strokes, and print worksheets. The complete toolkit extends that loop across more characters and repeatable assignment workflows.',
    upgradeEyebrow: 'Complete toolkit preview',
    upgradeSnapshotDescription:
      'The public course validates the learning experience today. The complete pack expands it for longer practice cycles, review, and assignment planning.',
    upgradeSnapshotStats: (stats: ReturnType<typeof getCourseStats>) => [
      { label: 'Public now', value: `${stats.free} chars` },
      { label: 'Launch pack', value: `${stats.total} chars` },
      { label: 'Use cases', value: 'Self / family / class' },
    ],
    upgradeSnapshotTitle: 'From free starter to HSK1 launch pack',
    upgradeTitle: 'Turn one practice run into a repeatable HSK1 routine',
    upgradeValueItems: [
      {
        description:
          'Move from the free characters into a broader HSK1 launch pack for weekly practice, review, and paper reinforcement.',
        icon: IconBook2,
        title: 'Expanded character path',
      },
      {
        description:
          'Connect missed strokes, review queues, daily targets, and printable worksheets so each session has a clear next step.',
        icon: IconRotate,
        title: 'Review loop',
      },
      {
        description:
          'Give teachers, tutors, and parents copyable plans, worksheets, and assignment handoff notes.',
        icon: IconUsers,
        title: 'Assignment workflow',
      },
    ],
    worksheetCta: 'Make worksheet',
  };
}

function buildCoursePracticeUrl(
  character: string | undefined,
  characters: string[],
  locale: 'en' | 'zh'
) {
  const params = new URLSearchParams();

  if (character) {
    params.set('character', character);
  }

  for (const item of characters) {
    params.append('characters', item);
  }

  const search = params.toString();
  return `https://${COURSE_SHARE_DOMAIN}${getPathWithLocale(
    Routes.Learn,
    locale
  )}${search ? `?${search}` : ''}`;
}

function buildCourseWorksheetUrl(
  search: CourseWorksheetSearch,
  locale: 'en' | 'zh'
) {
  const params = new URLSearchParams();

  for (const character of search.characters) {
    params.append('characters', character);
  }

  params.set('details', search.details ? 'true' : 'false');
  params.set('note', search.note);
  params.set('trace', search.trace);

  return `https://${COURSE_SHARE_DOMAIN}${getPathWithLocale(
    Routes.Worksheets,
    locale
  )}?${params.toString()}`;
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
    source: `https://${COURSE_SHARE_DOMAIN}${getPathWithLocale(
      Routes.Hsk1,
      locale
    )}`,
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

function buildProgressBackupFileName() {
  const date = new Date().toISOString().slice(0, 10);
  return `lang-study-hsk1-progress-${date}.json`;
}

function parseProgressBackup(value: string): ParsedProgressBackup | null {
  let parsed: unknown;

  try {
    parsed = JSON.parse(value);
  } catch {
    return null;
  }

  if (!value.trim()) {
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

  return {
    preview: buildProgressBackupPreview(parsed, nextProgress),
    progress: nextProgress,
  };
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

function buildProgressBackupPreview(
  parsed: Record<string, unknown>,
  progress: StoredProgress
): ProgressBackupPreview {
  const summary = isPlainRecord(parsed.summary) ? parsed.summary : {};
  const stats = getProgressBackupStats(progress);
  const completedCount = readPreviewCount(
    summary.completedCount,
    stats.completedCount
  );
  const reviewCount = Array.isArray(summary.reviewCharacters)
    ? summary.reviewCharacters.length
    : stats.reviewCount;
  const total = readPreviewCount(
    summary.total,
    Math.max(stats.total, completedCount)
  );

  return {
    completedCount,
    currentStreakDays: readPreviewCount(
      summary.currentStreakDays,
      stats.currentStreakDays
    ),
    exportedAt:
      typeof parsed.exportedAt === 'string' ? parsed.exportedAt : undefined,
    locale: typeof parsed.locale === 'string' ? parsed.locale : undefined,
    reviewCount,
    total,
  };
}

function getProgressBackupStats(progress: StoredProgress) {
  const completedItems = Object.values(progress).filter(
    (item) => item.completed
  );
  const dayKeys = new Set(
    completedItems
      .map((item) =>
        item.completedAt ? getBackupLocalDayKey(new Date(item.completedAt)) : ''
      )
      .filter(Boolean)
  );

  return {
    activeDayCount: dayKeys.size,
    completedCount: completedItems.length,
    currentStreakDays: getBackupCurrentStreakDays(dayKeys),
    reviewCount: completedItems.filter((item) => item.mistakes > 0).length,
    total: Object.keys(progress).length,
  };
}

function getBackupCurrentStreakDays(dayKeys: Set<string>) {
  if (dayKeys.size === 0) return 0;

  const today = new Date();
  const cursor = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  let streak = 0;

  while (dayKeys.has(getBackupLocalDayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function getBackupLocalDayKey(date: Date) {
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function readPreviewCount(value: unknown, fallback: number) {
  return Number.isInteger(value) && value >= 0 ? value : fallback;
}

function formatBackupDate(value: string | undefined, locale: 'en' | 'zh') {
  if (!value) {
    return locale === 'zh' ? '未知' : 'Unknown';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return locale === 'zh' ? '未知' : 'Unknown';
  }

  return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function isValidProgressCount(value: unknown): value is number {
  return Number.isInteger(value) && value >= 0;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
