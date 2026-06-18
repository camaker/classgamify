import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  getHanziPath,
  getHsk1LessonForCharacter,
  getPracticeTargetCharacter,
  getWorksheetCharactersForCharacter,
  type LessonCharacter,
} from '@/learn/hanzi-course';
import {
  getDisplayStrokeNumber,
  getPracticeAgeDays,
  readStoredHanziProgress,
  type CharacterProgress,
  type StoredProgress,
} from '@/learn/hanzi-progress';
import { getLocale } from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { getPathWithLocale } from '@/lib/urls';
import { cn } from '@/lib/utils';
import {
  IconArrowLeft,
  IconArrowRight,
  IconBook2,
  IconCheck,
  IconCopy,
  IconEye,
  IconFileText,
  IconGripVertical,
  IconLock,
  IconPencil,
  IconPrinter,
  IconRotate,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type StudyStepIcon = 'observe' | 'trace' | 'print';

type DetailPracticeSearch = {
  character: string;
  characters: string[];
};

type DetailWorksheetSearch = {
  characters: string[];
  details: boolean;
  note: string;
  trace: 'first' | 'guided';
};

type StudyPlanMessageParams = {
  character: LessonCharacter;
  detailUrl: string;
  isReview: boolean;
  practiceUrl: string;
  progress?: CharacterProgress;
  worksheetUrl: string;
};

export function HanziDetailPage({ character }: { character: LessonCharacter }) {
  const currentLocale = getLocale() === 'zh' ? 'zh' : 'en';
  const copy = getHanziDetailCopy(currentLocale);
  const lesson = useMemo(
    () => getHsk1LessonForCharacter(character.character, currentLocale),
    [character.character, currentLocale]
  );
  const worksheetCharacters = useMemo(
    () =>
      getWorksheetCharactersForCharacter(character.character, currentLocale),
    [character.character, currentLocale]
  );
  const practiceTarget = useMemo(
    () => getPracticeTargetCharacter(character.character, currentLocale),
    [character.character, currentLocale]
  );
  const [progress, setProgress] = useState<StoredProgress>({});
  const currentProgress = progress[character.character];
  const needsReview =
    Boolean(currentProgress?.completed) && currentProgress.mistakes > 0;
  const practiceCtaLabel = needsReview
    ? copy.reviewCta
    : currentProgress?.completed
      ? copy.practiceAgainCta
      : copy.practiceCta;
  const practiceSearch = {
    character: practiceTarget,
    characters: worksheetCharacters,
  };
  const worksheetSearch = needsReview
    ? {
        characters: [character.character],
        details: true,
        note: copy.reviewWorksheetNote(
          character.character,
          currentProgress?.mistakeStrokes ?? []
        ),
        trace: 'guided' as const,
      }
    : {
        characters: worksheetCharacters,
        details: true,
        note: copy.lessonWorksheetNote(character.lessonLabel),
        trace: 'first' as const,
      };
  const lessonCharacters = lesson?.characters ?? [character];
  const copyStudyPlan = async () => {
    if (typeof window === 'undefined' || !window.navigator.clipboard) return;

    const detailUrl = new URL(
      getPathWithLocale(getHanziPath(character.character), currentLocale),
      window.location.origin
    ).toString();
    const practiceUrl = new URL(
      buildDetailPracticePath(practiceSearch, currentLocale),
      window.location.origin
    ).toString();
    const worksheetUrl = new URL(
      buildDetailWorksheetPath(worksheetSearch, currentLocale),
      window.location.origin
    ).toString();
    const message = copy.studyPlanMessage({
      character,
      detailUrl,
      isReview: needsReview,
      practiceUrl,
      progress: currentProgress,
      worksheetUrl,
    });

    try {
      await window.navigator.clipboard.writeText(message);
      toast.success(copy.studyPlanShareSuccess);
    } catch {
      toast.error(copy.shareError);
    }
  };

  useEffect(() => {
    setProgress(readStoredHanziProgress());
  }, []);

  return (
    <section className="min-h-[calc(100vh-12rem)] bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to={Routes.Hsk1}
          className={cn(buttonVariants({ variant: 'ghost' }), 'w-fit')}
        >
          <IconArrowLeft className="size-4" />
          {copy.back}
        </Link>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(20rem,0.55fr)] lg:items-start">
          <div className="min-w-0 space-y-6">
            <Card className="min-w-0 rounded-lg">
              <CardHeader>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-primary/30">
                    {copy.badge}
                  </Badge>
                  <Badge variant="secondary">{character.lessonLabel}</Badge>
                  {character.premium ? (
                    <Badge variant="outline">
                      <IconLock className="size-3.5" />
                      {copy.proBadge}
                    </Badge>
                  ) : null}
                </div>
                <div className="grid gap-5 pt-2 sm:grid-cols-[auto_1fr] sm:items-center">
                  <div className="flex size-32 items-center justify-center rounded-lg border bg-muted text-8xl font-semibold sm:size-40 sm:text-9xl">
                    {character.character}
                  </div>
                  <div className="space-y-3">
                    <CardDescription>{copy.titleEyebrow}</CardDescription>
                    <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                      {copy.title(character.character, character.pinyin)}
                    </h1>
                    <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                      {copy.description(character.meaning)}
                    </p>
                    <PracticeStatusSummary
                      copy={copy}
                      progress={currentProgress}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={Routes.Learn}
                        search={practiceSearch}
                        className={buttonVariants()}
                      >
                        <IconPencil className="size-4" />
                        {practiceCtaLabel}
                      </Link>
                      <Link
                        to={Routes.Worksheets}
                        search={worksheetSearch}
                        className={cn(buttonVariants({ variant: 'outline' }))}
                      >
                        <IconFileText className="size-4" />
                        {character.premium
                          ? copy.worksheetLockedCta
                          : copy.worksheetCta}
                      </Link>
                      <button
                        type="button"
                        onClick={copyStudyPlan}
                        className={cn(buttonVariants({ variant: 'outline' }))}
                      >
                        <IconCopy className="size-4" />
                        {copy.studyPlanShareCta}
                      </button>
                    </div>
                    <div className="grid grid-cols-[minmax(0,1fr)] gap-3 pt-2 sm:grid-cols-3">
                      {copy.studySteps.map((step, index) => (
                        <StudyStep
                          description={step.description}
                          icon={step.icon}
                          index={index + 1}
                          key={step.title}
                          title={step.title}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="min-w-0 rounded-lg">
              <CardHeader>
                <CardTitle>{copy.memoryTitle}</CardTitle>
                <CardDescription>{copy.memoryDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-base leading-7">{character.hint}</p>
                </div>
                <MemoryCueGrid character={character} copy={copy} />
              </CardContent>
            </Card>

            <Card className="min-w-0 rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconGripVertical className="size-4 text-muted-foreground" />
                  {copy.examplesTitle}
                </CardTitle>
                <CardDescription>{copy.examplesDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-3">
                  {character.examples.map((example) => (
                    <div
                      className="min-w-0 rounded-lg border bg-card p-4"
                      key={example}
                    >
                      <div className="text-2xl font-semibold">{example}</div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        {copy.exampleLabel}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="min-w-0 rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconCheck className="size-4" />
                  {copy.lessonGroupTitle}
                </CardTitle>
                <CardDescription>{copy.lessonGroupDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {lessonCharacters.map((item) => {
                    const itemProgress = progress[item.character];
                    const itemCompleted = itemProgress?.completed;
                    const itemNeedsReview =
                      itemCompleted && itemProgress.mistakes > 0;

                    return (
                      <Link
                        className={cn(
                          'group flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors',
                          'hover:border-primary/50 hover:bg-muted/40',
                          item.character === character.character &&
                            'border-primary bg-primary/5'
                        )}
                        key={item.character}
                        to={getHanziPath(item.character)}
                      >
                        <div className="flex size-12 items-center justify-center rounded-lg bg-muted text-2xl font-semibold">
                          {item.character}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-medium">
                              {item.pinyin} · {item.meaning}
                            </p>
                            {item.character === character.character ? (
                              <Badge variant="secondary" className="shrink-0">
                                {copy.currentBadge}
                              </Badge>
                            ) : item.premium ? (
                              <Badge variant="outline" className="shrink-0">
                                <IconLock className="size-3.5" />
                                {copy.proBadge}
                              </Badge>
                            ) : itemNeedsReview ? (
                              <Badge
                                variant="outline"
                                className="shrink-0 border-amber-500/40 text-amber-700 dark:text-amber-300"
                              >
                                <IconRotate className="size-3.5" />
                                {copy.reviewBadge}
                              </Badge>
                            ) : itemCompleted ? (
                              <Badge variant="secondary" className="shrink-0">
                                <IconCheck className="size-3.5" />
                                {copy.completedBadge}
                              </Badge>
                            ) : null}
                          </div>
                          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                            {item.lessonLabel}
                          </p>
                        </div>
                        <IconArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="min-w-0 space-y-4">
            <Card className="min-w-0 rounded-lg">
              <CardHeader>
                <CardTitle>{copy.factTitle}</CardTitle>
                <CardDescription>{copy.factDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Fact label={copy.pinyinLabel} value={character.pinyin} />
                <Fact label={copy.meaningLabel} value={character.meaning} />
                <Fact
                  label={copy.strokesLabel}
                  value={copy.strokeCount(character.strokes)}
                />
                {character.radical ? (
                  <Fact label={copy.radicalLabel} value={character.radical} />
                ) : null}
                <Fact label={copy.lessonLabel} value={character.lessonLabel} />
              </CardContent>
            </Card>

            <Card className="min-w-0 rounded-lg border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <IconBook2 className="size-4" />
                  {copy.nextTitle}
                </CardTitle>
                <CardDescription>{copy.nextDescription}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Link
                  to={Routes.Learn}
                  search={practiceSearch}
                  className={cn(buttonVariants(), 'justify-start')}
                >
                  <IconPencil className="size-4" />
                  {practiceCtaLabel}
                </Link>
                <Link
                  to={Routes.Hsk1}
                  className={cn(
                    buttonVariants({ variant: 'outline' }),
                    'justify-start'
                  )}
                >
                  <IconBook2 className="size-4" />
                  {copy.courseCta}
                </Link>
                <Link
                  to={character.premium ? Routes.Pricing : Routes.Worksheets}
                  search={character.premium ? undefined : worksheetSearch}
                  className={cn(
                    buttonVariants({ variant: 'outline' }),
                    'justify-start'
                  )}
                >
                  <IconLock className="size-4" />
                  {character.premium ? copy.pricingCta : copy.previewCta}
                </Link>
                <button
                  type="button"
                  onClick={copyStudyPlan}
                  className={cn(
                    buttonVariants({ variant: 'outline' }),
                    'justify-start'
                  )}
                >
                  <IconCopy className="size-4" />
                  {copy.studyPlanShareCta}
                </button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </section>
  );
}

function MemoryCueGrid({
  character,
  copy,
}: {
  character: LessonCharacter;
  copy: ReturnType<typeof getHanziDetailCopy>;
}) {
  const items = [
    {
      description: character.hint,
      icon: IconEye,
      title: copy.memoryShapeTitle,
    },
    {
      description: copy.memorySoundDescription(
        character.pinyin,
        character.meaning
      ),
      icon: IconBook2,
      title: copy.memorySoundTitle,
    },
    {
      description: copy.memoryUseDescription(character.examples),
      icon: IconPencil,
      title: copy.memoryUseTitle,
    },
  ];

  return (
    <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="min-w-0 rounded-lg border bg-background/80 p-3"
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              <Icon className="size-4 text-muted-foreground" />
              {item.title}
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {item.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function PracticeStatusSummary({
  copy,
  progress,
}: {
  copy: ReturnType<typeof getHanziDetailCopy>;
  progress?: CharacterProgress;
}) {
  if (!progress?.completed) {
    return (
      <div className="rounded-lg border border-dashed bg-background/80 p-3">
        <div className="flex items-start gap-3">
          <IconPencil className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">{copy.statusNotStartedTitle}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {copy.statusNotStartedDescription}
            </p>
            <StatusActionPlan
              description={copy.statusStartPlanDescription}
              label={copy.statusPlanLabel}
            />
          </div>
        </div>
      </div>
    );
  }

  const mistakeStrokes = progress.mistakeStrokes ?? [];
  const needsReview = progress.mistakes > 0;
  const ageDays = getPracticeAgeDays(progress.completedAt);

  return (
    <div
      className={cn(
        'rounded-lg border p-3',
        needsReview
          ? 'border-amber-500/40 bg-amber-500/10'
          : 'border-emerald-500/30 bg-emerald-500/10'
      )}
    >
      <div className="flex items-start gap-3">
        {needsReview ? (
          <IconRotate className="mt-0.5 size-4 shrink-0 text-amber-700 dark:text-amber-300" />
        ) : (
          <IconCheck className="mt-0.5 size-4 shrink-0 text-emerald-700 dark:text-emerald-300" />
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium">
            {needsReview ? copy.statusReviewTitle : copy.statusCleanTitle}
          </p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {needsReview
              ? copy.statusReviewDescription(progress.mistakes)
              : copy.statusCleanDescription}
          </p>
          <div className="mt-3 rounded-md border bg-background/70 px-3 py-2">
            <p className="text-xs font-medium">{copy.statusRecencyLabel}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {copy.statusRecencyDescription(ageDays, needsReview)}
            </p>
          </div>
          <StatusActionPlan
            description={copy.statusPlanDescription(
              ageDays,
              needsReview,
              progress.mistakes
            )}
            label={copy.statusPlanLabel}
          />
          {needsReview ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {mistakeStrokes.length > 0 ? (
                mistakeStrokes.map((stroke) => (
                  <Badge
                    key={stroke}
                    variant="secondary"
                    className="rounded-md"
                  >
                    {copy.statusStroke(getDisplayStrokeNumber(stroke))}
                  </Badge>
                ))
              ) : (
                <Badge variant="outline" className="rounded-md">
                  {copy.statusFullTrace}
                </Badge>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StatusActionPlan({
  description,
  label,
}: {
  description: string;
  label: string;
}) {
  return (
    <div className="mt-3 rounded-md border bg-background/80 px-3 py-2">
      <div className="flex items-start gap-2">
        <IconArrowRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
        <div>
          <p className="text-xs font-medium">{label}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function StudyStep({
  description,
  icon,
  index,
  title,
}: {
  description: string;
  icon: StudyStepIcon;
  index: number;
  title: string;
}) {
  const Icon =
    icon === 'observe' ? IconEye : icon === 'trace' ? IconPencil : IconPrinter;

  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <span className="inline-flex size-6 items-center justify-center rounded-md bg-background text-xs text-muted-foreground">
          {index}
        </span>
        <Icon className="size-4 text-muted-foreground" />
        <span>{title}</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border bg-background/70 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 text-right font-medium">{value}</span>
    </div>
  );
}

function buildDetailPracticePath(
  search: DetailPracticeSearch,
  locale: 'en' | 'zh'
) {
  const params = new URLSearchParams();
  params.set('character', search.character);
  params.set('characters', search.characters.join(','));

  return `${getPathWithLocale(Routes.Learn, locale)}?${params.toString()}`;
}

function buildDetailWorksheetPath(
  search: DetailWorksheetSearch,
  locale: 'en' | 'zh'
) {
  const params = new URLSearchParams();
  params.set('characters', search.characters.join(','));
  params.set('details', search.details ? '1' : '0');
  params.set('trace', search.trace);

  if (search.note.trim()) {
    params.set('note', search.note.trim());
  }

  return `${getPathWithLocale(Routes.Worksheets, locale)}?${params.toString()}`;
}

function getHanziDetailCopy(locale: 'en' | 'zh') {
  if (locale === 'zh') {
    return {
      back: '返回 HSK1 课程',
      badge: '汉字详情',
      courseCta: '查看 HSK1 路径',
      completedBadge: '已完成',
      description: (meaning: string) =>
        `这个字的核心意思是：${meaning}。先理解形状，再用笔顺练习巩固。`,
      exampleLabel: '例词',
      examplesDescription: '把单字放进真实词语里记忆。',
      examplesTitle: '例词',
      factDescription: '练习前先确认读音和结构。',
      factTitle: '字卡',
      lessonLabel: '课程组',
      lessonWorksheetNote: (lesson: string) =>
        `${lesson}：把同一组汉字带到纸面上复习。`,
      meaningLabel: '意思',
      memoryDescription: '用一句形状提示降低第一次书写的记忆负担。',
      memoryShapeTitle: '看形',
      memorySoundDescription: (pinyin: string, meaning: string) =>
        `读作 ${pinyin}，核心意思是「${meaning}」。先读出来，再写。`,
      memorySoundTitle: '读音和意思',
      memoryTitle: '记忆提示',
      memoryUseDescription: (examples: string[]) =>
        examples.length > 0
          ? `放进 ${examples.slice(0, 2).join('、')} 里记，避免只背单字。`
          : '写完后自己造一个词，把这个字放进真实语境里。',
      memoryUseTitle: '放进词里',
      nextDescription: '继续练完整组，或生成练习纸带到纸面上写。',
      nextTitle: '下一步',
      currentBadge: '当前',
      lessonGroupDescription: '同一课程组里的字可以一起学，形成稳定的记忆块。',
      lessonGroupTitle: '同课汉字',
      pinyinLabel: '拼音',
      practiceCta: '打开描写练习',
      practiceAgainCta: '再练一次',
      pricingCta: '查看完整套餐',
      reviewCta: '复习错笔',
      reviewBadge: '复习',
      reviewWorksheetNote: (character: string, mistakeStrokes: number[]) => {
        if (mistakeStrokes.length === 0) {
          return `优先复习 ${character}：完整描写一遍，再回到同组汉字。`;
        }

        return `优先复习 ${character} 的${mistakeStrokes
          .map((stroke) => `第 ${getDisplayStrokeNumber(stroke)} 笔`)
          .join('、')}，再回到同组汉字。`;
      },
      proBadge: 'Pro 字',
      radicalLabel: '部首',
      shareError: '复制失败，请稍后重试。',
      statusCleanDescription: '这次没有记录到错笔，可以继续学习同课的新字。',
      statusCleanTitle: '已零错完成',
      statusFullTrace: '完整描写',
      statusNotStartedDescription:
        '先打开描写练习，完成后这里会显示错笔和复习建议。',
      statusNotStartedTitle: '还没有练过这个字',
      statusPlanDescription: (
        ageDays: number | null,
        needsReview: boolean,
        mistakes: number
      ) => {
        if (needsReview) {
          if (ageDays === null) {
            return '先重新描写一次，补上练习记录，再按错笔生成复习纸。';
          }
          if (ageDays === 0) {
            return `今天先修正 ${mistakes} 个错笔，不急着加新字。`;
          }
          if (ageDays <= 2) {
            return '先看笔顺动画，再重做一次描写，把错笔压下去。';
          }
          return '先复习这个字，再打印单字复习纸做纸笔巩固。';
        }

        if (ageDays === null) {
          return '快速复练一次，确认记录正常后再继续同组新字。';
        }
        if (ageDays === 0) {
          return '可以继续同组下一个字，或打印本组做纸笔巩固。';
        }
        return '先快速复练一次，再继续学习新的同课汉字。';
      },
      statusPlanLabel: '本次行动',
      statusStartPlanDescription:
        '先完成一次完整描写，再根据结果继续新字或打印复习纸。',
      statusReviewDescription: (mistakes: number) =>
        `上次练习记录到 ${mistakes} 次错误，建议先复习这些笔画。`,
      statusReviewTitle: '需要复习',
      statusRecencyDescription: (
        ageDays: number | null,
        needsReview: boolean
      ) => {
        if (ageDays === null) return '上次练习时间没有记录，建议重新练一遍。';
        if (ageDays === 0) {
          return needsReview
            ? '今天刚练过，趁手感还在先把错笔修掉。'
            : '今天已经练过，可以继续同组下一个字。';
        }
        if (ageDays === 1) {
          return needsReview
            ? '昨天练过但还有错笔，今天适合先复习这个字。'
            : '昨天练过，今天可以快速复练一次保持记忆。';
        }
        return `${ageDays} 天前练过，建议先复练一次再进入新字。`;
      },
      statusRecencyLabel: '复习时机',
      statusStroke: (stroke: number) => `第 ${stroke} 笔`,
      strokeCount: (count: number) => `${count} 画`,
      strokesLabel: '笔画',
      studyPlanMessage: ({
        character,
        detailUrl,
        isReview,
        practiceUrl,
        progress,
        worksheetUrl,
      }: StudyPlanMessageParams) => {
        const mistakeStrokes = progress?.mistakeStrokes ?? [];
        const ageDays = getPracticeAgeDays(progress?.completedAt);
        const status = !progress?.completed
          ? '练习状态：还没有练过'
          : progress.mistakes > 0
            ? `练习状态：上次 ${progress.mistakes} 次错误${
                mistakeStrokes.length > 0
                  ? `，重点笔画 ${mistakeStrokes
                      .map(
                        (stroke) => `第 ${getDisplayStrokeNumber(stroke)} 笔`
                      )
                      .join('、')}`
                  : '，需要完整复描'
              }`
            : `练习状态：零错完成${
                ageDays === null
                  ? ''
                  : ageDays === 0
                    ? '，今天刚练过'
                    : `，${ageDays} 天前练过`
              }`;
        const timing = !progress?.completed
          ? '现在先完成第一次描写。'
          : ageDays === null
            ? '重新练一次，刷新练习记录。'
            : ageDays === 0
              ? isReview
                ? '今天内先修正错笔，不急着加新字。'
                : '可以继续同课下一个字。'
              : ageDays === 1
                ? '今天先快速复练一次。'
                : `${ageDays} 天前练过，先复练再加新字。`;
        const assignment = isReview
          ? mistakeStrokes.length > 0
            ? `先复习 ${mistakeStrokes
                .map((stroke) => `第 ${getDisplayStrokeNumber(stroke)} 笔`)
                .join('、')}，再打印单字复习纸。`
            : '先完整复描一遍，再打印单字复习纸。'
          : progress?.completed
            ? '先快速回看字形，再继续同课下一个字。'
            : '先看字形提示，再完成一次描写练习。';

        return [
          'Lang Study 汉字学习计划',
          '',
          `今日汉字：${character.character} · ${character.pinyin}`,
          `意思：${character.meaning}`,
          `课程组：${character.lessonLabel}`,
          status,
          `复习时机：${timing}`,
          `要求：${assignment}`,
          `字卡：${detailUrl}`,
          `描写练习：${practiceUrl}`,
          `打印练习纸：${worksheetUrl}`,
          '',
          '建议流程：先读拼音和意思，跟着笔顺描写，再把同一组汉字带到纸面上慢慢写。',
        ].join('\n');
      },
      studyPlanShareCta: '复制学习计划',
      studyPlanShareSuccess: '学习计划已复制。',
      title: (character: string, pinyin: string) =>
        `${character} (${pinyin}) 怎么写`,
      titleEyebrow: 'HSK1 入门汉字',
      studySteps: [
        {
          title: '先看形',
          description: '先确认这个字长什么样，再去理解它的意思。',
          icon: 'observe',
        },
        {
          title: '马上描写',
          description: '打开描写练习，跟着笔顺把它写出来。',
          icon: 'trace',
        },
        {
          title: '打印复习',
          description: '生成同一组练习纸，把学习延续到纸面上。',
          icon: 'print',
        },
      ],
      worksheetCta: '打印练习纸',
      worksheetLockedCta: '生成练习纸',
      previewCta: '查看练习纸',
    };
  }

  return {
    back: 'Back to HSK1 course',
    badge: 'Hanzi detail',
    courseCta: 'View HSK1 path',
    completedBadge: 'Done',
    description: (meaning: string) =>
      `This character means ${meaning}. Learn the shape first, then reinforce it with guided stroke practice.`,
    exampleLabel: 'Example word',
    examplesDescription: 'Remember the character inside real beginner words.',
    examplesTitle: 'Example words',
    factDescription: 'Check pronunciation and structure before practicing.',
    factTitle: 'Character card',
    lessonLabel: 'Lesson',
    lessonWorksheetNote: (lesson: string) =>
      `${lesson}: take this lesson group onto paper for review.`,
    meaningLabel: 'Meaning',
    memoryDescription:
      'Use a simple shape cue to make the first writing attempt easier.',
    memoryShapeTitle: 'See the shape',
    memorySoundDescription: (pinyin: string, meaning: string) =>
      `Read it as ${pinyin}. The core meaning is ${meaning}. Say it before writing.`,
    memorySoundTitle: 'Sound and meaning',
    memoryTitle: 'Memory cue',
    memoryUseDescription: (examples: string[]) =>
      examples.length > 0
        ? `Anchor it inside ${examples.slice(0, 2).join(', ')} instead of memorizing it alone.`
        : 'After writing, make one word with it so the character has context.',
    memoryUseTitle: 'Use it in words',
    nextDescription:
      'Keep practicing the full group, or move the same characters onto paper.',
    nextTitle: 'Next step',
    currentBadge: 'Current',
    lessonGroupDescription:
      'Characters in the same lesson work well as a small study set.',
    lessonGroupTitle: 'Lesson group',
    pinyinLabel: 'Pinyin',
    practiceCta: 'Open tracing practice',
    practiceAgainCta: 'Practice again',
    pricingCta: 'View complete pack',
    reviewCta: 'Review missed strokes',
    reviewBadge: 'Review',
    reviewWorksheetNote: (character: string, mistakeStrokes: number[]) => {
      if (mistakeStrokes.length === 0) {
        return `Review ${character} with one full trace before returning to the lesson group.`;
      }

      return `Review ${character} ${
        mistakeStrokes.length === 1 ? 'stroke' : 'strokes'
      } ${mistakeStrokes
        .map((stroke) => getDisplayStrokeNumber(stroke))
        .join(', ')} before returning to the lesson group.`;
    },
    proBadge: 'Pro character',
    radicalLabel: 'Radical',
    shareError: 'Could not copy. Please try again.',
    statusCleanDescription:
      'No missed strokes were recorded. Continue with the next character in this lesson.',
    statusCleanTitle: 'Completed cleanly',
    statusFullTrace: 'Full trace',
    statusNotStartedDescription:
      'Open tracing practice first. After a run, this card will show missed strokes and review guidance.',
    statusNotStartedTitle: 'Not practiced yet',
    statusPlanDescription: (
      ageDays: number | null,
      needsReview: boolean,
      mistakes: number
    ) => {
      if (needsReview) {
        if (ageDays === null) {
          return 'Start with one fresh tracing run, then build a focused worksheet from missed strokes.';
        }
        if (ageDays === 0) {
          return `Fix the ${mistakes} missed strokes today before adding a new character.`;
        }
        if (ageDays <= 2) {
          return 'Watch the stroke animation, then repeat one guided tracing run.';
        }
        return 'Refresh this character first, then print a single-character review sheet.';
      }

      if (ageDays === null) {
        return 'Do one quick refresh to restore the practice record before moving on.';
      }
      if (ageDays === 0) {
        return 'Continue with the next lesson character, or print the lesson set for paper review.';
      }
      return 'Do one quick refresh, then continue with a new lesson character.';
    },
    statusPlanLabel: 'Action plan',
    statusStartPlanDescription:
      'Complete one guided tracing run, then continue or print based on the result.',
    statusReviewDescription: (mistakes: number) =>
      `Your last run recorded ${mistakes} mistakes. Review these strokes first.`,
    statusReviewTitle: 'Review recommended',
    statusRecencyDescription: (
      ageDays: number | null,
      needsReview: boolean
    ) => {
      if (ageDays === null) {
        return 'The last practice time was not saved. Run it once more.';
      }
      if (ageDays === 0) {
        return needsReview
          ? 'Practiced today. Fix the missed strokes while the shape is fresh.'
          : 'Practiced today. Continue with the next character in this lesson.';
      }
      if (ageDays === 1) {
        return needsReview
          ? 'Practiced yesterday with missed strokes. Review this character first today.'
          : 'Practiced yesterday. Do a quick refresh to keep it warm.';
      }
      return `Last practiced ${ageDays} days ago. Refresh this character before adding a new one.`;
    },
    statusRecencyLabel: 'Review timing',
    statusStroke: (stroke: number) => `Stroke ${stroke}`,
    strokeCount: (count: number) => `${count} strokes`,
    strokesLabel: 'Strokes',
    studyPlanMessage: ({
      character,
      detailUrl,
      isReview,
      practiceUrl,
      progress,
      worksheetUrl,
    }: StudyPlanMessageParams) => {
      const mistakeStrokes = progress?.mistakeStrokes ?? [];
      const ageDays = getPracticeAgeDays(progress?.completedAt);
      const status = !progress?.completed
        ? 'Practice status: not practiced yet'
        : progress.mistakes > 0
          ? `Practice status: ${progress.mistakes} ${
              progress.mistakes === 1 ? 'mistake' : 'mistakes'
            } last run${
              mistakeStrokes.length > 0
                ? `, focus ${
                    mistakeStrokes.length === 1 ? 'stroke' : 'strokes'
                  } ${mistakeStrokes
                    .map((stroke) => getDisplayStrokeNumber(stroke))
                    .join(', ')}`
                : ', full trace needed'
            }`
          : `Practice status: clean run${
              ageDays === null
                ? ''
                : ageDays === 0
                  ? ', practiced today'
                  : `, practiced ${ageDays} days ago`
            }`;
      const timing = !progress?.completed
        ? 'Start with the first tracing run now.'
        : ageDays === null
          ? 'Run it once more to refresh the practice record.'
          : ageDays === 0
            ? isReview
              ? 'Fix the missed strokes today before adding a new character.'
              : 'Continue with the next lesson character.'
            : ageDays === 1
              ? 'Do one quick refresh today.'
              : `Last practiced ${ageDays} days ago; refresh it before adding a new character.`;
      const assignment = isReview
        ? mistakeStrokes.length > 0
          ? `Review ${
              mistakeStrokes.length === 1 ? 'stroke' : 'strokes'
            } ${mistakeStrokes
              .map((stroke) => getDisplayStrokeNumber(stroke))
              .join(', ')}, then print a focused sheet.`
          : 'Do one full trace, then print a focused sheet.'
        : progress?.completed
          ? 'Quickly refresh the shape, then continue with the next lesson character.'
          : 'Study the shape cue, then complete one tracing run.';

      return [
        'Lang Study hanzi study plan',
        '',
        `Character: ${character.character} · ${character.pinyin}`,
        `Meaning: ${character.meaning}`,
        `Lesson group: ${character.lessonLabel}`,
        status,
        `Review timing: ${timing}`,
        `Assignment: ${assignment}`,
        `Character card: ${detailUrl}`,
        `Tracing practice: ${practiceUrl}`,
        `Printable worksheet: ${worksheetUrl}`,
        '',
        'Suggested flow: read the pinyin and meaning, trace with stroke order, then move the same character set onto paper.',
      ].join('\n');
    },
    studyPlanShareCta: 'Copy study plan',
    studyPlanShareSuccess: 'Study plan copied.',
    title: (character: string, pinyin: string) =>
      `How to write ${character} (${pinyin})`,
    titleEyebrow: 'HSK1 starter character',
    studySteps: [
      {
        title: 'See the shape',
        description: 'Confirm what the character looks like before writing it.',
        icon: 'observe',
      },
      {
        title: 'Trace right away',
        description: 'Open tracing practice and follow the stroke order.',
        icon: 'trace',
      },
      {
        title: 'Print to review',
        description: 'Generate a worksheet and keep the same lesson on paper.',
        icon: 'print',
      },
    ],
    worksheetCta: 'Print worksheet',
    worksheetLockedCta: 'Create worksheet',
    previewCta: 'See worksheet',
  };
}
