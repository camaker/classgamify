import type {
  PublicAttemptReviewItem,
  PublicRuntimeItem,
} from '@/assignments/public';
import { getActivityRunnerKindCopy } from '@/activities/runner-copy';
import {
  buildFillBlankWorksheetView,
  getStudentRunnerReviewStatusClassName,
} from '@/assignments/student-runner-view';
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
  const copy = getActivityRunnerKindCopy('fill-blank');
  const runnerView = useMemo(
    () =>
      buildFillBlankWorksheetView({
        answers,
        items,
        progressVerb: copy.progressVerb,
        reviewItems,
        wordBankLabel: copy.wordBankLabel,
      }),
    [answers, copy.progressVerb, copy.wordBankLabel, items, reviewItems]
  );

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <IconPencil className="size-4 text-primary" />
          {copy.title}
        </div>
        <Badge variant="outline" className="rounded-md">
          {runnerView.progressLabel}
        </Badge>
      </div>

      <div className="mt-3 grid gap-3">
        {runnerView.fillBlankItemViews.map((itemView) => {
          const { answer, item, promptView, reviewItem, status } = itemView;

          return (
            <div
              key={item.id}
              className={cn(
                'rounded-lg border bg-background p-3',
                revealAnswer && getStudentRunnerReviewStatusClassName(status)
              )}
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <Badge variant="secondary" className="rounded-md">
                  {itemView.sequenceLabel}
                </Badge>
                {itemView.wordBankLineText ? (
                  <p className="text-xs text-muted-foreground">
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
  promptView: ReturnType<
    typeof buildFillBlankWorksheetView
  >['fillBlankItemViews'][number]['promptView'];
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
    <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm font-medium leading-8">
      <span>{promptView.before}</span>
      <Input
        value={answer}
        disabled={disabled}
        onChange={(event) => onAnswerChange(event.target.value)}
        placeholder={inlinePlaceholder}
        className="h-9 w-40 min-w-0 border-x-0 border-t-0 rounded-none bg-transparent px-2 text-center shadow-none focus-visible:ring-0"
      />
      <span>{promptView.after}</span>
    </div>
  );
}
