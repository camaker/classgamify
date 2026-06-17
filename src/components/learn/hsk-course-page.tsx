import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
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
  getHanziPath,
  getHsk1CourseLessons,
  type CourseLesson,
  type LessonCharacter,
} from '@/learn/hanzi-course';
import {
  getHanziProgressSummary,
  readStoredHanziProgress,
  type CharacterProgress,
  type HanziProgressSummary,
  type StoredProgress,
} from '@/learn/hanzi-progress';
import { getLocale } from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import {
  IconArrowRight,
  IconBook2,
  IconCircleCheck,
  IconFileText,
  IconFlame,
  IconLock,
  IconPencil,
  IconRotate,
  IconSparkles,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';

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
  const progressSummary = useMemo(
    () => getHanziProgressSummary(freeLessonCharacters, progress),
    [freeLessonCharacters, progress]
  );
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
              <Link
                to={Routes.Learn}
                search={{ character: freeCharacters[0] }}
                className={buttonVariants()}
              >
                <IconPencil className="size-4" />
                {copy.practiceCta}
              </Link>
              <Link
                to={Routes.Worksheets}
                search={{ characters: freeCharacters }}
                className={cn(buttonVariants({ variant: 'outline' }))}
              >
                <IconFileText className="size-4" />
                {copy.worksheetCta}
              </Link>
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
            </CardContent>
          </Card>
        </div>

        {progressSummary.completedCount > 0 ? (
          <ContinueLearningCard
            copy={copy}
            progressSummary={progressSummary}
            worksheetCharacters={freeCharacters}
          />
        ) : null}

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

function ContinueLearningCard({
  copy,
  progressSummary,
  worksheetCharacters,
}: {
  copy: ReturnType<typeof getCourseCopy>;
  progressSummary: HanziProgressSummary;
  worksheetCharacters: string[];
}) {
  const firstReview = progressSummary.reviewItems[0];
  const nextCharacter =
    firstReview?.character ?? progressSummary.nextPracticeTarget?.character;
  const primaryCharacter = nextCharacter?.character ?? worksheetCharacters[0];
  const reviewWorksheetSearch = {
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

  return (
    <section className="grid gap-4 rounded-lg border border-primary/20 bg-primary/5 p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-md">
            <IconFlame className="size-3.5" />
            {copy.continueBadge}
          </Badge>
          <Badge variant="outline" className="rounded-md">
            {copy.progressBadge(
              progressSummary.completedCount,
              progressSummary.total
            )}
          </Badge>
          {progressSummary.reviewItems.length > 0 ? (
            <Badge variant="outline" className="rounded-md">
              <IconRotate className="size-3.5" />
              {copy.reviewBadge(progressSummary.reviewItems.length)}
            </Badge>
          ) : null}
        </div>
        <div className="max-w-3xl space-y-1">
          <h2 className="text-xl font-semibold">
            {progressSummary.reviewItems.length > 0
              ? copy.reviewTitle
              : progressSummary.lessonComplete
                ? copy.finishedTitle
                : copy.continueTitle}
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            {progressSummary.reviewItems.length > 0 && firstReview
              ? copy.reviewDescription(
                  firstReview.character.character,
                  firstReview.progress.mistakes
                )
              : progressSummary.nextPracticeTarget
                ? copy.continueDescription(
                    progressSummary.nextPracticeTarget.character.character,
                    progressSummary.nextPracticeTarget.character.pinyin
                  )
                : copy.finishedDescription}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 md:justify-end">
        {primaryCharacter ? (
          <Link
            to={Routes.Learn}
            search={{ character: primaryCharacter }}
            className={buttonVariants()}
          >
            <IconPencil className="size-4" />
            {progressSummary.reviewItems.length > 0
              ? copy.reviewCta
              : copy.continueCta}
          </Link>
        ) : null}
        <Link
          to={Routes.Worksheets}
          search={reviewWorksheetSearch}
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          <IconFileText className="size-4" />
          {progressSummary.reviewItems.length > 0
            ? copy.reviewWorksheetCta
            : copy.continueWorksheetCta}
        </Link>
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
  const actionCharacter =
    firstReview?.character ??
    progressSummary.nextPracticeTarget?.character ??
    lesson.characters.find((item) => !item.premium);
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
    : progressSummary.completedCount > 0
      ? copy.lessonContinueCta
      : copy.lessonStartCta;
  const worksheetSearch = {
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
      practiceCta: '开始练习',
      premiumLabel: 'Pro 字',
      proBadge: 'Pro',
      progressBadge: (completed: number, total: number) =>
        `${completed}/${total} 已完成`,
      reviewBadge: (count: number) => `${count} 个待复习`,
      reviewCta: '先复习错字',
      reviewDescription: (character: string, mistakes: number) =>
        `先处理最容易出错的字：${character}，上次错误 ${mistakes} 次。`,
      reviewTitle: '先复习，再继续',
      reviewWorksheetCta: '打印错字复习纸',
      reviewWorksheetNote: (count: number) =>
        `优先复习你错得最多的 ${count} 个汉字。`,
      strokesLabel: '总笔画',
      strokeCount: (count: number) => `${count} 画`,
      summaryDescription: '当前公开的启动课程数据。',
      summaryTitle: 'HSK1 Starter',
      tileCompleteBadge: '已完成',
      tileReviewBadge: '复习',
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
    practiceCta: 'Start practice',
    premiumLabel: 'Pro',
    proBadge: 'Pro',
    progressBadge: (completed: number, total: number) =>
      `${completed}/${total} complete`,
    reviewBadge: (count: number) => `${count} to review`,
    reviewCta: 'Review mistakes',
    reviewDescription: (character: string, mistakes: number) =>
      `Start with ${character}, the character you missed ${mistakes} times last run.`,
    reviewTitle: 'Review first, then continue',
    reviewWorksheetCta: 'Print review sheet',
    reviewWorksheetNote: (count: number) =>
      `Review the ${count} characters you missed most.`,
    strokesLabel: 'Strokes',
    strokeCount: (count: number) => `${count} strokes`,
    summaryDescription: 'Currently published starter course data.',
    summaryTitle: 'HSK1 Starter',
    tileCompleteBadge: 'Done',
    tileReviewBadge: 'Review',
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
