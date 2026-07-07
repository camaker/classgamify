import type { PublicAttemptReviewItem } from '@/assignments/public';
import {
  buildPublicAnswerFeedbackView,
  type PublicAnswerFeedbackDetailLine,
  type PublicAnswerFeedbackView,
} from '@/assignments/student-runner-view';
import { cn } from '@/lib/utils';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useId } from 'react';

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
  const feedbackId = useId();
  const descriptionId = `${feedbackId}-description`;
  const statusLabelId = `${feedbackId}-status-label`;
  const statusValueId = `${feedbackId}-status-value`;

  return (
    <section
      aria-describedby={descriptionId}
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
      <span className="sr-only" id={statusLabelId}>
        {feedback.statusAriaLabel}
      </span>
      <output
        aria-describedby={descriptionId}
        aria-label={feedback.statusAriaLabel}
        aria-labelledby={`${statusLabelId} ${statusValueId}`}
        id={statusValueId}
      >
        {feedback.statusLabel}
      </output>
      <p className="sr-only" id={descriptionId}>
        {feedback.description}
      </p>
      <dl className="basis-full space-y-1 text-muted-foreground">
        {feedback.detailLines.map((line) => (
          <PublicAnswerFeedbackDetailLineItem
            descriptionId={descriptionId}
            feedbackId={feedbackId}
            key={line.id}
            line={line}
          />
        ))}
      </dl>
    </section>
  );
}

function PublicAnswerFeedbackDetailLineItem({
  descriptionId,
  feedbackId,
  line,
}: {
  descriptionId: string;
  feedbackId: string;
  line: PublicAnswerFeedbackDetailLine;
}) {
  const labelId = `${feedbackId}-${line.id}-label`;
  const valueId = `${feedbackId}-${line.id}-value`;

  return (
    <div className="grid gap-0.5" data-feedback-detail={line.id}>
      <dt className="sr-only" id={labelId}>
        {line.label}
      </dt>
      <dd>
        <output
          aria-describedby={descriptionId}
          aria-label={line.ariaLabel}
          aria-labelledby={`${labelId} ${valueId}`}
          id={valueId}
        >
          {line.text}
        </output>
      </dd>
    </div>
  );
}
