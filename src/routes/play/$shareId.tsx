import { getStarterActivity, getStarterAssignment } from '@/activities/catalog';
import { getRuntimeItems } from '@/activities/runtime';
import type { RuntimeItem } from '@/activities/runtime';
import type {
  ActivitySeed,
  ActivityTemplateType,
  AssignmentSeed,
} from '@/activities/types';
import {
  type PublicAssignmentRuleSummaryId,
  buildPublicAssignmentRuleSummary,
} from '@/assignments/delivery-summary';
import { formatAttemptDuration } from '@/assignments/attempt-duration';
import { getAnonymousBrowserLabel } from '@/assignments/identity';
import type { PublicAttemptReviewItem } from '@/assignments/public';
import { orderAssignmentRuntimeItems } from '@/assignments/item-order';
import {
  buildAttemptCompletionCopy,
  buildAttemptSubmissionAnswers,
  getAttemptCompletionSummary,
  getAttemptSubmitDecision,
} from '@/assignments/student-submission';
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
  head: ({ params }) =>
    seo(`/play/${params.shareId}`, {
      title: `Student activity | ${websiteConfig.metadata?.name}`,
      description:
        'Open a public student activity runner from a teacher assignment link.',
    }),
  component: PlayPage,
});

function PlayPage() {
  const { shareId } = Route.useParams();
  const { data, isLoading } = usePublicAssignment(shareId);
  const submitAttemptMutation = useSubmitAttempt();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [studentName, setStudentName] = useState('');
  const [attemptClock, setAttemptClock] = useState<{
    shareId: string;
    startedAt: number;
  }>();
  const [result, setResult] = useState<AttemptSubmissionResult>();
  const [confirmIncompleteSubmit, setConfirmIncompleteSubmit] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [anonymousToken, setAnonymousToken] = useState<string>();
  const starterAssignment = getStarterAssignment(shareId);
  const starterActivity = getStarterActivity(starterAssignment.activityId);
  const starterRuntimeItems = useMemo(
    () =>
      getRuntimeItems(starterActivity.templateType, starterActivity.content),
    [starterActivity]
  );
  const assignment = data
    ? mapPersistedAssignment(data)
    : shareId === starterAssignment.shareId
      ? starterAssignment
      : undefined;
  const activity = data
    ? mapPersistedActivity(data)
    : assignment
      ? starterActivity
      : undefined;
  const runtimeItems = useMemo(() => {
    const items = data
      ? data.runtimeItems
      : activity
        ? starterRuntimeItems
        : ([] as RuntimeItem[]);
    return orderAssignmentRuntimeItems({
      items,
      shareSlug: assignment?.shareId ?? shareId,
      shuffleItems: Boolean(assignment?.settings.shuffleItems),
    });
  }, [activity, assignment, data, starterRuntimeItems]);
  const completionSummary = useMemo(
    () =>
      getAttemptCompletionSummary({
        answers,
        runtimeItems,
      }),
    [answers, runtimeItems]
  );
  const itemCount = completionSummary.itemCount;
  const canSubmit = Boolean(data) && itemCount > 0;
  const activeShareId = assignment?.shareId ?? shareId;
  const startedAt =
    attemptClock?.shareId === activeShareId ? attemptClock.startedAt : now;
  const elapsedSeconds = Math.max(0, Math.round((now - startedAt) / 1000));
  const timeLimitSeconds = assignment?.settings.timeLimitSeconds;
  const remainingSeconds = timeLimitSeconds
    ? Math.max(0, timeLimitSeconds - elapsedSeconds)
    : undefined;
  const timeExpired = Boolean(timeLimitSeconds && remainingSeconds === 0);
  const anonymousBrowserLabel = assignment?.settings.collectStudentName
    ? undefined
    : getAnonymousBrowserLabel(anonymousToken);
  const completionCopy = buildAttemptCompletionCopy({
    completionSummary,
    confirmIncompleteSubmit,
  });

  useEffect(() => {
    if (result || !timeLimitSeconds) return;

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [result, timeLimitSeconds]);

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
    setAnonymousToken(getAnonymousAttemptToken(activeShareId));
  }, [activeShareId, assignment]);

  async function submitAnswers() {
    if (!activity || !canSubmit) {
      toast.error('This demo assignment is read-only for now.');
      return;
    }
    if (assignment?.settings.collectStudentName && !studentName.trim()) {
      toast.error('Type your name before submitting.');
      return;
    }
    const submitDecision = getAttemptSubmitDecision({
      completionSummary,
      confirmIncompleteSubmit,
    });
    if (submitDecision.type === 'confirm-incomplete') {
      setConfirmIncompleteSubmit(true);
      toast.error(completionCopy.confirmIncompleteSubmit);
      return;
    }

    try {
      const response = await submitAttemptMutation.mutateAsync({
        answers: buildAttemptSubmissionAnswers({
          answers,
          runtimeItems,
        }),
        durationSeconds: Math.round((Date.now() - startedAt) / 1000),
        shareSlug: assignment?.shareId ?? shareId,
        anonymousToken: assignment?.settings.collectStudentName
          ? undefined
          : (anonymousToken ?? getAnonymousAttemptToken(activeShareId)),
        studentName: studentName.trim() || undefined,
      });
      setResult({
        ...response.result,
        reviewItems: response.reviewItems,
      });
      toast.success('Attempt submitted.');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Attempt could not be saved.'
      );
    }
  }
  if (isLoading) {
    return (
      <Container className="px-4 py-10 md:py-14">
        <div className="mx-auto max-w-6xl rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Loading student activity...
          </p>
        </div>
      </Container>
    );
  }

  if (!assignment || !activity) {
    return (
      <Container className="px-4 py-10 md:py-14">
        <div className="mx-auto max-w-3xl rounded-lg border bg-card p-6">
          <Badge variant="outline" className="rounded-md border-primary/30">
            <IconDeviceGamepad2 className="size-3.5" />
            Student play route
          </Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">
            Assignment not found
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            This link may have been unpublished, closed, or typed incorrectly.
          </p>
          <Link
            to={Routes.Templates}
            className={cn(buttonVariants(), 'mt-5 w-fit')}
          >
            Browse templates
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="px-4 py-10 md:py-14">
      <div className="mx-auto max-w-6xl space-y-8 pb-16">
        <section className="grid gap-4 rounded-lg border bg-card p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="min-w-0 space-y-3">
            <Badge variant="outline" className="rounded-md border-primary/30">
              <IconDeviceGamepad2 className="size-3.5" />
              Student play route
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight">
              {assignment.title}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              This public assignment loads from the teacher share link, collects
              answers, and scores against the teacher's frozen assignment
              snapshot.
            </p>
            {assignment.settings.instructions ? (
              <div className="max-w-2xl rounded-lg border bg-background p-3 text-sm leading-6 text-muted-foreground">
                {assignment.settings.instructions}
              </div>
            ) : null}
            <PublicAssignmentRules
              collectStudentName={assignment.settings.collectStudentName}
              expiresAt={assignment.expiresAt ?? null}
              itemCount={itemCount}
              maxAttempts={assignment.settings.maxAttempts}
              showCorrectAnswers={assignment.settings.showCorrectAnswers}
              timeLimitSeconds={assignment.settings.timeLimitSeconds}
            />
          </div>
          <Link
            to={Routes.Create}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'w-fit bg-background'
            )}
          >
            Teacher view
          </Link>
        </section>

        <div className="rounded-lg border bg-muted/20 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <IconPlayerPlay className="size-4 text-primary" />
              Student runner
            </div>
            <Badge variant="secondary" className="rounded-md">
              {completionCopy.progressLabel}
            </Badge>
            {timeLimitSeconds ? (
              <Badge variant="outline" className="rounded-md">
                {timeExpired
                  ? 'Time ended'
                  : formatAttemptDuration(remainingSeconds, {
                      emptyValue: '',
                      style: 'timer',
                    })}
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
                  Student name
                </label>
                <Input
                  id="student-name"
                  value={studentName}
                  onChange={(event) => setStudentName(event.target.value)}
                  placeholder="Type your name"
                  className="mt-2"
                />
              </div>
            ) : (
              <div className="rounded-lg border bg-muted/20 p-3">
                <p className="text-sm font-medium">Anonymous attempt</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  This assignment does not collect student names. This browser
                  will submit as {anonymousBrowserLabel}.
                </p>
              </div>
            )}
            {result ? (
              <div className="rounded-lg border bg-primary/5 p-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <IconCheck className="size-4 text-primary" />
                  Score submitted
                </div>
                <p className="mt-2 text-2xl font-semibold">
                  {result.earnedPoints}/{result.totalPoints}
                </p>
                <p className="text-xs text-muted-foreground">
                  {result.accuracy}% accuracy
                </p>
                <p className="text-xs text-muted-foreground">
                  Time:{' '}
                  {formatAttemptDuration(
                    result.durationSeconds ?? elapsedSeconds,
                    {
                      emptyValue: '',
                      style: 'timer',
                    }
                  )}
                </p>
              </div>
            ) : null}
          </div>

          {timeExpired && !result ? (
            <div className="mt-4 rounded-lg border bg-background p-3 text-sm text-muted-foreground">
              Time is up. Review your saved answers, then submit.
            </div>
          ) : null}

          <RuntimeItemList
            answers={answers}
            disabled={Boolean(result) || timeExpired}
            items={runtimeItems}
            revealAnswer={Boolean(
              result && assignment.settings.showCorrectAnswers
            )}
            reviewItems={result?.reviewItems}
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
            disabled={
              !canSubmit || Boolean(result) || submitAttemptMutation.isPending
            }
            onClick={submitAnswers}
          >
            <IconCheck className="size-4" />
            {completionCopy.submitButtonLabel}
          </Button>
          {!result && completionCopy.unansweredLabel ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {completionCopy.unansweredLabel}
            </p>
          ) : null}
          {!canSubmit ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Demo assignments are preview-only until they are saved from a
              teacher account.
            </p>
          ) : null}
        </div>

        <ActivityPreview
          activity={activity}
          assignment={assignment}
          compact
          hideAnswers={Boolean(data)}
        />
      </div>
    </Container>
  );
}

