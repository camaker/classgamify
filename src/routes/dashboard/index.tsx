import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getFreeCharacters } from '@/learn/hanzi-course';
import {
  getHanziProgressSummary,
  readStoredHanziProgress,
  type HanziProgressSummary,
} from '@/learn/hanzi-progress';
import { getLocale } from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import {
  IconArrowRight,
  IconBook2,
  IconFileText,
  IconPencil,
  IconPrinter,
  IconRotate,
  IconSparkles,
  IconUsers,
  type TablerIcon,
} from '@tabler/icons-react';
import { Link, createFileRoute } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
});

function DashboardPage() {
  const locale = getLocale() === 'zh' ? 'zh' : 'en';
  const copy = getDashboardCopy(locale);
  const characters = useMemo(() => getFreeCharacters(locale), [locale]);
  const [progressSummary, setProgressSummary] =
    useState<HanziProgressSummary | null>(null);

  useEffect(() => {
    setProgressSummary(
      getHanziProgressSummary(characters, readStoredHanziProgress())
    );
  }, [characters]);

  const summary = progressSummary ?? getHanziProgressSummary(characters, {});
  const nextCharacter =
    summary.reviewItems[0]?.character ?? summary.nextPracticeTarget?.character;
  const practiceSearch = nextCharacter
    ? { character: nextCharacter.character }
    : undefined;
  const reviewWorksheetSearch =
    summary.reviewCharacters.length > 0
      ? {
          characters: summary.reviewCharacters,
          feedback: true,
          note: copy.reviewWorksheetNote(summary.reviewCharacters.length),
          trace: 'guided' as const,
        }
      : {
          characters: characters.map((item) => item.character),
          feedback: true,
          note: copy.starterWorksheetNote,
          trace: 'first' as const,
        };
  const nextSteps = [
    {
      description:
        summary.reviewItems.length > 0
          ? copy.practiceReviewDescription(summary.reviewItems.length)
          : nextCharacter
            ? copy.practiceNextDescription(nextCharacter.character)
            : copy.practiceCompleteDescription,
      href: Routes.Learn,
      icon: IconPencil,
      primary: true,
      search: practiceSearch,
      title:
        summary.reviewItems.length > 0
          ? copy.practiceReviewTitle
          : copy.practiceTitle,
    },
    {
      description:
        summary.reviewCharacters.length > 0
          ? copy.worksheetReviewDescription(summary.reviewCharacters.length)
          : copy.worksheetStarterDescription,
      href: Routes.Worksheets,
      icon: IconFileText,
      search: reviewWorksheetSearch,
      title:
        summary.reviewCharacters.length > 0
          ? copy.worksheetReviewTitle
          : copy.worksheetTitle,
    },
    {
      description: copy.courseDescription,
      href: Routes.Hsk1,
      icon: IconBook2,
      title: copy.courseTitle,
    },
  ];
  const supportCards = [
    {
      description: copy.pricingDescription,
      href: Routes.Pricing,
      icon: IconSparkles,
      title: copy.pricingTitle,
    },
    {
      description: copy.teachersDescription,
      href: Routes.Teachers,
      icon: IconUsers,
      title: copy.teachersTitle,
    },
  ];

  const breadcrumbs = [{ label: copy.breadcrumb, isCurrentPage: true }];

  return (
    <DashboardLayout
      breadcrumbs={breadcrumbs}
      title={copy.title}
      description={copy.description}
    >
      <div className="grid gap-6">
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0 rounded-lg border bg-card p-4 sm:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 space-y-2">
                <Badge
                  variant="outline"
                  className="rounded-md border-primary/30"
                >
                  <IconRotate className="size-3.5" />
                  {copy.rhythmBadge}
                </Badge>
                <h2 className="text-xl font-semibold tracking-tight">
                  {copy.rhythmTitle}
                </h2>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                  {copy.rhythmDescription(summary)}
                </p>
              </div>
              <Link
                to={Routes.Worksheets}
                search={reviewWorksheetSearch}
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'w-full shrink-0 rounded-lg bg-background sm:w-auto'
                )}
              >
                <IconPrinter className="size-4" />
                {copy.printCta}
              </Link>
            </div>

            <div className="mt-6">
              <Progress value={summary.progressValue} />
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <span>
                  {copy.progressLabel(summary.completedCount, summary.total)}
                </span>
                <span>{copy.cleanLabel(summary.cleanCount)}</span>
                <span>{copy.reviewLabel(summary.reviewItems.length)}</span>
              </div>
            </div>
          </div>

          <div className="grid min-w-0 gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <MetricCard
              label={copy.todayMetric}
              value={String(summary.completedTodayCount)}
            />
            <MetricCard
              label={copy.streakMetric}
              value={copy.streakValue(summary.currentStreakDays)}
            />
            <MetricCard
              label={copy.activeDaysMetric}
              value={String(summary.activeDayCount)}
            />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {nextSteps.map((item) => (
            <ActionCard key={item.title} item={item} />
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          {supportCards.map((item) => (
            <ActionCard key={item.title} item={item} compact />
          ))}
        </section>
      </div>
    </DashboardLayout>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border bg-card p-4">
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{label}</p>
    </div>
  );
}

function ActionCard({
  compact,
  item,
}: {
  compact?: boolean;
  item: {
    description: string;
    href: string;
    icon: TablerIcon;
    primary?: boolean;
    search?: Record<string, unknown>;
    title: string;
  };
}) {
  return (
    <Link
      to={item.href}
      search={item.search}
      className={cn(
        'group min-w-0 rounded-lg border bg-card p-5 transition-colors',
        'hover:border-primary/40 hover:bg-primary/5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        item.primary && 'border-primary/30 bg-primary/5',
        compact && 'p-4'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-primary">
          <item.icon className="size-4" />
        </div>
        <IconArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
      <h2 className="mt-4 font-semibold">{item.title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {item.description}
      </p>
    </Link>
  );
}

function getDashboardCopy(locale: 'en' | 'zh') {
  if (locale === 'zh') {
    return {
      activeDaysMetric: '累计练习天数',
      breadcrumb: '工作台',
      cleanLabel: (count: number) => `${count} 个零错完成`,
      courseDescription: '查看 HSK1 路径、课程分组、进度备份和下一轮复习建议。',
      courseTitle: '打开 HSK1 路径',
      description:
        '继续今天的汉字描写、复习错笔，或者把同一组汉字带到纸面练习。',
      practiceCompleteDescription:
        '免费入门字已经完成。回到线上快速复习，再用练习纸做一轮慢写。',
      practiceNextDescription: (character: string) =>
        `从下一个汉字 ${character} 开始，保持短练习节奏。`,
      practiceReviewDescription: (count: number) =>
        `先处理 ${count} 个有错笔记录的汉字，再加入新字。`,
      practiceReviewTitle: '先复习错笔',
      practiceTitle: '继续线上描写',
      pricingDescription:
        '查看免费、Pro 和早期终身版的权益边界，决定是否需要完整 HSK1 和自定义练习纸。',
      pricingTitle: '查看升级方案',
      printCta: '打印当前练习纸',
      progressLabel: (completed: number, total: number) =>
        `${completed}/${total} 个入门汉字已完成`,
      reviewLabel: (count: number) =>
        count > 0 ? `${count} 个待复习` : '暂无错笔队列',
      reviewWorksheetNote: (count: number) =>
        `先复习这 ${count} 个有错笔记录的汉字。`,
      rhythmBadge: '学习工作台',
      rhythmDescription: (summary: HanziProgressSummary) => {
        if (summary.reviewItems.length > 0) {
          return '今天先从错笔队列开始，把真正卡住的字带回线上复习，再决定是否打印。';
        }
        if (summary.completedCount > 0) {
          return '你已经开始建立练字节奏。继续下一个汉字，或把当前字组打印成纸笔作业。';
        }
        return '先完成一个短练习：看笔顺、跟随描写、记录错笔，再打印同一组慢写。';
      },
      rhythmTitle: '今天从哪里继续？',
      starterWorksheetNote: '用这组 HSK1 入门汉字完成一轮纸笔慢写。',
      streakMetric: '连续节奏',
      streakValue: (count: number) => (count > 0 ? `${count} 天` : '未开始'),
      teachersDescription:
        '为课堂、tutor 或家庭陪练整理线上复习到纸面作业的流程。',
      teachersTitle: '老师与家长工作流',
      title: 'Lang Study 工作台',
      todayMetric: '今日完成',
      worksheetReviewDescription: (count: number) =>
        `把 ${count} 个待复习汉字生成一张更聚焦的打印作业。`,
      worksheetReviewTitle: '打印复习纸',
      worksheetStarterDescription:
        '把免费 HSK1 入门字生成干净练习纸，适合课堂、家庭或自学。',
      worksheetTitle: '制作练习纸',
    };
  }

  return {
    activeDaysMetric: 'active practice days',
    breadcrumb: 'Dashboard',
    cleanLabel: (count: number) => `${count} clean runs`,
    courseDescription:
      'Review the HSK1 path, lesson groups, backup tools, and next review suggestions.',
    courseTitle: 'Open the HSK1 path',
    description:
      'Continue character tracing, clear missed strokes, or take the same set onto paper.',
    practiceCompleteDescription:
      'The free starter set is complete. Revisit online review, then print a slow paper pass.',
    practiceNextDescription: (character: string) =>
      `Start from the next character, ${character}, and keep the session short.`,
    practiceReviewDescription: (count: number) =>
      `Clear ${count} characters with missed strokes before adding new ones.`,
    practiceReviewTitle: 'Review missed strokes first',
    practiceTitle: 'Continue online tracing',
    pricingDescription:
      'Compare Free, Pro, and Early Lifetime boundaries before unlocking full HSK1 and custom worksheets.',
    pricingTitle: 'Review upgrade options',
    printCta: 'Print current worksheet',
    progressLabel: (completed: number, total: number) =>
      `${completed}/${total} starter characters complete`,
    reviewLabel: (count: number) =>
      count > 0 ? `${count} to review` : 'no review queue yet',
    reviewWorksheetNote: (count: number) =>
      `Start with the ${count} characters that have missed strokes.`,
    rhythmBadge: 'Learning dashboard',
    rhythmDescription: (summary: HanziProgressSummary) => {
      if (summary.reviewItems.length > 0) {
        return 'Start from the review queue today, bring hard characters back online, then decide whether to print.';
      }
      if (summary.completedCount > 0) {
        return 'You have started a writing rhythm. Continue the next character, or print the current set for paper practice.';
      }
      return 'Run one short loop first: watch stroke order, trace, save missed strokes, then print the same set.';
    },
    rhythmTitle: 'Where should today start?',
    starterWorksheetNote:
      'Use this HSK1 starter set for one slow handwriting pass.',
    streakMetric: 'practice streak',
    streakValue: (count: number) => (count > 0 ? `${count} days` : 'not yet'),
    teachersDescription:
      'Plan the online review to paper homework handoff for classes, tutoring, or family practice.',
    teachersTitle: 'Teacher and parent workflow',
    title: 'Lang Study dashboard',
    todayMetric: 'completed today',
    worksheetReviewDescription: (count: number) =>
      `Turn ${count} review characters into a focused paper assignment.`,
    worksheetReviewTitle: 'Print a review sheet',
    worksheetStarterDescription:
      'Generate a clean HSK1 starter sheet for class, family practice, or self-study.',
    worksheetTitle: 'Make a worksheet',
  };
}
