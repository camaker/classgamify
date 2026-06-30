import { buildAssignmentSharePath } from '@/assignments/share-link';
import { getOrCreateAnonymousAttemptToken } from '@/assignments/identity';
import {
  resolveStudentAttemptSubmissionFailureMessage,
  type StudentAnswerChange,
} from '@/assignments/student-submission';
import {
  buildStudentRunnerAnonymousTokenPlan,
  buildStudentRunnerAnswerUpdatePlan,
  buildStudentRunnerAttemptClockStartPlan,
  buildStudentRunnerAttemptRestartPlan,
  buildStudentRunnerAttemptSessionResetPlan,
  buildStudentRunnerPageState,
  buildStudentRunnerPageViewModel,
  buildStudentRunnerRouteState,
  buildStudentRunnerSeoView,
  buildStudentRunnerStarterPreview,
  buildStudentRunnerSubmissionExecutionPlan,
  buildStudentRunnerSubmissionSuccessState,
  buildStudentRunnerTimerTickPlan,
  type StudentRunnerAttemptResult,
  type StudentRunnerAttemptClock,
} from '@/assignments/student-runner-state';
import { normalizeAssignmentShareSlug } from '@/assignments/share-slug';
import { ActivityPreview } from '@/components/activities/activity-preview';
import { StudentRuntimeItemList } from '@/components/activities/student-runtime-item-list';
import { StudentRunnerAttemptShell } from '@/components/assignments/student-runner-attempt-shell';
import { StudentRunnerHeaderCard } from '@/components/assignments/student-runner-header-card';
import { StudentRunnerLoadingPanel } from '@/components/assignments/student-runner-loading-panel';
import { StudentRunnerMissingPanel } from '@/components/assignments/student-runner-missing-panel';
import { StudentRunnerSubmitControls } from '@/components/assignments/student-runner-submit-controls';
import Container from '@/components/layout/container';
import { websiteConfig } from '@/config/website';
import { usePublicAssignment, useSubmitAttempt } from '@/hooks/use-assignments';
import { seo } from '@/lib/seo';
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
  const [result, setResult] = useState<StudentRunnerAttemptResult>();
  const [submittedAttemptCount, setSubmittedAttemptCount] = useState(0);
  const [confirmIncompleteSubmit, setConfirmIncompleteSubmit] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [anonymousToken, setAnonymousToken] = useState<string>();
  const [attemptSessionKey, setAttemptSessionKey] = useState<string>();
  const starterPreview = useMemo(
    () => buildStudentRunnerStarterPreview(normalizedShareId),
    [normalizedShareId]
  );
  const pageState = useMemo(
    () =>
      buildStudentRunnerPageState({
        data,
        isLoading,
        shareId: normalizedShareId,
        starterPreview,
      }),
    [data, isLoading, normalizedShareId, starterPreview]
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
  const activeShareId = runnerPageView.activeShareId;
  const timeLimitSeconds = runnerPageView.timeLimitSeconds;
  const controlView = runnerPageView.controlView;
  const runtimeListView = runnerPageView.runtimeListView;
  const resultPanelView = runnerPageView.resultPanelView;
  const currentAttemptSessionKey = runnerPageView.currentAttemptSessionKey;
  const runnerRouteState = useMemo(
    () => buildStudentRunnerRouteState(runnerPageView),
    [runnerPageView]
  );

  useEffect(() => {
    const tickPlan = buildStudentRunnerTimerTickPlan({
      activeShareId,
      attemptClock,
      canSubmit: runnerPageView.attemptState.canSubmit,
      hasResult: Boolean(result),
      timeLimitSeconds,
    });
    if (tickPlan.type === 'skip') return;

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, tickPlan.intervalMs);

    return () => window.clearInterval(timer);
  }, [
    activeShareId,
    attemptClock?.shareId,
    result,
    runnerPageView.attemptState.canSubmit,
    timeLimitSeconds,
  ]);

  useEffect(() => {
    const resetPlan = buildStudentRunnerAttemptSessionResetPlan({
      attemptSessionKey,
      currentAttemptSessionKey,
    });
    if (resetPlan.type === 'skip') return;

    setAnswers(resetPlan.answers);
    setResult(resetPlan.result);
    setConfirmIncompleteSubmit(resetPlan.confirmIncompleteSubmit);
    setStudentName(resetPlan.studentName);
    setAttemptClock(resetPlan.attemptClock);
    setSubmittedAttemptCount(resetPlan.submittedAttemptCount);
    setAnonymousToken(resetPlan.anonymousToken);
    setAttemptSessionKey(resetPlan.nextAttemptSessionKey);
  }, [attemptSessionKey, currentAttemptSessionKey]);

  useEffect(() => {
    const startPlan = buildStudentRunnerAttemptClockStartPlan({
      activeShareId,
      attemptClock,
      canSubmit: runnerPageView.attemptState.canSubmit,
      hasResult: Boolean(result),
      now: Date.now(),
    });
    if (startPlan.type === 'skip') return;

    setAttemptClock(startPlan.attemptClock);
    setNow(startPlan.now);
  }, [
    activeShareId,
    attemptClock?.shareId,
    result,
    runnerPageView.attemptState.canSubmit,
  ]);

  useEffect(() => {
    const anonymousTokenPlan = buildStudentRunnerAnonymousTokenPlan({
      pageView: runnerPageView,
    });
    if (anonymousTokenPlan.type === 'skip') return;

    setAnonymousToken(
      getOrCreateAnonymousAttemptToken({
        shareId: anonymousTokenPlan.shareId,
        storage: window.localStorage,
      })
    );
  }, [runnerPageView]);

  async function submitAnswers() {
    const executionPlan = buildStudentRunnerSubmissionExecutionPlan({
      anonymousToken,
      answers,
      confirmIncompleteSubmit,
      createAnonymousToken: () =>
        getOrCreateAnonymousAttemptToken({
          shareId: activeShareId,
          storage: window.localStorage,
        }),
      now: Date.now(),
      pageView: runnerPageView,
      studentName,
    });

    if (executionPlan.type === 'message') {
      setConfirmIncompleteSubmit(executionPlan.nextConfirmIncompleteSubmit);
      toast[executionPlan.messageTone](executionPlan.message);
      return;
    }

    try {
      const response = await submitAttemptMutation.mutateAsync(
        executionPlan.input
      );
      const successState = buildStudentRunnerSubmissionSuccessState({
        executionPlan,
        response,
      });
      setAnonymousToken(successState.anonymousToken);
      if (successState.submittedStudentName) {
        setStudentName(successState.submittedStudentName);
      }
      setResult(successState.result);
      setConfirmIncompleteSubmit(successState.confirmIncompleteSubmit);
      setSubmittedAttemptCount(successState.submittedAttemptCount);
      toast.success(successState.successMessage);
    } catch (error) {
      toast.error(resolveStudentAttemptSubmissionFailureMessage(error));
    }
  }

  function startAnotherAttempt() {
    const restartPlan = buildStudentRunnerAttemptRestartPlan({
      now: Date.now(),
    });
    setResult(restartPlan.result);
    setConfirmIncompleteSubmit(restartPlan.confirmIncompleteSubmit);
    setAnswers(restartPlan.answers);
    setAttemptClock(restartPlan.attemptClock);
    setNow(restartPlan.startedAt);
  }

  function updateAnswers(changes: StudentAnswerChange[]) {
    const updatePlan = buildStudentRunnerAnswerUpdatePlan({
      answers,
      changes,
      disabled: runtimeListView.disabled,
      runtimeItems: runtimeListView.items,
    });
    if (updatePlan.type === 'ignored') return;

    setConfirmIncompleteSubmit(updatePlan.confirmIncompleteSubmit);
    setAnswers((current) => {
      const currentUpdatePlan = buildStudentRunnerAnswerUpdatePlan({
        answers: current,
        changes,
        disabled: runtimeListView.disabled,
        runtimeItems: runtimeListView.items,
      });
      if (currentUpdatePlan.type === 'ignored') return current;

      return currentUpdatePlan.answers;
    });
  }

  if (runnerRouteState.status === 'loading') {
    return <StudentRunnerLoadingPanel view={runnerPageView.loadingView} />;
  }

  if (runnerRouteState.status === 'missing') {
    return <StudentRunnerMissingPanel view={runnerRouteState.missingView} />;
  }

  if (runnerRouteState.status !== 'ready') return null;

  const { previewView } = runnerRouteState;

  return (
    <Container className="px-4 py-10 md:py-14">
      <div className="mx-auto max-w-6xl space-y-8 pb-16">
        <StudentRunnerHeaderCard
          badgeLabel={runnerPageView.routeBadgeLabel}
          view={runnerRouteState.headerView}
        />

        <StudentRunnerAttemptShell
          controlView={controlView}
          identityView={runnerRouteState.identityView}
          onStartAnotherAttempt={startAnotherAttempt}
          onStudentNameChange={setStudentName}
          resultPanelView={resultPanelView}
          studentName={studentName}
        >
          <StudentRuntimeItemList
            answers={answers}
            disabled={runtimeListView.disabled}
            items={runtimeListView.items}
            revealAnswer={runtimeListView.revealAnswer}
            reviewItems={runtimeListView.reviewItems}
            language={runtimeListView.language}
            templateType={runtimeListView.templateType}
            onAnswerChanges={updateAnswers}
          />

          <StudentRunnerSubmitControls
            controlView={controlView}
            onSubmit={submitAnswers}
          />
        </StudentRunnerAttemptShell>

        <ActivityPreview
          activity={previewView.activity}
          assignment={previewView.assignment}
          compact
          hideAnswers={previewView.hideAnswers}
        />
      </div>
    </Container>
  );
}
