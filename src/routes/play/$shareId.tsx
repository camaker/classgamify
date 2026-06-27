import { getStarterActivity, getStarterAssignment } from '@/activities/catalog';
import { getRuntimeItems } from '@/activities/runtime';
import type { AssignmentAttemptUsage } from '@/assignments/attempt-limits';
import { ASSIGNMENT_ATTEMPT_DURATION_UNITS } from '@/assignments/attempt-duration';
import { buildAssignmentSharePath } from '@/assignments/share-link';
import { getOrCreateAnonymousAttemptToken } from '@/assignments/identity';
import type { PublicAttemptReviewItem } from '@/assignments/public';
import {
  buildStudentAnswerChange,
  buildStudentAttemptSubmissionPlan,
  resolveStudentAttemptSubmissionFailureMessage,
} from '@/assignments/student-submission';
import {
  buildStudentRunnerAttemptClock,
  buildStudentRunnerAttemptRestartPlan,
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
import { StudentRunnerAttemptShell } from '@/components/assignments/student-runner-attempt-shell';
import { StudentRunnerHeaderCard } from '@/components/assignments/student-runner-header-card';
import { StudentRunnerLoadingPanel } from '@/components/assignments/student-runner-loading-panel';
import { StudentRunnerMissingPanel } from '@/components/assignments/student-runner-missing-panel';
import Container from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { websiteConfig } from '@/config/website';
import { usePublicAssignment, useSubmitAttempt } from '@/hooks/use-assignments';
import { seo } from '@/lib/seo';
import { IconCheck } from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';
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
    const submissionPlan = buildStudentAttemptSubmissionPlan({
      anonymousToken,
      answers,
      canSubmit: Boolean(activity) && runnerPageView.attemptState.canSubmit,
      collectStudentName: Boolean(assignment?.settings.collectStudentName),
      completionSummary,
      confirmIncompleteSubmit,
      createAnonymousToken: () =>
        getOrCreateAnonymousAttemptToken({
          shareId: activeShareId,
          storage: window.localStorage,
        }),
      now: Date.now(),
      runtimeItems,
      shareSlug: activeShareId,
      startedAt,
      studentName,
      timeLimitSeconds,
    });

    if (submissionPlan.type === 'blocked') {
      toast.error(submissionPlan.message);
      return;
    }

    if (submissionPlan.type === 'confirm-incomplete') {
      setConfirmIncompleteSubmit(true);
      toast.error(submissionPlan.message);
      return;
    }

    try {
      const response = await submitAttemptMutation.mutateAsync(
        submissionPlan.input
      );
      setAnonymousToken(submissionPlan.anonymousToken);
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
    const restartPlan = buildStudentRunnerAttemptRestartPlan({
      now: Date.now(),
    });
    setResult(undefined);
    setConfirmIncompleteSubmit(restartPlan.confirmIncompleteSubmit);
    setAnswers(restartPlan.answers);
    setAttemptClock(restartPlan.attemptClock);
    setNow(restartPlan.startedAt);
  }

  if (pageState.status === 'loading') {
    return <StudentRunnerLoadingPanel view={runnerPageView.loadingView} />;
  }

  if (pageState.status === 'missing') {
    const missingView = runnerPageView.missingView;
    if (!missingView) return null;

    return <StudentRunnerMissingPanel view={missingView} />;
  }

  const headerView = runnerPageView.headerView;
  if (!activity || !assignment || !headerView || !identityView) return null;

  return (
    <Container className="px-4 py-10 md:py-14">
      <div className="mx-auto max-w-6xl space-y-8 pb-16">
        <StudentRunnerHeaderCard
          badgeLabel={runnerPageView.routeBadgeLabel}
          view={headerView}
        />

        <StudentRunnerAttemptShell
          controlView={controlView}
          identityView={identityView}
          onStartAnotherAttempt={startAnotherAttempt}
          onStudentNameChange={setStudentName}
          resultPanelView={resultPanelView}
          studentName={studentName}
        >
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
        </StudentRunnerAttemptShell>

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
