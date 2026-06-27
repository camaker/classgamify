import type { PublicAttemptReviewItem } from '@/assignments/public';
import { buildPublicAnswerFeedbackView } from '@/assignments/student-runner-view';
import { cn } from '@/lib/utils';
import { IconCheck, IconX } from '@tabler/icons-react';

type PublicAnswerFeedbackProps = {
  className?: string;
  correctLabel?: string;
  reviewItem: PublicAttemptReviewItem;
};

export function PublicAnswerFeedback({
  className,
  correctLabel,
  reviewItem,
}: PublicAnswerFeedbackProps) {
  const feedback = buildPublicAnswerFeedbackView({
    correctAnswerLabel: correctLabel,
    reviewItem,
  });

  if (!feedback) return null;

  return (
    <div
      className={cn(
        'mt-3 flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-xs',
        feedback.status === 'correct'
          ? 'border-primary/25 bg-primary/5 text-primary'
          : 'bg-muted/30 text-muted-foreground',
        className
      )}
    >
      {feedback.status === 'correct' ? (
        <IconCheck className="size-3.5" />
      ) : (
        <IconX className="size-3.5" />
      )}
      <span>{feedback.statusLabel}</span>
      <span className="text-muted-foreground">
        {feedback.correctAnswerText}
      </span>
      {feedback.acceptedAnswersText ? (
        <span className="basis-full text-muted-foreground">
          {feedback.acceptedAnswersText}
        </span>
      ) : null}
      {feedback.explanationText ? (
        <span className="basis-full text-muted-foreground">
          {feedback.explanationText}
        </span>
      ) : null}
    </div>
  );
}
