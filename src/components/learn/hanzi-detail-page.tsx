import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { LessonCharacter } from '@/learn/hanzi-course';
import { getLocale } from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import {
  IconArrowLeft,
  IconBook2,
  IconFileText,
  IconLock,
  IconPencil,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';

export function HanziDetailPage({ character }: { character: LessonCharacter }) {
  const currentLocale = getLocale() === 'zh' ? 'zh' : 'en';
  const copy = getHanziDetailCopy(currentLocale);

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
                      <Link to={Routes.Learn} className={buttonVariants()}>
                        <IconPencil className="size-4" />
                        {copy.practiceCta}
                      </Link>
                      <Link
                        to={Routes.Worksheets}
                        className={cn(buttonVariants({ variant: 'outline' }))}
                      >
                        <IconFileText className="size-4" />
                        {copy.worksheetCta}
                      </Link>
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
                <CardTitle>{copy.examplesTitle}</CardTitle>
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
                  to={Routes.Pricing}
                  className={cn(buttonVariants(), 'justify-start')}
                >
                  <IconLock className="size-4" />
                  {copy.pricingCta}
                </Link>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </section>
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
      worksheetCta: '打印练习纸',
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
    worksheetCta: 'Print worksheet',
  };
}