function PublicAssignmentRules({
  collectStudentName,
  expiresAt,
  itemCount,
  maxAttempts,
  showCorrectAnswers,
  timeLimitSeconds,
}: {
  collectStudentName: boolean;
  expiresAt: Date | null;
  itemCount: number;
  maxAttempts?: number;
  showCorrectAnswers: boolean;
  timeLimitSeconds?: number;
}) {
  const rules = buildPublicAssignmentRuleSummary({
    collectStudentName,
    expiresAt,
    itemCount,
    maxAttempts,
    showCorrectAnswers,
    timeLimitSeconds,
  });

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
  onAnswerChange,
  revealAnswer,
  reviewItems,
  templateType,
}: {
  answers: Record<string, string>;
  disabled: boolean;
  items: PublicRuntimeItem[];
  onAnswerChange: (itemId: string, answer: string) => void;
  revealAnswer: boolean;
  reviewItems?: PublicAttemptReviewItem[];
  templateType: ActivityTemplateType;
}) {
  if (templateType === 'line-match') {
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

  if (templateType === 'matching-pairs') {
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

  if (templateType === 'group-sort') {
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

  if (templateType === 'fill-blank') {
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

  if (templateType === 'open-box') {
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

  if (templateType === 'listening') {
    return (
      <div className="mt-4">
        <ListeningRunner
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

  return (
    <div className="mt-4 grid gap-3">
      {items.map((item, index) => (
        <RuntimeItemCard
          key={item.id}
          answer={answers[item.id] ?? ''}
          disabled={disabled}
          index={index}
          item={item}
          reviewItem={reviewItems?.find(
            (reviewItem) => reviewItem.itemId === item.id
          )}
          revealAnswer={revealAnswer}
          onAnswerChange={(answer) => onAnswerChange(item.id, answer)}
        />
      ))}
    </div>
  );
}

function RuntimeItemCard({
  answer,
  disabled,
  index,
  item,
  onAnswerChange,
  revealAnswer,
  reviewItem,
}: {
  answer: string;
  disabled: boolean;
  index: number;
  item: PublicRuntimeItem;
  onAnswerChange: (answer: string) => void;
  revealAnswer: boolean;
  reviewItem?: PublicAttemptReviewItem;
}) {
  const prompt = getRuntimePrompt(item);

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-sm font-medium">
          {index + 1}. {prompt}
        </p>
        <Badge variant="outline" className="rounded-md">
          {item.kind}
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
          placeholder="Type your answer"
          className="mt-3"
        />
      )}
      {revealAnswer && reviewItem ? (
        <PublicAnswerFeedback reviewItem={reviewItem} />
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
        const selected = answer === choice;
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

function getRuntimePrompt(item: PublicRuntimeItem) {
  if (item.kind === 'pair') {
    return `Match "${item.prompt}" with its pair.`;
  }

  if (item.kind === 'group-item') {
    return `Choose the group for "${item.prompt}".`;
  }

  return item.prompt;
}

function mapPersistedActivity(data: NonNullable<PublicAssignmentData>) {
  return {
    content: {
      difficulty: data.summary.difficulty,
      gradeBand: data.summary.gradeBand,
      groups: [],
      language: data.summary.language,
      learningGoal: data.summary.learningGoal,
      pairs: [],
      questions: [],
      sourceSummary: '',
      subject: data.summary.subject,
      teacherNotes: [],
      vocabulary: [],
    },
    description: data.activity.description ?? '',
    estimatedMinutes: data.summary.estimatedMinutes,
    id: data.activity.id,
    status: data.activity.visibility,
    templateType: data.snapshot?.templateType ?? data.activity.templateType,
    title: data.activity.title,
  } satisfies ActivitySeed;
}

function mapPersistedAssignment(data: NonNullable<PublicAssignmentData>) {
  return {
    activityId: data.activity.id,
    averageScore: 0,
    completions: 0,
    expiresAt: data.assignment.expiresAt,
    id: data.assignment.id,
    settings: data.assignment.settingsJson,
    shareId: data.assignment.shareSlug,
    status: data.assignment.status,
    title: data.assignment.title,
  } satisfies AssignmentSeed;
}

function getAnonymousAttemptToken(shareId: string) {
  const storageKey = `classgamify:attempt-token:${shareId}`;
  const existingToken = window.localStorage.getItem(storageKey);
  if (existingToken) return existingToken;

  const token =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(storageKey, token);
  return token;
}

type PublicAssignmentData = ReturnType<typeof usePublicAssignment>['data'];

type PublicRuntimeItem =
  NonNullable<PublicAssignmentData>['runtimeItems'][number];

type AttemptSubmissionResult = {
  accuracy: number;
  durationSeconds?: number;
  earnedPoints: number;
  reviewItems: PublicAttemptReviewItem[];
  totalPoints: number;
};
