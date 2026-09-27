import { getActivityRunnerKindCopy } from '@/activities/runner-copy';
import { buildStudentRunnerStarterPreview } from '@/assignments/student-runner-state';
import { buildDefaultRuntimeItemCardViews } from '@/assignments/student-runner-view';
import { ChoiceQuestionStepper } from '@/components/activities/choice-question-stepper';
import { useMemo, useState } from 'react';

/**
 * The home hero shows the real student quiz runner with the starter
 * activity, so visitors can play a question before reading anything.
 * Answers stay in this component; nothing is submitted.
 */
export function HomeHeroGame() {
  const preview = useMemo(
    () => buildStudentRunnerStarterPreview('demo-food'),
    []
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const copy = getActivityRunnerKindCopy('choice-list');
  const cardViews = buildDefaultRuntimeItemCardViews({
    answers,
    correctAnswerLabel: copy.correctAnswerLabel,
    inputPlaceholder: copy.inputPlaceholder,
    items: preview.runtimeItems,
    progressVerb: copy.progressVerb,
  });
  const answeredCount = cardViews.filter(
    (cardView) => cardView.answered
  ).length;

  return (
    <div className="grid gap-3 rounded-3xl border bg-muted/60 p-3 shadow-sm md:p-4">
      <div className="flex items-center justify-between gap-3 px-1 text-sm">
        <span className="truncate font-semibold">{preview.activity.title}</span>
        <span className="shrink-0 font-semibold text-muted-foreground tabular-nums">
          {answeredCount}/{cardViews.length}
        </span>
      </div>
      <ChoiceQuestionStepper
        cardViews={cardViews}
        disabled={false}
        revealAnswer={false}
        reviewMode={false}
        onAnswerChange={(itemId, answer) =>
          setAnswers((current) => ({ ...current, [itemId]: answer }))
        }
      />
    </div>
  );
}
