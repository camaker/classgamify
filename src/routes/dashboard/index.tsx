import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getFreeCharacters } from '@/learn/hanzi-course';
import {
  getHanziProgressSummary,
  readStoredHanziProgress,
  type HanziProgressSummary,
} from '@/learn/hanzi-progress';
import { getLocale } from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { getPathWithLocale } from '@/lib/urls';
import { cn } from '@/lib/utils';
import {
  IconArrowRight,
  IconBook2,
  IconClipboardCheck,
  IconFileText,
  IconListCheck,
  IconPencil,
  IconPrinter,
  IconRotate,
  IconSparkles,
  IconUsers,
  type TablerIcon,
} from '@tabler/icons-react';
import { Link, createFileRoute } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
});

type DashboardPlanMessageInput = {
  completedCount: number;
  nextCharacter?: string;
  practiceUrl: string;
  reviewCharacters: string[];
  total: number;
  worksheetUrl: string;
  worksheetCharacters: string[];
};

type SessionPlanStep = {
  description: string;
  href: string;
  icon: TablerIcon;
  label: string;
  primary?: boolean;
  search?: Record<string, unknown>;
  title: string;
};

type SessionPlanLink = {
  description: string;
  href: string;
  icon: TablerIcon;
  label: string;
  title: string;
};

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
  const sessionPlan: SessionPlanStep[] = [
    {
      description:
        summary.reviewItems.length > 0
          ? copy.practiceReviewDescription(summary.reviewItems.length)
          : nextCharacter
            ? copy.practiceNextDescription(nextCharacter.character)
            : copy.practiceCompleteDescription,
      href: Routes.Learn,
      icon: IconPencil,
      label: copy.planStepPracticeLabel,
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
      label: copy.planStepPrintLabel,
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
      label: copy.planStepCourseLabel,
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
  const practiceShareUrl = buildDashboardShareUrl(
    Routes.Learn,
    locale,
    practiceSearch
  );
  const worksheetShareUrl = buildDashboardShareUrl(
    Routes.Worksheets,
    locale,
    reviewWorksheetSearch
  );
  const handoffLinks: SessionPlanLink[] = [
    {
      description: copy.practiceLinkDescription,
      href: practiceShareUrl,
      icon: IconPencil,
      label: copy.practiceLinkLabel,
      title: copy.practiceLinkTitle,
    },
    {
      description: copy.worksheetLinkDescription,
      href: worksheetShareUrl,
      icon: IconFileText,
      label: copy.worksheetLinkLabel,
      title: copy.worksheetLinkTitle,
    },
  ];
  const handoffPlan = copy.handoffPlanMessage({
    completedCount: summary.completedCount,
    nextCharacter: nextCharacter?.character,
    practiceUrl: practiceShareUrl,
    reviewCharacters: summary.reviewCharacters,
    total: summary.total,
    worksheetUrl: worksheetShareUrl,
    worksheetCharacters: reviewWorksheetSearch.characters,
  });

  const handleCopyPlan = async () => {
    if (
      typeof window === 'undefined' ||
      !window.navigator.clipboard?.writeText
    ) {
      toast.error(copy.copyPlanError);
      return;
    }

    try {
      await window.navigator.clipboard.writeText(handoffPlan);
      toast.success(copy.copyPlanSuccess);
    } catch {
      toast.error(copy.copyPlanError);
    }
  };

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

        <SessionPlan
          copyCta={copy.copyPlanCta}
          description={copy.planDescription}
          handoffLabel={copy.planHandoffLabel}
          handoffNote={copy.planHandoffNote(
            summary.reviewCharacters,
            nextCharacter?.character
          )}
          linkListLabel={copy.planLinksLabel}
          links={handoffLinks}
          onCopy={handleCopyPlan}
          steps={sessionPlan}
          title={copy.planTitle}
        />

        <section className="grid gap-4 lg:grid-cols-2">
          {supportCards.map((item) => (
            <ActionCard key={item.title} item={item} compact />
          ))}
        </section>
      </div>
    </DashboardLayout>
  );
}

