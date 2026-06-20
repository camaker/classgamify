import type { PublicAttemptReviewItem } from '@/assignments/public';
import { cn } from '@/lib/utils';
import { IconCheck, IconX } from '@tabler/icons-react';

type PublicAnswerFeedbackProps = {
  className?: string;
  correctLabel?: string;
  reviewItem: PublicAttemptReviewItem;
};

export function PublicAnswerFeedback({
  className,
  correctLabel = 'Correct answer',
  reviewItem,
}: PublicAnswerFeedbackProps) {
  return (
    <div
      className={cn(
        'mt-3 flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-xs',
        reviewItem.correct
          ? 'border-primary/25 bg-primary/5 text-primary'
          : 'bg-muted/30 text-muted-foreground',
        className
      )}
    >
      {reviewItem.correct ? (
        <IconCheck className="size-3.5" />
      ) : (
        <IconX className="size-3.5" />
      )}
      <span>{reviewItem.correct ? 'Correct' : 'Needs review'}</span>
      <span className="text-muted-foreground">
        {correctLabel}: {reviewItem.correctAnswer}
      </span>
      {reviewItem.acceptedAnswers.length > 1 ? (
        <span className="basis-full text-muted-foreground">
          Accepted answers: {reviewItem.acceptedAnswers.join(', ')}
        </span>
      ) : null}
      {reviewItem.explanation ? (
        <span className="basis-full text-muted-foreground">
          Why: {reviewItem.explanation}
        </span>
      ) : null}
    </div>
  );
}
