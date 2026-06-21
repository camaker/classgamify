import type {
  PublicAttemptReviewItem,
  PublicRuntimeItem,
} from '@/assignments/public';
import { buildPublicAttemptReviewItemMap } from '@/assignments/public';
import {
  formatAttemptCompletionProgressLabel,
  getAttemptCompletionSummary,
} from '@/assignments/student-submission';
import { PublicAnswerFeedback } from '@/components/activities/public-answer-feedback';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { IconPencil } from '@tabler/icons-react';
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
  const reviewByItemId = useMemo(
    () => buildPublicAttemptReviewItemMap(reviewItems),
    [reviewItems]
  );
  const completionSummary = getAttemptCompletionSummary({
    answers,
    runtimeItems: items,
  });

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <IconPencil className="size-4 text-primary" />
          Fill blanks
        </div>
        <Badge variant="outline" className="rounded-md">
          {formatAttemptCompletionProgressLabel({
            completionSummary,
            verb: 'completed',
          })}
        </Badge>
      </div>

      <div className="mt-3 grid gap-3">
        {items.map((item, index) => {
          const reviewItem = reviewByItemId.get(item.id);

          return (
            <div
              key={item.id}
              className={cn(
                'rounded-lg border bg-background p-3',
                revealAnswer &&
                  reviewItem?.correct &&
                  'border-primary/35 bg-primary/5',
                revealAnswer &&
                  reviewItem &&
                  !reviewItem.correct &&
                  'border-destructive/30 bg-destructive/5'
              )}
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <Badge variant="secondary" className="rounded-md">
                  {index + 1}
                </Badge>
                {item.choices?.length ? (
                  <p className="text-xs text-muted-foreground">
                    Word bank: {item.choices.join(', ')}
                  </p>
                ) : null}
              </div>
              <InlineBlankPrompt
                answer={answers[item.id] ?? ''}
                disabled={disabled}
                prompt={item.prompt}
                onAnswerChange={(answer) => onAnswerChange(item.id, answer)}
              />
              {revealAnswer && reviewItem ? (
                <PublicAnswerFeedback reviewItem={reviewItem} />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InlineBlankPrompt({
  answer,
  disabled,
  onAnswerChange,
  prompt,
}: {
  answer: string;
  disabled: boolean;
  onAnswerChange: (answer: string) => void;
  prompt: string;
}) {
  const parts = splitPromptAtBlank(prompt);

  if (!parts) {
    return (
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_16rem] sm:items-center">
        <p className="text-sm font-medium leading-7">{prompt}</p>
        <Input
          value={answer}
          disabled={disabled}
          onChange={(event) => onAnswerChange(event.target.value)}
          placeholder="Type the missing word"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm font-medium leading-8">
      <span>{parts.before}</span>
      <Input
        value={answer}
        disabled={disabled}
        onChange={(event) => onAnswerChange(event.target.value)}
        placeholder="answer"
        className="h-9 w-40 min-w-0 border-x-0 border-t-0 rounded-none bg-transparent px-2 text-center shadow-none focus-visible:ring-0"
      />
      <span>{parts.after}</span>
    </div>
  );
}

function splitPromptAtBlank(prompt: string) {
  const match = /_{2,}|\[\s*blank\s*\]|\(\s*blank\s*\)/i.exec(prompt);
  if (!match) return null;

  return {
    after: prompt.slice(match.index + match[0].length),
    before: prompt.slice(0, match.index),
  };
}
