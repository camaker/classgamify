import type {
  PublicAttemptReviewItem,
  PublicRuntimeItem,
} from '@/assignments/public';
import { getActivityRunnerKindCopy } from '@/activities/runner-copy';
import {
  buildFillBlankWorksheetView,
  type InlineBlankPromptView,
} from '@/assignments/student-runner-view';
import { PublicAnswerFeedback } from '@/components/activities/public-answer-feedback';
import { Input } from '@/components/ui/input';
import { RUNNER_BOARD_FRAME } from '@/components/activities/runner-board-styles';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

type FillBlankWorksheetProps = {
  answers: Record<string, string>;
  disabled: boolean;
  items: PublicRuntimeItem[];
  onAnswerChange: (itemId: string, answer: string) => void;
  revealAnswer: boolean;
  reviewItems?: PublicAttemptReviewItem[];
};

export function FillBlankWorksheet({
  answers,
  disabled,
  items,
  onAnswerChange,
  revealAnswer,
  reviewItems,
}: FillBlankWorksheetProps) {
  const copy = getActivityRunnerKindCopy('fill-blank');
  const runnerView = useMemo(
    () =>
      buildFillBlankWorksheetView({
        answers,
        items,
        progressVerb: copy.progressVerb,
        revealAnswer,
        reviewItems,
        wordBankLabel: copy.wordBankLabel,
      }),
    [
      answers,
      copy.progressVerb,
      copy.wordBankLabel,
      items,
      revealAnswer,
      reviewItems,
    ]
  );

  return (
    <div className={cn(RUNNER_BOARD_FRAME, 'gap-0 divide-y p-0 md:p-0')}>
      {runnerView.fillBlankItemViews.map((itemView) => {
        const { answer, item, promptView, reviewItem } = itemView;

        return (
          <div
            key={item.id}
            className={cn(
              'grid gap-3 px-5 py-5 first:rounded-t-2xl last:rounded-b-2xl md:px-8',
              itemView.reviewStatusClassName
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-muted-foreground text-sm">
                {itemView.sequenceLabel}
              </p>
              {itemView.wordBankLineText ? (
                <p className="text-muted-foreground text-sm">
                  {itemView.wordBankLineText}
                </p>
              ) : null}
            </div>
            <InlineBlankPrompt
              answer={answer}
              disabled={disabled}
              inlinePlaceholder={
                copy.inlineBlankPlaceholder ?? copy.inputPlaceholder
              }
              placeholder={copy.inputPlaceholder}
              promptView={promptView}
              onAnswerChange={(answer) => onAnswerChange(item.id, answer)}
            />
            {revealAnswer && reviewItem ? (
              <PublicAnswerFeedback
                correctLabel={copy.correctAnswerLabel}
                reviewItem={reviewItem}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function InlineBlankPrompt({
  answer,
  disabled,
  onAnswerChange,
  inlinePlaceholder,
  placeholder,
  promptView,
}: {
  answer: string;
  disabled: boolean;
  inlinePlaceholder: string;
  onAnswerChange: (answer: string) => void;
  placeholder: string;
  promptView: InlineBlankPromptView;
}) {
  if (promptView.mode === 'standalone') {
    return (
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_16rem] sm:items-center">
        <p className="text-sm font-medium leading-7">{promptView.prompt}</p>
        <Input
          value={answer}
          disabled={disabled}
          onChange={(event) => onAnswerChange(event.target.value)}
          placeholder={placeholder}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-2 font-medium text-xl leading-10">
      <span>{promptView.before}</span>
      <Input
        value={answer}
        disabled={disabled}
        onChange={(event) => onAnswerChange(event.target.value)}
        placeholder={inlinePlaceholder}
        className="h-11 w-44 min-w-0 rounded-none border-x-0 border-t-0 border-b-2 border-primary/60 bg-primary/5 px-2 text-center font-semibold text-lg shadow-none focus-visible:border-primary focus-visible:ring-0 md:text-lg"
      />
      <span>{promptView.after}</span>
    </div>
  );
}
