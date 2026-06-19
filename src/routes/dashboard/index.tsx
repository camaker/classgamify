import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getFreeCharacters, type LessonCharacter } from '@/learn/hanzi-course';
import {
  getDisplayStrokeNumber,
  getHanziProgressSummary,
  readStoredHanziProgress,
  type HanziProgressSummary,
  type HanziReviewItem,
  type HanziReviewUrgency,
  type StoredProgress,
} from '@/learn/hanzi-progress';
import { getLocale } from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { getPathWithLocale } from '@/lib/urls';
import { cn } from '@/lib/utils';
import {
  IconArrowRight,
  IconBook2,
  IconClipboardCheck,
  IconClockHour4,
  IconFileText,
  IconHistory,
  IconListDetails,
  IconListCheck,
  IconNotebook,
  IconPencil,
  IconPrinter,
  IconRotate,
  IconSparkles,
  IconTargetArrow,
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

type FocusNewMetaInput = {
  lesson: string;
  strokes: number;
};

type FocusReviewMetaInput = {
  mistakes: number;
  strokes: number;
};

type DashboardCopy = {
  activeDaysMetric: string;
  breadcrumb: string;
  cleanLabel: (count: number) => string;
  copyPlanCta: string;
  copyPlanError: string;
  copyPlanSuccess: string;
  courseDescription: string;
  courseTitle: string;
  description: string;
  focusBadge: string;
  focusCompleteDescription: string;
  focusCompleteTitle: string;
  focusDescription: string;
  focusNewBadge: string;
  focusNewMeta: (input: FocusNewMetaInput) => string;
  focusPracticeAction: string;
  focusReviewAction: string;
  focusReviewBadge: (urgency: HanziReviewUrgency) => string;
  focusReviewDescription: string;
  focusReviewDescriptionWithStrokes: (strokes: string) => string;
  focusReviewMeta: (input: FocusReviewMetaInput) => string;
  focusTitle: string;
  handoffPlanMessage: (input: DashboardPlanMessageInput) => string;
  moreCharacters: (count: number) => string;
  planDescription: string;
  planHandoffLabel: string;
  planHandoffNote: (reviewCharacters: string[], next?: string) => string;
  planLinksLabel: string;
  planPreviewTitle: string;
  planStepCourseLabel: string;
  planStepPracticeLabel: string;
  planStepPrintLabel: string;
  planTitle: string;
  practiceCompleteDescription: string;
  practiceCta: string;
  practiceLinkDescription: string;
  practiceLinkLabel: string;
  practiceLinkTitle: string;
  practiceNextDescription: (character: string) => string;
  practiceReviewDescription: (count: number) => string;
  practiceReviewTitle: string;
  practiceTitle: string;
  pricingDescription: string;
  pricingLabel: string;
  pricingTitle: string;
  printCta: string;
  progressLabel: (completed: number, total: number) => string;
  reviewCta: string;
  reviewLabel: (count: number) => string;
  reviewWorksheetNote: (count: number) => string;
  rhythmBadge: string;
  rhythmDescription: (summary: HanziProgressSummary) => string;
  rhythmTitle: string;
  sessionOnlineLabel: string;
  sessionOnlinePracticeValue: string;
  sessionOnlineReviewValue: (count: number) => string;
  sessionPaperLabel: string;
  sessionPaperPracticeValue: string;
  sessionPaperReviewValue: string;
  sessionReturnLabel: string;
  sessionReturnValue: (summary: HanziProgressSummary) => string;
  sessionRhythmDescription: (summary: HanziProgressSummary) => string;
  sessionRhythmTitle: string;
  starterWorksheetNote: string;
  streakMetric: string;
  streakValue: (count: number) => string;
  teachersDescription: string;
  teachersLabel: string;
  teachersTitle: string;
  title: string;
  todayMetric: string;
  worksheetBridgeActionDescription: string;
  worksheetBridgeActionTitle: string;
  worksheetBridgeBadge: string;
  worksheetBridgeCta: string;
  worksheetBridgeDescription: string;
  worksheetBridgeTitle: string;
  worksheetLinkDescription: string;
  worksheetLinkLabel: string;
  worksheetLinkTitle: string;
  worksheetReviewDescription: (count: number) => string;
  worksheetReviewTitle: string;
  worksheetStarterDescription: string;
  worksheetTitle: string;
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

type DashboardFocusItem = {
  actionLabel: string;
  badge: string;
  character: LessonCharacter;
  description: string;
  href: string;
  meta: string;
  search?: Record<string, unknown>;
  tone: 'new' | 'review';
};

function DashboardPage() {
  const locale = getLocale() === 'zh' ? 'zh' : 'en';
  const copy = getDashboardCopy(locale);
  const characters = useMemo(() => getFreeCharacters(locale), [locale]);
  const [storedProgress, setStoredProgress] = useState<StoredProgress>({});

  useEffect(() => {
    setStoredProgress(readStoredHanziProgress());
  }, [characters]);

  const summary = getHanziProgressSummary(characters, storedProgress);
  const nextCharacter =
    summary.reviewItems[0]?.character ?? summary.nextPracticeTarget?.character;
  const focusItems = buildDashboardFocusItems({
    characters,
    copy,
    locale,
    progress: storedProgress,
    summary,
  });
  const focusCharacters =
    summary.reviewCharacters.length > 0
      ? summary.reviewCharacters
      : focusItems.map((item) => item.character.character);
  const worksheetCharacters =
    focusCharacters.length > 0
      ? focusCharacters
      : characters.slice(0, 12).map((item) => item.character);
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
          characters: worksheetCharacters,
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
      label: copy.pricingLabel,
      title: copy.pricingTitle,
    },
    {
      description: copy.teachersDescription,
      href: Routes.Teachers,
      icon: IconUsers,
      label: copy.teachersLabel,
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
    worksheetCharacters,
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
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row xl:flex-col">
                <Link
                  to={Routes.Learn}
                  search={practiceSearch}
                  className={cn(
                    buttonVariants({ variant: 'default' }),
                    'w-full shrink-0 rounded-lg sm:w-auto'
                  )}
                >
                  <IconPencil className="size-4" />
                  {summary.reviewItems.length > 0
                    ? copy.reviewCta
                    : copy.practiceCta}
                </Link>
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
              icon={IconTargetArrow}
              label={copy.todayMetric}
              value={String(summary.completedTodayCount)}
            />
            <MetricCard
              icon={IconRotate}
              label={copy.streakMetric}
              value={copy.streakValue(summary.currentStreakDays)}
            />
            <MetricCard
              icon={IconHistory}
              label={copy.activeDaysMetric}
              value={String(summary.activeDayCount)}
            />
          </div>
        </section>

        <TodayFocusSection
          copy={copy}
          focusItems={focusItems}
          practiceSearch={practiceSearch}
          summary={summary}
          worksheetSearch={reviewWorksheetSearch}
        />

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
          planPreview={handoffPlan}
          planPreviewTitle={copy.planPreviewTitle}
        />

        <WorksheetBridge
          copy={copy}
          search={reviewWorksheetSearch}
          worksheetCharacters={worksheetCharacters}
          worksheetUrl={worksheetShareUrl}
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

function TodayFocusSection({
  copy,
  focusItems,
  practiceSearch,
  summary,
  worksheetSearch,
}: {
  copy: DashboardCopy;
  focusItems: DashboardFocusItem[];
  practiceSearch?: Record<string, unknown>;
  summary: HanziProgressSummary;
  worksheetSearch: Record<string, unknown>;
}) {
  const isComplete = summary.lessonComplete && summary.reviewItems.length === 0;

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0 rounded-lg border bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <Badge variant="outline" className="rounded-md border-primary/30">
              <IconListDetails className="size-3.5" />
              {copy.focusBadge}
            </Badge>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">
              {isComplete ? copy.focusCompleteTitle : copy.focusTitle}
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              {isComplete
                ? copy.focusCompleteDescription
                : copy.focusDescription}
            </p>
          </div>
          <Link
            to={Routes.Learn}
            search={practiceSearch}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'w-full rounded-lg bg-background sm:w-auto'
            )}
          >
            <IconPencil className="size-4" />
            {summary.reviewItems.length > 0 ? copy.reviewCta : copy.practiceCta}
          </Link>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {focusItems.map((item) => (
            <FocusCharacterCard key={item.character.character} item={item} />
          ))}
        </div>
      </div>

      <aside className="min-w-0 rounded-lg border bg-card p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-primary">
            <IconClockHour4 className="size-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold leading-5">
              {copy.sessionRhythmTitle}
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {copy.sessionRhythmDescription(summary)}
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-2">
          <RhythmRow
            label={copy.sessionOnlineLabel}
            value={
              summary.reviewItems.length > 0
                ? copy.sessionOnlineReviewValue(summary.reviewItems.length)
                : copy.sessionOnlinePracticeValue
            }
          />
          <RhythmRow
            label={copy.sessionPaperLabel}
            value={
              summary.reviewItems.length > 0
                ? copy.sessionPaperReviewValue
                : copy.sessionPaperPracticeValue
            }
          />
          <RhythmRow
            label={copy.sessionReturnLabel}
            value={copy.sessionReturnValue(summary)}
          />
        </div>
        <Link
          to={Routes.Worksheets}
          search={worksheetSearch}
          className={cn(
            buttonVariants({ variant: 'secondary' }),
            'mt-4 w-full rounded-lg'
          )}
        >
          <IconPrinter className="size-4" />
          {copy.printCta}
        </Link>
      </aside>
    </section>
  );
}

