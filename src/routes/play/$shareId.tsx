import { getStarterActivity, getStarterAssignment } from '@/activities/catalog';
import { getRuntimeItems } from '@/activities/runtime';
import type { AssignmentAttemptUsage } from '@/assignments/attempt-limits';
import { ASSIGNMENT_ATTEMPT_DURATION_UNITS } from '@/assignments/attempt-duration';
import { buildAssignmentSharePath } from '@/assignments/share-link';
import { getOrCreateAnonymousAttemptToken } from '@/assignments/identity';
import type { PublicAttemptReviewItem } from '@/assignments/public';
import {
  buildStudentAnswerChange,
  buildStudentAttemptSubmissionInput,
  buildStudentAttemptSubmitGate,
  resolveStudentAttemptSubmissionFailureMessage,
  resolveStudentAttemptAnonymousToken,
  resolveStudentAttemptSubmissionDurationSeconds,
} from '@/assignments/student-submission';
import {
  buildStudentRunnerAttemptClock,
  buildStudentRunnerAttemptResetState,
  buildStudentRunnerPageState,
  buildStudentRunnerPageViewModel,
  buildStudentRunnerSeoView,
  shouldStartStudentRunnerAttemptClock,
  shouldResetStudentRunnerAttemptSession,
  type StudentRunnerAttemptClock,
} from '@/assignments/student-runner-state';
import { normalizeAssignmentShareSlug } from '@/assignments/share-slug';
import { ActivityPreview } from '@/components/activities/activity-preview';
import { StudentRuntimeItemList } from '@/components/activities/student-runtime-item-list';
import { PublicAssignmentRules } from '@/components/assignments/public-assignment-rules';
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
  IconClipboardText,
  IconDeviceGamepad2,
  IconPlayerPlay,
  IconRepeat,
} from '@tabler/icons-react';
import { Link, createFileRoute } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/play/$shareId')({
  head: ({ params }) => {
    const seoView = buildStudentRunnerSeoView();

    return seo(buildAssignmentSharePath(params.shareId), {
      title: `${seoView.titlePrefix} | ${websiteConfig.metadata?.name}`,
      description: seoView.description,
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
  const [attemptClock, setAttemptClock] = useState<StudentRunnerAttemptClock>();
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
  const runnerPageView = useMemo(
    () =>
      buildStudentRunnerPageViewModel({
        anonymousToken,
        answers,
        attemptClock,
        confirmIncompleteSubmit,
        fallbackStartedAt: now,
        isSubmitting: submitAttemptMutation.isPending,
        pageState,
        result,
        shareId: normalizedShareId,
        submittedAttemptCount,
      }),
    [
      anonymousToken,
      answers,
      attemptClock,
      confirmIncompleteSubmit,
      now,
      pageState,
      result,
      submitAttemptMutation.isPending,
      normalizedShareId,
      submittedAttemptCount,
    ]
  );
  const { activity, assignment } = runnerPageView;
  const runtimeItems = runnerPageView.runtimeItems;
  const completionSummary = runnerPageView.attemptState.completionSummary;
  const itemCount = runnerPageView.itemCount;
  const activeShareId = runnerPageView.activeShareId;
  const startedAt = runnerPageView.startedAt;
  const timeLimitSeconds = runnerPageView.timeLimitSeconds;
  const controlView = runnerPageView.controlView;
  const identityView = runnerPageView.identityView;
  const resultPanelView = runnerPageView.resultPanelView;
  const currentAttemptSessionKey = runnerPageView.currentAttemptSessionKey;

  useEffect(() => {
    if (result || !timeLimitSeconds) return;

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, ASSIGNMENT_ATTEMPT_DURATION_UNITS.millisecondsPerSecond);

    return () => window.clearInterval(timer);
  }, [result, timeLimitSeconds]);

  useEffect(() => {
    if (
      !shouldResetStudentRunnerAttemptSession({
        attemptSessionKey,
        currentAttemptSessionKey,
      })
    ) {
      return;
    }

    const nextResetState = buildStudentRunnerAttemptResetState();
    setAnswers(nextResetState.answers);
    setResult(undefined);
    setConfirmIncompleteSubmit(nextResetState.confirmIncompleteSubmit);
    setStudentName(nextResetState.studentName);
    setAttemptClock(nextResetState.attemptClock);
    setSubmittedAttemptCount(nextResetState.submittedAttemptCount);
    setAnonymousToken(nextResetState.anonymousToken);
    setAttemptSessionKey(currentAttemptSessionKey);
  }, [attemptSessionKey, currentAttemptSessionKey]);

  useEffect(() => {
    if (
      !shouldStartStudentRunnerAttemptClock({
        activeShareId,
        attemptClock,
        hasResult: Boolean(result),
        itemCount,
        ready: Boolean(assignment),
      })
    ) {
      return;
    }

    const nextStartedAt = Date.now();
    setAttemptClock(
      buildStudentRunnerAttemptClock({
        activeShareId,
        now: nextStartedAt,
      })
    );
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
      canSubmit: Boolean(activity) && runnerPageView.attemptState.canSubmit,
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
          durationSeconds: resolveStudentAttemptSubmissionDurationSeconds({
            now: Date.now(),
            startedAt,
            timeLimitSeconds,
          }),
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
      toast.success(runnerPageView.submissionSuccessMessage);
    } catch (error) {
      toast.error(resolveStudentAttemptSubmissionFailureMessage(error));
    }
  }

  function startAnotherAttempt() {
    const nextResetState = buildStudentRunnerAttemptResetState();
    const nextStartedAt = Date.now();
    setResult(undefined);
    setConfirmIncompleteSubmit(nextResetState.confirmIncompleteSubmit);
    setAnswers(nextResetState.answers);
    setAttemptClock(nextResetState.attemptClock);
    setNow(nextStartedAt);
  }

  if (pageState.status === 'loading') {
    return (
      <Container className="px-4 py-10 md:py-14">
        <div className="mx-auto max-w-6xl rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            {runnerPageView.loadingView.message}
          </p>
        </div>
      </Container>
    );
  }

  if (pageState.status === 'missing') {
    const missingView = runnerPageView.missingView;
    if (!missingView) return null;

    return (
      <Container className="px-4 py-10 md:py-14">
        <div className="mx-auto max-w-3xl rounded-lg border bg-card p-6">
          <Badge variant="outline" className="rounded-md border-primary/30">
            <IconDeviceGamepad2 className="size-3.5" />
            {missingView.badgeLabel}
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
            {missingView.browseTemplatesLabel}
          </Link>
        </div>
      </Container>
    );
  }

  const headerView = runnerPageView.headerView;
  if (!activity || !assignment || !headerView || !identityView) return null;

  return (
    <Container className="px-4 py-10 md:py-14">
      <div className="mx-auto max-w-6xl space-y-8 pb-16">
        <section className="grid gap-4 rounded-lg border bg-card p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="min-w-0 space-y-3">
            <Badge variant="outline" className="rounded-md border-primary/30">
              <IconDeviceGamepad2 className="size-3.5" />
              {runnerPageView.routeBadgeLabel}
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
              {controlView.runnerTitle}
            </div>
            <Badge variant="secondary" className="rounded-md">
              {controlView.progressLabel}
            </Badge>
            {controlView.timerBadge.show ? (
              <Badge variant="outline" className="rounded-md">
                {controlView.timerBadge.label}
              </Badge>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3 rounded-lg border bg-card p-3 md:grid-cols-[minmax(0,1fr)_14rem] md:items-end">
            {identityView.mode === 'student-name' ? (
              <div>
                <label
                  htmlFor="student-name"
                  className="text-sm font-medium text-foreground"
                >
                  {identityView.label}
                </label>
                <Input
                  id="student-name"
                  value={studentName}
                  onChange={(event) => setStudentName(event.target.value)}
                  placeholder={identityView.placeholder}
                  className="mt-2"
                />
              </div>
            ) : (
              <div className="rounded-lg border bg-muted/20 p-3">
                <p className="text-sm font-medium">{identityView.copy.title}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {identityView.copy.description}
                </p>
              </div>
            )}
            {resultPanelView.show ? (
              <div className="rounded-lg border bg-primary/5 p-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <IconCheck className="size-4 text-primary" />
                  {resultPanelView.statusLabel}
                </div>
                <p className="mt-2 text-2xl font-semibold">
                  {resultPanelView.scoreLabel}
                </p>
                <p className="text-xs text-muted-foreground">
                  {resultPanelView.accuracyLabel}
                </p>
                <p className="text-xs text-muted-foreground">
                  {resultPanelView.durationLabel}
                </p>
                {resultPanelView.attemptUsageLabel ? (
                  <p className="text-xs text-muted-foreground">
                    {resultPanelView.attemptUsageLabel}
                  </p>
                ) : null}
                {resultPanelView.showStartAnotherAttempt ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mt-3 w-full justify-start bg-background"
                    onClick={startAnotherAttempt}
                  >
                    <IconRepeat className="size-4" />
                    {resultPanelView.startAnotherAttemptLabel}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>

          {controlView.showTimeExpiredMessage ? (
            <div className="mt-4 rounded-lg border bg-background p-3 text-sm text-muted-foreground">
              {controlView.timeExpiredMessage}
            </div>
          ) : null}

          <StudentRuntimeItemList
            answers={answers}
            disabled={controlView.runtimeItemsDisabled}
            items={runtimeItems}
            revealAnswer={Boolean(
              result && assignment.settings.showCorrectAnswers
            )}
            reviewItems={result?.reviewItems}
            language={activity.content.language}
            templateType={activity.templateType}
            onAnswerChange={(itemId, answer) => {
              setConfirmIncompleteSubmit(false);
              setAnswers((current) =>
                buildStudentAnswerChange({
                  answer,
                  answers: current,
                  itemId,
                })
              );
            }}
          />

          <Button
            type="button"
            className="mt-4 w-full sm:w-fit"
            disabled={controlView.submitDisabled}
            onClick={submitAnswers}
          >
            <IconCheck className="size-4" />
            {controlView.submitButtonLabel}
          </Button>
          {controlView.unansweredLabel ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {controlView.unansweredLabel}
            </p>
          ) : null}
          {controlView.readOnlyMessage ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {controlView.readOnlyMessage}
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

type AttemptSubmissionResult = {
  accuracy: number;
  attemptUsage: AssignmentAttemptUsage;
  durationSeconds?: number;
  earnedPoints: number;
  reviewItems: PublicAttemptReviewItem[];
  totalPoints: number;
};
