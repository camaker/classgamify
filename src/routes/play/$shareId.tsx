import { getStarterActivity, getStarterAssignment } from '@/activities/catalog';
import { getActivityTemplateRunnerCopy } from '@/activities/runner-copy';
import {
  getActivityTemplateRunnerKind,
  getRuntimeItems,
} from '@/activities/runtime';
import type { ActivityTemplateType } from '@/activities/types';
import type {
  PublicAssignmentRuleSummaryId,
  PublicAssignmentRuleSummaryItem,
} from '@/assignments/delivery-summary';
import type { AssignmentAttemptUsage } from '@/assignments/attempt-limits';
import { buildAttemptTimerState } from '@/assignments/attempt-duration';
import { buildAssignmentSharePath } from '@/assignments/share-link';
import {
  getAnonymousBrowserLabel,
  getOrCreateAnonymousAttemptToken,
} from '@/assignments/identity';
import type {
  PublicAttemptReviewItem,
  PublicRuntimeItem,
} from '@/assignments/public';
import {
  buildAttemptCompletionCopy,
  buildAnonymousAttemptCopy,
  buildStudentAttemptControlState,
  buildStudentAttemptResultDisplay,
  buildStudentAttemptSubmissionInput,
  buildStudentAttemptSubmitGate,
  buildStudentAttemptTimerBadge,
  buildStudentRunnerMissingView,
  canStartAnotherStudentAttempt,
  formatStudentAttemptUsageLabel,
  getStudentRunnerCopy,
  resolveStudentAttemptAnonymousToken,
} from '@/assignments/student-submission';
import {
  buildStudentRunnerAttemptState,
  buildStudentRunnerPageState,
} from '@/assignments/student-runner-state';
import { normalizeAssignmentShareSlug } from '@/assignments/share-slug';
import {
  buildStudentRunnerHeaderView,
  buildStudentRunnerView,
  isSameRuntimeChoice,
} from '@/assignments/student-runner-view';
import { ActivityPreview } from '@/components/activities/activity-preview';
import { FillBlankWorksheet } from '@/components/activities/fill-blank-worksheet';
import { GroupSortBoard } from '@/components/activities/group-sort-board';
import { ListeningRunner } from '@/components/activities/listening-runner';
import { LineMatchBoard } from '@/components/activities/line-match-board';
import { MatchingPairsBoard } from '@/components/activities/matching-pairs-board';
import { OpenBoxRunner } from '@/components/activities/open-box-runner';
import { PublicAnswerFeedback } from '@/components/activities/public-answer-feedback';
import Container from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { websiteConfig } from '@/config/website';
import { usePublicAssignment, useSubmitAttempt } from '@/hooks/use-assignments';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';
import { cn } from '@/lib/utils';
import {
  IconCheck,
  IconClock,
  IconClipboardText,
  IconDeviceGamepad2,
  IconEye,
  IconListCheck,
  IconPlayerPlay,
  IconRepeat,
  IconUser,
  IconX,
} from '@tabler/icons-react';
import { Link, createFileRoute } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/play/$shareId')({
  head: ({ params }) => {
    const runnerCopy = getStudentRunnerCopy();

    return seo(buildAssignmentSharePath(params.shareId), {
      title: `${runnerCopy.seoTitlePrefix} | ${websiteConfig.metadata?.name}`,
      description: runnerCopy.seoDescription,
      robots: 'noindex,follow',
    });
  },
  component: PlayPage,
});