function FocusCharacterCard({ item }: { item: DashboardFocusItem }) {
  return (
    <Link
      to={item.href}
      search={item.search}
      className={cn(
        'group min-w-0 rounded-lg border bg-background p-3 transition-colors',
        'hover:border-primary/40 hover:bg-primary/5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        item.tone === 'review' && 'border-amber-500/30 bg-amber-500/5'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-4xl font-semibold leading-none tracking-normal">
          {item.character.character}
        </span>
        <Badge
          variant={item.tone === 'review' ? 'secondary' : 'outline'}
          className="max-w-[7rem] rounded-sm px-1.5 text-[11px]"
        >
          <span className="truncate">{item.badge}</span>
        </Badge>
      </div>
      <div className="mt-3 min-w-0">
        <p className="truncate text-sm font-medium">
          {item.character.pinyin} · {item.character.meaning}
        </p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {item.meta}
        </p>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
          {item.description}
        </p>
      </div>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
        {item.actionLabel}
        <IconArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function RhythmRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-background px-3 py-2">
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm leading-5">{value}</p>
    </div>
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
  planPreview,
  planPreviewTitle,
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
  planPreview: string;
  planPreviewTitle: string;
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

      <div className="mt-3 rounded-lg border bg-muted/30 p-3">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
          <IconClipboardCheck className="size-3.5" />
          {planPreviewTitle}
        </div>
        <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-md bg-background p-3 text-xs leading-5 text-muted-foreground">
          {planPreview}
        </pre>
      </div>

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

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: TablerIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-2xl font-semibold tabular-nums">{value}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {label}
          </p>
        </div>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background text-primary">
          <Icon className="size-4" />
        </span>
      </div>
    </div>
  );
}

function WorksheetBridge({
  copy,
  search,
  worksheetCharacters,
  worksheetUrl,
}: {
  copy: DashboardCopy;
  search: Record<string, unknown>;
  worksheetCharacters: string[];
  worksheetUrl: string;
}) {
  const visibleCharacters = worksheetCharacters.slice(0, 12);
  const overflowCount = Math.max(
    0,
    worksheetCharacters.length - visibleCharacters.length
  );

  return (
    <section className="grid gap-4 rounded-lg border bg-card p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="min-w-0">
        <Badge variant="outline" className="rounded-md border-primary/30">
          <IconNotebook className="size-3.5" />
          {copy.worksheetBridgeBadge}
        </Badge>
        <h2 className="mt-2 text-xl font-semibold tracking-tight">
          {copy.worksheetBridgeTitle}
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
          {copy.worksheetBridgeDescription}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {visibleCharacters.map((character) => (
            <span
              key={character}
              className="inline-flex size-8 items-center justify-center rounded-md border bg-background text-base font-semibold"
            >
              {character}
            </span>
          ))}
          {overflowCount > 0 ? (
            <span className="inline-flex h-8 items-center rounded-md border bg-background px-2 text-xs font-medium text-muted-foreground">
              {copy.moreCharacters(overflowCount)}
            </span>
          ) : null}
        </div>
        <p className="mt-3 break-all rounded-md border bg-muted/30 px-3 py-2 text-xs leading-5 text-muted-foreground">
          {worksheetUrl}
        </p>
      </div>
      <div className="min-w-0 rounded-lg border bg-background p-3">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-card text-primary">
            <IconPrinter className="size-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold leading-5">
              {copy.worksheetBridgeActionTitle}
            </h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {copy.worksheetBridgeActionDescription}
            </p>
          </div>
        </div>
        <Link
          to={Routes.Worksheets}
          search={search}
          className={cn(
            buttonVariants({ variant: 'default' }),
            'mt-4 w-full rounded-lg'
          )}
        >
          <IconPrinter className="size-4" />
          {copy.worksheetBridgeCta}
        </Link>
      </div>
    </section>
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
    label: string;
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
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
        {item.label}
        <IconArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function buildDashboardFocusItems({
  characters,
  copy,
  locale,
  progress,
  summary,
}: {
  characters: LessonCharacter[];
  copy: DashboardCopy;
  locale: 'en' | 'zh';
  progress: StoredProgress;
  summary: HanziProgressSummary;
}): DashboardFocusItem[] {
  if (summary.reviewItems.length > 0) {
    return summary.reviewItems.slice(0, 4).map((item) =>
      buildReviewFocusItem({
        copy,
        item,
        locale,
      })
    );
  }

  const nextIndex = summary.nextPracticeTarget?.index ?? 0;
  const upcomingCharacters = characters
    .slice(nextIndex, nextIndex + 4)
    .filter((character) => !progress[character.character]?.completed);
  const visibleCharacters =
    upcomingCharacters.length > 0 ? upcomingCharacters : characters.slice(0, 4);

  return visibleCharacters.map((character) => ({
    actionLabel: copy.focusPracticeAction,
    badge: copy.focusNewBadge,
    character,
    description: character.hint,
    href: Routes.Learn,
    meta: copy.focusNewMeta({
      lesson: character.lessonLabel,
      strokes: character.strokes,
    }),
    search: { character: character.character },
    tone: 'new',
  }));
}

function buildReviewFocusItem({
  copy,
  item,
  locale,
}: {
  copy: DashboardCopy;
  item: HanziReviewItem;
  locale: 'en' | 'zh';
}): DashboardFocusItem {
  const missedStrokes = item.progress.mistakeStrokes ?? [];
  const missedStrokeText =
    missedStrokes.length > 0
      ? missedStrokes
          .slice(0, 3)
          .map((stroke) => getDisplayStrokeNumber(stroke))
          .join(locale === 'zh' ? '、' : ', ')
      : undefined;

  return {
    actionLabel: copy.focusReviewAction,
    badge: copy.focusReviewBadge(item.urgency),
    character: item.character,
    description:
      missedStrokeText !== undefined
        ? copy.focusReviewDescriptionWithStrokes(missedStrokeText)
        : copy.focusReviewDescription,
    href: Routes.Learn,
    meta: copy.focusReviewMeta({
      mistakes: item.progress.mistakes,
      strokes: item.character.strokes,
    }),
    search: { character: item.character.character },
    tone: 'review',
  };
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

function getDashboardCopy(locale: 'en' | 'zh'): DashboardCopy {
  if (locale === 'zh') {
    return {
      activeDaysMetric: '累计练习天数',
      breadcrumb: '工作台',
      cleanLabel: (count: number) => `${count} 个零错完成`,
      courseDescription: '查看 HSK1 路径、课程分组、进度备份和下一轮复习建议。',
      courseTitle: '打开 HSK1 路径',
      description:
        '继续今天的汉字描写、复习错笔，或者把同一组汉字带到纸面练习。',
      focusBadge: '今日重点',
      focusCompleteDescription:
        '第一阶段已经完成，今天适合做慢速复盘：线上扫一遍，再打印纸面练习。',
      focusCompleteTitle: '今天做一次复盘慢写',
      focusDescription:
        '这里直接列出今天最值得处理的汉字。先在线描写，再把同一组带到纸面。',
      focusNewBadge: '新字',
      focusNewMeta: ({ lesson, strokes }: FocusNewMetaInput) =>
        `${lesson} · ${strokes} 笔`,
      focusPracticeAction: '开始练习',
      focusReviewAction: '复习错笔',
      focusReviewBadge: (urgency: HanziReviewUrgency) =>
        ({
          due: '到期复习',
          fresh: '刚练过',
          overdue: '优先复习',
          unscheduled: '待安排',
        })[urgency],
      focusReviewDescription: '先重新描写一次，确认错笔是否已经稳定。',
      focusReviewDescriptionWithStrokes: (strokes: string) =>
        `重点看第 ${strokes} 笔，在线复习后再打印。`,
      focusReviewMeta: ({ mistakes, strokes }: FocusReviewMetaInput) =>
        `${mistakes} 次错误 · 共 ${strokes} 笔`,
      focusTitle: '今天优先练这几个字',
      practiceCompleteDescription:
        '50 字第一阶段内容包已经完成。回到线上快速复习，再用练习纸做一轮慢写。',
      practiceCta: '继续练习',
      practiceNextDescription: (character: string) =>
        `从下一个汉字 ${character} 开始，保持短练习节奏。`,
      practiceReviewDescription: (count: number) =>
        `先处理 ${count} 个有错笔记录的汉字，再加入新字。`,
      practiceReviewTitle: '复习错笔',
      practiceTitle: '继续线上描写',
      pricingDescription:
        '查看免费、Pro 和早期终身版的权益边界，决定是否需要保存字表、自定义练习纸和可复用作业流程。',
      pricingLabel: '查看权益边界',
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
      planPreviewTitle: '复制内容预览',
      practiceLinkDescription: '先用同一汉字组复习笔顺和错笔记录。',
      practiceLinkLabel: '打开线上练习',
      practiceLinkTitle: '线上练习链接',
      progressLabel: (completed: number, total: number) =>
        `${completed}/${total} 个第一阶段汉字已完成`,
      reviewLabel: (count: number) =>
        count > 0 ? `${count} 个待复习` : '暂无错笔队列',
      reviewCta: '先复习错笔',
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
      sessionOnlineLabel: '线上',
      sessionOnlinePracticeValue: '看笔顺并完成一次跟随描写。',
      sessionOnlineReviewValue: (count: number) => `先清理 ${count} 个错笔字。`,
      sessionPaperLabel: '纸面',
      sessionPaperPracticeValue: '把今天的字组打印成慢写练习。',
      sessionPaperReviewValue: '只打印错笔字，避免纸面练习太散。',
      sessionReturnLabel: '下次',
      sessionReturnValue: (summary: HanziProgressSummary) => {
        if (summary.reviewItems.length > 0) {
          return '从错笔最多的字重新开始。';
        }
        if (summary.nextPracticeTarget) {
          return `继续 ${summary.nextPracticeTarget.character.character} 后面的字。`;
        }
        return '做整组复盘，保持手感。';
      },
      sessionRhythmDescription: (summary: HanziProgressSummary) => {
        if (summary.reviewItems.length > 0) {
          return '错笔队列越早处理，后面的新字越不容易混在一起。';
        }
        return summary.completedCount > 0
          ? '保持短练习，不需要一次练太多。'
          : '第一次使用时，先完成一个字就足够建立节奏。';
      },
      sessionRhythmTitle: '建议节奏',
      starterWorksheetNote: '用这组 HSK1 第一阶段汉字完成一轮纸笔慢写。',
      streakMetric: '连续节奏',
      streakValue: (count: number) => (count > 0 ? `${count} 天` : '未开始'),
      teachersDescription:
        '为课堂、辅导老师或家庭陪练整理线上复习到纸面作业的流程。',
      teachersLabel: '查看交接流程',
      teachersTitle: '老师与家长工作流',
      title: 'Lang Study 工作台',
      todayMetric: '今日完成',
      worksheetReviewDescription: (count: number) =>
        `把 ${count} 个待复习汉字生成一张更聚焦的打印作业。`,
      worksheetBridgeActionDescription:
        '打开后可以调整纸张、描摹模式、格子数量和作业说明。',
      worksheetBridgeActionTitle: '生成可打印版本',
      worksheetBridgeBadge: '纸面练习',
      worksheetBridgeCta: '打开练习纸',
      worksheetBridgeDescription:
        '纸面练习只承接今天这一组字。这样打印出来的任务更清楚，也更适合交给家长或学生。',
      worksheetBridgeTitle: '把今天的字带到纸上',
      worksheetLinkDescription: '沿用当前字组、纸张设置和作业说明。',
      worksheetLinkLabel: '打开打印练习纸',
      worksheetLinkTitle: '打印练习纸链接',
      worksheetReviewTitle: '打印复习纸',
      worksheetStarterDescription:
        '把免费 HSK1 入门字生成干净练习纸，适合课堂、家庭或自学。',
      worksheetTitle: '制作练习纸',
      moreCharacters: (count: number) => `+${count} 字`,
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
    focusBadge: "Today's focus",
    focusCompleteDescription:
      'The first-stage set is complete. Use today for a slow review: scan online, then print a paper pass.',
    focusCompleteTitle: 'Do one slow review pass today',
    focusDescription:
      'These are the characters worth handling now. Trace online first, then carry the same set onto paper.',
    focusNewBadge: 'New',
    focusNewMeta: ({ lesson, strokes }: FocusNewMetaInput) =>
      `${lesson} · ${strokes} strokes`,
    focusPracticeAction: 'Start practice',
    focusReviewAction: 'Review strokes',
    focusReviewBadge: (urgency: HanziReviewUrgency) =>
      ({
        due: 'Due review',
        fresh: 'Fresh',
        overdue: 'Priority',
        unscheduled: 'Queued',
      })[urgency],
    focusReviewDescription:
      'Trace it once again and check whether the missed stroke is stable.',
    focusReviewDescriptionWithStrokes: (strokes: string) =>
      `Watch stroke ${strokes} first, then print after online review.`,
    focusReviewMeta: ({ mistakes, strokes }: FocusReviewMetaInput) =>
      `${mistakes} mistakes · ${strokes} strokes`,
    focusTitle: 'Practice these characters first',
    practiceCompleteDescription:
      'The 50-character launch pack is complete. Revisit online review, then print a slow paper pass.',
    practiceCta: 'Continue practice',
    practiceNextDescription: (character: string) =>
      `Start from the next character, ${character}, and keep the session short.`,
    practiceReviewDescription: (count: number) =>
      `Clear ${count} characters with missed strokes before adding new ones.`,
    practiceReviewTitle: 'Review missed strokes',
    practiceTitle: 'Continue online tracing',
    pricingDescription:
      'Compare Free, Pro, and Early Lifetime boundaries before adding saved lists, custom worksheets, and repeatable assignment workflows.',
    pricingLabel: 'Review plan limits',
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
    planPreviewTitle: 'Copy preview',
    practiceLinkDescription:
      'Review stroke order and missed strokes with the same character set first.',
    practiceLinkLabel: 'Open online practice',
    practiceLinkTitle: 'Online practice link',
    progressLabel: (completed: number, total: number) =>
      `${completed}/${total} launch characters complete`,
    reviewLabel: (count: number) =>
      count > 0 ? `${count} to review` : 'no review queue yet',
    reviewCta: 'Review missed strokes',
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
    sessionOnlineLabel: 'Online',
    sessionOnlinePracticeValue: 'Watch stroke order and finish one guided run.',
    sessionOnlineReviewValue: (count: number) =>
      `Clear ${count} review characters first.`,
    sessionPaperLabel: 'Paper',
    sessionPaperPracticeValue:
      'Print today’s set for slower handwriting practice.',
    sessionPaperReviewValue:
      'Print only the missed characters so paper practice stays focused.',
    sessionReturnLabel: 'Next time',
    sessionReturnValue: (summary: HanziProgressSummary) => {
      if (summary.reviewItems.length > 0) {
        return 'Restart from the character with the most mistakes.';
      }
      if (summary.nextPracticeTarget) {
        return `Continue after ${summary.nextPracticeTarget.character.character}.`;
      }
      return 'Review the full set to keep handwriting steady.';
    },
    sessionRhythmDescription: (summary: HanziProgressSummary) => {
      if (summary.reviewItems.length > 0) {
        return 'Clearing missed strokes early keeps new characters from blending together.';
      }
      return summary.completedCount > 0
        ? 'Keep the session short; one clear next step is enough.'
        : 'For the first visit, one completed character is enough to build rhythm.';
    },
    sessionRhythmTitle: 'Suggested rhythm',
    starterWorksheetNote:
      'Use this HSK1 launch set for one slow handwriting pass.',
    streakMetric: 'practice streak',
    streakValue: (count: number) => (count > 0 ? `${count} days` : 'not yet'),
    teachersDescription:
      'Plan the online review to paper homework handoff for classes, tutoring, or family practice.',
    teachersLabel: 'Open handoff workflow',
    teachersTitle: 'Teacher and parent workflow',
    title: 'Lang Study dashboard',
    todayMetric: 'completed today',
    worksheetReviewDescription: (count: number) =>
      `Turn ${count} review characters into a focused paper assignment.`,
    worksheetBridgeActionDescription:
      'Adjust paper size, trace mode, practice boxes, and the assignment note before printing.',
    worksheetBridgeActionTitle: 'Create the printable version',
    worksheetBridgeBadge: 'Paper practice',
    worksheetBridgeCta: 'Open worksheet',
    worksheetBridgeDescription:
      'Paper practice should carry only today’s character set. The printed task stays clear for learners, parents, and teachers.',
    worksheetBridgeTitle: 'Move today’s set onto paper',
    worksheetLinkDescription:
      'Keep the current characters, paper setup, and assignment note.',
    worksheetLinkLabel: 'Open printable worksheet',
    worksheetLinkTitle: 'Printable worksheet link',
    worksheetReviewTitle: 'Print a review sheet',
    worksheetStarterDescription:
      'Generate a clean HSK1 starter sheet for class, family practice, or self-study.',
    worksheetTitle: 'Make a worksheet',
    moreCharacters: (count: number) => `+${count} more`,
  };
}
