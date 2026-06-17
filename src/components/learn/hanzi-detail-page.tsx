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
import { getLocale } from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import {
  IconArrowLeft,
  IconArrowRight,
  IconBook2,
  IconCheck,
  IconEye,
  IconFileText,
  IconGripVertical,
  IconLock,
  IconPencil,
  IconPrinter,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { useMemo } from 'react';

type StudyStepIcon = 'observe' | 'trace' | 'print';

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
  const lessonCharacters = lesson?.characters ?? [character];

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

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(20rem,0.55fr)] lg:items-start">
          <div className="space-y-6">
            <Card className="rounded-lg">
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
                    <CardTitle className="text-3xl sm:text-4xl">
                      {copy.title(character.character, character.pinyin)}
                    </CardTitle>
                    <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                      {copy.description(character.meaning)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={Routes.Learn}
                        search={{ character: practiceTarget }}
                        className={buttonVariants()}
                      >
                        <IconPencil className="size-4" />
                        {copy.practiceCta}
                      </Link>
                      <Link
                        to={Routes.Worksheets}
                        search={{ characters: worksheetCharacters }}
                        className={cn(buttonVariants({ variant: 'outline' }))}
                      >
                        <IconFileText className="size-4" />
                        {character.premium
                          ? copy.worksheetLockedCta
                          : copy.worksheetCta}
                      </Link>
                    </div>
                    <div className="grid gap-3 pt-2 sm:grid-cols-3">
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

            <Card className="rounded-lg">
              <CardHeader>
                <CardTitle>{copy.memoryTitle}</CardTitle>
                <CardDescription>{copy.memoryDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-base leading-7">{character.hint}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconGripVertical className="size-4 text-muted-foreground" />
                  {copy.examplesTitle}
                </CardTitle>
                <CardDescription>{copy.examplesDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-3">
                  {character.examples.map((example) => (
                    <div
                      className="rounded-lg border bg-card p-4"
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

            <Card className="rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconCheck className="size-4" />
                  {copy.lessonGroupTitle}
                </CardTitle>
                <CardDescription>{copy.lessonGroupDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {lessonCharacters.map((item) => (
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
                          ) : null}
                        </div>
                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                          {item.lessonLabel}
                        </p>
                      </div>
                      <IconArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-4">
            <Card className="rounded-lg">
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

            <Card className="rounded-lg border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <IconBook2 className="size-4" />
                  {copy.nextTitle}
                </CardTitle>
                <CardDescription>{copy.nextDescription}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
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
                  search={
                    character.premium
                      ? undefined
                      : { characters: worksheetCharacters }
                  }
                  className={cn(buttonVariants(), 'justify-start')}
                >
                  <IconLock className="size-4" />
                  {character.premium ? copy.pricingCta : copy.previewCta}
                </Link>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </section>
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

function getHanziDetailCopy(locale: 'en' | 'zh') {
  if (locale === 'zh') {
    return {
      back: '返回 HSK1 课程',
      badge: '汉字详情',
      courseCta: '查看 HSK1 路径',
      description: (meaning: string) =>
        `这个字的核心意思是：${meaning}。先理解形状，再用笔顺练习巩固。`,
      exampleLabel: '例词',
      examplesDescription: '把单字放进真实词语里记忆。',
      examplesTitle: '例词',
      factDescription: '练习前先确认读音和结构。',
      factTitle: '字卡',
      lessonLabel: '课程组',
      meaningLabel: '意思',
      memoryDescription: '用一句形状提示降低第一次书写的记忆负担。',
      memoryTitle: '记忆提示',
      nextDescription: '继续练完整组，或生成练习纸带到纸面上写。',
      nextTitle: '下一步',
      currentBadge: '当前',
      lessonGroupDescription: '同一课程组里的字可以一起学，形成稳定的记忆块。',
      lessonGroupTitle: '同课汉字',
      pinyinLabel: '拼音',
      practiceCta: '打开描写练习',
      pricingCta: '查看完整套餐',
      proBadge: 'Pro 字',
      radicalLabel: '部首',
      strokeCount: (count: number) => `${count} 画`,
      strokesLabel: '笔画',
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
    description: (meaning: string) =>
      `This character means ${meaning}. Learn the shape first, then reinforce it with guided stroke practice.`,
    exampleLabel: 'Example word',
    examplesDescription: 'Remember the character inside real beginner words.',
    examplesTitle: 'Example words',
    factDescription: 'Check pronunciation and structure before practicing.',
    factTitle: 'Character card',
    lessonLabel: 'Lesson',
    meaningLabel: 'Meaning',
    memoryDescription:
      'Use a simple shape cue to make the first writing attempt easier.',
    memoryTitle: 'Memory cue',
    nextDescription:
      'Keep practicing the full group, or move the same characters onto paper.',
    nextTitle: 'Next step',
    currentBadge: 'Current',
    lessonGroupDescription:
      'Characters in the same lesson work well as a small study set.',
    lessonGroupTitle: 'Lesson group',
    pinyinLabel: 'Pinyin',
    practiceCta: 'Open tracing practice',
    pricingCta: 'View complete pack',
    proBadge: 'Pro character',
    radicalLabel: 'Radical',
    strokeCount: (count: number) => `${count} strokes`,
    strokesLabel: 'Strokes',
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
