import type { PublicAttemptReviewItem } from '@/assignments/public';
import {
  buildPublicAnswerFeedbackView,
  type PublicAnswerFeedbackView,
} from '@/assignments/student-runner-view';
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
  const feedback: PublicAnswerFeedbackView = buildPublicAnswerFeedbackView({
    correctAnswerLabel: correctLabel,
    reviewItem,
  });

  return (
    <section
      aria-label={feedback.ariaLabel}
      className={cn(
        'mt-3 flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-xs',
        feedback.status === 'correct'
          ? 'border-primary/25 bg-primary/5 text-primary'
          : 'bg-muted/30 text-muted-foreground',
        className
      )}
    >
      {feedback.status === 'correct' ? (
        <IconCheck aria-hidden="true" className="size-3.5" />
      ) : (
        <IconX aria-hidden="true" className="size-3.5" />
      )}
      <output aria-label={feedback.statusAriaLabel}>
        {feedback.statusLabel}
      </output>
      <p className="sr-only">{feedback.description}</p>
      <dl className="basis-full space-y-1 text-muted-foreground">
        {feedback.detailLines.map((line) => (
          <div className="grid gap-0.5" key={line.id}>
            <dt className="sr-only">{line.label}</dt>
            <dd>
              <output aria-label={line.ariaLabel}>{line.text}</output>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
