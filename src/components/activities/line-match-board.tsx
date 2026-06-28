import type {
  PublicAttemptReviewItem,
  PublicRuntimeItem,
} from '@/assignments/public';
import type { StudentAnswerChange } from '@/assignments/student-submission';
import { getActivityRunnerKindCopy } from '@/activities/runner-copy';
import {
  buildChoicePairingRunnerView,
  resolveChoicePairingRunnerAction,
  type ChoicePairingRunnerAction,
} from '@/assignments/student-runner-view';
import { PublicAnswerFeedback } from '@/components/activities/public-answer-feedback';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { IconCircle, IconLineDashed, IconLink } from '@tabler/icons-react';
import { useMemo, useState } from 'react';

type LineMatchBoardProps = {
  answers: Record<string, string>;
  disabled: boolean;
  items: PublicRuntimeItem[];
  onAnswerChanges: (changes: StudentAnswerChange[]) => void;
  revealAnswer: boolean;
  reviewItems?: PublicAttemptReviewItem[];
};

export function LineMatchBoard({
  answers,
  disabled,
  items,
  onAnswerChanges,
  revealAnswer,
  reviewItems,
}: LineMatchBoardProps) {
  const copy = getActivityRunnerKindCopy('line-match');
  const [selectedItemId, setSelectedItemId] = useState<string>();
  const runnerView = useMemo(
    () =>
      buildChoicePairingRunnerView({
        answers,
        items,
        progressVerb: copy.progressVerb,
        revealAnswer,
        reviewItems,
        selectedItemId,
      }),
    [
      answers,
      copy.progressVerb,
      items,
      revealAnswer,
      reviewItems,
      selectedItemId,
    ]
  );

  function handleRunnerAction(action: ChoicePairingRunnerAction) {
    const result = resolveChoicePairingRunnerAction({
      action,
      answers,
      disabled,
      items,
      selectedItemId,
    });

    setSelectedItemId(result.selectedItemId);
    if (result.type === 'answer') {
      onAnswerChanges(result.answerChanges);
    }
  }

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <IconLineDashed className="size-4 text-primary" />
          {copy.title}
        </div>
        <Badge variant="outline" className="rounded-md">
          {runnerView.progressLabel}
        </Badge>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_2.5rem_minmax(0,1fr)]">
        <div className="grid content-start gap-2">
          {runnerView.promptItemViews.map((itemView) => {
            const { answer, item, reviewItem, reviewStatusClassName } =
              itemView;

            return (
              <button
                key={item.id}
                type="button"
                disabled={disabled}
                className={cn(
                  'min-h-16 rounded-lg border bg-background p-3 text-left transition-colors',
                  'hover:border-primary/50 hover:bg-primary/5 disabled:cursor-default disabled:opacity-100',
                  itemView.selected && 'border-primary bg-primary/10',
                  reviewStatusClassName
                )}
                onClick={() => handleRunnerAction(itemView.action)}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium">
                    {itemView.promptLabel}
                  </span>
                  {answer ? (
                    <IconLink className="mt-0.5 size-4 text-primary" />
                  ) : (
                    <IconCircle className="mt-0.5 size-4 text-muted-foreground" />
                  )}
                </div>
                {answer ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <IconLineDashed className="size-3.5" />
                    <span className="rounded-md bg-secondary px-2 py-1 font-medium text-secondary-foreground">
                      {answer}
                    </span>
                  </div>
                ) : null}
                {revealAnswer && reviewItem ? (
                  <PublicAnswerFeedback
                    correctLabel={copy.correctAnswerLabel}
                    reviewItem={reviewItem}
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="hidden items-stretch justify-center lg:flex">
          <div className="h-full w-px rounded-full bg-border" />
        </div>

        <div className="grid content-start gap-2">
          {runnerView.choiceViews.map(
            ({ action, choice, selected, usedByItemId }) => (
              <button
                key={choice}
                type="button"
                disabled={!selectedItemId || disabled}
                className={cn(
                  'min-h-14 rounded-lg border bg-background p-3 text-left text-sm transition-colors',
                  'hover:border-primary/50 hover:bg-primary/5 disabled:cursor-default disabled:opacity-70',
                  usedByItemId && 'bg-muted/30',
                  selected && 'border-primary bg-primary/10 text-primary'
                )}
                onClick={() => handleRunnerAction(action)}
              >
                <span className="font-medium">{choice}</span>
                {usedByItemId ? (
                  <Badge variant="outline" className="ml-2 rounded-md">
                    {copy.usedChoiceLabel}
                  </Badge>
                ) : null}
              </button>
            )
          )}
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        {copy.helpText}
      </p>
    </div>
  );
}