function PlayPage() {
  const { shareId } = Route.useParams();
  const normalizedShareId = normalizeAssignmentShareSlug(shareId);
  const { data, isLoading } = usePublicAssignment(normalizedShareId);
  const submitAttemptMutation = useSubmitAttempt();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [studentName, setStudentName] = useState('');
  const [attemptClock, setAttemptClock] = useState<{
    shareId: string;
    startedAt: number;
  }>();
  const [result, setResult] = useState<AttemptSubmissionResult>();
  const [submittedAttemptCount, setSubmittedAttemptCount] = useState(0);
  const [confirmIncompleteSubmit, setConfirmIncompleteSubmit] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [anonymousToken, setAnonymousToken] = useState<string>();
  const [attemptSessionKey, setAttemptSessionKey] = useState<string>();
  const starterAssignment = getStarterAssignment(normalizedShareId);
  const starterActivity = getStarterActivity(starterAssignment.activityId);
  const starterRuntimeItems = useMemo(
    () =>
      getRuntimeItems(starterActivity.templateType, starterActivity.content),
    [starterActivity]
  );
  const pageState = useMemo(
    () =>
      buildStudentRunnerPageState({
        data,
        isLoading,
        shareId: normalizedShareId,
        starterActivity,
        starterAssignment,
        starterRuntimeItems,
      }),
    [
      data,
      isLoading,
      normalizedShareId,
      starterActivity,
      starterAssignment,
      starterRuntimeItems,
    ]
  );
  const assignment =
    pageState.status === 'ready' ? pageState.assignment : undefined;
  const activity =
    pageState.status === 'ready' ? pageState.activity : undefined;
  const attemptState = useMemo(
    () =>
      buildStudentRunnerAttemptState({
        answers,
        pageState,
        shareId: normalizedShareId,
      }),
    [answers, pageState, normalizedShareId]
  );
  const runtimeItems = attemptState.runtimeItems;
  const completionSummary = attemptState.completionSummary;
  const itemCount = attemptState.itemCount;
  const canSubmit = attemptState.canSubmit;
  const activeShareId = attemptState.activeShareId;
  const startedAt =
    attemptClock?.shareId === activeShareId ? attemptClock.startedAt : now;
  const timeLimitSeconds = assignment?.settings.timeLimitSeconds;
  const attemptTimer = buildAttemptTimerState({
    now,
    startedAt,
    timeLimitSeconds,
  });
  const anonymousBrowserLabel = assignment?.settings.collectStudentName
    ? undefined
    : getAnonymousBrowserLabel(anonymousToken);
  const anonymousAttemptCopy = buildAnonymousAttemptCopy({
    browserLabel: anonymousBrowserLabel,
  });
  const activityRunnerCopy = activity
    ? getActivityTemplateRunnerCopy(activity.templateType)
    : undefined;
  const runnerCopy = getStudentRunnerCopy();
  const completionCopy = buildAttemptCompletionCopy({
    completionSummary,
    confirmIncompleteSubmit,
    progressVerb: activityRunnerCopy?.progressVerb,
  });
  const attemptResultDisplay = result
    ? buildStudentAttemptResultDisplay({
        accuracy: result.accuracy,
        durationSeconds: result.durationSeconds,
        earnedPoints: result.earnedPoints,
        fallbackDurationSeconds: attemptTimer.elapsedSeconds,
        totalPoints: result.totalPoints,
      })
    : undefined;
  const attemptControlState = buildStudentAttemptControlState({
    canSubmit,
    hasResult: Boolean(result),
    isSubmitting: submitAttemptMutation.isPending,
    timeExpired: attemptTimer.timeExpired,
    unansweredLabel: completionCopy.unansweredLabel,
  });
  const attemptTimerBadge = buildStudentAttemptTimerBadge({
    remainingSeconds: attemptTimer.remainingSeconds,
    timeExpired: attemptTimer.timeExpired,
    timeLimitSeconds,
  });
  const showStartAnotherAttempt = canStartAnotherStudentAttempt({
    canSubmit,
    hasResult: Boolean(result),
    maxAttempts:
      result?.attemptUsage.maxAttempts ?? assignment?.settings.maxAttempts,
    submittedAttemptCount:
      result?.attemptUsage.usedAttempts ?? submittedAttemptCount,
  });
  const attemptUsageLabel = result
    ? formatStudentAttemptUsageLabel(result.attemptUsage)
    : undefined;
  const currentAttemptSessionKey = attemptState.currentAttemptSessionKey;

  useEffect(() => {
    if (result || !timeLimitSeconds) return;

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [result, timeLimitSeconds]);

  useEffect(() => {
    if (!currentAttemptSessionKey) return;
    if (attemptSessionKey === currentAttemptSessionKey) return;

    setAnswers({});
    setResult(undefined);
    setConfirmIncompleteSubmit(false);
    setStudentName('');
    setAttemptClock(undefined);
    setSubmittedAttemptCount(0);
    setAnonymousToken(undefined);
    setAttemptSessionKey(currentAttemptSessionKey);
  }, [attemptSessionKey, currentAttemptSessionKey]);

  useEffect(() => {
    if (!assignment || itemCount === 0 || result) return;
    if (attemptClock?.shareId === activeShareId) return;

    const nextStartedAt = Date.now();
    setAttemptClock({
      shareId: activeShareId,
      startedAt: nextStartedAt,
    });
    setNow(nextStartedAt);
  }, [activeShareId, assignment, attemptClock?.shareId, itemCount, result]);

  useEffect(() => {
    if (!assignment || assignment.settings.collectStudentName) return;
    setAnonymousToken(
      getOrCreateAnonymousAttemptToken({
        shareId: activeShareId,
        storage: window.localStorage,
      })
    );
  }, [activeShareId, assignment]);

  async function submitAnswers() {
    const submitGate = buildStudentAttemptSubmitGate({
      canSubmit: Boolean(activity) && canSubmit,
      collectStudentName: Boolean(assignment?.settings.collectStudentName),
      completionSummary,
      confirmIncompleteSubmit,
      studentName,
    });

    if (submitGate.type === 'blocked') {
      toast.error(submitGate.message);
      return;
    }

    if (submitGate.type === 'confirm-incomplete') {
      setConfirmIncompleteSubmit(true);
      toast.error(submitGate.message);
      return;
    }

    try {
      const nextAnonymousToken = resolveStudentAttemptAnonymousToken({
        collectStudentName: Boolean(assignment?.settings.collectStudentName),
        currentAnonymousToken: anonymousToken,
        createAnonymousToken: () =>
          getOrCreateAnonymousAttemptToken({
            shareId: activeShareId,
            storage: window.localStorage,
          }),
      });
      const response = await submitAttemptMutation.mutateAsync(
        buildStudentAttemptSubmissionInput({
          answers,
          collectStudentName: Boolean(assignment?.settings.collectStudentName),
          durationSeconds: buildAttemptTimerState({
            now: Date.now(),
            startedAt,
            timeLimitSeconds,
          }).durationSeconds,
          runtimeItems,
          shareSlug: activeShareId,
          anonymousToken: nextAnonymousToken,
          studentName,
        })
      );
      setResult({
        ...response.result,
        attemptUsage: response.attemptUsage,
        reviewItems: response.reviewItems,
      });
      setSubmittedAttemptCount(response.attemptUsage.usedAttempts);
      toast.success(runnerCopy.submissionSuccessMessage);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : runnerCopy.submissionFailureMessage
      );
    }
  }

  function startAnotherAttempt() {
    const nextStartedAt = Date.now();
    setAnswers({});
    setResult(undefined);
    setConfirmIncompleteSubmit(false);
    setAttemptClock(undefined);
    setNow(nextStartedAt);
  }

  if (pageState.status === 'loading') {
    return (
      <Container className="px-4 py-10 md:py-14">
        <div className="mx-auto max-w-6xl rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            {runnerCopy.loadingMessage}
          </p>
        </div>
      </Container>
    );
  }

  if (pageState.status === 'missing') {
    const missingView = buildStudentRunnerMissingView(pageState.reason);

    return (
      <Container className="px-4 py-10 md:py-14">
        <div className="mx-auto max-w-3xl rounded-lg border bg-card p-6">
          <Badge variant="outline" className="rounded-md border-primary/30">
            <IconDeviceGamepad2 className="size-3.5" />
            {runnerCopy.publicRouteBadgeLabel}
          </Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">
            {missingView.title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {missingView.description}
          </p>
          <Link
            to={Routes.Templates}
            className={cn(buttonVariants(), 'mt-5 w-fit')}
          >
            {runnerCopy.browseTemplatesLabel}
          </Link>
        </div>
      </Container>
    );
  }

  const headerView = buildStudentRunnerHeaderView({
    assignment: pageState.assignment,
    itemCount,
  });
  const runnerUiCopy =
    activityRunnerCopy ?? getActivityTemplateRunnerCopy(activity.templateType);

  return (
    <Container className="px-4 py-10 md:py-14">
      <div className="mx-auto max-w-6xl space-y-8 pb-16">
        <section className="grid gap-4 rounded-lg border bg-card p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="min-w-0 space-y-3">
            <Badge variant="outline" className="rounded-md border-primary/30">
              <IconDeviceGamepad2 className="size-3.5" />
              {runnerCopy.publicRouteBadgeLabel}
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight">
              {headerView.title}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {headerView.description}
            </p>
            {headerView.instructions ? (
              <div className="max-w-2xl rounded-lg border bg-background p-3 text-sm leading-6">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <IconClipboardText className="size-4 text-primary" />
                  {headerView.instructions.label}
                </div>
                <p className="mt-2 text-muted-foreground">
                  {headerView.instructions.value}
                </p>
              </div>
            ) : null}
            <PublicAssignmentRules rules={headerView.ruleItems} />
          </div>
          <Link
            to={Routes.Create}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'w-fit bg-background'
            )}
          >
            {headerView.teacherActionLabel}
          </Link>
        </section>

        <div className="rounded-lg border bg-muted/20 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <IconPlayerPlay className="size-4 text-primary" />
              {runnerUiCopy.title}
            </div>
            <Badge variant="secondary" className="rounded-md">
              {completionCopy.progressLabel}
            </Badge>
            {attemptTimerBadge.show ? (
              <Badge variant="outline" className="rounded-md">
                {attemptTimerBadge.label}
              </Badge>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3 rounded-lg border bg-card p-3 md:grid-cols-[minmax(0,1fr)_14rem] md:items-end">
            {assignment.settings.collectStudentName ? (
              <div>
                <label
                  htmlFor="student-name"
                  className="text-sm font-medium text-foreground"
                >
                  {runnerCopy.studentNameLabel}
                </label>
                <Input
                  id="student-name"
                  value={studentName}
                  onChange={(event) => setStudentName(event.target.value)}
                  placeholder={runnerCopy.studentNamePlaceholder}
                  className="mt-2"
                />
              </div>
            ) : (
              <div className="rounded-lg border bg-muted/20 p-3">
                <p className="text-sm font-medium">
                  {anonymousAttemptCopy.title}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {anonymousAttemptCopy.description}
                </p>
              </div>
            )}
            {result ? (
              <div className="rounded-lg border bg-primary/5 p-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <IconCheck className="size-4 text-primary" />
                  {runnerCopy.resultSubmittedLabel}
                </div>
                <p className="mt-2 text-2xl font-semibold">
                  {attemptResultDisplay?.scoreLabel}
                </p>
                <p className="text-xs text-muted-foreground">
                  {attemptResultDisplay?.accuracyLabel}
                </p>
                <p className="text-xs text-muted-foreground">
                  {attemptResultDisplay?.durationLabel}
                </p>
                {attemptUsageLabel ? (
                  <p className="text-xs text-muted-foreground">
                    {attemptUsageLabel}
                  </p>
                ) : null}
                {showStartAnotherAttempt ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mt-3 w-full justify-start bg-background"
                    onClick={startAnotherAttempt}
                  >
                    <IconRepeat className="size-4" />
                    {runnerCopy.startAnotherAttemptLabel}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>

          {attemptControlState.showTimeExpiredMessage ? (
            <div className="mt-4 rounded-lg border bg-background p-3 text-sm text-muted-foreground">
              {runnerCopy.timeExpiredMessage}
            </div>
          ) : null}

          <RuntimeItemList
            answers={answers}
            disabled={attemptControlState.runtimeItemsDisabled}
            items={runtimeItems}
            revealAnswer={Boolean(
              result && assignment.settings.showCorrectAnswers
            )}
            reviewItems={result?.reviewItems}
            language={activity.content.language}
            templateType={activity.templateType}
            onAnswerChange={(itemId, answer) => {
              setConfirmIncompleteSubmit(false);
              setAnswers((current) => ({
                ...current,
                [itemId]: answer,
              }));
            }}
          />

          <Button
            type="button"
            className="mt-4 w-full sm:w-fit"
            disabled={attemptControlState.submitDisabled}
            onClick={submitAnswers}
          >
            <IconCheck className="size-4" />
            {completionCopy.submitButtonLabel}
          </Button>
          {attemptControlState.unansweredLabel ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {attemptControlState.unansweredLabel}
            </p>
          ) : null}
          {attemptControlState.readOnlyMessage ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {attemptControlState.readOnlyMessage}
            </p>
          ) : null}
        </div>

        <ActivityPreview
          activity={activity}
          assignment={assignment}
          compact
          hideAnswers={pageState.hidePreviewAnswers}
        />
      </div>
    </Container>
  );
}

function PublicAssignmentRules({
  rules,
}: {
  rules: PublicAssignmentRuleSummaryItem[];
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {rules.map((rule) => (
        <div
          key={rule.label}
          className="flex min-w-0 items-center gap-2 rounded-lg border bg-background px-3 py-2"
        >
          <PublicAssignmentRuleIcon id={rule.id} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{rule.value}</p>
            <p className="text-xs text-muted-foreground">{rule.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PublicAssignmentRuleIcon({
  id,
}: {
  id: PublicAssignmentRuleSummaryId;
}) {
  const Icon = getPublicAssignmentRuleIcon(id);
  return <Icon className="size-4 shrink-0 text-primary" />;
}

function getPublicAssignmentRuleIcon(id: PublicAssignmentRuleSummaryId) {
  if (id === 'items') return IconListCheck;
  if (id === 'attempts') return IconRepeat;
  if (id === 'identity') return IconUser;
  if (id === 'answerReveal') return IconEye;
  return IconClock;
}

function RuntimeItemList({
  answers,
  disabled,
  items,
  language,
  onAnswerChange,
  revealAnswer,
  reviewItems,
  templateType,
}: {
  answers: Record<string, string>;
  disabled: boolean;
  items: PublicRuntimeItem[];
  language?: string;
  onAnswerChange: (itemId: string, answer: string) => void;
  revealAnswer: boolean;
  reviewItems?: PublicAttemptReviewItem[];
  templateType: ActivityTemplateType;
}) {
  const runnerKind = getActivityTemplateRunnerKind(templateType);
  const runnerCopy = getActivityTemplateRunnerCopy(templateType);
  const runnerView = buildStudentRunnerView({
    answers,
    items,
    reviewItems,
  });

  if (runnerKind === 'line-match') {
    return (
      <div className="mt-4">
        <LineMatchBoard
          answers={answers}
          disabled={disabled}
          items={items}
          revealAnswer={revealAnswer}
          reviewItems={reviewItems}
          onAnswerChange={onAnswerChange}
        />
      </div>
    );
  }

  if (runnerKind === 'matching-pairs') {
    return (
      <div className="mt-4">
        <MatchingPairsBoard
          answers={answers}
          disabled={disabled}
          items={items}
          revealAnswer={revealAnswer}
          reviewItems={reviewItems}
          onAnswerChange={onAnswerChange}
        />
      </div>
    );
  }

  if (runnerKind === 'group-sort') {
    return (
      <div className="mt-4">
        <GroupSortBoard
          answers={answers}
          disabled={disabled}
          items={items}
          revealAnswer={revealAnswer}
          reviewItems={reviewItems}
          onAnswerChange={onAnswerChange}
        />
      </div>
    );
  }

  if (runnerKind === 'fill-blank') {
    return (
      <div className="mt-4">
        <FillBlankWorksheet
          answers={answers}
          disabled={disabled}
          items={items}
          revealAnswer={revealAnswer}
          reviewItems={reviewItems}
          onAnswerChange={onAnswerChange}
        />
      </div>
    );
  }

  if (runnerKind === 'open-box') {
    return (
      <div className="mt-4">
        <OpenBoxRunner
          answers={answers}
          disabled={disabled}
          items={items}
          revealAnswer={revealAnswer}
          reviewItems={reviewItems}
          onAnswerChange={onAnswerChange}
        />
      </div>
    );
  }

  if (runnerKind === 'listening') {
    return (
      <div className="mt-4">
        <ListeningRunner
          answers={answers}
          disabled={disabled}
          items={items}
          language={language}
          revealAnswer={revealAnswer}
          reviewItems={reviewItems}
          onAnswerChange={onAnswerChange}
        />
      </div>
    );
  }

  return (
    <div className="mt-4 grid gap-3">
      {runnerView.itemViews.map((itemView) => (
        <RuntimeItemCard
          key={itemView.item.id}
          answer={itemView.answer}
          disabled={disabled}
          item={itemView.item}
          kindLabel={itemView.kindLabel}
          positionLabel={itemView.positionLabel}
          reviewItem={itemView.reviewItem}
          runnerCopy={runnerCopy}
          revealAnswer={revealAnswer}
          onAnswerChange={(answer) => onAnswerChange(itemView.item.id, answer)}
        />
      ))}
    </div>
  );
}

function RuntimeItemCard({
  answer,
  disabled,
  item,
  kindLabel,
  onAnswerChange,
  positionLabel,
  revealAnswer,
  reviewItem,
  runnerCopy,
}: {
  answer: string;
  disabled: boolean;
  item: PublicRuntimeItem;
  kindLabel: string;
  onAnswerChange: (answer: string) => void;
  positionLabel: string;
  revealAnswer: boolean;
  reviewItem?: PublicAttemptReviewItem;
  runnerCopy: ReturnType<typeof getActivityTemplateRunnerCopy>;
}) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-sm font-medium">{positionLabel}</p>
        <Badge variant="outline" className="rounded-md">
          {kindLabel}
        </Badge>
      </div>
      {item.choices?.length ? (
        <ChoiceGrid
          answer={answer}
          choices={item.choices}
          disabled={disabled}
          onAnswerChange={onAnswerChange}
        />
      ) : (
        <Input
          value={answer}
          disabled={disabled}
          onChange={(event) => onAnswerChange(event.target.value)}
          placeholder={runnerCopy.inputPlaceholder}
          className="mt-3"
        />
      )}
      {revealAnswer && reviewItem ? (
        <PublicAnswerFeedback
          correctLabel={runnerCopy.correctAnswerLabel}
          reviewItem={reviewItem}
        />
      ) : null}
    </div>
  );
}

function ChoiceGrid({
  answer,
  choices,
  disabled,
  onAnswerChange,
}: {
  answer: string;
  choices: string[];
  disabled: boolean;
  onAnswerChange: (answer: string) => void;
}) {
  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {choices.map((choice) => {
        const selected = isSameRuntimeChoice(answer, choice);
        return (
          <button
            key={choice}
            type="button"
            disabled={disabled}
            className={cn(
              'min-h-10 rounded-lg border bg-background px-3 py-2 text-left text-sm transition-colors',
              'hover:border-primary/50 hover:bg-primary/5 disabled:cursor-default disabled:opacity-100',
              selected && 'border-primary bg-primary/10 text-primary'
            )}
            onClick={() => onAnswerChange(choice)}
          >
            {choice}
          </button>
        );
      })}
    </div>
  );
}

type AttemptSubmissionResult = {
  accuracy: number;
  attemptUsage: AssignmentAttemptUsage;
  durationSeconds?: number;
  earnedPoints: number;
  reviewItems: PublicAttemptReviewItem[];
  totalPoints: number;
};