function SessionPlan({
  copyCta,
  description,
  handoffLabel,
  handoffNote,
  linkListLabel,
  links,
  onCopy,
  steps,
  title,
}: {
  copyCta: string;
  description: string;
  handoffLabel: string;
  handoffNote: string;
  linkListLabel: string;
  links: SessionPlanLink[];
  onCopy: () => void;
  steps: SessionPlanStep[];
  title: string;
}) {
  return (
    <section className="min-w-0">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <Badge variant="outline" className="rounded-md border-primary/30">
            <IconListCheck className="size-3.5" />
            {title}
          </Badge>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full bg-background sm:w-auto"
          onClick={onCopy}
        >
          <IconClipboardCheck className="size-4" />
          {copyCta}
        </Button>
      </div>

      <ol className="mt-4 grid gap-4 lg:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.label} className="min-w-0">
            <Link
              to={step.href}
              search={step.search}
              className={cn(
                'group flex h-full min-w-0 flex-col rounded-lg border',
                'bg-card p-4 transition-colors',
                'hover:border-primary/40 hover:bg-primary/5',
                'focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-ring',
                step.primary && 'border-primary/30 bg-primary/5'
              )}
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background text-primary">
                  <step.icon className="size-4" />
                </span>
                <span className="text-xs font-semibold uppercase">
                  {index + 1}. {step.label}
                </span>
              </div>
              <h2 className="mt-3 text-balance font-semibold text-sm leading-5">
                {step.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {step.description}
              </p>
              <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-medium text-primary">
                {step.label}
                <IconArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <p className="mt-3 border-t pt-3 text-sm leading-6 text-muted-foreground">
        <span className="font-medium text-foreground">{handoffLabel}</span>{' '}
        {handoffNote}
      </p>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase text-muted-foreground">
          {linkListLabel}
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {links.map((link) => (
            <a
              key={link.title}
              href={link.href}
              className={cn(
                'group flex min-w-0 items-start gap-3 rounded-lg border',
                'bg-card p-3 transition-colors',
                'hover:border-primary/40 hover:bg-primary/5',
                'focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-ring'
              )}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background text-primary">
                <link.icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium leading-5">
                  {link.title}
                </span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                  {link.description}
                </span>
                <span className="mt-2 inline-flex max-w-full items-center gap-1 text-xs font-medium text-primary">
                  <span className="truncate">{link.label}</span>
                  <IconArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
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

function buildDashboardShareUrl(
  path: string,
  locale: 'en' | 'zh',
  search?: Record<string, unknown>
) {
  const url = new URL(
    getPathWithLocale(path, locale),
    'https://getlangstudy.com'
  );

  for (const [key, value] of Object.entries(search ?? {})) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null && item !== '') {
          url.searchParams.append(key, String(item));
        }
      }
      continue;
    }

    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
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
        '50 字第一阶段内容包已经完成。回到线上快速复习，再用练习纸做一轮慢写。',
      practiceNextDescription: (character: string) =>
        `从下一个汉字 ${character} 开始，保持短练习节奏。`,
      practiceReviewDescription: (count: number) =>
        `先处理 ${count} 个有错笔记录的汉字，再加入新字。`,
      practiceReviewTitle: '复习错笔',
      practiceTitle: '继续线上描写',
      pricingDescription:
        '查看免费、Pro 和早期终身版的权益边界，决定是否需要保存字表、自定义练习纸和可复用作业流程。',
      pricingTitle: '查看升级方案',
      printCta: '打印当前练习纸',
      copyPlanCta: '复制今日计划',
      copyPlanError: '无法复制今日计划，请稍后重试。',
      copyPlanSuccess: '今日学习计划已复制。',
      handoffPlanMessage: ({
        completedCount,
        nextCharacter,
        practiceUrl,
        reviewCharacters,
        total,
        worksheetUrl,
        worksheetCharacters,
      }: DashboardPlanMessageInput) =>
        [
          'Lang Study 今日学习计划',
          `进度：${completedCount}/${total} 个第一阶段汉字已完成。`,
          reviewCharacters.length > 0
            ? `先复习错笔：${reviewCharacters.join(' ')}`
            : nextCharacter
              ? `下一字：${nextCharacter}`
              : '入门字已完成：做一轮慢速复习。',
          `纸笔练习：${worksheetCharacters.join(' ')}`,
          `线上练习：${practiceUrl}`,
          `打印练习纸：${worksheetUrl}`,
        ].join('\n'),
      planDescription:
        '把今天的线上描写、打印练习和课程复盘放在同一条路径里。老师、家长或自学者可以直接复制给下一次练习。',
      planHandoffLabel: '交接说明：',
      planHandoffNote: (reviewCharacters: string[], next?: string) => {
        if (reviewCharacters.length > 0) {
          return `今天优先处理 ${reviewCharacters.join(
            ' '
          )}，打印前先在线复习一次。`;
        }
        if (next) return `今天从 ${next} 开始，再把同组汉字打印成慢写作业。`;
        return '入门字已经完成，今天适合打印整组汉字做复盘慢写。';
      },
      planStepCourseLabel: '复盘路径',
      planStepPracticeLabel: '线上练习',
      planStepPrintLabel: '打印练习',
      planTitle: '今日练习计划',
      planLinksLabel: '可直接打开的交接链接',
      practiceLinkDescription: '先用同一汉字组复习笔顺和错笔记录。',
      practiceLinkLabel: '打开线上练习',
      practiceLinkTitle: '线上练习链接',
      progressLabel: (completed: number, total: number) =>
        `${completed}/${total} 个第一阶段汉字已完成`,
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
      starterWorksheetNote: '用这组 HSK1 第一阶段汉字完成一轮纸笔慢写。',
      streakMetric: '连续节奏',
      streakValue: (count: number) => (count > 0 ? `${count} 天` : '未开始'),
      teachersDescription:
        '为课堂、tutor 或家庭陪练整理线上复习到纸面作业的流程。',
      teachersTitle: '老师与家长工作流',
      title: 'Lang Study 工作台',
      todayMetric: '今日完成',
      worksheetReviewDescription: (count: number) =>
        `把 ${count} 个待复习汉字生成一张更聚焦的打印作业。`,
      worksheetLinkDescription: '沿用当前字组、纸张设置和作业说明。',
      worksheetLinkLabel: '打开打印练习纸',
      worksheetLinkTitle: '打印练习纸链接',
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
      'The 50-character launch pack is complete. Revisit online review, then print a slow paper pass.',
    practiceNextDescription: (character: string) =>
      `Start from the next character, ${character}, and keep the session short.`,
    practiceReviewDescription: (count: number) =>
      `Clear ${count} characters with missed strokes before adding new ones.`,
    practiceReviewTitle: 'Review missed strokes',
    practiceTitle: 'Continue online tracing',
    pricingDescription:
      'Compare Free, Pro, and Early Lifetime boundaries before adding saved lists, custom worksheets, and repeatable assignment workflows.',
    pricingTitle: 'Review upgrade options',
    printCta: 'Print current worksheet',
    copyPlanCta: "Copy today's plan",
    copyPlanError: 'Could not copy the study plan. Try again later.',
    copyPlanSuccess: "Today's study plan copied.",
    handoffPlanMessage: ({
      completedCount,
      nextCharacter,
      practiceUrl,
      reviewCharacters,
      total,
      worksheetUrl,
      worksheetCharacters,
    }: DashboardPlanMessageInput) =>
      [
        'Lang Study daily study plan',
        `Progress: ${completedCount}/${total} launch characters complete.`,
        reviewCharacters.length > 0
          ? `Review first: ${reviewCharacters.join(' ')}`
          : nextCharacter
            ? `Next character: ${nextCharacter}`
            : 'Launch pack complete: do one slow review pass.',
        `Paper practice: ${worksheetCharacters.join(' ')}`,
        `Online practice: ${practiceUrl}`,
        `Printable worksheet: ${worksheetUrl}`,
      ].join('\n'),
    planDescription:
      'Keep online tracing, print practice, and course review in one clean path that can be reused by learners, parents, tutors, and teachers.',
    planHandoffLabel: 'Handoff note:',
    planHandoffNote: (reviewCharacters: string[], next?: string) => {
      if (reviewCharacters.length > 0) {
        return `Start with ${reviewCharacters.join(
          ' '
        )}, then print only after one online review pass.`;
      }
      if (next) {
        return `Start from ${next}, then print the same set for slow handwriting.`;
      }
      return 'The launch pack is complete. Use today for a full slow paper review.';
    },
    planStepCourseLabel: 'Review path',
    planStepPracticeLabel: 'Online practice',
    planStepPrintLabel: 'Paper practice',
    planTitle: "Today's practice plan",
    planLinksLabel: 'Direct handoff links',
    practiceLinkDescription:
      'Review stroke order and missed strokes with the same character set first.',
    practiceLinkLabel: 'Open online practice',
    practiceLinkTitle: 'Online practice link',
    progressLabel: (completed: number, total: number) =>
      `${completed}/${total} launch characters complete`,
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
      'Use this HSK1 launch set for one slow handwriting pass.',
    streakMetric: 'practice streak',
    streakValue: (count: number) => (count > 0 ? `${count} days` : 'not yet'),
    teachersDescription:
      'Plan the online review to paper homework handoff for classes, tutoring, or family practice.',
    teachersTitle: 'Teacher and parent workflow',
    title: 'Lang Study dashboard',
    todayMetric: 'completed today',
    worksheetReviewDescription: (count: number) =>
      `Turn ${count} review characters into a focused paper assignment.`,
    worksheetLinkDescription:
      'Keep the current characters, paper setup, and assignment note.',
    worksheetLinkLabel: 'Open printable worksheet',
    worksheetLinkTitle: 'Printable worksheet link',
    worksheetReviewTitle: 'Print a review sheet',
    worksheetStarterDescription:
      'Generate a clean HSK1 starter sheet for class, family practice, or self-study.',
    worksheetTitle: 'Make a worksheet',
  };
}
