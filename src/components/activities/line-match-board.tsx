import type {
  PublicAttemptReviewItem,
  PublicRuntimeItem,
} from '@/assignments/public';
import { getActivityRunnerKindCopy } from '@/activities/runner-copy';
import {
  buildExclusiveChoiceAnswerChanges,
  buildRuntimeChoiceViews,
  buildStudentRunnerView,
  getStudentRunnerReviewStatusClassName,
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
  onAnswerChange: (itemId: string, answer: string) => void;
  revealAnswer: boolean;
  reviewItems?: PublicAttemptReviewItem[];
};

export function LineMatchBoard({
  answers,
  disabled,
  items,
  onAnswerChange,
  revealAnswer,
  reviewItems,
}: LineMatchBoardProps) {
  const copy = getActivityRunnerKindCopy('line-match');
  const [selectedItemId, setSelectedItemId] = useState<string>();
  const runnerView = useMemo(
    () =>
      buildStudentRunnerView({
        answers,
        items,
        progressVerb: copy.progressVerb,
        reviewItems,
      }),
    [answers, copy.progressVerb, items, reviewItems]
  );
  const choiceViews = useMemo(
    () =>
      buildRuntimeChoiceViews({
        answers,
        choices: runnerView.choices,
        selectedItemId,
      }),
    [answers, runnerView.choices, selectedItemId]
  );

  function selectPrompt(itemId: string) {
    if (disabled) return;
    setSelectedItemId((current) => (current === itemId ? undefined : itemId));
  }

  function selectChoice(choice: string) {
    if (!selectedItemId || disabled) return;

    for (const change of buildExclusiveChoiceAnswerChanges({
      answers,
      choice,
      itemId: selectedItemId,
    })) {
      onAnswerChange(change.itemId, change.answer);
    }
    setSelectedItemId(undefined);
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
          {runnerView.itemViews.map((itemView, index) => {
            const { answer, item, reviewItem, status } = itemView;
            const selected = selectedItemId === item.id;

            return (
              <button
                key={item.id}
                type="button"
                disabled={disabled}
                className={cn(
                  'min-h-16 rounded-lg border bg-background p-3 text-left transition-colors',
                  'hover:border-primary/50 hover:bg-primary/5 disabled:cursor-default disabled:opacity-100',
                  selected && 'border-primary bg-primary/10',
                  revealAnswer && getStudentRunnerReviewStatusClassName(status)
                )}
                onClick={() => selectPrompt(item.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium">
                    {index + 1}. {item.prompt}
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
          {choiceViews.map(({ choice, selected, usedByItemId }) => (
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
              onClick={() => selectChoice(choice)}
            >
              <span className="font-medium">{choice}</span>
              {usedByItemId ? (
                <Badge variant="outline" className="ml-2 rounded-md">
                  {copy.usedChoiceLabel}
                </Badge>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        {copy.helpText}
      </p>
    </div>
  );
}
